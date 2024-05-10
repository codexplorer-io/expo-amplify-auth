import assign from 'lodash/assign';
import { getRedirectUrl } from './get-redirect-url';

export const configAdapter = config => {
    const redirectUrl = getRedirectUrl(config);
    if (!redirectUrl) {
        // eslint-disable-next-line no-console
        console.error('Redirect url was not found.');
    }

    assign(config, {
        oauth: {
            ...config.oauth,
            redirectSignIn: redirectUrl,
            redirectSignOut: redirectUrl
        }
    });
};
