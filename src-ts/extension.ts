import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('[EDK2] Extension has been successfully compiled and activated!');
//    vscode.window.showInformationMessage('[EDK2] Extension has been successfully compiled and activated!');

    // Target language IDs supported by this extension
    const targetLanguages = [
        { language: 'edk2inf' },
        { language: 'edk2dec' },
        { language: 'edk2dsc' },
        { language: 'edk2fdf' }
    ];

    // Register provider to handle VS Code Outline View
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(targetLanguages, {
        provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
            const symbols: vscode.DocumentSymbol[] = [];
            const text = document.getText();

            // Regex to capture EDK2 section headers like [Defines] or [Components]
            const sectionRegex = /^\[([\w\.,\s]+)\]/gm;
            const matches: { name: string; index: number; length: number }[] = [];
            let match;

            // Find all matching sections and store their positions
            while ((match = sectionRegex.exec(text)) !== null) {
                matches.push({
                    name: match[1].trim(),
                    index: match.index,
                    length: match[0].length
                });
            }

            // Process each section to define its scope and appearance
            for (let i = 0; i < matches.length; i++) {
                const current = matches[i];
                const startPos = document.positionAt(current.index);
                let endPos;

                // Set section end to the end of file or the start of the next section
                if (i === matches.length - 1) {
                    endPos = document.lineAt(document.lineCount - 1).range.end;
                } else {
                    endPos = document.positionAt(matches[i + 1].index);
                }

                // Range of the entire section for outline tracking
                const fullRange = new vscode.Range(startPos, endPos);
                // Focus target line when user clicks the item in Outline
                const selectionRange = new vscode.Range(startPos, document.positionAt(current.index + current.length));
                // Formatted display name for the Outline entry
                const displayName = `[${current.name}]`;
                // Create an outline entry that manages display text, icons, and cursor synchronization ranges
                const symbol = new vscode.DocumentSymbol(displayName, '', vscode.SymbolKind.Field, fullRange, selectionRange);
                // Add the configured symbol to the final list for outline rendering
                symbols.push(symbol);
            }

            return symbols;
        }
    });

    context.subscriptions.push(symbolProvider);
}

export function deactivate() {
    console.log('[EDK2] Extension has been deactivated.');
//    vscode.window.showInformationMessage('[EDK2] Extension has been deactivated.');
}
