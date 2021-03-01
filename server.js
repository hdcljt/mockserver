const https = require('https')
const pem = require('selfsigned').generate()
const express = require('express')
const path = require('path')

const app = express()

const getRouter = express.Router()
const postRouter = express.Router()
const uploadRouter = express.Router()
const downloadRouter = express.Router()
const proxyRouter = express.Router()

app.use(require('cors')())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/get', getRouter)
app.use('/post', postRouter)
app.use('/upload', uploadRouter)
app.use('/download', downloadRouter)
app.use('/proxy', proxyRouter)

// GET
getRouter.get('/search', (req, res) => {
    const { originalUrl, query } = req
    res.json({ originalUrl, query })
})

getRouter.get('/query/:username(\\w{0,})', (req, res) => {
    const { originalUrl, query, params } = req
    res.json({ originalUrl, query, params })
})

// POST
postRouter.use(express.json())
postRouter.use(express.urlencoded({ extended: false }))

postRouter.post('/search', (req, res) => {
    const { originalUrl, body } = req
    res.json({ originalUrl, body })
})

postRouter.post('/update/:username(\\w{0,})', (req, res) => {
    const { originalUrl, params, body } = req
    res.json({ originalUrl, params, body })
})

// UPLOAD (POST)
const multer = require('multer') // multipart/form-data
//
const uploadMemory = multer()
// 单个文件
uploadRouter.post('/single', uploadMemory.single('avatar'), (req, res) => {
    const { originalUrl, body, file } = req
    res.json({ originalUrl, body, file: { ...file, buffer: '*' } })
})
// 同一个表单项上传多个文件
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
// 多个不同表单项上传文件
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

const filePath = path.join(__dirname, 'public/verifyCode.jpg')
/** @type {express.RequestHandler} */
const sendAttachment = (req, res) => {
    res.download(filePath, 'downloadAttachment.jpg')
}
/** @type {express.RequestHandler} */
const sendFile = (req, res) => {
    res.sendFile(filePath)
}
downloadRouter.route('/attachment').post(sendAttachment).get(sendAttachment)
downloadRouter.route('/file').post(sendFile).get(sendFile)

proxyRouter.get('/', (req, res) => {
    https.get('https://juejin.cn/', rst => {
        let rawData = ''
        rst.setEncoding('utf-8')
        rst.on('data', chunk => (rawData += chunk))
        rst.on('end', () => res.send(rawData))
    })
})

// 错误处理中间件
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).send(err.message)
})

https
    .createServer({ key: pem.private, cert: pem.cert }, app)
    .listen(3003, () => console.log('https://localhost:3003'))
