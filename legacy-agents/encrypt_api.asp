<%
Option Explicit
Response.Buffer = True
Response.Expires = -1
Response.ContentType = "text/plain"

Const ALG1 = 26128
Const HOHO_KEY1 = 32782
Const IMPORT_KEY8 = "s8F3D4365a3D31p35EeB6A323A98w1BB"
Const IMPORT_KEY2 = "hahEwkljf2885Jiwkljf288Ly"
Const FTP_PWD_KEYXXX = "keCHLxhYyB6TfW5BsygF7bAm27t2t6APhkmgKabnBmQ75xuhwPcEDjyqCJSK5Jh2"

Dim actionName, inputValue, outputValue
actionName = LCase(Trim(ReadParam("action")))
If actionName = "" Then actionName = LCase(Trim(ReadParam("mode")))
If actionName = "" Then actionName = LCase(Trim(ReadParam("kind")))

If actionName = "health" Then
  Response.Write "ok"
  Response.End
End If

inputValue = ReadParam("value")
If inputValue = "" Then inputValue = ReadParam("text")
If inputValue = "" Then inputValue = ReadParam("plain")
If inputValue = "" Then inputValue = ReadParam("password")
If inputValue = "" Then inputValue = ReadParam("pwd")

If inputValue = "" Then
  Response.Status = "400 Bad Request"
  Response.Write "Missing value"
  Response.End
End If

Select Case actionName
  Case "encryptpwd", "encrypt"
    outputValue = EncryptLegacy(IMPORT_KEY8, inputValue)
  Case "encryptimportkey2", "encrypt_importkey2", "importkey2_encrypt"
    outputValue = EncryptLegacy(IMPORT_KEY2, inputValue)
  Case "encryptftppwd", "encryptftp", "encrypt_ftp"
    outputValue = EncryptLegacy(FTP_PWD_KEYXXX, inputValue)
  Case "decryptpwd", "decrypt"
    outputValue = DecryptLegacy(IMPORT_KEY8, inputValue)
  Case "decryptimportkey2", "decrypt_importkey2", "importkey2_decrypt"
    outputValue = DecryptLegacy(IMPORT_KEY2, inputValue)
  Case "decryptftppwd", "decryptftp", "decrypt_ftp"
    outputValue = DecryptLegacy(FTP_PWD_KEYXXX, inputValue)
  Case Else
    Response.Status = "400 Bad Request"
    Response.Write "Unknown action"
    Response.End
End Select

If outputValue = "" Then
  Response.Status = "500 Internal Server Error"
  Response.Write "Crypto operation failed"
  Response.End
End If

Response.Write outputValue
Response.End

Function ReadParam(name)
  Dim value
  value = Request.Form(name)
  If value = "" Then value = Request.QueryString(name)
  ReadParam = CStr(value)
End Function

Function EncryptLegacy(encryptKey, plainText)
  On Error Resume Next
  Dim cm, context, key, blob, encryptedText
  encryptedText = ""
  Set cm = Server.CreateObject("Persits.CryptoManager")
  Set context = cm.OpenContextEx("Microsoft Enhanced RSA and AES Cryptographic Provider", "", False)
  Set key = context.GenerateKeyFromPassword(encryptKey, HOHO_KEY1, ALG1)
  Set blob = key.EncryptText(plainText)
  encryptedText = blob.Hex
  Set blob = Nothing
  Set key = Nothing
  Set context = Nothing
  Set cm = Nothing
  If Err.Number <> 0 Then
    encryptedText = ""
    Err.Clear
  End If
  On Error GoTo 0
  EncryptLegacy = encryptedText
End Function

Function DecryptLegacy(encryptKey, keyHex)
  On Error Resume Next
  Dim cm, context, key, blob, decryptedText
  decryptedText = ""
  Set cm = Server.CreateObject("Persits.CryptoManager")
  Set context = cm.OpenContextEx("Microsoft Enhanced RSA and AES Cryptographic Provider", "", True)
  Set key = context.GenerateKeyFromPassword(encryptKey, HOHO_KEY1, ALG1)
  Set blob = cm.CreateBlob
  blob.Hex = keyHex
  decryptedText = key.DecryptText(blob)
  Set blob = Nothing
  Set key = Nothing
  Set context = Nothing
  Set cm = Nothing
  If Err.Number <> 0 Then
    decryptedText = ""
    Err.Clear
  End If
  On Error GoTo 0
  DecryptLegacy = decryptedText
End Function
%>
