export interface Task {
  id: string;
  title: string;
  description: string;
  xp: number;
  phase: 'foundation' | 'pentesting' | 'advanced' | 'redteam' | 'elite';
  category: string;
  order: number;
}

export interface Phase {
  id: 'foundation' | 'pentesting' | 'advanced' | 'redteam' | 'elite';
  title: string;
  description: string;
  duration: string;
  categories: Category[];
}

export interface Category {
  id: string;
  title: string;
  tasks: Task[];
}

export const roadmapData: Phase[] = [
  {
    id: 'foundation',
    title: 'Bug Bounty Foundations',
    description: 'Master Web Fundamentals, Basic Vulnerabilities, and Essential Tools',
    duration: 'Months 1-4',
    categories: [
      {
        id: 'web-fundamentals',
        title: 'Web Technology Fundamentals',
        tasks: [
          {
            id: 'http-protocol-mastery',
            title: 'HTTP/HTTPS Protocol Deep Dive',
            description: 'Request/response structure, headers, methods (GET/POST/PUT/DELETE), status codes, cookies, sessions, HTTP/2',
            xp: 1000,
            phase: 'foundation',
            category: 'web-fundamentals',
            order: 1
          },
          {
            id: 'web-architecture',
            title: 'Modern Web Architecture',
            description: 'Client-server model, APIs, microservices, load balancers, CDNs, reverse proxies, web servers',
            xp: 800,
            phase: 'foundation',
            category: 'web-fundamentals',
            order: 2
          },
          {
            id: 'html-css-javascript',
            title: 'HTML/CSS/JavaScript Essentials',
            description: 'DOM manipulation, event handling, AJAX, fetch API, local/session storage, same-origin policy',
            xp: 1200,
            phase: 'foundation',
            category: 'web-fundamentals',
            order: 3
          },
          {
            id: 'browser-developer-tools',
            title: 'Browser DevTools Mastery',
            description: 'Network tab analysis, console usage, debugger, elements inspection, storage examination, performance profiling',
            xp: 700,
            phase: 'foundation',
            category: 'web-fundamentals',
            order: 4
          },
          {
            id: 'web-technologies',
            title: 'Common Web Technologies',
            description: 'JSON, XML, REST APIs, GraphQL basics, WebSockets, cookies vs tokens, CORS fundamentals',
            xp: 900,
            phase: 'foundation',
            category: 'web-fundamentals',
            order: 5
          }
        ]
      },
      {
        id: 'bug-bounty-basics',
        title: 'Bug Bounty Essentials',
        tasks: [
          {
            id: 'bug-bounty-platforms',
            title: 'Bug Bounty Platform Setup',
            description: 'HackerOne, Bugcrowd, Intigriti, YesWeHack account setup, profile optimization, program selection',
            xp: 600,
            phase: 'foundation',
            category: 'bug-bounty-basics',
            order: 6
          },
          {
            id: 'scope-understanding',
            title: 'Understanding Scope & Rules',
            description: 'In-scope vs out-of-scope, VDP vs paid programs, safe harbor, responsible disclosure, duplicate handling',
            xp: 800,
            phase: 'foundation',
            category: 'bug-bounty-basics',
            order: 7
          },
          {
            id: 'report-writing-basics',
            title: 'Bug Report Writing Fundamentals',
            description: 'Report structure, proof of concept, impact explanation, CVSS scoring, reproduction steps',
            xp: 1200,
            phase: 'foundation',
            category: 'bug-bounty-basics',
            order: 8
          },
          {
            id: 'bug-bounty-methodology',
            title: 'Basic Bug Hunting Methodology',
            description: 'Reconnaissance workflow, target mapping, vulnerability identification, validation, reporting pipeline',
            xp: 1500,
            phase: 'foundation',
            category: 'bug-bounty-basics',
            order: 9
          },
          {
            id: 'bounty-expectations',
            title: 'Setting Realistic Expectations',
            description: 'Understanding payouts, dealing with duplicates, triage process, communication with programs',
            xp: 500,
            phase: 'foundation',
            category: 'bug-bounty-basics',
            order: 10
          }
        ]
      },
      {
        id: 'essential-tools',
        title: 'Essential Bug Hunting Tools',
        tasks: [
          {
            id: 'burp-suite-basics',
            title: 'Burp Suite Community Fundamentals',
            description: 'Proxy setup, intercepting requests, repeater, intruder basics, decoder, target scope configuration',
            xp: 1500,
            phase: 'foundation',
            category: 'essential-tools',
            order: 11
          },
          {
            id: 'reconnaissance-tools',
            title: 'Recon Tool Arsenal',
            description: 'Subfinder, Amass, findomain, httpx, nuclei basics, waybackurls, gau, github dorking',
            xp: 1200,
            phase: 'foundation',
            category: 'essential-tools',
            order: 12
          },
          {
            id: 'browser-extensions',
            title: 'Browser Extensions for Bug Hunting',
            description: 'Wappalyzer, Cookie Editor, User-Agent Switcher, FoxyProxy, Shodan extension, Hunt scanner',
            xp: 600,
            phase: 'foundation',
            category: 'essential-tools',
            order: 13
          },
          {
            id: 'terminal-tools',
            title: 'Command Line Tools Setup',
            description: 'curl, wget, nmap basics, dig, whois, nc (netcat), grep/sed/awk for parsing',
            xp: 1000,
            phase: 'foundation',
            category: 'essential-tools',
            order: 14
          },
          {
            id: 'note-taking-setup',
            title: 'Documentation & Note-Taking',
            description: 'Obsidian/Notion setup, screenshot tools, screen recording, POC organization, findings tracking',
            xp: 700,
            phase: 'foundation',
            category: 'essential-tools',
            order: 15
          }
        ]
      },
      {
        id: 'basic-vulnerabilities',
        title: 'Common Web Vulnerabilities',
        tasks: [
          {
            id: 'xss-basics',
            title: 'Cross-Site Scripting (XSS) Fundamentals',
            description: 'Reflected XSS, stored XSS, DOM XSS basics, alert() payloads, filter bypasses, impact demonstration',
            xp: 1800,
            phase: 'foundation',
            category: 'basic-vulnerabilities',
            order: 16
          },
          {
            id: 'sqli-introduction',
            title: 'SQL Injection Basics',
            description: 'Error-based SQLi, Union-based extraction, Boolean blind basics, basic sqlmap usage',
            xp: 2000,
            phase: 'foundation',
            category: 'basic-vulnerabilities',
            order: 17
          },
          {
            id: 'idor-basics',
            title: 'Insecure Direct Object References',
            description: 'User ID manipulation, sequential ID testing, UUID enumeration, access control testing',
            xp: 1500,
            phase: 'foundation',
            category: 'basic-vulnerabilities',
            order: 18
          },
          {
            id: 'information-disclosure',
            title: 'Information Disclosure Bugs',
            description: 'Sensitive data in responses, debug information, backup files, directory listing, version disclosure',
            xp: 1200,
            phase: 'foundation',
            category: 'basic-vulnerabilities',
            order: 19
          },
          {
            id: 'authentication-flaws',
            title: 'Basic Authentication Vulnerabilities',
            description: 'Weak passwords, username enumeration, password reset flaws, session fixation',
            xp: 1600,
            phase: 'foundation',
            category: 'basic-vulnerabilities',
            order: 20
          }
        ]
      },
      {
        id: 'reconnaissance-basics',
        title: 'Reconnaissance Fundamentals',
        tasks: [
          {
            id: 'subdomain-enumeration',
            title: 'Subdomain Discovery Techniques',
            description: 'DNS brute-forcing, certificate transparency, search engines, passive DNS, subdomain takeover basics',
            xp: 1500,
            phase: 'foundation',
            category: 'reconnaissance-basics',
            order: 21
          },
          {
            id: 'google-dorking',
            title: 'Google Dorking for Bug Bounty',
            description: 'Advanced search operators, finding sensitive files, exposed databases, admin panels, API endpoints',
            xp: 1000,
            phase: 'foundation',
            category: 'reconnaissance-basics',
            order: 22
          },
          {
            id: 'github-recon',
            title: 'GitHub Reconnaissance',
            description: 'Finding API keys, credentials, internal endpoints, sensitive configuration files, development notes',
            xp: 1200,
            phase: 'foundation',
            category: 'reconnaissance-basics',
            order: 23
          },
          {
            id: 'wayback-analysis',
            title: 'Historical Data Analysis',
            description: 'Wayback Machine usage, finding old endpoints, parameter discovery, functionality changes',
            xp: 900,
            phase: 'foundation',
            category: 'reconnaissance-basics',
            order: 24
          },
          {
            id: 'technology-fingerprinting',
            title: 'Technology Stack Identification',
            description: 'Identifying frameworks, CMS detection, server identification, JavaScript library enumeration',
            xp: 800,
            phase: 'foundation',
            category: 'reconnaissance-basics',
            order: 25
          }
        ]
      },
      {
        id: 'practice-targets',
        title: 'Practice & Learning Platforms',
        tasks: [
          {
            id: 'portswigger-labs',
            title: 'PortSwigger Web Security Academy',
            description: 'Complete all apprentice-level labs, understand core concepts, practice exploitation techniques',
            xp: 3000,
            phase: 'foundation',
            category: 'practice-targets',
            order: 26
          },
          {
            id: 'hackerone-ctf',
            title: 'HackerOne CTF Challenges',
            description: 'Complete Hacker101 CTF easy and medium challenges, understand vulnerability patterns',
            xp: 2500,
            phase: 'foundation',
            category: 'practice-targets',
            order: 27
          },
          {
            id: 'vulnerable-apps',
            title: 'Vulnerable Application Practice',
            description: 'DVWA, bWAPP, OWASP Juice Shop, WebGoat - practice basic vulnerability exploitation',
            xp: 2000,
            phase: 'foundation',
            category: 'practice-targets',
            order: 28
          },
          {
            id: 'bug-bounty-writeups',
            title: 'Study Bug Bounty Writeups',
            description: 'Read 50+ disclosed reports, understand methodology, learn from top researchers',
            xp: 1500,
            phase: 'foundation',
            category: 'practice-targets',
            order: 29
          },
          {
            id: 'first-valid-bug',
            title: 'Find Your First Valid Bug',
            description: 'Submit first accepted vulnerability report on any platform, even if low severity',
            xp: 5000,
            phase: 'foundation',
            category: 'practice-targets',
            order: 30
          }
        ]
      }
    ]
  },
  {
    id: 'pentesting',
    title: 'Advanced Bug Hunting',
    description: 'Complex Vulnerabilities, Automation, API Testing, and Mobile Security',
    duration: 'Months 5-12',
    categories: [
      {
        id: 'advanced-web-vulns',
        title: 'Advanced Web Vulnerabilities',
        tasks: [
          {
            id: 'ssrf-mastery',
            title: 'Server-Side Request Forgery (SSRF)',
            description: 'Basic to blind SSRF, cloud metadata exploitation, internal network scanning, filter bypasses',
            xp: 3500,
            phase: 'pentesting',
            category: 'advanced-web-vulns',
            order: 31
          },
          {
            id: 'xxe-exploitation',
            title: 'XML External Entity (XXE) Attacks',
            description: 'XXE to file read, blind XXE, XXE to SSRF, DTD attacks, SVG/XLSX/DOCX XXE',
            xp: 3800,
            phase: 'pentesting',
            category: 'advanced-web-vulns',
            order: 32
          },
          {
            id: 'deserialization-attacks',
            title: 'Insecure Deserialization',
            description: 'Java, PHP, Python deserialization, gadget chains basics, identifying serialized data',
            xp: 4500,
            phase: 'pentesting',
            category: 'advanced-web-vulns',
            order: 33
          },
          {
            id: 'ssti-exploitation',
            title: 'Server-Side Template Injection',
            description: 'Template engine identification, SSTI to RCE, sandbox escapes, polyglot payloads',
            xp: 4000,
            phase: 'pentesting',
            category: 'advanced-web-vulns',
            order: 34
          },
          {
            id: 'race-conditions',
            title: 'Race Condition Vulnerabilities',
            description: 'TOCTOU bugs, payment races, coupon/voucher abuse, concurrent request exploitation',
            xp: 3800,
            phase: 'pentesting',
            category: 'advanced-web-vulns',
            order: 35
          },
          {
            id: 'cache-poisoning',
            title: 'Web Cache Poisoning',
            description: 'Cache key manipulation, cache deception, response splitting, CDN poisoning',
            xp: 4200,
            phase: 'pentesting',
            category: 'advanced-web-vulns',
            order: 36
          }
        ]
      },
      {
        id: 'authentication-advanced',
        title: 'Advanced Authentication Attacks',
        tasks: [
          {
            id: 'jwt-exploitation',
            title: 'JWT Security Deep Dive',
            description: 'Algorithm confusion, weak secrets, JKU/JWK injection, kid manipulation, null signature',
            xp: 3500,
            phase: 'pentesting',
            category: 'authentication-advanced',
            order: 37
          },
          {
            id: 'oauth-attacks',
            title: 'OAuth 2.0 Security Testing',
            description: 'Authorization code flaws, redirect_uri bypasses, state parameter issues, token leakage',
            xp: 3800,
            phase: 'pentesting',
            category: 'authentication-advanced',
            order: 38
          },
          {
            id: 'saml-vulnerabilities',
            title: 'SAML Attack Techniques',
            description: 'XML signature wrapping, assertion manipulation, recipient confusion, replay attacks',
            xp: 3600,
            phase: 'pentesting',
            category: 'authentication-advanced',
            order: 39
          },
          {
            id: '2fa-bypass',
            title: '2FA/MFA Bypass Techniques',
            description: 'Response manipulation, backup code abuse, race conditions, session persistence',
            xp: 3200,
            phase: 'pentesting',
            category: 'authentication-advanced',
            order: 40
          },
          {
            id: 'password-reset-advanced',
            title: 'Advanced Password Reset Attacks',
            description: 'Token prediction, host header injection, dangling markup, account takeover chains',
            xp: 3000,
            phase: 'pentesting',
            category: 'authentication-advanced',
            order: 41
          }
        ]
      },
      {
        id: 'api-testing',
        title: 'API Security Testing',
        tasks: [
          {
            id: 'rest-api-testing',
            title: 'REST API Security Testing',
            description: 'Method tampering, parameter pollution, mass assignment, versioning issues',
            xp: 3000,
            phase: 'pentesting',
            category: 'api-testing',
            order: 42
          },
          {
            id: 'graphql-security',
            title: 'GraphQL Vulnerability Hunting',
            description: 'Introspection queries, query depth attacks, batching attacks, field suggestions',
            xp: 3500,
            phase: 'pentesting',
            category: 'api-testing',
            order: 43
          },
          {
            id: 'api-authentication',
            title: 'API Authentication Flaws',
            description: 'API key security, bearer token issues, HMAC implementation flaws, replay attacks',
            xp: 3200,
            phase: 'pentesting',
            category: 'api-testing',
            order: 44
          },
          {
            id: 'api-fuzzing',
            title: 'API Fuzzing Techniques',
            description: 'Parameter fuzzing, boundary testing, format string bugs, integer overflows',
            xp: 2800,
            phase: 'pentesting',
            category: 'api-testing',
            order: 45
          },
          {
            id: 'postman-automation',
            title: 'API Testing Automation',
            description: 'Postman/Newman automation, collection fuzzing, CI/CD integration for API testing',
            xp: 2500,
            phase: 'pentesting',
            category: 'api-testing',
            order: 46
          }
        ]
      },
      {
        id: 'mobile-app-testing',
        title: 'Mobile Application Security',
        tasks: [
          {
            id: 'android-basics',
            title: 'Android App Security Basics',
            description: 'APK analysis, ADB usage, certificate pinning bypass, basic Frida scripts',
            xp: 3500,
            phase: 'pentesting',
            category: 'mobile-app-testing',
            order: 47
          },
          {
            id: 'ios-basics',
            title: 'iOS App Security Introduction',
            description: 'IPA extraction, jailbreak basics, Objection usage, plist file analysis',
            xp: 3500,
            phase: 'pentesting',
            category: 'mobile-app-testing',
            order: 48
          },
          {
            id: 'mobile-proxy-setup',
            title: 'Mobile Traffic Interception',
            description: 'Proxy configuration, SSL pinning bypass techniques, certificate installation',
            xp: 2500,
            phase: 'pentesting',
            category: 'mobile-app-testing',
            order: 49
          },
          {
            id: 'mobile-static-analysis',
            title: 'Mobile App Static Analysis',
            description: 'MobSF usage, hardcoded secrets, insecure storage, code obfuscation analysis',
            xp: 3000,
            phase: 'pentesting',
            category: 'mobile-app-testing',
            order: 50
          },
          {
            id: 'mobile-api-testing',
            title: 'Mobile API Endpoint Testing',
            description: 'Hidden endpoints discovery, mobile-specific headers, token handling, session management',
            xp: 2800,
            phase: 'pentesting',
            category: 'mobile-app-testing',
            order: 51
          }
        ]
      },
      {
        id: 'automation-scaling',
        title: 'Automation & Scaling',
        tasks: [
          {
            id: 'bash-automation',
            title: 'Bash Scripting for Bug Bounty',
            description: 'Automated recon scripts, subdomain monitoring, nuclei automation, notification systems',
            xp: 3000,
            phase: 'pentesting',
            category: 'automation-scaling',
            order: 52
          },
          {
            id: 'python-tools',
            title: 'Python Tool Development',
            description: 'Custom scanners, API wrappers, fuzzing scripts, report automation tools',
            xp: 3500,
            phase: 'pentesting',
            category: 'automation-scaling',
            order: 53
          },
          {
            id: 'continuous-monitoring',
            title: 'Continuous Asset Monitoring',
            description: 'Change detection, new subdomain alerts, GitHub monitoring, certificate transparency monitoring',
            xp: 3200,
            phase: 'pentesting',
            category: 'automation-scaling',
            order: 54
          },
          {
            id: 'nuclei-templates',
            title: 'Custom Nuclei Template Creation',
            description: 'YAML syntax, matcher types, custom detection logic, template optimization',
            xp: 2800,
            phase: 'pentesting',
            category: 'automation-scaling',
            order: 55
          },
          {
            id: 'cloud-automation',
            title: 'Cloud-Based Recon Setup',
            description: 'VPS setup, distributed scanning, axiom framework, cloud storage for results',
            xp: 3000,
            phase: 'pentesting',
            category: 'automation-scaling',
            order: 56
          }
        ]
      },
      {
        id: 'collaboration-growth',
        title: 'Collaboration & Growth',
        tasks: [
          {
            id: 'collaboration-hunting',
            title: 'Collaborative Bug Hunting',
            description: 'Team up with other hunters, share findings responsibly, learn from peers',
            xp: 2500,
            phase: 'pentesting',
            category: 'collaboration-growth',
            order: 57
          },
          {
            id: 'community-engagement',
            title: 'Bug Bounty Community Participation',
            description: 'Discord/Slack communities, Twitter engagement, conference participation, mentoring',
            xp: 2000,
            phase: 'pentesting',
            category: 'collaboration-growth',
            order: 58
          },
          {
            id: 'live-hacking-events',
            title: 'Live Hacking Event Participation',
            description: 'Apply and participate in live hacking events, network with researchers',
            xp: 4000,
            phase: 'pentesting',
            category: 'collaboration-growth',
            order: 59
          },
          {
            id: 'bug-bounty-tips',
            title: 'Earn First $10,000 in Bounties',
            description: 'Consistent hunting, program selection, time management, duplicate avoidance',
            xp: 8000,
            phase: 'pentesting',
            category: 'collaboration-growth',
            order: 60
          },
          {
            id: 'specialization-choice',
            title: 'Choose Your Specialization',
            description: 'Identify your strengths: web, mobile, API, cloud, or specific vulnerability classes',
            xp: 3000,
            phase: 'pentesting',
            category: 'collaboration-growth',
            order: 61
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Expert Bug Hunter',
    description: 'Complex Chains, Cloud Security, Advanced Techniques, and High-Impact Bugs',
    duration: 'Months 13-24',
    categories: [
      {
        id: 'vulnerability-chains',
        title: 'Vulnerability Chaining',
        tasks: [
          {
            id: 'chaining-basics',
            title: 'Introduction to Bug Chaining',
            description: 'Combining low-impact bugs, escalation techniques, multi-step exploitation',
            xp: 5000,
            phase: 'advanced',
            category: 'vulnerability-chains',
            order: 62
          },
          {
            id: 'account-takeover-chains',
            title: 'Account Takeover Chain Development',
            description: 'IDOR + XSS, OAuth + open redirect, password reset + race condition combinations',
            xp: 6000,
            phase: 'advanced',
            category: 'vulnerability-chains',
            order: 63
          },
          {
            id: 'rce-chains',
            title: 'Remote Code Execution Chains',
            description: 'File upload + LFI, SSRF + internal services, deserialization + gadget hunting',
            xp: 7000,
            phase: 'advanced',
            category: 'vulnerability-chains',
            order: 64
          },
          {
            id: 'data-exfiltration',
            title: 'Data Exfiltration Techniques',
            description: 'Blind exploitation, out-of-band techniques, timing attacks, DNS exfiltration',
            xp: 5500,
            phase: 'advanced',
            category: 'vulnerability-chains',
            order: 65
          },
          {
            id: 'privilege-escalation-web',
            title: 'Web-Based Privilege Escalation',
            description: 'User to admin escalation, role manipulation, JWT privilege escalation',
            xp: 5800,
            phase: 'advanced',
            category: 'vulnerability-chains',
            order: 66
          }
        ]
      },
      {
        id: 'cloud-security-testing',
        title: 'Cloud Platform Security',
        tasks: [
          {
            id: 'aws-security',
            title: 'AWS Security Testing',
            description: 'S3 bucket misconfigurations, IAM vulnerabilities, Lambda functions, EC2 metadata',
            xp: 6500,
            phase: 'advanced',
            category: 'cloud-security-testing',
            order: 67
          },
          {
            id: 'azure-testing',
            title: 'Azure Security Assessment',
            description: 'Storage account issues, Azure AD misconfigs, Function Apps, Key Vault access',
            xp: 6500,
            phase: 'advanced',
            category: 'cloud-security-testing',
            order: 68
          },
          {
            id: 'gcp-security',
            title: 'Google Cloud Platform Testing',
            description: 'GCS bucket issues, IAM misconfigurations, Cloud Functions, metadata endpoints',
            xp: 6500,
            phase: 'advanced',
            category: 'cloud-security-testing',
            order: 69
          },
          {
            id: 'container-security',
            title: 'Container & Kubernetes Security',
            description: 'Docker API exposure, Kubernetes dashboard, container escape, secrets management',
            xp: 7000,
            phase: 'advanced',
            category: 'cloud-security-testing',
            order: 70
          },
          {
            id: 'serverless-testing',
            title: 'Serverless Application Testing',
            description: 'Function injection, event manipulation, cold start attacks, serverless SSRF',
            xp: 5500,
            phase: 'advanced',
            category: 'cloud-security-testing',
            order: 71
          }
        ]
      },
      {
        id: 'advanced-techniques',
        title: 'Advanced Exploitation Techniques',
        tasks: [
          {
            id: 'browser-exploitation',
            title: 'Client-Side Advanced Attacks',
            description: 'Prototype pollution to XSS, DOM clobbering, mutation XSS, script gadgets',
            xp: 6000,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 72
          },
          {
            id: 'cryptographic-flaws',
            title: 'Cryptographic Vulnerabilities',
            description: 'Padding oracle attacks, ECB mode issues, weak random generation, timing attacks',
            xp: 6500,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 73
          },
          {
            id: 'websocket-testing',
            title: 'WebSocket Security Testing',
            description: 'Origin validation, message tampering, authentication bypass, XSS via WebSocket',
            xp: 5000,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 74
          },
          {
            id: 'http2-3-security',
            title: 'HTTP/2 and HTTP/3 Security',
            description: 'Request smuggling variants, multiplexing issues, HPACK bombing, 0-RTT attacks',
            xp: 5500,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 75
          },
          {
            id: 'supply-chain-attacks',
            title: 'Supply Chain Security',
            description: 'Dependency confusion, typosquatting, malicious packages, CI/CD poisoning',
            xp: 6000,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 76
          }
        ]
      },
      {
        id: 'specialized-targets',
        title: 'Specialized Target Types',
        tasks: [
          {
            id: 'iot-devices',
            title: 'IoT Device Security Testing',
            description: 'Firmware analysis, MQTT testing, CoAP vulnerabilities, embedded web interfaces',
            xp: 5500,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 77
          },
          {
            id: 'blockchain-apps',
            title: 'Blockchain & Web3 Applications',
            description: 'Smart contract interaction bugs, wallet integration, signature verification flaws',
            xp: 6000,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 78
          },
          {
            id: 'payment-systems',
            title: 'Payment System Vulnerabilities',
            description: 'Price manipulation, currency confusion, payment bypass, checkout flaws',
            xp: 7000,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 79
          },
          {
            id: 'saas-platforms',
            title: 'SaaS Multi-Tenancy Issues',
            description: 'Tenant isolation, data leakage, subdomain takeover, SSO vulnerabilities',
            xp: 5800,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 80
          },
          {
            id: 'enterprise-software',
            title: 'Enterprise Software Testing',
            description: 'Complex authentication flows, integration points, legacy system interfaces',
            xp: 6200,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 81
          }
        ]
      },
      {
        id: 'research-development',
        title: 'Research & Tool Development',
        tasks: [
          {
            id: 'vulnerability-research',
            title: 'Original Vulnerability Research',
            description: 'Discovering new bug classes, CVE submissions, responsible disclosure',
            xp: 8000,
            phase: 'advanced',
            category: 'research-development',
            order: 82
          },
          {
            id: 'tool-creation',
            title: 'Public Tool Development',
            description: 'Create and release bug hunting tools, contribute to existing projects',
            xp: 7000,
            phase: 'advanced',
            category: 'research-development',
            order: 83
          },
          {
            id: 'exploit-development',
            title: 'Exploit Development Skills',
            description: 'Reliable exploit creation, bypass techniques, weaponization for bug bounty',
            xp: 7500,
            phase: 'advanced',
            category: 'exploit-development',
            order: 84
          },
          {
            id: 'machine-learning-security',
            title: 'ML/AI Security Testing',
            description: 'Model manipulation, adversarial inputs, training data poisoning, prompt injection',
            xp: 6500,
            phase: 'advanced',
            category: 'research-development',
            order: 85
          },
          {
            id: 'bug-bounty-automation-platform',
            title: 'Build Automation Platform',
            description: 'Complete recon automation, vulnerability scanning, report generation system',
            xp: 8000,
            phase: 'advanced',
            category: 'research-development',
            order: 86
          }
        ]
      },
      {
        id: 'business-impact',
        title: 'Business Impact & Recognition',
        tasks: [
          {
            id: 'critical-submissions',
            title: 'Submit 10+ Critical Vulnerabilities',
            description: 'Find and report critical business impact bugs across multiple programs',
            xp: 10000,
            phase: 'advanced',
            category: 'business-impact',
            order: 87
          },
          {
            id: 'hall-of-fame',
            title: 'Multiple Hall of Fame Entries',
            description: 'Get recognized by at least 20 different companies for security contributions',
            xp: 8000,
            phase: 'advanced',
            category: 'business-impact',
            order: 88
          },
          {
            id: 'six-figure-earnings',
            title: 'Earn $100,000+ in Bug Bounties',
            description: 'Reach six-figure earnings through consistent high-quality submissions',
            xp: 15000,
            phase: 'advanced',
            category: 'business-impact',
            order: 89
          },
          {
            id: 'program-collaboration',
            title: 'Private Program Invitations',
            description: 'Get invited to 10+ private programs based on reputation and quality',
            xp: 7000,
            phase: 'advanced',
            category: 'business-impact',
            order: 90
          },
          {
            id: 'speaking-engagement',
            title: 'Conference Speaking',
            description: 'Present bug hunting research at security conferences, share knowledge',
            xp: 9000,
            phase: 'advanced',
            category: 'business-impact',
            order: 91
          }
        ]
      }
    ]
  },
  {
    id: 'redteam',
    title: 'Elite Researcher',
    description: 'Zero-Days, Advanced Research, Industry Leadership, and Mentorship',
    duration: 'Year 3+',
    categories: [
      {
        id: 'zero-day-research',
        title: 'Zero-Day Discovery',
        tasks: [
          {
            id: 'cve-research',
            title: 'CVE Discovery & Submission',
            description: 'Find vulnerabilities in popular software, coordinate disclosure, CVE assignment',
            xp: 15000,
            phase: 'redteam',
            category: 'zero-day-research',
            order: 92
          },
          {
            id: 'browser-zero-days',
            title: 'Browser Security Research',
            description: 'Chrome, Firefox, Safari vulnerability research, sandbox escapes, renderer bugs',
            xp: 25000,
            phase: 'redteam',
            category: 'zero-day-research',
            order: 93
          },
          {
            id: 'framework-vulnerabilities',
            title: 'Popular Framework Vulnerabilities',
            description: 'Django, Rails, Spring, Express.js core vulnerabilities, widespread impact',
            xp: 20000,
            phase: 'redteam',
            category: 'zero-day-research',
            order: 94
          },
          {
            id: 'protocol-flaws',
            title: 'Protocol-Level Vulnerabilities',
            description: 'OAuth, SAML, JWT specification flaws, TLS vulnerabilities, DNS security',
            xp: 22000,
            phase: 'redteam',
            category: 'zero-day-research',
            order: 95
          },
          {
            id: 'hardware-vulnerabilities',
            title: 'Hardware Security Research',
            description: 'CPU vulnerabilities, TPM flaws, hardware wallet attacks, side-channel attacks',
            xp: 30000,
            phase: 'redteam',
            category: 'zero-day-research',
            order: 96
          }
        ]
      },
      {
        id: 'advanced-research',
        title: 'Cutting-Edge Research',
        tasks: [
          {
            id: 'new-attack-classes',
            title: 'Discover New Attack Classes',
            description: 'Pioneer new vulnerability categories, publish groundbreaking research',
            xp: 35000,
            phase: 'redteam',
            category: 'advanced-research',
            order: 97
          },
          {
            id: 'academic-publications',
            title: 'Academic Security Papers',
            description: 'Publish in peer-reviewed journals, present at academic conferences',
            xp: 20000,
            phase: 'redteam',
            category: 'advanced-research',
            order: 98
          },
          {
            id: 'security-tool-innovation',
            title: 'Revolutionary Tool Development',
            description: 'Create industry-changing security tools, thousands of users, major impact',
            xp: 25000,
            phase: 'redteam',
            category: 'advanced-research',
            order: 99
          },
          {
            id: 'novel-bug-hunting-methodology',
            title: 'Novel Bug Hunting Methodologies',
            description: 'Develop new approaches to finding bugs, share with community, proven results',
            xp: 18000,
            phase: 'redteam',
            category: 'advanced-research',
            order: 100
          },
          {
            id: 'ai-security-pioneer',
            title: 'AI/LLM Security Pioneer',
            description: 'Leading research in AI security, prompt injection, model vulnerabilities',
            xp: 28000,
            phase: 'redteam',
            category: 'advanced-research',
            order: 101
          }
        ]
      },
      {
        id: 'industry-leadership',
        title: 'Industry Leadership',
        tasks: [
          {
            id: 'keynote-speaker',
            title: 'Keynote Conference Speaker',
            description: 'Deliver keynotes at major security conferences (Black Hat, DEF CON, etc.)',
            xp: 20000,
            phase: 'redteam',
            category: 'industry-leadership',
            order: 102
          },
          {
            id: 'security-advisory',
            title: 'Security Advisory Board Member',
            description: 'Advise major companies on security strategy, shape industry practices',
            xp: 25000,
            phase: 'redteam',
            category: 'industry-leadership',
            order: 103
          },
          {
            id: 'bug-bounty-platform-advisor',
            title: 'Platform Advisory Role',
            description: 'Help shape bug bounty platforms, program policies, industry standards',
            xp: 18000,
            phase: 'redteam',
            category: 'industry-leadership',
            order: 104
          },
          {
            id: 'media-recognition',
            title: 'Media & Industry Recognition',
            description: 'Featured in major publications, documentaries, recognized as industry expert',
            xp: 15000,
            phase: 'redteam',
            category: 'industry-leadership',
            order: 105
          },
          {
            id: 'security-company-founder',
            title: 'Security Company Founder',
            description: 'Start successful security consultancy or product company',
            xp: 50000,
            phase: 'redteam',
            category: 'industry-leadership',
            order: 106
          }
        ]
      },
      {
        id: 'mentorship-education',
        title: 'Mentorship & Education',
        tasks: [
          {
            id: 'mentor-researchers',
            title: 'Mentor 50+ Security Researchers',
            description: 'Guide new researchers, help them find first bugs, career development',
            xp: 15000,
            phase: 'redteam',
            category: 'mentorship-education',
            order: 107
          },
          {
            id: 'training-creation',
            title: 'Create Comprehensive Training',
            description: 'Develop professional bug bounty courses, workshops, bootcamps',
            xp: 20000,
            phase: 'redteam',
            category: 'mentorship-education',
            order: 108
          },
          {
            id: 'youtube-education',
            title: 'Educational Content Creator',
            description: 'YouTube channel with 100k+ subscribers, regular educational content',
            xp: 18000,
            phase: 'redteam',
            category: 'mentorship-education',
            order: 109
          },
          {
            id: 'book-author',
            title: 'Security Book Author',
            description: 'Write comprehensive bug bounty or web security book, published',
            xp: 25000,
            phase: 'redteam',
            category: 'mentorship-education',
            order: 110
          },
          {
            id: 'university-collaboration',
            title: 'Academic Collaboration',
            description: 'Guest lectures, curriculum development, research collaboration',
            xp: 16000,
            phase: 'redteam',
            category: 'mentorship-education',
            order: 111
          }
        ]
      },
      {
        id: 'specialized-expertise',
        title: 'Ultra-Specialized Skills',
        tasks: [
          {
            id: 'kernel-exploitation',
            title: 'OS Kernel Exploitation',
            description: 'Windows/Linux/macOS kernel bugs, privilege escalation, rootkit development',
            xp: 30000,
            phase: 'redteam',
            category: 'specialized-expertise',
            order: 112
          },
          {
            id: 'virtualization-escapes',
            title: 'Virtualization Security',
            description: 'VMware, Hyper-V, QEMU escapes, cloud provider isolation breaks',
            xp: 35000,
            phase: 'redteam',
            category: 'specialized-expertise',
            order: 113
          },
          {
            id: 'mobile-baseband',
            title: 'Mobile Baseband Security',
            description: 'Cellular modem vulnerabilities, baseband exploitation, radio protocols',
            xp: 40000,
            phase: 'redteam',
            category: 'specialized-expertise',
            order: 114
          },
          {
            id: 'automotive-security',
            title: 'Automotive Security Research',
            description: 'Connected car vulnerabilities, CAN bus attacks, infotainment systems',
            xp: 28000,
            phase: 'redteam',
            category: 'specialized-expertise',
            order: 115
          },
          {
            id: 'satellite-security',
            title: 'Satellite & Space Security',
            description: 'Satellite communication security, ground station attacks, GPS security',
            xp: 45000,
            phase: 'redteam',
            category: 'specialized-expertise',
            order: 116
          }
        ]
      },
      {
        id: 'financial-success',
        title: 'Financial Milestones',
        tasks: [
          {
            id: 'million-dollar-researcher',
            title: 'Earn $1,000,000+ in Bug Bounties',
            description: 'Reach seven-figure earnings through bug bounty programs',
            xp: 100000,
            phase: 'redteam',
            category: 'financial-success',
            order: 117
          },
          {
            id: 'single-bug-100k',
            title: 'Single Bug Worth $100,000+',
            description: 'Find a vulnerability with six-figure payout, exceptional impact',
            xp: 50000,
            phase: 'redteam',
            category: 'financial-success',
            order: 118
          },
          {
            id: 'passive-income',
            title: 'Security Passive Income',
            description: 'Generate $10k+/month from courses, tools, consulting, content',
            xp: 35000,
            phase: 'redteam',
            category: 'financial-success',
            order: 119
          },
          {
            id: 'bug-bounty-team',
            title: 'Build Bug Bounty Team',
            description: 'Lead team of researchers, scale operations, shared success',
            xp: 40000,
            phase: 'redteam',
            category: 'financial-success',
            order: 120
          }
        ]
      }
    ]
  },
  {
    id: 'elite',
    title: 'Legendary Status',
    description: 'Industry Pioneer, Global Recognition, and Lasting Legacy',
    duration: 'Lifetime Achievement',
    categories: [
      {
        id: 'global-impact',
        title: 'Global Security Impact',
        tasks: [
          {
            id: 'internet-scale-discovery',
            title: 'Internet-Scale Vulnerability',
            description: 'Discover vulnerability affecting millions of users globally',
            xp: 100000,
            phase: 'elite',
            category: 'global-impact',
            order: 121
          },
          {
            id: 'security-standard',
            title: 'Create Security Standard',
            description: 'Develop widely-adopted security standard or protocol',
            xp: 80000,
            phase: 'elite',
            category: 'global-impact',
            order: 122
          },
          {
            id: 'government-advisor',
            title: 'Government Security Advisor',
            description: 'Advise national governments on cybersecurity policy',
            xp: 70000,
            phase: 'elite',
            category: 'global-impact',
            order: 123
          },
          {
            id: 'bug-bounty-revolution',
            title: 'Revolutionize Bug Bounty Industry',
            description: 'Create paradigm shift in how bug bounties operate',
            xp: 90000,
            phase: 'elite',
            category: 'global-impact',
            order: 124
          }
        ]
      },
      {
        id: 'lifetime-achievements',
        title: 'Lifetime Achievements',
        tasks: [
          {
            id: 'pwnie-award',
            title: 'Pwnie Award Winner',
            description: 'Win prestigious Pwnie Award for security research',
            xp: 75000,
            phase: 'elite',
            category: 'lifetime-achievements',
            order: 125
          },
          {
            id: 'bug-bounty-hall-fame',
            title: 'Bug Bounty Hall of Fame',
            description: 'Recognized as top 10 bug bounty hunter globally',
            xp: 100000,
            phase: 'elite',
            category: 'lifetime-achievements',
            order: 126
          },
          {
            id: 'forbes-recognition',
            title: 'Forbes 30 Under 30',
            description: 'Featured in Forbes or similar for security achievements',
            xp: 60000,
            phase: 'elite',
            category: 'lifetime-achievements',
            order: 127
          },
          {
            id: 'documentary-feature',
            title: 'Documentary Subject',
            description: 'Featured in major cybersecurity documentary',
            xp: 50000,
            phase: 'elite',
            category: 'lifetime-achievements',
            order: 128
          }
        ]
      },
      {
        id: 'legacy-building',
        title: 'Building Your Legacy',
        tasks: [
          {
            id: 'security-foundation',
            title: 'Security Foundation/Nonprofit',
            description: 'Establish foundation for security education/research',
            xp: 120000,
            phase: 'elite',
            category: 'legacy-building',
            order: 129
          },
          {
            id: 'mentorship-program',
            title: 'Global Mentorship Program',
            description: 'Create program helping 1000+ new researchers',
            xp: 80000,
            phase: 'elite',
            category: 'legacy-building',
            order: 130
          },
          {
            id: 'bug-bounty-platform',
            title: 'Launch Bug Bounty Platform',
            description: 'Create successful bug bounty platform/company',
            xp: 150000,
            phase: 'elite',
            category: 'legacy-building',
            order: 131
          },
          {
            id: 'lifetime-impact',
            title: 'Lifetime Security Impact',
            description: 'Directly improve security for 1 billion+ users',
            xp: 200000,
            phase: 'elite',
            category: 'legacy-building',
            order: 132
          }
        ]
      },
      {
        id: 'ultimate-mastery',
        title: 'Ultimate Mastery',
        tasks: [
          {
            id: 'polyglot-researcher',
            title: 'Master of All Domains',
            description: 'Expert in web, mobile, cloud, IoT, blockchain, and AI security',
            xp: 150000,
            phase: 'elite',
            category: 'ultimate-mastery',
            order: 133
          },
          {
            id: 'bug-bounty-billionaire',
            title: 'Bug Bounty Unicorn',
            description: 'Build billion-dollar security company from bug bounty roots',
            xp: 500000,
            phase: 'elite',
            category: 'ultimate-mastery',
            order: 134
          },
          {
            id: 'security-nobel',
            title: 'Turing Award Consideration',
            description: 'Considered for Turing Award or similar for security contributions',
            xp: 1000000,
            phase: 'elite',
            category: 'ultimate-mastery',
            order: 135
          }
        ]
      }
    ]
  }
];