<%@ Language=VBScript %>
<!--#include virtual="/includes/configs_individual.inc"-->
<!--#include virtual="/includes/sdnsfunctions.inc"-->
<!--#include virtual="/functions/functions.inc"-->
<%
' dnsAgent.asp
' JSON DNS bridge for the rebuilt Control Panel.
'
' Upload target suggestion:
'   http://member5.smarterasp.net/new/dnsAgent.asp
'
' This endpoint intentionally reuses the old DNS implementation:
'   /includes/configs*.inc supplies currentDNSServer, dnsport, dnspassword
'   /includes/sdnsfunctions.inc supplies showRecord, addARecordOpt, addCNAMERecord,
'   addMXRecord, addTXTRecord, addSRVRecord, deleteRecordAt, deleteArecord,
'   deleteCNAMErecord, etc.
'
' Expected POST fields:
'   token       optional shared server-side token, if LEGACY_DNS_AGENT_TOKEN is set here
'   action      list | add | edit | delete
'   zonename    domain zone, for example example.com
'   rectype     A | AAAA | CNAME | MX | TXT | SRV
'   recordname  relative host, @, blank, or FQDN inside zonename
'   webip       record value / target
'   ttl         ttl seconds
'   priority    MX/SRV priority
'   weight      SRV weight
'   port        SRV port
'   recindex    index from showRecord for delete
'
' Do not call this directly from browser JavaScript. The new ASP.NET app calls it
' after account/domain ownership validation.

Option Explicit
Response.Buffer = True
Response.ContentType = "application/json"
Response.Charset = "utf-8"
On Error Resume Next
Response.TrySkipIisCustomErrors = True
On Error GoTo 0

Const LOCAL_DNS_AGENT_TOKEN = ""

On Error Resume Next
Main
If Err.Number <> 0 Then
  WriteJson False, "DNS server error.", "[]", 500
End If
On Error GoTo 0

Sub Main()
  If LCase(Trim(Request.QueryString("health") & Request.Form("health"))) = "1" Then
    Response.Write "{""success"":true,""agent"":""dnsAgent"",""version"":""2026-06-13.1""}"
    Exit Sub
  End If

  If Not TokenAllowed() Then
    WriteJson False, "DNS agent token is invalid.", "[]", 403
    Exit Sub
  End If

  Dim action, zoneName, nsSer
  action = LCase(Trim(Request.Form("action") & Request.QueryString("action")))
  zoneName = LCase(Trim(Request.Form("zonename") & Request.QueryString("zonename")))

  If action = "" Then action = "list"
  If Not IsSafeZone(zoneName) Then
    WriteJson False, "Invalid DNS zone.", "[]", 400
    Exit Sub
  End If

  nsSer = getDomainNS(zoneName)
  If Trim(nsSer) = "" Then nsSer = currentDNSServer

  Select Case action
    Case "list"
      WriteJson True, "DNS records loaded.", RecordsJson(nsSer, zoneName), 200
    Case "delete"
      HandleDelete nsSer, zoneName
    Case "add", "edit"
      HandleUpsert action, nsSer, zoneName
    Case Else
      WriteJson False, "Unsupported DNS action.", "[]", 400
  End Select
End Sub

Sub HandleDelete(nsSer, zoneName)
  Dim recIndex, result
  recIndex = Trim(Request.Form("recindex") & Request.QueryString("recindex"))
  If Not IsNumeric(recIndex) Then
    WriteJson False, "Choose the DNS record to delete.", "[]", 400
    Exit Sub
  End If

  result = deleteRecordAt(nsSer, zoneName, CLng(recIndex))
  If LCase(result) = "done" Then
    WriteJson True, "DNS record deleted.", RecordsJson(nsSer, zoneName), 200
  Else
    WriteJson False, "DNS delete failed: " & CStr(result), RecordsJson(nsSer, zoneName), 400
  End If
End Sub

Sub HandleUpsert(action, nsSer, zoneName)
  Dim rectype, recordName, hostName, webip, ttl, priority, weight, port, recIndex, result
  rectype = UCase(Trim(Request.Form("rectype") & Request.QueryString("rectype")))
  recordName = LCase(Trim(Request.Form("recordname") & Request.QueryString("recordname")))
  recordName = Replace(recordName, zoneName, "")
  recordName = Trim(Replace(recordName, "..", "."))
  If Left(recordName, 1) = "." Then recordName = Mid(recordName, 2)
  If Right(recordName, 1) = "." Then recordName = Left(recordName, Len(recordName) - 1)
  If recordName = "@" Or recordName = "<name>" Then recordName = ""
  hostName = recordName

  If recordName <> "" Then
    recordName = recordName & "." & zoneName
  Else
    recordName = zoneName
  End If

  webip = Trim(Request.Form("webip") & Request.QueryString("webip"))
  ttl = Trim(Request.Form("ttl") & Request.QueryString("ttl"))
  priority = Trim(Request.Form("priority") & Request.QueryString("priority"))
  weight = Trim(Request.Form("weight") & Request.QueryString("weight"))
  port = Trim(Request.Form("port") & Request.QueryString("port"))
  recIndex = Trim(Request.Form("recindex") & Request.QueryString("recindex"))
  If ttl = "" Or Not IsNumeric(ttl) Then ttl = "300"
  If priority = "" Or Not IsNumeric(priority) Then priority = "10"
  If weight = "" Or Not IsNumeric(weight) Then weight = "1"
  If port = "" Or Not IsNumeric(port) Then port = "443"

  If Not IsSafeRecordType(rectype) Or Not IsSafeRecordName(hostName) Then
    WriteJson False, "Invalid DNS record.", RecordsJson(nsSer, zoneName), 400
    Exit Sub
  End If

  If action = "edit" Then
    If IsNumeric(recIndex) Then
      Call deleteRecordAt(nsSer, zoneName, CLng(recIndex))
    End If

    Select Case rectype
      Case "A"
        result = addARecordOpt(nsSer, zoneName, recordName, webip, ttl, "over")
      Case "AAAA"
        result = addAAAARecordOpt(nsSer, zoneName, recordName, webip, ttl, "over")
      Case "CNAME"
        result = addCNAMERecord(nsSer, zoneName, recordName, webip, ttl)
      Case "MX"
        result = addMXRecord(nsSer, zoneName, recordName, priority, webip, ttl)
      Case "TXT"
        result = addTXTRecord(nsSer, zoneName, recordName, webip, ttl)
      Case "SRV"
        result = addSRVRecord(nsSer, zoneName, recordName, priority, weight, port, webip, 3600)
    End Select
  Else
    Select Case rectype
      Case "A"
        Call deleteCNAMErecord(zoneName, hostName)
        result = addARecordOpt(nsSer, zoneName, recordName, webip, ttl, "over")
      Case "AAAA"
        result = addAAAARecordOpt(nsSer, zoneName, recordName, webip, ttl, "over")
      Case "CNAME"
        Call deleteArecord(zoneName, hostName)
        result = addCNAMERecord(nsSer, zoneName, recordName, webip, ttl)
      Case "MX"
        result = addMXRecord(nsSer, zoneName, recordName, priority, webip, ttl)
      Case "TXT"
        result = addTXTRecord(nsSer, zoneName, recordName, webip, ttl)
      Case "SRV"
        result = addSRVRecord(nsSer, zoneName, recordName, priority, weight, port, webip, 3600)
    End Select
  End If

  If LCase(result) = "done" Then
    WriteJson True, "DNS record saved.", RecordsJson(nsSer, zoneName), 200
  Else
    WriteJson False, "DNS save failed: " & CStr(result), RecordsJson(nsSer, zoneName), 400
  End If
End Sub

Function RecordsJson(nsSer, zoneName)
  Dim recordString, recordArray, item, json, first
  recordString = showRecord(nsSer, zoneName)
  If InStr(recordString, "[!R]") <= 0 Then
    RecordsJson = "[]"
    Exit Function
  End If

  recordArray = Split(recordString, "[!R]")
  json = "["
  first = True

  For Each item In recordArray
    If item <> "" Then
      Dim recordIndex, recordType, recordName, recordTtl, dataFields, value, priority
      ParseRecord item, recordIndex, recordType, recordName, recordTtl, dataFields
      If UCase(recordType) <> "SOA" And UCase(recordType) <> "NS" Then
        value = ""
        priority = "null"
        If UCase(recordType) = "MX" Then
          If UBound(dataFields) >= 1 Then priority = JsonNumber(dataFields(1))
          If UBound(dataFields) >= 2 Then value = dataFields(2)
        ElseIf UCase(recordType) = "SRV" Then
          If UBound(dataFields) >= 1 Then priority = JsonNumber(dataFields(1))
          If UBound(dataFields) >= 4 Then value = dataFields(4)
        Else
          If UBound(dataFields) >= 1 Then value = dataFields(1)
        End If

        If Not first Then json = json & ","
        json = json & "{""index"":" & JsonNumber(recordIndex)
        json = json & ",""type"":" & JsonString(UCase(recordType))
        json = json & ",""name"":" & JsonString(DisplayRecordName(recordName, zoneName))
        json = json & ",""value"":" & JsonString(value)
        json = json & ",""priority"":" & priority
        json = json & ",""ttl"":" & JsonNumber(recordTtl)
        json = json & "}"
        first = False
      End If
    End If
  Next

  json = json & "]"
  RecordsJson = json
End Function

Sub ParseRecord(item, ByRef recordIndex, ByRef recordType, ByRef recordName, ByRef recordTtl, ByRef dataFields)
  Dim parts, temp
  parts = Split(item, "[!TYPE]")
  recordIndex = Replace(parts(0), "[!INDEX]", "")
  temp = parts(1)
  parts = Split(temp, "[!NAME]")
  recordType = parts(0)
  temp = parts(1)
  parts = Split(temp, "[!TTL]")
  recordName = parts(0)
  temp = parts(1)
  dataFields = Split(temp, "[!DATA]")
  recordTtl = dataFields(0)
End Sub

Function DisplayRecordName(recordName, zoneName)
  Dim name
  name = LCase(Trim(recordName))
  If name = LCase(zoneName) Then
    DisplayRecordName = "@"
  ElseIf Right(name, Len("." & zoneName)) = "." & LCase(zoneName) Then
    DisplayRecordName = Left(name, Len(name) - Len("." & zoneName))
  Else
    DisplayRecordName = name
  End If
End Function

Function TokenAllowed()
  Dim configuredToken, suppliedToken
  configuredToken = EnvValue("LEGACY_DNS_AGENT_TOKEN")
  If configuredToken = "" Then configuredToken = LOCAL_DNS_AGENT_TOKEN
  If configuredToken = "" Then
    TokenAllowed = True
    Exit Function
  End If
  suppliedToken = Trim(Request.Form("token") & Request.QueryString("token"))
  TokenAllowed = ConstantTimeEquals(configuredToken, suppliedToken)
End Function

Function EnvValue(name)
  On Error Resume Next
  Dim shell
  Set shell = Server.CreateObject("WScript.Shell")
  EnvValue = Trim(shell.Environment("PROCESS")(name))
  If EnvValue = "" Then EnvValue = Trim(shell.Environment("SYSTEM")(name))
  Set shell = Nothing
  On Error GoTo 0
End Function

Function IsSafeZone(value)
  IsSafeZone = IsSafeRecordName(value) And InStr(value, ".") > 0 And InStr(value, "..") = 0
End Function

Function IsSafeRecordType(value)
  Select Case UCase(value)
    Case "A", "AAAA", "CNAME", "MX", "TXT", "SRV"
      IsSafeRecordType = True
    Case Else
      IsSafeRecordType = False
  End Select
End Function

Function IsSafeRecordName(value)
  Dim i, ch
  If value = "" Or value = "@" Then
    IsSafeRecordName = True
    Exit Function
  End If
  If Len(value) > 253 Then
    IsSafeRecordName = False
    Exit Function
  End If
  For i = 1 To Len(value)
    ch = Mid(value, i, 1)
    If InStr("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._*", ch) = 0 Then
      IsSafeRecordName = False
      Exit Function
    End If
  Next
  IsSafeRecordName = True
End Function

Function JsonString(value)
  Dim text
  text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, """", "\""")
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  JsonString = """" & text & """"
End Function

Function JsonNumber(value)
  If IsNumeric(value) Then
    JsonNumber = CStr(CLng(value))
  Else
    JsonNumber = "0"
  End If
End Function

Function ConstantTimeEquals(a, b)
  Dim i, diff
  If Len(a) <> Len(b) Then
    ConstantTimeEquals = False
    Exit Function
  End If
  diff = 0
  For i = 1 To Len(a)
    diff = diff Or (Asc(Mid(a, i, 1)) Xor Asc(Mid(b, i, 1)))
  Next
  ConstantTimeEquals = (diff = 0)
End Function

Sub WriteJson(success, message, recordsJson, statusCode)
  Response.Status = CStr(statusCode)
  Response.Write "{""success"":" & LCase(CStr(success)) & ",""message"":" & JsonString(message) & ",""records"":" & recordsJson & "}"
End Sub
%>
