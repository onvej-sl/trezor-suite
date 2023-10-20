export interface IMultiset<T> extends Iterable<T> {
    getMultiplicity(item: T): number;
    add(item: T): number; // returns multiplicity after addition
    remove(item: T): number; // returns multiplicity after removal
}

export class MapMultiset<T> implements IMultiset<T> {
    private readonly map: Map<T, number> = new Map();

    getMultiplicity(item: T): number {
        return this.map.get(item) ?? 0;
    }

    add(item: T): number {
        // Optimization suggestion: Both 'get' and 'set' operations perform the same search.
        const oldMultiplicity = this.map.get(item) ?? 0;
        const newMultiplicity = oldMultiplicity + 1;
        this.map.set(item, newMultiplicity);
        return newMultiplicity;
    }

    remove(item: T): number {
        // Optimization suggestion: Both 'get' and 'delete' or 'remove' operations perform the same search.
        const oldMultiplicity = this.map.get(item) ?? 0;
        if (oldMultiplicity === 0) {
            throw new Error('Item not found.');
        }

        const newMultiplicity = oldMultiplicity - 1;
        if (newMultiplicity === 0) {
            this.map.delete(item);
        } else {
            this.map.set(item, newMultiplicity);
        }
        return newMultiplicity;
    }

    *[Symbol.iterator](): Iterator<T> {
        for (const [item, multiplicity] of this.map) {
            for (let i = 0; i < multiplicity; i++) {
                yield item;
            }
        }
    }
}
