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
// @desc    Create new todo item
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
        const posts = await Todo.find().sort({date:-1})
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

      const{
        title,
        description,
        isImportant,
        priority,
        category,
        doDate,
        isDone

    } = req.body


    const todoFields = {}

    todoFields.user = req.user.id

    if(title) todoFields.title = title
    if(description) todoFields.description = description
    if(isImportant) todoFields.isImportant = isImportant
    if(priority) todoFields.priority = priority
    if(category) todoFields.category = category
    if(doDate) todoFields.doDate = doDate
    if(isDone) todoFields.isDone = isDone







  
      try {
        let todo = await Todo.findById(req.params.id)
        

        //Update

        if(todo){
            todo = await User.findOneAndUpdate(
                {"title": title},
                {"description": description},
                {"isImportant": isImportant},
                {"priority": priority},
                {"category": category},
                {"doDate": doDate},
                {"isDone": isDone}
            )

            return res.json(todo)
        }
  
        // todo = new Profile(todoFields)
        // await todo.save()
        // res.json(todo)

  
      } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error1')
      }
    }
  )

module.exports = router;