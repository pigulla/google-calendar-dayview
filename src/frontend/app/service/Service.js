import assert from 'assert-plus';

export default class Service {
    constructor(options) {
        assert.object(options, 'options');
        assert.func(options.fn, 'options.fn');
        assert.finite(options.interval, 'options.interval');
        assert.optionalObject(options.context, 'options.context');
        assert.optionalBool(options.start, 'options.start');

        this._interval_id = null;
        this._fn = options.fn;
        this._interval = options.interval;
        this._context = 'context' in options ? options.context : this;
    }

    _run() {
        return this._fn.call(this._context);
    }

    async start() {
        if (!this.is_running) {
            await this._run();
            this._interval_id = setInterval(::this._run, this._interval);
        }
    }

    stop() {
        if (this.is_running) {
            clearInterval(this._interval);
            this._interval_id = null;
        }
    }

    get is_running() {
        return this._interval_id !== null;
    }
}
