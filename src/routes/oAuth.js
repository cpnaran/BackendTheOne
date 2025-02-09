import express from 'express'
import { handleAuthCallback } from '../middleware/drive.js';


const router = express.Router();

router.get('/auth', auth);

async function auth(req, res, next) {
    const { code } = req.query
    await handleAuthCallback(code)
    res.json({ message: "Authentication successful" })
}

export default router;