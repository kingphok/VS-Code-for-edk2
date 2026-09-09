import * as vscode from 'vscode';

const targetLanguages_Module_Entry_Point = [
    { language: 'edk2inf' }
];

class main_ModuleEntryPointProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] Module Entry Point');
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_Module_Entry_Point(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_Module_Entry_Point,
                                new main_ModuleEntryPointProvider()
                                );
}
