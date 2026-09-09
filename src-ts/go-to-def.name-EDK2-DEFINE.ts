import * as vscode from 'vscode';

const targetLanguages_EDK2_DEFINE = [
    { language: 'edk2dec' },
    { language: 'edk2dsc' },
    { language: 'edk2fdf' },
    { language: 'edk2inf' }
];

class main_edk2DefineProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] EDK2 DEFINE');
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_EDK2_DEFINE(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_EDK2_DEFINE,
                                new main_edk2DefineProvider()
                                );
}
