# js-request-parameters

Manipulate URL parameters with vanilla JS (*no* jQuery needed).

## Getting started

Just add requestParams.js to your page and you are ready to go, no other dependecies required.

## Examples

**Initialize** an object to interact with URL parameters...
```javascript
let params = UrlParams.init();
params.get('count');
```
...or just use the convenience function **urlParam(_key_)** built in for this...
```javascript
urlParam('count');
```

**Get value** of a parameter (returns `undefined` if not set).
```javascript
let count = params.get('count').value();
//or
count = urlParam('count').value();
```

**Get value** of a parameter, **if it is set**.
```javascript
let count;
if(params.get('count').isSet()) {
    count = urlParam('count').value();
} else {
    count = //whatever
}
```

**Set value** of a parameter.
```javascript
params.get('answerToLifeUniverseAndEverything').value(42);

//or directly affect the way the api sets the parameter (see API documentation)
urlParam('answerToLifeUniverseAndEverything').value(42, {
    push: true,
    state: {
        page: 1,
        user: 'algoristic'
    }
})
```

**Remove** a parameter from an URL.
```javascript
params.get('count').remove();
```

**Listen** for **value changes** on an URL parameter.
```javascript
params.get('count').onChange((value, oldValue, key) => {
    console.log(`param '${key}' changed -> [old=${oldVal}, new=${val}]`);
});
```

Define **custom functions**, depending on a parameter's current state.
```javascript
for(key of [ 'count', 'msg', 'foo' ]) {
    params.get(key).check({
        callbackIfExists: (value) => {
            console.log(`param: '${key}' exists`);
        },
        callbackIfNotExists: () => {
            console.log(`param: '${key}' does not exist`);
        }
    });
}
```

## UrlParam API

`UrlParams.init()` `.get(` _key_ `)` **or** `urlParam(` _key_ `)` return an `UrlParam` object, no matter if the parameter is set or not. `UrlParam` offers the following methods:

|Method|Description|
|---|---|
|`value(`&nbsp;`)`|Returns the value of the parameter or `undefined` if it is not set.|
|`value(`&nbsp;_value_&nbsp;`)`|Sets the value of the parameter, if _value !== undefined_ (use `UrlParam::remove` for that purpose).|
|`value(` _value_, _options_ `)`|The **UrlParam API** makes use of the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API). If you are already familiar to manipulate the states via `history.pushState` and `history.replaceState` you can directly affect the way the **UrlParam API** sets the parameter values, for a greater control over the browser behaviour. The _options_ object can consist of the following values:<br>|
|`isSet(` `)`||
|`remove(` `)`||
|`remove(` _options_ `)`||
|`onchange(` _callback_ `)`||
|`check(` `)`||
|`check(` _options_ `)`||
