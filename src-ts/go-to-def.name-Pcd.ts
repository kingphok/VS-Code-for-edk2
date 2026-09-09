import * as vscode from 'vscode';

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

class main_PcdProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] Pcd');
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_Pcd(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_Pcd,
                                new main_PcdProvider()
                                );
}
