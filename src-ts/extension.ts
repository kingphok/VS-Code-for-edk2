import * as vscode from 'vscode';
import { symbolProvider_OutlineSection } from './outline.edk2-section';
import { symbolProvider_OutlineVarid } from './outline.vfr-varid';

async function DatabaseIndexing(context: vscode.ExtensionContext) {
    const startTime = performance.now();

    // Index all files for go to definition database

    const endTime = performance.now();
    console.log(`[EDK2] DatabaseIndexing: ${(endTime - startTime).toFixed(2)} ms`);
}

function DatabaseWatching(context: vscode.ExtensionContext) {
    const startTime = performance.now();

    // Watch file and index it for go to definition database

    const endTime = performance.now();
    console.log(`[EDK2] DatabaseWatching: ${(endTime - startTime).toFixed(2)} ms`);
}

export function activate(context: vscode.ExtensionContext) {
    console.log('[EDK2] Extension has been successfully compiled and activated!');

    context.subscriptions.push(
        symbolProvider_OutlineSection(),
        symbolProvider_OutlineVarid()
    );

    DatabaseIndexing(context);
    DatabaseWatching(context);

    //    vscode.window.showInformationMessage('[EDK2] Extension has been successfully compiled and activated!');
}

export function deactivate() {
    console.log('[EDK2] Extension has been deactivated.');
//    vscode.window.showInformationMessage('[EDK2] Extension has been deactivated.');
}
