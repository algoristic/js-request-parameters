history.pushState = (f => function pushState(){
    let result = f.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return result;
})(history.pushState);

history.replaceState = (f => function replaceState() {
    let result = f.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return result;
})(history.replaceState);

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
});

class RequstParam {
    constructor(key, paramValue) {
        this.key = key;
        this.paramValue = paramValue;
        this.callbacks = [];
    }
    onChange(callback) {
        if(RequstParams.util.isValid(callback)) {
            this.callbacks.push(callback);
        } else {
            RequstParams.util.logger.error('could not register invalid (undefined) callback on param: ' + key);
        }
    }
    value(value, options) {
        if(RequstParams.util.isValid(value)) {
            let queryString = window.location.search;
            queryString = queryString.startsWith('?') ? queryString.slice(1) : queryString;
            let currentParams = new URLSearchParams(queryString);
            currentParams.set(this.key, value);
            let { fn, state, title, callback } = RequstParams.util.parseValueChangeOptions(options);
            queryString = currentParams.toString();
            fn.apply(history, [state, title, `?${queryString}`]);
            callback();
        } else {
            return this.paramValue;
        }
    }
    isSet() {
        return this.check();
    }
    check(options) {
        let isSet = (this.paramValue !== undefined);
        if(RequstParams.util.isValid(options)) {
            let { callbackIfExists, callbackIfNotExists } = options;
            if(isSet) {
                if(RequstParams.util.isValid(callbackIfExists)) {
                    callbackIfExists(this.paramValue);
                }
            } else {
                if(RequstParams.util.isValid(callbackIfNotExists)) {
                    callbackIfNotExists();
                }
            }
        }
        return isSet;
    }
    dispatchChange(newValue, oldValue, key) {
        this.callbacks.forEach(function(callback) {
            callback(newValue, oldValue, key);
        });
    }
}

const RequstParams = {
    init: (options) => {
        RequstParams.params.load(options);
        window.addEventListener('locationchange', () => {
            RequstParams.params.load(options);
        })
        return {
            get: (key) => {
                return RequstParams.params.getParam(key, options);
            }
        }
    },
    params: {
        values: {},
        load: (options) => {
            let params = new URLSearchParams(window.location.search);
            for(const [key, value] of params) {
                let param = RequstParams.params.getParam(key);
                if(param.paramValue !== value) {
                    let oldValue = param.paramValue;
                    param.paramValue = value;
                    param.dispatchChange(value, oldValue, key);
                }
            }
        },
        getParam: (key, options) => {
            let param = RequstParams.params.values[key];
            if(param === undefined) {
                param = RequstParams.util.createRequestParam(key)
                RequstParams.params.values[key] = param;
            }
            return param;
        }
    },
    util: {
        isValid: (any) => {
            return (typeof any !== 'undefined');
        },
        createRequestParam: (key) => {
            let params = new URLSearchParams(window.location.search);
            let value;
            if(params.has(key)) {
                value = params.get(key);
            } else {
                value = undefined;
            }
            return new RequstParam(key, value);
        },
        parseValueChangeOptions: (options) => {
            let defaultMode = 'push';
            let mode, state, title, callback;
            if(RequstParams.util.isValid(options)) {
                ({ mode, state, title, callback } = options);
            }
            if(!RequstParams.util.isValid(mode)) {
                mode = defaultMode;
            }
            let fn;
            switch(mode) {
                case 'replace':
                    fn = history.replaceState;
                    break;
                case 'push':
                default:
                    fn = history.pushState;
                    if(mode !== 'push') {
                        RequstParams.util.logger.error(`unknown value-change mode (mode='${mode})' - use default (default='${defaultMode}')`);
                    }
                    break;
            }
            if(!RequstParams.util.isValid(state)) {
                state = {
                    state: 'default'
                };
            }
            if(!RequstParams.util.isValid(title)) {
                title = '';
            }
            if(!RequstParams.util.isValid(callback)) {
                callback = () => {};
            }
            return {
                fn: fn,
                state: state,
                title: title,
                callback: callback
            };
        },
        logger: {
            info: (msg) => {
                RequstParams.util.logger.log('INFO', msg);
            },
            error: (msg) => {
                RequstParams.util.logger.log('ERROR', msg);
            },
            log: (priority, msg) => {
                console.log(`[${priority}] ${msg}`);
            }
        }
    }
}
