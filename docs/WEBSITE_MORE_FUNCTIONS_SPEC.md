# Website More Functions Rebuild Spec

This spec covers every function shown in the Websites -> More Functions hover panel. The source of truth for the menu is:

- Primary latest source: `/Users/erwinyu/Downloads/hosting/cp8/cp/boxinfo_website_subfunctions.asp`
- Fallback only if the latest source is missing the file: `/Users/erwinyu/Downloads/cp8/cp/boxinfo_website_subfunctions.asp`

Related latest helper folders:

- `/Users/erwinyu/Downloads/hosting/cp8/functions`
- `/Users/erwinyu/Downloads/hosting/cp8/cp/includes`
- `/Users/erwinyu/Downloads/hosting/includes`
- `/Users/erwinyu/Downloads/hosting/ehbdata`
- `/Users/erwinyu/Downloads/hosting/ehbkey`

Do not use source from folders named `nouse` or `no_use`.

The rebuilt UI should keep the same behavior, labels, restrictions, side effects, and success/failure semantics where possible, while replacing modal ASP fragments with fast JSON APIs and React views.

## Architecture

### React UI

- The More Functions button is a hover/focus popover on each website row/card.
- Clicking a function opens a right-side drawer or modal dedicated to that function.
- The first click should lazy-load function data from the API. Do not prefetch every function for every site.
- Keep the website list itself light: load only site summary, domain list, status, runtime, SSL/CDN badges, and action buttons.
- Use optimistic UI only for UI-only field edits. For server/provisioning actions, show a pending state until the legacy worker/RPC result is known.

### ASP.NET API

Use one controller/service area for website features:

- `GET /api/hosting/sites/{siteUid}/functions/{functionKey}`
- `POST /api/hosting/sites/{siteUid}/functions/{functionKey}`
- `DELETE /api/hosting/sites/{siteUid}/functions/{functionKey}/{id}`

Shared behavior:

- Resolve session user and selected CP.
- Verify `siteUid` belongs to the signed-in customer and selected `cpID`.
- Resolve site facts once per request:
  - `cp_config.cpID`
  - `cp_config.cpLogin`
  - `cp_config.ServerID`
  - `cp_config.WebHostType`
  - `cp_config_Sites.site_Uid`
  - `cp_config_Sites.site_name`
  - `cp_config_Sites.iis_id`
  - `cp_config_Sites.site_path`
  - `cp_config_Sites.pool_id`
- Wrap DB + remote calls in a service result:
  - `success`
  - `message`
  - `pendingJobId`
  - `remotePreview`
  - `updatedResource`
- Never trust client paths. Validate with the rebuilt equivalent of old `check_owner_cp_path`.
- Remote IIS/agent calls use configured `LegacyAgent`:
  - host: `{ServerID}.{LegacyAgent:ServerDomainName}`
  - port: `LegacyAgent:Port`, default `830`
  - scheme: `LegacyAgent:Scheme`, default `http`
- Some old functions use `remote_cmd2`, which requires the old remote-command token helper. Do not expose arbitrary command execution. Only map whitelisted commands through typed service methods.

### Speed Optimizations

- Replace ASP fragments with typed JSON endpoints.
- Cache per-request site context to avoid repeated `getWPInfo`, `getServerIDByCpID`, `getCpURLByCpID`, and `getCPHomeFolderPath`.
- Batch read page data for drawers. Example: Application Pool drawer should return pools, current pool, RAM quota, and pending workqueue jobs in one response.
- Use `SqlConnection` pooling and parameterized SQL.
- Use short remote-agent timeouts for status reads, longer timeouts for worker-style provisioning only.
- Queue long filesystem/IIS actions in `workqueue` instead of blocking UI.
- Return pending-job IDs and poll only the job status row, not the whole website dashboard.
- Add ETag-ish lightweight `lastUpdated` values for read-heavy drawers where data is stable.

## Function Matrix

| UI Function | Legacy Entry | Legacy Action/Helpers | Rebuilt Function Key |
|---|---|---|---|
| Site Name | `includes/website_name_edit.asp` | `domainbind_actions.asp?action=editwebsitename`, `editwebsitename`, `edit_iis_name` | `site-name` |
| Mapped Path | `treepick.asp` from menu | `domainbind_actions.asp?action=updatesitepath`, `workqueue type=changepool` when pool changes | `mapped-path` |
| ASP.NET Version | `/cp/advance` and `domainbind_version_change.asp` | `aspnetapp_action.asp`, `addCustomScriptMap/removeCustomScriptMap` for PHP mapping | `aspnet-version` |
| .NET Core Mode | `boxinfo_core_mode.asp` | `aspnetapp_action.asp?action=set_HostingModel`, `set_HostingModel_rpc` | `core-mode` |
| Node.js App | `boxinfo_nodejs.asp` | `nodejs_action.asp`, `/api/URLRewrite/create` via `httpcall4`, `workqueue type=nodejs` | `nodejs-app` |
| PHP Version | `boxinfo_php_version.asp` | `aspnetapp_action.asp?action=editversion`, script map helpers | `php-version` |
| PHP Settings | `boxinfo_php_settings.asp` | `php_settings_action.asp`, `/newfileman/save.asp` | `php-settings` |
| Detail Error | `boxinfo_detailerror.asp` | `aspnetapp_action.asp?action=detailerror`, `remote_cmd2`, `cp_config_sites.detailerror` | `detail-error` |
| Site On/Off | `boxinfo_siteonoff.asp` | `domainbind_actions.asp?action=startstopIIS`, `start_IIS`, `stop_IIS` | `site-on-off` |
| Delete Website | JS `deletesite(...)` | `domainbind_actions.asp?action=deletesite`, IIS delete + DB cleanup | `delete-website` |
| Domain Manager | `boxinfo_mapdomain.asp` | `domainbind_actions.asp` add/delete/move domain, DNS helpers | `domain-manager` |
| Visitor Stats | `boxinfo_webstats.asp` | AWStats / statistics setup tied to WebDeploy/Remote IIS password | `visitor-stats` |
| FTP Access | `boxinfo_ftp.asp` | `ftp_action.asp`, `fn_ftp.inc` `createFTP`, `edit_ftp_user`, `deleteFTP` | `ftp-access` |
| VS Webdeploy | `boxinfo_webdeploy.asp` | `iis_manager_webdeploy_action.asp`, `iis_manager_webdeploy_generate.asp` | `vs-webdeploy` |
| Github Deploy | `boxinfo_nodejs_deploy.asp` | `nodejs_action.asp` deploy fields and worker/RPC flow | `github-deploy` |
| SMTP Sample Code | `boxinfo_smtp_code.asp` | `setupOtherPlugins/smtpscriptsamples_action` | `smtp-sample-code` |
| IP Deny | `boxinfo_ipdeny.asp` | IP deny page/actions, IIS config/server firewall depending mode | `ip-deny` |
| IIS Log Manager | `rawlog_download.asp` | `rawlog_download_action.asp`, raw log export/download | `iis-log-manager` |
| Application Pool | `boxinfo_pool.asp` | `apppoolmgr_action.asp`, `workqueue createpool/changepool`, `remote_cmd2` | `application-pool` |
| Outgoing Port | `/cp/remoteip` | `sqlremoteip_action.asp`, `set_Firewall_rpc`, remote firewall rules | `outgoing-port` |
| Create .Net App | `boxinfo_aspnetapp.asp` | `aspnetapp_action.asp`, `createIISApp`, `deleteIISApp` | `create-net-app` |
| Create Virtual Dir | `boxinfo_virtualdir.asp` | `virtualdir_action.asp`, `createIISVD`, `deleteIISVD` | `virtual-dir` |
| Force HTTPS | `boxinfo_redirect.asp` | `redirect_action.asp`, URL Rewrite API | `force-https` |
| Default Doc | `xsetdefaultpage.asp` | `setdefaultpage_action.asp`, `IIS_Member_DefaultPage_Edit` | `default-doc` |
| Custom Errors | `xseterrorpage.asp` | `seterrorpage_action.asp`, `IIS_Member_ErrorPage_Edit` | `custom-errors` |
| Mime Type | `mimemap.asp` | `mimemap_action.asp`, `add_mimeMap`, `del_mimeMap`, `get_mimeMap` | `mime-type` |
| ScriptMap | `scriptmap.asp` | `scriptmap_action.asp`, `addCustomScriptMap`, `removeCustomScriptMap` | `script-map` |
| Remote IIS Manager | `boxinfo_remoteiis.asp` | `iis_manager_webdeploy_action.asp`, Remote IIS user toggle | `remote-iis-manager` |
| Site Guard | `site_guard.asp` | `aspnetapp_action.asp?action=webknight`, `IIS_Filter_webknight_rpc` | `site-guard` |
| Schedule Tasks | `/cp/task` | `task_action.asp`, `tasks` table, optional Windows schtasks | `schedule-tasks` |

## Shared Legacy Helpers To Port

### Site Ownership

Old code frequently uses:

- `getCpIDbySiteUid(site_Uid)`
- `check_owner_cp_path(cpID, path)`
- `check_owner_cp_siteuid(cpID, site_Uid)`
- `check_owner_siteuid_domainuid(site_uid, domain_uid)`
- `getWPInfo(site_uid)`

Rebuild as:

- `LoadOwnedSiteAsync(customerId, cpId, siteUid)`
- `ValidateOwnedHostingPath(cpLogin, cpId, path)`
- `LoadSiteDomainsAsync(siteUid)`
- `LoadSiteRuntimeAsync(siteUid)`

### Legacy Agent

Most IIS functions call:

- `/iis_api.asp`
- `/acl_api_2.asp`
- `/ftp_api.asp`
- `/api/URLRewrite/create`
- `/newfileman/save.asp`

Create one typed `LegacyHostingAgent` service. It should:

- Build host from selected `ServerID`.
- Post form data.
- Treat response starting `[[Error]]` as failure.
- Store raw response preview for logs.
- Never accept arbitrary action names from client.

### Workqueue

Existing safe mapping should remain:

- `createpool`
- `changepool`
- `nodejs`
- `deploy`
- `perm`
- `zip`
- `Unzip`
- `scanvirus`

Use `workqueue` for long operations and risky filesystem permissions, matching old behavior.

## Function Specs

### 1. Site Name

Legacy:

- Menu source: `boxinfo_website_subfunctions.asp`, link to `includes/website_name_edit.asp`.
- Form posts to `domainbind_actions.asp`.
- Action path uses `domainbind_actions.asp?action=editwebsitename`.
- Helper: `editwebsitename(...)` in `functions.inc`, and `edit_iis_name(site_Uid, site_name)` in `fn_site.inc`.
- IIS RPC: `/iis_api.asp`, `action=IIS_Member_IISEntry_SITENAME_EDIT&IIS_ID={iis_id}&site_name={site_name}`.

Behavior:

- Show current display site name.
- Validate non-empty, no path separators, no dangerous characters.
- Update IIS site name.
- Update `cp_config_Sites.site_name` / display/root fields exactly as old `editwebsitename` does.
- If root rename is selected, also rename folder and update paths.

API:

- `GET /api/hosting/sites/{siteUid}/functions/site-name`
- `POST /api/hosting/sites/{siteUid}/functions/site-name`

Request:

```json
{ "siteName": "newname", "renameRoot": true, "updatePath": true }
```

Implementation:

- Load owned site.
- Call typed IIS name edit RPC.
- Run DB update in transaction after successful RPC.
- If folder rename is needed, queue worker/ACL job instead of blocking.

Speed:

- Return updated site summary only.
- Do not reload all websites.

### 2. Mapped Path

Legacy:

- Menu source opens `treepick.asp?id={n}&sitepath={basedir}&currentpath={sitepath}`.
- Write path in `domainbind_actions.asp?action=updatesitepath`.
- If pool changes, old code inserts `workqueue type=changepool`.

Behavior:

- Show folder picker rooted inside `h:\root\home\{cpLogin}\www`.
- Save new `site_path`.
- If the pool/site binding needs moving, queue `changepool`.
- Reject any path outside CP home.

API:

- `GET /api/hosting/sites/{siteUid}/functions/mapped-path`
- `POST /api/hosting/sites/{siteUid}/functions/mapped-path`

Request:

```json
{ "sitePath": "h:\\root\\home\\openreward-001\\www\\site1" }
```

Underlying APIs:

- DB: `cp_config_Sites.site_path`
- Worker: `workqueue` type `changepool` when needed
- Optional IIS RPC for path binding should use `/iis_api.asp` action `IIS_Member_Binding_Path_Change` from `fn_site.inc`.

Speed:

- Folder tree API should load one directory at a time, not full tree.

### 3. ASP.NET Version

Legacy:

- Menu goes to `/cp/advance` or `domainbind_version_change.asp`.
- Forms post to `aspnetapp_action.asp`.
- Site runtime/sub-app helpers live in `fn_site.inc`.

Behavior:

- Show supported ASP.NET versions based on plan and PHP-only flags.
- Update selected app/site version.
- For PHP version edits, legacy may remove/add custom PHP script maps.

API:

- `GET /api/hosting/sites/{siteUid}/functions/aspnet-version`
- `POST /api/hosting/sites/{siteUid}/functions/aspnet-version`

Request:

```json
{ "version": "v4.0", "pipeline": "Integrated", "appPath": "/" }
```

Underlying:

- IIS RPC for `.NET` setting uses site/app path calls in `fn_site.inc`.
- DB: `cp_config_Sites.version`, possible sub-app records.

Optimization:

- Keep option list cached by plan type.

### 4. .NET Core Mode

Legacy:

- UI: `boxinfo_core_mode.asp`.
- Reads current mode by `remote_cmd2` PowerShell:
  - `Get-WebConfigurationProperty ... system.webServer/aspNetCore ... hostingModel`
- Posts to `aspnetapp_action.asp?action=set_HostingModel`.
- Helper: `set_HostingModel(site_Uid, Mode)` and `set_HostingModel_rpc`.
- RPC: `/iis_api.asp`, `action=set_HostingModel&IIS_ID={iis_id}&Mode={Mode}&apppath={apppath}`.

Behavior:

- Show current mode: `InProcess` or `OutOfProcess`.
- Allow apply to all Core apps.
- Recycle pool after change if old flow does so.

API:

- `GET /api/hosting/sites/{siteUid}/functions/core-mode`
- `POST /api/hosting/sites/{siteUid}/functions/core-mode`

Request:

```json
{ "mode": "InProcess", "applyAll": true, "appPath": "/" }
```

Speed:

- Do not call PowerShell per render. Cache for 30-60 seconds or read known DB value after first successful set.

### 5. Node.js App

Legacy:

- UI: `boxinfo_nodejs.asp`.
- Read status via `remote_cmd2` PowerShell checking `httpPlatformHandler`.
- Action: `nodejs_action.asp`.
- Create/delete URL rewrite rules through `/api/URLRewrite/create` via `httpcall4`.
- For permission repair, inserts `workqueue type=nodejs`.
- GitHub deploy also uses `boxinfo_nodejs_deploy.asp` and `nodejs_action.asp`.

Behavior:

- Show current status.
- Enable Node by startup file.
- Disable Node by removing rewrite rule.
- Support subfolder Node apps.
- GitHub Deploy supports repo URL, branch, token/deploy key, build command, start command, deploy method.

API:

- `GET /api/hosting/sites/{siteUid}/functions/nodejs-app`
- `POST /api/hosting/sites/{siteUid}/functions/nodejs-app`
- `POST /api/hosting/sites/{siteUid}/functions/github-deploy`

Requests:

```json
{ "mode": "ON", "startupFile": "server.js", "appPath": "/" }
```

```json
{
  "repoUrl": "https://github.com/user/repo",
  "branch": "main",
  "token": "...",
  "buildCommand": "npm install && npm run build",
  "startCommand": "npm start",
  "deployMethod": "git"
}
```

Underlying:

- URL Rewrite API: `/api/URLRewrite/create`
- Worker: `workqueue type=nodejs` and/or `deploy`
- DB: Node app/sub-app records from `fn_site.inc` helpers.

Optimization:

- Deploy should enqueue and stream/poll logs; never block the request.

### 6. PHP Version

Legacy:

- UI: `boxinfo_php_version.asp`.
- Action: `aspnetapp_action.asp?action=editversion`.
- For PHP mapping, old code removes and adds custom script maps:
  - `removeCustomScriptMap(site_uid, "Custom-PHP5-FastCGI-php")`
  - `addCustomScriptMap(site_uid, phpversion, "php")`

Behavior:

- Show available PHP versions.
- Update PHP handler for site.
- Update `cp_config_Sites.phpversion` if old DB does so.

API:

- `GET /api/hosting/sites/{siteUid}/functions/php-version`
- `POST /api/hosting/sites/{siteUid}/functions/php-version`

Request:

```json
{ "phpVersion": "8.2", "extension": "php" }
```

### 7. PHP Settings

Legacy:

- UI: `boxinfo_php_settings.asp`.
- Action: `php_settings_action.asp`.
- Writes php.ini through `/newfileman/save.asp`.
- Path is derived from site path and verified to include `session("cpLogin")`.

Behavior:

- Load current PHP settings text.
- Save edited config.
- Only allow writes to the computed php.ini path for that owned site.

API:

- `GET /api/hosting/sites/{siteUid}/functions/php-settings`
- `POST /api/hosting/sites/{siteUid}/functions/php-settings`

Request:

```json
{ "phpIni": "upload_max_filesize=64M\n..." }
```

Underlying:

- `/newfileman/save.asp`, form `utf=1&mypath={path}&file={content}`.

Optimization:

- Return checksum/version of php.ini; reject save if stale unless forced.

### 8. Detail Error

Legacy:

- UI: `boxinfo_detailerror.asp`.
- Reads current IIS error mode through `remote_cmd2`.
- Action: `aspnetapp_action.asp?action=detailerror`.
- DB update: `cp_config_sites.detailerror`.
- Remote command updates IIS/site config and recycles pool.

Behavior:

- Toggle detailed errors.
- Update DB flag and IIS config.

API:

- `GET /api/hosting/sites/{siteUid}/functions/detail-error`
- `POST /api/hosting/sites/{siteUid}/functions/detail-error`

Request:

```json
{ "enabled": true, "appPath": "/" }
```

### 9. Site On/Off

Legacy:

- UI: `boxinfo_siteonoff.asp`.
- JS posts `domainbind_actions.asp?action=startstopIIS`.
- Helpers: `start_IIS`, `stop_IIS`.
- RPC:
  - `/iis_api.asp`, `action=IIS_Member_IISEntry_Start&IIS_ID={iis_id}`
  - `/iis_api.asp`, `action=IIS_Member_IISEntry_Stop&IIS_ID={iis_id}`

Behavior:

- Show current running status.
- Toggle start/stop.
- Update UI after remote response.

API:

- `GET /api/hosting/sites/{siteUid}/functions/site-on-off`
- `POST /api/hosting/sites/{siteUid}/functions/site-on-off`

Request:

```json
{ "running": true }
```

### 10. Delete Website

Legacy:

- Menu calls JS `deletesite(site_uid, siteuid, sitename)`.
- Action handled by `domainbind_actions.asp?action=deletesite`.
- Must protect temp URL/default site cases.

Behavior:

- Confirm typed site name.
- Show impacted domains, redirects, SSL/free SSL, FTP path references, app pool assignment, scheduled tasks.
- Delete IIS entry first, then DB records.
- Do not allow deleting default/root website without same legacy safeguards.

API:

- `GET /api/hosting/sites/{siteUid}/functions/delete-website/preview`
- `DELETE /api/hosting/sites/{siteUid}`

Optimization:

- Use preview endpoint to compute dependencies once.

### 11. Domain Manager

Legacy:

- UI: `boxinfo_mapdomain.asp`.
- Action: `domainbind_actions.asp`.
- Supports add domain, delete domain, delete temp URL, move domain, VPS binding.
- Adds DNS zone/records with DNS helpers:
  - `deleteZone`
  - `addARecordOpt`
  - `DNSBuildZone`
- IIS binding helpers:
  - `add_IIS_domain_binding`
  - `delete_IIS_domain_binding`
- DB table:
  - `cp_config_Domains`

Behavior:

- List mapped domains.
- Add domain to IIS and DB.
- Create DNS zone/records when checked.
- Delete binding and DB row.
- Move domain to another site.
- Respect domain quotas and trial-domain restrictions.

API:

- `GET /api/hosting/sites/{siteUid}/functions/domain-manager`
- `POST /api/hosting/sites/{siteUid}/domains`
- `DELETE /api/hosting/sites/{siteUid}/domains/{domainUid}`
- `POST /api/hosting/sites/{siteUid}/domains/{domainUid}/move`

Speed:

- Validate domain availability/ownership concurrently with quota checks.
- DNS operations can be queued if slow, but IIS/DB state must remain consistent.

### 12. Visitor Stats

Legacy:

- UI: `boxinfo_webstats.asp`.
- Tied historically to WebDeploy/Remote IIS/AWStats password.

Behavior:

- Show visitor stats status and access info.
- Generate/repair stats user if required.
- Link/download report if available.

API:

- `GET /api/hosting/sites/{siteUid}/functions/visitor-stats`
- `POST /api/hosting/sites/{siteUid}/functions/visitor-stats/repair`

Need further mapping:

- Full AWStats generation path should be traced before live writes.

### 13. FTP Access

Legacy:

- UI: `boxinfo_ftp.asp`.
- Actions: `ftp_action.asp`.
- Helpers: `fn_ftp.inc`.
- Active latest source:
  - `functions.inc:createFTPSingle(...)`
  - `functions.inc:updateFtpUserPassword(...)`
  - `functions.inc:deleteFTP(...)`
  - Ignore `/ftp_api.asp` blocks because they are inside disabled `if 1 = 2 then ... end if` code.
- DB:
  - `cp_config_FTP`

Behavior:

- List FTP users scoped to site path.
- Create FTP user with quota/path/permission once exact Persits-compatible password encryption is available.
- Update password once exact Persits-compatible password encryption is available.
- Path/permission/quota update, enable/disable, and permission reset remain disabled because the latest implementation is inside `if 1 = 2` blocks.
- Delete removes the `cp_config_FTP` row.
- Root FTP user has extra protection.

API:

- `GET /api/hosting/sites/{siteUid}/functions/ftp-access`
- `POST /api/hosting/ftp/users`
- `PUT /api/hosting/ftp/users/{ftpUid}`
- `DELETE /api/hosting/ftp/users/{ftpUid}`

Security:

- Rebuild old salted MD5 agent password format for FTP agent.
- Keep DB password encryption compatible before storing real password; otherwise store remote-managed marker only if legacy can tolerate it.

### 14. VS Webdeploy

Legacy:

- UI: `boxinfo_webdeploy.asp`.
- Action: `iis_manager_webdeploy_action.asp`.
- Publish profile: `iis_manager_webdeploy_generate.asp`.
- Password change: `webdeploy_password_change.asp` -> `password_change_action?action=update_password_wd`.
- Remote IIS uses same credentials.

Behavior:

- Show WebDeploy/Remote IIS status.
- Toggle user.
- Generate publish profile.
- Fix ACL.
- Link password change.

API:

- `GET /api/hosting/sites/{siteUid}/functions/vs-webdeploy`
- `POST /api/hosting/sites/{siteUid}/functions/vs-webdeploy/toggle`
- `POST /api/hosting/sites/{siteUid}/functions/vs-webdeploy/fix-acl`
- `GET /api/hosting/sites/{siteUid}/functions/vs-webdeploy/publish-profile`

Underlying:

- `iis_manager_webdeploy_action.asp` calls ACL endpoint and checks IIS manager user.
- Publish settings must be generated server-side; do not expose password hash.

### 15. Github Deploy

Legacy:

- UI: `boxinfo_nodejs_deploy.asp`.
- Action: `nodejs_action.asp`, deploy request fields.
- Worker likely stores deploy job and logs; current rebuilt workqueue supports `deploy`.

Behavior:

- Support public/private repo.
- Private repo requires token or deploy key.
- Branch, build command, start command, deploy method.
- Log view.

API:

- `POST /api/hosting/sites/{siteUid}/functions/github-deploy`
- `GET /api/hosting/sites/{siteUid}/functions/github-deploy/jobs`
- `GET /api/hosting/deploy-jobs/{id}/logs`

Speed:

- Queue deploy and poll logs. Do not clone in request.

### 16. SMTP Sample Code

Legacy:

- UI: `boxinfo_smtp_code.asp`.
- Form posts to `setupOtherPlugins/smtpscriptsamples_action`.
- Shows code samples based on domain/site/language.

Behavior:

- Show sample code for common stacks: ASP.NET, PHP, Node.js, Python, classic ASP if legacy supports it.
- Let user select email/domain.
- Copy code.

API:

- `GET /api/hosting/sites/{siteUid}/functions/smtp-sample-code?domain=...&language=...`

No server writes expected.

### 17. IP Deny

Legacy:

- UI: `boxinfo_ipdeny.asp`.
- Menu direct href, not modal.
- Likely updates IIS IP security config and/or DB.

Behavior:

- List denied IPs/ranges.
- Add/remove deny rules.
- Support IPv4 validation and masks.
- Do not allow locking out platform/server IPs.

API:

- `GET /api/hosting/sites/{siteUid}/functions/ip-deny`
- `POST /api/hosting/sites/{siteUid}/functions/ip-deny`
- `DELETE /api/hosting/sites/{siteUid}/functions/ip-deny/{ruleId}`

Need further mapping:

- Trace `boxinfo_ipdeny.asp` full write path before live implementation.

### 18. IIS Log Manager

Legacy:

- UI: `rawlog_download.asp`.
- Download action: `rawlog_download_action.asp`.

Behavior:

- Show available raw logs for site.
- Download selected log/archive.
- Possibly queue generation/export.

API:

- `GET /api/hosting/sites/{siteUid}/functions/iis-log-manager`
- `POST /api/hosting/sites/{siteUid}/functions/iis-log-manager/export`
- `GET /api/hosting/rawlogs/{exportId}/download`

Speed:

- Build log archive in background for large folders.

### 19. Application Pool

Legacy:

- UI: `boxinfo_pool.asp`.
- Action: `apppoolmgr_action.asp`.
- Pool creation and site moves often use `workqueue`:
  - `type=createpool`
  - `type=changepool`
- Direct remote commands are used for recycle/delete/toggles:
  - `remote_cmd2`
  - `applicationPool_action_rpc`
- DB:
  - `cp_config_Pools`
  - `cp_config_Sites.pool_id`

Behavior:

- Show current pool and available pools.
- Move site to another pool.
- Create pool with RAM quota checks.
- Recycle/start/stop/delete pool.
- Toggle 32-bit and load user profile.
- Update RAM with quota enforcement.

API:

- `GET /api/hosting/sites/{siteUid}/functions/application-pool`
- `POST /api/hosting/sites/{siteUid}/functions/application-pool/change`
- `POST /api/hosting/pools`
- `POST /api/hosting/pools/{poolId}/action`
- `PUT /api/hosting/pools/{poolId}`
- `DELETE /api/hosting/pools/{poolId}`

Optimization:

- Pool list, quota, and current assignment in one GET.
- Use workqueue for create/change.

### 20. Outgoing Port

Legacy:

- UI: `/cp/remoteip`.
- Action: `sqlremoteip_action.asp`.
- Uses quota:
  - `getAddonQuotaByCpID(cpID, "MSSQLRemoteIP")`
  - `getDbRemoteIPCount(cpID)`
- Adds/removes firewall rule:
  - Windows: `set_Firewall_rpc(serverID, rulename, ip, port, "add_rule"|"del_rule")`
  - Linux old comments use `firewall-cmd`
- DB:
  - remote IP table behind `addDbRemoteIP`, `delDbRemoteIP`, `getDbRemoteIP`.

Behavior:

- List allowed outgoing IP/port rules.
- Add IP/port if quota remains.
- Delete only own rules.

API:

- `GET /api/hosting/functions/outgoing-port`
- `POST /api/hosting/functions/outgoing-port`
- `DELETE /api/hosting/functions/outgoing-port/{id}`

### 21. Create .Net App

Legacy:

- UI: `boxinfo_aspnetapp.asp`.
- Action: `aspnetapp_action.asp`.
- Helpers:
  - `createIISApp(site_Uid, AppPath)`
  - `deleteIISApp(site_Uid, AppPath)`
- RPC:
  - `/iis_api.asp`, `action=IIS_Member_App_Create&IIS_ID={iis_id}&apppath={AppPath}`
  - delete action exists in helpers.
- DB sub-app info:
  - `setSiteSubAppInfo`
  - `deleteSubAppInfo`

Behavior:

- List existing IIS applications.
- Create app under owned path.
- Delete app.
- Set app runtime/version.

API:

- `GET /api/hosting/sites/{siteUid}/functions/create-net-app`
- `POST /api/hosting/sites/{siteUid}/apps`
- `DELETE /api/hosting/sites/{siteUid}/apps/{appPath}`

### 22. Create Virtual Dir

Legacy:

- UI: `boxinfo_virtualdir.asp`.
- Action: `virtualdir_action.asp`.
- Helpers:
  - `createIISVD`
  - `deleteIISVD`
- RPC:
  - `/iis_api.asp`, `action=IIS_Member_VD_Create&isapp={isapp}&IIS_ID={iis_id}&vdirName={vdname}&vdpath={vdirpath}`
  - `/iis_api.asp`, `action=IIS_Member_VD_Delete&IIS_ID={iis_id}&vdirName={vdname}`

Behavior:

- Create virtual directory mapped to owned path.
- Optionally mark as app.
- Delete virtual directory.

API:

- `GET /api/hosting/sites/{siteUid}/functions/virtual-dir`
- `POST /api/hosting/sites/{siteUid}/virtual-directories`
- `DELETE /api/hosting/sites/{siteUid}/virtual-directories/{name}`

### 23. Force HTTPS

Legacy:

- Menu uses `/cp/boxinfo_redirect`.
- Action: `redirect_action.asp`.
- Uses URL Rewrite API:
  - `/api/URLRewrite/create`
  - `action=create|delete`
  - `webconfigPath`
  - `rulename`
  - `ruleString`
  - `serverid`
- DB:
  - `cp_config_redirect`

Behavior:

- Create Force HTTPS redirect rule per domain/site.
- Delete redirect rule.
- Existing redirect manager also handles arbitrary redirects.

API:

- `GET /api/hosting/sites/{siteUid}/functions/force-https`
- `POST /api/hosting/sites/{siteUid}/redirects`
- `DELETE /api/hosting/sites/{siteUid}/redirects/{id}`

Optimization:

- Generate rewrite XML/string server-side from typed request.

### 24. Default Doc

Legacy:

- UI: `xsetdefaultpage.asp`.
- Action: `setdefaultpage_action.asp`.
- Helper: `setIISDefaultPage`.
- RPC:
  - `/iis_api.asp`, `action=IIS_Member_DefaultPage_Edit&IIS_ID={iis_id}&defaultDocs={defaultDocs}`
- Read:
  - `IIS_Member_DefaultPage_Get`

Behavior:

- List default documents in order.
- Update ordered comma/list string.
- Validate names/extensions.

API:

- `GET /api/hosting/sites/{siteUid}/functions/default-doc`
- `POST /api/hosting/sites/{siteUid}/functions/default-doc`

Request:

```json
{ "defaultDocs": ["default.aspx", "index.html", "index.php"] }
```

### 25. Custom Errors

Legacy:

- UI: `xseterrorpage.asp`.
- Action: `seterrorpage_action.asp`.
- Helper: `setIISErrorPages`.
- RPC:
  - `/iis_api.asp`, `action=IIS_Member_ErrorPage_Edit&IIS_ID={iis_id}&errorType={errorType}&filepath={filepath}&defaultError={defaultError}`
- Read:
  - `IIS_Member_ErrorPage_Get`

Behavior:

- Configure error status page path or default error.
- Validate path belongs to site or is default.

API:

- `GET /api/hosting/sites/{siteUid}/functions/custom-errors`
- `POST /api/hosting/sites/{siteUid}/functions/custom-errors`

### 26. Mime Type

Legacy:

- UI: `mimemap.asp`.
- Action: `mimemap_action.asp`.
- RPC:
  - `get_mimeMap`: `/iis_api.asp`, `action=get_mimeMap&IIS_ID={iis_id}&apppath={AppPath}`
  - `add_mimeMap`: `/iis_api.asp`, `action=add_mimeMap&IIS_ID={iis_id}&apppath={AppPath}&fileExtension={ext}&mimeType={mimeType}`
  - `del_mimeMap`: `/iis_api.asp`, `action=del_mimeMap&IIS_ID={iis_id}&apppath={AppPath}&fileExtension={ext}`

Behavior:

- List MIME mappings.
- Add/delete mapping.
- Validate extension starts with `.` and MIME type format.

API:

- `GET /api/hosting/sites/{siteUid}/functions/mime-type`
- `POST /api/hosting/sites/{siteUid}/mime-types`
- `DELETE /api/hosting/sites/{siteUid}/mime-types/{extension}`

### 27. ScriptMap

Legacy:

- UI: `scriptmap.asp`.
- Action: `scriptmap_action.asp`.
- Helpers:
  - `getCustomScriptMap`
  - `addCustomScriptMap`
  - `removeCustomScriptMap`
- RPC:
  - `IIS_Member_IISEntry_CustomScriptMap_Get`
  - `IIS_Member_IISEntry_CustomScriptMap_Add`
  - `IIS_Member_IISEntry_CustomScriptMap_Remove`
- Restrictions:
  - Certain script type indexes only available to `W2` or `W1050` plan prefixes.

Behavior:

- List custom script maps.
- Add/remove maps.
- Enforce old plan restrictions.
- May call `remote_cmd2` after updates.

API:

- `GET /api/hosting/sites/{siteUid}/functions/script-map`
- `POST /api/hosting/sites/{siteUid}/script-maps`
- `DELETE /api/hosting/sites/{siteUid}/script-maps/{tagName}`

### 28. Remote IIS Manager

Legacy:

- UI: `boxinfo_remoteiis.asp`.
- Uses same status/action path as WebDeploy:
  - `iis_manager_webdeploy_action.asp`
  - `iis_manager_webdeploy_generate.asp`
  - `webdeploy_password_change.asp`
- Shows domain/server/user/publish info.

Behavior:

- Toggle Remote IIS user.
- Show connection settings.
- Fix ACL.
- Generate credentials/publish settings.

API:

- Same backend as `vs-webdeploy`, with `mode=remote-iis`.

### 29. Site Guard

Legacy:

- UI: `site_guard.asp`.
- Reads current config with `remote_cmd2`.
- Action uses `aspnetapp_action.asp?action=webknight`.
- Helper:
  - `IIS_Filter_webknight_rpc`
- RPC:
  - `/iis_api.asp`, `action=IIS_Filter_webknight&IIS_ID={iis_id}&FW_Action={FW_Action}`
- DB:
  - `cp_config_sites.webknight`

Behavior:

- Toggle Site Guard.
- Show warning text.
- Update IIS filter and DB flag.
- Must ask user to test site after enabling, matching old warning.

API:

- `GET /api/hosting/sites/{siteUid}/functions/site-guard`
- `POST /api/hosting/sites/{siteUid}/functions/site-guard`

Request:

```json
{ "enabled": true }
```

### 30. Schedule Tasks

Legacy:

- UI: `/cp/task`, plus `task_simple.asp`, `task_adv.asp`.
- Action: `task_action.asp`.
- DB:
  - `tasks`
- For Windows tasks, remote command:
  - `schtasks /create /tn "{cpLogin}-{taskID}" ...`
  - runs `C:\hosting\SCHEDULER\win_task.ps1 -taskID {taskID}`
- Quotas:
  - `getScheduleTaskQuotaByCpID`
  - `getWindowsTaskCountByCpID`
  - `getAddonQuotaByCpID(cpID, "AdditionalMassSMTP")`

Behavior:

- Add interval task or certain-time task.
- Validate URL, timeout, interval, day/time.
- Enforce quotas.
- Remove/update tasks.

API:

- `GET /api/hosting/tasks`
- `POST /api/hosting/tasks`
- `PUT /api/hosting/tasks/{taskId}`
- `DELETE /api/hosting/tasks/{taskId}`

Speed:

- Use DB insert transaction, then queue/execute Windows scheduler creation asynchronously.

## Implementation Phases

### Phase 1: Read-Only Drawers

Implement GET endpoints for all 30 functions and React drawers. This makes the UI navigable and lets us compare each panel with old ASP before enabling writes.

### Phase 2: Safe Worker-Backed Writes

Enable actions already mapped to `workqueue`:

- Application Pool create/change.
- Node.js permissions/deploy.
- File/path permissions.
- Long log exports.

### Phase 3: Typed Legacy Agent Writes

Enable direct remote APIs:

- IIS start/stop.
- Default docs.
- Custom errors.
- MIME map.
- Script map.
- Virtual directories.
- IIS apps.
- Site Guard.
- Domain IIS bindings.

### Phase 4: Credential-Sensitive Features

Enable after encryption compatibility is ported:

- FTP password storage.
- WebDeploy/Remote IIS password.
- Publish profile password.
- Any remote token helper required by `remote_cmd2`.

### Phase 5: Destructive Actions

Enable last, with previews and typed confirmation:

- Delete website.
- Delete domain/temp URL.
- Delete pool.
- Delete FTP user.
- Delete schedule task.

## Acceptance Criteria

- Every More Functions item opens a drawer/modal with the same controls and warnings as legacy ASP.
- Every write verifies site ownership server-side.
- Every remote call is typed and whitelisted.
- No action uses raw client-supplied command strings.
- Long actions return a job ID and do not block UI.
- Destructive actions have a preview and confirmation.
- DB writes use parameterized SQL and transactions where remote+DB consistency is required.
- UI reloads only the changed site/function data, not the entire panel.
- Legacy behavior differences must be documented in this file before implementation.
