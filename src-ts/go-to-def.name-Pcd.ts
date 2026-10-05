import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

const targetLanguages_Pcd = [
    { language: 'edk2dec' },
    { language: 'edk2dsc' },
    { language: 'edk2fdf' },
    { language: 'edk2inf' },
    { language: 'edk2vfr' },
    { pattern: '**/*.asl' },
    { pattern: '**/*.asi' },
    { pattern: '**/*.aslc' },
    { pattern: '**/*.asm' },
    { pattern: '**/*.nasm' },
    { pattern: '**/*.nasmb'},
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
    { pattern: '**/*.h' },
    { pattern: '**/*.S' },
];

// db settings
export const DB_JSON_Pcd: string = "DB.Pcd.json";
export const DB_VERSION:  string = "1.0";
export const Cache_Pcd:   genericCacheLayout = {
    version: DB_VERSION,
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_Pcd = new DbLib(Cache_Pcd);

// Caller file syntax: Pcd*
const PCD_CALLER_REGEX = /\bPcd[a-zA-Z0-9_]*\b/;

class main_PcdProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, PCD_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] Pcd: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_Pcd.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_Pcd(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_Pcd,
                                new main_PcdProvider()
                                );
}
