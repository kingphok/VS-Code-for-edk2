import * as vscode from 'vscode';
import { createHash } from 'node:crypto';

// File parser layout for storing parserd result
export interface ParsedFileResult {
    pathHash: string;
    relativePath: string;
    words: string[];
    wordsWithPos: {
        word: string;
        position: {
            line: number;
            character: number;
        };
    }[];
}

// generic cache layout to storing data for go to definition(F12) function
export interface genericCacheLayout {
    version: string;
    paths: Map<string, string>;
    forward_index: Map<string, { pathHash: string; position: { line: number; character: number } }[]>;
    reverse_index: Map<string, string[]>;
}

// SHA-256 / SHA-1 Truncation）
export function hashPathSHA256_64(filePath: string): string {
    // First 16 characters (64 bits) of SHA256
    return createHash('sha256').update(filePath).digest('hex').substring(0, 16);
}

// ReadWriteLock: Promise-queue-based lock that allows multiple concurrent readers but only one exclusive writer.
class ReadWriteLock {
    private readers = 0;
    private writer = false;
    private waitingWriters: (() => void)[] = [];
    private waitingReaders: (() => void)[] = [];

    async acquireRead(): Promise<void> {
        if (this.writer || this.waitingWriters.length > 0) {
            await new Promise<void>((resolve) => this.waitingReaders.push(resolve));
        }
        this.readers++;
    }

    releaseRead(): void {
        this.readers--;
        if (this.readers === 0 && this.waitingWriters.length > 0) {
            const nextWriter = this.waitingWriters.shift();
            if (nextWriter) nextWriter();
        }
    }

    async acquireWrite(): Promise<void> {
        if (this.writer || this.readers > 0) {
            await new Promise<void>((resolve) => this.waitingWriters.push(resolve));
        }
        this.writer = true;
    }

    releaseWrite(): void {
        this.writer = false;
        if (this.waitingWriters.length > 0) {
            const nextWriter = this.waitingWriters.shift();
            if (nextWriter) nextWriter();
        } else if (this.waitingReaders.length > 0) {
            const currentReaders = this.waitingReaders.splice(0, this.waitingReaders.length);
            for (const resolve of currentReaders) {
                resolve();
            }
        }
    }
}

// DbLib: Manage database for go to definition(F12) function
export class DbLib<T extends genericCacheLayout = genericCacheLayout> {
    private cache: T;
    private lock: ReadWriteLock;

    constructor(initialCache: T) {
        this.cache = initialCache;
        this.lock = new ReadWriteLock();
    }

    async readCache<R>(reader: (cache: Readonly<T>) => R | Promise<R>): Promise<R> {
        await this.lock.acquireRead();
        try {
            return await reader(this.cache);
        } finally {
            this.lock.releaseRead();
        }
    }

    async updateCache<R>(updater: (cache: T) => R | Promise<R>): Promise<R> {
        await this.lock.acquireWrite();
        try {
            return await updater(this.cache);
        } finally {
            this.lock.releaseWrite();
        }
    }

    async initGenCache(parseResults: (ParsedFileResult | null)[]): Promise<void> {
        await this.updateCache((cache) => {
            for (const parseResult of parseResults) {
                if (!parseResult) continue;

                cache.paths.set(parseResult.pathHash, parseResult.relativePath);
                cache.reverse_index.set(parseResult.pathHash, parseResult.words);

                for (const item of parseResult.wordsWithPos) {
                    const existing = cache.forward_index.get(item.word) || [];
                    existing.push({
                        pathHash: parseResult.pathHash,
                        position: item.position
                    });
                    cache.forward_index.set(item.word, existing);
                }
            }
        });
    }

    async updateGenCache(parseResult: ParsedFileResult): Promise<void> {
        await this.updateCache((cache) => {
            // Clean up stale entries previously registered for this file
            const oldWords = cache.reverse_index.get(parseResult.pathHash) || [];
            for (const oldWord of oldWords) {
                const existing = cache.forward_index.get(oldWord);
                if (existing) {
                    const filtered = existing.filter(item => item.pathHash !== parseResult.pathHash);
                    if (filtered.length > 0) {
                        cache.forward_index.set(oldWord, filtered);
                    } else {
                        cache.forward_index.delete(oldWord);
                    }
                }
            }

            // Update paths and reverse_index
            cache.paths.set(parseResult.pathHash, parseResult.relativePath);
            cache.reverse_index.set(parseResult.pathHash, parseResult.words);

            // Group positions by word and update forward_index
            const wordToPosListMap = new Map<string, { line: number; character: number }[]>();
            for (const item of parseResult.wordsWithPos) {
                const list = wordToPosListMap.get(item.word) || [];
                list.push(item.position);
                wordToPosListMap.set(item.word, list);
            }

            for (const [word, posList] of wordToPosListMap.entries()) {
                const existing = cache.forward_index.get(word) || [];
                for (const pos of posList) {
                    existing.push({
                        pathHash: parseResult.pathHash,
                        position: pos
                    });
                }
                cache.forward_index.set(word, existing);
            }
        });
    }

    async deleteGenCache(pathHash: string): Promise<void> {
        await this.updateCache((cache) => {
            if (!cache.paths.has(pathHash)) return;

            // Get all tokens registered for this file from reverse_index
            const indexedTokens = cache.reverse_index.get(pathHash) || [];

            // Clean up forward_index
            for (const token of indexedTokens) {
                const existing = cache.forward_index.get(token);
                if (existing) {
                    const filtered = existing.filter(item => item.pathHash !== pathHash);
                    if (filtered.length > 0) {
                        cache.forward_index.set(token, filtered);
                    } else {
                        cache.forward_index.delete(token);  // Purge empty token entry
                    }
                }
            }

            // Clean up reverse_index and paths
            cache.reverse_index.delete(pathHash);
            cache.paths.delete(pathHash);
        });
    }

    exportCacheToDisk(
        targetFileName: string,
        dbVersion: string,
        dbCache: T
    ): void {
        // TODO: Implement export cache to disk
    }

    async importCacheFromDisk(
        targetFileName: string,
        dbVersion: string
    ): Promise<T | null> {
        // TODO: Implement import cache from disk
        return null;
    }
}
