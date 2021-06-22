const express = require('express');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth') ///тут знаходиться мыдлвейр, який ми передаэмо ще й у запрос
const User = require('../../models/User')
const Todo = require('../../models/Todo')
const bcrypt = require('bcryptjs');

// @route   POST api/todo
// @desc    Create new post
// @access  Private

router.post('/',[auth,[
    check('title', 'Title is required')
        .not()
        .isEmpty(),
    check('description', 'Description is required')
        .not()
        .isEmpty(),
    check('category', 'Can only be one of the enum values')
        .isIn(['shopping', 'study', 'recreation']),
    check('priority', 'Can only be one of the enum values')
        .isIn(['low', 'medium', 'hight'])
    

]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')

        const newTodo = new Todo({
            name: user.name,
            avatar: user.avatar,
            user: req.user.id,

            title: req.body.title,
            description: req.body.description,
            doDate: req.body.doDate,
            isImportant: req.body.isImportant,
            priority: req.body.priority,
            category: req.body.category,
            isDone:req.body.isDone

        })

        const todo = await newTodo.save()

        res.json(todo)

        
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }

    
}

);


module.exports = router;