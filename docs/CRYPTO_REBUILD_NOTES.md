# Crypto Rebuild Notes

## Source Of Truth

Latest Classic ASP files checked:

- `/Users/erwinyu/Downloads/hosting/includes/encryption.asp`
- `/Users/erwinyu/Downloads/hosting/api/encrypt.asp`

The active Classic ASP encryption path is:

- Provider: `Microsoft Enhanced RSA and AES Cryptographic Provider`
- `alg1 = 26128`
- `hohokey1 = 32782`
- Wrapper keys are passed into `encryption(encryptkey, textpwd)` and `decryption(encryptkey, keyhex)`.

Known wrappers:

- `encryptpwd(...)` uses `importkey8`
- `encryptFTPpwd(...)` uses `ftpPWDkeyxxx`
- `encryptDBpwd(...)` uses `dbPWDkeyxxx`
- `encryptserverpwd(...)` uses `serverPWDkeyxxx`

## New Shared Helper

The rebuilt app now has `/Users/erwinyu/codex/Smarterasp-CP/CryptoHelper.cs`.

## Short-Lived Agent Transport

Not every encrypted value needs Persits compatibility. Many old control-panel flows encrypt request parameters only so server-to-server agent calls are hard to forge or inspect; those values are decrypted immediately and are not stored in legacy tables.

For rebuilt-only agent transport:

- Do not use Persits compatibility as a requirement.
- Use modern rebuilt encryption between ASP.NET and the whitelisted Classic ASP agent.
- Decrypt immediately inside the agent.
- Validate the decrypted value against ownership/path rules before doing any work.
- Keep port `830` IP-whitelisted so browsers cannot call these agents directly.
- Signing is optional for these internal agents when the network path is restricted; use it only when a feature explicitly needs replay protection.

For File Manager, ASP.NET encrypts `u`, `b`, `p`, and related path fields when `FILE_MANAGER_ENCRYPT_KEY` is set. The Classic ASP agent decrypts them and then enforces `h:\root\home\<cpLogin>\...` containment.

Use these methods for new rebuilt-only data:

- `CryptoHelper.Encrypt(encryptKey, plainText)`
- `CryptoHelper.Decrypt(encryptKey, payloadHex)`

This uses modern AES-GCM with PBKDF2-derived keys, random salt, random nonce, and an authenticated tag.

Use these methods only for compatibility experiments with the Google-suggested conversion:

- `CryptoHelper.EncryptPbkdf2AesCbcHex(encryptKey, plainText, saltValue, iterations)`
- `CryptoHelper.DecryptPbkdf2AesCbcHex(encryptKey, cipherHex, saltValue, iterations)`

## Important Compatibility Warning

The PBKDF2/AES-CBC helper is not proven to match Persits `CryptoManager.GenerateKeyFromPassword(...)`.

Do not use it to write legacy fields such as `cp_config_FTP.ftp_password`, `cp_config_FTP.pp1`, database-user passwords, or account passwords until we validate it against known Classic ASP ciphertext/plaintext pairs.

Needed validation samples:

- Plaintext password
- `encryptpwd(plaintext)` output
- `encryptFTPpwd(plaintext)` output
- `encryptDBpwd(plaintext)` output, if database-user writes are next

Once those match, replace the current FTP/DB blockers with calls through this helper.
