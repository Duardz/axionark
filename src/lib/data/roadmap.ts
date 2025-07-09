export interface Task {
  id: string;
  title: string;
  description: string;
  xp: number;
  phase: 'foundation' | 'hacker' | 'advanced' | 'elite' | 'legendary';
  category: string;
  order: number;
}

export interface Phase {
  id: 'foundation' | 'hacker' | 'advanced' | 'elite' | 'legendary';
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
    title: 'Hacker Foundations',
    description: 'Master Core Systems, Web Fundamentals, and Essential Tools',
    duration: 'Months 1-6',
    categories: [
      {
        id: 'system-fundamentals',
        title: 'System Fundamentals',
        tasks: [
          {
            id: 'linux-command-mastery',
            title: 'Linux Command Line Mastery',
            description: 'File operations, text processing, process management, network commands, permission systems',
            xp: 1500,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 1
          },
          {
            id: 'windows-admin-basics',
            title: 'Windows Administration Basics',
            description: 'CMD/PowerShell, user management, services, registry, network configuration',
            xp: 1200,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 2
          },
          {
            id: 'networking-foundations',
            title: 'Networking Fundamentals',
            description: 'TCP/IP, subnetting, protocols (HTTP/SSH/FTP/SMB), packet analysis basics',
            xp: 1800,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 3
          },
          {
            id: 'scripting-basics',
            title: 'Scripting Foundations',
            description: 'Python basics, Bash scripting, PowerShell scripting, automation concepts',
            xp: 2000,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 4
          },
          {
            id: 'virtualization-setup',
            title: 'Hacking Lab Setup',
            description: 'VMware/VirtualBox, Kali Linux, vulnerable VMs, network configuration',
            xp: 1000,
            phase: 'foundation',
            category: 'system-fundamentals',
            order: 5
          }
        ]
      },
      {
        id: 'web-hacking-basics',
        title: 'Web Application Hacking',
        tasks: [
          {
            id: 'http-protocol-mastery',
            title: 'HTTP/HTTPS Protocol Deep Dive',
            description: 'Request/response structure, headers, methods, cookies, sessions, authentication',
            xp: 1200,
            phase: 'foundation',
            category: 'web-hacking-basics',
            order: 6
          },
          {
            id: 'burp-suite-mastery',
            title: 'Burp Suite Mastery',
            description: 'Proxy, repeater, intruder, decoder, all tools, extensions, methodology',
            xp: 1800,
            phase: 'foundation',
            category: 'web-hacking-basics',
            order: 7
          },
          {
            id: 'xss-exploitation',
            title: 'Cross-Site Scripting (XSS)',
            description: 'Reflected, stored, DOM XSS, filter bypasses, cookie stealing, BeEF framework',
            xp: 2200,
            phase: 'foundation',
            category: 'web-hacking-basics',
            order: 8
          },
          {
            id: 'sql-injection-mastery',
            title: 'SQL Injection Mastery',
            description: 'Union, boolean, time-based, error-based, SQLMap, database enumeration, OS commands',
            xp: 2500,
            phase: 'foundation',
            category: 'web-hacking-basics',
            order: 9
          },
          {
            id: 'web-shells-deployment',
            title: 'Web Shell Deployment',
            description: 'File upload attacks, web shell coding, persistence, filter bypasses, polyglot files',
            xp: 2000,
            phase: 'foundation',
            category: 'web-hacking-basics',
            order: 10
          }
        ]
      },
      {
        id: 'network-hacking',
        title: 'Network Hacking',
        tasks: [
          {
            id: 'network-scanning',
            title: 'Network Scanning & Enumeration',
            description: 'Nmap mastery, port scanning, service detection, OS fingerprinting, NSE scripts',
            xp: 1800,
            phase: 'foundation',
            category: 'network-hacking',
            order: 11
          },
          {
            id: 'service-exploitation',
            title: 'Network Service Exploitation',
            description: 'SSH, FTP, SMB, RDP attacks, banner grabbing, brute forcing, default credentials',
            xp: 2000,
            phase: 'foundation',
            category: 'network-hacking',
            order: 12
          },
          {
            id: 'metasploit-basics',
            title: 'Metasploit Framework',
            description: 'Exploit modules, payloads, handlers, meterpreter, post-exploitation, automation',
            xp: 2200,
            phase: 'foundation',
            category: 'network-hacking',
            order: 13
          },
          {
            id: 'packet-analysis',
            title: 'Packet Analysis with Wireshark',
            description: 'Traffic capture, protocol analysis, credential sniffing, network forensics',
            xp: 1500,
            phase: 'foundation',
            category: 'network-hacking',
            order: 14
          },
          {
            id: 'wireless-basics',
            title: 'Wireless Network Attacks',
            description: 'WPA/WPA2 cracking, evil twin, deauth attacks, aircrack-ng suite',
            xp: 1800,
            phase: 'foundation',
            category: 'network-hacking',
            order: 15
          }
        ]
      },
      {
        id: 'system-exploitation',
        title: 'System Exploitation',
        tasks: [
          {
            id: 'linux-privesc-basics',
            title: 'Linux Privilege Escalation',
            description: 'SUID binaries, sudo abuse, cron jobs, kernel exploits, LinPEAS, GTFOBins',
            xp: 2500,
            phase: 'foundation',
            category: 'system-exploitation',
            order: 16
          },
          {
            id: 'windows-privesc-basics',
            title: 'Windows Privilege Escalation',
            description: 'Service misconfigs, DLL hijacking, token impersonation, WinPEAS, registry abuse',
            xp: 2500,
            phase: 'foundation',
            category: 'system-exploitation',
            order: 17
          },
          {
            id: 'reverse-shells',
            title: 'Reverse Shell Mastery',
            description: 'Bash, Python, PowerShell, PHP shells, shell stabilization, persistence',
            xp: 2000,
            phase: 'foundation',
            category: 'system-exploitation',
            order: 18
          },
          {
            id: 'file-transfers',
            title: 'File Transfer Techniques',
            description: 'HTTP, FTP, SMB, NC, base64, steganography, bypassing restrictions',
            xp: 1500,
            phase: 'foundation',
            category: 'system-exploitation',
            order: 19
          },
          {
            id: 'basic-persistence',
            title: 'Basic Persistence Techniques',
            description: 'Cron jobs, services, registry, startup scripts, SSH keys, scheduled tasks',
            xp: 1800,
            phase: 'foundation',
            category: 'system-exploitation',
            order: 20
          }
        ]
      },
      {
        id: 'essential-tools',
        title: 'Essential Hacking Tools',
        tasks: [
          {
            id: 'reconnaissance-tools',
            title: 'Reconnaissance Arsenal',
            description: 'Subfinder, Amass, Gobuster, FFuF, Dirb, Google dorking, OSINT tools',
            xp: 1800,
            phase: 'foundation',
            category: 'essential-tools',
            order: 21
          },
          {
            id: 'exploitation-frameworks',
            title: 'Exploitation Frameworks',
            description: 'Metasploit, Cobalt Strike basics, Empire, custom payload generation',
            xp: 2200,
            phase: 'foundation',
            category: 'essential-tools',
            order: 22
          },
          {
            id: 'password-cracking',
            title: 'Password Cracking Tools',
            description: 'Hashcat, John the Ripper, Hydra, wordlist creation, rainbow tables',
            xp: 2000,
            phase: 'foundation',
            category: 'essential-tools',
            order: 23
          },
          {
            id: 'custom-tool-development',
            title: 'Custom Tool Development',
            description: 'Python requests, BeautifulSoup, Selenium, API automation, custom scanners',
            xp: 2500,
            phase: 'foundation',
            category: 'essential-tools',
            order: 24
          },
          {
            id: 'documentation-methodology',
            title: 'Documentation & Methodology',
            description: 'Note-taking, screenshot tools, reporting, methodology development',
            xp: 1200,
            phase: 'foundation',
            category: 'essential-tools',
            order: 25
          }
        ]
      },
      {
        id: 'practice-mastery',
        title: 'Practice & Mastery',
        tasks: [
          {
            id: 'vulnerable-machines',
            title: 'Vulnerable Machine Practice',
            description: 'VulnHub, HackTheBox easy boxes, TryHackMe paths, methodology development',
            xp: 3000,
            phase: 'foundation',
            category: 'practice-mastery',
            order: 26
          },
          {
            id: 'web-app-labs',
            title: 'Web Application Labs',
            description: 'DVWA, WebGoat, PortSwigger Academy, OWASP Juice Shop mastery',
            xp: 2500,
            phase: 'foundation',
            category: 'practice-mastery',
            order: 27
          },
          {
            id: 'ctf-participation',
            title: 'CTF Competition Participation',
            description: 'Join CTF teams, solve challenges, learn new techniques, network with community',
            xp: 2000,
            phase: 'foundation',
            category: 'practice-mastery',
            order: 28
          },
          {
            id: 'first-penetration-test',
            title: 'Complete First Penetration Test',
            description: 'End-to-end test on vulnerable environment, full report, methodology',
            xp: 4000,
            phase: 'foundation',
            category: 'practice-mastery',
            order: 29
          },
          {
            id: 'bug-bounty-debut',
            title: 'First Bug Bounty Submission',
            description: 'Find and report first valid vulnerability, even if low severity',
            xp: 3500,
            phase: 'foundation',
            category: 'practice-mastery',
            order: 30
          }
        ]
      }
    ]
  },
  {
    id: 'hacker',
    title: 'Real Hacker Skills',
    description: 'Advanced Techniques, Network Pivoting, and Real-World Scenarios',
    duration: 'Months 7-12',
    categories: [
      {
        id: 'advanced-web-attacks',
        title: 'Advanced Web Attacks',
        tasks: [
          {
            id: 'ssrf-mastery',
            title: 'Server-Side Request Forgery (SSRF)',
            description: 'Basic to blind SSRF, cloud metadata, internal scanning, filter bypasses, SSRF to RCE',
            xp: 3500,
            phase: 'hacker',
            category: 'advanced-web-attacks',
            order: 31
          },
          {
            id: 'xxe-exploitation',
            title: 'XML External Entity (XXE) Attacks',
            description: 'File disclosure, blind XXE, XXE to SSRF, DTD attacks, office document XXE',
            xp: 3800,
            phase: 'hacker',
            category: 'advanced-web-attacks',
            order: 32
          },
          {
            id: 'ssti-exploitation',
            title: 'Server-Side Template Injection',
            description: 'Jinja2, Twig, Freemarker exploitation, sandbox escapes, RCE techniques',
            xp: 4000,
            phase: 'hacker',
            category: 'advanced-web-attacks',
            order: 33
          },
          {
            id: 'deserialization-attacks',
            title: 'Insecure Deserialization',
            description: 'Java, PHP, Python deserialization, gadget chains, RCE exploitation',
            xp: 4500,
            phase: 'hacker',
            category: 'advanced-web-attacks',
            order: 34
          },
          {
            id: 'business-logic-flaws',
            title: 'Business Logic Vulnerabilities',
            description: 'Race conditions, price manipulation, workflow bypasses, payment logic flaws',
            xp: 3800,
            phase: 'hacker',
            category: 'advanced-web-attacks',
            order: 35
          },
          {
            id: 'api-security-advanced',
            title: 'Advanced API Security',
            description: 'GraphQL injection, JWT attacks, OAuth bypasses, API versioning abuse',
            xp: 3500,
            phase: 'hacker',
            category: 'advanced-web-attacks',
            order: 36
          }
        ]
      },
      {
        id: 'network-pivoting',
        title: 'Network Pivoting & Lateral Movement',
        tasks: [
          {
            id: 'ssh-tunneling',
            title: 'SSH Tunneling Mastery',
            description: 'Local, remote, dynamic forwarding, reverse tunnels, SOCKS proxies',
            xp: 3000,
            phase: 'hacker',
            category: 'network-pivoting',
            order: 37
          },
          {
            id: 'chisel-tunneling',
            title: 'Advanced Tunneling with Chisel',
            description: 'HTTP tunneling, reverse connections, multi-hop pivoting, firewall bypass',
            xp: 3200,
            phase: 'hacker',
            category: 'network-pivoting',
            order: 38
          },
          {
            id: 'internal-enumeration',
            title: 'Internal Network Enumeration',
            description: 'ARP scanning, service discovery, credential harvesting, network mapping',
            xp: 2800,
            phase: 'hacker',
            category: 'network-pivoting',
            order: 39
          },
          {
            id: 'credential-reuse',
            title: 'Credential Reuse & Spraying',
            description: 'Password spraying, credential stuffing, hash cracking, lateral movement',
            xp: 3200,
            phase: 'hacker',
            category: 'network-pivoting',
            order: 40
          },
          {
            id: 'double-pivoting',
            title: 'Multi-Hop Network Pivoting',
            description: 'Complex routing, multiple jump hosts, network segmentation bypass',
            xp: 4000,
            phase: 'hacker',
            category: 'network-pivoting',
            order: 41
          }
        ]
      },
      {
        id: 'active-directory',
        title: 'Active Directory Attacks',
        tasks: [
          {
            id: 'ad-enumeration',
            title: 'Active Directory Enumeration',
            description: 'BloodHound, PowerView, LDAP queries, domain mapping, privilege analysis',
            xp: 3500,
            phase: 'hacker',
            category: 'active-directory',
            order: 42
          },
          {
            id: 'kerberos-attacks',
            title: 'Kerberos Attack Techniques',
            description: 'Kerberoasting, ASREPRoasting, Golden tickets, Silver tickets, delegation abuse',
            xp: 4500,
            phase: 'hacker',
            category: 'active-directory',
            order: 43
          },
          {
            id: 'ad-lateral-movement',
            title: 'AD Lateral Movement',
            description: 'PsExec, WMI, PowerShell remoting, pass-the-hash, token manipulation',
            xp: 4000,
            phase: 'hacker',
            category: 'active-directory',
            order: 44
          },
          {
            id: 'mimikatz-mastery',
            title: 'Mimikatz & Credential Dumping',
            description: 'LSASS dumping, DCSync, skeleton key, credential extraction techniques',
            xp: 3800,
            phase: 'hacker',
            category: 'active-directory',
            order: 45
          },
          {
            id: 'ad-persistence',
            title: 'AD Persistence Techniques',
            description: 'Golden tickets, DCShadow, ACL abuse, GPO modification, backdoor accounts',
            xp: 4200,
            phase: 'hacker',
            category: 'active-directory',
            order: 46
          }
        ]
      },
      {
        id: 'physical-attacks',
        title: 'Physical & Hardware Attacks',
        tasks: [
          {
            id: 'usb-attacks',
            title: 'USB Attack Techniques',
            description: 'Rubber Ducky, BadUSB, HID attacks, payload delivery, social engineering',
            xp: 3500,
            phase: 'hacker',
            category: 'physical-attacks',
            order: 47
          },
          {
            id: 'lock-picking',
            title: 'Lock Picking & Physical Security',
            description: 'Pin tumbler locks, bypass tools, bump keys, physical security assessment',
            xp: 2500,
            phase: 'hacker',
            category: 'physical-attacks',
            order: 48
          },
          {
            id: 'rfid-attacks',
            title: 'RFID & Badge Cloning',
            description: 'Proxmark3, card cloning, access control bypass, badge security',
            xp: 3000,
            phase: 'hacker',
            category: 'physical-attacks',
            order: 49
          },
          {
            id: 'hardware-hacking',
            title: 'Hardware Hacking Basics',
            description: 'UART, JTAG, firmware extraction, hardware debugging, PCB analysis',
            xp: 4000,
            phase: 'hacker',
            category: 'physical-attacks',
            order: 50
          },
          {
            id: 'social-engineering',
            title: 'Social Engineering Attacks',
            description: 'Phishing, vishing, pretexting, tailgating, psychological manipulation',
            xp: 3200,
            phase: 'hacker',
            category: 'physical-attacks',
            order: 51
          }
        ]
      },
      {
        id: 'evasion-techniques',
        title: 'Evasion & Stealth',
        tasks: [
          {
            id: 'antivirus-evasion',
            title: 'Antivirus Evasion',
            description: 'Payload encoding, crypters, packers, obfuscation, signature avoidance',
            xp: 4000,
            phase: 'hacker',
            category: 'evasion-techniques',
            order: 52
          },
          {
            id: 'network-evasion',
            title: 'Network Detection Evasion',
            description: 'Traffic obfuscation, domain fronting, protocol tunneling, steganography',
            xp: 3800,
            phase: 'hacker',
            category: 'evasion-techniques',
            order: 53
          },
          {
            id: 'log-evasion',
            title: 'Log Evasion & Anti-Forensics',
            description: 'Log deletion, timestamp manipulation, event log bypass, trace removal',
            xp: 3500,
            phase: 'hacker',
            category: 'evasion-techniques',
            order: 54
          },
          {
            id: 'living-off-land',
            title: 'Living Off The Land',
            description: 'PowerShell, WMI, certutil, legitimate tool abuse, fileless attacks',
            xp: 4200,
            phase: 'hacker',
            category: 'evasion-techniques',
            order: 55
          },
          {
            id: 'opsec-mastery',
            title: 'Operational Security (OPSEC)',
            description: 'Anonymization, VPN chains, Tor usage, digital footprint management',
            xp: 3000,
            phase: 'hacker',
            category: 'evasion-techniques',
            order: 56
          }
        ]
      },
      {
        id: 'automation-development',
        title: 'Automation & Tool Development',
        tasks: [
          {
            id: 'python-exploitation',
            title: 'Python Exploitation Scripts',
            description: 'Custom exploits, automated scanning, API abuse, multi-threading',
            xp: 4000,
            phase: 'hacker',
            category: 'automation-development',
            order: 57
          },
          {
            id: 'bash-automation',
            title: 'Advanced Bash Automation',
            description: 'Automated recon, monitoring scripts, alert systems, report generation',
            xp: 3200,
            phase: 'hacker',
            category: 'automation-development',
            order: 58
          },
          {
            id: 'c2-basics',
            title: 'Command & Control (C2)',
            description: 'Cobalt Strike, Empire, custom C2 channels, beacon communication',
            xp: 5000,
            phase: 'hacker',
            category: 'automation-development',
            order: 59
          },
          {
            id: 'exploit-development',
            title: 'Basic Exploit Development',
            description: 'Buffer overflows, shellcode, ROP chains, exploit reliability',
            xp: 5500,
            phase: 'hacker',
            category: 'automation-development',
            order: 60
          },
          {
            id: 'framework-contribution',
            title: 'Framework & Tool Contribution',
            description: 'Metasploit modules, Burp extensions, open source contributions',
            xp: 4500,
            phase: 'hacker',
            category: 'automation-development',
            order: 61
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Hacker',
    description: 'Complex Attacks, Cloud Security, Mobile Hacking, and Elite Techniques',
    duration: 'Months 13-24',
    categories: [
      {
        id: 'complex-attack-chains',
        title: 'Complex Attack Chains',
        tasks: [
          {
            id: 'web-to-system',
            title: 'Web App to System Compromise',
            description: 'Web shell → privilege escalation → network pivoting → domain admin',
            xp: 6000,
            phase: 'advanced',
            category: 'complex-attack-chains',
            order: 62
          },
          {
            id: 'phishing-to-domain',
            title: 'Phishing to Domain Takeover',
            description: 'Spear phishing → initial access → credential dumping → AD compromise',
            xp: 6500,
            phase: 'advanced',
            category: 'complex-attack-chains',
            order: 63
          },
          {
            id: 'usb-to-persistence',
            title: 'USB Attack to Persistence',
            description: 'Hardware implant → system access → backdoor installation → C2 setup',
            xp: 7000,
            phase: 'advanced',
            category: 'complex-attack-chains',
            order: 64
          },
          {
            id: 'wireless-to-internal',
            title: 'Wireless to Internal Network',
            description: 'WiFi compromise → network access → lateral movement → data exfiltration',
            xp: 6200,
            phase: 'advanced',
            category: 'complex-attack-chains',
            order: 65
          },
          {
            id: 'supply-chain-attack',
            title: 'Supply Chain Attack Simulation',
            description: 'Third-party compromise → software backdoor → widespread deployment',
            xp: 8000,
            phase: 'advanced',
            category: 'complex-attack-chains',
            order: 66
          }
        ]
      },
      {
        id: 'cloud-security',
        title: 'Cloud Platform Hacking',
        tasks: [
          {
            id: 'aws-exploitation',
            title: 'AWS Security Exploitation',
            description: 'S3 buckets, IAM abuse, Lambda functions, EC2 metadata, privilege escalation',
            xp: 5500,
            phase: 'advanced',
            category: 'cloud-security',
            order: 67
          },
          {
            id: 'azure-attacks',
            title: 'Azure Security Testing',
            description: 'Storage accounts, Azure AD, function apps, key vault access, service principals',
            xp: 5500,
            phase: 'advanced',
            category: 'cloud-security',
            order: 68
          },
          {
            id: 'gcp-security',
            title: 'Google Cloud Platform Hacking',
            description: 'GCS buckets, IAM misconfigs, Cloud Functions, metadata exploitation',
            xp: 5500,
            phase: 'advanced',
            category: 'cloud-security',
            order: 69
          },
          {
            id: 'kubernetes-attacks',
            title: 'Kubernetes & Container Security',
            description: 'Pod escapes, RBAC bypass, secrets extraction, cluster compromise',
            xp: 6000,
            phase: 'advanced',
            category: 'cloud-security',
            order: 70
          },
          {
            id: 'serverless-exploitation',
            title: 'Serverless Security Testing',
            description: 'Function injection, cold start attacks, event manipulation, resource abuse',
            xp: 5000,
            phase: 'advanced',
            category: 'cloud-security',
            order: 71
          }
        ]
      },
      {
        id: 'mobile-hacking',
        title: 'Mobile Application Hacking',
        tasks: [
          {
            id: 'android-exploitation',
            title: 'Android Application Hacking',
            description: 'APK analysis, Frida scripting, certificate pinning bypass, root detection',
            xp: 5000,
            phase: 'advanced',
            category: 'mobile-hacking',
            order: 72
          },
          {
            id: 'ios-exploitation',
            title: 'iOS Application Security',
            description: 'IPA analysis, jailbreak techniques, Objection usage, keychain extraction',
            xp: 5500,
            phase: 'advanced',
            category: 'mobile-hacking',
            order: 73
          },
          {
            id: 'mobile-network-attacks',
            title: 'Mobile Network Attacks',
            description: 'IMSI catcher, baseband exploitation, SMS attacks, cellular security',
            xp: 6000,
            phase: 'advanced',
            category: 'mobile-hacking',
            order: 74
          },
          {
            id: 'mobile-malware',
            title: 'Mobile Malware Development',
            description: 'Android/iOS malware, persistence, data exfiltration, C2 communication',
            xp: 6500,
            phase: 'advanced',
            category: 'mobile-hacking',
            order: 75
          },
          {
            id: 'mobile-forensics',
            title: 'Mobile Device Forensics',
            description: 'Data recovery, deleted file analysis, communication logs, location tracking',
            xp: 4500,
            phase: 'advanced',
            category: 'mobile-hacking',
            order: 76
          }
        ]
      },
      {
        id: 'advanced-techniques',
        title: 'Advanced Exploitation Techniques',
        tasks: [
          {
            id: 'binary-exploitation',
            title: 'Binary Exploitation Mastery',
            description: 'Buffer overflows, ROP chains, heap exploitation, format string attacks',
            xp: 8000,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 77
          },
          {
            id: 'cryptographic-attacks',
            title: 'Cryptographic Attacks',
            description: 'Padding oracle, timing attacks, weak random generation, key recovery',
            xp: 7000,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 78
          },
          {
            id: 'reverse-engineering',
            title: 'Advanced Reverse Engineering',
            description: 'IDA Pro, Ghidra, malware analysis, protocol reversal, obfuscation defeat',
            xp: 7500,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 79
          },
          {
            id: 'firmware-analysis',
            title: 'Firmware Analysis & Exploitation',
            description: 'Binwalk, firmware extraction, embedded systems, IoT exploitation',
            xp: 6500,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 80
          },
          {
            id: 'kernel-exploitation',
            title: 'Kernel Exploitation',
            description: 'Windows/Linux kernel bugs, privilege escalation, rootkit development',
            xp: 9000,
            phase: 'advanced',
            category: 'advanced-techniques',
            order: 81
          }
        ]
      },
      {
        id: 'specialized-targets',
        title: 'Specialized Target Types',
        tasks: [
          {
            id: 'iot-exploitation',
            title: 'IoT Device Exploitation',
            description: 'Firmware analysis, UART/JTAG, protocol fuzzing, device compromise',
            xp: 6000,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 82
          },
          {
            id: 'industrial-systems',
            title: 'Industrial Control Systems',
            description: 'SCADA, PLC programming, Modbus, DNP3, industrial network attacks',
            xp: 7000,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 83
          },
          {
            id: 'automotive-hacking',
            title: 'Automotive Security',
            description: 'CAN bus attacks, ECU exploitation, connected car security, OBD-II',
            xp: 7500,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 84
          },
          {
            id: 'blockchain-attacks',
            title: 'Blockchain & Cryptocurrency',
            description: 'Smart contract bugs, wallet attacks, DeFi exploits, consensus attacks',
            xp: 6500,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 85
          },
          {
            id: 'ai-ml-security',
            title: 'AI/ML Security Testing',
            description: 'Model poisoning, adversarial inputs, prompt injection, ML system compromise',
            xp: 6000,
            phase: 'advanced',
            category: 'specialized-targets',
            order: 86
          }
        ]
      },
      {
        id: 'professional-skills',
        title: 'Professional Skills',
        tasks: [
          {
            id: 'red-team-operations',
            title: 'Red Team Operations',
            description: 'Team coordination, long-term campaigns, OPSEC, objective-based testing',
            xp: 8000,
            phase: 'advanced',
            category: 'professional-skills',
            order: 87
          },
          {
            id: 'penetration-testing',
            title: 'Professional Penetration Testing',
            description: 'Methodology, reporting, client communication, scope management',
            xp: 6000,
            phase: 'advanced',
            category: 'professional-skills',
            order: 88
          },
          {
            id: 'vulnerability-research',
            title: 'Vulnerability Research',
            description: 'Zero-day discovery, CVE submission, responsible disclosure, exploit development',
            xp: 9000,
            phase: 'advanced',
            category: 'professional-skills',
            order: 89
          },
          {
            id: 'security-consulting',
            title: 'Security Consulting',
            description: 'Business risk assessment, security architecture review, compliance auditing',
            xp: 7000,
            phase: 'advanced',
            category: 'professional-skills',
            order: 90
          },
          {
            id: 'training-delivery',
            title: 'Security Training & Education',
            description: 'Course development, presentation skills, knowledge transfer, mentoring',
            xp: 6500,
            phase: 'advanced',
            category: 'professional-skills',
            order: 91
          }
        ]
      }
    ]
  },
  {
    id: 'elite',
    title: 'Elite Hacker',
    description: 'Zero-Day Research, Advanced Persistent Threats, and Industry Leadership',
    duration: 'Years 2-5',
    categories: [
      {
        id: 'zero-day-research',
        title: 'Zero-Day Research',
        tasks: [
          {
            id: 'browser-zero-days',
            title: 'Browser Zero-Day Discovery',
            description: 'Chrome, Firefox, Safari vulnerabilities, sandbox escapes, RCE chains',
            xp: 20000,
            phase: 'elite',
            category: 'zero-day-research',
            order: 92
          },
          {
            id: 'os-zero-days',
            title: 'Operating System Zero-Days',
            description: 'Windows, Linux, macOS kernel vulnerabilities, privilege escalation',
            xp: 25000,
            phase: 'elite',
            category: 'zero-day-research',
            order: 93
          },
          {
            id: 'network-protocol-bugs',
            title: 'Network Protocol Vulnerabilities',
            description: 'TCP/IP stack bugs, protocol implementation flaws, network-level attacks',
            xp: 22000,
            phase: 'elite',
            category: 'zero-day-research',
            order: 94
          },
          {
            id: 'hardware-vulnerabilities',
            title: 'Hardware Security Research',
            description: 'CPU vulnerabilities, side-channel attacks, microarchitectural flaws',
            xp: 30000,
            phase: 'elite',
            category: 'zero-day-research',
            order: 95
          },
          {
            id: 'virtualization-escapes',
            title: 'Virtualization Escape Research',
            description: 'VMware, Hyper-V, QEMU escapes, hypervisor vulnerabilities',
            xp: 28000,
            phase: 'elite',
            category: 'zero-day-research',
            order: 96
          }
        ]
      },
      {
        id: 'apt-simulation',
        title: 'Advanced Persistent Threat Simulation',
        tasks: [
          {
            id: 'nation-state-ttps',
            title: 'Nation-State TTPs',
            description: 'APT group techniques, long-term persistence, covert operations',
            xp: 15000,
            phase: 'elite',
            category: 'apt-simulation',
            order: 97
          },
          {
            id: 'supply-chain-compromise',
            title: 'Supply Chain Compromise',
            description: 'Third-party infiltration, software backdoors, trust relationship abuse',
            xp: 18000,
            phase: 'elite',
            category: 'apt-simulation',
            order: 98
          },
          {
            id: 'insider-threat-simulation',
            title: 'Insider Threat Simulation',
            description: 'Malicious insider scenarios, privilege abuse, data exfiltration',
            xp: 16000,
            phase: 'elite',
            category: 'apt-simulation',
            order: 99
          },
          {
            id: 'living-off-land-advanced',
            title: 'Advanced Living Off The Land',
            description: 'Fileless malware, memory-only attacks, legitimate tool abuse',
            xp: 17000,
            phase: 'elite',
            category: 'apt-simulation',
            order: 100
          },
          {
            id: 'multi-stage-campaigns',
            title: 'Multi-Stage Campaign Design',
            description: 'Complex attack orchestration, team coordination, objective achievement',
            xp: 19000,
            phase: 'elite',
            category: 'apt-simulation',
            order: 101
          }
        ]
      },
      {
        id: 'cutting-edge-research',
        title: 'Cutting-Edge Research',
        tasks: [
          {
            id: 'ai-security-research',
            title: 'AI/ML Security Research',
            description: 'Model attacks, adversarial ML, prompt injection, AI system compromise',
            xp: 20000,
            phase: 'elite',
            category: 'cutting-edge-research',
            order: 102
          },
          {
            id: 'quantum-cryptography',
            title: 'Quantum Cryptography & Security',
            description: 'Quantum-resistant algorithms, quantum key distribution, post-quantum crypto',
            xp: 25000,
            phase: 'elite',
            category: 'cutting-edge-research',
            order: 103
          },
          {
            id: 'satellite-security',
            title: 'Satellite & Space Security',
            description: 'Satellite communication, ground station attacks, space-based threats',
            xp: 30000,
            phase: 'elite',
            category: 'cutting-edge-research',
            order: 104
          },
          {
            id: 'biometric-attacks',
            title: 'Biometric Security Research',
            description: 'Fingerprint spoofing, facial recognition bypass, biometric template attacks',
            xp: 22000,
            phase: 'elite',
            category: 'cutting-edge-research',
            order: 105
          },
          {
            id: 'novel-attack-classes',
            title: 'Novel Attack Class Discovery',
            description: 'Pioneering new vulnerability categories, groundbreaking research',
            xp: 35000,
            phase: 'elite',
            category: 'cutting-edge-research',
            order: 106
          }
        ]
      },
      {
        id: 'industry-leadership',
        title: 'Industry Leadership',
        tasks: [
          {
            id: 'conference-speaking',
            title: 'Major Conference Speaking',
            description: 'Black Hat, DEF CON, security conference presentations, research sharing',
            xp: 15000,
            phase: 'elite',
            category: 'industry-leadership',
            order: 107
          },
          {
            id: 'security-tool-creation',
            title: 'Industry-Changing Tool Creation',
            description: 'Develop tools used by thousands, open source contributions',
            xp: 25000,
            phase: 'elite',
            category: 'industry-leadership',
            order: 108
          },
          {
            id: 'academic-collaboration',
            title: 'Academic Research Collaboration',
            description: 'University partnerships, peer-reviewed papers, academic conferences',
            xp: 20000,
            phase: 'elite',
            category: 'industry-leadership',
            order: 109
          },
          {
            id: 'security-company-founding',
            title: 'Security Company Founding',
            description: 'Start successful security consultancy or product company',
            xp: 40000,
            phase: 'elite',
            category: 'industry-leadership',
            order: 110
          },
          {
            id: 'industry-standards',
            title: 'Security Standards Development',
            description: 'Contribute to security standards, protocol development, best practices',
            xp: 30000,
            phase: 'elite',
            category: 'industry-standards',
            order: 111
          }
        ]
      },
      {
        id: 'mentorship-teaching',
        title: 'Mentorship & Teaching',
        tasks: [
          {
            id: 'hacker-mentorship',
            title: 'Mentor 100+ Hackers',
            description: 'Guide new hackers, share knowledge, develop next generation',
            xp: 18000,
            phase: 'elite',
            category: 'mentorship-teaching',
            order: 112
          },
          {
            id: 'training-curriculum',
            title: 'Professional Training Development',
            description: 'Create comprehensive hacking courses, certification programs',
            xp: 22000,
            phase: 'elite',
            category: 'mentorship-teaching',
            order: 113
          },
          {
            id: 'book-authoring',
            title: 'Security Book Publication',
            description: 'Write definitive hacking guides, technical books, knowledge sharing',
            xp: 25000,
            phase: 'elite',
            category: 'mentorship-teaching',
            order: 114
          },
          {
            id: 'youtube-education',
            title: 'Educational Content Creation',
            description: 'YouTube channel, online courses, educational video production',
            xp: 20000,
            phase: 'elite',
            category: 'mentorship-teaching',
            order: 115
          },
          {
            id: 'hacking-bootcamp',
            title: 'Elite Hacking Bootcamp',
            description: 'Create intensive training program, hands-on education',
            xp: 28000,
            phase: 'elite',
            category: 'mentorship-teaching',
            order: 116
          }
        ]
      },
      {
        id: 'financial-success',
        title: 'Financial Milestones',
        tasks: [
          {
            id: 'six-figure-bounties',
            title: 'Six-Figure Bug Bounty',
            description: 'Find single vulnerability worth $100,000+, exceptional impact',
            xp: 30000,
            phase: 'elite',
            category: 'financial-success',
            order: 117
          },
          {
            id: 'million-dollar-hacker',
            title: 'Million Dollar Hacker',
            description: 'Achieve $1,000,000+ in total earnings from hacking activities',
            xp: 50000,
            phase: 'elite',
            category: 'financial-success',
            order: 118
          },
          {
            id: 'security-business-success',
            title: 'Multi-Million Security Business',
            description: 'Build security company worth $10M+, successful exit',
            xp: 80000,
            phase: 'elite',
            category: 'financial-success',
            order: 119
          },
          {
            id: 'passive-income-mastery',
            title: 'Passive Income Mastery',
            description: 'Generate $50k+/month passive income from security activities',
            xp: 60000,
            phase: 'elite',
            category: 'financial-success',
            order: 120
          }
        ]
      }
    ]
  },
  {
    id: 'legendary',
    title: 'Legendary Hacker',
    description: 'Global Impact, Historical Significance, and Immortal Legacy',
    duration: 'Lifetime Achievement',
    categories: [
      {
        id: 'global-impact',
        title: 'Global Security Impact',
        tasks: [
          {
            id: 'internet-scale-vulnerability',
            title: 'Internet-Scale Vulnerability Discovery',
            description: 'Find vulnerability affecting billions of users worldwide',
            xp: 100000,
            phase: 'legendary',
            category: 'global-impact',
            order: 121
          },
          {
            id: 'security-protocol-design',
            title: 'Security Protocol Design',
            description: 'Design widely-adopted security protocol or standard',
            xp: 80000,
            phase: 'legendary',
            category: 'global-impact',
            order: 122
          },
          {
            id: 'government-cybersecurity',
            title: 'National Cybersecurity Leadership',
            description: 'Lead national cybersecurity initiatives, government advisory roles',
            xp: 90000,
            phase: 'legendary',
            category: 'global-impact',
            order: 123
          },
          {
            id: 'cyber-warfare-expertise',
            title: 'Cyber Warfare Expertise',
            description: 'Develop cyber warfare capabilities, nation-state level operations',
            xp: 120000,
            phase: 'legendary',
            category: 'global-impact',
            order: 124
          }
        ]
      },
      {
        id: 'historical-significance',
        title: 'Historical Significance',
        tasks: [
          {
            id: 'paradigm-shift',
            title: 'Security Paradigm Shift',
            description: 'Fundamentally change how security is approached globally',
            xp: 150000,
            phase: 'legendary',
            category: 'historical-significance',
            order: 125
          },
          {
            id: 'legendary-hack',
            title: 'Legendary Hack Achievement',
            description: 'Perform hack that enters cybersecurity folklore',
            xp: 200000,
            phase: 'legendary',
            category: 'historical-significance',
            order: 126
          },
          {
            id: 'cybersecurity-revolution',
            title: 'Cybersecurity Revolution',
            description: 'Lead revolution in cybersecurity practices, global adoption',
            xp: 180000,
            phase: 'legendary',
            category: 'historical-significance',
            order: 127
          },
          {
            id: 'documentary-subject',
            title: 'Documentary Subject',
            description: 'Be subject of major cybersecurity documentary or film',
            xp: 100000,
            phase: 'legendary',
            category: 'historical-significance',
            order: 128
          }
        ]
      },
      {
        id: 'immortal-legacy',
        title: 'Immortal Legacy',
        tasks: [
          {
            id: 'hacker-hall-of-fame',
            title: 'Hacker Hall of Fame',
            description: 'Inducted into cybersecurity hall of fame, lifetime achievement',
            xp: 300000,
            phase: 'legendary',
            category: 'immortal-legacy',
            order: 129
          },
          {
            id: 'educational-institution',
            title: 'Cybersecurity Institution Founding',
            description: 'Found cybersecurity university, research institute, lasting education',
            xp: 250000,
            phase: 'legendary',
            category: 'immortal-legacy',
            order: 130
          },
          {
            id: 'billion-user-impact',
            title: 'Billion User Security Impact',
            description: 'Directly improve security for 1+ billion users worldwide',
            xp: 400000,
            phase: 'legendary',
            category: 'immortal-legacy',
            order: 131
          },
          {
            id: 'cybersecurity-Nobel',
            title: 'Highest Security Honor',
            description: 'Receive highest possible recognition for cybersecurity contributions',
            xp: 500000,
            phase: 'legendary',
            category: 'immortal-legacy',
            order: 132
          }
        ]
      },
      {
        id: 'ultimate-mastery',
        title: 'Ultimate Mastery',
        tasks: [
          {
            id: 'omniscient-hacker',
            title: 'Omniscient Hacker',
            description: 'Master every domain of cybersecurity, complete knowledge',
            xp: 200000,
            phase: 'legendary',
            category: 'ultimate-mastery',
            order: 133
          },
          {
            id: 'cyber-defense-revolution',
            title: 'Cyber Defense Revolution',
            description: 'Revolutionize cybersecurity defense, end era of vulnerabilities',
            xp: 300000,
            phase: 'legendary',
            category: 'ultimate-mastery',
            order: 134
          },
          {
            id: 'hacker-god-status',
            title: 'Hacker God Status',
            description: 'Achieve mythical status in hacking community, ultimate recognition',
            xp: 1000000,
            phase: 'legendary',
            category: 'ultimate-mastery',
            order: 135
          }
        ]
      }
    ]
  }
];