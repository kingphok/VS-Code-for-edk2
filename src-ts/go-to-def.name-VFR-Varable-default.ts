import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

const targetLanguages_VFR_Variable_default = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
    { pattern: '**/*.h' },
];

// db settings
export const Cache_VfrVariableDefault: genericCacheLayout = {
    version: "1.0",
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_VfrVariableDefault = new DbLib(Cache_VfrVariableDefault);

// Caller file syntax: $(structure).$(structure_parameter)
const VFR_Varable_default_CALLER_REGEX = /(?<=\.)[a-zA-Z_][a-zA-Z0-9_]*\b/;

class main_VfrVariableDefultProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, VFR_Varable_default_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] VFR Variable default: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_VfrVariableDefault.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_VFR_Variable_default(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_VFR_Variable_default,
                                new main_VfrVariableDefultProvider()
                                );
}
