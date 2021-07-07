const express = require('express');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth') ///тут знаходиться мыдлвейр, який ми передаэмо ще й у запрос
const User = require('../../models/User')
const Todo = require('../../models/Todo')
const Category = require('../../models/Category')
const bcrypt = require('bcryptjs');



// @route   POST api/todo
// @desc    Create new todo item
// @access  Private

router.post('/',[auth,[
    check('title', 'Title is required')
        .not()
        .isEmpty(),
    check('description', 'Description is required')
        .not()
        .isEmpty(),
    check('title', 'Title should be less than 64 symbols')
        .isLength({"max":64}),
    check('description', 'Description should be less  than 1200 symbols')
        .isLength({"max":1200}),    
    check('priority', 'Can only be one of the enum values')
        .isIn(['low', 'medium', 'hight'])
    

]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const doesCategoryExit = await Category.exists({ _id: req.body.category });

    if(!doesCategoryExit){
        return res.status(404).json({errors : `Category isn't found`})
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

        res.status(201).json(todo)

        
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }

    
}

);


// @route   GET api/todo/
// @desc    Get  all todo items by user id
// @access  Private

router.get('/', auth, async (req, res)=>{
    try {
        const posts = await Todo.find({ user : req.user.id }).sort({date:-1})
        
        res.status(200).json({total:posts.length, posts})
        
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})


// @route   GET api/todo/:id
// @desc    Get  todo item by id
// @access  Private


router.get('/:id', auth, async (req, res)=>{
    try {
        const todo = await Todo.findById(req.params.id)

        if (todo.user != req.user.id){
            return res.status(404).json({msg:'This todo item isn\'t available for the user'})
        }

        if(!todo){
            return res.status(404).json({msg:'Todo item not found'})
        }

        res.json(todo)
        
    } catch (error) {
        console.error(error.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg:'Todo item not found'})
        }
        res.status(500).send('Server error')
    }
})


// @route   Delete api/todo/:id
// @desc    Delete todo item by id
// @access  Private


router.delete('/:id', auth, async (req, res)=>{
    try {
        const todo = await Todo.findById(req.params.id)

        if(!todo){
            return res.status(404).json({msg:'Todo item is not found'})
        }
       
        //Check user

        if(todo.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User not authorized'})
        }
        
        await todo.remove()

        res.json({msg:'Todo item is removed'})

        
    } catch (error) {
        console.error(error.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg:'Todo item is not found'})
        }
        res.status(500).send('Server error')
    }
})



// @route   Patch api/todo/:id
// @desc    Update user's info  by id
// @access  Private

router.patch(
    '/:id', [auth, [
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
  ]],  async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
    
    
    
      try {
        let todo = await Todo.findById(req.params.id)

        todo = await Todo.findByIdAndUpdate(req.params.id, req.body)

        await todo.save()

        res.status(200).json({msg:'Todo data is successfully updated'})
  
      } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error1')
      }
    }
  )

module.exports = router;