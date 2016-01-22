'use strict';

var crypto = require('crypto');

var stringToHash = function (message) {
    var s = (message || '').toString();
    return crypto.createHash('sha1').update(s).digest('hex');
};

var requestToHash = function (opts, req) {
    var permittedHeaders = opts.permittedHeaders || ['Accept-Encoding', 'Accept', 'If-None-Match'];
    var headerKey = permittedHeaders.reduce(function (acc, header) {
        return acc + (req.get(header) || '');
    }, '');

    return stringToHash(req.url + '\n' + headerKey);
};

module.exports = {
    stringToHash: stringToHash,
    requestToHash: requestToHash
};
