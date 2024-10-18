import express, { response } from 'express'
import features from '../feature/index.js';

const router = express.Router();

router.post('/renew', renewLicense)
// router.post('/changePlate' changePlateLicense)

async function renewLicense(req, res, next) {
    try {
        const { userId } = req.query
        const { packageId, license } = req.body
        const result = await features.license.renewLicense(userId, packageId, license)
        res.json(result)
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(400).send(error.message);
    }
}

// async function changePlateLicense(req,res,next) {
//     try {
//         const { userId } = req.query
//         const { packageId, license } = req.body
//     } catch (error) {
//         console.error('Error processing request:', error);
//         res.status(400).send(error.message);
//     }
// }

export default router;