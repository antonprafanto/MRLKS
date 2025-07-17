const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/scoring', require('./routes/scoring'));
app.use('/api/peserta', require('./routes/peserta'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Mobile Robotics Scoring API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start server
async function startServer() {
    try {
        // Initialize database connection
        await createConnection();
        console.log('Database connected successfully');
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Mobile Robotics Scoring Server is running!`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`🔗 API: http://localhost:${PORT}/api`);
            console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`\n📚 Available API Endpoints:`);
            console.log(`   GET    /api/peserta - Get all peserta`);
            console.log(`   POST   /api/peserta - Create peserta`);
            console.log(`   GET    /api/scoring/master-items - Get master items`);
            console.log(`   POST   /api/scoring/judgment - Save judgment score`);
            console.log(`   POST   /api/scoring/measurement - Save measurement score`);
            console.log(`   GET    /api/scoring/ranking - Get ranking`);
            console.log(`\n💡 Setup database: npm run setup-db`);
            console.log(`🛠  Development mode: npm run dev\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹  Shutting down server...');
    const { closeConnection } = require('./config/database');
    await closeConnection();
    process.exit(0);
});

startServer();