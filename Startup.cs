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
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

#nullable enable

namespace controlpanel
{
    public class Startup
    {
        private const int ConstPageTypeBuyDomain = 3;
        private const int ConstPageTypeCpRenew = 5;
        private const int ConstPageTypeWebQuota = 6;
        private const int ConstPageTypeMssqlDb = 7;
        private const int ConstPageTypeMssqlQuota = 8;
        private const int ConstPageTypeMysqlDb = 9;
        private const int ConstPageTypeMysqlQuota = 10;
        private const int ConstPageTypeIp = 12;
        private const int ConstPageTypeSsl = 13;
        private const int ConstPageTypeEmailQuota = 17;
        private const int ConstPageTypeGeneral = 22;
        private const int ConstPageTypeCustomBackup = 26;
        private const int ConstPageTypeSsrs = 28;
        private const int ConstPageTypeTasks = 29;
        private const int ConstPageTypeSqlJob = 31;
        private const int ConstPageTypeRam = 32;
        private const int ConstPageTypeWebsiteFirewall = 33;
        private const int ConstPageTypeWindowsTask = 34;
        private const int ConstPageTypeFileCountLimit = 36;
        private const int ConstPageTypeVpn = 37;
        private const int ConstPageTypeCloudBackup = 38;
        private const int ConstPageTypeDataBackup = 39;
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
                endpoints.MapGet("/api/auth/me", HandleCurrentUserAsync);
                endpoints.MapPost("/api/auth/logout", HandleLogoutAsync);
                endpoints.MapGet("/api/account/dashboard", HandleAccountDashboardAsync);
                endpoints.MapGet("/api/account/domains", HandleAccountDomainsAsync);
                endpoints.MapPost("/api/account/domains/search", HandleDomainAvailabilitySearchAsync);
                endpoints.MapPost("/api/account/domains/checkout-preview", HandleDomainCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/domains/checkout", HandleDomainCheckoutAsync);
                endpoints.MapGet("/api/account/billing", HandleAccountBillingAsync);
                endpoints.MapGet("/api/account/billing/orders/{orderId:int}/invoice", HandleBillingInvoiceAsync);
                endpoints.MapGet("/api/account/renewals", HandleAccountRenewalsAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/hide", HandleHideRenewalNoticeAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/renew", HandleRenewalCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/renewals/{clientProductId:int}/checkout", HandleRenewalCheckoutAsync);
                endpoints.MapGet("/api/account/vpn", HandleAccountVpnAsync);
                endpoints.MapGet("/api/account/addons", HandleAccountAddonsAsync);
                endpoints.MapPost("/api/account/addons/checkout-preview", HandleAddonCheckoutPreviewAsync);
                endpoints.MapPost("/api/account/addons/checkout", HandleAddonCheckoutAsync);
                endpoints.MapGet("/api/account/affiliate", HandleAccountAffiliateAsync);
                endpoints.MapPost("/api/account/affiliate/withdraw-preview", HandleAffiliateWithdrawPreviewAsync);
                endpoints.MapGet("/api/account/checkout-temp/{guid}", HandleCheckoutTempOrderAsync);
                endpoints.MapGet("/api/hosting/sites", HandleHostingSitesAsync);
                endpoints.MapFallbackToFile("index.html");
            });
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

            var dashboard = new AccountDashboard(
                customer,
                hostingAccounts,
                statusSummary,
                BuildRenewalNotices(hostingAccounts)
            );

            await Results.Ok(new DashboardResponse(true, "Dashboard loaded.", dashboard)).ExecuteAsync(context);
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

            var checks = new List<Task<DomainAvailabilityResult>>();
            foreach (var domainName in normalized)
            {
                checks.Add(owned.Contains(domainName)
                    ? Task.FromResult(new DomainAvailabilityResult(domainName, false, "Already in your account", "account"))
                    : CheckDomainAvailabilityWithRdapAsync(httpClient, domainName));
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
                "Domain checkout preview",
                normalized.Count,
                total,
                "USD",
                "/checkout/domain-preview",
                "Validated cart input. Registrar/order writes are disabled until DomainCheckoutService is rebuilt.",
                normalized
            );

            await Results.Ok(new CheckoutPreviewResponse(true, "Domain checkout preview ready.", preview)).ExecuteAsync(context);
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

            var activeProducts = await LoadActiveProductsAsync(connection, sessionUser.CustomerId);
            var purchases = await LoadRecentPurchasesAsync(connection, sessionUser.CustomerId);
            var renewalNotices = await LoadProductRenewalsAsync(connection, sessionUser.CustomerId, 30);
            var balance = await LoadAccountCreditBalanceAsync(connection, sessionUser.CustomerId);

            var billing = new AccountBillingDashboard(
                new AccountBalanceSummary(balance, "USD", "OMS credit ledger"),
                activeProducts,
                purchases,
                renewalNotices
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

            await Results.Ok(new RenewalCheckoutResponse(true, "Renewal checkout preview ready.", renewal)).ExecuteAsync(context);
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
            var dashboard = new AccountVpnDashboard(services.Count, quota, services);

            await Results.Ok(new AccountVpnResponse(true, "VPN services loaded.", dashboard)).ExecuteAsync(context);
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
            var dashboard = new AccountAddonsDashboard(catalog, activeAddons);

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
                "Add-on checkout preview",
                validated.Count,
                total,
                "USD",
                "/checkout/addon-preview",
                "Validated catalog prices. Order/provisioning writes are disabled until AddonOrderService is rebuilt.",
                validated
            );

            await Results.Ok(new CheckoutPreviewResponse(true, "Add-on checkout preview ready.", preview)).ExecuteAsync(context);
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
                    quantity.ToString(CultureInfo.InvariantCulture),
                    "",
                    selectedPrice.PriceId.ToString(CultureInfo.InvariantCulture),
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
            var dashboard = new AccountAffiliateDashboard(summary, referrals, commissions, payouts);

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

            var paidReferralsThisYear = 0;
            var thisYear = DateOnly.FromDateTime(DateTime.UtcNow).Year;
            foreach (var referral in referrals)
            {
                if (referral.IsPaid && referral.AccountStartDate?.Year == thisYear)
                {
                    paidReferralsThisYear++;
                }
            }

            var minimum = method.Equals("paypal", StringComparison.OrdinalIgnoreCase) ? 100m : 1m;
            var eligible = amount >= minimum && amount <= summary.AvailableCommission && paidReferralsThisYear >= 3;
            var message = eligible
                ? "Withdraw preview ready. Legacy cashout write is disabled until CommissionPayoutService is rebuilt."
                : "Withdraw is not eligible yet. Legacy rules require enough available commission, the method minimum, and at least 3 paid referrals this year.";

            var preview = new AffiliateWithdrawPreview(
                amount,
                method,
                summary.AvailableCommission,
                paidReferralsThisYear,
                minimum,
                eligible,
                message
            );

            await Results.Ok(new AffiliateWithdrawResponse(true, "Affiliate withdraw checked.", preview)).ExecuteAsync(context);
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

            var sites = await LoadHostingSitesAsync(connection, sessionUser.CustomerId);
            await Results.Ok(new HostingSitesResponse(true, "Hosting sites loaded.", sites)).ExecuteAsync(context);
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

            const string sql = @"
SELECT TOP 1 id, customer_id, product_id, product_name, amount, info1, info2, info3, info4, info5, pagetype, adddate, ispaid, processed, trackable
FROM oms.dbo.buyer_temp
WHERE id = @id
  AND customer_id = @customerId";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", guid);
            command.Parameters.AddWithValue("@customerId", sessionUser.CustomerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                await Results.Json(
                    new CheckoutTempOrderResponse(false, "Checkout temp order was not found for this account.", null),
                    statusCode: StatusCodes.Status404NotFound
                ).ExecuteAsync(context);
                return;
            }

            var order = new CheckoutTempOrder(
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
                Convert.ToInt32(reader.GetDecimal(10), CultureInfo.InvariantCulture),
                reader.GetDateTime(11),
                !reader.IsDBNull(12) && reader.GetBoolean(12),
                !reader.IsDBNull(13) && reader.GetBoolean(13),
                !reader.IsDBNull(14) && reader.GetBoolean(14)
            );

            await Results.Ok(new CheckoutTempOrderResponse(true, "Checkout temp order loaded.", order)).ExecuteAsync(context);
        }

        private async Task HandleLoginAsync(HttpContext context)
        {
            var loginRequest = await context.Request.ReadFromJsonAsync<LoginRequest>();
            var login = loginRequest?.Login?.Trim() ?? "";
            var password = loginRequest?.Password ?? "";

            if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password))
            {
                await Results.BadRequest(new LoginResponse(false, "Enter your username and password.", null)).ExecuteAsync(context);
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
SELECT TOP 1 customerID, customerLogin, customer_type, status, pp1
FROM dbo.customer_profile
WHERE LOWER(customerLogin) = LOWER(@login)";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@login", login);

            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
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
            var storedHash = reader.IsDBNull(4) ? "" : reader.GetString(4).Trim();

            if (!PasswordMatches(password, storedHash))
            {
                await Results.Json(
                    new LoginResponse(false, "Login failed. Please check your username and password.", null),
                    statusCode: StatusCodes.Status401Unauthorized
                ).ExecuteAsync(context);
                return;
            }

            if (status != 1)
            {
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

            await Results.Ok(new LoginResponse(true, "Login successful.", new LoginUser(customerId, customerLogin, customerType))).ExecuteAsync(context);
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

        private static string HashHex(byte[] bytes) => Convert.ToHexString(bytes).ToLowerInvariant();

        private string GetEhbConfigConnectionString() =>
            _configuration.GetConnectionString("EhbConfig")
            ?? Environment.GetEnvironmentVariable("EHB_CONFIG_CONNECTION_STRING")
            ?? "";

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

        private static async Task<DomainAvailabilityResult> CheckDomainAvailabilityWithRdapAsync(HttpClient httpClient, string domainName)
        {
            try
            {
                using var response = await httpClient.GetAsync($"https://rdap.org/domain/{Uri.EscapeDataString(domainName)}");
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    return new DomainAvailabilityResult(domainName, true, "Available", "rdap");
                }

                if (response.IsSuccessStatusCode)
                {
                    return new DomainAvailabilityResult(domainName, false, "Unavailable", "rdap");
                }

                return new DomainAvailabilityResult(domainName, false, $"Could not verify ({(int)response.StatusCode})", "rdap");
            }
            catch
            {
                return new DomainAvailabilityResult(domainName, false, "Could not verify", "rdap");
            }
        }

        private static string BuildLegacyCheckoutUrl(string guid) => $"/checkout/account_screen?guid={Uri.EscapeDataString(guid)}";

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
            if (name.StartsWith("Site Guard", StringComparison.OrdinalIgnoreCase) || name.StartsWith("SITE", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWebsiteFirewall;
            if (name.StartsWith("SQLJOB", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeSqlJob;
            if (name.StartsWith("SSRS", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeSsrs;
            if (name.StartsWith("SCHTASK", StringComparison.OrdinalIgnoreCase)) return ConstPageTypeWindowsTask;
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

        private static async Task<List<AccountPurchaseSummary>> LoadRecentPurchasesAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT TOP 25 o.order_id, o.client_product_id, o.name, o.description, o.payment_term,
       o.payment_method, o.amount, o.order_status, o.payment_status, o.create_date
FROM oms.dbo.[order] o
INNER JOIN oms.dbo.client_product cp ON cp.client_product_id = o.client_product_id
WHERE cp.client_id = @customerId
ORDER BY o.create_date DESC, o.order_id DESC";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@customerId", customerId);

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

        private static async Task<BillingInvoiceDetail?> LoadBillingInvoiceAsync(SqlConnection connection, long customerId, int orderId)
        {
            const string sql = @"
SELECT TOP 1 o.order_id, o.client_product_id, o.name, o.description, o.payment_term,
       o.payment_method, o.amount, o.order_status, o.payment_status, o.create_date,
       cp.product_id, p.name AS product_name, ot.transaction_code, ot.amount AS paid_amount,
       ot.fees, ot.create_date AS paid_date
FROM oms.dbo.[order] o
INNER JOIN oms.dbo.client_product cp ON cp.client_product_id = o.client_product_id
INNER JOIN oms.dbo.product p ON p.product_id = cp.product_id
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
                reader.IsDBNull(12) ? "" : reader.GetString(12)
            );
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
                "Validated account ownership. The payment/provisioning write path is still disabled until the legacy checkout bridge is rebuilt."
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
       EXISTS (SELECT 1 FROM oms.dbo.product_ext px WHERE px.product_id = p.product_id AND px.isOptional = 1) OR
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

        private static async Task<List<AccountDomainSummary>> LoadAccountDomainsAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
SELECT dp.id, dp.domain_name, dp.client_product_id, dp.status, dp.StartDate, dp.BuyYear,
       dp.RegisterStatus, dp.RegisterInfoID, dp.AddDate, cp.next_due_date, cp.status AS product_status
FROM domaincontroller.dbo.domain_profile dp
LEFT JOIN oms.dbo.client_product cp ON cp.client_product_id = dp.client_product_id
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
                    reader.IsDBNull(10) ? "Unknown" : StatusLabel(reader.GetInt32(10))
                ));
            }

            return rows;
        }

        private static DateOnly? CalculateDomainExpiration(DateOnly? startDate, int buyYear)
        {
            if (startDate == null)
            {
                return null;
            }

            return startDate.Value.AddYears(Math.Max(buyYear, 1));
        }

        private static async Task<HostingSitesDashboard> LoadHostingSitesAsync(SqlConnection connection, long customerId)
        {
            const string sql = @"
WITH SelectedCp AS (
    SELECT TOP 1 cpID, cpLogin
    FROM dbo.cp_config
    WHERE customerID = @customerId
      AND ISNULL(hideit, 0) = 0
      AND status = 1
    ORDER BY cpID
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

        private sealed record LoginRequest(string Login, string Password);
        private sealed record LoginUser(long CustomerId, string Login, string CustomerType);
        private sealed record LoginResponse(bool Success, string Message, LoginUser? User);
        private sealed record DashboardResponse(bool Success, string Message, AccountDashboard? Dashboard);
        private sealed record AccountDomainsResponse(bool Success, string Message, List<AccountDomainSummary> Domains);
        private sealed record DomainAvailabilityRequest(List<string> Domains);
        private sealed record DomainAvailabilityResponse(bool Success, string Message, List<DomainAvailabilityResult> Results);
        private sealed record DomainAvailabilityResult(string DomainName, bool Available, string Reason, string Source);
        private sealed record AccountBillingResponse(bool Success, string Message, AccountBillingDashboard? Dashboard);
        private sealed record AccountRenewalsResponse(bool Success, string Message, List<AccountProductSummary> Renewals);
        private sealed record AccountActionResponse(bool Success, string Message);
        private sealed record RenewalCheckoutResponse(bool Success, string Message, RenewalCheckoutPreview? Renewal);
        private sealed record BillingInvoiceResponse(bool Success, string Message, BillingInvoiceDetail? Invoice);
        private sealed record CheckoutPreviewResponse(bool Success, string Message, CheckoutPreview? Preview);
        private sealed record CheckoutCreateResponse(bool Success, string Message, CheckoutOrder? Order);
        private sealed record CheckoutTempOrderResponse(bool Success, string Message, CheckoutTempOrder? Order);
        private sealed record AffiliateWithdrawResponse(bool Success, string Message, AffiliateWithdrawPreview? Preview);
        private sealed record AccountVpnResponse(bool Success, string Message, AccountVpnDashboard? Dashboard);
        private sealed record AccountAddonsResponse(bool Success, string Message, AccountAddonsDashboard? Dashboard);
        private sealed record AccountAffiliateResponse(bool Success, string Message, AccountAffiliateDashboard? Dashboard);
        private sealed record HostingSitesResponse(bool Success, string Message, HostingSitesDashboard? Dashboard);
        private sealed record AccountDashboard(CustomerSummary Customer, List<HostingAccountSummary> HostingAccounts, List<HostingStatusCount> HostingStatusSummary, List<RenewalNoticeSummary> RenewalNotices);
        private sealed record CustomerSummary(long CustomerId, string Login, string CustomerType, string Status, string Name, string CompanyName, DateOnly? AccountStartDate);
        private sealed record HostingAccountSummary(long CpId, string CpLogin, string PrimaryDomain, string WebHostType, string ServerId, string Status, long ClientProductId, int ProductId, DateOnly? RenewalDate, int TotalSites, int AdditionalRam);
        private sealed record HostingStatusCount(string Status, int Count);
        private sealed record RenewalNoticeSummary(string Name, long ClientProductId, DateOnly RenewalDate, int DaysLeft, string Status);
        private sealed record AccountBillingDashboard(AccountBalanceSummary Balance, List<AccountProductSummary> ActiveProducts, List<AccountPurchaseSummary> Purchases, List<AccountProductSummary> RenewalNotices);
        private sealed record AccountBalanceSummary(decimal Amount, string Currency, string Source);
        private sealed record AccountProductSummary(int ClientProductId, int ProductId, string Name, string Description, string ProductType, DateOnly? NextDueDate, int? DaysLeft, string Status, DateOnly CreateDate, DateOnly LastUpdate, string PaymentTerm, decimal? Amount);
        private sealed record AccountPurchaseSummary(int OrderId, int ClientProductId, string Name, string Description, string PaymentTerm, string PaymentMethod, decimal Amount, string OrderStatus, string PaymentStatus, DateOnly CreateDate);
        private sealed record RenewalCheckoutPreview(int ClientProductId, int ProductId, string Name, string Description, string PaymentTerm, decimal Amount, string Currency, DateOnly? NextDueDate, string CheckoutUrl, string Note);
        private sealed record BillingInvoiceDetail(int OrderId, int ClientProductId, int ProductId, string Name, string ProductName, string Description, string PaymentTerm, string PaymentMethod, decimal Amount, decimal PaidAmount, decimal Fees, string OrderStatus, string PaymentStatus, DateOnly CreateDate, DateOnly? PaidDate, string TransactionCode);
        private sealed record CheckoutPreview(string CheckoutId, string Title, int ItemCount, decimal Total, string Currency, string CheckoutUrl, string Note, object Items);
        private sealed record CheckoutOrder(string Guid, string CheckoutUrl, string Title, decimal Amount, string Currency, int PageType, string Note);
        private sealed record CheckoutTempOrder(string Id, long CustomerId, int ProductId, string ProductName, decimal Amount, string Info1, string Info2, string Info3, string Info4, string Info5, int PageType, DateTime AddDate, bool IsPaid, bool Processed, bool Trackable);
        private sealed record DomainCheckoutRequest(List<DomainCheckoutItem> Domains);
        private sealed record DomainCheckoutItem(string DomainName, decimal Price);
        private sealed record AddonCheckoutRequest(List<AddonCheckoutItem> Items);
        private sealed record AddonCheckoutItem(int ProductId, int PriceId, int Quantity);
        private sealed record CheckoutLineItem(int ProductId, string Name, string Term, int Quantity, decimal UnitAmount, string Currency);
        private sealed record AffiliateWithdrawRequest(decimal Amount, string Method);
        private sealed record AffiliateWithdrawPreview(decimal Amount, string Method, decimal AvailableCommission, int PaidReferralsThisYear, decimal MinimumAmount, bool Eligible, string Note);
        private sealed record AccountVpnDashboard(int Used, int Quota, List<AccountVpnServiceSummary> Services);
        private sealed record AccountVpnServiceSummary(long VpnClientId, string User, string Type, string Host, string Area, string DataCenter, string Status);
        private sealed record AccountAddonsDashboard(List<AddonCatalogProduct> Catalog, List<AccountProductSummary> ActiveAddons);
        private sealed record AddonCatalogProduct(int ProductId, string Name, string Description, string ProductType, string Category, List<AddonPriceOption> Prices);
        private sealed record AddonPriceOption(int PriceId, string Currency, string PaymentTerm, decimal SetupFee, decimal Amount, decimal OriginalAmount);
        private sealed record AccountAffiliateDashboard(AffiliateSummary Summary, List<AffiliateReferralSummary> Referrals, List<AffiliateCommissionSummary> Commissions, List<AffiliatePayoutSummary> Payouts);
        private sealed record AffiliateSummary(int TotalReferrals, int PaidReferrals, int QualifiedFreeTrials, decimal PendingCommission, decimal CurrentCommission, decimal PaidOut, decimal AvailableCommission);
        private sealed record AffiliateReferralSummary(long CustomerId, string Login, DateOnly? AccountStartDate, string Status, bool IsPaid);
        private sealed record AffiliateCommissionSummary(int Id, int ClientProductId, string CustomerLogin, string ProductName, string Description, decimal Amount, DateOnly CreateDate, DateOnly ReleaseDate, bool IsReleased);
        private sealed record AffiliatePayoutSummary(int Id, string Method, string Description, decimal Amount, DateOnly CreateDate, string Paypal, string Status);
        private sealed record AccountDomainSummary(int Id, string DomainName, int ClientProductId, string Status, DateOnly? StartDate, DateOnly? ExpirationDate, int? DaysLeft, string RegisterStatus, int RegisterInfoId, DateOnly? AddDate, DateOnly? ProductNextDueDate, string ProductStatus);
        private sealed record HostingSitesDashboard(long CpId, string CpLogin, List<HostingSiteSummary> Sites);
        private sealed record HostingSiteSummary(int SiteUid, string SiteName, string RootName, string SitePath, string Status, string RunningStatus, string Version, string PhpVersion, bool IsSecure, bool IsSubdomain, DateOnly? CreateDate, List<HostingSiteDomainSummary> MappedDomains);
        private sealed record HostingSiteDomainSummary(int DomainUid, string Label, string Url, bool Cdn, bool IsDefault, bool Ssl);
    }
}
