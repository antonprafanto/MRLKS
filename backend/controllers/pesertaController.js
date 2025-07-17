const PesertaModel = require('../models/Peserta');

const pesertaController = {
    
    // Get all peserta
    async getAllPeserta(req, res) {
        try {
            const peserta = await PesertaModel.getAllPeserta();
            
            res.json({
                success: true,
                data: peserta
            });
        } catch (error) {
            console.error('Error getting all peserta:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting peserta',
                error: error.message
            });
        }
    },

    // Get peserta by ID
    async getPesertaById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID peserta harus diisi'
                });
            }

            const peserta = await PesertaModel.getPesertaById(id);
            
            if (!peserta) {
                return res.status(404).json({
                    success: false,
                    message: 'Peserta tidak ditemukan'
                });
            }
            
            res.json({
                success: true,
                data: peserta
            });
        } catch (error) {
            console.error('Error getting peserta by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting peserta',
                error: error.message
            });
        }
    },

    // Create new peserta
    async createPeserta(req, res) {
        try {
            const { id, nama, sekolah } = req.body;
            
            // Validation
            if (!id || !nama) {
                return res.status(400).json({
                    success: false,
                    message: 'ID dan nama peserta harus diisi'
                });
            }

            if (id.length > 50 || nama.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'ID tidak boleh lebih dari 50 karakter, nama tidak boleh lebih dari 100 karakter'
                });
            }

            const result = await PesertaModel.createPeserta(id, nama, sekolah || '');
            
            res.status(201).json({
                success: true,
                message: 'Peserta berhasil ditambahkan',
                data: result
            });
        } catch (error) {
            console.error('Error creating peserta:', error);
            
            if (error.message.includes('sudah ada')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error creating peserta',
                error: error.message
            });
        }
    },

    // Update peserta
    async updatePeserta(req, res) {
        try {
            const { id } = req.params;
            const { nama, sekolah } = req.body;
            
            // Validation
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID peserta harus diisi'
                });
            }

            if (!nama) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama peserta harus diisi'
                });
            }

            if (nama.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama tidak boleh lebih dari 100 karakter'
                });
            }

            const result = await PesertaModel.updatePeserta(id, nama, sekolah || '');
            
            res.json({
                success: true,
                message: 'Peserta berhasil diupdate',
                data: result
            });
        } catch (error) {
            console.error('Error updating peserta:', error);
            
            if (error.message.includes('tidak ditemukan')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error updating peserta',
                error: error.message
            });
        }
    },

    // Delete peserta
    async deletePeserta(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID peserta harus diisi'
                });
            }

            const result = await PesertaModel.deletePeserta(id);
            
            res.json({
                success: true,
                message: 'Peserta berhasil dihapus'
            });
        } catch (error) {
            console.error('Error deleting peserta:', error);
            
            if (error.message.includes('tidak ditemukan')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            if (error.message.includes('data penilaian')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error deleting peserta',
                error: error.message
            });
        }
    },

    // Search peserta
    async searchPeserta(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Query pencarian harus diisi'
                });
            }

            const results = await PesertaModel.searchPeserta(q.trim());
            
            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            console.error('Error searching peserta:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching peserta',
                error: error.message
            });
        }
    },

    // Get peserta with scores
    async getPesertaWithScores(req, res) {
        try {
            const peserta = await PesertaModel.getPesertaWithScores();
            
            res.json({
                success: true,
                data: peserta
            });
        } catch (error) {
            console.error('Error getting peserta with scores:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting peserta with scores',
                error: error.message
            });
        }
    }
};

module.exports = pesertaController;