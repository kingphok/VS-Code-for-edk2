import * as vscode from 'vscode';
import { symbolProvider_OutlineSection } from './outline.edk2-section';
import { symbolProvider_OutlineVarid } from './outline.vfr-varid';
import { definitionProvider_Compiler_Flag }         from './go-to-def.name-Compiler-Flag';
import { definitionProvider_EDK2_DEFINE }           from './go-to-def.name-EDK2-DEFINE';
import { definitionProvider_HII_Image_Token }       from './go-to-def.name-HII-Image-Token';
import { definitionProvider_HII_String_Token }      from './go-to-def.name-HII-String-Token';
import { definitionProvider_Module_Entry_Point }    from './go-to-def.name-Module-Entry-Point';
import { definitionProvider_Pcd }                   from './go-to-def.name-Pcd';
import { definitionProvider_Protocol_Ppi_Guid }     from './go-to-def.name-Protocol-Ppi-Guid';
import { definitionProvider_VFR_goto_form }         from './go-to-def.name-VFR-goto-form';
import { definitionProvider_VFR_key }               from './go-to-def.name-VFR-key';
import { definitionProvider_VFR_Variable_default }  from './go-to-def.name-VFR-Varable-default';

import { initGitignorePaths, Watcher_GitignorePaths } from './path-filter';

import { Watcher_Lang_EDK2DEC } from './go-to-def.index-lang-edk2dec';
import { Watcher_Lang_EDK2DSC } from './go-to-def.index-lang-edk2dsc';
import { Watcher_Lang_EDK2FDF } from './go-to-def.index-lang-edk2fdf';
import { Watcher_Lang_EDK2IDF } from './go-to-def.index-lang-edk2idf';
import { Watcher_Lang_EDK2UNI } from './go-to-def.index-lang-edk2uni';
import { Watcher_Lang_EDK2VFR } from './go-to-def.index-lang-edk2vfr';

async function DatabaseIndexing(context: vscode.ExtensionContext) {
    const startTime = performance.now();

    // Index all files for go to definition database

    const endTime = performance.now();
    console.log(`[EDK2] DatabaseIndexing: ${(endTime - startTime).toFixed(2)} ms`);
}

function DatabaseWatching(context: vscode.ExtensionContext) {
    const startTime = performance.now();

    // Watch file and index it for go to definition database
    context.subscriptions.push(
        Watcher_Lang_EDK2DEC(),
        Watcher_Lang_EDK2DSC(),
        Watcher_Lang_EDK2FDF(),
        Watcher_Lang_EDK2IDF(),
        Watcher_Lang_EDK2UNI(),
        Watcher_Lang_EDK2VFR()
    );

    const endTime = performance.now();
    console.log(`[EDK2] DatabaseWatching: ${(endTime - startTime).toFixed(2)} ms`);
}

export async function activate(context: vscode.ExtensionContext) {

    // Generic: outline view
    context.subscriptions.push(
        symbolProvider_OutlineSection(),
        symbolProvider_OutlineVarid(),
    );

    const workspace = vscode.workspace.workspaceFile;
    if (!workspace || workspace.scheme === 'untitled') {
        console.log('[EDK2] Some function of extension have been activated!');
        return;
    }

    // Must under (Workspace): Go to definition
    context.subscriptions.push(
        definitionProvider_Compiler_Flag(),
        definitionProvider_EDK2_DEFINE(),
        definitionProvider_HII_Image_Token(),
        definitionProvider_HII_String_Token(),
        definitionProvider_Module_Entry_Point(),
        definitionProvider_Pcd(),
        definitionProvider_Protocol_Ppi_Guid(),
        definitionProvider_VFR_goto_form(),
        definitionProvider_VFR_key(),
        definitionProvider_VFR_Variable_default(),
    );

    // get exclude path from .gitignore
    await initGitignorePaths();
    // Trigger path reloading whenever the root .gitignore is created or modified
    context.subscriptions.push(Watcher_GitignorePaths());

    DatabaseIndexing(context);
    DatabaseWatching(context);

    console.log('[EDK2] All function of extension have been activated!');
    //    vscode.window.showInformationMessage('[EDK2] Extension has been successfully compiled and activated!');
}

export async function deactivate() {
    console.log('[EDK2] Extension has been deactivated.');
//    vscode.window.showInformationMessage('[EDK2] Extension has been deactivated.');
}
