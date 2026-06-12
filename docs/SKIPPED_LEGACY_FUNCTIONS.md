# Skipped Legacy Functions

This file records legacy control-panel/account-panel features that we intentionally do not rebuild. Add future skipped features here before removing them from specs or UI parity lists.

## Source Rules

- Latest source root: `/Users/erwinyu/Downloads/hosting`
- Fallback source root: `/Users/erwinyu/Downloads/cp8`
- Do not use folders whose names contain `nouse` or `no_use`.

## Skip List

| Feature | Area | Legacy Files | Reason | Replacement/Notes | Status | Date |
|---|---|---|---|---|---|---|
| WordPress Desk | Control Panel > Apps / CDN / Firewall | `/Users/erwinyu/Downloads/hosting/cp8/cp/wpdesk*.asp`; `/Users/erwinyu/Downloads/hosting/cp8/cp/wpdesk_cdn_action.asp`; `/Users/erwinyu/Downloads/hosting/cp8/cp/wpdesk_firewall_action.asp`; `/Users/erwinyu/Downloads/hosting/cp8/cp/wpdesk_websites_list_ajax.asp` | Intentionally skipped from the new Control Panel rebuild. | Keep generic CMS/plugin installation if WordPress appears in the app catalog. If CDN, firewall, or site-security behavior is rebuilt later, implement it under Websites/CDN/Security, not as WordPress Desk. | Skipped | 2026-06-12 |
