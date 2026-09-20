import * as vscode from 'vscode';
import { gitignorePaths, getAllowedFileExtensions} from './path-filter';

// Creates and configures the specialized EDK2 DEC file watcher.
export function Watcher_Lang_EDK2DEC(): vscode.FileSystemWatcher {
    const DscExtensions = getAllowedFileExtensions (['dec'], 'edk2dsc')
    const watcher = vscode.workspace.createFileSystemWatcher(DscExtensions);

    watcher.onDidChange(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] DEC onDidChange:', uri);
    });

    watcher.onDidCreate(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] DEC onDidCreate:', uri);
    });

    watcher.onDidDelete(async (uri) => {
        if (gitignorePaths.some(pattern => uri.path.includes(pattern))) return;
        console.log('[EDK2] DEC onDidDelete:', uri);
    });

    return watcher;
}
