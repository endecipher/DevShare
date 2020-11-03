const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//Refer documentation for express-validator
const { check, validationResult } = require('express-validator');


//@route GET api/auth
//@desc Auth route
//@access Public (Need to add tokens for authorization purposes. For Public, not required)

//Adding middleware auth 
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password'); //Leave Password from the data

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route POST api/auth
//@desc Authenticate User and Get Token
//@access Public 
router.post('/', [
    check('email', 'Enter Valid email').isEmail(), //Login, not registration, thus name not required
    check('password', 'Password Required')
        .exists()
], async (req, res, next) => {
    try {
        console.log('Logging Body: ' + req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        //See if user exists
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                errors: [{ message: 'Invalid Credentials' }]
            });
        }

        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                errors: [{ message: 'Invalid Credentials' }]
            });
        }

        //Return the JSON Web Token
        //.id because mongoose uses an abstraction _id becomes .id
        //Also, user.save returns a promise
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) {
                    throw err;
                }
                res.json({ token });
            });

        //Send that token back to authenticate routes
    }
    catch (err) {
        console.log(err.Message);
        res.status(500).send('Server Error');
    }

});





module.exports = router;