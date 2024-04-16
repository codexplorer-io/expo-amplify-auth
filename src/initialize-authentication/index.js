import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { di } from 'react-magnetic-di';
import { useAuthenticationState } from '../authentication-state';
import { useAuthenticationEvents } from '../authentication-events';

export const useInitializeAuthentication = ({
    canInitialize,
    awsCognitoRegion
}) => {
    di(useAuthenticationEvents, useAuthenticationState);

    const [
        { isInitialized, isAuthenticated },
        { initializeAuthState }
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
                case 'signedIn':
                    onSignIn();
                    break;
                case 'signedOut':
                    onSignOut();
                    break;
                // TODO verify in native
                case 'signInWithRedirect':
                    onSignIn();
                    break;
                case 'signInWithRedirect_failure':
                    onSignInFailure();
                    break;
                /* Removed in v6
                case 'codeFlow':
                    onStartSignIn();
                    break;
                */
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
        canInitialize && !isInitialized && initializeAuthState({ awsCognitoRegion });
    }, [
        canInitialize,
        isInitialized,
        initializeAuthState,
        awsCognitoRegion
    ]);

    return { isInitialized, isAuthenticated };
};
