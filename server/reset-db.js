const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error('Database file not found:', dbPath);
  process.exit(1);
}

// Connect to the database
const db = new sqlite3.Database(dbPath);

console.log('Connected to database:', dbPath);

// Delete all records from the donations table
db.run('DELETE FROM donations', (err) => {
  if (err) {
    console.error('Error deleting donations:', err);
    process.exit(1);
  }
  
  console.log('All donations have been deleted from the database.');
  
  // Get the count of remaining records
  db.get('SELECT COUNT(*) as count FROM donations', (err, row) => {
    if (err) {
      console.error('Error counting donations:', err);
      process.exit(1);
    }
    
    console.log(`Donations table now contains ${row.count} records.`);
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        process.exit(1);
      }
      
      console.log('Database connection closed.');
      console.log('Database reset complete.');
    });
  });
}); 