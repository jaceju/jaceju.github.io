---
title: 'ASP 物件設計手法 (5) - Me 關鍵字'
date: 2005-12-16 00:00:00 +08:00


tags: ["ASP"]
---

一直以來我都以為 Me 這個關鍵字只能在 VB 上用，沒想到這兩天我用了 Me 當類別屬性時發生錯誤，這讓我得重新檢視它是不是個 VBScript 的預設關鍵字。

我找過 [MSDN](http://msdn.microsoft.com/library/) 的 [Scripting](http://msdn.microsoft.com/library/en-us/dnanchor/html/Scriptinga.asp) ，裡面並沒有提到 Me 這個關鍵字，反而是在 VB 6.0 裡找到這個關鍵字的[說明](http://msdn.microsoft.com/library/default.asp?url=/library/en-us/vbenlr98/html/vakeyme.asp)。真是神「 Me 」 呀！它在 VB 中的主要用途一為指向類別自己，二為指向 Form 物件。不過 ASP 中應該是沒有 Form 物件可參考 (這裡我保留這樣的想法，也許將來又發現自己錯了) ，所以對我來說這個關鍵字就是用在 Class 上的。

<!-- more -->

## Me 關鍵字的用法

我寫了一個小程式來測試 Me 關鍵字，其實也沒有很複雜，用法和 JavaScript 的 this 關鍵字很像。

```
<%
Class ClassMessage
    Private Message

    Private Sub Class_Initialize()
        Me.SetMessage "TEST"
    End Sub

    Public Sub SetDisplay(oDisplay)
        oDisplay.Display Me
    End Sub

    Public Sub SetMessage(sMessage)
        Message = sMessage
        ' 不可以寫成：
        ' Me.Message = sMessage
    End Sub

    Public Function GetMessage()
        GetMessage = Message
    End Function
End Class

Class ClassDisplay
    Public Sub Display(oMessage)
        Response.Write oMessage.GetMessage
    End Sub
End Class

Dim oMessage : Set oMessage = New ClassMessage
Dim oDisplay : Set oDisplay = New ClassDisplay

oMessage.SetDisplay oDisplay
Set oMessage = Nothing
Set oDisplay = Nothing
%>

```

這樣一來，有很多設計模式可用了，有空可以好好研究一下。

 不過值得注意的是 Me 關鍵字似乎不能用在屬性上，所以我覺得它更像 PHP 的 self 關鍵字；也就是說 Me 關鍵字在某種程度上來說應該屬於類別層級，而非物件層級。 可是它又可以把自己丟給別的物件參考，和 PHP 的 $this 又有點像，我想這點要特別注意。

附帶一提， MSDN 最近連結大改，有點難以適應。

## 相關文章

* [ASP 物件導向 (1) - 基礎](http://www.jaceju.net/blog/archives/51/)
* [ASP 物件導向 (2) - 初級技巧](http://www.jaceju.net/blog/archives/52/)
* [ASP 物件導向 (3) - 進階技巧](http://www.jaceju.net/blog/archives/54/)
* [ASP 物件導向 (4) - 動態載入類別](http://www.jaceju.net/blog/archives/57/)
* [ASP 物件導向 (5) - Me 關鍵字](http://www.jaceju.net/blog/archives/59/)
* [ASP 物件導向 (6) - 單元測試](http://www.jaceju.net/blog/archives/76/)

