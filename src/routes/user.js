import express from 'express';
import User from '../models/User.js';
import License from '../models/License.js';
import features from '../feature/index.js';

const router = express.Router();

router.post('/submit', createUser)
router.post('/edit-user', editUser)

async function createUser(req, res, next) {
    try {
        const { userId, token } = req.query
        const { fullName, telNo, packageId, license } = req.body
        await features.user.createUser({ userId, fullName, telNo, packageId, license, token })
        res.json('success')
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(400).send(error.message);
    }
}

async function editUser(req, res, next) {
    try {
        const { userId, token } = req.query
        const { fullName, telNo } = req.body
        const result = await features.user.editUserProfile({ userId, fullName, telNo, token })
        await features.webhook.replyUser(userId, token, 'แก้ไขข้อมูล')
        res.json(result)
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(400).send(error.message);
    }
}

export default router;
