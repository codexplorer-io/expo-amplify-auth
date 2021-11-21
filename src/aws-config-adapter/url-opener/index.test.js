import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { urlOpener } from './index';

jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn()
}));

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn(),
    dismissBrowser: jest.fn()
}));

describe('URL Opener', () => {
    beforeEach(() => {
        WebBrowser.openAuthSessionAsync.mockResolvedValue({
            type: 'success',
            url: 'testNewUrl'
        });
        Linking.openURL.mockResolvedValue();
        Platform.OS = 'android';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call openAuthSessionAsync', async () => {
        await urlOpener('testUrl', 'testRedirectUrl');

        expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledTimes(1);
        expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith('testUrl', 'testRedirectUrl');
    });

    it('should dismiss browser and open url', async () => {
        Platform.OS = 'ios';

        await urlOpener('testUrl', 'testRedirectUrl');

        expect(WebBrowser.dismissBrowser).toHaveBeenCalledTimes(1);
        expect(Linking.openURL).toHaveBeenCalledTimes(1);
        expect(Linking.openURL).toHaveBeenCalledWith('testNewUrl');
    });

    it('should not open url when type not success', async () => {
        Platform.OS = 'ios';
        WebBrowser.openAuthSessionAsync.mockResolvedValue({
            type: 'failed',
            url: 'testNewUrl'
        });

        await urlOpener('testUrl', 'testRedirectUrl');

        expect(WebBrowser.dismissBrowser).toHaveBeenCalledTimes(0);
        expect(Linking.openURL).toHaveBeenCalledTimes(0);
    });

    it('should not open url when OS not IOS', async () => {
        Platform.OS = 'android';

        await urlOpener('testUrl', 'testRedirectUrl');

        expect(WebBrowser.dismissBrowser).toHaveBeenCalledTimes(0);
        expect(Linking.openURL).toHaveBeenCalledTimes(0);
    });
});
