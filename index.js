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

window.addEventListener('locationchange', () => {
    RequstParams.init();
})

window.addEventListener('load', () => {
    RequstParams.init();
});

class RequstParam {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    onChange(callback) {
        if(RequstParams.util.isValid(callback)) {
            if(this.callbacks === undefined) {
                this.callbacks = [];
            }
            this.callbacks.push(callback);
        } else {
            RequstParams.util.logger.error('could not register invalid (undefined) callback on param: ' + key);
        }
    }
    dispatchChange(newValue, oldValue, key) {
        this.callbacks.forEach(function(callback) {
            callback(newValue, oldValue, key);
        });
    }
}
const RequstParams = {
    params: {
        values: {},
        getParam: (key) => {
            let param = RequstParams.params.values[key];
            if(param === undefined) {
                param = RequstParams.util.createRequestParam(key)
                RequstParams.params.values[key] = param;
            }
            return param;
        }
    },
    param: (key) => {
        return RequstParams.params.getParam(key);
    },
    init: () => {
        let params = new URLSearchParams(window.location.search);
        for(const [key, value] of params) {
            let param = RequstParams.params.getParam(key);
            if(param.value !== value) {
                let oldValue = param.value;
                param.value = value;
                param.dispatchChange(value, oldValue, key);
            }
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
