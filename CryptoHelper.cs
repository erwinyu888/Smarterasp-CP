using System;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace controlpanel;

public static class CryptoHelper
{
    private const byte ModernVersion = 1;
    private const int SaltSize = 16;
    private const int NonceSize = 12;
    private const int TagSize = 16;
    private const int KeySize = 32;
    private const int DefaultIterations = 100_000;

    public static string Encrypt(string encryptKey, string plainText)
    {
        if (string.IsNullOrEmpty(encryptKey) || plainText is null)
        {
            return "";
        }

        try
        {
            var salt = RandomNumberGenerator.GetBytes(SaltSize);
            var nonce = RandomNumberGenerator.GetBytes(NonceSize);
            var key = DeriveKey(encryptKey, salt, DefaultIterations);
            var plainBytes = Encoding.UTF8.GetBytes(plainText);
            var cipherBytes = new byte[plainBytes.Length];
            var tag = new byte[TagSize];

            using var aes = new AesGcm(key, TagSize);
            aes.Encrypt(nonce, plainBytes, cipherBytes, tag);

            var payload = new byte[1 + SaltSize + NonceSize + TagSize + cipherBytes.Length];
            payload[0] = ModernVersion;
            Buffer.BlockCopy(salt, 0, payload, 1, SaltSize);
            Buffer.BlockCopy(nonce, 0, payload, 1 + SaltSize, NonceSize);
            Buffer.BlockCopy(tag, 0, payload, 1 + SaltSize + NonceSize, TagSize);
            Buffer.BlockCopy(cipherBytes, 0, payload, 1 + SaltSize + NonceSize + TagSize, cipherBytes.Length);
            return ToHex(payload);
        }
        catch
        {
            return "";
        }
    }

    public static string Decrypt(string encryptKey, string payloadHex)
    {
        if (string.IsNullOrEmpty(encryptKey) || string.IsNullOrWhiteSpace(payloadHex))
        {
            return "";
        }

        try
        {
            var payload = FromHex(payloadHex);
            if (payload.Length < 1 + SaltSize + NonceSize + TagSize || payload[0] != ModernVersion)
            {
                return "";
            }

            var salt = payload.AsSpan(1, SaltSize).ToArray();
            var nonce = payload.AsSpan(1 + SaltSize, NonceSize).ToArray();
            var tag = payload.AsSpan(1 + SaltSize + NonceSize, TagSize).ToArray();
            var cipherBytes = payload.AsSpan(1 + SaltSize + NonceSize + TagSize).ToArray();
            var plainBytes = new byte[cipherBytes.Length];
            var key = DeriveKey(encryptKey, salt, DefaultIterations);

            using var aes = new AesGcm(key, TagSize);
            aes.Decrypt(nonce, cipherBytes, tag, plainBytes);
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch
        {
            return "";
        }
    }

    public static string EncryptPbkdf2AesCbcHex(string encryptKey, string plainText, string saltValue, int iterations = 1000)
    {
        if (string.IsNullOrEmpty(encryptKey) || plainText is null || string.IsNullOrEmpty(saltValue) || iterations <= 0)
        {
            return "";
        }

        try
        {
            var derived = DeriveBytes(encryptKey, Encoding.UTF8.GetBytes(saltValue), iterations, KeySize + 16);
            var keyBytes = derived.AsSpan(0, KeySize).ToArray();
            var ivBytes = derived.AsSpan(KeySize, 16).ToArray();
            using var aes = Aes.Create();
            aes.Key = keyBytes;
            aes.IV = ivBytes;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var encryptor = aes.CreateEncryptor();
            var inputBytes = Encoding.UTF8.GetBytes(plainText);
            return ToHex(encryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length));
        }
        catch
        {
            return "";
        }
    }

    public static string DecryptPbkdf2AesCbcHex(string encryptKey, string cipherHex, string saltValue, int iterations = 1000)
    {
        if (string.IsNullOrEmpty(encryptKey) || string.IsNullOrWhiteSpace(cipherHex) || string.IsNullOrEmpty(saltValue) || iterations <= 0)
        {
            return "";
        }

        try
        {
            var derived = DeriveBytes(encryptKey, Encoding.UTF8.GetBytes(saltValue), iterations, KeySize + 16);
            var keyBytes = derived.AsSpan(0, KeySize).ToArray();
            var ivBytes = derived.AsSpan(KeySize, 16).ToArray();
            using var aes = Aes.Create();
            aes.Key = keyBytes;
            aes.IV = ivBytes;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var decryptor = aes.CreateDecryptor();
            var cipherBytes = FromHex(cipherHex);
            var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch
        {
            return "";
        }
    }

    public static string HashSha512Hex(string text)
    {
        try
        {
            return ToHex(SHA512.HashData(Encoding.UTF8.GetBytes(text ?? "")));
        }
        catch
        {
            return "";
        }
    }

    public static string ToHex(byte[] bytes) =>
        Convert.ToHexString(bytes).ToLowerInvariant();

    public static byte[] FromHex(string hex)
    {
        var cleaned = new string((hex ?? "").Where(c => !char.IsWhiteSpace(c)).ToArray());
        if (cleaned.Length == 0 || cleaned.Length % 2 != 0)
        {
            throw new FormatException("Hex value must contain an even number of characters.");
        }

        var bytes = new byte[cleaned.Length / 2];
        for (var i = 0; i < bytes.Length; i++)
        {
            bytes[i] = byte.Parse(cleaned.Substring(i * 2, 2), NumberStyles.HexNumber, CultureInfo.InvariantCulture);
        }

        return bytes;
    }

    private static byte[] DeriveKey(string encryptKey, byte[] salt, int iterations)
    {
        return DeriveBytes(encryptKey, salt, iterations, KeySize);
    }

    private static byte[] DeriveBytes(string encryptKey, byte[] salt, int iterations, int outputLength) =>
        Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(encryptKey),
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            outputLength);
}
