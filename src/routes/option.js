import { Op } from "sequelize";
import Package from "../models/Package.js";
import features from '../feature/index.js';
import express from 'Express'

const router = express.Router();

router.get('/', getOptionPackage)

async function getOptionPackage(req, res, next) {

    try {
        const response = await features.option.getOption()
        res.json(response)
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }

}

export default router;