import { runHookWithDi } from '@codexporer.io/react-test-utils';
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

jest.mock('aws-amplify/auth', () => ({
    getCurrentUser: jest.fn(),
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    resendSignUpCode: jest.fn(),
    resetPassword: jest.fn(),
    confirmResetPassword: jest.fn(),
    signInWithRedirect: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn()
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
            initializeAuthState: expect.any(Function),
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
            forgotPasswordSubmitWithUsername: expect.any(Function),
            deleteAccount: expect.any(Function)
        });
    });

    describe('initializeAuthState', () => {
        it('should call setState with user and initialization data', async () => {
            getCurrentUser.mockResolvedValue('user');
            const setState = jest.fn();
            const dispatch = jest.fn(fn => fn({ setState }));
            const { actions: { initializeAuthState } } = Store;
            const thunk = initializeAuthState({ awsCognitoRegion: 'mockRegion' });

            await thunk({ setState, dispatch });

            expect(setState).toHaveBeenCalledTimes(2);
            expect(setState).toHaveBeenCalledWith({ user: 'user', isAuthenticated: true });
            expect(setState).toHaveBeenCalledWith({ isInitialized: true, awsCognitoRegion: 'mockRegion' });
        });
    });

    describe('refreshAuthState', () => {
        it('should call setState when user authenticated', async () => {
            getCurrentUser.mockResolvedValue('user');
            const setState = jest.fn();
            const { actions: { refreshAuthState } } = Store;
            const thunk = refreshAuthState();

            await thunk({ setState });

            expect(setState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledWith({ user: 'user', isAuthenticated: true });
        });

        it('should call setState when user not authenticated', async () => {
            getCurrentUser.mockResolvedValue(null);
            const setState = jest.fn();
            const { actions: { refreshAuthState } } = Store;
            const thunk = refreshAuthState();

            await thunk({ setState });

            expect(setState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledWith({ user: null, isAuthenticated: false });
        });

        it('should call setState when authentication failed', async () => {
            getCurrentUser.mockRejectedValue();
            const setState = jest.fn();
            const { actions: { refreshAuthState } } = Store;
            const thunk = refreshAuthState();

            await thunk({ setState });

            expect(setState).toHaveBeenCalledTimes(1);
            expect(setState).toHaveBeenCalledWith({ user: null, isAuthenticated: false });
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
        it('should call signInWithRedirect and return resolved value', async () => {
            signInWithRedirect.mockResolvedValue('success');
            const { actions: { signInWithHostedUi } } = Store;
            const thunk = signInWithHostedUi();

            const result = await thunk();

            expect(signInWithRedirect).toHaveBeenCalledTimes(1);
            expect(result).toEqual('success');
        });

        it('should call signInWithRedirect and return rejected value', async () => {
            signInWithRedirect.mockRejectedValue('error');
            const { actions: { signInWithHostedUi } } = Store;

            const thunk = signInWithHostedUi();

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signInWithGoogle', () => {
        it('should call signInWithRedirect and return resolved value', async () => {
            signInWithRedirect.mockResolvedValue('success');
            const { actions: { signInWithGoogle } } = Store;
            const thunk = signInWithGoogle();

            const result = await thunk();

            expect(signInWithRedirect).toHaveBeenCalledTimes(1);
            expect(signInWithRedirect).toHaveBeenCalledWith({
                provider: 'Google',
                options: {
                    preferPrivateSession: true
                }
            });
            expect(result).toEqual('success');
        });

        it('should call signInWithRedirect and return rejected value', async () => {
            signInWithRedirect.mockRejectedValue('error');
            const { actions: { signInWithGoogle } } = Store;

            const thunk = signInWithGoogle();

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signInWithApple', () => {
        it('should call signInWithRedirect and return resolved value', async () => {
            signInWithRedirect.mockResolvedValue('success');
            const { actions: { signInWithApple } } = Store;
            const thunk = signInWithApple();

            const result = await thunk();

            expect(signInWithRedirect).toHaveBeenCalledTimes(1);
            expect(signInWithRedirect).toHaveBeenCalledWith({
                provider: 'Apple',
                options: {
                    preferPrivateSession: true
                }
            });
            expect(result).toEqual('success');
        });

        it('should call signInWithRedirect and return rejected value', async () => {
            signInWithRedirect.mockRejectedValue('error');
            const { actions: { signInWithApple } } = Store;

            const thunk = signInWithApple();

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signOut', () => {
        it('should call signOut and return resolved value', async () => {
            signOut.mockResolvedValue('success');
            const { actions: { signOut: signOutAction } } = Store;
            const thunk = signOutAction();

            const result = await thunk();

            expect(signOut).toHaveBeenCalledTimes(1);
            expect(result).toEqual('success');
        });

        it('should call signOut and return rejected value', async () => {
            signOut.mockRejectedValue('error');
            const { actions: { signOut: signOutAction } } = Store;

            const thunk = signOutAction();

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signInWithUsername', () => {
        it('should call signIn and return resolved value', async () => {
            signIn.mockResolvedValue('success');
            const { actions: { signInWithUsername } } = Store;
            const thunk = signInWithUsername({ username: 'testuser', password: 'testpass' });

            const result = await thunk();

            expect(signIn).toHaveBeenCalledTimes(1);
            expect(signIn).toHaveBeenCalledWith({ username: 'testuser', password: 'testpass' });
            expect(result).toEqual('success');
        });

        it('should call signIn and return rejected value', async () => {
            signIn.mockRejectedValue('error');
            const { actions: { signInWithUsername } } = Store;
            const thunk = signInWithUsername({ username: 'testuser', password: 'testpass' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('signUpWithUsername', () => {
        it('should call signUp and return resolved value', async () => {
            signUp.mockResolvedValue('success');
            const { actions: { signUpWithUsername } } = Store;
            const thunk = signUpWithUsername({ username: 'testuser', password: 'testpass' });

            const result = await thunk();

            expect(signUp).toHaveBeenCalledTimes(1);
            expect(signUp).toHaveBeenCalledWith({ username: 'testuser', password: 'testpass' });
            expect(result).toEqual('success');
        });

        it('should call signUp and return rejected value', async () => {
            signUp.mockRejectedValue('error');
            const { actions: { signUpWithUsername } } = Store;
            const thunk = signUpWithUsername({ username: 'testuser', password: 'testpass' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('confirmSignUpWithUsername', () => {
        it('should call confirmSignUp and return resolved value', async () => {
            confirmSignUp.mockResolvedValue('success');
            const { actions: { confirmSignUpWithUsername } } = Store;
            const thunk = confirmSignUpWithUsername({ username: 'testuser', code: 'testcode' });

            const result = await thunk();

            expect(confirmSignUp).toHaveBeenCalledTimes(1);
            expect(confirmSignUp).toHaveBeenCalledWith({
                username: 'testuser',
                confirmationCode: 'testcode'
            });
            expect(result).toEqual('success');
        });

        it('should call confirmSignUp and return rejected value', async () => {
            confirmSignUp.mockRejectedValue('error');
            const { actions: { confirmSignUpWithUsername } } = Store;
            const thunk = confirmSignUpWithUsername({ username: 'testuser', code: 'testcode' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('resendSignUpWithUsername', () => {
        it('should call resendSignUpCode and return resolved value', async () => {
            resendSignUpCode.mockResolvedValue('success');
            const { actions: { resendSignUpWithUsername } } = Store;
            const thunk = resendSignUpWithUsername({ username: 'testuser' });

            const result = await thunk();

            expect(resendSignUpCode).toHaveBeenCalledTimes(1);
            expect(resendSignUpCode).toHaveBeenCalledWith({ username: 'testuser' });
            expect(result).toEqual('success');
        });

        it('should call resendSignUpCode and return rejected value', async () => {
            resendSignUpCode.mockRejectedValue('error');
            const { actions: { resendSignUpWithUsername } } = Store;
            const thunk = resendSignUpWithUsername({ username: 'testuser' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('forgotPasswordWithUsername', () => {
        it('should call resetPassword and return resolved value', async () => {
            resetPassword.mockResolvedValue('success');
            const { actions: { forgotPasswordWithUsername } } = Store;
            const thunk = forgotPasswordWithUsername({ username: 'testuser' });

            const result = await thunk();

            expect(resetPassword).toHaveBeenCalledTimes(1);
            expect(resetPassword).toHaveBeenCalledWith({ username: 'testuser' });
            expect(result).toEqual('success');
        });

        it('should call resetPassword and return rejected value', async () => {
            resetPassword.mockRejectedValue('error');
            const { actions: { forgotPasswordWithUsername } } = Store;
            const thunk = forgotPasswordWithUsername({ username: 'testuser' });

            expect(thunk).rejects.toEqual('error');
        });
    });

    describe('forgotPasswordSubmitWithUsername', () => {
        it('should call confirmResetPassword and return resolved value', async () => {
            confirmResetPassword.mockResolvedValue('success');
            const { actions: { forgotPasswordSubmitWithUsername } } = Store;
            const thunk = forgotPasswordSubmitWithUsername({
                username: 'testuser',
                code: 'testcode',
                password: 'testpass'
            });

            const result = await thunk();

            expect(confirmResetPassword).toHaveBeenCalledTimes(1);
            expect(confirmResetPassword).toHaveBeenCalledWith({
                username: 'testuser',
                confirmationCode: 'testcode',
                newPassword: 'testpass'
            });
            expect(result).toEqual('success');
        });

        it('should call confirmResetPassword and return rejected value', async () => {
            confirmResetPassword.mockRejectedValue('error');
            const { actions: { forgotPasswordSubmitWithUsername } } = Store;
            const thunk = forgotPasswordSubmitWithUsername({
                username: 'testuser',
                code: 'testcode',
                password: 'testpass'
            });

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
                    initializeAuthState: expect.any(Function),
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
                    forgotPasswordSubmitWithUsername: expect.any(Function),
                    deleteAccount: expect.any(Function)
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
                    initializeAuthState: expect.any(Function),
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
                    forgotPasswordSubmitWithUsername: expect.any(Function),
                    deleteAccount: expect.any(Function)
                }
            ]);
        });
    });
});
