const mysql2 = require('mysql2/promise');
var dbPool = require('./dbConnect');

async function executeQuery(pool, dbQuery) {
    let connection;

    try {
        connection = await pool.getConnection();
        const [results, ] = await connection.query(dbQuery);
        return results
    } catch (error) {
        console.error('Error executing query:', error); 
    }
    if (connection) connection.release();
}

module.exports = executeQuery;