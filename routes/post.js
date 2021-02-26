// @ts-check
const express = require('express')
const { createSuccess, createError } = require('../utils')
const { todos } = require('../utils/data')

const router = express.Router()

// 得到 todos 下一个未使用的 id
const getNextTodoId = () =>
    todos.reduce((prev, curr) => Math.max(prev, curr.id), 0) + 1

// 查询 search ({ id?, userId?, completed? })
router.post('/search', (req, res) => {
    const { id, userId, completed } = req.body // app.use(express.json())
    if (id) {
        const item = todos.find(v => v.id === id)
        return res.json(createSuccess({ query: req.body, data: item }))
    }
    let items = todos
    if (userId) {
        items = items.filter(v => v.userId === userId)
    }
    if (typeof completed === 'boolean') {
        items = items.filter(v => v.completed === completed)
    }
    res.json(createSuccess({ query: req.body, data: items }))
})

// 新增 add ({ id?, userId, completed?, title? })
router.post('/add', (req, res) => {
    const { id, userId, completed, title } = req.body // app.use(express.json())
    if (!userId) {
        return res.json(createError('新增失败，userId 为空'))
    }
    if (!todos.some(v => v.userId === userId)) {
        return res.json(createError(`新增失败，userId: ${userId} 不存在`))
    }
    if (id) {
        if (todos.some(v => v.id === id)) {
            return res.json(createError(`新增失败，id: ${id} 已经存在`))
        }
        todos.push({
            id,
            userId,
            completed: completed || false,
            title
        })
    } else {
        todos.push({
            id: getNextTodoId(),
            userId,
            completed: completed || false,
            title
        })
    }
    res.json(createSuccess({ query: req.body, data: todos }))
})

// 修改 update ({ id, userId, completed?, title? })
router.post('/update', (req, res) => {
    const { id, userId, completed, title } = req.body // app.use(express.json())
    if (id) {
        const item = todos.find(v => v.id === id)
        if (!item) {
            return res.json(createError(`更新失败，id：${id} 不存在`))
        }
        item.title = title
        return res.json(createSuccess({ query: req.body, data: todos }))
    }
    if (!userId) {
        return res.json(createError(`更新失败，缺少更新条件 id 或 userId`))
    }
    let items = todos.filter(v => v.userId === userId)
    if (typeof completed === 'boolean') {
        items = items.filter(v => v.completed === completed)
    }
    if (!items.length) {
        return res.json(createError(`更新失败，没有满足条件的数据`))
    }
    items.forEach(v => (v.title = title))
    res.json(createSuccess({ query: req.body, data: todos }))
})

// 删除 del/:id
router.post('/del/:id(\\d+)', (req, res) => {
    const { id } = req.params
    const index = todos.findIndex(v => v.id === +id)
    if (~index) {
        todos.splice(index, 1)
        return res.json(createSuccess({ query: req.params, data: todos }))
    }
    res.json(createError(`删除失败，id：${id} 不存在`))
})

module.exports = router
