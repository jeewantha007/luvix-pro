# LUVIX - CRM Bot

A modern CRM application with chat functionality, built with React, TypeScript, and Tailwind CSS.

## Features

- **Chat Interface**: Real-time messaging with contact management
- **Google Drive Integration**: Browse and select files from Google Drive
- **Dark/Light Mode**: Responsive design with theme switching
- **Contact Management**: Organize and manage your contacts
- **Settings & Storage**: Manage application settings and data storage

## Google Drive Picker Integration

The application includes Google Drive Picker integration that allows users to:

1. **Browse Google Drive**: Click the "Open Google Drive Folder" button in the Storage & Data section
2. **Select Files**: Choose multiple files from your Google Drive
3. **View Selected Files**: See a list of selected files with their names and sizes

### Setup Requirements

To use the Google Drive Picker, you need:

1. **Google Cloud Console Project**: Create a project and enable the Google Drive API
2. **OAuth 2.0 Credentials**: Configure OAuth consent screen and create credentials
3. **API Keys**: Set up the necessary API keys

### Configuration

To use the Google Drive integration, you need to set up environment variables. Create a `.env` file in the root directory with the following variables:

```env
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_FOLDER_ID=your_google_folder_id_here
```

#### Setup Steps:

1. **Google Cloud Console**: 
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Drive API

2. **Create Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Create an API Key for `VITE_GOOGLE_API_KEY`
   - Create OAuth 2.0 Client ID for `VITE_GOOGLE_CLIENT_ID`
   - Add your domain to authorized origins

3. **Get Folder ID**:
   - Open your Google Drive folder in the browser
   - The folder ID is in the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Use this ID for `VITE_GOOGLE_FOLDER_ID`

### Usage

1. Navigate to Settings → Storage & Data
2. Click "Open Google Drive Folder" button
3. Authenticate with your Google account
4. Navigate to your desired folder (e.g., `https://drive.google.com/drive/folders/1YuOGGNI2PxdCly1KV5MaijTJiCWExV0p`)
5. Select files and click "Select"
6. View selected files in the application

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons
- react-google-drive-picker
- Supabase (for backend services)


