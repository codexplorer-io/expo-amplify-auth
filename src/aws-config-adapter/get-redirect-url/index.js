import * as Linking from 'expo-linking';
import split from 'lodash/split';
import find from 'lodash/find';
import startsWith from 'lodash/startsWith';

export const getRedirectUrl = config => {
    const allowedUrls = split(config.oauth.redirectSignIn, ',');
    const currentUrl = Linking.makeUrl();
    return find(allowedUrls, allowedUrl => startsWith(allowedUrl, currentUrl));
};
