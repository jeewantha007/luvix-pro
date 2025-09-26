# Backend API Documentation

## Project Structure

```
backend/src/
├── app.js              # Express app configuration
├── server.js           # Server entry point
├── config/
│   └── database.js     # Database configuration
├── controllers/        # Request handlers
│   ├── authController.js
│   ├── chatController.js
│   └── messageController.js
├── routes/            # API routes
│   ├── authRoutes.js
│   ├── chatRoutes.js
│   └── messageRoutes.js
├── middleware/        # Custom middleware
├── models/           # Data models
├── services/         # Business logic
├── utils/           # Utility functions
└── webhooks/        # Webhook handlers
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_ANON_KEY=your_anon_key
PORT=4000
```

### 3. Run the Backend

**Development mode (with auto-reload):**
```bash
npm run backend:dev
```

**Production mode:**
```bash
npm run backend
```

The server will start on `http://localhost:4000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Authentication
- `POST /api/auth/check-email` - Check if email exists in database

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create a new message

### Chats
- `POST /api/chats/:contactId/read` - Mark messages as read for a contact

## Adding New Features

### 1. Create a Route
Add your route file in `backend/src/routes/`:
```javascript
import express from 'express';
const router = express.Router();

router.get('/example', (req, res) => {
  res.json({ message: 'Hello World' });
});

export default router;
```

### 2. Create a Controller
Add your controller in `backend/src/controllers/`:
```javascript
export const exampleController = {
  async getExample(req, res) {
    // Your logic here
    res.json({ data: 'example' });
  }
};
```

### 3. Register Routes
Import and use your routes in `backend/src/app.js`:
```javascript
import exampleRoutes from './routes/exampleRoutes.js';
app.use('/api/example', exampleRoutes);
```

## Database Integration

The backend uses Supabase for database operations. Configuration is handled in `backend/src/config/database.js`.

### Using Supabase Admin Client
```javascript
import { supabaseAdmin } from '../config/database.js';

// Admin operations (server-side only)
const { data, error } = await supabaseAdmin
  .from('table_name')
  .select('*');
```

## Best Practices

1. **Controllers**: Handle HTTP requests/responses only
2. **Services**: Put business logic in service files
3. **Models**: Define data structures and validation
4. **Middleware**: Use for authentication, validation, logging
5. **Error Handling**: Always use try-catch blocks
6. **Environment Variables**: Never hardcode sensitive data
