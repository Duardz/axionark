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
    title: 'Beginner Phase',
    description: 'Learning the Basics and Finding First Bugs',
    duration: 'Months 1-6',
    categories: [
      {
        id: 'foundations',
        title: 'Foundations',
        tasks: [
          {
            id: 'web-basics',
            title: 'Web Basics',
            description: 'Learn HTTP/HTTPS, URLs, Browser DevTools, HTML, Cookies & Sessions',
            xp: 50,
            phase: 'beginner',
            category: 'foundations',
            order: 1
          },
          {
            id: 'security-intro',
            title: 'Introduction to Security',
            description: 'Understand vulnerabilities, OWASP Top 10, Security mindset, Impact vs Severity',
            xp: 50,
            phase: 'beginner',
            category: 'foundations',
            order: 2
          },
          {
            id: 'tools-setup',
            title: 'Tools Setup',
            description: 'Install Burp Suite Community, Configure browsers, Set up note-taking',
            xp: 30,
            phase: 'beginner',
            category: 'foundations',
            order: 3
          }
        ]
      },
      {
        id: 'practice-platforms',
        title: 'Practice Platforms',
        tasks: [
          {
            id: 'portswigger-academy',
            title: 'PortSwigger Web Security Academy',
            description: 'Complete Server-side topics basics and Apprentice level labs',
            xp: 100,
            phase: 'beginner',
            category: 'practice-platforms',
            order: 4
          },
          {
            id: 'juice-shop',
            title: 'OWASP Juice Shop',
            description: 'Install locally and find 10 vulnerabilities',
            xp: 80,
            phase: 'beginner',
            category: 'practice-platforms',
            order: 5
          },
          {
            id: 'pentesterlab-free',
            title: 'PentesterLab Free Exercises',
            description: 'Complete introduction and basic web exercises',
            xp: 60,
            phase: 'beginner',
            category: 'practice-platforms',
            order: 6
          }
        ]
      },
      {
        id: 'core-vulnerabilities',
        title: 'Core Vulnerabilities',
        tasks: [
          {
            id: 'idor',
            title: 'IDOR (Insecure Direct Object Reference)',
            description: 'Master identifying ID parameters, testing authorization, privilege escalation',
            xp: 100,
            phase: 'beginner',
            category: 'core-vulnerabilities',
            order: 7
          },
          {
            id: 'info-disclosure',
            title: 'Information Disclosure',
            description: 'Find exposed directories, backup files, config files, API keys',
            xp: 80,
            phase: 'beginner',
            category: 'core-vulnerabilities',
            order: 8
          },
          {
            id: 'basic-xss',
            title: 'Basic XSS',
            description: 'Master basic payloads and test in search boxes, comments, profiles',
            xp: 100,
            phase: 'beginner',
            category: 'core-vulnerabilities',
            order: 9
          },
          {
            id: 'business-logic',
            title: 'Business Logic Flaws',
            description: 'Find pricing bugs, transfer issues, restriction bypasses',
            xp: 120,
            phase: 'beginner',
            category: 'core-vulnerabilities',
            order: 10
          },
          {
            id: 'auth-issues',
            title: 'Authentication Issues',
            description: 'Test password reset, user enumeration, session issues, rate limiting',
            xp: 100,
            phase: 'beginner',
            category: 'core-vulnerabilities',
            order: 11
          }
        ]
      },
      {
        id: 'first-hunting',
        title: 'First Real Hunting',
        tasks: [
          {
            id: 'choose-vdp',
            title: 'Choose VDP Programs',
            description: 'Select and join vulnerability disclosure programs',
            xp: 30,
            phase: 'beginner',
            category: 'first-hunting',
            order: 12
          },
          {
            id: 'first-report',
            title: 'Submit First Report',
            description: 'Submit your first vulnerability report (even if duplicate)',
            xp: 150,
            phase: 'beginner',
            category: 'first-hunting',
            order: 13
          },
          {
            id: 'first-valid',
            title: 'First Valid Bug',
            description: 'Get your first valid/accepted vulnerability',
            xp: 300,
            phase: 'beginner',
            category: 'first-hunting',
            order: 14
          },
          {
            id: 'first-bounty',
            title: 'First $100',
            description: 'Earn your first $100 from bug bounty',
            xp: 500,
            phase: 'beginner',
            category: 'first-hunting',
            order: 15
          }
        ]
      }
    ]
  },
  {
    id: 'intermediate',
    title: 'Intermediate Phase',
    description: 'Developing Skills and Consistent Earnings',
    duration: 'Months 7-18',
    categories: [
      {
        id: 'programming',
        title: 'Programming Skills',
        tasks: [
          {
            id: 'python-basics',
            title: 'Python for Automation',
            description: 'Learn Python scripting for bug hunting automation',
            xp: 150,
            phase: 'intermediate',
            category: 'programming',
            order: 16
          },
          {
            id: 'javascript-xss',
            title: 'JavaScript for XSS',
            description: 'Master JavaScript for advanced XSS exploitation',
            xp: 150,
            phase: 'intermediate',
            category: 'programming',
            order: 17
          },
          {
            id: 'bash-efficiency',
            title: 'Bash Scripting',
            description: 'Learn bash for recon and automation',
            xp: 100,
            phase: 'intermediate',
            category: 'programming',
            order: 18
          }
        ]
      },
      {
        id: 'advanced-vulns',
        title: 'Advanced Vulnerabilities',
        tasks: [
          {
            id: 'sql-injection',
            title: 'SQL Injection',
            description: 'Master manual and automated SQL injection techniques',
            xp: 200,
            phase: 'intermediate',
            category: 'advanced-vulns',
            order: 19
          },
          {
            id: 'ssrf',
            title: 'SSRF (Server-Side Request Forgery)',
            description: 'Find and exploit SSRF vulnerabilities',
            xp: 200,
            phase: 'intermediate',
            category: 'advanced-vulns',
            order: 20
          },
          {
            id: 'xxe',
            title: 'XXE (XML External Entity)',
            description: 'Understand and exploit XXE vulnerabilities',
            xp: 180,
            phase: 'intermediate',
            category: 'advanced-vulns',
            order: 21
          },
          {
            id: 'advanced-auth',
            title: 'Advanced Authentication',
            description: 'JWT, OAuth, SAML attacks, 2FA bypasses',
            xp: 250,
            phase: 'intermediate',
            category: 'advanced-vulns',
            order: 22
          }
        ]
      },
      {
        id: 'automation',
        title: 'Automation & Tools',
        tasks: [
          {
            id: 'recon-automation',
            title: 'Reconnaissance Automation',
            description: 'Build automated recon workflows',
            xp: 200,
            phase: 'intermediate',
            category: 'automation',
            order: 23
          },
          {
            id: 'burp-mastery',
            title: 'Burp Suite Mastery',
            description: 'Master extensions, macros, and advanced features',
            xp: 150,
            phase: 'intermediate',
            category: 'automation',
            order: 24
          },
          {
            id: 'custom-tools',
            title: 'Build Custom Tools',
            description: 'Create your own bug hunting tools',
            xp: 300,
            phase: 'intermediate',
            category: 'automation',
            order: 25
          }
        ]
      },
      {
        id: 'specialization',
        title: 'Choose Specialization',
        tasks: [
          {
            id: 'api-security',
            title: 'API Security Specialist',
            description: 'Master REST, GraphQL, and API testing',
            xp: 300,
            phase: 'intermediate',
            category: 'specialization',
            order: 26
          },
          {
            id: 'mobile-security',
            title: 'Mobile App Security',
            description: 'Learn Android/iOS app analysis',
            xp: 300,
            phase: 'intermediate',
            category: 'specialization',
            order: 27
          },
          {
            id: 'cloud-security',
            title: 'Cloud Security',
            description: 'AWS, Azure, GCP misconfigurations',
            xp: 300,
            phase: 'intermediate',
            category: 'specialization',
            order: 28
          }
        ]
      },
      {
        id: 'consistency',
        title: 'Professional Growth',
        tasks: [
          {
            id: 'thousand-month',
            title: 'Earn $1000/month',
            description: 'Achieve consistent $1000 monthly earnings',
            xp: 500,
            phase: 'intermediate',
            category: 'consistency',
            order: 29
          },
          {
            id: 'critical-vuln',
            title: 'Find Critical Vulnerability',
            description: 'Discover and report a critical severity bug',
            xp: 800,
            phase: 'intermediate',
            category: 'consistency',
            order: 30
          },
          {
            id: 'private-invite',
            title: 'Private Program Invite',
            description: 'Get invited to a private bug bounty program',
            xp: 600,
            phase: 'intermediate',
            category: 'consistency',
            order: 31
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Phase',
    description: 'Elite Hunter: Specialization and High-Value Bugs',
    duration: 'Months 19-24+',
    categories: [
      {
        id: 'elite-techniques',
        title: 'Elite Techniques',
        tasks: [
          {
            id: 'vuln-chains',
            title: 'Complex Vulnerability Chains',
            description: 'Chain multiple vulnerabilities for maximum impact',
            xp: 500,
            phase: 'advanced',
            category: 'elite-techniques',
            order: 32
          },
          {
            id: 'filter-bypass',
            title: 'Advanced Filter Bypass',
            description: 'Master WAF and filter bypass techniques',
            xp: 400,
            phase: 'advanced',
            category: 'elite-techniques',
            order: 33
          },
          {
            id: 'deserialization',
            title: 'Deserialization Attacks',
            description: 'Exploit deserialization vulnerabilities',
            xp: 600,
            phase: 'advanced',
            category: 'elite-techniques',
            order: 34
          },
          {
            id: 'advanced-ssrf',
            title: 'Advanced SSRF Techniques',
            description: 'DNS rebinding, protocol smuggling, cloud metadata',
            xp: 500,
            phase: 'advanced',
            category: 'elite-techniques',
            order: 35
          }
        ]
      },
      {
        id: 'research',
        title: 'Research & Innovation',
        tasks: [
          {
            id: 'vuln-research',
            title: 'Vulnerability Research',
            description: 'Discover new bug classes and techniques',
            xp: 1000,
            phase: 'advanced',
            category: 'research',
            order: 36
          },
          {
            id: 'tool-development',
            title: 'Advanced Tool Development',
            description: 'Create and release popular security tools',
            xp: 800,
            phase: 'advanced',
            category: 'research',
            order: 37
          },
          {
            id: 'community-contrib',
            title: 'Community Leadership',
            description: 'Blog posts, talks, mentoring, tool releases',
            xp: 600,
            phase: 'advanced',
            category: 'research',
            order: 38
          }
        ]
      },
      {
        id: 'business',
        title: 'Business Development',
        tasks: [
          {
            id: 'consulting',
            title: 'Security Consulting',
            description: 'Start offering consulting services',
            xp: 800,
            phase: 'advanced',
            category: 'business',
            order: 39
          },
          {
            id: 'brand-building',
            title: 'Build Personal Brand',
            description: 'Establish presence on social media and conferences',
            xp: 600,
            phase: 'advanced',
            category: 'business',
            order: 40
          },
          {
            id: 'ten-k-month',
            title: 'Earn $10,000/month',
            description: 'Achieve $10,000 monthly earnings',
            xp: 2000,
            phase: 'advanced',
            category: 'business',
            order: 41
          }
        ]
      },
      {
        id: 'mastery',
        title: 'Elite Status',
        tasks: [
          {
            id: 'zero-day',
            title: 'Find 0-day Vulnerability',
            description: 'Discover a zero-day vulnerability',
            xp: 3000,
            phase: 'advanced',
            category: 'mastery',
            order: 42
          },
          {
            id: 'hall-fame',
            title: 'Hall of Fame Recognition',
            description: 'Achieve hall of fame status in major programs',
            xp: 1500,
            phase: 'advanced',
            category: 'mastery',
            order: 43
          },
          {
            id: 'conference-speaker',
            title: 'Major Conference Speaker',
            description: 'Speak at a major security conference',
            xp: 2000,
            phase: 'advanced',
            category: 'mastery',
            order: 44
          },
          {
            id: 'recognized-expert',
            title: 'Industry Recognition',
            description: 'Become a recognized expert in the field',
            xp: 5000,
            phase: 'advanced',
            category: 'mastery',
            order: 45
          }
        ]
      }
    ]
  }
];