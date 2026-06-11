using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace controlpanel
{
    public class Startup
    {
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
                endpoints.MapFallbackToFile("index.html");
            });
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

            var connectionString = _configuration.GetConnectionString("EhbConfig")
                ?? Environment.GetEnvironmentVariable("EHB_CONFIG_CONNECTION_STRING");

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

        private sealed record LoginRequest(string Login, string Password);
        private sealed record LoginUser(long CustomerId, string Login, string CustomerType);
        private sealed record LoginResponse(bool Success, string Message, LoginUser User);
    }
}
