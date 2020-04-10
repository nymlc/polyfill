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

window.Case = {
    case1,
    case2,
    case3,
    case4,
    case5
}