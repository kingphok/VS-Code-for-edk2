import * as vscode from 'vscode';

// Target language IDs supported for displaying Section on Oulline view
const targetLanguages_OutlineVarid = [
    { language: 'edk2vfr' }
];

// main class for Outline View
class main_Outline_Varid implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.DocumentSymbol[] {

        const symbols: vscode.DocumentSymbol[] = [];
        const varidRegex = /\b([a-zA-Z_]\w*)\b\s+varid\s*=\s*([^,\s;]+)/;

        for (let i = 0; i < document.lineCount; i++) {

            if (token.isCancellationRequested) { return []; }  // Abort processing immediately to optimize performance

            const line = document.lineAt(i);
            const match = varidRegex.exec(line.text);

            if (match && match[1] && match[2]) {
                try {
                    const keyword = match[1].trim();
                    const varidValue = match[2].trim();
                    const range = line.range;
                    const symbol = new vscode.DocumentSymbol(
                        varidValue,
                        `(${keyword})`,
                        vscode.SymbolKind.Variable,
                        range,
                        range
                        );
                    symbols.push(symbol);
                } catch (err) {
                    console.log(`[EDK2] Error processing line ${i}:`, err);
                }
            }
        }
        return symbols;
    }
}

// Register provider to handle VS Code Outline View
export function symbolProvider_OutlineVarid(): vscode.Disposable {
    return vscode.languages.registerDocumentSymbolProvider(
        targetLanguages_OutlineVarid,
        new main_Outline_Varid()
    );
}