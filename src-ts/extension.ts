import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('[EDK2] Extension has been successfully compiled and activated!');
//    vscode.window.showInformationMessage('[EDK2] Extension has been successfully compiled and activated!');
}

export function deactivate() {
    console.log('[EDK2] Extension has been deactivated.');
//    vscode.window.showInformationMessage('[EDK2] Extension has been deactivated.');
}
