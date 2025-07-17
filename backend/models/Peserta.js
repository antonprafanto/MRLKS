const { executeQuery } = require('../config/database');

class PesertaModel {
    
    // Get all peserta
    static async getAllPeserta() {
        const query = `
            SELECT id, nama, sekolah, created_at 
            FROM peserta 
            ORDER BY nama
        `;
        return await executeQuery(query);
    }

    // Get peserta by ID
    static async getPesertaById(id) {
        const query = `
            SELECT id, nama, sekolah, created_at 
            FROM peserta 
            WHERE id = ?
        `;
        const results = await executeQuery(query, [id]);
        return results[0] || null;
    }

    // Create new peserta
    static async createPeserta(id, nama, sekolah) {
        try {
            // Check if ID already exists
            const existingQuery = `SELECT id FROM peserta WHERE id = ?`;
            const existing = await executeQuery(existingQuery, [id]);
            
            if (existing.length > 0) {
                throw new Error(`Peserta dengan ID ${id} sudah ada`);
            }

            const query = `
                INSERT INTO peserta (id, nama, sekolah) 
                VALUES (?, ?, ?)
            `;
            await executeQuery(query, [id, nama, sekolah]);
            
            return { success: true, id, nama, sekolah };
        } catch (error) {
            console.error('Error creating peserta:', error);
            throw error;
        }
    }

    // Update peserta
    static async updatePeserta(id, nama, sekolah) {
        try {
            // Check if peserta exists
            const existingQuery = `SELECT id FROM peserta WHERE id = ?`;
            const existing = await executeQuery(existingQuery, [id]);
            
            if (existing.length === 0) {
                throw new Error(`Peserta dengan ID ${id} tidak ditemukan`);
            }

            const query = `
                UPDATE peserta 
                SET nama = ?, sekolah = ?
                WHERE id = ?
            `;
            await executeQuery(query, [nama, sekolah, id]);
            
            return { success: true, id, nama, sekolah };
        } catch (error) {
            console.error('Error updating peserta:', error);
            throw error;
        }
    }

    // Delete peserta
    static async deletePeserta(id) {
        try {
            // Check if peserta has scores
            const scoresQuery = `
                SELECT COUNT(*) as count 
                FROM (
                    SELECT peserta_id FROM judgment_scores WHERE peserta_id = ?
                    UNION
                    SELECT peserta_id FROM measurement_scores WHERE peserta_id = ?
                ) as scores
            `;
            const [scoresResult] = await executeQuery(scoresQuery, [id, id]);
            
            if (scoresResult.count > 0) {
                throw new Error(`Tidak dapat menghapus peserta yang sudah memiliki data penilaian`);
            }

            const query = `DELETE FROM peserta WHERE id = ?`;
            const result = await executeQuery(query, [id]);
            
            if (result.affectedRows === 0) {
                throw new Error(`Peserta dengan ID ${id} tidak ditemukan`);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting peserta:', error);
            throw error;
        }
    }

    // Search peserta
    static async searchPeserta(searchTerm) {
        const query = `
            SELECT id, nama, sekolah, created_at 
            FROM peserta 
            WHERE nama LIKE ? OR sekolah LIKE ? OR id LIKE ?
            ORDER BY nama
        `;
        const searchPattern = `%${searchTerm}%`;
        return await executeQuery(query, [searchPattern, searchPattern, searchPattern]);
    }

    // Get peserta with their scores summary
    static async getPesertaWithScores() {
        const query = `
            SELECT 
                p.id,
                p.nama,
                p.sekolah,
                p.created_at,
                COALESCE(SUM(ms.skor_diperoleh), 0) as total_skor,
                COUNT(DISTINCT ms.kategori) as kategori_selesai,
                8 as total_kategori
            FROM peserta p
            LEFT JOIN main_score ms ON p.id = ms.peserta_id
            GROUP BY p.id, p.nama, p.sekolah, p.created_at
            ORDER BY total_skor DESC, p.nama
        `;
        return await executeQuery(query);
    }
}

module.exports = PesertaModel;