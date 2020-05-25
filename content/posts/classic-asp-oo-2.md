---
title: 'ASP 物件設計手法 (2) - 初級技巧'
date: 2005-12-06 00:00:00 +08:00


tags: ["ASP"]
---

Design Patterns 是我近來研究的課題之一，我在後來的 ASP 專案裡，為了解決一些問題而導入了部份的 Design Patterns 觀念。或許有人會認為 ASP (VBScript) 沒辦法使用正統的 Design Patterns ，不過我注重的是 Design Patterns 的觀念所帶來的解題方式，而不是 Design Patterns 的形。

以下我會說明一些我常用的技巧，這些都是從 Design Patterns 中得到的一些啟發。

<!-- more -->

## 工廠方法

工廠方法通常用於建立在抽象層次上屬於同一類的物件，例如同樣是交通工具，我們可能會建立巴士、火車或飛機其中一種。一般可以直接用一個函式來取得物件，當然如果想用類別也可以，但要看程式複雜度而定 (如果該類別不單純只有工廠方法) ：

```
/inc/VehicleFactory.asp
<%
Function VehicleFactory(sType)
    Dim oVehicle
    Set VehicleFactory = Nothing
    On Error Resume Next
    Execute "Set oVehicle = New Vehicle_" &amp; sType
    Set VehicleFactory = oVehicle
    On Error Goto 0
End Function
%>

```

我們先將要傳回的物件設為 Nothing 物件，然後利用 On Error Resume Next 來啟用錯誤處理機制。如果當想要建立的物件不存在時，我們就可以利用錯誤處理機制讓傳回的物件會依然保持為 Nothing 物件。

用法非常簡單：

```
<!-- #include virtual="/inc/Vehicle.asp" -->
<!-- #include virtual="/inc/VehicleFactory.asp" -->
<%
Set oVehicle = VehicleFactory("Bus")
If Not oVehicle Is Nothing Then
    ' ... 略 ...
End If
%>

```

工廠方法其實還滿常用的，像是利用 ADODB.Connection 來建立資料庫連線 (可能連到 Access 或 MSSQL) ，這也算是工廠方法的一種變形。另外 Server 物件的 CreateObject 方法也是經典的工廠方法之一。

## 複製物件

複製物件是讓一個物件有分身的功能，也就是 Prototype Pattern 。如果單純只用 Set 指令，並沒有辦法讓物件變成兩個，例如：

```
<%
Class ClassA
    Private Number
    Public Sub SetNumber(vValue)
        Number = vValue
    End Sub
    Public Function GetNumber
        GetNumber = Number
    End Function
End Class
Dim oA, oB
Set oA = New ClassA
oA.SetNumber 1
Set oB = oA
oB.SetNumber 2
Response.Write oA.GetNumber &amp; vbCrLf ' 顯示 2
Response.Write oB.GetNumber &amp; vbCrLf ' 顯示 2
%>

```

這樣只是讓 oB 變成 oA 物件的別名，一旦 oB 物件改變屬性， oA 物件也會跟著改變。

那如何讓 oA 和 oB 分別成為不同的個體呢？我習慣使用以下的方式：

```
ClassD.asp
<%
Class ClassD
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
    ' 設定分身的屬性
    Public Sub CloneFields(oFields)
        Dim sKey
        For Each sKey In oFields
            If IsObject(oFields(sKey)) Then
                Set Fields(sKey) = oFields(sKey) // 注意這裡
            Else
                Fields(sKey) = oFields(sKey) // 注意這裡
            End If
        Next
    End Sub
    ' 取得分身
    Public Function Clone()
        Dim oTempD
        Set oTempD = New ClassD
        oTempD.CloneFields Fields
        Set Clone = oTempD
    End Function
End Class
Dim oD1, oD2
Set oD1 = New ClassD
oD1.SetField "Attr1", "123"
oD1.SetField "Attr2", 123
oD1.SetField "Attr3", Array(123, 456)
Set oD2 = oD1.Clone
oD1.SetField "Attr1", "456"
Response.Write oD1.GetField("Attr1") &amp; vbCrLf ' 顯示 123
Response.Write oD1.GetField("Attr2") &amp; vbCrLf ' 顯示 123
Response.Write oD2.GetField("Attr1") &amp; vbCrLf ' 顯示 456
Response.Write oD2.GetField("Attr2") &amp; vbCrLf ' 顯示 123
%>

```

在 Clone 函式中，我讓物件自己產生自己，然後利用 CloneFields 把現在物件的屬性值複製一份到新的物件上，這也就是我為什麼要用 Dictionary 物件來存放物件屬性值的原因。

## Dictionary 物件

 Dictionary 物件可以參考微軟的 [MSDN](http://msdn.microsoft.com/library/en-us/script56/html/b4a7ddb3-2474-49ef-8540-8d67a747c8db.asp) ，這裡我僅簡單說明一下它的存取方式。我常用的 Dictionary 存取方式有兩種：第一種是當你不想透過索引值來處理每一個項目：

```
<%
Set oTempDic = Server.CreateObject("Scripting.Dictionary")
oTempDic.Add oTempDic.Count "1"
oTempDic.Add oTempDic.Count "2"
oTempDic.Add oTempDic.Count "3"
oTempDic.Add oTempDic.Count "4"
oTempDic.Add oTempDic.Count "5"
Dim oItem
For Each oItem In oTempDic.Items
    Response.Write oItem &amp; vbCrLf
Next
%>

```

第二種方式則是如果你需要索引值時：

```
<%
Set oTempDic = Server.CreateObject("Scripting.Dictionary")
oTempDic.Add oTempDic.Count "1"
oTempDic.Add oTempDic.Count "2"
oTempDic.Add oTempDic.Count "3"
oTempDic.Add oTempDic.Count "4"
oTempDic.Add oTempDic.Count "5"
Dim oItem
Dim sKey
For Each sKey In oTempDic
    Set oItem = oTempDic(sKey) // 注意這裡
    Response.Write sKey &amp; " => " &amp; oItem &amp; vbCrLf
Next
%>

```

Dictionary 物件非常有用，我常用它來存放物件屬性。而且它能夠存放到 Session 當中，因此後面有很多有用的技巧都會依賴它來實現。

## 註冊機制

註冊機制是一個很有趣的方式，我常用它來做一些同類型資料或是動作上的處理；例如產生下拉式選單，或是表單完成後一連串的表格更新。常見的方式如下：

```
<%
Class ClassE
    ' 物件屬性
    Private Items
    ' 物件初始化
    Private Sub Class_Initialize()
        Set Items = Server.CreateObject("Scripting.Dictionary")
    End Sub
    ' 註冊項目
    Public Sub Register(vItem)
        Items.Add Items.Count, vItem
    End Sub
    ' 依序處理每個項目
    Public Function DoSomething()
        Dim vItem
        For Each vItem In Items.Items
            Response.Write vItem &amp; vbCrLf
        Next
    End Function
    ' 物件結束
    Private Sub Class_Terminate()
        Set Items = Nothing
    End Sub
End Class
Dim oE : Set oE = New ClassE
With oE
    .Register "123"
    .Register "456"
    .Register "789"
    .DoSomething
End With
%>

```

vItem 如果是同類型的物件，其實就和 Observer Pattern 很像。我曾用這種方式來更新一連串的表格，也就是讓每個 vItem 成為一個執行 SQL 指令的物件，在接到要更新的資料後，讓每個 vItem 負責自己所要儲存的表格。

## 相關文章

* [ASP 物件導向 (1) - 基礎](http://www.jaceju.net/blog/archives/51/)
* [ASP 物件導向 (2) - 初級技巧](http://www.jaceju.net/blog/archives/52/)
* [ASP 物件導向 (3) - 進階技巧](http://www.jaceju.net/blog/archives/54/)
* [ASP 物件導向 (4) - 動態載入類別](http://www.jaceju.net/blog/archives/57/)
* [ASP 物件導向 (5) - Me 關鍵字](http://www.jaceju.net/blog/archives/59/)
* [ASP 物件導向 (6) - 單元測試](http://www.jaceju.net/blog/archives/76/)

