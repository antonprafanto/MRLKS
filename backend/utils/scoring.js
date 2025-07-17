// Utility functions untuk perhitungan skor berdasarkan penilaian.md

/**
 * Menghitung skor untuk penilaian Judgment (3 juri, skala 0-3)
 * @param {number} juri1 - Nilai dari juri 1 (0-3)
 * @param {number} juri2 - Nilai dari juri 2 (0-3)
 * @param {number} juri3 - Nilai dari juri 3 (0-3)
 * @param {number} bobot - Bobot item penilaian
 * @returns {object} Object dengan rata-rata dan skor final
 */
function calculateJudgmentScore(juri1, juri2, juri3, bobot) {
    // Validasi input
    if (![juri1, juri2, juri3].every(val => val >= 0 && val <= 3)) {
        throw new Error('Nilai juri harus antara 0-3');
    }
    
    if (bobot <= 0) {
        throw new Error('Bobot harus lebih dari 0');
    }

    const rataRata = (juri1 + juri2 + juri3) / 3;
    const skorFinal = rataRata * bobot;
    
    return {
        rataRata: Math.round(rataRata * 100) / 100, // 2 decimal places
        skorFinal: Math.round(skorFinal * 100) / 100
    };
}

/**
 * Menghitung skor untuk penilaian Measurement (objektif 0-1)
 * @param {number} nilaiUkur - Nilai measurement (0 atau 1)
 * @param {number} bobot - Bobot item penilaian
 * @returns {number} Skor final
 */
function calculateMeasurementScore(nilaiUkur, bobot) {
    // Validasi input
    if (![0, 1].includes(nilaiUkur)) {
        throw new Error('Nilai measurement harus 0 atau 1');
    }
    
    if (bobot <= 0) {
        throw new Error('Bobot harus lebih dari 0');
    }

    return nilaiUkur * bobot;
}

/**
 * Menghitung total skor per kategori
 * @param {Array} scores - Array skor per item dalam kategori
 * @returns {number} Total skor kategori
 */
function calculateCategoryTotal(scores) {
    if (!Array.isArray(scores)) {
        throw new Error('Scores harus berupa array');
    }

    return scores.reduce((total, score) => {
        const skorFinal = score.skorFinal || score.skor_final || 0;
        return total + skorFinal;
    }, 0);
}

/**
 * Menghitung grand total semua kategori
 * @param {object} categoryTotals - Object dengan total per kategori
 * @returns {number} Grand total
 */
function calculateGrandTotal(categoryTotals) {
    const categories = ['A', 'B', 'C', 'D', 'E1', 'E2', 'F1', 'F2'];
    
    return categories.reduce((total, cat) => {
        return total + (categoryTotals[cat] || 0);
    }, 0);
}

/**
 * Validasi struktur penilaian berdasarkan hari dan kategori
 * @param {string} itemCode - Kode item (A1, B1, D1, etc.)
 * @param {string} hari - Hari penilaian (C1, C2, C3)
 * @returns {boolean} Valid atau tidak
 */
function validateScoringStructure(itemCode, hari) {
    const hariMapping = {
        'C1': ['A1', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'C5', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'],
        'C2': ['A2', 'E1K1', 'E1K2', 'E1K3', 'E2K4', 'E2K5', 'E2K6'],
        'C3': ['A3', 'F1K1', 'F1K2', 'F1K3', 'F2K4', 'F2K5', 'F2K6']
    };

    return hariMapping[hari] && hariMapping[hari].includes(itemCode);
}

/**
 * Hitung ranking peserta berdasarkan total skor
 * @param {Array} pesertaScores - Array dengan peserta dan total skor
 * @returns {Array} Array peserta yang sudah diranking
 */
function calculateRanking(pesertaScores) {
    return pesertaScores
        .sort((a, b) => b.total_skor - a.total_skor)
        .map((peserta, index) => ({
            ...peserta,
            ranking: index + 1
        }));
}

/**
 * Generate summary report per peserta
 * @param {string} pesertaId - ID peserta
 * @param {object} categoryScores - Skor per kategori
 * @returns {object} Summary report
 */
function generateSummaryReport(pesertaId, categoryScores) {
    const maxScores = {
        'A': 6,   // 3 item × 2 bobot
        'B': 10,  // Mixed judgment + measurement
        'C': 10,  // 5 item × 2 bobot
        'D': 15,  // Total measurement items
        'E1': 10, // Pre-defined delivery
        'E2': 17, // Full autonomous delivery
        'F1': 12, // Pre-defined delivery & return
        'F2': 20  // Full delivery & return
    };

    const summary = {
        peserta_id: pesertaId,
        categories: {},
        hari_breakdown: {
            'C1': { skor: 0, max: 39 }, // A + B + C + D
            'C2': { skor: 0, max: 27 }, // E1 + E2
            'C3': { skor: 0, max: 32 }  // F1 + F2
        },
        grand_total: 0,
        max_total: 100,
        percentage: 0
    };

    // Calculate category totals
    Object.keys(categoryScores).forEach(cat => {
        summary.categories[cat] = {
            skor: categoryScores[cat] || 0,
            max: maxScores[cat] || 0,
            percentage: maxScores[cat] ? Math.round((categoryScores[cat] || 0) / maxScores[cat] * 100) : 0
        };
    });

    // Calculate hari breakdown
    summary.hari_breakdown.C1.skor = (categoryScores.A || 0) + (categoryScores.B || 0) + (categoryScores.C || 0) + (categoryScores.D || 0);
    summary.hari_breakdown.C2.skor = (categoryScores.E1 || 0) + (categoryScores.E2 || 0);
    summary.hari_breakdown.C3.skor = (categoryScores.F1 || 0) + (categoryScores.F2 || 0);

    // Calculate grand total
    summary.grand_total = Object.values(categoryScores).reduce((total, skor) => total + (skor || 0), 0);
    summary.percentage = Math.round(summary.grand_total / summary.max_total * 100);

    return summary;
}

module.exports = {
    calculateJudgmentScore,
    calculateMeasurementScore,
    calculateCategoryTotal,
    calculateGrandTotal,
    validateScoringStructure,
    calculateRanking,
    generateSummaryReport
};