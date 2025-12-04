#!/usr/bin/env node
/**
 * Password Hash Generator
 * 
 * Usage: node generate-hash.js <your_password>
 * 
 * This script generates a bcrypt hash for your password.
 * Copy the output and paste it into server.js as SERVER_ASSET_PASSWORD_HASH
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
    console.error('Error: Please provide a password');
    console.error('Usage: node generate-hash.js <your_password>');
    process.exit(1);
}

// Generate hash with salt rounds = 10 (recommended)
bcrypt.hash(password, 10)
    .then(hash => {
        console.log('\n✓ Password hash generated successfully!\n');
        console.log('Copy this hash and paste it into server.js:\n');
        console.log(`const SERVER_ASSET_PASSWORD_HASH = '${hash}';\n`);
        console.log('⚠️  Keep this hash secure and never commit it to public repositories!');
    })
    .catch(err => {
        console.error('Error generating hash:', err);
        process.exit(1);
    });
