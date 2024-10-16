import express, { response } from 'express'
import features from '../feature/index.js';

const router = express.Router();

router.post('/renew', renewLicense)

async function renewLicense(req, res, next) {
    try {
        const { userId } = req.query
        const { days, license } = req.body
        const result = await features.license.renewLicense(userId, days, license)
        res.json(result)
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(400).send(error.message);
    }

}

export default router;