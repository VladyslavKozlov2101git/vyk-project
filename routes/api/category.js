const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User')
const Category = require('../../models/Category')

// @route   POST api/category
// @desc    Create new category
// @access  Private

router.post('/',[auth,[
  check('title', 'Title is required')
      .not()
      .isEmpty(),

  check('color', 'Can only be one of the enum values')
      .isIn(['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8'])

]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
      const user = await User.findById(req.user.id).select('-password')

      const newCategory = new Category({
          title: req.body.title,
          color: req.body.color

      })

      const category = await newCategory.save()

      res.status(201).json(category)

      
  } catch (error) {
      console.error(error.message)
      res.status(500).send('Server error')
  }

  
}

);


// @route   GET api/category
// @desc    Get  all categories
// @access  Private

router.get('/', auth, async (req, res)=>{
  try {
      const categories = await Category.find().sort({title:-1})
      res.status(200).json({total:categories.length, categories})
      
  } catch (error) {
      console.error(error.message)
      res.status(500).send('Server error')
  }
})


// @route   GET api/category/:id
// @desc    Get category by id
// @access  Private


router.get('/:id', auth, async (req, res)=>{
  try {
      const category = await Category.findById(req.params.id)

      if(!category){
          return res.status(404).json({msg:'This category isn\'t found'})
      }

      res.json(category)
      
  } catch (error) {
      console.error(error.message)
      if(err.kind === 'ObjectId'){
          return res.status(404).json({msg:'This category isn\'t found'})
      }
      res.status(500).send('Server error')
  }
})



// @route   Delete api/category/:id
// @desc    Delete category by id
// @access  Private


router.delete('/:id', auth, async (req, res)=>{
    try {
        const category = await Category.findById(req.params.id)

        if(!category){
            return res.status(404).json({msg:'This category isn\'t found'})
        }
       
        
        
        await category.remove()

        res.json({msg:'Сategory item is removed'})

        
    } catch (error) {
        console.error(error.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg:'Сategory is not found'})
        }
        res.status(500).send('Server error')
    }
})






module.exports = router;
