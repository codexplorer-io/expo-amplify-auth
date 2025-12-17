import { useCallback, useMemo } from 'react';
import {
    createStore,
    createHook
} from 'react-sweet-state';
import without from 'lodash/without';
import map from 'lodash/map';

export const Store = createStore({
    initialState: {
        subscribers: [],
        refreshAuthState: null
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
        },
        setRefreshAuthState: refreshAuthState => ({ getState, setState }) => {
            const { refreshAuthState: currentRefreshAuthState } = getState();
            !currentRefreshAuthState && setState({
                refreshAuthState
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
    const [{
        subscribers,
        refreshAuthState
    }] = useAuthenticationEventsSubscriber();

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
        await refreshAuthState?.();
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
        await refreshAuthState?.();
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

    const onStartSignOut = useCallback(async () => {
        await Promise.all(
            map(subscribers, async subscriber => {
                try {
                    await Promise.resolve(subscriber.onStartSignOut?.());
                } catch {
                    // Ignore empty block
                }
            })
        );
    }, [
        subscribers
    ]);

    const onSignOut = useCallback(async () => {
        await refreshAuthState?.();
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
        onStartSignOut,
        onSignOut
    }), [
        onStartSignIn,
        onSignIn,
        onSignInFailure,
        onStartSignOut,
        onSignOut
    ]);
};
