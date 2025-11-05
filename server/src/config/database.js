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
      donor_name TEXT NOT NULL,
      street_address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
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
        // Check if we need to migrate from old schema to new schema
        db.all("PRAGMA table_info(donations)", (err, columns) => {
          if (err) {
            console.error('Error checking table schema:', err);
            return;
          }
          const hasOldAddressField = columns.some(col => col.name === 'donor_address');
          const hasNewAddressFields = columns.some(col => col.name === 'street_address');

          if (hasOldAddressField && !hasNewAddressFields) {
            console.log('Migrating database schema to new address structure...');
            // Rename old table
            db.run('ALTER TABLE donations RENAME TO donations_old', (err) => {
              if (err) {
                console.error('Error renaming table:', err);
                return;
              }
              // Create new table with new schema
              db.run(`CREATE TABLE donations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                date TEXT NOT NULL,
                donor_name TEXT NOT NULL,
                street_address TEXT,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                donor_phone TEXT,
                donor_email TEXT,
                amount DECIMAL(10,2),
                items TEXT,
                total_value DECIMAL(10,2),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )`, (err) => {
                if (err) {
                  console.error('Error creating new table:', err);
                  return;
                }
                // Copy data from old table (address will be empty)
                db.run(`INSERT INTO donations (id, type, date, donor_name, donor_phone, donor_email, amount, items, total_value, created_at)
                  SELECT id, type, date, donor_name, donor_phone, donor_email, amount, items, total_value, created_at FROM donations_old`, (err) => {
                  if (err) {
                    console.error('Error migrating data:', err);
                  } else {
                    console.log('Database schema migration completed');
                    // Drop old table
                    db.run('DROP TABLE donations_old');
                  }
                });
              });
            });
          }
        });
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