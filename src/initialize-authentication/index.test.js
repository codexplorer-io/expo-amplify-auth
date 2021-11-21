import { Hub } from '@aws-amplify/core';
import { injectable } from 'react-magnetic-di';
import { runHookWithDi } from '@codexporer.io/react-test-utils';
import { useAuthenticationState } from '../authentication-state';
import { useAuthenticationEvents } from '../authentication-events';
import { useInitializeAuthentication } from './index';

jest.mock('@aws-amplify/core', () => {
    const core = jest.requireActual('@aws-amplify/core');
    core.Hub.listen = jest.fn();
    core.Hub.remove = jest.fn();
    return core;
});

describe('useInitializeAuthentication', () => {
    const useAuthenticationStateMock = jest.fn();
    const authenticationEventsMock = {
        onStartSignIn: jest.fn(),
        onSignIn: jest.fn(),
        onSignInFailure: jest.fn(),
        onSignOut: jest.fn()
    };
    const refreshAuthStateMock = jest.fn();

    const defaultDeps = [
        injectable(useAuthenticationState, useAuthenticationStateMock),
        injectable(useAuthenticationEvents, () => authenticationEventsMock)
    ];

    beforeEach(() => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: true, isInitialized: true },
            { refreshAuthState: refreshAuthStateMock }
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return authentication state', () => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: 'isAuthenticatedMock', isInitialized: 'isInitializedMock' },
            { refreshAuthState: jest.fn() }
        ]);

        const hookRunner = runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        expect(hookRunner.hookResult).toEqual({ isInitialized: 'isInitializedMock', isAuthenticated: 'isAuthenticatedMock' });
    });

    it('should call Hub.listen', () => {
        runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        expect(Hub.listen).toHaveBeenCalledTimes(1);
        expect(Hub.remove).not.toHaveBeenCalled();
    });

    it('should call Hub.remove', () => {
        const hookRunner = runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        hookRunner.unmount();

        expect(Hub.remove).toHaveBeenCalledTimes(1);
    });

    describe('authentication events', () => {
        const oAuthMock = event => {
            runHookWithDi(
                () => useInitializeAuthentication({ canInitialize: true }),
                { deps: defaultDeps }
            );
            Hub.listen.mock.calls[0][1]({ payload: { event } });
        };
        const {
            onStartSignIn,
            onSignIn,
            onSignInFailure,
            onSignOut
        } = authenticationEventsMock;

        it('should call signIn', () => {
            oAuthMock('signIn');

            expect(onSignIn).toHaveBeenCalledTimes(1);
            expect(onSignOut).not.toHaveBeenCalled();
            expect(onStartSignIn).not.toHaveBeenCalled();
            expect(onSignInFailure).not.toHaveBeenCalled();
        });

        it('should call onStartSignIn', () => {
            oAuthMock('codeFlow');

            expect(onStartSignIn).toHaveBeenCalledTimes(1);
            expect(onSignIn).not.toHaveBeenCalled();
            expect(onSignOut).not.toHaveBeenCalled();
            expect(onSignInFailure).not.toHaveBeenCalled();
        });

        it('should call onSignInFailure', () => {
            oAuthMock('signIn_failure');

            expect(onSignInFailure).toHaveBeenCalledTimes(1);
            expect(onSignIn).not.toHaveBeenCalled();
            expect(onSignOut).not.toHaveBeenCalled();
            expect(onStartSignIn).not.toHaveBeenCalled();
        });

        it('should call onSignOut', () => {
            oAuthMock('signOut');

            expect(onSignOut).toHaveBeenCalledTimes(1);
            expect(onSignIn).not.toHaveBeenCalled();
            expect(onSignInFailure).not.toHaveBeenCalled();
            expect(onStartSignIn).not.toHaveBeenCalled();
        });

        it('should not call authentication events', () => {
            oAuthMock('unknownEvent');

            expect(onSignOut).not.toHaveBeenCalled();
            expect(onSignIn).not.toHaveBeenCalled();
            expect(onSignInFailure).not.toHaveBeenCalled();
            expect(onStartSignIn).not.toHaveBeenCalled();
        });
    });

    it('should refresh authentication state', () => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: 'isAuthenticatedMock', isInitialized: false },
            { refreshAuthState: refreshAuthStateMock }
        ]);

        runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        expect(refreshAuthStateMock).toHaveBeenCalledTimes(1);
    });

    it('should not refresh authentication state when isInitialized is true', () => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: 'isAuthenticatedMock', isInitialized: true },
            { refreshAuthState: refreshAuthStateMock }
        ]);

        runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        expect(refreshAuthStateMock).not.toHaveBeenCalled();
    });

    it('should not refresh authentication state when canInitialize is false', () => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: 'isAuthenticatedMock', isInitialized: false },
            { refreshAuthState: refreshAuthStateMock }
        ]);

        runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: false }),
            { deps: defaultDeps }
        );

        expect(refreshAuthStateMock).not.toHaveBeenCalled();
    });
});
