import * as vscode from 'vscode';

const targetLanguages_Compiler_Flag = [
    { language: 'edk2dec' },
    { language: 'edk2dsc' },
    { language: 'edk2fdf' },
    { language: 'edk2inf' },
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

class main_CompilerFlagProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] Compiler Flag');
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
