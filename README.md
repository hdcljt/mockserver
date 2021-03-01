# 基于 Express 构建简单 Server

```sh
npm install
npm start
```

-   app / router
-   http / https
-   get / post
-   upload / download
-   cors / proxy

## 创建实例和路由

```js
const express = require('express')
const app = express() // 创建实例
const router = express.Router() // 创建路由
app.use('/', router) // 装载路由
module.exports = app
```

## 启动服务

```js
// http
const http = require('http')
http.createServer(app).listen(3002)
// https
const https = require('https')
const pem = require('selfsigned').generate()
https.createServer({ key: pem.private, cert: pem.cert }, app).listen(3003)
```

## 托管静态文件

```js
app.use(express.static(path.join(__dirname, 'public')))
// 或者
app.use('/static', express.static(path.join(__dirname, 'public')))
```

## GET 请求

-   前端

```html
<input name="username" id="username" />
<button onclick="getSearch()">/search?username=</button>
<button onclick="getQuery()">/query/:username</button>
<script>
    function getSearch() {
        fetch(`/get/search?username=${username.value}`)
            .then(res => res.json())
            .then(console.log, console.error)
    }
    function getQuery() {
        fetch(`/get/query/${username.value}`)
            .then(res => res.json())
            .then(console.log, console.error)
    }
</script>
```

-   后端

```js
const getRouter = express.Router()
app.use('/get', getRouter)

getRouter.get('/search', (req, res) => {
    const { originalUrl, query } = req
    res.json({ originalUrl, query })
})

getRouter.get('/query/:username(\\w{0,})', (req, res) => {
    const { originalUrl, query, params } = req
    res.json({ originalUrl, query, params })
})
```

## POST 请求

-   前端

```html
<button onclick="postSearch()">/search</button>
<button onclick="postUpdate()">/update/:username</button>
<script>
    function postSearch() {
        fetch('/post/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.value })
        })
            .then(res => res.json())
            .then(console.log, console.error)
    }
    function postUpdate() {
        fetch(`/post/update/${username.value}`, { method: 'POST' })
            .then(res => res.json())
            .then(console.log, console.error)
    }
</script>
```

-   后端

```js
const postRouter = express.Router()
app.use('/post', postRouter)
// 'Content-Type': 'application/json'
postRouter.use(express.json())
// 'Content-Type': 'application/x-www-form-urlencoded'
postRouter.use(express.urlencoded({ extended: false }))

postRouter.post('/search', (req, res) => {
    const { originalUrl, body } = req
    res.json({ originalUrl, body })
})

postRouter.post('/update/:username(\\w{0,})', (req, res) => {
    const { originalUrl, params, body } = req
    res.json({ originalUrl, params, body })
})
```

## 上传文件

-   前端

```html
<form action="#" id="form" autocomplete="off">
    <input type="file" name="avatar" id="avatar" accept=".png,.jpeg,.jpg" />
    <input type="file" name="photos" id="photos" multiple />
    <button type="button" onclick="uploadSingle()">/single</button>
    <button type="button" onclick="uploadMultiple()">/multiple</button>
    <button type="button" onclick="uploadFields()">/fields</button>
    <button type="button" onclick="uploadCheck()">/check</button>
    <button type="button" onclick="uploadStorage()">/diskStorage</button>
</form>
```

-   后端

```js
const uploadRouter = express.Router()
app.use('/upload', uploadRouter)
// 'Content-Type': 'multipart/form-data'
const multer = require('multer')
```

### 单个文件

-   前端

```html
<script>
    function uploadSingle() {
        fetch('/upload/single', {
            method: 'POST',
            body: new FormData(form)
        })
            .then(res => res.json())
            .then(console.log, console.error)
    }
</script>
```

-   后端

```js
const uploadMemory = multer()
uploadRouter.post('/single', uploadMemory.single('avatar'), (req, res) => {
    const { originalUrl, body, file } = req
    res.json({ originalUrl, body, file: { ...file, buffer: '*' } })
})
```

### 多个文件

-   前端

```html
<script>
    function uploadMultiple() {
        fetch('/upload/multiple', {
            method: 'POST',
            body: new FormData(form)
        })
            .then(res => res.json())
            .then(console.log, console.error)
    }
</script>
```

-   后端

```js
uploadRouter.post('/multiple', uploadMemory.array('photos', 3), (req, res) => {
    const { originalUrl, body, files } = req
    res.json({
        originalUrl,
        body,
        files:
            Array.isArray(files) &&
            files.map(file => ({ ...file, buffer: '*' }))
    })
})
```

### 不同表单项上传

-   前端

```html
<script>
    function uploadFields() {
        fetch('/upload/fields', {
            method: 'POST',
            body: new FormData(form)
        })
            .then(res => res.json())
            .then(console.log, console.error)
    }
</script>
```

-   后端

```js
uploadRouter.post(
    '/fields',
    uploadMemory.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'photos', maxCount: 3 }
    ]),
    (req, res) => {
        const { originalUrl, body, files } = req
        res.json({
            originalUrl,
            body,
            files: Object.keys(files).reduce(
                (obj, key) => ({
                    ...obj,
                    [key]: files[key].map(file => ({
                        ...file,
                        buffer: '*'
                    }))
                }),
                {}
            )
        })
    }
)
```

### 校验文件

-   前端

```html
<script>
    function uploadCheck() {
        fetch('/upload/check', {
            method: 'POST',
            body: new FormData(form)
        })
            .then(res => res.json())
            .then(console.log, console.error)
    }
</script>
```

-   后端

```js
const uploadCheck = multer({
    limits: { fileSize: 1048576 }, // 1MB
    fileFilter(req, file, cb) {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
            return cb(new Error('文件格式不正确'))
        }
        cb(null, true)
    }
}).any()

uploadRouter.post(
    '/check',
    (req, res, next) => {
        uploadCheck(req, res, err => {
            // 自定义错误处理
            if (err instanceof multer.MulterError) {
                err.code === 'LIMIT_FILE_SIZE'
                    ? res.json({ errMsg: '文件太大' })
                    : next(err)
            } else if (err) {
                res.json({ errMsg: err.message })
            } else {
                next()
            }
        })
    },
    (req, res) => {
        const { originalUrl, body, files } = req
        res.json({
            originalUrl,
            body,
            files:
                Array.isArray(files) &&
                files.map(file => ({ ...file, buffer: '*' }))
        })
    }
)
```

### 保存文件

-   前端

```html
<script>
    function uploadStorage() {
        fetch('/upload/diskStorage', {
            method: 'POST',
            body: new FormData(form)
        })
            .then(res => res.json())
            .then(console.log, console.error)
    }
</script>
```

-   后端

```js
const uploadDisk = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, 'files'),
        filename(req, file, cb) {
            cb(null, file.originalname)
        }
    })
})

uploadRouter.post('/diskStorage', uploadDisk.any(), (req, res) => {
    const { originalUrl, body, files } = req
    res.json({ originalUrl, body, files })
})
```

## 下载文件

-   前端

```html
<form action="#" id="form" autocomplete="off">
    <button type="submit" formaction="/download/attachment" formmethod="POST">
        formaction /attachment
    </button>
    <button type="button" onclick="downloadFile()">fetch /file</button>
</form>
```

-   后端

```js
const downloadRouter = express.Router()
app.use('/download', downloadRouter)

const filePath = path.join(__dirname, 'public/verifyCode.jpg')
```

### Form

-   后端

```js
/** @type {express.RequestHandler} */
const sendAttachment = (req, res) => {
    res.download(filePath, 'downloadAttachment.jpg')
}
downloadRouter.route('/attachment').post(sendAttachment).get(sendAttachment)
```

### Fetch

-   前端

```html
<script>
    function downloadFile() {
        fetch('/download/file', { method: 'POST' })
            .then(res => res.blob())
            .then(genFile, console.error)
    }
</script>
```

-   后端

```js
/** @type {express.RequestHandler} */
const sendFile = (req, res) => {
    res.sendFile(filePath)
}
downloadRouter.route('/file').post(sendFile).get(sendFile)
```

## 跨域

-   CORS

```js
app.use(require('cors')())
// res.setHeader('Access-Control-Allow-Origin', '*')
```

-   Proxy

```js
const proxyRouter = express.Router()
app.use('/proxy', proxyRouter)

proxyRouter.get('/', (req, res) => {
    https.get('https://juejin.cn', rst => {
        let rawData = ''
        rst.setEncoding('utf-8')
        rst.on('data', chunk => (rawData += chunk))
        rst.on('end', () => res.send(rawData))
    })
})
```

## 错误处理

```js
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).send(err.message)
})
```
