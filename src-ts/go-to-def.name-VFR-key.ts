import * as vscode from 'vscode';

const targetLanguages_VFR_key = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
];

// Caller file syntax: $(key_value)
const VFR_key_CALLER_REGEX = /\b[A-Z_][A-Z0-9_]*\b/;

class main_VfrKeyProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {

        const range = document.getWordRangeAtPosition(position, VFR_key_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] VFR key: ${word}`);
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
