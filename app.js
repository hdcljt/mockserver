// @ts-check
const express = require('express') // https://www.expressjs.com.cn/
const { join } = require('path') // https://nodejs.org/dist/latest-v14.x/docs/api/path.html#path_path_join_paths

const app = express() // 创建实例

app.set('env', 'production')
app.disable('x-powered-by') // https://www.expressjs.com.cn/advanced/best-practice-security.html

// 装载第三方中间件
app.use(require('cors')())
app.use(require('cookie-parser')())

// 装载内置中间件
app.use(express.static(join(__dirname, 'public'))) // https://www.expressjs.com.cn/starter/static-files.html
app.use(express.json()) // application/json
app.use(express.urlencoded({ extended: false })) // application/x-www-form-urlencoded

// 自定义路由中间件
app.use('/', require('./routes/login'))
app.use('/get', require('./routes/get'))
app.use('/post', require('./routes/post'))
app.use('/upload', require('./routes/upload'))
app.use('/download', require('./routes/download'))
app.use('/cors', require('./routes/cors'))

// 错误处理中间件
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).send(err.message)
})

module.exports = app
