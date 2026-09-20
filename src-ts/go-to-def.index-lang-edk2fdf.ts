import * as vscode from 'vscode';
import { gitignorePaths, getAllowedFileExtensions} from './path-filter';

// Creates and configures the specialized EDK2 FDF file watcher.
export function Watcher_Lang_EDK2FDF(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['fdf', 'fdf.inc'], 'edk2dsc')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] FDF onDidChange:', uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] FDF onDidCreate:', uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] FDF onDidDelete:', uri);
    });

    return watcher;
}
