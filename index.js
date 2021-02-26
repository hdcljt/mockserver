// @ts-check
const http = require('http') // https://nodejs.org/dist/latest-v14.x/docs/api/http.html
// const https = require('https') // https://nodejs.org/dist/latest-v14.x/docs/api/https.html
// const selfsigned = require('selfsigned') // https://github.com/jfromaniello/selfsigned

const app = require('./app')

http.createServer(app).listen(3002, () => {
    console.log('http://localhost:3002')
})

// const pem = selfsigned.generate()
// https
//     .createServer({ key: pem.private, cert: pem.cert }, app)
//     .listen(3003, () => {
//         console.log('https://localhost:3003')
//     })
