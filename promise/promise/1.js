class Promise {
    constructor(fn) {
        this._value = undefined
        this._state = 0
        doResolve(this, fn)
    }

    then(onFulfilled, onRejected) {
        handle(this, {
            onFulfilled, onRejected
        })
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
}

function reject(reason) {
    this._state = 2
    this._value = reason
}

function handle(self, handler) {
    Promise._immediateFn(() => {
        const cb = self._state === 1 ? handler.onFulfilled : handler.onRejected
        let ret
        try {
            ret = cb(self._value)
        } catch (error) {
            
        }
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
        reject.call(self, error)
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

/**
```js
const promise = new Promise((resolve) => {
    resolve(1)
})

promise.then((val) => {
    console.log(val)
    return val
})
```
根据这个使用实例其实就可以很简单的写出这些实现逻辑，但很显然问题也是很多的：
1. `resolve`延迟调用
2. `then`得返回新`Promise`实例且能链式调用
3. 缺少`catch`方法
4. 终值、拒因不能是当前`Promise`实例本身
5. 得兼容终值、拒因是`Promise`实例、`thenable`情况
 */