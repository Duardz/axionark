# AXIONARK - Personal Hacking Journey Tracker 🎯

A gamified personal progress tracker for bug bounty hunters and security researchers. Built with SvelteKit, TypeScript, Firebase, and Tailwind CSS, AXIONARK helps you document your hacking journey, track bug bounty rewards, manage learning tasks with XP progression, and maintain an encrypted journal of your experiences.

## 🚀 Features

### Core Features
- 📚 **Personal Learning Roadmap**: Track your own cybersecurity journey with 122 suggested tasks across 5 phases
- 📝 **XP-Based Progress Tracking**: Mark tasks complete and earn experience points as you learn
- 📔 **Encrypted Journey Journal**: Document your daily hacking experiences with client-side encryption
- 🐛 **Bug Bounty Tracker**: Log vulnerabilities found and track your earnings
- 💰 **Rewards Dashboard**: Monitor your bug bounty income and statistics
- 👤 **Gamified Profile**: View your level, total XP, skills, and achievements
- 🎮 **Achievement System**: Unlock badges as you reach milestones in your journey
- 🔒 **Private & Secure**: All your data is encrypted and only accessible by you

### Security Features
- 🛡️ Client-side encryption for journal entries and bug reports
- 🔐 Firebase Authentication with secure session management
- 🚦 Rate limiting and CSRF protection
- 🧹 Input sanitization and XSS prevention
- 📋 Strict Content Security Policy (CSP)
- 🔑 Secure password requirements and validation

## 🎨 UI/UX Features
- 🌓 Dark/Light mode support
- 📱 Fully responsive design
- ✨ Cyberpunk-inspired animations and effects
- 🎯 Real-time progress tracking
- 🏆 Interactive leaderboard (coming soon)

## Prerequisites

- Node.js 18+ installed
- Firebase account for backend services
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/axionark.git
cd axionark
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore Database (Start in production mode)
5. Get your configuration from Project Settings

### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your Firebase configuration:

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
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidUsername(username) {
      return username.matches('^[a-zA-Z0-9_-]{3,50}

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Add environment variables in Netlify dashboard

## 📁 Project Structure

```
src/
├── routes/
│   ├── +page.svelte          # Landing/Auth page
│   ├── dashboard/            # Main dashboard
│   ├── roadmap/              # Learning roadmap
│   ├── tasks/                # Task management
│   ├── journal/              # Learning journal
│   ├── bugs/                 # Bug tracker
│   └── profile/              # User profile & settings
├── lib/
│   ├── components/           # Reusable components
│   ├── stores/               # Svelte stores
│   ├── data/                 # Static data (roadmap)
│   ├── utils/                # Utility functions
│   │   ├── security.ts       # Security utilities
│   │   ├── encryption.ts     # Encryption logic
│   │   └── encryption-migration.ts
│   └── firebase.ts           # Firebase config
├── hooks.server.ts           # Server-side security
└── app.css                   # Global styles
```

## 🔒 Security Architecture

- **Authentication**: Firebase Auth with email/password
- **Data Encryption**: Client-side AES-256-GCM encryption
- **Input Validation**: Comprehensive sanitization using DOMPurify
- **Rate Limiting**: Protection against brute force attacks
- **CSRF Protection**: Token-based CSRF prevention
- **CSP Headers**: Strict Content Security Policy
- **XSS Prevention**: Output encoding and input sanitization

## 🎮 How It Works

AXIONARK is your personal companion for tracking your bug bounty and security research journey:

1. **Create Your Profile**: Sign up and set your hacker username
2. **Follow the Roadmap**: Use the suggested 36-month learning path or create your own
3. **Complete Tasks**: Mark tasks as done and earn XP to level up
4. **Log Your Bugs**: Record vulnerabilities found, programs, severity, and rewards
5. **Journal Your Journey**: Write encrypted daily entries about your experiences
6. **Track Progress**: Monitor your stats, earnings, and achievements
7. **Level Up**: Gain XP from tasks and unlock new achievements

Unlike platforms like TryHackMe or HackTheBox, AXIONARK doesn't provide challenges or learning content - it's a personal tracker for YOUR real-world hacking journey.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Backend by [Firebase](https://firebase.google.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Code assistance by [Claude AI](https://claude.ai/)

## 📞 Support

For support, email support@axionark.com or join our Discord community.);
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      
      // Allow creating user document
      allow create: if isOwner(userId);
      
      // Allow updates to user's own document
      allow update: if isOwner(userId) && 
        request.resource.data.uid == userId && // Can't change uid
        request.resource.data.uid == resource.data.uid; // uid must remain the same
      
      // Allow users to delete their own document (for account deletion)
      allow delete: if isOwner(userId);
    }
    
    // Usernames collection - for unique username checking
    match /usernames/{username} {
      allow read: if true; // Anyone can check if username exists
      allow create: if isAuthenticated() && 
        isValidUsername(username) &&
        request.resource.data.uid == request.auth.uid;
      allow update: if false; // Usernames shouldn't be updated
      allow delete: if isAuthenticated() && 
        resource.data.uid == request.auth.uid; // Can only delete own username
    }
    
    // Journal entries
    match /journal/{entryId} {
      // Users can read, write, update, delete their own entries
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.uid;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.uid;
      allow delete: if isAuthenticated() && 
        request.auth.uid == resource.data.uid;
    }
    
    // Bugs collection
    match /bugs/{bugId} {
      // Users can read, write, update, delete their own bugs
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.uid;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.uid;
      allow delete: if isAuthenticated() && 
        request.auth.uid == resource.data.uid;
    }
    
    // User preferences collection (for game settings)
    match /preferences/{userId} {
      allow read: if isOwner(userId);
      allow create, update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Add environment variables in Netlify dashboard

## 📁 Project Structure

```
src/
├── routes/
│   ├── +page.svelte          # Landing/Auth page
│   ├── dashboard/            # Main dashboard
│   ├── roadmap/              # Learning roadmap
│   ├── tasks/                # Task management
│   ├── journal/              # Learning journal
│   ├── bugs/                 # Bug tracker
│   └── profile/              # User profile & settings
├── lib/
│   ├── components/           # Reusable components
│   ├── stores/               # Svelte stores
│   ├── data/                 # Static data (roadmap)
│   ├── utils/                # Utility functions
│   │   ├── security.ts       # Security utilities
│   │   ├── encryption.ts     # Encryption logic
│   │   └── encryption-migration.ts
│   └── firebase.ts           # Firebase config
├── hooks.server.ts           # Server-side security
└── app.css                   # Global styles
```

## 🔒 Security Architecture

- **Authentication**: Firebase Auth with email/password
- **Data Encryption**: Client-side AES-256-GCM encryption
- **Input Validation**: Comprehensive sanitization using DOMPurify
- **Rate Limiting**: Protection against brute force attacks
- **CSRF Protection**: Token-based CSRF prevention
- **CSP Headers**: Strict Content Security Policy
- **XSS Prevention**: Output encoding and input sanitization

## 🎮 Learning Path

The platform includes a comprehensive roadmap with:

### Foundation Phase (Months 1-6)
- System fundamentals
- Networking mastery
- Programming basics
- Security fundamentals

### Penetration Testing (Months 7-18)
- Web application security
- Network pentesting
- Active Directory attacks
- Exploit development

### Advanced Security (Months 19-30)
- Cloud security
- Mobile testing
- Advanced exploitation
- Bug bounty mastery

### Red Team Operations (Months 31-36)
- Adversary emulation
- Custom implants
- Social engineering

### Elite Researcher (Endless)
- Zero-day research
- Industry leadership
- Specialized expertise

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Backend by [Firebase](https://firebase.google.com/)
- Icons from [Heroicons](https://heroicons.com/)

## 📞 Support

For support, email support@axionark.com or join our Discord community.