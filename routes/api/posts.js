const express = require('express');
const router = express.Router();

//@route GET api/posts̥
//@desc Test route
//@access Public (Need to add tokens for authorization purposes. For Public, not required)
router.get('/', (req, res) => {
    res.send('Posts route');
});

module.exports = router;