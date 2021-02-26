// @ts-check
const { mock } = require('mockjs')

/** @type {MockData} */
const data = mock({
    'users|10': [
        {
            'id|+1': 1,
            name: '@cname()',
            email: '@email()',
            address: {
                county: '@county(true)',
                province() {
                    return this.county.split(' ')[0]
                },
                city() {
                    return this.county.split(' ')[1]
                }
            },
            phone: /1[3-9]\d{9}/,
            website: '@url(https)'
        }
    ],
    'todos|99': [
        {
            'id|+1': 1,
            userId() {
                return (this.id / 10 + 1) | 0
            },
            title: '@ctitle()',
            'completed|1-2': true
        }
    ]
})

module.exports = data

/**
 * @typedef {Object} User 用户信息
 * @prop {number} id
 * @prop {string} name
 * @prop {string} email
 * @prop {{county: string; province: string; city: string}} address
 * @prop {string} phone
 * @prop {string} website
 *
 * @typedef {Object} Todo 待办信息
 * @prop {number} id
 * @prop {number} userId
 * @prop {string} title
 * @prop {boolean} completed
 *
 * @typedef {Object} MockData 模拟数据
 * @prop {User[]} users 用户列表
 * @prop {Todo[]} todos 待办列表
 */
