import { Hub } from 'aws-amplify/utils';
import { injectable } from 'react-magnetic-di';
import { runHookWithDi } from '@codexporer.io/react-test-utils';
import { useAuthenticationState } from '../authentication-state';
import { useAuthenticationEvents } from '../authentication-events';
import { useInitializeAuthentication } from './index';

jest.mock('aws-amplify/utils', () => ({
    Hub: {
        listen: jest.fn()
    }
}));

describe('useInitializeAuthentication', () => {
    const useAuthenticationStateMock = jest.fn();
    const authenticationEventsMock = {
        onStartSignIn: jest.fn(),
        onSignIn: jest.fn(),
        onSignInFailure: jest.fn(),
        onSignOut: jest.fn()
    };
    const initializeAuthStateMock = jest.fn();

    const defaultDeps = [
        injectable(useAuthenticationState, useAuthenticationStateMock),
        injectable(useAuthenticationEvents, () => authenticationEventsMock)
    ];

    beforeEach(() => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: true, isInitialized: true },
            { initializeAuthState: initializeAuthStateMock }
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
        const removeMock = jest.fn();
        Hub.listen.mockReturnValue(removeMock);

        runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        expect(Hub.listen).toHaveBeenCalledTimes(1);
        expect(removeMock).not.toHaveBeenCalled();
    });

    it('should call remove function', () => {
        const removeMock = jest.fn();
        Hub.listen.mockReturnValue(removeMock);

        const hookRunner = runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        hookRunner.unmount();

        expect(removeMock).toHaveBeenCalledTimes(1);
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
            oAuthMock('signedIn');

            expect(onSignIn).toHaveBeenCalledTimes(1);
            expect(onSignOut).not.toHaveBeenCalled();
            expect(onStartSignIn).not.toHaveBeenCalled();
            expect(onSignInFailure).not.toHaveBeenCalled();
        });

        it('should call signIn for redirect', () => {
            oAuthMock('signInWithRedirect');

            expect(onSignIn).toHaveBeenCalledTimes(1);
            expect(onSignOut).not.toHaveBeenCalled();
            expect(onStartSignIn).not.toHaveBeenCalled();
            expect(onSignInFailure).not.toHaveBeenCalled();
        });

        it('should call onSignInFailure', () => {
            oAuthMock('signInWithRedirect_failure');

            expect(onSignInFailure).toHaveBeenCalledTimes(1);
            expect(onSignIn).not.toHaveBeenCalled();
            expect(onSignOut).not.toHaveBeenCalled();
            expect(onStartSignIn).not.toHaveBeenCalled();
        });

        it('should call onSignOut', () => {
            oAuthMock('signedOut');

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

    it('should initialize authentication state', () => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: 'isAuthenticatedMock', isInitialized: false },
            { initializeAuthState: initializeAuthStateMock }
        ]);

        runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        expect(initializeAuthStateMock).toHaveBeenCalledTimes(1);
    });

    it('should not initialize authentication state when isInitialized is true', () => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: 'isAuthenticatedMock', isInitialized: true },
            { initializeAuthState: initializeAuthStateMock }
        ]);

        runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: true }),
            { deps: defaultDeps }
        );

        expect(initializeAuthStateMock).not.toHaveBeenCalled();
    });

    it('should not initialize authentication state when canInitialize is false', () => {
        useAuthenticationStateMock.mockReturnValue([
            { isAuthenticated: 'isAuthenticatedMock', isInitialized: false },
            { initializeAuthState: initializeAuthStateMock }
        ]);

        runHookWithDi(
            () => useInitializeAuthentication({ canInitialize: false }),
            { deps: defaultDeps }
        );

        expect(initializeAuthStateMock).not.toHaveBeenCalled();
    });
});
