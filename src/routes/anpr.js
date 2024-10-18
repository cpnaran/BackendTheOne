import express, { response } from 'express'
import feature from '../feature/index.js';

const router = express.Router();

router.post('/', updateLog)

async function updateLog(req, res, next) {
    try {
        const { deviceId, params } = req.body
        await feature.logData.createLogData(deviceId, params)
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(400).send(error.message);
    }

}

export default router;