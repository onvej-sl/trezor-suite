import {
    first,
    remove,
    set,
    get,
    empty,
    iterateFromFirst,
    RedBlackTreeStructure,
} from '@collectable/red-black-tree';

import { IMultiset } from './Multiset';

export interface ISortedMultiset<T> extends IMultiset<T> {
    minimum: T | null; // returs null if the multiset is empty
}

export class RBTreeSortedMultiset<T> implements ISortedMultiset<T> {
    private readonly tree: RedBlackTreeStructure<T, number>;

    constructor(comparator: (a: T, b: T) => number) {
        this.tree = empty(comparator, true);
    }

    getMultiplicity(item: T): number {
        return get(item, this.tree) ?? 0;
    }

    add(item: T): number {
        // Average time complexity is O(log n) where n is the number of unique items in the multiset.
        // Optimization suggestion: Both 'get' and 'set' operations perform the same search. It would be more efficient to use the 'update' function.
        const oldMultiplicity = get(item, this.tree) ?? 0;
        const newMultiplicity = oldMultiplicity + 1;
        set(item, newMultiplicity, this.tree);
        return newMultiplicity;
    }

    remove(item: T): number {
        // Average time complexity is O(log n) where n is the number of unique items in the multiset.
        // Optimization suggestion: Both 'get' and 'remove' or 'set' operations perform the same search. It would be more efficient to use the 'update' function.
        const oldMultiplicity = get(item, this.tree) ?? 0;
        if (oldMultiplicity === 0) {
            throw new Error('Item not found.');
        }

        const newMultiplicity = oldMultiplicity - 1;
        if (newMultiplicity === 0) {
            remove(item, this.tree);
        } else {
            set(item, newMultiplicity, this.tree);
        }
        return newMultiplicity;
    }

    get minimum(): T | null {
        // Average time complexity is O(log n) where n is the number of unique items in the multiset.
        const item = first(this.tree);
        if (item === undefined) {
            return null;
        }
        return item.key;
    }

    *[Symbol.iterator](): IterableIterator<T> {
        for (const item of iterateFromFirst(this.tree)) {
            for (let i = 0; i < item.value; i++) {
                yield item.key;
            }
        }
    }
}
