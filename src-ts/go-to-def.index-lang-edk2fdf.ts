import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';

// Creates and configures the specialized EDK2 FDF file watcher.
export function Watcher_Lang_EDK2FDF(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['fdf', 'fdf.inc'], 'edk2fdf')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] FDF onDidChange:', uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] FDF onDidCreate:', uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] FDF onDidDelete:', uri);
    });

    return watcher;
}
