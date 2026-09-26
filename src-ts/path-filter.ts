import * as vscode from 'vscode';

export let gitignorePaths: string[] = [];

// Reads and parses .gitignore files
export async function initGitignorePaths(): Promise<void> {
    gitignorePaths = []; // Reset the database paths snapshot on every run

    const workspaceFolders = vscode.workspace.workspaceFolders;
    // Exit early if no folder is open in the current VS Code window
    if (!workspaceFolders || workspaceFolders.length === 0) return;

    // Directly target the single root folder without any for-loop
    const rootFolder = workspaceFolders[0];
    const gitignoreUri = vscode.Uri.joinPath(rootFolder.uri, '.gitignore');

    try {
        // Read file binary content using VS Code virtual file system API
        const fileBuffer = await vscode.workspace.fs.readFile(gitignoreUri);

        // Decode the binary buffer into standard UTF-8 text string data
        const content = new TextDecoder('utf-8').decode(fileBuffer);

        // Split content into lines handling both Windows (\r\n) and Linux (\n)
        const lines = content.split(/\r?\n/).map(line => line.trim());

        for (const line of lines) {
            // Skip empty lines or comment lines starting with #
            if (!line || line.startsWith('#') || line.startsWith('!')) continue;

            let cleanPattern = line;

            // Trim leading and trailing slashes to unify relative path structure
            if (cleanPattern.startsWith('/')) cleanPattern = cleanPattern.substring(1);
            if (cleanPattern.endsWith('/')) cleanPattern = cleanPattern.slice(0, -1);

            // Strip glob wildcards to extract pure folder names for high-speed string lookup
            cleanPattern = cleanPattern.replace(/\*\*/g, '').replace(/\*/g, '');

            // Verify the parsed string is not empty and prevent duplicate patterns
            if (cleanPattern && !gitignorePaths.includes(cleanPattern)) {
                // Wrap with slashes to ensure precise folder boundary matching
                gitignorePaths.push(`/${cleanPattern}/`);
            }
        }
    } catch (err) {
        // Unexpected errors
    }
    console.log('[EDK2] Get exclude paths:', gitignorePaths);
}

// Creates and configures the root-level .gitignore system watcher.
export function Watcher_GitignorePaths(): vscode.FileSystemWatcher {
    const rootFolder = vscode.workspace.workspaceFolders![0];
    const gitignoreWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(rootFolder, '.gitignore')
    );
    gitignoreWatcher.onDidCreate(async () => await initGitignorePaths());
    gitignoreWatcher.onDidChange(async () => await initGitignorePaths());
    gitignoreWatcher.onDidDelete(async () => await initGitignorePaths());

    return gitignoreWatcher;
}

// Gets custom file associations with default file extensions.
export function getAllowedFileExtensions(
    defaultFileExtension: string[],
    langId: string
    ): string {
    const extensions = new Set<string>(defaultFileExtension);
    const associations = vscode.workspace.getConfiguration('files').get<Record<string, string>>('associations');

    if (associations) {
        for (const [pattern, associatedLangId ] of Object.entries(associations)) {
            if (associatedLangId  === langId) {
                const cleanExt = pattern.replace(/^\*\./, '');
                if (cleanExt) {
                    extensions.add(cleanExt);
                }
            }
        }
    }

    return `**/*.{${Array.from(extensions).join(',')}}`;
}
