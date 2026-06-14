# Workqueue Usage Audit

Last checked: 2026-06-12

Rule: the rebuilt control panel may insert `ehbconfig.dbo.workqueue` rows only when the exact active Classic ASP source inserts `workqueue` or launches the same background worker. Direct IIS/API/DB actions must stay direct.

## Confirmed Queue Functions

| Area | Queue Type | Classic Source | Rebuild Status |
|---|---|---|---|
| MSSQL backup | `Queue MSSQL Backup` | `/Users/erwinyu/Downloads/hosting/cp8/cp/mssql_action.asp` | Allowed |
| MSSQL restore | `Queue MSSQL Restore` | `/Users/erwinyu/Downloads/hosting/cp8/cp/mssql_action.asp` | Allowed |
| MSSQL run SQL file | `Run MSSQL File` | `/Users/erwinyu/Downloads/hosting/cp8/cp/mssql_runsql.asp` | Allowed |
| MySQL backup | `Queue MySQL Backup` | `/Users/erwinyu/Downloads/hosting/cp8/cp/mysql_action.asp` | Allowed |
| MySQL restore | `Queue MySQL Restore` | `/Users/erwinyu/Downloads/hosting/cp8/cp/mysql_action.asp` | Allowed |
| File Manager zip | `zip` | `/Users/erwinyu/Downloads/hosting/cp8/cp/filemanager.asp` | Allowed |
| File Manager unzip | `Unzip` | `/Users/erwinyu/Downloads/hosting/cp8/cp/filemanager.asp`; newer JSON action can also do direct unzip when uploaded | Allowed only for file-manager unzip/agent path |
| File permissions | `perm` | `/Users/erwinyu/Downloads/hosting/cp8/cp/fileperm_action.asp`, `/Users/erwinyu/Downloads/hosting/cp8/cp/locksite.asp` | Allowed for exact permission/lock flows only |
| Application pool create | `createpool` | `/Users/erwinyu/Downloads/hosting/cp8/cp/apppoolmgr_action.asp` | Allowed only for explicit create action |
| Application pool change | `changepool` | `/Users/erwinyu/Downloads/hosting/cp8/cp/apppoolmgr_action.asp`, `/Users/erwinyu/Downloads/hosting/cp8/cp/domainbind_actions.asp` | Allowed only for explicit pool change side effect |
| Node.js setup/permission job | `nodejs` | `/Users/erwinyu/Downloads/hosting/cp8/cp/nodejs_action.asp`, `/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc` | Allowed only for explicit Node.js setup actions |
| GitHub deploy | `deploy` | `/Users/erwinyu/Downloads/hosting/cp8/cp/nodejs_action.asp` | Allowed only for explicit deploy action |
| Virus scan | `scanvirus` | `/Users/erwinyu/Downloads/hosting/cp8/cp/scanvirus_action.asp` | Allowed when scan UI is rebuilt |

## Not Queue Functions

| Area | Classic Source | Required Behavior |
|---|---|---|
| VS WebDeploy / Remote IIS enable-disable | `/Users/erwinyu/Downloads/hosting/cp8/cp/iis_manager_webdeploy_action.asp` | Direct calls to `/IIS_api.asp`; no queue. Currently blocked by the exact active password-source helper because latest `getCpPasswordHashByCpID` keeps its DB lookup inside `if 1 = 2`; `decryptpwd` itself is bridge-backed. |
| VS WebDeploy / Remote IIS Fix ACL | `/Users/erwinyu/Downloads/hosting/cp8/cp/iis_manager_webdeploy_action.asp` | Direct POST to `/tools/resetDefaultPermissionsBySiteUid.asp`; no queue. |
| Mapped Path | `/Users/erwinyu/Downloads/hosting/cp8/cp/domainbind_actions.asp` | Direct site-path validation/update first; `changepool` only as a specific side effect, not a generic queue job. |
| Site On/Off | `/Users/erwinyu/Downloads/hosting/cp8/cp/boxinfo_siteonoff.asp` plus IIS RPC helpers | Direct `/iis_api.asp` start/stop calls; no queue. |
| Outgoing Port | `/Users/erwinyu/Downloads/hosting/cp8/cp/sqlremoteip_action.asp` | Direct shared firewall API plus DB insert/delete; no queue. |
| FTP create/edit/delete | `/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc` active paths | Direct DB updates and/or active FTP agent calls; no queue. |

## Corrections Applied

- Removed `vs-webdeploy` from the generic Website More Functions queue branch.
- Removed `mapped-path` from the generic Website More Functions queue branch. It now follows the classic direct-first flow: call IIS path change, update `cp_config_Sites.site_path`, then queue `changepool` only as the exact pool side effect.
- Tightened Application Pool, Node.js, and GitHub Deploy so they only queue explicit supported legacy actions, not a generic submit.
- Application Pool direct actions now follow `apppoolmgr_action.asp`: start/stop/recycle call the IIS agent directly, RAM/32-bit/load-user-profile call the IIS agent then update `cp_config_Pools`, while only create/change insert queue rows.
- Deleted accidental test row `workqueue.id=2606584` created during the WebDeploy route smoke test.
