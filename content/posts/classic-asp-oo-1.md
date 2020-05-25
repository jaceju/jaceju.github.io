---
title: 'ASP 物件設計手法 (1) - 基礎'
date: 2005-12-06 00:00:00 +08:00


tags: ["ASP"]
---

這是寫給公司同事的一系列 ASP (VBScript) 物件設計手法文章，我盡可能寫得比較簡單易懂。雖然 ASP 目前已經不再是市場主流，但還是我的手邊有很多專案沒有辦法導入比較先進的技術 (像 ASP.NET 或 JSP 等) 。所以瞭解如何用 ASP 的物件設計手法來解決問題，是這系列文章主要的目的。

在繼續下去之前，首先先釐清一個觀念，物件導向是一種思維，而非僅是語言的特性。當然，我也不想去仔細探討 ASP (VBScript) 是不是物件導向語言。我已經用這種方式寫了一些專案，執行成果也還不錯。對於那些有疑問的朋友，我還能夠拿出一點不算太難看的成果供他們參考。

經過了一些討論與思考，我決定把這系列文章更名為「ASP 物件設計手法」。

對於物件導向我不是高手，我也還在研究當中。我只是希望透過這樣的說明，讓我身邊的伙伴能夠清楚我的想法 (與寫法) 而已。

<!-- more -->

## Class 語法

ASP (VBScript) 提供了一個 Class 敘述讓我們建立一個物件類別：

```
<%
Class ClassName
    ' 物件初始化
    Private Sub Class_Initialize()
    End Sub
    ' 物件結束
    Private Sub Class_Terminate()
    End Sub
End Class
%>

```

其中 ClassName 是類別名稱，而 Class_Initialize() 及 Class_Terminate() 兩個私有函式是 VBScript 的特殊函式，它們分別會在物件被起始化及物件結束時呼叫 (也就是 Event ) ，例如：

```
<%
' 初始化一個 oTest 物件，並呼叫 ClassName 類別的 Class_Initialize 方法
Dim oTest : Set oTest = New ClassName
' 呼叫 Class_Terminate
Set oTest = Nothing
%>

```

這裡有一些要注意的地方：

* 不能重複宣告 Class 。一般 ASP 程式可以重複 include 多次 Function ，但是 Class 不行；而且 Class 裡面也不能重複宣告 Function 。
* 這些類別所產生出來的物件內容不能存到 Application 或 Session 變數中，只有利用 Server.CreateObject 方法所建立的物件才可以。
* 在執行 New 敘述時，我們並沒有沒辦法傳遞參數給建構函式，也就是說 Set oTest = New ClassName("xxx") 這樣的敘述是錯的。
* 當 ASP 程式結束時，並不一定會自動呼叫 Class_Terminate 函式。我們可以手動以 Set oTest = Nothing 的方式來讓物件消失前，能確實執行 Class_Terminate 方法。
* 就像 VBScript 的 Function 中可以存取全域變數一樣，Class 裡也同樣也能夠直接取得全域變數。
* ASP (VBScript) 是用 Pass By Reference 的方式來傳遞物件。
* VBScript 的 Class 存取等級只有兩種： Public 及 Private 。
<li>
類別函式名稱與 VBScript 內建函式名稱建議不要相同，<del>因為 VBScript 不像 PHP 可以 $this 來指向物件自己</del><strong>如果一樣時，可以用 Me 關鍵字來指向類別自己</strong>，例如 Me.Left (這裡的 Left 是指類別函式) 。<del>函式或屬性都是以其名稱來取得，前面不能加上「.」存取元。</del></li>


## 預設函式

預設函式是指不需要特別指定函式的名稱，直接使用物件變數名稱來呼叫物件中的某個函式，例如：

```
Dim oTest : Set oTest = New Test
' 呼叫 Sub
Call oTest("Test")
' 或是取得 Function 回傳值
Dim sTemp = oTest("Test")

```

我們可以用以下語法來建立一個預設的函式：

```
Class Test
    ' 物件初始化
    Public Defalut Sub|Function MethodName() ' 注意 Default
    ' Do Something
    End Sub|Function
End Class

```

也就是在一般函式的 Sub 或 Function 前，加上一個 Default 關鍵字。特別要注意的是，預設函式必須是 Public 的存取等級。

這種方式非常好用，尤其是當我們想跟一些 ASP 內建物件做整合時可以用到。

## 繼承？

ASP (VBScript) 沒有繼承語法，不過可以用其他方式來達成。當然，沒有繼承語法的協助，寫一些程式時會比較累一點。

第一種方式是使用 SSI 的 include 指令，這種方式我稱為「假繼承」，因為實際上根本就沒有繼承任何 Class ，我只是把共用的變數或函式寫在一個 ASP 檔中。

```
ClassA.asp
<%
' Class ClassA 實際上是沒有這個類別的
    ' 物件屬性
    Private Fields
    ' 物件初始化
    Private Sub Class_Initialize()
    Set Fields = Server.CreateObject("Scripting.Dictionary")
    End Sub
    ' 物件結束
    Private Sub Class_Terminate()
    Set Fields = Nothing
    End Sub
' End Class
%>

```

```
ClassB.asp
<%
Class ClassB
    ' 假繼承 ClassA
    %><!-- #include file="ClassA.asp" --><%
    ' 非共用函式
    Public Function OtherMethod()
    ' ... 略 ...
    End Function
End Class
%>

```

因為無法在 Class 重複宣告 Function ，所以這種方式的缺點就是只要函式實作方式有些許不同，就不能寫到共用的 ClassA 中。

第二種則是採用<strong>裝飾者模式 (Decorator Pattern)</strong> ，基本上這是用<strong>委派 (delegate)</strong> 取代繼承。

```
ClassA.asp
<%
Class ClassA
    ' 物件屬性
    Public Fields
    ' 物件初始化
    Private Sub Class_Initialize()
    Set Fields = Server.CreateObject("Scripting.Dictionary")
    End Sub
    ' 物件結束
    Private Sub Class_Terminate()
    Set Fields = Nothing
    End Sub
    ' 要 Override 的函式
    Public Function OverrideMethod()
    Fields.Add "Key1", 123
    End Function
    ' 其他函式
    Public Function OtherMethod()
    ' ... 略 ...
    End Function
End Class
%>

```

```
ClassB.asp
<%
Class ClassB
    ' 被託付者
    Private Parent
    ' 物件初始化
    Private Sub Class_Initialize()
        Set Parent = New ClassA
    End Sub
    ' 物件結束
    Private Sub Class_Terminate()
        Set Parent = Nothing
    End Sub
    ' 要 Override 的函式
    Public Function OverrideMethod()
        Parent.Fields.Add "Key2", 456
    End Function
    ' 其他函式
    Public Function OtherMethod()
        Parent.OtherMethod
    End Function
End Class
%>

```

這種方式的缺點，就是要對每個函式都委派給被託付者去完成；如果被託付者的函式非常多，就會多出一些雞肋出來。另外 ClassA 對 ClassB 必須是透明的 (Public) ，也就是說除了Class_Initialize 及 Class_Terminate 外， ClassB 要能夠取得 ClassA 的所有屬性及函式 (有點像 PHP 的 protected ) 。

不過要記住一件事，上面的方式只是為了重用程式碼而已，並不是真正的繼承。如果重用的程式不是很複雜的話，那麼最好還是看狀況來決定要不要使用。

## 設定或取得屬性

類別屬性的部份，我後來大部份會使用一個私有的 Dictionary 物件來儲存。 Dictionary 物件有點像是 PHP 的 associative array ，利用字串索引來儲存每一個元素。這麼做的好處可以讓我們用很簡單的方式來設定物件的屬性：

```
ClassC.asp
<%
Class ClassC
    ' 物件屬性
    Private Fields
    ' 物件初始化
    Private Sub Class_Initialize()
        Set Fields = Server.CreateObject("Scripting.Dictionary")
        Fields.Add "Attr1", ""
        Fields.Add "Attr2", 0
        Fields.Add "Attr3", Array()
    End Sub
    ' 物件結束
    Private Sub Class_Terminate()
        Set Fields = Nothing
    End Sub
    ' 設定指定的屬性
    Public Sub SetField(sName, vValue)
        If Fields.Exists(sName) Then
            If IsObject(vValue) Then
                Set Fields(sName) = vValue
            Else
                Fields(sName) = vValue
            End If
        End If
    End Sub
    ' 取得指定的屬性
    Public Function GetField(sName)
        GetField = Null
        If Fields.Exists(sName) Then
            If IsObject(Fields(sName)) Then
                Set GetField = Fields(sName)
            Else
                GetField = Fields(sName)
            End If
        End If
    End Function
End Class
%>

```

當然，在 SetField 函式裡有時候會需要驗證格式，不過通常我會先利用其他方式驗證完畢後再存入，以減輕這個類別的重量。

VBScript 還有提供一個 Property 語法來讓我們設定或取得類別屬性，但我大部份還是會利用上面的方式來設定。

## 使用類別

類別使用的方式很簡單，就是先用 New 關鍵字來產生一個物件實體：

```
<%
Dim oTempC : Set oTempC = New ClassC
oTempC.SetField "Attr1", "123"
oTempC.SetField "Attr2", 123
oTempC.SetField "Attr3", Array(123, 456)
Set oTempC = Nothing
%>

```

我們也可以用 With 語法來存取，這樣會比較快一點。 (JScript 的 With 則比較慢。)

```
<%
Dim oTempC : Set oTempC = New ClassC
With oTempC
    .SetField "Attr1", "123"
    .SetField "Attr2", 123
    .SetField "Attr3", Array(123, 456)
End With
Set oTempC = Nothing
%>

```

## 類別命名方式

類別的命名方式並沒有特別之處，就是如同一般 ASP 變數命名的規則。不過這裡我有一個建議，就是利用 PHP PEAR 函式庫的命名規則來歸納我們的類別。

例如：

```
/inc/class/HTML/Template.asp
<%
Class HTML_Template
    ' ... 略 ...
End Class
%>

```

```
/inc/class/HTML/Form.asp
<%
Class HTML_Form
    ' ... 略 ...
End Class
%>

```

```
/inc/class/HTML/Cache.asp
<%
Class HTML_Cache
    ' ... 略 ...
End Class
%>

```

在引入類別檔時，我會利用一個類似 package 的檔案把所有相關的類別一起 include ：

```
/inc/HTML.asp
<!-- #include file="class/HTML/Template.asp" -->
<!-- #include file="class/HTML/Form.asp" -->
<!-- #include file="class/HTML/Cache.asp" -->

```

因此引用時，就只要引入 /inc/HTML.asp 即可 (有點像 C# 的 using 指令) 。 不過還是要看狀況而定，這樣的方式不一定比較好。

## 相關文章

* [ASP 物件導向 (1) - 基礎](http://www.jaceju.net/blog/archives/51/)
* [ASP 物件導向 (2) - 初級技巧](http://www.jaceju.net/blog/archives/52/)
* [ASP 物件導向 (3) - 進階技巧](http://www.jaceju.net/blog/archives/54/)
* [ASP 物件導向 (4) - 動態載入類別](http://www.jaceju.net/blog/archives/57/)
* [ASP 物件導向 (5) - Me 關鍵字](http://www.jaceju.net/blog/archives/59/)
* [ASP 物件導向 (6) - 單元測試](http://www.jaceju.net/blog/archives/76/)

