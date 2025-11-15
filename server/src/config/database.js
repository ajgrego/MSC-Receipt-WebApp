const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

const init = () => {
  db.serialize(() => {
    // Create donations table
    db.run(`CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      donor_first_name TEXT NOT NULL,
      donor_last_name TEXT NOT NULL,
      street_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      donor_phone TEXT NOT NULL,
      donor_email TEXT NOT NULL,
      amount DECIMAL(10,2),
      items TEXT,
      total_value DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating donations table:', err);
      } else {
        console.log('Donations table ready');
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
      }
    });

    // Remove default admin user if exists
    db.run("DELETE FROM admin WHERE username = 'admin'", (err) => {
      if (err) {
        console.error('Error removing default admin user:', err);
      }
    });

    // Create new admin accounts
    const admins = [
      { username: 'sandy', password: 'MSCreceipts' },
      { username: 'kate', password: 'MSCreceipts' },
      { username: 'anthony', password: 'MSCreceipts' }
    ];

    admins.forEach(admin => {
      db.get("SELECT * FROM admin WHERE username = ?", [admin.username], (err, row) => {
        if (err) {
          console.error(`Error checking for ${admin.username}:`, err);
          return;
        }
        if (!row) {
          const hashedPassword = bcrypt.hashSync(admin.password, 10);
          db.run("INSERT INTO admin (username, password) VALUES (?, ?)", 
            [admin.username, hashedPassword], (err) => {
              if (err) {
                console.error(`Error creating ${admin.username} user:`, err);
              } else {
                console.log(`${admin.username} user created successfully`);
              }
            });
        } else {
          console.log(`${admin.username} user already exists`);
        }
      });
    });
  });
};

module.exports = {
  db,
  init
}; 