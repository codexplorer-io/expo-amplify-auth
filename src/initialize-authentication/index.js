import { useEffect } from 'react';
import { Hub } from '@aws-amplify/core';
import { di } from 'react-magnetic-di';
import { useAuthenticationState } from '../authentication-state';
import { useAuthenticationEvents } from '../authentication-events';

export const useInitializeAuthentication = ({ canInitialize }) => {
    di(useAuthenticationEvents, useAuthenticationState);

    const [
        { isInitialized, isAuthenticated },
        { refreshAuthState }
    ] = useAuthenticationState();
    const {
        onStartSignIn,
        onSignIn,
        onSignInFailure,
        onSignOut
    } = useAuthenticationEvents();

    // Subscribe to Hub for authentication events
    useEffect(() => {
        const onAuth = ({ payload: { event } }) => {
            switch (event) {
                case 'signIn':
                    onSignIn();
                    break;
                case 'signOut':
                    onSignOut();
                    break;
                case 'signIn_failure':
                    onSignInFailure();
                    break;
                case 'codeFlow':
                    onStartSignIn();
                    break;
                default:
                    break;
            }
        };
        Hub.listen('auth', onAuth);

        return () => {
            Hub.remove('auth', onAuth);
        };
    }, [
        onStartSignIn,
        onSignIn,
        onSignInFailure,
        onSignOut
    ]);

    // Initialize authentication
    useEffect(() => {
        canInitialize && !isInitialized && refreshAuthState();
    }, [
        canInitialize,
        isInitialized,
        refreshAuthState
    ]);

    return { isInitialized, isAuthenticated };
};
