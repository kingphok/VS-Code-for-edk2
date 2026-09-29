import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

const targetLanguages_HII_Image_Token = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
];

// db settings
export const DB_JSON_HiiImageToken: string = "DB.HII-Image-Token.json";
export const DB_VERSION:            string = "1.0";
export const Cache_HiiImageToken: genericCacheLayout = {
    version: DB_VERSION,
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_HiiImageToken = new DbLib(Cache_HiiImageToken);

// Caller file syntax: IMAGE_TOKEN($(token_name))
const HII_Image_Token_CALLER_REGEX = /(?<=IMAGE_TOKEN\s*\(\s*)[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\))/;

class main_HiiImageTokenProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, HII_Image_Token_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] HII Image Token: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_HiiImageToken.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_HII_Image_Token(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_HII_Image_Token,
                                new main_HiiImageTokenProvider()
                                );
}
