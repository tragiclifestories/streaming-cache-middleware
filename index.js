'use strict';

var cacheSize = require('./lib/cacheSize');
var createCache = require('./lib/cache');
var hash = require('./lib/hash');
var devnull = require('dev-null');

var consoleLog = function (message) {
    console.log(message)
};

var noOp = function() {};

var defaultLogger = {
    info: noOp,
    warn: consoleLog,
    error: consoleLog
};

var defaults = {
    enabled: true,
    maxCacheSizeBytes: cacheSize.getAvailableCacheBytes(),
    maxAgeMs: 5 * 1000,
    cacheableHttpStatusCodes: [200, 304],
    cacheableHeaders: ['Content-Encoding', 'Content-Length', 'Content-Type', 'ETag', 'Transfer-Encoding', 'Vary'],
    uncacheableRoutePrefixes: []
};

var setHeadersToUncacheable = function (res) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
};

var setHeaders = function (opts, res, cachedHeaders) {
    opts.cacheableHeaders.forEach(function (header) {
        if (cachedHeaders &&
            cachedHeaders[header]) {
            res.set(header, cachedHeaders[header]);
        }
    });
};

var getCacheableHeaders = function (opts, res) {
    return opts.cacheableHeaders.reduce(function (headers, header) {
        headers[header] = res.get(header);
        return headers;
    }, {});
};

var isUncacheableRoute = function (opts, url) {
    return opts.uncacheableRoutePrefixes.some(function (prefix) {
        return url.toLowerCase().indexOf(prefix) === 0;
    });
};

var isETagMatch = function (req, metadata) {
    return metadata && metadata.headers && metadata.headers.ETag === req.get('If-None-Match');
};

var isResponseUncacheable = function (opts, res) {
    return opts.cacheableHttpStatusCodes.indexOf(res.statusCode) === -1 || res.nocache;
};

module.exports = function (config, log) {
    var opts = Object.assign({}, defaults, config);
    var logger = log || defaultLogger;
    var cache = createCache(opts);

    if (!opts.enabled) {
        return function (req, res, next) {
            next()
        }
    }

    logger.info('cache config: ' + JSON.stringify(opts, null, 2));

    var cacheMiddleware = function (req, res, next) {
        if (isUncacheableRoute(opts, req.url)) {
            setHeadersToUncacheable(res);
            return next();
        }

        var urlHash = hash.requestToHash(opts, req);

        if (cache.exists(urlHash)) {
            var metadata = cache.getMetadata(urlHash);
            if (metadata && metadata.headers) {
                setHeaders(opts, res, metadata.headers);
            }

            if (isETagMatch(req, metadata)) {
                return res.status(304).end();
            }

            var cachedStream = cache.get(urlHash);
            if (cachedStream) {
                return cachedStream.pipe(res);
            } else {
                logger.warn('cache item expired after metadata retrieval: ' + req.url);
                return next();
            }
        }

        logger.info('cache miss for ' + req.url);
        var pendingCacheStream = cache.set(urlHash);
        var cacheMetadata = cache.getMetadata(urlHash);

        var _write = res.write.bind(res);

        res.write = function (chunk, encoding) {
            pendingCacheStream.write(chunk, encoding);
            return _write(chunk, encoding);
        };

        res.on('finish', function () {
            pendingCacheStream.end();
            pendingCacheStream.pipe(devnull());

            if (!cacheMetadata) {
                logger.warn('cache item was immediately expired: ' + req.url);
            } else {
                cacheMetadata.headers = getCacheableHeaders(opts, res);
            }

            if (isResponseUncacheable(opts, res)) {
                cache.del(urlHash);
            }
        });

        next();
    };

    cacheMiddleware.cache = cache;
    return cacheMiddleware;
};
