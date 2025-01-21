import express from 'express'
import { handleAuthCallback } from '../feature/drive';


const router = express.Router();

router.post('/auth', auth);

async function auth(req, res, next) {
    const { code } = req.query
    await handleAuthCallback(code)
    res.json({ message: "Authentication successful" })
}

export default router;