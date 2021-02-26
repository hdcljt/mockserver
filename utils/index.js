// @ts-check
/**
 * @param { (...args: any[]) => Promise<void> } asyncFn
 *
 * 示例:
 *    app.get('/', wrap(async (req, res, next) => {
 *        const data = await queryDb()
 *        // handle data
 *        const csv = await makeCsv(data)
 *        // handle csv
 *    }))
 */
const wrap = asyncFn => (...args) => asyncFn(...args).catch(args[2])

const createSuccess = data => ({
    code: '0000',
    message: 'OK',
    data
})

const createError = (message, code = '4000') => ({
    code,
    message
})

// 获得分页数据
const getPagingData = (list = [], pageNo = 1, pageSize = 10) => {
    const count = Math.ceil(list.length / pageSize)
    pageNo = Math.max(Math.min(pageNo, count), 1)
    const start = (pageNo - 1) * pageSize
    const end = pageNo * pageSize
    return list.slice(start, end)
}

module.exports = {
    wrap,
    createSuccess,
    createError,
    getPagingData
}
