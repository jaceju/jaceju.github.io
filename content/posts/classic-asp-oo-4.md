---
title: 'ASP 物件設計手法 (4) - 動態載入類別'
date: 2005-12-10 00:00:00 +08:00


tags: ["ASP"]
---

為了避免類別重覆宣告，我想盡辦法做了一些調整，但都不如已意。後來我回想起自己曾經找過一篇[動態載入 ASP 程式的文章](http://www.blueidea.com/tech/program/2003/101.asp)，那時因為它無法達到我的需求而放棄，但是現在它卻有新的用法。

<!-- more -->

## 載入文件

首先透過 ADODB.Stream ，我們可以把一份文字檔載入記憶體：

```
LoadFile.asp
<%
Public Function LoadFile(sFilePath)
    Dim oStream
    On Error Resume Next
    Set oStream = Server.CreateObject("ADODB.Stream")
    With oStream
        .Type = 2
        .Mode = 3
        .CharSet = "BIG5"
        .Open
        .LoadFromFile Server.MapPath(sFilePath)
        If Err.Number <> 0 Then
            Err.Clear
            Response.Write "[FUNCTION] LoadFile Error - 找不到檔案：" &amp; sFilePath
            Response.End
        End If
        LoadFile = .ReadText
        .Close
    End With
    Set oStream = Nothing
End Function
%>

```

有些人習慣使用 FileSystemObject 來載入檔案內容，但是利用 ADODB.Stream 的效率會比較好。

## 動態載入 ASP 類別檔

以下的程式就是從前面那篇文章所提供的程式修改而來的，

```
Include.asp
<!-- #include file = "LoadFile.asp" -->
<%
Public Const ASP_LEFT = "<%"
Public Const ASP_RIGHT = "%\>"
Public Function Include(sFileName)
    Dim sContent : sContent = LoadFile(sFileName)
    Dim iEnd : iEnd = 1
    Dim iStart : iStart = InStr(iEnd, sContent, ASP_LEFT) + 2
    Do While iStart > iEnd + 1
        iEnd = InStr(iStart, sContent, ASP_RIGHT) + 2
        ExecuteGlobal(Mid(sContent, iStart, iEnd - iStart - 2))
        iStart = InStr(iEnd, sContent, ASP_LEFT) + 2
    Loop
End Function
%>

```

其中 "%\>" 是為了避開 ASP 解譯程式上的錯誤。主要的概念就是利用 [ExecuteGlobal](http://msdn.microsoft.com/library/en-us/script56/html/vsstmExecuteGlobal.asp) 來執行 ASP 檔案中的 <% 及 %> 兩個符號間的內容，如果使用 [Execute](http://msdn.microsoft.com/library/default.asp?url=/library/en-us/script56/html/vsstmExecute.asp) 的話，會發生找不到 Class 的錯誤。

## 建立物件

還記得前面所介紹的類別命名規則和工廠方法嗎？這裡就派上用場了。

```
GetObject.asp
<!-- #include file="Include.asp" -->
<%
Public Const CLASS_DIR = ""
Public Function GetObject(sClassName)
    Dim sFileName
    sFileName = Replace(sClassName, "_", "/") &amp; ".asp"
    Set GetObject = Nothing
    On Error Resume Next
    Include sFileName
    Execute "Set GetObject = New " &amp; sClassName
    On Error Goto 0
End Function
%>

```

首先我們把類別名稱中的 "_" (底線) 換成 "/" (斜線) 再加上 ".asp" ，然後利用工廠方法來回傳建立好的物件。

註：因為 ASP (VBScript) 沒有內建 GetObject 函式，所以我們可以這樣寫。如果是在 WScript 裡面就不能用 GetObject ，因為它是內建函式。

以下就是簡單的測試方式：

```
<!-- #include file="GetObject.asp" -->
<%
Dim oCache1 : Set oCache1 = GetObject("HTML_Cache")
Response.Write TypeName(oCache1) &amp; "<br />" &amp; vbCrLf
oCache1.SetExpire 10
If oCache1.IsCached Then
    Response.Write "File1 is cached.<br />" &amp; vbCrLf
End If
Set oCache1 = Nothing

Dim oCache2 : Set oCache2 = GetObject("HTML_Cache")
Response.Write TypeName(oCache2) &amp; "<br />" &amp; vbCrLf
If oCache2.IsCached Then
    Response.Write "File2 is cached.<br />" &amp; vbCrLf
End If
Set oCache2 = Nothing
%>

```

而測試用的類別檔如下 (我簡化了許多不必要的程式) ：

```
HTML\Cache.asp
<%
Class HTML_Cache
    Private Expire

    Public Function IsCached()
        IsCached = True
    End Function

    Public Sub SetExpire(iSecond)
        Expire = iSecond
    End Sub
End Class
%>

```

測試一下，是不是很有趣呢？

## 總結

對我而言，如果把複雜的事情簡化，是一種學習的動力。透過這些步驟，我能夠很輕鬆地載入我想要的類別，而不必再煩惱是不是載入了重複的類別檔案。這系列的文章如果能對某些想要學習的人有用，那麼就值得了。

## 相關文章

* [ASP 物件導向 (1) - 基礎](http://www.jaceju.net/blog/archives/51/)
* [ASP 物件導向 (2) - 初級技巧](http://www.jaceju.net/blog/archives/52/)
* [ASP 物件導向 (3) - 進階技巧](http://www.jaceju.net/blog/archives/54/)
* [ASP 物件導向 (4) - 動態載入類別](http://www.jaceju.net/blog/archives/57/)
* [ASP 物件導向 (5) - Me 關鍵字](http://www.jaceju.net/blog/archives/59/)
* [ASP 物件導向 (6) - 單元測試](http://www.jaceju.net/blog/archives/76/)

