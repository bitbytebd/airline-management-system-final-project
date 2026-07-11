# Security Policy

## Secrets

Do not commit database passwords, JWT secrets, email credentials, SMS provider tokens, payment gateway credentials, API keys, private certificates, access tokens, or personal production data.

Use environment variables and local-only configuration files. Start from:

- `.env.example`
- `backend/airline/src/main/resources/application.properties.example`
- `frontend/aircrat-management1/environment.example.ts`

## Reporting

If you find a vulnerability in this academic/portfolio project, report it privately to the project owner with:

- A short description of the issue
- Affected file or feature
- Steps to reproduce
- Suggested remediation, if known

## Demo Integrations

Payment, OTP, email, SMS, and tracking flows should be treated as demo or configurable integrations unless real production providers are deliberately configured outside version control.
