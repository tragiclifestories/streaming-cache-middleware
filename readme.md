Streaming Cache Middleware
===============

Middleware for Express Nodejs web servers. Based on [streaming-cache](https://www.npmjs.com/package/streaming-cache). 

Tested with Express 4.0 and Nodejs >= 4.0

Installation
------------

```npm i streaming-cache-middleware --save```

Quick example
-------------

```javascript

var express = require('express')
var cacheMiddleware = require('streaming-cache-middleware');

var app = express();

app.use(cacheMiddleware());

```


Config
---

The config defaults are: 

```javascript

{
    enabled: true,
    maxCacheSizeBytes: 1610612736,
    maxAgeMs: 5000,
    cacheableHttpStatusCodes: [200, 304],
    cacheableHeaders: ['Content-Encoding', 'Content-Length', 'Content-Type', 'ETag', 'Transfer-Encoding', 'Vary'],
    uncacheableRoutePrefixes: []
};

```

`uncacheableRoutePrefixes` is used to short-circuit caching where it's known in advance that a route cannot be cached. 
