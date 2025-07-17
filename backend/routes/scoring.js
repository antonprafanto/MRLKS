const express = require('express');
const router = express.Router();
const scoringController = require('../controllers/scoringController');

// Get master items
router.get('/master-items', scoringController.getMasterItems);

// Save judgment score
router.post('/judgment', scoringController.saveJudgmentScore);

// Save measurement score
router.post('/measurement', scoringController.saveMeasurementScore);

// Get peserta scores
router.get('/peserta/:pesertaId', scoringController.getPesertaScores);

// Get ranking
router.get('/ranking', scoringController.getRanking);

// Get scores by hari
router.get('/hari/:hari', scoringController.getScoresByHari);

module.exports = router;