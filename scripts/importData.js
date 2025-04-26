import mysql from 'mysql2/promise';
import { config } from '../src/config/database.js';

const tables = [
  `CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    status ENUM('pending', 'in_review', 'approved', 'rejected') DEFAULT 'pending',
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    interest_amount DECIMAL(10,2) NOT NULL,
    total_initial_payment DECIMAL(10,2) NOT NULL,
    landlord_name VARCHAR(255) NOT NULL,
    landlord_email VARCHAR(255) NOT NULL,
    landlord_phone VARCHAR(255) NOT NULL,
    property_address TEXT NOT NULL,
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    bnpl_eligible BOOLEAN DEFAULT FALSE,
    bnpl_credit_limit DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES profiles(id)
  )`,

  `CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    application_id VARCHAR(36),
    document_type VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_at TIMESTAMP NULL,
    verified_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES profiles(id)
  )`,

  `CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date TIMESTAMP NULL,
    late_fee DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_method VARCHAR(255),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS ticket_replies (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(36),
    user_id VARCHAR(36),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
  )`
];

const seedData = [
  `INSERT INTO profiles (id, email, first_name, last_name, role) VALUES 
   ('admin-id', 'admin@example.com', 'Admin', 'User', 'admin'),
   ('user-id', 'user@example.com', 'John', 'Doe', 'user')`
];

async function importData() {
  try {
    // First create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    await connection.end();

    // Connect to the database
    const dbConnection = await mysql.createConnection(config);
    console.log('Connected to MySQL database');

    // Create tables
    for (const table of tables) {
      await dbConnection.execute(table);
      console.log('Table created successfully');
    }

    // Seed initial data
    for (const seed of seedData) {
      await dbConnection.execute(seed);
      console.log('Data seeded successfully');
    }

    await dbConnection.end();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

importData();