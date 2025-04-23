const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

const init = () => {
  console.log('Initializing database...');
  
  db.serialize(() => {
    // Create donations table
    db.run(`CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      donor_name TEXT NOT NULL,
      donor_address TEXT,
      donor_phone TEXT,
      donor_email TEXT,
      amount DECIMAL(10,2),
      items TEXT,
      total_value DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating donations table:', err);
      } else {
        console.log('Donations table created successfully');
      }
    });

    // Create admin table
    db.run(`CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating admin table:', err);
      } else {
        console.log('Admin table created successfully');
      }
    });

    // Remove all existing admin users to prevent duplicates
    db.run("DELETE FROM admin", (err) => {
      if (err) {
        console.error('Error removing existing admin users:', err);
      } else {
        console.log('Existing admin users removed');
      }
    });

    // Create new admin accounts
    const admins = [
      { username: 'sandy', password: 'MSCreceipts!' },
      { username: 'kate', password: 'MSCreceipts!' },
      { username: 'anthony', password: 'MSCreceipts!' }
    ];

    console.log('Creating admin accounts...');
    
    admins.forEach(admin => {
      const hashedPassword = bcrypt.hashSync(admin.password, 10);
      db.run(
        "INSERT INTO admin (username, password) VALUES (?, ?)", 
        [admin.username, hashedPassword],
        function(err) {
          if (err) {
            console.error(`Error creating ${admin.username} user:`, err);
          } else {
            console.log(`Admin user '${admin.username}' created successfully`);
          }
        }
      );
    });

    // Verify admin accounts
    db.all("SELECT username FROM admin", [], (err, rows) => {
      if (err) {
        console.error('Error verifying admin accounts:', err);
      } else {
        console.log('Current admin accounts:', rows.map(row => row.username));
      }
    });
  });
};

// Run initialization if this file is run directly
if (require.main === module) {
  init();
  console.log('Database initialization complete');
}

module.exports = {
  db,
  init
}; 