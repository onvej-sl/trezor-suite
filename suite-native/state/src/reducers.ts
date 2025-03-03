import { combineReducers } from '@reduxjs/toolkit';

import {
    prepareAccountsReducer,
    prepareBlockchainReducer,
    prepareDeviceReducer,
    prepareDiscoveryReducer,
    prepareTransactionsReducer,
} from '@suite-common/wallet-core';
import { prepareFiatRatesReducer } from '@suite-native/fiat-rates';
import { appSettingsReducer, appSettingsPersistWhitelist } from '@suite-native/module-settings';
import { logsSlice } from '@suite-common/logger';
import { migrateAccountLabel, preparePersistReducer } from '@suite-native/storage';
import { prepareAnalyticsReducer } from '@suite-common/analytics';
import { prepareMessageSystemReducer } from '@suite-common/message-system';
import { notificationsReducer } from '@suite-common/toast-notifications';
import { graphReducer, graphPersistWhitelist } from '@suite-native/graph';

import { extraDependencies } from './extraDependencies';
import { appReducer } from './appSlice';

const transactionsReducer = prepareTransactionsReducer(extraDependencies);
const accountsReducer = prepareAccountsReducer(extraDependencies);
const fiatRatesReducer = prepareFiatRatesReducer(extraDependencies);
const blockchainReducer = prepareBlockchainReducer(extraDependencies);
const analyticsReducer = prepareAnalyticsReducer(extraDependencies);
const messageSystem = prepareMessageSystemReducer(extraDependencies);
const deviceReducer = prepareDeviceReducer(extraDependencies);
const discoveryReducer = prepareDiscoveryReducer(extraDependencies);

export const prepareRootReducers = async () => {
    const appSettingsPersistedReducer = await preparePersistReducer({
        reducer: appSettingsReducer,
        persistedKeys: appSettingsPersistWhitelist,
        key: 'appSettings',
        version: 1,
    });

    const walletReducers = combineReducers({
        accounts: accountsReducer,
        blockchain: blockchainReducer,
        fiat: fiatRatesReducer,
        transactions: transactionsReducer,
        discovery: discoveryReducer,
    });

    const walletPersistedReducer = await preparePersistReducer({
        reducer: walletReducers,
        persistedKeys: ['accounts', 'transactions'],
        key: 'wallet',
        version: 2,
        migrations: {
            2: (oldState: any) => {
                const oldAccountsState: { accounts: any } = { accounts: oldState.accounts };
                const migratedAccounts = migrateAccountLabel(oldAccountsState.accounts);
                const migratedState = { ...oldState, accounts: migratedAccounts };
                return migratedState;
            },
        },
    });

    const analyticsPersistedReducer = await preparePersistReducer({
        reducer: analyticsReducer,
        persistedKeys: ['instanceId', 'enabled', 'confirmed'],
        key: 'analytics',
        version: 1,
    });

    const graphPersistedReducer = await preparePersistReducer({
        reducer: graphReducer,
        persistedKeys: graphPersistWhitelist,
        key: 'graph',
        version: 1,
    });

    return combineReducers({
        app: appReducer,
        analytics: analyticsPersistedReducer,
        appSettings: appSettingsPersistedReducer,
        wallet: walletPersistedReducer,
        graph: graphPersistedReducer,
        device: deviceReducer,
        logs: logsSlice.reducer,
        notifications: notificationsReducer,
        messageSystem,
    });
};
