# AXIONARK - Bug Bounty Journey Tracker 🎯

A gamified progress tracker designed specifically for bug bounty hunters. AXIONARK helps you master bug hunting skills, track your findings, monitor earnings, and document your journey with military-grade encryption.

## 🚀 Overview

AXIONARK is your personal companion for bug bounty hunting. Track your progress from beginner to legendary status with a structured roadmap focused on real bug bounty skills and achievements.

### Key Features

- **🎯 Bug Bounty Roadmap** - 135+ tasks across 5 phases specifically for bug hunters
- **📈 XP & Level System** - Earn experience points and level up as you complete objectives
- **📔 Encrypted Journal** - Document findings with AES-256-GCM client-side encryption
- **🐛 Bug Tracker** - Log vulnerabilities, track bounties, and monitor success rates
- **💰 Earnings Dashboard** - Track your bug bounty income and milestones
- **🏆 Achievement System** - Unlock badges for major accomplishments
- **🎨 Modern UI** - Cyberpunk-inspired design with dark/light themes
- **🔐 Zero-Knowledge Architecture** - Your data is encrypted before leaving your device

## 🛡️ Security & Privacy

- **Client-side AES-256-GCM encryption** - Your sensitive data is encrypted in your browser
- **Zero-knowledge architecture** - We can't read your journal entries or bug details
- **Firebase Authentication** with secure session management
- **Rate limiting** and input sanitization
- **Strict CSP** headers for XSS protection
- **No tracking** - Your journey is yours alone

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 2.0, TypeScript
- **Styling**: Tailwind CSS 3.0
- **Backend**: Firebase (Auth & Firestore)
- **Security**: Web Crypto API, DOMPurify
- **Analytics**: Privacy-respecting Vercel Analytics
- **Icons**: Heroicons & Custom SVGs

## 📋 Prerequisites

- Node.js 18+ 
- Firebase account (free tier works)
- npm or yarn

## 🚦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Duardz/axionark.git
cd axionark
npm install
```

### 2. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password provider)
3. Create **Firestore Database** in production mode
4. Get your config from Project Settings > General

### 3. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Add your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Replace default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /journal/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uid;
    }
    
    match /bugs/{bugId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uid;
    }
    
    match /usernames/{username} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.uid;
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🎯 Bug Bounty Learning Path

AXIONARK features a comprehensive bug bounty roadmap:

### 🌱 **Phase 1: Foundations** (Months 1-4)
- Web technology fundamentals
- Essential tools setup (Burp Suite, recon tools)
- Basic vulnerabilities (XSS, SQLi, IDOR)
- First bug submission

### 🚀 **Phase 2: Advanced Hunting** (Months 5-12)
- Complex vulnerabilities (SSRF, XXE, Deserialization)
- API and mobile testing
- Automation and scaling
- First $10,000 milestone

### 💎 **Phase 3: Expert Hunter** (Months 13-24)
- Vulnerability chaining techniques
- Cloud platform security
- Specialized targets
- $100,000+ earnings goal

### 🔥 **Phase 4: Elite Researcher** (Year 3+)
- Zero-day research
- Industry leadership
- Mentorship and education
- $1M+ lifetime earnings

### 👑 **Phase 5: Legendary Status** (Lifetime)
- Global security impact
- Legacy building
- Ultimate mastery

## 🎮 How It Works

1. **Create Account** - Sign up with email and choose your hacker alias
2. **Track Progress** - Complete tasks from the roadmap to earn XP
3. **Log Bugs** - Record your findings with severity, bounty, and details
4. **Journal Journey** - Write encrypted notes about your experiences
5. **Monitor Stats** - Watch your level, earnings, and achievements grow
6. **Share Success** - Export non-sensitive stats to share your progress

## 📊 Features in Detail

### Task Management
- 135+ bug bounty specific tasks
- XP rewards for completion
- Progress tracking per category
- Suggested learning order

### Bug Tracking
- Log vulnerability details
- Track bounty amounts
- Monitor acceptance rates
- Categorize by severity
- Platform statistics

### Encrypted Journal
- Client-side encryption
- Mood tracking
- Tag system
- Search functionality
- Export capabilities

### Progress Dashboard
- Real-time XP tracking
- Level progression
- Earnings overview
- Activity timeline
- Achievement showcase

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Self-Hosting

```bash
npm run build
npm run preview
```

Deploy the `build` folder to any static host.

## 📁 Project Structure

```
src/
├── routes/              # SvelteKit pages
│   ├── +page.svelte    # Landing/Auth
│   ├── dashboard/      # Main dashboard
│   ├── roadmap/        # Bug bounty roadmap
│   ├── tasks/          # Task tracker
│   ├── journal/        # Encrypted journal
│   ├── bugs/           # Bug reports
│   └── profile/        # User settings
├── lib/
│   ├── components/     # Reusable UI
│   ├── stores/         # State management
│   ├── data/           # Roadmap data
│   ├── utils/          # Helpers
│   │   ├── encryption.ts
│   │   └── security.ts
│   └── firebase.ts
└── app.css            # Global styles
```

## 🤝 Contributing

We love contributions! Here's how:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/awesome-feature`)
3. Commit changes (`git commit -m 'Add awesome feature'`)
4. Push branch (`git push origin feature/awesome-feature`)
5. Open Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep accessibility in mind
- Respect user privacy

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 📄 License

This project is licensed under the **GNU Affero General Public License v3 (AGPLv3)**.

This means:
- ✅ Use for any purpose
- ✅ Modify and distribute
- ✅ Patent protection
- ⚠️ Must open-source modifications
- ⚠️ Must disclose source
- ⚠️ Must use same license

See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Bug bounty community for inspiration
- [SvelteKit](https://kit.svelte.dev/) team
- [Firebase](https://firebase.google.com/) for backend
- [Tailwind CSS](https://tailwindcss.com/) for styling
- All contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Duardz/axionark/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Duardz/axionark/discussions)
- **Email**: support@axionark.com

## 🔮 Roadmap

- [ ] Mobile app (PWA)
- [ ] Team collaboration features
- [ ] API for integrations
- [ ] Browser extension
- [ ] More achievement types
- [ ] Export to PDF reports
- [ ] Backup/restore functionality

---

**⚡ AXIONARK** - Track your journey from script kiddie to legendary bug hunter.

*Not affiliated with any bug bounty platform. This is a personal progress tracker.*