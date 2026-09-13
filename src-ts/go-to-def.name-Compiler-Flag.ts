import * as vscode from 'vscode';

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

// Caller file syntax: $(marco_name)
const COMPILER_FLAG_CALLER_REGEX = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/;

class main_CompilerFlagProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {

        const range = document.getWordRangeAtPosition(position, COMPILER_FLAG_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] Compiler Flag: ${word}`);
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_Compiler_Flag(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_Compiler_Flag,
                                new main_CompilerFlagProvider()
                                );
}
