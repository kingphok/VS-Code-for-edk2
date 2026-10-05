import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';
import { ParsedFileResult, mapConcurrent, hashPathSHA256_64 } from './db-lib';
import { Db_ProtocolPpiGuid } from './go-to-def.name-Protocol-Ppi-Guid';
import { Db_EDK2Define } from './go-to-def.name-EDK2-DEFINE';
import { Db_Pcd } from './go-to-def.name-Pcd';

// Internal EDK2DEC parsing data structure
interface DecParsedFileResult {
    decDefinition: {
        ProtocolPpiGuid: ParsedFileResult;
        Edk2Define:      ParsedFileResult;
        Pcd:             ParsedFileResult;
    };
}

// ProtocolPpiGuid:
//   g*Guid =
// Edk2Define:
//   DEFINE $(marco_name) =
// Pcd:
//   g*Guid.Pcd*|$(value)
async function parseFile(uri: vscode.Uri):Promise<DecParsedFileResult> {
    const fsPath = uri.fsPath;
    const relativePath = vscode.workspace.asRelativePath(uri);
    const pathHash = hashPathSHA256_64(relativePath);

    // Read and decode workspace file content
    const fileData = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder('utf-8').decode(fileData);

    // regex patterns on EDK2DEC
    // Track words and positions for each category independently
    const ProtocolGuidPpiRegex = /\b(g[A-Za-z0-9_]*Guid)\s*=/;
    const ProtocolPpiGuidWordsSet = new Set<string>();
    const ProtocolPpiGuidWithPos: ParsedFileResult['wordsWithPos'] = [];

    const Edk2DefineRegex = /^\s*DEFINE\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/;
    const edk2DefineWordsSet = new Set<string>();
    const edk2DefineWithPos: ParsedFileResult['wordsWithPos'] = [];

    const PcdRegex = /[A-Za-z_][A-Za-z0-9_]*\.([A-Za-z_][A-Za-z0-9_]*)\|/;
    const pcdWordsSet = new Set<string>();
    const pcdWithPos: ParsedFileResult['wordsWithPos'] = [];

    const lines = content.split(/\r?\n/);
    lines.forEach((lineText, lineIdx) => {
        // Extract Protocol Guid Ppi
        const formMatch = ProtocolGuidPpiRegex.exec(lineText);
        if (formMatch) {
            const word = formMatch[1];
            const character = formMatch.index + formMatch[0].indexOf(word);
            ProtocolPpiGuidWithPos.push({
                word,
                position: {line: lineIdx, character}
            });
            ProtocolPpiGuidWordsSet.add(word);
        }
        // Extract EDK2 Define
        const defineMatch = Edk2DefineRegex.exec(lineText);
        if (defineMatch) {
            const word = defineMatch[1];
            const character = defineMatch.index + defineMatch[0].indexOf(word);
            edk2DefineWithPos.push({
                word,
                position: {line: lineIdx, character}
            });
            edk2DefineWordsSet.add(word);
        }
        // Extract Pcd
        const pcdMatch = PcdRegex.exec(lineText);
        if (pcdMatch) {
            const word = pcdMatch[1];
            const character = pcdMatch.index + pcdMatch[0].indexOf(word);
            pcdWithPos.push({
                word,
                position: {line: lineIdx, character}
            });
            pcdWordsSet.add(word);
        }
    });

    return {
        decDefinition: {
            ProtocolPpiGuid: {
                pathHash,
                relativePath,
                words: Array.from(ProtocolPpiGuidWordsSet),
                wordsWithPos: ProtocolPpiGuidWithPos
            },
            Edk2Define: {
                pathHash,
                relativePath,
                words: Array.from(edk2DefineWordsSet),
                wordsWithPos: edk2DefineWithPos
            },
            Pcd: {
                pathHash,
                relativePath,
                words: Array.from(pcdWordsSet),
                wordsWithPos: pcdWithPos
            }
        }
    };
}

export async function indexSingleFile(uri: vscode.Uri) {
    try {
        const parseResult = await parseFile(uri);
        if (!parseResult) {
            return;
        }

        // Extract ParsedFileResult directly without remapping structures
        const ProtocolGuidPpiResults = parseResult.decDefinition.ProtocolPpiGuid;
        const Edk2DefineResults = parseResult.decDefinition.Edk2Define;
        const PcdResults = parseResult.decDefinition.Pcd;

        await Promise.all([
            Db_ProtocolPpiGuid.updateGenCache(ProtocolGuidPpiResults),
            Db_EDK2Define.updateGenCache(Edk2DefineResults),
            Db_Pcd.updateGenCache(PcdResults)
        ]);
    } catch (err) {
        console.error(`[EDK2] Failed to index single file: ${uri.fsPath}`, err);
    }
}

async function unindexSingleFile(uri: vscode.Uri) {
    try {
        // Calculate relative path and SHA-256 hash
        const relativePath = vscode.workspace.asRelativePath(uri);
        const pathHash = hashPathSHA256_64(relativePath);
        await Promise.all([
            Db_ProtocolPpiGuid.deleteGenCache(pathHash),
            Db_EDK2Define.deleteGenCache(pathHash),
            Db_Pcd.deleteGenCache(pathHash)
        ]);
    } catch (err) {
        console.error(`[EDK2] Failed to unindex file: ${uri.fsPath}`, err);
    }
}

export async function DbIndexing_Lang_EDK2DEC(context: vscode.ExtensionContext) {
    try {
        // Get allowed file extension -> find all fils -> Excluding file by gitignore paths
        const fileGlobPattern = getAllowedFileExtensions(['dec'], 'edk2dec')
        const files = await vscode.workspace.findFiles(fileGlobPattern);
        const targetFiles = files.filter(file => !isGitIgnorePath(file));

        // Parse all files with a maximum concurrency limit
        const parseAllResults = await mapConcurrent(targetFiles, 30, async (file) => {
            try {
                return await parseFile(file);
            } catch (err) {
                console.error(`[EDK2] Failed to parse file: ${file.fsPath}`, err);
                return null;
            }
        });

        // Filter out unresolved or errored files
        const validResults = parseAllResults.filter((res): res is DecParsedFileResult => res !== null);

        // Extract ParsedFileResult directly without remapping structures
        const ProtocolGuidPpiResults: ParsedFileResult[] = validResults.map(res => res.decDefinition.ProtocolPpiGuid).filter(res => res.wordsWithPos.length > 0);
        const Edk2DefineResults: ParsedFileResult[] = validResults.map(res => res.decDefinition.Edk2Define).filter(res => res.wordsWithPos.length > 0);
        const PcdResults: ParsedFileResult[] = validResults.map(res => res.decDefinition.Pcd).filter(res => res.wordsWithPos.length > 0);

        // First init cache
        await Promise.all([
            Db_ProtocolPpiGuid.initGenCache(ProtocolGuidPpiResults),
            Db_EDK2Define.initGenCache(Edk2DefineResults),
            Db_Pcd.initGenCache(PcdResults)
        ]);
        console.log('[EDK2] DEC all DB init done');

    } catch (err) {
        console.error('[EDK2] DEC: DB init failed.', err);
    }
}

// Creates and configures the specialized EDK2 DEC file watcher.
export function Watcher_Lang_EDK2DEC(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['dec'], 'edk2dec')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DEC onDidChange:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DEC onDidCreate:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DEC onDidDelete:', uri);
        await unindexSingleFile(uri);
    });

    return watcher;
}
