import styled from 'styled-components';
import { Card, variables } from '@trezor/components';
import VerifyAddress from './components/VerifyAddress';
import { useCoinmarketBuyOffersContext } from 'src/hooks/wallet/useCoinmarketBuyOffers';
import { CoinmarketBuyOfferInfo } from '../../../components/CoinmarketBuyOfferInfo';

const Wrapper = styled.div`
    display: flex;
    margin-top: 20px;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: column;
    }
`;

const StyledCard = styled(Card)`
    flex: 1;
    padding: 0;
`;

const SelectedOffer = () => {
    const { account, selectedQuote, providersInfo } = useCoinmarketBuyOffersContext();
    if (!selectedQuote) return null;

    return (
        <Wrapper>
            <StyledCard>
                <VerifyAddress />
            </StyledCard>
            <CoinmarketBuyOfferInfo
                selectedQuote={selectedQuote}
                account={account}
                providers={providersInfo}
                data-test="@CoinmarketBuyOfferInfo"
            />
        </Wrapper>
    );
};

export default SelectedOffer;
