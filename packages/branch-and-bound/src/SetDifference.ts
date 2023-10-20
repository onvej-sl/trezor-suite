export interface ISetDifference<T> {
    readonly added: ReadonlyArray<T>;
    readonly removed: ReadonlyArray<T>;
}

export interface ISetIntervalDifference<T> {
    readonly lowerBound: ISetDifference<T>;
    readonly upperBound: ISetDifference<T>;
}

export interface SubsetTreeDifferentialIterator<T> extends Iterator<ISetIntervalDifference<T>> {
    skipBranch(): void;
}

export class SubsetTreeTraversalIterator<T> implements SubsetTreeDifferentialIterator<T> {
    private items: ReadonlyArray<T>;
    private index: number;
    private flags: Array<boolean>;
    private skipNext: boolean;

    constructor(items: Iterable<T>) {
        this.index = -2;
        this.items = Array.from(items);
        this.flags = new Array<boolean>(this.items.length);
        for (let i = 0; i < this.items.length; i++) {
            this.flags[i] = false;
        }
        this.skipNext = false;
    }

    private backtrack(): IteratorResult<ISetIntervalDifference<T>> {
        const oldIndex = this.index;
        for (;;) {
            if (this.index === -1) {
                return { value: null, done: true };
            }
            if (this.flags[this.index] === true) {
                break;
            }
            this.index--;
        }

        this.flags[this.index] = false;

        const lowerBoundRemoved: Array<T> = [this.items[this.index]];
        const upperBoundRemoved: Array<T> = [this.items[this.index]];

        const upperBoundAdded: Array<T> = [];
        for (let i = this.index + 1; i < oldIndex; i++) {
            upperBoundAdded.push(this.items[i]);
        }

        return {
            value: {
                lowerBound: { added: [], removed: lowerBoundRemoved },
                upperBound: { added: upperBoundAdded, removed: upperBoundRemoved },
            },
            done: false,
        };
    }

    next(): IteratorResult<ISetIntervalDifference<T>> {
        if (this.index === -2) {
            this.index += 1;
            return {
                value: {
                    lowerBound: { added: [], removed: [] },
                    upperBound: { added: Array.from(this.items), removed: [] },
                },
                done: false,
            };
        }

        this.index++;

        if (this.index === this.items.length || this.skipNext === true) {
            this.skipNext = false;
            return this.backtrack();
        }

        this.flags[this.index] = true;
        return {
            value: {
                lowerBound: { added: [this.items[this.index]], removed: [] },
                upperBound: { added: [], removed: [] },
            },
            done: false,
        };
    }

    skipBranch(): void {
        this.skipNext = true;
    }
}

export function subsetTreeDifferentialIterator<T>(
    items: ReadonlyArray<T>,
): SubsetTreeDifferentialIterator<T> {
    return new SubsetTreeTraversalIterator<T>(items);
}
