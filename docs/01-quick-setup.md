# 🚀 Quick Setup Guide

Get Luvix AI CRM running in 30 minutes!

## 📋 Prerequisites

Before you start, make sure you have:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended)

### Required Accounts
- **Supabase Account** (Free) - [Sign up here](https://supabase.com/)
- **Google Cloud Account** (Optional) - [Sign up here](https://cloud.google.com/)
- **Stripe Account** (Optional) - [Sign up here](https://stripe.com/)

## 🔧 Installation Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/luvix-AI-CRM.git
cd luvix-AI-CRM
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Create environment files:

**Frontend Environment (`.env.local`):**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Drive API (Optional)
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_FOLDER_ID=your_google_folder_id_here

# Stripe (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

**Backend Environment (`.env`):**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Server Configuration
PORT=4000
NODE_ENV=development
```

## 🗄️ Database Setup

### Step 1: Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose organization and enter project details
4. Set a strong database password
5. Click "Create new project"

### Step 2: Get API Keys
1. Go to Settings → API
2. Copy your **Project URL** and **anon public** key
3. Copy your **service_role** key (keep this secret!)

### Step 3: Create Database Tables
Run this SQL in your Supabase SQL Editor:

```sql
-- Create main chat table
CREATE TABLE IF NOT EXISTS public.luvix_hoichat_app (
  id TEXT NOT NULL,
  profile_name JSONB,
  wp_created_at TIMESTAMPTZ,
  luvix_created_at TIMESTAMPTZ,
  wp_user_msg JSONB,
  luvix_msg JSONB,
  wp_user_msg_file JSONB,
  luvix_msg_type TEXT,
  luvix_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.luvix_hoichat_app ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to read luvix_hoichat_app"
ON public.luvix_hoichat_app
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS luvix_hoichat_app_created_at_idx 
ON public.luvix_hoichat_app (wp_created_at DESC, luvix_created_at DESC);
```

## 🚀 Running the Application

### Step 1: Start the Backend
```bash
# Terminal 1
npm run server
```

### Step 2: Start the Frontend
```bash
# Terminal 2
npm run dev
```

### Step 3: Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## ✅ Verification Steps

### Test Authentication
1. Go to http://localhost:5173
2. Click "Sign Up" and create an account
3. Verify you can log in successfully

### Test Database Connection
1. After logging in, check if you can see the chat interface
2. The app should load without errors

### Test Features
- [ ] User registration/login works
- [ ] Chat interface loads
- [ ] No console errors
- [ ] Database queries work

## 🔧 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection errors:**
- Verify your API keys are correct
- Check if your Supabase project is active
- Ensure RLS policies are set up correctly

**Backend not starting:**
- Check if port 4000 is available
- Verify all environment variables are set
- Check the console for specific error messages

### Getting Help
- Check the browser console for errors
- Check the terminal for backend errors
- Verify all environment variables are set correctly

## 🎉 Next Steps

Once your local setup is working:

1. **Configure n8n Integration** (see `02-n8n-integration.md`)
2. **Set up Production Deployment** (see `03-production-deployment.md`)
3. **Configure Google Drive** (see `04-google-drive-setup.md`)

---

**⏱️ Expected Setup Time: 30 minutes**
**🎯 Success Criteria: App loads without errors and you can create an account**

Need help? Check the troubleshooting section or create an issue in the repository.
