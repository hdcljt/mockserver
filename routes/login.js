// @ts-check
const express = require('express')
const { join } = require('path')
const { createSuccess, createError } = require('../utils')
const { users } = require('../utils/data')

const router = express.Router() // https://www.expressjs.com.cn/4x/api.html#router

const tokenName = 'JSESSIONID'
const maxAge = 60 * 1e3 // 60s

// 获取图片（验证码）
router.get('/verifyCode', (req, res) => {
    // req.cookies <= app.use(require('cookie-parser')())
    if (!req.cookies[tokenName]) {
        res.cookie(tokenName, 'Test-Token', { httpOnly: true, maxAge })
    }
    res.sendFile('verifyCode.jpg', { root: join(__dirname, '..', 'public') })
})

// 登录
router.post('/login', (req, res) => {
    const { username, password } = req.body // app.use(express.json()) / app.use(express.urlencoded({ extended: false }))
    if (!username || !password) {
        return res.json(
            createError(`登录失败，${username ? '密码' : '账户'}错误`)
        )
    }
    const user = users.find(u => u.id === +username)
    if (!user) {
        return res.json(createError('登录失败，账户不存在'))
    }
    res.json(createSuccess({ ...user, sessionId: 'Test-SessionId' }))
})

// 登出
router.get('/logout', (req, res) => {
    res.clearCookie(tokenName).json(createSuccess('退出成功'))
})

module.exports = router
