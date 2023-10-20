import { ISetDifference } from './SetDifference';
import { MapMultiset } from './Multiset';
import { RBTreeSortedMultiset } from './SortedMultiset';

export interface IAggregator<TItem, TAggregate> {
    applyDifference: (difference: ISetDifference<TItem>) => void;
    aggregate: TAggregate; // returns an aggregate that can be mutated by the callee
    cloneAggregate(): TAggregate; // returns an aggregate that cannot be mutated by the callee
    // An aggregator implements a function f(x : List<TItem>) => TAggregate, if the following holds:
    //   * The function f doesn't depend on the order of the items in x.
    //   * The aggregator is functionally equivalent to FunctionListAggregator<TItem, TAggregate>(f), where FunctionListAggregator is defined below.
    //       class FunctionListAggregator<TItem, TAggregate> {
    //         private readonly list: Array<TItem> = [];
    //         private readonly f: (list: Array<TItem>) => TAggregate;
    //
    //         constructor(f: (list: Array<TItem>) => TAggregate) {
    //           this.f = f;
    //         }
    //
    //         applyDifference(difference: ISetDifference<TItem>) {
    //           for (const item of difference.removed) {
    //             const index = this.list.indexOf(item);
    //             if (index === -1) {
    //               // Undefined behaviour.
    //             }
    //             this.list.splice(index, 1);
    //           }
    //           for (const item of difference.added) {
    //             this.list.push(item);
    //           }
    //         }
    //
    //         get aggregate(): TAggregate {
    //           return this.f(this.list);
    //         }
    //
    //         cloneAggregate(): TAggregate {
    //           return this.f(Array.from(this.list));
    //         }
    //       }
}

export class GroupAggregator<TItem, TAggregate> implements IAggregator<TItem, TAggregate> {
    aggregate: TAggregate;

    private readonly additionFun: (aggregate: TAggregate, item: TItem) => TAggregate;
    private readonly removalFun: (aggregate: TAggregate, item: TItem) => TAggregate;
    private readonly copyFun: (aggregate: TAggregate) => TAggregate;

    constructor(
        copyFun: (aggregate: TAggregate) => TAggregate,
        additionFun: (aggregate: TAggregate, item: TItem) => TAggregate,
        removalFun: (aggregate: TAggregate, item: TItem) => TAggregate,
        initialAggregate: TAggregate,
    ) {
        this.copyFun = copyFun;
        this.additionFun = additionFun;
        this.removalFun = removalFun;
        this.aggregate = initialAggregate;
    }

    applyDifference(difference: ISetDifference<TItem>) {
        for (const item of difference.removed) {
            this.aggregate = this.removalFun(this.aggregate, item);
        }
        for (const item of difference.added) {
            this.aggregate = this.additionFun(this.aggregate, item);
        }
    }

    cloneAggregate(): TAggregate {
        return this.copyFun(this.aggregate);
    }
}

// The aggregator implements the function f(x : List<TItem>) => x.length.
export class CountAggregator<T> implements IAggregator<T, number> {
    private readonly groupAggregator = new GroupAggregator<T, number>(
        aggregate => aggregate,
        (aggregate, _) => aggregate + 1,
        (aggregate, _) => aggregate - 1,
        0,
    );

    applyDifference(difference: ISetDifference<T>) {
        this.groupAggregator.applyDifference(difference);
    }

    get aggregate(): number {
        return this.groupAggregator.aggregate;
    }

    cloneAggregate(): number {
        return this.aggregate;
    }
}

// The aggregator implements the function f(x : List<TItem>) => x.reduce((a, b) => a + b, 0).
export class SumAggregator implements IAggregator<number, number> {
    private readonly groupAggregator = new GroupAggregator<number, number>(
        aggregate => aggregate,
        (aggregate, item) => aggregate + item,
        (aggregate, item) => aggregate - item,
        0,
    );

    applyDifference(difference: ISetDifference<number>) {
        this.groupAggregator.applyDifference(difference);
    }

    get aggregate(): number {
        return this.groupAggregator.aggregate;
    }

    cloneAggregate(): number {
        return this.groupAggregator.cloneAggregate();
    }
}

// The aggregator implements the function f(x : List<TItem>) => x.length === new Set(x).size.
export class UniquenessAggregator<T> implements IAggregator<T, boolean> {
    get aggregate(): boolean {
        return this.duplicitiesCount === 0;
    }

    private duplicitiesCount = 0;
    private readonly multiset = new MapMultiset<T>();

    private add(item: T) {
        const multiplicity = this.multiset.add(item);
        if (multiplicity === 2) {
            this.duplicitiesCount += 1;
        }
    }

    private remove(item: T) {
        const multiplicity = this.multiset.remove(item);
        if (multiplicity === 1) {
            this.duplicitiesCount -= 1;
        }
    }

    applyDifference(difference: ISetDifference<T>) {
        for (const item of difference.removed) {
            this.remove(item);
        }
        for (const item of difference.added) {
            this.add(item);
        }
    }

    cloneAggregate(): boolean {
        return this.aggregate;
    }
}

// The aggregator implements the function f(x : List<TItem>) => x.reduce((a, b) => Math.min(a, b), Infinity).
export class MinimumAggregator implements IAggregator<number, number> {
    get aggregate(): number {
        return this.sortedMultiset.minimum ?? Infinity;
    }

    private readonly sortedMultiset = new RBTreeSortedMultiset<number>((a, b) => a - b);

    applyDifference(difference: ISetDifference<number>) {
        for (const item of difference.removed) {
            this.sortedMultiset.remove(item);
        }
        for (const item of difference.added) {
            this.sortedMultiset.add(item);
        }
    }

    cloneAggregate(): number {
        return this.aggregate;
    }
}

// The aggregator implements the function f(x : List<TItem>) => x.
export class ListAggregator<T> implements IAggregator<T, Array<T>> {
    aggregate: Array<T> = [];

    applyDifference(difference: ISetDifference<T>) {
        for (const item of difference.removed) {
            const index = this.aggregate.indexOf(item);
            if (index === -1) {
                throw new Error('Item not found.');
            }
            this.aggregate.splice(index, 1);
        }
        for (const item of difference.added) {
            this.aggregate.push(item);
        }
    }

    cloneAggregate(): Array<T> {
        return Array.from(this.aggregate);
    }
}
