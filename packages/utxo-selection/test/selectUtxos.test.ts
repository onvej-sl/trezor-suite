import { selectUtxos } from '../src/selectUtxos';
import { fixtures } from './fixtures/selectUtxos.fixtures';

describe('selctUtxos', () => {
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
        }) => {
            it(comment, () => {
                const result = selectUtxos(
                    utxos,
                    targetValue,
                    maximumDustInclusive,
                    minimumChangeInclusive,
                    maximumWeightInclusive,
                    changeWeight,
                    minimumAnonymityInclusive,
                    miningFee,
                );
                const selectedIndicies =
                    result === null ? null : result.map(utxo => utxos.indexOf(utxo));
                expect(new Set(selectedIndicies)).toEqual(new Set(expectedSelectedIndices));
            });
        },
    );
});
