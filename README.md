# AXIONARK - Real Hacker Skills Tracker 🏴‍☠️

A gamified progress tracker designed for aspiring hackers who want to master the complete arsenal of offensive security skills. AXIONARK helps you develop real-world hacking abilities from web applications to network pivoting, from USB attacks to zero-day research.

## 🚀 Overview

AXIONARK is your personal companion for becoming a complete hacker. Track your progress from script kiddie to legendary status with a structured roadmap focused on practical hacking skills that work in CTFs, penetration tests, bug bounties, and real-world scenarios.

### Key Features

- **🎯 Complete Hacker Roadmap** - 135+ tasks across 5 phases covering all attack vectors
- **📈 XP & Level System** - Earn experience points and level up as you master skills
- **📔 Encrypted Journal** - Document your hacking journey with AES-256-GCM encryption
- **🐛 Exploit Tracker** - Log vulnerabilities, document techniques, track success
- **💰 Earnings Dashboard** - Monitor bug bounty income and achievements
- **🏆 Achievement System** - Unlock badges for mastering different hacking domains
- **🎨 Cyberpunk UI** - Dark hacker aesthetic with modern design
- **🔐 Zero-Knowledge Architecture** - Your hacking notes are encrypted client-side

## 🛡️ Security & Privacy

- **Client-side AES-256-GCM encryption** - Your sensitive data is encrypted in your browser
- **Zero-knowledge architecture** - We can't read your exploit notes or target details
- **Firebase Authentication** with secure session management
- **Rate limiting** and input sanitization
- **Strict CSP** headers for XSS protection
- **No tracking** - Your hacking journey is yours alone

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 2.0, TypeScript
- **Styling**: Tailwind CSS 3.0 with cyberpunk theme
- **Backend**: Firebase (Auth & Firestore)
- **Security**: Web Crypto API, DOMPurify
- **Analytics**: Privacy-respecting Vercel Analytics
- **Icons**: Heroicons & Custom hacker-themed SVGs

## 📋 Prerequisites

- Node.js 18+ 
- Firebase account (free tier works)
- npm or yarn
- A desire to become a real hacker 🔥

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
    
    match /exploits/{exploitId} {
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

Visit `http://localhost:5173` and start your hacking journey!

## 🎯 Real Hacker Skills Learning Path

AXIONARK features a comprehensive hacking roadmap covering ALL attack vectors:

### 🌱 **Phase 1: Hacker Foundations** (Months 1-6)
- **System Fundamentals**: Linux/Windows mastery, networking, scripting
- **Web Application Hacking**: HTTP, Burp Suite, XSS, SQL injection, web shells
- **Network Hacking**: Nmap, Metasploit, service exploitation, wireless attacks
- **System Exploitation**: Linux/Windows privilege escalation, reverse shells
- **Essential Tools**: Reconnaissance, exploitation frameworks, password cracking
- **Practice & Mastery**: Vulnerable machines, CTFs, first penetration test

### 🚀 **Phase 2: Real Hacker Skills** (Months 7-12)
- **Advanced Web Attacks**: SSRF, XXE, SSTI, deserialization, business logic
- **Network Pivoting**: SSH tunneling, Chisel, multi-hop attacks, lateral movement
- **Active Directory**: BloodHound, Kerberos attacks, domain domination, Mimikatz
- **Physical Attacks**: USB attacks, lock picking, RFID cloning, social engineering
- **Evasion Techniques**: AV evasion, OPSEC, living off the land, steganography
- **Automation**: Python exploits, C2 frameworks, custom tool development

### 💎 **Phase 3: Advanced Hacker** (Months 13-24)
- **Complex Attack Chains**: Web-to-system, phishing-to-domain, multi-stage attacks
- **Cloud Security**: AWS/Azure/GCP exploitation, Kubernetes, serverless attacks
- **Mobile Hacking**: Android/iOS exploitation, mobile network attacks, malware
- **Advanced Techniques**: Binary exploitation, cryptographic attacks, reverse engineering
- **Specialized Targets**: IoT, industrial systems, automotive, blockchain, AI/ML
- **Professional Skills**: Red team operations, penetration testing, vulnerability research

### 🔥 **Phase 4: Elite Hacker** (Years 2-5)
- **Zero-Day Research**: Browser, OS, hardware vulnerabilities, exploit development
- **APT Simulation**: Nation-state TTPs, supply chain attacks, advanced persistence
- **Cutting-Edge Research**: AI security, quantum cryptography, satellite security
- **Industry Leadership**: Conference speaking, tool creation, academic collaboration
- **Mentorship**: Training development, community building, knowledge sharing
- **Financial Success**: Six-figure exploits, million-dollar achievements

### 👑 **Phase 5: Legendary Hacker** (Lifetime Achievement)
- **Global Impact**: Internet-scale vulnerabilities, security protocol design
- **Historical Significance**: Paradigm shifts, legendary hacks, cybersecurity revolution
- **Immortal Legacy**: Hall of fame, educational institutions, billion-user impact
- **Ultimate Mastery**: Omniscient hacker, cyber defense revolution, god-tier status

## 🎮 How It Works

1. **Create Account** - Sign up with email and choose your hacker alias
2. **Track Progress** - Complete tasks from the roadmap to earn XP and level up
3. **Log Exploits** - Record your findings, techniques, and target details
4. **Journal Journey** - Write encrypted notes about your hacking experiences
5. **Monitor Stats** - Watch your level, skills, and achievements grow
6. **Share Success** - Export non-sensitive stats to showcase your skills

## 📊 Features in Detail

### Complete Hacker Roadmap
- 135+ hacking-specific tasks across all domains
- XP rewards based on skill difficulty and impact
- Progression from script kiddie to legendary hacker
- Covers web, network, system, physical, wireless, and advanced techniques

### Exploit Tracking
- Log vulnerability details and exploitation techniques
- Track success rates across different attack vectors
- Monitor earnings from bug bounties and penetration tests
- Categorize by severity, target type, and technique used
- Document payloads, tools, and methodologies

### Encrypted Hacking Journal
- Client-side encryption for sensitive notes
- Document targets, techniques, and lessons learned
- Tag system for organizing different attack types
- Search functionality across all entries
- Export capabilities for sharing knowledge

### Skills Dashboard
- Real-time XP tracking across all hacking domains
- Level progression with hacker-themed titles
- Achievement showcase for mastered techniques
- Activity timeline showing your hacking evolution
- Statistics on favorite attack vectors and success rates

## 🏴‍☠️ Hacking Domains Covered

### Web Application Security
- HTTP protocol mastery, Burp Suite, XSS exploitation
- SQL injection, web shells, SSRF, XXE attacks
- Business logic flaws, API security, authentication bypass

### Network Penetration
- Network scanning, service exploitation, Metasploit
- Wireless attacks, packet analysis, protocol abuse
- Network pivoting, SSH tunneling, lateral movement

### System Exploitation
- Linux/Windows privilege escalation techniques
- Reverse shells, persistence methods, file transfers
- Binary exploitation, kernel attacks, rootkit development

### Active Directory Attacks
- Domain enumeration, Kerberos attacks, BloodHound
- Credential dumping, lateral movement, domain domination
- Golden tickets, DCSync, advanced persistence

### Physical Security
- USB attacks, lock picking, RFID cloning
- Social engineering, hardware hacking, firmware analysis
- Badge cloning, physical penetration, surveillance evasion

### Advanced Techniques
- Zero-day research, exploit development, reverse engineering
- Cryptographic attacks, steganography, covert channels
- Mobile hacking, cloud security, IoT exploitation

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy and start hacking!

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
│   ├── dashboard/      # Main hacker dashboard
│   ├── roadmap/        # Complete hacking roadmap
│   ├── tasks/          # Skill tracker
│   ├── journal/        # Encrypted hacking journal
│   ├── exploits/       # Exploit documentation
│   └── profile/        # Hacker profile settings
├── lib/
│   ├── components/     # Reusable UI components
│   ├── stores/         # State management
│   ├── data/           # Hacking roadmap data
│   ├── utils/          # Security utilities
│   │   ├── encryption.ts
│   │   └── security.ts
│   └── firebase.ts     # Firebase configuration
└── app.css            # Cyberpunk styling
```

## 🤝 Contributing

We welcome contributions from the hacking community! Here's how:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/awesome-hacking-feature`)
3. Commit changes (`git commit -m 'Add awesome hacking feature'`)
4. Push branch (`git push origin feature/awesome-hacking-feature`)
5. Open Pull Request

### Development Guidelines

- Follow existing code style and hacker aesthetic
- Add tests for new features
- Update documentation with new techniques
- Respect ethical hacking principles
- Keep user privacy and security paramount

## 🐛 Bug Reports & Feature Requests

Found a bug or want a new hacking feature? Please open an issue with:
- Clear description of the problem or feature
- Steps to reproduce (for bugs)
- Expected behavior
- Screenshots or code examples
- Your current hacking level (helps with context)

## 📄 License

This project is licensed under the **GNU Affero General Public License v3 (AGPLv3)**.

This means:
- ✅ Use for any purpose (including commercial)
- ✅ Modify and distribute freely
- ✅ Patent protection included
- ⚠️ Must open-source any modifications
- ⚠️ Must disclose source code
- ⚠️ Must use same license for derivatives

Perfect for the hacking community's open-source philosophy!

## 🙏 Acknowledgments

- **Hacking community** for inspiration and knowledge sharing
- **CTF organizers** for creating practical challenges
- **Bug bounty platforms** for making ethical hacking profitable
- **Red team operators** for real-world techniques
- **Security researchers** for pushing boundaries
- **Open source contributors** for making tools accessible
- [SvelteKit](https://kit.svelte.dev/) team for the amazing framework
- [Firebase](https://firebase.google.com/) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling system

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/Duardz/axionark/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Duardz/axionark/discussions)
- **Discord**: Join our hacker community (link in issues)
- **Email**: support@axionark.com
- **Twitter**: @AxionarkHQ

## 🔮 Roadmap

### Short Term
- [ ] Mobile app (PWA) for hacking on the go
- [ ] Team collaboration features for group hacking
- [ ] Browser extension for in-browser note-taking
- [ ] Integration with popular hacking tools

### Medium Term
- [ ] API for custom integrations
- [ ] Advanced analytics and insights
- [ ] Achievement sharing and leaderboards
- [ ] Export to PDF reports

### Long Term
- [ ] AI-powered technique suggestions
- [ ] Automated vulnerability correlation
- [ ] Community marketplace for tools/techniques
- [ ] Virtual hacking lab integration

## 🎯 Philosophy

**"Real hackers don't just run tools - they understand systems, chain attacks, and create their own techniques."**

AXIONARK is built on the philosophy that true hacking mastery comes from:
- **Understanding fundamentals** - not just running scripts
- **Practical application** - skills that work in real scenarios
- **Continuous learning** - staying ahead of defenses
- **Ethical responsibility** - using skills for good
- **Community sharing** - elevating the entire field

## ⚡ Get Started

Ready to begin your journey from script kiddie to legendary hacker?

1. **Clone the repo** and set up your environment
2. **Create your hacker alias** and start tracking progress
3. **Complete your first foundation tasks**
4. **Document your journey** in the encrypted journal
5. **Join the community** and share your achievements

---

**⚡ AXIONARK** - Your complete journey to hacking mastery.

*"The best hackers are made, not born. Start your transformation today."*

---

## ⚠️ Legal Disclaimer

AXIONARK is designed for **educational purposes and ethical hacking only**. Users must:
- Only test systems you own or have explicit permission to test
- Follow responsible disclosure practices
- Comply with local laws and regulations
- Use skills for defensive and educational purposes
- Respect others' privacy and digital property

The creators of AXIONARK are not responsible for misuse of the information or tools referenced in this platform. Always hack ethically and legally.

---

**Happy Hacking! 🏴‍☠️**