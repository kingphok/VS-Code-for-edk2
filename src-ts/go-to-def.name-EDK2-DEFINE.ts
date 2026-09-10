import * as vscode from 'vscode';

const targetLanguages_EDK2_DEFINE = [
    { language: 'edk2dec' },
    { language: 'edk2dsc' },
    { language: 'edk2fdf' },
    { language: 'edk2inf' }
];

// Caller file syntax: $($(marco_name))
const EDK2_DEFINE_CALLER_REGEX = /\$\(([a-zA-Z_][a-zA-Z0-9_]*)\)/;

class main_edk2DefineProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {

        const range = document.getWordRangeAtPosition(position, EDK2_DEFINE_CALLER_REGEX);
        if (!range) return null;
        const rawText = document.getText(range);
        const word = rawText.slice(2, -1);

        console.log(`[EDK2] EDK2 DEFINE: ${word}`);
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
