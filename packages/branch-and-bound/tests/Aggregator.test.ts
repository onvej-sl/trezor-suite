import {
    SumAggregator,
    UniquenessAggregator,
    MinimumAggregator,
    ListAggregator,
    CountAggregator,
} from '../src/Aggregator';

describe('CountAggregator', () => {
    it('apply difference', () => {
        const aggregator = new CountAggregator<number>();
        // []
        expect(aggregator.aggregate).toBe(0);
        aggregator.applyDifference({ added: [1], removed: [] });
        // [1]
        expect(aggregator.aggregate).toBe(1);
        aggregator.applyDifference({ added: [2, 3], removed: [] });
        // [1, 2, 3]
        expect(aggregator.aggregate).toBe(3);
        aggregator.applyDifference({ added: [3, 3], removed: [] });
        // [1, 2, 3, 3, 3 ]
        expect(aggregator.aggregate).toBe(5);
        aggregator.applyDifference({ added: [], removed: [1] });
        // [2, 3, 3, 3]
        expect(aggregator.aggregate).toBe(4);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [2, 3, 3, 3, 2]
        expect(aggregator.aggregate).toBe(5);
        aggregator.applyDifference({ added: [4], removed: [2] });
        // [3, 3, 3, 2, 4]
        expect(aggregator.aggregate).toBe(5);
        aggregator.applyDifference({ added: [], removed: [3, 3] });
        // [3, 2, 4]
        expect(aggregator.aggregate).toBe(3);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [3, 2, 4, 2]
        expect(aggregator.aggregate).toBe(4);
        aggregator.applyDifference({ added: [], removed: [2, 2] });
        // [3, 4]
        expect(aggregator.aggregate).toBe(2);
        aggregator.applyDifference({ added: [], removed: [3, 4] });
        // []
        expect(aggregator.aggregate).toBe(0);
    });

    it('clone aggregate', () => {
        const aggregator = new CountAggregator<number>();
        const aggregate = aggregator.cloneAggregate();
        expect(aggregator.aggregate).toBe(0);
        expect(aggregate).toBe(0);
        aggregator.applyDifference({ added: [1], removed: [] });
        expect(aggregator.aggregate).toBe(1);
        expect(aggregate).toBe(0);
    });
});

describe('SumAggregator', () => {
    it('apply difference', () => {
        const aggregator = new SumAggregator();
        // []
        expect(aggregator.aggregate).toBe(0);
        aggregator.applyDifference({ added: [1], removed: [] });
        // [1]
        expect(aggregator.aggregate).toBe(1);
        aggregator.applyDifference({ added: [2, 3], removed: [] });
        // [1, 2, 3]
        expect(aggregator.aggregate).toBe(6);
        aggregator.applyDifference({ added: [3, 3], removed: [] });
        // [1, 2, 3, 3, 3 ]
        expect(aggregator.aggregate).toBe(12);
        aggregator.applyDifference({ added: [], removed: [1] });
        // [2, 3, 3, 3]
        expect(aggregator.aggregate).toBe(11);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [2, 3, 3, 3, 2]
        expect(aggregator.aggregate).toBe(13);
        aggregator.applyDifference({ added: [4], removed: [2] });
        // [3, 3, 3, 2, 4]
        expect(aggregator.aggregate).toBe(15);
        aggregator.applyDifference({ added: [], removed: [3, 3] });
        // [3, 2, 4]
        expect(aggregator.aggregate).toBe(9);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [3, 2, 4, 2]
        expect(aggregator.aggregate).toBe(11);
        aggregator.applyDifference({ added: [], removed: [2, 2] });
        // [3, 4]
        expect(aggregator.aggregate).toBe(7);
        aggregator.applyDifference({ added: [], removed: [3, 4] });
        // []
        expect(aggregator.aggregate).toBe(0);
    });

    it('clone aggregate', () => {
        const aggregator = new SumAggregator();
        const aggregate = aggregator.cloneAggregate();
        expect(aggregator.aggregate).toBe(0);
        expect(aggregate).toBe(0);
        aggregator.applyDifference({ added: [1], removed: [] });
        expect(aggregator.aggregate).toBe(1);
        expect(aggregate).toBe(0);
    });
});

describe('UniquenessAggregator', () => {
    it('apply difference', () => {
        const aggregator = new UniquenessAggregator();
        // []
        expect(aggregator.aggregate).toBe(true);
        aggregator.applyDifference({ added: [1], removed: [] });
        // [1]
        expect(aggregator.aggregate).toBe(true);
        aggregator.applyDifference({ added: [2, 3], removed: [] });
        // [1, 2, 3]
        expect(aggregator.aggregate).toBe(true);
        aggregator.applyDifference({ added: [3, 3], removed: [] });
        // [1, 2, 3, 3, 3 ]
        expect(aggregator.aggregate).toBe(false);
        aggregator.applyDifference({ added: [], removed: [1] });
        // [2, 3, 3, 3]
        expect(aggregator.aggregate).toBe(false);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [2, 3, 3, 3, 2]
        expect(aggregator.aggregate).toBe(false);
        aggregator.applyDifference({ added: [4], removed: [2] });
        // [3, 3, 3, 2, 4]
        expect(aggregator.aggregate).toBe(false);
        aggregator.applyDifference({ added: [], removed: [3, 3] });
        // [3, 2, 4]
        expect(aggregator.aggregate).toBe(true);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [3, 2, 4, 2]
        expect(aggregator.aggregate).toBe(false);
        aggregator.applyDifference({ added: [], removed: [2, 2] });
        // [3, 4]
        expect(aggregator.aggregate).toBe(true);
        aggregator.applyDifference({ added: [], removed: [3, 4] });
        // []
        expect(aggregator.aggregate).toBe(true);
    });

    it('clone aggregate', () => {
        const aggregator = new UniquenessAggregator();
        const aggregate = aggregator.cloneAggregate();
        expect(aggregator.aggregate).toBe(true);
        expect(aggregate).toBe(true);
        aggregator.applyDifference({ added: [1, 1], removed: [] });
        expect(aggregator.aggregate).toBe(false);
        expect(aggregate).toBe(true);
    });
});

describe('MinimumAggregator', () => {
    it('apply difference', () => {
        const aggregator = new MinimumAggregator();
        // []
        expect(aggregator.aggregate).toBe(Infinity);
        aggregator.applyDifference({ added: [1], removed: [] });
        // [1]
        expect(aggregator.aggregate).toBe(1);
        aggregator.applyDifference({ added: [2, 3], removed: [] });
        // [1, 2, 3]
        expect(aggregator.aggregate).toBe(1);
        aggregator.applyDifference({ added: [3, 3], removed: [] });
        // [1, 2, 3, 3, 3 ]
        expect(aggregator.aggregate).toBe(1);
        aggregator.applyDifference({ added: [], removed: [1] });
        // [2, 3, 3, 3]
        expect(aggregator.aggregate).toBe(2);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [2, 3, 3, 3, 2]
        expect(aggregator.aggregate).toBe(2);
        aggregator.applyDifference({ added: [4], removed: [2] });
        // [3, 3, 3, 2, 4]
        expect(aggregator.aggregate).toBe(2);
        aggregator.applyDifference({ added: [], removed: [3, 3] });
        // [3, 2, 4]
        expect(aggregator.aggregate).toBe(2);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [3, 2, 4, 2]
        expect(aggregator.aggregate).toBe(2);
        aggregator.applyDifference({ added: [], removed: [2, 2] });
        // [3, 4]
        expect(aggregator.aggregate).toBe(3);
        aggregator.applyDifference({ added: [], removed: [3, 4] });
        // []
        expect(aggregator.aggregate).toBe(Infinity);
    });

    it('clone aggregate', () => {
        const aggregator = new MinimumAggregator();
        const aggregate = aggregator.cloneAggregate();
        expect(aggregator.aggregate).toBe(Infinity);
        expect(aggregate).toBe(Infinity);
        aggregator.applyDifference({ added: [1], removed: [] });
        expect(aggregator.aggregate).toBe(1);
        expect(aggregate).toBe(Infinity);
    });
});

describe('ListAggregator', () => {
    it('apply difference', () => {
        const aggregator = new ListAggregator<number>();
        // []
        expect(aggregator.aggregate).toStrictEqual([]);
        aggregator.applyDifference({ added: [1], removed: [] });
        // [1]
        expect(aggregator.aggregate).toStrictEqual([1]);
        aggregator.applyDifference({ added: [2, 3], removed: [] });
        // [1, 2, 3]
        expect(aggregator.aggregate).toStrictEqual([1, 2, 3]);
        aggregator.applyDifference({ added: [3, 3], removed: [] });
        // [1, 2, 3, 3, 3 ]
        expect(aggregator.aggregate).toStrictEqual([1, 2, 3, 3, 3]);
        aggregator.applyDifference({ added: [], removed: [1] });
        // [2, 3, 3, 3]
        expect(aggregator.aggregate).toStrictEqual([2, 3, 3, 3]);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [2, 3, 3, 3, 2]
        expect(aggregator.aggregate).toStrictEqual([2, 3, 3, 3, 2]);
        aggregator.applyDifference({ added: [4], removed: [2] });
        // [3, 3, 3, 2, 4]
        expect(aggregator.aggregate).toStrictEqual([3, 3, 3, 2, 4]);
        aggregator.applyDifference({ added: [], removed: [3, 3] });
        // [3, 2, 4]
        expect(aggregator.aggregate).toStrictEqual([3, 2, 4]);
        aggregator.applyDifference({ added: [2], removed: [] });
        // [3, 2, 4, 2]
        expect(aggregator.aggregate).toStrictEqual([3, 2, 4, 2]);
        aggregator.applyDifference({ added: [], removed: [2, 2] });
        // [3, 4]
        expect(aggregator.aggregate).toStrictEqual([3, 4]);
        aggregator.applyDifference({ added: [], removed: [3, 4] });
        // []
        expect(aggregator.aggregate).toStrictEqual([]);
    });

    it('clone aggregate', () => {
        const aggregator = new ListAggregator<number>();
        const aggregate = aggregator.cloneAggregate();
        expect(aggregator.aggregate).toStrictEqual([]);
        expect(aggregate).toStrictEqual([]);
        aggregator.applyDifference({ added: [1], removed: [] });
        expect(aggregator.aggregate).toStrictEqual([1]);
        expect(aggregate).toStrictEqual([]);
    });
});
