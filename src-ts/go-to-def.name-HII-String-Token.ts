import * as vscode from 'vscode';

const targetLanguages_HII_String_Token = [
    { language: 'edk2vfr' },
    { pattern: '**/*.c' }
];

class main_HiiStringTokenProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] HII String Token');
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_HII_String_Token(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_HII_String_Token,
                                new main_HiiStringTokenProvider()
                                );
}
