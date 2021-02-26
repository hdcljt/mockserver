// @ts-check
const express = require('express')
const http = require('http')

const router = express.Router()

// 解决跨域，该路由下的任何请求都会代理到 http://localhost:3004 上
router.all('*', (req, res) => {
    http.get(`http://localhost:3004${req.path}`, rst => {
        let rawData = ''
        rst.setEncoding('utf-8')
        rst.on('data', chunk => (rawData += chunk))
        rst.on('end', () => res.send(rawData))
    })
})

module.exports = router
