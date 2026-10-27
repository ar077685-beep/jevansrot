import mysql from 'mysql2/promise';

const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = Number(process.env.MYSQL_PORT) || 3306;
const MYSQL_USER = process.env.MYSQL_USER || 'if0_43284891';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '1cHfXeCOumU8K';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'if0_43284891_JEEVANSROTDB';

let pool: mysql.Pool | null = null;
let tablesInitialized = false;

export function getMySqlPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 8000,
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export async function testMySqlConnection(): Promise<{ success: boolean; message: string; host: string }> {
  try {
    const p = getMySqlPool();
    const conn = await p.getConnection();
    await conn.ping();
    conn.release();
    return {
      success: true,
      message: 'Successfully connected to MySQL database: ' + MYSQL_DATABASE,
      host: MYSQL_HOST,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to connect to MySQL',
      host: MYSQL_HOST,
    };
  }
}

export async function initMySqlTables(): Promise<void> {
  if (tablesInitialized) return;
  try {
    const p = getMySqlPool();

    // 1. Orders Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        order_number VARCHAR(64) NOT NULL UNIQUE,
        created_at DATETIME NOT NULL,
        customer_name VARCHAR(128) NOT NULL,
        customer_phone VARCHAR(64) NOT NULL,
        customer_email VARCHAR(128),
        customer_address TEXT,
        customer_city VARCHAR(128),
        customer_state VARCHAR(128),
        customer_pincode VARCHAR(32),
        items_json TEXT NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
        discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL DEFAULT 0,
        advance_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        remain_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(64) NOT NULL DEFAULT 'UPI / QR',
        payment_status VARCHAR(64) NOT NULL DEFAULT 'Pending',
        status VARCHAR(64) NOT NULL DEFAULT 'Pending',
        tracking_number VARCHAR(128) DEFAULT '',
        notes TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Products Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        vendor VARCHAR(128) NOT NULL DEFAULT 'Jevansrot',
        img VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        compare_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        discount_off VARCHAR(64) DEFAULT '',
        badge VARCHAR(64) DEFAULT 'b-pop',
        badge_label VARCHAR(64) DEFAULT 'Popular',
        rating DECIMAL(3, 2) DEFAULT 4.5,
        reviews INT DEFAULT 0,
        is_new TINYINT(1) DEFAULT 0,
        description TEXT,
        ingredients_json TEXT,
        benefits_json TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Admin Users Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(128) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(128) NOT NULL,
        role VARCHAR(64) NOT NULL DEFAULT 'Super Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default admin if table empty
    const [adminRows]: any = await p.query('SELECT COUNT(*) as count FROM admin_users');
    if (adminRows[0]?.count === 0) {
      await p.query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        ['admin@jevansrot.com', 'admin', 'Aman Sharma', 'Operations & Store Manager']
      );
    }

    tablesInitialized = true;
    console.log('✅ MySQL tables initialized successfully.');
  } catch (err: any) {
    console.warn('⚠️ Could not initialize MySQL tables (check host connectivity):', err.message);
  }
}
