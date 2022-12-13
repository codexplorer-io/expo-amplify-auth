import { Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import {
    CognitoIdentityProviderClient,
    DeleteUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import {
    createStore,
    createHook
} from 'react-sweet-state';
import {
    initialState,
    actions,
    selector
} from '@codexporer.io/expo-link-stores';

const refreshAuthState = () => async ({ setState }) => {
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
        signInWithHostedUi: () => () => Auth.federatedSignIn(),
        signInWithGoogle: () => () => Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Google
        }),
        signInWithApple: () => () => Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Apple
        }),
        signOut: ({ global } = {}) => () => Auth.signOut({ global }),
        signInWithUsername: ({ username, password }) => () => Auth.signIn(username, password),
        signUpWithUsername: ({ username, password }) => () => Auth.signUp({ username, password }),
        confirmSignUpWithUsername: ({ username, code }) => () => Auth.confirmSignUp(username, code),
        resendSignUpWithUsername: ({ username }) => () => Auth.resendSignUp(username),
        forgotPasswordWithUsername: ({ username }) => () => Auth.forgotPassword(username),
        forgotPasswordSubmitWithUsername: ({
            username,
            code,
            password
        }) => () => Auth.forgotPasswordSubmit(username, code, password),
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
