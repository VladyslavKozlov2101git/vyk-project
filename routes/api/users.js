const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User')

// @route   POST api/users/test
// @desc    Register user
// @access  Public

router.post('/',
[
    check('name', 'Name is required') // Field and message
        .not()
        .isEmpty(),
    check('email', 'Please include a valis email') 
        .isEmail(),
    check('password', 'Please enter the password with 6 or more characters') 
        .isLength({"min":6})
],
    

    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }


    const {name, email, password} = req.body;

    try {
        let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm'
      })

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt); // хеширование пароля с помощью соли

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '360000' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }

});


// @route   POST api/users
// @desc    Get all users
// @access  Public

router.get('/', async (req, res)=>{
  try {
    const users = await User.find().sort({date:1}).select('-password -avatar')
    res.json(users)
  } catch (error) {
    console.error(err.message)
    res.status(500).send('Server error')
  }

})

// @route   Delete api/users/:id
// @desc    Delete user by id
// @access  Private

router.delete('/:id', auth, async (req, res)=>{
  try {
    const user = await User.findById(req.user.id).select('-password')
    
    await user.remove()

    res.json({msg:'User is removed'})
  
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }

})





// @route   Patch api/users/:id
// @desc    Update user's info  by id
// @access  Private

router.patch(
  '/:id', auth, async (req, res, next) => {

    if(req.body.name){
      await check('name', 'Name is required')
        .not()
        .isEmpty()
    }

    
      await check('email', 'Please include a valis email')
        .isEmail()       
    



    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    let {
      password,
      name,
      email
    } = req.body


    
    try {
      let user = await User.findById(req.user.id)

      //Update
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(password, salt)


      user = await User.findByIdAndUpdate(req.user.id,req.body)

      await user.save()

      res.json({msg:'User\'s information is successfully updated'})

    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)


module.exports = router;
