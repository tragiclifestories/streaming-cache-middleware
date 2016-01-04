'use strict';

var cacheSize = require('../lib/cacheSize');
var util = require('util');
var sinon = require('sinon');
var os = require('os');
var _ = require('lodash');

describe('cache', function () {
    describe('available bytes config', function () {
        var gbToBytes = function (gb) {
            return gb * 1024 * 1024 * 1024;
        };

        var cases = [{
            cpus: 1,
            totalMemoryGb: 2,
            expectedCacheSizeGb: 1.5
        }, {
            cpus: 32,
            totalMemoryGb: 128,
            expectedCacheSizeGb: 1.5
        }, {
            cpus: 4,
            totalMemoryGb: 4,
            expectedCacheSizeGb: 0.875
        }, {
            cpus: 1,
            totalMemoryGb: 0.5,
            expectedCacheSizeGb: 0.05
        }];

        cases.map(function (test) {
            it(util.format('sets memory at %s gb per process for %s cpus and  %s gb memory ', test.expectedCacheSizeGb, test.cpus, test.totalMemoryGb), function () {
                sinon.stub(os, 'cpus', function () {
                    return _.fill(new Array(test.cpus), {});
                });
                sinon.stub(os, 'totalmem', function () {
                    return gbToBytes(test.totalMemoryGb);
                });

                expect(cacheSize.getAvailableCacheBytes()).toBe(gbToBytes(test.expectedCacheSizeGb));
            });
        });

        afterEach(function () {
            os.cpus.restore();
            os.totalmem.restore();
        });
    });
});
