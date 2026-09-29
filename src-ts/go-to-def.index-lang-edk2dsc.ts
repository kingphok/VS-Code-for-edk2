import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';

// Creates and configures the specialized EDK2 DSC file watcher.
export function Watcher_Lang_EDK2DSC(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['dsc', 'dsc.inc', 'template'], 'edk2dsc')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DSC onDidChange:', uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DSC onDidCreate:', uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DSC onDidDelete:', uri);
    });

    return watcher;
}
