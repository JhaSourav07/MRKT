import express from 'express';
import { processComparison } from '../controllers/compareController.js';

const router = express.Router();

// POST /api/v1/compare/
router.post('/', processComparison);

export default router;