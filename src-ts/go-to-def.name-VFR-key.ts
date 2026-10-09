import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

const targetLanguages_VFR_key = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
];

// db settings
export const Cache_Vfrkey: genericCacheLayout = {
    version: "1.0",
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_Vfrkey = new DbLib(Cache_Vfrkey);

// Caller file syntax: $(key_value)
const VFR_key_CALLER_REGEX = /\b[A-Z_][A-Z0-9_]*\b/;

class main_VfrKeyProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, VFR_key_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] VFR key: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_Vfrkey.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_VFR_key(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_VFR_key,
                                new main_VfrKeyProvider()
                                );
}
