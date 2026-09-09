import * as vscode from 'vscode';

const targetLanguages_VFR_Variable_default = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
    { pattern: '**/*.h' },
];

class main_VfrVariableDefultProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] VFR Variable default');
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_VFR_Variable_default(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_VFR_Variable_default,
                                new main_VfrVariableDefultProvider()
                                );
}
