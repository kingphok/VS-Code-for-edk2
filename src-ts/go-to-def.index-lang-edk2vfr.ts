import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';
import { Db_VfrGotoForm } from './go-to-def.name-VFR-goto-form';
import { Db_Vfrkey } from './go-to-def.name-VFR-key';
import { Db_VfrVariableDefault } from './go-to-def.name-VFR-Varable-default';
import { ParsedFileResult, hashPathSHA256_64 } from './db-lib';

// Internal EDK2VFR parsing data structure
interface VfrParsedFileResult {
    vfrDefinition: {
        gotoForms: ParsedFileResult;
        keys: ParsedFileResult;
        variableDefaults: ParsedFileResult;
    };
}

// VfrgotoForms       : form formid = $(from_id),
// Vfrkeys            : key = $(key_value),
// VfrvariableDefaults: varid = $(structure).$(structure_parameter),
async function parseFile(uri: vscode.Uri):Promise<VfrParsedFileResult> {
    const fsPath = uri.fsPath;
    const relativePath = vscode.workspace.asRelativePath(uri);
    const pathHash = hashPathSHA256_64(relativePath);

    // Read and decode workspace file content
    const fileData = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder('utf-8').decode(fileData);

    // Track words and positions for each category independently
    const gotoFormsWordsSet = new Set<string>();
    const gotoFormsWithPos: ParsedFileResult['wordsWithPos'] = [];

    const vfrKeysWordsSet = new Set<string>();
    const vfrKeysWithPos: ParsedFileResult['wordsWithPos'] = [];

    const variableDefaultsWordsSet = new Set<string>();
    const variableDefaultsWithPos: ParsedFileResult['wordsWithPos'] = [];

    const lines = content.split(/\r?\n/);

    // EDK2 VFR token extraction regex patterns
    const gotoFormRegex = /\bform\s+formid\s*=\s*([A-Za-z0-9_]+)\s*,/;
    const keyRegex = /\bkey\s*=\s*([A-Za-z0-9_]+)\s*[,;]/;
    const defaultRegex = /\bvarid\s*=\s*[A-Za-z_][A-Za-z0-9_]*\.([A-Za-z_][A-Za-z0-9_]*)/;

    lines.forEach((lineText, lineIdx) => {
        // Extract VfrGotoForms
        const formMatch = gotoFormRegex.exec(lineText);
        if (formMatch) {
            const word = formMatch[1];
            const character = formMatch.index + formMatch[0].indexOf(word);
            gotoFormsWithPos.push({
                word,
                position: {line: lineIdx, character}
            });
            gotoFormsWordsSet.add(word);
        }

        // Extract VfrKeys
        const keyMatch = keyRegex.exec(lineText);
        if (keyMatch) {
            const word = keyMatch[1];
            const character = keyMatch.index + keyMatch[0].indexOf(word);
            vfrKeysWithPos.push({
                word,
                position: {line: lineIdx, character}
            });
            vfrKeysWordsSet.add(word);
        }

        // Extract VfrVariableDefaults
        const defaultMatch = defaultRegex.exec(lineText);
        if (defaultMatch) {
            const word = defaultMatch[1];
            const character = defaultMatch.index + defaultMatch[0].indexOf(word);
            variableDefaultsWithPos.push({
                word,
                position: {line: lineIdx, character}
            });
            variableDefaultsWordsSet.add(word);
        }
    });

    return {
        vfrDefinition: {
            gotoForms: {
                pathHash,
                relativePath,
                words: Array.from(gotoFormsWordsSet),
                wordsWithPos: gotoFormsWithPos
            },
            keys: {
                pathHash,
                relativePath,
                words: Array.from(vfrKeysWordsSet),
                wordsWithPos: vfrKeysWithPos
            },
            variableDefaults: {
                pathHash,
                relativePath,
                words: Array.from(variableDefaultsWordsSet),
                wordsWithPos: variableDefaultsWithPos
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
        const gotoFormResults = parseResult.vfrDefinition.gotoForms;
        const vfrKeyResults = parseResult.vfrDefinition.keys;
        const variableDefaultResults = parseResult.vfrDefinition.variableDefaults;

        await Promise.all([
            Db_VfrGotoForm.updateGenCache(gotoFormResults),
            Db_Vfrkey.updateGenCache(vfrKeyResults),
            Db_VfrVariableDefault.updateGenCache(variableDefaultResults)
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
            Db_VfrGotoForm.deleteGenCache(pathHash),
            Db_Vfrkey.deleteGenCache(pathHash),
            Db_VfrVariableDefault.deleteGenCache(pathHash)
        ]);
    } catch (err) {
        console.error(`[EDK2] Failed to unindex file: ${uri.fsPath}`, err);
    }
}

export async function DbIndexing_Lang_EDK2VFR(context: vscode.ExtensionContext) {
    const [isGotoFormEmpty, isKeyEmpty, isVariableDefaultEmpty] = await Promise.all([
        Db_VfrGotoForm.readCache((cache) => cache.paths.size === 0),
        Db_Vfrkey.readCache((cache) => cache.paths.size === 0),
        Db_VfrVariableDefault.readCache((cache) => cache.paths.size === 0)
    ]);

    // Skip initialization only when all cache empty
    if (!isGotoFormEmpty && !isKeyEmpty && !isVariableDefaultEmpty) {
        console.log('[EDK2] VFR: Get DB done');
        return;
    }

    try {
        // Get allowed file extension -> find all fils -> Excluding file by gitignore paths
        const fileGlobPattern = getAllowedFileExtensions(['vfr', 'vfi', 'hfr'], 'edk2vfr')
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
        const validResults = parseAllResults.filter((res): res is VfrParsedFileResult => res !== null);

        // Extract ParsedFileResult directly without remapping structures
        const gotoFormResults: ParsedFileResult[] = validResults.map(res => res.vfrDefinition.gotoForms).filter(res => res.wordsWithPos.length > 0);
        const vfrKeyResults: ParsedFileResult[] = validResults.map(res => res.vfrDefinition.keys).filter(res => res.wordsWithPos.length > 0);
        const variableDefaultResults: ParsedFileResult[] = validResults.map(res => res.vfrDefinition.variableDefaults).filter(res => res.wordsWithPos.length > 0);

        // First init cache
        await Promise.all([
            Db_VfrGotoForm.initGenCache(gotoFormResults),
            Db_Vfrkey.initGenCache(vfrKeyResults),
            Db_VfrVariableDefault.initGenCache(variableDefaultResults)
        ]);
        console.log('[EDK2] VFR all DB init done');

    } catch (err) {
        console.error('[EDK2] VFR: DB init failed.', err);
    }
}

// Creates and configures the specialized EDK2 VFR file watcher.
export function Watcher_Lang_EDK2VFR(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['vfr', 'vfi', 'hfr'], 'edk2vfr')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] VFR onDidChange:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] VFR onDidCreate:', uri);
        await indexSingleFile(uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] VFR onDidDelete:', uri);
        await unindexSingleFile(uri);
    });

    return watcher;
}
