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
    title: 'Security Foundations',
    description: 'Master IT Fundamentals, Programming, Networking, and Basic Security',
    duration: 'Months 1-6',
    categories: [
      {
        id: 'system-fundamentals',
        title: 'System Fundamentals',
        tasks: [
          {
            id: 'linux-mastery',
            title: 'Linux Command Line Mastery',
            description: 'File system navigation, permissions, processes, services, package management, text processing (grep/sed/awk)',
            xp: 1000,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 1
          },
          {
            id: 'linux-administration',
            title: 'Linux System Administration',
            description: 'User management, cron jobs, systemd, logs analysis, SSH configuration, firewall basics',
            xp: 800,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 2
          },
          {
            id: 'windows-fundamentals',
            title: 'Windows Core Concepts',
            description: 'Registry, services, PowerShell basics, Active Directory intro, Windows security model',
            xp: 700,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 3
          },
          {
            id: 'virtualization-lab',
            title: 'Home Lab Setup',
            description: 'Virtualization mastery, snapshot management, isolated networks, resource optimization',
            xp: 500,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 4
          }
        ]
      },
      {
        id: 'networking-core',
        title: 'Networking Mastery',
        tasks: [
          {
            id: 'network-fundamentals',
            title: 'TCP/IP & OSI Mastery',
            description: 'Deep understanding of all layers, packet flow, routing, switching, VLANs, NAT',
            xp: 1200,
            phase: 'foundation',
            category: 'networking-core',
            order: 5
          },
          {
            id: 'protocol-analysis',
            title: 'Protocol Deep Dive',
            description: 'Master HTTP/S, DNS, DHCP, ARP, ICMP, SMB, FTP, SSH, Telnet with packet analysis tools',
            xp: 1000,
            phase: 'foundation',
            category: 'networking-core',
            order: 6
          },
          {
            id: 'network-security',
            title: 'Network Security Basics',
            description: 'Firewalls, IDS/IPS concepts, VPNs, network segmentation, security zones',
            xp: 800,
            phase: 'foundation',
            category: 'networking-core',
            order: 7
          },
          {
            id: 'wireless-basics',
            title: 'Wireless Fundamentals',
            description: '802.11 standards, WPA2/3, wireless security basics, spectrum analysis introduction',
            xp: 600,
            phase: 'foundation',
            category: 'networking-core',
            order: 8
          }
        ]
      },
      {
        id: 'programming-foundations',
        title: 'Programming for Hackers',
        tasks: [
          {
            id: 'python-mastery',
            title: 'Python Security Programming',
            description: 'Socket programming, HTTP libraries, web scraping, regex, threading, subprocess, network packet crafting',
            xp: 1500,
            phase: 'foundation',
            category: 'programming-foundations',
            order: 9
          },
          {
            id: 'bash-scripting',
            title: 'Bash Automation',
            description: 'Advanced scripting, one-liners, automation tools, log parsing, system enumeration scripts',
            xp: 1000,
            phase: 'foundation',
            category: 'programming-foundations',
            order: 10
          },
          {
            id: 'web-languages',
            title: 'Web Development Basics',
            description: 'HTML/CSS, JavaScript fundamentals, PHP basics, SQL queries, understanding web stacks',
            xp: 1200,
            phase: 'foundation',
            category: 'programming-foundations',
            order: 11
          },
          {
            id: 'c-assembly-intro',
            title: 'Low-Level Introduction',
            description: 'C programming basics, memory management, assembly reading, debugger fundamentals',
            xp: 800,
            phase: 'foundation',
            category: 'programming-foundations',
            order: 12
          },
          {
            id: 'golang-basics',
            title: 'Go Programming Basics',
            description: 'Go syntax, concurrency basics, building simple security tools, HTTP clients/servers',
            xp: 900,
            phase: 'foundation',
            category: 'programming-foundations',
            order: 13
          }
        ]
      },
      {
        id: 'security-basics',
        title: 'Security Fundamentals',
        tasks: [
          {
            id: 'security-concepts',
            title: 'Core Security Principles',
            description: 'CIA triad, authentication vs authorization, cryptography basics, hashing, encoding',
            xp: 600,
            phase: 'foundation',
            category: 'security-basics',
            order: 14
          },
          {
            id: 'recon-methodology',
            title: 'Reconnaissance & OSINT',
            description: 'Search engine dorking, social media OSINT, DNS enumeration, subdomain discovery, information gathering tools',
            xp: 1200,
            phase: 'foundation',
            category: 'security-basics',
            order: 15
          },
          {
            id: 'scanning-enumeration',
            title: 'Scanning & Enumeration',
            description: 'Port scanning mastery, service enumeration, banner grabbing, OS fingerprinting, vulnerability scanning',
            xp: 1500,
            phase: 'foundation',
            category: 'security-basics',
            order: 16
          },
          {
            id: 'exploitation-frameworks',
            title: 'Exploitation Framework Basics',
            description: 'Popular framework architecture, basic exploitation, payload usage, post-exploitation modules, pivoting basics',
            xp: 1000,
            phase: 'foundation',
            category: 'security-basics',
            order: 17
          },
          {
            id: 'vulnerability-databases',
            title: 'Vulnerability Research Basics',
            description: 'CVE database navigation, vulnerability database usage, understanding CVSS scores, patch analysis',
            xp: 700,
            phase: 'foundation',
            category: 'security-basics',
            order: 18
          }
        ]
      },
      {
        id: 'web-foundations',
        title: 'Web Security Basics',
        tasks: [
          {
            id: 'proxy-tools-intro',
            title: 'Web Proxy Fundamentals',
            description: 'Proxy setup, intercepting requests, repeater, decoder, comparing responses, basic extensions',
            xp: 1200,
            phase: 'foundation',
            category: 'web-foundations',
            order: 19
          },
          {
            id: 'web-vulns-top10',
            title: 'Common Web Vulnerabilities',
            description: 'Learn top 10 web vulnerabilities, their impact, and basic exploitation techniques',
            xp: 1500,
            phase: 'foundation',
            category: 'web-foundations',
            order: 20
          },
          {
            id: 'basic-sqli',
            title: 'SQL Injection Basics',
            description: 'Union-based SQLi, error-based, boolean blind basics, automated scanning tools',
            xp: 1800,
            phase: 'foundation',
            category: 'web-foundations',
            order: 21
          },
          {
            id: 'basic-xss',
            title: 'XSS Fundamentals',
            description: 'Reflected, stored, DOM-based XSS basics, alert() payloads, cookie stealing',
            xp: 1600,
            phase: 'foundation',
            category: 'web-foundations',
            order: 22
          },
          {
            id: 'http-basics',
            title: 'HTTP Deep Dive',
            description: 'HTTP methods, headers, cookies, sessions, status codes, content types, HTTP/2 basics',
            xp: 1000,
            phase: 'foundation',
            category: 'web-foundations',
            order: 23
          }
        ]
      },
      {
        id: 'practice-foundation',
        title: 'Foundation Practice',
        tasks: [
          {
            id: 'beginner-learning-path',
            title: 'Complete Beginner Security Path',
            description: 'Finish comprehensive beginner learning path on security platforms, document all learnings',
            xp: 3000,
            phase: 'foundation',
            category: 'practice-foundation',
            order: 24
          },
          {
            id: 'wargames-challenges',
            title: 'Security Wargames',
            description: 'Complete beginner and intermediate level wargames focusing on various security concepts',
            xp: 2500,
            phase: 'foundation',
            category: 'practice-foundation',
            order: 25
          },
          {
            id: 'guided-pentesting',
            title: 'Guided Penetration Testing',
            description: 'Complete guided penetration testing exercises, understand methodology',
            xp: 2000,
            phase: 'foundation',
            category: 'practice-foundation',
            order: 26
          },
          {
            id: 'first-ctf',
            title: 'First CTF Participation',
            description: 'Participate in beginner CTF, solve at least 5 challenges across different categories',
            xp: 1500,
            phase: 'foundation',
            category: 'practice-foundation',
            order: 27
          },
          {
            id: 'web-security-academy',
            title: 'Web Security Academy Fundamentals',
            description: 'Complete apprentice-level labs for SQLi, XSS, and authentication vulnerabilities',
            xp: 2000,
            phase: 'foundation',
            category: 'practice-foundation',
            order: 28
          }
        ]
      }
    ]
  },
  {
    id: 'pentesting',
    title: 'Penetration Testing Core',
    description: 'Web Apps, Network Pentesting, Active Directory, and Exploitation',
    duration: 'Months 7-18',
    categories: [
      {
        id: 'web-pentest',
        title: 'Web Application Pentesting',
        tasks: [
          {
            id: 'advanced-sqli',
            title: 'Advanced SQL Injection',
            description: 'Time-based blind, out-of-band, second-order SQLi, WAF bypass techniques, stacked queries',
            xp: 3000,
            phase: 'pentesting',
            category: 'web-pentest',
            order: 29
          },
          {
            id: 'injection-mastery',
            title: 'All Injection Types',
            description: 'Command injection, LDAP, XPath, NoSQL, CRLF, Host header, template injection basics',
            xp: 3500,
            phase: 'pentesting',
            category: 'web-pentest',
            order: 30
          },
          {
            id: 'authentication-attacks',
            title: 'Authentication Bypass',
            description: 'Session attacks, JWT exploitation, OAuth flaws, password reset poisoning, 2FA bypass',
            xp: 3200,
            phase: 'pentesting',
            category: 'web-pentest',
            order: 31
          },
          {
            id: 'xxe-ssrf',
            title: 'XXE and SSRF Mastery',
            description: 'XXE to RCE, blind XXE, SSRF chains, cloud metadata access, bypassing filters',
            xp: 3800,
            phase: 'pentesting',
            category: 'web-pentest',
            order: 32
          },
          {
            id: 'file-upload-rce',
            title: 'File Upload to RCE',
            description: 'Bypass filters, polyglot files, race conditions, zip traversal, image manipulation exploits',
            xp: 3000,
            phase: 'pentesting',
            category: 'web-pentest',
            order: 33
          },
          {
            id: 'business-logic',
            title: 'Business Logic Vulnerabilities',
            description: 'Price manipulation, race conditions in payments, workflow bypass, insufficient process validation',
            xp: 3500,
            phase: 'pentesting',
            category: 'web-pentest',
            order: 34
          },
          {
            id: 'cors-attacks',
            title: 'CORS & Origin-based Attacks',
            description: 'CORS misconfigurations, origin reflection, null origin, wildcard issues, credentials exposure',
            xp: 2800,
            phase: 'pentesting',
            category: 'web-pentest',
            order: 35
          },
          {
            id: 'idor-access-control',
            title: 'IDOR & Access Control',
            description: 'Horizontal/vertical privilege escalation, UUID prediction, parameter pollution, forced browsing',
            xp: 3000,
            phase: 'pentesting',
            category: 'web-pentest',
            order: 36
          }
        ]
      },
      {
        id: 'api-security',
        title: 'API Security Testing',
        tasks: [
          {
            id: 'api-fundamentals',
            title: 'API Security Fundamentals',
            description: 'REST/SOAP basics, API authentication methods, common API vulnerabilities, API testing tools mastery',
            xp: 2500,
            phase: 'pentesting',
            category: 'api-security',
            order: 37
          },
          {
            id: 'graphql-security',
            title: 'GraphQL Security Testing',
            description: 'Introspection attacks, query depth attacks, batching attacks, field suggestions abuse',
            xp: 3200,
            phase: 'pentesting',
            category: 'api-security',
            order: 38
          },
          {
            id: 'api-auth-attacks',
            title: 'API Authentication Attacks',
            description: 'JWT attacks, API key security, OAuth2 flows exploitation, bearer token vulnerabilities',
            xp: 3000,
            phase: 'pentesting',
            category: 'api-security',
            order: 39
          },
          {
            id: 'webhook-security',
            title: 'Webhook Security',
            description: 'Webhook validation bypass, SSRF via webhooks, webhook flooding, signature verification attacks',
            xp: 2800,
            phase: 'pentesting',
            category: 'api-security',
            order: 40
          },
          {
            id: 'api-rate-limiting',
            title: 'API Rate Limiting & DoS',
            description: 'Rate limit testing, resource exhaustion, GraphQL complexity attacks, batch API abuse',
            xp: 2600,
            phase: 'pentesting',
            category: 'api-security',
            order: 41
          }
        ]
      },
      {
        id: 'modern-web-security',
        title: 'Modern Web Security',
        tasks: [
          {
            id: 'oauth-saml',
            title: 'OAuth2 & SAML Security',
            description: 'OAuth2 flow vulnerabilities, SAML signature wrapping, XML injection, SSO bypass techniques',
            xp: 3500,
            phase: 'pentesting',
            category: 'modern-web-security',
            order: 42
          },
          {
            id: 'spa-security',
            title: 'SPA & Modern JS Security',
            description: 'React/Vue/Angular specific bugs, client-side storage, postMessage vulnerabilities, prototype pollution',
            xp: 3200,
            phase: 'pentesting',
            category: 'modern-web-security',
            order: 43
          },
          {
            id: 'websocket-security',
            title: 'WebSocket Security',
            description: 'WebSocket hijacking, cross-site WebSocket hijacking, message tampering, origin validation',
            xp: 2800,
            phase: 'pentesting',
            category: 'modern-web-security',
            order: 44
          },
          {
            id: 'csp-bypass',
            title: 'CSP Bypass Techniques',
            description: 'CSP header analysis, unsafe-inline/eval, script gadgets, base-uri attacks, CSP reporting abuse',
            xp: 3000,
            phase: 'pentesting',
            category: 'modern-web-security',
            order: 45
          },
          {
            id: 'dom-vulnerabilities',
            title: 'Advanced DOM Vulnerabilities',
            description: 'DOM clobbering, mutation XSS, DOM sanitizer bypasses, trusted types bypass',
            xp: 3400,
            phase: 'pentesting',
            category: 'modern-web-security',
            order: 46
          }
        ]
      },
      {
        id: 'system-exploitation',
        title: 'System Exploitation',
        tasks: [
          {
            id: 'buffer-overflow',
            title: 'Stack Buffer Overflows',
            description: 'EIP control, bad character analysis, shellcode generation, NOP sleds, fuzzing basics',
            xp: 4000,
            phase: 'pentesting',
            category: 'system-exploitation',
            order: 47
          },
          {
            id: 'windows-privesc',
            title: 'Windows Privilege Escalation',
            description: 'Token impersonation, DLL hijacking, unquoted paths, registry keys, privilege escalation techniques',
            xp: 3500,
            phase: 'pentesting',
            category: 'system-exploitation',
            order: 48
          },
          {
            id: 'linux-privesc',
            title: 'Linux Privilege Escalation',
            description: 'SUID abuse, sudo misconfig, kernel exploits, cron jobs, capabilities, container escape',
            xp: 3500,
            phase: 'pentesting',
            category: 'system-exploitation',
            order: 49
          },
          {
            id: 'post-exploitation',
            title: 'Post-Exploitation Techniques',
            description: 'Persistence, lateral movement, credential harvesting, log cleaning, anti-forensics',
            xp: 3200,
            phase: 'pentesting',
            category: 'system-exploitation',
            order: 50
          }
        ]
      },
      {
        id: 'active-directory',
        title: 'Active Directory Attacks',
        tasks: [
          {
            id: 'ad-enumeration',
            title: 'AD Enumeration Mastery',
            description: 'AD enumeration tools, LDAP queries, SPNs discovery, trust mapping, ACL abuse',
            xp: 4000,
            phase: 'pentesting',
            category: 'active-directory',
            order: 51
          },
          {
            id: 'kerberos-attacks',
            title: 'Kerberos Exploitation',
            description: 'Kerberoasting, ASREPRoasting, golden/silver tickets, pass-the-ticket, overpass-the-hash',
            xp: 4500,
            phase: 'pentesting',
            category: 'active-directory',
            order: 52
          },
          {
            id: 'ad-persistence',
            title: 'AD Persistence & Lateral Movement',
            description: 'DCSync, skeleton key, KRBTGT persistence, GPO abuse, SCCM exploitation',
            xp: 4200,
            phase: 'pentesting',
            category: 'active-directory',
            order: 53
          },
          {
            id: 'ad-lab',
            title: 'Build Complex AD Lab',
            description: 'Multi-forest environment, trusts, ADCS, Exchange, SQL Server, misconfigurations',
            xp: 3000,
            phase: 'pentesting',
            category: 'active-directory',
            order: 54
          }
        ]
      },
      {
        id: 'network-pentesting',
        title: 'Network Penetration Testing',
        tasks: [
          {
            id: 'network-attacks',
            title: 'Network Attack Vectors',
            description: 'MITM attacks, ARP poisoning, VLAN hopping, DNS spoofing, network protocol attacks',
            xp: 3200,
            phase: 'pentesting',
            category: 'network-pentesting',
            order: 55
          },
          {
            id: 'wireless-hacking',
            title: 'Wireless Penetration Testing',
            description: 'WPA2 cracking, evil twin, karma attacks, WPS exploitation, enterprise wireless',
            xp: 2800,
            phase: 'pentesting',
            category: 'network-pentesting',
            order: 56
          },
          {
            id: 'vpn-attacks',
            title: 'VPN & Tunnel Attacks',
            description: 'IPSec/SSL VPN attacks, tunnel pivoting, GRE exploitation, VPN credential stealing',
            xp: 2500,
            phase: 'pentesting',
            category: 'network-pentesting',
            order: 57
          },
          {
            id: 'infrastructure-pentest',
            title: 'Infrastructure Assessment',
            description: 'Router/switch exploitation, SNMP attacks, management interface abuse, firmware analysis',
            xp: 3000,
            phase: 'pentesting',
            category: 'network-pentesting',
            order: 58
          }
        ]
      },
      {
        id: 'tool-development',
        title: 'Custom Tool Development',
        tasks: [
          {
            id: 'exploit-development',
            title: 'Basic Exploit Writing',
            description: 'Modify public exploits, write exploitation modules, understand exploit structure',
            xp: 4000,
            phase: 'pentesting',
            category: 'tool-development',
            order: 59
          },
          {
            id: 'scanner-development',
            title: 'Custom Scanner Creation',
            description: 'Build multi-threaded port scanner, service detector, vulnerability scanner in Python',
            xp: 3500,
            phase: 'pentesting',
            category: 'tool-development',
            order: 60
          },
          {
            id: 'automation-framework',
            title: 'Pentesting Automation',
            description: 'Create recon automation, reporting tools, vulnerability correlation scripts',
            xp: 3800,
            phase: 'pentesting',
            category: 'tool-development',
            order: 61
          },
          {
            id: 'payload-generation',
            title: 'Payload & Backdoor Dev',
            description: 'Custom reverse shells, encoded payloads, polymorphic code, anti-forensics',
            xp: 4200,
            phase: 'pentesting',
            category: 'tool-development',
            order: 62
          },
          {
            id: 'proxy-extensions',
            title: 'Web Proxy Extension Development',
            description: 'Create custom proxy extensions in Python/Java, passive/active scanners, custom checks',
            xp: 3600,
            phase: 'pentesting',
            category: 'tool-development',
            order: 63
          }
        ]
      },
      {
        id: 'certifications-practice',
        title: 'Certification & Practice',
        tasks: [
          {
            id: 'offensive-cert-prep',
            title: 'Offensive Security Certification Prep',
            description: 'Complete practice labs, buffer overflows, AD attacks, report writing preparation',
            xp: 8000,
            phase: 'pentesting',
            category: 'certifications-practice',
            order: 64
          },
          {
            id: 'advanced-lab-environments',
            title: 'Advanced Lab Environments',
            description: 'Complete enterprise-grade lab environments simulating real corporate networks',
            xp: 6000,
            phase: 'pentesting',
            category: 'certifications-practice',
            order: 65
          },
          {
            id: 'practice-vulnerable-machines',
            title: 'Practice Vulnerable Machines',
            description: 'Complete 20 intermediate to hard vulnerable machines, time yourself, practice methodology',
            xp: 4000,
            phase: 'pentesting',
            category: 'certifications-practice',
            order: 66
          },
          {
            id: 'bug-bounty-start',
            title: 'First Bug Bounty Finds',
            description: 'Find and report first 5 valid vulnerabilities on bug bounty platforms',
            xp: 5000,
            phase: 'pentesting',
            category: 'certifications-practice',
            order: 67
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Security & Specialization',
    description: 'Cloud Security, Mobile Testing, Advanced Exploitation, Bug Bounty Mastery',
    duration: 'Months 19-30',
    categories: [
      {
        id: 'advanced-web',
        title: 'Advanced Web Exploitation',
        tasks: [
          {
            id: 'deserialization',
            title: 'Deserialization Attacks',
            description: 'Java, PHP, Python, .NET deserialization, gadget chains, serialization vulnerabilities',
            xp: 6000,
            phase: 'advanced',
            category: 'advanced-web',
            order: 68
          },
          {
            id: 'race-conditions',
            title: 'Race Condition Exploitation',
            description: 'TOCTOU bugs, payment races, async vulnerabilities, advanced request timing attacks',
            xp: 5500,
            phase: 'advanced',
            category: 'advanced-web',
            order: 69
          },
          {
            id: 'cache-poisoning',
            title: 'Cache Attacks',
            description: 'Web cache poisoning, deception, key injection, CPDoS, cache-based XSS',
            xp: 5000,
            phase: 'advanced',
            category: 'advanced-web',
            order: 70
          },
          {
            id: 'request-smuggling',
            title: 'HTTP Request Smuggling',
            description: 'CL.TE, TE.CL, TE.TE attacks, chaining with other vulnerabilities',
            xp: 6500,
            phase: 'advanced',
            category: 'advanced-web',
            order: 71
          },
          {
            id: 'api-advanced',
            title: 'Advanced API Exploitation',
            description: 'GraphQL injection, REST API mass assignment, webhook attacks, API key hunting',
            xp: 5200,
            phase: 'advanced',
            category: 'advanced-web',
            order: 72
          },
          {
            id: 'prototype-pollution',
            title: 'Prototype Pollution',
            description: 'Client-side prototype pollution, gadget hunting, pollution to XSS/RCE, server-side pollution',
            xp: 5800,
            phase: 'advanced',
            category: 'advanced-web',
            order: 73
          },
          {
            id: 'postmessage-attacks',
            title: 'PostMessage & DOM Security',
            description: 'PostMessage exploitation, origin validation bypass, DOM-based race conditions, frame hijacking',
            xp: 5300,
            phase: 'advanced',
            category: 'advanced-web',
            order: 74
          }
        ]
      },
      {
        id: 'source-code-review',
        title: 'Source Code Analysis',
        tasks: [
          {
            id: 'sast-fundamentals',
            title: 'Static Analysis Fundamentals',
            description: 'Manual code review techniques, data flow analysis, taint tracking, sink identification',
            xp: 5500,
            phase: 'advanced',
            category: 'source-code-review',
            order: 75
          },
          {
            id: 'sast-tools',
            title: 'SAST Tools Mastery',
            description: 'Advanced static analysis tools, custom rule writing, security pattern detection, CI/CD integration',
            xp: 5000,
            phase: 'advanced',
            category: 'source-code-review',
            order: 76
          },
          {
            id: 'js-code-review',
            title: 'JavaScript Security Review',
            description: 'Node.js vulnerabilities, npm package analysis, webpack misconfigs, source map exploitation',
            xp: 5200,
            phase: 'advanced',
            category: 'source-code-review',
            order: 77
          },
          {
            id: 'java-code-review',
            title: 'Java Security Review',
            description: 'Spring vulnerabilities, JNDI injection, expression language injection, unsafe reflection',
            xp: 5400,
            phase: 'advanced',
            category: 'source-code-review',
            order: 78
          }
        ]
      },
      {
        id: 'cloud-security',
        title: 'Cloud & Container Security',
        tasks: [
          {
            id: 'aws-pentesting',
            title: 'AWS Penetration Testing',
            description: 'IAM exploitation, S3 misconfig, Lambda attacks, EC2 SSRF, CloudFormation abuse',
            xp: 7000,
            phase: 'advanced',
            category: 'cloud-security',
            order: 79
          },
          {
            id: 'azure-security',
            title: 'Azure Security Testing',
            description: 'Azure AD attacks, blob storage, Key Vault abuse, ARM template injection',
            xp: 6500,
            phase: 'advanced',
            category: 'cloud-security',
            order: 80
          },
          {
            id: 'kubernetes-exploitation',
            title: 'Kubernetes Attacks',
            description: 'API abuse, RBAC bypass, pod escape, service mesh exploitation, secrets extraction',
            xp: 7500,
            phase: 'advanced',
            category: 'cloud-security',
            order: 81
          },
          {
            id: 'container-breakout',
            title: 'Container Escape Techniques',
            description: 'Container breakout techniques, privileged containers, namespace abuse, cgroups exploitation',
            xp: 6000,
            phase: 'advanced',
            category: 'cloud-security',
            order: 82
          },
          {
            id: 'serverless-security',
            title: 'Serverless Security',
            description: 'Lambda/Functions exploitation, event injection, cold start attacks, function URL abuse',
            xp: 5500,
            phase: 'advanced',
            category: 'cloud-security',
            order: 83
          },
          {
            id: 'cicd-security',
            title: 'CI/CD Pipeline Security',
            description: 'Pipeline exploitation, secrets extraction, supply chain attacks, artifact poisoning',
            xp: 6200,
            phase: 'advanced',
            category: 'cloud-security',
            order: 84
          }
        ]
      },
      {
        id: 'mobile-security',
        title: 'Mobile Application Security',
        tasks: [
          {
            id: 'android-pentesting',
            title: 'Android Security Testing',
            description: 'APK reversing, dynamic instrumentation, SSL pinning bypass, intent exploitation, root detection bypass',
            xp: 6000,
            phase: 'advanced',
            category: 'mobile-security',
            order: 85
          },
          {
            id: 'ios-security',
            title: 'iOS Security Basics',
            description: 'IPA analysis, jailbreak detection bypass, Objective-C runtime manipulation, keychain dumping',
            xp: 5500,
            phase: 'advanced',
            category: 'mobile-security',
            order: 86
          },
          {
            id: 'mobile-api',
            title: 'Mobile API Security',
            description: 'Certificate pinning bypass, API endpoint discovery, mobile-specific vulnerabilities',
            xp: 4500,
            phase: 'advanced',
            category: 'mobile-security',
            order: 87
          },
          {
            id: 'mobile-malware',
            title: 'Mobile Malware Analysis',
            description: 'Static and dynamic analysis, behavior monitoring, C2 identification',
            xp: 5000,
            phase: 'advanced',
            category: 'mobile-security',
            order: 88
          },
          {
            id: 'react-native-security',
            title: 'React Native Security',
            description: 'JavaScript bridge exploitation, native module vulnerabilities, bytecode reversing',
            xp: 4800,
            phase: 'advanced',
            category: 'mobile-security',
            order: 89
          }
        ]
      },
      {
        id: 'exploit-dev-advanced',
        title: 'Advanced Exploit Development',
        tasks: [
          {
            id: 'heap-exploitation',
            title: 'Heap Exploitation',
            description: 'Heap overflow, use-after-free, heap spraying, tcache attacks, advanced heap techniques',
            xp: 8000,
            phase: 'advanced',
            category: 'exploit-dev-advanced',
            order: 90
          },
          {
            id: 'rop-chains',
            title: 'Return-Oriented Programming',
            description: 'ROP chain construction, ASLR bypass, gadget finding, JOP/COP techniques',
            xp: 7500,
            phase: 'advanced',
            category: 'exploit-dev-advanced',
            order: 91
          },
          {
            id: 'kernel-intro',
            title: 'Kernel Exploitation Basics',
            description: 'Kernel debugging, privilege escalation, race conditions, null pointer dereference',
            xp: 9000,
            phase: 'advanced',
            category: 'exploit-dev-advanced',
            order: 92
          },
          {
            id: 'fuzzing-advanced',
            title: 'Advanced Fuzzing',
            description: 'Coverage-guided fuzzing, custom harnesses, crash analysis, fuzzer development',
            xp: 6500,
            phase: 'advanced',
            category: 'exploit-dev-advanced',
            order: 93
          }
        ]
      },
      {
        id: 'bug-bounty-mastery',
        title: 'Bug Bounty Excellence',
        tasks: [
          {
            id: 'recon-automation',
            title: 'Automated Recon Pipeline',
            description: 'Build complete automation: subdomain enum, port scan, vulnerability scanning, custom checks',
            xp: 5000,
            phase: 'advanced',
            category: 'bug-bounty-mastery',
            order: 94
          },
          {
            id: 'bounty-methodology',
            title: 'Personal Methodology',
            description: 'Develop unique approach, specialize in specific bug classes, efficient testing',
            xp: 4000,
            phase: 'advanced',
            category: 'bug-bounty-mastery',
            order: 95
          },
          {
            id: 'high-impact-bugs',
            title: 'Critical Vulnerability Hunting',
            description: 'Find 10+ high/critical bugs, focus on RCE, authentication bypass, data leaks',
            xp: 10000,
            phase: 'advanced',
            category: 'bug-bounty-mastery',
            order: 96
          },
          {
            id: 'bounty-income',
            title: 'Consistent Bounty Income',
            description: 'Earn $10,000+ from bug bounties, establish reputation',
            xp: 8000,
            phase: 'advanced',
            category: 'bug-bounty-mastery',
            order: 97
          },
          {
            id: 'collaboration-hunting',
            title: 'Collaborative Bug Hunting',
            description: 'Team up with other researchers, chain vulnerabilities, share methodologies',
            xp: 4500,
            phase: 'advanced',
            category: 'bug-bounty-mastery',
            order: 98
          }
        ]
      },
      {
        id: 'hardware-iot',
        title: 'Hardware & IoT Security',
        tasks: [
          {
            id: 'hardware-basics',
            title: 'Hardware Hacking Fundamentals',
            description: 'UART, JTAG, SPI interfaces, logic analyzers, firmware extraction',
            xp: 5500,
            phase: 'advanced',
            category: 'hardware-iot',
            order: 99
          },
          {
            id: 'radio-hacking',
            title: 'Radio Frequency Attacks',
            description: 'SDR basics, replay attacks, protocol reverse engineering, car key fobs',
            xp: 6000,
            phase: 'advanced',
            category: 'hardware-iot',
            order: 100
          },
          {
            id: 'iot-exploitation',
            title: 'IoT Device Hacking',
            description: 'Router exploitation, smart device attacks, firmware analysis, backdoor discovery',
            xp: 6500,
            phase: 'advanced',
            category: 'hardware-iot',
            order: 101
          },
          {
            id: 'badge-rfid',
            title: 'Physical Access Attacks',
            description: 'RFID cloning, badge attacks, lock picking basics, physical security assessment',
            xp: 4500,
            phase: 'advanced',
            category: 'hardware-iot',
            order: 102
          }
        ]
      },
      {
        id: 'blockchain-security',
        title: 'Blockchain & Web3 Security',
        tasks: [
          {
            id: 'smart-contract-basics',
            title: 'Smart Contract Security Basics',
            description: 'Solidity vulnerabilities, reentrancy, integer overflow, access control issues',
            xp: 6000,
            phase: 'advanced',
            category: 'blockchain-security',
            order: 103
          },
          {
            id: 'defi-security',
            title: 'DeFi Protocol Security',
            description: 'Flash loan attacks, price oracle manipulation, MEV exploitation, liquidity pool attacks',
            xp: 7000,
            phase: 'advanced',
            category: 'blockchain-security',
            order: 104
          },
          {
            id: 'web3-pentesting',
            title: 'Web3 Application Testing',
            description: 'Wallet integration bugs, signature verification, frontend attacks, RPC abuse',
            xp: 5500,
            phase: 'advanced',
            category: 'blockchain-security',
            order: 105
          },
          {
            id: 'blockchain-forensics',
            title: 'Blockchain Forensics',
            description: 'Transaction analysis, mixer detection, wallet clustering, on-chain investigation',
            xp: 5000,
            phase: 'advanced',
            category: 'blockchain-security',
            order: 106
          }
        ]
      }
    ]
  },
  {
    id: 'redteam',
    title: 'Red Team Operations',
    description: 'Adversary Emulation, Custom Implants, Social Engineering, Advanced Persistence',
    duration: 'Months 31-36',
    categories: [
      {
        id: 'redteam-fundamentals',
        title: 'Red Team Foundations',
        tasks: [
          {
            id: 'attack-framework',
            title: 'Attack Framework Mastery',
            description: 'Map attack techniques, build attack chains, emulate APT groups, purple team exercises',
            xp: 8000,
            phase: 'redteam',
            category: 'redteam-fundamentals',
            order: 107
          },
          {
            id: 'opsec-tradecraft',
            title: 'OPSEC & Tradecraft',
            description: 'Attribution prevention, operational security, covert channels, anti-forensics',
            xp: 7500,
            phase: 'redteam',
            category: 'redteam-fundamentals',
            order: 108
          },
          {
            id: 'threat-intelligence',
            title: 'Threat Intelligence Integration',
            description: 'APT analysis, TTP extraction, IOC creation, detection rules, threat hunting',
            xp: 6500,
            phase: 'redteam',
            category: 'redteam-fundamentals',
            order: 109
          },
          {
            id: 'campaign-planning',
            title: 'Red Team Campaign Planning',
            description: 'Objective-based operations, scenario development, ROE creation, risk assessment',
            xp: 7000,
            phase: 'redteam',
            category: 'redteam-fundamentals',
            order: 110
          }
        ]
      },
      {
        id: 'c2-infrastructure',
        title: 'Command & Control',
        tasks: [
          {
            id: 'c2-frameworks',
            title: 'C2 Framework Mastery',
            description: 'Popular C2 frameworks - setup, customization, OPSEC, profile development',
            xp: 9000,
            phase: 'redteam',
            category: 'c2-infrastructure',
            order: 111
          },
          {
            id: 'redirectors',
            title: 'Redirector Infrastructure',
            description: 'Apache/nginx redirectors, domain fronting, CDN abuse, traffic masking',
            xp: 7000,
            phase: 'redteam',
            category: 'c2-infrastructure',
            order: 112
          },
          {
            id: 'custom-c2',
            title: 'Custom C2 Development',
            description: 'Build basic C2 server, implement encryption, modular architecture',
            xp: 12000,
            phase: 'redteam',
            category: 'c2-infrastructure',
            order: 113
          },
          {
            id: 'c2-opsec',
            title: 'C2 OPSEC & Evasion',
            description: 'Traffic encryption, jitter, sleep techniques, killswitch implementation',
            xp: 8000,
            phase: 'redteam',
            category: 'c2-infrastructure',
            order: 114
          }
        ]
      },
      {
        id: 'implant-development',
        title: 'Implant & Payload Development',
        tasks: [
          {
            id: 'implant-basics',
            title: 'Basic Implant Creation',
            description: 'C/C++ beacon development, communication protocols, staged vs stageless',
            xp: 10000,
            phase: 'redteam',
            category: 'implant-development',
            order: 115
          },
          {
            id: 'process-injection',
            title: 'Advanced Process Injection',
            description: 'Classic injection, APC injection, thread hijacking, process hollowing',
            xp: 9000,
            phase: 'redteam',
            category: 'implant-development',
            order: 116
          },
          {
            id: 'edr-evasion',
            title: 'EDR Bypass Techniques',
            description: 'API unhooking, direct syscalls, ETW patching, security product bypass',
            xp: 11000,
            phase: 'redteam',
            category: 'implant-development',
            order: 117
          },
          {
            id: 'persistence-advanced',
            title: 'Advanced Persistence',
            description: 'COM hijacking, WMI events, bootkit concepts, fileless persistence',
            xp: 9500,
            phase: 'redteam',
            category: 'implant-development',
            order: 118
          }
        ]
      },
      {
        id: 'social-engineering',
        title: 'Social Engineering & Physical',
        tasks: [
          {
            id: 'phishing-campaigns',
            title: 'Advanced Phishing',
            description: 'Phishing framework mastery, multi-factor bypass, pretexting, spear phishing, credential harvesting',
            xp: 7000,
            phase: 'redteam',
            category: 'social-engineering',
            order: 119
          },
          {
            id: 'vishing-pretexting',
            title: 'Voice & Pretexting',
            description: 'Vishing techniques, pretext development, information gathering, social OSINT',
            xp: 6000,
            phase: 'redteam',
            category: 'social-engineering',
            order: 120
          },
          {
            id: 'physical-security',
            title: 'Physical Penetration',
            description: 'Lock picking, badge cloning, tailgating, USB drops, covert entry',
            xp: 7500,
            phase: 'redteam',
            category: 'social-engineering',
            order: 121
          },
          {
            id: 'insider-simulation',
            title: 'Insider Threat Simulation',
            description: 'Malicious insider scenarios, data exfiltration, privilege abuse',
            xp: 6500,
            phase: 'redteam',
            category: 'social-engineering',
            order: 122
          }
        ]
      },
      {
        id: 'advanced-techniques',
        title: 'Advanced Red Team Techniques',
        tasks: [
          {
            id: 'supply-chain',
            title: 'Supply Chain Attacks',
            description: 'Dependency confusion, typosquatting, package manager abuse, CI/CD poisoning',
            xp: 10000,
            phase: 'redteam',
            category: 'advanced-techniques',
            order: 123
          },
          {
            id: 'covert-channels',
            title: 'Covert Communication',
            description: 'DNS tunneling, ICMP tunneling, steganography, social media C2',
            xp: 8000,
            phase: 'redteam',
            category: 'advanced-techniques',
            order: 124
          },
          {
            id: 'data-exfiltration',
            title: 'Advanced Exfiltration',
            description: 'DLP bypass, encrypted channels, slow exfil, cloud storage abuse',
            xp: 7500,
            phase: 'redteam',
            category: 'advanced-techniques',
            order: 125
          },
          {
            id: 'lateral-movement',
            title: 'Lateral Movement Mastery',
            description: 'Living off the land, native tools abuse, RDP hijacking, token manipulation',
            xp: 8500,
            phase: 'redteam',
            category: 'advanced-techniques',
            order: 126
          }
        ]
      },
      {
        id: 'redteam-ops',
        title: 'Red Team Operations',
        tasks: [
          {
            id: 'first-engagement',
            title: 'First Red Team Engagement',
            description: 'Plan and execute complete red team operation, achieve objectives',
            xp: 15000,
            phase: 'redteam',
            category: 'redteam-ops',
            order: 127
          },
          {
            id: 'purple-team',
            title: 'Purple Team Exercises',
            description: 'Collaborate with blue team, improve detections, knowledge transfer',
            xp: 8000,
            phase: 'redteam',
            category: 'redteam-ops',
            order: 128
          },
          {
            id: 'report-writing',
            title: 'Executive Reporting',
            description: 'Risk-based reporting, business impact, remediation guidance',
            xp: 6000,
            phase: 'redteam',
            category: 'redteam-ops',
            order: 129
          },
          {
            id: 'redteam-cert',
            title: 'Red Team Certification',
            description: 'Obtain advanced red team certification, validate skills',
            xp: 12000,
            phase: 'redteam',
            category: 'redteam-ops',
            order: 130
          }
        ]
      }
    ]
  },
  {
    id: 'elite',
    title: 'Elite Security Researcher',
    description: 'Zero-Day Research, Advanced Malware, Industry Leadership',
    duration: 'Year 3+',
    categories: [
      {
        id: 'vulnerability-research',
        title: 'Vulnerability Research',
        tasks: [
          {
            id: 'cve-hunting',
            title: 'CVE Discovery',
            description: 'Find and report 10+ CVEs in popular software, coordinated disclosure',
            xp: 25000,
            phase: 'elite',
            category: 'vulnerability-research',
            order: 131
          },
          {
            id: 'browser-bugs',
            title: 'Browser Exploitation',
            description: 'Find bugs in Chrome/Firefox, sandbox escape, renderer exploitation',
            xp: 50000,
            phase: 'elite',
            category: 'vulnerability-research',
            order: 132
          },
          {
            id: 'kernel-exploitation',
            title: 'Kernel Vulnerability Research',
            description: 'Windows/Linux kernel bugs, privilege escalation, race conditions',
            xp: 40000,
            phase: 'elite',
            category: 'vulnerability-research',
            order: 133
          },
          {
            id: 'hypervisor-escape',
            title: 'Virtualization Escapes',
            description: 'VM escape research, hypervisor bugs, cloud provider vulnerabilities',
            xp: 60000,
            phase: 'elite',
            category: 'vulnerability-research',
            order: 134
          }
        ]
      },
      {
        id: 'malware-development',
        title: 'Advanced Malware Creation',
        tasks: [
          {
            id: 'rootkit-development',
            title: 'Rootkit Development',
            description: 'Kernel rootkits, DKOM, hypervisor rootkits, anti-forensics',
            xp: 30000,
            phase: 'elite',
            category: 'malware-development',
            order: 135
          },
          {
            id: 'crypter-packer',
            title: 'Crypter & Packer Development',
            description: 'Polymorphic engines, metamorphic code, custom packers',
            xp: 25000,
            phase: 'elite',
            category: 'malware-development',
            order: 136
          },
          {
            id: 'advanced-evasion',
            title: 'Next-Gen Evasion',
            description: 'ML evasion, behavioral analysis bypass, sandbox detection',
            xp: 35000,
            phase: 'elite',
            category: 'malware-development',
            order: 137
          },
          {
            id: 'apt-emulation',
            title: 'APT-Level Capabilities',
            description: 'Nation-state techniques, advanced persistence, covert operations',
            xp: 45000,
            phase: 'elite',
            category: 'malware-development',
            order: 138
          }
        ]
      },
      {
        id: 'research-development',
        title: 'Security Research & Innovation',
        tasks: [
          {
            id: 'new-bug-class',
            title: 'Discover New Bug Class',
            description: 'Identify previously unknown vulnerability type, publish research',
            xp: 75000,
            phase: 'elite',
            category: 'research-development',
            order: 139
          },
          {
            id: 'security-tools',
            title: 'Industry-Standard Tools',
            description: 'Create tools adopted by security community, significant open source contributions',
            xp: 40000,
            phase: 'elite',
            category: 'research-development',
            order: 140
          },
          {
            id: 'framework-contributions',
            title: 'Major Framework Contributions',
            description: 'Core contributions to major security frameworks and tools',
            xp: 30000,
            phase: 'elite',
            category: 'research-development',
            order: 141
          },
          {
            id: 'academic-research',
            title: 'Academic Publications',
            description: 'Publish papers at top security conferences, PhD-level research',
            xp: 50000,
            phase: 'elite',
            category: 'research-development',
            order: 142
          }
        ]
      },
      {
        id: 'industry-impact',
        title: 'Industry Leadership',
        tasks: [
          {
            id: 'conference-speaker',
            title: 'Major Conference Speaker',
            description: 'Speak at top security conferences, share groundbreaking research',
            xp: 35000,
            phase: 'elite',
            category: 'industry-impact',
            order: 143
          },
          {
            id: 'training-author',
            title: 'Create Training Course',
            description: 'Develop and deliver professional security training',
            xp: 25000,
            phase: 'elite',
            category: 'industry-impact',
            order: 144
          },
          {
            id: 'bug-bounty-elite',
            title: 'Bug Bounty Legend',
            description: 'Earn $500k+ lifetime, top 10 on major platforms',
            xp: 80000,
            phase: 'elite',
            category: 'industry-impact',
            order: 145
          },
          {
            id: 'security-startup',
            title: 'Security Company Founder',
            description: 'Start successful security company or consultancy',
            xp: 100000,
            phase: 'elite',
            category: 'industry-impact',
            order: 146
          }
        ]
      },
      {
        id: 'specialized-expertise',
        title: 'Specialized Expertise',
        tasks: [
          {
            id: 'blockchain-security',
            title: 'Blockchain Security Expert',
            description: 'Smart contract auditing, consensus attacks, DeFi exploitation',
            xp: 40000,
            phase: 'elite',
            category: 'specialized-expertise',
            order: 147
          },
          {
            id: 'ai-security',
            title: 'AI/ML Security Research',
            description: 'Adversarial ML, model extraction, AI system vulnerabilities',
            xp: 45000,
            phase: 'elite',
            category: 'specialized-expertise',
            order: 148
          },
          {
            id: 'ics-scada',
            title: 'ICS/SCADA Security',
            description: 'Critical infrastructure, industrial protocols, safety systems',
            xp: 50000,
            phase: 'elite',
            category: 'ics-scada',
            order: 149
          },
          {
            id: 'quantum-ready',
            title: 'Post-Quantum Security',
            description: 'Quantum-resistant cryptography, future-proof security',
            xp: 60000,
            phase: 'elite',
            category: 'specialized-expertise',
            order: 150
          }
        ]
      },
      {
        id: 'legendary-achievements',
        title: 'Legendary Status',
        tasks: [
          {
            id: 'elite-competition',
            title: 'Elite Competition Winner',
            description: 'Win prestigious hacking competition or capture the flag event',
            xp: 150000,
            phase: 'elite',
            category: 'legendary-achievements',
            order: 151
          },
          {
            id: 'bug-bounty-million',
            title: 'Million Dollar Hacker',
            description: 'Earn over $1,000,000 from bug bounties',
            xp: 200000,
            phase: 'elite',
            category: 'legendary-achievements',
            order: 152
          },
          {
            id: 'security-pioneer',
            title: 'Security Pioneer',
            description: 'Make breakthrough discovery that changes security industry',
            xp: 500000,
            phase: 'elite',
            category: 'legendary-achievements',
            order: 153
          },
          {
            id: 'hall-of-fame',
            title: 'Security Hall of Fame',
            description: 'Recognized as one of the top security researchers globally',
            xp: 1000000,
            phase: 'elite',
            category: 'legendary-achievements',
            order: 154
          }
        ]
      }
    ]
  }
];