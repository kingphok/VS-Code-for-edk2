import * as vscode from 'vscode';
import {genericCacheLayout, DbLib} from './db-lib';

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

// db settings
export const DB_JSON_ProtocolPpiGuid: string = "DB.Protocol-Ppi-Guid.json";
export const DB_VERSION:              string = "1.0";
export const Cache_ProtocolPpiGuid:   genericCacheLayout = {
    version: DB_VERSION,
    paths: new Map(),
    forward_index: new Map(),
    reverse_index: new Map()
};
export const Db_ProtocolPpiGuid = new DbLib(Cache_ProtocolPpiGuid);

// Caller file syntax: g*Guid or &g*Guid
const Protocol_Guid_CALLER_REGEX = /\bg[a-zA-Z0-9_]*Guid\b/;

class main_ProtocolPpiGuidProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Location | vscode.Location[] | null> {

        const range = document.getWordRangeAtPosition(position, Protocol_Guid_CALLER_REGEX);
        if (!range) return null;
        const word = document.getText(range);

        console.log(`[EDK2] Protocol Ppi Guid: ${word}`);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return Db_ProtocolPpiGuid.getLocations(word, workspaceFolders[0].uri);
    }
}

// Register provider to handle VS Code got to difinition
export function definitionProvider_Protocol_Ppi_Guid(): vscode.Disposable {
    return vscode.languages.registerDefinitionProvider(
                                targetLanguages_Protocol_Ppi_Guid,
                                new main_ProtocolPpiGuidProvider()
                                );
}
