'use strict';

var StreamingCache = require('streaming-cache');

var defaults = {
    length: function (cachedObject) {
        return cachedObject && cachedObject.data ? cachedObject.data.length : 0;
    }
};

var cache = function (options) {
    var opts = Object.assign({}, defaults, options);
    opts.max = opts.maxCacheSizeBytes;
    opts.maxAge = opts.maxAgeMs;
    return new StreamingCache(opts);
};

module.exports = cache;
