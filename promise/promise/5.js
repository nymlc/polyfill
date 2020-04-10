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
            onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : null,
            onRejected: typeof onRejected === 'function' ? onFulfilled : null,
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
        if (nVal && nVal.then) {
            const then = nVal.then
            if (nVal instanceof Promise) {
                this._state = 3
                this._value = nVal
                final.call(this)
            } else if(typeof then === 'function') {
                doResolve(this, then.bind(nVal))
                return
            }
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
    // 若是终值是Promise实例，那么就将其转给这个Promise实例
    // 所以若是这个实例延时更长就会导致_state === 0，也就是本来应该执行的后续链式方法就不会开启
    while (self._state === 3) {
        self = self._value
    }
    // 比如本来是promise1.then，这个handler本应该放进promise1上的，若是上面这个while控制转移了那么就会放在promise2上
    // 这就是状态继承
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
            // 处理的then没有传入函数参数，导致cb不存在，这个需要跳过
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

// 5. 得兼容终值是`Promise`实例、`thenable`情况