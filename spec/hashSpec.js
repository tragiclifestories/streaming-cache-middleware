'use strict';

var hash = require('../lib/hash');

describe('hash', function () {
    describe('stringToHash', function () {
        var cases = [{
                string: 'abc',
                value: 'a9993e364706816aba3e25717850c26c9cd0d89d'
            },
            {
                string: '',
                value: 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
            }, {
                string: undefined,
                value: 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
            }, {
                string: {},
                value: 'c1d44ff03aff1372856c281854f454e2e1d15b7c'
            }];

        cases.map(function (test) {
            it('hashes ' + test.string, function () {
                expect(hash.stringToHash(test.string)).toBe(test.value);
            });
        });
    });

    describe('requestToHash', function () {
        var opts = {};
        var request = {
            headers: {},
            get: function (key) {
                return this.headers[key];
            }
        };

        var cases = [
            {
                test: 'hashes req with no headers',
                req: {url: 'http://abc'},
                hash: 'e064cee70683ca37fc706ba0049fba1b5b232cd1'
            },
            {
                test: 'hashes req and ignores headers not on whitelist',
                req: {url: 'http://abc', headers: {'cookie': 'abc'}},
                hash: 'e064cee70683ca37fc706ba0049fba1b5b232cd1' // Must be the same as previous
            },
            {
                test: 'hashes req and whitelisted headers',
                req: {url: 'http://abc', headers: {'Accept-Encoding': 'gzip', 'Accept': 'application/json'}},
                hash: 'caa85bf3144f52edc8b7814ab89a51529a29615a'
            }];

        cases.map(function (testCase) {
            it(testCase.test, function () {
                var r = Object.assign({}, request, testCase.req);
                expect(hash.requestToHash(opts, r)).toBe(testCase.hash);
            });
        });
    });
});
