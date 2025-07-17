const ScoringModel = require('../models/Scoring');
const PesertaModel = require('../models/Peserta');

const scoringController = {
    
    // Get master items
    async getMasterItems(req, res) {
        try {
            const { hari } = req.query;
            
            let items;
            if (hari) {
                items = await ScoringModel.getMasterItemsByHari(hari);
            } else {
                items = await ScoringModel.getMasterItems();
            }
            
            res.json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error('Error getting master items:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting master items',
                error: error.message
            });
        }
    },

    // Save judgment score
    async saveJudgmentScore(req, res) {
        try {
            const { pesertaId, itemCode, hari, juri1, juri2, juri3, bobot } = req.body;
            
            // Validation
            if (!pesertaId || !itemCode || !hari) {
                return res.status(400).json({
                    success: false,
                    message: 'pesertaId, itemCode, dan hari harus diisi'
                });
            }

            if (![juri1, juri2, juri3].every(val => Number.isInteger(val) && val >= 0 && val <= 3)) {
                return res.status(400).json({
                    success: false,
                    message: 'Nilai juri harus berupa integer antara 0-3'
                });
            }

            if (!Number.isInteger(bobot) || bobot <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bobot harus berupa integer positif'
                });
            }

            // Check if peserta exists
            const peserta = await PesertaModel.getPesertaById(pesertaId);
            if (!peserta) {
                return res.status(404).json({
                    success: false,
                    message: 'Peserta tidak ditemukan'
                });
            }

            const result = await ScoringModel.saveJudgmentScore(
                pesertaId, itemCode, hari, juri1, juri2, juri3, bobot
            );
            
            res.json({
                success: true,
                message: 'Judgment score berhasil disimpan',
                data: result
            });
        } catch (error) {
            console.error('Error saving judgment score:', error);
            res.status(500).json({
                success: false,
                message: 'Error saving judgment score',
                error: error.message
            });
        }
    },

    // Save measurement score
    async saveMeasurementScore(req, res) {
        try {
            const { pesertaId, itemCode, hari, nilaiUkur, bobot } = req.body;
            
            // Validation
            if (!pesertaId || !itemCode || !hari) {
                return res.status(400).json({
                    success: false,
                    message: 'pesertaId, itemCode, dan hari harus diisi'
                });
            }

            if (![0, 1].includes(nilaiUkur)) {
                return res.status(400).json({
                    success: false,
                    message: 'Nilai ukur harus 0 atau 1'
                });
            }

            if (!Number.isInteger(bobot) || bobot <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bobot harus berupa integer positif'
                });
            }

            // Check if peserta exists
            const peserta = await PesertaModel.getPesertaById(pesertaId);
            if (!peserta) {
                return res.status(404).json({
                    success: false,
                    message: 'Peserta tidak ditemukan'
                });
            }

            const result = await ScoringModel.saveMeasurementScore(
                pesertaId, itemCode, hari, nilaiUkur, bobot
            );
            
            res.json({
                success: true,
                message: 'Measurement score berhasil disimpan',
                data: result
            });
        } catch (error) {
            console.error('Error saving measurement score:', error);
            res.status(500).json({
                success: false,
                message: 'Error saving measurement score',
                error: error.message
            });
        }
    },

    // Get peserta scores
    async getPesertaScores(req, res) {
        try {
            const { pesertaId } = req.params;
            
            if (!pesertaId) {
                return res.status(400).json({
                    success: false,
                    message: 'pesertaId harus diisi'
                });
            }

            // Check if peserta exists
            const peserta = await PesertaModel.getPesertaById(pesertaId);
            if (!peserta) {
                return res.status(404).json({
                    success: false,
                    message: 'Peserta tidak ditemukan'
                });
            }

            const scores = await ScoringModel.getPesertaScores(pesertaId);
            const categoryTotals = await ScoringModel.getCategoryTotals(pesertaId);
            const breakdown = await ScoringModel.getPesertaDetailBreakdown(pesertaId);
            
            res.json({
                success: true,
                data: {
                    peserta: peserta,
                    scores: scores,
                    categoryTotals: categoryTotals,
                    breakdown: breakdown
                }
            });
        } catch (error) {
            console.error('Error getting peserta scores:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting peserta scores',
                error: error.message
            });
        }
    },

    // Get ranking
    async getRanking(req, res) {
        try {
            const ranking = await ScoringModel.getPesertaRanking();
            
            res.json({
                success: true,
                data: ranking
            });
        } catch (error) {
            console.error('Error getting ranking:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting ranking',
                error: error.message
            });
        }
    },

    // Get scores by hari
    async getScoresByHari(req, res) {
        try {
            const { hari } = req.params;
            
            if (!['C1', 'C2', 'C3'].includes(hari)) {
                return res.status(400).json({
                    success: false,
                    message: 'Hari harus C1, C2, atau C3'
                });
            }

            const query = `
                SELECT 
                    p.id as peserta_id,
                    p.nama as peserta_name,
                    p.sekolah,
                    ms.kategori,
                    ms.skor_diperoleh,
                    ms.skor_maksimal
                FROM main_score ms
                JOIN peserta p ON ms.peserta_id = p.id
                WHERE ms.hari = ?
                ORDER BY p.nama, ms.kategori
            `;
            
            const { executeQuery } = require('../config/database');
            const results = await executeQuery(query, [hari]);
            
            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            console.error('Error getting scores by hari:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting scores by hari',
                error: error.message
            });
        }
    }
};

module.exports = scoringController;