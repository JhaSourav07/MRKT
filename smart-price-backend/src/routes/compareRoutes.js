import express from 'express';
import { processComparison } from '../controllers/compareController.js';

const router = express.Router();

router.post('/', processComparison);

export default router;