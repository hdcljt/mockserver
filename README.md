# 基于 Express 构建 Mock Server

-   验证码图片 / Token
-   登录 / 登出
-   增 / 删 / 改 / 查
-   上传 / 下载
-   跨域 / CORS / 代理

## 创建实例和路由

```js
const express = require('express')
const app = express() // 创建实例
const router = express.Router() // 创建路由
app.use('/', router) // 装载路由
```

## 启动服务

```js
// http
http.createServer(app).listen(3002)
// https
const pem = selfsigned.generate()
https.createServer({ key: pem.private, cert: pem.cert }, app).listen(3003)
```

## 托管静态文件

```js
app.use(express.static(path.join(__dirname, 'public')))
// 或者
app.use('/static', express.static(path.join(__dirname, 'public')))
```

## POST 请求体解析 req.body

```js
// 'Content-Type': 'application/json'
app.use(express.json())
// 'Content-Type': 'application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }))
```

## GET 请求

```js
// /search?id=&userId=
router.get('/search', (req, res) => {
    const { id, userId } = req.query
    if (id) {
        const item = todos.find(v => v.id === +id)
        return res.json({ query: req.query, data: item })
    }
    let items = todos
    if (userId) {
        items = items.filter(v => v.userId === +userId)
    }
    res.json({ query: req.query, data: items })
})

// /query/:id
router.get('/query/:id(\\d{0,})', (req, res) => {
    const { id } = req.params
    if (id) {
        const item = todos.find(v => v.id === +id)
        return res.json({ query: req.params, data: item })
    }
    res.json({ query: req.params, data: todos })
})
```

## POST 请求

```js
// 查询 /search ({ id?, userId? })
router.post('/search', (req, res) => {
    const { id, userId } = req.body // app.use(express.json())
    if (id) {
        const item = todos.find(v => v.id === id)
        return res.json({ query: req.body, data: item })
    }
    let items = todos
    if (userId) {
        items = items.filter(v => v.userId === userId)
    }
    res.json({ query: req.body, data: items })
})

// 新增 /add ({ id?, userId, title? })
router.post('/add', (req, res) => {
    const { id, userId, title } = req.body // app.use(express.json())
    if (!userId) {
        return res.send('新增失败，userId 为空')
    }
    if (!todos.some(v => v.userId === userId)) {
        return res.send(`新增失败，userId: ${userId} 不存在`)
    }
    if (id) {
        if (todos.some(v => v.id === id)) {
            return res.send(`新增失败，id: ${id} 已经存在`)
        }
        todos.push({ id, userId, title })
    } else {
        todos.push({id: getNextId(), userId, title })
    }
    res.json({ query: req.body, data: todos })
})

// 修改 /update ({ id, userId, title? })
router.post('/update', (req, res) => {
    const { id, userId, title } = req.body // app.use(express.json())
    if (id) {
        const item = todos.find(v => v.id === id)
        if (!item) {
            return res.json(`更新失败，id：${id} 不存在`))
        }
        item.title = title
        return res.json({ query: req.body, data: todos })
    }
    if (!userId) {
        return res.json(`更新失败，缺少更新条件 id 或 userId`))
    }
    const items = todos.filter(v => v.userId === userId)
    if (!items.length) {
        return res.json(`更新失败，没有满足条件的数据`))
    }
    items.forEach(v => (v.title = title))
    res.json({ query: req.body, data: todos })
})

// 删除 /del/:id
router.post('/del/:id(\\d+)', (req, res) => {
    const { id } = req.params
    const index = todos.findIndex(v => v.id === +id)
    if (~index) {
        todos.splice(index, 1)
        return res.json({ query: req.params, data: todos })
    }
    res.send(`删除失败，id：${id} 不存在`)
})
```

## 图片流 res.sendFile()

```js
// 获取图片（验证码）
router.get('/verifyCode', (req, res) => {
    // req.cookies <= app.use(require('cookie-parser')())
    if (!req.cookies[tokenName]) {
        res.cookie(tokenName, 'Test-Token', { httpOnly: true, maxAge })
    }
    // 根据文件扩展名自动设置'Content-Type'
    res.sendFile('verifyCode.jpg', { root: join(__dirname, '../public') })
})
```

```html
<img src="/verifyCode" alt="验证码" /><!-- 查看 -->
<a href="/verifyCode" download="test.jpg">下载图片</a>
```

## 以附件形式下载文件 res.download()

```js
const download = (req, res) => {
    // 以“附件”的形式传输文件，自动设置'Content-Disposition'和'Content-Type'
    // => res.attachment(filePath).sendFile(filePath)
    res.download(join(__dirname, '../public/verifyCode.jpg'), 'verifyCode.jpg')
}
// POST 和 GET 方式都可以下载
router.route('/download').post(download).get(download)
```

```html
<form action="/download" method="POST">
    <button type="submit">form POST /download</button>
</form>
```

```html
<button type="button" onclick="download()">fetch POST /download</button>
<script>
    function download() {
        fetch('/download', { method: 'POST' })
            .then(res => res.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob)
                const event = new MouseEvent('click')
                const a = document.createElement('a')
                a.href = url
                a.download = 'test.jpg'
                a.dispatchEvent(event)
                URL.revokeObjectURL(url)
            })
    }
</script>
```

```html
<a href="/download/backend"> &lt;a&gt; /download </a>
```

## 上传单个文件 multer().single()

```html
<input type="file" name="avatar" />
```

```js
const multer = require('multer')
const upload = multer().single('avatar')
router.post('/single', upload, (req, res) => {
    res.json({ query: req.body, file: { ...req.file, buffer: '...' } })
})
```

## 上传多个文件 multiple / multer().array()

```html
<input type="file" name="avatars" multiple />
```

```js
const upload = multer().array('avatars')
router.post('/multiple', upload, (req, res) => {
    res.json({
        query: req.body,
        files: req.files.map(f => ({ ...f, buffer: '...' }))
    })
})
```

## 上传多个文件（不同的表单项） multer().fields()

```js
const upload = multer().fields([{ name: 'avatar' }, { name: 'avatars' }])
router.post('/fields', upload, (req, res) => {
    res.json({
        query: req.body,
        files: Object.keys(req.files).reduce(
            (o, k) => ({
                ...o,
                [k]: req.files[k].map(f => ({ ...f, buffer: '...' }))
            }),
            {}
        )
    })
})
```

## 上传文件，校验大小和格式 multer()

```html
<input type="file" name="avatar" accept=".png, .jpg, .jpeg" />
```

```js
const check = multer({
    limits: { fileSize: 1048576 }, // 文件大小上限 1MB
    fileFilter(req, file, cb) {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
            return cb(new Error('文件格式不正确'))
        }
        cb(null, true)
    }
}).single('avatar')

router.post(
    '/singlecheck',
    (req, res, next) => {
        check(req, res, err => {
            // 自定义错误处理
            if (err instanceof multer.MulterError) {
                err.code === 'LIMIT_FILE_SIZE'
                    ? res.send('文件太大')
                    : next(err)
            } else if (err) {
                res.send(err.message)
            } else {
                next()
            }
        })
    },
    (req, res) => {
        res.json({
            query: req.body,
            file: { ...req.file, buffer: '...' }
        })
    }
)
```
