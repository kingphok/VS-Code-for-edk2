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
        symbolProvider_OutlineVarid(),
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

    DatabaseIndexing(context);
    DatabaseWatching(context);

    //    vscode.window.showInformationMessage('[EDK2] Extension has been successfully compiled and activated!');
}

export function deactivate() {
    console.log('[EDK2] Extension has been deactivated.');
//    vscode.window.showInformationMessage('[EDK2] Extension has been deactivated.');
}
