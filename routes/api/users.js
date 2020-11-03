const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//Refer documentation for express-validator
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route POST api/users
//@desc Register user
//@access Public (Need to add tokens for authorization purposes. For Public, not required)
router.post('/', [
    check('name', 'Name required')
        .not()
        .isEmpty(),
    check('email', 'Enter Valid email').isEmail(),
    check('password', 'Enter with minimum 6 chars')
        .isLength({ min: 6 })
], async (req, res, next) => {
    try {
        console.log('Logging Body: ' + req.body);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        console.log(`${name} wants to register account with ${email} and key ${password}`);
        //See if user exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                errors: [{ message: 'User Already Exists' }]
            });
        }

        //Get users' Gravatar

        const avatar = gravatar.url(email, {
            s: '200', //DEfault Size
            r: 'pg', //Rating: PG
            d: 'mm' //default image
        });

        //Just creates an instance. 
        //Save() needs to be called to persist
        user = new User({
            name,
            email,
            avatar,
            password
        });

        //Encrypt Password
        //Wait for a salt value to be generated
        const salt = await bcryptjs.genSalt(10);

        //Get the hash
        user.password = await bcryptjs.hash(password, salt);

        await user.save();

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

//router.get (GET)
//router.post (POST)

module.exports = router;