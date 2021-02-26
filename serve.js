const http = require('http')

http.createServer((req, res) => {
    // res.setHeader('Access-Control-Allow-Origin', ['http://localhost:3002'])
    // res.setHeader('Access-Control-Allow-Credentials', 'true')
    // res.end('Hello HTTP Server!')
    console.log(req.method, req.url)
    res.end(`jsonpCb(${JSON.stringify({ a: 1, b: '2' })})`)
}).listen(3004, () => {
    console.log('http://localhost:3004')
})
