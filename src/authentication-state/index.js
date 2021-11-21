import { Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import {
    createStore,
    createHook
} from 'react-sweet-state';
import {
    initialState,
    actions,
    selector
} from '@codexporer.io/expo-link-stores';

export const Store = createStore({
    initialState: {
        ...initialState,
        isInitialized: false,
        user: undefined,
        isAuthenticated: false
    },
    actions: {
        ...actions,
        refreshAuthState: () => async ({ setState }) => {
            try {
                const user = await Auth.currentAuthenticatedUser();
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

            setState({ isInitialized: true });
        },
        getIsAuthenticated: () => ({ getState }) => getState().isAuthenticated,
        signInWithHostedUi: () => () => Auth.federatedSignIn(),
        signInWithGoogle: () => () => Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Google
        }),
        signInWithApple: () => () => Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Apple
        }),
        signOut: () => () => Auth.signOut(),
        signInWithUsername: ({ username, password }) => () => Auth.signIn(username, password),
        signUpWithUsername: ({ username, password }) => () => Auth.signUp({ username, password }),
        confirmSignUpWithUsername: ({ username, code }) => () => Auth.confirmSignUp(username, code),
        resendSignUpWithUsername: ({ username }) => () => Auth.resendSignUp(username),
        forgotPasswordWithUsername: ({ username }) => () => Auth.forgotPassword(username),
        forgotPasswordSubmitWithUsername: ({
            username,
            code,
            password
        }) => () => Auth.forgotPasswordSubmit(username, code, password)
    },
    name: 'AuthenticationState'
});

export const useAuthenticationState = createHook(Store, { selector: state => selector(state) });

export const useAuthenticationStateActions = createHook(Store, {
    selector: null
});
