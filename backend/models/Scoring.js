const { executeQuery } = require('../config/database');
const { calculateJudgmentScore, calculateMeasurementScore, validateScoringStructure } = require('../utils/scoring');

class ScoringModel {
    
    // Get all master items
    static async getMasterItems() {
        const query = `
            SELECT item_code, kategori, sub_kategori, deskripsi, metode, bobot, hari, max_score 
            FROM master_items 
            ORDER BY hari, kategori, item_code
        `;
        return await executeQuery(query);
    }

    // Get master items by hari
    static async getMasterItemsByHari(hari) {
        const query = `
            SELECT item_code, kategori, sub_kategori, deskripsi, metode, bobot, hari, max_score 
            FROM master_items 
            WHERE hari = ?
            ORDER BY kategori, item_code
        `;
        return await executeQuery(query, [hari]);
    }

    // Save judgment score
    static async saveJudgmentScore(pesertaId, itemCode, hari, juri1, juri2, juri3, bobot) {
        try {
            // Validate scoring structure
            if (!validateScoringStructure(itemCode, hari)) {
                throw new Error(`Item ${itemCode} tidak valid untuk hari ${hari}`);
            }

            // Calculate score
            const { rataRata, skorFinal } = calculateJudgmentScore(juri1, juri2, juri3, bobot);

            // Check if record exists
            const existingQuery = `
                SELECT id FROM judgment_scores 
                WHERE peserta_id = ? AND item_code = ?
            `;
            const existing = await executeQuery(existingQuery, [pesertaId, itemCode]);

            let query, params;
            if (existing.length > 0) {
                // Update existing record
                query = `
                    UPDATE judgment_scores 
                    SET juri_1 = ?, juri_2 = ?, juri_3 = ?, rata_rata = ?, 
                        bobot = ?, skor_final = ?, updated_at = NOW()
                    WHERE peserta_id = ? AND item_code = ?
                `;
                params = [juri1, juri2, juri3, rataRata, bobot, skorFinal, pesertaId, itemCode];
            } else {
                // Insert new record
                query = `
                    INSERT INTO judgment_scores 
                    (peserta_id, item_code, hari, juri_1, juri_2, juri_3, rata_rata, bobot, skor_final)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                params = [pesertaId, itemCode, hari, juri1, juri2, juri3, rataRata, bobot, skorFinal];
            }

            const result = await executeQuery(query, params);
            
            // Update category total
            await this.updateCategoryTotal(pesertaId, itemCode);
            
            return { success: true, skorFinal, rataRata };
        } catch (error) {
            console.error('Error saving judgment score:', error);
            throw error;
        }
    }

    // Save measurement score
    static async saveMeasurementScore(pesertaId, itemCode, hari, nilaiUkur, bobot) {
        try {
            // Validate scoring structure
            if (!validateScoringStructure(itemCode, hari)) {
                throw new Error(`Item ${itemCode} tidak valid untuk hari ${hari}`);
            }

            // Calculate score
            const skorFinal = calculateMeasurementScore(nilaiUkur, bobot);

            // Check if record exists
            const existingQuery = `
                SELECT id FROM measurement_scores 
                WHERE peserta_id = ? AND item_code = ?
            `;
            const existing = await executeQuery(existingQuery, [pesertaId, itemCode]);

            let query, params;
            if (existing.length > 0) {
                // Update existing record
                query = `
                    UPDATE measurement_scores 
                    SET nilai_ukur = ?, bobot = ?, skor_final = ?, updated_at = NOW()
                    WHERE peserta_id = ? AND item_code = ?
                `;
                params = [nilaiUkur, bobot, skorFinal, pesertaId, itemCode];
            } else {
                // Insert new record
                query = `
                    INSERT INTO measurement_scores 
                    (peserta_id, item_code, hari, nilai_ukur, bobot, skor_final)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                params = [pesertaId, itemCode, hari, nilaiUkur, bobot, skorFinal];
            }

            const result = await executeQuery(query, params);
            
            // Update category total
            await this.updateCategoryTotal(pesertaId, itemCode);
            
            return { success: true, skorFinal };
        } catch (error) {
            console.error('Error saving measurement score:', error);
            throw error;
        }
    }

    // Update category total after score change
    static async updateCategoryTotal(pesertaId, itemCode) {
        try {
            // Get item info
            const itemQuery = `SELECT kategori, hari FROM master_items WHERE item_code = ?`;
            const itemInfo = await executeQuery(itemQuery, [itemCode]);
            
            if (itemInfo.length === 0) return;
            
            const { kategori, hari } = itemInfo[0];

            // Calculate total for this category
            const judgmentQuery = `
                SELECT COALESCE(SUM(skor_final), 0) as total 
                FROM judgment_scores js
                JOIN master_items mi ON js.item_code = mi.item_code
                WHERE js.peserta_id = ? AND mi.kategori = ?
            `;
            
            const measurementQuery = `
                SELECT COALESCE(SUM(skor_final), 0) as total 
                FROM measurement_scores ms
                JOIN master_items mi ON ms.item_code = mi.item_code
                WHERE ms.peserta_id = ? AND mi.kategori = ?
            `;

            const [judgmentTotal] = await executeQuery(judgmentQuery, [pesertaId, kategori]);
            const [measurementTotal] = await executeQuery(measurementQuery, [pesertaId, kategori]);

            const totalSkor = (judgmentTotal.total || 0) + (measurementTotal.total || 0);

            // Get max score for category
            const maxScoreQuery = `
                SELECT SUM(max_score) as max_total 
                FROM master_items 
                WHERE kategori = ?
            `;
            const [maxScoreResult] = await executeQuery(maxScoreQuery, [kategori]);
            const maxSkor = maxScoreResult.max_total || 0;

            // Get peserta name
            const pesertaQuery = `SELECT nama FROM peserta WHERE id = ?`;
            const [pesertaInfo] = await executeQuery(pesertaQuery, [pesertaId]);
            const pesertaName = pesertaInfo ? pesertaInfo.nama : '';

            // Update or insert main_score
            const existingMainQuery = `
                SELECT id FROM main_score 
                WHERE peserta_id = ? AND kategori = ?
            `;
            const existingMain = await executeQuery(existingMainQuery, [pesertaId, kategori]);

            if (existingMain.length > 0) {
                const updateMainQuery = `
                    UPDATE main_score 
                    SET skor_diperoleh = ?, peserta_name = ?, updated_at = NOW()
                    WHERE peserta_id = ? AND kategori = ?
                `;
                await executeQuery(updateMainQuery, [totalSkor, pesertaName, pesertaId, kategori]);
            } else {
                const insertMainQuery = `
                    INSERT INTO main_score (peserta_id, peserta_name, kategori, hari, skor_diperoleh, skor_maksimal)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                await executeQuery(insertMainQuery, [pesertaId, pesertaName, kategori, hari, totalSkor, maxSkor]);
            }

        } catch (error) {
            console.error('Error updating category total:', error);
            throw error;
        }
    }

    // Get scores for a peserta
    static async getPesertaScores(pesertaId) {
        const judgmentQuery = `
            SELECT js.*, mi.kategori, mi.deskripsi, mi.metode, mi.hari
            FROM judgment_scores js
            JOIN master_items mi ON js.item_code = mi.item_code
            WHERE js.peserta_id = ?
            ORDER BY mi.hari, mi.kategori, js.item_code
        `;

        const measurementQuery = `
            SELECT ms.*, mi.kategori, mi.deskripsi, mi.metode, mi.hari
            FROM measurement_scores ms
            JOIN master_items mi ON ms.item_code = mi.item_code
            WHERE ms.peserta_id = ?
            ORDER BY mi.hari, mi.kategori, ms.item_code
        `;

        const [judgmentScores, measurementScores] = await Promise.all([
            executeQuery(judgmentQuery, [pesertaId]),
            executeQuery(measurementQuery, [pesertaId])
        ]);

        return {
            judgment: judgmentScores,
            measurement: measurementScores
        };
    }

    // Get category totals for a peserta
    static async getCategoryTotals(pesertaId) {
        const query = `
            SELECT kategori, hari, skor_diperoleh, skor_maksimal
            FROM main_score
            WHERE peserta_id = ?
            ORDER BY hari, kategori
        `;
        return await executeQuery(query, [pesertaId]);
    }

    // Get ranking of all peserta
    static async getPesertaRanking() {
        const query = `
            SELECT 
                p.id as peserta_id,
                p.nama as peserta_name,
                p.sekolah,
                COALESCE(SUM(ms.skor_diperoleh), 0) as total_skor,
                100 as max_total,
                ROUND(COALESCE(SUM(ms.skor_diperoleh), 0) / 100 * 100, 2) as percentage
            FROM peserta p
            LEFT JOIN main_score ms ON p.id = ms.peserta_id
            GROUP BY p.id, p.nama, p.sekolah
            ORDER BY total_skor DESC
        `;
        
        const results = await executeQuery(query);
        
        // Add ranking
        return results.map((row, index) => ({
            ...row,
            ranking: index + 1
        }));
    }

    // Get detailed breakdown for a peserta
    static async getPesertaDetailBreakdown(pesertaId) {
        const categoryQuery = `
            SELECT kategori, hari, skor_diperoleh, skor_maksimal
            FROM main_score
            WHERE peserta_id = ?
            ORDER BY hari, kategori
        `;

        const hariQuery = `
            SELECT 
                hari,
                SUM(skor_diperoleh) as total_skor,
                SUM(skor_maksimal) as max_skor
            FROM main_score
            WHERE peserta_id = ?
            GROUP BY hari
            ORDER BY hari
        `;

        const [categoryScores, hariScores] = await Promise.all([
            executeQuery(categoryQuery, [pesertaId]),
            executeQuery(hariQuery, [pesertaId])
        ]);

        return {
            categories: categoryScores,
            hari_breakdown: hariScores
        };
    }
}

module.exports = ScoringModel;