import * as vscode from 'vscode';

const targetLanguages_Protocol_Guid = [
    { language: 'edk2dec' },
    { language: 'edk2dsc' },
    { language: 'edk2fdf' },
    { language: 'edk2inf' },
    { language: 'edk2vfr' },
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
    { pattern: '**/*.h' },
];

class main_ProtocolGuidProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {
        console.log('[EDK2] Protocol Guid');
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_Protocol_Guid(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_Protocol_Guid,
                                new main_ProtocolGuidProvider()
                                );
}
