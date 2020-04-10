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

    catch(onRejected) {
        return this.then(null, onRejected)
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
        if(nVal === this) {
            throw new TypeError('Cannot be resolved with itself!')
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
        if(cb == null) {
            // 抛出异常，紧接着却是没有传入onRejected的then，导致cb不存在
            (_state === 1 ? resolve : reject).call(promise, _value)
            return
        }
        let ret
        try {
            ret = cb(_value)
        } catch (error) {
            reject.call(promise, error)
            return
        }
        // 绑定promise说明转交下一个链式方法
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

// 4. 终值不能是当前`Promise`实例本身