import Animated, { FadeIn } from 'react-native-reanimated';

import { AlertBox, Box, Toggle, VStack } from '@suite-native/atoms';

type IncludeTokensToggleProps = {
    isToggled: boolean;
    onToggle: () => void;
};

export const IncludeTokensToggle = ({ isToggled, onToggle }: IncludeTokensToggleProps) => (
    <VStack spacing="large" marginTop="small">
        <Box marginHorizontal="large">
            <Toggle
                leftLabel="Ethereum"
                rightLabel="Include tokens"
                isToggled={isToggled}
                onToggle={onToggle}
            />
        </Box>
        {isToggled && (
            <Animated.View entering={FadeIn}>
                <AlertBox title="Note, your Ethereum balance doesn’t include tokens." />
            </Animated.View>
        )}
    </VStack>
);
