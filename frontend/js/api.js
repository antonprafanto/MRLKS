// API utility functions for Mobile Robotics Scoring System

const API_BASE_URL = '/api';

class ApiClient {
    
    // Show/hide loading
    static showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }
    
    static hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
    
    // Generic API request method
    static async request(endpoint, options = {}) {
        try {
            this.showLoading();
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };
            
            if (config.body && typeof config.body === 'object') {
                config.body = JSON.stringify(config.body);
            }
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        } finally {
            this.hideLoading();
        }
    }
    
    // GET request
    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    // POST request
    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }
    
    // PUT request
    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }
    
    // DELETE request
    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Peserta API functions
const PesertaAPI = {
    
    // Get all peserta
    async getAll() {
        return ApiClient.get('/peserta');
    },
    
    // Get peserta with scores
    async getAllWithScores() {
        return ApiClient.get('/peserta/with-scores');
    },
    
    // Get peserta by ID
    async getById(id) {
        return ApiClient.get(`/peserta/${id}`);
    },
    
    // Create new peserta
    async create(pesertaData) {
        return ApiClient.post('/peserta', pesertaData);
    },
    
    // Update peserta
    async update(id, pesertaData) {
        return ApiClient.put(`/peserta/${id}`, pesertaData);
    },
    
    // Delete peserta
    async delete(id) {
        return ApiClient.delete(`/peserta/${id}`);
    },
    
    // Search peserta
    async search(query) {
        return ApiClient.get(`/peserta/search?q=${encodeURIComponent(query)}`);
    }
};

// Scoring API functions
const ScoringAPI = {
    
    // Get master items
    async getMasterItems(hari = null) {
        const endpoint = hari ? `/scoring/master-items?hari=${hari}` : '/scoring/master-items';
        return ApiClient.get(endpoint);
    },
    
    // Save judgment score
    async saveJudgmentScore(scoreData) {
        return ApiClient.post('/scoring/judgment', scoreData);
    },
    
    // Save measurement score
    async saveMeasurementScore(scoreData) {
        return ApiClient.post('/scoring/measurement', scoreData);
    },
    
    // Get peserta scores
    async getPesertaScores(pesertaId) {
        return ApiClient.get(`/scoring/peserta/${pesertaId}`);
    },
    
    // Get ranking
    async getRanking() {
        return ApiClient.get('/scoring/ranking');
    },
    
    // Get scores by hari
    async getScoresByHari(hari) {
        return ApiClient.get(`/scoring/hari/${hari}`);
    }
};

// Utility functions for API responses
const ApiUtils = {
    
    // Handle API errors
    handleError(error, context = 'Operation') {
        console.error(`${context} failed:`, error);
        
        let message = `${context} gagal`;
        if (error.message) {
            message += `: ${error.message}`;
        }
        
        this.showMessage(message, 'error');
    },
    
    // Show success message
    showSuccess(message) {
        this.showMessage(message, 'success');
    },
    
    // Show error message
    showError(message) {
        this.showMessage(message, 'error');
    },
    
    // Show message with type
    showMessage(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getIconForType(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="notification-close">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },
    
    // Get icon for message type
    getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },
    
    // Format score for display
    formatScore(score, maxScore = null) {
        const formatted = parseFloat(score).toFixed(2);
        return maxScore ? `${formatted}/${maxScore}` : formatted;
    },
    
    // Format percentage
    formatPercentage(value) {
        return `${parseFloat(value).toFixed(1)}%`;
    },
    
    // Format ranking
    formatRanking(rank) {
        const badges = {
            1: '<span class="ranking-badge first">🥇</span>',
            2: '<span class="ranking-badge second">🥈</span>',
            3: '<span class="ranking-badge third">🥉</span>'
        };
        
        return badges[rank] || `<span class="ranking-badge other">${rank}</span>`;
    },
    
    // Validate form data
    validatePesertaForm(formData) {
        const errors = [];
        
        if (!formData.id || formData.id.trim().length === 0) {
            errors.push('ID peserta harus diisi');
        }
        
        if (formData.id && formData.id.length > 50) {
            errors.push('ID peserta tidak boleh lebih dari 50 karakter');
        }
        
        if (!formData.nama || formData.nama.trim().length === 0) {
            errors.push('Nama tim harus diisi');
        }
        
        if (formData.nama && formData.nama.length > 100) {
            errors.push('Nama tim tidak boleh lebih dari 100 karakter');
        }
        
        return errors;
    },
    
    // Validate judgment score
    validateJudgmentScore(scoreData) {
        const errors = [];
        
        if (!scoreData.pesertaId) {
            errors.push('Peserta harus dipilih');
        }
        
        if (!scoreData.itemCode) {
            errors.push('Item penilaian harus dipilih');
        }
        
        ['juri1', 'juri2', 'juri3'].forEach((juri, index) => {
            const value = scoreData[juri];
            if (value === undefined || value === null || value === '') {
                errors.push(`Nilai juri ${index + 1} harus diisi`);
            } else if (!Number.isInteger(Number(value)) || value < 0 || value > 3) {
                errors.push(`Nilai juri ${index + 1} harus antara 0-3`);
            }
        });
        
        return errors;
    },
    
    // Validate measurement score
    validateMeasurementScore(scoreData) {
        const errors = [];
        
        if (!scoreData.pesertaId) {
            errors.push('Peserta harus dipilih');
        }
        
        if (!scoreData.itemCode) {
            errors.push('Item penilaian harus dipilih');
        }
        
        if (scoreData.nilaiUkur === undefined || scoreData.nilaiUkur === null) {
            errors.push('Nilai measurement harus dipilih');
        } else if (![0, 1].includes(Number(scoreData.nilaiUkur))) {
            errors.push('Nilai measurement harus 0 atau 1');
        }
        
        return errors;
    },
    
    // Parse form data
    parseFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },
    
    // Debounce function for search
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
};

// Add notification styles to head
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 4000;
    min-width: 300px;
    animation: slideIn 0.3s ease-out;
}

.notification-success {
    border-left: 4px solid #28a745;
    color: #155724;
    background-color: #d4edda;
}

.notification-error {
    border-left: 4px solid #dc3545;
    color: #721c24;
    background-color: #f8d7da;
}

.notification-warning {
    border-left: 4px solid #ffc107;
    color: #856404;
    background-color: #fff3cd;
}

.notification-info {
    border-left: 4px solid #17a2b8;
    color: #0c5460;
    background-color: #d1ecf1;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: auto;
    color: inherit;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);