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

class UrlParam {
    constructor(key, paramValue) {
        this.key = key;
        this.paramValue = paramValue;
        this.callbacks = [];
    }
    onChange(callback) {
        if(UrlParams.util.isValid(callback)) {
            this.callbacks.push(callback);
        } else {
            UrlParams.util.logger.error('could not register invalid (undefined) callback on param: ' + key);
        }
    }
    value(value, options) {
        if(UrlParams.util.isValid(value)) {
            this.changeValue((params) => {
                params.set(this.key, value);
            }, options);
        } else {
            return this.paramValue;
        }
    }
    isSet() {
        return this.check();
    }
    check(options) {
        let isSet = (this.paramValue !== undefined);
        if(UrlParams.util.isValid(options)) {
            let { callbackIfExists, callbackIfNotExists } = options;
            if(isSet) {
                if(UrlParams.util.isValid(callbackIfExists)) {
                    callbackIfExists(this.paramValue);
                }
            } else {
                if(UrlParams.util.isValid(callbackIfNotExists)) {
                    callbackIfNotExists();
                }
            }
        }
        return isSet;
    }
    remove(options) {
        this.changeValue((params) => {
            params.delete(this.key);
            this.paramValue = undefined;
        }, options);
    }
    changeValue(valueChangeFunction, options) {
        let params = UrlParams.util.getQueryParams();
        valueChangeFunction(params);
        let { fn, state, title, callback } = UrlParams.util.parseValueChangeOptions(options);
        let queryString = UrlParams.util.getQueryString(params);
        fn.apply(history, [state, title, queryString]);
        callback();
    }
    dispatchChange(newValue, oldValue, key) {
        this.callbacks.forEach(function(callback) {
            callback(newValue, oldValue, key);
        });
    }
}

const UrlParams = {
    init: (options) => {
        UrlParams.params.load(options);
        window.addEventListener('locationchange', () => {
            UrlParams.params.load(options);
        })
        return {
            get: (key) => {
                return UrlParams.params.getParam(key, options);
            }
        }
    },
    params: {
        values: {},
        load: (options) => {
            let params = UrlParams.util.getQueryParams();
            for(const [key, value] of params) {
                let param = UrlParams.params.getParam(key);
                if(param.paramValue !== value) {
                    let oldValue = param.paramValue;
                    param.paramValue = value;
                    param.dispatchChange(value, oldValue, key);
                }
            }
        },
        getParam: (key, options) => {
            let param = UrlParams.params.values[key];
            if(param === undefined) {
                param = UrlParams.util.createUrlParam(key)
                UrlParams.params.values[key] = param;
            }
            return param;
        }
    },
    util: {
        isValid: (any) => {
            return (typeof any !== 'undefined');
        },
        createUrlParam: (key) => {
            let params = UrlParams.util.getQueryParams();
            let value;
            if(params.has(key)) {
                value = params.get(key);
            } else {
                value = undefined;
            }
            return new UrlParam(key, value);
        },
        parseValueChangeOptions: (options) => {
            let push, state, title, callback;
            if(UrlParams.util.isValid(options)) {
                ({ push, state, title, callback } = options);
            }
            let fn = (push || (push == 'true')) ? history.pushState : history.replaceState;
            if(!UrlParams.util.isValid(state)) {
                state = {
                    state: 'default'
                };
            }
            if(!UrlParams.util.isValid(title)) {
                title = '';
            }
            if(!UrlParams.util.isValid(callback)) {
                callback = () => {};
            }
            return {
                fn: fn,
                state: state,
                title: title,
                callback: callback
            };
        },
        getQueryParams: () => {
            let queryString = window.location.search;
            queryString = queryString.startsWith('?') ? queryString.slice(1) : queryString;
            return new URLSearchParams(queryString);
        },
        getQueryString: (params) => {
            let baseAddress = window.location.pathname;
            let queryString = params.toString();
            queryString = (queryString.length > 0) ? `${baseAddress}?${queryString}` : `${baseAddress}`;
            return queryString;
        },
        logger: {
            info: (msg) => {
                UrlParams.util.logger.log('INFO', msg);
            },
            error: (msg) => {
                UrlParams.util.logger.log('ERROR', msg);
            },
            log: (priority, msg) => {
                console.log(`[${priority}] ${msg}`);
            }
        }
    }
}

const defaultUrlParamsInstance = UrlParams.init();
urlParam = (key) => {
    return defaultUrlParamsInstance.get(key);
}
