"""
Chat API - Python Backup
This provides a fallback API when the main Supabase connection fails.
Uses local SQLite for data persistence as a backup.
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import sqlite3
import hashlib
import uuid
from datetime import datetime
from urllib.parse import parse_qs, urlparse

# Database path
DB_PATH = "/tmp/chat_backup.db"


def get_db():
    """Get database connection and ensure tables exist."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    # Create tables if they don't exist
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            display_name TEXT,
            about TEXT,
            status TEXT DEFAULT 'offline',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            name TEXT,
            description TEXT,
            created_by TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS participants (
            id TEXT PRIMARY KEY,
            conversation_id TEXT,
            user_id TEXT,
            role TEXT DEFAULT 'member',
            joined_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT,
            sender_id TEXT,
            content TEXT,
            message_type TEXT DEFAULT 'text',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    return conn


def hash_password(password):
    """Simple SHA-256 password hashing."""
    if not password:
        return None
    return hashlib.sha256(password.encode()).hexdigest()


def json_response(handler, data, status=200):
    """Send JSON response."""
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type')
    handler.end_headers()
    handler.wfile.write(json.dumps(data).encode())


class handler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests."""
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        
        try:
            conn = get_db()
            
            if path == '/api/chat' or path == '/api/chat/':
                # Health check
                json_response(self, {
                    'status': 'ok',
                    'message': 'Chat backup API is running',
                    'timestamp': datetime.utcnow().isoformat()
                })
            
            elif path == '/api/chat/users':
                # Get all users
                cursor = conn.execute('SELECT id, username, display_name, about, status FROM users')
                users = [dict(row) for row in cursor.fetchall()]
                json_response(self, {'data': users})
            
            elif path.startswith('/api/chat/users/'):
                # Get user by username
                username = path.split('/')[-1]
                cursor = conn.execute(
                    'SELECT id, username, display_name, about, status FROM users WHERE username = ?',
                    (username,)
                )
                user = cursor.fetchone()
                if user:
                    json_response(self, {'data': dict(user)})
                else:
                    json_response(self, {'error': 'User not found'}, 404)
            
            elif path == '/api/chat/conversations':
                # Get conversations for user
                user_id = query.get('user_id', [None])[0]
                if not user_id:
                    json_response(self, {'error': 'user_id required'}, 400)
                    return
                
                cursor = conn.execute('''
                    SELECT c.* FROM conversations c
                    JOIN participants p ON p.conversation_id = c.id
                    WHERE p.user_id = ?
                    ORDER BY c.created_at DESC
                ''', (user_id,))
                conversations = [dict(row) for row in cursor.fetchall()]
                json_response(self, {'data': conversations})
            
            elif path == '/api/chat/messages':
                # Get messages for conversation
                conv_id = query.get('conversation_id', [None])[0]
                limit = int(query.get('limit', [50])[0])
                
                if not conv_id:
                    json_response(self, {'error': 'conversation_id required'}, 400)
                    return
                
                cursor = conn.execute('''
                    SELECT m.*, u.username, u.display_name 
                    FROM messages m
                    LEFT JOIN users u ON u.id = m.sender_id
                    WHERE m.conversation_id = ?
                    ORDER BY m.created_at DESC
                    LIMIT ?
                ''', (conv_id, limit))
                messages = [dict(row) for row in cursor.fetchall()]
                messages.reverse()  # Return in chronological order
                json_response(self, {'data': messages})
            
            else:
                json_response(self, {'error': 'Not found'}, 404)
            
            conn.close()
            
        except Exception as e:
            json_response(self, {'error': str(e)}, 500)
    
    def do_POST(self):
        """Handle POST requests."""
        parsed = urlparse(self.path)
        path = parsed.path
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length)) if content_length > 0 else {}
            
            conn = get_db()
            
            if path == '/api/chat/register':
                # Register new user
                username = body.get('username', '').strip().lower()
                display_name = body.get('display_name', username)
                password = body.get('password')
                about = body.get('about', '')
                
                if not username or len(username) < 3:
                    json_response(self, {'error': 'Username must be at least 3 characters'}, 400)
                    return
                
                # Check if username exists
                cursor = conn.execute('SELECT id FROM users WHERE username = ?', (username,))
                if cursor.fetchone():
                    json_response(self, {'error': 'Username already taken'}, 400)
                    return
                
                # Create user
                user_id = str(uuid.uuid4())
                password_hash = hash_password(password) if password else None
                
                conn.execute('''
                    INSERT INTO users (id, username, password_hash, display_name, about)
                    VALUES (?, ?, ?, ?, ?)
                ''', (user_id, username, password_hash, display_name, about))
                conn.commit()
                
                json_response(self, {
                    'data': {
                        'id': user_id,
                        'username': username,
                        'display_name': display_name,
                        'about': about
                    }
                }, 201)
            
            elif path == '/api/chat/login':
                # Login user
                username = body.get('username', '').strip().lower()
                password = body.get('password')
                
                cursor = conn.execute(
                    'SELECT * FROM users WHERE username = ?',
                    (username,)
                )
                user = cursor.fetchone()
                
                if not user:
                    json_response(self, {'error': 'User not found'}, 404)
                    return
                
                user = dict(user)
                
                # Check password if set
                if user.get('password_hash'):
                    if not password or hash_password(password) != user['password_hash']:
                        json_response(self, {'error': 'Invalid password'}, 401)
                        return
                
                # Remove password hash from response
                user.pop('password_hash', None)
                json_response(self, {'data': user})
            
            elif path == '/api/chat/conversations':
                # Create conversation
                conv_type = body.get('type', 'dm')
                name = body.get('name')
                description = body.get('description')
                created_by = body.get('created_by')
                participants = body.get('participants', [])
                
                if not created_by:
                    json_response(self, {'error': 'created_by required'}, 400)
                    return
                
                conv_id = str(uuid.uuid4())
                
                conn.execute('''
                    INSERT INTO conversations (id, type, name, description, created_by)
                    VALUES (?, ?, ?, ?, ?)
                ''', (conv_id, conv_type, name, description, created_by))
                
                # Add participants
                for user_id in participants:
                    role = 'admin' if user_id == created_by else 'member'
                    conn.execute('''
                        INSERT INTO participants (id, conversation_id, user_id, role)
                        VALUES (?, ?, ?, ?)
                    ''', (str(uuid.uuid4()), conv_id, user_id, role))
                
                conn.commit()
                
                json_response(self, {
                    'data': {
                        'id': conv_id,
                        'type': conv_type,
                        'name': name,
                        'description': description
                    }
                }, 201)
            
            elif path == '/api/chat/messages':
                # Send message
                conv_id = body.get('conversation_id')
                sender_id = body.get('sender_id')
                content = body.get('content', '')
                msg_type = body.get('message_type', 'text')
                
                if not conv_id or not sender_id:
                    json_response(self, {'error': 'conversation_id and sender_id required'}, 400)
                    return
                
                msg_id = str(uuid.uuid4())
                created_at = datetime.utcnow().isoformat()
                
                conn.execute('''
                    INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (msg_id, conv_id, sender_id, content, msg_type, created_at))
                conn.commit()
                
                # Get sender info
                cursor = conn.execute('SELECT username, display_name FROM users WHERE id = ?', (sender_id,))
                sender = cursor.fetchone()
                
                json_response(self, {
                    'data': {
                        'id': msg_id,
                        'conversation_id': conv_id,
                        'sender_id': sender_id,
                        'content': content,
                        'message_type': msg_type,
                        'created_at': created_at,
                        'username': sender['username'] if sender else None,
                        'display_name': sender['display_name'] if sender else None
                    }
                }, 201)
            
            else:
                json_response(self, {'error': 'Not found'}, 404)
            
            conn.close()
            
        except json.JSONDecodeError:
            json_response(self, {'error': 'Invalid JSON'}, 400)
        except Exception as e:
            json_response(self, {'error': str(e)}, 500)
