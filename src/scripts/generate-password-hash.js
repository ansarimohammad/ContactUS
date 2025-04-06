/**
 * Utility script to generate password hashes for admin authentication
 * 
 * Usage: node src/scripts/generate-password-hash.js yourpassword
 */

const crypto = require('crypto');

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

// Get password from command line arguments
const password = process.argv[2];

if (!password) {
  console.error('Error: No password provided');
  console.log('Usage: node src/scripts/generate-password-hash.js yourpassword');
  process.exit(1);
}

// Generate and display the hash
const passwordHash = hashPassword(password);
console.log('Password Hash:', passwordHash);
console.log('\nAdd this to your .env.local file:');
console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`); 