import express from 'express';
import User from '../models/User.js';
import License from '../models/License.js';
import features from '../feature/index.js';

const router = express.Router();

router.post('/submit', createUser)
router.post('/edit-user', editUser)

async function createUser(req, res, next) {
    try {
        const { userId } = req.query
        const { fullName, telNo, packageName, license } = req.body
        await features.user.createUser({ userId, fullName, telNo, packageName, license })
        res.json('success')
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function editUser(req, res, next) {
    try {
        const { userId } = req.query
        const { fullName, telNo } = req.body
        const result = await features.user.editUserProfile({ userId, fullName, telNo })
        res.json(result)
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
}

export default router;
