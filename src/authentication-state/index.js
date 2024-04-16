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
    createHook,
    createStateHook
} from 'react-sweet-state';
import {
    initialState,
    actions,
    selector
} from '@codexporer.io/expo-link-stores';

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
            provider: 'Google'
        }),
        signInWithApple: () => () => signInWithRedirect({
            provider: 'Apple'
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

export const useAuthenticationState = createHook(Store, { selector: state => selector(state) });

export const useAuthenticationStateActions = createHook(Store, {
    selector: null
});

export const useIsAuthenticated = createStateHook(Store, {
    selector: ({ isAuthenticated }) => isAuthenticated
});
