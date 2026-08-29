import * as vscode from 'vscode';
import { symbolProvider_OutlineSection } from './outline.edk2-section';

export function activate(context: vscode.ExtensionContext) {
    console.log('[EDK2] Extension has been successfully compiled and activated!');

    context.subscriptions.push(
        symbolProvider_OutlineSection()
    );

    //    vscode.window.showInformationMessage('[EDK2] Extension has been successfully compiled and activated!');
}

export function deactivate() {
    console.log('[EDK2] Extension has been deactivated.');
//    vscode.window.showInformationMessage('[EDK2] Extension has been deactivated.');
}
