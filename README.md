# js-request-parameters

Manipulate request parametes with vanilla JS (no jQuery needed).

## Getting started

Just add requestParams.js to your page and you are ready to go, no other dependecies required.

## Examples

```javascript
//before url=https://localhost
requestParams.set('page', 'settings');
//after url=https://localhost?page=settings

//before url=https://localhost?page=home
requestParams.set('page', 'settings');
//after url=https://localhost?page=settings

//url=https://localhost?page=home
let page = requestParams.get('page'); // returns 'home'
```
