import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';
import { Db_EDK2Define } from './go-to-def.name-EDK2-DEFINE';
import { Db_Pcd } from './go-to-def.name-Pcd';
import { ParsedFileResult, hashPathSHA256_64 } from './db-lib';

// Internal EDK2FDF parsing data structure
interface FdfParsedFileResult {
    fdfDefinition: {
        Edk2Define:   ParsedFileResult;
        Pcd:          ParsedFileResult;
    };
}

// Edk2Define:
//   DEFINE $(marco_name) =
// Pcd:
//   1. = $(value)|g*Guid.Pcd*
//   2. SET g*Guid.Pcd* = $(value)
//   3. $(value)|$(value)
//      g*Guid.Pcd*|g*Guid.Pcd*
async function parseFile(uri: vscode.Uri):Promise<FdfParsedFileResult> {
    const fsPath = uri.fsPath;
    const relativePath = vscode.workspace.asRelativePath(uri);
    const pathHash = hashPathSHA256_64(relativePath);

    // Read and decode workspace file content
    const fileData = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder('utf-8').decode(fileData);

    // regex patterns on EDK2FDF
    // Track words and positions for each category independently
    const Edk2DefineRegex = /^\s*DEFINE\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/;
    const edk2DefineWordsSet = new Set<string>();
    const edk2DefineWithPos: ParsedFileResult['wordsWithPos'] = [];

    const PcdRegex_1 = /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=\s*[^|]+\|\s*[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*\.([A-Za-z_][A-Za-z0-9_]*)/;
    const PcdRegex_2 = /^\s*SET\s+[A-Za-z_][A-Za-z0-9_]*\.([A-Za-z_][A-Za-z0-9_]*)(?:\.[A-Za-z_][A-Za-z0-9_]*)*\s*=/;
    const PcdRegex_3 = /[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*\.([A-Za-z_][A-Za-z0-9_]*)\|\s*[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*\.([A-Za-z_][A-Za-z0-9_]*)/g;
    const pcdWordsSet = new Set<string>();
    const pcdWithPos: ParsedFileResult['wordsWithPos'] = [];

    const lines = content.split(/\r?\n/);
    lines.forEach((lineText, lineIdx) => {
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
        const pcdMatch = PcdRegex_1.exec(lineText) || PcdRegex_2.exec(lineText);
        if (pcdMatch) {
            const word = pcdMatch[1];
            const character = pcdMatch.index + pcdMatch[0].indexOf(word);
            pcdWithPos.push({
                word,
                position: {line: lineIdx, character}
            });
            pcdWordsSet.add(word);
        }

        PcdRegex_3.lastIndex = 0;
        let pcdMatch_3: RegExpExecArray | null;
        while ((pcdMatch_3 = PcdRegex_3.exec(lineText)) !== null) {
            // Left-side PCD (Group 1)
            const leftWord = pcdMatch_3[1];
            if (leftWord) {
                const character = pcdMatch_3.index + pcdMatch_3[0].indexOf(leftWord);
                pcdWithPos.push({
                    word: leftWord,
                    position: { line: lineIdx, character }
                });
                pcdWordsSet.add(leftWord);
            }
            // Right-side PCD (Group 1)
            const rightWord = pcdMatch_3[2];
            if (rightWord) {
                const character = pcdMatch_3.index + pcdMatch_3[0].lastIndexOf(rightWord);
                pcdWithPos.push({
                    word: rightWord,
                    position: { line: lineIdx, character }
                });
                pcdWordsSet.add(rightWord);
            }
        }
    });

    return {
        fdfDefinition: {
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
        const Edk2DefineResults = parseResult.fdfDefinition.Edk2Define;
        const PcdResults = parseResult.fdfDefinition.Pcd;

        await Promise.all([
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
            Db_EDK2Define.deleteGenCache(pathHash),
            Db_Pcd.deleteGenCache(pathHash)
        ]);
    } catch (err) {
        console.error(`[EDK2] Failed to unindex file: ${uri.fsPath}`, err);
    }
}

export async function DbIndexing_Lang_EDK2FDF(context: vscode.ExtensionContext) {
    try {
        // Get allowed file extension -> find all fils -> Excluding file by gitignore paths
        const fileGlobPattern = getAllowedFileExtensions(['fdf', 'fdf.inc'], 'edk2fdf')
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
        const validResults = parseAllResults.filter((res): res is FdfParsedFileResult => res !== null);

        // Extract ParsedFileResult directly without remapping structures
        const Edk2DefineResults: ParsedFileResult[] = validResults.map(res => res.fdfDefinition.Edk2Define).filter(res => res.wordsWithPos.length > 0);
        const PcdResults: ParsedFileResult[] = validResults.map(res => res.fdfDefinition.Pcd).filter(res => res.wordsWithPos.length > 0);

        await Promise.all([
            Db_EDK2Define.initGenCache(Edk2DefineResults),
            Db_Pcd.initGenCache(PcdResults)
        ]);

        console.log('[EDK2] FDF all DB init done');
    } catch (err) {
        console.error('[EDK2] FDF: DB init failed.', err);
    }
}

// Creates and configures the specialized EDK2 FDF file watcher.
export function Watcher_Lang_EDK2FDF(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['fdf', 'fdf.inc'], 'edk2fdf')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] FDF onDidChange:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] FDF onDidCreate:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] FDF onDidDelete:', uri);
        await unindexSingleFile(uri);
    });

    return watcher;
}
