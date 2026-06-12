# Panel CP Sections Rebuild Spec

This spec covers the left-menu `panel_cp` sections outside Websites:

- Databases
- Emails
- Files
- Apps
- FTP
- CDN
- DNS
- SSL
- Advance

It follows the same rebuild pattern as `WEBSITE_MORE_FUNCTIONS_SPEC.md`: preserve Classic ASP behavior, replace page fragments with typed JSON APIs, keep legacy database and worker compatibility, and use modern React views with fast lazy-loaded drawers.

Source references:

- Primary latest source tree: `/Users/erwinyu/Downloads/hosting/cp8`
- Latest account/control-panel pages: `/Users/erwinyu/Downloads/hosting/cp8/account`, `/Users/erwinyu/Downloads/hosting/cp8/cp`
- Latest helpers: `/Users/erwinyu/Downloads/hosting/cp8/functions`, `/Users/erwinyu/Downloads/hosting/includes`, `/Users/erwinyu/Downloads/hosting/ehbdata`, `/Users/erwinyu/Downloads/hosting/ehbkey`
- Latest domain references: `/Users/erwinyu/Downloads/hosting/cp8/domainmgr`
- Web service/admin references, when needed: `/Users/erwinyu/Downloads/hosting/CP`
- Historical reference only, not a substitute for referenced files: `/Users/erwinyu/Downloads/cp8`

Do not use source from folders named `nouse` or `no_use`.

Reference rule:

- Follow the exact Classic ASP include/link/action chain used by the feature being rebuilt.
- Ignore code inside `if 1 = 2 then ... end if` blocks. Treat it as intentionally disabled legacy code, not current behavior.
- If an ASP page references a specific file and that exact file is missing from the latest source tree, stop work on that feature, record the missing file in `docs/REBUILD_BLOCKERS.md`, and move to the next feature.
- Do not use a similar file from another folder or an older fallback copy to infer behavior unless the exact referencing page points there.

Latest source audit note:

- `/Users/erwinyu/Downloads/hosting/cp8` contains the latest user-facing account and hosting control-panel files. The sibling `/Users/erwinyu/Downloads/hosting/CP` folder is much smaller and mostly web-service/admin support.
- `/Users/erwinyu/Downloads/hosting/cp8/cp/sqluserfunc.js` is now available in the latest source tree for MSSQL/MySQL user create page validation.
- Many remaining unresolved references are static assets, old payment includes, demo/metronic pages, or admin-side links rather than current customer control-panel logic. See `LEGACY_SOURCE_AUDIT.md`.

## Shared Architecture

### React UI

- Each section should load a compact dashboard first.
- Detail-heavy actions should open a drawer or modal and lazy-load their data.
- Lists should use server-side pagination or scoped lazy loading where rows can be large.
- Buttons that create real server state must show a pending state and then a success/error response from the real gateway or worker.
- No section should show fake success. If a legacy agent/API is unavailable, show the exact failed dependency and do not write partial local state.

### ASP.NET API

Use one typed service per section:

- `DatabaseService`
- `EmailService`
- `FilesService`
- `FtpUserService`
- `AppsService`
- `CdnService`
- `DnsService`
- `SslService`
- `AdvanceService`

Shared API behavior:

- Resolve session user.
- Resolve selected CP account from `cpId`.
- Verify selected CP belongs to the logged-in customer.
- Validate ownership of domains, sites, database IDs, file paths, FTP users, SSL rows, and Cloudflare zones before returning or mutating anything.
- Return typed JSON:
  - `success`
  - `message`
  - `data`
  - `pendingJobId`
  - `remotePreview`
  - `warnings`
- Long-running operations should return a pending job ID and be visible in Activity.

### Shared Gateways

- `LegacyHostingAgent`: wraps `/iis_api.asp`, `/acl_api_2.asp`, `/ftp_api.asp`, `/api/URLRewrite/create`, `/newfileman/save.asp`.
- `FileManagerGateway`: wraps the legacy new file manager and upload/download actions.
- `DatabaseServerGateway`: wraps MSSQL/MySQL server create/delete/backup/restore calls.
- `SmarterMailGateway`: wraps hosted/corporate/VPS email actions.
- `DnsGateway`: wraps legacy DNS helper/provider calls.
- `CloudflareGateway`: wraps Cloudflare tenant/zone/record/cache actions.
- `NamecheapSslGateway`: wraps commercial SSL API calls.
- `RemoteCommandGateway`: wraps old `remote_cmd2` and scheduled-task host calls. It must expose only whitelisted operations.
- `WorkqueueRepository`: inserts and reads legacy `workqueue` rows exactly as legacy workers expect.

Agent transport rule:

- When encrypted values are stored in legacy database columns, match the exact Classic ASP/Persits output before writing.
- When encrypted values are only short-lived server-to-server request parameters, use rebuilt encryption instead of Persits, decrypt immediately in the Classic ASP agent, then validate ownership/path/domain rules before running the action.
- Port `830` agents are assumed to be reachable only from whitelisted ASP.NET server IPs; never expose those agent URLs directly to browser JavaScript.

### Shared Workqueue Contract

Keep compatibility with observed legacy `workqueue` columns:

- `id`
- `cplogin`
- `zipfile`
- `dstfolder`
- `enterdate`
- `serverid`
- `type`
- `status`
- `data1`
- `siteowner`
- `notifyemail`
- `errormessage`

Observed status:

| Status | Meaning |
|---|---|
| `0` | Pending |
| `1` | Running |
| `2` | Success |
| `3` | Error |

Known queue types:

| Type | Purpose |
|---|---|
| `zip` | Zip file/folder selection. |
| `Unzip` | Unzip uploaded/server archive. |
| `perm` | Apply filesystem ACL/permission changes. |
| `changepool` | Change IIS app pool or site ownership relation. |
| `createpool` | Create IIS application pool. |
| `Queue MSSQL Backup` | MSSQL backup job. |
| `Queue MSSQL Restore` | MSSQL restore job. |
| `Queue MySQL Backup` | MySQL backup job. |
| `Queue MySQL Restore` | MySQL restore job. |
| `Run MSSQL File` | Execute SQL file through MSSQL worker. |
| `scanvirus` | Virus scan job. |
| `nodejs` | Node.js setup/config job. |
| `deploy` | GitHub/Node deployment job from `nodejs_action.asp`; not VS WebDeploy / Remote IIS. |

## Databases

### Legacy Sources

- `cp/databases.asp`
- `cp/database_mssql.asp`
- `cp/database_mysql.asp`
- `cp/database_mssql_conn_str.asp`
- `cp/database_mysql_conn_str.asp`
- `cp/database_mssqlreport.asp`
- `cp/database_restore_via_backup.asp`
- `cp/databases_mssql_deleted.asp`
- `cp/databases_mysql_deleted.asp`
- `cp/databases_users.asp`
- `cp/mssql_create_action.asp`
- `cp/mssql_action.asp`
- `cp/mssql_runsql.asp`
- `cp/mssqlreportusers.asp`
- `cp/mssqlreportusers_action.asp`
- `cp/mysql_create_action.asp`
- `cp/mysql_action.asp`
- `cp/includes/sql_*`
- `cp/database_custombackup.asp`
- `cp/database_custombackup_action.asp`
- `cp/database_custombackup_create.asp`
- `cp/database_custombackup_update.asp`

### Tables And Systems

- `ehbconfig.dbo.cp_config_MSSQLs`
- `ehbconfig.dbo.cp_config_MySQLs`
- `ehbconfig.dbo.customDBBackup`
- `ehbconfig.dbo.workqueue`
- MSSQL database host APIs
- MySQL database host APIs
- File manager path picker for backup/restore files

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| List databases | `databases.asp` | `cp_config_MSSQLs`, `cp_config_MySQLs` | `GET /api/hosting/databases` |
| Create MSSQL | `mssql_create_action.asp` | MSSQL server API, `cp_config_MSSQLs` | `POST /api/hosting/databases/mssql` |
| Create MySQL | `mysql_create_action.asp` | MySQL server API, `cp_config_MySQLs` | `POST /api/hosting/databases/mysql` |
| Delete database | `mssql_action.asp`, `mysql_action.asp` | DB server API, mark/remove row | `DELETE /api/hosting/databases/{engine}/{id}` |
| Connection string | `database_mssql_conn_str.asp`, `database_mysql_conn_str.asp` | DB rows, templates | `GET /api/hosting/databases/{engine}/{id}/connection-string` |
| Backup now | `mssql_action.asp`, MySQL action | `workqueue` | `POST /api/hosting/databases/{engine}/{id}/backup` |
| Restore backup | `database_restore_via_backup.asp` | path validation, `workqueue` | `POST /api/hosting/databases/{engine}/{id}/restore` |
| Run SQL file | `mssql_runsql.asp` | path validation, `workqueue type=Run MSSQL File` | `POST /api/hosting/databases/mssql/{id}/run-sql-file` |
| Deleted DBs | `databases_mssql_deleted.asp`, `databases_mysql_deleted.asp` | deleted/status rows | `GET /api/hosting/databases/deleted` |
| MSSQL report users | `database_mssqlreport.asp`, `mssqlreportusers_action.asp` | Reporting SQL server | `GET/POST /api/hosting/databases/mssql-report-users` |
| Scheduled backups | `database_custombackup*.asp` | `customDBBackup` | `GET/POST/PUT/DELETE /api/hosting/databases/backups/schedules` |

Current rebuild status:

- `GET /api/hosting/databases`, deleted database inventory, connection-string templates, backup schedules, backup queue, restore queue, and MSSQL run-SQL queue endpoints are implemented.
- `DELETE /api/hosting/databases/{engine}/{id}` is implemented with strict ownership checks and a disposable database-name guard. It refuses existing customer databases and only allows `codex-test` style database names before calling the exact legacy delete actions from `fn_db.inc`.
- Live smoke test confirmed an existing database such as `DB_9E47E1_openreward` returns a protected failure before any remote delete or DB-row update.
- Database create still calls the legacy create agent but does not write local DB-user rows until the original DB password encryption compatibility is completed.
- `GET /api/hosting/databases/mssql-report-users` is implemented from `database_mssqlreport.asp`, `mssqlreportusers.asp`, and `cp_config_site_users`; it returns SSRS account enabled/server state plus reporting site-user inventory.
- MSSQL Reporting Service user add/update/delete routes are present but blocked before write until `encryptpwd` site-user password storage and Windows local-user RPCs are ported and disposable-user tested.

### Behavior Requirements

- Enforce CP ownership for every database ID.
- Enforce plan quota before create.
- For automated DB backups, match latest `database_custombackup_action.asp`: require `AdditionalDBBackupQuota - COUNT(customDBBackup)` to be greater than zero before enabling a schedule, clamp frequency to `1..7`, and clamp backup hour to `0..23`.
- Use legacy prefix/name rules when creating DB names and users.
- Restore must validate:
  - DB belongs to selected CP.
  - backup file path belongs to selected CP.
  - file extension is permitted.
  - engine matches backup type.
- Backup/restore/run-SQL must not block HTTP request; insert compatible `workqueue` row and poll job status.
- Backup queue rows must match latest `mssql_action.asp` / `mysql_action.asp`:
  - MSSQL backup: `type='Queue MSSQL Backup'`, `zipfile={mssqlHostname}`, `dstfolder='\www\db\'`, `data1='{dbname}.bak'`.
  - MSSQL restore: `type='Queue MSSQL Restore'`, `zipfile={requested .bak path}`, `dstfolder={mssqlid}`, `serverid={mssqlHostname}`.
  - MySQL backup: `type='Queue MySQL Backup'`, `zipfile={mysqlHostname}`, `dstfolder='\www\db\'`, `data1='{dbname}.sql'`.
  - MySQL restore: `type='Queue MySQL Restore'`, `zipfile={requested .sql path}`, `dstfolder={mysqlid}`, `serverid={mysqlHostname}`.
  - MSSQL run file: `type='Run MSSQL File'`, `zipfile='\\{serverid}\home\{cpLogin}\www\{sql path}'`, `dstfolder={mssqlid}`, `serverid={mssqlHostname}`.
- Do not expose passwords in list responses.
- Connection string drawer can show template and allow copy, but mask password unless user explicitly regenerates/sets it.

### Speed Notes

- Load all DB inventory in one query per CP.
- Cache connection-string templates.
- Poll only relevant `workqueue.id` rows after backup/restore/run-SQL.
- Use one summary endpoint for counts/quota/engine filters.

## Email

### Legacy Sources

- `cp/email.asp`
- `cp/email_action.asp`
- `cp/email_vps.asp`
- `cp/email_action_vps.asp`
- `cp/email_corp.asp`
- `cp/email_action_corp.asp`
- `cp/corporate_email.asp`
- `cp/corporate_email_action.asp`
- `cp/email_manage_space_edit_box.asp`
- `cp/email_manage_space_edit_box_corp.asp`
- `cp/mail/*`

### Tables And Systems

- `ehbconfig.dbo.cp_config_EmailDomains`
- `ehbconfig.dbo.cp_config_CorpEmailDomains`
- `ehbconfig.dbo.cp_config_DailySentLimit`
- `ehbconfig.dbo.ip_group`
- SmarterMail API
- DNS helper/API

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| List mail domains | `email.asp`, `corporate_email.asp` | email domain tables | `GET /api/hosting/emails` |
| Add hosted domain | `email_action.asp` | SmarterMail, DNS, `cp_config_EmailDomains` | `POST /api/hosting/emails/domains` |
| Add corporate domain | `corporate_email_action.asp` | SmarterMail, DNS, `cp_config_CorpEmailDomains` | `POST /api/hosting/emails/corporate-domains` |
| Delete mail domain | `email_action*.asp` | SmarterMail, DNS, domain table | `DELETE /api/hosting/emails/domains/{id}` |
| Reset domain password | `email_action*.asp` | SmarterMail | `POST /api/hosting/emails/domains/{id}/password` |
| Manage domain quota | `email_manage_space_edit_box*.asp` | domain table, SmarterMail | `PUT /api/hosting/emails/domains/{id}/quota` |
| Mailboxes | `cp/mail/*` | SmarterMail | `GET/POST/PUT/DELETE /api/hosting/emails/domains/{id}/mailboxes` |
| Aliases | `cp/mail/*` | SmarterMail | `GET/POST/PUT/DELETE /api/hosting/emails/domains/{id}/aliases` |
| Forwarding | `cp/mail/*` | SmarterMail | `GET/POST/PUT/DELETE /api/hosting/emails/domains/{id}/forwarding` |
| Bypass/daily limit | `cp_config_DailySentLimit` helpers | SmarterMail, daily limit table | `GET/PUT /api/hosting/emails/domains/{id}/limits` |

### Behavior Requirements

- Hosted, corporate, and VPS email flows share one UI, but backend must preserve product/domain type differences.
- Verify domain belongs to CP before any SmarterMail action.
- DNS records for MX/SPF/DKIM/Autodiscover should be shown and optionally published.
- SmarterMail raw response text must be normalized into structured errors.
- Domain deletes must confirm mailbox impact and remove remote state before local row cleanup.
- Quota changes must validate purchased quota/add-ons.

### Speed Notes

- Cache domain-to-mail-server mapping per request.
- Batch mailbox/alias counts by domain where SmarterMail supports it.
- Use a short timeout for reads and a longer timeout for create/delete operations.

## Files

### Legacy Sources

- `cp/filemanager.asp`
- `cp/newfileman/*`
- `cp/newfileman/download.asp`
- `cp/newfileman/download_action.asp`
- `cp/newfileman/editor.asp`
- `cp/newfileman/editorsave.asp`
- `cp/newfileman/popupbox/*`
- `cp/newfileman/treeview1/*`
- `cp/includes/uploadfile.asp`
- `cp/fileperm_action.asp`
- `cp/fileperm_edit_box.asp`
- `cp/locksite.asp`
- `cp/rawlog*`

### Tables And Systems

- JSON browse agent at `/new/getFilesFolder.asp`
- Legacy remote file manager actions under `/newfileman/*`
- `ehbconfig.dbo.workqueue`
- `audit.dbo.siteSecurity`
- `cp_config_Sites` for root path/site mapping
- Legacy `/acl_api_2.asp`

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| Browse folder | `filemanager.asp`, rebuilt `legacy-agents/getFilesFolder.asp` | JSON FileManagerAgent | `GET /api/hosting/files/browse?path=...` |
| Create folder | `filemanager.asp?action=c`, `newfileman/makedir.asp` | FileManagerGateway | `POST /api/hosting/files/action`, `action=new-folder` |
| Create file | `popupbox/newfile.asp`, `newfileman/save.asp` | FileManagerGateway | `POST /api/hosting/files/action`, `action=new-file/save-file` |
| Edit text file | `editor.asp`, `newfileman/editnew.asp`, `editorsave.asp`, `newfileman/save.asp` | FileManagerGateway | `POST /api/hosting/files/action`, `action=read-file/save-file` |
| Rename | `filemanager.asp`, `newfileman/rename.asp` | FileManagerGateway | `POST /api/hosting/files/action`, `action=rename` |
| Move/copy | `filemanager.asp`, `newfileman/move.asp` | FileManagerGateway | `POST /api/hosting/files/action`, `action=move/copy` |
| Delete | `filemanager.asp`, `newfileman/delete.asp` | FileManagerGateway | `POST /api/hosting/files/action`, `action=delete`, guarded to `codex-test-*` |
| Upload | `includes/uploadfile.asp` | chunk upload + FileManagerGateway | `POST /api/hosting/files/upload` |
| Download | `download.asp`, `download_action.asp` | FileManagerGateway | `GET /api/hosting/files/download` |
| Zip | `popupbox/pack.asp` | `workqueue type=zip` | `POST /api/hosting/files/action`, `action=zip` |
| Unzip | `newfileman/unzip.asp` | FileManagerGateway, may queue `workqueue type=Unzip` | `POST /api/hosting/files/action`, `action=unzip` |
| Permissions | `fileperm_action.asp` | `workqueue type=perm`, `/acl_api_2.asp` | `POST /api/hosting/files/permissions` |
| Site lock/unlock | `locksite.asp` | `audit.dbo.siteSecurity`, `workqueue type=perm` | `POST /api/hosting/files/site-lock` |
| Raw logs | `rawlog*` | raw log export/download | `GET /api/hosting/files/raw-logs` |

### Behavior Requirements

- Never trust client paths.
- All paths must pass a single `ValidateOwnedHostingPath(cpLogin, cpId, path)` check. The rebuilt API currently resolves this as `HOSTING_HOME_ROOT\{cpLogin}\www`.
- File-manager browse/create/rename/move/copy/delete shells are implemented through `/api/hosting/files/browse` and `/api/hosting/files/action`, following the exact form fields in `filemanager.asp`.
- The current live gateway returns an HTML rejection for browse calls from the dev app; see `REBUILD_BLOCKERS.md`.
- Block traversal, alternate drive roots, UNC paths, and paths outside `h:\root\home\{cpLogin}`.
- Large folders must use lazy loading/pagination.
- ZIP/unzip/permissions/virus scan must queue work and show activity.
- Download should stream; never load large files fully into memory.
- Text editor should limit file size and safe extensions.

### Speed Notes

- Lazy-load one folder level at a time.
- Use chunked uploads.
- Cache file icons/type mapping locally in React.
- Poll only job rows for ZIP/unzip/permission operations.

## Apps

### Legacy Sources

- `cp/Plugins/apps.asp`
- `cp/Plugins/plugin_list_aspnet.asp`
- `cp/Plugins/plugin_list_php.asp`
- `cp/Plugins/plugin_process_1.asp`
- `cp/Plugins/plugin_process_2.asp`
- `cp/Plugins/plugin_process_2_db.asp`
- `cp/Plugins/plugin_process_2_nodb.asp`
- `cp/Plugins/plugin_process_2_site.asp`
- `cp/Plugins/plugin_process_3.asp`
- `cp/Plugins/plugin_process_3_action.asp`

### Tables And Systems

- `plugins` database
- `cp_config_Sites`
- `cp_config_Domains`
- `cp_config_MSSQLs`
- `cp_config_MySQLs`
- `cloudflare`
- `audit.dbo.siteSecurity`
- `workqueue`
- FileManagerGateway
- DatabaseServerGateway
- CloudflareGateway

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| Plugin catalog | `apps.asp`, `plugin_list_*` | `plugins.dbo.plugins`, `plugins.dbo.categories` | `GET /api/hosting/apps` |
| Requirement check | `fn_plugin.inc:getPluginParas`, `fn_plugin.inc:getPluginConfigFiles`, `fn_plugin.inc:getPluginPermissions` | `plugins.dbo.parameters`, `plugins.dbo.config`, `plugins.dbo.permissions` | `GET /api/hosting/apps/{pluginId}/requirements` |
| App install preview | `plugin_process_1.asp` | plugin catalog, entitlement checks | `POST /api/hosting/apps/install-preview` |
| Select site/path | `plugin_process_2_site.asp` | sites, file path validation | `POST /api/hosting/apps/install/site` |
| Select/create DB | `plugin_process_2_db.asp` | DB APIs, DB tables | `POST /api/hosting/apps/install/database` |
| Install app | `plugin_process_3_action.asp` | DB/file/workqueue/helpers | `POST /api/hosting/apps/install` |
| Install status | new job metadata + workqueue | job rows | `GET /api/hosting/apps/install/{jobId}` |

Current rebuild status:

- `GET /api/hosting/apps` is implemented and tested against live plugin catalog rows.
- `GET /api/hosting/apps/{pluginId}/requirements` is implemented and tested against live `parameters`, `config`, and `permissions` rows.
- `POST /api/hosting/apps/install-preview` is implemented. It validates plugin ownership, selected site ownership, optional selected database ownership, and target path containment under `h:\root\home\{cpLogin}` before returning a no-write install plan.
- `POST /api/hosting/apps/install` is implemented as a guarded route. It returns the same validated plan, then blocks before writes until the exact `plugin_process_3_action.asp` side effects are ported and tested on disposable resources.
- `GET /api/hosting/apps/install/{jobId}` is implemented for owned `workqueue` job status lookup.
- Full install execution remains blocked until `plugin_process_3_action.asp` is ported end-to-end and a disposable target site/database plus reachable file-manager/database/IIS agents are confirmed; see `REBUILD_BLOCKERS.md`.

### Behavior Requirements

- Replace the multi-page ASP wizard with one job-driven install drawer.
- Preserve legacy install side effects:
  - create DB when required
  - unzip package to selected path
  - import SQL/BAK when required
  - write config file
  - set permissions
  - create IIS app when required
  - record plugin installed/count
- Use a new metadata table/store for detailed progress, but keep legacy `workqueue` rows for workers.
- Do not expose DB passwords after creation.
- Validate selected site/path/database ownership before install.
- Some legacy app-management surfaces are intentionally skipped from the rebuilt Control Panel. See `SKIPPED_LEGACY_FUNCTIONS.md`.

### Speed Notes

- Cache plugin catalog from the `plugins` DB.
- Cache downloaded plugin ZIP/SQL/BAK assets.
- Run install in a background worker.
- Show progress steps instead of blocking the request.

## FTP

### Legacy Sources

- `cp/ftp.asp`
- `cp/ftp_action.asp`
- `cp/ftpedit.asp`
- `cp/ftpimport.asp`
- `cp/boxinfo_ftp.asp`

### Tables And Systems

- `ehbconfig.dbo.cp_config_FTP`
- `cp_config_FTP`
- `encryptpwd(...)` and `encryptFTPpwd(...)` from `functions.inc` / `includes/encryption.asp`
- `fn_ftp.inc`
- File path ownership helpers

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| List FTP users | `ftp.asp`, `boxinfo_ftp.asp` | `cp_config_FTP` | `GET /api/hosting/ftp` |
| Create FTP user | `ftp_action.asp`, `functions.inc:createFTPSingle` | `cp_config_FTP`, `encryptpwd`, `encryptFTPpwd` | `POST /api/hosting/ftp/users` |
| Update FTP password | `functions.inc:updateFtpUserPassword` | `cp_config_FTP`, `encryptpwd`, `encryptFTPpwd` | `PUT /api/hosting/ftp/users/{login}` |
| Delete user | `ftp_action.asp`, `functions.inc:deleteFTP` | `cp_config_FTP` | `DELETE /api/hosting/ftp/users/{login}` |
| Edit FTP path/quota/permission | `ftp_action.asp`, disabled `functions.inc:edit_ftp_user` | Disabled inside `if 1 = 2` | Do not expose in UI |
| Enable/disable user | `ftp_action.asp`, disabled `functions.inc:enable_ftp_user` / `stop_FTP` | Disabled inside `if 1 = 2` | Do not expose in UI |
| Reset permission | `ftp_action.asp`, disabled permission reset code | Disabled inside `if 1 = 2` | Do not expose in UI |
| Import FTP users | `ftpimport.asp`, no active `addFTPUserBulk` case found in current `ftp_action.asp` | Missing active action | Do not expose until exact active action is found |

### Behavior Requirements

- Root FTP user requires extra protection and must not be deleted casually.
- Login must be unique within CP.
- Path must belong to CP.
- Create uses disk quota from product/add-on quota mapping, matching `createFTPSingle(...)`; quota/permission are not user-editable in active `ftp.asp`.
- Ignore `/ftp_api.asp` paths that are inside `if 1 = 2`.
- Active create/edit/delete are DB-driven through `cp_config_FTP`; do not invent FTP-agent-first behavior unless a current active ASP reference requires it.
- Password values must never be returned in list responses.

### Speed Notes

- Load FTP list from `cp_config_FTP`.
- Create/password update remain blocked until Persits-compatible `encryptpwd` / `encryptFTPpwd` output is reproduced exactly.

## CDN

### Legacy Sources

- `cp/cloudflare.asp`
- `cp/cloudflare_action.asp`
- `cp/cloudflare_tenant.asp`
- `cp/cloudflare_tenant_action.asp`
- `cp/cloudflare_info.asp`

### Tables And Systems

- `ehbconfig.dbo.cloudflare`
- `ehbconfig.dbo.cp_config_Domains`
- `ehbconfig.dbo.ssl_order`
- Cloudflare API
- DNS helper/API

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| CDN domain list | `cloudflare.asp` | domains, Cloudflare rows | `GET /api/hosting/cdn` |
| Create tenant/account | `cloudflare_tenant_action.asp` | Cloudflare tenant API, `cloudflare` | `POST /api/hosting/cdn/tenant` |
| Resend invite | `cloudflare_tenant_action.asp?action=invite` | Cloudflare tenant API | `POST /api/hosting/cdn/tenant/invite` |
| Enable/disable CDN | `cloudflare_tenant_action.asp?action=enable_zone` / `cloudflare_action.asp?action=enable_zone` | Cloudflare zone API, `cp_config_Domains.cdn` | `POST /api/hosting/cdn/domains/{domainUid}/status` |
| Purge cache | `cloudflare_tenant_action.asp?action=purge` / `cloudflare_action.asp?action=purge` | Cloudflare API | `POST /api/hosting/cdn/zones/{zoneId}/purge` |
| SSL full/flexible mode | `cloudflare_tenant_action.asp?action=ssl_mode_on/off` | Cloudflare API | Staff-only; do not expose to normal customer UI |
| WWW redirect | Present but commented out in active `cloudflare*.asp` page | Cloudflare/DNS/domain flags | Do not expose in UI |
| Scan records | Internal after zone creation only | Cloudflare API | Do not expose as standalone UI action |

### Behavior Requirements

- Prefer current tenant flow in `cloudflare_tenant.asp`; use older `cloudflare.asp` only where the account is not on tenant flow.
- Do not display raw Cloudflare credentials.
- Domain must belong to selected CP.
- Zone state and `cp_config_Domains.cdn` must stay consistent.
- If Cloudflare succeeds but DB update fails, log compensating action.
- If DB update succeeds but Cloudflare fails, roll back DB update where possible.

### Speed Notes

- Cache Cloudflare zone lookups briefly.
- Do not show standalone add-zone/delete-zone/scan buttons; active customer UI is per-domain CDN on/off plus purge.
- Purge cache can be synchronous with a short timeout and structured error.

## DNS

### Legacy Sources

- `cp/dns/default.asp`
- `cp/dns/editdns.asp`
- `cp/dns/dns_action.asp`
- `cp/dns/domainPunyCode.asp`
- domain manager helper files under `/domainmgr` and `/domainXML`

### Tables And Systems

- DNS provider/API through legacy helper functions
- `cp_config_Domains`
- domain ownership helpers
- VPS domain allowance via legacy `vpsdomains` behavior
- Punycode conversion helper

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| List zones | `dns/default.asp` | domain ownership helpers | `GET /api/hosting/dns/zones` |
| List records | `dns/editdns.asp` | DnsGateway | `GET /api/hosting/dns/zones/{zone}/records` |
| Add record | `dns_action.asp` | DnsGateway | `POST /api/hosting/dns/zones/{zone}/records` |
| Edit record | `dns_action.asp` | DnsGateway | `PUT /api/hosting/dns/zones/{zone}/records/{recordId}` |
| Delete record | `dns_action.asp` | DnsGateway | `DELETE /api/hosting/dns/zones/{zone}/records/{recordId}` |
| Reset default records | Not present in active `editdns.asp` / `dns_action.asp` UI | DnsGateway | Do not expose in UI |
| Punycode decode | `domainPunyCode.asp` | IDN converter | Internal helper for ownership/display |

### Behavior Requirements

- Confirm ownership using rebuilt equivalent of `getCPIDbyDomain(zoneName)`.
- Allow VPS domains only where the old session `vpsdomains` behavior would allow them.
- Normalize host names:
  - `@` for root
  - no duplicate zone suffix
  - IDN/punycode support
- Validate record type-specific fields:
  - A/AAAA address format
  - CNAME target
  - MX priority and host
  - TXT length/escaping
  - SRV priority/weight/port/target
- Display the active Google Mail MX KB link from `editdns.asp`.
- Do not show import/scan/publish/default-reset controls unless an exact active ASP page exposes them.

### Speed Notes

- DNS reads can be cached per zone for a short TTL.
- Writes must invalidate zone cache.
- Use typed provider responses; avoid parsing HTML.

## SSL

### Legacy Sources

- `cp/ssl.asp`
- `cp/ssl_list.asp`
- `cp/ssl_list_action.asp`
- `cp/ssl_buy_*.asp`
- `cp/ssl_import_*.asp`
- `cp/ssl_install*.asp`
- `cp/ssl_letsssl_*.asp`
- `cp/installmoressl.asp`
- `cp/ssl/installmoressl_action.asp`

### Tables And Systems

- `ehbconfig.dbo.ssl_order`
- `ehbconfig.dbo.LetsSSL`
- `ehbconfig.dbo.cp_config_Domains`
- `ehbconfig.dbo.cp_config_Sites`
- `oms.dbo.client_product`
- Namecheap SSL API
- IIS HTTPS binding API
- DNS validation helpers

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| List certificates | `ssl_list.asp` | `ssl_order`, `LetsSSL` | `GET /api/hosting/ssl` |
| Buy SSL | `ssl_buy_*.asp` | OMS checkout, Namecheap | `POST /api/hosting/ssl/orders` |
| Import certificate | `ssl_import_*.asp` | cert parser, `ssl_order` | `POST /api/hosting/ssl/import` |
| Request free SSL | `ssl_letsssl_*.asp` | `LetsSSL`, ACME/DNS/IIS | `POST /api/hosting/ssl/free` |
| Install SSL | `ssl_install*.asp`, `installmoressl.asp` | IIS binding API, cert store | `POST /api/hosting/ssl/{id}/install` |
| Reinstall SSL | `ssl_install*.asp` | IIS binding API | `POST /api/hosting/ssl/{id}/reinstall` |
| Delete SSL | `ssl_list_action.asp` | IIS binding API, SSL tables | `DELETE /api/hosting/ssl/{id}` |
| Resend approval | `ssl_list_action.asp` | Namecheap SSL API | `POST /api/hosting/ssl/{id}/resend-approval` |
| Approver emails | `ssl_buy_*.asp` | Namecheap/domain API | `GET /api/hosting/ssl/approver-emails?domain=...` |

### Behavior Requirements

- Verify certificate/order belongs to customer/CP before showing or mutating.
- Free SSL quota must use product/add-on entitlement logic.
- Domain list must come from owned mapped domains.
- Install/reinstall/delete should be async if IIS binding can be slow.
- Private key material must never be returned after import.
- Validate certificate chain before import.
- Normalize statuses into one UI model while preserving raw status in details.

### Speed Notes

- Cache eligible domains and approver emails briefly.
- Use background job for install/reinstall/delete.
- Poll job row/status, not full SSL inventory.

## Advance

### Legacy Sources

Advance is a grouped page in the rebuilt UI, not one old file. It should merge lower-frequency CP tools that do not belong directly in the primary sections.

Representative files:

- `cp/task.asp`
- `cp/task1.asp`
- `cp/task_action.asp`
- `cp/taskremove.asp`
- `cp/cpAlias.asp`
- `cp/cpAlias_action.asp`
- `cp/sqlremoteip_action.asp`
- `cp/environment_variables_pool.asp`
- `cp/apppoolmgr.asp`
- `cp/apppoolmgr_action.asp`
- `cp/apppoolmgradv.asp`
- `cp/boxinfo_pool.asp`
- `cp/boxinfo_remoteiis.asp`
- `cp/boxinfo_aspnetapp.asp`
- `cp/aspnetapp_action.asp`
- `cp/cloudbackup.asp`
- `cp/cloudbackup_update.asp`
- `cp/update_filecount.asp`

### Tables And Systems

- `tasks`
- `cp_loginAlias`
- `cp_config_Pools`
- `cp_config_Sites`
- `cp_config_StaticIP`
- `cp_config_redirect`
- `workqueue`
- `remote_cmd2`
- IIS/ACL/URL Rewrite gateways
- Product/add-on entitlement helpers

### Function Matrix

| UI Function | Legacy File/Action | Tables/Gateways | Rebuilt Endpoint |
|---|---|---|---|
| Scheduled tasks | `task*.asp`, `task_action.asp` | `tasks`, RemoteCommandGateway | `GET/POST/PUT/DELETE /api/hosting/advance/tasks` |
| Team access | `cpAlias*.asp` | `cp_loginAlias` | `GET/POST/PUT/DELETE /api/hosting/advance/team-access` |
| Outgoing port/static IP | `sqlremoteip_action.asp` | firewall RPC, static IP rows | `GET/POST/DELETE /api/hosting/advance/outgoing-ports` |
| Environment variables | `environment_variables_pool.asp` | IIS/app pool config | `GET/POST/DELETE /api/hosting/advance/environment-variables` |
| Application pools | `apppoolmgr*.asp`, `boxinfo_pool.asp` | `cp_config_Pools`, `workqueue`, IIS RPC | `GET/POST/PUT/DELETE /api/hosting/advance/app-pools` |
| Remote IIS Manager | `boxinfo_remoteiis.asp` | WebDeploy/IIS Manager actions | `GET/POST /api/hosting/advance/remote-iis` |
| ASP.NET apps | `boxinfo_aspnetapp.asp`, `aspnetapp_action.asp` | IIS app APIs | `GET/POST/DELETE /api/hosting/advance/aspnet-apps` |
| Cloud backup | `cloudbackup*.asp` | product entitlement, backup rows/API | `GET/POST/PUT /api/hosting/advance/cloud-backup` |
| File count refresh | `update_filecount.asp` | file count worker/API | `POST /api/hosting/advance/file-count/refresh` |
| Redirect/runtime inventory | existing runtime rows | runtime tables | `GET /api/hosting/advance/runtime` |

### Behavior Requirements

- This section should feel like an operations toolbox.
- Each function must state whether it is live, queue-backed, or dependent on a legacy gateway.
- Remote command actions must be whitelisted; do not expose arbitrary command execution.
- Scheduled task validation:
  - timeout 20-300 seconds
  - interval 5-1440 minutes
  - Windows task name `{cpLogin}-{taskID}`
- Team access:
  - preserve `cp_loginAlias`
  - use clear role labels in UI
  - never allow alias to exceed owner permission
- Application pool operations:
  - create/change through `workqueue` where old worker expects it
  - recycle/start/stop through IIS gateway
  - validate purchased RAM/add-on entitlement before memory changes

### Speed Notes

- Advance landing should be read-only inventory first.
- Lazy-load each tool drawer.
- Use grouped API reads for app pools, aliases, tasks, redirects, and static IP rows.
- Queue long or risky operations and show Activity status.

## Implementation Order

Recommended order after Websites More Functions:

1. FTP: smallest surface, clear local table, exact Persits-compatible encryption dependency.
2. DNS: valuable low-risk CRUD once DNS gateway is wired.
3. Databases read + backup/restore queue actions.
4. Files read-only browser + upload/download, then ZIP/unzip/permissions.
5. Email domain list + SmarterMail gateway status, then create/delete.
6. SSL inventory + free SSL/order/import flows.
7. CDN inventory + Cloudflare tenant/zone/status flows.
8. Apps catalog + job-driven plugin installer.
9. Advance toolbox drawers.

## Testing Rules

- Real reads should run against the selected CP account.
- Mutating tests may create new `codex-test-*` data only.
- Do not delete existing customer sites, databases, email domains, FTP users, DNS records, SSL rows, or CDN zones.
- When testing destructive flows, create a new test resource, verify it exists, edit it, then delete only that test resource.
- If a remote legacy agent times out or rejects a call, the API must return failure and avoid partial DB writes.
- Each module needs tests for:
  - unauthenticated request redirects/401
  - wrong `cpId`
  - resource owned by another CP
  - gateway unavailable
  - successful create/edit/delete using test data
  - no partial local data after remote failure

## Open Dependencies

- Confirm live reachability for legacy hosting agents on `:830`.
- Confirm SmarterMail gateway base URL and auth model.
- Confirm DNS provider helper/API endpoint details.
- Confirm Cloudflare tenant API credentials and modern preferred flow.
- Confirm Namecheap SSL API wrapper details.
- Confirm scheduler database/connection for `tasks`.
- Confirm file manager remote API contract for browse/upload/download.
