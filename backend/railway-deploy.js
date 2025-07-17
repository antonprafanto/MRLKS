// Railway deployment script
const setupDatabase = require('./setup-database');

async function deployToRailway() {
    try {
        console.log('🚀 Starting Railway deployment setup...');
        
        // Wait for database to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Setup database
        await setupDatabase();
        
        console.log('✅ Railway deployment setup completed!');
        console.log('🌐 Your app should be accessible via Railway domain');
        
    } catch (error) {
        console.error('❌ Railway deployment failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    deployToRailway();
}

module.exports = deployToRailway;