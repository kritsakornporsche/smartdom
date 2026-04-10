const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function createChatSystem() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Creating Chat System Tables...');
    
    // 1. Conversations table
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        guest_id INTEGER REFERENCES users(id),
        owner_id INTEGER REFERENCES users(id),
        dorm_id INTEGER REFERENCES dormitory_profile(id),
        last_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Chat Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ Chat system tables ensured.');
  } catch (err) {
    console.error('❌ Error creating chat system:', err);
  }
}

createChatSystem();
