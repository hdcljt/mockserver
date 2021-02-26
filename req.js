const http = require('http')
const qs = require('querystring')

const port = 3002

/** @param {http.IncomingMessage} res */
const handleRes = res => {
    let rawData = ''
    res.setEncoding('utf-8')
    res.on('data', chunk => (rawData += chunk))
    res.on('end', () => console.log('rawData', rawData))
}

// GET 请求
const get = (path = '/') => {
    http.get({ port: get.port, path }, handleRes)
}
get.port = port

// POST 请求
const post = (path = '/', data = null, headers = {}) => {
    headers = Object.assign({ 'Content-Type': 'application/json' }, headers)
    const req = http.request(
        {
            method: 'POST',
            port: post.port,
            path,
            headers
        },
        handleRes
    )
    console.log(req.getHeader('Content-Type'))
    if (typeof data === 'object' && data !== null) {
        data =
            req.getHeader('Content-Type') === 'application/json'
                ? JSON.stringify(data)
                : qs.stringify(data)
    }
    req.end(data)
}
post.port = port

// 测试：
// get('/verifyCode')
// post(
//     '/login',
//     { username: '5', password: '123' },
//     // { 'Content-Type': 'application/x-www-form-urlencoded' }
// )
// get.port = 3004; get()
