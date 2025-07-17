const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/database');

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔄 Setting up database...\n');
        
        // Create connection without database name first
        const connectionConfig = { ...dbConfig };
        delete connectionConfig.database;
        
        connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Connected to MySQL server');
        
        // Create database if not exists
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(`✅ Database '${dbConfig.database}' created/verified`);
        
        // Use the database
        await connection.execute(`USE ${dbConfig.database}`);
        console.log(`✅ Using database '${dbConfig.database}'`);
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error('Schema file not found: ' + schemaPath);
        }
        
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        console.log(`📄 Executing ${statements.length} SQL statements...\n`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    
                    // Log progress for major operations
                    if (statement.toUpperCase().includes('CREATE TABLE')) {
                        const tableName = statement.match(/CREATE TABLE\s+(\w+)/i)?.[1];
                        console.log(`  ✅ Table '${tableName}' created`);
                    } else if (statement.toUpperCase().includes('INSERT INTO')) {
                        const tableName = statement.match(/INSERT INTO\s+(\w+)/i)?.[1];
                        if (tableName === 'master_items') {
                            console.log(`  ✅ Master items data inserted`);
                        } else if (tableName === 'peserta') {
                            console.log(`  ✅ Sample peserta data inserted`);
                        } else if (tableName === 'juri') {
                            console.log(`  ✅ Sample juri data inserted`);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                    console.error('Statement:', statement.substring(0, 100) + '...');
                }
            }
        }
        
        // Verify setup by checking tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`\n✅ Database setup completed!`);
        console.log(`📊 Created ${tables.length} tables:`);
        tables.forEach((table, index) => {
            console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
        });
        
        // Check sample data
        const [pesertaCount] = await connection.execute('SELECT COUNT(*) as count FROM peserta');
        const [itemsCount] = await connection.execute('SELECT COUNT(*) as count FROM master_items');
        const [juriCount] = await connection.execute('SELECT COUNT(*) as count FROM juri');
        
        console.log(`\n📈 Sample data:`);
        console.log(`   👥 Peserta: ${pesertaCount[0].count} records`);
        console.log(`   📋 Master Items: ${itemsCount[0].count} records`);
        console.log(`   👨‍⚖️ Juri: ${juriCount[0].count} records`);
        
        console.log(`\n🎉 Database is ready for use!`);
        console.log(`🚀 You can now start the server with: npm start`);
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;