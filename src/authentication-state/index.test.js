import { runHookWithDi } from '@codexporer.io/react-test-utils';
import { Auth } from '@aws-amplify/auth';
import { selector } from '@codexporer.io/expo-link-stores';
import {
    useAuthenticationStateActions,
    useAuthenticationState,
    Store
} from './index';

jest.mock('@codexporer.io/expo-link-stores', () => ({
    initialState: { linkStoresState: 'test' },
    actions: {
        getLinkedStore: store => ({ getState }) => getState().linkedStores[store]
    },
    selector: jest.fn()
}));

jest.mock('@aws-amplify/auth', () => ({
    Auth: {
        currentAuthenticatedUser: jest.fn(),
        federatedSignIn: jest.fn(),
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        confirmSignUp: jest.fn(),
        resendSignUp: jest.fn(),
        forgotPassword: jest.fn(),
        forgotPasswordSubmit: jest.fn()
    },
    CognitoHostedUIIdentityProvider: {
        Google: 'Google',
        Apple: 'Apple'
    }

}));

describe('Authentication State', () => {
    beforeEach(() => {
        selector.mockReturnValue('mockSelectorResult');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should have actions and initial state', () => {
        const { initialState, actions } = Store;

        expect(initialState).toEqual({
            linkStoresState: 'test',
            isInitialized: false,
            user: undefined,
            isAuthenticated: false
        });
        expect(actions).toEqual({
            getLinkedStore: expect.any(Function),
            refreshAuthState: expect.any(Function),
            getIsAuthenticated: expect.any(Function),
            signInWithHostedUi: expect.any(Function),
            signInWithGoogle: expect.any(Function),
            signInWithApple: expect.any(Function),
            signOut: expect.any(Function),
            signInWithUsername: expect.any(Function),
            signUpWithUsername: expect.any(Function),
            confirmSignUpWithUsername: expect.any(Function),
            resendSignUpWithUsername: expect.any(Function),
            forgotPasswordWithUsername: expect.any(Function),
            forgotPasswordSubmitWithUsername: expect.any(Function)
        });
    });

    describe('refreshAuthState', () => {
        it('should call setState when user authenticated', async () => {
            Auth.currentAuthenticatedUser.mockResolvedValue('user');
            const setState = jest.fn();
            const { actions: { refreshAuthState } } = Store;
            const thunk = refreshAuthState();

            await thunk({ setState });

            expect(setState).toHaveBeenCalledTimes(2);
            expect(setState).toHaveBeenCalledWith({ user: 'user', isAuthenticated: true });
            expect(setState).toHaveBeenCalledWith({ isInitialized: true });
        });

        it('should call setState when user not authenticated', async () => {
            Auth.currentAuthenticatedUser.mockResolvedValue(null);
            const setState = jest.fn();
            const { actions: { refreshAuthState } } = Store;
            const thunk = refreshAuthState();

            await thunk({ setState });

            expect(setState).toHaveBeenCalledTimes(2);
            expect(setState).toHaveBeenCalledWith({ user: null, isAuthenticated: false });
            expect(setState).toHaveBeenCalledWith({ isInitialized: true });
        });

        it('should call setState when authentication failed', async () => {
            Auth.currentAuthenticatedUser = jest.fn().mockRejectedValue();
            const setState = jest.fn();
            const { actions: { refreshAuthState } } = Store;
            const thunk = refreshAuthState();

            await thunk({ setState });

            expect(setState).toHaveBeenCalledTimes(2);
            expect(setState).toHaveBeenCalledWith({ user: null, isAuthenticated: false });
            expect(setState).toHaveBeenCalledWith({ isInitialized: true });
        });
    });

    describe('getIsAuthenticated', () => {
        it('should call getState and return isAuthenticated', async () => {
            const getState = jest.fn(() => ({ isAuthenticated: true }));
            const { actions: { getIsAuthenticated } } = Store;
            const thunk = getIsAuthenticated();

            const isAuthenticated = await thunk({ getState });

            expect(getState).toHaveBeenCalledTimes(1);
            expect(isAuthenticated).toEqual(true);
        });
    });

    describe('signInWithHostedUi', () => {
        it('should call federatedSignIn and return resolved value', async () => {
            Auth.federatedSignIn = jest.fn().mockResolvedValue('success');
            const { actions: { signInWithHostedUi } } = Store;
            const thunk = signInWithHostedUi();

            const result = await thunk();

            expect(Auth.federatedSignIn).toHaveBeenCalledTimes(1);
            expect(result).toEqual('success');
        });

        it('should call federatedSignIn and return rejected value', async () => {
            Auth.federatedSignIn = jest.fn().mockRejectedValue('error');
            const { actions: { signInWithHostedUi } } = Store;

            const thunk = signInWithHostedUi();

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signInWithGoogle', () => {
        it('should call federatedSignIn and return resolved value', async () => {
            Auth.federatedSignIn = jest.fn().mockResolvedValue('success');
            const { actions: { signInWithGoogle } } = Store;
            const thunk = signInWithGoogle();

            const result = await thunk();

            expect(Auth.federatedSignIn).toHaveBeenCalledTimes(1);
            expect(Auth.federatedSignIn).toHaveBeenCalledWith({ provider: 'Google' });
            expect(result).toEqual('success');
        });

        it('should call federatedSignIn and return rejected value', async () => {
            Auth.federatedSignIn = jest.fn().mockRejectedValue('error');
            const { actions: { signInWithGoogle } } = Store;

            const thunk = signInWithGoogle();

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signInWithApple', () => {
        it('should call federatedSignIn and return resolved value', async () => {
            Auth.federatedSignIn = jest.fn().mockResolvedValue('success');
            const { actions: { signInWithApple } } = Store;
            const thunk = signInWithApple();

            const result = await thunk();

            expect(Auth.federatedSignIn).toHaveBeenCalledTimes(1);
            expect(Auth.federatedSignIn).toHaveBeenCalledWith({ provider: 'Apple' });
            expect(result).toEqual('success');
        });

        it('should call federatedSignIn and return rejected value', async () => {
            Auth.federatedSignIn = jest.fn().mockRejectedValue('error');
            const { actions: { signInWithApple } } = Store;

            const thunk = signInWithApple();

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signOut', () => {
        it('should call signOut and return resolved value', async () => {
            Auth.signOut = jest.fn().mockResolvedValue('success');
            const { actions: { signOut } } = Store;
            const thunk = signOut();

            const result = await thunk();

            expect(Auth.signOut).toHaveBeenCalledTimes(1);
            expect(result).toEqual('success');
        });

        it('should call signOut and return rejected value', async () => {
            Auth.signOut = jest.fn().mockRejectedValue('error');
            const { actions: { signOut } } = Store;

            const thunk = signOut();

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signInWithUsername', () => {
        it('should call signIn and return resolved value', async () => {
            Auth.signIn = jest.fn().mockResolvedValue('success');
            const { actions: { signInWithUsername } } = Store;
            const thunk = signInWithUsername({ username: 'testuser', password: 'testpass' });

            const result = await thunk();

            expect(Auth.signIn).toHaveBeenCalledTimes(1);
            expect(Auth.signIn).toHaveBeenCalledWith('testuser', 'testpass');
            expect(result).toEqual('success');
        });

        it('should call signIn and return rejected value', async () => {
            Auth.signIn = jest.fn().mockRejectedValue('error');
            const { actions: { signInWithUsername } } = Store;
            const thunk = signInWithUsername({ username: 'testuser', password: 'testpass' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signUpWithUsername', () => {
        it('should call signUp and return resolved value', async () => {
            Auth.signUp = jest.fn().mockResolvedValue('success');
            const { actions: { signUpWithUsername } } = Store;
            const thunk = signUpWithUsername({ username: 'testuser', password: 'testpass' });

            const result = await thunk();

            expect(Auth.signUp).toHaveBeenCalledTimes(1);
            expect(Auth.signUp).toHaveBeenCalledWith({ username: 'testuser', password: 'testpass' });
            expect(result).toEqual('success');
        });

        it('should call signUp and return rejected value', async () => {
            Auth.signUp = jest.fn().mockRejectedValue('error');
            const { actions: { signUpWithUsername } } = Store;
            const thunk = signUpWithUsername({ username: 'testuser', password: 'testpass' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('confirmSignUpWithUsername', () => {
        it('should call confirmSignUp and return resolved value', async () => {
            Auth.confirmSignUp = jest.fn().mockResolvedValue('success');
            const { actions: { confirmSignUpWithUsername } } = Store;
            const thunk = confirmSignUpWithUsername({ username: 'testuser', code: 'testcode' });

            const result = await thunk();

            expect(Auth.confirmSignUp).toHaveBeenCalledTimes(1);
            expect(Auth.confirmSignUp).toHaveBeenCalledWith('testuser', 'testcode');
            expect(result).toEqual('success');
        });

        it('should call confirmSignUp and return rejected value', async () => {
            Auth.confirmSignUp = jest.fn().mockRejectedValue('error');
            const { actions: { confirmSignUpWithUsername } } = Store;
            const thunk = confirmSignUpWithUsername({ username: 'testuser', code: 'testcode' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('resendSignUpWithUsername', () => {
        it('should call resendSignUp and return resolved value', async () => {
            Auth.resendSignUp = jest.fn().mockResolvedValue('success');
            const { actions: { resendSignUpWithUsername } } = Store;
            const thunk = resendSignUpWithUsername({ username: 'testuser' });

            const result = await thunk();

            expect(Auth.resendSignUp).toHaveBeenCalledTimes(1);
            expect(Auth.resendSignUp).toHaveBeenCalledWith('testuser');
            expect(result).toEqual('success');
        });

        it('should call resendSignUp and return rejected value', async () => {
            Auth.resendSignUp = jest.fn().mockRejectedValue('error');
            const { actions: { resendSignUpWithUsername } } = Store;
            const thunk = resendSignUpWithUsername({ username: 'testuser' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('forgotPasswordWithUsername', () => {
        it('should call resendSignUp and return resolved value', async () => {
            Auth.forgotPassword = jest.fn().mockResolvedValue('success');
            const { actions: { forgotPasswordWithUsername } } = Store;
            const thunk = forgotPasswordWithUsername({ username: 'testuser' });

            const result = await thunk();

            expect(Auth.forgotPassword).toHaveBeenCalledTimes(1);
            expect(Auth.forgotPassword).toHaveBeenCalledWith('testuser');
            expect(result).toEqual('success');
        });

        it('should call resendSignUp and return rejected value', async () => {
            Auth.forgotPassword = jest.fn().mockRejectedValue('error');
            const { actions: { forgotPasswordWithUsername } } = Store;
            const thunk = forgotPasswordWithUsername({ username: 'testuser' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('forgotPasswordSubmitWithUsername', () => {
        it('should call resendSignUp and return resolved value', async () => {
            Auth.forgotPasswordSubmit = jest.fn().mockResolvedValue('success');
            const { actions: { forgotPasswordSubmitWithUsername } } = Store;
            const thunk = forgotPasswordSubmitWithUsername({ username: 'testuser', code: 'testcode', password: 'testpass' });

            const result = await thunk();

            expect(Auth.forgotPasswordSubmit).toHaveBeenCalledTimes(1);
            expect(Auth.forgotPasswordSubmit).toHaveBeenCalledWith('testuser', 'testcode', 'testpass');
            expect(result).toEqual('success');
        });

        it('should call resendSignUp and return rejected value', async () => {
            Auth.forgotPasswordSubmit = jest.fn().mockRejectedValue('error');
            const { actions: { forgotPasswordSubmitWithUsername } } = Store;
            const thunk = forgotPasswordSubmitWithUsername({ username: 'testuser', code: 'testcode', password: 'testpass' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('useAuthenticationState', () => {
        it('should return expected state and actions', () => {
            const { initialState } = Store;

            const hookRunner = runHookWithDi(
                () => useAuthenticationState()
            );

            expect(hookRunner.hookResult).toEqual([
                'mockSelectorResult',
                {
                    getLinkedStore: expect.any(Function),
                    refreshAuthState: expect.any(Function),
                    getIsAuthenticated: expect.any(Function),
                    signInWithHostedUi: expect.any(Function),
                    signInWithGoogle: expect.any(Function),
                    signInWithApple: expect.any(Function),
                    signOut: expect.any(Function),
                    signInWithUsername: expect.any(Function),
                    signUpWithUsername: expect.any(Function),
                    confirmSignUpWithUsername: expect.any(Function),
                    resendSignUpWithUsername: expect.any(Function),
                    forgotPasswordWithUsername: expect.any(Function),
                    forgotPasswordSubmitWithUsername: expect.any(Function)
                }
            ]);
            expect(selector).toHaveBeenCalledTimes(1);
            expect(selector).toHaveBeenCalledWith(initialState);
        });
    });

    describe('useAuthenticationStateActions', () => {
        it('should return expected state and actions', () => {
            const hookRunner = runHookWithDi(
                () => useAuthenticationStateActions()
            );

            expect(hookRunner.hookResult).toEqual([
                undefined,
                {
                    getLinkedStore: expect.any(Function),
                    refreshAuthState: expect.any(Function),
                    getIsAuthenticated: expect.any(Function),
                    signInWithHostedUi: expect.any(Function),
                    signInWithGoogle: expect.any(Function),
                    signInWithApple: expect.any(Function),
                    signOut: expect.any(Function),
                    signInWithUsername: expect.any(Function),
                    signUpWithUsername: expect.any(Function),
                    confirmSignUpWithUsername: expect.any(Function),
                    resendSignUpWithUsername: expect.any(Function),
                    forgotPasswordWithUsername: expect.any(Function),
                    forgotPasswordSubmitWithUsername: expect.any(Function)
                }
            ]);
        });
    });
});
