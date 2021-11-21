import { useCallback, useMemo } from 'react';
import {
    createStore,
    createHook
} from 'react-sweet-state';
import { di } from 'react-magnetic-di';
import without from 'lodash/without';
import map from 'lodash/map';
import { useAuthenticationStateActions } from '../authentication-state';

export const Store = createStore({
    initialState: {
        subscribers: []
    },
    actions: {
        subscribe: subscriber => ({ getState, setState }) => {
            const { subscribers } = getState();
            setState({
                subscribers: [
                    ...subscribers,
                    subscriber
                ]
            });
        },
        unsubscribe: subscriber => ({ getState, setState }) => {
            const { subscribers } = getState();
            setState({
                subscribers: without(subscribers, subscriber)
            });
        }
    },
    name: 'AuthenticationEventsSubscribers'
});

export const useAuthenticationEventsSubscriber = createHook(Store);

export const useAuthenticationEventsSubscriberActions = createHook(Store, {
    selector: null
});

export const useAuthenticationEvents = () => {
    di(useAuthenticationEventsSubscriber, useAuthenticationStateActions);

    const [{ subscribers }] = useAuthenticationEventsSubscriber();
    const [, { refreshAuthState }] = useAuthenticationStateActions();

    const onStartSignIn = useCallback(async () => {
        await Promise.all(
            map(subscribers, async subscriber => {
                try {
                    await Promise.resolve(subscriber.onStartSignIn?.());
                } catch {
                    // Ignore empty block
                }
            })
        );
    }, [subscribers]);

    const onSignIn = useCallback(async () => {
        await refreshAuthState();
        await Promise.all(
            map(subscribers, async subscriber => {
                try {
                    await Promise.resolve(subscriber.onSignIn?.());
                } catch {
                    // Ignore empty block
                }
            })
        );
    }, [
        refreshAuthState,
        subscribers
    ]);

    const onSignInFailure = useCallback(async () => {
        await refreshAuthState();
        await Promise.all(
            map(subscribers, async subscriber => {
                try {
                    await Promise.resolve(subscriber.onSignInFailure?.());
                } catch {
                    // Ignore empty block
                }
            })
        );
    }, [refreshAuthState, subscribers]);

    const onSignOut = useCallback(async () => {
        await refreshAuthState();
        await Promise.all(
            map(subscribers, async subscriber => {
                try {
                    await Promise.resolve(subscriber.onSignOut?.());
                } catch {
                    // Ignore empty block
                }
            })
        );
    }, [
        refreshAuthState,
        subscribers
    ]);

    return useMemo(() => ({
        onStartSignIn,
        onSignIn,
        onSignInFailure,
        onSignOut
    }), [
        onStartSignIn,
        onSignIn,
        onSignInFailure,
        onSignOut
    ]);
};
