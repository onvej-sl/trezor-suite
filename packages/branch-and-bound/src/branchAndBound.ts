import { SubsetTreeTraversalIterator } from './SetDifference';
import { IAggregator, ListAggregator, CountAggregator } from './Aggregator';

export enum CriterionType {
    NONE,
    INCREASING,
    DECREASING,
    // See the definition of ITypedMetric and ITypedCriterion for the meaning of increasing and decreasing.
}

export enum MetricResult {
    FIRST_IS_BETTER = 1,
    EQUAL = 0,
    SECOND_IS_BETTER = -1,
}

export type Metric<T> = (x: T, y: T) => MetricResult;
// A metric has to be:
//   * Anti-symmetric, that is for every x and y the following holds true: metric(x, y) = FIRST_IS_GREATER if and only if metric(y, x) = SECOND_IS_GREATER.
//   * Transitive, that is for every x, y and z the following holds true: If metric(x, y) = FIRST_IS_GREATER and metric(y, z) = FIRST_IS_GREATER, then metric(x, z) = FIRST_IS_GREATER.

export interface ITypedMetric<T> {
    readonly type: CriterionType;
    readonly metric: Metric<T>;
    // A metric is increasing (with respect to inclusion) if for all sets A and B the following holds true: If A is a subset of B, then metric(A, B) = SECOND_IS_GREATER.
    // A metric is decreasing (with respect to inclusion) if for all sets A and B the following holds true: If A is a subset of B, then metric(A, B) = FIRST_IS_GREATER.
}

export type Criterion<T> = (x: T) => boolean;
export interface ITypedCriterion<T> {
    readonly type: CriterionType;
    readonly criterion: Criterion<T>;
    // A criterion is increasing (with respect to inclusion) if for all sets A and B the following holds true: If A is a subset of B and criterion(A) is true, then criterion(B) is also true.
    // A criterion is decreasing (with respect to inclusion) if for all sets A and B the following holds true: If A is a subset of B and criterion(B) is false, then criterion(A) is also false.
}

export type GeneralizedCriterion<T> = (x: T, bestX: T | null) => boolean;
export interface ITypedGeneralizedCriterion<T> {
    readonly type: CriterionType;
    readonly generalizedCriterion: GeneralizedCriterion<T>;
    //  The generalized criterion is a generalization of both the criterion and the metric:
    //    * criterion(x) is equivalent to generalizedCriterion(x, null)
    //    * metric(x, y) is equivalent to generalizedCriterion(x, y)
}

export interface IBranchAndBoundResult<T> {
    maximum: T | null;
    iterations: number;
    isOptimum: boolean;
}

export function isMultiSubset<T>(subset: Iterable<T>, set: Iterable<T>): boolean {
    const map = new Map<T, number>();
    for (const item of set) {
        const count = map.get(item) ?? 0;
        map.set(item, count + 1);
    }
    for (const item of subset) {
        const count = map.get(item) ?? 0;
        if (count === 0) {
            return false;
        }
        map.set(item, count - 1);
    }
    return true;
}

export function branchAndBoundInner<TItem, TAggregate>(
    aggregatorGenerator: () => IAggregator<TItem, TAggregate>,
    availableItems: Iterable<TItem>,
    typedCriteria: Iterable<ITypedGeneralizedCriterion<TAggregate>>,
    maximumIterations: number | null,
): IBranchAndBoundResult<ReadonlyArray<TItem>> {
    const increasingCriteria = Array.from(typedCriteria)
        .filter(criterion => criterion.type === CriterionType.INCREASING)
        .map(criterion => criterion.generalizedCriterion);
    const decreasingCriteria = Array.from(typedCriteria)
        .filter(criterion => criterion.type === CriterionType.DECREASING)
        .map(criterion => criterion.generalizedCriterion);
    const allCriteria = Array.from(typedCriteria).map(criterion => criterion.generalizedCriterion);

    const satisfiesIncreasingCriteria: GeneralizedCriterion<TAggregate> = (x, bestX) =>
        increasingCriteria.every(criterion => criterion(x, bestX));
    const satisfiesDecreasingCriteria: GeneralizedCriterion<TAggregate> = (x, bestX) =>
        decreasingCriteria.every(criterion => criterion(x, bestX));
    const satisfiesAllCriteria: GeneralizedCriterion<TAggregate> = (x, bestX) =>
        allCriteria.every(criterion => criterion(x, bestX));

    const traversal = new SubsetTreeTraversalIterator(availableItems);

    const lowerBoundAggregator = aggregatorGenerator();
    const upperBoundAggregator = aggregatorGenerator();
    const lowerBoundListAggregator = new ListAggregator<TItem>();
    const upperBoundCountAggregator = new CountAggregator<TItem>();

    let bestSelection: ReadonlyArray<TItem> | null = null;
    let bestSelectionAggregate: TAggregate | null = null;

    let isOptimum = false;

    let iterations = 0;

    for (;;) {
        const iteratorResult = traversal.next();

        if (iteratorResult.done === true) {
            // All sets have been explored.
            isOptimum = true;
            break;
        }

        iterations++;
        if (maximumIterations !== null && iterations > maximumIterations) {
            break;
        }

        const setDifference = iteratorResult.value;

        lowerBoundAggregator.applyDifference(setDifference.lowerBound);
        upperBoundAggregator.applyDifference(setDifference.upperBound);
        lowerBoundListAggregator.applyDifference(setDifference.lowerBound);
        upperBoundCountAggregator.applyDifference(setDifference.upperBound);

        if (lowerBoundListAggregator.aggregate.length === upperBoundCountAggregator.aggregate) {
            // lower bound is equal to upper bound
            if (satisfiesAllCriteria(lowerBoundAggregator.aggregate, bestSelectionAggregate)) {
                bestSelection = lowerBoundListAggregator.cloneAggregate();
                bestSelectionAggregate = lowerBoundAggregator.cloneAggregate();
            }
        } else {
            if (
                !satisfiesIncreasingCriteria(upperBoundAggregator.aggregate, bestSelectionAggregate)
            ) {
                // Do not explore the sets in setInterval.
                // If the upperBound does not satisfy the criterion, then no set in the interval can satisfy the criterion, because the criterion is increasing with respect to inclusion.
                traversal.skipBranch();
            }
            if (
                !satisfiesDecreasingCriteria(lowerBoundAggregator.aggregate, bestSelectionAggregate)
            ) {
                // Do not explore the sets in setInterval.
                // If the lowerBound does not satisfy the criterion, then no set in the interval can satisfy the criterion, because the criterion is decreasing with respect to inclusion.
                traversal.skipBranch();
            }
        }
    }

    return { maximum: bestSelection, iterations, isOptimum };
}

// This ia a heuristics that is trying to solve the following problem: Find a set S such that
//   (1) selectedItems is a subset of S,
//   (2) S is a subset of availableItems,
//   (3) criterion(S) is true for all criterion in criteria
//   (4) metric(S, initialSelection) == MetricResult.FIRST_IS_GREATER and
//   (5) there is no set S' that satisfies (1), (2) and (3), (4) and metric(S', S) == MetricResult.FIRST_IS_GREATER.
// Since the problem is NP-hard, the complexity of the algorithm is exponential in the size of availableItems in the worst case. The duration of the algorithm is bounded by maximumIterations.
// If the algorithm finds a solution, it is guaranteed that the solution satisfies (1), (2), (3) and (4).
// If maximumIterations is at least 2 * 2**availableItems.length - 1, the algorithm is guaranteed to find a solution that satisfies (1), (2), (3), (4), and (5) if such a solution exists. In such a case, the arguments initialSelection and priorityMetric have no effect on the result, but merely on the duration of the algorithm.
export function branchAndBound<TItem, TAggregate>(
    aggregatorGenerator: () => IAggregator<TItem, TAggregate>,
    selectedItems: Iterable<TItem>,
    availableItems: Iterable<TItem>,
    criteria: Iterable<ITypedCriterion<TAggregate>>,
    metric: ITypedMetric<TAggregate>,
    initialSelection: Iterable<TItem> | null, // TODO; Consider removing this parameter.
    priorityMetric: Metric<TItem> | null,
    maximumIterations: number | null,
): IBranchAndBoundResult<ReadonlyArray<TItem>> {
    if (!isMultiSubset(selectedItems, availableItems)) {
        throw new Error('The selected items are not a subset of the available items.');
    }

    const initialSelectionAggregator = aggregatorGenerator();
    if (initialSelection !== null) {
        if (!isMultiSubset(selectedItems, initialSelection)) {
            throw new Error('The selected items are not a subset of the initial selection.');
        }

        if (!isMultiSubset(initialSelection, availableItems)) {
            throw new Error('The initial selection is not a subset of the available items.');
        }

        initialSelectionAggregator.applyDifference({
            added: Array.from(initialSelection),
            removed: [],
        });
        if (
            !Array.from(criteria).every(criterion =>
                criterion.criterion(initialSelectionAggregator.aggregate),
            )
        ) {
            throw new Error('The initial selection does not satisfy all the criteria.');
        }
    }

    // TODO: Consider removing reverse() and renaming priorityMetric because this might be confusing.
    const newAvailableItems =
        priorityMetric === null
            ? Array.from(availableItems)
            : Array.from(availableItems).sort(priorityMetric).reverse();

    const newGenerator = () => {
        const aggregator = aggregatorGenerator();
        aggregator.applyDifference({ added: Array.from(selectedItems), removed: [] });
        return aggregator;
    };

    let bestCriterion: ITypedGeneralizedCriterion<TAggregate>;
    if (initialSelection === null) {
        bestCriterion = {
            type: metric.type,
            generalizedCriterion: (selection: TAggregate, bestSelection: TAggregate | null) =>
                bestSelection === null
                    ? true
                    : metric.metric(selection, bestSelection) === MetricResult.FIRST_IS_BETTER,
        };
    } else {
        bestCriterion = {
            type: metric.type,
            generalizedCriterion: (selection: TAggregate, bestSelection: TAggregate | null) =>
                metric.metric(selection, bestSelection ?? initialSelectionAggregator.aggregate) ===
                MetricResult.FIRST_IS_BETTER,
        };
    }

    const newCriteria = Array.from(criteria).map(criterion => ({
        type: criterion.type,
        generalizedCriterion: (selection: TAggregate, _: TAggregate | null) =>
            criterion.criterion(selection),
    }));

    const result = branchAndBoundInner(
        newGenerator,
        newAvailableItems,
        newCriteria.concat(bestCriterion),
        maximumIterations,
    );

    let maximum: ReadonlyArray<TItem> | null;
    if (result.maximum === null) {
        if (initialSelection !== null) {
            maximum = Array.from(initialSelection);
        } else {
            maximum = null;
        }
    } else {
        maximum = Array.from(selectedItems).concat(result.maximum);
    }

    return { maximum, iterations: result.iterations, isOptimum: result.isOptimum };
}
