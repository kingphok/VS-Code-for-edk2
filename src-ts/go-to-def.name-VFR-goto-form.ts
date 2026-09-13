import * as vscode from 'vscode';

const targetLanguages_VFR_goto_form = [
    { language: 'edk2vfr' }
];

// Caller file syntax: goto $(from_id),
const VFR_goto_form_CALLER_REGEX = /(?<=goto\s+(?:\(\s*)?)(?:0x[0-9a-fA-F]+|\d+|[a-zA-Z_][a-zA-Z0-9_]*)(?=\s*(?:,|\)|$))/;

class main_VfrGotoFormProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {

        const range = document.getWordRangeAtPosition(position, VFR_goto_form_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] VFR goto form: ${word}`);
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
