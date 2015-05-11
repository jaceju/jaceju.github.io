---
layout: post
title: 'ASP 物件設計手法 (3) - 進階技巧'
date: 2005-12-6
wordpress_id: 54
comments: true
tags: ["ASP"]
---

接下來的技巧會比較複雜一點，不過如果能夠善用的話，就會是一項很好用的武器。我在較大型的專案裡用過這樣的方式，它提供了我在開發程式不一樣的角度。至少我不必再寫一些複雜的判斷式，減少錯誤的發生。當然錯誤還是會有，但這是個人思考邏輯的問題，和物件導向開發方式關係不大。

<!--more-->

## 集合體

設計購物車時，我常用集合體的方式來完成。一個購物車基本型如下：

``` aspx-vb /inc/class/Shopping/Cart.asp
<%
' 購物車
Class Shopping_Cart
    Private List

    Private Fields

    ' 物件初始化
    Private Sub Class_Initialize()
        Set List = Server.CreateObject("Scripting.Dictionary")
        Set Fields = Server.CreateObject("Scripting.Dictionary")
        Fields.Add "Amount", 0
    End Sub

    ' 加入商品
    Public Sub AddProduct(oProduct)
        List.Add List.Count, oProduct
    End Sub

    ' 更新購物車
    Public Sub Update()
        Dim oProduct
        Fields("Amount") = 0
        For Each oProduct In List.Items
            oProduct.Refresh
            Fields("Amount") = Fields("Amount") + oProduct.GetField("SubTotal")
        Next
    End Sub

    ' 取得總金額
    Public Function GetAmount()
        GetAmount = Fields("Amount")
    End Function

    ' 物件結束
    Private Sub Class_Terminate()
        Set List = Nothing
        Set Fields = Nothing
    End Sub
End Class
%>

```

我利用了 Dictionary 物件來幫我維護每項商品物件，也用到了註冊機制。集合體的類型還有很多種，以上是較基本的操作方式。

商品的部份很簡單，就是基本的設定屬性及取得屬性。為了方便說明，我沒有把商品名稱或其他商品屬性放進去。

``` aspx-vb /inc/class/Shopping/Product.asp
<%
' 商品
Class Shopping_Product
    Private Fields

    Private Sub Class_Initialize()
        Set Fields = Server.CreateObject("Scripting.Dictionary")
        Fields.Add "Price", 0
        Fields.Add "Quantity", 0
        Fields.Add "SubTotal", 0
    End Sub

    Private Sub Class_Terminate()
        Set Fields = Nothing
    End Sub

    Public Sub SetField(sName, vValue)
        If Fields.Exists(sName) Then
            Fields(sName) = vValue
        End If
    End Sub

    Public Function GetField(sName)
        GetField = Null
        If Fields.Exists(sName) Then
            GetField = Fields(sName)
        End If
    End Function

    Public Sub Refresh()
        Fields("SubTotal") = Fields("Price") * Fields("Quantity")
    End Sub
End Class
%>

```

以下是一個簡單的測試：

```
<!-- #include virtual="/inc/class/Shopping/Cart.asp" -->
<!-- #include virtual="/inc/class/Shopping/Product.asp" -->
<%
Dim oCart : Set oCart = New Shopping_Cart
Dim oP1 : Set oP1 = New Shopping_Product
Dim oP2 : Set oP2 = New Shopping_Product
Dim oP3 : Set oP3 = New Shopping_Product
oP1.SetField "Price", 100
oP1.SetField "Quantity", 1
oP2.SetField "Price", 120
oP2.SetField "Quantity", 2
oP3.SetField "Price", 150
oP3.SetField "Quantity", 1
oCart.AddProduct oP1
oCart.AddProduct oP2
oCart.AddProduct oP3
oCart.Update
Response.Write oCart.GetAmount
%>

```

## 序列化及反序列化

這裡說的序列化其實不是真的序列化，只是我找不到好的名詞來說明。之前提過利用 Class 關鍵字所產生出來的物件是不能存在 Session 中的，因此我會利用 Dictionary 這種用 Server.CreateObject 所產生出來的物件來存放物件資訊。

以上面的購物車為例，如果我想要把商品資料存入 Session ，不能把 Cart 直接存入 Session 中，這樣會使得放在 List 屬性中的商品資訊消失；這時候就要改用 Dictionary 物件來儲存。

商品的序列化動作比較簡單，就是將 Fields 屬性傳回即可；而反序列化時，則是把取出的 Fields 屬性指定回去：

``` aspx-vb /inc/class/Shopping/Product.asp
<%
' 商品
Class Shopping_Product
    Private Fields

    ' ... 略 ...

    Public Function Serialize()
        Set Serialize = Fields
    End Function

    Public Function Unserialize(oFields)
        Set Fields = oFields
    End Function
End Class
%>

```

至於購物車的序列化比較複雜一點，首先要將每個商品的序列化存到一個 Dictionary 物件 (oItems)，再把這個 Dictionary 物件 (oItems) 放到 Cart 的序列化物件 (oFields) 中，最後回傳 Cart 的序列化物件；反序列化則正好相反。不過反序列化要先產生一個商品物件 (oProduct) ，再把商品的序列化物件 (oItem) 指定給該商品物件。 

``` aspx-vb /inc/class/Shopping/Cart.asp
<%
' 購物車
Class Shopping_Cart
    Private List

    Private Fields

    ' ... 略 ....

    Public Function Serialize()
        Dim oFields : Set oFields = Server.CreateObject("Scripting.Dictionary")
        Dim oItems : Set oItems = Server.CreateObject("Scripting.Dictionary")
        Dim oProduct
        <strong>For Each oProduct In List.Items</strong>
        <strong>oItems.Add oItems.Count, oProduct.Serialize</strong>
        <strong>Next</strong>
        <strong>oFields.Add "Items", oItems</strong>
        oFields.Add "Amount", Fields("Amount")
        Set Serialize = oFields
        Set oItems = Nothing
        Set oFields = Nothing
    End Function

    Public Sub Unserialize(oSerializedFields)
        If oSerializedFields Is Nothing Then Exit Sub
        <strong>Set List = Server.CreateObject("Scripting.Dictionary")</strong>
        Dim oItem
        Dim oProduct
        For Each oItem In oSerializedFields("Items").Items
            <strong>Set oProduct = New Shopping_Product</strong>
            <strong>oProduct.Unserialize oItem</strong>
        List.Add List.Count, oProduct
        Next
        Fields("Amount") = oSerializedFields("Amount")
    End Sub
End Class
%>

```

用法如下：

```
<!-- #include virtual="/inc/class/Shopping/Cart.asp" -->
<!-- #include virtual="/inc/class/Shopping/Product.asp" -->
<%
Dim oCart : Set oCart = New Shopping_Cart
Dim oP1 : Set oP1 = New Shopping_Product
Dim oP2 : Set oP2 = New Shopping_Product
Dim oP3 : Set oP3 = New Shopping_Product
oP1.SetField "Price", 100
oP1.SetField "Quantity", 1
oP2.SetField "Price", 120
oP2.SetField "Quantity", 2
oP3.SetField "Price", 150
oP3.SetField "Quantity", 1
oCart.AddProduct oP1
oCart.AddProduct oP2
oCart.AddProduct oP3
oCart.Update
Set Session("Cart") = oCart.Serialize
Dim oNewCart : Set oNewCart = New Shopping_Cart
oNewCart.Unserialize Session("Cart")
%>

```

## 巢狀 Dictionary 物件

這是另一種集合體和序列化的變形，通常是用在把資料庫中的資料轉換成 Dictionary 物件上。主要原理是在迴圈中建立一個 Dictionary 物件 (oItem) ，然後在設定好內容後，把它指定給最外層的 Dictionary 物件 (oItems) 。 

```
<%
Dim oItems : Set oItems = Server.CreateObject("Scripting.Dictionary")
Dim oItem
Dim oField
While Not oTempRS.EOF
    Set oItem = Server.CreateObject("Scripting.Dictionary")
    ' 將所有欄位放到 oItem 中
    For Each oField In oTempRS.Fields
        oItem.Add oField.Name, oField.Value
    Next
    oItems.Add oItems.Count oItem
    Set oItem = Nothing
Wend
Response.Write oItems(0)("Attr1") &amp; vbCrLf
Response.Write oItems(0)("Attr2") &amp; vbCrLf
Response.Write oItems(1)("Attr1") &amp; vbCrLf
Response.Write oItems(1)("Attr2") &amp; vbCrLf
%>

```

## 總結

雖然 ASP (VBScript) 在物件導向上的機制不如 ASP (JScript) 來得先進，但是以上的技巧還是能夠解決多數的問題。這些技巧都是我在開發專案時所得到的心得，如果有更多有趣的方法，也歡迎大家分享。

## 相關文章

* [ASP 物件導向 (1) - 基礎](http://www.jaceju.net/blog/archives/51/)
* [ASP 物件導向 (2) - 初級技巧](http://www.jaceju.net/blog/archives/52/)
* [ASP 物件導向 (3) - 進階技巧](http://www.jaceju.net/blog/archives/54/)
* [ASP 物件導向 (4) - 動態載入類別](http://www.jaceju.net/blog/archives/57/)
* [ASP 物件導向 (5) - Me 關鍵字](http://www.jaceju.net/blog/archives/59/)
* [ASP 物件導向 (6) - 單元測試](http://www.jaceju.net/blog/archives/76/)

