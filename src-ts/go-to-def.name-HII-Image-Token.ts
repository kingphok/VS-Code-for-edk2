import * as vscode from 'vscode';

const targetLanguages_HII_Image_Token = [
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
];

class main_HiiImageTokenProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] HII Image Token');
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
