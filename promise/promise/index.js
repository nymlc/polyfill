const promise = new Promise((resolve) => {
    resolve(1)
})

promise.then((val) => {
    console.log(val)
    return val
})
