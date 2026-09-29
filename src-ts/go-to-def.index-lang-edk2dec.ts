import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';

// Creates and configures the specialized EDK2 DEC file watcher.
export function Watcher_Lang_EDK2DEC(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['dec'], 'edk2dec')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DEC onDidChange:', uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DEC onDidCreate:', uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] DEC onDidDelete:', uri);
    });

    return watcher;
}
