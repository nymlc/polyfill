const noop = () => {}
class Promise {
    constructor(fn) {
        this._state = 0
        this._value = undefined
        this._deferreds = []
        doResolve(this, fn)
    }

    then(onFulfilled, onRejected) {
        const promise = new Promise(noop)
        handle(this, {
            onFulfilled,
            onRejected,
            promise
        })
        return promise
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
    this._state = 1
    this._value = nVal
    final.call(this)
}

function reject(reason) {
    this._state = 2
    this._value = reason
}

function final() {
    let handler
    while (handler = this._deferreds.shift()) {
        handle(this, handler)
    }
}

function handle(self, handler) {
    if (self._state === 0) {
        self._deferreds.push(handler)
        return
    }
    Promise._immediateFn(() => {
        const {
            _state,
            _value
        } = self
        const { onFulfilled, onRejected, promise } = handler
        const cb = _state === 1 ? onFulfilled : onRejected
        let ret
        try {
            ret = cb(_value)
        } catch (error) {
            
        }
        resolve.call(promise, ret)
    })
}

function doResolve(self, fn) {
    let done = false
    try {
        fn(nVal => {
            if (done) {
                return
            }
            done = true
            resolve.call(self, nVal)
        }, reason => {
            if (done) {
                return
            }
            done = true
            reject.call(self, reason)
        })
    } catch (reason) {
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

// 1. `resolve`延迟调用
// 2. `then`得返回新`Promise`实例且能链式调用