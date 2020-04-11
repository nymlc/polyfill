const Promise = require('./promise/6')
/**
 * Promise A+规范测试
 * npm i -g promises-aplus-tests
 * promises-aplus-tests test.js
 */
const polyfill = {
    deferred: function () {
        var obj = {}
        var prom = new Promise(function (resolve, reject) {
            obj.resolve = resolve
            obj.reject = reject
        })
        obj.promise = prom
        return obj
    }
}
Promise.deferred = polyfill.deferred
module.exports = Promise