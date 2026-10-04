import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';
import { Db_ProtocolPpiGuid } from './go-to-def.name-Protocol-Ppi-Guid';
import { Db_EDK2Define } from './go-to-def.name-EDK2-DEFINE';
import { ParsedFileResult, hashPathSHA256_64 } from './db-lib';

// Internal EDK2DEC parsing data structure
interface DecParsedFileResult {
    decDefinition: {
        ProtocolPpiGuid: ParsedFileResult;
        Edk2Define:   ParsedFileResult;
    };
}

// ProtocolPpiGuid:
//   g*Guid =
// Edk2Define:
//   DEFINE $(marco_name) =
async function parseFile(uri: vscode.Uri):Promise<DecParsedFileResult> {
    const fsPath = uri.fsPath;
    const relativePath = vscode.workspace.asRelativePath(uri);
    const pathHash = hashPathSHA256_64(relativePath);

    // Read and decode workspace file content
    const fileData = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder('utf-8').decode(fileData);

    // Track words and positions for each category independently
    const ProtocolPpiGuidWordsSet = new Set<string>();
    const ProtocolPpiGuidWithPos: ParsedFileResult['wordsWithPos'] = [];

    const lines = content.split(/\r?\n/);

    // regex patterns on EDK2DEC
    const ProtocolGuidPpiRegex = /\b(g[A-Za-z0-9_]*Guid)\s*=/;
    const Edk2DefineRegex = /^\s*DEFINE\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/;

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
            ProtocolPpiGuidWithPos.push({
                word,
                position: {line: lineIdx, character}
            });
            ProtocolPpiGuidWordsSet.add(word);
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
                words: Array.from(ProtocolPpiGuidWordsSet),
                wordsWithPos: ProtocolPpiGuidWithPos
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

        await Promise.all([
            Db_ProtocolPpiGuid.updateGenCache(ProtocolGuidPpiResults),
            Db_EDK2Define.updateGenCache(Edk2DefineResults)
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
            Db_EDK2Define.deleteGenCache(pathHash)
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

        // prase all files
        const parseAllResults = await Promise.all(
            targetFiles.map(file => parseFile(file).catch(err => {
                console.error(`[EDK2] Failed to parse file: ${file.fsPath}`, err);
                return null;
            }))
        );

        // Filter out unresolved or errored files
        const validResults = parseAllResults.filter((res): res is DecParsedFileResult => res !== null);

        // Extract ParsedFileResult directly without remapping structures
        const ProtocolGuidPpiResults: ParsedFileResult[] = validResults.map(res => res.decDefinition.ProtocolPpiGuid).filter(res => res.wordsWithPos.length > 0);
        const Edk2DefineResults: ParsedFileResult[] = validResults.map(res => res.decDefinition.Edk2Define).filter(res => res.wordsWithPos.length > 0);

        // First init cache
        await Promise.all([
            Db_ProtocolPpiGuid.initGenCache(ProtocolGuidPpiResults),
            Db_EDK2Define.initGenCache(Edk2DefineResults)
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
