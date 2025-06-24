# AXIONARK - Elite Bug Bounty Training Platform

A futuristic web application for tracking your bug bounty learning journey, built with SvelteKit, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

- 📚 **Structured Roadmap**: Complete path from beginner to advanced bug hunter
- 📝 **Task Management**: Track your progress with XP-based system (with undo capability)
- 📔 **Learning Journal**: Document your daily learning experiences
- 🐛 **Bug Tracker**: Keep track of found vulnerabilities and earnings
- 👤 **User Profile**: Monitor your achievements and statistics
- 🎨 **Futuristic UI**: Cyberpunk-inspired design with neon effects
- 📱 **Responsive Design**: Works seamlessly on all devices

## Prerequisites

- Node.js 18+ installed
- Firebase account for backend services
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# Also install required dependencies
npm install firebase tailwindcss
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore Database
5. Get your configuration from Project Settings

### 3. Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Security Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Journal entries
    match /journal/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uid;
    }
    
    // Bug reports
    match /bugs/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uid;
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
src/
├── routes/
│   ├── +page.svelte          # Home/Auth page
│   ├── dashboard/
│   │   └── +page.svelte      # Main dashboard
│   ├── roadmap/
│   │   └── +page.svelte      # Roadmap viewer
│   ├── tasks/
│   │   └── +page.svelte      # Task management
│   ├── journal/
│   │   └── +page.svelte      # Learning journal
│   ├── bugs/
│   │   └── +page.svelte      # Bug tracker
│   └── profile/
│       └── +page.svelte      # User profile
├── lib/
│   ├── components/
│   │   └── Navbar.svelte     # Navigation component
│   ├── stores/
│   │   ├── auth.ts           # Authentication store
│   │   └── user.ts           # User data stores
│   ├── data/
│   │   └── roadmap.ts        # Roadmap data structure
│   └── firebase.ts           # Firebase configuration
└── app.css                   # Global styles
```

## Security Features

- Input validation and sanitization
- Firebase security rules for data access control
- Protected routes with authentication checks
- XSS prevention through proper data handling
- CSRF protection via SvelteKit's built-in features

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT