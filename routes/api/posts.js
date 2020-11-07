const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route POST api/posts
//@desc Create a post
//@access Private 
router.post('/', [
    auth,
    [
        check('text', 'Text cannot be empty').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPostDetails = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }

        const newPost = new Post(newPostDetails);
        const post = await newPost.save();

        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route GET api/posts
//@desc Get all Posts
//@access Private 
router.get('/', auth, async (req, res) => {

    try {
        const posts = await Post.find().sort({
            date: -1
        });

        res.json(posts);
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error');
    }
})


//@route GET api/posts/:id
//@desc Get Post by it's id
//@access Private 
router.get('/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.log(err);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.status(500).send('Server Error');
    }
});


//@route DELETE api/posts/:id
//@desc Delete Post by it's id
//@access Private 
router.delete('/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        //Comparing string values
        if (post.user.toString() != req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();
        res.json({ msg: "Post Removed" });
    } catch (err) {
        console.log(err);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});


//@route PUT api/posts/like/:id
//@desc Like a post (Updating a post that's why PUT)
//@access Private 
router.put('/like/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const cannotLike =
            post.likes.filter(a => a.user.toString() == req.user.id).length > 0;

        //Check if the post has been liked already
        if (cannotLike) {
            return res.status(400).json({ msg: 'Post cannot be liked again' });
        }

        //Add the newly created like to the start of the arr 
        post.likes.unshift({
            user: req.user.id
        });

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.log(err);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

//@route PUT api/posts/unlike/:id
//@desc Like a post (Updating a post that's why PUT)
//@access Private 
router.put('/unlike/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const noLikes =
            post.likes.filter(a => a.user.toString() == req.user.id).length === 0;

        //Check if the post has been liked already
        if (noLikes) {
            return res.status(400).json({ msg: 'Post has not been liked' });
        }

        const removeIndex = post.likes.map(x => x.user.toString()).indexOf(req.user.id);
        //Add the newly created like to the start of the arr 
        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.log(err);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});


//@route POST api/posts/comment/:id
//@desc Create a comment on a post
//@access Private 
router.post('/comment/:id', [
    auth,
    [
        check('text', 'Text cannot be empty').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }

        post.comments.unshift(newComment);

        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route DELETE api/posts/comment/:id/:comment_id
//@desc Delete a comment on a post
//@access Private 
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        if (!comment) {
            return res.status(404).json({ msg: "Comment does not exist" });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        post.comments.pull(comment);
        await post.save(); //Without save, only in-memory the post.comments would have been removed

        //The below functionality also works but is messier
        // const indexToRemove = post.comments.map(x => x.id).indexOf(req.params.comment_id);
        // if (indexToRemove === -1) {
        //     return res.status(404).json({ msg: "Comment for the post not found" });
        // }
        // if (post.comments[indexToRemove].user.toString() != req.user.id) {
        //     return res.status(400).json({ msg: "Cannot delete a comment of others" });
        // }
        // post.comments.splice(indexToRemove, 1);
        // await post.save();

        return res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;