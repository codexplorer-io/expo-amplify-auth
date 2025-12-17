import {
    getCurrentUser,
    signUp,
    confirmSignUp,
    resendSignUpCode,
    resetPassword,
    confirmResetPassword,
    signInWithRedirect,
    signIn,
    signOut
} from 'aws-amplify/auth';
import {
    CognitoIdentityProviderClient,
    DeleteUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import {
    createStore,
    createStateHook,
    createActionsHook
} from 'react-sweet-state';
import {
    initialState,
    actions
} from '@codexporer.io/expo-link-stores';
import { useEffect, useMemo } from 'react';
import { useAuthenticationEvents, useAuthenticationEventsSubscriberActions } from '../authentication-events';

const refreshAuthState = () => async ({ setState }) => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('User does not exist.');
        }

        setState({
            user,
            isAuthenticated: true
        });
    } catch (error) {
        setState({
            user: null,
            isAuthenticated: false
        });
    }
};

export const Store = createStore({
    initialState: {
        ...initialState,
        isInitialized: false,
        user: undefined,
        awsCognitoRegion: undefined,
        isAuthenticated: false
    },
    actions: {
        ...actions,
        initializeAuthState: ({ awsCognitoRegion }) => async ({ setState, dispatch }) => {
            await dispatch(refreshAuthState());

            setState({
                isInitialized: true,
                awsCognitoRegion
            });
        },
        refreshAuthState,
        getIsAuthenticated: () => ({ getState }) => getState().isAuthenticated,
        signInWithHostedUi: () => () => signInWithRedirect(),
        signInWithGoogle: () => () => signInWithRedirect({
            provider: 'Google',
            options: {
                preferPrivateSession: true
            }
        }),
        signInWithApple: () => () => signInWithRedirect({
            provider: 'Apple',
            options: {
                preferPrivateSession: true
            }
        }),
        signOut: ({ global } = {}) => () => signOut({ global }),
        signInWithUsername: ({ username, password }) => () => signIn({ username, password }),
        signUpWithUsername: ({ username, password }) => () => signUp({ username, password }),
        confirmSignUpWithUsername: ({ username, code }) => () => confirmSignUp({
            username,
            confirmationCode: code
        }),
        resendSignUpWithUsername: ({ username }) => () => resendSignUpCode({ username }),
        forgotPasswordWithUsername: ({ username }) => () => resetPassword({ username }),
        forgotPasswordSubmitWithUsername: ({
            username,
            code,
            password
        }) => () => confirmResetPassword({
            username,
            confirmationCode: code,
            newPassword: password
        }),
        deleteAccount: () => async ({ getState, setState }) => {
            const { user, awsCognitoRegion } = getState();
            const client = new CognitoIdentityProviderClient({
                region: awsCognitoRegion
            });
            const command = new DeleteUserCommand(
                { AccessToken: user.signInUserSession.accessToken.jwtToken }
            );
            const response = await client.send(command);
            if (response?.$metadata?.httpStatusCode !== 200) {
                throw new Error('Could not delete user account!');
            }

            setState({ isAuthenticated: false });
        }
    },
    name: 'AuthenticationState'
});

export const useAuthenticationState = createStateHook(Store);

export const useIsAuthenticated = createStateHook(Store, {
    selector: ({ isAuthenticated }) => isAuthenticated
});

const useAuthenticationStateActionsInternal = createActionsHook(Store);

export const useAuthenticationStateActions = () => {
    const actions = useAuthenticationStateActionsInternal();
    const [, { setRefreshAuthState }] = useAuthenticationEventsSubscriberActions();
    const { onStartSignOut } = useAuthenticationEvents();

    useEffect(() => {
        setRefreshAuthState(actions.refreshAuthState);
    }, [
        actions.refreshAuthState,
        setRefreshAuthState
    ]);

    return useMemo(() => ({
        ...actions,
        signOut: async (...args) => {
            await onStartSignOut();
            return signOut(...args);
        }
    }), [
        actions,
        onStartSignOut
    ]);
};
