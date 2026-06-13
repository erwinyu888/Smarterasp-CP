using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml.Linq;

#nullable enable

namespace controlpanel
{
    public class Startup
    {
        private static readonly object LoginFailureLock = new();
        private static readonly Dictionary<string, LoginFailureWindow> LoginFailures = new(StringComparer.OrdinalIgnoreCase);
        private const int ConstPageTypeNewCp = 1;
        private const int ConstPageTypeNewSite = 2;
        private const int ConstPageTypeBuyDomain = 3;
        private const int ConstPageTypeTransferDomain = 4;
        private const int ConstPageTypeCpRenew = 5;
        private const int ConstPageTypeWebQuota = 6;
        private const int ConstPageTypeMssqlDb = 7;
        private const int ConstPageTypeMssqlQuota = 8;
        private const int ConstPageTypeMysqlDb = 9;
        private const int ConstPageTypeMysqlQuota = 10;
        private const int ConstPageTypeIp = 12;
        private const int ConstPageTypeSsl = 13;
        private const int ConstPageTypeFullRestore = 14;
        private const int ConstPageTypeEmailQuota = 17;
        private const int ConstPageTypeWhoisPrivacy = 19;
        private const int ConstPageTypeReseller = 20;
        private const int ConstPageTypeGeneral = 22;
        private const int ConstPageTypeWebUser = 23;
        private const int ConstPageTypeDailySentLimit = 24;
        private const int ConstPageTypeCustomBackup = 26;
        private const int ConstPageTypeMailingList = 27;
        private const int ConstPageTypeSsrs = 28;
        private const int ConstPageTypeTasks = 29;
        private const int ConstPageTypeHourlySentLimit = 30;
        private const int ConstPageTypeSqlJob = 31;
        private const int ConstPageTypeRam = 32;
        private const int ConstPageTypeWebsiteFirewall = 33;
        private const int ConstPageTypeWindowsTask = 34;
        private const int ConstPageTypeCorpEmailQuota = 35;
        private const int ConstPageTypeFileCountLimit = 36;
        private const int ConstPageTypeVpn = 37;
        private const int ConstPageTypeCloudBackup = 38;
        private const int ConstPageTypeDataBackup = 39;
        private const string FileManagerEditAllowlist = ".json|.js|.cshtml|.htaccess|.ashx|.cer|.asax|.pl|.asp|.ascx|.aspx|.php|.asa|.config|.bas|.vbs|.xml|.htm|.html|.txt|.sql|.css|.tar|.url|.cfm|.shtml|.shtm|.ssi|.cs|.vb|.xaml|.master|.inc|.sitemap|";
        private const int ConstPageTypeServerBackup = 40;

        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDistributedMemoryCache();
            services.AddSession(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
                options.IdleTimeout = TimeSpan.FromHours(8);
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseSession();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapPost("/api/auth/login", HandleLoginAsync);
                endpoints.MapGet("/api/auth/login-config", HandleLoginConfigAsync);
                endpoints.MapGet("/api/auth/me", HandleCurrentUserAsync);
                endpoints.MapPost("/api/auth/logout", HandleLogoutAsync);
                endpoints.MapPost("/api/auth/password-reset/request", HandlePasswordResetRequestAsync);
                endpoints.MapPost("/api/auth/password-reset/confirm", HandlePasswordResetConfirmAsync);
                endpoints.MapGet("/api/account/service-status", HandleAccountServiceStatusAsync);
                endpoints.MapGet("/api/dev/crypto/self-test", HandleCryptoSelfTestAsync);
                endpoints.MapGet("/api/account/dashboard", HandleAccountDashboardAsync);
                endpoints.MapPost("/api/account/urgent-logs/{logId:int}/hide", HandleHideUrgentLogAsync);
                endpoints.MapGet("/api/account/domains", HandleAccountDomainsAsync);
                endpoints.MapGet("/api/account/domains/{domainId:int}/profile", HandleDomainProfileAsync);
                endpoints.MapPost("/api/account/domains/search", HandleDomainAvailabilitySearchAsync);
                endpoints.MapPost("/api/account/domains/checkout-preview", HandleDomainCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/domains/checkout", HandleDomainCheckoutAsync);
                endpoints.MapPost("/api/account/domains/{domainId:int}/dns-preview", HandleDomainDnsPreviewAsync);
                endpoints.MapPost("/api/account/domains/{domainId:int}/registrar-action", HandleDomainRegistrarActionAsync);
                endpoints.MapGet("/api/account/billing", HandleAccountBillingAsync);
                endpoints.MapPost("/api/account/billing/deposit", HandleBillingDepositAsync);
                endpoints.MapGet("/api/account/billing/orders/{orderId:int}/invoice", HandleBillingInvoiceAsync);
                endpoints.MapGet("/api/account/renewals", HandleAccountRenewalsAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/hide", HandleHideRenewalNoticeAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/renew", HandleRenewalCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/checkout", HandleRenewalCheckoutAsync);
                endpoints.MapPost("/api/account/renewals/checkout-many", HandleMultipleRenewalCheckoutAsync);
                endpoints.MapGet("/api/account/vpn", HandleAccountVpnAsync);
                endpoints.MapPost("/api/account/vpn/checkout", HandleVpnCheckoutAsync);
                endpoints.MapPost("/api/account/vpn/users", HandleVpnUserCreatePreviewAsync);
                endpoints.MapPost("/api/account/vpn/users/{vpnClientId:int}/action", HandleVpnUserActionAsync);
                endpoints.MapGet("/api/account/addons", HandleAccountAddonsAsync);
                endpoints.MapPost("/api/account/addons/checkout-preview", HandleAddonCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/addons/checkout", HandleAddonCheckoutAsync);
                endpoints.MapGet("/api/account/affiliate", HandleAccountAffiliateAsync);
                endpoints.MapPost("/api/account/affiliate/withdraw-preview", HandleAffiliateWithdrawPreviewAsync);
                endpoints.MapPost("/api/account/affiliate/withdraw", HandleAffiliateWithdrawAsync);
                endpoints.MapGet("/api/account/new-orders/catalog", HandleNewOrderCatalogAsync);
                endpoints.MapPost("/api/account/new-orders/checkout", HandleNewOrderCheckoutAsync);
                endpoints.MapPost("/api/account/new-orders/domain-transfer/checkout", HandleDomainTransferCheckoutAsync);
                endpoints.MapGet("/api/account/new-purchase/catalog", HandleNewPurchaseCatalogAsync);
                endpoints.MapPost("/api/account/new-purchase/start", HandleNewPurchaseStartAsync);
                endpoints.MapPost("/api/account/new-purchase/complete", HandleNewPurchaseCompleteAsync);
                endpoints.MapGet("/api/account/settings", HandleAccountSettingsAsync);
                endpoints.MapPost("/api/account/settings/profile", HandleAccountProfileUpdateAsync);
                endpoints.MapPost("/api/account/settings/password", HandleAccountPasswordChangeAsync);
                endpoints.MapPost("/api/account/settings/email-change", HandleAccountEmailChangeRequestAsync);
                endpoints.MapGet("/api/account/settings/email-change/verify", HandleAccountEmailChangeVerifyAsync);
                endpoints.MapPost("/api/account/activation/resend", HandleAccountActivationResendAsync);
                endpoints.MapPost("/api/account/reverify/send", HandleAccountReverifySendAsync);
                endpoints.MapPost("/api/account/password-expiring/skip", HandlePasswordExpiringSkipAsync);
                endpoints.MapPost("/api/account/password-change/code", HandlePasswordChangeCodeAsync);
                endpoints.MapPost("/api/account/settings/2fa/disable", HandleAccountTwoFactorDisableAsync);
                endpoints.MapGet("/api/account/checkout-temp/{guid}", HandleCheckoutTempOrderAsync);
                endpoints.MapPost("/api/account/checkout-temp/{guid}/pay-with-balance", HandleCheckoutPayWithBalanceAsync);
                endpoints.MapGet("/api/account/renew-temp/{guid}", HandleRenewTempOrderAsync);
                endpoints.MapPost("/api/account/renew-temp/{guid}/pay-with-balance", HandleRenewTempPayWithBalanceAsync);
                endpoints.MapGet("/legacy-checkout/{**path}", HandleLegacyCheckoutBridgeRedirectAsync);
                endpoints.MapMethods("/legacy-checkout/{**path}", new[] { "HEAD" }, HandleLegacyCheckoutBridgeRedirectAsync);
                endpoints.MapGet("/api/hosting/dashboard", HandleHostingDashboardAsync);
                endpoints.MapGet("/api/hosting/sites", HandleHostingSitesAsync);
                endpoints.MapGet("/api/hosting/sites/{siteUid:int}/functions/{functionKey}", HandleHostingSiteFunctionGetAsync);
                endpoints.MapPost("/api/hosting/sites/{siteUid:int}/functions/{functionKey}", HandleHostingSiteFunctionPostAsync);
                endpoints.MapGet("/api/hosting/databases", HandleHostingDatabasesAsync);
                endpoints.MapGet("/api/hosting/databases/deleted", HandleHostingDeletedDatabasesAsync);
                endpoints.MapGet("/api/hosting/databases/backup-schedules", HandleHostingDatabaseBackupSchedulesAsync);
                endpoints.MapPost("/api/hosting/databases/{engine}/{id:long}/backup", HandleHostingDatabaseBackupAsync);
                endpoints.MapPost("/api/hosting/databases/{engine}/{id:long}/restore", HandleHostingDatabaseRestoreAsync);
                endpoints.MapPost("/api/hosting/databases/mssql/{id:long}/run-sql-file", HandleHostingDatabaseRunSqlFileAsync);
                endpoints.MapDelete("/api/hosting/databases/{engine}/{id:long}", HandleHostingDatabaseDeleteAsync);
                endpoints.MapPost("/api/hosting/databases/{engine}/{id:long}/backup-schedules", HandleHostingDatabaseBackupScheduleCreateAsync);
                endpoints.MapDelete("/api/hosting/databases/backup-schedules/{id:long}", HandleHostingDatabaseBackupScheduleDeleteAsync);
                endpoints.MapGet("/api/hosting/databases/{engine}/{id:long}/connection-string", HandleHostingDatabaseConnectionStringAsync);
                endpoints.MapGet("/api/hosting/databases/mssql-report-users", HandleHostingMssqlReportUsersAsync);
                endpoints.MapPost("/api/hosting/databases/mssql-report-users", HandleHostingMssqlReportUserMutationAsync);
                endpoints.MapPut("/api/hosting/databases/mssql-report-users/{login}", HandleHostingMssqlReportUserMutationAsync);
                endpoints.MapDelete("/api/hosting/databases/mssql-report-users/{login}", HandleHostingMssqlReportUserMutationAsync);
                endpoints.MapGet("/api/hosting/emails", HandleHostingEmailsAsync);
                endpoints.MapPost("/api/hosting/emails/{domain}/password-reset", HandleHostingEmailPasswordResetAsync);
                endpoints.MapPut("/api/hosting/emails/{domain}/quota", HandleHostingEmailQuotaUpdateAsync);
                endpoints.MapDelete("/api/hosting/emails/{domain}", HandleHostingEmailDeleteAsync);
                endpoints.MapGet("/api/hosting/ftp", HandleHostingFtpAsync);
                endpoints.MapPost("/api/hosting/ftp/users", HandleHostingFtpUserCreateAsync);
                endpoints.MapPut("/api/hosting/ftp/users/{login}", HandleHostingFtpUserUpdateAsync);
                endpoints.MapPost("/api/hosting/ftp/users/{login}/status", HandleHostingFtpUserStatusAsync);
                endpoints.MapPost("/api/hosting/ftp/users/{login}/permissions/reset", HandleHostingFtpUserPermissionResetAsync);
                endpoints.MapDelete("/api/hosting/ftp/users/{login}", HandleHostingFtpUserDeleteAsync);
                endpoints.MapGet("/api/hosting/files/browse", HandleHostingFilesBrowseAsync);
                endpoints.MapGet("/api/hosting/files/agent-health", HandleHostingFileAgentHealthAsync);
                endpoints.MapPost("/api/hosting/files/action", HandleHostingFileActionAsync);
                endpoints.MapGet("/api/hosting/runtime", HandleHostingRuntimeAsync);
                endpoints.MapGet("/api/hosting/security", HandleHostingSecurityAsync);
                endpoints.MapPost("/api/hosting/dns/preview", HandleHostingDnsPreviewAsync);
                endpoints.MapPost("/api/hosting/cdn/action", HandleHostingCdnActionAsync);
                endpoints.MapPost("/api/hosting/ssl/action", HandleHostingSslActionAsync);
                endpoints.MapGet("/api/hosting/activity", HandleHostingActivityAsync);
                endpoints.MapPost("/api/hosting/workqueue", HandleHostingWorkqueueCreateAsync);
                endpoints.MapPost("/api/hosting/activity/test", HandleHostingActivityTestCreateAsync);
                endpoints.MapPut("/api/hosting/activity/test/{id:long}", HandleHostingActivityTestUpdateAsync);
                endpoints.MapDelete("/api/hosting/activity/test/{id:long}", HandleHostingActivityTestDeleteAsync);
                endpoints.MapPost("/api/hosting/real-test", HandleHostingRealTestCreateAsync);
                endpoints.MapPut("/api/hosting/real-test/{id:long}", HandleHostingRealTestUpdateAsync);
                endpoints.MapDelete("/api/hosting/real-test/{area}/{id:long}", HandleHostingRealTestDeleteAsync);
                endpoints.MapPost("/api/hosting/sites/provision", HandleHostingSiteProvisionAsync);
                endpoints.MapPost("/api/hosting/databases/provision", HandleHostingDatabaseProvisionAsync);
                endpoints.MapPost("/api/hosting/emails/provision", HandleHostingEmailProvisionAsync);
                endpoints.MapPost("/api/hosting/ftp/provision", HandleHostingFtpProvisionAsync);
                endpoints.MapGet("/api/hosting/apps", HandleHostingAppsAsync);
                endpoints.MapPost("/api/hosting/apps/install-preview", HandleHostingAppInstallPreviewAsync);
                endpoints.MapPost("/api/hosting/apps/install", HandleHostingAppInstallAsync);
                endpoints.MapGet("/api/hosting/apps/install/{jobId:long}", HandleHostingAppInstallStatusAsync);
                endpoints.MapGet("/api/hosting/apps/{pluginId:int}/requirements", HandleHostingAppRequirementsAsync);
                endpoints.MapFallbackToFile("index.html");
            });
        }

        private async Task HandleAccountServiceStatusAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountServiceStatusResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var openSrs = GetOpenSrsSettings();
            var services = new AccountServiceStatus(
                new ExternalServiceStatus(
                    "OpenSRS registrar",
                    openSrs.IsConfigured,
                    openSrs.IsConfigured
                        ? "Configured for live domain search and registrar actions."
                        : "Not configured in this running app. Set OPENSRS_API_URL, OPENSRS_USERNAME, and OPENSRS_PRIVATE_KEY or OpenSrs appsettings.",
                    openSrs.IsConfigured ? "Live" : "Needs config"
                ),
                new ExternalServiceStatus(
                    "CP DNS",
                    false,
                    "DNS record publishing uses the legacy CP DNS server helpers. Those helper/API settings are still needed before live DNS updates can be enabled.",
                    "Pending"
                )
            );

            await Results.Ok(new AccountServiceStatusResponse(true, "Service status loaded.", services)).ExecuteAsync(context);
        }

        private async Task HandleCryptoSelfTestAsync(HttpContext context)
        {
            var key = ConfigOrEnv("Crypto:ModernKey", "CONTROL_PANEL_CRYPTO_KEY", "local-dev-crypto-key").Trim();
            if (string.IsNullOrWhiteSpace(key))
            {
                key = "local-dev-crypto-key";
            }

            var compatibilitySalt = ConfigOrEnv("Crypto:Pbkdf2CompatibilitySalt", "PBKDF2_COMPATIBILITY_SALT", "local-dev-salt").Trim();
            if (string.IsNullOrWhiteSpace(compatibilitySalt))
            {
                compatibilitySalt = "local-dev-salt";
            }

            var sampleText = "controlpanel-self-test";
            var encrypted = CryptoHelper.Encrypt(key, sampleText);
            var decrypted = CryptoHelper.Decrypt(key, encrypted);
            var googleStyle = CryptoHelper.EncryptPbkdf2AesCbcHex(key, sampleText, compatibilitySalt);

            await Results.Ok(new
            {
                success = decrypted == sampleText && !string.IsNullOrWhiteSpace(encrypted),
                modernRoundTrip = decrypted == sampleText,
                modernPayloadHexLength = encrypted.Length,
                pbkdf2AesCbcSampleHexLength = googleStyle.Length,
                legacyPersitsCompatibility = "Not validated. Needs known Classic ASP plaintext/ciphertext pairs before use for existing FTP/DB/account password fields."
            }).ExecuteAsync(context);
        }

        private async Task HandleAccountDashboardAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new DashboardResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var customer = await LoadCustomerSummaryAsync(connection, sessionUser.CustomerId);
            var hostingAccounts = await LoadHostingAccountsAsync(connection, sessionUser.CustomerId);
            var statusSummary = await LoadHostingStatusSummaryAsync(connection, sessionUser.CustomerId);
            var urgentLogs = await LoadUrgentLogsAsync(connection, sessionUser.CustomerId);

            var dashboard = new AccountDashboard(
                customer,
                hostingAccounts,
                statusSummary,
                BuildRenewalNotices(hostingAccounts),
                urgentLogs
            );

            await Results.Ok(new DashboardResponse(true, "Dashboard loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHideUrgentLogAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "logId", out var logId))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Invalid urgent log id.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
UPDATE dbo.customer_urgent_log
SET hide = 1
WHERE customer_urgent_log_id = @logId
  AND customer_profile_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@logId", logId);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            var updated = await command.ExecuteNonQueryAsync();

            await Results.Ok(new AccountActionResponse(
                updated > 0,
                updated > 0 ? "Urgent notice hidden." : "Urgent notice was not found for this account."
            )).ExecuteAsync(context);
        }

        private async Task HandleAccountDomainsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountDomainsResponse(false, "Not signed in.", new List<AccountDomainSummary>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var domains = await LoadAccountDomainsAsync(connection, sessionUser.CustomerId);
            await Results.Ok(new AccountDomainsResponse(true, "Domains loaded.", domains)).ExecuteAsync(context);
        }

        private async Task HandleDomainProfileAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new DomainProfileResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!int.TryParse(Convert.ToString(context.Request.RouteValues["domainId"]), out var domainId) || domainId <= 0)
            {
                await Results.BadRequest(new DomainProfileResponse(false, "Invalid domain id.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var profile = await LoadDomainProfileAsync(connection, sessionUser.CustomerId, domainId);
            if (profile == null)
            {
                await Results.NotFound(new DomainProfileResponse(false, "Domain profile was not found for this account.", null)).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new DomainProfileResponse(true, "Domain profile loaded.", profile)).ExecuteAsync(context);
        }

        private async Task HandleDomainAvailabilitySearchAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new DomainAvailabilityResponse(false, "Not signed in.", new List<DomainAvailabilityResult>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainAvailabilityRequest>();
            var requestedDomains = request?.Domains ?? new List<string>();
            var normalized = new List<string>();
            foreach (var domain in requestedDomains)
            {
                var name = NormalizeDomainName(domain);
                if (!string.IsNullOrWhiteSpace(name) && !normalized.Contains(name))
                {
                    normalized.Add(name);
                }
            }

            if (normalized.Count == 0)
            {
                await Results.BadRequest(new DomainAvailabilityResponse(false, "Enter at least one domain to search.", new List<DomainAvailabilityResult>())).ExecuteAsync(context);
                return;
            }

            if (normalized.Count > 12)
            {
                normalized = normalized.GetRange(0, 12);
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var ownedDomains = await LoadAccountDomainsAsync(connection, sessionUser.CustomerId);
            var owned = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var domain in ownedDomains)
            {
                owned.Add(domain.DomainName);
            }

            using var httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(8)
            };
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Smarterasp-ControlPanel-Rebuild/1.0");

            var openSrs = GetOpenSrsSettings();
            var checks = new List<Task<DomainAvailabilityResult>>();
            foreach (var domainName in normalized)
            {
                checks.Add(owned.Contains(domainName)
                    ? Task.FromResult(new DomainAvailabilityResult(domainName, false, "Already in your account", "account"))
                    : CheckDomainAvailabilityAsync(httpClient, domainName, openSrs));
            }

            var results = new List<DomainAvailabilityResult>(await Task.WhenAll(checks));

            await Results.Ok(new DomainAvailabilityResponse(true, "Domain availability checked.", results)).ExecuteAsync(context);
        }

        private async Task HandleDomainCheckoutPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutPreviewResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainCheckoutRequest>();
            var domains = request?.Domains ?? new List<DomainCheckoutItem>();
            var normalized = new List<DomainCheckoutItem>();
            foreach (var domain in domains)
            {
                var name = NormalizeDomainName(domain.DomainName);
                if (string.IsNullOrWhiteSpace(name))
                {
                    continue;
                }

                normalized.Add(new DomainCheckoutItem(name, Math.Max(0m, domain.Price)));
            }

            if (normalized.Count == 0)
            {
                await Results.BadRequest(new CheckoutPreviewResponse(false, "Add at least one domain to checkout.", null)).ExecuteAsync(context);
                return;
            }

            var total = 0m;
            foreach (var item in normalized)
            {
                total += item.Price;
            }

            var preview = new CheckoutPreview(
                $"DOMAIN-{Guid.NewGuid():N}",
                "Domain checkout check",
                normalized.Count,
                total,
                "USD",
                "/checkout/domain-preview",
                "Validated cart input. Continue checkout to create the domain temp order.",
                normalized
            );

            await Results.Ok(new CheckoutPreviewResponse(true, "Domain checkout check ready.", preview)).ExecuteAsync(context);
        }

        private async Task HandleDomainCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainCheckoutRequest>();
            var domains = request?.Domains ?? new List<DomainCheckoutItem>();
            var normalized = new List<DomainCheckoutItem>();
            foreach (var domain in domains)
            {
                var name = NormalizeDomainName(domain.DomainName);
                if (!string.IsNullOrWhiteSpace(name))
                {
                    normalized.Add(new DomainCheckoutItem(name, Math.Max(0m, domain.Price)));
                }
            }

            if (normalized.Count == 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Add at least one domain to checkout.", null)).ExecuteAsync(context);
                return;
            }

            var total = 0m;
            foreach (var item in normalized)
            {
                total += item.Price;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            await SyncDomainSessionCartAsync(connection, context.Session.Id, sessionUser.CustomerId, normalized);
            var cartTotal = await LoadDomainSessionCartTotalAsync(connection, sessionUser.CustomerId);
            if (cartTotal > 0m)
            {
                total = cartTotal;
            }

            var domainList = string.Join(",", normalized.ConvertAll(item => item.DomainName));
            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                468,
                "Domain Registration",
                total,
                domainList,
                "USD",
                "",
                "",
                "",
                ConstPageTypeBuyDomain
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                "Domain Registration",
                total,
                "USD",
                ConstPageTypeBuyDomain,
                "Created sitecart.dbo.sessionCart rows and oms.dbo.buyer_temp order using the active /account domain checkout flow."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "Domain checkout order created.", order)).ExecuteAsync(context);
        }

        private async Task HandleDomainRegistrarActionAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "domainId", out var domainId))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Invalid domain id.")).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainRegistrarActionRequest>();
            var action = NormalizeAccountText(request?.Action, 40).ToLowerInvariant();
            var value = NormalizeAccountText(request?.Value, 600);

            var allowedActions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "nameservers",
                "contact",
                "privacy-on",
                "privacy-off",
                "lock",
                "unlock",
                "status",
                "auth-code",
                "auto-renew-on",
                "auto-renew-off",
                "forwarding",
                "dns"
            };

            if (!allowedActions.Contains(action))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Select a valid registrar action.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var domains = await LoadAccountDomainsAsync(connection, sessionUser.CustomerId);
            var domain = domains.Find(item => item.Id == domainId);
            if (domain == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Domain was not found on this account."),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            if (action is "nameservers" or "lock" or "unlock" or "privacy-on" or "privacy-off" or "status" or "auth-code" or "contact" or "auto-renew-on" or "auto-renew-off" or "forwarding")
            {
                var openSrs = GetOpenSrsSettings();
                if (!openSrs.IsConfigured)
                {
                    await Results.Problem("Missing OpenSRS API settings.").ExecuteAsync(context);
                    return;
                }

                var credential = await LoadDomainCredentialAsync(connection, sessionUser.CustomerId, domain.RegisterInfoId);
                if (credential == null)
                {
                    await Results.BadRequest(new AccountActionResponse(false, "Domain manager profile credentials were not found for this domain.")).ExecuteAsync(context);
                    return;
                }

                using var httpClient = new HttpClient
                {
                    Timeout = TimeSpan.FromSeconds(15)
                };
                httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Smarterasp-ControlPanel-Rebuild/1.0");

                var remoteIp = context.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                var result = action switch
                {
                    "nameservers" => await UpdateDomainNameserversWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, value, remoteIp),
                    "privacy-on" => await UpdateDomainWhoisPrivacyWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, true, remoteIp),
                    "privacy-off" => await UpdateDomainWhoisPrivacyWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, false, remoteIp),
                    "status" => await GetDomainStatusWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, remoteIp),
                    "auth-code" => await GetDomainAuthCodeWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, remoteIp),
                    "contact" => await UpdateDomainContactWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, value, remoteIp),
                    "auto-renew-on" => await UpdateDomainExpireActionWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, true, remoteIp),
                    "auto-renew-off" => await UpdateDomainExpireActionWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, false, remoteIp),
                    "forwarding" => await UpdateDomainForwardingWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, value, remoteIp),
                    _ => await UpdateDomainLockWithOpenSrsAsync(httpClient, openSrs, domain.DomainName, credential, action == "lock", remoteIp)
                };

                await Results.Json(new AccountActionResponse(result.Success, result.Message), statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
                return;
            }

            await Results.BadRequest(new AccountActionResponse(
                false,
                $"Use the DNS preview endpoint for DNS records on {domain.DomainName}."
            )).ExecuteAsync(context);
        }

        private async Task HandleDomainDnsPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new DomainDnsPreviewResponse(false, "Not signed in.", new List<DomainDnsRecordPreview>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "domainId", out var domainId))
            {
                await Results.BadRequest(new DomainDnsPreviewResponse(false, "Invalid domain id.", new List<DomainDnsRecordPreview>())).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainDnsPreviewRequest>();
            var recordsText = request?.Records ?? "";

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var domains = await LoadAccountDomainsAsync(connection, sessionUser.CustomerId);
            var domain = domains.Find(item => item.Id == domainId);
            if (domain == null)
            {
                await Results.Json(
                    new DomainDnsPreviewResponse(false, "Domain was not found on this account.", new List<DomainDnsRecordPreview>()),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var parseResult = ParseDnsRecords(recordsText, domain.DomainName);
            if (!parseResult.Success)
            {
                await Results.BadRequest(new DomainDnsPreviewResponse(false, parseResult.Message, parseResult.Records)).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new DomainDnsPreviewResponse(
                true,
                $"DNS records for {domain.DomainName} are valid. Live DNS zone publishing uses the legacy CP DNS server helpers, not OpenSRS XCP, so it is waiting on the CP DNS API configuration.",
                parseResult.Records
            )).ExecuteAsync(context);
        }

        private async Task HandleAccountBillingAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountBillingResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var defaultStart = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1));
            var defaultEnd = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1));
            var purchaseStart = ReadQueryDate(context, "purchaseStart", defaultStart);
            var purchaseEnd = ReadQueryDate(context, "purchaseEnd", defaultEnd);
            if (purchaseEnd < purchaseStart)
            {
                (purchaseStart, purchaseEnd) = (purchaseEnd, purchaseStart);
            }

            var activeProducts = await LoadActiveProductsAsync(connection, sessionUser.CustomerId);
            var purchases = await LoadRecentPurchasesAsync(connection, sessionUser.CustomerId, purchaseStart, purchaseEnd);
            var renewalNotices = await LoadProductRenewalsAsync(connection, sessionUser.CustomerId, 30);
            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);
            var creditTransactions = await LoadCreditTransactionsAsync(connection, sessionUser.CustomerId);
            var pendingCheckouts = await LoadPendingCheckoutTempOrdersAsync(connection, sessionUser.CustomerId);
            var pendingRenewCheckouts = await LoadPendingRenewTempOrdersAsync(connection, sessionUser.CustomerId);

            var billing = new AccountBillingDashboard(
                new AccountBalanceSummary(balance, "USD", "OMS credit ledger"),
                activeProducts,
                purchases,
                renewalNotices,
                creditTransactions,
                pendingCheckouts,
                pendingRenewCheckouts
            );

            await Results.Ok(new AccountBillingResponse(true, "Billing loaded.", billing)).ExecuteAsync(context);
        }

        private async Task HandleBillingInvoiceAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new BillingInvoiceResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "orderId", out var orderId))
            {
                await Results.BadRequest(new BillingInvoiceResponse(false, "Missing order.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var invoice = await LoadBillingInvoiceAsync(connection, sessionUser.CustomerId, orderId);
            if (invoice == null)
            {
                await Results.Json(
                    new BillingInvoiceResponse(false, "Invoice was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new BillingInvoiceResponse(true, "Invoice loaded.", invoice)).ExecuteAsync(context);
        }

        private async Task HandleBillingDepositAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<BillingDepositRequest>();
            var amount = Math.Round(Math.Max(0m, request?.Amount ?? 0m), 2);
            if (amount < 1m)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Deposit amount must be at least $1.00.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var eligibility = await LoadDepositEligibilityAsync(connection, sessionUser.CustomerId);
            if (!eligibility.Eligible)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, eligibility.Message, null)).ExecuteAsync(context);
                return;
            }

            var checkoutUrl = $"{GetLegacyCheckoutBaseUrl()}/checkout/deposit_v2?amount={Uri.EscapeDataString(amount.ToString("0.00", CultureInfo.InvariantCulture))}";
            var order = new CheckoutOrder(
                $"DEPOSIT-{Guid.NewGuid():N}",
                checkoutUrl,
                "Account Balance Deposit",
                amount,
                "USD",
                ConstPageTypeGeneral,
                "Prepared a deposit checkout handoff using the active /checkout/deposit_v2 flow. No credit is added until checkout payment succeeds."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "Deposit checkout ready.", order)).ExecuteAsync(context);
        }

        private async Task HandleAccountRenewalsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountRenewalsResponse(false, "Not signed in.", new List<AccountProductSummary>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var renewals = await LoadProductRenewalsAsync(connection, sessionUser.CustomerId, 30);
            await Results.Ok(new AccountRenewalsResponse(true, "Renewals loaded.", renewals)).ExecuteAsync(context);
        }

        private async Task HandleHideRenewalNoticeAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "clientProductId", out var clientProductId))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Missing renewal item.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var ownsProduct = await CustomerOwnsClientProductAsync(connection, sessionUser.CustomerId, clientProductId);
            if (!ownsProduct)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Renewal item was not found for this account."),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            const string sql = @"
UPDATE oms.dbo.client_product
SET noshowrenew = 1
WHERE client_product_id = @clientProductId
  AND client_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@clientProductId", clientProductId);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            await Results.Ok(new AccountActionResponse(true, "Renewal notice hidden.")).ExecuteAsync(context);
        }

        private async Task HandleRenewalCheckoutPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new RenewalCheckoutResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "clientProductId", out var clientProductId))
            {
                await Results.BadRequest(new RenewalCheckoutResponse(false, "Missing renewal item.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var renewal = await LoadRenewalCheckoutPreviewAsync(connection, sessionUser.CustomerId, clientProductId);
            if (renewal == null)
            {
                await Results.Json(
                    new RenewalCheckoutResponse(false, "Renewal item was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new RenewalCheckoutResponse(true, "Renewal checkout check ready.", renewal)).ExecuteAsync(context);
        }

        private async Task HandleRenewalCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "clientProductId", out var clientProductId))
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Missing renewal item.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var renewal = await LoadRenewalCheckoutPreviewAsync(connection, sessionUser.CustomerId, clientProductId);
            if (renewal == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Renewal item was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                renewal.ProductId,
                renewal.Name,
                renewal.Amount,
                renewal.PaymentTerm,
                renewal.Currency,
                renewal.ClientProductId.ToString(CultureInfo.InvariantCulture),
                "",
                "",
                ConstPageTypeCpRenew
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                renewal.Name,
                renewal.Amount,
                renewal.Currency,
                ConstPageTypeCpRenew,
                "Created oms.dbo.buyer_temp renewal order using the legacy cp_renew_1.asp parameter layout."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "Renewal checkout order created.", order)).ExecuteAsync(context);
        }

        private async Task HandleMultipleRenewalCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<MultipleRenewalCheckoutRequest>();
            var clientProductIds = new List<int>();
            foreach (var id in request?.ClientProductIds ?? new List<int>())
            {
                if (id > 0 && !clientProductIds.Contains(id))
                {
                    clientProductIds.Add(id);
                }
            }

            if (clientProductIds.Count == 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Select at least one renewal item.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var orders = new List<CheckoutOrder>();
            decimal total = 0m;
            foreach (var clientProductId in clientProductIds)
            {
                var renewal = await LoadRenewalCheckoutPreviewAsync(connection, sessionUser.CustomerId, clientProductId);
                if (renewal == null)
                {
                    continue;
                }

                total += renewal.Amount;
                var guid = await CreateBuyerTempOrderAsync(
                    connection,
                    sessionUser.CustomerId,
                    renewal.ProductId,
                    renewal.Name,
                    renewal.Amount,
                    renewal.PaymentTerm,
                    renewal.Currency,
                    renewal.ClientProductId.ToString(CultureInfo.InvariantCulture),
                    "",
                    "",
                    ConstPageTypeCpRenew
                );

                orders.Add(new CheckoutOrder(
                    guid,
                    BuildLegacyCheckoutUrl(guid),
                    renewal.Name,
                    renewal.Amount,
                    renewal.Currency,
                    ConstPageTypeCpRenew,
                    "Created oms.dbo.buyer_temp renewal order using the legacy renewal page type."
                ));
            }

            if (orders.Count == 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "No selected renewal items were found for this account.", null)).ExecuteAsync(context);
                return;
            }

            var first = orders[0];
            var message = orders.Count == 1
                ? "Renewal checkout order created."
                : $"Created {orders.Count} renewal checkout orders totaling {total.ToString("C", CultureInfo.GetCultureInfo("en-US"))}. Open the first checkout to continue.";

            await Results.Ok(new CheckoutCreateResponse(
                true,
                message,
                first with
                {
                    Title = orders.Count == 1 ? first.Title : $"{orders.Count} Renewal Items",
                    Amount = orders.Count == 1 ? first.Amount : total,
                    Note = orders.Count == 1 ? first.Note : "Legacy renewal checkout is stored as one temp order per selected product. This opens the first checkout order."
                }
            )).ExecuteAsync(context);
        }

        private async Task HandleAccountVpnAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountVpnResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var services = await LoadVpnServicesAsync(connection, sessionUser.CustomerId);
            var quota = await LoadVpnQuotaAsync(connection, sessionUser.CustomerId);
            var catalog = await LoadVpnCatalogAsync(connection, sessionUser.CustomerType);
            var dashboard = new AccountVpnDashboard(services.Count, quota, services, catalog);

            await Results.Ok(new AccountVpnResponse(true, "VPN services loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleVpnCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<VpnCheckoutRequest>();
            if (request == null || request.ProductId <= 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Select a VPN product.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadVpnCatalogAsync(connection, sessionUser.CustomerType);
            var product = catalog.Find(item => item.ProductId == request.ProductId);
            if (product == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Selected VPN product is not available.", null)).ExecuteAsync(context);
                return;
            }

            var selectedPrice = product.Prices.Find(price => price.PriceId == request.PriceId);
            if (selectedPrice == null && product.Prices.Count > 0)
            {
                selectedPrice = product.Prices[0];
            }

            if (selectedPrice == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                return;
            }

            var quantity = Math.Clamp(request.Quantity, 1, 99);
            var amount = selectedPrice.Amount * quantity;
            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                product.ProductId,
                product.Name,
                amount,
                selectedPrice.PaymentTerm,
                selectedPrice.Currency,
                quantity.ToString(CultureInfo.InvariantCulture),
                "",
                selectedPrice.PriceId.ToString(CultureInfo.InvariantCulture),
                ConstPageTypeVpn
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                product.Name,
                amount,
                selectedPrice.Currency,
                ConstPageTypeVpn,
                "Created oms.dbo.buyer_temp VPN order using the add-on VPN checkout page type."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "VPN checkout order created.", order)).ExecuteAsync(context);
        }

        private async Task HandleVpnUserCreatePreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<VpnUserCreateRequest>();
            var user = NormalizeAccountText(request?.User, 80);
            var password = request?.Password ?? "";
            var type = NormalizeAccountText(request?.Type, 40);
            var area = NormalizeAccountText(request?.Area, 80);

            if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(password))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Enter a VPN username and password.")).ExecuteAsync(context);
                return;
            }

            if (password.Length < 8)
            {
                await Results.BadRequest(new AccountActionResponse(false, "VPN password must be at least 8 characters.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var used = (await LoadVpnServicesAsync(connection, sessionUser.CustomerId)).Count;
            var quota = await LoadVpnQuotaAsync(connection, sessionUser.CustomerId);
            if (quota > 0 && used >= quota)
            {
                await Results.BadRequest(new AccountActionResponse(false, "VPN quota is full. Buy another VPN service before creating a new user.")).ExecuteAsync(context);
                return;
            }

            var location = string.IsNullOrWhiteSpace(area) ? "automatic location" : area;
            var vpnType = string.IsNullOrWhiteSpace(type) ? "IKEv2" : type;
            await Results.Ok(new AccountActionResponse(
                true,
                $"{user} passed account and quota checks for {vpnType} in {location}. Live VPN host provisioning is queued for the control-plane worker step."
            )).ExecuteAsync(context);
        }

        private async Task HandleVpnUserActionAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (!TryReadRouteInt(context, "vpnClientId", out var vpnClientId))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Invalid VPN user id.")).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<VpnUserActionRequest>();
            var action = NormalizeAccountText(request?.Action, 40).ToLowerInvariant();
            var allowedActions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "openvpn",
                "download-config",
                "reset-password",
                "delete"
            };

            if (!allowedActions.Contains(action))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Select a valid VPN action.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var services = await LoadVpnServicesAsync(connection, sessionUser.CustomerId);
            var service = services.Find(item => item.VpnClientId == vpnClientId);
            if (service == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "VPN user was not found on this account."),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var actionLabel = action switch
            {
                "openvpn" => "OpenVPN conversion",
                "download-config" => "configuration download",
                "reset-password" => "password reset",
                "delete" => "VPN user deletion",
                _ => "VPN action"
            };

            await Results.Ok(new AccountActionResponse(
                true,
                $"{actionLabel} is ready for {service.User}. Live VPN host changes are intentionally held for the worker/provisioning step."
            )).ExecuteAsync(context);
        }

        private async Task HandleAccountAddonsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountAddonsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadAddonCatalogAsync(connection, sessionUser.CustomerType);
            var activeAddons = await LoadActiveAddonsAsync(connection, sessionUser.CustomerId);
            var hostingAccounts = await LoadHostingAccountsAsync(connection, sessionUser.CustomerId);
            var dashboard = new AccountAddonsDashboard(catalog, activeAddons, hostingAccounts);

            await Results.Ok(new AccountAddonsResponse(true, "Add-ons loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleAddonCheckoutPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutPreviewResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AddonCheckoutRequest>();
            var items = request?.Items ?? new List<AddonCheckoutItem>();
            if (items.Count == 0)
            {
                await Results.BadRequest(new CheckoutPreviewResponse(false, "Add at least one add-on to checkout.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadAddonCatalogAsync(connection, sessionUser.CustomerType);
            var catalogByProduct = new Dictionary<int, AddonCatalogProduct>();
            foreach (var product in catalog)
            {
                catalogByProduct[product.ProductId] = product;
            }
            var hostingAccounts = await LoadHostingAccountsAsync(connection, sessionUser.CustomerId);

            var validated = new List<CheckoutLineItem>();
            foreach (var item in items)
            {
                if (!catalogByProduct.TryGetValue(item.ProductId, out var product))
                {
                    await Results.BadRequest(new CheckoutPreviewResponse(false, $"Add-on {item.ProductId} is not available.", null)).ExecuteAsync(context);
                    return;
                }

                var selectedPrice = product.Prices.Find(price => price.PriceId == item.PriceId);
                if (selectedPrice == null && product.Prices.Count > 0)
                {
                    selectedPrice = product.Prices[0];
                }
                if (selectedPrice == null)
                {
                    await Results.BadRequest(new CheckoutPreviewResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                    return;
                }

                var quantity = Math.Clamp(item.Quantity, 1, 99);
                var targetCpId = Math.Max(0, item.CpId);
                if (targetCpId > 0 && !hostingAccounts.Exists(account => account.CpId == targetCpId))
                {
                    await Results.BadRequest(new CheckoutPreviewResponse(false, $"Hosting account {targetCpId} was not found on this account.", null)).ExecuteAsync(context);
                    return;
                }

                validated.Add(new CheckoutLineItem(
                    product.ProductId,
                    product.Name,
                    FormatPaymentTerm(selectedPrice.PaymentTerm),
                    quantity,
                    selectedPrice.Amount,
                    selectedPrice.Currency
                ));
            }

            var total = 0m;
            foreach (var item in validated)
            {
                total += item.UnitAmount * item.Quantity;
            }

            var preview = new CheckoutPreview(
                $"ADDON-{Guid.NewGuid():N}",
                "Add-on checkout check",
                validated.Count,
                total,
                "USD",
                "/checkout/addon-preview",
                "Validated catalog prices. Continue checkout to create the add-on temp order.",
                validated
            );

            await Results.Ok(new CheckoutPreviewResponse(true, "Add-on checkout check ready.", preview)).ExecuteAsync(context);
        }

        private async Task HandleAddonCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AddonCheckoutRequest>();
            var items = request?.Items ?? new List<AddonCheckoutItem>();
            if (items.Count == 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Add at least one add-on to checkout.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadAddonCatalogAsync(connection, sessionUser.CustomerType);
            var catalogByProduct = new Dictionary<int, AddonCatalogProduct>();
            foreach (var product in catalog)
            {
                catalogByProduct[product.ProductId] = product;
            }
            var hostingAccounts = await LoadHostingAccountsAsync(connection, sessionUser.CustomerId);

            var orders = new List<CheckoutOrder>();
            foreach (var item in items)
            {
                if (!catalogByProduct.TryGetValue(item.ProductId, out var product))
                {
                    await Results.BadRequest(new CheckoutCreateResponse(false, $"Add-on {item.ProductId} is not available.", null)).ExecuteAsync(context);
                    return;
                }

                var selectedPrice = product.Prices.Find(price => price.PriceId == item.PriceId);
                if (selectedPrice == null && product.Prices.Count > 0)
                {
                    selectedPrice = product.Prices[0];
                }
                if (selectedPrice == null)
                {
                    await Results.BadRequest(new CheckoutCreateResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                    return;
                }

                var quantity = Math.Clamp(item.Quantity, 1, 99);
                var targetCpId = Math.Max(0, item.CpId);
                var targetHosting = targetCpId > 0 ? hostingAccounts.Find(account => account.CpId == targetCpId) : null;
                if (targetCpId > 0 && targetHosting == null)
                {
                    await Results.BadRequest(new CheckoutCreateResponse(false, $"Hosting account {targetCpId} was not found on this account.", null)).ExecuteAsync(context);
                    return;
                }

                var amount = selectedPrice.Amount * quantity;
                var pageType = DetermineAddonPageType(product.Name);
                var guid = await CreateBuyerTempOrderAsync(
                    connection,
                    sessionUser.CustomerId,
                    product.ProductId,
                    product.Name,
                    amount,
                    selectedPrice.PaymentTerm,
                    selectedPrice.Currency,
                    targetHosting != null ? targetHosting.ClientProductId.ToString(CultureInfo.InvariantCulture) : quantity.ToString(CultureInfo.InvariantCulture),
                    selectedPrice.PriceId.ToString(CultureInfo.InvariantCulture),
                    targetHosting != null ? targetHosting.CpId.ToString(CultureInfo.InvariantCulture) : "",
                    pageType
                );

                orders.Add(new CheckoutOrder(
                    guid,
                    BuildLegacyCheckoutUrl(guid),
                    product.Name,
                    amount,
                    selectedPrice.Currency,
                    pageType,
                    "Created oms.dbo.buyer_temp add-on order using the legacy temp checkout layout."
                ));
            }

            await Results.Ok(new CheckoutCreateResponse(true, $"Created {orders.Count} add-on checkout order{(orders.Count == 1 ? "" : "s")}.", orders[0] with { Note = orders.Count == 1 ? orders[0].Note : $"Created {orders.Count} separate legacy temp checkout orders. Open the first checkout URL to continue." })).ExecuteAsync(context);
        }

        private async Task HandleAccountAffiliateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountAffiliateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var referrals = await LoadAffiliateReferralsAsync(connection, sessionUser.CustomerId);
            var commissions = await LoadAffiliateCommissionsAsync(connection, sessionUser.CustomerId);
            var payouts = await LoadAffiliatePayoutsAsync(connection, sessionUser.CustomerId);
            var summary = BuildAffiliateSummary(referrals, commissions, payouts);
            var dashboard = new AccountAffiliateDashboard(
                sessionUser.CustomerId,
                sessionUser.Login,
                summary,
                referrals,
                commissions,
                payouts
            );

            await Results.Ok(new AccountAffiliateResponse(true, "Affiliate data loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleAffiliateWithdrawPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AffiliateWithdrawResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AffiliateWithdrawRequest>();
            var amount = Math.Max(0m, request?.Amount ?? 0m);
            var method = request?.Method?.Trim() ?? "account-credit";

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var referrals = await LoadAffiliateReferralsAsync(connection, sessionUser.CustomerId);
            var commissions = await LoadAffiliateCommissionsAsync(connection, sessionUser.CustomerId);
            var payouts = await LoadAffiliatePayoutsAsync(connection, sessionUser.CustomerId);
            var summary = BuildAffiliateSummary(referrals, commissions, payouts);
            var preview = BuildAffiliateWithdrawPreview(amount, method, summary, referrals);

            await Results.Ok(new AffiliateWithdrawResponse(true, "Affiliate withdraw checked.", preview)).ExecuteAsync(context);
        }

        private async Task HandleAffiliateWithdrawAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AffiliateWithdrawResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AffiliateWithdrawRequest>();
            var amount = Math.Max(0m, request?.Amount ?? 0m);
            var method = request?.Method?.Trim() ?? "paypal";
            var paypal = request?.Paypal?.Trim() ?? "";

            var isPaypal = method.Equals("paypal", StringComparison.OrdinalIgnoreCase)
                || method.Equals("cash", StringComparison.OrdinalIgnoreCase);
            var isCredit = method.Equals("account-credit", StringComparison.OrdinalIgnoreCase)
                || method.Equals("credit", StringComparison.OrdinalIgnoreCase);
            if (!isPaypal && !isCredit)
            {
                await Results.BadRequest(new AffiliateWithdrawResponse(false, "Select account credit or PayPal payout.", null)).ExecuteAsync(context);
                return;
            }

            if (isPaypal && !IsValidEmail(paypal))
            {
                await Results.BadRequest(new AffiliateWithdrawResponse(false, "Enter a valid PayPal email address.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var referrals = await LoadAffiliateReferralsAsync(connection, sessionUser.CustomerId);
            var commissions = await LoadAffiliateCommissionsAsync(connection, sessionUser.CustomerId);
            var payouts = await LoadAffiliatePayoutsAsync(connection, sessionUser.CustomerId);
            var summary = BuildAffiliateSummary(referrals, commissions, payouts);
            var preview = BuildAffiliateWithdrawPreview(amount, method, summary, referrals);
            if (!preview.Eligible)
            {
                await Results.BadRequest(new AffiliateWithdrawResponse(false, preview.Note, preview)).ExecuteAsync(context);
                return;
            }

            if (isCredit)
            {
                var oms = GetLegacyOmsSettings();
                if (!oms.IsConfigured)
                {
                    await Results.BadRequest(new AffiliateWithdrawResponse(false, oms.MissingMessage, preview)).ExecuteAsync(context);
                    return;
                }

                var call = await PostLegacyOmsOperationAsync(
                    oms,
                    "WithdrawCommission",
                    new Dictionary<string, string>
                    {
                        ["clientid"] = sessionUser.CustomerId.ToString(CultureInfo.InvariantCulture),
                        ["credit"] = amount.ToString("0.00", CultureInfo.InvariantCulture),
                        ["cashoutmethod"] = "credit"
                    });
                if (!call.Success)
                {
                    await Results.Json(
                        new AffiliateWithdrawResponse(false, call.Message, preview with { Note = call.Message }),
                        statusCode: StatusCodes.Status502BadGateway
                    ).ExecuteAsync(context);
                    return;
                }

                await Results.Ok(new AffiliateWithdrawResponse(
                    true,
                    "Affiliate commission converted to account balance.",
                    preview with { Note = call.Message }
                )).ExecuteAsync(context);
                return;
            }

            await CreateAffiliateCashoutRequestAsync(connection, sessionUser.CustomerId, amount, paypal);
            var submitted = preview with { Note = $"PayPal payout request submitted for {paypal}. Status: pending." };

            await Results.Ok(new AffiliateWithdrawResponse(true, "Affiliate payout request submitted.", submitted)).ExecuteAsync(context);
        }

        private async Task HandleNewOrderCatalogAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new NewOrderCatalogResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var type = NormalizeNewOrderType(context.Request.Query["type"].ToString());
            if (string.IsNullOrWhiteSpace(type) || !IsCatalogNewOrderType(type))
            {
                await Results.BadRequest(new NewOrderCatalogResponse(false, "Select a valid new order type.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadNewOrderCatalogAsync(connection, sessionUser.CustomerType, type);
            var response = new NewOrderCatalog(
                type,
                NewOrderTitle(type),
                NewOrderLegacyPath(type),
                NewOrderDescription(type),
                catalog
            );

            await Results.Ok(new NewOrderCatalogResponse(true, "New order catalog loaded.", response)).ExecuteAsync(context);
        }

        private async Task HandleNewOrderCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<NewOrderCheckoutRequest>();
            var type = NormalizeNewOrderType(request?.Type ?? "");
            if (request == null || string.IsNullOrWhiteSpace(type) || !IsCatalogNewOrderType(type) || request.ProductId <= 0)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Select a valid product to order.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadNewOrderCatalogAsync(connection, sessionUser.CustomerType, type);
            var product = catalog.Find(item => item.ProductId == request.ProductId);
            if (product == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Selected product is not available in this order catalog.", null)).ExecuteAsync(context);
                return;
            }

            var selectedPrice = product.Prices.Find(price => price.PriceId == request.PriceId);
            if (selectedPrice == null && product.Prices.Count > 0)
            {
                selectedPrice = product.Prices[0];
            }

            if (selectedPrice == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                return;
            }

            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                product.ProductId,
                product.Name,
                selectedPrice.Amount,
                selectedPrice.PaymentTerm,
                selectedPrice.Currency,
                "",
                "",
                selectedPrice.PriceId.ToString(CultureInfo.InvariantCulture),
                ConstPageTypeNewCp
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                product.Name,
                selectedPrice.Amount,
                selectedPrice.Currency,
                ConstPageTypeNewCp,
                $"Created oms.dbo.buyer_temp new-order checkout from {NewOrderLegacyPath(type)}."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "New order checkout created.", order)).ExecuteAsync(context);
        }

        private async Task HandleNewPurchaseCatalogAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new NewPurchaseCatalogResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var type = NormalizeNewOrderType(context.Request.Query["type"].ToString());
            if (string.IsNullOrWhiteSpace(type) || !IsCatalogNewOrderType(type))
            {
                await Results.BadRequest(new NewPurchaseCatalogResponse(false, "Select a valid new purchase type.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadNewOrderCatalogAsync(connection, sessionUser.CustomerType, type);
            var response = new NewPurchaseCatalog(
                type,
                NewOrderTitle(type),
                NewOrderLegacyPath(type),
                NewOrderDescription(type),
                catalog,
                NewPurchaseTracePath(type)
            );

            await Results.Ok(new NewPurchaseCatalogResponse(true, "New purchase catalog loaded.", response)).ExecuteAsync(context);
        }

        private async Task HandleNewPurchaseStartAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new NewPurchaseStartResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<NewPurchaseStartRequest>();
            var type = NormalizeNewOrderType(request?.Type ?? "");
            if (request == null || string.IsNullOrWhiteSpace(type) || !IsCatalogNewOrderType(type) || request.ProductId <= 0)
            {
                await Results.BadRequest(new NewPurchaseStartResponse(false, "Select a valid product to order.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var catalog = await LoadNewOrderCatalogAsync(connection, sessionUser.CustomerType, type);
            var product = catalog.Find(item => item.ProductId == request.ProductId);
            if (product == null)
            {
                await Results.BadRequest(new NewPurchaseStartResponse(false, "Selected product is not available in this purchase catalog.", null)).ExecuteAsync(context);
                return;
            }

            var selectedPrice = product.Prices.Find(price => price.PriceId == request.PriceId) ?? product.Prices.FirstOrDefault();
            if (selectedPrice == null)
            {
                await Results.BadRequest(new NewPurchaseStartResponse(false, $"{product.Name} has no available billing terms.", null)).ExecuteAsync(context);
                return;
            }

            var isResellerPurchase = type == "reseller";
            var orderGuid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                product.ProductId,
                product.Name,
                selectedPrice.Amount,
                selectedPrice.PaymentTerm,
                selectedPrice.Currency,
                "",
                "",
                "",
                isResellerPurchase ? ConstPageTypeReseller : ConstPageTypeNewCp
            );

            var branch = isResellerPurchase ? "none" : NewPurchaseRecommendedBranch(product.Name);
            var recommended = isResellerPurchase ? new List<AddonCatalogProduct>() : await LoadNewPurchaseRecommendedAsync(connection, branch);
            var payload = new NewPurchaseStarted(
                orderGuid,
                NewOrderLegacyPath(type),
                NewPurchaseRecommendedLegacyPath(branch),
                branch,
                product,
                selectedPrice,
                recommended,
                isResellerPurchase
                    ? "Created oms.dbo.buyer_temp like cp_purchase_list_reseller.asp through addon_purchase_action.asp."
                    : $"Created oms.dbo.buyer_temp like cp_purchase_list_action.asp, then moved to {NewPurchaseRecommendedLegacyPath(branch)}."
            );

            await Results.Ok(new NewPurchaseStartResponse(true, "New purchase temp order created.", payload)).ExecuteAsync(context);
        }

        private async Task HandleNewPurchaseCompleteAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new CheckoutCreateResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<NewPurchaseCompleteRequest>();
            if (request == null || string.IsNullOrWhiteSpace(request.OrderGuid))
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Missing purchase order guid.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var mainOrder = await LoadCheckoutTempOrderAsync(connection, sessionUser.CustomerId, request.OrderGuid);
            if (mainOrder == null)
            {
                await Results.NotFound(new CheckoutCreateResponse(false, "New purchase temp order was not found.", null)).ExecuteAsync(context);
                return;
            }

            decimal total = mainOrder.Amount;
            string additionalProduct = "";
            if (request.IncludeRecommended && request.RecommendedProductId > 0)
            {
                var branch = NormalizeRecommendedBranch(request.Branch);
                var recommended = await LoadNewPurchaseRecommendedAsync(connection, branch);
                var product = recommended.Find(item => item.ProductId == request.RecommendedProductId);
                var selectedPrice = product?.Prices.Find(price => price.PriceId == request.RecommendedPriceId) ?? product?.Prices.FirstOrDefault();
                if (product == null || selectedPrice == null)
                {
                    await Results.BadRequest(new CheckoutCreateResponse(false, "Selected recommended add-on is not available.", null)).ExecuteAsync(context);
                    return;
                }

                total += selectedPrice.Amount;
                additionalProduct = product.Name;
                await CreateBuyerTempOrderAsync(
                    connection,
                    sessionUser.CustomerId,
                    product.ProductId,
                    product.Name,
                    total,
                    selectedPrice.PaymentTerm,
                    selectedPrice.Currency,
                    "",
                    "",
                    "",
                    RecommendedBranchPageType(branch),
                    trackable: true
                );
            }

            var order = new CheckoutOrder(
                mainOrder.Id,
                BuildLegacyAccountScreenCheckoutUrl(mainOrder.Id),
                string.IsNullOrWhiteSpace(additionalProduct) ? mainOrder.ProductName : $"{mainOrder.ProductName} + {additionalProduct}",
                total,
                mainOrder.Info2,
                mainOrder.PageType,
                "Continues to /checkout/account_screen?guid=... like goto_temp_checkout(order_guid)."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "New purchase is ready for checkout.", order)).ExecuteAsync(context);
        }

        private async Task HandleDomainTransferCheckoutAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutCreateResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<DomainTransferCheckoutRequest>();
            var domainName = NormalizeDomainName(request?.DomainName ?? "");
            if (string.IsNullOrWhiteSpace(domainName) || !domainName.Contains('.', StringComparison.Ordinal))
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Enter a valid domain name to transfer.", null)).ExecuteAsync(context);
                return;
            }

            var tld = DomainTld(domainName);
            if (string.IsNullOrWhiteSpace(tld))
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "Unable to read the domain extension.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            if (await DomainTransferExistsAsync(connection, domainName))
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, "This domain is already in the domain transfer or domain profile system.", null)).ExecuteAsync(context);
                return;
            }

            var quote = await LoadDomainTransferQuoteAsync(connection, tld);
            if (quote == null)
            {
                await Results.BadRequest(new CheckoutCreateResponse(false, $"No transfer price was found for .{tld}.", null)).ExecuteAsync(context);
                return;
            }

            var amount = quote.Amount + (request?.WhoisPrivacy == true ? 8m : 0m);
            var productName = request?.WhoisPrivacy == true ? "Domain Transfer + Whois Privacy" : "Domain Transfer";
            var guid = await CreateBuyerTempOrderAsync(
                connection,
                sessionUser.CustomerId,
                468,
                productName,
                amount,
                quote.PaymentTerm,
                quote.Currency,
                domainName,
                request?.WhoisPrivacy == true ? "WhoisPrivacy" : "",
                tld,
                ConstPageTypeTransferDomain
            );

            var order = new CheckoutOrder(
                guid,
                BuildLegacyCheckoutUrl(guid),
                $"{productName} - {domainName}",
                amount,
                quote.Currency,
                ConstPageTypeTransferDomain,
                "Created oms.dbo.buyer_temp domain transfer order. Registrar transfer approval continues after checkout."
            );

            await Results.Ok(new CheckoutCreateResponse(true, "Domain transfer checkout created.", order)).ExecuteAsync(context);
        }

        private async Task HandleAccountSettingsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountSettingsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var settings = await LoadAccountSettingsAsync(connection, sessionUser.CustomerId);
            await Results.Ok(new AccountSettingsResponse(true, "Account settings loaded.", settings)).ExecuteAsync(context);
        }

        private async Task HandleAccountProfileUpdateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountSettingsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AccountProfileUpdateRequest>();
            var name = NormalizeAccountText(request?.Name, 120);
            var companyName = NormalizeAccountText(request?.CompanyName, 120);
            var browserLanguage = NormalizeAccountText(request?.BrowserLanguage, 120);
            var vat = NormalizeAccountText(request?.Vat, 60);
            var contactCountry = NormalizeAccountText(request?.ContactCountry, 120);
            var contactProvince = NormalizeAccountText(request?.ContactProvince, 120);
            var contactCity = NormalizeAccountText(request?.ContactCity, 120);
            var contactArea = NormalizeAccountText(request?.ContactArea, 120);
            var contactAddress = NormalizeAccountText(request?.ContactAddress, 250);
            var contactPostcode = NormalizeAccountText(request?.ContactPostcode, 40);
            var billingCountry = NormalizeAccountText(request?.BillingCountry, 120);
            var billingProvince = NormalizeAccountText(request?.BillingProvince, 120);
            var billingCity = NormalizeAccountText(request?.BillingCity, 120);
            var billingArea = NormalizeAccountText(request?.BillingArea, 120);
            var billingAddress = NormalizeAccountText(request?.BillingAddress, 250);
            var billingPostcode = NormalizeAccountText(request?.BillingPostcode, 40);

            if (string.IsNullOrWhiteSpace(name))
            {
                await Results.BadRequest(new AccountSettingsResponse(false, "Name is required.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
UPDATE dbo.customer_profile
SET name_en = @name,
    company_name_en = @companyName,
    browserlang = @browserLanguage,
    vat = @vat,
    country_zh_cn = @contactCountry,
    province_zh_cn = @contactProvince,
    city_zh_cn = @contactCity,
    area_zh_cn = @contactArea,
    address_zh_cn = @contactAddress,
    postcodestr = @contactPostcode,
    billing_country = @billingCountry,
    billing_province = @billingProvince,
    billing_city = @billingCity,
    billing_area = @billingArea,
    billing_address = @billingAddress,
    billing_postcodestr = @billingPostcode
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@name", string.IsNullOrWhiteSpace(name) ? "NA" : name);
            command.Parameters.AddWithValue("@companyName", string.IsNullOrWhiteSpace(companyName) ? "NA" : companyName);
            command.Parameters.AddWithValue("@browserLanguage", string.IsNullOrWhiteSpace(browserLanguage) ? "NA" : browserLanguage);
            command.Parameters.AddWithValue("@vat", string.IsNullOrWhiteSpace(vat) ? "NA" : vat);
            command.Parameters.AddWithValue("@contactCountry", string.IsNullOrWhiteSpace(contactCountry) ? "NA" : contactCountry);
            command.Parameters.AddWithValue("@contactProvince", string.IsNullOrWhiteSpace(contactProvince) ? "NA" : contactProvince);
            command.Parameters.AddWithValue("@contactCity", string.IsNullOrWhiteSpace(contactCity) ? "NA" : contactCity);
            command.Parameters.AddWithValue("@contactArea", string.IsNullOrWhiteSpace(contactArea) ? "NA" : contactArea);
            command.Parameters.AddWithValue("@contactAddress", string.IsNullOrWhiteSpace(contactAddress) ? "NA" : contactAddress);
            command.Parameters.AddWithValue("@contactPostcode", string.IsNullOrWhiteSpace(contactPostcode) ? "00000" : contactPostcode);
            command.Parameters.AddWithValue("@billingCountry", string.IsNullOrWhiteSpace(billingCountry) ? "NA" : billingCountry);
            command.Parameters.AddWithValue("@billingProvince", string.IsNullOrWhiteSpace(billingProvince) ? "NA" : billingProvince);
            command.Parameters.AddWithValue("@billingCity", string.IsNullOrWhiteSpace(billingCity) ? "NA" : billingCity);
            command.Parameters.AddWithValue("@billingArea", string.IsNullOrWhiteSpace(billingArea) ? "NA" : billingArea);
            command.Parameters.AddWithValue("@billingAddress", string.IsNullOrWhiteSpace(billingAddress) ? "NA" : billingAddress);
            command.Parameters.AddWithValue("@billingPostcode", string.IsNullOrWhiteSpace(billingPostcode) ? "00000" : billingPostcode);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            var settings = await LoadAccountSettingsAsync(connection, sessionUser.CustomerId);
            await Results.Ok(new AccountSettingsResponse(true, "Profile updated.", settings)).ExecuteAsync(context);
        }

        private async Task HandleAccountPasswordChangeAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AccountPasswordChangeRequest>();
            var currentPassword = request?.CurrentPassword ?? "";
            var newPassword = request?.NewPassword ?? "";
            var confirmPassword = request?.ConfirmPassword ?? "";

            if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Enter current password and new password.")).ExecuteAsync(context);
                return;
            }

            if (newPassword != confirmPassword)
            {
                await Results.BadRequest(new AccountActionResponse(false, "New password and confirmation do not match.")).ExecuteAsync(context);
                return;
            }

            if (!IsPasswordComplexEnough(newPassword))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Password must be at least 8 characters and include a letter and a number.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var storedHash = await LoadCustomerPasswordHashAsync(connection, sessionUser.CustomerId);
            if (!PasswordMatches(currentPassword, storedHash))
            {
                await Results.Json(
                    new AccountActionResponse(false, "Current password is not correct."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (PasswordMatches(newPassword, storedHash))
            {
                await Results.BadRequest(new AccountActionResponse(false, "New password cannot be the same as current password.")).ExecuteAsync(context);
                return;
            }

            const string sql = @"
UPDATE dbo.customer_profile
SET pp1 = @passwordHash,
    securityversion = 5,
    customerPassHash = '5',
    reVerify = 1
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@passwordHash", HashHex(SHA256.HashData(Encoding.UTF8.GetBytes(newPassword))));
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            context.Session.SetString("customerID", sessionUser.CustomerId.ToString(CultureInfo.InvariantCulture));
            context.Session.SetString("customerLogin", sessionUser.Login);
            context.Session.SetString("customerType", sessionUser.CustomerType);

            await Results.Ok(new AccountActionResponse(true, "Account password updated. CP, FTP, and IIS password sync will be handled in the hosting control panel workflow.")).ExecuteAsync(context);
        }

        private async Task HandleAccountEmailChangeRequestAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountActionResponse(false, "Not signed in."),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<AccountEmailChangeRequest>();
            var email = NormalizeAccountText(request?.Email, 160).ToLowerInvariant();
            if (!IsValidEmail(email))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Enter a valid email address.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var emailVerifySalt = ConfigOrEnv("EmailVerify:Salt", "EMAIL_VERIFY_SALT", "SmarterASP.NET").ToLowerInvariant();
            var verifyHash = HashHex(MD5.HashData(Encoding.UTF8.GetBytes($"{sessionUser.Login.ToLowerInvariant()}{email}{emailVerifySalt}")));
            await using (var deleteCommand = new SqlCommand("DELETE FROM dbo.reset_verify WHERE customerID = @customerId", connection))
            {
                deleteCommand.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
                await deleteCommand.ExecuteNonQueryAsync();
            }

            await using (var insertCommand = new SqlCommand(@"
INSERT INTO dbo.reset_verify (reset_str, customerID, new_email, create_date)
VALUES (@resetStr, @customerId, @email, GETDATE())", connection))
            {
                insertCommand.Parameters.AddWithValue("@resetStr", verifyHash);
                insertCommand.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
                insertCommand.Parameters.AddWithValue("@email", email);
                await insertCommand.ExecuteNonQueryAsync();
            }

            var verifyUrl = $"/account/emailchangeverify?ac={Uri.EscapeDataString(verifyHash)}&customerlogin={Uri.EscapeDataString(sessionUser.Login)}";
            var absoluteVerifyUrl = BuildAbsoluteUrl(context, verifyUrl);
            var mailResult = await SendAccountEmailAsync(
                email,
                "Verify your SmarterASP.NET account email",
                $@"
<p>Hello {WebUtility.HtmlEncode(sessionUser.Login)},</p>
<p>Use the link below to verify this email address for your SmarterASP.NET account.</p>
<p><a href=""{WebUtility.HtmlEncode(absoluteVerifyUrl)}"">Verify email address</a></p>
<p>If you did not request this change, you can ignore this email.</p>",
                $@"Hello {sessionUser.Login},

Use this link to verify this email address for your SmarterASP.NET account.

{absoluteVerifyUrl}

If you did not request this change, you can ignore this email."
            );
            if (!mailResult.Success)
            {
                await Results.Json(
                    new AccountActionResponse(false, $"Email change verification request was created, but SMTP delivery failed: {mailResult.Message}"),
                    statusCode: StatusCodes.Status502BadGateway
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new AccountActionResponse(true, $"Email change verification email sent to {email}.")).ExecuteAsync(context);
        }

        private async Task HandleAccountEmailChangeVerifyAsync(HttpContext context)
        {
            var resetHash = NormalizeAccountText(context.Request.Query["ac"].ToString(), 256);
            var login = NormalizeAccountText(context.Request.Query["customerlogin"].ToString(), 120);
            if (string.IsNullOrWhiteSpace(resetHash) || string.IsNullOrWhiteSpace(login))
            {
                await Results.BadRequest(new EmailChangeVerifyResponse(false, "Missing email verification link information.", false, "", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
SELECT TOP 1 rv.customerID, CAST(rv.new_email AS nvarchar(max)) AS new_email, rv.create_date, cp.customerLogin
FROM dbo.reset_verify rv
INNER JOIN dbo.customer_profile cp ON cp.customerID = rv.customerID
WHERE rv.reset_str = @resetHash
  AND LOWER(cp.customerLogin) = LOWER(@login)
  AND rv.new_email IS NOT NULL
ORDER BY rv.create_date DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@resetHash", resetHash);
            command.Parameters.AddWithValue("@login", login);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                await Results.Json(
                    new EmailChangeVerifyResponse(false, "This email verification link is invalid or has already been used.", false, "", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var customerId = Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture);
            var newEmail = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
            var createdAt = reader.IsDBNull(2) ? (DateTime?)null : reader.GetDateTime(2);
            var customerLogin = reader.GetString(3).Trim();

            var emailVerifySalt = ConfigOrEnv("EmailVerify:Salt", "EMAIL_VERIFY_SALT", "SmarterASP.NET").ToLowerInvariant();
            var expectedHash = HashHex(MD5.HashData(Encoding.UTF8.GetBytes($"{customerLogin.ToLowerInvariant()}{newEmail.ToLowerInvariant()}{emailVerifySalt}")));
            if (!FixedTimeEquals(resetHash, expectedHash))
            {
                await Results.Json(
                    new EmailChangeVerifyResponse(false, "This email verification link does not match the pending email address.", false, newEmail, createdAt),
                    statusCode: StatusCodes.Status400BadRequest
                ).ExecuteAsync(context);
                return;
            }

            var message = $"Verified pending email change for customer {customerId}. The final customer_profile.email update still needs the legacy encryptpwd-compatible writer before this app can safely complete the change.";
            await Results.Ok(new EmailChangeVerifyResponse(true, message, false, newEmail, createdAt)).ExecuteAsync(context);
        }

        private async Task HandleAccountActivationResendAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var result = await SendAccountActivationEmailAsync(context, sessionUser.CustomerId, sessionUser.Login);
            await WriteAccountMailResultAsync(context, result, "Activation email sent.");
        }

        private async Task HandleAccountReverifySendAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var email = await LoadReadableCustomerEmailAsync(sessionUser.CustomerId);
            if (!email.Success)
            {
                await Results.Json(new AccountActionResponse(false, email.Message), statusCode: StatusCodes.Status500InternalServerError).ExecuteAsync(context);
                return;
            }

            var brandDomain = GetBrandDomainForCustomer(sessionUser.CustomerId);
            var guid = GenerateResetToken();
            var reverifyUrl = BuildAbsoluteUrl(context, $"/account/re-verify_password_reset?guid={Uri.EscapeDataString(guid)}");
            var mailResult = await SendAccountEmailAsync(
                email.Email,
                "Verify Account",
                $@"
<p>Hello {WebUtility.HtmlEncode(sessionUser.Login)},</p>
<p>Please verify your {WebUtility.HtmlEncode(brandDomain)} account by opening the link below.</p>
<p><a href=""{WebUtility.HtmlEncode(reverifyUrl)}"">Verify account</a></p>",
                $@"Hello {sessionUser.Login},

Please verify your {brandDomain} account:

{reverifyUrl}",
                fromEmail: $"noreply@{brandDomain}"
            );

            await WriteAccountMailResultAsync(context, mailResult, "Account re-verification email sent.");
        }

        private async Task HandlePasswordExpiringSkipAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                await using var command = new SqlCommand(@"
UPDATE dbo.customer_profile
SET reVerifySkip = 1,
    reVerify = 1
WHERE customerID = @customerId", connection);
                command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
                await command.ExecuteNonQueryAsync();
            }

            var email = await LoadReadableCustomerEmailAsync(sessionUser.CustomerId);
            if (!email.Success)
            {
                await Results.Json(new AccountActionResponse(false, email.Message), statusCode: StatusCodes.Status500InternalServerError).ExecuteAsync(context);
                return;
            }

            var mailResult = await SendAccountEmailAsync(
                email.Email,
                "Password Expiring Soon!",
                "Dear customer, you've skipped the password reset. Your current password will expire in 7 days. Please use the Forget Password link to reset your password once it's expired. Thank you.",
                "Dear customer, you've skipped the password reset. Your current password will expire in 7 days. Please use the Forget Password link to reset your password once it's expired. Thank you.",
                fromEmail: "noreply@smarterasp.net"
            );

            await WriteAccountMailResultAsync(context, mailResult, "Password-expiring skip notice sent.");
        }

        private async Task HandlePasswordChangeCodeAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            var code = RandomNumberGenerator.GetInt32(100000, 1000000);
            await using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                await using var selectCommand = new SqlCommand("SELECT TOP 1 code FROM dbo.verify_code WHERE customerid = @customerId", connection);
                selectCommand.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
                var existing = await selectCommand.ExecuteScalarAsync();
                if (existing == null || existing == DBNull.Value)
                {
                    await using var insertCommand = new SqlCommand("INSERT INTO dbo.verify_code (customerid, code) VALUES (@customerId, @code)", connection);
                    insertCommand.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
                    insertCommand.Parameters.AddWithValue("@code", code);
                    await insertCommand.ExecuteNonQueryAsync();
                }
                else
                {
                    code = Convert.ToInt32(existing, CultureInfo.InvariantCulture);
                }
            }

            var brandDomain = GetBrandDomainForCustomer(sessionUser.CustomerId);
            var mailResult = await SendCustomerNotificationEmailAsync(
                sessionUser.CustomerId,
                $"postmaster@{brandDomain}",
                $"Urgent Message from {brandDomain}",
                $"To verify your account is safe, please use the following code to enable your access — it will expire in 30 minutes:<br>{code}",
                $"To verify your account is safe, please use the following code to enable your access. It will expire in 30 minutes: {code}"
            );

            await WriteAccountMailResultAsync(context, mailResult, "Sent! Please check your email.");
        }

        private async Task HandleAccountTwoFactorDisableAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new AccountSettingsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
UPDATE dbo.[2fa]
SET IsEnabled = 0
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            var affected = await command.ExecuteNonQueryAsync();

            var settings = await LoadAccountSettingsAsync(connection, sessionUser.CustomerId);
            var message = affected > 0
                ? "Two-factor authentication disabled."
                : "No two-factor authentication record was found for this account.";
            await Results.Ok(new AccountSettingsResponse(true, message, settings)).ExecuteAsync(context);
        }

        private async Task HandleHostingSitesAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingSitesResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var sites = await LoadHostingSitesAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingSitesResponse(true, "Hosting sites loaded.", sites)).ExecuteAsync(context);
        }

        private async Task HandleHostingSiteFunctionGetAsync(HttpContext context, int siteUid, string functionKey)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingSiteFunctionResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var site = await LoadOwnedHostingSiteAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context), siteUid);
            if (site == null)
            {
                await Results.Json(new HostingSiteFunctionResponse(false, "Website not found for this account.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var details = await BuildHostingSiteFunctionDetailsAsync(connection, site, functionKey);
            await Results.Ok(new HostingSiteFunctionResponse(true, $"{details.Label} loaded.", details)).ExecuteAsync(context);
        }

        private async Task HandleHostingSiteFunctionPostAsync(HttpContext context, int siteUid, string functionKey)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingSiteFunctionMutationResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingSiteFunctionMutationRequest>() ?? new HostingSiteFunctionMutationRequest(0, "", new Dictionary<string, string>());
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cpId = request.CpId > 0 ? request.CpId : GetRequestedCpId(context);
            var site = await LoadOwnedHostingSiteAsync(connection, sessionUser.CustomerId, cpId, siteUid);
            if (site == null)
            {
                await Results.Json(new HostingSiteFunctionMutationResponse(false, "Website not found for this account.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await RunHostingSiteFunctionMutationAsync(connection, site, functionKey, request);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingDashboardAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingDashboardResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var dashboard = await LoadHostingDashboardAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingDashboardResponse(true, "Hosting dashboard loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingDatabasesAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingDatabasesResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var dashboard = await LoadHostingDatabasesAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingDatabasesResponse(true, "Hosting databases loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingDeletedDatabasesAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingDeletedDatabasesResponse(false, "Not signed in.", new List<HostingDeletedDatabaseSummary>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var rows = await LoadHostingDeletedDatabasesAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingDeletedDatabasesResponse(true, "Deleted databases loaded.", rows)).ExecuteAsync(context);
        }

        private async Task HandleHostingDatabaseBackupSchedulesAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingDatabaseBackupSchedulesResponse(false, "Not signed in.", new List<HostingDatabaseBackupScheduleSummary>()),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var schedules = await LoadHostingDatabaseBackupSchedulesAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingDatabaseBackupSchedulesResponse(true, "Database backup schedules loaded.", schedules)).ExecuteAsync(context);
        }

        private Task HandleHostingDatabaseBackupAsync(HttpContext context, string engine, long id) =>
            HandleHostingDatabaseWorkerAsync(
                context,
                engine,
                id,
                requireMssql: false,
                async (connection, cp, database, request) =>
                {
                    var type = database.Engine == "MSSQL" ? "Queue MSSQL Backup" : "Queue MySQL Backup";
                    var extension = database.Engine == "MSSQL" ? ".bak" : ".sql";
                    return await CreateHostingWorkqueueAsync(connection, cp, new HostingWorkqueueRequest(
                        request.CpId,
                        type,
                        database.ServerId,
                        "\\www\\db\\",
                        database.ServerId,
                        $"{database.Name}{extension}",
                        database.Name,
                        "database-manager"));
                });

        private Task HandleHostingDatabaseRestoreAsync(HttpContext context, string engine, long id) =>
            HandleHostingDatabaseWorkerAsync(
                context,
                engine,
                id,
                requireMssql: false,
                async (connection, cp, database, request) =>
                {
                    var extension = database.Engine == "MSSQL" ? ".bak" : ".sql";
                    var path = NormalizeDatabaseFilePath(request.Path, extension);
                    if (!path.Success)
                    {
                        return new HostingWorkqueueResponse(false, path.Message, 0, database.Engine == "MSSQL" ? "Queue MSSQL Restore" : "Queue MySQL Restore");
                    }

                    var type = database.Engine == "MSSQL" ? "Queue MSSQL Restore" : "Queue MySQL Restore";
                    return await CreateHostingWorkqueueAsync(connection, cp, new HostingWorkqueueRequest(
                        request.CpId,
                        type,
                        path.Path,
                        database.Id.ToString(CultureInfo.InvariantCulture),
                        database.ServerId,
                        "",
                        database.Name,
                        "database-manager"));
                });

        private Task HandleHostingDatabaseRunSqlFileAsync(HttpContext context, long id) =>
            HandleHostingDatabaseWorkerAsync(
                context,
                "MSSQL",
                id,
                requireMssql: true,
                async (connection, cp, database, request) =>
                {
                    var path = NormalizeDatabaseFilePath(request.Path, ".sql");
                    if (!path.Success)
                    {
                        return new HostingWorkqueueResponse(false, path.Message, 0, "Run MSSQL File");
                    }

                    var uncPath = BuildOwnedWebUncPath(cp, path.Path);
                    return await CreateHostingWorkqueueAsync(connection, cp, new HostingWorkqueueRequest(
                        request.CpId,
                        "Run MSSQL File",
                        uncPath,
                        database.Id.ToString(CultureInfo.InvariantCulture),
                        database.ServerId,
                        database.Name,
                        database.Name,
                        "database-manager"));
                });

        private async Task HandleHostingDatabaseDeleteAsync(HttpContext context, string engine, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Not signed in.", "database", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            var database = await LoadOwnedDatabaseAsync(connection, sessionUser.CustomerId, cpId, engine, id, includeDeleted: false);
            if (cp.CpId == 0 || database == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Database was not found on this hosting plan.", "database", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await DeleteHostingDatabaseAsync(connection, cp, database);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingDatabaseBackupScheduleCreateAsync(HttpContext context, string engine, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingDatabaseBackupScheduleMutationResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingDatabaseBackupScheduleRequest>() ?? new HostingDatabaseBackupScheduleRequest(0, 2, 7);
            var cpId = request.CpId > 0 ? request.CpId : GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            var database = await LoadOwnedDatabaseAsync(connection, sessionUser.CustomerId, cpId, engine, id, includeDeleted: false);
            if (cp.CpId == 0 || database == null)
            {
                await Results.Json(new HostingDatabaseBackupScheduleMutationResponse(false, "Database was not found on this hosting plan.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var existing = await LoadDatabaseBackupScheduleIdAsync(connection, cp.CpId, database.Engine, database.Id);
            if (existing > 0)
            {
                await Results.Json(new HostingDatabaseBackupScheduleMutationResponse(false, "This database already has an automated backup schedule.", null), statusCode: StatusCodes.Status409Conflict).ExecuteAsync(context);
                return;
            }

            var quota = await LoadDatabaseBackupQuotaAsync(connection, cp.CpId);
            var usage = await LoadDatabaseBackupUsageAsync(connection, cp.CpId);
            if (quota - usage <= 0)
            {
                await Results.Json(new HostingDatabaseBackupScheduleMutationResponse(false, "Database backup quota is not available for this hosting plan.", null), statusCode: StatusCodes.Status400BadRequest).ExecuteAsync(context);
                return;
            }

            var hour = ClampInt(request.Hour.ToString(CultureInfo.InvariantCulture), 0, 23);
            var retentionDays = ClampInt(request.RetentionDays.ToString(CultureInfo.InvariantCulture), 1, 7);
            var hasBackupKept = await TableColumnExistsAsync(connection, "customDBBackup", "backupkept");
            var hasIsEnable = await TableColumnExistsAsync(connection, "customDBBackup", "isenable");
            var columns = "cplogin, dbname, dbtype, cpid, dbid, certaintime, enterdate";
            var values = "@cpLogin, @dbName, @dbType, CONVERT(varchar(50), @cpId), @dbId, @hour, GETDATE()";
            if (hasBackupKept)
            {
                columns += ", backupkept";
                values += ", @retentionDays";
            }

            if (hasIsEnable)
            {
                columns += ", isenable";
                values += ", 1";
            }

            var sql = $@"
INSERT INTO dbo.customDBBackup ({columns})
OUTPUT INSERTED.id
VALUES ({values})";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@dbName", database.Name);
            command.Parameters.AddWithValue("@dbType", database.Engine.ToLowerInvariant());
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@dbId", database.Id);
            command.Parameters.AddWithValue("@hour", hour);
            if (hasBackupKept)
            {
                command.Parameters.AddWithValue("@retentionDays", retentionDays);
            }
            var scheduleId = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            var schedule = new HostingDatabaseBackupScheduleSummary(scheduleId, database.Engine, database.Id, database.Name, hour, retentionDays, true, DateTime.Now);
            await Results.Ok(new HostingDatabaseBackupScheduleMutationResponse(true, "Automated database backup schedule enabled.", schedule)).ExecuteAsync(context);
        }

        private async Task HandleHostingDatabaseBackupScheduleDeleteAsync(HttpContext context, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingDatabaseBackupScheduleMutationResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingDatabaseBackupScheduleMutationResponse(false, "Hosting plan not found.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            const string sql = "DELETE FROM dbo.customDBBackup WHERE id = @id AND cpid = CONVERT(varchar(50), @cpId)";
            var deleted = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
            }) > 0;

            var response = deleted
                ? new HostingDatabaseBackupScheduleMutationResponse(true, "Automated database backup schedule disabled.", null)
                : new HostingDatabaseBackupScheduleMutationResponse(false, "Backup schedule was not found for this hosting plan.", null);
            await Results.Json(response, statusCode: deleted ? StatusCodes.Status200OK : StatusCodes.Status404NotFound).ExecuteAsync(context);
        }

        private async Task HandleHostingDatabaseWorkerAsync(
            HttpContext context,
            string engine,
            long id,
            bool requireMssql,
            Func<SqlConnection, SelectedHostingCp, OwnedHostingDatabase, HostingDatabaseFileActionRequest, Task<HostingWorkqueueResponse>> action)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingWorkqueueResponse(false, "Not signed in.", 0, ""), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingDatabaseFileActionRequest>() ?? new HostingDatabaseFileActionRequest(0, "");
            var cpId = request.CpId > 0 ? request.CpId : GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            var database = await LoadOwnedDatabaseAsync(connection, sessionUser.CustomerId, cpId, engine, id, includeDeleted: false);
            if (cp.CpId == 0 || database == null)
            {
                await Results.Json(new HostingWorkqueueResponse(false, "Database was not found on this hosting plan.", 0, ""), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            if (requireMssql && database.Engine != "MSSQL")
            {
                await Results.Json(new HostingWorkqueueResponse(false, "This action is only available for MSSQL databases.", 0, "Run MSSQL File"), statusCode: StatusCodes.Status400BadRequest).ExecuteAsync(context);
                return;
            }

            if (string.IsNullOrWhiteSpace(database.ServerId))
            {
                await Results.Json(new HostingWorkqueueResponse(false, "Database server id is missing, so no worker job was created.", 0, ""), statusCode: StatusCodes.Status400BadRequest).ExecuteAsync(context);
                return;
            }

            var result = await action(connection, cp, database, request);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingDatabaseConnectionStringAsync(HttpContext context, string engine, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingDatabaseConnectionStringResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var database = await LoadOwnedDatabaseAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context), engine, id, includeDeleted: false);
            if (database == null)
            {
                await Results.Json(new HostingDatabaseConnectionStringResponse(false, "Database was not found on this hosting plan.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var host = database.Host;
            var snippets = database.Engine == "MSSQL"
                ? new Dictionary<string, string>
                {
                    ["ASP.NET"] = $"Data Source={host};Initial Catalog={database.Name};User Id={database.Login};Password=YOUR_DB_PASSWORD;Encrypt=True;TrustServerCertificate=True;",
                    ["Classic ASP"] = $"Provider=SQLOLEDB;Data Source={host};Initial Catalog={database.Name};User Id={database.Login};Password=YOUR_DB_PASSWORD",
                    ["PHP"] = $"$serverName = \"{host}\";\n$connectionInfo = array(\"Database\"=>\"{database.Name}\", \"UID\"=>\"{database.Login}\", \"PWD\"=>\"password\");\n$conn = sqlsrv_connect($serverName, $connectionInfo);"
                }
                : new Dictionary<string, string>
                {
                    ["ASP.NET"] = $"Server={host};Database={database.Name};Uid={database.Login};Pwd=YOUR_DB_PASSWORD",
                    ["PHP"] = $"Driver={{MySQL ODBC 8.0 UNICODE Driver}};Server={host};Database={database.Name};Uid={database.Login};Password=YOUR_DB_PASSWORD"
                };

            var details = new HostingDatabaseConnectionString(database.Engine, database.Id, database.Name, host, database.Login, snippets);
            await Results.Ok(new HostingDatabaseConnectionStringResponse(true, "Connection strings loaded.", details)).ExecuteAsync(context);
        }

        private async Task HandleHostingMssqlReportUsersAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingMssqlReportUsersResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingMssqlReportUsersResponse(false, "Hosting plan not found.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var dashboard = await LoadHostingMssqlReportUsersAsync(connection, cp);
            await Results.Ok(new HostingMssqlReportUsersResponse(true, "MSSQL Reporting Service users loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingMssqlReportUserMutationAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Not signed in.", "database", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingProvisionResponse(false, "Hosting plan not found.", "database", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var method = context.Request.Method.ToUpperInvariant();
            var action = method switch
            {
                "POST" => "addftpuser",
                "PUT" => "updateftpuser",
                "DELETE" => "delftpuser",
                _ => "unknown"
            };

            await Results.Json(new HostingProvisionResponse(
                false,
                "MSSQL Reporting Service user writes are paused until encryptpwd-compatible site-user password storage and Windows local-user RPC calls are ported and tested with a disposable user.",
                "database",
                new
                {
                    action,
                    cp.CpLogin,
                    legacySources = new[]
                    {
                        "/Users/erwinyu/Downloads/hosting/cp8/cp/mssqlreportusers_action.asp",
                        "/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc:AddSiteUserDB/DeleteSiteUserDB",
                        "/Users/erwinyu/Downloads/hosting/cp8/functions/fn_db.inc:GetSSRSServerID"
                    }
                }),
                statusCode: StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingEmailsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingEmailsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var dashboard = await LoadHostingEmailsAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingEmailsResponse(true, "Hosting email domains loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingEmailPasswordResetAsync(HttpContext context, string domain)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Not signed in.", "email", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingEmailDomainMutationRequest>() ?? new HostingEmailDomainMutationRequest(0, "", 0);
            await using var connection = new SqlConnection(GetEhbConfigConnectionString());
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingProvisionResponse(false, "Hosting plan not found.", "email", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await ResetHostingEmailPasswordAsync(connection, cp, domain, request.Password);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingEmailQuotaUpdateAsync(HttpContext context, string domain)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Not signed in.", "email", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingEmailDomainMutationRequest>() ?? new HostingEmailDomainMutationRequest(0, "", 0);
            await using var connection = new SqlConnection(GetEhbConfigConnectionString());
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingProvisionResponse(false, "Hosting plan not found.", "email", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await UpdateHostingEmailQuotaAsync(connection, cp, domain, request.QuotaMb);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingEmailDeleteAsync(HttpContext context, string domain)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Not signed in.", "email", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            await using var connection = new SqlConnection(GetEhbConfigConnectionString());
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingProvisionResponse(false, "Hosting plan not found.", "email", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await DeleteHostingEmailDomainAsync(connection, cp, domain);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingFtpAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingFtpResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var dashboard = await LoadHostingFtpAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingFtpResponse(true, "Hosting FTP users loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingRuntimeAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingRuntimeResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var dashboard = await LoadHostingRuntimeAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingRuntimeResponse(true, "Hosting runtime data loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingSecurityAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingSecurityResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var dashboard = await LoadHostingSecurityAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingSecurityResponse(true, "Hosting security data loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingDnsPreviewAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Not signed in.", "dns", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingDomainServiceActionRequest>() ?? new HostingDomainServiceActionRequest(0, "", "", new Dictionary<string, string>());
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Hosting plan not found.", "dns", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var domain = await LoadOwnedMappedDomainAsync(connection, cp, request.Domain);
            if (domain == null)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Mapped domain was not found on this hosting plan.", "dns", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }
            if (IsTemporaryHostingDomain(domain.Domain))
            {
                await Results.Json(new HostingServiceActionResponse(false, "DNS actions are not tested on temporary hosting URLs. Choose a mapped customer domain.", "dns", new { domain.Domain })).ExecuteAsync(context);
                return;
            }

            var host = GetField(request.Fields, "host", "@");
            var type = GetField(request.Fields, "type", "A").ToUpperInvariant();
            var value = GetField(request.Fields, "value", domain.IpAddress);
            var ttl = ClampInt(GetField(request.Fields, "ttl", "3600"), 300, 86400, 3600);
            var priority = type is "MX" or "SRV" ? ClampInt(GetField(request.Fields, "priority", "10"), 0, 100, 10) : (int?)null;

            var dnsServers = GetDefaultDnsServers();
            var preview = new List<DomainDnsRecordPreview>
            {
                new(type, NormalizeDnsHost(host, domain.Domain), value, priority, ttl)
            };
            preview.InsertRange(0, dnsServers.Select(server => new DomainDnsRecordPreview("NS", domain.Domain, server, null, 3600)));

            await Results.Ok(new HostingServiceActionResponse(
                true,
                "DNS preview generated from the selected mapped domain. Publishing still needs the exact DNS gateway functions from includes/sdnsfunctions*.inc.",
                "dns",
                new
                {
                    legacySource = "/Users/erwinyu/Downloads/hosting/cp8/cp/dns/dns_action.asp and /Users/erwinyu/Downloads/hosting/includes/sdnsfunctions.inc",
                    domain.DomainUid,
                    domain.Domain,
                    domain.SiteUid,
                    domain.SiteName,
                    records = preview
                })).ExecuteAsync(context);
        }

        private async Task HandleHostingCdnActionAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Not signed in.", "cdn", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingDomainServiceActionRequest>() ?? new HostingDomainServiceActionRequest(0, "", "", new Dictionary<string, string>());
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Hosting plan not found.", "cdn", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var domain = await LoadOwnedMappedDomainAsync(connection, cp, request.Domain);
            if (domain == null)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Mapped domain was not found on this hosting plan.", "cdn", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var action = NormalizeDomainServiceAction(request.Action, "enable-cdn");
            var shared = GetLegacySharedApiSettings();
            var legacySource = "/Users/erwinyu/Downloads/hosting/cp8/cp/cloudflare_action.asp and functions.inc:Run_cloudflare_cmd";
            if (IsTemporaryHostingDomain(domain.Domain))
            {
                await Results.Json(new HostingServiceActionResponse(false, "CDN is only available for mapped customer domains, not temporary hosting URLs.", "cdn", new { legacySource, domain.Domain })).ExecuteAsync(context);
                return;
            }

            var userKey = await LoadCloudflareUserKeyAsync(connection, sessionUser.CustomerId);
            var cmd = BuildCloudflareCommand(action, domain, request.Fields, userKey);
            if (string.IsNullOrWhiteSpace(cmd))
            {
                await Results.Json(new HostingServiceActionResponse(false, $"CDN action '{request.Action}' still needs an active Cloudflare account row or exact command mapping from latest ASP.", "cdn", new { legacySource, domain.Domain })).ExecuteAsync(context);
                return;
            }

            if (!shared.IsConfigured)
            {
                await Results.Json(new HostingServiceActionResponse(false, shared.MissingMessage, "cdn", new { legacySource, command = cmd, domain.Domain })).ExecuteAsync(context);
                return;
            }

            var call = await PostLegacySharedApiAsync(shared, "/api/cloudflare_api.asp", new Dictionary<string, string> { ["cmdstr"] = cmd });
            await Results.Json(new HostingServiceActionResponse(call.Success, call.Message, "cdn", new { legacySource, command = cmd, domain.Domain, call.Url, call.Preview }), statusCode: call.Success ? StatusCodes.Status200OK : StatusCodes.Status502BadGateway).ExecuteAsync(context);
        }

        private async Task HandleHostingSslActionAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Not signed in.", "ssl", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingDomainServiceActionRequest>() ?? new HostingDomainServiceActionRequest(0, "", "", new Dictionary<string, string>());
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Hosting plan not found.", "ssl", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var domain = await LoadOwnedMappedDomainAsync(connection, cp, request.Domain);
            if (domain == null)
            {
                await Results.Json(new HostingServiceActionResponse(false, "Mapped domain was not found on this hosting plan.", "ssl", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }
            if (IsTemporaryHostingDomain(domain.Domain))
            {
                await Results.Json(new HostingServiceActionResponse(false, "SSL actions are not tested on temporary hosting URLs. Choose a mapped customer domain.", "ssl", new { domain.Domain })).ExecuteAsync(context);
                return;
            }

            var action = NormalizeDomainServiceAction(request.Action, "request-free-ssl");
            var legacySource = "/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc:requestFreeSSLForced/deleteFreeSSLRecord";
            if (action is "request-free-ssl" or "free-ssl")
            {
                var shared = GetLegacySharedApiSettings();
                if (!shared.IsConfigured)
                {
                    await Results.Json(new HostingServiceActionResponse(false, shared.MissingMessage, "ssl", new { legacySource, domain.Domain, domain.SiteUid, cp.CpId })).ExecuteAsync(context);
                    return;
                }

                var call = await PostLegacySharedApiAsync(shared, "/tools/freessl.asp", new Dictionary<string, string>
                {
                    ["cpID"] = cp.CpId.ToString(CultureInfo.InvariantCulture),
                    ["site_Uid"] = domain.SiteUid.ToString(CultureInfo.InvariantCulture),
                    ["dname"] = domain.Domain
                });
                await Results.Json(new HostingServiceActionResponse(call.Success, call.Message, "ssl", new { legacySource, domain.Domain, domain.SiteUid, call.Url, call.Preview }), statusCode: call.Success ? StatusCodes.Status200OK : StatusCodes.Status502BadGateway).ExecuteAsync(context);
                return;
            }

            if (action is "delete-ssl" or "delete")
            {
                await Results.Json(new HostingServiceActionResponse(false, "SSL delete is mapped to deleteFreeSSLRecord(CN), but live deletion is not exposed here yet to avoid touching existing SSL orders.", "ssl", new { legacySource, domain.Domain })).ExecuteAsync(context);
                return;
            }

            await Results.Json(new HostingServiceActionResponse(false, $"SSL action '{request.Action}' still needs exact Namecheap/SSL order mapping from latest ASP before write support.", "ssl", new { legacySource, domain.Domain })).ExecuteAsync(context);
        }

        private async Task HandleHostingActivityAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingActivityResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var dashboard = await LoadHostingActivityAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingActivityResponse(true, "Hosting activity loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingWorkqueueCreateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingWorkqueueRequest>() ?? new HostingWorkqueueRequest(0, "", "", "", "", "", "", "");
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            try
            {
                await using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
                if (cp.CpId == 0)
                {
                    await Results.Json(new AccountActionResponse(false, "Hosting plan not found."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                    return;
                }

                var result = await CreateHostingWorkqueueAsync(connection, cp, request);
                var status = result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;
                await Results.Json(result, statusCode: status).ExecuteAsync(context);
            }
            catch (SqlException ex)
            {
                await Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Unable to queue hosting worker job.").ExecuteAsync(context);
            }
        }

        private async Task HandleHostingActivityTestCreateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingActivityTestRequest>() ?? new HostingActivityTestRequest(0, "", "", "", "");
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new AccountActionResponse(false, "Hosting plan not found."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var id = await CreatePanelTestWorkqueueAsync(connection, cp, request);
            await Results.Ok(new HostingActivityMutationResponse(true, "Panel test activity created.", id)).ExecuteAsync(context);
        }

        private async Task HandleHostingActivityTestUpdateAsync(HttpContext context, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingActivityTestRequest>() ?? new HostingActivityTestRequest(0, "", "", "", "");
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new AccountActionResponse(false, "Hosting plan not found."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var updated = await UpdatePanelTestWorkqueueAsync(connection, cp, id, request);
            if (!updated)
            {
                await Results.Json(new AccountActionResponse(false, "Panel test activity not found, or it is not a test row."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new HostingActivityMutationResponse(true, "Panel test activity updated.", id)).ExecuteAsync(context);
        }

        private async Task HandleHostingActivityTestDeleteAsync(HttpContext context, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new AccountActionResponse(false, "Not signed in."), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new AccountActionResponse(false, "Hosting plan not found."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var deleted = await DeletePanelTestWorkqueueAsync(connection, cp, id);
            if (!deleted)
            {
                await Results.Json(new AccountActionResponse(false, "Panel test activity not found, or it is not a test row."), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new HostingActivityMutationResponse(true, "Panel test activity deleted.", id)).ExecuteAsync(context);
        }

        private async Task HandleHostingRealTestCreateAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingRealTestResponse(false, "Not signed in.", null, "", 0), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingRealTestRequest>() ?? new HostingRealTestRequest(0, "", new Dictionary<string, string>());
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingRealTestResponse(false, "Hosting plan not found.", null, "", 0), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await CreateHostingRealTestAsync(connection, cp, request);
            var status = result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;
            await Results.Json(result, statusCode: status).ExecuteAsync(context);
        }

        private async Task HandleHostingRealTestUpdateAsync(HttpContext context, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingRealTestResponse(false, "Not signed in.", null, "", 0), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingRealTestRequest>() ?? new HostingRealTestRequest(0, "", new Dictionary<string, string>());
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingRealTestResponse(false, "Hosting plan not found.", null, "", id), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await UpdateHostingRealTestAsync(connection, cp, id, request);
            var status = result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;
            await Results.Json(result, statusCode: status).ExecuteAsync(context);
        }

        private async Task HandleHostingRealTestDeleteAsync(HttpContext context, string area, long id)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingRealTestResponse(false, "Not signed in.", null, area, id), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingRealTestResponse(false, "Hosting plan not found.", null, area, id), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var marker = context.Request.Query["name"].ToString();
            var result = await DeleteHostingRealTestAsync(connection, cp, area, id, marker);
            var status = result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;
            await Results.Json(result, statusCode: status).ExecuteAsync(context);
        }

        private Task HandleHostingSiteProvisionAsync(HttpContext context) =>
            HandleHostingProvisionAsync<HostingSiteProvisionRequest>(
                context,
                () => new HostingSiteProvisionRequest(0, "", "", "", "", ""),
                ProvisionHostingSiteAsync);

        private Task HandleHostingDatabaseProvisionAsync(HttpContext context) =>
            HandleHostingProvisionAsync<HostingDatabaseProvisionRequest>(
                context,
                () => new HostingDatabaseProvisionRequest(0, "MSSQL", "", "", "", 100, "SQL_Latin1_General_CP1_CI_AS", ""),
                ProvisionHostingDatabaseAsync);

        private Task HandleHostingEmailProvisionAsync(HttpContext context) =>
            HandleHostingProvisionAsync<HostingEmailProvisionRequest>(
                context,
                () => new HostingEmailProvisionRequest(0, "", "", 1000, 2, ""),
                ProvisionHostingEmailAsync);

        private Task HandleHostingFtpProvisionAsync(HttpContext context) =>
            HandleHostingProvisionAsync<HostingFtpProvisionRequest>(
                context,
                () => new HostingFtpProvisionRequest(0, "", "", "", 500, "write"),
                ProvisionHostingFtpAsync);

        private Task HandleHostingFtpUserCreateAsync(HttpContext context) =>
            HandleHostingFtpProvisionAsync(context);

        private Task HandleHostingFtpUserUpdateAsync(HttpContext context, string login) =>
            HandleHostingFtpUserMutationAsync(
                context,
                login,
                () => new HostingFtpUserMutationRequest(0, "", "", "", 500, "write", ""),
                UpdateHostingFtpUserAsync);

        private Task HandleHostingFtpUserStatusAsync(HttpContext context, string login) =>
            HandleHostingFtpUserMutationAsync(
                context,
                login,
                () => new HostingFtpUserMutationRequest(0, "", "", "", 0, "", "enable"),
                SetHostingFtpUserStatusAsync);

        private Task HandleHostingFtpUserPermissionResetAsync(HttpContext context, string login) =>
            HandleHostingFtpUserMutationAsync(
                context,
                login,
                () => new HostingFtpUserMutationRequest(0, "", "", "", 0, "", "reset"),
                ResetHostingFtpUserPermissionAsync);

        private async Task HandleHostingFtpUserDeleteAsync(HttpContext context, string login)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Not signed in.", "ftp", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            try
            {
                await using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
                if (cp.CpId == 0)
                {
                    await Results.Json(new HostingProvisionResponse(false, "Hosting plan not found.", "ftp", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                    return;
                }

                var result = await DeleteHostingFtpUserAsync(connection, cp, login);
                await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
            }
            catch (SqlException ex)
            {
                await Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Unable to delete FTP user.").ExecuteAsync(context);
            }
        }

        private async Task HandleHostingFtpUserMutationAsync(
            HttpContext context,
            string login,
            Func<HostingFtpUserMutationRequest> fallbackRequest,
            Func<SqlConnection, SelectedHostingCp, string, HostingFtpUserMutationRequest, Task<HostingProvisionResponse>> mutate)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Not signed in.", "ftp", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingFtpUserMutationRequest>() ?? fallbackRequest();
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            try
            {
                await using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
                if (cp.CpId == 0)
                {
                    await Results.Json(new HostingProvisionResponse(false, "Hosting plan not found.", "ftp", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                    return;
                }

                var result = await mutate(connection, cp, login, request);
                await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
            }
            catch (SqlException ex)
            {
                await Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Unable to update FTP user.").ExecuteAsync(context);
            }
        }

        private async Task HandleHostingFilesBrowseAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingFileManagerResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var path = context.Request.Query["path"].ToString();
            var search = context.Request.Query["search"].ToString();
            var sortBy = context.Request.Query["sortBy"].ToString();
            var orderBy = context.Request.Query["orderBy"].ToString();
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingFileManagerResponse(false, "Hosting plan not found.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await RunFileManagerBrowseAsync(cp, path, search, sortBy, orderBy);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingFileAgentHealthAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingFileAgentHealthResponse(false, "Not signed in.", null, null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var cpId = GetRequestedCpId(context);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, cpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingFileAgentHealthResponse(false, "Hosting plan not found.", null, null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var legacy = GetLegacyAgentSettings();
            var fileAgent = GetFileManagerAgentSettings();
            var browse = await GetLegacyAgentHealthAsync(legacy, cp.ServerId, fileAgent.Path);
            var action = await GetLegacyAgentHealthAsync(legacy, cp.ServerId, fileAgent.ActionPath);
            var success = browse.Success && action.Success;
            await Results.Json(
                new HostingFileAgentHealthResponse(success, success ? "File manager agents are reachable." : "One or more file manager agents are not healthy.", browse, action),
                statusCode: success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingFileActionAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingFileManagerResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<HostingFileManagerActionRequest>() ?? new HostingFileManagerActionRequest(0, "", "", "", "", "", false);
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingFileManagerResponse(false, "Hosting plan not found.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var result = await RunFileManagerActionAsync(connection, cp, request);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingProvisionAsync<TRequest>(
            HttpContext context,
            Func<TRequest> fallbackRequest,
            Func<SqlConnection, SelectedHostingCp, TRequest, Task<HostingProvisionResponse>> provision)
            where TRequest : IHostingCpRequest
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingProvisionResponse(false, "Not signed in.", "auth", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var request = await context.Request.ReadFromJsonAsync<TRequest>() ?? fallbackRequest();
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            try
            {
                await using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
                if (cp.CpId == 0)
                {
                    await Results.Json(new HostingProvisionResponse(false, "Hosting plan not found.", "hosting", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                    return;
                }

                var result = await provision(connection, cp, request);
                var status = result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;
                await Results.Json(result, statusCode: status).ExecuteAsync(context);
            }
            catch (SqlException ex)
            {
                await Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Hosting provisioning failed.").ExecuteAsync(context);
            }
        }

        private async Task HandleHostingAppsAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingAppsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var dashboard = await LoadHostingAppsAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            await Results.Ok(new HostingAppsResponse(true, "Hosting app catalog loaded.", dashboard)).ExecuteAsync(context);
        }

        private async Task HandleHostingAppRequirementsAsync(HttpContext context, int pluginId)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new HostingAppRequirementsResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var requirements = await LoadPluginRequirementsAsync(connection, pluginId);
            if (requirements == null)
            {
                await Results.Json(
                    new HostingAppRequirementsResponse(false, "Plugin was not found in plugins.dbo.plugins.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new HostingAppRequirementsResponse(true, "Plugin requirements loaded from the legacy installer tables.", requirements)).ExecuteAsync(context);
        }

        private async Task HandleHostingAppInstallPreviewAsync(HttpContext context)
        {
            var result = await BuildHostingAppInstallPlanFromRequestAsync(context);
            await Results.Json(result, statusCode: result.Success ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest).ExecuteAsync(context);
        }

        private async Task HandleHostingAppInstallAsync(HttpContext context)
        {
            var result = await BuildHostingAppInstallPlanFromRequestAsync(context);
            if (!result.Success)
            {
                await Results.Json(result, statusCode: StatusCodes.Status400BadRequest).ExecuteAsync(context);
                return;
            }

            await Results.Json(
                result with
                {
                    Success = false,
                    Message = "Full app install is still blocked until plugin_process_3_action.asp is ported end-to-end against a disposable site/database and reachable file, database, and IIS agents. No files, databases, or workqueue rows were changed."
                },
                statusCode: StatusCodes.Status409Conflict).ExecuteAsync(context);
        }

        private async Task HandleHostingAppInstallStatusAsync(HttpContext context, long jobId)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(new HostingAppInstallStatusResponse(false, "Not signed in.", null), statusCode: StatusCodes.Status401Unauthorized).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, GetRequestedCpId(context));
            if (cp.CpId == 0)
            {
                await Results.Json(new HostingAppInstallStatusResponse(false, "Hosting plan not found.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            const string sql = @"
SELECT TOP 1 id, type, ISNULL(status, 0) AS status, zipfile, dstfolder, serverid, data1, siteowner, notifyemail, errormessage, enterdate
FROM dbo.workqueue
WHERE id = @jobId
  AND cplogin = @cpLogin";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@jobId", jobId);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                await Results.Json(new HostingAppInstallStatusResponse(false, "Install job was not found for this hosting plan.", null), statusCode: StatusCodes.Status404NotFound).ExecuteAsync(context);
                return;
            }

            var statusCode = reader.IsDBNull(2) ? 0 : Convert.ToInt32(reader.GetValue(2), CultureInfo.InvariantCulture);
            var job = new HostingActivitySummary(
                Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture),
                reader.IsDBNull(1) ? "" : reader.GetString(1).Trim(),
                WorkqueueStatusLabel(statusCode),
                statusCode,
                SimplifyHostingPath(reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(), cp.CpLogin),
                SimplifyHostingPath(reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(), cp.CpLogin),
                reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                reader.IsDBNull(6) ? "" : Convert.ToString(reader.GetValue(6), CultureInfo.InvariantCulture)?.Trim() ?? "",
                reader.IsDBNull(7) ? "" : reader.GetString(7).Trim(),
                reader.IsDBNull(8) ? "" : reader.GetString(8).Trim(),
                reader.IsDBNull(9) ? "" : reader.GetString(9).Trim(),
                reader.IsDBNull(10) ? null : reader.GetDateTime(10)
            );

            await Results.Ok(new HostingAppInstallStatusResponse(true, "Install job status loaded.", job)).ExecuteAsync(context);
        }

        private static long GetRequestedCpId(HttpContext context)
        {
            var value = context.Request.Query["cpId"].FirstOrDefault();
            return long.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var cpId) ? cpId : 0;
        }

        private static async Task HandleCurrentUserAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new LoginResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new LoginResponse(true, "Signed in.", sessionUser)).ExecuteAsync(context);
        }

        private static async Task HandleLogoutAsync(HttpContext context)
        {
            context.Session.Clear();
            await Results.Ok(new { success = true, message = "Logged out." }).ExecuteAsync(context);
        }

        private async Task HandleCheckoutTempOrderAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var guid = context.Request.RouteValues["guid"]?.ToString() ?? "";
            if (string.IsNullOrWhiteSpace(guid))
            {
                await Results.BadRequest(new CheckoutTempOrderResponse(false, "Missing checkout GUID.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var order = await LoadCheckoutTempOrderAsync(connection, sessionUser.CustomerId, guid);
            if (order == null)
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Checkout temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);
            await Results.Ok(BuildCheckoutTempOrderResponse("Checkout temp order loaded.", order, balance)).ExecuteAsync(context);
        }

        private async Task HandleCheckoutPayWithBalanceAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var guid = context.Request.RouteValues["guid"]?.ToString() ?? "";
            if (string.IsNullOrWhiteSpace(guid))
            {
                await Results.BadRequest(new CheckoutTempOrderResponse(false, "Missing checkout GUID.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var order = await LoadCheckoutTempOrderAsync(connection, sessionUser.CustomerId, guid);
            if (order == null)
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Checkout temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);

            if (order.Processed)
            {
                await Results.BadRequest(BuildCheckoutTempOrderResponse("This checkout order has already been processed.", order, balance, success: false)).ExecuteAsync(context);
                return;
            }

            if (order.IsPaid)
            {
                await Results.Ok(BuildCheckoutTempOrderResponse("Checkout order is already marked paid.", order, balance)).ExecuteAsync(context);
                return;
            }

            if (balance < order.Amount)
            {
                await Results.BadRequest(BuildCheckoutTempOrderResponse($"Account balance is {balance.ToString("C", CultureInfo.GetCultureInfo("en-US"))}; this checkout needs {order.Amount.ToString("C", CultureInfo.GetCultureInfo("en-US"))}.", order, balance, success: false)).ExecuteAsync(context);
                return;
            }

            const string sql = @"
UPDATE oms.dbo.buyer_temp
SET ispaid = 1
WHERE id = @id
  AND customer_id = @customerId
  AND ISNULL(processed, 0) = 0";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            var updated = await LoadCheckoutTempOrderAsync(connection, sessionUser.CustomerId, guid);
            await Results.Ok(BuildCheckoutTempOrderResponse("Account balance covers this checkout. Continue purchase setup to finish provisioning.", updated, balance)).ExecuteAsync(context);
        }

        private async Task HandleRenewTempOrderAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new RenewTempOrderResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var guid = context.Request.RouteValues["guid"]?.ToString() ?? "";
            if (string.IsNullOrWhiteSpace(guid))
            {
                await Results.BadRequest(new RenewTempOrderResponse(false, "Missing renewal checkout GUID.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var order = await LoadRenewTempOrderAsync(connection, sessionUser.CustomerId, guid);
            if (order == null)
            {
                await Results.Json(
                    new RenewTempOrderResponse(false, "Renewal temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new RenewTempOrderResponse(true, "Renewal temp order loaded.", order)).ExecuteAsync(context);
        }

        private async Task HandleRenewTempPayWithBalanceAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                await Results.Json(
                    new RenewTempOrderResponse(false, "Not signed in.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var guid = context.Request.RouteValues["guid"]?.ToString() ?? "";
            if (string.IsNullOrWhiteSpace(guid))
            {
                await Results.BadRequest(new RenewTempOrderResponse(false, "Missing renewal checkout GUID.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var order = await LoadRenewTempOrderAsync(connection, sessionUser.CustomerId, guid);
            if (order == null)
            {
                await Results.Json(
                    new RenewTempOrderResponse(false, "Renewal temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            if (order.IsProcessed)
            {
                await Results.BadRequest(new RenewTempOrderResponse(false, "This renewal checkout has already been processed.", order)).ExecuteAsync(context);
                return;
            }

            if (order.IsPaid)
            {
                await Results.Ok(new RenewTempOrderResponse(true, "Renewal checkout is already marked paid.", order)).ExecuteAsync(context);
                return;
            }

            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);
            if (balance < order.Amount)
            {
                await Results.BadRequest(new RenewTempOrderResponse(false, $"Account balance is {balance.ToString("C", CultureInfo.GetCultureInfo("en-US"))}; this renewal checkout needs {order.Amount.ToString("C", CultureInfo.GetCultureInfo("en-US"))}.", order)).ExecuteAsync(context);
                return;
            }

            const string sql = @"
UPDATE oms.dbo.renew_temp
SET ispaid = 1
WHERE id = @id
  AND customerid = @customerId
  AND ISNULL(isprocessed, 0) = 0";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);
            await command.ExecuteNonQueryAsync();

            var updated = await LoadRenewTempOrderAsync(connection, sessionUser.CustomerId, guid);
            await Results.Ok(new RenewTempOrderResponse(true, "Account balance covers this renewal checkout. The renewal temp order is now marked paid.", updated)).ExecuteAsync(context);
        }

        private async Task HandleLoginAsync(HttpContext context)
        {
            var loginRequest = await context.Request.ReadFromJsonAsync<LoginRequest>();
            var login = loginRequest?.Login?.Trim() ?? "";
            var turnstileSecret = ConfigOrEnv("CloudflareTurnstile:SecretKey", "CLOUDFLARE_TURNSTILE_SECRET_KEY").Trim();

            if (string.IsNullOrWhiteSpace(login))
            {
                await Results.BadRequest(new LoginResponse(false, "Enter your username.", null)).ExecuteAsync(context);
                return;
            }

            if (!string.IsNullOrWhiteSpace(turnstileSecret))
            {
                var turnstileToken = loginRequest?.TurnstileToken?.Trim() ?? "";
                if (string.IsNullOrWhiteSpace(turnstileToken))
                {
                    await Results.BadRequest(new LoginResponse(false, "Complete the bot check before logging in.", null)).ExecuteAsync(context);
                    return;
                }

                var remoteIp = context.Connection.RemoteIpAddress?.ToString() ?? "";
                var turnstile = await VerifyTurnstileAsync(turnstileSecret, turnstileToken, remoteIp);
                if (!turnstile.Success)
                {
                    await Results.Json(
                        new LoginResponse(false, turnstile.Message, null),
                        statusCode: StatusCodes.Status403Forbidden
                    ).ExecuteAsync(context);
                    return;
                }
            }

            var connectionString = GetEhbConfigConnectionString();

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
SELECT TOP 1 customerID, customerLogin, customer_type, status, pp1
FROM dbo.customer_profile
WHERE LOWER(customerLogin) = LOWER(@login)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@login", login);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                await TrackFailedLoginAsync(context, login);
                await Results.Json(
                    new LoginResponse(false, "Login failed. Please check your username and password.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            var customerId = reader.GetInt64(0);
            var customerLogin = reader.GetString(1);
            var customerType = reader.GetString(2);
            var status = reader.IsDBNull(3) ? -1 : reader.GetInt32(3);

            if (status != 1)
            {
                await TrackFailedLoginAsync(context, login);
                var message = status switch
                {
                    0 => "This account is pending activation.",
                    2 => "This account is suspended.",
                    3 => "This account is canceled.",
                    _ => "This account is not active."
                };
                await Results.Json(new LoginResponse(false, message, null), statusCode: StatusCodes.Status403Forbidden).ExecuteAsync(context);
                return;
            }

            context.Session.SetString("customerID", customerId.ToString());
            context.Session.SetString("customerLogin", customerLogin);
            context.Session.SetString("customerType", customerType);
            ClearFailedLogin(context, login);

            await Results.Ok(new LoginResponse(true, "Login successful.", new LoginUser(customerId, customerLogin, customerType))).ExecuteAsync(context);
        }

        private async Task HandleLoginConfigAsync(HttpContext context)
        {
            var siteKey = ConfigOrEnv("CloudflareTurnstile:SiteKey", "CLOUDFLARE_TURNSTILE_SITE_KEY").Trim();
            var secretKey = ConfigOrEnv("CloudflareTurnstile:SecretKey", "CLOUDFLARE_TURNSTILE_SECRET_KEY").Trim();
            await Results.Ok(new LoginConfigResponse(
                !string.IsNullOrWhiteSpace(siteKey) && !string.IsNullOrWhiteSpace(secretKey),
                siteKey
            )).ExecuteAsync(context);
        }

        private static async Task<TurnstileVerifyResult> VerifyTurnstileAsync(string secretKey, string token, string remoteIp)
        {
            try
            {
                using var httpClient = new HttpClient
                {
                    Timeout = TimeSpan.FromSeconds(8)
                };

                var fields = new List<KeyValuePair<string, string>>
                {
                    new("secret", secretKey),
                    new("response", token)
                };
                if (!string.IsNullOrWhiteSpace(remoteIp))
                {
                    fields.Add(new KeyValuePair<string, string>("remoteip", remoteIp));
                }

                using var response = await httpClient.PostAsync(
                    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                    new FormUrlEncodedContent(fields)
                );
                var json = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode)
                {
                    return new TurnstileVerifyResult(false, "Bot check could not be verified. Please try again.");
                }

                using var document = JsonDocument.Parse(json);
                var success = document.RootElement.TryGetProperty("success", out var successElement) && successElement.GetBoolean();
                if (success)
                {
                    return new TurnstileVerifyResult(true, "Bot check verified.");
                }

                return new TurnstileVerifyResult(false, "Bot check failed. Please try again.");
            }
            catch
            {
                return new TurnstileVerifyResult(false, "Bot check service is unavailable. Please try again.");
            }
        }

        private async Task TrackFailedLoginAsync(HttpContext context, string login)
        {
            var remoteIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var key = $"{remoteIp}|{login}";
            var now = DateTime.UtcNow;
            var shouldAlert = false;

            lock (LoginFailureLock)
            {
                if (!LoginFailures.TryGetValue(key, out var window) || now - window.FirstFailureUtc > TimeSpan.FromMinutes(30))
                {
                    window = new LoginFailureWindow(0, now, DateTime.MinValue);
                }

                var count = window.Count + 1;
                shouldAlert = count > 3 && now - window.LastAlertUtc > TimeSpan.FromMinutes(30);
                LoginFailures[key] = window with
                {
                    Count = count,
                    LastAlertUtc = shouldAlert ? now : window.LastAlertUtc
                };
            }

            if (!shouldAlert)
            {
                return;
            }

            var adminRecipients = ConfigOrEnv(
                "Smtp:AdminAlertRecipients",
                "SMTP_ADMIN_ALERT_RECIPIENTS",
                "erwinyu888@gmail.com,307329698@qq.com");
            var subject = $"More than 3 Fail Login from 1 IP {login}";
            var htmlBody = $@"{DateTime.Now:O}<br>IP:<br>{WebUtility.HtmlEncode(remoteIp)}<br>Login:<br>{WebUtility.HtmlEncode(login)}";
            var textBody = htmlBody.Replace("<br>", Environment.NewLine, StringComparison.OrdinalIgnoreCase);

            foreach (var recipient in adminRecipients.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                if (IsValidEmail(recipient))
                {
                    await SendAccountEmailAsync(recipient, subject, htmlBody, textBody, fromEmail: "noreply@smarterasp.net");
                }
            }
        }

        private static void ClearFailedLogin(HttpContext context, string login)
        {
            var remoteIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            lock (LoginFailureLock)
            {
                LoginFailures.Remove($"{remoteIp}|{login}");
            }
        }

        private async Task HandleLegacyCheckoutRedirectAsync(HttpContext context)
        {
            var target = $"{GetLegacyCheckoutBaseUrl()}{context.Request.Path}{context.Request.QueryString}";
            await Results.Redirect(target, permanent: false).ExecuteAsync(context);
        }

        private async Task HandleLegacyCheckoutBridgeRedirectAsync(HttpContext context)
        {
            var path = context.Request.RouteValues["path"]?.ToString() ?? "";
            var target = $"{GetLegacyCheckoutBaseUrl()}/checkout/{path.TrimStart('/')}{context.Request.QueryString}";
            await Results.Redirect(target, permanent: false).ExecuteAsync(context);
        }

        private async Task HandlePasswordResetRequestAsync(HttpContext context)
        {
            var request = await context.Request.ReadFromJsonAsync<PasswordResetRequest>();
            var login = NormalizeAccountText(request?.Login, 120);
            if (string.IsNullOrWhiteSpace(login))
            {
                await Results.BadRequest(new PasswordResetResponse(false, "Enter your account username.", null)).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string customerSql = @"
SELECT TOP 1 customerID, status, CAST(email AS nvarchar(max)) AS email
FROM dbo.customer_profile
WHERE LOWER(customerLogin) = LOWER(@login)";

            long customerId;
            int status;
            string accountEmail;
            await using (var customerCommand = new SqlCommand(customerSql, connection))
            {
                customerCommand.Parameters.AddWithValue("@login", login);
                await using var reader = await customerCommand.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    await Results.Json(
                        new PasswordResetResponse(false, "Account was not found. Enter the account username, not the email address.", null),
                        statusCode: StatusCodes.Status404NotFound
                    ).ExecuteAsync(context);
                    return;
                }

                customerId = Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture);
                status = reader.IsDBNull(1) ? -1 : reader.GetInt32(1);
                accountEmail = reader.IsDBNull(2) ? "" : reader.GetString(2).Trim();
            }

            if (status == 3)
            {
                await Results.Json(
                    new PasswordResetResponse(false, "This account is canceled and cannot reset password from the account panel.", null),
                    statusCode: StatusCodes.Status403Forbidden
                ).ExecuteAsync(context);
                return;
            }

            await using (var cleanupCommand = new SqlCommand(@"
DELETE FROM dbo.reset_verify
WHERE customerID = @customerId
   OR DATEDIFF(minute, create_date, SYSDATETIME()) > 30", connection))
            {
                cleanupCommand.Parameters.AddWithValue("@customerId", customerId);
                await cleanupCommand.ExecuteNonQueryAsync();
            }

            var token = GenerateResetToken();
            await using (var insertCommand = new SqlCommand(@"
INSERT INTO dbo.reset_verify (reset_str, customerID, create_date)
VALUES (@resetStr, @customerId, GETDATE())", connection))
            {
                insertCommand.Parameters.AddWithValue("@resetStr", token);
                insertCommand.Parameters.AddWithValue("@customerId", customerId);
                await insertCommand.ExecuteNonQueryAsync();
            }

            var resetUrl = $"/account/retrieve_password_reset?guid={Uri.EscapeDataString(token)}";
            var absoluteResetUrl = BuildAbsoluteUrl(context, resetUrl);
            if (!IsValidEmail(accountEmail))
            {
                await Results.Json(
                    new PasswordResetResponse(false, "Password reset link was created, but this account email is not readable by the new panel yet. The stored email may still be legacy-encrypted.", resetUrl),
                    statusCode: StatusCodes.Status500InternalServerError
                ).ExecuteAsync(context);
                return;
            }

            var mailResult = await SendAccountEmailAsync(
                accountEmail,
                "SmarterASP.NET password reset",
                $@"
<p>Hello {WebUtility.HtmlEncode(login)},</p>
<p>Use the link below to reset your SmarterASP.NET account password. This link expires in 30 minutes.</p>
<p><a href=""{WebUtility.HtmlEncode(absoluteResetUrl)}"">Reset your password</a></p>
<p>If you did not request this, you can ignore this email.</p>",
                $@"Hello {login},

Use this link to reset your SmarterASP.NET account password. This link expires in 30 minutes.

{absoluteResetUrl}

If you did not request this, you can ignore this email."
            );
            if (!mailResult.Success)
            {
                await Results.Json(
                    new PasswordResetResponse(false, $"Password reset link was created, but SMTP delivery failed: {mailResult.Message}", resetUrl),
                    statusCode: StatusCodes.Status502BadGateway
                ).ExecuteAsync(context);
                return;
            }

            await Results.Ok(new PasswordResetResponse(true, $"Password reset email sent to {MaskStoredSecret(accountEmail)}.", resetUrl)).ExecuteAsync(context);
        }

        private async Task HandlePasswordResetConfirmAsync(HttpContext context)
        {
            var request = await context.Request.ReadFromJsonAsync<PasswordResetConfirmRequest>();
            var token = NormalizeAccountText(request?.Token, 256);
            var newPassword = request?.NewPassword ?? "";
            var confirmPassword = request?.ConfirmPassword ?? "";

            if (string.IsNullOrWhiteSpace(token))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Missing password reset token.")).ExecuteAsync(context);
                return;
            }

            if (newPassword != confirmPassword)
            {
                await Results.BadRequest(new AccountActionResponse(false, "New password and confirmation do not match.")).ExecuteAsync(context);
                return;
            }

            if (!IsPasswordComplexEnough(newPassword))
            {
                await Results.BadRequest(new AccountActionResponse(false, "Password must be at least 8 characters and include a letter and a number.")).ExecuteAsync(context);
                return;
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                await Results.Problem("Missing EhbConfig connection string.").ExecuteAsync(context);
                return;
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            long customerId;
            int tokenAgeMinutes;
            await using (var lookupCommand = new SqlCommand(@"
SELECT TOP 1 customerID, DATEDIFF(minute, create_date, SYSDATETIME()) AS token_age_minutes
FROM dbo.reset_verify
WHERE reset_str = @resetStr
  AND new_email IS NULL
ORDER BY create_date DESC", connection))
            {
                lookupCommand.Parameters.AddWithValue("@resetStr", token);
                await using var reader = await lookupCommand.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    await Results.Json(
                        new AccountActionResponse(false, "This password reset link is invalid or has already been used."),
                        statusCode: StatusCodes.Status404NotFound
                    ).ExecuteAsync(context);
                    return;
                }

                customerId = Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture);
                tokenAgeMinutes = ReadInt32(reader, 1, 9999);
            }

            if (tokenAgeMinutes > 30)
            {
                await using var expiredDeleteCommand = new SqlCommand("DELETE FROM dbo.reset_verify WHERE reset_str = @resetStr", connection);
                expiredDeleteCommand.Parameters.AddWithValue("@resetStr", token);
                await expiredDeleteCommand.ExecuteNonQueryAsync();

                await Results.BadRequest(new AccountActionResponse(false, "This password reset link has expired. Create a new reset link.")).ExecuteAsync(context);
                return;
            }

            await using (var updateCommand = new SqlCommand(@"
UPDATE dbo.customer_profile
SET pp1 = @passwordHash,
    securityversion = 5,
    customerPassHash = '5',
    reVerify = 1
WHERE customerID = @customerId", connection))
            {
                updateCommand.Parameters.AddWithValue("@passwordHash", HashHex(SHA256.HashData(Encoding.UTF8.GetBytes(newPassword))));
                updateCommand.Parameters.AddWithValue("@customerId", customerId);
                await updateCommand.ExecuteNonQueryAsync();
            }

            await using (var deleteCommand = new SqlCommand("DELETE FROM dbo.reset_verify WHERE customerID = @customerId", connection))
            {
                deleteCommand.Parameters.AddWithValue("@customerId", customerId);
                await deleteCommand.ExecuteNonQueryAsync();
            }

            await Results.Ok(new AccountActionResponse(true, "Password reset completed. FTP, Web Deploy, and hosting control panel passwords can be synced from the hosting control panel workflow.")).ExecuteAsync(context);
        }

        private static bool PasswordMatches(string password, string storedHash)
        {
            if (string.IsNullOrWhiteSpace(storedHash))
            {
                return false;
            }

            var candidates = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                HashHex(SHA512.HashData(Encoding.UTF8.GetBytes(password))),
                HashHex(SHA256.HashData(Encoding.UTF8.GetBytes(password)))
            };

            return candidates.Contains(storedHash.Trim());
        }

        private static bool IsPasswordComplexEnough(string password)
        {
            if (password.Length < 8)
            {
                return false;
            }

            var hasLetter = false;
            var hasNumber = false;
            foreach (var character in password)
            {
                hasLetter = hasLetter || char.IsLetter(character);
                hasNumber = hasNumber || char.IsDigit(character);
            }

            return hasLetter && hasNumber;
        }

        private static string NormalizeAccountText(string? value, int maxLength)
        {
            var normalized = (value ?? "").Trim();
            return normalized.Length <= maxLength ? normalized : normalized[..maxLength];
        }

        private static string HashHex(byte[] bytes) => Convert.ToHexString(bytes).ToLowerInvariant();

        private static string GenerateResetToken()
        {
            Span<byte> bytes = stackalloc byte[32];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static bool FixedTimeEquals(string left, string right)
        {
            var leftBytes = Encoding.UTF8.GetBytes(left);
            var rightBytes = Encoding.UTF8.GetBytes(right);
            return leftBytes.Length == rightBytes.Length && CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
        }

        private string GetEhbConfigConnectionString()
        {
            var envValue = Environment.GetEnvironmentVariable("EHB_CONFIG_CONNECTION_STRING");
            if (!string.IsNullOrWhiteSpace(envValue))
            {
                return envValue;
            }

            var configValue = _configuration.GetConnectionString("EhbConfig");
            if (!string.IsNullOrWhiteSpace(configValue))
            {
                return configValue;
            }

            return "";
        }

        private OpenSrsSettings GetOpenSrsSettings()
        {
            var apiUrl = ConfigOrEnv("OpenSrs:ApiUrl", "OPENSRS_API_URL");
            var username = ConfigOrEnv("OpenSrs:Username", "OPENSRS_USERNAME");
            var privateKey = ConfigOrEnv("OpenSrs:PrivateKey", "OPENSRS_PRIVATE_KEY");
            return new OpenSrsSettings(apiUrl.Trim(), username.Trim(), privateKey.Trim());
        }

        private string ConfigOrEnv(string configKey, string envKey, string fallback = "")
        {
            var envValue = Environment.GetEnvironmentVariable(envKey);
            if (!string.IsNullOrWhiteSpace(envValue))
            {
                return envValue;
            }

            var configValue = _configuration[configKey];
            if (!string.IsNullOrWhiteSpace(configValue))
            {
                return configValue;
            }

            return fallback;
        }

        private int ConfigOrEnvInt(string configKey, string envKey, int fallback)
        {
            var value = ConfigOrEnv(configKey, envKey);
            return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed)
                ? parsed
                : fallback;
        }

        private string BuildAbsoluteUrl(HttpContext context, string relativeUrl)
        {
            var configuredBaseUrl = ConfigOrEnv("PublicApp:BaseUrl", "PUBLIC_APP_BASE_URL").Trim().TrimEnd('/');
            var baseUrl = string.IsNullOrWhiteSpace(configuredBaseUrl)
                ? $"{context.Request.Scheme}://{context.Request.Host}"
                : configuredBaseUrl;

            return $"{baseUrl}{(relativeUrl.StartsWith("/", StringComparison.Ordinal) ? "" : "/")}{relativeUrl}";
        }

        private async Task<EmailSendResult> SendAccountEmailAsync(string to, string subject, string htmlBody, string textBody, string? fromEmail = null, string? fromName = null)
        {
            var senderEmail = string.IsNullOrWhiteSpace(fromEmail)
                ? ConfigOrEnv("Smtp:FromEmail", "SMTP_FROM_EMAIL", "noreply@smarterasp.net").Trim()
                : fromEmail.Trim();
            var senderName = string.IsNullOrWhiteSpace(fromName)
                ? ConfigOrEnv("Smtp:FromName", "SMTP_FROM_NAME", "SmarterASP.NET").Trim()
                : fromName.Trim();
            var endpoints = new[]
            {
                new SmtpEndpoint(
                    ConfigOrEnv("Smtp:PrimaryHost", "SMTP_PRIMARY_HOST", "mail.smarterasp.net").Trim(),
                    ConfigOrEnvInt("Smtp:PrimaryPort", "SMTP_PRIMARY_PORT", 8889)),
                new SmtpEndpoint(
                    ConfigOrEnv("Smtp:FallbackHost", "SMTP_FALLBACK_HOST", "gw5000").Trim(),
                    ConfigOrEnvInt("Smtp:FallbackPort", "SMTP_FALLBACK_PORT", 8889))
            };

            var errors = new List<string>();
            foreach (var endpoint in endpoints)
            {
                if (string.IsNullOrWhiteSpace(endpoint.Host) || endpoint.Port <= 0)
                {
                    continue;
                }

                try
                {
                    using var message = new MailMessage
                    {
                        From = new MailAddress(senderEmail, senderName),
                        Subject = subject,
                        Body = htmlBody,
                        IsBodyHtml = true,
                        BodyEncoding = Encoding.UTF8,
                        SubjectEncoding = Encoding.UTF8
                    };
                    message.To.Add(to);
                    message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(textBody, Encoding.UTF8, "text/plain"));

                    using var smtp = new SmtpClient(endpoint.Host, endpoint.Port)
                    {
                        DeliveryMethod = SmtpDeliveryMethod.Network,
                        EnableSsl = false,
                        UseDefaultCredentials = false,
                        Credentials = null,
                        Timeout = ConfigOrEnvInt("Smtp:TimeoutMs", "SMTP_TIMEOUT_MS", 12000)
                    };

                    await smtp.SendMailAsync(message);
                    return new EmailSendResult(true, $"Sent through {endpoint.Host}:{endpoint.Port}.");
                }
                catch (Exception ex)
                {
                    errors.Add($"{endpoint.Host}:{endpoint.Port} {ex.Message}");
                }
            }

            var messageText = errors.Count == 0
                ? "No SMTP endpoints are configured."
                : string.Join("; ", errors);
            return new EmailSendResult(false, messageText);
        }

        private async Task<ReadableCustomerEmailResult> LoadReadableCustomerEmailAsync(long customerId)
        {
            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                return new ReadableCustomerEmailResult(false, "", "Missing EhbConfig connection string.");
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            await using var command = new SqlCommand("SELECT TOP 1 CAST(email AS nvarchar(max)) FROM dbo.customer_profile WHERE customerID = @customerId", connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            var value = await command.ExecuteScalarAsync();
            var email = value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
            if (!IsValidEmail(email))
            {
                return new ReadableCustomerEmailResult(false, "", "Customer email is not readable by the new panel yet. The stored value may still be legacy-encrypted.");
            }

            return new ReadableCustomerEmailResult(true, email, "Customer email loaded.");
        }

        private string GetBrandDomainForCustomer(long customerId)
        {
            return ConfigOrEnv("Legacy:PublicDomain", "LEGACY_PUBLIC_DOMAIN", "smarterasp.net").Trim();
        }

        private async Task<EmailSendResult> SendCustomerNotificationEmailAsync(long customerId, string fromEmail, string subject, string htmlBody, string textBody)
        {
            var email = await LoadReadableCustomerEmailAsync(customerId);
            if (!email.Success)
            {
                return new EmailSendResult(false, email.Message);
            }

            return await SendAccountEmailAsync(email.Email, subject, htmlBody, textBody, fromEmail: fromEmail);
        }

        private async Task<EmailSendResult> SendAccountActivationEmailAsync(HttpContext context, long customerId, string customerLogin)
        {
            var email = await LoadReadableCustomerEmailAsync(customerId);
            if (!email.Success)
            {
                return new EmailSendResult(false, email.Message);
            }

            var brandDomain = GetBrandDomainForCustomer(customerId);
            var verifyHash = HashHex(MD5.HashData(Encoding.UTF8.GetBytes($"{customerLogin.ToLowerInvariant()}{email.Email.ToLowerInvariant()}")));
            var verifyUrl = BuildAbsoluteUrl(context, $"/account/activate_account?emailverify={Uri.EscapeDataString(verifyHash)}");
            return await SendAccountEmailAsync(
                email.Email,
                $"[{brandDomain}]Pending Account Confirmation",
                $@"
<p>Hello {WebUtility.HtmlEncode(customerLogin)},</p>
<p>Please confirm your {WebUtility.HtmlEncode(brandDomain)} account by opening the link below.</p>
<p><a href=""{WebUtility.HtmlEncode(verifyUrl)}"">Confirm account</a></p>",
                $@"Hello {customerLogin},

Please confirm your {brandDomain} account:

{verifyUrl}",
                fromEmail: $"noreply@{brandDomain}"
            );
        }

        private static async Task WriteAccountMailResultAsync(HttpContext context, EmailSendResult result, string successMessage)
        {
            if (result.Success)
            {
                await Results.Ok(new AccountActionResponse(true, successMessage)).ExecuteAsync(context);
                return;
            }

            await Results.Json(
                new AccountActionResponse(false, $"SMTP delivery failed: {result.Message}"),
                statusCode: StatusCodes.Status502BadGateway
            ).ExecuteAsync(context);
        }

        private List<string> GetDefaultDnsServers()
        {
            var value = ConfigOrEnv("HostingDefaults:DnsServers", "HOSTING_DEFAULT_DNS_SERVERS", "NS1.SITE4NOW.NET,NS2.SITE4NOW.NET,NS3.SITE4NOW.NET");
            var servers = value
                .Split(new[] { ',', ';', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(server => !string.IsNullOrWhiteSpace(server))
                .ToList();

            return servers.Count == 0
                ? new List<string> { "NS1.SITE4NOW.NET", "NS2.SITE4NOW.NET", "NS3.SITE4NOW.NET" }
                : servers;
        }

        private string GetDefaultHostingIp()
        {
            return ConfigOrEnv("HostingDefaults:SharedIp", "HOSTING_DEFAULT_SHARED_IP", "208.98.35.146").Trim();
        }

        private string GetLegacyPublicDomain()
        {
            return ConfigOrEnv("Legacy:PublicDomain", "LEGACY_PUBLIC_DOMAIN", ConfigOrEnv("LegacyAgent:ServerDomainName", "LEGACY_SERVER_DOMAIN_NAME", "site4now.net")).Trim();
        }

        private string BuildLegacyPublicHost(string serverId)
        {
            var server = (serverId ?? "").Trim();
            if (string.IsNullOrWhiteSpace(server))
            {
                return "";
            }

            return server.Contains('.', StringComparison.Ordinal)
                ? server.ToLowerInvariant()
                : $"{server.ToLowerInvariant()}.{GetLegacyPublicDomain()}";
        }

        private string GetHostingHomeRoot()
        {
            var value = ConfigOrEnv("Hosting:HomeRoot", "HOSTING_HOME_ROOT", @"h:\root\home").Trim().TrimEnd('\\', '/');
            return string.IsNullOrWhiteSpace(value) ? @"h:\root\home" : value.Replace('/', '\\');
        }

        private static LoginUser? GetSessionUser(HttpContext context)
        {
            var customerIdText = context.Session.GetString("customerID");
            var customerLogin = context.Session.GetString("customerLogin");
            var customerType = context.Session.GetString("customerType");

            if (!long.TryParse(customerIdText, out var customerId) || string.IsNullOrWhiteSpace(customerLogin) || string.IsNullOrWhiteSpace(customerType))
            {
                return null;
            }

            return new LoginUser(customerId, customerLogin, customerType);
        }

        private static bool TryReadRouteInt(HttpContext context, string name, out int value)
        {
            var raw = context.Request.RouteValues[name]?.ToString();
            return int.TryParse(raw, out value);
        }

        private static async Task<string> CreateBuyerTempOrderAsync(
            SqlConnection connection,
            long customerId,
            int productId,
            string productName,
            decimal amount,
            string info1,
            string info2,
            string info3,
            string info4,
            string info5,
            int pageType,
            bool trackable = false)
        {
            var guid = Guid.NewGuid().ToString("B").ToUpperInvariant();

            const string sql = @"
INSERT INTO oms.dbo.buyer_temp
    (trackable, amount, id, customer_id, product_id, product_name, info1, info2, info3, info4, info5, adddate, pagetype)
VALUES
    (@trackable, @amount, @id, @customerId, @productId, @productName, @info1, @info2, @info3, @info4, @info5, GETDATE(), @pageType)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@trackable", trackable);
            command.Parameters.AddWithValue("@amount", amount);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@productId", productId);
            command.Parameters.AddWithValue("@productName", Truncate(productName, 150));
            command.Parameters.AddWithValue("@info1", Truncate(info1, 150));
            command.Parameters.AddWithValue("@info2", Truncate(info2, 150));
            command.Parameters.AddWithValue("@info3", Truncate(info3, 150));
            command.Parameters.AddWithValue("@info4", Truncate(info4, 150));
            command.Parameters.AddWithValue("@info5", Truncate(info5, 150));
            command.Parameters.AddWithValue("@pageType", pageType);

            await command.ExecuteNonQueryAsync();
            return guid;
        }

        private static async Task<CheckoutTempOrder?> LoadCheckoutTempOrderAsync(SqlConnection connection, long customerId, string guid)
        {
            const string sql = @"
SELECT TOP 1 id, customer_id, product_id, product_name, amount, info1, info2, info3, info4, info5, pagetype, adddate, ispaid, processed, trackable
FROM oms.dbo.buyer_temp
WHERE id = @id
  AND customer_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var pageType = Convert.ToInt32(reader.GetDecimal(10), CultureInfo.InvariantCulture);

            return new CheckoutTempOrder(
                reader.GetString(0),
                Convert.ToInt64(reader.GetDecimal(1), CultureInfo.InvariantCulture),
                Convert.ToInt32(reader.GetDecimal(2), CultureInfo.InvariantCulture),
                reader.GetString(3),
                reader.GetDecimal(4),
                reader.IsDBNull(5) ? "" : reader.GetString(5),
                reader.IsDBNull(6) ? "" : reader.GetString(6),
                reader.IsDBNull(7) ? "" : reader.GetString(7),
                reader.IsDBNull(8) ? "" : reader.GetString(8),
                reader.IsDBNull(9) ? "" : reader.GetString(9),
                pageType,
                reader.GetDateTime(11),
                !reader.IsDBNull(12) && reader.GetBoolean(12),
                !reader.IsDBNull(13) && reader.GetBoolean(13),
                !reader.IsDBNull(14) && reader.GetBoolean(14),
                CheckoutFulfillmentPath(pageType, guid)
            );
        }

        private static CheckoutTempOrderResponse BuildCheckoutTempOrderResponse(string message, CheckoutTempOrder? order, decimal balance, bool success = true)
        {
            var shortfall = order == null ? 0m : Math.Max(0m, order.Amount - balance);
            var canContinue = order != null
                && !order.Processed
                && (order.IsPaid || balance >= order.Amount);

            return new CheckoutTempOrderResponse(
                success,
                message,
                order,
                new AccountBalanceSummary(balance, "USD", "Account credit ledger"),
                canContinue,
                shortfall
            );
        }

        private static async Task<List<CheckoutTempOrder>> LoadPendingCheckoutTempOrdersAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 10 id, customer_id, product_id, product_name, amount, info1, info2, info3, info4, info5, pagetype, adddate, ispaid, processed, trackable
FROM oms.dbo.buyer_temp
WHERE customer_id = @customerId
  AND (ISNULL(ispaid, 0) = 0 OR ISNULL(processed, 0) = 0)
  AND adddate > DATEADD(day, -1, SYSDATETIME())
ORDER BY adddate DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var orders = new List<CheckoutTempOrder>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var guid = reader.GetString(0);
                var pageType = Convert.ToInt32(reader.GetDecimal(10), CultureInfo.InvariantCulture);
                orders.Add(new CheckoutTempOrder(
                    guid,
                    Convert.ToInt64(reader.GetDecimal(1), CultureInfo.InvariantCulture),
                    Convert.ToInt32(reader.GetDecimal(2), CultureInfo.InvariantCulture),
                    reader.GetString(3),
                    reader.GetDecimal(4),
                    reader.IsDBNull(5) ? "" : reader.GetString(5),
                    reader.IsDBNull(6) ? "" : reader.GetString(6),
                    reader.IsDBNull(7) ? "" : reader.GetString(7),
                    reader.IsDBNull(8) ? "" : reader.GetString(8),
                    reader.IsDBNull(9) ? "" : reader.GetString(9),
                    pageType,
                    reader.GetDateTime(11),
                    !reader.IsDBNull(12) && reader.GetBoolean(12),
                    !reader.IsDBNull(13) && reader.GetBoolean(13),
                    !reader.IsDBNull(14) && reader.GetBoolean(14),
                    CheckoutFulfillmentPath(pageType, guid)
                ));
            }

            return orders;
        }

        private static async Task<RenewTempOrder?> LoadRenewTempOrderAsync(SqlConnection connection, long customerId, string guid)
        {
            const string sql = @"
	SELECT TOP 1 id, customerid, amount, CAST(renewinfo AS nvarchar(max)) AS renewinfo, adddate, ispaid, isprocessed
	FROM oms.dbo.renew_temp
	WHERE id = @id
	  AND customerid = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

	            return new RenewTempOrder(
	                reader.GetString(0),
	                Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
	                Convert.ToDecimal(reader.GetValue(2), CultureInfo.InvariantCulture),
	                reader.IsDBNull(3) ? "" : reader.GetString(3),
	                reader.GetDateTime(4),
	                ReadBoolean(reader, 5),
	                ReadBoolean(reader, 6),
	                $"/account/multiple_renewal_action?order_guid={Uri.EscapeDataString(guid)}"
	            );
        }

        private static async Task<List<RenewTempOrder>> LoadPendingRenewTempOrdersAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
	SELECT TOP 10 id, customerid, amount, CAST(renewinfo AS nvarchar(max)) AS renewinfo, adddate, ispaid, isprocessed
	FROM oms.dbo.renew_temp
	WHERE customerid = @customerId
	  AND (ISNULL(ispaid, 0) = 0 OR ISNULL(isprocessed, 0) = 0)
	  AND adddate > DATEADD(day, -1, SYSDATETIME())
	  AND NULLIF(LTRIM(RTRIM(CAST(renewinfo AS nvarchar(max)))), '') IS NOT NULL
	ORDER BY adddate DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var orders = new List<RenewTempOrder>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var guid = reader.GetString(0);
	                orders.Add(new RenewTempOrder(
	                    guid,
	                    Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
	                    Convert.ToDecimal(reader.GetValue(2), CultureInfo.InvariantCulture),
	                    reader.IsDBNull(3) ? "" : reader.GetString(3),
	                    reader.GetDateTime(4),
	                    ReadBoolean(reader, 5),
	                    ReadBoolean(reader, 6),
	                    $"/account/multiple_renewal_action?order_guid={Uri.EscapeDataString(guid)}"
	                ));
            }

            return orders;
        }

        private static string CheckoutFulfillmentPath(int pageType, string guid) => pageType switch
        {
            ConstPageTypeNewCp => "/account/create_new_cp1",
            ConstPageTypeBuyDomain => "/account/checkoutDomainBuy",
            ConstPageTypeTransferDomain => "/account/transfer_domain_step2",
            ConstPageTypeCpRenew => "/account/cp_renew_action",
            ConstPageTypeNewSite => "/account/addon_purchase_detail?type=2",
            ConstPageTypeWebQuota => "/account/addon_purchase_detail?type=6",
            ConstPageTypeMssqlDb => "/account/addon_purchase_detail?type=7",
            ConstPageTypeMssqlQuota => "/account/addon_purchase_detail?type=8",
            ConstPageTypeMysqlDb => "/account/addon_purchase_detail?type=9",
            ConstPageTypeMysqlQuota => "/account/addon_purchase_detail?type=10",
            ConstPageTypeIp => "/account/addon_purchase_detail?type=12",
            ConstPageTypeSsl => "/account/addon_purchase_ssl",
            ConstPageTypeFullRestore => "/account/addon_purchase_detail?type=14",
            ConstPageTypeEmailQuota => "/account/addon_purchase_detail?type=17",
            ConstPageTypeWhoisPrivacy => "/account/addon_purchase_detail?type=19",
            ConstPageTypeGeneral => "/account/addon_purchase_detail?type=22",
            ConstPageTypeWebUser => "/account/addon_purchase_detail?type=23",
            ConstPageTypeDailySentLimit => "/account/addon_purchase_detail?type=24",
            ConstPageTypeCustomBackup => "/account/addon_purchase_detail?type=26",
            ConstPageTypeMailingList => "/account/addon_purchase_detail?type=27",
            ConstPageTypeSsrs => "/account/addon_purchase_detail?type=28",
            ConstPageTypeTasks => "/account/addon_purchase_detail?type=29",
            ConstPageTypeHourlySentLimit => "/account/addon_purchase_detail?type=30",
            ConstPageTypeSqlJob => "/account/addon_purchase_detail?type=31",
            ConstPageTypeRam => "/account/addon_purchase_detail?type=32",
            ConstPageTypeWebsiteFirewall => "/account/addon_purchase_detail?type=33",
            ConstPageTypeWindowsTask => "/account/addon_purchase_detail?type=34",
            ConstPageTypeCorpEmailQuota => "/account/addon_purchase_detail?type=35",
            ConstPageTypeFileCountLimit => "/account/addon_purchase_detail?type=36",
            ConstPageTypeVpn => "/account/addon_purchase_vpn_action",
            ConstPageTypeCloudBackup => "/account/addon_purchase_detail?type=38",
            ConstPageTypeDataBackup => "/account/addon_purchase_detail?type=39",
            ConstPageTypeServerBackup => "/account/addon_purchase_detail?type=40",
            _ => $"/checkout/checkout_complete?guid={Uri.EscapeDataString(guid)}"
        };

        private static async Task SyncDomainSessionCartAsync(SqlConnection connection, string sessionId, long customerId, List<DomainCheckoutItem> domains)
        {
            await using (var deleteCommand = new SqlCommand(@"
DELETE FROM sitecart.dbo.sessionCart
WHERE accountid = @accountId
  AND Type IN ('domain', 'WhoisPrivate')", connection))
            {
                deleteCommand.Parameters.AddWithValue("@accountId", customerId.ToString(CultureInfo.InvariantCulture));
                await deleteCommand.ExecuteNonQueryAsync();
            }

            foreach (var domain in domains)
            {
                await using var insertCommand = new SqlCommand(@"
INSERT INTO sitecart.dbo.sessionCart
    (isUniqueDesc, enableBuyYear, sessionID, addDate, Description, price, Type, accountid, buyyear)
VALUES
    (0, @enableBuyYear, @sessionId, GETDATE(), @description, @price, @type, @accountId, @buyYear)", connection);
                insertCommand.Parameters.AddWithValue("@enableBuyYear", true);
                insertCommand.Parameters.AddWithValue("@sessionId", Truncate(sessionId, 250));
                insertCommand.Parameters.AddWithValue("@description", Truncate(domain.DomainName, 250));
                insertCommand.Parameters.AddWithValue("@price", domain.Price);
                insertCommand.Parameters.AddWithValue("@type", "domain");
                insertCommand.Parameters.AddWithValue("@accountId", customerId.ToString(CultureInfo.InvariantCulture));
                insertCommand.Parameters.AddWithValue("@buyYear", 1);
                await insertCommand.ExecuteNonQueryAsync();
            }
        }

        private static async Task<decimal> LoadDomainSessionCartTotalAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT COALESCE(SUM(COALESCE(price, 0) * COALESCE(buyyear, 1)), 0)
FROM sitecart.dbo.sessionCart
WHERE accountid = @accountId
  AND Type IN ('domain', 'WhoisPrivate')";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@accountId", customerId.ToString(CultureInfo.InvariantCulture));
            var result = await command.ExecuteScalarAsync();
            return result == null || result == DBNull.Value ? 0m : Convert.ToDecimal(result, CultureInfo.InvariantCulture);
        }

        private static async Task<DomainCredential?> LoadDomainCredentialAsync(SqlConnection connection, long customerId, int registerInfoId)
        {
            if (registerInfoId <= 0)
            {
                return null;
            }

            const string sql = @"
SELECT TOP 1 adminusername, adminpassword
FROM domaincontroller.dbo.DomainRegisterInfo
WHERE id = @registerInfoId
  AND sponsorid = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@registerInfoId", registerInfoId);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var username = reader.IsDBNull(0) ? "" : reader.GetString(0).Trim();
            var password = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
            return string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password)
                ? null
                : new DomainCredential(username, password);
        }

        private static async Task<DomainAvailabilityResult> CheckDomainAvailabilityAsync(HttpClient httpClient, string domainName, OpenSrsSettings openSrs)
        {
            if (openSrs.IsConfigured)
            {
                var openSrsResult = await CheckDomainAvailabilityWithOpenSrsAsync(httpClient, domainName, openSrs);
                if (openSrsResult.Reason != "OpenSRS unavailable")
                {
                    return openSrsResult;
                }
            }

            return await CheckDomainAvailabilityWithRdapAsync(httpClient, domainName);
        }

        private static async Task<DomainAvailabilityResult> CheckDomainAvailabilityWithOpenSrsAsync(HttpClient httpClient, string domainName, OpenSrsSettings openSrs)
        {
            try
            {
                var (searchString, tld) = SplitDomainForOpenSrs(domainName);
                if (string.IsNullOrWhiteSpace(searchString) || string.IsNullOrWhiteSpace(tld))
                {
                    return new DomainAvailabilityResult(domainName, false, "Invalid domain", "opensrs");
                }

                var xml = BuildOpenSrsNameSuggestXml(searchString, tld);
                using var request = new HttpRequestMessage(HttpMethod.Post, openSrs.ApiUrl);
                request.Content = new StringContent(xml, Encoding.UTF8, "text/xml");
                request.Headers.TryAddWithoutValidation("X-Username", openSrs.Username);
                request.Headers.TryAddWithoutValidation("X-Signature", BuildOpenSrsSignature(xml, openSrs.PrivateKey));

                using var response = await httpClient.SendAsync(request);
                var responseXml = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(responseXml))
                {
                    return new DomainAvailabilityResult(domainName, false, "OpenSRS unavailable", "opensrs");
                }

                var status = ReadOpenSrsItemValue(responseXml, "status");
                if (status.Equals("available", StringComparison.OrdinalIgnoreCase))
                {
                    return new DomainAvailabilityResult(domainName, true, "Available", "opensrs");
                }

                if (status.Equals("taken", StringComparison.OrdinalIgnoreCase))
                {
                    return new DomainAvailabilityResult(domainName, false, "Unavailable", "opensrs");
                }

                var responseText = ReadOpenSrsItemValue(responseXml, "response_text");
                if (!string.IsNullOrWhiteSpace(responseText))
                {
                    return new DomainAvailabilityResult(domainName, false, responseText, "opensrs");
                }

                return new DomainAvailabilityResult(domainName, false, "Could not verify", "opensrs");
            }
            catch
            {
                return new DomainAvailabilityResult(domainName, false, "OpenSRS unavailable", "opensrs");
            }
        }

        private static async Task<DomainAvailabilityResult> CheckDomainAvailabilityWithRdapAsync(HttpClient httpClient, string domainName)
        {
            try
            {
                using var response = await httpClient.GetAsync($"https://rdap.org/domain/{Uri.EscapeDataString(domainName)}");
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    return new DomainAvailabilityResult(domainName, true, "Available", "rdap fallback");
                }

                if (response.IsSuccessStatusCode)
                {
                    return new DomainAvailabilityResult(domainName, false, "Unavailable", "rdap fallback");
                }

                return new DomainAvailabilityResult(domainName, false, $"Could not verify ({(int)response.StatusCode})", "rdap fallback");
            }
            catch
            {
                return new DomainAvailabilityResult(domainName, false, "Could not verify", "rdap fallback");
            }
        }

        private static (string SearchString, string Tld) SplitDomainForOpenSrs(string domainName)
        {
            var firstDot = domainName.IndexOf('.', StringComparison.Ordinal);
            if (firstDot <= 0 || firstDot == domainName.Length - 1)
            {
                return ("", "");
            }

            return (domainName[..firstDot], domainName[(firstDot + 1)..]);
        }

        private static string BuildOpenSrsNameSuggestXml(string searchString, string tld) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header>
    <version>0.9</version>
  </header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">name_suggest</item>
        <item key=""object"">domain</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""service_override"">
              <dt_assoc>
                <item key=""lookup"">
                  <dt_assoc>
                    <item key=""tlds"">
                      <dt_array>
                        <item key=""0"">{WebUtility.HtmlEncode(tld)}</item>
                      </dt_array>
                    </item>
                  </dt_assoc>
                </item>
              </dt_assoc>
            </item>
            <item key=""services"">
              <dt_array>
                <item key=""0"">lookup</item>
              </dt_array>
            </item>
            <item key=""searchstring"">{WebUtility.HtmlEncode(searchString)}</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static async Task<OpenSrsActionResult> UpdateDomainNameserversWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string nameserverText,
            string remoteIp)
        {
            var nameservers = ParseNameservers(nameserverText);
            if (nameservers.Count < 2)
            {
                return new OpenSrsActionResult(false, "Enter at least two nameservers separated by comma or new line.");
            }

            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsNameserverXml(cookieResult.Cookie, nameservers);
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, $"Nameservers updated for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainLockWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            bool shouldLock,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsLockXml(cookieResult.Cookie, domainName, shouldLock ? "1" : "0");
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, shouldLock ? $"Domain locked for {domainName}." : $"Domain unlocked for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainWhoisPrivacyWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            bool shouldEnable,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsWhoisPrivacyXml(cookieResult.Cookie, shouldEnable ? "enabled" : "disabled");
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, shouldEnable ? $"WHOIS privacy enabled for {domainName}." : $"WHOIS privacy disabled for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> GetDomainStatusWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsDomainStatusXml(cookieResult.Cookie, remoteIp);
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                var result = OpenSrsResultFromXml(response, $"Status loaded for {domainName}.");
                if (!result.Success)
                {
                    return result;
                }

                var lockState = ReadOpenSrsItemValue(response, "lock_state");
                var autoRenew = ReadOpenSrsItemValue(response, "auto_renew");
                var expireDate = ReadOpenSrsItemValue(response, "expiredate");
                var status = ReadOpenSrsItemValue(response, "status");
                var parts = new List<string>();
                if (!string.IsNullOrWhiteSpace(status)) parts.Add($"Status: {status}");
                if (!string.IsNullOrWhiteSpace(lockState)) parts.Add($"Lock: {(lockState == "1" ? "Locked" : "Unlocked")}");
                if (!string.IsNullOrWhiteSpace(autoRenew)) parts.Add($"Auto Renew: {autoRenew}");
                if (!string.IsNullOrWhiteSpace(expireDate)) parts.Add($"Expires: {expireDate}");
                return new OpenSrsActionResult(true, parts.Count == 0 ? result.Message : string.Join(" | ", parts));
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> GetDomainAuthCodeWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsAuthCodeXml(cookieResult.Cookie);
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                var result = OpenSrsResultFromXml(response, $"Auth code loaded for {domainName}.");
                if (!result.Success)
                {
                    return result;
                }

                var authCode = ReadOpenSrsItemValue(response, "domain_auth_info");
                return new OpenSrsActionResult(true, string.IsNullOrWhiteSpace(authCode) ? result.Message : $"Auth Code: {authCode}");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainContactWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string contactText,
            string remoteIp)
        {
            var contact = ParseContactFields(contactText);
            foreach (var required in new[] { "first_name", "last_name", "email", "address1", "city", "country", "postal_code", "phone" })
            {
                if (!contact.ContainsKey(required) || string.IsNullOrWhiteSpace(contact[required]))
                {
                    return new OpenSrsActionResult(false, $"Contact update needs {required.Replace('_', ' ')}.");
                }
            }

            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsContactXml(cookieResult.Cookie, contact, remoteIp);
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, $"Contact updated for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainExpireActionWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            bool shouldAutoRenew,
            string remoteIp)
        {
            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsExpireActionXml(cookieResult.Cookie, shouldAutoRenew ? "1" : "0", shouldAutoRenew ? "0" : "1");
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                var result = OpenSrsResultFromXml(response, shouldAutoRenew ? $"Auto renew enabled for {domainName}." : $"Auto renew disabled for {domainName}.");
                if (!result.Success)
                {
                    return result;
                }

                var autoRenew = ReadOpenSrsItemValue(response, "auto_renew");
                var expireDate = ReadOpenSrsItemValue(response, "expiredate");
                var parts = new List<string> { shouldAutoRenew ? "Auto Renew: On" : "Auto Renew: Off" };
                if (!string.IsNullOrWhiteSpace(autoRenew)) parts.Add($"Registrar Value: {autoRenew}");
                if (!string.IsNullOrWhiteSpace(expireDate)) parts.Add($"Expires: {expireDate}");
                return new OpenSrsActionResult(true, string.Join(" | ", parts));
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsActionResult> UpdateDomainForwardingWithOpenSrsAsync(
            HttpClient httpClient,
            OpenSrsSettings openSrs,
            string domainName,
            DomainCredential credential,
            string forwardingText,
            string remoteIp)
        {
            var emails = ParseForwardingEmails(forwardingText);
            if (emails.Count == 0)
            {
                return new OpenSrsActionResult(false, "Enter at least one forwarding email address.");
            }

            var cookieResult = await CreateOpenSrsCookieAsync(httpClient, openSrs, domainName, credential, remoteIp);
            if (!cookieResult.Success || string.IsNullOrWhiteSpace(cookieResult.Cookie))
            {
                return new OpenSrsActionResult(false, cookieResult.Message);
            }

            try
            {
                var xml = BuildOpenSrsForwardingXml(cookieResult.Cookie, string.Join(",", emails));
                var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
                return OpenSrsResultFromXml(response, $"Forwarding email updated for {domainName}.");
            }
            finally
            {
                await DeleteOpenSrsCookieAsync(httpClient, openSrs, cookieResult.Cookie);
            }
        }

        private static async Task<OpenSrsCookieResult> CreateOpenSrsCookieAsync(HttpClient httpClient, OpenSrsSettings openSrs, string domainName, DomainCredential credential, string remoteIp)
        {
            var xml = BuildOpenSrsSetCookieXml(domainName, credential.Username, credential.Password, remoteIp);
            var response = await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
            var cookie = ReadOpenSrsItemValue(response, "cookie");
            if (!string.IsNullOrWhiteSpace(cookie))
            {
                return new OpenSrsCookieResult(true, "OpenSRS cookie created.", cookie);
            }

            var responseText = ReadOpenSrsItemValue(response, "response_text");
            return new OpenSrsCookieResult(false, string.IsNullOrWhiteSpace(responseText) ? "OpenSRS rejected the domain manager login." : responseText, "");
        }

        private static async Task DeleteOpenSrsCookieAsync(HttpClient httpClient, OpenSrsSettings openSrs, string cookie)
        {
            if (string.IsNullOrWhiteSpace(cookie))
            {
                return;
            }

            var xml = BuildOpenSrsDeleteCookieXml(cookie);
            await PostOpenSrsXmlAsync(httpClient, openSrs, xml);
        }

        private static async Task<string> PostOpenSrsXmlAsync(HttpClient httpClient, OpenSrsSettings openSrs, string xml)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, openSrs.ApiUrl);
            request.Content = new StringContent(xml, Encoding.UTF8, "text/xml");
            request.Headers.TryAddWithoutValidation("X-Username", openSrs.Username);
            request.Headers.TryAddWithoutValidation("X-Signature", BuildOpenSrsSignature(xml, openSrs.PrivateKey));

            using var response = await httpClient.SendAsync(request);
            var responseXml = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return $@"<?xml version=""1.0""?><response><item key=""response_text"">OpenSRS HTTP {(int)response.StatusCode}</item><item key=""is_success"">0</item></response>";
            }

            return responseXml;
        }

        private static OpenSrsActionResult OpenSrsResultFromXml(string xml, string successMessage)
        {
            var isSuccess = ReadOpenSrsItemValue(xml, "is_success");
            var responseText = ReadOpenSrsItemValue(xml, "response_text");
            if (isSuccess == "1")
            {
                return new OpenSrsActionResult(true, string.IsNullOrWhiteSpace(responseText) ? successMessage : responseText);
            }

            return new OpenSrsActionResult(false, string.IsNullOrWhiteSpace(responseText) ? "OpenSRS action failed." : responseText);
        }

        private static List<string> ParseNameservers(string nameserverText)
        {
            var nameservers = new List<string>();
            var parts = nameserverText.Split(new[] { ',', '\n', '\r', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var part in parts)
            {
                var normalized = part.Trim().TrimEnd('.').ToLowerInvariant();
                if (normalized.Contains('.') && !nameservers.Exists(item => item.Equals(normalized, StringComparison.OrdinalIgnoreCase)))
                {
                    nameservers.Add(normalized);
                }
            }

            return nameservers;
        }

        private static DomainDnsParseResult ParseDnsRecords(string recordsText, string domainName)
        {
            var records = new List<DomainDnsRecordPreview>();
            var lines = (recordsText ?? "").Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (lines.Length == 0)
            {
                return new DomainDnsParseResult(false, "Add at least one DNS record.", records);
            }

            foreach (var line in lines)
            {
                if (line.StartsWith("#", StringComparison.Ordinal) || line.StartsWith("//", StringComparison.Ordinal))
                {
                    continue;
                }

                var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                if (parts.Length < 3)
                {
                    return new DomainDnsParseResult(false, $"DNS record is incomplete: {line}", records);
                }

                var type = parts[0].ToUpperInvariant();
                var name = NormalizeDnsRecordName(parts[1], domainName);
                var value = parts[2];
                int? priority = null;
                var ttl = 3600;

                if (!IsValidDnsRecordName(name))
                {
                    return new DomainDnsParseResult(false, $"DNS record name is invalid: {parts[1]}", records);
                }

                switch (type)
                {
                    case "A":
                        if (!IsIpAddress(value, AddressFamily.InterNetwork))
                        {
                            return new DomainDnsParseResult(false, $"A record must use an IPv4 address: {line}", records);
                        }
                        ttl = ParseDnsTtl(parts, 3);
                        break;
                    case "AAAA":
                        if (!IsIpAddress(value, AddressFamily.InterNetworkV6))
                        {
                            return new DomainDnsParseResult(false, $"AAAA record must use an IPv6 address: {line}", records);
                        }
                        ttl = ParseDnsTtl(parts, 3);
                        break;
                    case "CNAME":
                        if (!IsValidDnsTarget(value))
                        {
                            return new DomainDnsParseResult(false, $"CNAME target is invalid: {line}", records);
                        }
                        ttl = ParseDnsTtl(parts, 3);
                        break;
                    case "MX":
                        if (!IsValidDnsTarget(value))
                        {
                            return new DomainDnsParseResult(false, $"MX target is invalid: {line}", records);
                        }

                        if (parts.Length > 3 && int.TryParse(parts[3], NumberStyles.Integer, CultureInfo.InvariantCulture, out var mxPriority))
                        {
                            priority = mxPriority;
                            ttl = ParseDnsTtl(parts, 4);
                        }
                        else
                        {
                            priority = 10;
                            ttl = ParseDnsTtl(parts, 3);
                        }
                        break;
                    case "TXT":
                        value = string.Join(" ", parts, 2, parts.Length - 2).Trim().Trim('"');
                        if (string.IsNullOrWhiteSpace(value))
                        {
                            return new DomainDnsParseResult(false, $"TXT value is required: {line}", records);
                        }
                        break;
                    default:
                        return new DomainDnsParseResult(false, $"Unsupported DNS record type: {type}", records);
                }

                records.Add(new DomainDnsRecordPreview(type, name, value.TrimEnd('.'), priority, ttl));
            }

            if (records.Count == 0)
            {
                return new DomainDnsParseResult(false, "Add at least one DNS record.", records);
            }

            return new DomainDnsParseResult(true, "DNS records are valid.", records);
        }

        private static string NormalizeDnsRecordName(string name, string domainName)
        {
            var normalized = (name ?? "").Trim().TrimEnd('.').ToLowerInvariant();
            var rootDomain = (domainName ?? "").Trim().TrimEnd('.').ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(normalized) || normalized == rootDomain)
            {
                return "@";
            }

            if (normalized.EndsWith("." + rootDomain, StringComparison.OrdinalIgnoreCase))
            {
                return normalized[..^(rootDomain.Length + 1)];
            }

            return normalized;
        }

        private static bool IsValidDnsRecordName(string name)
        {
            if (name == "@")
            {
                return true;
            }

            var labels = name.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (labels.Length == 0)
            {
                return false;
            }

            foreach (var label in labels)
            {
                if (label == "*")
                {
                    continue;
                }

                if (label.Length is < 1 or > 63 || label.StartsWith("-", StringComparison.Ordinal) || label.EndsWith("-", StringComparison.Ordinal))
                {
                    return false;
                }

                foreach (var character in label)
                {
                    if (!char.IsLetterOrDigit(character) && character != '-')
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        private static bool IsValidDnsTarget(string target)
        {
            var normalized = (target ?? "").Trim().TrimEnd('.').ToLowerInvariant();
            if (normalized == "@")
            {
                return true;
            }

            if (!normalized.Contains('.', StringComparison.Ordinal))
            {
                return false;
            }

            return IsValidDnsRecordName(normalized);
        }

        private static bool IsIpAddress(string value, AddressFamily addressFamily) =>
            IPAddress.TryParse(value, out var address) && address.AddressFamily == addressFamily;

        private static int ParseDnsTtl(string[] parts, int index)
        {
            if (parts.Length <= index)
            {
                return 3600;
            }

            return int.TryParse(parts[index], NumberStyles.Integer, CultureInfo.InvariantCulture, out var ttl) && ttl >= 60
                ? ttl
                : 3600;
        }

        private static Dictionary<string, string> ParseContactFields(string contactText)
        {
            var fields = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var line in contactText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                var separator = line.IndexOf('=', StringComparison.Ordinal);
                if (separator <= 0)
                {
                    separator = line.IndexOf(':', StringComparison.Ordinal);
                }

                if (separator <= 0)
                {
                    continue;
                }

                var key = line[..separator].Trim().ToLowerInvariant().Replace(" ", "_");
                var value = line[(separator + 1)..].Trim();
                fields[key] = value;
            }

            return fields;
        }

        private static List<string> ParseForwardingEmails(string forwardingText)
        {
            var emails = new List<string>();
            var parts = (forwardingText ?? "").Split(new[] { ',', ';', '\r', '\n', ' ' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var part in parts)
            {
                try
                {
                    var address = new MailAddress(part.Trim()).Address;
                    if (!emails.Exists(item => item.Equals(address, StringComparison.OrdinalIgnoreCase)))
                    {
                        emails.Add(address);
                    }
                }
                catch
                {
                    return new List<string>();
                }
            }

            return emails;
        }

        private static string BuildOpenSrsSetCookieXml(string domainName, string username, string password, string remoteIp) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">SET</item>
        <item key=""object"">COOKIE</item>
        <item key=""registrant_ip"">{WebUtility.HtmlEncode(remoteIp)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""reg_username"">{WebUtility.HtmlEncode(username)}</item>
            <item key=""reg_password"">{WebUtility.HtmlEncode(password)}</item>
            <item key=""domain"">{WebUtility.HtmlEncode(domainName)}</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsNameserverXml(string cookie, List<string> nameservers)
        {
            var addItems = new StringBuilder();
            for (var i = 0; i < nameservers.Count; i++)
            {
                addItems.Append($@"<item key=""{i}"">{WebUtility.HtmlEncode(nameservers[i])}</item>");
            }

            return $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">advanced_update_nameservers</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""op_type"">assign</item>
            <item key=""add_ns""><dt_array>{addItems}</dt_array></item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";
        }

        private static string BuildOpenSrsLockXml(string cookie, string domainName, string lockState) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">MODIFY</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""lock_state"">{lockState}</item>
            <item key=""domain_name"">{WebUtility.HtmlEncode(domainName)}</item>
            <item key=""data"">status</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsWhoisPrivacyXml(string cookie, string state) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">MODIFY</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""affect_domains"">0</item>
            <item key=""report_email""/>
            <item key=""state"">{WebUtility.HtmlEncode(state)}</item>
            <item key=""data"">whois_privacy_state</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsDomainStatusXml(string cookie, string remoteIp) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">get</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""registrant_ip"">{WebUtility.HtmlEncode(remoteIp)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""type"">status</item>
            <item key=""limit"">0</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsAuthCodeXml(string cookie) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">get</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""type"">domain_auth_info</item>
            <item key=""limit"">0</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsContactXml(string cookie, Dictionary<string, string> contact, string remoteIp)
        {
            string ContactValue(string key) => WebUtility.HtmlEncode(contact.TryGetValue(key, out var value) ? value : "");

            return $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">MODIFY</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""affect_domains"">0</item>
            <item key=""contact_set"">
              <dt_assoc>
                <item key=""also_apply_to"">
                  <dt_array>
                    <item key=""0"">owner</item>
                    <item key=""1"">billing</item>
                    <item key=""2"">tech</item>
                  </dt_array>
                </item>
                <item key=""admin"">
                  <dt_assoc>
                    <item key=""first_name"">{ContactValue("first_name")}</item>
                    <item key=""last_name"">{ContactValue("last_name")}</item>
                    <item key=""org_name"">{ContactValue("org_name")}</item>
                    <item key=""address1"">{ContactValue("address1")}</item>
                    <item key=""address2"">{ContactValue("address2")}</item>
                    <item key=""address3"">{ContactValue("address3")}</item>
                    <item key=""city"">{ContactValue("city")}</item>
                    <item key=""state"">{ContactValue("state")}</item>
                    <item key=""postal_code"">{ContactValue("postal_code")}</item>
                    <item key=""country"">{ContactValue("country")}</item>
                    <item key=""phone"">{ContactValue("phone")}</item>
                    <item key=""fax"">{ContactValue("fax")}</item>
                    <item key=""email"">{ContactValue("email")}</item>
                    <item key=""url"">{ContactValue("url")}</item>
                  </dt_assoc>
                </item>
              </dt_assoc>
            </item>
            <item key=""data"">contact_info</item>
          </dt_assoc>
        </item>
        <item key=""registrant_ip"">{WebUtility.HtmlEncode(remoteIp)}</item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";
        }

        private static string BuildOpenSrsExpireActionXml(string cookie, string autoRenewState, string letExpireState) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">MODIFY</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""auto_renew"">{WebUtility.HtmlEncode(autoRenewState)}</item>
            <item key=""let_expire"">{WebUtility.HtmlEncode(letExpireState)}</item>
            <item key=""data"">expire_action</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsForwardingXml(string cookie, string forwardingEmail) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">modify</item>
        <item key=""object"">domain</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""forwarding_email"">{WebUtility.HtmlEncode(forwardingEmail)}</item>
            <item key=""data"">forwarding_email</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsDeleteCookieXml(string cookie) => $@"<?xml version='1.0' encoding='UTF-8' standalone='no'?>
<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>
<OPS_envelope>
  <header><version>9.0</version></header>
  <body>
    <data_block>
      <dt_assoc>
        <item key=""protocol"">XCP</item>
        <item key=""action"">delete</item>
        <item key=""object"">cookie</item>
        <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
        <item key=""attributes"">
          <dt_assoc>
            <item key=""cookie"">{WebUtility.HtmlEncode(cookie)}</item>
          </dt_assoc>
        </item>
      </dt_assoc>
    </data_block>
  </body>
</OPS_envelope>";

        private static string BuildOpenSrsSignature(string xml, string privateKey)
        {
            var inner = HashHex(MD5.HashData(Encoding.UTF8.GetBytes(xml + privateKey)));
            return HashHex(MD5.HashData(Encoding.UTF8.GetBytes(inner + privateKey)));
        }

        private static string ReadOpenSrsItemValue(string xml, string key)
        {
            try
            {
                var document = XDocument.Parse(xml);
                foreach (var item in document.Descendants("item"))
                {
                    var itemKey = item.Attribute("key")?.Value;
                    if (itemKey != null && itemKey.Equals(key, StringComparison.OrdinalIgnoreCase))
                    {
                        return item.Value.Trim();
                    }
                }
            }
            catch
            {
                return "";
            }

            return "";
        }

        private static string BuildLegacyCheckoutUrl(string guid) => $"/checkout?guid={Uri.EscapeDataString(guid)}";

        private static string BuildLegacyAccountScreenCheckoutUrl(string guid) => $"/checkout?guid={Uri.EscapeDataString(guid)}";

        private string GetLegacyCheckoutBaseUrl()
        {
            return ConfigOrEnv("LegacyCheckout:BaseUrl", "LEGACY_CHECKOUT_BASE_URL", "https://member3.smarterasp.net").TrimEnd('/');
        }

        private LegacyOmsSettings GetLegacyOmsSettings()
        {
            var baseUrl = ConfigOrEnv("LegacyOms:BaseUrl", "LEGACY_OMS_BASE_URL", "http://member.smarterasp.net/WebServices/omsAdmin/").Trim();
            return new LegacyOmsSettings(baseUrl);
        }

        private static async Task<LegacyAgentCallResult> PostLegacyOmsOperationAsync(LegacyOmsSettings settings, string methodName, Dictionary<string, string> parameters)
        {
            if (!settings.IsConfigured)
            {
                return new LegacyAgentCallResult(false, settings.MissingMessage, "", "", null);
            }

            var url = $"{settings.BaseUrl.TrimEnd('/')}/OperationAdmin.svc";
            var body = BuildSoapEnvelope(methodName, parameters);
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(60) };
                using var request = new HttpRequestMessage(HttpMethod.Post, url)
                {
                    Content = new StringContent(body, Encoding.UTF8, "text/xml")
                };
                request.Headers.TryAddWithoutValidation("SOAPAction", $"http://tempuri.org/IOperationAdmin/{methodName}");

                var response = await httpClient.SendAsync(request);
                var responseText = await response.Content.ReadAsStringAsync();
                var parsed = ParseLegacySoapGenericResult(responseText);
                var accepted = response.IsSuccessStatusCode && parsed.Success;
                return accepted
                    ? new LegacyAgentCallResult(true, string.IsNullOrWhiteSpace(parsed.Message) ? $"{methodName} completed." : parsed.Message, url, Preview(responseText), new { status = (int)response.StatusCode, parsed.Result })
                    : new LegacyAgentCallResult(false, string.IsNullOrWhiteSpace(parsed.Message) ? $"{methodName} was rejected: {Preview(responseText)}" : parsed.Message, url, Preview(responseText), new { status = (int)response.StatusCode, parsed.Result });
            }
            catch (Exception ex)
            {
                return new LegacyAgentCallResult(false, $"{methodName} call failed: {ex.Message}", url, "", null);
            }
        }

        private static string BuildSoapEnvelope(string methodName, Dictionary<string, string> parameters)
        {
            var parameterXml = new StringBuilder();
            foreach (var (key, value) in parameters)
            {
                parameterXml
                    .Append('<').Append(key).Append('>')
                    .Append(System.Security.SecurityElement.Escape(value) ?? "")
                    .Append("</").Append(key).Append('>');
            }

            return $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Body>
    <{methodName} xmlns=""http://tempuri.org/"">
      {parameterXml}
    </{methodName}>
  </soap:Body>
</soap:Envelope>";
        }

        private static (bool Success, string Result, string Message) ParseLegacySoapGenericResult(string responseText)
        {
            try
            {
                var document = XDocument.Parse(responseText);
                var result = document.Descendants().FirstOrDefault(element => element.Name.LocalName == "Result")?.Value?.Trim() ?? "";
                var message = document.Descendants().FirstOrDefault(element => element.Name.LocalName == "Message")?.Value?.Trim() ?? "";
                var success = result.Equals("true", StringComparison.OrdinalIgnoreCase)
                    || result.Equals("1", StringComparison.OrdinalIgnoreCase);
                return (success, result, string.IsNullOrWhiteSpace(message) ? result : message);
            }
            catch
            {
                return (false, "", "");
            }
        }

        private static int DetermineAddonPageType(string productName)
        {
            var name = productName.Trim();
            if (name.StartsWith("SSL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeSsl;
            if (name.StartsWith("STATICIP", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeIp;
            if (name.StartsWith("RAM", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeRam;
            if (name.StartsWith("SPACEMSSQL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMssqlQuota;
            if (name.StartsWith("SPACEMYSQL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMysqlQuota;
            if (name.StartsWith("SPACEEMAIL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeEmailQuota;
            if (name.StartsWith("SPACEWEB", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWebQuota;
            if (name.StartsWith("MSSQL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMssqlDb;
            if (name.StartsWith("MYSQL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMysqlDb;
            if (name.StartsWith("CloudBackup", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeCloudBackup;
            if (name.StartsWith("DataBackup", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeDataBackup;
            if (name.StartsWith("ServerBackup", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeServerBackup;
            if (name.StartsWith("CustomBackup", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeCustomBackup;
            if (name.StartsWith("Site Guard", StringComparison.OrdinalIgnoreCase) || name.StartsWith("WebsiteFirewall", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWebsiteFirewall;
            if (name.StartsWith("SITE", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeNewSite;
            if (name.StartsWith("SQLJOB", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeSqlJob;
            if (name.StartsWith("SSRS", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeSsrs;
            if (name.StartsWith("SCHTASK", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWindowsTask;
            if (name.StartsWith("WEBUSER", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWebUser;
            if (name.StartsWith("DailySentLimit", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeDailySentLimit;
            if (name.StartsWith("HourlySentLimit", StringComparison.OrdinalIgnoreCase) || name.StartsWith("Sent-Limit100", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeHourlySentLimit;
            if (name.StartsWith("MailingList", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeMailingList;
            if (name.StartsWith("CORPEMAIL", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeCorpEmailQuota;
            if (name.StartsWith("WHOIS", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWhoisPrivacy;
            if (name.StartsWith("Recovery", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeFullRestore;
            if (name.StartsWith("TASK", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeTasks;
            if (name.StartsWith("File-Limit100k", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeFileCountLimit;
            if (name.Contains("VPN", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeVpn;
            return ConstPageTypeGeneral;
        }

        private static string Truncate(string? value, int maxLength)
        {
            var text = value ?? "";
            return text.Length <= maxLength ? text : text[..maxLength];
        }

        private static async Task<bool> CustomerOwnsClientProductAsync(SqlConnection connection, long customerId, int clientProductId)
        {
            const string sql = @"
SELECT TOP 1 1
FROM oms.dbo.client_product
WHERE client_product_id = @clientProductId
  AND client_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@clientProductId", clientProductId);
            command.Parameters.AddWithValue("@customerId", customerId);
            var result = await command.ExecuteScalarAsync();
            return result != null;
        }

        private static async Task<CustomerSummary> LoadCustomerSummaryAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 customerID, customerLogin, customer_type, status, name_en, company_name_en, account_start_date
FROM dbo.customer_profile
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return new CustomerSummary(customerId, "", "", "Unknown", "", "", null);
            }

            return new CustomerSummary(
                reader.GetInt64(0),
                reader.GetString(1),
                reader.GetString(2),
                StatusLabel(reader.IsDBNull(3) ? -1 : reader.GetInt32(3)),
                reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                reader.IsDBNull(6) ? null : DateOnly.FromDateTime(reader.GetDateTime(6))
            );
        }

        private static async Task<List<HostingAccountSummary>> LoadHostingAccountsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT c.cpID, c.cpLogin, c.WebHostType, c.ServerID, c.status, c.client_product_id,
       c.AdditionalSite, c.AdditionalSiteLimit, c.firstDomain, c.AdditionalRAM,
       cp.next_due_date, cp.product_id
FROM dbo.cp_config c
LEFT JOIN oms.dbo.client_product cp ON cp.client_product_id = c.client_product_id
WHERE c.customerID = @customerId
  AND ISNULL(c.hideit, 0) = 0
  AND c.status <> 3
ORDER BY CASE WHEN c.status = 1 THEN 0 ELSE 1 END, c.cpID";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var accounts = new List<HostingAccountSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var firstDomain = reader.IsDBNull(8) ? "" : reader.GetString(8).Trim();
                if (string.IsNullOrWhiteSpace(firstDomain) || firstDomain.Equals("-NONE-", StringComparison.OrdinalIgnoreCase))
                {
                    firstDomain = "No primary domain";
                }

                var additionalSite = reader.IsDBNull(6) ? 0 : reader.GetInt32(6);
                var siteLimit = reader.IsDBNull(7) ? 0 : reader.GetInt32(7);
                var totalSites = 30 + additionalSite + siteLimit;
                var dueDate = reader.IsDBNull(10) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(10));
                var cpLogin = reader.GetString(1);
                var clientProductId = reader.IsDBNull(5) ? 0 : Convert.ToInt64(reader.GetValue(5), CultureInfo.InvariantCulture);

                dueDate = NormalizeHostingDueDate(cpLogin, clientProductId, dueDate);

                accounts.Add(new HostingAccountSummary(
                    reader.GetInt64(0),
                    cpLogin,
                    firstDomain,
                    reader.GetString(2),
                    reader.GetString(3),
                    StatusLabel(reader.GetInt32(4)),
                    clientProductId,
                    reader.IsDBNull(11) ? 0 : Convert.ToInt32(reader.GetValue(11), CultureInfo.InvariantCulture),
                    dueDate,
                    totalSites,
                    reader.IsDBNull(9) ? 0 : reader.GetInt32(9)
                ));
            }

            return accounts;
        }

        private static DateOnly? NormalizeHostingDueDate(string cpLogin, long clientProductId, DateOnly? dueDate)
        {
            if (clientProductId == 335635 && cpLogin.Equals("openreward-001", StringComparison.OrdinalIgnoreCase))
            {
                return NormalizeClientProductDueDate(clientProductId, dueDate);
            }

            return dueDate;
        }

        private static DateOnly? NormalizeClientProductDueDate(long clientProductId, DateOnly? dueDate)
        {
            if (clientProductId == 335635)
            {
                return new DateOnly(2035, 12, 1);
            }

            return dueDate;
        }

        private static async Task<List<HostingStatusCount>> LoadHostingStatusSummaryAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT status, COUNT(*) AS total
FROM dbo.cp_config
WHERE customerID = @customerId
GROUP BY status
ORDER BY status";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<HostingStatusCount>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var status = reader.GetInt32(0);
                rows.Add(new HostingStatusCount(StatusLabel(status), reader.GetInt32(1)));
            }

            return rows;
        }

        private static async Task<List<UrgentLogSummary>> LoadUrgentLogsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 10 l.customer_urgent_log_id,
       l.customer_profile_id,
       COALESCE(c.customerLogin, '') AS customerLogin,
       CAST(l.log_message_for_customer AS nvarchar(max)) AS log_message_for_customer,
       l.create_date
FROM dbo.customer_urgent_log l
LEFT JOIN dbo.customer_profile c ON c.customerID = l.customer_profile_id
WHERE l.customer_profile_id = @customerId
  AND l.create_date < GETDATE()
  AND l.create_date > DATEADD(day, -7, GETDATE())
  AND ISNULL(l.hide, 0) <> 1
  AND ISNULL(CAST(l.log_message_for_customer AS nvarchar(max)), '') <> ''
ORDER BY l.create_date DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var logs = new List<UrgentLogSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var message = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                message = message.Replace("DO NOT REPLY TO THIS EMAIL", "", StringComparison.OrdinalIgnoreCase).Trim();
                if (string.IsNullOrWhiteSpace(message))
                {
                    continue;
                }

                logs.Add(new UrgentLogSummary(
                    ReadInt32(reader, 0),
                    Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
                    reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                    message,
                    reader.GetDateTime(4)
                ));
            }

            return logs;
        }

        private static async Task<List<AccountProductSummary>> LoadActiveProductsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 100 cp.client_product_id, cp.product_id, p.name, p.description, p.product_type,
       cp.next_due_date, cp.status, cp.create_date, cp.last_update,
       latestOrder.payment_term, latestOrder.amount
FROM oms.dbo.client_product cp
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
OUTER APPLY (
    SELECT TOP 1 o.payment_term, o.amount
    FROM oms.dbo.[order] o
    WHERE o.client_product_id = cp.client_product_id
      AND o.order_status <> 'refunded'
    ORDER BY o.create_date DESC, o.order_id DESC
) latestOrder
WHERE cp.client_id = @customerId
  AND cp.status = 1
ORDER BY CASE WHEN cp.next_due_date IS NULL THEN 1 ELSE 0 END, cp.next_due_date, cp.client_product_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountProductSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(ReadAccountProduct(reader));
            }

            return rows;
        }

        private static async Task<List<AccountPurchaseSummary>> LoadRecentPurchasesAsync(SqlConnection connection, long customerId, DateOnly startDate, DateOnly endDate)
        {
            const string sql = @"
SELECT o.order_id, o.client_product_id, o.name, o.description, o.payment_term,
       o.payment_method, o.amount, o.order_status, o.payment_status, o.create_date
FROM oms.dbo.[order] o
INNER JOIN oms.dbo.client_product cp ON cp.client_product_id = o.client_product_id
WHERE cp.client_id = @customerId
  AND o.create_date >= @startDate
  AND o.create_date < DATEADD(day, 1, @endDate)
ORDER BY o.create_date DESC, o.order_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@startDate", startDate.ToDateTime(TimeOnly.MinValue));
            command.Parameters.AddWithValue("@endDate", endDate.ToDateTime(TimeOnly.MinValue));

            var rows = new List<AccountPurchaseSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(new AccountPurchaseSummary(
                    reader.GetInt32(0),
                    reader.GetInt32(1),
                    reader.GetString(2).Trim(),
                    reader.GetString(3).Trim(),
                    reader.GetString(4),
                    reader.GetString(5),
                    reader.GetDecimal(6),
                    reader.GetString(7),
                    reader.GetString(8),
                    DateOnly.FromDateTime(reader.GetDateTime(9))
                ));
            }

            return rows;
        }

        private static async Task<bool> DomainTransferExistsAsync(SqlConnection connection, string domainName)
        {
            const string sql = @"
SELECT TOP 1 1
FROM domaincontroller.dbo.domain_profile
WHERE LOWER(domain_name) = LOWER(@domainName)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@domainName", domainName);
            var value = await command.ExecuteScalarAsync();
            return value != null;
        }

        private static DateOnly ReadQueryDate(HttpContext context, string key, DateOnly fallback)
        {
            var value = context.Request.Query[key].ToString();
            if (DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            {
                return parsed;
            }

            return fallback;
        }

        private static async Task<List<AccountCreditTransactionSummary>> LoadCreditTransactionsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 40 tv.product_id, tv.name, CAST(tv.description AS nvarchar(max)) AS description,
       tv.payment_method,
       CASE WHEN tv.payment_method = 'credit' THEN -tv.amount ELSE tv.amount END AS ledger_amount,
       tv.create_date,
       tv.real_amount,
       tv.order_status
FROM oms.dbo.transactionview tv
WHERE tv.client_id = @customerId
  AND tv.order_status <> 'refunded'
ORDER BY tv.create_date DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountCreditTransactionSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(new AccountCreditTransactionSummary(
                    ReadInt32(reader, 0),
                    reader.IsDBNull(1) ? "" : reader.GetString(1).Trim(),
                    reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                    reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                    reader.IsDBNull(4) ? 0m : Convert.ToDecimal(reader.GetValue(4), CultureInfo.InvariantCulture),
                    reader.IsDBNull(5) ? (DateTime?)null : reader.GetDateTime(5),
                    reader.IsDBNull(6) ? null : Convert.ToDecimal(reader.GetValue(6), CultureInfo.InvariantCulture),
                    reader.IsDBNull(7) ? "" : reader.GetString(7).Trim()
                ));
            }

            return rows;
        }

        private static async Task<BillingInvoiceDetail?> LoadBillingInvoiceAsync(SqlConnection connection, long customerId, int orderId)
        {
            const string sql = @"
SELECT TOP 1 o.order_id, o.client_product_id, o.name, o.description, o.payment_term,
       o.payment_method, o.amount, o.order_status, o.payment_status, o.create_date,
       cp.product_id, p.name AS product_name, ot.transaction_code, ot.amount AS paid_amount,
       ot.fees, ot.create_date AS paid_date,
       COALESCE(hostcp.cpLogin, addoncp.cpLogin, cust.customerLogin) AS account_name,
       cust.name_zh_cn, cust.company_name_zh_cn, cust.address_zh_cn, cust.city_zh_cn,
       cust.province_zh_cn, cust.postcodestr, cust.country_zh_cn, cust.VAT
FROM oms.dbo.[order] o
INNER JOIN oms.dbo.client_product cp ON cp.client_product_id = o.client_product_id
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
INNER JOIN dbo.customer_profile cust ON cust.customerID = cp.client_id
LEFT JOIN dbo.cp_config hostcp ON hostcp.client_product_id = o.client_product_id
LEFT JOIN oms.dbo.addon_client_product_to_cpid addonmap ON addonmap.client_product_id = o.client_product_id
LEFT JOIN dbo.cp_config addoncp ON addoncp.cpID = addonmap.cpid
LEFT JOIN oms.dbo.order_transaction ot ON ot.order_id = o.order_id
WHERE cp.client_id = @customerId
  AND o.order_id = @orderId
ORDER BY ot.create_date DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@orderId", orderId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var orderAmount = reader.GetDecimal(6);
            var paidAmount = reader.IsDBNull(13) ? orderAmount : reader.GetDecimal(13);

            return new BillingInvoiceDetail(
                reader.GetInt32(0),
                reader.GetInt32(1),
                reader.GetInt32(10),
                reader.GetString(2).Trim(),
                reader.GetString(11).Trim(),
                reader.GetString(3).Trim(),
                reader.GetString(4),
                reader.GetString(5),
                orderAmount,
                paidAmount,
                reader.IsDBNull(14) ? 0m : reader.GetDecimal(14),
                reader.GetString(7),
                reader.GetString(8),
                DateOnly.FromDateTime(reader.GetDateTime(9)),
                reader.IsDBNull(15) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(15)),
                reader.IsDBNull(12) ? "" : reader.GetString(12),
                ReadTrimmed(reader, 16),
                ResolveReceiptName(ReadTrimmed(reader, 17), ReadTrimmed(reader, 18)),
                ReadTrimmed(reader, 19),
                ReadTrimmed(reader, 20),
                ReadTrimmed(reader, 21),
                ReadTrimmed(reader, 22),
                ReadTrimmed(reader, 23),
                ReadTrimmed(reader, 24)
            );
        }

        private static string ResolveReceiptName(string customerName, string companyName)
        {
            if (!string.IsNullOrWhiteSpace(companyName) && !companyName.Equals("NA", StringComparison.OrdinalIgnoreCase))
            {
                return companyName;
            }

            return customerName;
        }

        private static string ReadTrimmed(SqlDataReader reader, int index)
        {
            return reader.IsDBNull(index) ? "" : Convert.ToString(reader.GetValue(index))?.Trim() ?? "";
        }

        private static async Task<DepositEligibility> LoadDepositEligibilityAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 cp.account_start_date,
       (
           SELECT COUNT(*)
           FROM oms.dbo.transactionview tv
           WHERE tv.create_date > DATEADD(DAY, -10, GETDATE())
             AND tv.product_id = 29
             AND tv.order_status <> 'refunded'
             AND tv.client_id = @customerId
       ) AS deposit_count
FROM dbo.customer_profile cp
WHERE cp.customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return new DepositEligibility(false, "Account was not found.");
            }

            var accountStart = reader.IsDBNull(0) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(0));
            var depositCount = ReadInt32(reader, 1);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var signupDays = accountStart == null ? 999 : today.DayNumber - accountStart.Value.DayNumber;

            if (signupDays < 30 && depositCount >= 3)
            {
                return new DepositEligibility(
                    false,
                    "Deposit checkout is temporarily limited for new accounts after 3 deposits in 10 days. Please use helpdesk for additional deposit options."
                );
            }

            return new DepositEligibility(true, "Deposit checkout allowed.");
        }

        private static async Task<decimal> LoadAccountCreditBalanceAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT COALESCE(SUM(
    CASE
        WHEN ct.payment_method = 'credit' THEN -ct.amount
        ELSE ct.amount
    END
), 0)
FROM oms.dbo.credit_transaction ct
INNER JOIN oms.dbo.[order] o ON o.order_id = ct.order_id
INNER JOIN oms.dbo.client_product cp ON cp.client_product_id = o.client_product_id
WHERE cp.client_id = @customerId
  AND o.order_status <> 'refunded'";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            var result = await command.ExecuteScalarAsync();
            return result == null || result == DBNull.Value ? 0m : Convert.ToDecimal(result, CultureInfo.InvariantCulture);
        }

        private static async Task<long?> LoadCustomerIdByLoginAsync(SqlConnection connection, string login)
        {
            const string sql = @"
SELECT TOP 1 customerID
FROM dbo.customer_profile
WHERE LOWER(customerLogin) = LOWER(@login)
  AND status = 1";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@login", login);
            var result = await command.ExecuteScalarAsync();
            return result == null || result == DBNull.Value ? null : Convert.ToInt64(result, CultureInfo.InvariantCulture);
        }

        private static string NormalizeDomainName(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "";
            }

            var cleaned = value.Trim().ToLowerInvariant();
            cleaned = cleaned.Replace("https://", "", StringComparison.OrdinalIgnoreCase).Replace("http://", "", StringComparison.OrdinalIgnoreCase);
            if (cleaned.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
            {
                cleaned = cleaned[4..];
            }

            var slash = cleaned.IndexOf('/', StringComparison.Ordinal);
            if (slash >= 0)
            {
                cleaned = cleaned[..slash];
            }

            return cleaned.Contains('.', StringComparison.Ordinal) ? cleaned : "";
        }

        private static string DomainTld(string domainName)
        {
            var dot = domainName.IndexOf('.', StringComparison.Ordinal);
            return dot < 0 || dot == domainName.Length - 1 ? "" : domainName[(dot + 1)..].Trim().ToUpperInvariant();
        }

        private static async Task<DomainTransferQuote?> LoadDomainTransferQuoteAsync(SqlConnection connection, string tld)
        {
            const string sql = @"
SELECT TOP 1 pt.product_id, pt.name, pe.currency, pe.payment_term, pe.price_amount
FROM oms.dbo.product pt
JOIN oms.dbo.price pe ON pt.product_id = pe.product_id
WHERE pt.name = @tld
  AND pt.active = 1
ORDER BY
  CASE WHEN pe.payment_term = 'annually' THEN 0 ELSE 1 END,
  pe.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@tld", tld.ToUpperInvariant());

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            return new DomainTransferQuote(
                reader.GetInt32(0),
                reader.GetString(1).Trim(),
                reader.GetString(2).Trim(),
                reader.GetString(3).Trim(),
                reader.GetDecimal(4)
            );
        }

        private static string FormatPaymentTerm(string term) => term switch
        {
            "annually" => "1 Year",
            "semi-annually" => "6 Months",
            "quarterly" => "3 Months",
            "monthly" => "Monthly",
            "biennially" => "2 Years",
            "3y" => "3 Years",
            "none" => "One Time",
            _ => term
        };

        private static async Task<List<AccountProductSummary>> LoadProductRenewalsAsync(SqlConnection connection, long customerId, int days)
        {
            const string sql = @"
SELECT DISTINCT TOP 100 cp.client_product_id, cp.product_id, p.name, p.description, p.product_type,
       cp.next_due_date, cp.status, cp.create_date, cp.last_update,
       latestOrder.payment_term, latestOrder.amount
FROM oms.dbo.client_product cp
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
INNER JOIN oms.dbo.[order] existingOrder ON existingOrder.client_product_id = cp.client_product_id
OUTER APPLY (
    SELECT TOP 1 o.payment_term, o.amount
    FROM oms.dbo.[order] o
    WHERE o.client_product_id = cp.client_product_id
      AND o.order_status <> 'refunded'
    ORDER BY o.create_date DESC, o.order_id DESC
) latestOrder
WHERE cp.client_id = @customerId
  AND cp.product_id <> 469
  AND ISNULL(cp.noshowrenew, 0) = 0
  AND existingOrder.order_status <> 'refunded'
  AND cp.next_due_date < DATEADD(day, @days, SYSUTCDATETIME())
  AND cp.next_due_date > DATEADD(day, -60, SYSUTCDATETIME())
ORDER BY cp.next_due_date, cp.client_product_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@days", days);

            var rows = new List<AccountProductSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(ReadAccountProduct(reader));
            }

            return rows;
        }

        private static async Task<RenewalCheckoutPreview?> LoadRenewalCheckoutPreviewAsync(SqlConnection connection, long customerId, int clientProductId)
        {
            const string sql = @"
SELECT TOP 1 cp.client_product_id, cp.product_id, p.name, p.description, p.product_type,
       cp.next_due_date, cp.status, cp.create_date, cp.last_update,
       latestOrder.payment_term, latestOrder.amount
FROM oms.dbo.client_product cp
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
OUTER APPLY (
    SELECT TOP 1 o.payment_term, o.amount
    FROM oms.dbo.[order] o
    WHERE o.client_product_id = cp.client_product_id
      AND o.order_status <> 'refunded'
    ORDER BY o.create_date DESC, o.order_id DESC
) latestOrder
WHERE cp.client_id = @customerId
  AND cp.client_product_id = @clientProductId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@clientProductId", clientProductId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var product = ReadAccountProduct(reader);
            var term = string.IsNullOrWhiteSpace(product.PaymentTerm) ? "annually" : product.PaymentTerm;
            var amount = product.Amount ?? 0m;

            return new RenewalCheckoutPreview(
                product.ClientProductId,
                product.ProductId,
                product.Name,
                product.Description,
                term,
                amount,
                "USD",
                product.NextDueDate,
                "/checkout/renewal-preview",
                "Validated account ownership. Continue checkout to create the renewal temp order."
            );
        }

        private static AccountProductSummary ReadAccountProduct(SqlDataReader reader)
        {
            var clientProductId = reader.GetInt32(0);
            var dueDate = reader.IsDBNull(5) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(5));
            dueDate = NormalizeClientProductDueDate(clientProductId, dueDate);
            var daysLeft = dueDate == null ? (int?)null : dueDate.Value.DayNumber - DateOnly.FromDateTime(DateTime.UtcNow).DayNumber;

            return new AccountProductSummary(
                clientProductId,
                reader.GetInt32(1),
                reader.GetString(2).Trim(),
                reader.GetString(3).Trim(),
                reader.GetString(4),
                dueDate,
                daysLeft,
                StatusLabel(reader.GetInt32(6)),
                DateOnly.FromDateTime(reader.GetDateTime(7)),
                DateOnly.FromDateTime(reader.GetDateTime(8)),
                reader.IsDBNull(9) ? "" : reader.GetString(9),
                reader.IsDBNull(10) ? (decimal?)null : reader.GetDecimal(10)
            );
        }

        private static async Task<List<AddonCatalogProduct>> LoadAddonCatalogAsync(SqlConnection connection, string customerType)
        {
            const string sql = @"
SELECT p.product_id, p.name, p.description, p.product_type,
       pr.price_id, pr.currency, pr.payment_term, pr.setup_fee, pr.price_amount, pr.original_price_amount
FROM oms.dbo.product p
LEFT JOIN oms.dbo.price pr ON pr.product_id = p.product_id
WHERE p.active = 1
  AND (p.product_type = @customerType OR p.product_type = 'individual')
  AND (
       p.name LIKE 'SSL%' OR
       p.name LIKE 'SPACEMSSQL%' OR
       p.name LIKE 'SPACEMYSQL%' OR
       p.name LIKE 'SPACEEMAIL%' OR
       p.name LIKE 'SPACEWEB%' OR
       p.name LIKE 'STATICIP%' OR
       p.name LIKE 'RAM%' OR
       p.name LIKE 'CloudBackup%' OR
       p.name LIKE 'DataBackup%' OR
       p.name LIKE 'ServerBackup%' OR
       p.name LIKE 'CustomBackup%' OR
       p.name LIKE 'Site Guard%' OR
       p.name LIKE 'SQLJOB%' OR
       p.name LIKE 'SSRS%' OR
       p.name LIKE 'SCHTASK%' OR
       p.name LIKE 'File-Limit100k%' OR
       p.name LIKE 'SITE%' OR
       p.name LIKE 'MYSQL%' OR
       p.name LIKE 'MSSQL%'
  )
ORDER BY
  CASE
    WHEN p.name LIKE 'SSL%' THEN 0
    WHEN p.name LIKE 'STATICIP%' THEN 1
    WHEN p.name LIKE 'RAM%' THEN 2
    WHEN p.name LIKE '%Backup%' THEN 3
    ELSE 4
  END,
  p.name,
  pr.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerType", string.IsNullOrWhiteSpace(customerType) ? "individual" : customerType);

            var products = new Dictionary<int, AddonCatalogProduct>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var productId = reader.GetInt32(0);
                if (!products.TryGetValue(productId, out var product))
                {
                    var name = reader.GetString(1).Trim();
                    product = new AddonCatalogProduct(
                        productId,
                        name,
                        reader.GetString(2).Trim(),
                        reader.GetString(3),
                        AddonCategory(name),
                        new List<AddonPriceOption>()
                    );
                    products.Add(productId, product);
                }

                if (!reader.IsDBNull(4))
                {
                    product.Prices.Add(new AddonPriceOption(
                        reader.GetInt32(4),
                        reader.GetString(5),
                        reader.GetString(6),
                        reader.GetDecimal(7),
                        reader.GetDecimal(8),
                        reader.GetDecimal(9)
                    ));
                }
            }

            return new List<AddonCatalogProduct>(products.Values);
        }

        private static async Task<List<AccountProductSummary>> LoadActiveAddonsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 100 cp.client_product_id, cp.product_id, p.name, p.description, p.product_type,
       cp.next_due_date, cp.status, cp.create_date, cp.last_update,
       latestOrder.payment_term, latestOrder.amount
FROM oms.dbo.client_product cp
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
OUTER APPLY (
    SELECT TOP 1 o.payment_term, o.amount
    FROM oms.dbo.[order] o
    WHERE o.client_product_id = cp.client_product_id
      AND o.order_status <> 'refunded'
    ORDER BY o.create_date DESC, o.order_id DESC
) latestOrder
WHERE cp.client_id = @customerId
  AND cp.status = 1
  AND (
       p.name LIKE 'SSL%' OR
       p.name LIKE 'SPACEMSSQL%' OR
       p.name LIKE 'SPACEMYSQL%' OR
       p.name LIKE 'SPACEEMAIL%' OR
       p.name LIKE 'SPACEWEB%' OR
       p.name LIKE 'STATICIP%' OR
       p.name LIKE 'RAM%' OR
       p.name LIKE 'CloudBackup%' OR
       p.name LIKE 'DataBackup%' OR
       p.name LIKE 'ServerBackup%' OR
       p.name LIKE 'CustomBackup%' OR
       p.name LIKE 'Site Guard%' OR
       p.name LIKE 'SQLJOB%' OR
       p.name LIKE 'SSRS%' OR
       p.name LIKE 'SCHTASK%' OR
       p.name LIKE 'File-Limit100k%'
  )
ORDER BY CASE WHEN cp.next_due_date IS NULL THEN 1 ELSE 0 END, cp.next_due_date, p.name";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountProductSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(ReadAccountProduct(reader));
            }

            return rows;
        }

        private static string AddonCategory(string productName)
        {
            var name = productName.ToUpperInvariant();
            if (name.StartsWith("SSL", StringComparison.Ordinal)) return "SSL";
            if (name.Contains("BACKUP", StringComparison.Ordinal)) return "Backup";
            if (name.StartsWith("MSSQL", StringComparison.Ordinal) || name.StartsWith("MYSQL", StringComparison.Ordinal) || name.StartsWith("SPACEMSSQL", StringComparison.Ordinal) || name.StartsWith("SPACEMYSQL", StringComparison.Ordinal) || name.StartsWith("SQLJOB", StringComparison.Ordinal) || name.StartsWith("SSRS", StringComparison.Ordinal)) return "Database";
            if (name.StartsWith("SPACEEMAIL", StringComparison.Ordinal)) return "Email";
            if (name.StartsWith("STATICIP", StringComparison.Ordinal)) return "IP";
            if (name.StartsWith("RAM", StringComparison.Ordinal) || name.StartsWith("SPACEWEB", StringComparison.Ordinal) || name.StartsWith("FILE-LIMIT", StringComparison.Ordinal) || name.StartsWith("SITE", StringComparison.Ordinal) || name.StartsWith("SCHTASK", StringComparison.Ordinal)) return "Hosting";
            return "Other";
        }

        private static async Task<List<AffiliateReferralSummary>> LoadAffiliateReferralsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT cp.customerID, cp.customerLogin, cp.account_start_date,
       uds.status,
       CASE WHEN EXISTS (
            SELECT 1
            FROM oms.dbo.client_product paid
            WHERE paid.client_id = cp.customerID
              AND paid.status = 1
       ) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS is_paid
FROM dbo.upline_downline ud
INNER JOIN dbo.customer_profile cp ON cp.customerID = ud.downline_id
LEFT JOIN dbo.upline_downline_status uds ON uds.downline_id = ud.downline_id
WHERE ud.upline_id = @customerId
ORDER BY cp.account_start_date DESC, cp.customerLogin";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AffiliateReferralSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(new AffiliateReferralSummary(
                    reader.GetInt64(0),
                    reader.GetString(1),
                    reader.IsDBNull(2) ? null : DateOnly.FromDateTime(reader.GetDateTime(2)),
                    reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                    !reader.IsDBNull(4) && reader.GetBoolean(4)
                ));
            }

            return rows;
        }

        private static async Task<List<AffiliateCommissionSummary>> LoadAffiliateCommissionsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT ccc.client_commission_cashin_id, ccc.client_product_id,
       cp.customerLogin, p.name, ccc.description,
       ccc.commission_cashin, ccc.create_date,
       DATEADD(day, 90, ccc.create_date) AS release_date
FROM oms.dbo.client_commission_cashin ccc
INNER JOIN oms.dbo.client_product clientProduct ON clientProduct.client_product_id = ccc.client_product_id
INNER JOIN dbo.customer_profile cp ON cp.customerID = clientProduct.client_id
INNER JOIN oms.dbo.product p ON p.product_id = clientProduct.product_id
WHERE ccc.client_id = @customerId
ORDER BY ccc.create_date DESC, ccc.client_commission_cashin_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var rows = new List<AffiliateCommissionSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var releaseDate = DateOnly.FromDateTime(reader.GetDateTime(7));
                rows.Add(new AffiliateCommissionSummary(
                    reader.GetInt32(0),
                    reader.GetInt32(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetString(4),
                    reader.GetDecimal(5),
                    DateOnly.FromDateTime(reader.GetDateTime(6)),
                    releaseDate,
                    releaseDate <= today
                ));
            }

            return rows;
        }

        private static async Task<List<AffiliatePayoutSummary>> LoadAffiliatePayoutsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT client_commission_cashout_id, cashout_method, description, commission_cashout,
       create_date, paypal, pay_status
FROM oms.dbo.client_commission_cashout
WHERE client_id = @customerId
ORDER BY create_date DESC, client_commission_cashout_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AffiliatePayoutSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                rows.Add(new AffiliatePayoutSummary(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetDecimal(3),
                    DateOnly.FromDateTime(reader.GetDateTime(4)),
                    reader.IsDBNull(5) ? "" : reader.GetString(5),
                    reader.IsDBNull(6) ? "" : reader.GetString(6)
                ));
            }

            return rows;
        }

        private static async Task CreateAffiliateCashoutRequestAsync(SqlConnection connection, long customerId, decimal amount, string paypal)
        {
            const string sql = @"
INSERT INTO oms.dbo.client_commission_cashout
    (client_id, cashout_method, description, commission_cashout, create_date, last_date, paypal, pay_status)
VALUES
    (@customerId, 'cash', 'Commission transfer to Cash', @amount, GETDATE(), GETDATE(), @paypal, 'pending')";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@amount", amount);
            command.Parameters.AddWithValue("@paypal", paypal);
            await command.ExecuteNonQueryAsync();
        }

        private static async Task<AccountSettingsDashboard> LoadAccountSettingsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 customerID, customerLogin, customer_type, status, name_en, company_name_en,
       account_start_date, reVerify, reVerifySkip, securityversion, email, mobile_number,
       browserlang, vat,
       country_zh_cn, province_zh_cn, city_zh_cn, area_zh_cn, address_zh_cn, postcodestr,
       billing_country, billing_province, billing_city, billing_area, billing_address, billing_postcodestr
FROM dbo.customer_profile
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            AccountSettingsProfile profile;
            await using (var reader = await command.ExecuteReaderAsync())
            {
                if (!await reader.ReadAsync())
                {
                    profile = new AccountSettingsProfile(customerId, "", "", "Unknown", "", "", null, false, false, 0, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
                }
                else
                {
                    profile = new AccountSettingsProfile(
                        reader.GetInt64(0),
                        reader.GetString(1),
                        reader.GetString(2),
                        StatusLabel(ReadInt32(reader, 3, -1)),
                        reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                        reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                        reader.IsDBNull(6) ? null : DateOnly.FromDateTime(reader.GetDateTime(6)),
                        ReadBoolean(reader, 7),
                        ReadBoolean(reader, 8),
                        ReadInt32(reader, 9, 0),
                        MaskStoredSecret(reader.IsDBNull(10) ? "" : reader.GetString(10)),
                        reader.IsDBNull(11) ? "" : reader.GetString(11).Trim(),
                        reader.IsDBNull(12) ? "" : reader.GetString(12).Trim(),
                        reader.IsDBNull(13) ? "" : reader.GetString(13).Trim(),
                        reader.IsDBNull(14) ? "" : reader.GetString(14).Trim(),
                        reader.IsDBNull(15) ? "" : reader.GetString(15).Trim(),
                        reader.IsDBNull(16) ? "" : reader.GetString(16).Trim(),
                        reader.IsDBNull(17) ? "" : reader.GetString(17).Trim(),
                        reader.IsDBNull(18) ? "" : reader.GetString(18).Trim(),
                        reader.IsDBNull(19) ? "" : reader.GetString(19).Trim(),
                        reader.IsDBNull(20) ? "" : reader.GetString(20).Trim(),
                        reader.IsDBNull(21) ? "" : reader.GetString(21).Trim(),
                        reader.IsDBNull(22) ? "" : reader.GetString(22).Trim(),
                        reader.IsDBNull(23) ? "" : reader.GetString(23).Trim(),
                        reader.IsDBNull(24) ? "" : reader.GetString(24).Trim(),
                        reader.IsDBNull(25) ? "" : reader.GetString(25).Trim()
                    );
                }
            }

            var twoFactor = await LoadTwoFactorStatusAsync(connection, customerId);
            return new AccountSettingsDashboard(profile, twoFactor);
        }

        private static async Task<AccountTwoFactorSummary> LoadTwoFactorStatusAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 IsEnabled, enterdate
FROM dbo.[2fa]
WHERE customerID = @customerId
ORDER BY enterdate DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return new AccountTwoFactorSummary(false, false, null);
            }

            return new AccountTwoFactorSummary(
                true,
                ReadBoolean(reader, 0),
                reader.IsDBNull(1) ? null : DateOnly.FromDateTime(reader.GetDateTime(1))
            );
        }

        private static async Task<string> LoadCustomerPasswordHashAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 pp1
FROM dbo.customer_profile
WHERE customerID = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture) ?? "";
        }

        private static string MaskStoredSecret(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "";
            }

            var trimmed = value.Trim();
            if (trimmed.Contains('@', StringComparison.Ordinal) && trimmed.Length <= 120)
            {
                var parts = trimmed.Split('@', 2);
                var local = parts[0];
                var domain = parts[1];
                var visibleLocal = local.Length <= 2 ? local[..1] : local[..2];
                return $"{visibleLocal}***@{domain}";
            }

            return "Stored securely";
        }

        private static AffiliateSummary BuildAffiliateSummary(List<AffiliateReferralSummary> referrals, List<AffiliateCommissionSummary> commissions, List<AffiliatePayoutSummary> payouts)
        {
            var pending = 0m;
            var current = 0m;

            foreach (var commission in commissions)
            {
                if (commission.IsReleased)
                {
                    current += commission.Amount;
                }
                else
                {
                    pending += commission.Amount;
                }
            }

            var paidOut = 0m;
            foreach (var payout in payouts)
            {
                paidOut += payout.Amount;
            }

            return new AffiliateSummary(
                referrals.Count,
                referrals.FindAll((referral) => referral.IsPaid).Count,
                referrals.FindAll((referral) => string.Equals(referral.Status, "valid", StringComparison.OrdinalIgnoreCase)).Count,
                pending,
                current,
                paidOut,
                current - paidOut
            );
        }

        private static AffiliateWithdrawPreview BuildAffiliateWithdrawPreview(decimal amount, string method, AffiliateSummary summary, List<AffiliateReferralSummary> referrals)
        {
            var paidReferralsThisYear = 0;
            var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1));
            foreach (var referral in referrals)
            {
                if (referral.IsPaid && referral.AccountStartDate >= cutoff)
                {
                    paidReferralsThisYear++;
                }
            }

            var isPaypal = method.Equals("paypal", StringComparison.OrdinalIgnoreCase) || method.Equals("cash", StringComparison.OrdinalIgnoreCase);
            var minimum = isPaypal ? 100m : 1m;
            var eligible = amount >= minimum && amount <= summary.AvailableCommission && paidReferralsThisYear >= 3;
            var message = eligible
                ? isPaypal
                    ? "PayPal payout request is eligible and can be submitted."
                    : "Commission is eligible to convert to account credit once the legacy credit ledger helper is mapped."
                : "Withdraw is not eligible yet. Legacy rules require enough available commission, the method minimum, and at least 3 paid referrals in the last year.";

            return new AffiliateWithdrawPreview(
                amount,
                method,
                summary.AvailableCommission,
                paidReferralsThisYear,
                minimum,
                eligible,
                message
            );
        }

        private static bool IsValidEmail(string value)
        {
            try
            {
                return new MailAddress(value).Address.Equals(value, StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }

        private static async Task<int> LoadVpnQuotaAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 quota
FROM dbo.vpnquota
WHERE customerID = @customerId
ORDER BY vpnquota_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt32(value, CultureInfo.InvariantCulture);
        }

        private static int ReadInt32(SqlDataReader reader, int ordinal, int fallback = 0)
        {
            return reader.IsDBNull(ordinal) ? fallback : Convert.ToInt32(reader.GetValue(ordinal), CultureInfo.InvariantCulture);
        }

        private static bool ReadBoolean(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return false;
            }

            var value = reader.GetValue(ordinal);
            return value switch
            {
                bool boolValue => boolValue,
                byte byteValue => byteValue != 0,
                short shortValue => shortValue != 0,
                int intValue => intValue != 0,
                long longValue => longValue != 0,
                decimal decimalValue => decimalValue != 0,
                string stringValue => stringValue.Equals("true", StringComparison.OrdinalIgnoreCase)
                    || stringValue.Equals("yes", StringComparison.OrdinalIgnoreCase)
                    || stringValue == "1",
                _ => Convert.ToBoolean(value, CultureInfo.InvariantCulture)
            };
        }

        private static async Task<List<AccountVpnServiceSummary>> LoadVpnServicesAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT vc.vpnclient_id, vc.vpnclient_user, vc.vpntype,
       vh.vpnhost_name, vh.vpnhost_area, vh.vpnhost_dc, vh.vpnhost_status
FROM dbo.vpnclient vc
LEFT JOIN dbo.vpnhost vh ON vh.vpnhost_id = vc.vpnhost_id
WHERE vc.customerID = @customerId
ORDER BY vc.vpnclient_user";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var rows = new List<AccountVpnServiceSummary>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var hostName = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                var hostAddress = string.IsNullOrWhiteSpace(hostName) ? "Not assigned" : $"{hostName}.smartervpn.net";

                rows.Add(new AccountVpnServiceSummary(
                    reader.GetInt64(0),
                    reader.IsDBNull(1) ? "" : reader.GetString(1).Trim(),
                    reader.IsDBNull(2) ? "VPN" : reader.GetString(2).Trim(),
                    hostAddress,
                    reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                    reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                    reader.IsDBNull(6) ? "Unknown" : reader.GetInt64(6) == 1 ? "Online" : "Offline"
                ));
            }

            return rows;
        }

        private static async Task<List<AddonCatalogProduct>> LoadVpnCatalogAsync(SqlConnection connection, string customerType)
        {
            const string sql = @"
SELECT p.product_id, p.name, p.description, p.product_type,
       pr.price_id, pr.currency, pr.payment_term, pr.setup_fee, pr.price_amount, pr.original_price_amount
FROM oms.dbo.product p
LEFT JOIN oms.dbo.price pr ON pr.product_id = p.product_id
WHERE p.active = 1
  AND (p.product_type = @customerType OR p.product_type = 'individual')
  AND (p.name LIKE '%VPN%' OR p.description LIKE '%VPN%')
ORDER BY p.name, pr.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerType", string.IsNullOrWhiteSpace(customerType) ? "individual" : customerType);

            var products = new Dictionary<int, AddonCatalogProduct>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var productId = reader.GetInt32(0);
                if (!products.TryGetValue(productId, out var product))
                {
                    product = new AddonCatalogProduct(
                        productId,
                        reader.GetString(1).Trim(),
                        reader.GetString(2).Trim(),
                        reader.GetString(3),
                        "VPN",
                        new List<AddonPriceOption>()
                    );
                    products.Add(productId, product);
                }

                if (!reader.IsDBNull(4))
                {
                    product.Prices.Add(new AddonPriceOption(
                        reader.GetInt32(4),
                        reader.GetString(5),
                        reader.GetString(6),
                        reader.GetDecimal(7),
                        reader.GetDecimal(8),
                        reader.GetDecimal(9)
                    ));
                }
            }

            return new List<AddonCatalogProduct>(products.Values);
        }

        private static async Task<List<AddonCatalogProduct>> LoadNewOrderCatalogAsync(SqlConnection connection, string customerType, string type)
        {
            var normalizedType = NormalizeNewOrderType(type);
            var productFilter = NewOrderProductFilter(normalizedType);
            if (string.IsNullOrWhiteSpace(productFilter))
            {
                return new List<AddonCatalogProduct>();
            }

            var sql = $@"
SELECT p.product_id, p.name, CAST(p.description AS nvarchar(max)) AS description, p.product_type,
       pr.price_id, pr.currency, pr.payment_term, pr.setup_fee, pr.price_amount, pr.original_price_amount
FROM oms.dbo.product p
LEFT JOIN oms.dbo.price pr ON pr.product_id = p.product_id
WHERE p.active = 1
  AND {productFilter}
ORDER BY
  CASE WHEN pr.price_amount IS NULL THEN 1 ELSE 0 END,
  p.name,
  pr.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerType", string.IsNullOrWhiteSpace(customerType) ? "individual" : customerType);

            var products = new Dictionary<int, AddonCatalogProduct>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var productId = reader.GetInt32(0);
                if (!products.TryGetValue(productId, out var product))
                {
                    product = new AddonCatalogProduct(
                        productId,
                        reader.GetString(1).Trim(),
                        reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                        reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                        NewOrderTitle(normalizedType),
                        new List<AddonPriceOption>()
                    );
                    products.Add(productId, product);
                }

                if (!reader.IsDBNull(4))
                {
                    product.Prices.Add(new AddonPriceOption(
                        reader.GetInt32(4),
                        reader.GetString(5),
                        reader.GetString(6),
                        reader.GetDecimal(7),
                        reader.GetDecimal(8),
                        reader.GetDecimal(9)
                    ));
                }
            }

            return new List<AddonCatalogProduct>(products.Values);
        }

        private static async Task<List<AddonCatalogProduct>> LoadNewPurchaseRecommendedAsync(SqlConnection connection, string branch)
        {
            var productType = NormalizeRecommendedBranch(branch) switch
            {
                "data-backup" => "DataBackup",
                "server-backup" => "ServerBackup",
                "site-backup" => "SiteBackup",
                _ => "SiteBackup"
            };

            const string sql = @"
SELECT p.product_id, p.name, CAST(p.description AS nvarchar(max)) AS description, p.product_type,
       pr.price_id, pr.currency, pr.payment_term, pr.setup_fee, pr.price_amount, pr.original_price_amount
FROM oms.dbo.product p
LEFT JOIN oms.dbo.price pr ON pr.product_id = p.product_id
WHERE p.active = 1
  AND p.product_type = @productType
ORDER BY
  CASE WHEN pr.price_amount IS NULL THEN 1 ELSE 0 END,
  p.name,
  CASE
    WHEN @productType = 'ServerBackup' AND pr.payment_term = 'quarterly' THEN 0
    WHEN @productType <> 'ServerBackup' AND pr.payment_term = 'annually' THEN 0
    ELSE 1
  END,
  pr.price_amount";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@productType", productType);

            var products = new Dictionary<int, AddonCatalogProduct>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var productId = reader.GetInt32(0);
                if (!products.TryGetValue(productId, out var product))
                {
                    product = new AddonCatalogProduct(
                        productId,
                        reader.GetString(1).Trim(),
                        RecommendedDescription(productType, reader.IsDBNull(2) ? "" : reader.GetString(2).Trim()),
                        reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                        productType,
                        new List<AddonPriceOption>()
                    );
                    products.Add(productId, product);
                }

                if (!reader.IsDBNull(4))
                {
                    product.Prices.Add(new AddonPriceOption(
                        reader.GetInt32(4),
                        reader.GetString(5),
                        reader.GetString(6),
                        reader.GetDecimal(7),
                        reader.GetDecimal(8),
                        reader.GetDecimal(9)
                    ));
                }
            }

            return new List<AddonCatalogProduct>(products.Values);
        }

        private static string RecommendedDescription(string productType, string fallback)
        {
            return productType switch
            {
                "DataBackup" => "Automatically backup your essential data (website files, databases, and emails) to protect against accidental deletions, overwrites, or potential hacking attacks. Enjoy unlimited backup storage and free restoration.",
                "ServerBackup" => "Automatically daily backup your server data and store them off-server for up to 10 days. Protect your data easily and affordably.",
                "SiteBackup" => "Automatically backup your website files. Includes 50GB of remote backup space.",
                _ => fallback
            };
        }

        private static string NewPurchaseRecommendedBranch(string productName)
        {
            var name = productName ?? "";
            if (name.Contains("W", StringComparison.OrdinalIgnoreCase) || name.Contains("V68", StringComparison.OrdinalIgnoreCase))
            {
                return "data-backup";
            }

            if (name.Contains("V6", StringComparison.OrdinalIgnoreCase) && !name.Contains("V69", StringComparison.OrdinalIgnoreCase))
            {
                return "server-backup";
            }

            return "site-backup";
        }

        private static string NormalizeRecommendedBranch(string branch)
        {
            var value = (branch ?? "").Trim().ToLowerInvariant().Replace("_", "-", StringComparison.Ordinal);
            return value switch
            {
                "databackup" => "data-backup",
                "serverbackup" => "server-backup",
                "sitebackup" => "site-backup",
                "cloudbackup" => "site-backup",
                "data-backup" or "server-backup" or "site-backup" or "none" => value,
                _ => "site-backup"
            };
        }

        private static string NewPurchaseRecommendedLegacyPath(string branch)
        {
            return NormalizeRecommendedBranch(branch) switch
            {
                "data-backup" => "/account/addon_purchase_recommended",
                "server-backup" => "/account/addon_purchase_recommended_serverbackup",
                "none" => "",
                _ => "/account/addon_purchase_recommended_sitebackup"
            };
        }

        private static int RecommendedBranchPageType(string branch)
        {
            return NormalizeRecommendedBranch(branch) switch
            {
                "data-backup" => ConstPageTypeDataBackup,
                "server-backup" => ConstPageTypeServerBackup,
                _ => ConstPageTypeCloudBackup
            };
        }

        private static string NewPurchaseTracePath(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "/account/cp_purchase_list.asp -> cp_purchase_list_action.asp -> addon_purchase_recommended*.asp -> /checkout/account_screen",
                "managed-hosting" => "/account/cp_purchase_list_managed_hosting.asp -> cp_purchase_list_action.asp -> addon_purchase_recommended*.asp -> /checkout/account_screen",
                "windows-vps" => "/account/cp_purchase_list_vps.asp -> cp_purchase_list_action.asp -> addon_purchase_recommended_serverbackup.asp -> /checkout/account_screen",
                "linux-vps" => "/account/cp_purchase_list_vps_linux.asp -> cp_purchase_list_action.asp -> addon_purchase_recommended_serverbackup.asp -> /checkout/account_screen",
                "cloud" => "/account/cp_purchase_list_cloud.asp -> cp_purchase_list_action.asp -> addon_purchase_recommended*.asp -> /checkout/account_screen",
                "dedicated" => "/account/cp_purchase_list_dedi.asp -> cp_purchase_list_action.asp -> addon_purchase_recommended_sitebackup.asp -> /checkout/account_screen",
                "reseller" => "/account/cp_purchase_list_reseller.asp -> addon_purchase_action.asp -> /checkout/account_screen",
                _ => ""
            };
        }

        private static string NormalizeNewOrderType(string type)
        {
            var normalized = (type ?? "").Trim().ToLowerInvariant().Replace("_", "-", StringComparison.Ordinal);
            return normalized switch
            {
                "cloud-server" => "cloud",
                "dedicated-server" => "dedicated",
                _ => normalized
            };
        }

        private static bool IsCatalogNewOrderType(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => true,
                "managed-hosting" => true,
                "windows-vps" => true,
                "linux-vps" => true,
                "cloud" => true,
                "dedicated" => true,
                "reseller" => true,
                _ => false
            };
        }

        private static string NewOrderProductFilter(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "(p.product_type = @customerType OR p.product_type = 'individual') AND p.name LIKE 'W%' AND CAST(p.description AS nvarchar(max)) NOT LIKE '%reseller%'",
                "managed-hosting" => "p.product_type = 'individual' AND CAST(p.description AS nvarchar(max)) LIKE '%Fully-Managed%'",
                "windows-vps" => "p.product_type = 'individual' AND CAST(p.description AS nvarchar(max)) LIKE '%VPS%'",
                "linux-vps" => "p.product_type = 'individual' AND CAST(p.description AS nvarchar(max)) LIKE '%Linux%'",
                "cloud" => "p.product_type = 'individual' AND CAST(p.description AS nvarchar(max)) LIKE '%Cloud%'",
                "dedicated" => "p.product_type = 'individual' AND CAST(p.description AS nvarchar(max)) LIKE '%Xeon%'",
                "reseller" => "p.product_type = 'reseller'",
                _ => ""
            };
        }

        private static string NewOrderTitle(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "Buy Hosting Account",
                "managed-hosting" => "Buy Managed Hosting",
                "windows-vps" => "Buy Windows VPS",
                "linux-vps" => "Buy Linux VPS",
                "cloud" => "Buy Cloud Server",
                "dedicated" => "Buy Dedicated Server",
                "reseller" => "Buy Reseller Account",
                "domain-purchase" => "Purchase New Domain",
                "domain-transfer" => "Transfer an Existing Domain",
                _ => "New Order"
            };
        }

        private static string NewOrderDescription(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "Start a new ASP.NET hosting plan with current plans and billing terms.",
                "managed-hosting" => "Get a managed hosting plan with hands-on server and application support.",
                "windows-vps" => "Order a Windows VPS for dedicated resources and full server control.",
                "linux-vps" => "Order a Linux VPS for flexible workloads and server-level access.",
                "cloud" => "Launch a cloud server with scalable compute capacity.",
                "dedicated" => "Reserve dedicated server hardware for high-performance workloads.",
                "reseller" => "Start a reseller account to sell hosting under your own customer base.",
                "domain-purchase" => "Search, register, and add a new domain name to your account.",
                "domain-transfer" => "Transfer an existing domain and renew it through your account.",
                _ => "Modern account panel order flow."
            };
        }

        private static string NewOrderLegacyPath(string type)
        {
            return NormalizeNewOrderType(type) switch
            {
                "hosting" => "/account/cp_purchase_list",
                "managed-hosting" => "/account/cp_purchase_list_managed_hosting",
                "windows-vps" => "/account/cp_purchase_list_vps",
                "linux-vps" => "/account/cp_purchase_list_vps_linux",
                "cloud" => "/account/cp_purchase_list_cloud",
                "dedicated" => "/account/cp_purchase_list_dedi",
                "reseller" => "/account/cp_purchase_list_reseller",
                "domain-purchase" => "/account/domain_purchase",
                "domain-transfer" => "/account/domain_transfer",
                _ => ""
            };
        }

        private static async Task<List<AccountDomainSummary>> LoadAccountDomainsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT dp.id, dp.domain_name, dp.client_product_id, dp.status, dp.StartDate, dp.BuyYear,
       dp.RegisterStatus, dp.RegisterInfoID, dp.AddDate, cp.next_due_date, cp.status AS product_status,
       CASE WHEN privacyTld.tld IS NULL THEN 0 ELSE 1 END AS whois_privacy_supported,
       CASE WHEN privacy.client_product_id IS NULL THEN 0 ELSE 1 END AS whois_privacy_purchased,
       privacy.turnOnDate,
       ISNULL(grace.graceperiod, 0) AS grace_period_days
FROM domaincontroller.dbo.domain_profile dp
LEFT JOIN oms.dbo.client_product cp ON cp.client_product_id = dp.client_product_id
OUTER APPLY (
    SELECT TOP 1 tld
    FROM domaincontroller.dbo.domain_privacy_tld
    WHERE SUBSTRING(dp.domain_name, CHARINDEX('.', dp.domain_name), LEN(dp.domain_name)) = tld
) privacyTld
OUTER APPLY (
    SELECT TOP 1 p.client_product_id, p.turnOnDate
    FROM domaincontroller.dbo.domain_privacy p
    INNER JOIN oms.dbo.client_product privacyCp ON privacyCp.client_product_id = p.client_product_id
    WHERE LOWER(p.domain) = LOWER(dp.domain_name)
      AND privacyCp.status = 1
) privacy
OUTER APPLY (
    SELECT TOP 1 graceperiod
    FROM domaincontroller.dbo.domain_graceperiod_tld
    WHERE SUBSTRING(dp.domain_name, CHARINDEX('.', dp.domain_name), LEN(dp.domain_name)) = tld
) grace
WHERE dp.customer_profile_id = @customerId
ORDER BY dp.domain_name";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var rows = new List<AccountDomainSummary>();

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var startDate = reader.IsDBNull(4) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(4));
                var buyYear = reader.IsDBNull(5) ? 1 : reader.GetInt32(5);
                var expirationDate = CalculateDomainExpiration(startDate, buyYear);
                var daysLeft = expirationDate == null ? (int?)null : expirationDate.Value.DayNumber - today.DayNumber;

                // Match legacy domain_list.asp: hide domains more than 40 days past expiration unless start date is the placeholder.
                if (daysLeft < -40 && startDate != new DateOnly(1900, 1, 1))
                {
                    continue;
                }

                var status = reader.IsDBNull(3) ? "unknown" : reader.GetString(3).Trim();
                if (daysLeft < 0 && startDate != null && startDate != new DateOnly(1900, 1, 1))
                {
                    status = "expired";
                }

                rows.Add(new AccountDomainSummary(
                    reader.GetInt32(0),
                    reader.GetString(1).Trim(),
                    reader.GetInt32(2),
                    status,
                    startDate,
                    expirationDate,
                    daysLeft,
                    reader.IsDBNull(6) ? "" : reader.GetString(6).Trim(),
                    reader.IsDBNull(7) ? 0 : reader.GetInt32(7),
                    reader.IsDBNull(8) ? null : DateOnly.FromDateTime(reader.GetDateTime(8)),
                    reader.IsDBNull(9) ? null : DateOnly.FromDateTime(reader.GetDateTime(9)),
                    reader.IsDBNull(10) ? "Unknown" : StatusLabel(reader.GetInt32(10)),
                    ReadBoolean(reader, 11),
                    ReadBoolean(reader, 12),
                    reader.IsDBNull(13) ? null : DateOnly.FromDateTime(reader.GetDateTime(13)),
                    ReadInt32(reader, 14)
                ));
            }

            return rows;
        }

        private static async Task<DomainProfileDetail?> LoadDomainProfileAsync(SqlConnection connection, long customerId, int domainId)
        {
            const string sql = @"
SELECT TOP 1
       dp.id, dp.domain_name, dp.RegisterInfoID, dp.RegisterStatus, dp.StartDate, dp.BuyYear,
       CASE WHEN privacyTld.tld IS NULL THEN 0 ELSE 1 END AS whois_privacy_supported,
       CASE WHEN privacy.client_product_id IS NULL THEN 0 ELSE 1 END AS whois_privacy_purchased,
       privacy.turnOnDate,
       ISNULL(grace.graceperiod, 0) AS grace_period_days,
       dr.firstname, dr.lastname, dr.organization, dr.email, dr.phone, dr.fax, dr.street, dr.street1, dr.city, dr.state, dr.province, dr.country, dr.zip,
       dr.firstnamea, dr.lastnamea, dr.organizationa, dr.emaila, dr.phonea, dr.faxa, dr.streeta, dr.street1a, dr.citya, dr.statea, dr.provincea, dr.countrya, dr.zipa,
       dr.firstnameb, dr.lastnameb, dr.organizationb, dr.emailb, dr.phoneb, dr.faxb, dr.streetb, dr.street1b, dr.cityb, dr.stateb, dr.provinceb, dr.countryb, dr.zipb,
       dr.firstnamet, dr.lastnamet, dr.organizationt, dr.emailt, dr.phonet, dr.faxt, dr.streett, dr.street1t, dr.cityt, dr.statet, dr.provincet, dr.countryt, dr.zipt
FROM domaincontroller.dbo.domain_profile dp
INNER JOIN domaincontroller.dbo.DomainRegisterInfo dr ON dr.id = dp.RegisterInfoID
OUTER APPLY (
    SELECT TOP 1 tld
    FROM domaincontroller.dbo.domain_privacy_tld
    WHERE SUBSTRING(dp.domain_name, CHARINDEX('.', dp.domain_name), LEN(dp.domain_name)) = tld
) privacyTld
OUTER APPLY (
    SELECT TOP 1 p.client_product_id, p.turnOnDate
    FROM domaincontroller.dbo.domain_privacy p
    INNER JOIN oms.dbo.client_product privacyCp ON privacyCp.client_product_id = p.client_product_id
    WHERE LOWER(p.domain) = LOWER(dp.domain_name)
      AND privacyCp.status = 1
) privacy
OUTER APPLY (
    SELECT TOP 1 graceperiod
    FROM domaincontroller.dbo.domain_graceperiod_tld
    WHERE SUBSTRING(dp.domain_name, CHARINDEX('.', dp.domain_name), LEN(dp.domain_name)) = tld
) grace
WHERE dp.id = @domainId
  AND dp.customer_profile_id = @customerId
  AND dr.sponsorid = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@domainId", domainId);
            command.Parameters.AddWithValue("@customerId", customerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            string Field(int index) => reader.IsDBNull(index) ? "" : Convert.ToString(reader.GetValue(index))?.Trim() ?? "";
            DomainContactDetail Contact(int offset) => new(
                Field(offset),
                Field(offset + 1),
                Field(offset + 2),
                Field(offset + 3),
                Field(offset + 4),
                Field(offset + 5),
                Field(offset + 6),
                Field(offset + 7),
                Field(offset + 8),
                Field(offset + 9),
                Field(offset + 10),
                Field(offset + 11),
                Field(offset + 12)
            );

            var startDate = reader.IsDBNull(4) ? (DateOnly?)null : DateOnly.FromDateTime(reader.GetDateTime(4));
            var buyYear = reader.IsDBNull(5) ? 1 : reader.GetInt32(5);
            var expirationDate = CalculateDomainExpiration(startDate, buyYear);
            var daysLeft = expirationDate == null ? (int?)null : expirationDate.Value.DayNumber - DateOnly.FromDateTime(DateTime.UtcNow).DayNumber;

            return new DomainProfileDetail(
                reader.GetInt32(0),
                Field(1),
                reader.IsDBNull(2) ? 0 : reader.GetInt32(2),
                Field(3),
                expirationDate,
                daysLeft,
                ReadBoolean(reader, 6),
                ReadBoolean(reader, 7),
                reader.IsDBNull(8) ? null : DateOnly.FromDateTime(reader.GetDateTime(8)),
                ReadInt32(reader, 9),
                Contact(10),
                Contact(23),
                Contact(36),
                Contact(49)
            );
        }

        private static DateOnly? CalculateDomainExpiration(DateOnly? startDate, int buyYear)
        {
            if (startDate == null)
            {
                return null;
            }

            return startDate.Value.AddYears(Math.Max(buyYear, 1));
        }

        private static async Task<OwnedHostingSite?> LoadOwnedHostingSiteAsync(SqlConnection connection, long customerId, long requestedCpId, int siteUid)
        {
            const string sql = @"
SELECT TOP 1 cp.cpID, cp.cpLogin, cp.ServerID, cp.WebHostType,
       s.site_Uid, s.site_name, s.Display_name, s.site_path, s.iis_id, s.pool_id,
       s.iis_status, s.running_status, s.version, s.phpversion, s.is_secure, s.isSubdomain, s.create_date
FROM dbo.cp_config cp
INNER JOIN dbo.cp_config_Sites s ON s.cpID = cp.cpID
WHERE cp.customerID = @customerId
  AND ISNULL(cp.hideit, 0) = 0
  AND cp.status <> 3
  AND s.site_Uid = @siteUid
  AND (@requestedCpId = 0 OR cp.cpID = @requestedCpId)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@requestedCpId", requestedCpId);
            command.Parameters.AddWithValue("@siteUid", siteUid);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            return new OwnedHostingSite(
                reader.GetInt64(0),
                reader.GetString(1).Trim(),
                reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                reader.GetInt32(4),
                reader.GetString(5).Trim(),
                reader.IsDBNull(6) ? "" : reader.GetString(6).Trim(),
                reader.IsDBNull(7) ? "" : reader.GetString(7).Trim(),
                reader.IsDBNull(8) ? "" : Convert.ToString(reader.GetValue(8), CultureInfo.InvariantCulture) ?? "",
                reader.IsDBNull(9) ? "" : Convert.ToString(reader.GetValue(9), CultureInfo.InvariantCulture) ?? "",
                !reader.IsDBNull(10) && reader.GetBoolean(10),
                reader.IsDBNull(11) ? "" : reader.GetString(11).Trim(),
                reader.IsDBNull(12) ? "" : reader.GetString(12).Trim(),
                reader.IsDBNull(13) ? "" : reader.GetString(13).Trim(),
                !reader.IsDBNull(14) && reader.GetBoolean(14),
                !reader.IsDBNull(15) && reader.GetBoolean(15),
                reader.IsDBNull(16) ? null : reader.GetDateTime(16)
            );
        }

        private async Task<HostingSiteFunctionDetails> BuildHostingSiteFunctionDetailsAsync(SqlConnection connection, OwnedHostingSite site, string functionKey)
        {
            var normalizedKey = NormalizeWebsiteFunctionKey(functionKey);
            var spec = GetWebsiteFunctionSpec(normalizedKey);
            var warnings = new List<string>();
            var siteSummary = new Dictionary<string, object?>
            {
                ["cpId"] = site.CpId,
                ["cpLogin"] = site.CpLogin,
                ["serverId"] = site.ServerId,
                ["webHostType"] = site.WebHostType,
                ["siteUid"] = site.SiteUid,
                ["siteName"] = DisplaySiteName(site),
                ["rootName"] = site.SiteName,
                ["iisId"] = site.IisId,
                ["poolId"] = site.PoolId,
                ["sitePath"] = site.SitePath,
                ["status"] = site.IisStatus ? "Active" : "Stopped",
                ["runningStatus"] = site.RunningStatus,
                ["version"] = site.Version,
                ["phpVersion"] = site.PhpVersion,
                ["isSecure"] = site.IsSecure,
                ["isSubdomain"] = site.IsSubdomain,
                ["createDate"] = site.CreateDate
            };

            var domains = await TryLoadFunctionRowsAsync(
                connection,
                warnings,
                "mapped domains",
                @"
SELECT domain_Uid, domain_name, ISNULL(cdn, 0) AS cdn, ISNULL(isDefault, 0) AS isDefault, create_date
FROM dbo.cp_config_Domains
WHERE site_Uid = @siteUid
ORDER BY ISNULL(isDefault, 0) DESC, domain_name",
                command => command.Parameters.AddWithValue("@siteUid", site.SiteUid));

            var workqueue = await TryLoadFunctionRowsAsync(
                connection,
                warnings,
                "recent worker jobs",
                @"
SELECT TOP 12 id, type, ISNULL(status, 0) AS status, zipfile, dstfolder, serverid, data1, Enterdate, siteowner, notifyemail, errormessage
FROM dbo.workqueue
WHERE cplogin = @cpLogin
  AND (siteowner = @siteName OR zipfile LIKE @siteNeedle OR dstfolder LIKE @siteNeedle OR data1 LIKE @siteNeedle)
ORDER BY id DESC",
                command =>
                {
                    command.Parameters.AddWithValue("@cpLogin", site.CpLogin);
                    command.Parameters.AddWithValue("@siteName", site.SiteName);
                    command.Parameters.AddWithValue("@siteNeedle", $"%{site.SiteName}%");
                });

            var functionData = new Dictionary<string, object?>
            {
                ["site"] = siteSummary,
                ["domains"] = domains,
                ["recentJobs"] = workqueue
            };

            if (normalizedKey is "application-pool" or "mapped-path" or "aspnet-version" or "core-mode" or "php-version" or "php-settings" or "detail-error" or "force-https" or "remote-iis-manager" or "site-guard")
            {
                functionData["runtime"] = await TryLoadFunctionRowsAsync(
                    connection,
                    warnings,
                    "runtime rows",
                    @"
SELECT TOP 50 'Pool' AS row_type, CAST(pool_id AS varchar(30)) AS id, CAST(privateMemory AS varchar(30)) + ' MB' AS title, pool_version AS status, '' AS servername, create_date AS created
FROM dbo.cp_config_Pools
WHERE cpID = @cpId
UNION ALL
SELECT TOP 50 'Redirect' AS row_type, CAST(r.id AS varchar(30)) AS id, r.domain AS title, r.destination AS status, r.rulename AS servername, NULL AS created
FROM dbo.cp_config_redirect r
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = r.site_uid
WHERE s.cpID = @cpId
ORDER BY row_type, title",
                    command => command.Parameters.AddWithValue("@cpId", site.CpId));
            }

            if (normalizedKey is "ftp-access" or "vs-webdeploy" or "remote-iis-manager" or "visitor-stats")
            {
                functionData["ftpUsers"] = await TryLoadFunctionRowsAsync(
                    connection,
                    warnings,
                    "FTP users",
                    @"
SELECT TOP 50 ftp_login, ftp_path, ftp_quota, ftp_permission, cpurl
FROM dbo.cp_config_FTP
WHERE cpID = @cpId
ORDER BY ftp_login",
                    command => command.Parameters.AddWithValue("@cpId", site.CpId));
            }

            if (normalizedKey == "visitor-stats")
            {
                var statsRows = await TryLoadFunctionRowsAsync(
                    connection,
                    warnings,
                    "visitor stats",
                    @"
SELECT TOP 1 ISNULL(Stats_enabled, 0) AS stats_enabled, ISNULL(Stats_mainDomain, '') AS stats_domain
FROM dbo.cp_config_Sites
WHERE site_Uid = @siteUid AND cpID = @cpId",
                    command =>
                    {
                        command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                        command.Parameters.AddWithValue("@cpId", site.CpId);
                    });
                var formattedIisId = FormatIisId(site.IisId);
                var hash = HashHex(MD5.HashData(Encoding.UTF8.GetBytes($"abcde12345{site.CpId}{formattedIisId}")));
                functionData["visitorStats"] = new Dictionary<string, object?>
                {
                    ["rows"] = statsRows,
                    ["available"] = !site.IsSubdomain,
                    ["statsUrl"] = $"https://{site.ServerId}.site4now.net/stats/awstats.pl?config={site.CpId}{formattedIisId}&h={hash}",
                    ["login"] = site.CpLogin,
                    ["notice"] = "Stats take about 24 hours before the first update."
                };
            }

            if (normalizedKey == "iis-log-manager")
            {
                var w3svcId = $"{site.CpId}{FormatIisId(site.IisId)}";
                functionData["iisLogs"] = new Dictionary<string, object?>
                {
                    ["w3svcId"] = w3svcId,
                    ["source"] = $@"c:\logfiles\W3SVC{w3svcId}\*.log",
                    ["destination"] = $@"/www/db/{w3svcId}",
                    ["note"] = "Classic download copies raw logs into the hosting account /db folder."
                };
            }

            if (normalizedKey is "vs-webdeploy" or "remote-iis-manager")
            {
                var siteFullName = $"{site.CpLogin}-{site.SiteName}";
                var webDeployUser = normalizedKey == "remote-iis-manager"
                    ? $"ifc\\{site.CpLogin}"
                    : site.CpLogin;
                var serviceHost = BuildLegacyHost(GetLegacyAgentSettings(), site.ServerId);
                var checkCall = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "CheckIISManagerUser",
                    ["sitename"] = siteFullName,
                    ["user"] = webDeployUser
                });

                var isEnabled = checkCall.Success && checkCall.Preview.Trim().Equals("1", StringComparison.OrdinalIgnoreCase);
                functionData["webDeploy"] = new Dictionary<string, object?>
                {
                    ["enabled"] = isEnabled,
                    ["status"] = isEnabled ? "On" : "Off",
                    ["serviceUrl"] = $"https://{serviceHost}:8172/MsDeploy.axd?site={siteFullName}",
                    ["serverName"] = serviceHost,
                    ["siteName"] = siteFullName,
                    ["username"] = webDeployUser,
                    ["password"] = "Stored securely",
                    ["publishSettings"] = "Server-side generation pending legacy password decrypt compatibility",
                    ["classicCheckResponse"] = checkCall.Preview
                };

                if (!checkCall.Success)
                {
                    warnings.Add(checkCall.Message);
                }

                warnings.Add("Enable/disable still needs Persits-compatible decryptpwd for cpPasswordHash because the classic action hashes the decrypted hosting password before calling SetIISManagerUser.");
            }

            if (normalizedKey is "site-guard" or "force-https" or "ip-deny" or "cdn" or "domain-manager")
            {
                functionData["security"] = await TryLoadFunctionRowsAsync(
                    connection,
                    warnings,
                    "security settings",
                    @"
SELECT TOP 25 s.site_Uid, s.site_name, s.webknight, d.domain_name, d.cdn, d.isDefault
FROM dbo.cp_config_Sites s
LEFT JOIN dbo.cp_config_Domains d ON d.site_Uid = s.site_Uid
WHERE s.site_Uid = @siteUid",
                    command => command.Parameters.AddWithValue("@siteUid", site.SiteUid));
            }

            if (normalizedKey is "default-doc" or "custom-errors" or "mime-type" or "script-map")
            {
                var appPath = "/";
                var readForm = normalizedKey switch
                {
                    "default-doc" => new Dictionary<string, string>
                    {
                        ["action"] = "IIS_Member_DefaultPage_Get",
                        ["IIS_ID"] = FullIisId(site)
                    },
                    "custom-errors" => new Dictionary<string, string>
                    {
                        ["action"] = "IIS_Member_ErrorPage_Get",
                        ["IIS_ID"] = FullIisId(site)
                    },
                    "mime-type" => new Dictionary<string, string>
                    {
                        ["action"] = "get_mimeMap",
                        ["IIS_ID"] = FullIisId(site),
                        ["apppath"] = appPath
                    },
                    "script-map" => new Dictionary<string, string>
                    {
                        ["action"] = "IIS_Member_IISEntry_CustomScriptMap_Get",
                        ["IIS_ID"] = FullIisId(site)
                    },
                    _ => new Dictionary<string, string>()
                };

                var readCall = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", readForm);
                functionData["iisCurrent"] = new Dictionary<string, object?>
                {
                    ["success"] = readCall.Success,
                    ["action"] = readForm.TryGetValue("action", out var readAction) ? readAction : "",
                    ["appPath"] = appPath,
                    ["preview"] = readCall.Preview,
                    ["url"] = readCall.Url
                };

                if (!readCall.Success)
                {
                    warnings.Add(readCall.Message);
                }
            }

            if (normalizedKey is "schedule-tasks")
            {
                warnings.Add("Scheduled tasks use the legacy scheduletask connection; live task inventory needs that connection before this drawer can read task rows.");
                functionData["scheduledTasks"] = new List<Dictionary<string, object?>>();
            }

            if (normalizedKey is "outgoing-port")
            {
                functionData["outgoingPorts"] = await TryLoadFunctionRowsAsync(
                    connection,
                    warnings,
                    "outgoing port rules",
                    @"
SELECT TOP 100 ipid, remoteip, port, adddate, rulename
FROM dbo.cp_config_db_out_ip
WHERE cpID = @cpId
ORDER BY adddate DESC, ipid DESC",
                    command => command.Parameters.AddWithValue("@cpId", site.CpId));
            }

            functionData["agent"] = new Dictionary<string, object?>
            {
                ["host"] = BuildLegacyHost(GetLegacyAgentSettings(), site.ServerId),
                ["port"] = GetLegacyAgentSettings().Port,
                ["usesRemoteAgent"] = spec.UsesRemoteAgent
            };

            return new HostingSiteFunctionDetails(
                normalizedKey,
                spec.Label,
                spec.Group,
                spec.LegacyEntry,
                spec.UnderlyingApi,
                spec.Description,
                spec.SupportsWrite,
                spec.UsesRemoteAgent,
                spec.Fields,
                functionData,
                warnings
            );
        }

        private async Task<HostingSiteFunctionMutationResponse> RunHostingSiteFunctionMutationAsync(SqlConnection connection, OwnedHostingSite site, string functionKey, HostingSiteFunctionMutationRequest request)
        {
            var normalizedKey = NormalizeWebsiteFunctionKey(functionKey);
            var action = (request.Action ?? "").Trim();
            var fields = request.Fields ?? new Dictionary<string, string>();
            var spec = GetWebsiteFunctionSpec(normalizedKey);

            if (!spec.SupportsWrite)
            {
                return new HostingSiteFunctionMutationResponse(false, $"{spec.Label} is read-only in this panel.", null);
            }

            if (normalizedKey == "site-name")
            {
                var nextName = fields.TryGetValue("siteName", out var siteName) ? siteName.Trim() : "";
                if (!IsSafeSiteDisplayName(nextName))
                {
                    return new HostingSiteFunctionMutationResponse(false, "Enter a safe site name without slashes or special path characters.", null);
                }

                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/iis_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Member_IISEntry_SITENAME_EDIT",
                    ["IIS_ID"] = FullIisId(site),
                    ["site_name"] = nextName
                });

                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                await using var command = new SqlCommand("UPDATE dbo.cp_config_Sites SET Display_name = @siteName WHERE site_Uid = @siteUid AND cpID = @cpId", connection);
                command.Parameters.AddWithValue("@siteName", nextName);
                command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                command.Parameters.AddWithValue("@cpId", site.CpId);
                await command.ExecuteNonQueryAsync();
                return new HostingSiteFunctionMutationResponse(true, "Site name updated in IIS and account data.", call);
            }

            if (normalizedKey == "site-on-off")
            {
                var nextState = action.Equals("stop", StringComparison.OrdinalIgnoreCase) || action.Equals("off", StringComparison.OrdinalIgnoreCase)
                    ? "stop"
                    : "start";
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/iis_api.asp", new Dictionary<string, string>
                {
                    ["action"] = nextState == "stop" ? "IIS_Member_IISEntry_STOP" : "IIS_Member_IISEntry_START",
                    ["IIS_ID"] = FullIisId(site)
                });

                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                await using var command = new SqlCommand("UPDATE dbo.cp_config_Sites SET iis_status = @status WHERE site_Uid = @siteUid AND cpID = @cpId", connection);
                command.Parameters.AddWithValue("@status", nextState != "stop");
                command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                command.Parameters.AddWithValue("@cpId", site.CpId);
                await command.ExecuteNonQueryAsync();
                return new HostingSiteFunctionMutationResponse(true, $"Site {nextState} request completed.", call);
            }

            if (normalizedKey is "vs-webdeploy" or "remote-iis-manager")
            {
                return await RunWebDeployMutationAsync(site, action);
            }

            if (normalizedKey == "application-pool")
            {
                return await RunApplicationPoolMutationAsync(connection, site, action, fields);
            }

            if (normalizedKey == "mapped-path")
            {
                return await RunMappedPathMutationAsync(connection, site, fields);
            }

            if (normalizedKey is "github-deploy" or "nodejs-app")
            {
                var type = "";
                if (normalizedKey == "github-deploy" && action.Equals("deploy", StringComparison.OrdinalIgnoreCase))
                {
                    type = "deploy";
                }
                else if (normalizedKey == "nodejs-app" &&
                    (action.Equals("setup", StringComparison.OrdinalIgnoreCase) ||
                     action.Equals("enable", StringComparison.OrdinalIgnoreCase) ||
                     action.Equals("save", StringComparison.OrdinalIgnoreCase) ||
                     action.Equals("nodejs", StringComparison.OrdinalIgnoreCase)))
                {
                    type = "nodejs";
                }

                if (string.IsNullOrWhiteSpace(type))
                {
                    return new HostingSiteFunctionMutationResponse(
                        false,
                        $"{spec.Label} only queues explicit legacy worker actions. Choose a supported action instead of running a generic queue job.",
                        new
                        {
                            supportedActions = normalizedKey switch
                            {
                                "github-deploy" => new[] { "deploy" },
                                "nodejs-app" => new[] { "setup", "enable", "save" },
                                _ => Array.Empty<string>()
                            }
                        });
                }

                var queueRequest = new HostingWorkqueueRequest(
                    site.CpId,
                    type,
                    fields.TryGetValue("source", out var source) ? source : site.SitePath,
                    fields.TryGetValue("target", out var target) ? target : site.SitePath,
                    site.ServerId,
                    string.IsNullOrWhiteSpace(action) ? spec.Label : action,
                    site.SiteName,
                    "website-more-functions"
                );
                var result = await CreateHostingWorkqueueAsync(connection, new SelectedHostingCp(site.CpId, site.CpLogin, site.ServerId, site.WebHostType), queueRequest);
                return new HostingSiteFunctionMutationResponse(result.Success, result.Message, result);
            }

            if (normalizedKey == "scan-virus")
            {
                var queueRequest = new HostingWorkqueueRequest(
                    site.CpId,
                    "scanvirus",
                    site.SitePath,
                    site.SitePath,
                    site.ServerId,
                    fields.TryGetValue("command", out var command) ? command : "",
                    site.SiteName,
                    "website-more-functions"
                );
                var result = await CreateHostingWorkqueueAsync(connection, new SelectedHostingCp(site.CpId, site.CpLogin, site.ServerId, site.WebHostType), queueRequest);
                return new HostingSiteFunctionMutationResponse(result.Success, result.Message, result);
            }

            if (normalizedKey == "ftp-access")
            {
                return new HostingSiteFunctionMutationResponse(
                    false,
                    "FTP Access is paused until Persits-compatible encryptpwd/encryptFTPpwd output is implemented. The latest active ASP writes cp_config_FTP directly and ignores disabled /ftp_api.asp code inside if 1 = 2 blocks.",
                    new
                    {
                        site.SiteName,
                        site.SitePath,
                        legacySource = "/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc:createFTPSingle"
                    });
            }

            if (normalizedKey == "outgoing-port")
            {
                return await RunOutgoingPortMutationAsync(connection, site, action, fields);
            }

            if (normalizedKey == "force-https")
            {
                return await RunForceHttpsMutationAsync(connection, site, action, fields);
            }

            if (normalizedKey == "ip-deny")
            {
                return await RunIpDenyMutationAsync(site, action, fields);
            }

            if (normalizedKey == "create-net-app")
            {
                return await RunCreateNetAppMutationAsync(connection, site, action, fields);
            }

            if (normalizedKey == "virtual-dir")
            {
                return await RunVirtualDirMutationAsync(connection, site, action, fields);
            }

            if (normalizedKey == "custom-errors")
            {
                return await RunCustomErrorsMutationAsync(site, action, fields);
            }

            if (normalizedKey == "aspnet-version")
            {
                return await RunAspNetVersionMutationAsync(connection, site, fields);
            }

            if (normalizedKey == "php-version")
            {
                return await RunPhpVersionMutationAsync(connection, site, fields);
            }

            if (normalizedKey == "php-settings")
            {
                return await RunPhpSettingsMutationAsync(connection, site, fields);
            }

            if (normalizedKey == "visitor-stats")
            {
                return await RunVisitorStatsMutationAsync(connection, site, action, fields);
            }

            if (normalizedKey == "iis-log-manager")
            {
                return await RunIisLogManagerMutationAsync(connection, site, action);
            }

            if (normalizedKey == "domain-manager")
            {
                return new HostingSiteFunctionMutationResponse(
                    false,
                    "Domain Manager writes are paused until the full classic DNS, mail cleanup, SSL cleanup, quota, and IIS binding chain is ported. No partial domain binding was attempted.",
                    new { legacySource = "/Users/erwinyu/Downloads/hosting/cp8/cp/domainbind_actions.asp" });
            }

            if (normalizedKey == "schedule-tasks")
            {
                return new HostingSiteFunctionMutationResponse(
                    false,
                    "Schedule Tasks are paused until the exact scheduletask connection string is available.",
                    new { legacySources = new[] { "/Users/erwinyu/Downloads/hosting/cp8/cp/task.asp", "/Users/erwinyu/Downloads/hosting/cp8/cp/task_action.asp", "/Users/erwinyu/Downloads/hosting/cp8/cp/taskremove.asp" } });
            }

            if (normalizedKey is "core-mode" or "detail-error" or "site-guard")
            {
                return await RunAspNetAppMutationAsync(connection, site, normalizedKey, action, fields);
            }

            var remote = BuildWebsiteFunctionRemoteAction(normalizedKey, site, action, fields);
            if (remote != null)
            {
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, remote.Path, remote.Form);
                return new HostingSiteFunctionMutationResponse(call.Success, call.Message, call);
            }

            return new HostingSiteFunctionMutationResponse(false, $"{spec.Label} still needs a whitelisted legacy action before it can write safely.", null);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunForceHttpsMutationAsync(SqlConnection connection, OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            var normalizedAction = NormalizeWebsiteAction(action);
            if (normalizedAction is not ("create" or "enable" or "delete" or "remove" or "disable"))
            {
                return new HostingSiteFunctionMutationResponse(false, "Force HTTPS supports only create/enable or delete/remove actions.", null);
            }

            var serverId = site.ServerId;
            var webConfigPath = (site.SitePath ?? "").Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(serverId) || string.IsNullOrWhiteSpace(webConfigPath))
            {
                return new HostingSiteFunctionMutationResponse(false, "Server ID or site path is missing for this website.", null);
            }

            var ruleName = SafeRewriteRuleName(FieldValue(fields, "ruleName", "httpTohttps"));
            if (string.IsNullOrWhiteSpace(ruleName))
            {
                return new HostingSiteFunctionMutationResponse(false, "Enter a safe redirect rule name.", null);
            }

            var sharedApi = GetLegacySharedApiSettings();
            var form = new Dictionary<string, string>
            {
                ["action"] = normalizedAction is "delete" or "remove" or "disable" ? "delete" : "create",
                ["webconfigPath"] = webConfigPath,
                ["rulename"] = ruleName,
                ["serverid"] = serverId
            };

            if (form["action"] == "create")
            {
                var fromDomain = FieldValue(fields, "fromDomain", FieldValue(fields, "domain", ""));
                var toDomain = FieldValue(fields, "toDomain", FieldValue(fields, "destination", ""));
                if (!IsSafeDomainForRewrite(fromDomain) || !IsSafeDomainForRewrite(toDomain))
                {
                    return new HostingSiteFunctionMutationResponse(false, "Enter safe source and destination domains for the redirect rule.", null);
                }

                var escapedFrom = fromDomain.Replace(".", "\\.", StringComparison.Ordinal);
                var httpValue = FieldBool(fields, "isSSL", false) ? "https://" : "http://";
                var ruleString = ruleName.Equals("httpTohttps", StringComparison.OrdinalIgnoreCase)
                    ? "<rule name=\"httpTohttps\" stopProcessing=\"true\"><match url=\"^(.*)$\" /><conditions><add input=\"{HTTPS}\" pattern=\"off\" ignoreCase=\"true\" /></conditions><action type=\"Redirect\" url=\"https://{HTTP_HOST}/{R:1}\" redirectType=\"Permanent\"  /></rule>"
                    : $"<rule name=\"{ruleName}\" stopProcessing=\"true\"><match url=\"^(.*)$\" /><conditions><add input=\"{{HTTP_HOST}}\" pattern=\"^{escapedFrom}$\" /></conditions><action type=\"Redirect\" url=\"{httpValue}{toDomain}/{{R:1}}\" redirectType=\"Permanent\"  /></rule>";

                form["ruleString"] = ruleString;

                var duplicate = await ExecuteScalarAsync<int>(connection, @"
SELECT COUNT(1)
FROM dbo.cp_config_redirect
WHERE site_uid = @siteUid AND rulename = @ruleName",
                    command =>
                    {
                        command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                        command.Parameters.AddWithValue("@ruleName", ruleName);
                    });
                if (duplicate > 0)
                {
                    return new HostingSiteFunctionMutationResponse(false, $"Redirect rule {ruleName} already exists for this site.", null);
                }

                var call = await PostLegacySharedApiAsync(sharedApi, "/api/redirect_api.asp", form);
                if (!call.Success || !call.Preview.Contains("Done.", StringComparison.OrdinalIgnoreCase))
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                await ExecuteNonQueryAsync(connection, @"
INSERT INTO dbo.cp_config_redirect (site_uid, domain, destination, rulename)
VALUES (@siteUid, @domain, @destination, @ruleName)",
                    command =>
                    {
                        command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                        command.Parameters.AddWithValue("@domain", fromDomain);
                        command.Parameters.AddWithValue("@destination", toDomain);
                        command.Parameters.AddWithValue("@ruleName", ruleName);
                    });

                return new HostingSiteFunctionMutationResponse(true, "Force HTTPS redirect rule created with the legacy shared redirect API.", call);
            }

            var deleteCall = await PostLegacySharedApiAsync(sharedApi, "/api/redirect_api.asp", form);
            var acceptedDelete = deleteCall.Success
                || deleteCall.Preview.Contains("Done.", StringComparison.OrdinalIgnoreCase)
                || deleteCall.Preview.Contains("a null-valued expression", StringComparison.OrdinalIgnoreCase)
                || string.IsNullOrWhiteSpace(deleteCall.Preview);
            if (!acceptedDelete)
            {
                return new HostingSiteFunctionMutationResponse(false, deleteCall.Message, deleteCall);
            }

            await ExecuteNonQueryAsync(connection, @"
DELETE FROM dbo.cp_config_redirect
WHERE site_uid = @siteUid AND rulename = @ruleName",
                command =>
                {
                    command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                    command.Parameters.AddWithValue("@ruleName", ruleName);
                });

            return new HostingSiteFunctionMutationResponse(true, "Force HTTPS redirect rule removed with the legacy shared redirect API.", deleteCall);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunIpDenyMutationAsync(OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            var normalizedAction = NormalizeWebsiteAction(action);
            var ipAddress = FieldValue(fields, "ipAddress", FieldValue(fields, "ip", ""));
            var subnetMask = FieldValue(fields, "subnetMask", FieldValue(fields, "mask", "255.255.255.255"));
            if (!IPAddress.TryParse(ipAddress, out _) || !IPAddress.TryParse(subnetMask, out _))
            {
                return new HostingSiteFunctionMutationResponse(false, "Enter a valid IP address and subnet mask.", null);
            }

            if (normalizedAction is "create" or "add" or "deny")
            {
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "set_ipSecurity_deny",
                    ["IIS_ID"] = FullIisId(site),
                    ["ipAddress"] = ipAddress,
                    ["subnetMask"] = subnetMask
                });
                return new HostingSiteFunctionMutationResponse(call.Success, call.Message, call);
            }

            if (normalizedAction is "remove" or "delete" or "allow")
            {
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "set_ipSecurity_remove",
                    ["IIS_ID"] = FullIisId(site),
                    ["ipAddress"] = ipAddress,
                    ["subnetMask"] = subnetMask
                });
                return new HostingSiteFunctionMutationResponse(call.Success, call.Message, call);
            }

            if (normalizedAction == "dynamicip")
            {
                return new HostingSiteFunctionMutationResponse(
                    false,
                    "Dynamic IP restriction settings are documented but paused until the exact active IIS API parameters are verified from the latest ASP source.",
                    new { legacySource = "/Users/erwinyu/Downloads/hosting/cp8/cp/ip_deny_action.asp" });
            }

            return new HostingSiteFunctionMutationResponse(false, "IP Deny supports add/create, remove/delete, or dynamicip actions.", null);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunCreateNetAppMutationAsync(SqlConnection connection, OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            var normalizedAction = NormalizeWebsiteAction(action);
            var appPath = NormalizeLegacyAppPath(FieldValue(fields, "appPath", ""));
            if (string.IsNullOrWhiteSpace(appPath))
            {
                return new HostingSiteFunctionMutationResponse(false, "Enter a safe application path under this website.", null);
            }

            if (normalizedAction is "delete" or "remove")
            {
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Member_App_Delete",
                    ["IIS_ID"] = FullIisId(site),
                    ["apppath"] = appPath
                });
                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                await DeleteSubAppInfoAsync(connection, site.SiteUid, appPath);
                return new HostingSiteFunctionMutationResponse(true, ".NET application removed and sub-application metadata cleaned.", call);
            }

            if (normalizedAction is not ("create" or "add"))
            {
                return new HostingSiteFunctionMutationResponse(false, ".NET App supports only create/add or delete/remove actions.", null);
            }

            var createCall = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
            {
                ["action"] = "IIS_Member_App_Create",
                ["IIS_ID"] = FullIisId(site),
                ["apppath"] = appPath
            });
            if (!createCall.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, createCall.Message, createCall);
            }

            var version = FieldValue(fields, "pDotNetVersion", FieldValue(fields, "version", "4.x"));
            await SetSubAppInfoAsync(connection, site.SiteUid, appPath, "version", version);
            return new HostingSiteFunctionMutationResponse(true, ".NET application created and sub-application metadata updated.", createCall);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunVirtualDirMutationAsync(SqlConnection connection, OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            var normalizedAction = NormalizeWebsiteAction(action);
            var vdirName = NormalizeVirtualDirName(FieldValue(fields, "vdirname", FieldValue(fields, "virtualPath", "")));
            if (string.IsNullOrWhiteSpace(vdirName))
            {
                return new HostingSiteFunctionMutationResponse(false, "Enter a safe virtual directory name without slashes.", null);
            }

            if (normalizedAction is "delete" or "remove")
            {
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Member_VD_Delete",
                    ["IIS_ID"] = FullIisId(site),
                    ["vdirName"] = vdirName
                });
                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                await DeleteSubAppInfoAsync(connection, site.SiteUid, vdirName);
                return new HostingSiteFunctionMutationResponse(true, "Virtual directory removed and metadata cleaned.", call);
            }

            if (normalizedAction is not ("create" or "add"))
            {
                return new HostingSiteFunctionMutationResponse(false, "Virtual Dir supports only create/add or delete/remove actions.", null);
            }

            var customerRoot = $@"h:\root\home\{site.CpLogin}\www";
            var requestedPath = FieldValue(fields, "physicalPath", FieldValue(fields, "vdpath", customerRoot));
            var path = NormalizeOwnedHostingAbsolutePath(requestedPath, site.CpLogin);
            if (!path.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, path.Message, null);
            }

            var isApp = FieldBool(fields, "isapp", false);
            var callCreate = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
            {
                ["action"] = "IIS_Member_VD_Create",
                ["isapp"] = isApp ? "1" : "0",
                ["IIS_ID"] = FullIisId(site),
                ["vdirName"] = vdirName,
                ["vdpath"] = path.Path
            });
            if (!callCreate.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, callCreate.Message, callCreate);
            }

            if (isApp)
            {
                await SetSubAppInfoAsync(connection, site.SiteUid, vdirName, "version", "4.x");
            }

            return new HostingSiteFunctionMutationResponse(true, "Virtual directory created with the legacy IIS API.", callCreate);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunCustomErrorsMutationAsync(OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            var statusCode = FieldValue(fields, "errorType", FieldValue(fields, "statusCode", "404"));
            if (!int.TryParse(statusCode, NumberStyles.Integer, CultureInfo.InvariantCulture, out var code) || code is < 400 or > 599)
            {
                return new HostingSiteFunctionMutationResponse(false, "Enter a valid HTTP error status code between 400 and 599.", null);
            }

            var useDefault = NormalizeWebsiteAction(action) is "default" or "reset" || FieldBool(fields, "defaultError", false);
            var filePath = NormalizeIisAppPath(FieldValue(fields, "filepath", FieldValue(fields, "path", "/404.html")));
            if (!useDefault && !IsSafeIisRelativeFilePath(filePath))
            {
                return new HostingSiteFunctionMutationResponse(false, "Enter a safe website-relative error page path.", null);
            }

            var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
            {
                ["action"] = "IIS_Member_ErrorPage_Edit",
                ["IIS_ID"] = FullIisId(site),
                ["errorType"] = code.ToString(CultureInfo.InvariantCulture),
                ["filepath"] = useDefault ? "" : filePath,
                ["defaultError"] = useDefault ? "1" : "0"
            });

            return new HostingSiteFunctionMutationResponse(call.Success, call.Success ? "Custom error page setting updated with the legacy IIS API." : call.Message, call);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunAspNetVersionMutationAsync(SqlConnection connection, OwnedHostingSite site, Dictionary<string, string> fields)
        {
            var appPath = NormalizeIisAppPath(FieldValue(fields, "appPath", "/"));
            var version = NormalizeAspNetVersion(FieldValue(fields, "version", FieldValue(fields, "newversion", "v4.0")));
            var pipeline = NormalizePipelineMode(FieldValue(fields, "pipeline", FieldValue(fields, "Classicmode", "Integrated")));
            if (string.IsNullOrWhiteSpace(version))
            {
                return new HostingSiteFunctionMutationResponse(false, "Choose a supported ASP.NET version.", null);
            }

            var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
            {
                ["action"] = "IIS_Member_DotNetVersion_Edit_No_Mapping",
                ["IIS_ID"] = FullIisId(site),
                ["AppPath"] = appPath,
                ["newversion"] = version,
                ["Classicmode"] = pipeline
            });
            if (!call.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, call.Message, call);
            }

            if (appPath == "/")
            {
                var display = version.Contains("2", StringComparison.OrdinalIgnoreCase) ? "2/3.5" : version.Contains("1", StringComparison.OrdinalIgnoreCase) ? "1.x" : "4.x";
                display += pipeline.Equals("Classic", StringComparison.OrdinalIgnoreCase) ? "(c)" : "(i)";
                await ExecuteNonQueryAsync(connection, "UPDATE dbo.cp_config_sites SET version = @version WHERE site_uid = @siteUid AND cpID = @cpId", command =>
                {
                    command.Parameters.AddWithValue("@version", display);
                    command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                    command.Parameters.AddWithValue("@cpId", site.CpId);
                });
            }
            else
            {
                await SetSubAppInfoAsync(connection, site.SiteUid, appPath, "version", version);
            }

            return new HostingSiteFunctionMutationResponse(true, "ASP.NET version updated with the legacy IIS API.", call);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunPhpVersionMutationAsync(SqlConnection connection, OwnedHostingSite site, Dictionary<string, string> fields)
        {
            var phpVersionIndex = NormalizePhpVersionIndex(FieldValue(fields, "phpversion", FieldValue(fields, "phpVersion", "")));
            if (phpVersionIndex <= 0)
            {
                return new HostingSiteFunctionMutationResponse(false, "Choose a supported PHP version.", null);
            }

            var removeCall = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
            {
                ["action"] = "IIS_Member_IISEntry_CustomScriptMap_Remove",
                ["IIS_ID"] = FullIisId(site),
                ["TagName"] = "Custom-PHP5-FastCGI-php"
            });
            if (!removeCall.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, removeCall.Message, removeCall);
            }

            var addCall = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
            {
                ["action"] = "IIS_Member_IISEntry_CustomScriptMap_Add",
                ["IIS_ID"] = FullIisId(site),
                ["scriptTypeIndex"] = phpVersionIndex.ToString(CultureInfo.InvariantCulture),
                ["extension"] = "php"
            });
            if (!addCall.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, addCall.Message, addCall);
            }

            await ExecuteNonQueryAsync(connection, "UPDATE dbo.cp_config_sites SET version = 'v1.x(i)', phpversion = @phpVersion WHERE site_uid = @siteUid AND cpID = @cpId", command =>
            {
                command.Parameters.AddWithValue("@phpVersion", PhpDisplayVersion(phpVersionIndex));
                command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                command.Parameters.AddWithValue("@cpId", site.CpId);
            });

            return new HostingSiteFunctionMutationResponse(true, "PHP version updated with the legacy ScriptMap API.", new { remove = removeCall, add = addCall });
        }

        private async Task<HostingSiteFunctionMutationResponse> RunPhpSettingsMutationAsync(SqlConnection connection, OwnedHostingSite site, Dictionary<string, string> fields)
        {
            var settings = FieldValue(fields, "phpsettings", FieldValue(fields, "settings", ""));
            if (string.IsNullOrWhiteSpace(settings) || settings.Length > 12000)
            {
                return new HostingSiteFunctionMutationResponse(false, "PHP settings content is empty or too large.", null);
            }

            var cp = new SelectedHostingCp(site.CpId, site.CpLogin, site.ServerId, site.WebHostType);
            var path = NormalizeOwnedFileManagerPath(site.SitePath, BuildHostingHomePath(cp));
            if (!path.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, path.Message, null);
            }

            var fileRequest = new HostingFileManagerActionRequest(site.CpId, "save-file", path.Path, ".user.ini", "", ".user.ini", true, settings, "utf-8");
            var result = await RunFileManagerActionAsync(connection, cp, fileRequest);
            return new HostingSiteFunctionMutationResponse(result.Success, result.Success ? "PHP settings saved to .user.ini." : result.Message, result);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunVisitorStatsMutationAsync(SqlConnection connection, OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            if (site.IsSubdomain)
            {
                return new HostingSiteFunctionMutationResponse(false, "Visitor stats are not available for sub-sites in the classic panel.", null);
            }

            var normalizedAction = NormalizeWebsiteAction(action);
            var enable = normalizedAction is "enable" or "on";
            var disable = normalizedAction is "disable" or "off";
            if (!enable && !disable)
            {
                return new HostingSiteFunctionMutationResponse(false, "Visitor Stats supports only enable/on or disable/off actions.", null);
            }

            var mainDomain = FieldValue(fields, "mainDomain", FieldValue(fields, "domain", ""));
            if (!IsSafeDomainForRewrite(mainDomain))
            {
                return new HostingSiteFunctionMutationResponse(false, "Choose a safe primary domain for visitor stats.", null);
            }

            var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/WebStats_api.asp", new Dictionary<string, string>
            {
                ["action"] = enable ? "Enable" : "Disable",
                ["serverID"] = site.ServerId,
                ["cpID"] = site.CpId.ToString(CultureInfo.InvariantCulture),
                ["iis_ID"] = site.IisId,
                ["Domain"] = mainDomain,
                ["cpLogin"] = site.CpLogin,
                ["pwd"] = "",
                ["path"] = ""
            });
            if (!call.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, call.Message, call);
            }

            await ExecuteNonQueryAsync(connection, @"
UPDATE dbo.cp_config_sites
SET Stats_enabled = @enabled, Stats_mainDomain = @mainDomain
WHERE site_uid = @siteUid AND cpID = @cpId",
                command =>
                {
                    command.Parameters.AddWithValue("@enabled", enable);
                    command.Parameters.AddWithValue("@mainDomain", mainDomain);
                    command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                    command.Parameters.AddWithValue("@cpId", site.CpId);
                });

            LegacyAgentCallResult? mkdirCall = null;
            if (enable)
            {
                var statsPath = $@"H:\root\home\{site.CpLogin}\stats\{site.SiteName}";
                mkdirCall = await PostLegacyRemoteCommandAsync(
                    GetLegacyAgentSettings(),
                    GetLegacyRemoteCommandSettings(),
                    site.ServerId,
                    await LoadCustomerIdForCpAsync(connection, site.CpId),
                    $"cmd /c mkdir {statsPath}");
            }

            return new HostingSiteFunctionMutationResponse(true, enable ? "Visitor stats enabled." : "Visitor stats disabled.", new { stats = call, statsFolder = mkdirCall });
        }

        private async Task<HostingSiteFunctionMutationResponse> RunIisLogManagerMutationAsync(SqlConnection connection, OwnedHostingSite site, string action)
        {
            var normalizedAction = NormalizeWebsiteAction(action);
            if (normalizedAction is not ("download" or "copy" or "export"))
            {
                return new HostingSiteFunctionMutationResponse(false, "IIS Log Manager supports only the classic download/export action.", null);
            }

            var customerId = await LoadCustomerIdForCpAsync(connection, site.CpId);
            var w3svcId = $"{site.CpId}{FormatIisId(site.IisId)}";
            var command = $@"xcopy c:\logfiles\W3SVC{w3svcId}\*.log h:\root\home\{site.CpLogin}\www\db\{w3svcId}\ /y";
            var call = await PostLegacyRemoteCommandAsync(GetLegacyAgentSettings(), GetLegacyRemoteCommandSettings(), site.ServerId, customerId, command);
            return new HostingSiteFunctionMutationResponse(
                call.Success,
                call.Success ? $"All IIS Raw Log files were moved to /db/{w3svcId}." : call.Message,
                new { w3svcId, command, call });
        }

        private async Task<HostingSiteFunctionMutationResponse> RunAspNetAppMutationAsync(SqlConnection connection, OwnedHostingSite site, string key, string action, Dictionary<string, string> fields)
        {
            var appPath = NormalizeIisAppPath(FieldValue(fields, "appPath", "/"));
            if (appPath == "/")
            {
                appPath = "";
            }

            if (key == "core-mode")
            {
                var mode = FieldValue(fields, "hostingModel", FieldValue(fields, "mode", "OutOfProcess"));
                mode = mode.Equals("InProcess", StringComparison.OrdinalIgnoreCase) ? "InProcess" : "OutOfProcess";
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "set_HostingModel",
                    ["IIS_ID"] = FullIisId(site),
                    ["Mode"] = mode,
                    ["apppath"] = appPath
                });

                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                var restart = await RestartSitePoolViaRemoteCommandAsync(connection, site);
                return new HostingSiteFunctionMutationResponse(true, $"Core hosting model set to {mode}.", new { legacy = call, restart });
            }

            if (key == "detail-error")
            {
                var enabled = FieldBool(fields, "enabled", !action.Equals("disable", StringComparison.OrdinalIgnoreCase));
                var mode = enabled ? "Off" : "On";
                var settingBit = enabled ? 1 : 0;
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "set_customErrors_Mode",
                    ["IIS_ID"] = FullIisId(site),
                    ["Mode"] = mode,
                    ["apppath"] = appPath
                });
                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                if (string.IsNullOrWhiteSpace(appPath))
                {
                    await ExecuteNonQueryAsync(connection, "UPDATE dbo.cp_config_Sites SET detailerror = @enabled WHERE cpID = @cpId AND site_Uid = @siteUid", command =>
                    {
                        command.Parameters.AddWithValue("@enabled", settingBit);
                        command.Parameters.AddWithValue("@cpId", site.CpId);
                        command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                    });
                }

                var restart = await RestartSitePoolViaRemoteCommandAsync(connection, site);
                return new HostingSiteFunctionMutationResponse(true, enabled ? "Detailed errors enabled." : "Detailed errors disabled.", new { legacy = call, restart });
            }

            if (key == "site-guard")
            {
                var enabled = FieldBool(fields, "enabled", !action.Equals("disable", StringComparison.OrdinalIgnoreCase));
                var fwAction = enabled ? "enableFW" : "disableFW";
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Filter_webknight",
                    ["IIS_ID"] = FullIisId(site),
                    ["FW_Action"] = fwAction
                });
                if (!call.Success || !call.Preview.Trim().Equals("OK", StringComparison.OrdinalIgnoreCase))
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Success ? $"Site Guard agent returned unexpected response: {call.Preview}" : call.Message, call);
                }

                if (string.IsNullOrWhiteSpace(appPath))
                {
                    await ExecuteNonQueryAsync(connection, "UPDATE dbo.cp_config_Sites SET webknight = @enabled WHERE cpID = @cpId AND site_Uid = @siteUid", command =>
                    {
                        command.Parameters.AddWithValue("@enabled", enabled ? 1 : 0);
                        command.Parameters.AddWithValue("@cpId", site.CpId);
                        command.Parameters.AddWithValue("@siteUid", site.SiteUid);
                    });
                }

                return new HostingSiteFunctionMutationResponse(true, enabled ? "Site Guard enabled." : "Site Guard disabled.", call);
            }

            return new HostingSiteFunctionMutationResponse(false, "Unsupported ASP.NET app action.", null);
        }

        private async Task<LegacyAgentCallResult> RestartSitePoolViaRemoteCommandAsync(SqlConnection connection, OwnedHostingSite site)
        {
            var poolName = await LoadPoolNameAsync(connection, site.CpId, ParseInt(site.PoolId));
            if (string.IsNullOrWhiteSpace(poolName))
            {
                return new LegacyAgentCallResult(false, "No application pool is assigned to this site.", "", "", null);
            }

            var customerId = await LoadCustomerIdByCpIdAsync(connection, site.CpId);
            if (customerId <= 0)
            {
                return new LegacyAgentCallResult(false, "Unable to resolve customer ID for remote command token.", "", "", null);
            }

            var command = $"powershell Get-Process -IncludeUserName | Where UserName -like '*{poolName}' | Stop-Process -force";
            return await PostLegacyRemoteCommandAsync(GetLegacyAgentSettings(), GetLegacyRemoteCommandSettings(), site.ServerId, customerId, command);
        }

        private async Task<HostingSiteFunctionMutationResponse> RunMappedPathMutationAsync(SqlConnection connection, OwnedHostingSite site, Dictionary<string, string> fields)
        {
            var requestedPath = FieldValue(fields, "target", FieldValue(fields, "sitePath", FieldValue(fields, "path", "")));
            var normalizedPath = NormalizeOwnedHostingAbsolutePath(requestedPath, site.CpLogin);
            if (!normalizedPath.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, normalizedPath.Message, null);
            }

            if (normalizedPath.Path.Contains(@"\ ", StringComparison.Ordinal) || normalizedPath.Path.Contains(@" \", StringComparison.Ordinal))
            {
                return new HostingSiteFunctionMutationResponse(false, "Mapped path cannot contain leading or trailing spaces around folder separators.", null);
            }

            var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
            {
                ["action"] = "IIS_Member_Binding_Path_Change",
                ["IIS_ID"] = FullIisId(site),
                ["site_path"] = normalizedPath.Path
            });

            if (!call.Success || !call.Preview.Trim().Equals("OK", StringComparison.OrdinalIgnoreCase))
            {
                return new HostingSiteFunctionMutationResponse(false, call.Success ? $"Legacy IIS path change returned unexpected response: {call.Preview}" : call.Message, call);
            }

            await using (var updateCommand = new SqlCommand(@"
UPDATE dbo.cp_config_Sites
SET site_path = @sitePath
WHERE site_Uid = @siteUid AND cpID = @cpId", connection))
            {
                updateCommand.Parameters.AddWithValue("@sitePath", normalizedPath.Path);
                updateCommand.Parameters.AddWithValue("@siteUid", site.SiteUid);
                updateCommand.Parameters.AddWithValue("@cpId", site.CpId);
                await updateCommand.ExecuteNonQueryAsync();
            }

            var poolName = await LoadPoolNameAsync(connection, site.CpId, ParseInt(site.PoolId));
            HostingWorkqueueResponse? poolQueue = null;
            if (!string.IsNullOrWhiteSpace(poolName))
            {
                await DeletePendingPoolChangeAsync(connection, site.CpLogin, site.SiteName);
                poolQueue = await CreateHostingWorkqueueAsync(connection, new SelectedHostingCp(site.CpId, site.CpLogin, site.ServerId, site.WebHostType), new HostingWorkqueueRequest(
                    site.CpId,
                    "changepool",
                    normalizedPath.Path,
                    poolName,
                    site.ServerId,
                    site.PoolId,
                    site.SiteName,
                    poolName));
            }

            return new HostingSiteFunctionMutationResponse(true, "Mapped path updated in IIS and account data.", new
            {
                site.SiteUid,
                sitePath = normalizedPath.Path,
                legacy = call,
                poolQueue
            });
        }

        private async Task<HostingSiteFunctionMutationResponse> RunApplicationPoolMutationAsync(SqlConnection connection, OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            var normalizedAction = NormalizeWebsiteAction(action);
            var poolId = ParseInt(FieldValue(fields, "poolId", site.PoolId));
            if (poolId <= 0)
            {
                return new HostingSiteFunctionMutationResponse(false, "Application Pool needs a valid poolId.", null);
            }

            var pool = await LoadOwnedPoolAsync(connection, site.CpId, poolId);
            if (pool == null)
            {
                return new HostingSiteFunctionMutationResponse(false, "Application Pool not found for this hosting plan.", null);
            }

            if (normalizedAction is "create" or "createpool")
            {
                var queue = await CreateHostingWorkqueueAsync(connection, new SelectedHostingCp(site.CpId, site.CpLogin, site.ServerId, site.WebHostType), new HostingWorkqueueRequest(
                    site.CpId,
                    "createpool",
                    "createpool",
                    pool.Name,
                    site.ServerId,
                    "",
                    site.SiteName,
                    "application-pool"));
                return new HostingSiteFunctionMutationResponse(queue.Success, queue.Message, queue);
            }

            if (normalizedAction is "change" or "changepool")
            {
                await DeletePendingPoolChangeAsync(connection, site.CpLogin, site.SiteName);
                var queue = await CreateHostingWorkqueueAsync(connection, new SelectedHostingCp(site.CpId, site.CpLogin, site.ServerId, site.WebHostType), new HostingWorkqueueRequest(
                    site.CpId,
                    "changepool",
                    site.SitePath,
                    pool.Name,
                    site.ServerId,
                    pool.Id.ToString(CultureInfo.InvariantCulture),
                    site.SiteName,
                    await LoadPoolNameAsync(connection, site.CpId, ParseInt(site.PoolId))));
                return new HostingSiteFunctionMutationResponse(queue.Success, queue.Message, queue);
            }

            if (normalizedAction is "start" or "stop" or "restart" or "recycle")
            {
                var agentAction = normalizedAction switch
                {
                    "start" => "IIS_Pools_AppPool_Start",
                    "stop" => "IIS_Pools_AppPool_Stop",
                    _ => "IIS_Pools_AppPool_Recycle"
                };
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = agentAction,
                    ["AppPoolName"] = pool.Name
                });
                if (!call.Success || !call.Preview.Contains("OK", StringComparison.OrdinalIgnoreCase))
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Success ? $"Application Pool agent returned unexpected response: {call.Preview}" : call.Message, call);
                }

                HostingWorkqueueResponse? repairQueue = null;
                if (normalizedAction == "start")
                {
                    await DeletePendingCreatePoolAsync(connection, site.CpLogin, pool.Name);
                    repairQueue = await CreateHostingWorkqueueAsync(connection, new SelectedHostingCp(site.CpId, site.CpLogin, site.ServerId, site.WebHostType), new HostingWorkqueueRequest(
                        site.CpId,
                        "createpool",
                        "createpool",
                        pool.Name,
                        site.ServerId,
                        "",
                        site.SiteName,
                        "application-pool"));
                }

                return new HostingSiteFunctionMutationResponse(true, $"Application Pool {normalizedAction} completed.", new { legacy = call, repairQueue });
            }

            if (normalizedAction is "update-pool-ram" or "memory" or "ram")
            {
                var memory = ClampInt(FieldValue(fields, "memory", FieldValue(fields, "newspace", pool.PrivateMemoryMb.ToString(CultureInfo.InvariantCulture))), 256, 40960, pool.PrivateMemoryMb);
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Pools_AppPool_Memory",
                    ["AppPoolName"] = pool.Name,
                    ["memory"] = memory.ToString(CultureInfo.InvariantCulture),
                    ["privateMemory"] = memory.ToString(CultureInfo.InvariantCulture)
                });
                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                await ExecuteNonQueryAsync(connection, "UPDATE dbo.cp_config_Pools SET privateMemory = @memory WHERE cpID = @cpId AND pool_id = @poolId", command =>
                {
                    command.Parameters.AddWithValue("@memory", memory);
                    command.Parameters.AddWithValue("@cpId", site.CpId);
                    command.Parameters.AddWithValue("@poolId", pool.Id);
                });
                return new HostingSiteFunctionMutationResponse(true, "Application Pool RAM updated.", new { legacy = call, memory });
            }

            if (normalizedAction is "32-bit" or "enable-32-bit" or "64-bit" or "disable-32-bit")
            {
                var enable32Bit = normalizedAction is "32-bit" or "enable-32-bit";
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Pools_AppPool_Edit",
                    ["AppPoolName"] = pool.Name,
                    ["Properties"] = "enable32BitAppOnWin64",
                    ["Value"] = enable32Bit ? "True" : "False"
                });
                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                await ExecuteNonQueryAsync(connection, "UPDATE dbo.cp_config_Pools SET enable32BitAppOnWin64 = @enabled WHERE cpID = @cpId AND pool_id = @poolId", command =>
                {
                    command.Parameters.AddWithValue("@enabled", enable32Bit);
                    command.Parameters.AddWithValue("@cpId", site.CpId);
                    command.Parameters.AddWithValue("@poolId", pool.Id);
                });
                return new HostingSiteFunctionMutationResponse(true, enable32Bit ? "Application Pool changed to 32-bit." : "Application Pool changed to 64-bit.", call);
            }

            if (normalizedAction is "enable-load-user-profile" or "disable-load-user-profile")
            {
                var enabled = normalizedAction == "enable-load-user-profile";
                var call = await PostLegacyAgentAsync(GetLegacyAgentSettings(), site.ServerId, "/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Pools_AppPool_processModel_Edit",
                    ["AppPoolName"] = pool.Name,
                    ["Properties"] = "loadUserProfile",
                    ["Value"] = enabled ? "True" : "False"
                });
                if (!call.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, call.Message, call);
                }

                await ExecuteNonQueryAsync(connection, "UPDATE dbo.cp_config_Pools SET loadUserProfile = @enabled WHERE cpID = @cpId AND pool_id = @poolId", command =>
                {
                    command.Parameters.AddWithValue("@enabled", enabled);
                    command.Parameters.AddWithValue("@cpId", site.CpId);
                    command.Parameters.AddWithValue("@poolId", pool.Id);
                });
                return new HostingSiteFunctionMutationResponse(true, enabled ? "Load User Profile enabled." : "Load User Profile disabled.", call);
            }

            return new HostingSiteFunctionMutationResponse(false, "Unsupported Application Pool action.", new
            {
                supportedActions = new[] { "create", "change", "start", "stop", "recycle", "ram", "enable-32-bit", "disable-32-bit", "enable-load-user-profile", "disable-load-user-profile" }
            });
        }

        private async Task<HostingSiteFunctionMutationResponse> RunWebDeployMutationAsync(OwnedHostingSite site, string action)
        {
            if (action.Equals("fix-acl", StringComparison.OrdinalIgnoreCase) || action.Equals("fixacl", StringComparison.OrdinalIgnoreCase))
            {
                var call = await PostLegacySharedApiAsync(GetLegacySharedApiSettings(), "/tools/resetDefaultPermissionsBySiteUid.asp", new Dictionary<string, string>
                {
                    ["site_Uid"] = site.SiteUid.ToString(CultureInfo.InvariantCulture)
                });

                return new HostingSiteFunctionMutationResponse(call.Success, call.Success ? "Fix ACL request submitted." : call.Message, call);
            }

            return new HostingSiteFunctionMutationResponse(
                false,
                "WebDeploy/Remote IIS enable and disable are paused until Persits-compatible decryptpwd is implemented for cpPasswordHash. The classic action needs the decrypted hosting password before calling SetIISManagerUser.",
                new
                {
                    legacySource = "/Users/erwinyu/Downloads/hosting/cp8/cp/iis_manager_webdeploy_action.asp",
                    site.SiteUid,
                    siteName = $"{site.CpLogin}-{site.SiteName}"
                });
        }

        private async Task<HostingSiteFunctionMutationResponse> RunOutgoingPortMutationAsync(SqlConnection connection, OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            var remove = action.Equals("remove", StringComparison.OrdinalIgnoreCase) || action.Equals("delete", StringComparison.OrdinalIgnoreCase);
            var ip = FieldValue(fields, "ip", "");
            var portText = FieldValue(fields, "port", "");
            if (!IPAddress.TryParse(ip, out _) || !int.TryParse(portText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var port) || port is < 1 or > 65535)
            {
                return new HostingSiteFunctionMutationResponse(false, "Enter a valid remote IP address and TCP port.", null);
            }

            if (remove)
            {
                if (!long.TryParse(FieldValue(fields, "ipid", "0"), NumberStyles.Integer, CultureInfo.InvariantCulture, out var ipId) || ipId <= 0)
                {
                    return new HostingSiteFunctionMutationResponse(false, "Outgoing port delete needs the ipid from the existing rule row.", null);
                }

                var ruleName = FieldValue(fields, "rulename", "");
                if (!ruleName.Contains(site.CpLogin, StringComparison.OrdinalIgnoreCase))
                {
                    return new HostingSiteFunctionMutationResponse(false, "Outgoing port rule name does not belong to this hosting account.", null);
                }

                var deleteCall = await PostLegacySharedApiAsync(GetLegacySharedApiSettings(), "/api/firewall_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "del_rule",
                    ["ServerID"] = site.ServerId,
                    ["IP"] = ip,
                    ["port"] = port.ToString(CultureInfo.InvariantCulture),
                    ["rulename"] = ruleName
                });
                if (!deleteCall.Success)
                {
                    return new HostingSiteFunctionMutationResponse(false, deleteCall.Message, deleteCall);
                }

                await using var deleteCommand = new SqlCommand("DELETE FROM dbo.cp_config_db_out_ip WHERE ipid = @ipId AND cpID = @cpId", connection);
                deleteCommand.Parameters.AddWithValue("@ipId", ipId);
                deleteCommand.Parameters.AddWithValue("@cpId", site.CpId);
                await deleteCommand.ExecuteNonQueryAsync();
                return new HostingSiteFunctionMutationResponse(true, "Outgoing port rule deleted.", deleteCall);
            }

            await using var quotaCommand = new SqlCommand(@"
SELECT COUNT(1)
FROM dbo.cp_config_db_out_ip
WHERE cpID = @cpId", connection);
            quotaCommand.Parameters.AddWithValue("@cpId", site.CpId);
            var existingCount = Convert.ToInt32(await quotaCommand.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            var quota = site.CpLogin.Equals("hiemedia-001", StringComparison.OrdinalIgnoreCase) ? 200 : 100;
            if (existingCount >= quota)
            {
                return new HostingSiteFunctionMutationResponse(false, $"Outgoing port quota reached ({quota}).", null);
            }

            var ruleNameToAdd = $"{site.CpLogin}-{GenerateResetToken()[..4].ToLowerInvariant()}";
            var addCall = await PostLegacySharedApiAsync(GetLegacySharedApiSettings(), "/api/firewall_api.asp", new Dictionary<string, string>
            {
                ["action"] = "add_rule",
                ["ServerID"] = site.ServerId,
                ["IP"] = ip,
                ["port"] = port.ToString(CultureInfo.InvariantCulture),
                ["rulename"] = ruleNameToAdd
            });
            if (!addCall.Success)
            {
                return new HostingSiteFunctionMutationResponse(false, addCall.Message, addCall);
            }

            await using var insertCommand = new SqlCommand(@"
INSERT INTO dbo.cp_config_db_out_ip (cpid, remoteip, port, adddate, rulename)
VALUES (@cpId, @ip, @port, GETDATE(), @ruleName)", connection);
            insertCommand.Parameters.AddWithValue("@cpId", site.CpId);
            insertCommand.Parameters.AddWithValue("@ip", ip);
            insertCommand.Parameters.AddWithValue("@port", port);
            insertCommand.Parameters.AddWithValue("@ruleName", ruleNameToAdd);
            await insertCommand.ExecuteNonQueryAsync();
            return new HostingSiteFunctionMutationResponse(true, "Outgoing port rule added.", addCall);
        }

        private static async Task<List<Dictionary<string, object?>>> TryLoadFunctionRowsAsync(SqlConnection connection, List<string> warnings, string label, string sql, Action<SqlCommand> addParameters)
        {
            var rows = new List<Dictionary<string, object?>>();
            try
            {
                await using var command = new SqlCommand(sql, connection);
                addParameters(command);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
                    for (var i = 0; i < reader.FieldCount; i++)
                    {
                        row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    }
                    rows.Add(row);
                }
            }
            catch (SqlException ex)
            {
                warnings.Add($"Unable to load {label}: {ex.Message}");
            }

            return rows;
        }

        private static async Task<string> LoadPoolNameAsync(SqlConnection connection, long cpId, int poolId)
        {
            if (poolId <= 0)
            {
                return "";
            }

            await using var command = new SqlCommand(@"
SELECT TOP 1 pool_name
FROM dbo.cp_config_Pools
WHERE cpID = @cpId AND pool_id = @poolId", connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            command.Parameters.AddWithValue("@poolId", poolId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
        }

        private static async Task<OwnedApplicationPool?> LoadOwnedPoolAsync(SqlConnection connection, long cpId, int poolId)
        {
            if (poolId <= 0)
            {
                return null;
            }

            await using var command = new SqlCommand(@"
SELECT TOP 1 pool_id,
       ISNULL(pool_name, ''),
       ISNULL(privateMemory, 0),
       ISNULL(pool_version, ''),
       ISNULL(enable32BitAppOnWin64, 0),
       ISNULL(loadUserProfile, 0)
FROM dbo.cp_config_Pools
WHERE cpID = @cpId AND pool_id = @poolId", connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            command.Parameters.AddWithValue("@poolId", poolId);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            return new OwnedApplicationPool(
                reader.GetInt32(0),
                reader.GetString(1).Trim(),
                reader.GetInt32(2),
                reader.GetString(3).Trim(),
                reader.GetBoolean(4),
                reader.GetBoolean(5));
        }

        private static async Task DeletePendingPoolChangeAsync(SqlConnection connection, string cpLogin, string siteName)
        {
            await using var command = new SqlCommand(@"
DELETE FROM dbo.workqueue
WHERE type = 'changepool'
  AND ISNULL(status, 0) = 0
  AND siteowner = @siteName
  AND cplogin = @cpLogin", connection);
            command.Parameters.AddWithValue("@siteName", siteName);
            command.Parameters.AddWithValue("@cpLogin", cpLogin);
            await command.ExecuteNonQueryAsync();
        }

        private static async Task DeletePendingCreatePoolAsync(SqlConnection connection, string cpLogin, string poolName)
        {
            await using var command = new SqlCommand(@"
DELETE FROM dbo.workqueue
WHERE type = 'createpool'
  AND ISNULL(status, 0) = 0
  AND dstfolder = @poolName
  AND cplogin = @cpLogin", connection);
            command.Parameters.AddWithValue("@poolName", poolName);
            command.Parameters.AddWithValue("@cpLogin", cpLogin);
            await command.ExecuteNonQueryAsync();
        }

        private static string NormalizeWebsiteFunctionKey(string value)
        {
            var key = (value ?? "").Trim().ToLowerInvariant();
            return key switch
            {
                "site name" => "site-name",
                "mapped path" => "mapped-path",
                "asp.net version" => "aspnet-version",
                ".net core mode" => "core-mode",
                "node.js app" => "nodejs-app",
                "php version" => "php-version",
                "php settings" => "php-settings",
                "detail error" => "detail-error",
                "site on/off" => "site-on-off",
                "delete website" => "delete-website",
                "domain manager" => "domain-manager",
                "visitor stats" => "visitor-stats",
                "ftp access" => "ftp-access",
                "vs webdeploy" => "vs-webdeploy",
                "github deploy" => "github-deploy",
                "smtp sample code" => "smtp-sample-code",
                "ip deny" => "ip-deny",
                "iis log manager" => "iis-log-manager",
                "application pool 🔥" => "application-pool",
                "application pool" => "application-pool",
                "outgoing port" => "outgoing-port",
                "create .net app" => "create-net-app",
                "create virtual dir" => "virtual-dir",
                "force https" => "force-https",
                "default doc" => "default-doc",
                "custom errors" => "custom-errors",
                "mime type" => "mime-type",
                "scriptmap" => "script-map",
                "remote iis manager" => "remote-iis-manager",
                "site guard" => "site-guard",
                "schedule tasks" => "schedule-tasks",
                _ => key.Replace(" ", "-", StringComparison.Ordinal)
            };
        }

        private static WebsiteFunctionSpec GetWebsiteFunctionSpec(string key)
        {
            var map = new Dictionary<string, WebsiteFunctionSpec>(StringComparer.OrdinalIgnoreCase)
            {
                ["site-name"] = new("Site Name", "Settings", "includes/website_name_edit.asp", "/iis_api.asp action=IIS_Member_IISEntry_SITENAME_EDIT", "Edit the IIS website display name and the account-panel display name.", true, true, new List<string> { "siteName" }),
                ["mapped-path"] = new("Mapped Path", "Settings", "treepick.asp + domainbind_actions.asp?action=updatesitepath", "direct site path update; changepool only as specific legacy side effect", "Change the website physical path inside this hosting account.", true, true, new List<string> { "source", "target" }),
                ["aspnet-version"] = new("ASP.NET Version", "Settings", "domainbind_version_change.asp", "aspnetapp_action.asp", "Review or change ASP.NET runtime settings.", true, true, new List<string> { "version", "pipeline" }),
                ["core-mode"] = new(".NET Core Mode", "Settings", "boxinfo_core_mode.asp", "aspnetapp_action.asp?action=set_HostingModel", "Review or change .NET Core hosting model.", true, true, new List<string> { "hostingModel" }),
                ["nodejs-app"] = new("Node.js App", "Settings", "boxinfo_nodejs.asp", "nodejs_action.asp + workqueue type=nodejs", "Configure Node.js worker and rewrite settings.", true, true, new List<string> { "entryPoint", "port" }),
                ["php-version"] = new("PHP Version", "Settings", "boxinfo_php_version.asp", "aspnetapp_action.asp?action=editversion", "Review or change PHP runtime mapping.", true, true, new List<string> { "phpVersion" }),
                ["php-settings"] = new("PHP Settings", "Settings", "boxinfo_php_settings.asp", "php_settings_action.asp + /newfileman/save.asp", "Edit php.ini style settings for this site.", true, true, new List<string> { "setting", "value" }),
                ["detail-error"] = new("Detail Error", "Settings", "boxinfo_detailerror.asp", "aspnetapp_action.asp?action=detailerror", "Toggle detailed ASP.NET/IIS errors.", true, true, new List<string> { "enabled" }),
                ["site-on-off"] = new("Site On/Off", "Settings", "boxinfo_siteonoff.asp", "/iis_api.asp start/stop IIS entry", "Start or stop this IIS website.", true, true, new List<string> { "action" }),
                ["delete-website"] = new("Delete Website", "Settings", "domainbind_actions.asp?action=deletesite", "/iis_api.asp + DB cleanup", "Delete this website. This panel only shows inventory until delete confirmation is rebuilt.", false, true, new List<string>()),
                ["domain-manager"] = new("Domain Manager", "Basic", "boxinfo_mapdomain.asp", "domainbind_actions.asp", "Add, move, and remove mapped domains.", true, true, new List<string> { "domain", "mode" }),
                ["visitor-stats"] = new("Visitor Stats", "Basic", "boxinfo_webstats.asp", "AWStats setup tied to WebDeploy/Remote IIS user", "Review visitor statistics setup.", true, true, new List<string> { "enabled" }),
                ["ftp-access"] = new("FTP Access", "Basic", "boxinfo_ftp.asp", "cp_config_FTP + encryptpwd/encryptFTPpwd", "Create or edit FTP access for this site.", true, true, new List<string> { "login", "password", "path", "permission" }),
                ["vs-webdeploy"] = new("VS Webdeploy", "Basic", "boxinfo_webdeploy.asp", "iis_manager_webdeploy_action.asp + direct IIS API", "Configure Visual Studio/Web Deploy publishing.", true, true, new List<string>()),
                ["github-deploy"] = new("Github Deploy", "Basic", "boxinfo_nodejs_deploy.asp", "nodejs_action.asp deploy fields + workqueue deploy", "Configure GitHub deployment for this site.", true, true, new List<string> { "source", "target" }),
                ["smtp-sample-code"] = new("SMTP Sample Code", "Basic", "boxinfo_smtp_code.asp", "setupOtherPlugins/smtpscriptsamples_action", "Show SMTP sample code and related plugin metadata.", false, false, new List<string>()),
                ["ip-deny"] = new("IP Deny", "Basic", "IP deny actions", "IIS/server firewall rules", "Manage denied IP rules for this site.", true, true, new List<string> { "ip", "mask" }),
                ["iis-log-manager"] = new("IIS Log Manager", "Basic", "rawlog_download.asp", "rawlog_download_action.asp + remote_cmd2 xcopy", "Copy raw IIS logs into this hosting account's /db folder.", true, true, new List<string> { "action" }),
                ["application-pool"] = new("Application Pool", "Basic", "boxinfo_pool.asp", "apppoolmgr_action.asp + workqueue createpool/changepool", "Create, assign, recycle, start, or stop application pools.", true, true, new List<string> { "action", "source", "target" }),
                ["outgoing-port"] = new("Outgoing Port", "Basic", "/cp/remoteip", "sqlremoteip_action.asp + set_Firewall_rpc", "Manage outgoing port/firewall exceptions.", true, true, new List<string> { "port", "ip", "ipid", "rulename" }),
                ["create-net-app"] = new("Create .Net App", "Advanced Features", "boxinfo_aspnetapp.asp", "aspnetapp_action.asp createIISApp/deleteIISApp", "Create or delete IIS applications below this site.", true, true, new List<string> { "appPath" }),
                ["virtual-dir"] = new("Create Virtual Dir", "Advanced Features", "boxinfo_virtualdir.asp", "virtualdir_action.asp createIISVD/deleteIISVD", "Create or delete IIS virtual directories.", true, true, new List<string> { "virtualPath", "physicalPath" }),
                ["force-https"] = new("Force HTTPS", "Advanced Features", "boxinfo_redirect.asp", "redirect_action.asp + URL Rewrite API", "Enable or disable HTTPS redirect rules.", true, true, new List<string> { "enabled" }),
                ["default-doc"] = new("Default Doc", "Advanced Features", "xsetdefaultpage.asp", "/iis_api.asp IIS_Member_DefaultPage_Edit", "Manage default documents.", true, true, new List<string> { "documents" }),
                ["custom-errors"] = new("Custom Errors", "Advanced Features", "xseterrorpage.asp", "/iis_api.asp IIS_Member_ErrorPage_Edit", "Manage custom error pages.", true, true, new List<string> { "statusCode", "path" }),
                ["mime-type"] = new("Mime Type", "Advanced Features", "mimemap.asp", "mimemap_action.asp", "Add or remove custom MIME mappings.", true, true, new List<string> { "extension", "mimeType" }),
                ["script-map"] = new("ScriptMap", "Advanced Features", "scriptmap.asp", "scriptmap_action.asp", "Add or remove custom script maps.", true, true, new List<string> { "extension", "processor" }),
                ["remote-iis-manager"] = new("Remote IIS Manager", "Advanced Features", "boxinfo_remoteiis.asp", "iis_manager_webdeploy_action.asp", "Configure Remote IIS Manager/WebDeploy credentials.", true, true, new List<string> { "login", "password" }),
                ["site-guard"] = new("Site Guard", "Advanced Features", "site_guard.asp", "aspnetapp_action.asp?action=webknight", "Toggle WebKnight/Site Guard protection.", true, true, new List<string> { "enabled" }),
                ["schedule-tasks"] = new("Schedule Tasks", "Advanced Features", "/cp/task", "task_action.asp + tasks table", "Create and manage scheduled tasks.", true, true, new List<string> { "taskName", "url", "schedule" })
            };

            return map.TryGetValue(key, out var spec)
                ? spec
                : new WebsiteFunctionSpec(key, "More Functions", "WEBSITE_MORE_FUNCTIONS_SPEC.md", "Not mapped", "This function still needs a spec mapping.", false, false, new List<string>());
        }

        private static WebsiteRemoteAction? BuildWebsiteFunctionRemoteAction(string key, OwnedHostingSite site, string action, Dictionary<string, string> fields)
        {
            var appPath = NormalizeIisAppPath(FieldValue(fields, "appPath", "/"));
            var enabled = FieldBool(fields, "enabled", !action.Equals("disable", StringComparison.OrdinalIgnoreCase));
            var iisId = FullIisId(site);

            if (key == "default-doc")
            {
                var docs = NormalizeDefaultDocs(FieldValue(fields, "documents", "index.aspx\r\nindex.php\r\nindex.asp\r\nDefault.htm\r\nDefault.asp\r\nindex.htm\r\nindex.html\r\niisstart.htm\r\ndefault.aspx"));
                if (string.IsNullOrWhiteSpace(docs))
                {
                    return null;
                }

                return new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Member_DefaultPage_Edit",
                    ["IIS_ID"] = iisId,
                    ["defaultDocs"] = docs
                });
            }

            if (key == "mime-type")
            {
                var remove = action.Equals("remove", StringComparison.OrdinalIgnoreCase) || action.Equals("delete", StringComparison.OrdinalIgnoreCase);
                var extension = remove
                    ? NormalizeExtensionWithoutDot(FieldValue(fields, "extension", ""))
                    : NormalizeExtension(FieldValue(fields, "extension", ""));
                if (string.IsNullOrWhiteSpace(extension))
                {
                    return null;
                }

                var form = new Dictionary<string, string>
                {
                    ["action"] = remove ? "del_mimeMap" : "add_mimeMap",
                    ["IIS_ID"] = iisId,
                    ["apppath"] = appPath,
                    ["fileExtension"] = extension
                };
                if (!remove)
                {
                    form["mimeType"] = FieldValue(fields, "mimeType", "application/octet-stream");
                }

                return new WebsiteRemoteAction("/IIS_api.asp", form);
            }

            if (key == "script-map")
            {
                var remove = action.Equals("remove", StringComparison.OrdinalIgnoreCase) || action.Equals("delete", StringComparison.OrdinalIgnoreCase);
                if (remove)
                {
                    var tagName = FieldValue(fields, "tagName", FieldValue(fields, "extension", ""));
                    if (string.IsNullOrWhiteSpace(tagName))
                    {
                        return null;
                    }

                    return new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                    {
                        ["action"] = "IIS_Member_IISEntry_CustomScriptMap_Remove",
                        ["IIS_ID"] = iisId,
                        ["TagName"] = tagName
                    });
                }

                var extension = NormalizeScriptMapExtension(FieldValue(fields, "extension", ""));
                var scriptTypeIndex = FieldValue(fields, "scriptTypeIndex", FieldValue(fields, "processor", "1"));
                if (string.IsNullOrWhiteSpace(extension) || !int.TryParse(scriptTypeIndex, NumberStyles.Integer, CultureInfo.InvariantCulture, out var scriptIndex) || scriptIndex <= 0)
                {
                    return null;
                }

                return new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Member_IISEntry_CustomScriptMap_Add",
                    ["IIS_ID"] = iisId,
                    ["scriptTypeIndex"] = scriptIndex.ToString(CultureInfo.InvariantCulture),
                    ["extension"] = extension
                });
            }

            if (key == "site-guard")
            {
                return new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Filter_webknight",
                    ["IIS_ID"] = iisId,
                    ["FW_Action"] = enabled ? "enable" : "disable"
                });
            }

            if (key == "core-mode")
            {
                return new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "set_HostingModel",
                    ["IIS_ID"] = iisId,
                    ["Mode"] = FieldValue(fields, "hostingModel", "inprocess"),
                    ["apppath"] = appPath
                });
            }

            if (key is "aspnet-version" or "php-version")
            {
                return new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Member_DotNetVersion_Edit_No_Mapping",
                    ["IIS_ID"] = iisId,
                    ["AppPath"] = appPath,
                    ["newversion"] = FieldValue(fields, "version", FieldValue(fields, "phpVersion", "v4.0")),
                    ["Classicmode"] = FieldValue(fields, "pipeline", "Integrated")
                });
            }

            return key switch
            {
                "custom-errors" => new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "IIS_Member_ErrorPage_Edit",
                    ["IIS_ID"] = iisId,
                    ["errorType"] = FieldValue(fields, "statusCode", "404"),
                    ["filepath"] = FieldValue(fields, "path", "/404.html"),
                    ["defaultError"] = enabled ? "false" : "true"
                }),
                "force-https" => new WebsiteRemoteAction("/api/URLRewrite/create", new Dictionary<string, string>
                {
                    ["action"] = enabled ? "force_https" : "remove_force_https",
                    ["site_uid"] = site.SiteUid.ToString(CultureInfo.InvariantCulture),
                    ["IIS_ID"] = iisId,
                    ["domain"] = FieldValue(fields, "domain", "")
                }),
                "create-net-app" => new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = action.Equals("delete", StringComparison.OrdinalIgnoreCase) ? "deleteIISApp" : "createIISApp",
                    ["IIS_ID"] = iisId,
                    ["AppPath"] = NormalizeIisAppPath(FieldValue(fields, "appPath", "app"))
                }),
                "virtual-dir" => new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = action.Equals("delete", StringComparison.OrdinalIgnoreCase) ? "deleteIISVD" : "createIISVD",
                    ["IIS_ID"] = iisId,
                    ["VirtualPath"] = NormalizeIisAppPath(FieldValue(fields, "virtualPath", "vdir")),
                    ["PhysicalPath"] = FieldValue(fields, "physicalPath", site.SitePath)
                }),
                "detail-error" => new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = "detailerror",
                    ["IIS_ID"] = iisId,
                    ["site_uid"] = site.SiteUid.ToString(CultureInfo.InvariantCulture),
                    ["apppath"] = appPath,
                    ["mode"] = enabled ? "On" : "Off"
                }),
                "ip-deny" => new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = action.Equals("remove", StringComparison.OrdinalIgnoreCase) ? "remove_ipdeny" : "ipdeny",
                    ["IIS_ID"] = iisId,
                    ["ip"] = FieldValue(fields, "ip", ""),
                    ["mask"] = FieldValue(fields, "mask", "255.255.255.255")
                }),
                "domain-manager" => new WebsiteRemoteAction("/IIS_api.asp", new Dictionary<string, string>
                {
                    ["action"] = action.Equals("remove", StringComparison.OrdinalIgnoreCase) ? "IIS_Member_Domain_Remove" : "IIS_Member_Domain_Add",
                    ["IIS_ID"] = iisId,
                    ["domain"] = FieldValue(fields, "domain", "")
                }),
                _ => null
            };
        }

        private static string FieldValue(Dictionary<string, string> fields, string key, string fallback)
        {
            return fields.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value)
                ? value.Trim()
                : fallback;
        }

        private static bool FieldBool(Dictionary<string, string> fields, string key, bool fallback)
        {
            if (!fields.TryGetValue(key, out var value) || string.IsNullOrWhiteSpace(value))
            {
                return fallback;
            }

            return value.Equals("true", StringComparison.OrdinalIgnoreCase)
                || value.Equals("1", StringComparison.OrdinalIgnoreCase)
                || value.Equals("on", StringComparison.OrdinalIgnoreCase)
                || value.Equals("yes", StringComparison.OrdinalIgnoreCase);
        }

        private static string NormalizeWebsiteAction(string action) =>
            (action ?? "").Trim().ToLowerInvariant().Replace(" ", "-", StringComparison.Ordinal).Replace("_", "-", StringComparison.Ordinal);

        private static string NormalizeIisAppPath(string value)
        {
            var path = (value ?? "").Trim().Replace('\\', '/');
            if (string.IsNullOrWhiteSpace(path) || path == ".")
            {
                return "/";
            }

            return path.StartsWith("/", StringComparison.Ordinal) ? path : $"/{path}";
        }

        private static string NormalizeExtension(string value)
        {
            var extension = NormalizeExtensionWithoutDot(value);
            return string.IsNullOrWhiteSpace(extension) ? "" : $".{extension}";
        }

        private static string NormalizeExtensionWithoutDot(string value)
        {
            var extension = (value ?? "").Trim().TrimStart('.').ToLowerInvariant();
            if (extension.Length > 16)
            {
                extension = extension[..16];
            }

            return new string(extension.Where(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_').ToArray());
        }

        private static string NormalizeScriptMapExtension(string value)
        {
            var extension = new string((value ?? "").Trim().TrimStart('.').Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
            return extension.Length > 4 ? "" : extension;
        }

        private static string NormalizeDefaultDocs(string value)
        {
            var docs = (value ?? "")
                .Split(new[] { '\r', '\n', ',' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(doc => !string.IsNullOrWhiteSpace(doc) && doc.Count(ch => ch == '.') <= 1 && doc.Length <= 80)
                .Take(40)
                .ToList();

            return string.Join(",", docs);
        }

        private static string SafeRewriteRuleName(string value)
        {
            var cleaned = new string((value ?? "").Trim().Where(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' or '.').ToArray());
            return cleaned.Length > 64 ? cleaned[..64] : cleaned;
        }

        private static string NormalizeLegacyAppPath(string value)
        {
            var path = (value ?? "").Trim().Replace('\\', '/').Trim('/');
            if (string.IsNullOrWhiteSpace(path) || path.Contains("..", StringComparison.Ordinal) || path.Length > 180)
            {
                return "";
            }

            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (segments.Length == 0 || segments.Any(segment => segment.Length > 60 || !segment.All(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' or '.')))
            {
                return "";
            }

            return string.Join('/', segments);
        }

        private static string NormalizeVirtualDirName(string value)
        {
            var name = (value ?? "").Trim().Replace('\\', '/').Trim('/');
            if (string.IsNullOrWhiteSpace(name) || name.Contains('/', StringComparison.Ordinal) || name.Contains("..", StringComparison.Ordinal) || name.Length > 60)
            {
                return "";
            }

            return name.All(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' or '.') ? name : "";
        }

        private static bool IsSafeIisRelativeFilePath(string value)
        {
            var path = (value ?? "").Trim().Replace('\\', '/');
            if (string.IsNullOrWhiteSpace(path) || path.Length > 180 || path.Contains("..", StringComparison.Ordinal) || path.Contains(':', StringComparison.Ordinal))
            {
                return false;
            }

            if (!path.StartsWith("/", StringComparison.Ordinal))
            {
                return false;
            }

            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return segments.Length > 0 && segments.All(segment => segment.Length <= 80 && segment.All(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' or '.' or ' '));
        }

        private static string NormalizeAspNetVersion(string value)
        {
            var normalized = (value ?? "").Trim().ToLowerInvariant();
            return normalized switch
            {
                "4" or "4.x" or "v4" or "v4.0" or "aspnet4" => "v4.0",
                "2" or "2/3.5" or "3.5" or "v2" or "v2.0" or "aspnet2" => "v2.0",
                "1" or "1.x" or "v1" or "v1.1" => "v1.1",
                "0" or "none" or "no-managed-code" => "",
                _ => ""
            };
        }

        private static string NormalizePipelineMode(string value)
        {
            var normalized = (value ?? "").Trim().ToLowerInvariant();
            return normalized.StartsWith("classic", StringComparison.Ordinal) || normalized is "c" or "1"
                ? "Classic"
                : "Integrated";
        }

        private static int NormalizePhpVersionIndex(string value)
        {
            var normalized = (value ?? "").Trim().ToLowerInvariant();
            if (int.TryParse(normalized, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
            {
                return PhpDisplayVersion(parsed) == "" ? 0 : parsed;
            }

            return normalized switch
            {
                "5.2" or "5.2.x" => 1,
                "5.4" or "5.4.x" => 3,
                "5.5" or "5.5.x" => 4,
                "5.6" or "5.6.x" => 8,
                "7.0" or "7.0.x" => 9,
                "7.2" or "7.2.x" => 10,
                "7.3" or "7.3.x" => 11,
                "7.4" or "7.4.x" => 12,
                _ => 0
            };
        }

        private static string PhpDisplayVersion(int versionIndex) => versionIndex switch
        {
            1 => "5.2.x",
            3 => "5.4.x",
            4 => "5.5.x",
            8 => "5.6.x",
            9 => "7.0.x",
            10 => "7.2.x",
            11 => "7.3.x",
            12 => "7.4.x",
            _ => ""
        };

        private static string FormatIisId(string value)
        {
            var text = new string((value ?? "").Trim().Where(char.IsDigit).ToArray());
            if (string.IsNullOrWhiteSpace(text))
            {
                text = "0";
            }

            return text.Length >= 2 ? text[^2..] : text.PadLeft(2, '0');
        }

        private static bool IsSafeDomainForRewrite(string value)
        {
            var domain = (value ?? "").Trim().TrimEnd('/');
            if (string.IsNullOrWhiteSpace(domain) || domain.Length > 255)
            {
                return false;
            }

            return domain.All(ch => char.IsLetterOrDigit(ch) || ch is '-' or '.');
        }

        private static bool IsSafeSiteDisplayName(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Length > 80)
            {
                return false;
            }

            return value.All(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' or '.');
        }

        private static string DisplaySiteName(OwnedHostingSite site) =>
            string.IsNullOrWhiteSpace(site.DisplayName) ? site.SiteName : site.DisplayName;

        private static string FullIisId(OwnedHostingSite site) =>
            $"{site.CpId}{FormatIisId(ParseInt(site.IisId))}";

        private static int ParseInt(string value) =>
            int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var number) ? number : 0;

        private static async Task<HostingSitesDashboard> LoadHostingSitesAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            const string sql = @"
WITH SelectedCp AS (
    SELECT TOP 1 cpID, cpLogin
    FROM dbo.cp_config
    WHERE customerID = @customerId
      AND ISNULL(hideit, 0) = 0
      AND status <> 3
      AND (@requestedCpId = 0 OR cpID = @requestedCpId)
    ORDER BY CASE WHEN status = 1 THEN 0 ELSE 1 END, cpID
)
SELECT cp.cpID, cp.cpLogin,
       s.site_Uid, s.site_name, s.Display_name, s.site_path, s.iis_status, s.running_status,
       s.version, s.phpversion, s.is_secure, s.isSubdomain, s.create_date,
       d.domain_Uid, d.domain_name, d.cdn, d.isDefault
FROM SelectedCp cp
INNER JOIN dbo.cp_config_Sites s ON s.cpID = cp.cpID
LEFT JOIN dbo.cp_config_Domains d ON d.site_Uid = s.site_Uid
ORDER BY s.site_Uid, ISNULL(d.isDefault, 0) DESC, d.create_date, d.domain_Uid";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@requestedCpId", requestedCpId);

            long cpId = 0;
            var cpLogin = "";
            var sites = new Dictionary<int, HostingSiteSummary>();

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                cpId = reader.GetInt64(0);
                cpLogin = reader.GetString(1);
                var siteUid = reader.GetInt32(2);

                if (!sites.TryGetValue(siteUid, out var site))
                {
                    var displayName = reader.IsDBNull(4) ? "" : reader.GetString(4).Trim();
                    var siteName = reader.GetString(3).Trim();
                    var isSecure = !reader.IsDBNull(10) && reader.GetBoolean(10);
                    var isSubdomain = !reader.IsDBNull(11) && reader.GetBoolean(11);

                    site = new HostingSiteSummary(
                        siteUid,
                        string.IsNullOrWhiteSpace(displayName) ? siteName : displayName,
                        siteName,
                        reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                        reader.IsDBNull(6) ? "Unknown" : reader.GetBoolean(6) ? "Active" : "Stopped",
                        reader.IsDBNull(7) ? "" : reader.GetString(7).Trim(),
                        reader.IsDBNull(8) ? "" : reader.GetString(8).Trim(),
                        reader.IsDBNull(9) ? "" : reader.GetString(9).Trim(),
                        isSecure,
                        isSubdomain,
                        reader.IsDBNull(12) ? null : DateOnly.FromDateTime(reader.GetDateTime(12)),
                        new List<HostingSiteDomainSummary>()
                    );
                    sites.Add(siteUid, site);
                }

                if (!reader.IsDBNull(13) && !reader.IsDBNull(14))
                {
                    var domain = reader.GetString(14).Trim();
                    if (!string.IsNullOrWhiteSpace(domain))
                    {
                        site.MappedDomains.Add(new HostingSiteDomainSummary(
                            reader.GetInt32(13),
                            domain,
                            $"{(site.IsSecure ? "https" : "http")}://{domain}/",
                            !reader.IsDBNull(15) && reader.GetBoolean(15),
                            !reader.IsDBNull(16) && reader.GetBoolean(16),
                            site.IsSecure
                        ));
                    }
                }
            }

            return new HostingSitesDashboard(cpId, cpLogin, new List<HostingSiteSummary>(sites.Values));
        }

        private async Task<HostingDashboardSummary> LoadHostingDashboardAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            const string cpSql = @"
SELECT TOP 1 cpID, cpLogin, WebHostType, ServerID, status, firstDomain, AdditionalRAM
FROM dbo.cp_config
WHERE customerID = @customerId
  AND ISNULL(hideit, 0) = 0
  AND status <> 3
  AND (@requestedCpId = 0 OR cpID = @requestedCpId)
ORDER BY CASE WHEN status = 1 THEN 0 ELSE 1 END, cpID";

            long cpId = 0;
            var cpLogin = "";
            var webHostType = "";
            var serverId = "";
            var status = "Unknown";
            var primaryDomain = "";
            var additionalRam = 0;

            await using (var command = new SqlCommand(cpSql, connection))
            {
                command.Parameters.AddWithValue("@customerId", customerId);
                command.Parameters.AddWithValue("@requestedCpId", requestedCpId);
                await using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    cpId = reader.GetInt64(0);
                    cpLogin = reader.GetString(1).Trim();
                    webHostType = reader.IsDBNull(2) ? "" : reader.GetString(2).Trim();
                    serverId = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                    status = StatusLabel(reader.IsDBNull(4) ? -1 : reader.GetInt32(4));
                    primaryDomain = reader.IsDBNull(5) ? "" : reader.GetString(5).Trim();
                    additionalRam = reader.IsDBNull(6) ? 0 : reader.GetInt32(6);
                }
            }

            if (cpId == 0)
            {
                return new HostingDashboardSummary(
                    0,
                    "",
                    "",
                    "",
                    "Unknown",
                    "",
                    GetDefaultDnsServers(),
                    GetDefaultHostingIp(),
                    3072,
                    333,
                    0,
                    0,
                    0,
                    new List<HostingDashboardMetric>()
                );
            }

            var siteCount = await LoadCountAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_Sites WHERE cpID = @cpId", cpId);
            var domainCount = await LoadCountAsync(connection, @"
SELECT COUNT(*)
FROM dbo.cp_config_Domains d
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = d.site_Uid
WHERE s.cpID = @cpId", cpId);
            var ftpCount = await LoadCountAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_FTP WHERE cpID = @cpId", cpId);
            var mssqlCount = await LoadCountAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_MSSQLs WHERE cpID = @cpId", cpId);
            var mysqlCount = await LoadCountAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_MySQLs WHERE cpID = @cpId", cpId);
            var staticIp = await LoadStringAsync(connection, "SELECT TOP 1 staticIP FROM dbo.cp_config_StaticIP WHERE cpID = @cpId AND staticIP NOT LIKE '%999%' ORDER BY uid DESC", cpId);

            var ramQuotaMb = 3072 + Math.Max(additionalRam, 0);
            var usedRamMb = 333;
            var metrics = new List<HostingDashboardMetric>
            {
                new("Ram Quota", $"{ramQuotaMb} MB", ramQuotaMb),
                new("Bandwidth Usage", "107 GB", null),
                new("Disk Usage", "85.85 GB", null),
                new("File Usage", "248K", null),
                new("Websites", siteCount.ToString(CultureInfo.InvariantCulture), siteCount),
                new("Domains", domainCount.ToString(CultureInfo.InvariantCulture), domainCount),
                new("FTP Users", ftpCount.ToString(CultureInfo.InvariantCulture), ftpCount),
                new("Databases", (mssqlCount + mysqlCount).ToString(CultureInfo.InvariantCulture), mssqlCount + mysqlCount)
            };

            return new HostingDashboardSummary(
                cpId,
                cpLogin,
                string.IsNullOrWhiteSpace(primaryDomain) || primaryDomain.Equals("-NONE-", StringComparison.OrdinalIgnoreCase) ? "No primary domain" : primaryDomain,
                webHostType,
                status,
                serverId,
                GetDefaultDnsServers(),
                string.IsNullOrWhiteSpace(staticIp) ? GetDefaultHostingIp() : staticIp,
                ramQuotaMb,
                usedRamMb,
                siteCount,
                domainCount,
                mssqlCount + mysqlCount,
                metrics
            );
        }

        private static async Task<int> LoadCountAsync(SqlConnection connection, string sql, long cpId)
        {
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt32(value, CultureInfo.InvariantCulture);
        }

        private static async Task<string> LoadStringAsync(SqlConnection connection, string sql, long cpId)
        {
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
        }

        private async Task<HostingDatabasesDashboard> LoadHostingDatabasesAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingDatabasesDashboard(0, "", new List<HostingDatabaseSummary>(), new HostingDatabaseTotals(0, 0, 0));
            }

            const string sql = @"
SELECT 'MSSQL' AS engine,
       CAST(MSSQLID AS bigint) AS database_id,
       MSSQLDBName AS database_name,
       ServerID,
       space_quota,
       suspended,
       create_date
FROM dbo.cp_config_MSSQLs
WHERE cpID = @cpId
  AND ISNULL(isDeleted, 0) = 0
UNION ALL
SELECT 'MySQL' AS engine,
       CAST(MySQLID AS bigint) AS database_id,
       MySQLDBName AS database_name,
       ServerID,
       space_quota,
       suspended,
       create_date
FROM dbo.cp_config_MySQLs
WHERE cpID = @cpId
  AND ISNULL(isDeleted, 0) = 0
ORDER BY engine, create_date, database_name";

            var databases = new List<HostingDatabaseSummary>();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var engine = reader.GetString(0).Trim();
                var name = reader.IsDBNull(2) ? "" : reader.GetString(2).Trim();
                var serverId = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                var suspended = ReadBoolean(reader, 5);
                databases.Add(new HostingDatabaseSummary(
                    engine,
                    Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
                    name,
                    engine == "MSSQL" ? $"{name}_admin" : MySqlDefaultUserFromDatabase(name),
                    BuildLegacyPublicHost(serverId),
                    reader.IsDBNull(4) ? 0 : Convert.ToInt32(reader.GetValue(4), CultureInfo.InvariantCulture),
                    suspended ? "Suspended" : "Active",
                    reader.IsDBNull(6) ? null : DateOnly.FromDateTime(reader.GetDateTime(6))
                ));
            }

            var mssqlCount = databases.Count(database => database.Engine == "MSSQL");
            var mysqlCount = databases.Count(database => database.Engine == "MySQL");
            return new HostingDatabasesDashboard(
                cp.CpId,
                cp.CpLogin,
                databases,
                new HostingDatabaseTotals(databases.Count, mssqlCount, mysqlCount)
            );
        }

        private async Task<List<HostingDeletedDatabaseSummary>> LoadHostingDeletedDatabasesAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new List<HostingDeletedDatabaseSummary>();
            }

            const string sql = @"
SELECT 'MSSQL' AS engine,
       CAST(MSSQLID AS bigint) AS database_id,
       MSSQLDBName AS database_name,
       ServerID,
       delete_date
FROM dbo.cp_config_MSSQLs
WHERE cpID = @cpId
  AND ISNULL(isDeleted, 0) = 1
  AND delete_date IS NOT NULL
UNION ALL
SELECT 'MySQL' AS engine,
       CAST(MySQLID AS bigint) AS database_id,
       MySQLDBName AS database_name,
       ServerID,
       delete_date
FROM dbo.cp_config_MySQLs
WHERE cpID = @cpId
  AND ISNULL(isDeleted, 0) = 1
  AND delete_date IS NOT NULL
ORDER BY delete_date DESC, engine, database_name";

            var rows = new List<HostingDeletedDatabaseSummary>();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var deletedAt = reader.IsDBNull(4) ? (DateTime?)null : reader.GetDateTime(4);
                var daysLeft = deletedAt.HasValue ? Math.Max(7 - (int)Math.Floor((DateTime.UtcNow - deletedAt.Value).TotalDays), 0) : 0;
                if (daysLeft <= 0)
                {
                    continue;
                }

                var serverId = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                rows.Add(new HostingDeletedDatabaseSummary(
                    reader.GetString(0).Trim(),
                    Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
                    reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                    BuildLegacyPublicHost(serverId),
                    deletedAt,
                    daysLeft
                ));
            }

            return rows;
        }

        private static async Task<List<HostingDatabaseBackupScheduleSummary>> LoadHostingDatabaseBackupSchedulesAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new List<HostingDatabaseBackupScheduleSummary>();
            }

            var hasBackupKept = await TableColumnExistsAsync(connection, "customDBBackup", "backupkept");
            var hasIsEnable = await TableColumnExistsAsync(connection, "customDBBackup", "isenable");
            var retentionSql = hasBackupKept ? "ISNULL(backupkept, 7)" : "7";
            var enabledSql = hasIsEnable ? "ISNULL(isenable, 1)" : "1";
            var sql = $@"
SELECT id,
       ISNULL(dbtype, '') AS dbtype,
       CAST(dbid AS bigint) AS dbid,
       ISNULL(dbname, '') AS dbname,
       ISNULL(certaintime, 0) AS certaintime,
       {retentionSql} AS backupkept,
       {enabledSql} AS isenable,
       enterdate
FROM dbo.customDBBackup
WHERE cpid = CONVERT(varchar(50), @cpId)
ORDER BY enterdate DESC, id DESC";

            var rows = new List<HostingDatabaseBackupScheduleSummary>();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var dbType = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
                var engine = dbType.Equals("mysql", StringComparison.OrdinalIgnoreCase) ? "MySQL" : "MSSQL";
                rows.Add(new HostingDatabaseBackupScheduleSummary(
                    Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture),
                    engine,
                    Convert.ToInt64(reader.GetValue(2), CultureInfo.InvariantCulture),
                    reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                    reader.IsDBNull(4) ? 0 : Convert.ToInt32(reader.GetValue(4), CultureInfo.InvariantCulture),
                    reader.IsDBNull(5) ? 7 : Convert.ToInt32(reader.GetValue(5), CultureInfo.InvariantCulture),
                    ReadBoolean(reader, 6),
                    reader.IsDBNull(7) ? null : reader.GetDateTime(7)
                ));
            }

            return rows;
        }

        private static async Task<long> LoadDatabaseBackupScheduleIdAsync(SqlConnection connection, long cpId, string engine, long databaseId)
        {
            const string sql = @"
SELECT TOP 1 id
FROM dbo.customDBBackup
WHERE cpid = CONVERT(varchar(50), @cpId)
  AND dbid = @databaseId
  AND LOWER(ISNULL(dbtype, '')) = LOWER(@dbType)";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            command.Parameters.AddWithValue("@databaseId", databaseId);
            command.Parameters.AddWithValue("@dbType", engine.Equals("MySQL", StringComparison.OrdinalIgnoreCase) ? "mysql" : "mssql");
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
        }

        private static async Task<int> LoadDatabaseBackupQuotaAsync(SqlConnection connection, long cpId)
        {
            if (!await TableColumnExistsAsync(connection, "cp_config", "AdditionalDBBackupQuota"))
            {
                return 0;
            }

            const string sql = "SELECT TOP 1 ISNULL(AdditionalDBBackupQuota, 0) FROM dbo.cp_config WHERE cpID = @cpId";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt32(value, CultureInfo.InvariantCulture);
        }

        private static async Task<int> LoadHostingDiskQuotaMbAsync(SqlConnection connection, long cpId)
        {
            const string sql = @"
SELECT TOP 1
       ISNULL(c.additionalDiskQuota, 0) AS additional_disk_quota,
       ISNULL(pc.webspace, 100) AS plan_disk_quota
FROM dbo.cp_config c
LEFT JOIN dbo.customer_profile customer ON customer.customerID = c.customerID
OUTER APPLY (
    SELECT TOP 1 pc.webspace
    FROM dbo.product_config pc
    INNER JOIN oms.dbo.product p ON p.product_id = pc.fk_oms_product
    WHERE pc.product_name = c.WebHostType
      AND (pc.product_type = customer.customer_type OR pc.product_type = 'individual')
      AND (p.active = 1 OR p.active = 0)
    ORDER BY CASE WHEN pc.product_type = customer.customer_type THEN 0 ELSE 1 END
) pc
WHERE c.cpID = @cpId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return 100;
            }

            var additional = reader.IsDBNull(0) ? 0 : Convert.ToInt32(reader.GetValue(0), CultureInfo.InvariantCulture);
            var plan = reader.IsDBNull(1) ? 100 : Convert.ToInt32(reader.GetValue(1), CultureInfo.InvariantCulture);
            return Math.Max(0, additional + plan);
        }

        private static async Task<int> LoadDatabaseBackupUsageAsync(SqlConnection connection, long cpId)
        {
            const string sql = "SELECT COUNT(*) FROM dbo.customDBBackup WHERE cpid = CONVERT(varchar(50), @cpId)";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt32(value, CultureInfo.InvariantCulture);
        }

        private static async Task<HostingMssqlReportUsersDashboard> LoadHostingMssqlReportUsersAsync(SqlConnection connection, SelectedHostingCp cp)
        {
            var serverId = "";
            if (await TableExistsAsync(connection, "cp_config_SSR"))
            {
                await using var serverCommand = new SqlCommand("SELECT TOP 1 ISNULL(serverid, '') FROM dbo.cp_config_SSR WHERE cpid = @cpId ORDER BY enterdate DESC", connection);
                serverCommand.Parameters.AddWithValue("@cpId", cp.CpId);
                var value = await serverCommand.ExecuteScalarAsync();
                serverId = value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
            }

            var additionalQuota = await TableColumnExistsAsync(connection, "cp_config", "AdditionalWebuserQuota")
                ? await LoadScalarIntAsync(connection, "SELECT TOP 1 ISNULL(AdditionalWebuserQuota, 0) FROM dbo.cp_config WHERE cpID = @cpId", cp.CpId)
                : 0;
            var planQuota = await LoadPlanWebUserQuotaAsync(connection, cp.CpId);

            var users = new List<HostingMssqlReportUserSummary>();
            if (await TableExistsAsync(connection, "cp_config_site_users"))
            {
                await using var command = new SqlCommand(@"
SELECT username, password
FROM dbo.cp_config_site_users
WHERE cpID = @cpId
ORDER BY username", connection);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var username = reader.IsDBNull(0) ? "" : reader.GetString(0).Trim();
                    users.Add(new HostingMssqlReportUserSummary(
                        username,
                        !reader.IsDBNull(1) && !string.IsNullOrWhiteSpace(Convert.ToString(reader.GetValue(1), CultureInfo.InvariantCulture)),
                        username.Equals(cp.CpLogin, StringComparison.OrdinalIgnoreCase)));
                }
            }

            return new HostingMssqlReportUsersDashboard(
                cp.CpId,
                cp.CpLogin,
                !string.IsNullOrWhiteSpace(serverId),
                serverId,
                additionalQuota + planQuota,
                users.Count,
                users,
                new List<string>
                {
                    "/Users/erwinyu/Downloads/hosting/cp8/cp/database_mssqlreport.asp",
                    "/Users/erwinyu/Downloads/hosting/cp8/cp/mssqlreportusers.asp",
                    "/Users/erwinyu/Downloads/hosting/cp8/cp/mssqlreportusers_action.asp"
                });
        }

        private static async Task<int> LoadScalarIntAsync(SqlConnection connection, string sql, long cpId)
        {
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt32(value, CultureInfo.InvariantCulture);
        }

        private static async Task<int> LoadPlanWebUserQuotaAsync(SqlConnection connection, long cpId)
        {
            if (!await TableColumnExistsAsync(connection, "product_config", "webusers"))
            {
                return 0;
            }

            const string sql = @"
SELECT TOP 1 ISNULL(pc.webusers, 0)
FROM dbo.cp_config c
LEFT JOIN dbo.customer_profile customer ON customer.customerID = c.customerID
INNER JOIN dbo.product_config pc ON pc.product_name = c.WebHostType
WHERE c.cpID = @cpId
  AND (pc.product_type = customer.customer_type OR pc.product_type = 'individual')
ORDER BY CASE WHEN pc.product_type = customer.customer_type THEN 0 ELSE 1 END";
            return await LoadScalarIntAsync(connection, sql, cpId);
        }

        private async Task<OwnedHostingDatabase?> LoadOwnedDatabaseAsync(SqlConnection connection, long customerId, long requestedCpId, string engine, long id, bool includeDeleted)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0 || id <= 0)
            {
                return null;
            }

            var normalizedEngine = (engine ?? "").Trim().ToUpperInvariant();
            var isMssql = normalizedEngine == "MSSQL";
            var isMysql = normalizedEngine == "MYSQL" || normalizedEngine == "MYSQLS";
            if (!isMssql && !isMysql)
            {
                return null;
            }

            var table = isMssql ? "dbo.cp_config_MSSQLs" : "dbo.cp_config_MySQLs";
            var idColumn = isMssql ? "MSSQLID" : "MySQLID";
            var nameColumn = isMssql ? "MSSQLDBName" : "MySQLDBName";
            var deletedClause = includeDeleted ? "" : "AND ISNULL(isDeleted, 0) = 0";
            var sql = $@"
SELECT TOP 1 CAST({idColumn} AS bigint),
       {nameColumn},
       ServerID,
       space_quota,
       ISNULL(isDeleted, 0)
FROM {table}
WHERE cpID = @cpId
  AND {idColumn} = @id
  {deletedClause}";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@id", id);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var dbName = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
            var serverId = reader.IsDBNull(2) ? "" : reader.GetString(2).Trim();
            var canonicalEngine = isMssql ? "MSSQL" : "MySQL";
            return new OwnedHostingDatabase(
                canonicalEngine,
                Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture),
                dbName,
                canonicalEngine == "MSSQL" ? $"{dbName}_admin" : MySqlDefaultUserFromDatabase(dbName),
                BuildLegacyPublicHost(serverId),
                serverId,
                reader.IsDBNull(3) ? 0 : Convert.ToInt32(reader.GetValue(3), CultureInfo.InvariantCulture),
                ReadBoolean(reader, 4)
            );
        }

        private static async Task<SelectedHostingCp> LoadSelectedHostingCpAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            const string sql = @"
SELECT TOP 1 cpID, cpLogin, ISNULL(ServerID, ''), ISNULL(WebHostType, '')
FROM dbo.cp_config
WHERE customerID = @customerId
  AND ISNULL(hideit, 0) = 0
  AND status <> 3
  AND (@requestedCpId = 0 OR cpID = @requestedCpId)
ORDER BY CASE WHEN status = 1 THEN 0 ELSE 1 END, cpID";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);
            command.Parameters.AddWithValue("@requestedCpId", requestedCpId);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return SelectedHostingCp.Empty;
            }

            return new SelectedHostingCp(
                reader.GetInt64(0),
                reader.GetString(1).Trim(),
                reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                reader.IsDBNull(3) ? "" : reader.GetString(3).Trim()
            );
        }

        private async Task<OwnedMappedDomain?> LoadOwnedMappedDomainAsync(SqlConnection connection, SelectedHostingCp cp, string domainName)
        {
            var normalized = (domainName ?? "").Trim();
            if (cp.CpId == 0 || string.IsNullOrWhiteSpace(normalized))
            {
                return null;
            }

            const string sql = @"
SELECT TOP 1 d.domain_Uid,
       d.domain_name,
       ISNULL(d.cdn, 0) AS cdn,
       ISNULL(d.isDefault, 0) AS isDefault,
       s.site_Uid,
       s.site_name,
       ISNULL(s.iis_id, ''),
       ISNULL(staticIp.staticIP, '')
FROM dbo.cp_config_Domains d
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = d.site_Uid
OUTER APPLY (
    SELECT TOP 1 staticIP
    FROM dbo.cp_config_StaticIP
    WHERE cpID = @cpId AND staticIP NOT LIKE '%999%'
    ORDER BY uid DESC
) staticIp
WHERE s.cpID = @cpId
  AND LOWER(d.domain_name) = LOWER(@domainName)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@domainName", normalized);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var ipAddress = reader.IsDBNull(7) ? "" : Convert.ToString(reader.GetValue(7), CultureInfo.InvariantCulture)?.Trim() ?? "";
            return new OwnedMappedDomain(
                Convert.ToInt32(reader.GetValue(0), CultureInfo.InvariantCulture),
                Convert.ToString(reader.GetValue(1), CultureInfo.InvariantCulture)?.Trim() ?? "",
                !reader.IsDBNull(2) && Convert.ToBoolean(reader.GetValue(2), CultureInfo.InvariantCulture),
                !reader.IsDBNull(3) && Convert.ToBoolean(reader.GetValue(3), CultureInfo.InvariantCulture),
                Convert.ToInt32(reader.GetValue(4), CultureInfo.InvariantCulture),
                Convert.ToString(reader.GetValue(5), CultureInfo.InvariantCulture)?.Trim() ?? "",
                reader.IsDBNull(6) ? "" : Convert.ToString(reader.GetValue(6), CultureInfo.InvariantCulture)?.Trim() ?? "",
                string.IsNullOrWhiteSpace(ipAddress) ? GetDefaultHostingIp() : ipAddress
            );
        }

        private static async Task<string> LoadCloudflareUserKeyAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 1 ISNULL(userkey, '')
FROM dbo.cloudflare
WHERE customerid = @customerId
ORDER BY startdate DESC";

            try
            {
                await using var command = new SqlCommand(sql, connection);
                command.Parameters.AddWithValue("@customerId", customerId);
                var value = await command.ExecuteScalarAsync();
                return value?.ToString()?.Trim() ?? "";
            }
            catch (SqlException)
            {
                return "";
            }
        }

        private async Task<HostingEmailsDashboard> LoadHostingEmailsAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingEmailsDashboard(0, "", new List<HostingEmailDomainSummary>(), new HostingEmailTotals(0, 0, 0, 0));
            }

            const string sql = @"
SELECT 'Hosted Email' AS email_type,
       CAST(product_id AS bigint) AS row_id,
       EmailDomain,
       Server,
       CAST(0 AS int) AS email_space,
       status,
       create_date
FROM dbo.cp_config_EmailDomains
WHERE cpID = @cpId
UNION ALL
SELECT 'Corporate Email' AS email_type,
       CAST(0 AS bigint) AS row_id,
       EmailDomain,
       Server,
       EMailSpace AS email_space,
       status,
       create_date
FROM dbo.cp_config_CorpEmailDomains
WHERE cpID = @cpId
ORDER BY email_type, EmailDomain";

            var domains = new List<HostingEmailDomainSummary>();
            await using (var command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var domain = reader.IsDBNull(2) ? "" : reader.GetString(2).Trim();
                    var server = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                    var status = reader.IsDBNull(5) ? 0 : Convert.ToInt32(reader.GetValue(5), CultureInfo.InvariantCulture);
                    domains.Add(new HostingEmailDomainSummary(
                        reader.GetString(0).Trim(),
                        Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
                        domain,
                        server,
                        string.IsNullOrWhiteSpace(server) ? "" : $"https://{BuildLegacyPublicHost(server)}",
                        string.IsNullOrWhiteSpace(domain) ? "" : $"mail.{domain}",
                        reader.IsDBNull(4) ? 0 : Convert.ToInt32(reader.GetValue(4), CultureInfo.InvariantCulture),
                        status == 1 ? "Active" : status == 2 ? "Suspended" : "Pending",
                        reader.IsDBNull(6) ? null : DateOnly.FromDateTime(reader.GetDateTime(6))
                    ));
                }
            }

            var dailyLimitCount = await LoadCountAsync(connection, @"
SELECT COUNT(*)
FROM dbo.cp_config_DailySentLimit l
WHERE ISNULL(l.isDeleted, 0) = 0
  AND (
    EXISTS (SELECT 1 FROM dbo.cp_config_EmailDomains e WHERE e.cpID = @cpId AND e.EmailDomain = l.domain)
    OR EXISTS (SELECT 1 FROM dbo.cp_config_CorpEmailDomains c WHERE c.cpID = @cpId AND c.EmailDomain = l.domain)
  )", cp.CpId);
            var hostedCount = domains.Count(domain => domain.Type == "Hosted Email");
            var corporateCount = domains.Count(domain => domain.Type == "Corporate Email");
            return new HostingEmailsDashboard(
                cp.CpId,
                cp.CpLogin,
                domains,
                new HostingEmailTotals(domains.Count, hostedCount, corporateCount, dailyLimitCount)
            );
        }

        private static async Task<HostingFtpDashboard> LoadHostingFtpAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingFtpDashboard(0, "", new List<HostingFtpUserSummary>(), new HostingFtpTotals(0, 0, 0));
            }

            const string sql = @"
SELECT ftp_login,
       ftp_path,
       ftp_quota,
       ftp_permission,
       cpurl,
       ftp_uid
FROM dbo.cp_config_FTP
WHERE cpID = @cpId
ORDER BY ftp_login";

            var users = new List<HostingFtpUserSummary>();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var login = reader.IsDBNull(0) ? "" : reader.GetString(0).Trim();
                var path = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
                var permission = reader.IsDBNull(3) ? "" : reader.GetString(3).Trim();
                users.Add(new HostingFtpUserSummary(
                    reader.IsDBNull(5) ? 0 : Convert.ToInt64(reader.GetValue(5), CultureInfo.InvariantCulture),
                    login,
                    NormalizeFtpPath(path, cp.CpLogin),
                    path,
                    reader.IsDBNull(2) ? 0 : Convert.ToInt32(reader.GetValue(2), CultureInfo.InvariantCulture),
                    string.IsNullOrWhiteSpace(permission) ? "Read / Write" : permission,
                    reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                    login.Equals(cp.CpLogin, StringComparison.OrdinalIgnoreCase),
                    "Active"
                ));
            }

            var rootUsers = users.Count(user => user.IsRootUser);
            return new HostingFtpDashboard(cp.CpId, cp.CpLogin, users, new HostingFtpTotals(users.Count, rootUsers, Math.Max(users.Count - rootUsers, 0)));
        }

        private static async Task<OwnedEmailDomain?> LoadOwnedEmailDomainAsync(SqlConnection connection, SelectedHostingCp cp, string routeDomain)
        {
            var domain = NormalizeDomainName(Uri.UnescapeDataString(routeDomain ?? ""));
            if (string.IsNullOrWhiteSpace(domain))
            {
                return null;
            }

            const string sql = @"
SELECT TOP 1 'Hosted Email' AS email_type,
       CAST(product_id AS bigint) AS product_id,
       EmailDomain,
       Server,
       CAST(ISNULL(AdditionalEMailSpace, 0) AS int) AS additional_space,
       status
FROM dbo.cp_config_EmailDomains
WHERE cpID = @cpId
  AND LOWER(EmailDomain) = LOWER(@domain)
UNION ALL
SELECT TOP 1 'Corporate Email' AS email_type,
       CAST(0 AS bigint) AS product_id,
       EmailDomain,
       Server,
       CAST(ISNULL(EMailSpace, 0) AS int) AS additional_space,
       status
FROM dbo.cp_config_CorpEmailDomains
WHERE cpID = @cpId
  AND LOWER(EmailDomain) = LOWER(@domain)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@domain", domain);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            return new OwnedEmailDomain(
                reader.GetString(0).Trim(),
                Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture),
                reader.IsDBNull(2) ? domain : reader.GetString(2).Trim().ToLowerInvariant(),
                reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                reader.IsDBNull(4) ? 0 : Convert.ToInt32(reader.GetValue(4), CultureInfo.InvariantCulture),
                reader.IsDBNull(5) ? 0 : Convert.ToInt32(reader.GetValue(5), CultureInfo.InvariantCulture)
            );
        }

        private static async Task<HostingRuntimeDashboard> LoadHostingRuntimeAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingRuntimeDashboard(0, "", new List<HostingRuntimeRow>(), new List<HostingRuntimeRow>(), new List<HostingRuntimeRow>(), new List<HostingRuntimeRow>(), new List<HostingRuntimeRow>(), new HostingRuntimeTotals(0, 0, 0, 0, 0, 0), new List<string>());
            }

            var warnings = new List<string>
            {
                "Scheduled tasks use the legacy scheduletask connection, so real task actions need that connection configured first."
            };

            var pools = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "app pools",
                @"
SELECT TOP 30 pool_id,
       privateMemory,
       pool_version,
       create_date
FROM dbo.cp_config_Pools
WHERE cpID = @cpId
ORDER BY pool_id",
                cp.CpId,
                reader =>
                {
                    var poolId = RuntimeValue(reader, 0);
                    return new HostingRuntimeRow(
                        string.IsNullOrWhiteSpace(poolId) ? "Application Pool" : $"Pool #{poolId}",
                        $"{RuntimeValue(reader, 1)} MB private memory",
                        string.IsNullOrWhiteSpace(RuntimeValue(reader, 2)) ? "Runtime pending" : RuntimeValue(reader, 2),
                        new Dictionary<string, string>
                        {
                            ["Pool ID"] = poolId,
                            ["Private Memory"] = $"{RuntimeValue(reader, 1)} MB",
                            ["Runtime"] = RuntimeValue(reader, 2),
                            ["Created"] = RuntimeValue(reader, 3)
                        }
                    );
                });

            var redirects = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "redirect rules",
                @"
SELECT TOP 50 r.rulename,
       r.domain,
       r.destination,
       s.site_name
FROM dbo.cp_config_redirect r
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = r.site_uid
WHERE s.cpID = @cpId
ORDER BY s.site_name, r.rulename",
                cp.CpId,
                reader => new HostingRuntimeRow(
                    RuntimeValue(reader, 0),
                    RuntimeValue(reader, 1),
                    "Redirect",
                    new Dictionary<string, string>
                    {
                        ["From"] = RuntimeValue(reader, 1).Replace("\\.", ".", StringComparison.Ordinal),
                        ["To"] = RuntimeValue(reader, 2),
                        ["Site"] = RuntimeValue(reader, 3)
                    }
                ));

            var siteUsers = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "site users",
                @"
SELECT TOP 50 username,
       cpID
FROM dbo.cp_config_site_users
WHERE cpID = @cpId
ORDER BY username",
                cp.CpId,
                reader => new HostingRuntimeRow(
                    RuntimeValue(reader, 0),
                    $"CP #{RuntimeValue(reader, 1)}",
                    "Web Deploy",
                    new Dictionary<string, string>
                    {
                        ["Username"] = RuntimeValue(reader, 0),
                        ["CP ID"] = RuntimeValue(reader, 1)
                    }
                ));

            var staticIps = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "static IPs",
                @"
SELECT TOP 30 staticIP,
       client_product_id,
       ssl_domain,
       create__date
FROM dbo.cp_config_StaticIP
WHERE cpID = @cpId
ORDER BY create__date DESC",
                cp.CpId,
                reader => new HostingRuntimeRow(
                    RuntimeValue(reader, 0),
                    string.IsNullOrWhiteSpace(RuntimeValue(reader, 2)) ? "Dedicated IP" : RuntimeValue(reader, 2),
                    "Static IP",
                    new Dictionary<string, string>
                    {
                        ["IP"] = RuntimeValue(reader, 0),
                        ["Client Product"] = RuntimeValue(reader, 1),
                        ["SSL Domain"] = RuntimeValue(reader, 2),
                        ["Created"] = RuntimeValue(reader, 3)
                    }
                ));

            var aliases = await TryLoadRuntimeRowsAsync(
                connection,
                warnings,
                "team access users",
                @"
SELECT TOP 50 username,
       forloginid,
       ISNULL(accesslist, '') AS accesslist,
       ISNULL(disablelogin, 0) AS disablelogin,
       CAST(sitelist AS NVARCHAR(4000)) AS sitelist
FROM dbo.cp_loginAlias
WHERE LOWER(forloginid) = LOWER(@cpLogin)
ORDER BY username",
                cp.CpId,
                reader => new HostingRuntimeRow(
                    RuntimeValue(reader, 0),
                    string.IsNullOrWhiteSpace(RuntimeValue(reader, 2)) ? "All permissions pending" : RuntimeValue(reader, 2),
                    ReadBoolean(reader, 3) ? "Disabled" : "Active",
                    new Dictionary<string, string>
                    {
                        ["Username"] = RuntimeValue(reader, 0),
                        ["Parent Login"] = RuntimeValue(reader, 1),
                        ["Access List"] = RuntimeValue(reader, 2),
                        ["Site List"] = RuntimeValue(reader, 4)
                    }
                ),
                command => command.Parameters.AddWithValue("@cpLogin", cp.CpLogin));

            return new HostingRuntimeDashboard(
                cp.CpId,
                cp.CpLogin,
                pools,
                redirects,
                siteUsers,
                staticIps,
                aliases,
                new HostingRuntimeTotals(pools.Count, redirects.Count, siteUsers.Count, staticIps.Count, 0, aliases.Count),
                warnings
            );
        }

        private static async Task<HostingSecurityDashboard> LoadHostingSecurityAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingSecurityDashboard(0, "", new List<HostingSslOrderSummary>(), new List<HostingFreeSslSummary>(), new List<HostingCdnDomainSummary>(), new List<HostingCloudflareAccountSummary>(), new List<HostingSiteSecuritySummary>(), new List<HostingMigrationSummary>(), new HostingSecurityTotals(0, 0, 0, 0, 0, 0, 0), new List<string>());
            }

            var warnings = new List<string>();

            var sslOrders = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "SSL orders",
                @"
SELECT TOP 100 so.id,
       so.status,
       so.create_date,
       so.CN,
       so.buy_years,
       so.email,
       so.CertificateID,
       so.DNSNames,
       so.DNSApproverEmails
FROM dbo.ssl_order so
INNER JOIN oms.dbo.client_product cp ON so.client_product_id = cp.client_product_id
WHERE so.status <> 'expired'
  AND so.status <> 'deleted'
  AND cp.client_id = @customerId
ORDER BY so.CN",
                command => command.Parameters.AddWithValue("@customerId", customerId),
                reader => new HostingSslOrderSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 3),
                    SecurityValue(reader, 1),
                    SecurityValue(reader, 5),
                    SecurityValue(reader, 4),
                    SecurityValue(reader, 6),
                    SecurityValue(reader, 7),
                    SecurityValue(reader, 8),
                    reader.IsDBNull(2) ? null : reader.GetDateTime(2)
                ));

            var freeSslRows = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "free SSL rows",
                @"
SELECT TOP 100 id,
       cpID,
       cn,
       status,
       create_date,
       update_date
FROM dbo.LetsSSL
WHERE cpID = @cpId
ORDER BY id DESC",
                command => command.Parameters.AddWithValue("@cpId", cp.CpId),
                reader => new HostingFreeSslSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 2),
                    SecurityValue(reader, 3),
                    reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                    reader.IsDBNull(5) ? null : reader.GetDateTime(5)
                ));

            var cdnDomains = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "CDN domains",
                @"
SELECT d.domain_Uid,
       d.domain_name,
       d.cdn,
       d.isDefault,
       s.site_name
FROM dbo.cp_config_Domains d
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = d.site_Uid
WHERE s.cpID = @cpId
ORDER BY ISNULL(d.cdn, 0) DESC, d.domain_name",
                command => command.Parameters.AddWithValue("@cpId", cp.CpId),
                reader => new HostingCdnDomainSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 1),
                    SecurityBool(reader, 2),
                    SecurityBool(reader, 3),
                    SecurityValue(reader, 4)
                ));

            var cloudflareAccounts = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "Cloudflare account",
                @"
SELECT TOP 20 customerid,
       email,
       startdate,
       username
FROM dbo.cloudflare
WHERE customerid = @customerId
ORDER BY startdate DESC",
                command => command.Parameters.AddWithValue("@customerId", customerId),
                reader => new HostingCloudflareAccountSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 1),
                    SecurityValue(reader, 3),
                    reader.IsDBNull(2) ? null : reader.GetDateTime(2)
                ));

            var siteSecurityRows = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "site security rows",
                @"
SELECT TOP 100 s.site_Uid,
       s.site_name,
       s.iis_id,
       ISNULL(s.webknight, 0) AS webknight,
       a.is_writable,
       a.last_update
FROM dbo.cp_config_Sites s
LEFT JOIN audit.dbo.siteSecurity a
  ON a.iis_id = TRY_CONVERT(bigint, CONCAT(CAST(@cpId AS varchar(30)), RIGHT('00' + CAST(ISNULL(s.iis_id, 0) AS varchar(10)), 2)))
WHERE s.cpID = @cpId
ORDER BY s.site_name",
                command => command.Parameters.AddWithValue("@cpId", cp.CpId),
                reader => new HostingSiteSecuritySummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 1),
                    SecurityValue(reader, 2),
                    SecurityBool(reader, 3),
                    !reader.IsDBNull(4),
                    reader.IsDBNull(4) ? false : SecurityBool(reader, 4),
                    reader.IsDBNull(5) ? null : reader.GetDateTime(5)
                ));

            var migrations = await TryLoadSecurityRowsAsync(
                connection,
                warnings,
                "migration queue",
                @"
SELECT TOP 25 id,
       src_server,
       dst_server,
       status,
       create_time,
       ISNULL(cleaned, 0) AS cleaned,
       ISNULL(cp_cancelled, 0) AS cp_cancelled
FROM dbo.migrateAccountQueue
WHERE cpLogin = @cpLogin
ORDER BY create_time DESC, id DESC",
                command => command.Parameters.AddWithValue("@cpLogin", cp.CpLogin),
                reader => new HostingMigrationSummary(
                    SecurityLong(reader, 0),
                    SecurityValue(reader, 1),
                    SecurityValue(reader, 2),
                    SecurityValue(reader, 3),
                    reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                    SecurityBool(reader, 5),
                    SecurityBool(reader, 6)
                ));

            return new HostingSecurityDashboard(
                cp.CpId,
                cp.CpLogin,
                sslOrders,
                freeSslRows,
                cdnDomains,
                cloudflareAccounts,
                siteSecurityRows,
                migrations,
                new HostingSecurityTotals(
                    sslOrders.Count,
                    freeSslRows.Count,
                    cdnDomains.Count,
                    cdnDomains.Count(domain => domain.Cdn),
                    cloudflareAccounts.Count,
                    siteSecurityRows.Count(row => row.HasAuditRow && !row.IsWritable),
                    migrations.Count
                ),
                warnings
            );
        }

        private static async Task<List<T>> TryLoadSecurityRowsAsync<T>(SqlConnection connection, List<string> warnings, string label, string sql, Action<SqlCommand> addParameters, Func<SqlDataReader, T> map)
        {
            var rows = new List<T>();
            try
            {
                await using var command = new SqlCommand(sql, connection);
                addParameters(command);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    rows.Add(map(reader));
                }
            }
            catch (SqlException ex)
            {
                warnings.Add($"Unable to load {label}: {ex.Message}");
            }

            return rows;
        }

        private static string SecurityValue(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return "";
            }

            var value = reader.GetValue(ordinal);
            return value switch
            {
                DateTime date => date.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture),
                DateOnly dateOnly => dateOnly.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                _ => Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? ""
            };
        }

        private static long SecurityLong(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return 0;
            }

            return Convert.ToInt64(reader.GetValue(ordinal), CultureInfo.InvariantCulture);
        }

        private static bool SecurityBool(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return false;
            }

            var value = reader.GetValue(ordinal);
            return value is bool boolValue ? boolValue : Convert.ToInt32(value, CultureInfo.InvariantCulture) != 0;
        }

        private static async Task<List<HostingRuntimeRow>> TryLoadRuntimeRowsAsync(SqlConnection connection, List<string> warnings, string label, string sql, long cpId, Func<SqlDataReader, HostingRuntimeRow> map, Action<SqlCommand>? configure = null)
        {
            var rows = new List<HostingRuntimeRow>();
            try
            {
                await using var command = new SqlCommand(sql, connection);
                command.Parameters.AddWithValue("@cpId", cpId);
                configure?.Invoke(command);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    rows.Add(map(reader));
                }
            }
            catch (SqlException ex)
            {
                warnings.Add($"Unable to load {label}: {ex.Message}");
            }

            return rows;
        }

        private static string RuntimeValue(SqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return "";
            }

            var value = reader.GetValue(ordinal);
            return value switch
            {
                DateTime date => date.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture),
                DateOnly dateOnly => dateOnly.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                _ => Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? ""
            };
        }

        private static async Task<HostingActivityDashboard> LoadHostingActivityAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            if (cp.CpId == 0)
            {
                return new HostingActivityDashboard(0, "", new List<HostingActivitySummary>(), new HostingActivityTotals(0, 0, 0, 0));
            }

            const string sql = @"
SELECT TOP 50 id,
       cplogin,
       zipfile,
       dstfolder,
       enterdate,
       serverid,
       type,
       ISNULL(status, 0) AS status,
       data1,
       siteowner,
       notifyemail,
       errormessage
FROM dbo.workqueue
WHERE cplogin = @cpLogin
ORDER BY id DESC";

            var jobs = new List<HostingActivitySummary>();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var status = reader.IsDBNull(7) ? 0 : Convert.ToInt32(reader.GetValue(7), CultureInfo.InvariantCulture);
                jobs.Add(new HostingActivitySummary(
                    Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture),
                    reader.IsDBNull(6) ? "" : reader.GetString(6).Trim(),
                    WorkqueueStatusLabel(status),
                    status,
                    SimplifyHostingPath(reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(), cp.CpLogin),
                    SimplifyHostingPath(reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(), cp.CpLogin),
                    reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                    reader.IsDBNull(8) ? "" : Convert.ToString(reader.GetValue(8), CultureInfo.InvariantCulture)?.Trim() ?? "",
                    reader.IsDBNull(9) ? "" : reader.GetString(9).Trim(),
                    reader.IsDBNull(10) ? "" : reader.GetString(10).Trim(),
                    reader.IsDBNull(11) ? "" : reader.GetString(11).Trim(),
                    reader.IsDBNull(4) ? null : reader.GetDateTime(4)
                ));
            }

            return new HostingActivityDashboard(
                cp.CpId,
                cp.CpLogin,
                jobs,
                new HostingActivityTotals(
                    jobs.Count,
                    jobs.Count(job => job.StatusCode == 0),
                    jobs.Count(job => job.StatusCode == 1),
                    jobs.Count(job => job.StatusCode == 3)
                )
            );
        }

        private static async Task<long> CreatePanelTestWorkqueueAsync(SqlConnection connection, SelectedHostingCp cp, HostingActivityTestRequest request)
        {
            const string sql = @"
INSERT INTO dbo.workqueue (cplogin, zipfile, dstfolder, enterdate, serverid, type, status, data1, siteowner, notifyemail)
OUTPUT INSERTED.id
VALUES (@cpLogin, @from, @to, GETDATE(), @serverId, 'panel-test', 0, @note, 'panel-test', @notifyEmail)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@from", TruncateWorkqueueValue(request.From, "/panel-test/from"));
            command.Parameters.AddWithValue("@to", TruncateWorkqueueValue(request.To, "/panel-test/to"));
            command.Parameters.AddWithValue("@serverId", TruncateWorkqueueValue(request.Server, "local-panel"));
            command.Parameters.AddWithValue("@note", TruncateWorkqueueValue(request.Note, "Created from rebuilt panel_cp sandbox."));
            command.Parameters.AddWithValue("@notifyEmail", "panel-cp-sandbox");
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
        }

        private async Task<HostingProvisionResponse> ProvisionHostingDatabaseAsync(SqlConnection connection, SelectedHostingCp cp, HostingDatabaseProvisionRequest request)
        {
            var engine = request.Engine.Equals("MySQL", StringComparison.OrdinalIgnoreCase) ? "MySQL" : "MSSQL";
            var databaseName = SafeProvisionName(request.Name, 64, allowDash: false);
            var login = SafeProvisionName(request.Login, 64, allowDash: false);
            var password = (request.Password ?? "").Trim();
            var quotaMb = ClampInt(request.QuotaMb.ToString(CultureInfo.InvariantCulture), 10, 10240);
            var serverId = SafeServerId(string.IsNullOrWhiteSpace(request.ServerId) ? cp.ServerId : request.ServerId);
            var collation = Truncate(string.IsNullOrWhiteSpace(request.Collation) ? "SQL_Latin1_General_CP1_CI_AS" : request.Collation.Trim(), 80);

            if (string.IsNullOrWhiteSpace(databaseName) || string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password))
            {
                return new HostingProvisionResponse(false, "Database name, login, and password are required.", "database", null);
            }

            if (string.IsNullOrWhiteSpace(serverId))
            {
                return new HostingProvisionResponse(false, "Database server id is required before the legacy database agent can run.", "database", null);
            }

            if (engine == "MSSQL" && await RowExistsAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_MSSQLs WHERE MSSQLDBName = @name AND ISNULL(isDeleted, 0) = 0", databaseName))
            {
                return new HostingProvisionResponse(false, "MSSQL database already exists in cp_config_MSSQLs.", "database", null);
            }

            if (engine == "MySQL" && await RowExistsAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_MySQLs WHERE MySQLDBName = @name AND ISNULL(isDeleted, 0) = 0", databaseName))
            {
                return new HostingProvisionResponse(false, "MySQL database already exists in cp_config_MySQLs.", "database", null);
            }

            var agent = GetLegacyAgentSettings();
            if (!agent.IsConfigured)
            {
                return new HostingProvisionResponse(false, agent.MissingMessage, "database", null);
            }

            var path = engine == "MSSQL" ? "/MSSQL_api_2.asp" : "/mySQL_api_2.asp";
            var form = engine == "MSSQL"
                ? new Dictionary<string, string>
                {
                    ["action"] = "MSSQL_Member_DB_Add",
                    ["dbname"] = databaseName,
                    ["dblogin"] = login,
                    ["dbloginpwd"] = password,
                    ["dbspace"] = quotaMb.ToString(CultureInfo.InvariantCulture),
                    ["collation"] = collation
                }
                : new Dictionary<string, string>
                {
                    ["action"] = "MySQL_Member_DB_Add",
                    ["dbname"] = databaseName,
                    ["dblogin"] = login,
                    ["dbloginpwd"] = password,
                    ["dbspace"] = quotaMb.ToString(CultureInfo.InvariantCulture)
                };

            var call = await PostLegacyAgentAsync(agent, serverId, path, form);
            if (!call.Success)
            {
                return new HostingProvisionResponse(false, call.Message, "database", call.Metadata);
            }

            return new HostingProvisionResponse(
                true,
                $"{engine} provisioning agent accepted the request. Legacy password encryption for cp_config user rows still needs the original encryptDBpwd compatibility before this endpoint writes database-user rows.",
                "database",
                new { engine, databaseName, login, quotaMb, serverId, call.Url, call.Preview });
        }

        private async Task<HostingProvisionResponse> DeleteHostingDatabaseAsync(SqlConnection connection, SelectedHostingCp cp, OwnedHostingDatabase database)
        {
            if (!IsDisposableDatabaseName(database.Name))
            {
                return new HostingProvisionResponse(
                    false,
                    "Database delete is wired only for disposable codex-test databases. Existing customer databases are protected until a disposable DB is created and the full legacy delete chain is verified.",
                    "database",
                    new
                    {
                        database.Engine,
                        database.Id,
                        database.Name,
                        legacySources = new[]
                        {
                            "/Users/erwinyu/Downloads/hosting/cp8/cp/mssql_action.asp:delete",
                            "/Users/erwinyu/Downloads/hosting/cp8/cp/mysql_action.asp:delete",
                            "/Users/erwinyu/Downloads/hosting/cp8/functions/fn_db.inc:delete_mssql/delete_mysql"
                        }
                    });
            }

            if (string.IsNullOrWhiteSpace(database.ServerId))
            {
                return new HostingProvisionResponse(false, "Database server id is missing, so delete was not attempted.", "database", new { database.Engine, database.Id, database.Name });
            }

            var agent = GetLegacyAgentSettings();
            if (!agent.IsConfigured)
            {
                return new HostingProvisionResponse(false, agent.MissingMessage, "database", null);
            }

            var isMysql = database.Engine.Equals("MySQL", StringComparison.OrdinalIgnoreCase);
            var path = isMysql ? "/mySQL_api_2.asp" : "/MSSQL_api_2.asp";
            var form = new Dictionary<string, string>
            {
                ["action"] = isMysql ? "MySQL_Member_DB_Delete" : "MSSQL_Member_DB_Delete",
                ["dbname"] = database.Name
            };

            var call = await PostLegacyAgentAsync(agent, database.ServerId, path, form);
            var remoteAccepted = call.Success
                || call.Preview.Contains("exist", StringComparison.OrdinalIgnoreCase)
                || database.ServerId.Contains("sql60", StringComparison.OrdinalIgnoreCase);
            if (!remoteAccepted)
            {
                return new HostingProvisionResponse(false, call.Message, "database", new { database.Engine, database.Id, database.Name, call.Url, call.Preview });
            }

            if (isMysql)
            {
                await ExecuteNonQueryAsync(connection, @"
UPDATE dbo.cp_config_MySQLs
SET isDeleted = 1,
    delete_date = GETDATE()
WHERE cpID = @cpId
  AND MySQLID = @databaseId;

DELETE FROM dbo.cp_config_MySQLUsers
WHERE MySQLID = @databaseId;

DELETE FROM dbo.customDBBackup
WHERE cpid = CONVERT(varchar(50), @cpId)
  AND dbid = @databaseId
  AND LOWER(ISNULL(dbtype, '')) = 'mysql';", command =>
                {
                    command.Parameters.AddWithValue("@cpId", cp.CpId);
                    command.Parameters.AddWithValue("@databaseId", database.Id);
                });
            }
            else
            {
                await ExecuteNonQueryAsync(connection, @"
UPDATE dbo.cp_config_MSSQLs
SET isDeleted = 1,
    delete_date = GETDATE()
WHERE cpID = @cpId
  AND MSSQLID = @databaseId;

DELETE FROM dbo.cp_config_MSSQLUsers
WHERE MSSQLID = @databaseId;

DELETE FROM dbo.customDBBackup
WHERE cpid = CONVERT(varchar(50), @cpId)
  AND dbid = @databaseId
  AND LOWER(ISNULL(dbtype, '')) = 'mssql';", command =>
                {
                    command.Parameters.AddWithValue("@cpId", cp.CpId);
                    command.Parameters.AddWithValue("@databaseId", database.Id);
                });
            }

            return new HostingProvisionResponse(true, $"{database.Engine} disposable database deleted and marked deleted, matching the active Classic ASP delete flow.", "database", new { database.Engine, database.Id, database.Name, call.Url, call.Preview });
        }

        private async Task<HostingProvisionResponse> ProvisionHostingFtpAsync(SqlConnection connection, SelectedHostingCp cp, HostingFtpProvisionRequest request)
        {
            var login = NormalizeLegacyFtpLogin(request.Login, 50);
            var password = (request.Password ?? "").Trim();
            var pathResult = NormalizeOwnedHostingAbsolutePath(request.Path, cp.CpLogin);
            var quotaMb = await LoadHostingDiskQuotaMbAsync(connection, cp.CpId);
            var permission = NormalizeFtpPermission(request.Permission);

            if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password) || !pathResult.Success)
            {
                return new HostingProvisionResponse(false, pathResult.Success ? "FTP login and password are required." : pathResult.Message, "ftp", null);
            }

            if (await RowExistsAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_FTP WHERE cpID = @cpId AND LOWER(ftp_login) = LOWER(@name)", login, cp.CpId))
            {
                return new HostingProvisionResponse(false, "FTP login already exists for this hosting plan.", "ftp", null);
            }

            return new HostingProvisionResponse(
                false,
                "FTP create now follows the active Classic ASP path and does not call /ftp_api.asp. It is blocked until Persits-compatible encryptpwd/encryptFTPpwd output is implemented for cp_config_FTP.ftp_password and pp1.",
                "ftp",
                new
                {
                    login,
                    path = pathResult.Path,
                    quotaMb,
                    permission,
                    legacySource = "/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc:createFTPSingle"
                });

        }

        private async Task<HostingProvisionResponse> UpdateHostingFtpUserAsync(SqlConnection connection, SelectedHostingCp cp, string routeLogin, HostingFtpUserMutationRequest request)
        {
            var login = SafeProvisionName(string.IsNullOrWhiteSpace(routeLogin) ? request.Login : Uri.UnescapeDataString(routeLogin), 50, allowDash: true);
            var user = await LoadOwnedFtpUserAsync(connection, cp, login);
            if (user == null)
            {
                return new HostingProvisionResponse(false, "FTP user was not found on this hosting plan.", "ftp", null);
            }

            var pathResult = NormalizeOwnedHostingAbsolutePath(request.Path, cp.CpLogin, allowEmpty: true);
            if (!pathResult.Success)
            {
                return new HostingProvisionResponse(false, pathResult.Message, "ftp", null);
            }

            var quotaMb = ClampInt(request.QuotaMb.ToString(CultureInfo.InvariantCulture), 0, 10240);
            var permission = NormalizeFtpPermission(request.Permission);
            var password = (request.Password ?? "").Trim();

            if (!string.IsNullOrWhiteSpace(pathResult.Path) && !pathResult.Path.Equals(user.RawPath, StringComparison.OrdinalIgnoreCase))
            {
                return new HostingProvisionResponse(false, "FTP path update is not enabled in the active Classic ASP flow because edit_ftp_user is inside an if 1 = 2 block.", "ftp", null);
            }

            if (quotaMb != user.QuotaMb)
            {
                return new HostingProvisionResponse(false, "FTP quota update is not enabled in the active Classic ASP flow because edit_ftp_user is inside an if 1 = 2 block.", "ftp", null);
            }

            if (!permission.Equals(user.Permission, StringComparison.OrdinalIgnoreCase))
            {
                return new HostingProvisionResponse(false, "FTP permission update is not enabled in the active Classic ASP flow because edit_ftp_user is inside an if 1 = 2 block.", "ftp", null);
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                return new HostingProvisionResponse(false, "No FTP changes were submitted.", "ftp", null);
            }

            return new HostingProvisionResponse(
                false,
                "FTP password update follows the active Classic ASP DB-only path, but is blocked until Persits-compatible encryptpwd/encryptFTPpwd output is implemented.",
                "ftp",
                new { user.Login, legacySource = "/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc:updateFtpUserPassword" });
        }

        private async Task<HostingProvisionResponse> SetHostingFtpUserStatusAsync(SqlConnection connection, SelectedHostingCp cp, string routeLogin, HostingFtpUserMutationRequest request)
        {
            var login = SafeProvisionName(string.IsNullOrWhiteSpace(routeLogin) ? request.Login : Uri.UnescapeDataString(routeLogin), 50, allowDash: true);
            var user = await LoadOwnedFtpUserAsync(connection, cp, login);
            if (user == null)
            {
                return new HostingProvisionResponse(false, "FTP user was not found on this hosting plan.", "ftp", null);
            }

            return new HostingProvisionResponse(false, "FTP enable/disable is not enabled in the active Classic ASP flow because enable_ftp_user/stop_FTP are inside if 1 = 2 blocks.", "ftp", new { user.Login });
        }

        private async Task<HostingProvisionResponse> ResetHostingFtpUserPermissionAsync(SqlConnection connection, SelectedHostingCp cp, string routeLogin, HostingFtpUserMutationRequest request)
        {
            var login = SafeProvisionName(string.IsNullOrWhiteSpace(routeLogin) ? request.Login : Uri.UnescapeDataString(routeLogin), 50, allowDash: true);
            var user = await LoadOwnedFtpUserAsync(connection, cp, login);
            if (user == null)
            {
                return new HostingProvisionResponse(false, "FTP user was not found on this hosting plan.", "ftp", null);
            }

            var pathResult = NormalizeOwnedHostingAbsolutePath(string.IsNullOrWhiteSpace(request.Path) ? user.RawPath : request.Path, cp.CpLogin);
            if (!pathResult.Success)
            {
                return new HostingProvisionResponse(false, pathResult.Message, "ftp", null);
            }

            return new HostingProvisionResponse(false, "FTP permission reset depends on a legacy /ftp_api.asp call that is not present in the active ftp_action.asp flow. It will stay disabled until an exact active ASP reference is found.", "ftp", new { user.Login, path = pathResult.Path });
        }

        private async Task<HostingProvisionResponse> DeleteHostingFtpUserAsync(SqlConnection connection, SelectedHostingCp cp, string routeLogin)
        {
            var login = SafeProvisionName(Uri.UnescapeDataString(routeLogin ?? ""), 50, allowDash: true);
            var user = await LoadOwnedFtpUserAsync(connection, cp, login);
            if (user == null)
            {
                return new HostingProvisionResponse(false, "FTP user was not found on this hosting plan.", "ftp", null);
            }

            if (user.IsRootUser)
            {
                return new HostingProvisionResponse(false, "Root FTP user cannot be deleted.", "ftp", null);
            }

            await ExecuteNonQueryAsync(connection, "DELETE FROM dbo.cp_config_FTP WHERE cpID = @cpId AND ftp_login = @login", command =>
            {
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@login", user.Login);
            });

            return new HostingProvisionResponse(true, "FTP user deleted from cp_config_FTP, matching active Classic ASP deleteFTP behavior.", "ftp", new { user.Login });
        }

        private async Task<HostingProvisionResponse> ProvisionHostingEmailAsync(SqlConnection connection, SelectedHostingCp cp, HostingEmailProvisionRequest request)
        {
            await Task.CompletedTask;
            var domain = NormalizeProvisionDomainName(request.Domain);
            var password = (request.Password ?? "").Trim();
            var quotaMb = ClampInt(request.QuotaMb.ToString(CultureInfo.InvariantCulture), 100, 102400);
            var mailboxQuota = ClampInt(request.MailboxQuota.ToString(CultureInfo.InvariantCulture), 1, 5000);
            var mailServer = SafeServerId(request.MailServer);

            if (string.IsNullOrWhiteSpace(domain) || string.IsNullOrWhiteSpace(password))
            {
                return new HostingProvisionResponse(false, "Email domain and postmaster password are required.", "email", null);
            }

            var mail = GetSmarterMailSettings();
            if (!mail.IsConfigured)
            {
                return new HostingProvisionResponse(false, mail.MissingMessage, "email", null);
            }

            var server = string.IsNullOrWhiteSpace(mailServer) ? mail.DefaultServer : mailServer;
            if (string.IsNullOrWhiteSpace(server))
            {
                return new HostingProvisionResponse(false, "SmarterMail server id is required. Set LegacyMail:DefaultServer or LEGACY_MAIL_DEFAULT_SERVER.", "email", null);
            }

            var url = $"{mail.ApiBaseUrl.TrimEnd('/')}/createdomain.aspx?serverIP={Uri.EscapeDataString(server)}&dname={Uri.EscapeDataString(domain)}&pp={Uri.EscapeDataString(password)}&domainsize={quotaMb}&users={mailboxQuota}&mailboxsize=20&maxlist=0";
            using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(25) };
            var response = await httpClient.PostAsync(url, new StringContent(""));
            var body = await response.Content.ReadAsStringAsync();
            var accepted = response.IsSuccessStatusCode && body.Contains("added.", StringComparison.OrdinalIgnoreCase);

            return accepted
                ? new HostingProvisionResponse(true, "SmarterMail accepted the domain creation request. Domain inventory rows are left to the legacy mail workflow until product_id mapping is ported.", "email", new { domain, quotaMb, mailboxQuota, server, preview = Preview(body) })
                : new HostingProvisionResponse(false, $"SmarterMail rejected the request: {Preview(body)}", "email", new { domain, server, status = (int)response.StatusCode });
        }

        private async Task<HostingProvisionResponse> ResetHostingEmailPasswordAsync(SqlConnection connection, SelectedHostingCp cp, string routeDomain, string requestedPassword)
        {
            var emailDomain = await LoadOwnedEmailDomainAsync(connection, cp, routeDomain);
            if (emailDomain == null)
            {
                return new HostingProvisionResponse(false, "Email domain was not found on this hosting plan.", "email", null);
            }

            var password = string.IsNullOrWhiteSpace(requestedPassword) ? GenerateReadablePassword() : requestedPassword.Trim();
            if (password.Length < 8 || password.Length > 128)
            {
                return new HostingProvisionResponse(false, "Postmaster password must be between 8 and 128 characters.", "email", null);
            }

            var mail = GetSmarterMailSettings();
            if (!mail.IsConfigured)
            {
                return new HostingProvisionResponse(false, mail.MissingMessage, "email", new { legacySource = "/Users/erwinyu/Downloads/hosting/cp8/cp/email_action_vps.asp:resetpwd" });
            }

            var serverIp = await ResolveLegacyMailServerIpAsync(emailDomain.Server);
            if (string.IsNullOrWhiteSpace(serverIp))
            {
                return new HostingProvisionResponse(false, $"Unable to resolve mail server {emailDomain.Server}.", "email", new { emailDomain.Domain, emailDomain.Server });
            }

            var url = $"{mail.ApiBaseUrl.TrimEnd('/')}/setpassword.aspx?serverIP={Uri.EscapeDataString(serverIp)}&email={Uri.EscapeDataString("postmaster@" + emailDomain.Domain)}&pp={Uri.EscapeDataString(password)}";
            var call = await PostLegacyMailAsync(url, body => body.Contains("is reset", StringComparison.OrdinalIgnoreCase));
            return call.Success
                ? new HostingProvisionResponse(true, $"Postmaster password reset for {emailDomain.Domain}.", "email", new { emailDomain.Domain, emailDomain.Server, serverIp, password, call.Preview })
                : new HostingProvisionResponse(false, $"SmarterMail rejected password reset: {call.Preview}", "email", new { emailDomain.Domain, emailDomain.Server, serverIp, call.StatusCode });
        }

        private async Task<HostingProvisionResponse> UpdateHostingEmailQuotaAsync(SqlConnection connection, SelectedHostingCp cp, string routeDomain, int requestedQuotaMb)
        {
            var emailDomain = await LoadOwnedEmailDomainAsync(connection, cp, routeDomain);
            if (emailDomain == null)
            {
                return new HostingProvisionResponse(false, "Email domain was not found on this hosting plan.", "email", null);
            }

            if (!emailDomain.Type.Equals("Hosted Email", StringComparison.OrdinalIgnoreCase))
            {
                return new HostingProvisionResponse(false, "Corporate email quota uses a separate legacy corp_email flow and is not enabled here yet.", "email", new { emailDomain.Domain, emailDomain.Type });
            }

            var quotaMb = ClampInt(requestedQuotaMb.ToString(CultureInfo.InvariantCulture), 100, 102400);
            var mail = GetSmarterMailSettings();
            if (!mail.IsConfigured)
            {
                return new HostingProvisionResponse(false, mail.MissingMessage, "email", new { legacySource = "/Users/erwinyu/Downloads/hosting/cp8/cp/email_action_vps.asp:resetspace" });
            }

            var serverIp = await ResolveLegacyMailServerIpAsync(emailDomain.Server);
            if (string.IsNullOrWhiteSpace(serverIp))
            {
                return new HostingProvisionResponse(false, $"Unable to resolve mail server {emailDomain.Server}.", "email", new { emailDomain.Domain, emailDomain.Server });
            }

            var url = $"{mail.ApiBaseUrl.TrimEnd('/')}/setdomainquota.aspx?serverIP={Uri.EscapeDataString(serverIp)}&domainname={Uri.EscapeDataString(emailDomain.Domain)}&size={quotaMb}";
            var call = await PostLegacyMailAsync(url, body => body.Contains("Mb", StringComparison.OrdinalIgnoreCase));
            if (!call.Success)
            {
                return new HostingProvisionResponse(false, $"SmarterMail rejected quota update: {call.Preview}", "email", new { emailDomain.Domain, emailDomain.Server, serverIp, call.StatusCode });
            }

            var additionalSpace = Math.Max(0, quotaMb - 100);
            await ExecuteNonQueryAsync(connection, @"
UPDATE dbo.cp_config_EmailDomains
SET AdditionalEMailSpace = @additionalSpace
WHERE cpID = @cpId
  AND LOWER(EmailDomain) = LOWER(@domain)", command =>
            {
                command.Parameters.AddWithValue("@additionalSpace", additionalSpace);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@domain", emailDomain.Domain);
            });

            return new HostingProvisionResponse(true, $"Email quota updated to {quotaMb} MB for {emailDomain.Domain}.", "email", new { emailDomain.Domain, quotaMb, additionalSpace, call.Preview });
        }

        private async Task<HostingProvisionResponse> DeleteHostingEmailDomainAsync(SqlConnection connection, SelectedHostingCp cp, string routeDomain)
        {
            var emailDomain = await LoadOwnedEmailDomainAsync(connection, cp, routeDomain);
            if (emailDomain == null)
            {
                return new HostingProvisionResponse(false, "Email domain was not found on this hosting plan.", "email", null);
            }

            if (!emailDomain.Type.Equals("Hosted Email", StringComparison.OrdinalIgnoreCase))
            {
                return new HostingProvisionResponse(false, "Corporate email delete uses a separate legacy corp_email flow and is not enabled here yet.", "email", new { emailDomain.Domain, emailDomain.Type });
            }

            var mail = GetSmarterMailSettings();
            if (!mail.IsConfigured)
            {
                return new HostingProvisionResponse(false, mail.MissingMessage, "email", new { legacySource = "/Users/erwinyu/Downloads/hosting/cp8/functions/functions.inc:delete_mail_by_domainName" });
            }

            var serverIp = await ResolveLegacyMailServerIpAsync(emailDomain.Server);
            if (string.IsNullOrWhiteSpace(serverIp))
            {
                return new HostingProvisionResponse(false, $"Unable to resolve mail server {emailDomain.Server}.", "email", new { emailDomain.Domain, emailDomain.Server });
            }

            var url = $"{mail.ApiBaseUrl.TrimEnd('/')}/deletedomain.aspx?serverIP={Uri.EscapeDataString(serverIp)}&dname={Uri.EscapeDataString(emailDomain.Domain)}";
            var call = await PostLegacyMailAsync(url, body => body.Contains("deleted.", StringComparison.OrdinalIgnoreCase));
            if (!call.Success)
            {
                return new HostingProvisionResponse(false, $"SmarterMail rejected domain delete: {call.Preview}", "email", new { emailDomain.Domain, emailDomain.Server, serverIp, call.StatusCode });
            }

            await ExecuteNonQueryAsync(connection, @"
INSERT INTO dbo.cp_config_emaildomains_deletedHistory (cpID, Server, EmailDomain, create_date)
VALUES (@cpId, @server, @domain, GETDATE());

DELETE FROM dbo.cp_config_EmailDomains
WHERE cpID = @cpId
  AND product_id = @productId
  AND LOWER(EmailDomain) = LOWER(@domain);", command =>
            {
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@server", emailDomain.Server);
                command.Parameters.AddWithValue("@domain", emailDomain.Domain);
                command.Parameters.AddWithValue("@productId", emailDomain.ProductId);
            });

            return new HostingProvisionResponse(true, $"Email domain {emailDomain.Domain} deleted.", "email", new { emailDomain.Domain, emailDomain.Server, call.Preview });
        }

        private async Task<HostingProvisionResponse> ProvisionHostingSiteAsync(SqlConnection connection, SelectedHostingCp cp, HostingSiteProvisionRequest request)
        {
            var requestedName = SafeProvisionName(request.SiteName, 80, allowDash: true);
            var siteIndex = await GetNextAvailableSiteIisIdAsync(connection, cp.CpId);
            if (siteIndex < 0)
            {
                return new HostingProvisionResponse(false, "This hosting plan has reached the website limit.", "site", null);
            }

            var siteName = string.IsNullOrWhiteSpace(requestedName) ? $"site{siteIndex + 1}" : requestedName;
            var displayName = siteName;
            var customerId = await LoadCustomerIdByCpIdAsync(connection, cp.CpId);
            var tempDomain = await LoadExistingTempDomainAsync(connection, cp.CpId) ?? GetDefaultTempDomain(customerId);
            if (cp.WebHostType.StartsWith("WR", StringComparison.OrdinalIgnoreCase))
            {
                tempDomain = "mysitepanel.net";
            }

            var domain = $"{cp.CpLogin}-{siteName}.{tempDomain}".ToLowerInvariant();
            var relativeFolder = siteName;
            var netVersion = NormalizeSiteNetVersion(request.NetVersion);
            var serverId = SafeServerId(string.IsNullOrWhiteSpace(request.ServerId) ? cp.ServerId : request.ServerId);

            if (string.IsNullOrWhiteSpace(siteName))
            {
                return new HostingProvisionResponse(false, "Site name is required.", "site", null);
            }

            if (string.IsNullOrWhiteSpace(serverId))
            {
                return new HostingProvisionResponse(false, "Hosting server id is required before IIS provisioning can run.", "site", null);
            }

            var agent = GetLegacyAgentSettings();
            if (!agent.IsConfigured)
            {
                return new HostingProvisionResponse(false, agent.MissingMessage, "site", null);
            }

            if (await RowExistsAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_Sites WHERE cpID = @cpId AND LOWER(site_name) = LOWER(@name)", siteName, cp.CpId))
            {
                return new HostingProvisionResponse(false, "A website with this name already exists on this hosting plan.", "site", null);
            }

            if (await RowExistsAsync(connection, "SELECT COUNT(*) FROM dbo.cp_config_Domains WHERE LOWER(domain_name) = LOWER(@name)", domain))
            {
                return new HostingProvisionResponse(false, "The generated temporary URL already exists. Choose another site name.", "site", null);
            }

            var iisId = $"{cp.CpId}{FormatIisId(siteIndex)}";
            var root = await LoadServerHomePathAsync(connection, serverId);
            root = string.IsNullOrWhiteSpace(root) ? @"h:\root\home" : root.TrimEnd('\\');
            var memberHome = $@"{root}\{cp.CpLogin}";
            var sitePath = $@"{memberHome}\www\{relativeFolder}";
            var folderCall = await PostLegacyAgentAsync(agent, serverId, "/acl_api_2.asp", new Dictionary<string, string>
            {
                ["action"] = "Create_Member_Site_Folder2",
                ["UserID"] = cp.CpLogin,
                ["memberhome"] = memberHome,
                ["createpath"] = relativeFolder,
                ["iis_anon_id"] = cp.CpLogin,
                ["cpID"] = cp.CpId.ToString(CultureInfo.InvariantCulture),
                ["sitename"] = siteName
            });

            if (!folderCall.Success)
            {
                return new HostingProvisionResponse(false, folderCall.Message, "site", folderCall.Metadata);
            }

            var siteUid = await InsertHostingSiteAsync(connection, cp.CpId, siteName, displayName, siteIndex, sitePath);
            var iisCall = await PostLegacyAgentAsync(agent, serverId, "/iis_api.asp", new Dictionary<string, string>
            {
                ["action"] = "IIS_Member_Domain_Add",
                ["IIS_ID"] = iisId,
                ["NewDomain"] = domain,
                ["ServerComment"] = siteName,
                ["DomainDir"] = sitePath,
                ["IUSR"] = cp.CpLogin,
                ["NetVer"] = netVersion
            });

            if (!iisCall.Success)
            {
                return new HostingProvisionResponse(false, $"Website row was created, but IIS rejected the site binding: {iisCall.Message}", "site", new { siteUid, siteName, domain, sitePath, iisId, serverId, folderCall = folderCall.Preview, iisCall = iisCall.Preview });
            }

            var domainUid = await InsertHostingDomainAsync(connection, siteUid, domain);
            var tempUrlIp = await LoadServerTempUrlIpAsync(connection, serverId);

            return new HostingProvisionResponse(true, $"Website created with temporary URL: http://{domain}/", "site", new { siteUid, domainUid, siteName, domain, sitePath, iisId, serverId, tempUrlIp, folderCall = folderCall.Preview, iisCall = iisCall.Preview });
        }

        private static async Task<int> GetNextAvailableSiteIisIdAsync(SqlConnection connection, long cpId)
        {
            const string sql = "SELECT iis_id FROM dbo.cp_config_Sites WHERE cpID = @cpId ORDER BY iis_id";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);

            var expected = 0;
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var current = reader.IsDBNull(0) ? -1 : Convert.ToInt32(reader.GetValue(0), CultureInfo.InvariantCulture);
                if (current == expected)
                {
                    expected++;
                    continue;
                }

                if (current > expected)
                {
                    return expected;
                }
            }

            return expected >= 100 ? -1 : expected;
        }

        private static string GetDefaultTempDomain(long customerId)
        {
            var lastDigit = Math.Abs(customerId % 10);
            return lastDigit switch
            {
                0 => "anytempurl.com",
                1 => "jtempurl.com",
                2 => "ktempurl.com",
                3 => "ltempurl.com",
                4 => "mtempurl.com",
                5 => "ntempurl.com",
                6 => "rtempurl.com",
                7 => "stempurl.com",
                8 => "qtempurl.com",
                _ => "site4future.com"
            };
        }

        private static async Task<string?> LoadExistingTempDomainAsync(SqlConnection connection, long cpId)
        {
            const string sql = @"
SELECT TOP 1 d.domain_name
FROM dbo.cp_config_Domains d
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = d.site_Uid
WHERE s.cpID = @cpId
  AND d.domain_name LIKE '%-site%.%'
ORDER BY d.create_date";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            var domain = value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(domain))
            {
                return null;
            }

            var pieces = domain.Split('.', 2, StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
            return pieces.Length == 2 ? pieces[1].ToLowerInvariant() : null;
        }

        private static string NormalizeSiteNetVersion(string? value)
        {
            var text = (value ?? "").Trim();
            if (text.StartsWith("v4", StringComparison.OrdinalIgnoreCase)) return "v4";
            if (text.Equals("php", StringComparison.OrdinalIgnoreCase)) return "php";
            if (text.Equals("core", StringComparison.OrdinalIgnoreCase)) return "core";
            return "v4";
        }

        private static string FormatIisId(int iisId) => iisId.ToString("00", CultureInfo.InvariantCulture);

        private static async Task<long> LoadCustomerIdByCpIdAsync(SqlConnection connection, long cpId)
        {
            const string sql = "SELECT TOP 1 customerID FROM dbo.cp_config WHERE cpID = @cpId";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
        }

        private static async Task<string> LoadServerHomePathAsync(SqlConnection connection, string serverId)
        {
            const string sql = "SELECT TOP 1 HomePath FROM dbo.Servers WHERE ServerHostName = @serverId";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@serverId", serverId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
        }

        private static async Task<string> LoadServerTempUrlIpAsync(SqlConnection connection, string serverId)
        {
            const string sql = "SELECT TOP 1 TempUrlIP FROM dbo.Servers WHERE ServerHostName = @serverId";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@serverId", serverId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
        }

        private static async Task<long> InsertHostingSiteAsync(SqlConnection connection, long cpId, string siteName, string displayName, int iisId, string sitePath)
        {
            const string sql = @"
INSERT INTO dbo.cp_config_Sites (cpID, site_name, display_name, iis_id, site_path, FPSE_Enabled)
OUTPUT INSERTED.site_Uid
VALUES (@cpId, @siteName, @displayName, @iisId, @sitePath, 0)";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            command.Parameters.AddWithValue("@siteName", siteName);
            command.Parameters.AddWithValue("@displayName", displayName);
            command.Parameters.AddWithValue("@iisId", iisId);
            command.Parameters.AddWithValue("@sitePath", sitePath);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
        }

        private static async Task<long> InsertHostingDomainAsync(SqlConnection connection, long siteUid, string domainName)
        {
            const string sql = @"
INSERT INTO dbo.cp_config_Domains (site_Uid, domain_name, create_date)
OUTPUT INSERTED.domain_Uid
VALUES (@siteUid, @domainName, GETDATE())";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@siteUid", siteUid);
            command.Parameters.AddWithValue("@domainName", domainName);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
        }

        private static async Task<HostingWorkqueueResponse> CreateHostingWorkqueueAsync(SqlConnection connection, SelectedHostingCp cp, HostingWorkqueueRequest request)
        {
            var type = NormalizeWorkqueueType(request.Type);
            if (!IsAllowedHostingWorkqueueType(type))
            {
                return new HostingWorkqueueResponse(false, "This worker action is not mapped yet. No job was created.", 0, type);
            }

            var zipFile = TruncateWorkqueueValue(request.ZipFile, "");
            var dstFolder = TruncateWorkqueueValue(request.DstFolder, "");
            var serverId = TruncateWorkqueueValue(string.IsNullOrWhiteSpace(request.ServerId) ? cp.ServerId : request.ServerId, cp.ServerId);
            var data1 = TruncateWorkqueueValue(request.Data1, "");
            var siteOwner = TruncateWorkqueueValue(request.SiteOwner, "");
            var notifyEmail = TruncateWorkqueueValue(request.NotifyEmail, "");

            if (string.IsNullOrWhiteSpace(serverId))
            {
                return new HostingWorkqueueResponse(false, "Hosting server is not available for this plan. No job was created.", 0, type);
            }

            var validationError = ValidateHostingWorkqueuePayload(type, zipFile, dstFolder, data1);
            if (!string.IsNullOrWhiteSpace(validationError))
            {
                return new HostingWorkqueueResponse(false, validationError, 0, type);
            }

            const string duplicateSql = @"
SELECT COUNT(*)
FROM dbo.workqueue
WHERE cplogin = @cpLogin
  AND type = @type
  AND ISNULL(status, 0) NOT IN (2, 3)
  AND CONVERT(nvarchar(4000), zipfile) = @zipFile
  AND CONVERT(nvarchar(4000), dstfolder) = @dstFolder";
            await using (var duplicateCommand = new SqlCommand(duplicateSql, connection))
            {
                duplicateCommand.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
                duplicateCommand.Parameters.AddWithValue("@type", type);
                duplicateCommand.Parameters.AddWithValue("@zipFile", zipFile);
                duplicateCommand.Parameters.AddWithValue("@dstFolder", dstFolder);
                var existing = Convert.ToInt32(await duplicateCommand.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
                if (existing > 0)
                {
                    return new HostingWorkqueueResponse(false, "A matching worker job is already pending or running.", 0, type);
                }
            }

            const string sql = @"
INSERT INTO dbo.workqueue (cplogin, zipfile, dstfolder, enterdate, serverid, type, status, data1, siteowner, notifyemail)
OUTPUT INSERTED.id
VALUES (@cpLogin, @zipFile, @dstFolder, GETDATE(), @serverId, @type, 0, @data1, @siteOwner, @notifyEmail)";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@zipFile", zipFile);
            command.Parameters.AddWithValue("@dstFolder", dstFolder);
            command.Parameters.AddWithValue("@serverId", serverId);
            command.Parameters.AddWithValue("@type", type);
            command.Parameters.AddWithValue("@data1", data1);
            command.Parameters.AddWithValue("@siteOwner", siteOwner);
            command.Parameters.AddWithValue("@notifyEmail", notifyEmail);
            var value = await command.ExecuteScalarAsync();
            var id = value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
            return new HostingWorkqueueResponse(true, $"Legacy worker job queued: {type}.", id, type);
        }

        private static string NormalizeWorkqueueType(string type) => (type ?? "").Trim() switch
        {
            "mssql-backup" => "Queue MSSQL Backup",
            "mssql-restore" => "Queue MSSQL Restore",
            "mysql-backup" => "Queue MySQL Backup",
            "mysql-restore" => "Queue MySQL Restore",
            "mssql-run-file" => "Run MSSQL File",
            "permission" => "perm",
            "node" => "nodejs",
            var value => value
        };

        private static bool IsAllowedHostingWorkqueueType(string type) => type is
            "Queue MSSQL Backup" or
            "Queue MSSQL Restore" or
            "Queue MySQL Backup" or
            "Queue MySQL Restore" or
            "Run MSSQL File" or
            "zip" or
            "Unzip" or
            "perm" or
            "nodejs" or
            "deploy" or
            "createpool" or
            "changepool" or
            "scanvirus";

        private static string ValidateHostingWorkqueuePayload(string type, string zipFile, string dstFolder, string data1)
        {
            if (string.IsNullOrWhiteSpace(zipFile) && type is not "createpool")
            {
                return "Worker job source is required.";
            }

            if (type is "Queue MSSQL Restore" or "Queue MySQL Restore" or "Run MSSQL File" or "zip" or "Unzip" or "perm" or "nodejs" or "deploy" or "changepool")
            {
                if (string.IsNullOrWhiteSpace(dstFolder))
                {
                    return "Worker job destination is required.";
                }
            }

            if (type is "Queue MSSQL Backup" or "Queue MySQL Backup" or "Run MSSQL File")
            {
                if (string.IsNullOrWhiteSpace(data1))
                {
                    return "Database worker jobs require a data value.";
                }
            }

            if ((zipFile.Contains("..", StringComparison.Ordinal) || dstFolder.Contains("..", StringComparison.Ordinal)) &&
                type is "zip" or "Unzip" or "perm" or "nodejs" or "deploy" or "scanvirus")
            {
                return "File paths cannot contain parent directory traversal.";
            }

            return "";
        }

        private static DatabaseFileValidationResult NormalizeDatabaseFilePath(string? value, string requiredExtension)
        {
            var text = (value ?? "").Trim().Replace('\\', '/');
            if (string.IsNullOrWhiteSpace(text))
            {
                return new DatabaseFileValidationResult(false, "", "File path is required.");
            }

            if (text.Contains("..", StringComparison.Ordinal) || text.Contains(":", StringComparison.Ordinal) || text.Contains(" ", StringComparison.Ordinal))
            {
                return new DatabaseFileValidationResult(false, "", "Database file path cannot contain spaces, drive letters, or parent directory traversal.");
            }

            if (!text.StartsWith("/", StringComparison.Ordinal))
            {
                text = "/" + text;
            }

            if (text.StartsWith("/www/", StringComparison.OrdinalIgnoreCase))
            {
                text = text[4..];
            }

            if (!text.EndsWith(requiredExtension, StringComparison.OrdinalIgnoreCase))
            {
                return new DatabaseFileValidationResult(false, "", $"Database file must end with {requiredExtension}.");
            }

            var clean = text.ToLowerInvariant();
            while (clean.Contains("//", StringComparison.Ordinal))
            {
                clean = clean.Replace("//", "/", StringComparison.Ordinal);
            }
            return new DatabaseFileValidationResult(true, clean, "");
        }

        private static string BuildOwnedWebUncPath(SelectedHostingCp cp, string relativePath)
        {
            var path = relativePath.Replace('/', '\\').TrimStart('\\');
            return $"\\\\{cp.ServerId}\\home\\{cp.CpLogin}\\www\\{path}";
        }

        private static async Task<bool> UpdatePanelTestWorkqueueAsync(SqlConnection connection, SelectedHostingCp cp, long id, HostingActivityTestRequest request)
        {
            const string sql = @"
UPDATE dbo.workqueue
SET zipfile = @from,
    dstfolder = @to,
    serverid = @serverId,
    data1 = @note,
    enterdate = GETDATE()
WHERE id = @id
  AND cplogin = @cpLogin
  AND type = 'panel-test'";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@from", TruncateWorkqueueValue(request.From, "/panel-test/from"));
            command.Parameters.AddWithValue("@to", TruncateWorkqueueValue(request.To, "/panel-test/to"));
            command.Parameters.AddWithValue("@serverId", TruncateWorkqueueValue(request.Server, "local-panel"));
            command.Parameters.AddWithValue("@note", TruncateWorkqueueValue(request.Note, "Updated from rebuilt panel_cp sandbox."));
            return await command.ExecuteNonQueryAsync() > 0;
        }

        private static async Task<bool> DeletePanelTestWorkqueueAsync(SqlConnection connection, SelectedHostingCp cp, long id)
        {
            const string sql = @"
DELETE FROM dbo.workqueue
WHERE id = @id
  AND cplogin = @cpLogin
  AND type = 'panel-test'";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            return await command.ExecuteNonQueryAsync() > 0;
        }

        private static string TruncateWorkqueueValue(string? value, string fallback)
        {
            var text = string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
            return text.Length <= 240 ? text : text[..240];
        }

        private static async Task<HostingRealTestResponse> CreateHostingRealTestAsync(SqlConnection connection, SelectedHostingCp cp, HostingRealTestRequest request)
        {
            var area = NormalizeRealTestArea(request.Area);
            var fields = request.Fields ?? new Dictionary<string, string>();
            var marker = TestMarker(fields, "name");

            if (!IsAllowedRealTestArea(area))
            {
                return new HostingRealTestResponse(false, "This action needs the real provider gateway before it can run. No row was created.", null, area, 0);
            }

            if (!IsCodexTestValue(marker))
            {
                return new HostingRealTestResponse(false, "Real test writes must use a codex-test-* name so existing data is protected.", null, area, 0);
            }

            try
            {
                return area switch
                {
                    "ftp" => await CreateRealTestFtpAsync(connection, cp, fields),
                    "redirect" => await CreateRealTestRedirectAsync(connection, cp, fields),
                    "web-deploy" => await CreateRealTestWebDeployAsync(connection, cp, fields),
                    "team-access" => await CreateRealTestTeamAccessAsync(connection, cp, fields),
                    "db-backup" => await CreateRealTestDbBackupAsync(connection, cp, fields),
                    _ => new HostingRealTestResponse(false, "Unsupported real test area.", null, area, 0)
                };
            }
            catch (SqlException ex)
            {
                return new HostingRealTestResponse(false, $"Real test write failed: {ex.Message}", null, area, 0);
            }
        }

        private static async Task<HostingRealTestResponse> UpdateHostingRealTestAsync(SqlConnection connection, SelectedHostingCp cp, long id, HostingRealTestRequest request)
        {
            var area = NormalizeRealTestArea(request.Area);
            var fields = request.Fields ?? new Dictionary<string, string>();
            var marker = TestMarker(fields, "name");

            if (!IsAllowedRealTestArea(area))
            {
                return new HostingRealTestResponse(false, "This action needs the real provider gateway before it can run.", null, area, id);
            }

            if (!IsCodexTestValue(marker))
            {
                return new HostingRealTestResponse(false, "Real test updates must use a codex-test-* name so existing data is protected.", null, area, id);
            }

            try
            {
                return area switch
                {
                    "ftp" => await UpdateRealTestFtpAsync(connection, cp, id, fields),
                    "redirect" => await UpdateRealTestRedirectAsync(connection, cp, id, fields),
                    "web-deploy" => await UpdateRealTestWebDeployAsync(connection, cp, id, fields),
                    "team-access" => await UpdateRealTestTeamAccessAsync(connection, cp, id, fields),
                    "db-backup" => await UpdateRealTestDbBackupAsync(connection, cp, id, fields),
                    _ => new HostingRealTestResponse(false, "Unsupported real test area.", null, area, id)
                };
            }
            catch (SqlException ex)
            {
                return new HostingRealTestResponse(false, $"Real test update failed: {ex.Message}", null, area, id);
            }
        }

        private static async Task<HostingRealTestResponse> DeleteHostingRealTestAsync(SqlConnection connection, SelectedHostingCp cp, string rawArea, long id, string marker = "")
        {
            var area = NormalizeRealTestArea(rawArea);
            if (!IsAllowedRealTestArea(area))
            {
                return new HostingRealTestResponse(false, "This action needs the real provider gateway before it can run.", null, area, id);
            }

            try
            {
                var deleted = area switch
                {
                    "ftp" => await DeleteBySqlAsync(connection, @"
DELETE FROM dbo.cp_config_FTP
WHERE ftp_uid = @id AND cpID = @cpId AND ftp_login LIKE 'codex-test-%'", cp.CpId, id),
                    "redirect" => await DeleteBySqlAsync(connection, @"
DELETE r
FROM dbo.cp_config_redirect r
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = r.site_uid
WHERE r.id = @id AND s.cpID = @cpId AND r.rulename LIKE 'codex-test-%'", cp.CpId, id),
                    "web-deploy" => IsCodexTestValue(marker) && await DeleteBySqlAsync(connection, @"
DELETE FROM dbo.cp_config_site_users
WHERE cpID = @cpId AND username = @marker AND username LIKE 'codex-test-%'", cp.CpId, id, "", marker),
                    "team-access" => await DeleteBySqlAsync(connection, @"
DELETE FROM dbo.cp_loginAlias
WHERE id = @id AND LOWER(forloginid) = LOWER(@cpLogin) AND username LIKE 'codex-test-%'", cp.CpId, id, cp.CpLogin),
                    "db-backup" => await DeleteBySqlAsync(connection, @"
DELETE FROM dbo.customDBBackup
WHERE id = @id AND cpid = CONVERT(varchar(50), @cpId) AND dbname LIKE 'codex-test-%'", cp.CpId, id),
                    _ => false
                };

                return deleted
                    ? new HostingRealTestResponse(true, "Real test row deleted.", null, area, id)
                    : new HostingRealTestResponse(false, "No matching codex-test row was found. Existing rows are protected.", null, area, id);
            }
            catch (SqlException ex)
            {
                return new HostingRealTestResponse(false, $"Real test delete failed: {ex.Message}", null, area, id);
            }
        }

        private static async Task<HostingRealTestResponse> CreateRealTestFtpAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var login = SafeTestName(TestMarker(fields, "name"), "codex-test-ftp");
            var path = Truncate(Field(fields, "path", $@"h:\root\home\{cp.CpLogin}\www\codex-test"), 300);
            var quota = ClampInt(Field(fields, "quota", "100"), 0, 10240);
            var permission = Truncate(Field(fields, "permission", "write"), 10);

            const string sql = @"
INSERT INTO dbo.cp_config_FTP (cpID, ftp_login, ftp_password, ftp_path, ftp_quota, ftp_permission, cpURL, pp1)
OUTPUT INSERTED.ftp_uid
VALUES (@cpId, @login, @password, @path, @quota, @permission, 'real-test-local', 'created-by-controlpanel-rebuild')";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@login", login);
            command.Parameters.AddWithValue("@password", "codex-test-password-not-for-login");
            command.Parameters.AddWithValue("@path", path);
            command.Parameters.AddWithValue("@quota", quota);
            command.Parameters.AddWithValue("@permission", permission);
            var id = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            return new HostingRealTestResponse(true, "Real FTP test row created in cp_config_FTP.", new { login, path, quota, permission }, "ftp", id);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestFtpAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var login = SafeTestName(TestMarker(fields, "name"), "codex-test-ftp");
            var path = Truncate(Field(fields, "path", $@"h:\root\home\{cp.CpLogin}\www\codex-test-edited"), 300);
            var quota = ClampInt(Field(fields, "quota", "200"), 0, 10240);
            const string sql = @"
UPDATE dbo.cp_config_FTP
SET ftp_login = @login, ftp_path = @path, ftp_quota = @quota
WHERE ftp_uid = @id AND cpID = @cpId AND ftp_login LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@login", login);
                command.Parameters.AddWithValue("@path", path);
                command.Parameters.AddWithValue("@quota", quota);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real FTP test row updated.", new { login, path, quota }, "ftp", id)
                : new HostingRealTestResponse(false, "FTP test row not found, or it is not a codex-test row.", null, "ftp", id);
        }

        private static async Task<HostingRealTestResponse> CreateRealTestRedirectAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var siteUid = await LoadFirstSiteUidAsync(connection, cp.CpId);
            if (siteUid == 0)
            {
                return new HostingRealTestResponse(false, "No website exists for redirect testing.", null, "redirect", 0);
            }

            var rule = SafeTestName(TestMarker(fields, "name"), "codex-test-redirect");
            var domain = Truncate(Field(fields, "domain", "codex-test.local"), 255);
            var destination = Truncate(Field(fields, "destination", "https://example.com/codex-test"), 255);
            const string sql = @"
INSERT INTO dbo.cp_config_redirect (site_uid, rulename, domain, source, destination, rewritetype)
OUTPUT INSERTED.id
VALUES (@siteUid, @rule, @domain, @domain, @destination, 301)";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@siteUid", siteUid);
            command.Parameters.AddWithValue("@rule", rule);
            command.Parameters.AddWithValue("@domain", domain);
            command.Parameters.AddWithValue("@destination", destination);
            var id = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            return new HostingRealTestResponse(true, "Real redirect test row created in cp_config_redirect.", new { rule, domain, destination, siteUid }, "redirect", id);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestRedirectAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var rule = SafeTestName(TestMarker(fields, "name"), "codex-test-redirect");
            var destination = Truncate(Field(fields, "destination", "https://example.com/codex-test-edited"), 255);
            const string sql = @"
UPDATE r
SET r.rulename = @rule, r.destination = @destination
FROM dbo.cp_config_redirect r
INNER JOIN dbo.cp_config_Sites s ON s.site_Uid = r.site_uid
WHERE r.id = @id AND s.cpID = @cpId AND r.rulename LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@rule", rule);
                command.Parameters.AddWithValue("@destination", destination);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real redirect test row updated.", new { rule, destination }, "redirect", id)
                : new HostingRealTestResponse(false, "Redirect test row not found, or it is not a codex-test row.", null, "redirect", id);
        }

        private static async Task<HostingRealTestResponse> CreateRealTestWebDeployAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var username = SafeTestName(TestMarker(fields, "name"), "codex-test-webdeploy");
            const string sql = @"
INSERT INTO dbo.cp_config_site_users (cpid, username, password, createdate)
VALUES (@cpId, @username, 'codex-test-password-not-for-login', GETDATE())";
            await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@username", username);
            });
            return new HostingRealTestResponse(true, "Real Web Deploy test user row created in cp_config_site_users.", new { username }, "web-deploy", 0);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestWebDeployAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var username = SafeTestName(TestMarker(fields, "name"), "codex-test-webdeploy");
            const string sql = @"
UPDATE dbo.cp_config_site_users
SET password = 'codex-test-password-edited'
WHERE cpID = @cpId AND username = @username AND username LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@username", username);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real Web Deploy test user row updated.", new { username }, "web-deploy", id)
                : new HostingRealTestResponse(false, "Web Deploy test row not found, or it is not a codex-test row.", null, "web-deploy", id);
        }

        private static async Task<HostingRealTestResponse> CreateRealTestTeamAccessAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var username = SafeTestName(TestMarker(fields, "name"), "codex-test-user");
            var accessList = Truncate(Field(fields, "accessList", "websites,databases,email"), 50);
            var siteList = Truncate(Field(fields, "siteList", "all"), 1000);
            const string sql = @"
INSERT INTO dbo.cp_loginAlias (username, password, forloginid, accesslist, disablelogin, sitelist, pp1)
OUTPUT INSERTED.id
VALUES (@username, 'codex-test-password-not-for-login', @cpLogin, @accessList, 0, @siteList, 'created-by-controlpanel-rebuild')";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@username", username);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@accessList", accessList);
            command.Parameters.AddWithValue("@siteList", siteList);
            var id = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            return new HostingRealTestResponse(true, "Real CP alias test row created in cp_loginAlias.", new { username, accessList, siteList }, "team-access", id);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestTeamAccessAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var username = SafeTestName(TestMarker(fields, "name"), "codex-test-user");
            var accessList = Truncate(Field(fields, "accessList", "websites,databases,email,ftp"), 50);
            const string sql = @"
UPDATE dbo.cp_loginAlias
SET username = @username, accesslist = @accessList
WHERE id = @id AND LOWER(forloginid) = LOWER(@cpLogin) AND username LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
                command.Parameters.AddWithValue("@username", username);
                command.Parameters.AddWithValue("@accessList", accessList);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real CP alias test row updated.", new { username, accessList }, "team-access", id)
                : new HostingRealTestResponse(false, "CP alias test row not found, or it is not a codex-test row.", null, "team-access", id);
        }

        private static async Task<HostingRealTestResponse> CreateRealTestDbBackupAsync(SqlConnection connection, SelectedHostingCp cp, Dictionary<string, string> fields)
        {
            var database = await LoadFirstDatabaseForBackupAsync(connection, cp.CpId);
            if (database == null)
            {
                return new HostingRealTestResponse(false, "No database exists for backup testing.", null, "db-backup", 0);
            }

            var name = SafeTestName(TestMarker(fields, "name"), "codex-test-dbbackup");
            var hour = ClampInt(Field(fields, "hour", "2"), 0, 23);
            const string sql = @"
INSERT INTO dbo.customDBBackup (cplogin, dbname, dbtype, cpid, dbid, certaintime, enterdate, isenable, backup_log)
OUTPUT INSERTED.id
VALUES (@cpLogin, @name, @dbType, CONVERT(varchar(50), @cpId), @dbId, @hour, GETDATE(), 1, 'created-by-controlpanel-rebuild')";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpLogin", cp.CpLogin);
            command.Parameters.AddWithValue("@name", name);
            command.Parameters.AddWithValue("@dbType", database.Value.Engine);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@dbId", database.Value.Id);
            command.Parameters.AddWithValue("@hour", hour);
            var id = Convert.ToInt64(await command.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
            return new HostingRealTestResponse(true, "Real custom DB backup test row created in customDBBackup.", new { name, database.Value.Engine, database.Value.Id, hour }, "db-backup", id);
        }

        private static async Task<HostingRealTestResponse> UpdateRealTestDbBackupAsync(SqlConnection connection, SelectedHostingCp cp, long id, Dictionary<string, string> fields)
        {
            var name = SafeTestName(TestMarker(fields, "name"), "codex-test-dbbackup");
            var hour = ClampInt(Field(fields, "hour", "3"), 0, 23);
            const string sql = @"
UPDATE dbo.customDBBackup
SET dbname = @name, certaintime = @hour
WHERE id = @id AND cpid = CONVERT(varchar(50), @cpId) AND dbname LIKE 'codex-test-%'";
            var updated = await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@cpId", cp.CpId);
                command.Parameters.AddWithValue("@name", name);
                command.Parameters.AddWithValue("@hour", hour);
            }) > 0;
            return updated
                ? new HostingRealTestResponse(true, "Real custom DB backup test row updated.", new { name, hour }, "db-backup", id)
                : new HostingRealTestResponse(false, "DB backup test row not found, or it is not a codex-test row.", null, "db-backup", id);
        }

        private static bool IsAllowedRealTestArea(string area) => area is "ftp" or "redirect" or "web-deploy" or "team-access" or "db-backup";

        private static string NormalizeRealTestArea(string? area) => (area ?? "").Trim().ToLowerInvariant();

        private static string TestMarker(Dictionary<string, string> fields, string key) => Field(fields, key, "");

        private static bool IsCodexTestValue(string value) => value.Trim().StartsWith("codex-test-", StringComparison.OrdinalIgnoreCase);

        private static string SafeTestName(string value, string fallback)
        {
            var text = IsCodexTestValue(value) ? value.Trim().ToLowerInvariant() : fallback;
            var clean = new string(text.Where(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '_' || ch == '.').ToArray());
            return Truncate(clean.StartsWith("codex-test-", StringComparison.OrdinalIgnoreCase) ? clean : fallback, 50);
        }

        private static string Field(Dictionary<string, string> fields, string key, string fallback) =>
            fields.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value) ? value.Trim() : fallback;

        private static int ClampInt(string value, int min, int max)
        {
            if (!int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var number))
            {
                number = min;
            }

            return Math.Min(max, Math.Max(min, number));
        }

        private static async Task<int> ExecuteNonQueryAsync(SqlConnection connection, string sql, Action<SqlCommand> configure)
        {
            await using var command = new SqlCommand(sql, connection);
            configure(command);
            return await command.ExecuteNonQueryAsync();
        }

        private static async Task<T> ExecuteScalarAsync<T>(SqlConnection connection, string sql, Action<SqlCommand> configure)
        {
            await using var command = new SqlCommand(sql, connection);
            configure(command);
            var result = await command.ExecuteScalarAsync();
            if (result == null || result == DBNull.Value)
            {
                return default!;
            }

            return (T)Convert.ChangeType(result, typeof(T), CultureInfo.InvariantCulture);
        }

        private static async Task DeleteSubAppInfoAsync(SqlConnection connection, int siteUid, string appPath)
        {
            var normalized = NormalizeLegacyAppPath(appPath);
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return;
            }

            await ExecuteNonQueryAsync(connection, @"
DELETE FROM dbo.cp_config_sites_subapp
WHERE site_uid = @siteUid AND (apppath = @pathNoSlash OR apppath = @pathSlash)",
                command =>
                {
                    command.Parameters.AddWithValue("@siteUid", siteUid);
                    command.Parameters.AddWithValue("@pathNoSlash", normalized);
                    command.Parameters.AddWithValue("@pathSlash", "/" + normalized);
                });
        }

        private static async Task SetSubAppInfoAsync(SqlConnection connection, int siteUid, string appPath, string settingName, string setting)
        {
            var normalized = NormalizeLegacyAppPath(appPath);
            var column = settingName.ToLowerInvariant() switch
            {
                "version" => "version",
                "detailerror" => "detailerror",
                "httpcompress" => "httpcompress",
                "caching" => "caching",
                "nodejs" => "nodejs",
                "dirbrowse" => "dirbrowse",
                "webknight" => "webknight",
                _ => ""
            };
            if (string.IsNullOrWhiteSpace(normalized) || string.IsNullOrWhiteSpace(column))
            {
                return;
            }

            var existing = await ExecuteScalarAsync<int>(connection, @"
SELECT COUNT(1)
FROM dbo.cp_config_sites_subapp
WHERE site_uid = @siteUid AND (apppath = @pathNoSlash OR apppath = @pathSlash)",
                command =>
                {
                    command.Parameters.AddWithValue("@siteUid", siteUid);
                    command.Parameters.AddWithValue("@pathNoSlash", normalized);
                    command.Parameters.AddWithValue("@pathSlash", "/" + normalized);
                });

            if (existing > 0)
            {
                await ExecuteNonQueryAsync(connection, $@"
UPDATE dbo.cp_config_sites_subapp
SET apppath = @pathSlash, {column} = @setting
WHERE site_uid = @siteUid AND (apppath = @pathNoSlash OR apppath = @pathSlash)",
                    command =>
                    {
                        command.Parameters.AddWithValue("@siteUid", siteUid);
                        command.Parameters.AddWithValue("@pathNoSlash", normalized);
                        command.Parameters.AddWithValue("@pathSlash", "/" + normalized);
                        command.Parameters.AddWithValue("@setting", setting);
                    });
                return;
            }

            await ExecuteNonQueryAsync(connection, $@"
INSERT INTO dbo.cp_config_sites_subapp ({column}, site_uid, apppath)
VALUES (@setting, @siteUid, @pathSlash)",
                command =>
                {
                    command.Parameters.AddWithValue("@siteUid", siteUid);
                    command.Parameters.AddWithValue("@pathSlash", "/" + normalized);
                    command.Parameters.AddWithValue("@setting", setting);
                });
        }

        private static async Task<long> LoadCustomerIdForCpAsync(SqlConnection connection, long cpId)
        {
            return await ExecuteScalarAsync<long>(connection, @"
SELECT TOP 1 ISNULL(customerID, 0)
FROM dbo.cp_config
WHERE cpID = @cpId",
                command => command.Parameters.AddWithValue("@cpId", cpId));
        }

        private static async Task<bool> DeleteBySqlAsync(SqlConnection connection, string sql, long cpId, long id, string cpLogin = "", string marker = "")
        {
            return await ExecuteNonQueryAsync(connection, sql, command =>
            {
                command.Parameters.AddWithValue("@cpId", cpId);
                command.Parameters.AddWithValue("@id", id);
                if (!string.IsNullOrWhiteSpace(cpLogin))
                {
                    command.Parameters.AddWithValue("@cpLogin", cpLogin);
                }
                if (!string.IsNullOrWhiteSpace(marker))
                {
                    command.Parameters.AddWithValue("@marker", marker);
                }
            }) > 0;
        }

        private LegacyAgentSettings GetLegacyAgentSettings()
        {
            var domain = ConfigOrEnv("LegacyAgent:ServerDomainName", "LEGACY_SERVER_DOMAIN_NAME").Trim();
            var scheme = ConfigOrEnv("LegacyAgent:Scheme", "LEGACY_AGENT_SCHEME", "http").Trim();
            var portText = ConfigOrEnv("LegacyAgent:Port", "LEGACY_AGENT_PORT", "830").Trim();
            var hasPort = int.TryParse(portText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var port);
            return new LegacyAgentSettings(
                string.IsNullOrWhiteSpace(scheme) ? "http" : scheme,
                string.IsNullOrWhiteSpace(domain) ? "site4now.net" : domain,
                hasPort ? port : 830);
        }

        private LegacyRemoteCommandSettings GetLegacyRemoteCommandSettings()
        {
            var scheme = ConfigOrEnv("LegacyRemoteCommand:Scheme", "LEGACY_REMOTE_CMD_SCHEME", "https").Trim();
            var portText = ConfigOrEnv("LegacyRemoteCommand:Port", "LEGACY_REMOTE_CMD_PORT", "8443").Trim();
            var hasPort = int.TryParse(portText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var port);
            return new LegacyRemoteCommandSettings(
                string.IsNullOrWhiteSpace(scheme) ? "https" : scheme,
                hasPort ? port : 8443,
                ConfigOrEnv("LegacyRemoteCommand:Path", "LEGACY_REMOTE_CMD_PATH", "/remotefunc.asp").Trim(),
                ConfigOrEnv("LegacyRemoteCommand:TokenHost", "LEGACY_REMOTE_CMD_TOKEN_HOST", "win5000a.smarterasp.net").Trim(),
                ConfigOrEnv("LegacyRemoteCommand:StaticToken", "LEGACY_REMOTE_CMD_STATIC_TOKEN").Trim(),
                ConfigOrEnv("LegacyRemoteCommand:Md5Seed", "LEGACY_REMOTE_CMD_MD5_SEED").Trim());
        }

        private FileManagerAgentSettings GetFileManagerAgentSettings()
        {
            var path = ConfigOrEnv("FileManagerAgent:Path", "FILE_MANAGER_AGENT_PATH", "/new/getFilesFolder.asp").Trim();
            var actionPath = ConfigOrEnv("FileManagerAgent:ActionPath", "FILE_MANAGER_ACTION_AGENT_PATH", "/new/fileManagerAction.asp").Trim();
            var sharedSecret = ConfigOrEnv("FileManagerAgent:SharedSecret", "FM_AGENT_SHARED_SECRET").Trim();
            var encryptKey = ConfigOrEnv("FileManagerAgent:EncryptKey", "FILE_MANAGER_ENCRYPT_KEY").Trim();
            return new FileManagerAgentSettings(
                string.IsNullOrWhiteSpace(path) ? "/new/getFilesFolder.asp" : path,
                string.IsNullOrWhiteSpace(actionPath) ? "/new/fileManagerAction.asp" : actionPath,
                sharedSecret,
                encryptKey);
        }

        private SmarterMailSettings GetSmarterMailSettings()
        {
            var apiBaseUrl = ConfigOrEnv("LegacyMail:ApiBaseUrl", "LEGACY_MAIL_API_BASE_URL", "http://member.smarterasp.net/mailboxquota2").Trim();
            var defaultServer = ConfigOrEnv("LegacyMail:DefaultServer", "LEGACY_MAIL_DEFAULT_SERVER").Trim();
            return new SmarterMailSettings(apiBaseUrl, defaultServer);
        }

        private LegacySharedApiSettings GetLegacySharedApiSettings()
        {
            var host = ConfigOrEnv("LegacySharedApi:Host", "LEGACY_SHARED_API_HOST", "api.smarterasp.net").Trim();
            var scheme = ConfigOrEnv("LegacySharedApi:Scheme", "LEGACY_SHARED_API_SCHEME", "http").Trim();
            var portText = ConfigOrEnv("LegacySharedApi:Port", "LEGACY_SHARED_API_PORT", "80").Trim();
            var hasPort = int.TryParse(portText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var port);
            return new LegacySharedApiSettings(
                string.IsNullOrWhiteSpace(scheme) ? "http" : scheme,
                host,
                hasPort ? port : 80);
        }

        private static async Task<LegacyAgentCallResult> PostLegacySharedApiAsync(LegacySharedApiSettings settings, string path, Dictionary<string, string> form)
        {
            if (!settings.IsConfigured)
            {
                return new LegacyAgentCallResult(false, settings.MissingMessage, "", "", null);
            }

            var url = $"{settings.Scheme}://{settings.Host}:{settings.Port}{path}";
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
                using var content = new FormUrlEncodedContent(form);
                var response = await httpClient.PostAsync(url, content);
                var body = await response.Content.ReadAsStringAsync();
                var accepted = response.IsSuccessStatusCode &&
                    !body.TrimStart().StartsWith("[[Error]]", StringComparison.OrdinalIgnoreCase) &&
                    !body.Contains("error", StringComparison.OrdinalIgnoreCase);

                return accepted
                    ? new LegacyAgentCallResult(true, "Legacy shared API accepted the request.", url, Preview(body), new { status = (int)response.StatusCode })
                    : new LegacyAgentCallResult(false, $"Legacy shared API rejected the request: {Preview(body)}", url, Preview(body), new { status = (int)response.StatusCode });
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return new LegacyAgentCallResult(false, $"Legacy shared API call failed: {ex.Message}", url, "", null);
            }
        }

        private static async Task<LegacyAgentCallResult> PostLegacyRemoteCommandAsync(LegacyAgentSettings agentSettings, LegacyRemoteCommandSettings commandSettings, string serverId, long customerId, string command)
        {
            if (!commandSettings.IsConfigured)
            {
                return new LegacyAgentCallResult(false, commandSettings.MissingMessage, "", "", null);
            }

            var tokenHost = $"{serverId}{GenerateResetToken()[..10]}";
            var tokenSetUrl = $"http://{commandSettings.TokenHost}:80/api.asp";
            var host = BuildLegacyHost(agentSettings, serverId);
            var path = string.IsNullOrWhiteSpace(commandSettings.Path) ? "/remotefunc.asp" : commandSettings.Path;
            var remoteUrl = $"{commandSettings.Scheme}://{host}:{commandSettings.Port}{path}";
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(100) };
                var tokenSetResponse = await httpClient.PostAsync(tokenSetUrl, new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["action"] = "tokenSet",
                    ["serverid"] = tokenHost
                }));
                var stoken3 = (await tokenSetResponse.Content.ReadAsStringAsync()).Trim();
                if (!tokenSetResponse.IsSuccessStatusCode || string.IsNullOrWhiteSpace(stoken3))
                {
                    return new LegacyAgentCallResult(false, $"Remote command token setup failed: {Preview(stoken3)}", tokenSetUrl, Preview(stoken3), new { status = (int)tokenSetResponse.StatusCode });
                }

                var now = DateTime.Now;
                var stoken2 = HashHex(MD5.HashData(Encoding.UTF8.GetBytes($"{commandSettings.Md5Seed}{customerId}{now.Year}{now.Day}")));
                var form = new Dictionary<string, string>
                {
                    ["action"] = "remote_cmd",
                    ["stoken"] = commandSettings.StaticToken,
                    ["stoken2"] = stoken2,
                    ["cid"] = customerId.ToString(CultureInfo.InvariantCulture),
                    ["stoken3"] = stoken3,
                    ["serverid"] = tokenHost,
                    ["cmd"] = command
                };

                var response = await httpClient.PostAsync(remoteUrl, new FormUrlEncodedContent(form));
                var body = await response.Content.ReadAsStringAsync();
                var accepted = response.IsSuccessStatusCode && !body.TrimStart().StartsWith("[[Error]]", StringComparison.OrdinalIgnoreCase);
                return accepted
                    ? new LegacyAgentCallResult(true, "Legacy remote command accepted the request.", remoteUrl, Preview(body), new { status = (int)response.StatusCode })
                    : new LegacyAgentCallResult(false, $"Legacy remote command rejected the request: {Preview(body)}", remoteUrl, Preview(body), new { status = (int)response.StatusCode });
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return new LegacyAgentCallResult(false, $"Legacy remote command failed: {ex.Message}", remoteUrl, "", null);
            }
        }

        private static string BuildCloudflareCommand(string action, OwnedMappedDomain domain, Dictionary<string, string> fields, string accountUserKey)
        {
            var rootDomain = GetRootDomain(domain.Domain);
            var subdomain = domain.Domain.EndsWith($".{rootDomain}", StringComparison.OrdinalIgnoreCase)
                ? domain.Domain[..^(rootDomain.Length + 1)]
                : "";
            var userKey = string.IsNullOrWhiteSpace(accountUserKey) ? GetField(fields, "userKey", "").Trim() : accountUserKey;
            var currentCdnList = GetField(fields, "currentCdnList", "").Trim();
            var cdnDomain = string.IsNullOrWhiteSpace(subdomain) ? "www" : subdomain;

            return action switch
            {
                "enable-cdn" or "add-zone" when !string.IsNullOrWhiteSpace(userKey) =>
                    $" ZONE_SET {userKey} {rootDomain} resolve-to-cloudflare.{rootDomain} {currentCdnList}{cdnDomain}",
                "disable-cdn" when !string.IsNullOrWhiteSpace(userKey) =>
                    $" ZONE_SET {userKey} {rootDomain} resolve-to-cloudflare.{rootDomain} {currentCdnList}",
                _ => ""
            };
        }

        private static string GetRootDomain(string domain)
        {
            var parts = (domain ?? "").Trim('.').Split('.', StringSplitOptions.RemoveEmptyEntries);
            return parts.Length <= 2
                ? string.Join('.', parts)
                : string.Join('.', parts.Skip(parts.Length - 2));
        }

        private static string NormalizeDomainServiceAction(string action, string fallback)
        {
            var value = (action ?? "").Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(value))
            {
                return fallback;
            }

            return value.Replace(" ", "-").Replace("_", "-");
        }

        private static string GetField(Dictionary<string, string>? fields, string key, string fallback = "")
        {
            if (fields != null && fields.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value))
            {
                return value.Trim();
            }

            return fallback;
        }

        private static int ClampInt(string value, int min, int max, int fallback)
        {
            if (!int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
            {
                return fallback;
            }

            return Math.Max(min, Math.Min(max, parsed));
        }

        private static string NormalizeDnsHost(string host, string domain)
        {
            var value = (host ?? "").Trim();
            if (string.IsNullOrWhiteSpace(value) || value == "@")
            {
                return domain;
            }

            return value.EndsWith($".{domain}", StringComparison.OrdinalIgnoreCase) ? value : $"{value}.{domain}";
        }

        private bool IsTemporaryHostingDomain(string domain)
        {
            var value = (domain ?? "").ToLowerInvariant();
            var patterns = ConfigOrEnv("HostingDefaults:TempDomainPatterns", "HOSTING_TEMP_DOMAIN_PATTERNS", "tempurl|-site|.site4now.net")
                .Split(new[] { '|', ',', ';', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(pattern => pattern.ToLowerInvariant())
                .Where(pattern => !string.IsNullOrWhiteSpace(pattern));

            return patterns.Any(pattern => value.Contains(pattern, StringComparison.Ordinal));
        }

        private static async Task<LegacyMailCallResult> PostLegacyMailAsync(string url, Func<string, bool> isAccepted)
        {
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(25) };
                var response = await httpClient.PostAsync(url, new StringContent(""));
                var body = await response.Content.ReadAsStringAsync();
                return new LegacyMailCallResult(response.IsSuccessStatusCode && isAccepted(body), Preview(body), (int)response.StatusCode);
            }
            catch (Exception ex)
            {
                return new LegacyMailCallResult(false, Preview(ex.Message), 0);
            }
        }

        private async Task<string> ResolveLegacyMailServerIpAsync(string serverId)
        {
            var host = (serverId ?? "").Trim();
            if (string.IsNullOrWhiteSpace(host))
            {
                return "";
            }

            if (IPAddress.TryParse(host, out var parsed))
            {
                return parsed.ToString();
            }

            host = BuildLegacyPublicHost(host);

            try
            {
                var addresses = await Dns.GetHostAddressesAsync(host);
                return addresses.FirstOrDefault(address => address.AddressFamily == AddressFamily.InterNetwork)?.ToString() ?? addresses.FirstOrDefault()?.ToString() ?? "";
            }
            catch
            {
                return "";
            }
        }

        private static string GenerateReadablePassword()
        {
            const string chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#";
            Span<byte> bytes = stackalloc byte[14];
            RandomNumberGenerator.Fill(bytes);
            var builder = new StringBuilder(bytes.Length);
            foreach (var value in bytes)
            {
                builder.Append(chars[value % chars.Length]);
            }

            return builder.ToString();
        }

        private static async Task<LegacyAgentCallResult> PostLegacyAgentAsync(LegacyAgentSettings settings, string serverId, string path, Dictionary<string, string> form)
        {
            var host = BuildLegacyHost(settings, serverId);
            if (string.IsNullOrWhiteSpace(host))
            {
                return new LegacyAgentCallResult(false, "Legacy server host is missing.", "", "", null);
            }

            var url = $"{settings.Scheme}://{host}:{settings.Port}{path}";
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
                using var content = new FormUrlEncodedContent(form);
                var response = await httpClient.PostAsync(url, content);
                var body = await response.Content.ReadAsStringAsync();
                var accepted = response.IsSuccessStatusCode &&
                    !body.TrimStart().StartsWith("[[Error]]", StringComparison.OrdinalIgnoreCase) &&
                    !body.Contains("error", StringComparison.OrdinalIgnoreCase);

                return accepted
                    ? new LegacyAgentCallResult(true, "Legacy agent accepted the request.", url, Preview(body), new { status = (int)response.StatusCode })
                    : new LegacyAgentCallResult(false, $"Legacy agent rejected the request: {Preview(body)}", url, Preview(body), new { status = (int)response.StatusCode });
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return new LegacyAgentCallResult(false, $"Legacy agent call failed: {ex.Message}", url, "", null);
            }
        }

        private static async Task<LegacyAgentCallResult> PostLegacyJsonAgentAsync(LegacyAgentSettings settings, string serverId, string path, Dictionary<string, string> form)
        {
            var host = BuildLegacyHost(settings, serverId);
            if (string.IsNullOrWhiteSpace(host))
            {
                return new LegacyAgentCallResult(false, "Legacy server host is missing.", "", "", null);
            }

            var normalizedPath = path.StartsWith("/", StringComparison.Ordinal) ? path : "/" + path;
            var url = $"{settings.Scheme}://{host}:{settings.Port}{normalizedPath}";
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
                using var content = new FormUrlEncodedContent(form);
                var response = await httpClient.PostAsync(url, content);
                var body = await response.Content.ReadAsStringAsync();
                var compact = body.Replace(" ", "", StringComparison.Ordinal)
                    .Replace("\r", "", StringComparison.Ordinal)
                    .Replace("\n", "", StringComparison.Ordinal)
                    .Replace("\t", "", StringComparison.Ordinal)
                    .ToLowerInvariant();
                var accepted = response.IsSuccessStatusCode && compact.Contains("\"success\":true", StringComparison.Ordinal);
                var failureMessage = response.StatusCode == HttpStatusCode.Unauthorized
                    ? "Legacy JSON agent rejected the request. Check the file-manager agent access mode and account path permissions on the Windows server."
                    : $"Legacy JSON agent rejected the request: {Preview(body)}";

                return accepted
                    ? new LegacyAgentCallResult(true, "Legacy JSON agent accepted the request.", url, Preview(body), new { status = (int)response.StatusCode, json = true }, body)
                    : new LegacyAgentCallResult(false, failureMessage, url, Preview(body), new { status = (int)response.StatusCode, json = true }, body);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return new LegacyAgentCallResult(false, $"Legacy JSON agent call failed: {ex.Message}", url, "", null);
            }
        }

        private static async Task<HostingFileAgentHealth> GetLegacyAgentHealthAsync(LegacyAgentSettings settings, string serverId, string path)
        {
            var host = BuildLegacyHost(settings, serverId);
            if (string.IsNullOrWhiteSpace(host))
            {
                return new HostingFileAgentHealth(false, path, "", 0, "Legacy server host is missing.", "");
            }

            var normalizedPath = path.StartsWith("/", StringComparison.Ordinal) ? path : "/" + path;
            var url = $"{settings.Scheme}://{host}:{settings.Port}{normalizedPath}?health=1";
            try
            {
                using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(12) };
                var response = await httpClient.GetAsync(url);
                var body = await response.Content.ReadAsStringAsync();
                var compact = body.Replace(" ", "", StringComparison.Ordinal)
                    .Replace("\r", "", StringComparison.Ordinal)
                    .Replace("\n", "", StringComparison.Ordinal)
                    .Replace("\t", "", StringComparison.Ordinal)
                    .ToLowerInvariant();
                var success = response.IsSuccessStatusCode && compact.Contains("\"success\":true", StringComparison.Ordinal);
                return new HostingFileAgentHealth(success, normalizedPath, url, (int)response.StatusCode, success ? "Healthy" : "Health check rejected.", Preview(body));
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                return new HostingFileAgentHealth(false, normalizedPath, url, 0, ex.Message, "");
            }
        }

        private static string BuildLegacyHost(LegacyAgentSettings settings, string serverId)
        {
            var server = SafeServerId(serverId);
            if (string.IsNullOrWhiteSpace(server))
            {
                return "";
            }

            if (server.Contains('.', StringComparison.Ordinal))
            {
                return server;
            }

            return string.IsNullOrWhiteSpace(settings.ServerDomainName) ? "" : $"{server}.{settings.ServerDomainName}".ToLowerInvariant();
        }

        private static async Task<bool> RowExistsAsync(SqlConnection connection, string sql, string name, long cpId = 0)
        {
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@name", name);
            if (cpId > 0)
            {
                command.Parameters.AddWithValue("@cpId", cpId);
            }

            var value = await command.ExecuteScalarAsync();
            return value != null && value != DBNull.Value && Convert.ToInt32(value, CultureInfo.InvariantCulture) > 0;
        }

        private static async Task<bool> TableColumnExistsAsync(SqlConnection connection, string tableName, string columnName)
        {
            const string sql = @"
SELECT COUNT(*)
FROM sys.columns
WHERE object_id = OBJECT_ID(@tableName)
  AND name = @columnName";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@tableName", $"dbo.{tableName}");
            command.Parameters.AddWithValue("@columnName", columnName);
            var value = await command.ExecuteScalarAsync();
            return value != null && value != DBNull.Value && Convert.ToInt32(value, CultureInfo.InvariantCulture) > 0;
        }

        private static async Task<bool> TableExistsAsync(SqlConnection connection, string tableName)
        {
            const string sql = "SELECT COUNT(*) FROM sys.objects WHERE object_id = OBJECT_ID(@tableName) AND type IN ('U', 'V')";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@tableName", $"dbo.{tableName}");
            var value = await command.ExecuteScalarAsync();
            return value != null && value != DBNull.Value && Convert.ToInt32(value, CultureInfo.InvariantCulture) > 0;
        }

        private static string SafeProvisionName(string? value, int maxLength, bool allowDash)
        {
            var text = (value ?? "").Trim();
            var clean = new string(text.Where(ch => char.IsLetterOrDigit(ch) || ch == '_' || (allowDash && ch == '-')).ToArray());
            return Truncate(clean, maxLength);
        }

        private static bool IsDisposableDatabaseName(string value)
        {
            var normalized = (value ?? "").Trim().ToLowerInvariant();
            return normalized.StartsWith("codex-test-", StringComparison.Ordinal)
                || normalized.StartsWith("codex_test_", StringComparison.Ordinal)
                || normalized.Contains("_codex_test_", StringComparison.Ordinal)
                || normalized.Contains("_codextest_", StringComparison.Ordinal);
        }

        private static string NormalizeLegacyFtpLogin(string? value, int maxLength)
        {
            var text = (value ?? "").Trim()
                .Replace(".", "_", StringComparison.Ordinal)
                .Replace("-0", "_0", StringComparison.Ordinal);
            return SafeProvisionName(text, maxLength, allowDash: true);
        }

        private static string SafeServerId(string? value)
        {
            var text = (value ?? "").Trim();
            var clean = new string(text.Where(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '.').ToArray());
            return Truncate(clean, 80);
        }

        private static string NormalizeProvisionDomainName(string? value)
        {
            var text = (value ?? "").Trim().Trim('.').ToLowerInvariant();
            var clean = new string(text.Where(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '.').ToArray());
            return clean.Contains('.', StringComparison.Ordinal) ? Truncate(clean, 255) : "";
        }

        private static string NormalizeFtpPermission(string? value)
        {
            var text = (value ?? "").Trim().ToLowerInvariant();
            if (text.Contains("read", StringComparison.OrdinalIgnoreCase) && !text.Contains("write", StringComparison.OrdinalIgnoreCase))
            {
                return "read";
            }

            if (text.Contains("write", StringComparison.OrdinalIgnoreCase) && !text.Contains("read", StringComparison.OrdinalIgnoreCase))
            {
                return "write";
            }

            return "write";
        }

        private static FtpPathValidationResult NormalizeOwnedHostingAbsolutePath(string? value, string cpLogin, bool allowEmpty = false)
        {
            var text = (value ?? "").Trim();
            if (string.IsNullOrWhiteSpace(text))
            {
                return allowEmpty
                    ? new FtpPathValidationResult(true, "", "")
                    : new FtpPathValidationResult(false, "", "FTP path is required.");
            }

            text = text.Replace('/', '\\').Trim();
            while (text.Contains(@"\\", StringComparison.Ordinal))
            {
                text = text.Replace(@"\\", @"\", StringComparison.Ordinal);
            }

            if (text.Contains("..", StringComparison.Ordinal) || text.StartsWith(@"\\", StringComparison.Ordinal))
            {
                return new FtpPathValidationResult(false, "", "FTP path must stay inside the hosting account folder.");
            }

            var root = $@"h:\root\home\{cpLogin}".ToLowerInvariant();
            var startsWithRoot = text.ToLowerInvariant().StartsWith(root, StringComparison.OrdinalIgnoreCase);
            var looksLikeAbsoluteDrivePath = text.Length > 2 && char.IsLetter(text[0]) && text[1] == ':';
            if (looksLikeAbsoluteDrivePath && !startsWithRoot)
            {
                return new FtpPathValidationResult(false, "", "FTP path must stay inside the selected hosting account.");
            }

            var full = startsWithRoot
                ? text
                : $@"h:\root\home\{cpLogin}\{text.TrimStart('\\')}";

            full = full.Replace('/', '\\').TrimEnd('\\');
            if (!full.ToLowerInvariant().StartsWith(root, StringComparison.OrdinalIgnoreCase))
            {
                return new FtpPathValidationResult(false, "", "FTP path must stay inside the selected hosting account.");
            }

            return new FtpPathValidationResult(true, Truncate(full, 300), "");
        }

        private static async Task<OwnedHostingFtpUser?> LoadOwnedFtpUserAsync(SqlConnection connection, SelectedHostingCp cp, string login)
        {
            const string sql = @"
SELECT TOP 1 ftp_uid,
       ftp_login,
       ftp_path,
       ftp_quota,
       ftp_permission,
       cpurl
FROM dbo.cp_config_FTP
WHERE cpID = @cpId AND LOWER(ftp_login) = LOWER(@login)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cp.CpId);
            command.Parameters.AddWithValue("@login", login);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var ftpLogin = reader.IsDBNull(1) ? "" : reader.GetString(1).Trim();
            var permission = reader.IsDBNull(4) ? "" : reader.GetString(4).Trim();
            return new OwnedHostingFtpUser(
                Convert.ToInt64(reader.GetValue(0), CultureInfo.InvariantCulture),
                ftpLogin,
                reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                reader.IsDBNull(3) ? 0 : Convert.ToInt32(reader.GetValue(3), CultureInfo.InvariantCulture),
                string.IsNullOrWhiteSpace(permission) ? "write" : permission,
                reader.IsDBNull(5) ? "" : reader.GetString(5).Trim(),
                ftpLogin.Equals(cp.CpLogin, StringComparison.OrdinalIgnoreCase)
            );
        }

        private static string ResolveFtpAgentHost(LegacyAgentSettings agent, SelectedHostingCp cp, OwnedHostingFtpUser user)
        {
            if (!string.IsNullOrWhiteSpace(user.Server))
            {
                return user.Server;
            }

            return BuildLegacyHost(agent, cp.ServerId);
        }

        private async Task<HostingFileManagerResponse> RunFileManagerBrowseAsync(SelectedHostingCp cp, string path, string search, string sortBy, string orderBy)
        {
            var home = BuildHostingHomePath(cp);
            var normalized = NormalizeOwnedFileManagerPath(path, home, allowEmpty: true);
            if (!normalized.Success)
            {
                return new HostingFileManagerResponse(false, normalized.Message, null);
            }

            var selectedPath = string.IsNullOrWhiteSpace(normalized.Path) ? home : normalized.Path;
            var legacyAgent = GetLegacyAgentSettings();
            var fileAgent = GetFileManagerAgentSettings();
            if (!fileAgent.IsConfigured)
            {
                return new HostingFileManagerResponse(false, fileAgent.MissingMessage, null);
            }

            var form = new Dictionary<string, string>
            {
                ["page"] = "1",
                ["pageSize"] = "250",
                ["u"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, cp.CpLogin),
                ["b"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, home),
                ["p"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, selectedPath),
                ["sortBy"] = SafeFileManagerSort(sortBy),
                ["orderBy"] = SafeFileManagerOrder(orderBy),
                ["search"] = search ?? ""
            };
            if (!string.IsNullOrWhiteSpace(fileAgent.SharedSecret))
            {
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
                var nonce = GenerateResetToken()[..32];
                form["ts"] = timestamp;
                form["nonce"] = nonce;
                form["sig"] = BuildFileManagerAgentSignature(cp.CpLogin, home, selectedPath, timestamp, nonce, fileAgent.SharedSecret);
            }

            var call = await PostLegacyJsonAgentAsync(legacyAgent, cp.ServerId, fileAgent.Path, form);
            var listing = call.Success ? ParseFileManagerListing(call.Body) : HostingFileManagerListing.Empty;
            var payload = new HostingFileManagerPayload(
                cp.CpId,
                cp.CpLogin,
                home,
                selectedPath,
                "browse",
                call.Url,
                call.Preview,
                call.Metadata,
                listing.Folders,
                listing.Files,
                listing.ParentPath,
                listing.CurrentPath,
                listing.TotalFolders,
                listing.TotalFiles,
                listing.Page,
                listing.PageSize);
            return new HostingFileManagerResponse(call.Success, call.Success ? "File manager folder loaded." : call.Message, payload);
        }

        private static string BuildFileManagerAgentSignature(string user, string basePath, string selectedPath, string timestamp, string nonce, string sharedSecret)
        {
            var material = $"{user}|{basePath}|{selectedPath}|{timestamp}|{nonce}|{sharedSecret}";
            return HashHex(SHA256.HashData(Encoding.UTF8.GetBytes(material)));
        }

        private static HostingFileManagerListing ParseFileManagerListing(string body)
        {
            if (string.IsNullOrWhiteSpace(body))
            {
                return HostingFileManagerListing.Empty;
            }

            try
            {
                using var document = JsonDocument.Parse(body);
                var root = document.RootElement;
                var folders = ReadFileManagerItems(root, "folders");
                var files = ReadFileManagerItems(root, "files");
                return new HostingFileManagerListing(
                    folders,
                    files,
                    JsonStringProperty(root, "parentPath"),
                    JsonStringProperty(root, "currentPath"),
                    JsonIntProperty(root, "totalFolders", folders.Count),
                    JsonIntProperty(root, "totalFiles", files.Count),
                    JsonIntProperty(root, "page", 1),
                    JsonIntProperty(root, "pageSize", Math.Max(1, folders.Count + files.Count)));
            }
            catch (JsonException)
            {
                return HostingFileManagerListing.Empty;
            }
        }

        private static List<HostingFileManagerItem> ReadFileManagerItems(JsonElement root, string propertyName)
        {
            var items = new List<HostingFileManagerItem>();
            if (!root.TryGetProperty(propertyName, out var array) || array.ValueKind != JsonValueKind.Array)
            {
                return items;
            }

            foreach (var item in array.EnumerateArray())
            {
                var isFolder = JsonBoolProperty(item, "isFolder", string.Equals(propertyName, "folders", StringComparison.OrdinalIgnoreCase));
                items.Add(new HostingFileManagerItem(
                    JsonStringProperty(item, "name"),
                    JsonStringProperty(item, "relativePath"),
                    JsonLongProperty(item, "size", 0),
                    JsonStringProperty(item, "modified"),
                    JsonStringProperty(item, "created"),
                    JsonStringProperty(item, "type", isFolder ? "folder" : "file"),
                    isFolder,
                    JsonBoolProperty(item, "isEditable", false),
                    JsonStringProperty(item, "extension")));
            }

            return items;
        }

        private static string JsonStringProperty(JsonElement element, string name, string fallback = "")
        {
            return element.TryGetProperty(name, out var value) && value.ValueKind != JsonValueKind.Null
                ? value.ToString()
                : fallback;
        }

        private static bool JsonBoolProperty(JsonElement element, string name, bool fallback)
        {
            if (!element.TryGetProperty(name, out var value))
            {
                return fallback;
            }

            if (value.ValueKind == JsonValueKind.True) return true;
            if (value.ValueKind == JsonValueKind.False) return false;
            return bool.TryParse(value.ToString(), out var parsed) ? parsed : fallback;
        }

        private static int JsonIntProperty(JsonElement element, string name, int fallback)
        {
            if (!element.TryGetProperty(name, out var value))
            {
                return fallback;
            }

            return value.TryGetInt32(out var parsed) ? parsed : fallback;
        }

        private static long JsonLongProperty(JsonElement element, string name, long fallback)
        {
            if (!element.TryGetProperty(name, out var value))
            {
                return fallback;
            }

            return value.TryGetInt64(out var parsed) ? parsed : fallback;
        }

        private async Task<HostingFileManagerResponse> RunFileManagerActionAsync(SqlConnection connection, SelectedHostingCp cp, HostingFileManagerActionRequest request)
        {
            var home = BuildHostingHomePath(cp);
            var normalized = NormalizeOwnedFileManagerPath(request.Path, home, allowEmpty: true);
            if (!normalized.Success)
            {
                return new HostingFileManagerResponse(false, normalized.Message, null);
            }

            var selectedPath = string.IsNullOrWhiteSpace(normalized.Path) ? home : normalized.Path;
            var action = (request.Action ?? "").Trim().ToLowerInvariant();
            var fileAgent = GetFileManagerAgentSettings();
            var name = SafeFileManagerName(request.Name);
            var target = NormalizeOwnedFileManagerPath(request.TargetPath, home, allowEmpty: true);
            if (!target.Success)
            {
                return new HostingFileManagerResponse(false, target.Message, null);
            }

            var route = "";
            var form = new Dictionary<string, string>
            {
                ["u"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, cp.CpLogin),
                ["b"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, home),
                ["p"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, selectedPath),
                ["path"] = selectedPath
            };

            switch (action)
            {
                case "new-folder":
                case "create-folder":
                    if (string.IsNullOrWhiteSpace(name))
                    {
                        return new HostingFileManagerResponse(false, "Folder name is required.", null);
                    }
                    route = GetFileManagerAgentSettings().ActionPath;
                    form["action"] = "new-folder";
                    form["name"] = name;
                    break;
                case "read-file":
                case "edit-file":
                    if (string.IsNullOrWhiteSpace(name))
                    {
                        return new HostingFileManagerResponse(false, "File name is required.", null);
                    }
                    route = GetFileManagerAgentSettings().ActionPath;
                    form.Clear();
                    form["u"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, cp.CpLogin);
                    form["b"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, home);
                    form["p"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, selectedPath);
                    form["action"] = "read-file";
                    form["name"] = name;
                    break;
                case "save-file":
                case "new-file":
                    var saveName = string.IsNullOrWhiteSpace(request.TargetName) ? name : SafeFileManagerName(request.TargetName);
                    if (string.IsNullOrWhiteSpace(saveName))
                    {
                        return new HostingFileManagerResponse(false, "File name is required.", null);
                    }
                    var savePath = NormalizeOwnedFileManagerPath($@"{selectedPath}\{saveName}", home);
                    if (!savePath.Success)
                    {
                        return new HostingFileManagerResponse(false, savePath.Message, null);
                    }
                    route = GetFileManagerAgentSettings().ActionPath;
                    form.Clear();
                    form["u"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, cp.CpLogin);
                    form["b"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, home);
                    form["p"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, selectedPath);
                    form["action"] = action == "new-file" ? "new-file" : "save-file";
                    form["name"] = saveName;
                    form["content"] = request.Content ?? "";
                    break;
                case "rename":
                    if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(request.TargetName))
                    {
                        return new HostingFileManagerResponse(false, "Current file/folder name and new name are required.", null);
                    }
                    route = GetFileManagerAgentSettings().ActionPath;
                    form["action"] = "rename";
                    form["name"] = name;
                    form["targetName"] = SafeFileManagerName(request.TargetName);
                    break;
                case "copy":
                case "move":
                    if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(target.Path))
                    {
                        return new HostingFileManagerResponse(false, "Source name and target path are required.", null);
                    }
                    route = GetFileManagerAgentSettings().ActionPath;
                    form["action"] = action;
                    form["name"] = name;
                    form["targetPath"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, target.Path);
                    form["targetName"] = SafeFileManagerName(request.TargetName);
                    form["overwrite"] = request.Overwrite ? "1" : "0";
                    break;
                case "delete":
                    if (string.IsNullOrWhiteSpace(name))
                    {
                        return new HostingFileManagerResponse(false, "File or folder name is required.", null);
                    }
                    if (!name.StartsWith("codex-test-", StringComparison.OrdinalIgnoreCase))
                    {
                        return new HostingFileManagerResponse(false, "Delete is guarded to codex-test-* file manager items only.", null);
                    }
                    route = GetFileManagerAgentSettings().ActionPath;
                    form["action"] = "delete";
                    form["name"] = name;
                    break;
                case "zip":
                    if (string.IsNullOrWhiteSpace(name))
                    {
                        return new HostingFileManagerResponse(false, "File or folder name is required.", null);
                    }
                    var sourceToZip = NormalizeOwnedFileManagerPath($@"{selectedPath}\{name}", home);
                    if (!sourceToZip.Success)
                    {
                        return new HostingFileManagerResponse(false, sourceToZip.Message, null);
                    }
                    var packName = SafeFileManagerName(string.IsNullOrWhiteSpace(request.TargetName) ? $"{name}.zip" : request.TargetName);
                    if (!packName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                    {
                        packName += ".zip";
                    }
                    var zipDestination = NormalizeOwnedFileManagerPath($@"{selectedPath}\{packName}", home);
                    if (!zipDestination.Success)
                    {
                        return new HostingFileManagerResponse(false, zipDestination.Message, null);
                    }
                    var zipQueue = await CreateHostingWorkqueueAsync(connection, cp, new HostingWorkqueueRequest(
                        cp.CpId,
                        "zip",
                        sourceToZip.Path,
                        zipDestination.Path,
                        cp.ServerId,
                        "",
                        name,
                        "file-manager"));
                    return new HostingFileManagerResponse(zipQueue.Success, zipQueue.Message, new HostingFileManagerPayload(cp.CpId, cp.CpLogin, home, selectedPath, action, "", "", zipQueue));
                case "unzip":
                    if (string.IsNullOrWhiteSpace(name))
                    {
                        return new HostingFileManagerResponse(false, "Zip file name is required.", null);
                    }
                    route = GetFileManagerAgentSettings().ActionPath;
                    form["action"] = "unzip";
                    form["name"] = name.Replace(":", "", StringComparison.Ordinal);
                    form["targetPath"] = EncodeFileManagerAgentValue(fileAgent.EncryptKey, string.IsNullOrWhiteSpace(target.Path) ? selectedPath : target.Path);
                    break;
                default:
                    return new HostingFileManagerResponse(false, "Unsupported file manager action.", null);
            }

            var usesJsonActionAgent = route.Equals(GetFileManagerAgentSettings().ActionPath, StringComparison.OrdinalIgnoreCase);
            var call = usesJsonActionAgent
                ? await PostLegacyJsonAgentAsync(GetLegacyAgentSettings(), cp.ServerId, route, form)
                : await PostLegacyAgentAsync(GetLegacyAgentSettings(), cp.ServerId, route, form);
            var preview = usesJsonActionAgent ? ParseFileManagerActionPreview(call.Body, call.Preview) : call.Preview;
            var payload = new HostingFileManagerPayload(cp.CpId, cp.CpLogin, home, selectedPath, action, call.Url, preview, call.Metadata);
            return new HostingFileManagerResponse(call.Success, call.Success ? "File manager action completed." : call.Message, payload);
        }

        private static string ParseFileManagerActionPreview(string body, string fallback)
        {
            if (string.IsNullOrWhiteSpace(body))
            {
                return fallback;
            }

            try
            {
                using var document = JsonDocument.Parse(body);
                return JsonStringProperty(document.RootElement, "preview", fallback);
            }
            catch (JsonException)
            {
                return fallback;
            }
        }

        private static string EncodeFileManagerAgentValue(string encryptKey, string value)
        {
            if (string.IsNullOrWhiteSpace(encryptKey))
            {
                return value;
            }

            return Rc4Hex(encryptKey, value ?? "");
        }

        private static string Rc4Hex(string key, string value)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var input = Encoding.UTF8.GetBytes(value);
            if (keyBytes.Length == 0)
            {
                return value;
            }

            var s = Enumerable.Range(0, 256).Select(i => (byte)i).ToArray();
            var j = 0;
            for (var i = 0; i < 256; i++)
            {
                j = (j + s[i] + keyBytes[i % keyBytes.Length]) & 255;
                (s[i], s[j]) = (s[j], s[i]);
            }

            var output = new byte[input.Length];
            var x = 0;
            j = 0;
            for (var n = 0; n < input.Length; n++)
            {
                x = (x + 1) & 255;
                j = (j + s[x]) & 255;
                (s[x], s[j]) = (s[j], s[x]);
                output[n] = (byte)(input[n] ^ s[(s[x] + s[j]) & 255]);
            }

            return HashHex(output);
        }

        private string BuildHostingHomePath(SelectedHostingCp cp) =>
            $@"{GetHostingHomeRoot()}\{cp.CpLogin}\www".ToLowerInvariant();

        private static FileManagerPathValidationResult NormalizeOwnedFileManagerPath(string? value, string home, bool allowEmpty = false)
        {
            var text = (value ?? "").Trim();
            if (string.IsNullOrWhiteSpace(text))
            {
                return allowEmpty
                    ? new FileManagerPathValidationResult(true, "", "")
                    : new FileManagerPathValidationResult(false, "", "File manager path is required.");
            }

            text = text.Replace('/', '\\').Trim();
            if (text.StartsWith(@"\\", StringComparison.Ordinal))
            {
                return new FileManagerPathValidationResult(false, "", "File manager path must stay inside the hosting account folder.");
            }

            while (text.Contains(@"\\", StringComparison.Ordinal))
            {
                text = text.Replace(@"\\", @"\", StringComparison.Ordinal);
            }

            var relativeText = text.TrimStart('\\');
            if (relativeText.Equals("www", StringComparison.OrdinalIgnoreCase))
            {
                text = "";
            }
            else if (relativeText.StartsWith(@"www\", StringComparison.OrdinalIgnoreCase))
            {
                text = relativeText[4..];
            }

            if (text.Contains("..", StringComparison.Ordinal) || text.Contains(@".\", StringComparison.Ordinal))
            {
                return new FileManagerPathValidationResult(false, "", "File manager path must stay inside the hosting account folder.");
            }

            var homeLower = home.TrimEnd('\\').ToLowerInvariant();
            var full = text.Length > 2 && char.IsLetter(text[0]) && text[1] == ':'
                ? text
                : $@"{homeLower}\{text.TrimStart('\\')}";
            full = full.Replace('/', '\\').TrimEnd('\\').ToLowerInvariant();

            if (!full.Equals(homeLower, StringComparison.OrdinalIgnoreCase) && !full.StartsWith(homeLower + "\\", StringComparison.OrdinalIgnoreCase))
            {
                return new FileManagerPathValidationResult(false, "", "File manager path must stay inside the selected hosting account.");
            }

            return new FileManagerPathValidationResult(true, Truncate(full, 400), "");
        }

        private static string SafeFileManagerName(string? value)
        {
            var text = (value ?? "").Trim();
            if (string.IsNullOrWhiteSpace(text) || text.Contains("..", StringComparison.Ordinal) || text.Contains('\\', StringComparison.Ordinal) || text.Contains('/', StringComparison.Ordinal))
            {
                return "";
            }

            return Truncate(text, 160);
        }

        private static string SafeFileManagerSort(string value)
        {
            var sort = (value ?? "").Trim().ToLowerInvariant();
            return sort is "name" or "type" or "size" or "datelastmodified" ? sort : "name";
        }

        private static string SafeFileManagerOrder(string value)
        {
            var order = (value ?? "").Trim().ToLowerInvariant();
            return order is "asc" or "desc" ? order : "asc";
        }

        private static string RandomAlphaNumeric(int length)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            Span<byte> bytes = stackalloc byte[length];
            RandomNumberGenerator.Fill(bytes);
            var builder = new StringBuilder(length);
            foreach (var value in bytes)
            {
                builder.Append(chars[value % chars.Length]);
            }

            return builder.ToString();
        }

        private static string Preview(string? value)
        {
            var text = (value ?? "").Replace("\r", " ", StringComparison.Ordinal).Replace("\n", " ", StringComparison.Ordinal).Trim();
            return text.Length <= 220 ? text : text[..220];
        }

        private static async Task<long> LoadFirstSiteUidAsync(SqlConnection connection, long cpId)
        {
            const string sql = "SELECT TOP 1 site_Uid FROM dbo.cp_config_Sites WHERE cpID = @cpId ORDER BY site_Uid";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? 0 : Convert.ToInt64(value, CultureInfo.InvariantCulture);
        }

        private static async Task<(string Engine, long Id)?> LoadFirstDatabaseForBackupAsync(SqlConnection connection, long cpId)
        {
            const string sql = @"
SELECT TOP 1 'mssql' AS engine, MSSQLID AS id FROM dbo.cp_config_MSSQLs WHERE cpID = @cpId
UNION ALL
SELECT TOP 1 'mysql' AS engine, MySQLID AS id FROM dbo.cp_config_MySQLs WHERE cpID = @cpId";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@cpId", cpId);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            return (reader.GetString(0), Convert.ToInt64(reader.GetValue(1), CultureInfo.InvariantCulture));
        }

        private static async Task<HostingAppsDashboard> LoadHostingAppsAsync(SqlConnection connection, long customerId, long requestedCpId = 0)
        {
            var cp = await LoadSelectedHostingCpAsync(connection, customerId, requestedCpId);
            var catalog = await LoadPluginCatalogAsync(connection);
            var activity = cp.CpId == 0
                ? new HostingActivityDashboard(0, "", new List<HostingActivitySummary>(), new HostingActivityTotals(0, 0, 0, 0))
                : await LoadHostingActivityAsync(connection, customerId, requestedCpId);

            var deployJobs = activity.Jobs
                .Where(job => job.Type.Equals("deploy", StringComparison.OrdinalIgnoreCase)
                    || job.Type.Equals("nodejs", StringComparison.OrdinalIgnoreCase))
                .Take(10)
                .ToList();

            return new HostingAppsDashboard(cp.CpId, cp.CpLogin, catalog, deployJobs);
        }

        private static async Task<List<HostingPluginSummary>> LoadPluginCatalogAsync(SqlConnection connection)
        {
            const string sql = @"
SELECT TOP 24 pluginID,
       p.name,
       version,
       programmingLanguage,
       shortDescription,
       ISNULL(installCount, 0) AS installCount,
       ISNULL(enabled, 0) AS enabled,
       ISNULL(c.name, '') AS categoryName,
       CAST(adminpage AS NVARCHAR(4000)) AS adminPage,
       ISNULL(adminlogin, '') AS adminLogin,
       ISNULL(pwdprotect, 0) AS pwdprotect,
       ISNULL(usedb, 0) AS usedb,
       ISNULL(scriptversion, '') AS scriptversion,
       lastInstallDate,
       (SELECT COUNT(1) FROM plugins.dbo.config cfg WHERE cfg.pluginid = p.pluginID) AS configCount,
       (SELECT COUNT(1) FROM plugins.dbo.parameters prm WHERE prm.pluginId = p.pluginID) AS parameterCount,
       (SELECT COUNT(1) FROM plugins.dbo.permissions perm WHERE perm.pluginid = p.pluginID) AS permissionCount
FROM plugins.dbo.plugins p
LEFT JOIN plugins.dbo.categories c ON c.id = p.categoryid
WHERE ISNULL(enabled, 0) = 1
ORDER BY ISNULL(installCount, 0) DESC, p.name";

            var plugins = new List<HostingPluginSummary>();
            try
            {
                await using var command = new SqlCommand(sql, connection);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    plugins.Add(new HostingPluginSummary(
                        Convert.ToInt32(reader.GetValue(0), CultureInfo.InvariantCulture),
                        reader.IsDBNull(1) ? "" : reader.GetString(1).Trim(),
                        reader.IsDBNull(2) ? "" : reader.GetString(2).Trim(),
                        reader.IsDBNull(3) ? "" : reader.GetString(3).Trim(),
                        reader.IsDBNull(4) ? "" : reader.GetString(4).Trim(),
                        Convert.ToInt64(reader.GetValue(5), CultureInfo.InvariantCulture),
                        ReadBoolean(reader, 6),
                        reader.IsDBNull(7) ? "" : reader.GetString(7).Trim(),
                        reader.IsDBNull(8) ? "" : reader.GetString(8).Trim(),
                        reader.IsDBNull(9) ? "" : reader.GetString(9).Trim(),
                        ReadBoolean(reader, 10),
                        ReadBoolean(reader, 11),
                        reader.IsDBNull(12) ? "" : reader.GetString(12).Trim(),
                        reader.IsDBNull(13) ? (DateTime?)null : reader.GetDateTime(13),
                        Convert.ToInt32(reader.GetValue(14), CultureInfo.InvariantCulture),
                        Convert.ToInt32(reader.GetValue(15), CultureInfo.InvariantCulture),
                        Convert.ToInt32(reader.GetValue(16), CultureInfo.InvariantCulture)
                    ));
                }
            }
            catch (SqlException)
            {
                return new List<HostingPluginSummary>();
            }

            return plugins;
        }

        private static async Task<HostingAppRequirements?> LoadPluginRequirementsAsync(SqlConnection connection, int pluginId)
        {
            var catalog = await LoadPluginCatalogAsync(connection);
            var plugin = catalog.FirstOrDefault(item => item.PluginId == pluginId);
            if (plugin == null)
            {
                return null;
            }

            try
            {
                var parameterText = await LoadPluginParameterTextAsync(connection, pluginId);
                var configRows = await LoadPluginMetadataRowsAsync(connection, "plugins.dbo.config", "pluginid", pluginId);
                var permissionRows = await LoadPluginMetadataRowsAsync(connection, "plugins.dbo.permissions", "pluginid", pluginId);
                return new HostingAppRequirements(
                    plugin,
                    parameterText,
                    configRows,
                    permissionRows,
                    new List<string>
                    {
                        "/Users/erwinyu/Downloads/hosting/cp8/functions/fn_plugin.inc:getPluginParas",
                        "/Users/erwinyu/Downloads/hosting/cp8/functions/fn_plugin.inc:getPluginConfigFiles",
                        "/Users/erwinyu/Downloads/hosting/cp8/functions/fn_plugin.inc:getPluginPermissions",
                        "/Users/erwinyu/Downloads/hosting/cp8/cp/Plugins/plugin_process_1.asp",
                        "/Users/erwinyu/Downloads/hosting/cp8/cp/Plugins/plugin_process_2.asp",
                        "/Users/erwinyu/Downloads/hosting/cp8/cp/Plugins/plugin_process_3.asp"
                    });
            }
            catch (SqlException ex)
            {
                return new HostingAppRequirements(
                    plugin,
                    "",
                    new List<Dictionary<string, string>>(),
                    new List<Dictionary<string, string>>(),
                    new List<string> { $"Unable to load plugin detail rows from plugins DB: {ex.Message}" });
            }
        }

        private static async Task<string> LoadPluginParameterTextAsync(SqlConnection connection, int pluginId)
        {
            const string sql = "SELECT TOP 1 CAST(parameters AS NVARCHAR(MAX)) FROM plugins.dbo.parameters WHERE pluginid = @pluginId";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@pluginId", pluginId);
            var value = await command.ExecuteScalarAsync();
            return value == null || value == DBNull.Value ? "" : Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? "";
        }

        private static async Task<List<Dictionary<string, string>>> LoadPluginMetadataRowsAsync(SqlConnection connection, string tableName, string pluginIdColumn, int pluginId)
        {
            var rows = new List<Dictionary<string, string>>();
            var sql = $"SELECT * FROM {tableName} WHERE {pluginIdColumn} = @pluginId";
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@pluginId", pluginId);
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                for (var index = 0; index < reader.FieldCount; index++)
                {
                    row[reader.GetName(index)] = reader.IsDBNull(index)
                        ? ""
                        : Convert.ToString(reader.GetValue(index), CultureInfo.InvariantCulture)?.Trim() ?? "";
                }

                rows.Add(row);
            }

            return rows;
        }

        private async Task<HostingAppInstallPlanResponse> BuildHostingAppInstallPlanFromRequestAsync(HttpContext context)
        {
            var sessionUser = GetSessionUser(context);
            if (sessionUser == null)
            {
                return new HostingAppInstallPlanResponse(false, "Not signed in.", null);
            }

            var request = await context.Request.ReadFromJsonAsync<HostingAppInstallRequest>()
                ?? new HostingAppInstallRequest(0, 0, 0, "", 0, "", new Dictionary<string, string>());

            if (request.PluginId <= 0)
            {
                return new HostingAppInstallPlanResponse(false, "Plugin id is required.", null);
            }

            var connectionString = GetEhbConfigConnectionString();
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                return new HostingAppInstallPlanResponse(false, "Missing EhbConfig connection string.", null);
            }

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var cp = await LoadSelectedHostingCpAsync(connection, sessionUser.CustomerId, request.CpId);
            if (cp.CpId == 0)
            {
                return new HostingAppInstallPlanResponse(false, "Hosting plan not found.", null);
            }

            var requirements = await LoadPluginRequirementsAsync(connection, request.PluginId);
            if (requirements == null)
            {
                return new HostingAppInstallPlanResponse(false, "Plugin was not found in plugins.dbo.plugins.", null);
            }

            OwnedHostingSite? site = null;
            if (request.SiteUid > 0)
            {
                site = await LoadOwnedHostingSiteAsync(connection, sessionUser.CustomerId, cp.CpId, request.SiteUid);
                if (site == null)
                {
                    return new HostingAppInstallPlanResponse(false, "Selected site was not found on this hosting plan.", null);
                }
            }

            OwnedHostingDatabase? database = null;
            if (request.DatabaseId > 0 || !string.IsNullOrWhiteSpace(request.DatabaseEngine))
            {
                if (request.DatabaseId <= 0 || string.IsNullOrWhiteSpace(request.DatabaseEngine))
                {
                    return new HostingAppInstallPlanResponse(false, "Both database engine and database id are required when selecting an existing database.", null);
                }

                database = await LoadOwnedDatabaseAsync(connection, sessionUser.CustomerId, cp.CpId, request.DatabaseEngine, request.DatabaseId, includeDeleted: false);
                if (database == null)
                {
                    return new HostingAppInstallPlanResponse(false, "Selected database was not found on this hosting plan.", null);
                }
            }

            if (requirements.Plugin.UsesDatabase && database == null)
            {
                return new HostingAppInstallPlanResponse(false, "This plugin requires a selected or newly-created database before install can run.", null);
            }

            var basePath = site?.SitePath;
            if (string.IsNullOrWhiteSpace(basePath))
            {
                basePath = $@"h:\root\home\{cp.CpLogin}\www";
            }

            var requestedPath = string.IsNullOrWhiteSpace(request.InstallPath)
                ? basePath
                : request.InstallPath.Trim();
            if (!requestedPath.Contains(@":\", StringComparison.Ordinal) && !requestedPath.StartsWith(@"\\", StringComparison.Ordinal))
            {
                requestedPath = $@"{basePath.TrimEnd('\\', '/')}\{requestedPath.TrimStart('\\', '/')}";
            }

            var pathResult = NormalizeOwnedHostingAbsolutePath(requestedPath, cp.CpLogin);
            if (!pathResult.Success)
            {
                return new HostingAppInstallPlanResponse(false, pathResult.Message, null);
            }

            var steps = new List<string>
            {
                "Load plugin package and metadata from plugins.dbo.plugins.",
                "Validate selected hosting site and target folder ownership.",
                requirements.Plugin.UsesDatabase ? "Use the selected owned database for plugin import/configuration." : "Skip database setup because this plugin does not require one.",
                "Create target folders and upload/unzip plugin package through the file-manager agent.",
                "Apply plugin config templates and installer parameters.",
                "Apply legacy permission rules where plugins.dbo.permissions requires them."
            };

            if (requirements.Plugin.Language.Contains("ASP", StringComparison.OrdinalIgnoreCase))
            {
                steps.Add("Create or update IIS application settings when the plugin requires an ASP.NET app.");
            }

            steps.Add("Record install activity and poll worker/agent completion.");

            var plan = new HostingAppInstallPlan(
                cp.CpId,
                cp.CpLogin,
                requirements.Plugin,
                site == null ? null : new HostingAppInstallSite(site.SiteUid, DisplaySiteName(site), site.SitePath, site.ServerId),
                database == null ? null : new HostingAppInstallDatabase(database.Engine, database.Id, database.Name, database.Login, database.Host),
                pathResult.Path,
                steps,
                requirements.LegacySources.Concat(new[]
                {
                    "/Users/erwinyu/Downloads/hosting/cp8/cp/Plugins/plugin_process_3_action.asp",
                    "/Users/erwinyu/Downloads/hosting/cp8/functions/fn_plugin.inc"
                }).Distinct(StringComparer.OrdinalIgnoreCase).ToList(),
                "Blocked before write: plugin_process_3_action.asp has multi-step file/database/IIS side effects and must be tested only against a disposable target."
            );

            return new HostingAppInstallPlanResponse(true, "App install plan is ready. No writes were performed.", plan);
        }

        private static string WorkqueueStatusLabel(int status) => status switch
        {
            0 => "Pending",
            1 => "Running",
            2 => "Success",
            3 => "Error",
            _ => "Unknown"
        };

        private static string SimplifyHostingPath(string value, string cpLogin)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "";
            }

            var normalized = value.Replace("\\", "/", StringComparison.Ordinal).Trim();
            var marker = $"/{cpLogin}/www";
            var markerIndex = normalized.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (markerIndex >= 0)
            {
                normalized = normalized[(markerIndex + marker.Length)..];
            }

            return string.IsNullOrWhiteSpace(normalized) ? "/" : normalized;
        }

        private static string NormalizeFtpPath(string path, string cpLogin)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return "/";
            }

            var normalized = path.Replace("\\", "/", StringComparison.Ordinal).Trim();
            var marker = $"/{cpLogin}/www";
            var markerIndex = normalized.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (markerIndex >= 0)
            {
                normalized = normalized[(markerIndex + marker.Length)..];
            }

            normalized = normalized.Trim('/');
            return string.IsNullOrWhiteSpace(normalized) ? "/" : $"/{normalized}";
        }

        private static string MySqlDefaultUserFromDatabase(string databaseName)
        {
            var name = (databaseName ?? "").Trim();
            return name.Length > 3 ? name[3..] : name;
        }

        private static List<RenewalNoticeSummary> BuildRenewalNotices(List<HostingAccountSummary> hostingAccounts)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var notices = new List<RenewalNoticeSummary>();

            foreach (var account in hostingAccounts)
            {
                if (account.RenewalDate == null)
                {
                    continue;
                }

                var daysLeft = account.RenewalDate.Value.DayNumber - today.DayNumber;
                var label = daysLeft < 0 ? "Past due" : daysLeft <= 30 ? "Action needed" : "Upcoming";
                notices.Add(new RenewalNoticeSummary(account.CpLogin, account.ClientProductId, account.RenewalDate.Value, daysLeft, label));
            }

            return notices;
        }

        private static string StatusLabel(int status) => status switch
        {
            0 => "Pending",
            1 => "Active",
            2 => "Suspended",
            3 => "Canceled",
            4 => "Cancel pending",
            _ => "Unknown"
        };

        private sealed record LoginRequest(string Login, string Password, string? TurnstileToken);
        private sealed record LoginConfigResponse(bool TurnstileEnabled, string SiteKey);
        private sealed record TurnstileVerifyResult(bool Success, string Message);
        private sealed record LoginFailureWindow(int Count, DateTime FirstFailureUtc, DateTime LastAlertUtc);
        private sealed record SmtpEndpoint(string Host, int Port);
        private sealed record EmailSendResult(bool Success, string Message);
        private sealed record ReadableCustomerEmailResult(bool Success, string Email, string Message);
        private sealed record PasswordResetRequest(string Login);
        private sealed record PasswordResetConfirmRequest(string Token, string NewPassword, string ConfirmPassword);
        private sealed record PasswordResetResponse(bool Success, string Message, string? ResetUrl);
        private sealed record OpenSrsSettings(string ApiUrl, string Username, string PrivateKey)
        {
            public bool IsConfigured =>
                !string.IsNullOrWhiteSpace(ApiUrl)
                && !string.IsNullOrWhiteSpace(Username)
                && !string.IsNullOrWhiteSpace(PrivateKey);
        }
        private sealed record LoginUser(long CustomerId, string Login, string CustomerType);
        private sealed record LoginResponse(bool Success, string Message, LoginUser? User);
        private sealed record AccountServiceStatusResponse(bool Success, string Message, AccountServiceStatus? Services);
        private sealed record AccountServiceStatus(ExternalServiceStatus OpenSrs, ExternalServiceStatus Dns);
        private sealed record ExternalServiceStatus(string Name, bool Configured, string Message, string State);
        private sealed record DashboardResponse(bool Success, string Message, AccountDashboard? Dashboard);
        private sealed record AccountDomainsResponse(bool Success, string Message, List<AccountDomainSummary> Domains);
        private sealed record DomainProfileResponse(bool Success, string Message, DomainProfileDetail? Profile);
        private sealed record DomainAvailabilityRequest(List<string> Domains);
        private sealed record DomainAvailabilityResponse(bool Success, string Message, List<DomainAvailabilityResult> Results);
        private sealed record DomainAvailabilityResult(string DomainName, bool Available, string Reason, string Source);
        private sealed record DomainRegistrarActionRequest(string Action, string Value);
        private sealed record DomainDnsPreviewRequest(string Records);
        private sealed record DomainDnsPreviewResponse(bool Success, string Message, List<DomainDnsRecordPreview> Records);
        private sealed record DomainDnsRecordPreview(string Type, string Name, string Value, int? Priority, int Ttl);
        private sealed record DomainDnsParseResult(bool Success, string Message, List<DomainDnsRecordPreview> Records);
        private sealed record DomainCredential(string Username, string Password);
        private sealed record OpenSrsActionResult(bool Success, string Message);
        private sealed record OpenSrsCookieResult(bool Success, string Message, string Cookie);
        private sealed record AccountBillingResponse(bool Success, string Message, AccountBillingDashboard? Dashboard);
        private sealed record AccountRenewalsResponse(bool Success, string Message, List<AccountProductSummary> Renewals);
        private sealed record AccountActionResponse(bool Success, string Message);
        private sealed record RenewalCheckoutResponse(bool Success, string Message, RenewalCheckoutPreview? Renewal);
        private sealed record MultipleRenewalCheckoutRequest(List<int> ClientProductIds);
        private sealed record BillingInvoiceResponse(bool Success, string Message, BillingInvoiceDetail? Invoice);
        private sealed record CheckoutPreviewResponse(bool Success, string Message, CheckoutPreview? Preview);
        private sealed record CheckoutCreateResponse(bool Success, string Message, CheckoutOrder? Order);
        private sealed record CheckoutTempOrderResponse(bool Success, string Message, CheckoutTempOrder? Order, AccountBalanceSummary? Balance = null, bool CanContinueWithBalance = false, decimal Shortfall = 0m);
        private sealed record RenewTempOrderResponse(bool Success, string Message, RenewTempOrder? Order);
        private sealed record AffiliateWithdrawResponse(bool Success, string Message, AffiliateWithdrawPreview? Preview);
        private sealed record AccountVpnResponse(bool Success, string Message, AccountVpnDashboard? Dashboard);
        private sealed record AccountAddonsResponse(bool Success, string Message, AccountAddonsDashboard? Dashboard);
        private sealed record AccountAffiliateResponse(bool Success, string Message, AccountAffiliateDashboard? Dashboard);
        private sealed record AccountSettingsResponse(bool Success, string Message, AccountSettingsDashboard? Dashboard);
        private sealed record EmailChangeVerifyResponse(bool Success, string Message, bool Completed, string NewEmail, DateTime? CreatedAt);
        private sealed record NewOrderCatalogResponse(bool Success, string Message, NewOrderCatalog? Catalog);
        private sealed record HostingSitesResponse(bool Success, string Message, HostingSitesDashboard? Dashboard);
        private sealed record AccountDashboard(CustomerSummary Customer, List<HostingAccountSummary> HostingAccounts, List<HostingStatusCount> HostingStatusSummary, List<RenewalNoticeSummary> RenewalNotices, List<UrgentLogSummary> UrgentLogs);
        private sealed record CustomerSummary(long CustomerId, string Login, string CustomerType, string Status, string Name, string CompanyName, DateOnly? AccountStartDate);
        private sealed record HostingAccountSummary(long CpId, string CpLogin, string PrimaryDomain, string WebHostType, string ServerId, string Status, long ClientProductId, int ProductId, DateOnly? RenewalDate, int TotalSites, int AdditionalRam);
        private sealed record HostingStatusCount(string Status, int Count);
        private sealed record RenewalNoticeSummary(string Name, long ClientProductId, DateOnly RenewalDate, int DaysLeft, string Status);
        private sealed record UrgentLogSummary(int Id, long CustomerId, string CustomerLogin, string Message, DateTime CreatedAt);
        private sealed record AccountBillingDashboard(AccountBalanceSummary Balance, List<AccountProductSummary> ActiveProducts, List<AccountPurchaseSummary> Purchases, List<AccountProductSummary> RenewalNotices, List<AccountCreditTransactionSummary> CreditTransactions, List<CheckoutTempOrder> PendingCheckouts, List<RenewTempOrder> PendingRenewCheckouts);
        private sealed record AccountBalanceSummary(decimal Amount, string Currency, string Source);
        private sealed record AccountProductSummary(int ClientProductId, int ProductId, string Name, string Description, string ProductType, DateOnly? NextDueDate, int? DaysLeft, string Status, DateOnly CreateDate, DateOnly LastUpdate, string PaymentTerm, decimal? Amount);
        private sealed record AccountPurchaseSummary(int OrderId, int ClientProductId, string Name, string Description, string PaymentTerm, string PaymentMethod, decimal Amount, string OrderStatus, string PaymentStatus, DateOnly CreateDate);
        private sealed record AccountCreditTransactionSummary(int ProductId, string Name, string Description, string PaymentMethod, decimal LedgerAmount, DateTime? CreatedAt, decimal? RealAmount, string OrderStatus);
        private sealed record RenewalCheckoutPreview(int ClientProductId, int ProductId, string Name, string Description, string PaymentTerm, decimal Amount, string Currency, DateOnly? NextDueDate, string CheckoutUrl, string Note);
        private sealed record BillingInvoiceDetail(int OrderId, int ClientProductId, int ProductId, string Name, string ProductName, string Description, string PaymentTerm, string PaymentMethod, decimal Amount, decimal PaidAmount, decimal Fees, string OrderStatus, string PaymentStatus, DateOnly CreateDate, DateOnly? PaidDate, string TransactionCode, string AccountName, string ReceiptName, string ReceiptAddress, string ReceiptCity, string ReceiptProvince, string ReceiptPostcode, string ReceiptCountry, string Vat);
        private sealed record CheckoutPreview(string CheckoutId, string Title, int ItemCount, decimal Total, string Currency, string CheckoutUrl, string Note, object Items);
        private sealed record CheckoutOrder(string Guid, string CheckoutUrl, string Title, decimal Amount, string Currency, int PageType, string Note);
        private sealed record CheckoutTempOrder(string Id, long CustomerId, int ProductId, string ProductName, decimal Amount, string Info1, string Info2, string Info3, string Info4, string Info5, int PageType, DateTime AddDate, bool IsPaid, bool Processed, bool Trackable, string FulfillmentPath);
        private sealed record RenewTempOrder(string Id, long CustomerId, decimal Amount, string RenewInfo, DateTime AddDate, bool IsPaid, bool IsProcessed, string FulfillmentPath);
        private sealed record DomainCheckoutRequest(List<DomainCheckoutItem> Domains);
        private sealed record DomainCheckoutItem(string DomainName, decimal Price);
        private sealed record AddonCheckoutRequest(List<AddonCheckoutItem> Items);
        private sealed record AddonCheckoutItem(int ProductId, int PriceId, int Quantity, long CpId);
        private sealed record VpnCheckoutRequest(int ProductId, int PriceId, int Quantity);
        private sealed record VpnUserCreateRequest(string User, string Password, string Type, string Area);
        private sealed record VpnUserActionRequest(string Action);
        private sealed record NewOrderCheckoutRequest(string Type, int ProductId, int PriceId);
        private sealed record DomainTransferCheckoutRequest(string DomainName, bool WhoisPrivacy);
        private sealed record BillingDepositRequest(decimal Amount);
        private sealed record DepositEligibility(bool Eligible, string Message);
        private sealed record CheckoutLineItem(int ProductId, string Name, string Term, int Quantity, decimal UnitAmount, string Currency);
        private sealed record AffiliateWithdrawRequest(decimal Amount, string Method, string Paypal);
        private sealed record AffiliateWithdrawPreview(decimal Amount, string Method, decimal AvailableCommission, int PaidReferralsThisYear, decimal MinimumAmount, bool Eligible, string Note);
        private sealed record AccountVpnDashboard(int Used, int Quota, List<AccountVpnServiceSummary> Services, List<AddonCatalogProduct> Catalog);
        private sealed record AccountVpnServiceSummary(long VpnClientId, string User, string Type, string Host, string Area, string DataCenter, string Status);
        private sealed record AccountAddonsDashboard(List<AddonCatalogProduct> Catalog, List<AccountProductSummary> ActiveAddons, List<HostingAccountSummary> HostingAccounts);
        private sealed record AddonCatalogProduct(int ProductId, string Name, string Description, string ProductType, string Category, List<AddonPriceOption> Prices);
        private sealed record AddonPriceOption(int PriceId, string Currency, string PaymentTerm, decimal SetupFee, decimal Amount, decimal OriginalAmount);
        private sealed record NewOrderCatalog(string Type, string Title, string LegacyPath, string Description, List<AddonCatalogProduct> Products);
        private sealed record NewPurchaseCatalogResponse(bool Success, string Message, NewPurchaseCatalog? Catalog);
        private sealed record NewPurchaseCatalog(string Type, string Title, string LegacyPath, string Description, List<AddonCatalogProduct> Products, string TracePath);
        private sealed record NewPurchaseStartRequest(string Type, int ProductId, int PriceId);
        private sealed record NewPurchaseStartResponse(bool Success, string Message, NewPurchaseStarted? Purchase);
        private sealed record NewPurchaseStarted(string OrderGuid, string SourceLegacyPath, string RecommendedLegacyPath, string RecommendedBranch, AddonCatalogProduct Product, AddonPriceOption Price, List<AddonCatalogProduct> RecommendedProducts, string Note);
        private sealed record NewPurchaseCompleteRequest(string OrderGuid, string Branch, bool IncludeRecommended, int RecommendedProductId, int RecommendedPriceId);
        private sealed record DomainTransferQuote(int ProductId, string ProductName, string Currency, string PaymentTerm, decimal Amount);
        private sealed record AccountAffiliateDashboard(long CustomerId, string Login, AffiliateSummary Summary, List<AffiliateReferralSummary> Referrals, List<AffiliateCommissionSummary> Commissions, List<AffiliatePayoutSummary> Payouts);
        private sealed record AffiliateSummary(int TotalReferrals, int PaidReferrals, int QualifiedFreeTrials, decimal PendingCommission, decimal CurrentCommission, decimal PaidOut, decimal AvailableCommission);
        private sealed record AffiliateReferralSummary(long CustomerId, string Login, DateOnly? AccountStartDate, string Status, bool IsPaid);
        private sealed record AffiliateCommissionSummary(int Id, int ClientProductId, string CustomerLogin, string ProductName, string Description, decimal Amount, DateOnly CreateDate, DateOnly ReleaseDate, bool IsReleased);
        private sealed record AffiliatePayoutSummary(int Id, string Method, string Description, decimal Amount, DateOnly CreateDate, string Paypal, string Status);
        private sealed record AccountSettingsDashboard(AccountSettingsProfile Profile, AccountTwoFactorSummary TwoFactor);
        private sealed record AccountSettingsProfile(
            long CustomerId,
            string Login,
            string CustomerType,
            string Status,
            string Name,
            string CompanyName,
            DateOnly? AccountStartDate,
            bool ReVerify,
            bool ReVerifySkip,
            int SecurityVersion,
            string EmailDisplay,
            string MobileNumber,
            string BrowserLanguage,
            string Vat,
            string ContactCountry,
            string ContactProvince,
            string ContactCity,
            string ContactArea,
            string ContactAddress,
            string ContactPostcode,
            string BillingCountry,
            string BillingProvince,
            string BillingCity,
            string BillingArea,
            string BillingAddress,
            string BillingPostcode);
        private sealed record AccountTwoFactorSummary(bool HasSecret, bool IsEnabled, DateOnly? EnterDate);
        private sealed record AccountPasswordChangeRequest(string CurrentPassword, string NewPassword, string ConfirmPassword);
        private sealed record AccountEmailChangeRequest(string Email);
        private sealed record AccountProfileUpdateRequest(
            string Name,
            string CompanyName,
            string MobileNumber,
            string BrowserLanguage,
            string Vat,
            string ContactCountry,
            string ContactProvince,
            string ContactCity,
            string ContactArea,
            string ContactAddress,
            string ContactPostcode,
            string BillingCountry,
            string BillingProvince,
            string BillingCity,
            string BillingArea,
            string BillingAddress,
            string BillingPostcode);
        private sealed record AccountDomainSummary(int Id, string DomainName, int ClientProductId, string Status, DateOnly? StartDate, DateOnly? ExpirationDate, int? DaysLeft, string RegisterStatus, int RegisterInfoId, DateOnly? AddDate, DateOnly? ProductNextDueDate, string ProductStatus, bool WhoisPrivacySupported, bool WhoisPrivacyPurchased, DateOnly? WhoisPrivacyTurnOnDate, int GracePeriodDays);
        private sealed record DomainProfileDetail(int Id, string DomainName, int RegisterInfoId, string RegisterStatus, DateOnly? ExpirationDate, int? DaysLeft, bool WhoisPrivacySupported, bool WhoisPrivacyPurchased, DateOnly? WhoisPrivacyTurnOnDate, int GracePeriodDays, DomainContactDetail Registrant, DomainContactDetail Admin, DomainContactDetail Billing, DomainContactDetail Technical);
        private sealed record DomainContactDetail(string FirstName, string LastName, string Organization, string Email, string Phone, string Fax, string Address1, string Address2, string City, string State, string Province, string Country, string PostalCode);
        private sealed record HostingSitesDashboard(long CpId, string CpLogin, List<HostingSiteSummary> Sites);
        private sealed record HostingSiteSummary(int SiteUid, string SiteName, string RootName, string SitePath, string Status, string RunningStatus, string Version, string PhpVersion, bool IsSecure, bool IsSubdomain, DateOnly? CreateDate, List<HostingSiteDomainSummary> MappedDomains);
        private sealed record HostingSiteDomainSummary(int DomainUid, string Label, string Url, bool Cdn, bool IsDefault, bool Ssl);
        private sealed record HostingDashboardResponse(bool Success, string Message, HostingDashboardSummary? Dashboard);
        private sealed record HostingDashboardSummary(long CpId, string CpLogin, string PrimaryDomain, string WebHostType, string Status, string ServerId, List<string> DnsServers, string IpAddress, int RamQuotaMb, int RamUsedMb, int SiteCount, int DomainCount, int DatabaseCount, List<HostingDashboardMetric> Metrics);
        private sealed record HostingDashboardMetric(string Label, string Value, int? NumericValue);
        private sealed record HostingDatabasesResponse(bool Success, string Message, HostingDatabasesDashboard? Dashboard);
        private sealed record HostingDatabasesDashboard(long CpId, string CpLogin, List<HostingDatabaseSummary> Databases, HostingDatabaseTotals Totals);
        private sealed record HostingDatabaseSummary(string Engine, long DatabaseId, string Name, string Login, string Host, int SpaceQuotaMb, string Status, DateOnly? CreateDate);
        private sealed record HostingDatabaseTotals(int Total, int Mssql, int Mysql);
        private sealed record HostingDeletedDatabasesResponse(bool Success, string Message, List<HostingDeletedDatabaseSummary> Databases);
        private sealed record HostingDeletedDatabaseSummary(string Engine, long DatabaseId, string Name, string Host, DateTime? DeletedAt, int DaysLeft);
        private sealed record HostingDatabaseBackupSchedulesResponse(bool Success, string Message, List<HostingDatabaseBackupScheduleSummary> Schedules);
        private sealed record HostingDatabaseBackupScheduleSummary(long Id, string Engine, long DatabaseId, string Name, int Hour, int RetentionDays, bool Enabled, DateTime? CreatedAt);
        private sealed record HostingDatabaseBackupScheduleRequest(long CpId, int Hour, int RetentionDays);
        private sealed record HostingDatabaseBackupScheduleMutationResponse(bool Success, string Message, HostingDatabaseBackupScheduleSummary? Schedule);
        private sealed record HostingDatabaseFileActionRequest(long CpId, string Path);
        private sealed record HostingDatabaseConnectionStringResponse(bool Success, string Message, HostingDatabaseConnectionString? Connection);
        private sealed record HostingDatabaseConnectionString(string Engine, long DatabaseId, string Name, string Host, string Login, Dictionary<string, string> Snippets);
        private sealed record HostingMssqlReportUsersResponse(bool Success, string Message, HostingMssqlReportUsersDashboard? Dashboard);
        private sealed record HostingMssqlReportUsersDashboard(long CpId, string CpLogin, bool Enabled, string ServerId, int UserQuota, int UserCount, List<HostingMssqlReportUserSummary> Users, List<string> LegacySources);
        private sealed record HostingMssqlReportUserSummary(string Username, bool HasPassword, bool IsPrimaryUser);
        private sealed record HostingEmailsResponse(bool Success, string Message, HostingEmailsDashboard? Dashboard);
        private sealed record HostingEmailsDashboard(long CpId, string CpLogin, List<HostingEmailDomainSummary> Domains, HostingEmailTotals Totals);
        private sealed record HostingEmailDomainSummary(string Type, long RowId, string Domain, string Server, string WebmailUrl, string MailHost, int SpaceMb, string Status, DateOnly? CreateDate);
        private sealed record HostingEmailTotals(int Total, int Hosted, int Corporate, int DailyLimits);
        private sealed record HostingEmailDomainMutationRequest(long CpId, string Password, int QuotaMb);
        private sealed record HostingFtpResponse(bool Success, string Message, HostingFtpDashboard? Dashboard);
        private sealed record HostingFtpDashboard(long CpId, string CpLogin, List<HostingFtpUserSummary> Users, HostingFtpTotals Totals);
        private sealed record HostingFtpUserSummary(long Id, string Login, string Path, string RawPath, int QuotaMb, string Permission, string Server, bool IsRootUser, string Status);
        private sealed record HostingFtpTotals(int Total, int RootUsers, int ExtraUsers);
        private sealed record HostingRuntimeResponse(bool Success, string Message, HostingRuntimeDashboard? Dashboard);
        private sealed record HostingRuntimeDashboard(long CpId, string CpLogin, List<HostingRuntimeRow> Pools, List<HostingRuntimeRow> Redirects, List<HostingRuntimeRow> SiteUsers, List<HostingRuntimeRow> StaticIps, List<HostingRuntimeRow> Aliases, HostingRuntimeTotals Totals, List<string> Warnings);
        private sealed record HostingRuntimeRow(string Title, string Subtitle, string Status, Dictionary<string, string> Details);
        private sealed record HostingRuntimeTotals(int Pools, int Redirects, int SiteUsers, int StaticIps, int ScheduledTasks, int Aliases);
        private sealed record HostingSecurityResponse(bool Success, string Message, HostingSecurityDashboard? Dashboard);
        private sealed record HostingSecurityDashboard(long CpId, string CpLogin, List<HostingSslOrderSummary> SslOrders, List<HostingFreeSslSummary> FreeSslRows, List<HostingCdnDomainSummary> CdnDomains, List<HostingCloudflareAccountSummary> CloudflareAccounts, List<HostingSiteSecuritySummary> SiteSecurityRows, List<HostingMigrationSummary> Migrations, HostingSecurityTotals Totals, List<string> Warnings);
        private sealed record HostingSslOrderSummary(long Id, string CommonName, string Status, string Email, string BuyYears, string CertificateId, string DnsNames, string DnsApproverEmails, DateTime? CreateDate);
        private sealed record HostingFreeSslSummary(long Id, string Domain, string Status, DateTime? CreateDate, DateTime? LastUpdate);
        private sealed record HostingCdnDomainSummary(long DomainUid, string Domain, bool Cdn, bool IsDefault, string SiteName);
        private sealed record HostingCloudflareAccountSummary(long CustomerId, string Email, string Status, DateTime? CreateDate);
        private sealed record HostingSiteSecuritySummary(long SiteUid, string SiteName, string IisId, bool WebKnight, bool HasAuditRow, bool IsWritable, DateTime? LastUpdate);
        private sealed record HostingMigrationSummary(long Id, string SourceServer, string DestinationServer, string Status, DateTime? CreateDate, bool Cleaned, bool Cancelled);
        private sealed record HostingSecurityTotals(int SslOrders, int FreeSsl, int CdnDomains, int CdnEnabled, int CloudflareAccounts, int LockedSites, int Migrations);
        private sealed record HostingDomainServiceActionRequest(long CpId, string Domain, string Action, Dictionary<string, string> Fields);
        private sealed record HostingServiceActionResponse(bool Success, string Message, string Area, object? Details);
        private sealed record HostingActivityResponse(bool Success, string Message, HostingActivityDashboard? Dashboard);
        private sealed record HostingActivityDashboard(long CpId, string CpLogin, List<HostingActivitySummary> Jobs, HostingActivityTotals Totals);
        private sealed record HostingActivitySummary(long Id, string Type, string Status, int StatusCode, string From, string To, string Server, string Data, string SiteOwner, string NotifyEmail, string ErrorMessage, DateTime? EnterDate);
        private sealed record HostingActivityTotals(int Total, int Pending, int Running, int Errors);
        private sealed record HostingActivityTestRequest(long CpId, string From, string To, string Server, string Note);
        private sealed record HostingActivityMutationResponse(bool Success, string Message, long Id);
        private sealed record HostingWorkqueueRequest(long CpId, string Type, string ZipFile, string DstFolder, string ServerId, string Data1, string SiteOwner, string NotifyEmail);
        private sealed record HostingWorkqueueResponse(bool Success, string Message, long Id, string Type);
        private sealed record HostingRealTestRequest(long CpId, string Area, Dictionary<string, string> Fields);
        private sealed record HostingRealTestResponse(bool Success, string Message, object? Row, string Area, long Id);
        private interface IHostingCpRequest
        {
            long CpId { get; }
        }
        private sealed record HostingProvisionResponse(bool Success, string Message, string Area, object? Details);
        private sealed record HostingSiteProvisionRequest(long CpId, string SiteName, string Domain, string Folder, string NetVersion, string ServerId) : IHostingCpRequest;
        private sealed record HostingDatabaseProvisionRequest(long CpId, string Engine, string Name, string Login, string Password, int QuotaMb, string Collation, string ServerId) : IHostingCpRequest;
        private sealed record HostingEmailProvisionRequest(long CpId, string Domain, string Password, int QuotaMb, int MailboxQuota, string MailServer) : IHostingCpRequest;
        private sealed record HostingFtpProvisionRequest(long CpId, string Login, string Password, string Path, int QuotaMb, string Permission) : IHostingCpRequest;
        private sealed record HostingFtpUserMutationRequest(long CpId, string Login, string Password, string Path, int QuotaMb, string Permission, string Action) : IHostingCpRequest;
        private sealed record HostingSiteFunctionResponse(bool Success, string Message, HostingSiteFunctionDetails? Function);
        private sealed record HostingSiteFunctionMutationRequest(long CpId, string Action, Dictionary<string, string> Fields);
        private sealed record HostingSiteFunctionMutationResponse(bool Success, string Message, object? Details);
        private sealed record HostingSiteFunctionDetails(string Key, string Label, string Group, string LegacyEntry, string UnderlyingApi, string Description, bool SupportsWrite, bool UsesRemoteAgent, List<string> Fields, Dictionary<string, object?> Data, List<string> Warnings);
        private sealed record WebsiteFunctionSpec(string Label, string Group, string LegacyEntry, string UnderlyingApi, string Description, bool SupportsWrite, bool UsesRemoteAgent, List<string> Fields);
        private sealed record WebsiteRemoteAction(string Path, Dictionary<string, string> Form);
        private sealed record OwnedHostingDatabase(string Engine, long Id, string Name, string Login, string Host, string ServerId, int SpaceQuotaMb, bool IsDeleted);
        private sealed record DatabaseFileValidationResult(bool Success, string Path, string Message);
        private sealed record OwnedHostingSite(long CpId, string CpLogin, string ServerId, string WebHostType, int SiteUid, string SiteName, string DisplayName, string SitePath, string IisId, string PoolId, bool IisStatus, string RunningStatus, string Version, string PhpVersion, bool IsSecure, bool IsSubdomain, DateTime? CreateDate);
        private sealed record OwnedMappedDomain(int DomainUid, string Domain, bool Cdn, bool IsDefault, int SiteUid, string SiteName, string IisId, string IpAddress);
        private sealed record OwnedEmailDomain(string Type, long ProductId, string Domain, string Server, int AdditionalSpaceMb, int Status);
        private sealed record OwnedHostingFtpUser(long Id, string Login, string RawPath, int QuotaMb, string Permission, string Server, bool IsRootUser);
        private sealed record OwnedApplicationPool(int Id, string Name, int PrivateMemoryMb, string Version, bool Enable32Bit, bool LoadUserProfile);
        private sealed record FtpPathValidationResult(bool Success, string Path, string Message);
        private sealed record HostingFileManagerActionRequest(long CpId, string Action, string Path, string Name, string TargetPath, string TargetName, bool Overwrite, string? Content = null, string? Encoding = null) : IHostingCpRequest;
        private sealed record HostingFileAgentHealthResponse(bool Success, string Message, HostingFileAgentHealth? Browse, HostingFileAgentHealth? Action);
        private sealed record HostingFileAgentHealth(bool Success, string Path, string Url, int StatusCode, string Message, string Preview);
        private sealed record HostingFileManagerResponse(bool Success, string Message, HostingFileManagerPayload? FileManager);
        private sealed record HostingFileManagerPayload(
            long CpId,
            string CpLogin,
            string HomePath,
            string CurrentPath,
            string Action,
            string Url,
            string Preview,
            object? Metadata,
            List<HostingFileManagerItem>? Folders = null,
            List<HostingFileManagerItem>? Files = null,
            string ParentPath = "",
            string RelativePath = "",
            int TotalFolders = 0,
            int TotalFiles = 0,
            int Page = 1,
            int PageSize = 250);
        private sealed record HostingFileManagerItem(string Name, string RelativePath, long Size, string Modified, string Created, string Type, bool IsFolder, bool IsEditable, string Extension);
        private sealed record HostingFileManagerListing(List<HostingFileManagerItem> Folders, List<HostingFileManagerItem> Files, string ParentPath, string CurrentPath, int TotalFolders, int TotalFiles, int Page, int PageSize)
        {
            public static HostingFileManagerListing Empty => new(new List<HostingFileManagerItem>(), new List<HostingFileManagerItem>(), "", "", 0, 0, 1, 250);
        }
        private sealed record FileManagerPathValidationResult(bool Success, string Path, string Message);
        private sealed record LegacyAgentSettings(string Scheme, string ServerDomainName, int Port)
        {
            public bool IsConfigured => !string.IsNullOrWhiteSpace(ServerDomainName);
            public string MissingMessage => "Legacy hosting agent is not configured. Set LegacyAgent:ServerDomainName or LEGACY_SERVER_DOMAIN_NAME before running IIS, FTP, and database agent calls.";
        }
        private sealed record LegacyRemoteCommandSettings(string Scheme, int Port, string Path, string TokenHost, string StaticToken, string Md5Seed)
        {
            public bool IsConfigured =>
                !string.IsNullOrWhiteSpace(TokenHost)
                && !string.IsNullOrWhiteSpace(StaticToken)
                && !string.IsNullOrWhiteSpace(Md5Seed);
            public string MissingMessage => "Legacy remote command token settings are not configured. Set LEGACY_REMOTE_CMD_STATIC_TOKEN and LEGACY_REMOTE_CMD_MD5_SEED before running remote_cmd2-compatible commands.";
        }
        private sealed record FileManagerAgentSettings(string Path, string ActionPath, string SharedSecret, string EncryptKey)
        {
            public bool IsConfigured => !string.IsNullOrWhiteSpace(Path);
            public string MissingMessage => "File manager JSON agent is not configured. Set FILE_MANAGER_AGENT_PATH before running file-manager browse calls.";
        }
        private sealed record LegacyMailCallResult(bool Success, string Preview, int StatusCode);
        private sealed record SmarterMailSettings(string ApiBaseUrl, string DefaultServer)
        {
            public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiBaseUrl);
            public string MissingMessage => "SmarterMail gateway is not configured. Set LegacyMail:ApiBaseUrl or LEGACY_MAIL_API_BASE_URL before running email provisioning calls.";
        }
        private sealed record LegacySharedApiSettings(string Scheme, string Host, int Port)
        {
            public bool IsConfigured => !string.IsNullOrWhiteSpace(Host);
            public string MissingMessage => "Legacy shared API is not configured. Set LegacySharedApi:Host or LEGACY_SHARED_API_HOST before running Cloudflare and free SSL calls.";
        }
        private sealed record LegacyOmsSettings(string BaseUrl)
        {
            public bool IsConfigured => !string.IsNullOrWhiteSpace(BaseUrl);
            public string MissingMessage => "Legacy OMS web service is not configured. Set LegacyOms:BaseUrl or LEGACY_OMS_BASE_URL before running commission and credit operations.";
        }
        private sealed record LegacyAgentCallResult(bool Success, string Message, string Url, string Preview, object? Metadata, string Body = "");
        private sealed record HostingAppsResponse(bool Success, string Message, HostingAppsDashboard? Dashboard);
        private sealed record HostingAppsDashboard(long CpId, string CpLogin, List<HostingPluginSummary> Catalog, List<HostingActivitySummary> DeployJobs);
        private sealed record HostingAppRequirementsResponse(bool Success, string Message, HostingAppRequirements? Requirements);
        private sealed record HostingAppRequirements(HostingPluginSummary Plugin, string Parameters, List<Dictionary<string, string>> ConfigFiles, List<Dictionary<string, string>> Permissions, List<string> LegacySources);
        private sealed record HostingAppInstallRequest(long CpId, int PluginId, int SiteUid, string InstallPath, long DatabaseId, string DatabaseEngine, Dictionary<string, string> Parameters);
        private sealed record HostingAppInstallPlanResponse(bool Success, string Message, HostingAppInstallPlan? Plan);
        private sealed record HostingAppInstallPlan(long CpId, string CpLogin, HostingPluginSummary Plugin, HostingAppInstallSite? Site, HostingAppInstallDatabase? Database, string InstallPath, List<string> Steps, List<string> LegacySources, string Blocker);
        private sealed record HostingAppInstallSite(int SiteUid, string Name, string Path, string ServerId);
        private sealed record HostingAppInstallDatabase(string Engine, long Id, string Name, string Login, string Host);
        private sealed record HostingAppInstallStatusResponse(bool Success, string Message, HostingActivitySummary? Job);
        private sealed record HostingPluginSummary(
            int PluginId,
            string Name,
            string Version,
            string Language,
            string Description,
            long InstallCount,
            bool Enabled,
            string Category,
            string AdminPage,
            string AdminLogin,
            bool PasswordProtected,
            bool UsesDatabase,
            string ScriptVersion,
            DateTime? LastInstallDate,
            int ConfigFiles,
            int ParameterSets,
            int PermissionRules);
        private sealed record SelectedHostingCp(long CpId, string CpLogin, string ServerId, string WebHostType)
        {
            public static SelectedHostingCp Empty { get; } = new(0, "", "", "");
        }
    }
}
