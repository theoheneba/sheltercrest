import mysql from 'mysql2/promise';
import { config } from '../config/database.js';

const pool = mysql.createPool(config);

export const db = {
  async query(sql, params) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async transaction(callback) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async createDatabase() {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    await connection.end();
  }
};