<%@ Language=VBScript %>
<%
' fileManagerAction.asp
' JSON file/folder action endpoint for the rebuilt Control Panel File Manager.
' Upload target:
'   http://winxxxx.site4now.net:830/new/fileManagerAction.asp

Option Explicit
Response.Buffer = True
Response.ContentType = "application/json"
Response.Charset = "utf-8"
On Error Resume Next
Response.TrySkipIisCustomErrors = True
On Error GoTo 0

Const MAX_TEXT_FILE_BYTES = 1048576
Const LOCAL_ENCRYPT_KEY = "fc9ad28b5f9bd8bcaa3dd0e3c5a2dce915f413b8c8934d975364a52c2272a927"

Dim startedAt
startedAt = Timer

On Error Resume Next
Main
If Err.Number <> 0 Then
  WriteError "server_error", "Unable to run file manager action.", 500
End If
On Error GoTo 0

Sub Main()
  If LCase(Trim(Request.QueryString("health") & Request.Form("health"))) = "1" Then
    Response.Write "{""success"":true,""agent"":""fileManagerAction"",""version"":""2026-06-12.3"",""capabilities"":[""new-folder"",""new-file"",""read-file"",""save-file"",""rename"",""copy"",""move"",""unzip"",""delete""],""serverTime"":" & JsonString(FormatIsoDate(Now())) & "}"
    Exit Sub
  End If

  Dim cpLogin, basePath, selectedPath, action, name, targetPath, targetName, content
  cpLogin = DecodeRequestValue(Trim(Request.Form("u") & Request.QueryString("u")))
  basePath = DecodeRequestValue(Trim(Request.Form("b") & Request.QueryString("b")))
  selectedPath = DecodeRequestValue(Trim(Request.Form("p") & Request.QueryString("p")))
  action = LCase(Trim(Request.Form("action") & Request.QueryString("action")))
  name = SafeName(Trim(Request.Form("name") & Request.QueryString("name")))
  targetPath = DecodeRequestValue(Trim(Request.Form("targetPath") & Request.QueryString("targetPath")))
  targetName = SafeName(Trim(Request.Form("targetName") & Request.QueryString("targetName")))
  content = Request.Form("content")

  If cpLogin = "" Or basePath = "" Or action = "" Then
    WriteError "bad_request", "Missing file manager action fields.", 400
    Exit Sub
  End If

  If Not IsValidCpLogin(cpLogin) Then
    WriteError "forbidden", "Invalid hosting account identity.", 403
    Exit Sub
  End If

  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")

  Dim normalizedBase, currentPath, destinationPath, message
  normalizedBase = NormalizeBasePath(fso, basePath)
  If Not IsBasePathForUser(normalizedBase, cpLogin) Then
    WriteError "forbidden", "Base path must stay inside the selected hosting account.", 403
    Exit Sub
  End If

  currentPath = ResolveCustomerPath(fso, normalizedBase, selectedPath, message)
  If message <> "" Then
    WriteError "forbidden", message, 403
    Exit Sub
  End If

  If Not fso.FolderExists(currentPath) Then
    WriteError "not_found", "Folder does not exist.", 404
    Exit Sub
  End If

  If HasUnsafeReparsePoint(fso, normalizedBase, currentPath) Then
    WriteError "forbidden", "Folder path contains an unsafe junction or reparse point.", 403
    Exit Sub
  End If

  Select Case action
    Case "new-folder", "create-folder"
      If name = "" Then
        WriteError "bad_request", "Folder name is required.", 400
        Exit Sub
      End If
      destinationPath = currentPath & "\" & name
      If fso.FolderExists(destinationPath) Or fso.FileExists(destinationPath) Then
        WriteError "conflict", "A file or folder already exists with that name.", 409
        Exit Sub
      End If
      fso.CreateFolder destinationPath
      WriteSuccess "Folder created.", currentPath, ""

    Case "new-file", "save-file"
      If name = "" Then
        WriteError "bad_request", "File name is required.", 400
        Exit Sub
      End If
      destinationPath = currentPath & "\" & name
      If Not IsPathInsideBase(normalizedBase, destinationPath) Then
        WriteError "forbidden", "File path must stay inside the selected hosting account.", 403
        Exit Sub
      End If
      WriteTextFile fso, destinationPath, content
      WriteSuccess "File saved.", currentPath, ""

    Case "read-file", "edit-file"
      If name = "" Then
        WriteError "bad_request", "File name is required.", 400
        Exit Sub
      End If
      destinationPath = currentPath & "\" & name
      If Not fso.FileExists(destinationPath) Then
        WriteError "not_found", "File does not exist.", 404
        Exit Sub
      End If
      If fso.GetFile(destinationPath).Size > MAX_TEXT_FILE_BYTES Then
        WriteError "too_large", "File is too large to edit in the browser.", 413
        Exit Sub
      End If
      WriteSuccess "File loaded.", currentPath, ReadTextFile(fso, destinationPath)

    Case "rename"
      If name = "" Or targetName = "" Then
        WriteError "bad_request", "Current and new names are required.", 400
        Exit Sub
      End If
      RenameItem fso, normalizedBase, currentPath, name, targetName

    Case "copy", "move"
      If name = "" Or targetPath = "" Then
        WriteError "bad_request", "Source name and target path are required.", 400
        Exit Sub
      End If
      Dim resolvedTargetPath
      resolvedTargetPath = ResolveCustomerPath(fso, normalizedBase, targetPath, message)
      If message <> "" Then
        WriteError "forbidden", message, 403
        Exit Sub
      End If
      If Not fso.FolderExists(resolvedTargetPath) Then
        WriteError "not_found", "Target folder does not exist.", 404
        Exit Sub
      End If
      CopyMoveItem fso, normalizedBase, currentPath, name, resolvedTargetPath, targetName, action, Trim(Request.Form("overwrite") & Request.QueryString("overwrite"))

    Case "unzip"
      If name = "" Then
        WriteError "bad_request", "Zip file name is required.", 400
        Exit Sub
      End If
      Dim unzipTargetPath
      If targetPath = "" Then
        unzipTargetPath = currentPath
      Else
        unzipTargetPath = ResolveCustomerPath(fso, normalizedBase, targetPath, message)
        If message <> "" Then
          WriteError "forbidden", message, 403
          Exit Sub
        End If
      End If
      UnzipItem fso, normalizedBase, currentPath, name, unzipTargetPath

    Case "delete"
      If name = "" Then
        WriteError "bad_request", "File or folder name is required.", 400
        Exit Sub
      End If
      If LCase(Left(name, 11)) <> "codex-test-" Then
        WriteError "forbidden", "Delete is guarded to codex-test-* file manager items only.", 403
        Exit Sub
      End If
      DeleteItem fso, normalizedBase, currentPath, name

    Case Else
      WriteError "unsupported", "Unsupported file manager action.", 400
  End Select
End Sub

Sub RenameItem(fso, basePath, currentPath, name, targetName)
  Dim sourcePath, destinationPath
  sourcePath = currentPath & "\" & name
  destinationPath = currentPath & "\" & targetName
  If Not IsPathInsideBase(basePath, sourcePath) Or Not IsPathInsideBase(basePath, destinationPath) Then
    WriteError "forbidden", "Rename path must stay inside the selected hosting account.", 403
    Exit Sub
  End If
  If fso.FileExists(destinationPath) Or fso.FolderExists(destinationPath) Then
    WriteError "conflict", "A file or folder already exists with the new name.", 409
    Exit Sub
  End If
  If fso.FileExists(sourcePath) Then
    fso.MoveFile sourcePath, destinationPath
    WriteSuccess "File renamed.", currentPath, ""
  ElseIf fso.FolderExists(sourcePath) Then
    fso.MoveFolder sourcePath, destinationPath
    WriteSuccess "Folder renamed.", currentPath, ""
  Else
    WriteError "not_found", "File or folder does not exist.", 404
  End If
End Sub

Sub DeleteItem(fso, basePath, currentPath, name)
  Dim target
  target = currentPath & "\" & name
  If Not IsPathInsideBase(basePath, target) Then
    WriteError "forbidden", "Delete path must stay inside the selected hosting account.", 403
    Exit Sub
  End If
  If fso.FolderExists(target) And HasUnsafeReparsePoint(fso, basePath, target) Then
    WriteError "forbidden", "Folder path contains an unsafe junction or reparse point.", 403
    Exit Sub
  End If
  If fso.FileExists(target) Then
    fso.DeleteFile target, True
    WriteSuccess "File deleted.", currentPath, ""
  ElseIf fso.FolderExists(target) Then
    fso.DeleteFolder target, True
    WriteSuccess "Folder deleted.", currentPath, ""
  Else
    WriteError "not_found", "File or folder does not exist.", 404
  End If
End Sub

Sub UnzipItem(fso, basePath, currentPath, name, targetPath)
  Dim sourcePath
  sourcePath = currentPath & "\" & name
  If Not IsPathInsideBase(basePath, sourcePath) Or Not IsPathInsideBase(basePath, targetPath) Then
    WriteError "forbidden", "Unzip path must stay inside the selected hosting account.", 403
    Exit Sub
  End If
  If LCase(Right(name, 4)) <> ".zip" Then
    WriteError "bad_request", "Only .zip files can be unpacked.", 400
    Exit Sub
  End If
  If Not fso.FileExists(sourcePath) Then
    WriteError "not_found", "Zip file does not exist.", 404
    Exit Sub
  End If
  If Not fso.FolderExists(targetPath) Then
    fso.CreateFolder targetPath
  End If

  On Error Resume Next
  Dim shell, source, target
  Set shell = Server.CreateObject("Shell.Application")
  Set source = shell.NameSpace(sourcePath)
  Set target = shell.NameSpace(targetPath)
  If Err.Number <> 0 Or source Is Nothing Or target Is Nothing Then
    Err.Clear
    On Error GoTo 0
    WriteError "server_error", "Unable to open zip file.", 500
    Exit Sub
  End If
  target.CopyHere source.Items, 16
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    WriteError "server_error", "Unable to unpack zip file.", 500
    Exit Sub
  End If
  On Error GoTo 0
  WriteSuccess "Zip file unpacked.", currentPath, ""
End Sub

Sub CopyMoveItem(fso, basePath, currentPath, name, targetPath, targetName, action, overwriteValue)
  Dim sourcePath, destinationPath, destinationName, overwrite
  sourcePath = currentPath & "\" & name
  destinationName = name
  If targetName <> "" Then destinationName = targetName
  destinationPath = targetPath & "\" & destinationName
  overwrite = overwriteValue = "1" Or LCase(overwriteValue) = "true"

  If Not IsPathInsideBase(basePath, sourcePath) Or Not IsPathInsideBase(basePath, destinationPath) Then
    WriteError "forbidden", "Copy/move path must stay inside the selected hosting account.", 403
    Exit Sub
  End If
  If fso.FolderExists(sourcePath) And HasUnsafeReparsePoint(fso, basePath, sourcePath) Then
    WriteError "forbidden", "Source folder contains an unsafe junction or reparse point.", 403
    Exit Sub
  End If
  If fso.FolderExists(destinationPath) Or fso.FileExists(destinationPath) Then
    If Not overwrite Then
      WriteError "conflict", "A file or folder already exists in the target folder.", 409
      Exit Sub
    End If
    If fso.FileExists(destinationPath) Then fso.DeleteFile destinationPath, True
    If fso.FolderExists(destinationPath) Then fso.DeleteFolder destinationPath, True
  End If

  If fso.FileExists(sourcePath) Then
    If action = "copy" Then
      fso.CopyFile sourcePath, destinationPath, True
      WriteSuccess "File copied.", currentPath, ""
    Else
      fso.MoveFile sourcePath, destinationPath
      WriteSuccess "File moved.", currentPath, ""
    End If
  ElseIf fso.FolderExists(sourcePath) Then
    If action = "copy" Then
      fso.CopyFolder sourcePath, destinationPath, True
      WriteSuccess "Folder copied.", currentPath, ""
    Else
      fso.MoveFolder sourcePath, destinationPath
      WriteSuccess "Folder moved.", currentPath, ""
    End If
  Else
    WriteError "not_found", "File or folder does not exist.", 404
  End If
End Sub

Function DecodeRequestValue(value)
  DecodeRequestValue = ""
  If value = "" Then Exit Function

  Dim encryptKey
  encryptKey = LOCAL_ENCRYPT_KEY
  If encryptKey = "" Then encryptKey = GetSettingValue("FILE_MANAGER_ENCRYPT_KEY", "")
  If encryptKey = "" Then
    DecodeRequestValue = value
    Exit Function
  End If

  If Not LooksLikeHex(value) Then
    Exit Function
  End If

  DecodeRequestValue = Rc4HexDecrypt(encryptKey, value)
End Function

Function GetSettingValue(name, fallback)
  On Error Resume Next
  Dim shell, value
  value = ""
  Set shell = Server.CreateObject("WScript.Shell")
  value = Trim(shell.Environment("PROCESS")(name) & "")
  If value = "" Then value = Trim(shell.Environment("SYSTEM")(name) & "")
  If value = "" Then value = Trim(shell.Environment("USER")(name) & "")
  Set shell = Nothing
  On Error GoTo 0

  If value = "" Then value = fallback
  GetSettingValue = value
End Function

Function LooksLikeHex(value)
  Dim i, ch
  LooksLikeHex = False
  If Len(value) < 2 Or (Len(value) Mod 2) <> 0 Then Exit Function
  For i = 1 To Len(value)
    ch = LCase(Mid(value, i, 1))
    If InStr("0123456789abcdef", ch) = 0 Then Exit Function
  Next
  LooksLikeHex = True
End Function

Function Rc4HexDecrypt(encryptKey, cipherHex)
  Dim keyBytes(), state(255), cipherBytes(), outputBytes()
  Dim i, j, x, n, keyLen, tmp, k, byteValue

  keyLen = Len(encryptKey)
  If keyLen = 0 Then
    Rc4HexDecrypt = ""
    Exit Function
  End If

  ReDim keyBytes(keyLen - 1)
  For i = 1 To keyLen
    keyBytes(i - 1) = Asc(Mid(encryptKey, i, 1)) And 255
  Next

  ReDim cipherBytes((Len(cipherHex) \ 2) - 1)
  ReDim outputBytes(UBound(cipherBytes))
  For i = 0 To UBound(cipherBytes)
    cipherBytes(i) = CInt("&H" & Mid(cipherHex, (i * 2) + 1, 2))
  Next

  For i = 0 To 255
    state(i) = i
  Next

  j = 0
  For i = 0 To 255
    j = (j + state(i) + keyBytes(i Mod keyLen)) Mod 256
    tmp = state(i)
    state(i) = state(j)
    state(j) = tmp
  Next

  x = 0
  j = 0
  For n = 0 To UBound(cipherBytes)
    x = (x + 1) Mod 256
    j = (j + state(x)) Mod 256
    tmp = state(x)
    state(x) = state(j)
    state(j) = tmp
    k = state((state(x) + state(j)) Mod 256)
    outputBytes(n) = cipherBytes(n) Xor k
  Next

  Rc4HexDecrypt = Utf8BytesToString(outputBytes)
End Function

Function Utf8BytesToString(bytes)
  On Error Resume Next
  Dim stream
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1
  stream.Open
  stream.Write BytesToBinary(bytes)
  stream.Position = 0
  stream.Type = 2
  stream.Charset = "utf-8"
  Utf8BytesToString = stream.ReadText
  stream.Close
  Set stream = Nothing
  If Err.Number <> 0 Then
    Err.Clear
    Utf8BytesToString = BytesToLatin1String(bytes)
  End If
  On Error GoTo 0
End Function

Function BytesToBinary(bytes)
  Dim i, binary
  binary = ""
  For i = 0 To UBound(bytes)
    binary = binary & ChrB(bytes(i))
  Next
  BytesToBinary = binary
End Function

Function BytesToLatin1String(bytes)
  Dim i, text
  text = ""
  For i = 0 To UBound(bytes)
    text = text & Chr(bytes(i))
  Next
  BytesToLatin1String = text
End Function

Function IsValidCpLogin(cpLogin)
  Dim i, ch
  IsValidCpLogin = False
  If Len(cpLogin) < 3 Or Len(cpLogin) > 80 Then Exit Function
  For i = 1 To Len(cpLogin)
    ch = LCase(Mid(cpLogin, i, 1))
    If InStr("abcdefghijklmnopqrstuvwxyz0123456789-_", ch) = 0 Then Exit Function
  Next
  IsValidCpLogin = True
End Function

Function SafeName(value)
  Dim i, ch, clean
  clean = ""
  For i = 1 To Len(value)
    ch = Mid(value, i, 1)
    If InStr("\/:*?""<>|", ch) = 0 Then clean = clean & ch
  Next
  If InStr(clean, "..") > 0 Then clean = ""
  SafeName = Left(Trim(clean), 160)
End Function

Function NormalizeBasePath(fso, basePath)
  Dim value
  value = Replace(Trim(basePath), "/", "\")
  value = Replace(value, "\\?\", "")
  value = fso.GetAbsolutePathName(value)
  NormalizeBasePath = TrimTrailingSlash(value)
End Function

Function IsBasePathForUser(basePath, cpLogin)
  Dim expected, normalized
  expected = "h:\root\home\" & LCase(cpLogin)
  normalized = LCase(TrimTrailingSlash(basePath))
  IsBasePathForUser = (normalized = expected Or Left(normalized, Len(expected) + 1) = expected & "\")
End Function

Function ResolveCustomerPath(fso, normalizedBase, requestedPath, ByRef validationMessage)
  validationMessage = ""
  Dim cleanRequest, candidate
  cleanRequest = Replace(Trim(requestedPath), "/", "\")
  cleanRequest = Replace(cleanRequest, "\\?\", "")
  If cleanRequest = "" Or cleanRequest = "\" Then
    ResolveCustomerPath = normalizedBase
    Exit Function
  End If
  If InStr(cleanRequest, "..") > 0 Or Left(cleanRequest, 2) = "\\" Then
    validationMessage = "Invalid directory access."
    Exit Function
  End If
  If InStr(cleanRequest, ":") > 0 And Not StartsWithIgnoreCase(cleanRequest, normalizedBase) Then
    validationMessage = "File manager path must stay inside the selected hosting account."
    Exit Function
  End If
  If StartsWithIgnoreCase(cleanRequest, normalizedBase) Then
    candidate = cleanRequest
  Else
    candidate = normalizedBase & "\" & TrimLeadingSlash(cleanRequest)
  End If
  candidate = fso.GetAbsolutePathName(candidate)
  If Not IsPathInsideBase(normalizedBase, candidate) Then
    validationMessage = "File manager path must stay inside the selected hosting account."
    Exit Function
  End If
  ResolveCustomerPath = TrimTrailingSlash(candidate)
End Function

Function IsPathInsideBase(basePath, candidatePath)
  Dim baseWithSlash, candidateWithSlash
  baseWithSlash = LCase(TrimTrailingSlash(basePath) & "\")
  candidateWithSlash = LCase(TrimTrailingSlash(candidatePath) & "\")
  IsPathInsideBase = (Left(candidateWithSlash, Len(baseWithSlash)) = baseWithSlash) Or (LCase(TrimTrailingSlash(candidatePath)) = LCase(TrimTrailingSlash(basePath)))
End Function

Function HasUnsafeReparsePoint(fso, basePath, targetPath)
  On Error Resume Next
  HasUnsafeReparsePoint = False

  Dim rel, parts, current, i, folder
  rel = Mid(TrimTrailingSlash(targetPath), Len(TrimTrailingSlash(basePath)) + 1)
  rel = TrimLeadingSlash(rel)
  If rel = "" Then Exit Function

  parts = Split(rel, "\")
  current = TrimTrailingSlash(basePath)

  For i = 0 To UBound(parts)
    If parts(i) <> "" Then
      current = current & "\" & parts(i)
      If fso.FolderExists(current) Then
        Set folder = fso.GetFolder(current)
        If (CLng(folder.Attributes) And 1024) <> 0 Then
          HasUnsafeReparsePoint = True
          Exit Function
        End If
      End If
    End If
  Next

  Set folder = Nothing
  On Error GoTo 0
End Function

Function StartsWithIgnoreCase(value, prefix)
  StartsWithIgnoreCase = (Left(LCase(value), Len(LCase(prefix))) = LCase(prefix))
End Function

Function TrimTrailingSlash(value)
  Do While Len(value) > 3 And Right(value, 1) = "\"
    value = Left(value, Len(value) - 1)
  Loop
  TrimTrailingSlash = value
End Function

Function TrimLeadingSlash(value)
  Do While Left(value, 1) = "\"
    value = Mid(value, 2)
  Loop
  TrimLeadingSlash = value
End Function

Function ReadTextFile(fso, path)
  Dim stream
  Set stream = fso.OpenTextFile(path, 1, False, -2)
  ReadTextFile = stream.ReadAll
  stream.Close
  Set stream = Nothing
End Function

Sub WriteTextFile(fso, path, content)
  Dim stream
  Set stream = fso.OpenTextFile(path, 2, True, -2)
  stream.Write content
  stream.Close
  Set stream = Nothing
End Sub

Sub WriteSuccess(message, path, preview)
  Response.Write "{"
  Response.Write """success"":true,"
  Response.Write """message"":" & JsonString(message) & ","
  Response.Write """path"":" & JsonString(path) & ","
  Response.Write """preview"":" & JsonString(preview) & ","
  Response.Write """elapsedMs"":" & CLng((Timer - startedAt) * 1000)
  Response.Write "}"
End Sub

Sub WriteError(code, message, statusCode)
  Response.Status = CStr(statusCode) & " " & message
  On Error Resume Next
  Response.TrySkipIisCustomErrors = True
  On Error GoTo 0
  Response.Write "{"
  Response.Write """success"":false,"
  Response.Write """code"":" & JsonString(code) & ","
  Response.Write """message"":" & JsonString(message)
  Response.Write "}"
End Sub

Function FormatIsoDate(value)
  FormatIsoDate = Year(value) & "-" & Pad2(Month(value)) & "-" & Pad2(Day(value)) & "T" & Pad2(Hour(value)) & ":" & Pad2(Minute(value)) & ":" & Pad2(Second(value))
End Function

Function Pad2(value)
  If CInt(value) < 10 Then Pad2 = "0" & CStr(value) Else Pad2 = CStr(value)
End Function

Function JsonString(value)
  JsonString = """" & JsonEscape(CStr(value)) & """"
End Function

Function JsonEscape(value)
  value = Replace(value, "\", "\\")
  value = Replace(value, """", "\""")
  value = Replace(value, vbCrLf, "\n")
  value = Replace(value, vbCr, "\n")
  value = Replace(value, vbLf, "\n")
  value = Replace(value, vbTab, "\t")
  JsonEscape = value
End Function
%>
