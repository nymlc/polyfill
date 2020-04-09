const noop = () => { }
class Handler {
    constructor(promise, onFulfilled, onRejected) {
        this.promise = promise
        this.onFulfilled = onFulfilled
        this.onRejected = onRejected
    }
}
class Promise {
    constructor(fn) {
        this._value = undefined
        this._state = 0
        this._deferreds = []
        doResolve(this, fn)
    }

    then(onFulfilled, onRejected) {
        const prom = new Promise(noop)
        const handler = new Handler(prom, onFulfilled, onRejected)
        handle(this, handler)
        return prom
    }

    catch(onRejected) {
        this.then(null, onRejected)
    }

    static _immediateFn(fn) {
        if (typeof setImmediate === 'function') {
            setImmediate(fn)
        } else {
            setTimeout(fn, 0)
        }
    }
}

function resolve(nVal) {
    try {
        if (nVal === this) {
            throw new TypeError('circular error')
        }
        this._state = 1
        this._value = nVal
        final.call(this)
    } catch (error) {
        reject.call(this, error)
    }
}

function reject(reason) {
    this._state = 2
    this._value = reason
    final.call(this)
}

function final() {
    let deferred
    while(deferred = this._deferreds.shift()) {
        handle(this, deferred)
    }
}

function handle(self, handler) {
    if(self._state === 0) {
        self._deferreds.push(handler)
        return
    }
    Promise._immediateFn(() => {
        const cb = self._state === 1 ? handler.onFulfilled : handler.onRejected
        if (cb == null) {
            (self._state === 1 ? resolve : reject).call(handler.promise, self._value)
            return
        }
        let ret
        try {
            ret = cb(self._value)
        } catch (error) {
            reject.call(handler.promise, error)
            return
        }
        resolve.call(handler.promise, ret)
    })
}

function doResolve(self, fn) {
    let done = false
    try {
        fn((nVal) => {
            if (done) {
                return
            }
            done = true
            resolve.call(self, nVal)
        }, (reason) => {
            if (done) {
                return
            }
            done = true
            reject.call(self, reason)
        })
    } catch (error) {
        if (done) {
            return
        }
        done = true
        reject.call(self, reason)
    }
}


const globalNS = (() => {
    if (typeof window !== 'undefined') {
        return window
    }
    if (typeof global !== 'undefined') {
        return global
    }
})()
globalNS['Promise'] = Promise
/*
```js
const promise = new Promise((resolve) => {
    setTimeout(() => {
        resolve(promise)
    })
})

promise.then((val) => {
    console.log(val)
    return val
}).catch(val => {
    console.error(val)
})
```
1. 俩个关键点：一个是`resolve`是可以延迟执行的而`then, catch`则先执行了，所以需要把`then, catch`传的参数给保存下来在`resolve`执行之后再执行
1. `then, catch`方法，`catch`其实相当于`then(null, onRejected)`
2. 

*/