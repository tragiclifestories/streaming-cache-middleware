var os = require('os');

function gbToBytes(val) {
    return val * 1024 * 1024 * 1024;
}

module.exports.getAvailableCacheBytes = function () {
    // Cache varies from 50mb to 1.5gb
    var availableMemoryBytes = Math.max((os.totalmem() - gbToBytes(0.5)) / os.cpus().length, gbToBytes(0.05));
    return Math.min(availableMemoryBytes, gbToBytes(1.5));
};
