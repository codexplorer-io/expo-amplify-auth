import * as Linking from 'expo-linking';
import { getRedirectUrl } from './index';

jest.mock('expo-linking', () => ({
    createURL: jest.fn()
}));

const configMock = { oauth: { redirectSignIn: 'testurl1,testurl2,testurl3' } };

describe('Get Redirect URL', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return url when found', () => {
        Linking.createURL.mockReturnValue('testurl2');

        const resultUrl = getRedirectUrl(configMock);

        expect(resultUrl).toBe('testurl2');
    });

    it('should return undefined when url not found', () => {
        Linking.createURL.mockReturnValue('testurl4');

        const resultUrl = getRedirectUrl(configMock);

        expect(resultUrl).toBeUndefined();
    });
});
