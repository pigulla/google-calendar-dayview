import ExtendableError from 'es6-error';

export default class FetchError extends ExtendableError {
    constructor(message = 'Fetch failed', response = null) {
        super(message);

        this.response = response;
    }
}
