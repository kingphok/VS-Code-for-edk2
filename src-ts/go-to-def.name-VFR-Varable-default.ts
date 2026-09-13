import * as vscode from 'vscode';

const targetLanguages_VFR_Variable_default = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
    { pattern: '**/*.h' },
];

// Caller file syntax: $(structure).$(structure_parameter)
const VFR_Varable_default_CALLER_REGEX = /(?<=\.)[a-zA-Z_][a-zA-Z0-9_]*\b/;

class main_VfrVariableDefultProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {

        const range = document.getWordRangeAtPosition(position, VFR_Varable_default_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] VFR Variable default: ${word}`);
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
