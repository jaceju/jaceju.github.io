---
title: 'ASP 購物車三部曲(1)'
date: 2006-04-23 00:00:00 +08:00


tags: ["ASP"]
---

## 簡介

物件導向是一種思維，這點我深信不疑。但是在我寫了 ASP 物件設計手法系列文章後，我才發現自己其實深陷在語言的泥淖裡。

我想這裡也許該用一些真正的實例來表達我的想法了，也就是我想告訴大家，我心目中的物件導向思維到底是什麼？

前面幾篇的 ASP 物件設計手法或許看起來很神妙，但那只不過是 ASP 原本就有的一些東西。在別的物件導向語言裡，這些手法可能就像呼吸一樣稀鬆平常。所以如果你懂的是別種開發平台 (例如 PHP 、 ASP.NET 或 JSP ) 也沒關係，瞭解物件導向思維的意義後，你大可去發揮那個平台的長處。

當然不一定非得 ASP 不可，我已經不會再去證明 ASP 能不能辦到什麼。只不過我想會寫 Web 網站程式的人大部份應該都懂 ASP ，而且也為了延續之前的主題，所以這裡就繼續用 ASP 了。

註：這裡的 ASP 採用的當然是 VBScript ，你想用 JScript 來做我也不反對。

我將利用一個簡化的購物車程式，來介紹一些我設計購物車程式時的概念，其中會包括先前介紹的 ASP 物件設計手法以及設計模式的應用。

廢話不多說，往下看吧。

<!-- more -->

## 購物車

開發過稍具規模專案的程式設計師們，我想大部份都寫過購物車程式吧。購物車創造了多少台灣經濟奇蹟我是不清楚，但是至少它一直是網站開發的重要課題之一。

其實購物車的本意很簡單，也就是在使用者瀏覽網站的過程裡，將他所選擇的商品資訊放到記憶體或資料庫中，最後再提供一個畫面顯示他買過哪些東西。

註：也許有人會說購物車應該還有金流物流等機制，不過這裡我想就先略過不提了。我們先把焦點放在最單純的購物車機制上，將基礎打好後再往下繼續。

### 加入購物車

在物件導向的思維裡，我們習慣把購物車視成一個物件，而商品當然也是一個一個的物件，這其實和現實生活沒什麼兩樣。把喜歡的商品放到購物車裡，這種動作再自然也不過。當然在程式的世界裡，我們很少會去完整模擬出購物車和商品的樣子 (是誰說網站購物車要有輪子的？) 我們只會把購物車所要具備的功能實作出來而已。

想像一下，你可能會把三包科學麵、兩瓶可樂還有一盒巧克力放到你的購物車裡。

```
Set oCart = New Shopping_Cart
oCart.AddCartItem "科學麵", 3
oCart.AddCartItem "瓶裝可樂", 2
oCart.AddCartItem "盒裝巧克力", 1

```

在 AddCartItem 中，第一個參數表示商品代碼 (只是這裡我用商品名稱) ，後面則是購買數量。

但是，在較大規模的網站上通常不會那麼簡單地採用這種設計。怎麼說呢？想想看，網站可能會有促銷活動，有些商品可能會有打折。總之你的客戶絕對不會這麼輕易把你晾在那邊，這時我們也許得先「預構」一下。

註：如果你不瞭「預構」那也沒關係，這無損客戶對你極盡壓榨之能事。

雖然我們不想過度設計，預先放入過多未來不確定的功能，但是基本應付變化的能力總是要有的。我在加入購物車時，多了一個商品種類的參數：

```
Set oCart = New Shopping_Cart
oCart.AddCartItem "科學麵", 3, "Normal"
oCart.AddCartItem "瓶裝可樂", 2, "Normal"
oCart.AddCartItem "盒裝巧克力", 1, "Normal"

```

我為什麼要多出這個參數呢？其用意是什麼？商品種類是很有用的參數，因為有時候他可以告訴購物車，這是一個活動商品還是一般商品。

我知道你想問為什麼我知道會有這些變化，老實說，我一開始的時候也不知道。其實這些都是經由客戶的需求以及過往的經驗去整理出來的；如果客戶擺明未來有一陣子不可能會有這些東西，那就不值得你現在就把它們加上去。

現在看起來是能夠應付變化了，可是這樣好嗎？ AddCartItem 看起來參數太多了！

註：其實我也說不上來這種設計好不好，在我某個專案的第一版 (還存活著) 就是這麼做的。事實上我也許可以重構它，不過那時候我並沒有足夠的單元測試知識支援我做這種事情，所以我放棄了 (但至少維護起來沒那麼困難就是了) 。

這裡我們換個方式好了，我不打算讓 AddCartItem 想太多，畢竟如果以後有新的參數時， AddCartItem 的介面就很難改動，造成往後需要更多動作來處理。我乾脆直接讓 AddCartItem 接受一個購買項目物件好了，雖然在 ASP (VBScript) 裡實現起來有點難看，但在其他環境中我想可以很漂亮地完成。

```
Set oCart = New Shopping_Cart
Set oP1 = New Shopping_CartItem : oP1.Init "科學麵", 3, "Normal"
Set oP2 = New Shopping_CartItem : oP2.Init "瓶裝可樂", 2, "Normal"
Set oP3 = New Shopping_CartItem : oP3.Init "盒裝巧克力", 1, "Normal"
oCart.AddCartItem oP1
oCart.AddCartItem oP2
oCart.AddCartItem oP3
Set oP1 = Nothing
Set oP2 = Nothing
Set oP3 = Nothing

```

其實我的想法應該是如此：

```
oCart.AddCartItem(New Shopping_CartItem("科學麵", 3, "Normal"))
oCart.AddCartItem(New Shopping_CartItem("瓶裝可樂", 2, "Normal"))
oCart.AddCartItem(New Shopping_CartItem("盒裝巧克力", 1, "Normal"))

```

當然這個程式是不能用的，因為 ASP (VBScript) 的建構式沒辦法傳參數進去，而且也不公開，所以就忘了它吧。

### 更新購物車與取得總金額

在將商品加入購物車時，我們並不會立刻去計算購物車的總金額，而是等到需要時再重新計算整個購物車內的購買項目所包含的價錢。

所以我在上面的測試程式的最後加上更新購物車的流程。

```
Set oCart = New Shopping_Cart
Set oP1 = New Shopping_CartItem : oP1.Init "科學麵", 3, "Normal"
Set oP2 = New Shopping_CartItem : oP2.Init "瓶裝可樂", 2, "Normal"
Set oP3 = New Shopping_CartItem : oP3.Init "盒裝巧克力", 1, "Normal"
oCart.AddCartItem oP1
oCart.AddCartItem oP2
oCart.AddCartItem oP3
Set oP1 = Nothing
Set oP2 = Nothing
Set oP3 = Nothing
oCart.Update
Response.Write oCart.GetAmount

```

註：其實除了更新整個購物車以外，應該還要能單獨更新某個指定的商品或是清空購物車，不過我想這個就留給你自己去思考吧。

### 寫出程式

現在，我們就可以整理出 Shopping_Cart 類別應該要有什麼主要的功能：

* 加入商品 (AddCartItem)
* 更新購物車 (Update)
* 取得總金額 (GetAmount)


當然，在購物車內部我們應要會需要一個集合物件，用來存放購買項目，而 Dictionary 物件就是最適合的了。至於其他的功能是為了能讓測試能夠正常執行，我們暫時略過不提。

整個購物車的程式如下：

```
<%
' /class/Shopping/Cart.asp
' 購物車
Class Shopping_Cart
Private CartItemList
Private Fields
' 物件初始化
Private Sub Class_Initialize()
' 我們建立了一個存放購買項目的 Dictionary 物件
' 以及一個存放購物車資訊的 Dictionary 物件
Set CartItemList = Server.CreateObject("Scripting.Dictionary")
Set Fields = Server.CreateObject("Scripting.Dictionary")
Fields.Add "Amount", 0
End Sub
' 加入商品
Public Sub AddCartItem(oCartItem)
' 我們把商品名稱當做索引鍵，實際上則會比較複雜
Dim sKey : sKey = oCartItem.GetField("Name")
' 先判斷有沒有相同的商品存在
If Not CartItemList.Exists(sKey) Then
CartItemList.Add sKey, oCartItem
' 已經存在就更改數量
Else
Dim oExistedCartItem
Set oExistedCartItem = CartItemList(sKey)
oExistedCartItem.SetField "Quantity", _
oExistedCartItem.GetField("Quantity") + _
oCartItem.GetField("Quantity")
End If
End Sub
' 取得所有商品
Public Function Items()
Items = CartItemList.Items
End Function
' 判斷是否存在某個商品
Public Function Exists(sKey)
Exists = CartItemList.Exists(sKey)
End Function
' 更新購物車
Public Sub Update()
Dim oCartItem
Fields("Amount") = 0
For Each oCartItem In CartItemList.Items
oCartItem.Refresh
Fields("Amount") = Fields("Amount") + oCartItem.GetField("SubTotal")
Next
End Sub
' 取得總金額
Public Function GetAmount()
GetAmount = Fields("Amount")
End Function
' 物件結束
Private Sub Class_Terminate()
Set CartItemList = Nothing
Set Fields = Nothing
End Sub
End Class
%>

```

如你所見，目前它只是個簡單的購物車，後面我們再來談談它會如何因應變化。

## 購買項目

購買項目 (CartItem) 和商品 (Product) 是不一樣的概念，商品不會知道自己會屬於什麼活動，也不會知道購買數量的資訊。而購買項目主要是記錄消費者買了些什麼，並買了多少。

由於我們已經寫好了購物車類別，所以我們也能夠很清楚購買項目應該要提供什麼資訊給購物車。包括：

* 初始化商品資料 (Init)
* 取得指定欄位 (GetField)
* 更新購買項目的小計金額 (Refresh)


購買項目的程式如下：

```
<%
' /class/Shopping/CartItem.asp
Class Shopping_CartItem
Private Fields
Private Sub Class_Initialize()
Set Fields = Server.CreateObject("Scripting.Dictionary")
Fields.Add "Price", 0
Fields.Add "Quantity", 0
Fields.Add "SubTotal", 0
Fields.Add "EventType", ""
Fields.Add "EventID", 0
End Sub
Private Sub Class_Terminate()
Set Fields = Nothing
End Sub
Private Sub SetField(sName, vValue)
If Fields.Exists(sName) Then
Fields(sName) = vValue
End If
End Sub
' 初始化商品資料
Public Sub Init(sName, iQuantity, sEventType)
Dim iPrice
Dim oProduct
Set oProduct = GetObject("Shopping_MockProduct")
oProduct.Init sName
' 從資料庫取得資料
If oProduct.Exists Then
iPrice = oProduct.GetPrice
SetField "Price", iPrice
SetField "Quantity", iQuantity
SetField "SubTotal", iPrice * iQuantity
SetField "EventType", sEventType
SetField "EventID", iEventID
End If
End Sub
' 取得指定欄位資料
Public Function GetField(sName)
GetField = Null
If Fields.Exists(sName) Then
GetField = Fields(sName)
End If
End Function
' 更新購買項目內容
Public Sub Refresh()
Fields("SubTotal") = Fields("Price") * Fields("Quantity")
End Sub
End Class
%>

```

一般在購買項目初始化時，會從資料庫去取得商品的資料，不過這裡我為了簡化程式，就沒有實際去連結資料庫，而是把資料寫死 ([hard-code](http://en.wikipedia.org/wiki/Hard_code)) 在模擬用的商品類別裡。如果到時候真的要連結資料庫時，我只要抽換掉這個假的商品類別，換上會真正抓取資料庫的商品類別即可。

至於模擬用的商品類別 (MockProduct) 程式碼如下：

```
<%
' /class/Shopping/MockProduct.asp
Class Shopping_MockProduct
Private ProductData
Private Name
' 物件啟動
Private Sub Class_Initialize()
Set ProductData = Server.CreateObject("Scripting.Dictionary")
ProductData.Add "科學麵", 6
ProductData.Add "瓶裝可樂", 20
ProductData.Add "盒裝巧克力", 100
Name = ""
End Sub
' 物件結束
Private Sub Class_Terminate()
Set ProductData = Nothing
End Sub
' 商品初始化
Public Sub Init(sName)
Name = sName
End Sub
' 商品是否存在
Public Function Exists()
Exists = ProductData.Exists(Name)
End Function
' 取得價錢
Public Function GetPrice()
GetPrice = ProductData(Name)
End Function
End Class
%>

```

註：為了簡化程式篇幅，我拿掉了許多防呆程式碼。

現在整個程式的架構如下 (我簡略掉一些通用的函式及屬性) ：

![原始購物車架構](/resources/ooasp_cart/images/ooasp_cart_1_1.png)

## 新的購物模式

該來的還是會來，客戶總是不會讓我們過好日子的。我們接到了兩個新的需求，折扣活動與贈品活動。規格簡述如下：

* 折扣活動：有部份商品可以有折扣，但是不能修改現有的商品資料，而是要在加入購物車時將金額自動抵扣掉。
* 贈品活動：如果消費者買了某個指定商品，那麼購物車要自動幫他加入附屬在這個商品下的贈品。


註：別懷疑，這兩個行銷手法在實際的網站上是常見的，而且還算簡單，真正難搞的活動我還沒寫出來呢。

為了簡化說明，我把實作規格定義如下：

* 折扣活動：有折扣的商品被歸類於 Discount 分類，而商品價格一律為 9 折。
* 贈品活動：當我們買了一瓶可樂後，購物車會自動幫我們加上一包科學麵。


在贈品活動的部份，我希望贈品的價格是 0 ，所以在我 Shopping_MockProduct 類別初始化時加入了一個價格為 0 的「科學麵(贈品)」：

```
  ' 物件啟動
Private Sub Class_Initialize()
Set ProductData = Server.CreateObject("Scripting.Dictionary")
ProductData.Add "科學麵", 6
ProductData.Add "科學麵(贈品)", 0
ProductData.Add "瓶裝可樂", 20
ProductData.Add "盒裝巧克力", 100
Name = ""
End Sub

```

其實我希望除了這兩個活動以外，我的購物車能夠應付其他類型的活動，因此我在 AddCartItem 呼叫了一個函式，用來檢查商品所屬的活動，也就是說我把檢查的動作從 AddCartItem 中獨立出來：

```
  ' 加入商品
Public Sub AddCartItem(oCartItem)
' 我們把商品名稱當做索引鍵，實際上則會比較複雜
Dim sKey : sKey = oCartItem.GetField("Name")
' 先判斷有沒有相同的商品存在
If Not CartItemList.Exists(sKey) Then
CartItemList.Add sKey, oCartItem
' 檢查商品是否屬於某個活動
CheckCartItemForEvent oCartItem
' 已經存在就更改數量
Else
Dim oExistedCartItem
Set oExistedCartItem = CartItemList(sKey)
oExistedCartItem.SetField "Quantity", _
oExistedCartItem.GetField("Quantity") + _
oCartItem.GetField("Quantity")
End If
End Sub

```

CheckCartItemForEvent 函式主要會判斷商品的活動型態，以處理對應的動作，其程式如下：

```
  ' 檢查是否為某個活動的商品
Private Sub CheckCartItemForEvent(oCartItem)
Select Case oCartItem.GetField("EventType")
' 折扣活動
Case "Discount"
oCartItem.SetField "Price", oCartItem.GetField("Price") * 0.9
oCartItem.Refresh
' 贈品活動
Case "Gift"
If "瓶裝可樂" = oCartItem.GetField("Name") Then
Dim oGiftCartItem
Set oGiftCartItem = GetObject("Shopping_CartItem")
oGiftCartItem.Init "科學麵(贈品)", 1, "Normal"
AddCartItem oGiftCartItem
End If
' 一般商品，什麼也不用作
Case Else
End Select
End Sub

```

因為 CheckCartItemForEvent 不會被外部呼叫，所以我用 Private 來指定它的存取權限。

## Strategy 模式

雖然現在 CheckCartItemForEvent 函式看起來還不是很龐大，不過既然已經有三個不同的活動了 (一般商品也可歸屬為一種活動)，當然還會可能有第四個或第五個。可想而知未來 CheckCartItemForEvent 會逐漸變得落落長，超出我們所能理解的範圍。

如果我們能把活動機制獨立在購物車外是不是比較好呢？這樣也能使得購物車不再背負過多的商業邏輯，在開發上也能靈活許多。

首先我定義一個虛假的活動類別好了，我們要在概念上繼承它 (就是 Duck Typing 啦) ，這個類別的定義如下：

```
<%
Class Event
' 處理購買項目
Public Sub Check(oCartItem, oCart)
End Sub
End Class
%>

```

在 Event 虛擬類別中，我們提供了一個 Check 函式，用來檢查即將要加入的商品 oCartItem 。不過為什麼還需要一個 oCart 參數呢？這是因為某些活動可能會需要購物車內的其他商品，所以我們就把購物車物件傳進來讓 Event 自行應用，稍後我們就能看到實際的例子。

接著我建立一個處理一般商品的活動類別 Event_Normal，然而這個物件其實什麼也不做：

```
<%
' /class/Event/Normal.asp
Class Event_Normal ' Extends Event
' 處理購買項目
Public Sub Check(oCartItem, oCart)
End Sub
End Class
%>

```

當然我們還有兩種活動類別，先看看 Discount 好了，它比較簡單：

```
<%
' /class/Event/Discount.asp
Class Event_Discount ' Extends Event
' 處理購買項目
Public Sub Check(oCartItem, oCart)
oCartItem.SetField "Price", oCartItem.GetField("Price") * 0.9
oCartItem.Refresh
End Sub
End Class
%>

```

你可以看到我用了一個很簡單的做法：把原來的值乘以 0.9 後，再將它設回 oCartItem 的單價裡。

註：注意！ ASP 的物件是以傳參考的方式來傳遞的，所以這邊只要一更新，就會直接反應回購物車內所對應的 CartItem 物件。

剩下的 Gift 類別就比較複雜了，剛剛定義的 oCart 現在就派上用場了。

```
<%
' /class/Event/Gift.asp
Class Event_Gift ' Extends Event
' 處理購買項目
Public Sub Check(oCartItem, oCart)
If "瓶裝可樂" = oCartItem.GetField("Name") Then
Dim oGiftCartItem
Set oGiftCartItem = GetObject("Shopping_CartItem") : oGiftCartItem.Init "科學麵(贈品)", 1, "Normal"
oCart.AddCartItem oGiftCartItem
End If
End Sub
End Class
%>

```



當 Event_Gift 發現 oCartItem 的 Name 是「瓶裝可樂」時，就會建立一個「科學麵(贈品)」的 CartItem 物件， 並利用 oCart 的 AddCartItem 把這個贈品再加上去。

好，現在三種活動類別都已經定義好了，我們就來看看怎麼用吧。

我把原來的 CheckCartItemForEvent 改成以下的形式：

```
  ' 檢查是否為某個活動的商品
Private Sub CheckCartItemForEvent(oCartItem)
Dim oEvent
Select Case oCartItem.GetField("EventType")
' 折扣活動
Case "Discount"
        Set oEvent = GetObject("Event_Discount")
' 贈品活動
Case "Gift"
        Set oEvent = GetObject("Event_Gift")
' 一般商品
Case Else
        Set oEvent = GetObject("Event_Normal")
End Select
    oEvent.Check oCartItem, Me
End Sub

```

發現什麼沒有？我們竟然可以用同樣的 Check 函式來檢查商品！這就是所謂的 Strategy 模式！

 Strategy 模式主要的概念就是可抽換的策略，也就是在程式執行的階段裡，我們能用同一種操作方式 (如上面的 Check 函式) 來對資料進行不同的運算條件，而這些運算邏輯則定義在不同的策略類別裡，就像上面的 Event_xxx 類別。

在完整支援物件導向技術的語言中，這些策略類別應該是繼承自一個抽象類別或介面 (就是我們上面提到的虛擬 Event 類別) ，而 Event 的 Check 函式就是需要被實作的了。就因為 Event 類別所衍生的類別在實作上是不同的，所以我們才能用同一個 Check 函式來對應到不同的活動條件。

註：話說回來， ASP (VBScript) 既然沒有繼承，所以只要是有實作相同函式介面的類別所產生的實體，都有可能被拿來當做是策略物件。這點是 ASP (VBScript) 自由卻也是不合物件導向語言規範的地方。

另外注意一點，就是 Me 關鍵字的應用。我利用 Me 關鍵字把 CheckCartItemForEvent 所在這個物件 (也就是 Shopping_Cart 的實體) ，傳遞給 Event_xxx 物件，這樣這些 Event_xxx 物件就是利用 oCart 參數來存取目前的購物車內容。這種方式稱為 delegate (委託) ， Shopping_Cart 物件拜託 Event 物件做一些事情，所以要把自己 (Me) 託付給它。這在委託者缺少某些功能，而需要外部物件協助時非常有用。

和前面一樣，我簡單地把加入活動類別的架構圖描繪如下：

![新的購物車架構](/resources/ooasp_cart/images/ooasp_cart_1_2.png)

## Factory Method 模式

在上面的程式裡，我們還是在 CheckCartItemForEvent 函式中參雜了 Select Case 敘述，這使得我們到時候要新增活動時，還是得回來加上新的活動類別建構程式。有沒有什麼方法可以避免這些動作呢？或是直接拿掉 Select Case 敘述呢？

我相信大家也看出一些端倪了。我所用的類別代號 Normal 、 Gift 及 Discount ，其實就對應到 Event 的實作類別名稱。這表示我們能夠利用類別代號來產生我們所需要的物件，但是怎麼做呢？

從上面的程式裡，我們可以看到 GetObject 需要一個類別名稱來當做引數。這個引數剛好是用 Event_ 加上類別代碼，所以我們就能夠利用這點來下手。

我把剛剛的 Select Case 換成以下粗體的部份：

```
' 檢查是否為某個活動的商品
Private Sub CheckCartItemForEvent(oCartItem)
Dim oEvent
Set oEvent = CreateEvent(oCartItem.GetField("EventType"))
oEvent.Check oCartItem, Me
End Sub

```

現在我們就要思考 CreateEvent 函式要丟出什麼東西，以下是我的實作：

```
' 取得活動商品
Private Function CreateEvent(sEventType)
Set CreateEvent = Nothing
On Error Resume Next
Set CreateEvent = GetObject("Event_" &amp; sEventType)
If CreateEvent Is Nothing Then
  Set CreateEvent = GetObject("Event_Normal")
End If
On Error Goto 0
End Function

```

你可以看到我用之前介紹過的 Factory Method 手法來完成建構活動物件的過程，利用錯誤延遲機制讓不存在的活動類別一律視為一般商品來處理，避免掉一些不必要的麻煩。

Factory Method 最大的好處就是能夠隱藏物件建構的過程，讓呼叫它的程式能夠保持簡單及一致性。它可以把建構物件的複雜邏輯封裝在別的類別裡面，使得我們能夠重複使用這個類別來產生我們所要的東西，也就是能更簡單地把建構物件自動化。不過在這裡，你會發現到我並沒有再做出一個類別來放置 Factory Method ，為什麼呢？

這要歸功於能把字串當做程式敘述的 Execute (ExecuteGlobal) 指令；在其他不支援此特性的語言裡，類似 Select Case 的敘述在 Factory Method 中通常是不可避免的；然而在 ASP (VBScript 、 JavaScript) 或 PHP 等語言平台中， Factory Method 因為這些語言支援把字串變成程式指令的特性，所以在實作上就變得更有彈性。

註：把字串當做程式敘述這種方式通常會有安全性上的議題出現，所以寫程式時要特別小心。

## 結論

回頭思考看看，現在如果又有一個新的活動，我們已經不必再更改 Shopping_Cart 類別裡面的程式；只要新增一個 Event_xxx 類別，實作該活動的規則，就能讓購物車處理這些活動商品，這樣的彈性就是物件導向思維所帶來的好處。

也許你會想，這我用函式也能做到呀！其實也沒錯。不過這裡我要強調一件事，不管你用什麼方式開發，只要這些程式在你交接後還可能存活時，最後一定要考慮到程式的延展性。我採用物件導向思維及開發手法是為了更容易表達我對這個系統的概念，而且也讓整個系統就在物件交互作用之下，完成了許多看似複雜的工作。

另外我建議把這些開發的概念撰寫成文件，讓後續維護的人員能夠進入狀況，就像這篇文章一樣。他們不一定能夠清楚為什麼要採用這樣的方式，所以透過類似這篇文章的說明，他們就能一步一步瞭解開發者所建立的系統輪廓。

我希望透過我的介紹，能夠讓我的伙伴瞭解物件導向是怎麼一回事。而它到底是不是真的必須依賴語言？還是協助我們把心目中的系統架構描繪出來的一種設計手法？我想這邊就留給大家去思考，畢竟我不是大師，這種問題我無法解答；我能夠做的就是把這些概念實際轉換成程式碼，讓系統能夠順利運作而已。

## 範例程式下載

範例程式不是個可用的購物車，它只包含了部份的商業邏輯而已，所以想要直接拿它來改寫的朋友可能會失望。不過裡面我用到了 ASPUnit ，有興趣學習如何撰寫單元測試的朋友可以參考看看。另外裡面包含了上面每個步驟所介紹的購物車原始程式，你可以參考壓縮檔案的 README.txt 來得知如何執行它們。

[下載](/resources/ooasp_cart/source/ooasp_01_src.rar)
