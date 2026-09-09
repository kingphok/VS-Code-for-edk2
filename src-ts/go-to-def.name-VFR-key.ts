import * as vscode from 'vscode';

const targetLanguages_VFR_key = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
];

class main_VfrKeyProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] VFR key');
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_VFR_key(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_VFR_key,
                                new main_VfrKeyProvider()
                                );
}
