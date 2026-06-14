# Hosting Control Panel Parity Review

Date: 2026-06-13

This review tracks the rebuilt `/panel_cp` against the latest Classic ASP sources under `/Users/erwinyu/Downloads/hosting/`, with `/Users/erwinyu/Downloads/cp8` used only as fallback when the exact latest file is not present.

## Review Rule

- Use the exact Classic ASP file referenced by each feature.
- Ignore disabled branches inside `if 1 = 2 then ... end if`.
- Do not include features that are not present in the active ASP pages.
- Do not mutate existing customer sites, databases, email, FTP, DNS, CDN, SSL, or domains.
- Use new disposable `codex-test-*` data only for live write tests.

## Live `openreward` Smoke Tests

Session: `openreward`, hosting plan `openreward-001`, `cpId=10373089`, server `WIN8146`.

| Area | Endpoint / action | Result |
|---|---|---|
| Login | `POST /api/auth/login` with `openreward` and empty password | Passed |
| Hosting dashboard | `GET /api/hosting/dashboard?cpId=10373089` | Passed |
| Websites | `GET /api/hosting/sites?cpId=10373089` | Passed, 45 sites |
| Databases | `GET /api/hosting/databases?cpId=10373089` | Passed, 23 databases |
| Deleted databases | `GET /api/hosting/databases/deleted?cpId=10373089` | Passed |
| Database backup schedules | `GET /api/hosting/databases/backup-schedules?cpId=10373089` | Passed |
| MSSQL reporting users | `GET /api/hosting/databases/mssql-report-users?cpId=10373089` | Passed |
| Email domains | `GET /api/hosting/emails?cpId=10373089` | Passed, 5 domains |
| FTP users | `GET /api/hosting/ftp?cpId=10373089` | Passed, 12 users |
| File manager agent health | `GET /api/hosting/files/agent-health?cpId=10373089` | Passed |
| File manager browse | `GET /api/hosting/files/browse?cpId=10373089&path=/www` | Passed; `/www` maps to `h:\root\home\openreward-001\www` |
| Runtime | `GET /api/hosting/runtime?cpId=10373089` | Passed |
| Security | `GET /api/hosting/security?cpId=10373089` | Passed |
| Activity | `GET /api/hosting/activity?cpId=10373089` | Passed |
| Apps | `GET /api/hosting/apps?cpId=10373089` | Passed |
| App requirements | `GET /api/hosting/apps/14/requirements?cpId=10373089` | Passed for real plugin `WordPress` |
| App install preview | `POST /api/hosting/apps/install-preview` | Passed with owned site/database; no writes performed |

## Website More Functions Read Sweep

Test site: `agapepapa`, `siteUid=788042`.

All 30 function detail endpoints returned `200 OK`:

`site-name`, `mapped-path`, `aspnet-version`, `core-mode`, `nodejs-app`, `php-version`, `php-settings`, `detail-error`, `site-on-off`, `delete-website`, `domain-manager`, `visitor-stats`, `ftp-access`, `vs-webdeploy`, `github-deploy`, `smtp-sample-code`, `ip-deny`, `iis-log-manager`, `application-pool`, `outgoing-port`, `create-net-app`, `virtual-dir`, `force-https`, `default-doc`, `custom-errors`, `mime-type`, `script-map`, `remote-iis-manager`, `site-guard`, `schedule-tasks`.

## File Manager Live Write Test

Disposable test data only:

- Created `codex-test-*` folders under `openreward-001\www`.
- Created a disposable `codex-test-*.txt` file.
- Copied the file between disposable folders through `/new/fileManagerAction.asp`.
- Moved the file back through `/new/fileManagerAction.asp`.
- Deleted all disposable files and folders.

Path boundary tests returned `400` before reaching the remote agent:

- `h:\root\home`
- `..\`
- `/www/../`
- `/www/../../`

## Fixes From This Review

- Fixed ASP.NET file-manager path normalization so `/www` is treated as the hosting root alias instead of becoming `...\www\www`.
- Forwarded optional `targetName` for file-manager copy/move operations.
- Updated `legacy-agents/fileManagerAction.asp` so copy/move can optionally use `targetName` after upload, while preserving account-folder path checks.
- Updated `docs/REBUILD_BLOCKERS.md` to mark file-manager copy/move live-tested and leave only unzip awaiting a disposable valid zip test artifact.
- Removed the fake fallback Apps catalog. `/panel_cp` now shows real `plugins.dbo.plugins` rows only; if the plugin DB is unavailable or empty, the panel does not invent app entries.
- Verified Apps requirements and no-write install preview against real plugin metadata from the legacy installer tables.
- Raised the responsive sidebar collapse breakpoint and verified in the in-app browser at a small viewport that `/panel_cp` uses a hamburger drawer with a single-column menu instead of wrapping the sidebar.

## Remaining Blockers

The detailed blocker list remains in `docs/REBUILD_BLOCKERS.md`. Current high-priority blockers for `/panel_cp` are:

1. File manager unzip needs a disposable valid zip inside the customer-owned folder, or the exact zip worker flow completed first.
2. FTP create/password updates now use the standalone Classic ASP `encryptpwd` and `encryptFTPpwd` bridge; remaining FTP edits are limited to the active ASP DB-only paths.
3. WebDeploy / Remote IIS enable-disable needs the exact current active password-source helper because latest `getCpPasswordHashByCpID` keeps its DB lookup inside `if 1 = 2`; `decryptpwd` itself is now bridge-backed.
4. Domain Manager writes need the full Classic ASP side-effect chain for IIS, DNS, first-domain updates, free SSL cleanup, and mail cleanup.
5. Scheduled Tasks need the exact `scheduletask` connection string.
6. CDN and outgoing-port writes need confirmed shared gateway access and disposable non-temp domain targets.
7. Email write tests need disposable email domains/mailboxes.
8. Database delete and full create/delete tests need disposable `codex-test` database rows only.
9. Apps install needs end-to-end port of `plugin_process_3_action.asp` and disposable site/database/file targets.
