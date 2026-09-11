import * as vscode from 'vscode';

const targetLanguages_HII_Image_Token = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
];

// Caller file syntax: IMAGE_TOKEN($(token_name))
const HII_Image_Token_CALLER_REGEX = /(?<=IMAGE_TOKEN\s*\(\s*)[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\))/;

class main_HiiImageTokenProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {

        const range = document.getWordRangeAtPosition(position, HII_Image_Token_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] HII Image Token: ${word}`);
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_HII_Image_Token(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_HII_Image_Token,
                                new main_HiiImageTokenProvider()
                                );
}
