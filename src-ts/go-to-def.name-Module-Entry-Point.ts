import * as vscode from 'vscode';

const targetLanguages_Module_Entry_Point = [
    { language: 'edk2inf' }
];

// Caller file syntax:
//   ENTRY_POINT = $(function name)
//   UNLOAD_IMAGE = $(function name)
//   CONSTRUCTOR = $(function name)
//   DESTRUCTOR = $(function name)
const Module_Entry_Point_CALLER_REGEX = /(?<=(?:ENTRY_POINT|UNLOAD_IMAGE|CONSTRUCTOR|DESTRUCTOR)\s*=\s*)[a-zA-Z_][a-zA-Z0-9_]*/;

class main_ModuleEntryPointProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {

        const range = document.getWordRangeAtPosition(position, Module_Entry_Point_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] Module Entry Point: ${word}`);
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
