import express from 'express';
import User from '../models/User.js';
import License from '../models/License.js';
import features from '../feature/index.js';

const router = express.Router();

router.post('/submit', createUser)

async function createUser(req, res, next) {
    try {
        const { userId } = req.query
        console.log(req.body)
        const { fullName, telNo, packageName, license } = req.body
        await features.user.createUser({ userId, fullName, telNo, packageName, license })
        res.json('success')
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }

}




export default router;
