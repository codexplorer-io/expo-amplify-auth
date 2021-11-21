import assign from 'lodash/assign';
import { urlOpener } from './url-opener';
import { getRedirectUrl } from './get-redirect-url';
import { configAdapter } from './index';

jest.mock('lodash/assign', () => jest.fn());

jest.mock('./url-opener', () => ({
    urlOpener: jest.fn()
}));

jest.mock('./get-redirect-url', () => ({
    getRedirectUrl: jest.fn()
}));

const configMock = { oauth: 'oauth config' };
// eslint-disable-next-line no-console
console.error = jest.fn();

describe('Config Adapter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should console error when url not found', () => {
        getRedirectUrl.mockReturnValue(undefined);

        configAdapter(configMock);

        // eslint-disable-next-line no-console
        expect(console.error).toHaveBeenCalledWith('Redirect url was not found.');
        expect(assign).toHaveBeenCalledTimes(1);
        expect(assign).toHaveBeenCalledWith(configMock, {
            oauth: {
                ...configMock.oauth,
                redirectSignIn: undefined,
                redirectSignOut: undefined,
                urlOpener
            }
        });
    });

    it('should call assign with correct params', () => {
        getRedirectUrl.mockReturnValue('testurl');

        configAdapter(configMock);

        expect(assign).toHaveBeenCalledTimes(1);
        expect(assign).toHaveBeenCalledWith(configMock, {
            oauth: {
                ...configMock.oauth,
                redirectSignIn: 'testurl',
                redirectSignOut: 'testurl',
                urlOpener
            }
        });
    });
});
