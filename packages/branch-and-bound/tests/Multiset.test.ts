import { MapMultiset } from '../src/Multiset';

describe('MapMultiset', () => {
    it('basic operations', () => {
        const multiset = new MapMultiset<number>();
        // []
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(0);
        expect(multiset.getMultiplicity(3)).toBe(0);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(multiset.add(1)).toBe(1);
        // [1]
        expect(multiset.getMultiplicity(1)).toBe(1);
        expect(multiset.getMultiplicity(2)).toBe(0);
        expect(multiset.getMultiplicity(3)).toBe(0);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(multiset.add(2)).toBe(1);
        // [1, 2]
        expect(multiset.getMultiplicity(1)).toBe(1);
        expect(multiset.getMultiplicity(2)).toBe(1);
        expect(multiset.getMultiplicity(3)).toBe(0);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(multiset.add(3)).toBe(1);
        // [1, 2, 3]
        expect(multiset.getMultiplicity(1)).toBe(1);
        expect(multiset.getMultiplicity(2)).toBe(1);
        expect(multiset.getMultiplicity(3)).toBe(1);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(multiset.add(3)).toBe(2);
        // [1, 2, 3, 3]
        expect(multiset.getMultiplicity(1)).toBe(1);
        expect(multiset.getMultiplicity(2)).toBe(1);
        expect(multiset.getMultiplicity(3)).toBe(2);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(multiset.add(3)).toBe(3);
        // [1, 2, 3, 3, 3]
        expect(multiset.getMultiplicity(1)).toBe(1);
        expect(multiset.getMultiplicity(2)).toBe(1);
        expect(multiset.getMultiplicity(3)).toBe(3);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(multiset.remove(1)).toBe(0);
        // [2, 3, 3, 3]
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(1);
        expect(multiset.getMultiplicity(3)).toBe(3);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(multiset.add(2)).toBe(2);
        // [2, 3, 3, 3, 2]
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(2);
        expect(multiset.getMultiplicity(3)).toBe(3);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(multiset.add(4)).toBe(1);
        // [2, 3, 3, 3, 2, 4]
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(2);
        expect(multiset.getMultiplicity(3)).toBe(3);
        expect(multiset.getMultiplicity(4)).toBe(1);
        expect(multiset.remove(3)).toBe(2);
        // [2, 3, 3, 2, 4]
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(2);
        expect(multiset.getMultiplicity(3)).toBe(2);
        expect(multiset.getMultiplicity(4)).toBe(1);
        expect(multiset.remove(3)).toBe(1);
        // [2, 3, 2, 4]
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(2);
        expect(multiset.getMultiplicity(3)).toBe(1);
        expect(multiset.getMultiplicity(4)).toBe(1);
        expect(multiset.remove(2)).toBe(1);
        // [3, 2, 4]
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(1);
        expect(multiset.getMultiplicity(3)).toBe(1);
        expect(multiset.getMultiplicity(4)).toBe(1);
        expect(multiset.remove(2)).toBe(0);
        // [3, 4]
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(0);
        expect(multiset.getMultiplicity(3)).toBe(1);
        expect(multiset.getMultiplicity(4)).toBe(1);
        expect(multiset.remove(3)).toBe(0);
        // [4]
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(0);
        expect(multiset.getMultiplicity(3)).toBe(0);
        expect(multiset.getMultiplicity(4)).toBe(1);
        expect(multiset.remove(4)).toBe(0);
        // []
        expect(multiset.getMultiplicity(1)).toBe(0);
        expect(multiset.getMultiplicity(2)).toBe(0);
        expect(multiset.getMultiplicity(3)).toBe(0);
        expect(multiset.getMultiplicity(4)).toBe(0);
        expect(() => multiset.remove(1)).toThrowError('Item not found');
    });
});
