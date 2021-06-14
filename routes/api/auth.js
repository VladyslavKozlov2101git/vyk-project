const express = require('express');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth') ///тут знаходиться мыдлвейр, який ми передаэмо ще й у запрос
const User = require('../../models/User')
const bcrypt = require('bcryptjs');

// @route    GET api/auth
// @desc     Get user by token
// @access   Private


router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password') // -password означає, що дане поле не буде виводитися
        res.json(user)
        
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
});


// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public

router.post('/',
[
    check('email', 'Please include a valis email') 
        .isEmail(),
    check('password', 'Password is required') 
        .exists()
],
    

    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
    console.log(res.body)


    const {email, password} = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid username' }] });
      }


      const isMatch = await bcrypt.compare(password, user.password)

      if(!isMatch){
        return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid password' }] }); 
      }

      
      const payload = {
        user: {
          id: user.id
        }
      };
      

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '360000000' },
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

module.exports = router;
