// @ts-check
/**
 * @param { (...args: any[]) => Promise<void> } asyncFn
 *
 * Examples:
 *
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

module.exports = {
    wrap,
    createSuccess,
    createError
}
