// @ts-check
const express = require('express')
const multer = require('multer') // https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
const { join } = require('path')
const { createSuccess, createError } = require('../utils')

const router = express.Router()

const upload = multer()

// 上传单个文件 <input type="file" name="avatar" accept=".png, .jpg, .jpeg" />
router.post('/single', upload.single('avatar'), (req, res) => {
    res.json(
        createSuccess({ query: req.body, file: { ...req.file, buffer: '...' } })
    )
})

// 上传多个文件（相同field） <input type="file" name="avatars" accept=".png, .jpg, .jpeg" multiple />
router.post('/multiple', upload.array('avatars'), (req, res) => {
    res.json(
        createSuccess({
            query: req.body,
            files:
                Array.isArray(req.files) &&
                req.files.map(f => ({ ...f, buffer: '...' }))
        })
    )
})

// 上传多个文件（不同field）
router.post(
    '/fields',
    upload.fields([
        { name: 'avatar' },
        { name: 'avatars' },
        { name: 'attachment' }
    ]),
    (req, res) => {
        res.json(
            createSuccess({
                query: req.body,
                files: Object.keys(req.files).reduce(
                    (o, k) => ({
                        ...o,
                        [k]: req.files[k].map(f => ({ ...f, buffer: '...' }))
                    }),
                    {}
                )
            })
        )
    }
)

// 上传单个文件，校验大小和格式
const storage = multer.diskStorage({
    destination: join(__dirname, '../files'),
    filename(req, file, cb) {
        cb(null, file.originalname)
    }
})
const check = multer({
    // dest: join(__dirname, '../files'),
    // storage,
    limits: { fileSize: 1048576 },
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
                    ? res.json(createError('文件太大'))
                    : next(err)
            } else if (err) {
                res.json(createError(err.message))
            } else {
                next()
            }
        })
    },
    (req, res) => {
        res.json(
            createSuccess({
                query: req.body,
                file: { ...req.file, buffer: '...' }
            })
        )
    }
)

module.exports = router
