# Environment And Secrets

All local secrets should live in one file:

- `/Users/erwinyu/codex/Smarterasp-CP/.env`

The file is ignored by git. Use this tracked template:

- `/Users/erwinyu/codex/Smarterasp-CP/.env.example`

## Setup

```bash
cp .env.example .env
```

Then fill in the real values in `.env`.

## Loaded At Startup

`Program.cs` loads `.env` before ASP.NET starts, so existing app code can keep using:

- `Environment.GetEnvironmentVariable(...)`
- `IConfiguration`

Blank values in `appsettings.json` no longer block `.env` values for the main secret-backed settings.

`controlpanel.csproj` copies `.env` into build/publish output when the local file exists. The file remains ignored by git.

For secret-backed settings, `.env` / process environment is preferred over `appsettings.json` and .NET user-secrets. User-secrets can still act as a local fallback, but new secrets should be managed in `.env`.

## Current Variables

- `EHB_CONFIG_CONNECTION_STRING`
- `OPENSRS_API_URL`
- `OPENSRS_USERNAME`
- `OPENSRS_PRIVATE_KEY`
- `LEGACY_SERVER_DOMAIN_NAME`
- `LEGACY_AGENT_SCHEME`
- `LEGACY_AGENT_PORT`
- `LEGACY_PUBLIC_DOMAIN`
- `HOSTING_DEFAULT_SHARED_IP`
- `HOSTING_DEFAULT_DNS_SERVERS`
- `HOSTING_TEMP_DOMAIN_PATTERNS`
- `HOSTING_HOME_ROOT`
- `LEGACY_MAIL_API_BASE_URL`
- `LEGACY_MAIL_DEFAULT_SERVER`
- `LEGACY_SHARED_API_HOST`
- `LEGACY_SHARED_API_SCHEME`
- `LEGACY_SHARED_API_PORT`
- `CONTROL_PANEL_CRYPTO_KEY`
- `PBKDF2_COMPATIBILITY_SALT`
- `EMAIL_VERIFY_SALT`
- `LEGACY_IMPORTKEY8`
- `LEGACY_FTP_PWD_KEY`
- `LEGACY_DB_PWD_KEY`
- `LEGACY_SERVER_PWD_KEY`
- `LEGACY_CP_PWD_KEY`

Do not commit `.env` or paste its raw values into docs.
