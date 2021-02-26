// @ts-check
const express = require('express')
const { createSuccess } = require('../utils')
const { todos } = require('../utils/data')

const router = express.Router()

// search?id=&userId=&completed=
router.get('/search', (req, res) => {
    const { id, userId, completed } = req.query
    if (id) {
        const item = todos.find(v => v.id === +id)
        return res.json(createSuccess({ query: req.query, data: item }))
    }
    let items = todos
    if (userId) {
        items = items.filter(v => v.userId === +userId)
    }
    if (completed) {
        items = items.filter(v => `${v.completed}` === completed)
    }
    res.json(createSuccess({ query: req.query, data: items }))
})

// query/:userId/:completed
router.get('/query/:userId(\\d+)/:completed((true|false)?)', (req, res) => {
    const { userId, completed } = req.params
    let items = todos
    if (userId) {
        items = items.filter(v => v.userId === +userId)
    }
    if (completed) {
        items = items.filter(v => `${v.completed}` === completed)
    }
    res.json(createSuccess({ query: req.params, data: items }))
})

// query/:id
router.get('/query/:id(\\d{0,})', (req, res) => {
    const { id } = req.params
    if (id) {
        const item = todos.find(v => v.id === +id)
        return res.json(createSuccess({ query: req.params, data: item }))
    }
    res.json(createSuccess({ query: req.params, data: todos }))
})

module.exports = router
