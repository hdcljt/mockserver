// @ts-check
const express = require('express')
const { join } = require('path')

const router = express.Router()

/**
 * 以“附件”的形式传输文件，自动设置'Content-Disposition'
 *
 * @type {express.RequestHandler}
 */
const download = (req, res) => {
    res.download(join(__dirname, '../public/verifyCode.jpg'), 'verifyCode.jpg')
}

/**
 * 以“附件”的形式传输文件
 *
 * @type {express.RequestHandler}
 */
const sendAttachment = (req, res) => {
    const filePath = join(__dirname, '../public/verifyCode.jpg')
    res.attachment(filePath).sendFile(filePath)
}

/**
 * 传输文件，根据文件扩展名自动设置'Content-Type'
 *
 * @type {express.RequestHandler}
 */
const sendFile = (req, res) => {
    const filePath = join(__dirname, '../public/verifyCode.jpg')
    res.sendFile(filePath)
}

// 后端下载（form/a/..）
router.route('/backend').post(download).get(download)

router.route('/attachment').post(sendAttachment).get(sendAttachment)

// 前端下载（ajax/fetch）
router.route('/frontend').post(sendFile).get(sendFile)

module.exports = router
