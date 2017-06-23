import { NO_CONTENT } from 'http-status-codes';

import FetchError from 'app/FetchError';

export default async function fetch_and_parse(url, options = {}) {
    let response;

    try {
        response = await fetch(url, options);
    } catch (error) {
        throw (error instanceof FetchError ? error : new FetchError(error.message, null));
    }

    if (response.status >= 400) {
        throw new FetchError(`Fetch failed with status code ${response.status}`, response);
    }

    if (response.status === NO_CONTENT) {
        return null;
    }

    try {
        return await response.json();
    } catch (error) {
        throw new FetchError('Unparsable server response', response);
    }
}
