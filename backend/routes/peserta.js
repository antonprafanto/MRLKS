const express = require('express');
const router = express.Router();
const pesertaController = require('../controllers/pesertaController');

// Get all peserta
router.get('/', pesertaController.getAllPeserta);

// Get peserta with scores
router.get('/with-scores', pesertaController.getPesertaWithScores);

// Search peserta
router.get('/search', pesertaController.searchPeserta);

// Get peserta by ID
router.get('/:id', pesertaController.getPesertaById);

// Create new peserta
router.post('/', pesertaController.createPeserta);

// Update peserta
router.put('/:id', pesertaController.updatePeserta);

// Delete peserta
router.delete('/:id', pesertaController.deletePeserta);

module.exports = router;