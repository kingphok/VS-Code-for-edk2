import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

const targetLanguages_HII_String_Token = [
    { language: 'edk2vfr' },
    { pattern: '**/*.c' }
];

// db settings
export const Cache_HiiStringToken: genericCacheLayout = {
    version: "1.0",
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_HiiStringToken = new DbLib(Cache_HiiStringToken);

// Caller file syntax: STRING_TOKEN($(token_name))
const HII_String_Token_CALLER_REGEX = /(?<=STRING_TOKEN\s*\(\s*)[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\))/;

class main_HiiStringTokenProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, HII_String_Token_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] HII String Token: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_HiiStringToken.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_HII_String_Token(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_HII_String_Token,
                                new main_HiiStringTokenProvider()
                                );
}
