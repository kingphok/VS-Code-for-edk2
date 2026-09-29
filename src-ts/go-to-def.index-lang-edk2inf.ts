import * as vscode from 'vscode';
import { isGitIgnorePath, getAllowedFileExtensions} from './path-filter';

// Creates and configures the specialized EDK2 INF file watcher.
export function Watcher_Lang_EDK2INF(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['inf'], 'edk2inf')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] INF onDidChange:', uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] INF onDidCreate:', uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (isGitIgnorePath(uri)) return;
        console.log('[EDK2] INF onDidDelete:', uri);
    });

    return watcher;
}
