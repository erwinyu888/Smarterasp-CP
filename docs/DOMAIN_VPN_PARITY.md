# Domain and VPN Parity Notes

Latest source checked:

- `/Users/erwinyu/Downloads/hosting/cp8/account/vpn_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/domain_list.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/checkoutDomainBuy.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/dns_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/modifyContact_action.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/modifyWhoisStatus.asp`
- `/Users/erwinyu/Downloads/hosting/cp8/account/modifynameserver.asp`

Implemented updates:

- Domain list API now returns old-table action metadata: renewal availability, DNS/settings availability, legacy-equivalent action URLs, and transfer log/resubmit action labels.
- Domain table UI now shows renew, DNS manager, domain settings, and transfer log/resubmit actions based on the same status rules as `domain_list.asp`.
- Domain table Whois Privacy now uses an ON/OFF switch, blocks unsupported/expired domains, requires a purchased privacy add-on before enabling, respects `turnOnDate + 1`, and calls the registrar privacy action.
- VPN create/action endpoints no longer return placeholder success for live host mutations. They now return `409 Conflict` with the exact missing legacy dependencies, and perform no partial DB writes.

Remaining blockers:

- VPN lifecycle needs exact `encryptpwd` for `vpnclient_pwd`, `decryptserverpwd` for `vpnhost_pwd`, and a configured equivalent of `remoteSSHCommand` / `remoteSSHCommand2` through `member5.smarterasp.net/lcp/remote_cmd.php` before create/convert/delete/download can safely mutate live VPN hosts.
- OpenVPN config download needs the old file source path behavior for `C:\hosting\businessics\download\openvpn_client\<user>.ovpn` or a new secured file streaming bridge.
- Domain purchase completion still needs the full `checkoutDomainBuy.asp` post-payment path: account-balance check, `NewClientProductWithoutCommission`, multi-year renewal loop, `DomainRegisterInfo`, `domain_profile`, optional Whois privacy product, and cart row deletion.
- Domain DNS publishing still needs the exact legacy DNS helper configuration for `addARecordOpt`, `addAAAARecordOpt`, `addMXRecord`, `addTXTRecord`, `addSRVRecord`, `deleteRecordAt`, `deleteCNAMErecord`, and `deleteArecord`.
- Domain contact/nameserver/privacy/lock actions currently call OpenSRS directly. Full parity still needs the local DB/session behavior around `DomainRegisterInfo`, privacy eligibility, lock state, nameserver fallback, and profile updates from the old action files.
- Domain list initial privacy ON/OFF state currently uses the local purchased privacy row plus successful toggle overrides. Exact old behavior calls OpenSRS `getWhoisStatusInfo` per domain, which should be added carefully to avoid slowing the domain list.
