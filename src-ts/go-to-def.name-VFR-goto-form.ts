import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

const targetLanguages_VFR_goto_form = [
    { language: 'edk2vfr' }
];

// db settings
export const Cache_VfrGotoForm: genericCacheLayout = {
    version: "1.0",
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_VfrGotoForm = new DbLib(Cache_VfrGotoForm);

// Caller file syntax: goto $(from_id),
const VFR_goto_form_CALLER_REGEX = /(?<=goto\s+(?:\(\s*)?)(?:0x[0-9a-fA-F]+|\d+|[a-zA-Z_][a-zA-Z0-9_]*)(?=\s*(?:,|\)|$))/;

class main_VfrGotoFormProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, VFR_goto_form_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] VFR goto form: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_VfrGotoForm.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_VFR_goto_form(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_VFR_goto_form,
                                new main_VfrGotoFormProvider()
                                );
}
