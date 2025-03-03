import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { useNavigation } from '@react-navigation/native';

import { setIsOnboardingFinished } from '@suite-native/module-settings';
import {
    AccountsImportStackRoutes,
    OnboardingStackParamList,
    OnboardingStackRoutes,
    RootStackParamList,
    RootStackRoutes,
    Screen,
    StackToStackCompositeNavigationProps,
} from '@suite-native/navigation';
import { Box, Button, Stack, Switch, Text, VStack } from '@suite-native/atoms';
import { useTranslate, Translation } from '@suite-native/intl';
import { Link } from '@suite-native/link';
import { Icon } from '@suite-common/icons';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { EventType, analytics } from '@suite-native/analytics';

import { AnalyticsInfoRow } from '../components/AnalyticsInfoRow';

type NavigationProps = StackToStackCompositeNavigationProps<
    OnboardingStackParamList,
    OnboardingStackRoutes.AnalyticsConsent,
    RootStackParamList
>;

const titleStyle = prepareNativeStyle(utils => ({
    textAlign: 'center',
    marginTop: utils.spacings.large,
    marginBottom: 12,
    paddingHorizontal: utils.spacings.large,
}));

const subtitleStyle = prepareNativeStyle(utils => ({
    textAlign: 'center',
    marginBottom: utils.spacings.large,
    paddingHorizontal: utils.spacings.large,
}));

const buttonsWrapperStyle = prepareNativeStyle(() => ({
    width: '90%',
    alignSelf: 'center',
    marginBottom: 28,
}));

const cardStyle = prepareNativeStyle(utils => ({
    marginHorizontal: utils.spacings.medium,
    marginTop: utils.spacings.medium,
    marginBottom: utils.spacings.extraLarge,
    paddingHorizontal: utils.spacings.medium,
    paddingTop: 60,
    paddingBottom: 20,
    borderRadius: 20,
    backgroundColor: utils.colors.backGroundOnboardingCard,
}));

const analyticsConsentStyle = prepareNativeStyle(_ => ({
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
}));

const consentWrapperStyle = prepareNativeStyle(utils => ({
    maxHeight: 64,
    paddingHorizontal: utils.spacings.medium,
    paddingVertical: utils.spacings.small,
    marginBottom: utils.spacings.small,
    borderRadius: utils.spacings.medium,
    backgroundColor: utils.colors.backgroundTertiaryDefaultOnElevation1,
    width: '100%',
}));

const consentInfoStyle = prepareNativeStyle(utils => ({
    gap: 8,
    paddingVertical: utils.spacings.extraSmall,
}));

const reportAnalyticsOnboardingCompleted = (isTrackingAllowed: boolean) => {
    // For users who have not allowed tracking, enable analytics just for reporting
    // the OnboardingCompleted event and then disable it again.
    if (!isTrackingAllowed) analytics.enable();
    analytics.report({
        type: EventType.OnboardingCompleted,
        payload: { analyticsPermission: isTrackingAllowed },
    });
    if (!isTrackingAllowed) analytics.disable();
};

export const AnalyticsConsentScreen = () => {
    const [isEnabled, setIsEnabled] = useState(true);

    const { translate } = useTranslate();

    const navigation = useNavigation<NavigationProps>();

    const { applyStyle } = useNativeStyles();

    const dispatch = useDispatch();

    const handleRedirect = () => {
        dispatch(setIsOnboardingFinished());
        reportAnalyticsOnboardingCompleted(isEnabled);

        navigation.navigate(RootStackRoutes.AccountsImport, {
            screen: AccountsImportStackRoutes.SelectNetwork,
        });
    };

    const handleAnalyticsConsent = () => {
        analytics.enable();
        handleRedirect();
    };

    return (
        <Screen isScrollable>
            <Box
                alignItems="center"
                flex={1}
                justifyContent="space-between"
                style={applyStyle(cardStyle)}
            >
                <Icon size="extraLarge" name="trezor" color="iconDefault" />
                <Text variant="titleMedium" style={applyStyle(titleStyle)}>
                    <Translation id="moduleOnboarding.analyticsConsentScreen.title" />
                </Text>
                <Text color="textSubdued" style={applyStyle(subtitleStyle)}>
                    <Translation id="moduleOnboarding.analyticsConsentScreen.subtitle" />
                </Text>
                <VStack style={applyStyle(analyticsConsentStyle)}>
                    <Stack spacing="large" paddingBottom="medium">
                        <AnalyticsInfoRow
                            iconName="eyeSlash"
                            title={translate(
                                'moduleOnboarding.analyticsConsentScreen.bulletPoints.privacy.title',
                            )}
                            description={translate(
                                'moduleOnboarding.analyticsConsentScreen.bulletPoints.privacy.description',
                            )}
                        />
                        <AnalyticsInfoRow
                            iconName="bugBeetle"
                            title={translate(
                                'moduleOnboarding.analyticsConsentScreen.bulletPoints.dataCollection.title',
                            )}
                            description={translate(
                                'moduleOnboarding.analyticsConsentScreen.bulletPoints.dataCollection.description',
                            )}
                        />
                    </Stack>
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        flex={1}
                        justifyContent="space-between"
                        style={applyStyle(consentWrapperStyle)}
                    >
                        <Box flexDirection="row" style={applyStyle(consentInfoStyle)}>
                            <Icon size="mediumLarge" name="info" color="iconPrimaryDefault" />
                            <Text variant="hint" textAlign="center">
                                <Translation id="moduleOnboarding.analyticsConsentScreen.helpSwitchTitle" />
                            </Text>
                        </Box>
                        <Switch
                            isChecked={isEnabled}
                            onChange={enabled => {
                                setIsEnabled(enabled);
                            }}
                        />
                    </Box>
                    <Text variant="hint" textAlign="center">
                        <Translation
                            id="moduleOnboarding.analyticsConsentScreen.learnMore"
                            values={{
                                securityLink: chunks => (
                                    <Link
                                        href="https://trezor.io/security"
                                        label={
                                            chunks.length > 0 && typeof chunks[0] === 'string'
                                                ? chunks[0]
                                                : ''
                                        }
                                    />
                                ),
                            }}
                        />
                    </Text>
                </VStack>
            </Box>

            <Box style={applyStyle(buttonsWrapperStyle)}>
                <Button
                    data-testID="allow-userData"
                    onPress={isEnabled ? handleAnalyticsConsent : handleRedirect}
                >
                    {translate('generic.buttons.confirm')}
                </Button>
            </Box>
        </Screen>
    );
};
