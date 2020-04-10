function case1() {
    const promise = new Promise((resolve) => {
        resolve(1)
    })

    promise.then((val) => {
        console.log(1, val)
        return val
    })
}

function case2() {
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve(1)
        }, 1000)
    })

    promise.then((val) => {
        console.log(1, val)
        return val + 1
    }).then((val) => {
        console.log(2, val)
        return val
    })
}

function case3() {
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve(1)
        }, 1000)
    })

    promise.then((val) => {
        console.log(1, val)
        throw new Error('catch')
    }).catch((err) => {
        console.error(2, err)
        return err
    }).then((val) => {
        console.log(3, val)
    })
}

function case4() {
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve(promise)
        }, 1000)
    })

    promise.then((val) => {
        console.log(1, val)
        throw new Error('catch')
    }).catch((err) => {
        console.error(2, err)
        return err
    }).then((val) => {
        console.log(3, val)
    })
}

function case5() {
    const prom = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1)
        }, 3000)
    })
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve(prom)
        }, 0)
    })

    promise.then(1).catch(err => {
        console.error(2, err)
    }).then(val => {
        console.log(3, val)
    })

    const thenable = {
        a: 'aaa',
        b: 'bbb',
        then(resolve, reject) {
            resolve(this.a)
        }
    }
    const promise2 = new Promise((resolve) => {
        resolve(thenable)
    })

    promise2.then(val => {
        console.log(1, val)
    })
}

function case6() {
    const p1 = new Promise((resolve) => {
        setTimeout(() => {
            resolve('p1')
        }, 500)
    })
    const p2 = new Promise((resolve) => {
        setTimeout(() => {
            resolve('p2')
        }, 300)
    })
    Promise.all([p1, p2]).then(val => {
        console.log(1, val)
    })
}

function case0() {
    const p1 = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('p1')
        }, 500)
    })
    const p2 = new Promise((resolve) => {
        setTimeout(() => {
            resolve('p2')
        }, 300)
    })
    Promise.all([p1, p2]).then(val => {
        console.log(1, val)
    }).catch(reason => {
        console.error(2, reason)
    })
}

window.Case = {
    case1,
    case2,
    case3,
    case4,
    case5,
    case6,
    case0
}