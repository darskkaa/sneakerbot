# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in SneakerBot, please report it responsibly by emailing security@example.com instead of using the public issue tracker. This helps us address the vulnerability before it becomes public knowledge.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.9.x   | ✅ Yes             |
| < 0.9   | ❌ No              |

## Security Best Practices

When using SneakerBot:

1. **Keep Dependencies Updated**: Regularly update Node.js, npm packages, and Electron
2. **Secure API Keys**: Never commit Supabase keys or sensitive credentials
3. **Use Environment Variables**: Store all secrets in `.env` files (not in version control)
4. **Encryption**: All payment profiles are encrypted with AES-256-GCM
5. **Proxy Security**: Use trusted proxy providers only

## Vulnerability Disclosure Timeline

1. **Report**: Send security vulnerability report
2. **Acknowledgment**: We will acknowledge receipt within 48 hours
3. **Investigation**: We will investigate and determine severity
4. **Fix**: We will prepare and test a fix
5. **Release**: We will release a patched version
6. **Disclosure**: Vulnerability will be disclosed after patch release

## Security Features

- **End-to-End Encryption**: Sensitive payment data is encrypted locally
- **CAPTCHA Support**: Multiple CAPTCHA solving services for verification
- **Proxy Rotation**: Health-checked proxy rotation prevents IP blocking
- **Row-Level Security**: Supabase RLS policies protect user data
- **No Plain-Text Passwords**: All passwords stored securely
