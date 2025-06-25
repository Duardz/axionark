export interface Task {
  id: string;
  title: string;
  description: string;
  xp: number;
  phase: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  order: number;
}

export interface Phase {
  id: 'beginner' | 'intermediate' | 'advanced';
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
    id: 'beginner',
    title: 'Web Hacking Foundation',
    description: 'Master Fundamentals, HTTP, Web Technologies, and Core Vulnerabilities',
    duration: 'Months 1-6',
    categories: [
      {
        id: 'core-fundamentals',
        title: 'Core IT Fundamentals',
        tasks: [
          {
            id: 'networking-basics',
            title: 'Networking Fundamentals',
            description: 'TCP/IP, OSI model, DNS, ports/protocols, subnetting, packet analysis with Wireshark',
            xp: 150,
            phase: 'beginner',
            category: 'core-fundamentals',
            order: 1
          },
          {
            id: 'linux-mastery',
            title: 'Linux Command Line Mastery',
            description: 'File system, permissions, processes, services, bash scripting, grep/sed/awk',
            xp: 200,
            phase: 'beginner',
            category: 'core-fundamentals',
            order: 2
          },
          {
            id: 'windows-basics',
            title: 'Windows Fundamentals',
            description: 'PowerShell basics, services, registry, file system, user management',
            xp: 100,
            phase: 'beginner',
            category: 'core-fundamentals',
            order: 3
          },
          {
            id: 'virtualization',
            title: 'Virtualization & Lab Setup',
            description: 'VMware/VirtualBox, create hacking lab, snapshot management, networking between VMs',
            xp: 80,
            phase: 'beginner',
            category: 'core-fundamentals',
            order: 4
          }
        ]
      },
      {
        id: 'http-mastery',
        title: 'HTTP & Web Foundations',
        tasks: [
          {
            id: 'http-deep-dive',
            title: 'HTTP Protocol Mastery',
            description: 'Master HTTP methods, headers, status codes, request smuggling, HTTP/2 differences',
            xp: 100,
            phase: 'beginner',
            category: 'http-mastery',
            order: 5
          },
          {
            id: 'web-tech-stack',
            title: 'Web Technology Stack',
            description: 'Understand frontend (JS, DOM, AJAX), backend (PHP, Python, Node.js), and databases',
            xp: 150,
            phase: 'beginner',
            category: 'http-mastery',
            order: 6
          },
          {
            id: 'burp-mastery',
            title: 'Burp Suite Complete Mastery',
            description: 'Master proxy, repeater, intruder, decoder, comparer, and extensions',
            xp: 100,
            phase: 'beginner',
            category: 'http-mastery',
            order: 7
          },
          {
            id: 'browser-devtools',
            title: 'Browser Developer Tools',
            description: 'Master Chrome/Firefox DevTools, network tab, console, debugger, storage inspection',
            xp: 80,
            phase: 'beginner',
            category: 'http-mastery',
            order: 8
          }
        ]
      },
      {
        id: 'programming-foundations',
        title: 'Essential Programming',
        tasks: [
          {
            id: 'python-web',
            title: 'Python for Web Hacking',
            description: 'Master requests library, BeautifulSoup, urllib, regex, and asyncio for web automation',
            xp: 200,
            phase: 'beginner',
            category: 'programming-foundations',
            order: 9
          },
          {
            id: 'javascript-security',
            title: 'JavaScript Security',
            description: 'Understand JS execution, DOM manipulation, prototype pollution, and XSS crafting',
            xp: 150,
            phase: 'beginner',
            category: 'programming-foundations',
            order: 10
          },
          {
            id: 'sql-basics',
            title: 'SQL All Dialects',
            description: 'Learn MySQL, PostgreSQL, MSSQL, Oracle differences for injection attacks',
            xp: 100,
            phase: 'beginner',
            category: 'programming-foundations',
            order: 11
          },
          {
            id: 'bash-automation',
            title: 'Bash One-Liners',
            description: 'Create recon scripts, automation tools, and quick exploitation commands',
            xp: 80,
            phase: 'beginner',
            category: 'programming-foundations',
            order: 12
          }
        ]
      },
      {
        id: 'injection-attacks',
        title: 'Injection Attack Mastery',
        tasks: [
          {
            id: 'sqli-mastery',
            title: 'SQL Injection Expert',
            description: 'Union, blind, time-based, second-order, out-of-band SQLi with WAF bypass',
            xp: 300,
            phase: 'beginner',
            category: 'injection-attacks',
            order: 13
          },
          {
            id: 'command-injection',
            title: 'OS Command Injection',
            description: 'Find and exploit command injection in all contexts, bypass filters',
            xp: 200,
            phase: 'beginner',
            category: 'injection-attacks',
            order: 14
          },
          {
            id: 'nosql-injection',
            title: 'NoSQL Injection',
            description: 'MongoDB, CouchDB, Redis injection techniques and data extraction',
            xp: 150,
            phase: 'beginner',
            category: 'injection-attacks',
            order: 15
          },
          {
            id: 'ldap-xpath',
            title: 'LDAP & XPath Injection',
            description: 'Exploit directory services and XML path language injections',
            xp: 100,
            phase: 'beginner',
            category: 'injection-attacks',
            order: 16
          }
        ]
      },
      {
        id: 'xss-csrf',
        title: 'Client-Side Attacks',
        tasks: [
          {
            id: 'xss-contexts',
            title: 'XSS All Contexts',
            description: 'HTML, attribute, JavaScript, DOM-based XSS with filter bypasses',
            xp: 250,
            phase: 'beginner',
            category: 'xss-csrf',
            order: 13
          },
          {
            id: 'csrf-mastery',
            title: 'CSRF Advanced',
            description: 'CSRF with JSON, multipart, SameSite bypass, and token prediction',
            xp: 150,
            phase: 'beginner',
            category: 'xss-csrf',
            order: 14
          },
          {
            id: 'cors-misconfig',
            title: 'CORS Exploitation',
            description: 'Find and exploit CORS misconfigurations for data theft',
            xp: 100,
            phase: 'beginner',
            category: 'xss-csrf',
            order: 15
          },
          {
            id: 'clickjacking',
            title: 'Clickjacking & UI Redress',
            description: 'Create PoCs for clickjacking vulnerabilities',
            xp: 80,
            phase: 'beginner',
            category: 'xss-csrf',
            order: 16
          }
        ]
      },
      {
        id: 'practice-labs',
        title: 'Hands-On Practice',
        tasks: [
          {
            id: 'portswigger-all',
            title: 'PortSwigger Academy Complete',
            description: 'Finish ALL free labs, understand every vulnerability deeply',
            xp: 500,
            phase: 'beginner',
            category: 'practice-labs',
            order: 17
          },
          {
            id: 'pentesterlab-essential',
            title: 'PentesterLab Essential Badge',
            description: 'Complete essential exercises and understand exploitation basics',
            xp: 300,
            phase: 'beginner',
            category: 'practice-labs',
            order: 18
          },
          {
            id: 'dvwa-juice',
            title: 'DVWA & Juice Shop',
            description: 'Complete all challenges in both platforms locally',
            xp: 200,
            phase: 'beginner',
            category: 'practice-labs',
            order: 19
          },
          {
            id: 'first-ctf',
            title: 'First CTF Web Challenges',
            description: 'Solve 20 web challenges from various CTF platforms',
            xp: 150,
            phase: 'beginner',
            category: 'practice-labs',
            order: 20
          }
        ]
      }
    ]
  },
  {
    id: 'intermediate',
    title: 'Modern Web & Advanced Techniques',
    description: 'APIs, Modern Frameworks, Server-Side Attacks, and Automation',
    duration: 'Months 7-12',
    categories: [
      {
        id: 'auth-session',
        title: 'Authentication & Sessions',
        tasks: [
          {
            id: 'jwt-attacks',
            title: 'JWT Complete Attacks',
            description: 'None algorithm, weak secrets, key confusion, kid injection, jku/x5u spoofing',
            xp: 300,
            phase: 'intermediate',
            category: 'auth-session',
            order: 21
          },
          {
            id: 'oauth-exploitation',
            title: 'OAuth 2.0 & OpenID',
            description: 'Authorization flaws, redirect attacks, CSRF, token leakage, state attacks',
            xp: 250,
            phase: 'intermediate',
            category: 'auth-session',
            order: 22
          },
          {
            id: 'saml-attacks',
            title: 'SAML Exploitation',
            description: 'XML signature wrapping, assertion replay, recipient confusion',
            xp: 200,
            phase: 'intermediate',
            category: 'auth-session',
            order: 23
          },
          {
            id: 'session-advanced',
            title: 'Advanced Session Attacks',
            description: 'Session puzzling, fixation, donation, race conditions in sessions',
            xp: 150,
            phase: 'intermediate',
            category: 'auth-session',
            order: 24
          }
        ]
      },
      {
        id: 'api-security',
        title: 'API Security Testing',
        tasks: [
          {
            id: 'rest-api',
            title: 'REST API Complete Testing',
            description: 'Mass assignment, IDOR, method tampering, versioning attacks',
            xp: 250,
            phase: 'intermediate',
            category: 'api-security',
            order: 25
          },
          {
            id: 'graphql-expert',
            title: 'GraphQL Exploitation',
            description: 'Introspection, query depth attacks, batching, field suggestions abuse',
            xp: 300,
            phase: 'intermediate',
            category: 'api-security',
            order: 26
          },
          {
            id: 'websocket-security',
            title: 'WebSocket Attacks',
            description: 'CSWSH, message tampering, auth bypass, injection in WebSockets',
            xp: 200,
            phase: 'intermediate',
            category: 'api-security',
            order: 27
          },
          {
            id: 'api-fuzzing',
            title: 'API Fuzzing & Automation',
            description: 'Build custom API fuzzers, automate testing, discover hidden endpoints',
            xp: 250,
            phase: 'intermediate',
            category: 'api-security',
            order: 28
          }
        ]
      },
      {
        id: 'server-side',
        title: 'Server-Side Attacks',
        tasks: [
          {
            id: 'ssrf-advanced',
            title: 'SSRF Complete Mastery',
            description: 'Cloud metadata, blind SSRF, protocol smuggling, DNS rebinding',
            xp: 400,
            phase: 'intermediate',
            category: 'server-side',
            order: 29
          },
          {
            id: 'xxe-mastery',
            title: 'XXE All Contexts',
            description: 'File disclosure, SSRF via XXE, blind XXE, XXE in formats (XLSX, SVG)',
            xp: 300,
            phase: 'intermediate',
            category: 'server-side',
            order: 30
          },
          {
            id: 'ssti-rce',
            title: 'Template Injection to RCE',
            description: 'Jinja2, Twig, Freemarker, Velocity exploitation for code execution',
            xp: 350,
            phase: 'intermediate',
            category: 'server-side',
            order: 31
          },
          {
            id: 'file-upload',
            title: 'File Upload to RCE',
            description: 'Bypass filters, polyglot files, race conditions, zip slip attacks',
            xp: 300,
            phase: 'intermediate',
            category: 'server-side',
            order: 32
          }
        ]
      },
      {
        id: 'tool-development',
        title: 'Custom Tool Building',
        tasks: [
          {
            id: 'scanner-dev',
            title: 'Build Web Scanner',
            description: 'Create modular scanner better than existing tools for specific cases',
            xp: 500,
            phase: 'intermediate',
            category: 'tool-development',
            order: 33
          },
          {
            id: 'fuzzer-go',
            title: 'High-Performance Fuzzer',
            description: 'Build fuzzer in Go with smart wordlist generation and response analysis',
            xp: 400,
            phase: 'intermediate',
            category: 'tool-development',
            order: 34
          },
          {
            id: 'payload-generator',
            title: 'Payload Generation Framework',
            description: 'Context-aware XSS/SQLi payload generator with encoding and evasion',
            xp: 350,
            phase: 'intermediate',
            category: 'tool-development',
            order: 35
          },
          {
            id: 'recon-automation',
            title: 'Recon Automation Suite',
            description: 'Subdomain enum, port scan, content discovery, vulnerability correlation',
            xp: 300,
            phase: 'intermediate',
            category: 'tool-development',
            order: 36
          }
        ]
      },
      {
        id: 'real-hunting',
        title: 'Bug Bounty Success',
        tasks: [
          {
            id: 'methodology',
            title: 'Develop Personal Methodology',
            description: 'Create and refine your unique approach to finding bugs',
            xp: 200,
            phase: 'intermediate',
            category: 'real-hunting',
            order: 37
          },
          {
            id: 'automation-workflow',
            title: 'Automated Hunting Workflow',
            description: 'Build complete automation from recon to reporting',
            xp: 300,
            phase: 'intermediate',
            category: 'real-hunting',
            order: 38
          },
          {
            id: 'high-impact',
            title: 'Find High/Critical Bugs',
            description: 'Discover and report 5 high or critical severity vulnerabilities',
            xp: 500,
            phase: 'intermediate',
            category: 'real-hunting',
            order: 39
          },
          {
            id: 'bug-chains',
            title: 'Vulnerability Chains',
            description: 'Chain multiple bugs for maximum impact demonstrations',
            xp: 400,
            phase: 'intermediate',
            category: 'real-hunting',
            order: 40
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Elite Web Hacker',
    description: 'Research, Advanced Exploitation, and Industry Leadership',
    duration: 'Year 2+',
    categories: [
      {
        id: 'advanced-exploitation',
        title: 'Elite Exploitation',
        tasks: [
          {
            id: 'deserialization',
            title: 'Deserialization Mastery',
            description: 'Java, PHP, Python, .NET deserialization with gadget chain construction',
            xp: 800,
            phase: 'advanced',
            category: 'advanced-exploitation',
            order: 41
          },
          {
            id: 'race-conditions',
            title: 'Race Condition Exploitation',
            description: 'Time-of-check time-of-use, payment races, async vulnerabilities',
            xp: 700,
            phase: 'advanced',
            category: 'advanced-exploitation',
            order: 42
          },
          {
            id: 'cache-attacks',
            title: 'Cache Poisoning & Deception',
            description: 'Web cache poisoning, deception, key injection, DoS via cache',
            xp: 600,
            phase: 'advanced',
            category: 'cache-attacks',
            order: 43
          },
          {
            id: 'proto-pollution',
            title: 'Prototype Pollution to RCE',
            description: 'Client and server-side prototype pollution leading to code execution',
            xp: 900,
            phase: 'advanced',
            category: 'advanced-exploitation',
            order: 44
          }
        ]
      },
      {
        id: 'cloud-container',
        title: 'Cloud & Container Security',
        tasks: [
          {
            id: 'cloud-ssrf',
            title: 'Cloud Metadata Exploitation',
            description: 'AWS, Azure, GCP metadata endpoints, IAM privilege escalation',
            xp: 800,
            phase: 'advanced',
            category: 'cloud-container',
            order: 45
          },
          {
            id: 'k8s-attacks',
            title: 'Kubernetes Exploitation',
            description: 'API abuse, RBAC bypass, container escape, service mesh attacks',
            xp: 900,
            phase: 'advanced',
            category: 'cloud-container',
            order: 46
          },
          {
            id: 'serverless',
            title: 'Serverless Security',
            description: 'Lambda/Functions injection, event injection, cold start attacks',
            xp: 700,
            phase: 'advanced',
            category: 'cloud-container',
            order: 47
          },
          {
            id: 'cicd-compromise',
            title: 'CI/CD Pipeline Attacks',
            description: 'Pipeline poisoning, secret extraction, supply chain compromise',
            xp: 1000,
            phase: 'advanced',
            category: 'cloud-container',
            order: 48
          }
        ]
      },
      {
        id: 'research-development',
        title: 'Security Research',
        tasks: [
          {
            id: 'new-techniques',
            title: 'Develop New Techniques',
            description: 'Create novel attack methods, discover new vulnerability classes',
            xp: 1500,
            phase: 'advanced',
            category: 'research-development',
            order: 49
          },
          {
            id: 'framework-vulns',
            title: 'Framework 0-days',
            description: 'Find vulnerabilities in popular frameworks (React, Angular, Django)',
            xp: 2000,
            phase: 'advanced',
            category: 'research-development',
            order: 50
          },
          {
            id: 'tool-release',
            title: 'Release Popular Tools',
            description: 'Create and maintain tools used by the security community',
            xp: 1200,
            phase: 'advanced',
            category: 'research-development',
            order: 51
          },
          {
            id: 'cve-research',
            title: 'CVE Discoveries',
            description: 'Discover and responsibly disclose 10+ CVEs',
            xp: 1800,
            phase: 'advanced',
            category: 'research-development',
            order: 52
          }
        ]
      },
      {
        id: 'community-leadership',
        title: 'Industry Leadership',
        tasks: [
          {
            id: 'conference-talks',
            title: 'Conference Speaker',
            description: 'Present at major security conferences (Black Hat, DEF CON)',
            xp: 1500,
            phase: 'advanced',
            category: 'community-leadership',
            order: 53
          },
          {
            id: 'training-creation',
            title: 'Create Training Content',
            description: 'Develop comprehensive training courses or materials',
            xp: 1000,
            phase: 'advanced',
            category: 'community-leadership',
            order: 54
          },
          {
            id: 'blog-influence',
            title: 'Influential Blog/Channel',
            description: 'Build following with technical writeups and tutorials',
            xp: 800,
            phase: 'advanced',
            category: 'community-leadership',
            order: 55
          },
          {
            id: 'mentor-hackers',
            title: 'Mentor Next Generation',
            description: 'Help train and guide new security researchers',
            xp: 600,
            phase: 'advanced',
            category: 'community-leadership',
            order: 56
          }
        ]
      },
      {
        id: 'elite-achievements',
        title: 'Elite Status',
        tasks: [
          {
            id: 'browser-rce',
            title: 'Browser RCE',
            description: 'Find and exploit browser vulnerability for code execution',
            xp: 5000,
            phase: 'advanced',
            category: 'elite-achievements',
            order: 57
          },
          {
            id: 'waf-bypass-framework',
            title: 'Universal WAF Bypass',
            description: 'Create techniques that bypass all major WAFs',
            xp: 3000,
            phase: 'advanced',
            category: 'elite-achievements',
            order: 58
          },
          {
            id: 'bug-bounty-millionaire',
            title: 'Bug Bounty Millionaire',
            description: 'Earn over $1,000,000 from bug bounties',
            xp: 10000,
            phase: 'advanced',
            category: 'elite-achievements',
            order: 59
          },
          {
            id: 'security-legend',
            title: 'Industry Legend',
            description: 'Become recognized as a leading expert in web security',
            xp: 10000,
            phase: 'advanced',
            category: 'elite-achievements',
            order: 60
          }
        ]
      }
    ]
  }
];