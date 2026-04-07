-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Chat Users Table
CREATE TABLE IF NOT EXISTS chat_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name TEXT,
  avatar_url TEXT,
  about TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$')
);

CREATE INDEX IF NOT EXISTS idx_chat_users_username ON chat_users(username);
CREATE INDEX IF NOT EXISTS idx_chat_users_status ON chat_users(status);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dm', 'group')),
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES chat_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- Conversation Participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES chat_users(id) ON DELETE SET NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Message Reactions Table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_message ON message_reactions(message_id);

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);

-- Unread Counts
CREATE TABLE IF NOT EXISTS unread_counts (
  user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  PRIMARY KEY(user_id, conversation_id)
);

-- User Blocks Table
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Typing Indicators (for realtime)
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unread_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_users (public chat, anyone can view/create)
DROP POLICY IF EXISTS "Users are viewable by everyone" ON chat_users;
CREATE POLICY "Users are viewable by everyone" ON chat_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can register" ON chat_users;
CREATE POLICY "Anyone can register" ON chat_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update profiles" ON chat_users;
CREATE POLICY "Users can update profiles" ON chat_users FOR UPDATE USING (true);

-- RLS Policies for conversations
DROP POLICY IF EXISTS "Anyone can view conversations" ON conversations;
CREATE POLICY "Anyone can view conversations" ON conversations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create conversations" ON conversations;
CREATE POLICY "Anyone can create conversations" ON conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update conversations" ON conversations;
CREATE POLICY "Anyone can update conversations" ON conversations FOR UPDATE USING (true);

-- RLS Policies for participants
DROP POLICY IF EXISTS "Anyone can view participants" ON conversation_participants;
CREATE POLICY "Anyone can view participants" ON conversation_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can add participants" ON conversation_participants;
CREATE POLICY "Anyone can add participants" ON conversation_participants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update participants" ON conversation_participants;
CREATE POLICY "Anyone can update participants" ON conversation_participants FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can remove participants" ON conversation_participants;
CREATE POLICY "Anyone can remove participants" ON conversation_participants FOR DELETE USING (true);

-- RLS Policies for messages
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;
CREATE POLICY "Anyone can view messages" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can send messages" ON messages;
CREATE POLICY "Anyone can send messages" ON messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update messages" ON messages;
CREATE POLICY "Anyone can update messages" ON messages FOR UPDATE USING (true);

-- RLS Policies for reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON message_reactions;
CREATE POLICY "Anyone can view reactions" ON message_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can add reactions" ON message_reactions;
CREATE POLICY "Anyone can add reactions" ON message_reactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can remove reactions" ON message_reactions;
CREATE POLICY "Anyone can remove reactions" ON message_reactions FOR DELETE USING (true);

-- RLS Policies for other tables
DROP POLICY IF EXISTS "Anyone can manage subscriptions" ON push_subscriptions;
CREATE POLICY "Anyone can manage subscriptions" ON push_subscriptions FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can manage unread counts" ON unread_counts;
CREATE POLICY "Anyone can manage unread counts" ON unread_counts FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can manage blocks" ON user_blocks;
CREATE POLICY "Anyone can manage blocks" ON user_blocks FOR ALL USING (true);

DROP POLICY IF EXISTS "Anyone can manage typing" ON typing_indicators;
CREATE POLICY "Anyone can manage typing" ON typing_indicators FOR ALL USING (true);
