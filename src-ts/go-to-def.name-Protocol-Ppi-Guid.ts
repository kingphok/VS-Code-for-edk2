import * as vscode from 'vscode';

const targetLanguages_Protocol_Ppi_Guid = [
    { language: 'edk2dec' },
    { language: 'edk2dsc' },
    { language: 'edk2fdf' },
    { language: 'edk2inf' },
    { language: 'edk2vfr' },
    { pattern: '**/*.c' },
    { pattern: '**/*.cpp' },
    { pattern: '**/*.h' },
];

// Caller file syntax: g*Guid
const Protocol_Guid_CALLER_REGEX = /\bg[a-zA-Z0-9_]*Guid\b/;

class main_ProtocolPpiGuidProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Location | vscode.Location[] | null {

        const range = document.getWordRangeAtPosition(position, Protocol_Guid_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] Protocol Ppi Guid: ${word}`);
        return null;
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_Protocol_Ppi_Guid(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_Protocol_Ppi_Guid,
                                new main_ProtocolPpiGuidProvider()
                                );
}
