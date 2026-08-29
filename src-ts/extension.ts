import * as vscode from 'vscode';
import { symbolProvider_OutlineSection } from './outline.edk2-section';
import { symbolProvider_OutlineVarid } from './outline.vfr-varid';

export function activate(context: vscode.ExtensionContext) {
    console.log('[EDK2] Extension has been successfully compiled and activated!');

    context.subscriptions.push(
        symbolProvider_OutlineSection(),
        symbolProvider_OutlineVarid()
    );

    //    vscode.window.showInformationMessage('[EDK2] Extension has been successfully compiled and activated!');
}

export function deactivate() {
    console.log('[EDK2] Extension has been deactivated.');
//    vscode.window.showInformationMessage('[EDK2] Extension has been deactivated.');
}
