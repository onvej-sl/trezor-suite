import {
    branchAndBound,
    Metric,
    CriterionType,
    MetricResult,
    IAggregator,
    MinimumAggregator,
    SumAggregator,
    GroupAggregator,
    UniquenessAggregator,
    CountAggregator,
    ISetDifference,
} from '@trezor/branch-and-bound';

import { Value } from './Value';

export interface IUtxo {
    value: Value; // in satoshis
    weight: number; // in weight units
    txid: string;
    anonymity: number;
    confirmed: boolean;
    registered: boolean;
}

export class ValueSumAggregator implements IAggregator<Value, Value> {
    private readonly groupAggregator = new GroupAggregator<Value, Value>(
        aggregate => aggregate,
        (aggregate, item) => aggregate.add(item),
        (aggregate, item) => aggregate.subtract(item),
        Value.zero,
    );

    applyDifference(difference: ISetDifference<Value>) {
        this.groupAggregator.applyDifference(difference);
    }

    get aggregate(): Value {
        return this.groupAggregator.aggregate;
    }

    cloneAggregate(): Value {
        return this.groupAggregator.cloneAggregate();
    }
}

// TODO: Make maximumIterations a parameter of selectUtxos.
const maximumIterations = 100_000;

interface IUtxoAggregate {
    readonly count: number;
    readonly totalValue: Value; // in satoshis
    readonly totalWeight: number; // in weight units
    readonly minimumAnonymity: number;
    readonly uniqueTransactions: boolean;
    readonly effectiveValue: Value; // in satoshis
}
export class UtxoAggregator implements IAggregator<IUtxo, IUtxoAggregate> {
    private readonly countAggregator = new CountAggregator();
    private readonly valueAggregator = new ValueSumAggregator();
    private readonly weightAggregator = new SumAggregator();
    private readonly anonymityAggregator = new MinimumAggregator();
    private readonly uniquenessAggregator = new UniquenessAggregator();
    private effectiveValue: Value = Value.zero;
    private readonly miningFee: number;

    constructor(miningFee: number) {
        this.miningFee = miningFee;
    }

    get aggregate(): IUtxoAggregate {
        return {
            count: this.countAggregator.aggregate,
            totalValue: this.valueAggregator.aggregate,
            totalWeight: this.weightAggregator.aggregate,
            minimumAnonymity: this.anonymityAggregator.aggregate,
            uniqueTransactions: this.uniquenessAggregator.aggregate,
            effectiveValue: this.effectiveValue,
        };
    }

    cloneAggregate(): IUtxoAggregate {
        return {
            count: this.countAggregator.cloneAggregate(),
            totalValue: this.valueAggregator.cloneAggregate(),
            totalWeight: this.weightAggregator.cloneAggregate(),
            minimumAnonymity: this.anonymityAggregator.cloneAggregate(),
            uniqueTransactions: this.uniquenessAggregator.cloneAggregate(),
            effectiveValue: this.effectiveValue,
        };
    }

    applyDifference(difference: ISetDifference<IUtxo>) {
        this.countAggregator.applyDifference(difference);
        this.valueAggregator.applyDifference({
            added: difference.added.map(x => x.value),
            removed: difference.removed.map(x => x.value),
        });
        this.anonymityAggregator.applyDifference({
            added: difference.added.map(x => x.anonymity),
            removed: difference.removed.map(x => x.anonymity),
        }); // this is the slowest operation
        this.weightAggregator.applyDifference({
            added: difference.added.map(x => x.weight),
            removed: difference.removed.map(x => x.weight),
        });
        this.uniquenessAggregator.applyDifference({
            added: difference.added.map(x => x.txid),
            removed: difference.removed.map(x => x.txid),
        });
        // TODO: Is this the correct way to round the mining fee?
        this.effectiveValue = this.valueAggregator.aggregate.subtract(
            Value.fromNumber(Math.ceil(this.miningFee * this.weightAggregator.aggregate)),
        );
    }
}

function createIncreasingCriterion(targetValueMinimumInclusive: Value) {
    // The criterium is fulfilled if
    //   * the effective value of the utxos is greater than or equal to the target value.
    return (aggregate: IUtxoAggregate) => {
        if (aggregate.effectiveValue.isLessThan(targetValueMinimumInclusive)) {
            return false;
        }

        return true;
    };
}

function createDecreasingCriterion(
    targetValueMaximumInclusive: Value,
    maximumWeightInclusive: number,
    disallowSameTxid: boolean,
) {
    // The criterium is fulfilled if
    //  * the total weight of the utxos is less than or equal to the maximum weight and
    //  * the effective value of the utxos is less than or equal to the target value and
    //  * the utxos come from different transactions.
    return (aggregate: IUtxoAggregate) => {
        if (maximumWeightInclusive < aggregate.totalWeight) {
            return false;
        }

        if (disallowSameTxid && !aggregate.uniqueTransactions) {
            return false;
        }

        if (targetValueMaximumInclusive.isLessThan(aggregate.effectiveValue)) {
            return false;
        }

        return true;
    };
}

function metric(first: IUtxoAggregate, second: IUtxoAggregate) {
    if (first.count === 0 && second.count === 0) {
        return MetricResult.EQUAL;
    }
    if (first.count === 0) {
        return MetricResult.FIRST_IS_BETTER;
    }
    if (second.count === 0) {
        return MetricResult.SECOND_IS_BETTER;
    }

    if (first.minimumAnonymity > second.minimumAnonymity) {
        return MetricResult.FIRST_IS_BETTER;
    }
    if (first.minimumAnonymity < second.minimumAnonymity) {
        return MetricResult.SECOND_IS_BETTER;
    }

    if (first.count < second.count) {
        return MetricResult.FIRST_IS_BETTER;
    }
    if (first.count > second.count) {
        return MetricResult.SECOND_IS_BETTER;
    }

    return MetricResult.EQUAL;
}

export function selectUtxosInner(
    utxos: Iterable<IUtxo>,
    targetValueMinimumInclusive: Value,
    targetValueMaximumInclusive: Value,
    maximumWeightInclusive: number,
    miningFee: number,
    priorityComparator: Metric<IUtxo>,
    disallowSameTxid: boolean,
): ReadonlyArray<IUtxo> | null {
    // Optimization suggestion: Cache the results.
    return branchAndBound<IUtxo, IUtxoAggregate>(
        () => new UtxoAggregator(miningFee),
        [],
        utxos,
        [
            {
                type: CriterionType.INCREASING,
                criterion: createIncreasingCriterion(targetValueMinimumInclusive),
            },
            {
                type: CriterionType.DECREASING,
                criterion: createDecreasingCriterion(
                    targetValueMaximumInclusive,
                    maximumWeightInclusive,
                    disallowSameTxid,
                ),
            },
        ],
        { type: CriterionType.DECREASING, metric },
        null,
        priorityComparator,
        maximumIterations,
    ).maximum;
}

export function selectUtxosChangeless(
    utxos: ReadonlyArray<IUtxo>,
    targetValue: Value,
    maximumDustInclusive: Value,
    maximumWeightInclusive: number,
    disallowSameTxid: boolean,
    miningFee: number,
): ReadonlyArray<IUtxo> | null {
    const priorityComparator = (first: IUtxo, second: IUtxo) => {
        if (first.value.isGreaterThan(second.value)) {
            return MetricResult.FIRST_IS_BETTER;
        }
        if (first.value.isLessThan(second.value)) {
            return MetricResult.SECOND_IS_BETTER;
        }
        return MetricResult.EQUAL;
    };
    return selectUtxosInner(
        utxos,
        targetValue,
        targetValue.add(maximumDustInclusive),
        maximumWeightInclusive,
        miningFee,
        priorityComparator,
        disallowSameTxid,
    );
}

export function selectUtxosChangefull(
    utxos: ReadonlyArray<IUtxo>,
    targetValue: Value,
    minimumChangeInclusive: Value,
    maximumWeightInclusive: number,
    disallowSameTxid: boolean,
    miningFee: number,
): ReadonlyArray<IUtxo> | null {
    const anonymityPriorityComparator = (first: IUtxo, second: IUtxo) => {
        if (first.anonymity > second.anonymity) {
            return MetricResult.FIRST_IS_BETTER;
        }
        if (first.anonymity < second.anonymity) {
            return MetricResult.SECOND_IS_BETTER;
        }
        return MetricResult.EQUAL;
    };
    const valuePriorityComparator = (first: IUtxo, second: IUtxo) => {
        if (first.value.isGreaterThan(second.value)) {
            return MetricResult.FIRST_IS_BETTER;
        }
        if (first.value.isLessThan(second.value)) {
            return MetricResult.SECOND_IS_BETTER;
        }
        return MetricResult.EQUAL;
    };
    return (
        selectUtxosInner(
            utxos,
            targetValue.add(minimumChangeInclusive),
            Value.infinity,
            maximumWeightInclusive,
            miningFee,
            anonymityPriorityComparator,
            disallowSameTxid,
        ) ??
        selectUtxosInner(
            utxos,
            targetValue.add(minimumChangeInclusive),
            Value.infinity,
            maximumWeightInclusive,
            miningFee,
            valuePriorityComparator,
            disallowSameTxid,
        )
    );
}

// The following algorithm tries to select the best UTXO set according to the following requirements, ordered from highest to lowest priority:
//   1. Select only UTXOs which have at least a 'minimumAnonymityInclusive' anonymity level.
//   2. Select UTXOs that come from different previous transactions.
//   3. Select UTXOs that are not registered for a CoinJoin.
//   4. Select confirmed UTXOs.
//   5. Create transactions with no change output and a dust that does not exceed 'maximumDustInclusive'.
//   6. Create transactions with a change output of at least 'minimumChangeInclusive'.
//   7. Prioritize UTXOs with higher minimum anonymity.
//   8. Prioritize a lesser number of UTXOs.
// A UTXO set A is considered the best UTXO set if there is no other UTXO set A' such that the following conditions hold true:
//   * There is a requirement with priority p that A' fulfills and A does not.
//   * There is no requirement with a higher priority than p that A fulfills and A' does not.

export function selectUtxos(
    utxos: ReadonlyArray<IUtxo>,
    targetValue: Value,
    maximumDustInclusive: Value,
    minimumChangeInclusive: Value,
    maximumWeightInclusive: number, // in weight units
    changeWeight: number, // in weight units
    minimumAnonymityInclusive: number,
    miningFee: number,
): ReadonlyArray<IUtxo> | null {
    const anonymityFilteredUtxos = utxos.filter(x => x.anonymity >= minimumAnonymityInclusive);

    for (const disallowSameTxid of [true, false]) {
        for (const disallowRegistered of [true, false]) {
            for (const disallowUnconfirmed of [true, false]) {
                for (const changeless of [true, false]) {
                    const filteredUtxos = anonymityFilteredUtxos.filter(
                        x =>
                            (!disallowRegistered || !x.registered) &&
                            (!disallowUnconfirmed || x.confirmed),
                    );
                    let result: ReadonlyArray<IUtxo> | null = null;
                    if (changeless) {
                        result = selectUtxosChangeless(
                            filteredUtxos,
                            targetValue,
                            maximumDustInclusive,
                            maximumWeightInclusive,
                            disallowSameTxid,
                            miningFee,
                        );
                    } else {
                        result = selectUtxosChangefull(
                            filteredUtxos,
                            targetValue,
                            minimumChangeInclusive,
                            maximumWeightInclusive - changeWeight,
                            disallowSameTxid,
                            miningFee,
                        );
                    }

                    if (result !== null) {
                        return result;
                    }
                }
            }
        }
    }
    return null;
}
