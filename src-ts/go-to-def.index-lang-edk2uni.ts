import * as vscode from 'vscode';
import { gitignorePaths, getAllowedFileExtensions} from './path-filter';

// Creates and configures the specialized EDK2 UNI file watcher.
export function Watcher_Lang_EDK2UNI(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['uni', 'UNI'], 'edk2dsc')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] UNI onDidChange:', uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] UNI onDidCreate:', uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] UNI onDidDelete:', uri);
    });

    return watcher;
}
