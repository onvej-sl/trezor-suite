import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Devices from './Devices';

const HeaderComponent = styled.header`
    position: fixed;
    top: 0;
    width: 100%;
    background: #060606;
    color: #f6f7f8;
    overflow: hidden;
    z-index: 100;
    display: flex;
    flex-direction: column;
`;

const HeaderPrimary = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px 20px;

    @media (min-width: 640px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 4px 20px;
    }
`;

const Svg = styled.svg`
    fill: #ffffff;
    height: 28px;
    width: 100px;
    margin-top: 9px;
    display: inline-block;
`;

const HeaderItemsPrimary = styled.div`
    justify-content: center;
    align-items: center;
`;
const HeaderItemsSecondary = styled.div``;

const Title = styled.span`
    display: inline-block;
    vertical-align: top;
    margin-top: 16px;
    margin-left: 20px;
`;

const StyledLink = styled(Link)`
    color: #ffffff;
    text-decoration: underline;
`;

const Header = () => (
    <HeaderComponent>
        <HeaderPrimary>
            <HeaderItemsPrimary>
                <a href="#/">
                    <Svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 2567.5 722.3"
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMinYMin meet"
                    >
                        <path d="M1186 2932.6h46.2v147H1186v-147z" />
                        <path d="M249 0C149.9 0 69.7 80.2 69.7 179.3v67.2C34.9 252.8 0 261.2 0 272.1v350.7s0 9.7 10.9 14.3c39.5 16 194.9 71 230.6 83.6 4.6 1.7 5.9 1.7 7.1 1.7 1.7 0 2.5 0 7.1-1.7 35.7-12.6 191.5-67.6 231-83.6 10.1-4.2 10.5-13.9 10.5-13.9V272.1c0-10.9-34.4-19.7-69.3-25.6v-67.2C428.4 80.2 347.7 0 249 0zm0 85.7c58.4 0 93.7 35.3 93.7 93.7v58.4c-65.5-4.6-121.4-4.6-187.3 0v-58.4c0-58.5 35.3-93.7 93.6-93.7zm-.4 238.1c81.5 0 149.9 6.3 149.9 17.6v218.8c0 3.4-.4 3.8-3.4 5-2.9 1.3-139 50.4-139 50.4s-5.5 1.7-7.1 1.7c-1.7 0-7.1-2.1-7.1-2.1s-136.1-49.1-139-50.4-3.4-1.7-3.4-5V341c-.8-11.3 67.6-17.2 149.1-17.2z" />
                        <g transform="translate(91.363 -287.434) scale(.95575)">
                            <path d="M666.6 890V639.3H575v-89.9h285.6v89.9h-90.7V890H666.6z" />
                            <path d="M1092 890l-47-107.1h-37.4V890H904.3V549.4h181.8c79.8 0 122.6 52.9 122.6 116.7 0 58.8-34 89.9-61.3 103.3l61.7 120.5H1092zm12.2-223.9c0-18.5-16.4-26.5-33.6-26.5h-63v53.8h63c17.2-.4 33.6-8.4 33.6-27.3z" />
                            <path d="M1262.9 890V549.4h258.3v89.9h-155.4v33.6h151.6v89.9h-151.6v37.4h155.4V890h-258.3z" />
                            <path d="M1574.9 890.4v-81.9l129.8-168.8h-129.8v-89.9h265.8v81.1l-130.2 169.7h134v89.9l-269.6-.1z" />
                            <path d="M1869.7 720.3c0-104.6 81.1-176.4 186.5-176.4 105 0 186.5 71.4 186.5 176.4 0 104.6-81.1 176-186.5 176s-186.5-71.4-186.5-176zm268 0c0-47.5-32.3-85.3-81.9-85.3-49.6 0-81.9 37.8-81.9 85.3s32.3 85.3 81.9 85.3c50 0 81.9-37.8 81.9-85.3z" />
                            <path d="M2473.6 890.4l-47-107.1h-37.4v107.1h-103.3V549.8h181.8c79.8 0 122.6 52.9 122.6 116.7 0 58.8-34 89.9-61.3 103.3l61.7 120.5h-117.1zm12.6-224.3c0-18.5-16.4-26.5-33.6-26.5h-63v53.8h63c17.3-.4 33.6-8.4 33.6-27.3z" />
                        </g>
                    </Svg>
                </a>

                <Title>@trezor/connect</Title>
            </HeaderItemsPrimary>
            <HeaderItemsSecondary>
                <StyledLink to="/">quick start</StyledLink>&nbsp;
                <StyledLink to="/events">events</StyledLink>&nbsp;
                <StyledLink to="/changelog">changelog</StyledLink>&nbsp;
            </HeaderItemsSecondary>
        </HeaderPrimary>
        <Devices />
    </HeaderComponent>
);

export default Header;
