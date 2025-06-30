# AXIONARK - Personal Hacking Journey Tracker 🎯

A gamified personal progress tracker designed for bug bounty hunters and security researchers. AXIONARK helps you document your cybersecurity journey, track rewards, manage learning progress, and maintain an encrypted journal of your experiences.

## 🚀 Overview

AXIONARK is your personal companion for tracking your bug bounty and security research journey. Unlike platforms that provide challenges or learning content, AXIONARK focuses on helping you document and track YOUR real-world hacking experiences and achievements.

### Key Features

- **📚 Personal Learning Roadmap** - Track your cybersecurity journey with 122 suggested tasks across 5 phases
- **📝 XP-Based Progress System** - Earn experience points as you complete learning objectives
- **📔 Encrypted Journal** - Document daily experiences with client-side encryption
- **🐛 Bug Bounty Tracker** - Log vulnerabilities and track earnings
- **💰 Rewards Dashboard** - Monitor bug bounty income and statistics
- **🎮 Achievement System** - Unlock badges as you reach milestones
- **🌓 Modern UI** - Dark/light mode with cyberpunk-inspired design

## 🛡️ Security Features

- Client-side AES-256-GCM encryption for sensitive data
- Firebase Authentication with secure session management
- Rate limiting and CSRF protection
- Input sanitization to prevent XSS attacks
- Strict Content Security Policy (CSP)
- Secure password validation

## 🛠️ Tech Stack

- **Frontend**: SvelteKit, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth & Firestore)
- **Security**: DOMPurify, client-side encryption
- **Icons**: Heroicons

## 📋 Prerequisites

- Node.js 18+ 
- Firebase account
- npm or yarn package manager

## 🚦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/axionark.git
cd axionark
npm install
```

### 2. Firebase Setup

1. Create a new project in [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore Database (production mode)
4. Copy your configuration from Project Settings

### 3. Environment Configuration

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Configure Security Rules

Add the following rules to your Firestore database:

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
      return username.matches('^[a-zA-Z0-9_-]{3,50}$');
    }
    
    // Add your security rules here
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Access the application at `http://localhost:5173`

## 🚀 Deployment

### Vercel

1. Push code to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Netlify

1. Build: `npm run build`
2. Deploy `build` folder to Netlify
3. Configure environment variables

## 📁 Project Structure

```
src/
├── routes/                   # Page components
│   ├── +page.svelte         # Landing/Auth
│   ├── dashboard/           # Main dashboard
│   ├── roadmap/             # Learning roadmap
│   ├── tasks/               # Task management
│   ├── journal/             # Encrypted journal
│   ├── bugs/                # Bug tracker
│   └── profile/             # User settings
├── lib/
│   ├── components/          # Reusable components
│   ├── stores/              # Svelte stores
│   ├── data/                # Static data
│   ├── utils/               # Utilities
│   │   ├── security.ts      # Security helpers
│   │   ├── encryption.ts    # Encryption logic
│   │   └── validation.ts    # Input validation
│   └── firebase.ts          # Firebase config
├── hooks.server.ts          # Server middleware
└── app.css                  # Global styles
```

## 🎯 Learning Path Overview

AXIONARK includes a structured 36-month roadmap:

1. **Foundation (Months 1-6)**: System fundamentals, networking, programming basics
2. **Penetration Testing (Months 7-18)**: Web security, network pentesting, AD attacks
3. **Advanced Security (Months 19-30)**: Cloud security, mobile testing, exploitation
4. **Red Team Ops (Months 31-36)**: Adversary emulation, custom tools
5. **Elite Research (Ongoing)**: Zero-day research, specialization

## 🎮 How to Use AXIONARK

1. **Sign Up** - Create account with secure credentials
2. **Set Profile** - Choose your hacker username
3. **Follow Roadmap** - Use suggested path or customize
4. **Complete Tasks** - Mark completed and earn XP
5. **Log Bugs** - Record findings with details
6. **Journal Progress** - Write encrypted entries
7. **Track Stats** - Monitor earnings and achievements

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Firebase](https://firebase.google.com/) - Backend services
- [Heroicons](https://heroicons.com/) - Icon library
- [Claude AI](https://claude.ai/) - Development assistance

## 📞 Support

- Email: support@axionark.com
- Discord: [Join our community](#)
- Issues: [GitHub Issues](https://github.com/Duardz/axionark/issues)

---

**Note**: AXIONARK is a progress tracker, not a learning platform. It helps you document your real-world security research journey rather than providing challenges or educational content.