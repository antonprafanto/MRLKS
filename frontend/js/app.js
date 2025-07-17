// Main application JavaScript for Mobile Robotics Scoring System

// Global variables
let currentPage = 'dashboard';
let pesertaList = [];
let masterItems = [];
let currentHari = 'C1';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize app
async function initializeApp() {
    try {
        setupNavigation();
        setupEventListeners();
        await loadInitialData();
        showPage('dashboard');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        ApiUtils.showError('Gagal memuat aplikasi');
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Peserta form
    const pesertaForm = document.getElementById('peserta-form');
    if (pesertaForm) {
        pesertaForm.addEventListener('submit', handlePesertaSubmit);
    }
    
    // Search peserta
    const searchInput = document.getElementById('search-peserta');
    if (searchInput) {
        searchInput.addEventListener('input', ApiUtils.debounce(handlePesertaSearch, 300));
    }
    
    // Hari selector
    const hariSelect = document.getElementById('hari-select');
    if (hariSelect) {
        hariSelect.addEventListener('change', handleHariChange);
    }
    
    // Peserta selector for penilaian
    const pesertaSelect = document.getElementById('peserta-select');
    if (pesertaSelect) {
        pesertaSelect.addEventListener('change', handlePesertaChange);
    }
}

// Load initial data
async function loadInitialData() {
    try {
        await Promise.all([
            loadPesertaList(),
            loadMasterItems(),
            loadDashboardStats()
        ]);
    } catch (error) {
        console.error('Failed to load initial data:', error);
    }
}

// Show specific page
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    currentPage = pageName;
    
    // Load page-specific data
    switch (pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'peserta':
            loadPesertaPage();
            break;
        case 'penilaian':
            loadPenilaianPage();
            break;
        case 'ranking':
            loadRankingPage();
            break;
    }
}

// Dashboard functions
async function loadDashboardStats() {
    try {
        const [pesertaData, rankingData] = await Promise.all([
            PesertaAPI.getAllWithScores(),
            ScoringAPI.getRanking()
        ]);
        
        updateDashboardStats(pesertaData.data, rankingData.data);
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

function updateDashboardStats(pesertaData, rankingData) {
    // Update stats
    document.getElementById('total-peserta').textContent = pesertaData.length;
    
    const totalPenilaian = pesertaData.reduce((sum, p) => sum + p.kategori_selesai, 0);
    document.getElementById('total-penilaian').textContent = totalPenilaian;
    
    const skorTertinggi = rankingData.length > 0 ? rankingData[0].total_skor : 0;
    document.getElementById('skor-tertinggi').textContent = ApiUtils.formatScore(skorTertinggi);
}

async function loadDashboardData() {
    try {
        const pesertaData = await PesertaAPI.getAllWithScores();
        displayDashboardPeserta(pesertaData.data);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

function displayDashboardPeserta(pesertaData) {
    const container = document.getElementById('peserta-list-dashboard');
    
    if (pesertaData.length === 0) {
        container.innerHTML = '<p class="text-center">Belum ada peserta terdaftar</p>';
        return;
    }
    
    const html = pesertaData.slice(0, 5).map(peserta => `
        <div class="peserta-item">
            <div class="peserta-info">
                <h4>${peserta.nama}</h4>
                <p>${peserta.sekolah}</p>
            </div>
            <div class="peserta-score">
                <span class="score">${ApiUtils.formatScore(peserta.total_skor, 100)}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${peserta.total_skor}%"></div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Peserta management functions
async function loadPesertaList() {
    try {
        const response = await PesertaAPI.getAllWithScores();
        pesertaList = response.data;
        updatePesertaSelect();
        return pesertaList;
    } catch (error) {
        console.error('Failed to load peserta list:', error);
        ApiUtils.showError('Gagal memuat daftar peserta');
        return [];
    }
}

function updatePesertaSelect() {
    const select = document.getElementById('peserta-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Pilih Peserta --</option>';
    
    pesertaList.forEach(peserta => {
        const option = document.createElement('option');
        option.value = peserta.id;
        option.textContent = `${peserta.nama} (${peserta.id})`;
        select.appendChild(option);
    });
}

async function loadPesertaPage() {
    try {
        const pesertaData = await PesertaAPI.getAllWithScores();
        displayPesertaTable(pesertaData.data);
    } catch (error) {
        console.error('Failed to load peserta page:', error);
        ApiUtils.showError('Gagal memuat halaman peserta');
    }
}

function displayPesertaTable(pesertaData) {
    const tbody = document.getElementById('peserta-table-body');
    
    if (pesertaData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada peserta terdaftar</td></tr>';
        return;
    }
    
    const html = pesertaData.map(peserta => `
        <tr>
            <td>${peserta.id}</td>
            <td>${peserta.nama}</td>
            <td>${peserta.sekolah || '-'}</td>
            <td>
                <span class="score">${ApiUtils.formatScore(peserta.total_skor, 100)}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${peserta.total_skor}%"></div>
                </div>
            </td>
            <td>
                <button class="btn btn-info" onclick="editPeserta('${peserta.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deletePeserta('${peserta.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

function showAddPesertaForm() {
    document.getElementById('add-peserta-form').style.display = 'block';
    document.getElementById('peserta-form').reset();
}

function hideAddPesertaForm() {
    document.getElementById('add-peserta-form').style.display = 'none';
    document.getElementById('peserta-form').reset();
}

async function handlePesertaSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = ApiUtils.parseFormData(e.target);
        
        // Validate form
        const errors = ApiUtils.validatePesertaForm(formData);
        if (errors.length > 0) {
            ApiUtils.showError(errors.join(', '));
            return;
        }
        
        // Submit data
        await PesertaAPI.create(formData);
        
        // Success
        ApiUtils.showSuccess('Peserta berhasil ditambahkan');
        hideAddPesertaForm();
        loadPesertaList();
        loadPesertaPage();
        
    } catch (error) {
        ApiUtils.handleError(error, 'Tambah peserta');
    }
}

async function deletePeserta(pesertaId) {
    if (!confirm('Yakin ingin menghapus peserta ini?')) {
        return;
    }
    
    try {
        await PesertaAPI.delete(pesertaId);
        ApiUtils.showSuccess('Peserta berhasil dihapus');
        loadPesertaList();
        loadPesertaPage();
    } catch (error) {
        ApiUtils.handleError(error, 'Hapus peserta');
    }
}

async function handlePesertaSearch(e) {
    const query = e.target.value.trim();
    
    if (query.length === 0) {
        loadPesertaPage();
        return;
    }
    
    try {
        const response = await PesertaAPI.search(query);
        displayPesertaTable(response.data);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// Penilaian functions
async function loadMasterItems() {
    try {
        const response = await ScoringAPI.getMasterItems(currentHari);
        masterItems = response.data;
        return masterItems;
    } catch (error) {
        console.error('Failed to load master items:', error);
        ApiUtils.showError('Gagal memuat master items');
        return [];
    }
}

async function loadPenilaianPage() {
    try {
        await Promise.all([
            loadPesertaList(),
            loadMasterItems()
        ]);
        
        const pesertaSelect = document.getElementById('peserta-select');
        const hariSelect = document.getElementById('hari-select');
        
        if (pesertaSelect.value) {
            loadPesertaScores();
        }
    } catch (error) {
        console.error('Failed to load penilaian page:', error);
    }
}

function handleHariChange(e) {
    currentHari = e.target.value;
    loadMasterItems().then(() => {
        const pesertaSelect = document.getElementById('peserta-select');
        if (pesertaSelect.value) {
            loadPesertaScores();
        }
    });
}

function handlePesertaChange(e) {
    if (e.target.value) {
        loadPesertaScores();
    } else {
        clearPenilaianForms();
    }
}

async function loadPesertaScores() {
    const pesertaSelect = document.getElementById('peserta-select');
    const pesertaId = pesertaSelect.value;
    
    if (!pesertaId) {
        clearPenilaianForms();
        return;
    }
    
    try {
        const [pesertaScores, masterItemsForHari] = await Promise.all([
            ScoringAPI.getPesertaScores(pesertaId),
            ScoringAPI.getMasterItems(currentHari)
        ]);
        
        displayPenilaianForms(pesertaScores.data, masterItemsForHari.data);
    } catch (error) {
        console.error('Failed to load peserta scores:', error);
        ApiUtils.showError('Gagal memuat data penilaian peserta');
    }
}

function displayPenilaianForms(pesertaData, items) {
    const container = document.getElementById('penilaian-forms');
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-center">Tidak ada item penilaian untuk hari ini</p>';
        return;
    }
    
    const existingScores = {};
    
    // Map existing judgment scores
    if (pesertaData.scores.judgment) {
        pesertaData.scores.judgment.forEach(score => {
            existingScores[score.item_code] = score;
        });
    }
    
    // Map existing measurement scores
    if (pesertaData.scores.measurement) {
        pesertaData.scores.measurement.forEach(score => {
            existingScores[score.item_code] = score;
        });
    }
    
    const html = items.map(item => {
        const existingScore = existingScores[item.item_code];
        
        if (item.metode === 'J') {
            return createJudgmentForm(item, existingScore);
        } else {
            return createMeasurementForm(item, existingScore);
        }
    }).join('');
    
    container.innerHTML = html;
}

function createJudgmentForm(item, existingScore) {
    const juri1 = existingScore ? existingScore.juri_1 : '';
    const juri2 = existingScore ? existingScore.juri_2 : '';
    const juri3 = existingScore ? existingScore.juri_3 : '';
    const rataRata = existingScore ? existingScore.rata_rata : '';
    const skorFinal = existingScore ? existingScore.skor_final : '';
    
    return `
        <div class="penilaian-item">
            <h4>
                <i class="fas fa-gavel"></i>
                ${item.item_code} - ${item.deskripsi}
            </h4>
            <div class="item-info">
                <strong>Metode:</strong> Judgment (3 Juri) | 
                <strong>Bobot:</strong> ${item.bobot} | 
                <strong>Kategori:</strong> ${item.kategori} |
                <strong>Max Score:</strong> ${item.max_score}
            </div>
            
            <form class="judgment-form" onsubmit="submitJudgmentScore(event, '${item.item_code}', ${item.bobot})">
                <div class="judgment-inputs">
                    <div class="form-group">
                        <label>Juri 1 (0-3)</label>
                        <select name="juri1" required>
                            <option value="">-</option>
                            <option value="0" ${juri1 == 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${juri1 == 1 ? 'selected' : ''}>1</option>
                            <option value="2" ${juri1 == 2 ? 'selected' : ''}>2</option>
                            <option value="3" ${juri1 == 3 ? 'selected' : ''}>3</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Juri 2 (0-3)</label>
                        <select name="juri2" required>
                            <option value="">-</option>
                            <option value="0" ${juri2 == 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${juri2 == 1 ? 'selected' : ''}>1</option>
                            <option value="2" ${juri2 == 2 ? 'selected' : ''}>2</option>
                            <option value="3" ${juri2 == 3 ? 'selected' : ''}>3</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Juri 3 (0-3)</label>
                        <select name="juri3" required>
                            <option value="">-</option>
                            <option value="0" ${juri3 == 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${juri3 == 1 ? 'selected' : ''}>1</option>
                            <option value="2" ${juri3 == 2 ? 'selected' : ''}>2</option>
                            <option value="3" ${juri3 == 3 ? 'selected' : ''}>3</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                </div>
                
                ${existingScore ? `
                    <div class="score-result">
                        <strong>Rata-rata:</strong> ${rataRata} | 
                        <strong>Skor Final:</strong> ${skorFinal}
                    </div>
                ` : ''}
            </form>
        </div>
    `;
}

function createMeasurementForm(item, existingScore) {
    const nilaiUkur = existingScore ? existingScore.nilai_ukur : '';
    const skorFinal = existingScore ? existingScore.skor_final : '';
    
    return `
        <div class="penilaian-item">
            <h4>
                <i class="fas fa-ruler"></i>
                ${item.item_code} - ${item.deskripsi}
            </h4>
            <div class="item-info">
                <strong>Metode:</strong> Measurement (Objektif) | 
                <strong>Bobot:</strong> ${item.bobot} | 
                <strong>Kategori:</strong> ${item.kategori} |
                <strong>Max Score:</strong> ${item.max_score}
            </div>
            
            <form class="measurement-form" onsubmit="submitMeasurementScore(event, '${item.item_code}', ${item.bobot})">
                <div class="measurement-inputs">
                    <div class="form-group">
                        <label>Hasil Penilaian</label>
                        <div class="radio-group">
                            <label>
                                <input type="radio" name="nilaiUkur" value="0" ${nilaiUkur == 0 ? 'checked' : ''} required>
                                Gagal (0)
                            </label>
                            <label>
                                <input type="radio" name="nilaiUkur" value="1" ${nilaiUkur == 1 ? 'checked' : ''} required>
                                Berhasil (1)
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                </div>
                
                ${existingScore ? `
                    <div class="score-result">
                        <strong>Skor Final:</strong> ${skorFinal}
                    </div>
                ` : ''}
            </form>
        </div>
    `;
}

function clearPenilaianForms() {
    const container = document.getElementById('penilaian-forms');
    container.innerHTML = '<p class="text-center">Pilih peserta untuk mulai penilaian</p>';
}

async function submitJudgmentScore(event, itemCode, bobot) {
    event.preventDefault();
    
    const pesertaSelect = document.getElementById('peserta-select');
    const pesertaId = pesertaSelect.value;
    
    if (!pesertaId) {
        ApiUtils.showError('Pilih peserta terlebih dahulu');
        return;
    }
    
    try {
        const formData = ApiUtils.parseFormData(event.target);
        
        const scoreData = {
            pesertaId: pesertaId,
            itemCode: itemCode,
            hari: currentHari,
            juri1: parseInt(formData.juri1),
            juri2: parseInt(formData.juri2),
            juri3: parseInt(formData.juri3),
            bobot: bobot
        };
        
        // Validate
        const errors = ApiUtils.validateJudgmentScore(scoreData);
        if (errors.length > 0) {
            ApiUtils.showError(errors.join(', '));
            return;
        }
        
        // Submit
        await ScoringAPI.saveJudgmentScore(scoreData);
        ApiUtils.showSuccess('Judgment score berhasil disimpan');
        
        // Reload scores
        loadPesertaScores();
        
    } catch (error) {
        ApiUtils.handleError(error, 'Simpan judgment score');
    }
}

async function submitMeasurementScore(event, itemCode, bobot) {
    event.preventDefault();
    
    const pesertaSelect = document.getElementById('peserta-select');
    const pesertaId = pesertaSelect.value;
    
    if (!pesertaId) {
        ApiUtils.showError('Pilih peserta terlebih dahulu');
        return;
    }
    
    try {
        const formData = ApiUtils.parseFormData(event.target);
        
        const scoreData = {
            pesertaId: pesertaId,
            itemCode: itemCode,
            hari: currentHari,
            nilaiUkur: parseInt(formData.nilaiUkur),
            bobot: bobot
        };
        
        // Validate
        const errors = ApiUtils.validateMeasurementScore(scoreData);
        if (errors.length > 0) {
            ApiUtils.showError(errors.join(', '));
            return;
        }
        
        // Submit
        await ScoringAPI.saveMeasurementScore(scoreData);
        ApiUtils.showSuccess('Measurement score berhasil disimpan');
        
        // Reload scores
        loadPesertaScores();
        
    } catch (error) {
        ApiUtils.handleError(error, 'Simpan measurement score');
    }
}

// Ranking functions
async function loadRankingPage() {
    try {
        const response = await ScoringAPI.getRanking();
        displayRankingTable(response.data);
    } catch (error) {
        console.error('Failed to load ranking:', error);
        ApiUtils.showError('Gagal memuat ranking');
    }
}

function displayRankingTable(rankingData) {
    const tbody = document.getElementById('ranking-table-body');
    
    if (rankingData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada data ranking</td></tr>';
        return;
    }
    
    const html = rankingData.map(peserta => `
        <tr>
            <td>${ApiUtils.formatRanking(peserta.ranking)}</td>
            <td>${peserta.peserta_name}</td>
            <td>${peserta.sekolah || '-'}</td>
            <td>
                <span class="score">${ApiUtils.formatScore(peserta.total_skor, peserta.max_total)}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${peserta.percentage}%"></div>
                </div>
            </td>
            <td>${ApiUtils.formatPercentage(peserta.percentage)}</td>
            <td>
                <button class="btn btn-info" onclick="showScoreDetail('${peserta.peserta_id}')">
                    <i class="fas fa-eye"></i> Detail
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

async function refreshRanking() {
    await loadRankingPage();
    ApiUtils.showSuccess('Ranking berhasil diperbarui');
}

// Modal functions
async function showScoreDetail(pesertaId) {
    try {
        const response = await ScoringAPI.getPesertaScores(pesertaId);
        const data = response.data;
        
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = `Detail Skor - ${data.peserta.nama}`;
        
        let html = '<div class="score-detail">';
        
        // Category breakdown
        if (data.categoryTotals && data.categoryTotals.length > 0) {
            html += '<h4>Skor per Kategori</h4>';
            html += '<table class="data-table">';
            html += '<thead><tr><th>Kategori</th><th>Skor</th><th>Max</th><th>%</th></tr></thead>';
            html += '<tbody>';
            
            data.categoryTotals.forEach(cat => {
                const percentage = (cat.skor_diperoleh / cat.skor_maksimal * 100).toFixed(1);
                html += `
                    <tr>
                        <td>${cat.kategori}</td>
                        <td>${cat.skor_diperoleh}</td>
                        <td>${cat.skor_maksimal}</td>
                        <td>${percentage}%</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
        }
        
        // Hari breakdown
        if (data.breakdown && data.breakdown.hari_breakdown) {
            html += '<h4 class="mt-2">Skor per Hari</h4>';
            html += '<table class="data-table">';
            html += '<thead><tr><th>Hari</th><th>Skor</th><th>Max</th><th>%</th></tr></thead>';
            html += '<tbody>';
            
            data.breakdown.hari_breakdown.forEach(hari => {
                const percentage = (hari.total_skor / hari.max_skor * 100).toFixed(1);
                html += `
                    <tr>
                        <td>${hari.hari}</td>
                        <td>${hari.total_skor}</td>
                        <td>${hari.max_skor}</td>
                        <td>${percentage}%</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
        }
        
        html += '</div>';
        
        modalBody.innerHTML = html;
        document.getElementById('score-modal').style.display = 'flex';
        
    } catch (error) {
        console.error('Failed to load score detail:', error);
        ApiUtils.showError('Gagal memuat detail skor');
    }
}

function closeModal() {
    document.getElementById('score-modal').style.display = 'none';
}

// Export functions
function exportData() {
    // This would implement export functionality
    ApiUtils.showInfo('Fitur export akan segera tersedia');
}

// Utility functions
function editPeserta(pesertaId) {
    // This would implement edit functionality
    ApiUtils.showInfo('Fitur edit akan segera tersedia');
}