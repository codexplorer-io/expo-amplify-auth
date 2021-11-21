import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export const urlOpener = async (url, redirectUrl) => {
    const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(
        url,
        redirectUrl
    );

    if (type === 'success' && Platform.OS === 'ios') {
        WebBrowser.dismissBrowser();
        await Linking.openURL(newUrl);
    }
};
