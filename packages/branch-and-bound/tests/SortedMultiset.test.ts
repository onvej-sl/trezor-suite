import { RBTreeSortedMultiset } from '../src/SortedMultiset';

describe('RBTreeSortedMultiset', () => {
    it('basic operations', () => {
        const sortedMultiset = new RBTreeSortedMultiset<number>((a, b) => a - b);
        // []
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(0);
        expect(sortedMultiset.getMultiplicity(3)).toBe(0);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(null);
        expect(sortedMultiset.add(1)).toBe(1);
        // [1]
        expect(sortedMultiset.getMultiplicity(1)).toBe(1);
        expect(sortedMultiset.getMultiplicity(2)).toBe(0);
        expect(sortedMultiset.getMultiplicity(3)).toBe(0);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(1);
        expect(sortedMultiset.add(2)).toBe(1);
        // [1, 2]
        expect(sortedMultiset.getMultiplicity(1)).toBe(1);
        expect(sortedMultiset.getMultiplicity(2)).toBe(1);
        expect(sortedMultiset.getMultiplicity(3)).toBe(0);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(1);
        expect(sortedMultiset.add(3)).toBe(1);
        // [1, 2, 3]
        expect(sortedMultiset.getMultiplicity(1)).toBe(1);
        expect(sortedMultiset.getMultiplicity(2)).toBe(1);
        expect(sortedMultiset.getMultiplicity(3)).toBe(1);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(1);
        expect(sortedMultiset.add(3)).toBe(2);
        // [1, 2, 3, 3]
        expect(sortedMultiset.getMultiplicity(1)).toBe(1);
        expect(sortedMultiset.getMultiplicity(2)).toBe(1);
        expect(sortedMultiset.getMultiplicity(3)).toBe(2);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(1);
        expect(sortedMultiset.add(3)).toBe(3);
        // [1, 2, 3, 3, 3]
        expect(sortedMultiset.getMultiplicity(1)).toBe(1);
        expect(sortedMultiset.getMultiplicity(2)).toBe(1);
        expect(sortedMultiset.getMultiplicity(3)).toBe(3);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(1);
        expect(sortedMultiset.remove(1)).toBe(0);
        // [2, 3, 3, 3]
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(1);
        expect(sortedMultiset.getMultiplicity(3)).toBe(3);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(2);
        expect(sortedMultiset.add(2)).toBe(2);
        // [2, 3, 3, 3, 2]
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(2);
        expect(sortedMultiset.getMultiplicity(3)).toBe(3);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(2);
        expect(sortedMultiset.add(4)).toBe(1);
        // [2, 3, 3, 3, 2, 4]
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(2);
        expect(sortedMultiset.getMultiplicity(3)).toBe(3);
        expect(sortedMultiset.getMultiplicity(4)).toBe(1);
        expect(sortedMultiset.minimum).toBe(2);
        expect(sortedMultiset.remove(3)).toBe(2);
        // [2, 3, 3, 2, 4]
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(2);
        expect(sortedMultiset.getMultiplicity(3)).toBe(2);
        expect(sortedMultiset.getMultiplicity(4)).toBe(1);
        expect(sortedMultiset.minimum).toBe(2);
        expect(sortedMultiset.remove(3)).toBe(1);
        // [2, 3, 2, 4]
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(2);
        expect(sortedMultiset.getMultiplicity(3)).toBe(1);
        expect(sortedMultiset.getMultiplicity(4)).toBe(1);
        expect(sortedMultiset.minimum).toBe(2);
        expect(sortedMultiset.remove(2)).toBe(1);
        // [3, 2, 4]
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(1);
        expect(sortedMultiset.getMultiplicity(3)).toBe(1);
        expect(sortedMultiset.getMultiplicity(4)).toBe(1);
        expect(sortedMultiset.minimum).toBe(2);
        expect(sortedMultiset.remove(2)).toBe(0);
        // [3, 4]
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(0);
        expect(sortedMultiset.getMultiplicity(3)).toBe(1);
        expect(sortedMultiset.getMultiplicity(4)).toBe(1);
        expect(sortedMultiset.minimum).toBe(3);
        expect(sortedMultiset.remove(3)).toBe(0);
        // [4]
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(0);
        expect(sortedMultiset.getMultiplicity(3)).toBe(0);
        expect(sortedMultiset.getMultiplicity(4)).toBe(1);
        expect(sortedMultiset.minimum).toBe(4);
        expect(sortedMultiset.remove(4)).toBe(0);
        // []
        expect(sortedMultiset.getMultiplicity(1)).toBe(0);
        expect(sortedMultiset.getMultiplicity(2)).toBe(0);
        expect(sortedMultiset.getMultiplicity(3)).toBe(0);
        expect(sortedMultiset.getMultiplicity(4)).toBe(0);
        expect(sortedMultiset.minimum).toBe(null);
        expect(() => sortedMultiset.remove(1)).toThrowError('Item not found.');
    });
});
