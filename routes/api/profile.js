const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator') // /check deprecated

//@route GET api/profile/me
//@desc Get Current User's Profile
//@access Private (Getting the user id which is there in the token)
router.get('/me', auth, async (req, res) => {
    //using async await for mongoose
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
            'name', 'avatar'
        ]); //Populate the name and avatar of the User model belonging to the Profile Model 

        if (!profile) {
            return res.status(400).json({ msg: 'No profile found' });
        }

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error - Profile');
    }
});


//@route POST api/profile
//@desc Create or Update Profile
//@access Private
//Multiple middlewares can be put like an array
router.post('/',
    [auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        //Build Profile object

        const profileFields = {};

        profileFields.user = req.user.id;

        if (company) {
            profileFields.company = company;
        }

        if (website) {
            profileFields.website = website;
        }

        if (location) {
            profileFields.location = location;
        }

        if (bio) {
            profileFields.bio = bio;
        }

        if (status) {
            profileFields.status = status;
        }

        if (githubusername) {
            profileFields.githubusername = githubusername;
        }

        if (skills) {
            profileFields.skills = skills
                .split(',')
                .map(x => x.trim()); //Convert the CSV to an Array
        }

        //Build Social Object
        profileFields.social = {};

        if (youtube) {
            profileFields.social.youtube = youtube;
        }

        if (linkedin) {
            profileFields.social.linkedin = linkedin;
        }

        if (twitter) {
            profileFields.social.twitter = twitter;
        }

        if (instagram) {
            profileFields.social.instagram = instagram;
        }

        if (facebook) {
            profileFields.social.facebook = facebook;
        }

        console.log(profileFields);

        try {
            let profile = await Profile.findOne({ user: req.user.id }); //Big catch Null Error returned, because no await

            if (profile) {
                //Update
                console.log('profile update');

                console.log(profile);

                profile = await Profile.findOneAndUpdate(
                    {
                        user: req.user.id
                    },
                    {
                        $set: profileFields
                    },
                    {
                        new: true
                    });
            }
            else {

                //Create
                console.log('profile create')
                profile = new Profile(profileFields);
                await profile.save();

            }

            return res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error - Profile C/U');
        }

    });










module.exports = router;