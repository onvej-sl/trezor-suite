import { subsetTreeDifferentialIterator } from '../src/SetDifference';

describe('subsetTreeDifferentialIterator', () => {
    it('iterate through [1, 2, 3]', () => {
        const length = 3;
        const items = Array.from({ length }, (_, i) => i + 1);
        const iterator = subsetTreeDifferentialIterator(items);

        // lowerBound: [], upperBound: []
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [] },
                upperBound: { added: [1, 2, 3], removed: [] },
            },
        });
        // lowerBound: [], upperBound: [1, 2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [1], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [1], upperBound: [1, 2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [2], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [1, 2], upperBound: [1, 2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [3], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [1, 2, 3], upperBound: [1, 2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [3] },
                upperBound: { added: [], removed: [3] },
            },
        });
        // lowerBound: [1, 2], upperBound: [1, 2]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [2] },
                upperBound: { added: [3], removed: [2] },
            },
        });
        // lowerBound: [1], upperBound: [1, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [3], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [1, 3], upperBound: [1, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [3] },
                upperBound: { added: [], removed: [3] },
            },
        });
        // lowerBound: [1], upperBound: [1]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [1] },
                upperBound: { added: [2, 3], removed: [1] },
            },
        });
        // lowerBound: [], upperBound: [2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [2], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [2], upperBound: [2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [3], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [2, 3], upperBound: [2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [3] },
                upperBound: { added: [], removed: [3] },
            },
        });
        // lowerBound: [2], upperBound: [2]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [2] },
                upperBound: { added: [3], removed: [2] },
            },
        });
        // lowerBound: [], upperBound: [3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [3], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [3], upperBound: [3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [3] },
                upperBound: { added: [], removed: [3] },
            },
        });
        // lowerBound: [], upperBound: []

        expect(iterator.next()).toEqual({ done: true, value: null });
    });

    it('iterate through [1, 2, 3] with skipping', () => {
        const length = 3;
        const items = Array.from({ length }, (_, i) => i + 1);
        const iterator = subsetTreeDifferentialIterator(items);

        // lowerBound: [], upperBound: []
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [] },
                upperBound: { added: [1, 2, 3], removed: [] },
            },
        });
        // lowerBound: [], upperBound: [1, 2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [1], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [1], upperBound: [1, 2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [2], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [1, 2], upperBound: [1, 2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [3], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [1, 2, 3], upperBound: [1, 2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [3] },
                upperBound: { added: [], removed: [3] },
            },
        });
        // lowerBound: [1, 2], upperBound: [1, 2]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [2] },
                upperBound: { added: [3], removed: [2] },
            },
        });
        // lowerBound: [1], upperBound: [1, 3]
        iterator.skipBranch();
        // skipping lowerBound: [1, 3], upperBound: [1, 3]
        // skipping lowerBound: [1], upperBound: [1]
        // skipping lowerBound: [], upperBound: [2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [1] },
                upperBound: { added: [2], removed: [1] },
            },
        });
        // lowerBound: [], upperBound: [2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [2], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [2], upperBound: [2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [3], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [2, 3], upperBound: [2, 3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [3] },
                upperBound: { added: [], removed: [3] },
            },
        });
        // lowerBound: [2], upperBound: [2]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [2] },
                upperBound: { added: [3], removed: [2] },
            },
        });
        // lowerBound: [], upperBound: [3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [3], removed: [] },
                upperBound: { added: [], removed: [] },
            },
        });
        // lowerBound: [3], upperBound: [3]
        expect(iterator.next()).toEqual({
            done: false,
            value: {
                lowerBound: { added: [], removed: [3] },
                upperBound: { added: [], removed: [3] },
            },
        });
        // lowerBound: [], upperBound: []
    });
});
