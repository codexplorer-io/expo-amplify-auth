import { useEffect } from 'react';
import { runHookWithDi } from '@codexporer.io/react-test-utils';
import { injectable } from 'react-magnetic-di';
import { useAuthenticationStateActions } from '../authentication-state';
import {
    useAuthenticationEvents,
    useAuthenticationEventsSubscriber,
    useAuthenticationEventsSubscriberActions,
    Store
} from './index';

describe('Authentication Events', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should have actions and initial state', () => {
        const { initialState, actions } = Store;
        expect(initialState).toEqual({ subscribers: [] });
        expect(actions).toEqual({
            subscribe: expect.any(Function),
            unsubscribe: expect.any(Function)
        });
    });

    describe('useAuthenticationEventsSubscriber', () => {
        it('should return expected state and actions', () => {
            const hookRunner = runHookWithDi(
                () => useAuthenticationEventsSubscriber()
            );

            expect(hookRunner.hookResult).toEqual([
                { subscribers: [] },
                {
                    subscribe: expect.any(Function),
                    unsubscribe: expect.any(Function)
                }
            ]);
        });
    });

    describe('useAuthenticationEventsSubscriberActions', () => {
        it('should return expected state and actions', () => {
            const hookRunner = runHookWithDi(
                () => useAuthenticationEventsSubscriberActions()
            );

            expect(hookRunner.hookResult).toEqual([
                undefined,
                {
                    subscribe: expect.any(Function),
                    unsubscribe: expect.any(Function)
                }
            ]);
        });
    });

    describe('useAuthenticationEvents', () => {
        const refreshAuthStateMock = jest.fn();
        const subscriberFunctionRejected = jest.fn().mockResolvedValue();
        const subscriberFunctionResolved = jest.fn().mockRejectedValue();
        const defaultDeps = [
            injectable(useAuthenticationEventsSubscriber, useAuthenticationEventsSubscriber),
            injectable(
                useAuthenticationStateActions,
                () => [undefined, { refreshAuthState: refreshAuthStateMock }]
            )
        ];

        const runHookWithFunction = functionName => runHookWithDi(
            () => {
                const [, {
                    subscribe,
                    unsubscribe
                }] = useAuthenticationEventsSubscriberActions();

                useEffect(() => {
                    const subscriber1 = {};
                    subscribe(subscriber1);
                    const subscriber2 = { [functionName]: subscriberFunctionRejected };
                    subscribe(subscriber2);
                    const subscriber3 = { [functionName]: subscriberFunctionResolved };
                    subscribe(subscriber3);

                    return () => {
                        unsubscribe(subscriber1);
                        unsubscribe(subscriber2);
                        unsubscribe(subscriber3);
                    };
                }, [subscribe, unsubscribe]);

                return useAuthenticationEvents();
            },
            { deps: defaultDeps }
        );

        it('should call subscribers on onStartSignIn', async () => {
            const hookRunner = runHookWithFunction('onStartSignIn');

            await hookRunner.hookResult.onStartSignIn();

            expect(subscriberFunctionRejected).toHaveBeenCalledTimes(1);
            expect(subscriberFunctionResolved).toHaveBeenCalledTimes(1);

            hookRunner.unmount();
        });

        it('should refresh auth and call subscribers on onSignIn', async () => {
            const hookRunner = runHookWithFunction('onSignIn');

            await hookRunner.hookResult.onSignIn();

            expect(subscriberFunctionRejected).toHaveBeenCalledTimes(1);
            expect(subscriberFunctionResolved).toHaveBeenCalledTimes(1);
            expect(refreshAuthStateMock).toHaveBeenCalledTimes(1);

            hookRunner.unmount();
        });

        it('should refresh auth and call subscribers on onSignInFailure', async () => {
            const hookRunner = runHookWithFunction('onSignInFailure');

            await hookRunner.hookResult.onSignInFailure();

            expect(subscriberFunctionRejected).toHaveBeenCalledTimes(1);
            expect(subscriberFunctionResolved).toHaveBeenCalledTimes(1);
            expect(refreshAuthStateMock).toHaveBeenCalledTimes(1);

            hookRunner.unmount();
        });

        it('should refresh auth and call subscribers on onSignOut', async () => {
            const hookRunner = runHookWithFunction('onSignOut');

            await hookRunner.hookResult.onSignOut();

            expect(subscriberFunctionRejected).toHaveBeenCalledTimes(1);
            expect(subscriberFunctionResolved).toHaveBeenCalledTimes(1);
            expect(refreshAuthStateMock).toHaveBeenCalledTimes(1);

            hookRunner.unmount();
        });

        it('should not call any subscribers', async () => {
            const hookRunner = runHookWithDi(
                () => useAuthenticationEvents(),
                { deps: defaultDeps }
            );

            await hookRunner.hookResult.onStartSignIn();
            await hookRunner.hookResult.onSignIn();
            await hookRunner.hookResult.onSignInFailure();
            await hookRunner.hookResult.onSignOut();

            expect(subscriberFunctionRejected).toHaveBeenCalledTimes(0);
            expect(subscriberFunctionResolved).toHaveBeenCalledTimes(0);
            expect(refreshAuthStateMock).toHaveBeenCalledTimes(3);
        });
    });
});
