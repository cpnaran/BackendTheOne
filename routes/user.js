const express = require('express');
const router = express.Router();

router.post('/submit', (req, res) => {
    const { userId } = req.query
    console.log(userId)
    // create user in database 

    res.json('success')
});


module.exports = router;
