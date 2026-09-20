import * as vscode from 'vscode';
import { gitignorePaths, getAllowedFileExtensions} from './path-filter';

// Creates and configures the specialized EDK2 IDF file watcher.
export function Watcher_Lang_EDK2IDF(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['idf'], 'edk2dsc')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] IDF onDidChange:', uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] IDF onDidCreate:', uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] IDF onDidDelete:', uri);
    });

    return watcher;
}
