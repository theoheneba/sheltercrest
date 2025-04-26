export const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'rentassist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};