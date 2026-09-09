import * as vscode from 'vscode';

const targetLanguages_VFR_goto_form = [
    { language: 'edk2vfr' }
];

class main_VfrGotoFormProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] VFR goto form');
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_VFR_goto_form(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_VFR_goto_form,
                                new main_VfrGotoFormProvider()
                                );
}
