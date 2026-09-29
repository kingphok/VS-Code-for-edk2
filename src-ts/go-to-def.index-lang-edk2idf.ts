import * as vscode from 'vscode';
import { gitignorePaths, getAllowedFileExtensions} from './path-filter';
import { Db_HiiImageToken } from './go-to-def.name-HII-Image-Token';
import { ParsedFileResult, hashPathSHA256_64 } from './db-lib';

// #image $(token_name)
async function parseFile(uri: vscode.Uri): Promise<ParsedFileResult> {
    const fileData = await vscode.workspace.fs.readFile(uri);
    const content = Buffer.from(fileData).toString('utf8');

    const relativePath = vscode.workspace.asRelativePath(uri);
    const pathHash = hashPathSHA256_64(relativePath);

    const stringTokenRegex = /^\s*#image\s+([A-Za-z0-9_]+)/gm;

    const wordsWithPos: ParsedFileResult['wordsWithPos'] = [];
    const wordSet = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = stringTokenRegex.exec(content)) !== null) {
        const word = match[1];

        const wordStartOffset = match.index + match[0].indexOf(word);
        const textBeforeWord = content.substring(0, wordStartOffset);
        const lines = textBeforeWord.split(/\r?\n/);

        const line = lines.length - 1;
        const character = lines[lines.length - 1].length;

        wordsWithPos.push({
            word,
            position: { line, character }
        });
        wordSet.add(word);
    }

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
        // Get allowed file extension -> find all fils -> Excluding file by gitignore paths
        const fileGlobPattern = getAllowedFileExtensions(['idf'], 'edk2idf')
        const files = await vscode.workspace.findFiles(fileGlobPattern);
        const targetFiles = files.filter(file =>
            !gitignorePaths.some(ignored => file.fsPath.includes(ignored))
        );

        // prase all files
        const parseAllResults = await Promise.all(
            files.map(file => parseFile(file).catch(err => {
                console.error(`[EDK2] Failed to parse file: ${file.fsPath}`, err);
                return null;
            }))
        );

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
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] IDF onDidChange:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] IDF onDidCreate:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] IDF onDidDelete:', uri);
        await unindexSingleFile(uri);
    });

    return watcher;
}
