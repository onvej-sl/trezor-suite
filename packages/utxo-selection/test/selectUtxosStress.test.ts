import { startProfiling, stopProfiling, setGenerateType } from 'v8-profiler-next';
import { writeFileSync } from 'fs';

import { Value } from '../src/Value';
import { selectUtxos } from '../src/selectUtxos';
import { fixtures } from './fixtures/selectUtxosStress.fixtures';

function startProfiler(): void {
    startProfiling('test', true);
    setGenerateType(1);
}

function stopProfiler(): void {
    const profile = stopProfiling('test');
    profile.export((_, result: any) => {
        writeFileSync('selectUtxosStress.cpuprofile', result);
        profile.delete();
    });
}

describe('selctUtxosStress', () => {
    fixtures.forEach(
        ({
            utxos,
            targetValue,
            maximumDustInclusive,
            minimumChangeInclusive,
            maximumWeightInclusive,
            changeWeight,
            comment,
            miningFee,
            minimumAnonymityInclusive,
            expectedSelectedIndices,
            expectedTotalValue,
            expectedMinimumAnonymity,
        }) => {
            it(comment, () => {
                startProfiler();
                const result = selectUtxos(
                    utxos,
                    targetValue,
                    maximumDustInclusive,
                    minimumChangeInclusive,
                    maximumWeightInclusive,
                    changeWeight,
                    minimumAnonymityInclusive,
                    miningFee,
                )!;
                stopProfiler();
                expect(result).not.toBeNull();
                const selectedIndicies = result.map(utxo => utxos.indexOf(utxo));
                const totalValue = result.reduce((acc, utxo) => acc.add(utxo.value), Value.zero);
                const minimumAnonymity = result.reduce(
                    (acc, utxo) => Math.min(acc, utxo.anonymity),
                    Infinity,
                );
                expect(totalValue.toBigInt()).toEqual(expectedTotalValue.toBigInt());
                expect(minimumAnonymity).toEqual(expectedMinimumAnonymity);
                expect(new Set(selectedIndicies)).toEqual(new Set(expectedSelectedIndices));
            });
        },
    );
});
