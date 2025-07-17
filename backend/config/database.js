const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mobile_robotics_scoring',
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
};

let pool;

async function createConnection() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Database connection pool created successfully');
        return pool;
    } catch (error) {
        console.error('Error creating database connection:', error);
        throw error;
    }
}

async function getConnection() {
    if (!pool) {
        await createConnection();
    }
    return pool;
}

async function executeQuery(query, params = []) {
    try {
        const connection = await getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

async function closeConnection() {
    if (pool) {
        await pool.end();
        console.log('Database connection closed');
    }
}

module.exports = {
    createConnection,
    getConnection,
    executeQuery,
    closeConnection,
    dbConfig
};