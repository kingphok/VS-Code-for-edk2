import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

const targetLanguages_Compiler_Flag = [
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
export const DB_JSON_CompilerFlag: string = "DB.Compiler-flag.json";
export const DB_VERSION:           string = "1.0";
export const Cache_CompilerFlag: genericCacheLayout = {
    version: DB_VERSION,
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_CompilerFlag = new DbLib(Cache_CompilerFlag);

// Caller file syntax: $(marco_name)
const COMPILER_FLAG_CALLER_REGEX = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/;

class main_CompilerFlagProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, COMPILER_FLAG_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] Compiler Flag: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_CompilerFlag.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_Compiler_Flag(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_Compiler_Flag,
                                new main_CompilerFlagProvider()
                                );
}
