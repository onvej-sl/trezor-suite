import {
    isMultiSubset,
    ITypedCriterion,
    Metric,
    MetricResult,
    ITypedMetric,
    IBranchAndBoundResult,
    CriterionType,
} from '../src/branchAndBound';

export class SetInterval<T> {
    readonly lowerBound: ReadonlyArray<T>;
    readonly upperBound: ReadonlyArray<T>;
    private readonly availableItems: ReadonlyArray<T>;

    constructor(includedItems: ReadonlyArray<T>, availableItems: ReadonlyArray<T>) {
        this.lowerBound = includedItems;
        this.availableItems = availableItems;
        this.upperBound = includedItems.concat(availableItems);
    }

    get isSingleton(): boolean {
        return this.availableItems.length === 0;
    }

    get includeNextItem(): SetInterval<T> {
        if (this.isSingleton) {
            throw new Error('No available item to include.');
        }
        return new SetInterval(
            this.lowerBound.concat(this.availableItems[0]),
            this.availableItems.slice(1),
        );
    }

    get excludeNextItem(): SetInterval<T> {
        if (this.isSingleton) {
            throw new Error('No available item to exclude.');
        }
        return new SetInterval(this.lowerBound, this.availableItems.slice(1));
    }
}

export class Stack<T> {
    private readonly data: Array<T> = [];

    push(item: T): void {
        this.data.push(item);
    }

    pop(): T {
        const item = this.data.pop();
        if (item === undefined) {
            throw new Error('Stack is empty.');
        }
        return item;
    }

    get isEmpty(): boolean {
        return this.data.length === 0;
    }

    get length(): number {
        return this.data.length;
    }
}

// This is a recursive implementation of the branch and bound algorithm. The main disadvantage of this implementation is that it is slower than the iterative implementation.
export function branchAndBoundRecursive<TItem, TAggregate>(
    aggregateFun: (x: ReadonlyArray<TItem>) => TAggregate,
    selectedItems: ReadonlyArray<TItem>,
    availableItems: ReadonlyArray<TItem>,
    criteria: ReadonlyArray<ITypedCriterion<TAggregate>>,
    metric: ITypedMetric<TAggregate>,
    initialSelection: ReadonlyArray<TItem> | null,
    priorityMetric: Metric<TItem> | null,
    maximumIterations: number | null,
): IBranchAndBoundResult<ReadonlyArray<TItem>> {
    if (!isMultiSubset(selectedItems, availableItems)) {
        throw new Error('The selected items are not a subset of the available items.');
    }

    if (initialSelection !== null) {
        if (!isMultiSubset(selectedItems, initialSelection)) {
            throw new Error('The selected items are not a subset of the initial selection.');
        }

        if (!isMultiSubset(initialSelection, availableItems)) {
            throw new Error('The initial selection is not a subset of the available items.');
        }

        if (
            !Array.from(criteria).every(criterion =>
                criterion.criterion(aggregateFun(initialSelection)),
            )
        ) {
            throw new Error('The initial selection does not satisfy all the criteria.');
        }
    }

    const sortedAvailableItems =
        priorityMetric === null
            ? availableItems
            : Array.from(availableItems).sort(priorityMetric).reverse();

    const bestCriterion = {
        type: metric.type,
        generalizedCriterion: (selection: TAggregate, bestSelection: TAggregate | null) =>
            bestSelection === null
                ? true
                : metric.metric(selection, bestSelection) === MetricResult.FIRST_IS_BETTER,
    };
    const generalizedCriteria = criteria.map(criterion => ({
        type: criterion.type,
        generalizedCriterion: (selection: TAggregate, _: TAggregate | null) =>
            criterion.criterion(selection),
    }));
    generalizedCriteria.push(bestCriterion);

    const increasingCriteria = generalizedCriteria
        .filter(criterion => criterion.type === CriterionType.INCREASING)
        .map(criterion => criterion.generalizedCriterion);
    const decreasingCriteria = generalizedCriteria
        .filter(criterion => criterion.type === CriterionType.DECREASING)
        .map(criterion => criterion.generalizedCriterion);
    const allCriteria = generalizedCriteria.map(criterion => criterion.generalizedCriterion);

    const satisfiesIncreasingCriteria = (selection: TAggregate, bestSelection: TAggregate | null) =>
        increasingCriteria.every(criterion => criterion(selection, bestSelection));
    const satisfiesDecreasingCriteria = (selection: TAggregate, bestSelection: TAggregate | null) =>
        decreasingCriteria.every(criterion => criterion(selection, bestSelection));
    const satisfiesAllCriteria = (selection: TAggregate, bestSelection: TAggregate | null) =>
        allCriteria.every(criterion => criterion(selection, bestSelection));

    let currentSetInterval: SetInterval<TItem> = new SetInterval(
        selectedItems,
        sortedAvailableItems,
    );
    const stack = new Stack<SetInterval<TItem>>();
    let iterations = 0;
    stack.push(currentSetInterval);

    let bestSelection: ReadonlyArray<TItem> | null = initialSelection;
    let bestSelectionAggregate: TAggregate | null =
        initialSelection === null ? null : aggregateFun(initialSelection);

    while (!stack.isEmpty && (maximumIterations === null || iterations < maximumIterations)) {
        currentSetInterval = stack.pop();
        iterations += 1;
        if (currentSetInterval.isSingleton) {
            const aggregate = aggregateFun(currentSetInterval.lowerBound);
            if (satisfiesAllCriteria(aggregate, bestSelectionAggregate)) {
                bestSelection = currentSetInterval.lowerBound;
                bestSelectionAggregate = aggregate;
            }
        } else {
            if (
                !satisfiesIncreasingCriteria(
                    aggregateFun(currentSetInterval.upperBound),
                    bestSelectionAggregate,
                )
            ) {
                continue;
                // Do not explore the sets in setInterval.
                // If setInterval.upperBound does not satisfy the criterion, then no set in setInterval can satisfy the criterion, because the criterion is increasing with respect to inclusion.
            }
            if (
                !satisfiesDecreasingCriteria(
                    aggregateFun(currentSetInterval.lowerBound),
                    bestSelectionAggregate,
                )
            ) {
                continue;
                // Do not explore the sets in setInterval.
                // If setInterval.lowerBound does not satisfy the criterion, then no set in setInterval can satisfy the criterion, because the criterion is decreasing with respect to inclusion.
            }
            // Use depth-first search with inclusion branch first to explore the sets in setInterval.
            stack.push(currentSetInterval.excludeNextItem);
            stack.push(currentSetInterval.includeNextItem);
        }
    }

    return { maximum: bestSelection, iterations, isOptimum: stack.isEmpty };
}
