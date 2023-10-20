import { branchAndBound, CriterionType } from '../src/branchAndBound';
import { branchAndBoundRecursive } from './branchAndBoundRecursive';
import { SumAggregator, CountAggregator, IAggregator } from '../src/Aggregator';
import { ISetDifference } from '../src/SetDifference';

describe('branchAndBound', () => {
    it('selected items are not subset of available items', () => {
        const fun = () =>
            branchAndBound<number, number>(
                () => new CountAggregator(),
                [1, 1],
                [1],
                [],
                { type: CriterionType.NONE, metric: (x: number, y: number) => x - y },
                null,
                null,
                null,
            );
        expect(fun).toThrowError('The selected items are not a subset of the available items.');
    });

    it('selected items are not subset of initial selection', () => {
        const fun = () =>
            branchAndBound<number, number>(
                () => new CountAggregator(),
                [1, 1],
                [1, 1],
                [],
                { type: CriterionType.NONE, metric: (x: number, y: number) => x - y },
                [1],
                null,
                null,
            );
        expect(fun).toThrowError('The selected items are not a subset of the initial selection.');
    });

    it('initial selection is not subset of available items', () => {
        const fun = () =>
            branchAndBound<number, number>(
                () => new CountAggregator(),
                [],
                [1],
                [],
                { type: CriterionType.NONE, metric: (x: number, y: number) => x - y },
                [1, 1],
                null,
                null,
            );
        expect(fun).toThrowError('The initial selection is not a subset of the available items.');
    });

    it('initial selection does not satisfy all criteria', () => {
        const fun = () =>
            branchAndBound<number, number>(
                () => new CountAggregator(),
                [],
                [],
                [{ type: CriterionType.NONE, criterion: (x: number) => x > 0 }],
                { type: CriterionType.NONE, metric: (x: number, y: number) => x - y },
                [],
                null,
                null,
            );
        expect(fun).toThrowError('The initial selection does not satisfy all the criteria.');
    });

    it('initial selection', () => {
        const result = branchAndBound<number, number>(
            () => new CountAggregator(),
            [],
            [1, 2, 3, 4],
            [],
            { type: CriterionType.INCREASING, metric: (x: number, y: number) => x - y },
            [1, 2, 3, 4],
            null,
            null,
        );
        expect(result.maximum).not.toBeNull();
        expect(result.iterations).toBe(1);
    });

    interface ISubsetSumAggregate {
        sum: number;
        count: number;
    }

    class SubsetSumAggregator implements IAggregator<number, ISubsetSumAggregate> {
        private readonly sumAggregator = new SumAggregator();
        private readonly countAggregator = new CountAggregator();

        applyDifference(difference: ISetDifference<number>) {
            this.sumAggregator.applyDifference(difference);
            this.countAggregator.applyDifference(difference);
        }

        get aggregate(): ISubsetSumAggregate {
            return { sum: this.sumAggregator.aggregate, count: this.countAggregator.aggregate };
        }

        cloneAggregate(): ISubsetSumAggregate {
            return { sum: this.sumAggregator.aggregate, count: this.countAggregator.aggregate };
        }
    }

    it('subset sum', () => {
        const items = [
            24600895, 23168867, 30067374, 36073729, 55253382, 30875393, 23257361, 42739134,
            61733225, 55568444, 33623539, 39714254, 55375842, 231242, 58621145, 24916547, 54548702,
            20774635, 42180965, 5781915, 65692675, 66727477, 30241524, 38100777, 8044008, 27862473,
            0,
        ];
        const targetSum = 574760601;

        const result = branchAndBound<number, ISubsetSumAggregate>(
            () => new SubsetSumAggregator(),
            [],
            items,
            [
                {
                    type: CriterionType.INCREASING,
                    criterion: (x: ISubsetSumAggregate) => x.sum >= targetSum,
                },
                {
                    type: CriterionType.DECREASING,
                    criterion: (x: ISubsetSumAggregate) => x.sum <= targetSum,
                },
            ],
            {
                type: CriterionType.DECREASING,
                metric: (x: ISubsetSumAggregate, y: ISubsetSumAggregate) => y.count - x.count,
            },
            null,
            (x: number, y: number) => x - y,
            null,
        );

        expect(result.maximum).not.toBeNull();
        expect(result.maximum!.reduce((a, b) => a + b, 0)).toBe(targetSum);
        expect(result.maximum).toEqual([
            66727477, 61733225, 55568444, 55375842, 42739134, 42180965, 39714254, 36073729,
            33623539, 30875393, 30067374, 27862473, 23168867, 20774635, 8044008, 231242,
        ]);
        expect(result.iterations).toBe(1896047);
    });
});

describe('branchAndBoundRecursiveRecursive', () => {
    it('selected items are not subset of available items', () => {
        const fun = () =>
            branchAndBoundRecursive<number, number>(
                (x: ReadonlyArray<number>) => x.length,
                [1, 1],
                [1],
                [],
                { type: CriterionType.NONE, metric: (x: number, y: number) => x - y },
                null,
                null,
                null,
            );
        expect(fun).toThrowError('The selected items are not a subset of the available items.');
    });

    it('selected items are not subset of initial selection', () => {
        const fun = () =>
            branchAndBoundRecursive<number, number>(
                (x: ReadonlyArray<number>) => x.length,
                [1, 1],
                [1, 1],
                [],
                { type: CriterionType.NONE, metric: (x: number, y: number) => x - y },
                [1],
                null,
                null,
            );
        expect(fun).toThrowError('The selected items are not a subset of the initial selection.');
    });

    it('initial selection is not subset of available items', () => {
        const fun = () =>
            branchAndBoundRecursive<number, number>(
                (x: ReadonlyArray<number>) => x.length,
                [],
                [1],
                [],
                { type: CriterionType.NONE, metric: (x: number, y: number) => x - y },
                [1, 1],
                null,
                null,
            );
        expect(fun).toThrowError('The initial selection is not a subset of the available items.');
    });

    it('initial selection does not satisfy all criteria', () => {
        const fun = () =>
            branchAndBoundRecursive<number, number>(
                (x: ReadonlyArray<number>) => x.length,
                [],
                [],
                [{ type: CriterionType.NONE, criterion: (x: number) => x > 0 }],
                { type: CriterionType.NONE, metric: (x: number, y: number) => x - y },
                [],
                null,
                null,
            );
        expect(fun).toThrowError('The initial selection does not satisfy all the criteria.');
    });

    it('initial selection', () => {
        const result = branchAndBoundRecursive<number, number>(
            (x: ReadonlyArray<number>) => x.length,
            [],
            [1, 2, 3, 4],
            [],
            { type: CriterionType.INCREASING, metric: (x: number, y: number) => x - y },
            [1, 2, 3, 4],
            null,
            null,
        );
        expect(result.maximum).not.toBeNull();
        expect(result.iterations).toBe(1);
    });

    interface ISubsetSumAggregate {
        sum: number;
        count: number;
    }

    function subsetSumAggregateFun(x: ReadonlyArray<number>): ISubsetSumAggregate {
        return { sum: x.reduce((a, b) => a + b, 0), count: x.length };
    }

    it('subset sum', () => {
        const items = [
            24600895, 23168867, 30067374, 36073729, 55253382, 30875393, 23257361, 42739134,
            61733225, 55568444, 33623539, 39714254, 55375842, 231242, 58621145, 24916547, 54548702,
            20774635, 42180965, 5781915, 65692675, 66727477, 30241524, 38100777, 8044008, 27862473,
            0,
        ];
        const targetSum = 574760601;

        const result = branchAndBoundRecursive<number, ISubsetSumAggregate>(
            subsetSumAggregateFun,
            [],
            items,
            [
                {
                    type: CriterionType.INCREASING,
                    criterion: (x: ISubsetSumAggregate) => x.sum >= targetSum,
                },
                {
                    type: CriterionType.DECREASING,
                    criterion: (x: ISubsetSumAggregate) => x.sum <= targetSum,
                },
            ],
            {
                type: CriterionType.DECREASING,
                metric: (x: ISubsetSumAggregate, y: ISubsetSumAggregate) => y.count - x.count,
            },
            null,
            (x: number, y: number) => x - y,
            null,
        );

        expect(result.maximum).not.toBeNull();
        expect(result.maximum!.reduce((a, b) => a + b, 0)).toBe(targetSum);
        expect(result.maximum).toEqual([
            66727477, 61733225, 55568444, 55375842, 42739134, 42180965, 39714254, 36073729,
            33623539, 30875393, 30067374, 27862473, 23168867, 20774635, 8044008, 231242,
        ]);
        expect(result.iterations).toBe(1896047);
    });
});
