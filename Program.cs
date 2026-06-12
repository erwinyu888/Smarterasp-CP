using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace controlpanel
{
    public class Program
    {
        public static void Main(string[] args)
        {
            LoadDotEnv(Path.Combine(Directory.GetCurrentDirectory(), ".env"));
            var outputEnvPath = Path.Combine(AppContext.BaseDirectory, ".env");
            if (!string.Equals(outputEnvPath, Path.Combine(Directory.GetCurrentDirectory(), ".env"), StringComparison.OrdinalIgnoreCase))
            {
                LoadDotEnv(outputEnvPath);
            }

            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });

        private static void LoadDotEnv(string path)
        {
            if (!File.Exists(path))
            {
                return;
            }

            foreach (var rawLine in File.ReadAllLines(path))
            {
                var line = rawLine.Trim();
                if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#", StringComparison.Ordinal))
                {
                    continue;
                }

                if (line.StartsWith("export ", StringComparison.OrdinalIgnoreCase))
                {
                    line = line["export ".Length..].TrimStart();
                }

                var equalsIndex = line.IndexOf('=', StringComparison.Ordinal);
                if (equalsIndex <= 0)
                {
                    continue;
                }

                var key = line[..equalsIndex].Trim();
                var value = line[(equalsIndex + 1)..].Trim();
                if (string.IsNullOrWhiteSpace(key) || !string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                {
                    continue;
                }

                var wasQuoted = (value.StartsWith("\"", StringComparison.Ordinal) && value.EndsWith("\"", StringComparison.Ordinal)) ||
                    (value.StartsWith("'", StringComparison.Ordinal) && value.EndsWith("'", StringComparison.Ordinal));
                if (wasQuoted)
                {
                    value = value[1..^1];

                    value = value
                        .Replace("\\n", "\n", StringComparison.Ordinal)
                        .Replace("\\r", "\r", StringComparison.Ordinal)
                        .Replace("\\\"", "\"", StringComparison.Ordinal);
                }

                Environment.SetEnvironmentVariable(key, value);
            }
        }
    }
}
