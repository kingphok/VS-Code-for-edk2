import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

const targetLanguages_EDK2_DEFINE = [
    { language: 'edk2dec' },
    { language: 'edk2dsc' },
    { language: 'edk2fdf' },
    { language: 'edk2inf' }
];

// db settings
export const DB_JSON_Db_EDK2Define: string = "DB.EDK2-Define.json";
export const DB_VERSION:            string = "1.0";
export const Cache_EDK2Define: genericCacheLayout = {
    version: DB_VERSION,
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_EDK2Define = new DbLib(Cache_EDK2Define);

// Caller file syntax: $($(marco_name))
const EDK2_DEFINE_CALLER_REGEX = /(?<=\$\(\s*)[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\))/;

class main_edk2DefineProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, EDK2_DEFINE_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] EDK2 DEFINE: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_EDK2Define.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_EDK2_DEFINE(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_EDK2_DEFINE,
                                new main_edk2DefineProvider()
                                );
}
