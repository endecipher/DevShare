const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const { check, validationResult } = require('express-validator') // /check deprecated
const axios = require('axios').default;
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
    }
);

//@route GET api/profile
//@desc Get All Profiles
//@access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route GET api/profile/user/:user_id
//@desc Get profile by user ID
//@access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);

        //Since 1 is not a valid Object_Id, instead of Server Error, we want to send a BAd Request
        //Thus we're checking if the error is of that kind
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
})


//@route DELETE api/profile
//@desc DELETE Profile, users and posts
//@access PRIVATE
router.delete('/', auth, async (req, res) => {
    try {

        //TODO: Remove user's posts
        await Profile.findOneAndRemove({
            user: req.user.id
        });

        await User.findOneAndRemove({
            _id: req.user.id
        });
        res.json({
            msg: "User Deleted"
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route PUT api/profile/experience
//@desc Since we're updating a profile, it's PUT. Add Profile Experience
//@access PRIVATE
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty(),
]], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array
        });
    }

    const {
        title,
        location,
        company,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }; //Creates an object that the user submits. 
    //Equivalent to title: title = title 

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route DELETE api/profile/experience
//@desc DELETE Profile Experience
//@access PRIVATE
router.delete('/experience/:exp_id', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });

        //Get remove Index
        const removeIndex = profile.experience
            .map(x => x.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


//@route PUT api/profile/education
//@desc Add Profile education
//@access PRIVATE
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field Of Study is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty(),
]], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array
        });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }; //Creates an object that the user submits. 
    //Equivalent to title: title = title 

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route DELETE api/profile/education
//@desc Delete Profile education
//@access PRIVATE
router.delete('/education/:edu_id', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });

        //Get remove Index
        const removeIndex = profile.education
            .map(x => x.id)
            .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


//@route GET api/profile/github/:username
//@desc GET user repos from github
//@access PUBLIC
router.get('/github/:username', async (req, res) => {
    try {
        const token = process.env.GIT_TOKEN;
        const options = {
            url: encodeURI(
                `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
            ),
            method: 'GET',
            headers: {
                'user-agent': 'node.js',
                Authorization: `token ${token}`
            }
        };

        const response = await axios(options);

        console.log(`${response.status} ${response.statusText}`);
        if (response.headers) {
            console.log(response.headers);
        }

        if (response.status !== 200) {
            return res.status(404).json({
                msg: 'No Github profile found'
            });
        }

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;