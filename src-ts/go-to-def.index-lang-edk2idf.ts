import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';
import { ParsedFileResult, mapConcurrent, hashPathSHA256_64 } from './db-lib';
import { Db_HiiImageToken } from './go-to-def.name-HII-Image-Token';

const stringTokenRegex = /^\s*#image\s+([A-Za-z0-9_]+)/gm;

// #image $(token_name)
async function parseFile(uri: vscode.Uri): Promise<ParsedFileResult> {
    const fileData = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder('utf-8').decode(fileData);

    const relativePath = vscode.workspace.asRelativePath(uri);
    const pathHash = hashPathSHA256_64(relativePath);

    const lines = content.split(/\r?\n/);
    const stringTokenRegex = /^\s*#image\s+([A-Za-z0-9_]+)/;

    const wordsWithPos: ParsedFileResult['wordsWithPos'] = [];
    const wordSet = new Set<string>();

    lines.forEach((lineText, lineIdx) => {
        const match = stringTokenRegex.exec(lineText);
        if (match) {
            const word = match[1];
            const character = match.index + match[0].indexOf(word);

            wordsWithPos.push({
                word,
                position: {
                    line: lineIdx,
                    character
                }
            });
            wordSet.add(word);
        }
    });

    return {
        pathHash,
        relativePath,
        words: Array.from(wordSet),
        wordsWithPos
    };
}

export async function indexSingleFile(uri: vscode.Uri) {
    try {
        const parseResult = await parseFile(uri);
        await Db_HiiImageToken.updateGenCache(parseResult);
    } catch (err) {
        console.error(`[EDK2] Failed to index single file: ${uri.fsPath}`, err);
    }
}

async function unindexSingleFile(uri: vscode.Uri) {
    try {
        // Calculate relative path and SHA-256 hash
        const relativePath = vscode.workspace.asRelativePath(uri);
        const pathHash = hashPathSHA256_64(relativePath);
        await Db_HiiImageToken.deleteGenCache(pathHash);
    } catch (err) {
        console.error(`[EDK2] Failed to unindex file: ${uri.fsPath}`, err);
    }
}

export async function DbIndexing_Lang_EDK2IDF(context: vscode.ExtensionContext) {
    const isEmpty = await Db_HiiImageToken.readCache((cache) => cache.paths.size === 0);
    if (!isEmpty) {
        console.log('[EDK2] HII Image Token: Get DB done');
        return;
    }

    try {
        // Get allowed file extension -> find all files -> Excluding file by gitignore paths
        const fileGlobPattern = getAllowedFileExtensions(['idf'], 'edk2idf')
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

        // First init cache
        await Db_HiiImageToken.initGenCache(parseAllResults);
        console.log('[EDK2] HII Image Token: DB init done');
    } catch (err) {
        console.error('[EDK2] HII Image Token: DB init failed.', err);
    }
}

// Creates and configures the specialized EDK2 IDF file watcher.
export function Watcher_Lang_EDK2IDF(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['idf'], 'edk2idf')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] IDF onDidChange:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] IDF onDidCreate:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] IDF onDidDelete:', uri);
        await unindexSingleFile(uri);
    });

    return watcher;
}
