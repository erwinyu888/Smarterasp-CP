# Legacy Source Audit

Audit date: 2026-06-12

## Source Order

Use this source order for all account panel and hosting control panel rebuild work:

1. `/Users/erwinyu/Downloads/hosting/cp8`
2. `/Users/erwinyu/Downloads/hosting/includes`
3. `/Users/erwinyu/Downloads/hosting/ehbdata`
4. `/Users/erwinyu/Downloads/hosting/ehbkey`
5. `/Users/erwinyu/Downloads/hosting/CP` for web-service/admin references only
6. `/Users/erwinyu/Downloads/cp8` for historical comparison only, not as a substitute for missing referenced files

Do not use folders whose names contain `nouse` or `no_use`.

Exact-reference rule:

- Rebuild each feature from the exact Classic ASP page, include, form action, script, and service files referenced by that feature.
- Ignore code inside `if 1 = 2 then ... end if` blocks because the latest ASP uses that pattern for intentionally disabled legacy behavior.
- If a referenced file is missing, stop that feature immediately, record the missing dependency in `docs/REBUILD_BLOCKERS.md`, and continue with another feature.
- Do not use a similar file from another directory or the older fallback tree unless the exact latest source file references it.

## Tree Summary

- New archive root: `/Users/erwinyu/Downloads/hosting`
- New archive ASP/INC/HTML-style files, excluding `nouse/no_use`: 2,084 source-like files
- Focused account/control-panel files under `/Users/erwinyu/Downloads/hosting/cp8` and `/Users/erwinyu/Downloads/hosting/CP`: 979 source-like files
- Older historical tree: `/Users/erwinyu/Downloads/cp8`

The latest user-facing account panel and hosting control panel files are in `/Users/erwinyu/Downloads/hosting/cp8`. The sibling `/Users/erwinyu/Downloads/hosting/CP` folder is smaller and mostly contains web services, admin/support pages, and older/default shell files.

## Missing Reference Scan

Static scan scope:

- Include directives: `<!--#include virtual=... -->`, `<!--#include file=... -->`
- Obvious static `href`, `action`, `src`, and `data-remote` ASP/INC/HTML/JS references
- Virtual root candidates: `/Users/erwinyu/Downloads/hosting/CP`, `/Users/erwinyu/Downloads/hosting/cp8`, `/Users/erwinyu/Downloads/hosting/AP`, and `/Users/erwinyu/Downloads/hosting`

Broad scan result:

- References scanned: 5,871
- Resolved in new archive: 2,786
- Resolved only by older historical tree: 2 references, 1 unique file
- Unresolved unique references: 762

Focused account/control-panel scan result:

- References scanned: 1,567
- Previously missing but now supplied:
  - `/Users/erwinyu/Downloads/hosting/cp8/cp/sqluserfunc.js`, referenced by `mssql_user_create.asp` and `mysql_user_create.asp`
- Older historical-tree hits:
  - Several old static JS assets from `/js` and `/cp/newfileman/treeview1`
- Common unresolved references are mostly static assets, payment fragments, generated web-service sample pages, old metronic/demo links, or dynamic ASP expressions that a static scanner cannot resolve.

Functionally important missing or historical-tree candidates to keep on the rebuild radar:

| Reference | Status | Notes |
|---|---|---|
| `/includes/FormModalIframe.asp` | unresolved in focused scan | Used by SQL restore/run modal fragments. Rebuild should replace this with React drawers. |
| `addon_purchase_action.asp` | unresolved as relative static ref in some special add-on pages | Latest pages post to both `addon_purchase_action.asp` and `addon_purchase_action`; implementation should verify the action handler in the latest account folder before completing Add-On purchase flow. |
| `authorizenet_include*.asp`, `authorizenetJS*.asp`, `paypalfunctions.asp` | unresolved in focused scan | Payment-provider fragments; do not block panel inventory, but checkout parity needs these or modern replacements. |
| `CountryList*.txt` | unresolved in focused scan | Used by old checkout/SSL country forms. |
| `../../ehbdata/conn.asp`, `../../ehbdata/key`, `../../ehbkey/key.asp` | path-resolution artifacts | Equivalent files exist in `/Users/erwinyu/Downloads/hosting/ehbdata` and `/Users/erwinyu/Downloads/hosting/ehbkey`; do not commit raw secret files. |

## Built Function Compatibility Check

Intentional skips are tracked in `docs/SKIPPED_LEGACY_FUNCTIONS.md`. Do not count those legacy screens as rebuild gaps unless the skip decision changes.

### Login And Account Basics

Latest account code still relies on session login and `GetCredit(session("customerID"))` / `session("balance")` for account balance. The rebuild uses typed session cookies and reads balance from the account billing API. This is behavior-compatible at the UI level and safer than copying raw session globals.

### Database Inventory And Worker Actions

Latest sources checked:

- `/Users/erwinyu/Downloads/hosting/cp8/cp/database_custombackup_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/cp/database_custombackup.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/cp/mssql_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/cp/mysql_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/cp/mssql_runsql.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/fn_db.inc`

Rebuild status:

- `GET /api/hosting/databases` reads real MSSQL/MySQL inventory.
- `GET /api/hosting/databases/deleted` reads the seven-day deleted database recovery window.
- `GET /api/hosting/databases/{engine}/{id}/connection-string` returns masked templates.
- Backup/restore/run-SQL endpoints insert legacy-compatible `workqueue` rows.
- Automated backup schedules now match latest quota behavior: `AdditionalDBBackupQuota - COUNT(customDBBackup)` must be positive before enabling.
- The rebuild is schema-aware for `customDBBackup.backupkept` and `customDBBackup.isenable` because the live database currently lacks at least `backupkept`, even though latest ASP references it.

Intentional modernization:

- The old ASP allows some sanitized relative paths and then constructs UNC paths. The rebuild keeps ownership and extension checks stricter before queueing.
- Passwords are not exposed in connection strings.

Remaining gaps:

- Create/delete database still needs full database-server row-write compatibility after legacy password encryption is mapped.
- MSSQL report users are documented but not fully rebuilt.

### FTP Users

Latest sources checked:

- `/Users/erwinyu/Downloads/hosting/cp8/cp/ftp_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/fn_ftp.inc`

Compatibility updates made:

- FTP user creation now follows the active latest `createFTPSingle(...)` behavior in `functions.inc`: write encrypted password data into `cp_config_FTP`, then return `ok`.
- `/ftp_api.asp` calls for FTP create/edit/enable/delete are inside `if 1 = 2 then ... end if` blocks in the latest source and are intentionally ignored.
- Additional FTP user creation now normalizes new FTP logins like latest `ftp_action.asp`: `.` becomes `_`, and `-0` becomes `_0`.
- Additional FTP user creation now uses rebuilt `getDiskQuota(cpID)` behavior for local `cp_config_FTP.ftp_quota`: `additionalDiskQuota + product_config.webspace`, with the same 100 MB default when no CP row/plan quota is found.
- Password update follows the active DB-only `updateFtpUserPassword(...)` path, but must wait for exact Persits-compatible `encryptpwd` and `encryptFTPpwd` output.
- Path/quota/permission update, enable/disable, and permission reset are not enabled because their implementation is inside disabled `if 1 = 2` blocks.
- Delete follows active `deleteFTP(...)` behavior and removes the `cp_config_FTP` row.
- Root FTP user deletion remains blocked.

Remaining parity notes:

- FTP create/password update still needs an exact modern mapping for Persits `CryptoManager` encryption before writing `cp_config_FTP.ftp_password` and `pp1`.

### Website More Functions

Latest source checked:

### Email Domains

Latest sources checked:

- `/Users/erwinyu/Downloads/hosting/cp8/cp/email_action_vps.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/fn_email.inc`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/smartermailapi.inc`

Compatibility updates made:

- Hosted email inventory reads `cp_config_EmailDomains`; corporate email inventory reads `cp_config_CorpEmailDomains`.
- Postmaster password reset now maps to active `email_action_vps.asp` case `resetpwd` and `functions.inc:set_mail_pwd_rpc(...)`.
- Hosted email quota update now maps to active `email_action_vps.asp` case `resetspace`, `UpdateAdditionalEmailSpace(...)`, and `SetEmailDomainSpaceQuota_rpc(...)`.
- Hosted email delete now maps to active `delete_mail_by_domainName(...)`, `delete_mail_rpc(...)`, and `delete_mail_record_db(...)`.
- Each mutation verifies the email domain belongs to the selected `cpID` before calling the legacy SmarterMail gateway.

Remaining parity notes:

- Live email mutations require `LegacyMail:ApiBaseUrl` / `LEGACY_MAIL_API_BASE_URL`. Current local config is intentionally blank, so write tests stop before external side effects.
- Corporate email write actions still need the exact `corp_email.inc` flow ported separately.
- Mailbox, alias, forwarding, DKIM, and daily-send-limit actions are still inventory/scaffold until their exact ASP actions are fully mapped.

### DNS / CDN / SSL

Latest sources checked:

- `/Users/erwinyu/Downloads/hosting/cp8/cp/dns/dns_action.asp`
- `/Users/erwinyu/Downloads/hosting/includes/sdnsfunctions.inc`
- `/Users/erwinyu/Downloads/hosting/cp8/cp/cloudflare_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc`

Compatibility updates made:

- DNS section now generates a real, ownership-checked DNS record preview from `cp_config_Domains` and `cp_config_Sites`.
- CDN section now validates that the domain belongs to the selected `cpID`, blocks temporary hosting URLs, loads the Cloudflare `userkey` from the legacy `cloudflare` table, and maps enable/disable style actions to `Run_cloudflare_cmd(...)`.
- SSL section now validates that the domain belongs to the selected `cpID` and maps Free SSL to `requestFreeSSLForced(cpID, site_Uid, dname)`.

Remaining parity notes:

- DNS publishing still needs the exact active SupaDNS helper flow from `sdnsfunctions*.inc` ported before writes are enabled.
- CDN live action against a temporary URL was correctly rejected; a disposable customer domain is needed for a real positive test.
- SSL delete maps to `deleteFreeSSLRecord(CN)` but remains disabled in the rebuilt UI to avoid deleting existing SSL rows until a disposable SSL order exists.

- `/Users/erwinyu/Downloads/hosting/cp8/cp/boxinfo_website_subfunctions.asp`

The latest menu still contains the same grouped functions already documented in `WEBSITE_MORE_FUNCTIONS_SPEC.md`:

- Settings: Site Name, Mapped Path, ASP.NET Version, .NET Core Mode, Node.js App, PHP Version, PHP Settings, Detail Error, Site On/Off, Delete Website
- Basic: Domain Manager, Visitor Stats, FTP Access, VS Webdeploy, Github Deploy, SMTP Sample Code, IP Deny, IIS Log Manager, Application Pool, Outgoing Port
- Advanced Features: Create .Net App, Create Virtual Dir, Force HTTPS, Default Doc, Custom Errors, Mime Type, ScriptMap, Remote IIS Manager, Site Guard, Schedule Tasks

Current rebuild has the popover and function drawer shell. Full production parity still requires completing each function key against the latest source files named in `WEBSITE_MORE_FUNCTIONS_SPEC.md`.

### Account Add-On, Billing, Renewal, Domain, VPN

Latest account/checkout sources checked at a high level:

- `/Users/erwinyu/Downloads/hosting/cp8/account/addon_purchase_special.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/addon_renew.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/cp_renew_1.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/checkoutDomainBuy.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/Checkout/checkout_overview_v7.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/Checkout/checkout_overview_renew_v5.asp`

Important latest behaviors:

- Checkout uses `GetCredit(session("customerID"))` or `session("balance")` for account balance.
- Renewals create/use `renew_temp` and then pass through checkout overview/waiting-payment pages.
- Add-on purchase pages set session values such as `addon_purchase_product_id`, `addon_purchase_payment_term`, `addon_purchase_currencytype`, `addon_purchase_product_name`, and `addon_purchase_qty`.
- VPN products are listed from product type `vpn` in `addon_purchase_special.asp`.

Remaining parity notes:

- The React account panel has modern order/renewal previews and balance-backed flows, but the remaining checkout path should keep being verified against the latest `/Checkout` pages rather than the older `/Downloads/cp8` copies.
- Payment-provider fragments need a separate checkout audit before claiming complete parity.
