# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in SneakerBot, please report it by opening a GitHub issue with the label `security` or emailing the maintainer directly. Do not disclose vulnerabilities publicly until they have been addressed.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.9.x   | Yes                |
| < 0.9   | No                 |

## Vulnerability Disclosure Timeline

1. Report received — acknowledged within 48 hours
2. Issue investigated and severity assessed
3. Fix developed and tested
4. Patched version released
5. Vulnerability publicly disclosed after patch

## Security Features

- AES-256-GCM encryption for all stored payment profiles
- Supabase Row-Level Security (RLS) on all database tables
- Environment variables for all secrets — never committed to source
- Proxy rotation to prevent IP-based tracking
