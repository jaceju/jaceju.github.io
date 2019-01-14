---
layout: post
title: 'ASP 物件設計手法 (6) - 單元測試'
date: 2006-2-20
wordpress_id: 76
comments: true
tags: ["ASP"]
---

## ASP 上的單元測試 

沒錯，你沒看錯， ASP 也有單元測試。

什麼是單元測試呢？我想使用 Java 或 .NET 來開發程式的朋友們一定很熟悉。我這裡僅簡單說明一下它的原理，至於深入的介紹，請大家自行去找 XP (eXtreme Programming ，中文常譯為「極致編程」) 相關書籍吧。 

註：建議你去看看[點空間](http://www.dotspace.idv.tw/)裡有篇文章叫「[測試的概念](http://140.109.17.94/xp/2002/JUnit_test.htm)」，寫得滿簡單易懂的。

在 ASP 上面要進行單元測試，首先就要有單元測試框架 (Unit Testing Framework) 。在網路上我找到了以下兩種框架：

* [ASPUnit](http://aspunit.sourceforge.net/)
* [ASPunit](http://sourceforge.jp/projects/aspunit/) (這是日本人開發的。) 


它們的名字差在 U 的大小寫。 

日本人開發的 <strong>ASPunit</strong> 架構比較複雜，而 <strong>ASPUnit</strong> 的比較簡單易懂，而且也容易使用，所以本篇將圍繞在 <strong>ASPUnit</strong> 這個測試框架上。

<!--more-->

## 下載與安裝

你可以到 [ASPUnit 的官方網站](http://aspunit.sourceforge.net/)去下載 ASPUnit ，目前是 0.9.2 版。你也可以用我改過的[這個中文版本](/resources/aspunit/ASPUnit_zhtw.zip)，它已通過了 XHTML 驗證。 

註：我只是將裡面的文字翻譯成中文，並不會影響功能的執行。

ASPUnit 就是用 ASP 開發的，所以一定要有可以執行 ASP 的環境，我的環境是 IIS 6.0 。我不確定這個能不能在 Apache 上的 ASP 模組正常執行，有興趣的朋友如果試成功的話麻煩告知我一下。

另外如果你下載了官方版本，解開後請放在網站根目錄下的 aspunit 資料夾下，否則你得先修改程式裡的 CSS 路徑。

檔案： include\ASPUnitRunner.asp

```
... 略 ...
Const STYLESHEET = "/aspunit/include/ASPUnit.css" ' 改這裡
... 略 ...

```

至於我修改的版本就沒多大關係了，裡面的路徑是用相對的。

註：不過我建議大家用絕對路徑的方式來安裝，因為你可能同時會有多個專案需要用到它。例如裝在 /ASPUnit 底下會是個不錯的選擇，這樣就能夠使用 <!-- #include virtual="/ASPUnit/xxx" --> 的方式來引入測試框架檔案。

## 為什麼要測試

想像一下，當你寫好一個 ASP 類別時，你如何知道它執行結果是不是正確的呢？舉個簡單的例子，假設我們有個商品類別好了，它的程式碼如下：

檔案： Product.asp

```
<%
Class Product
    Private Name
    Private Price
    Private Discount
    Public Sub Init(sName, iPrice, uDiscount)
        Name = sName
        Price = iPrice '* uDiscount
    End Sub
    Public Function GetName()
        GetName = Name
    End Function
    Public Function GetPrice()
        GetPrice = Price
    End Function
End Class
%>

```

想知道它是不是能動作，一般我們會這麼寫：

檔案： TestProduct1.asp

```
<!-- #include file="Product.asp" -->
<%
Dim oProduct1 : Set oProduct1 = New Product : oProduct1.Init "商品1", 100, 1    ' 不打折
Dim oProduct2 : Set oProduct2 = New Product : oProduct2.Init "商品2", 120, 0.9  ' 打 9 折
Response.Write oProduct1.GetName &amp; " 的價格是 "
Response.Write oProduct1.GetPrice &amp; "<br />"
Response.Write oProduct2.GetName &amp; " 的價格是 "
Response.Write oProduct2.GetPrice &amp; "<br />"
%>

```

輸出：

```
商品1 的價格是 100
商品2 的價格是 120

```

但是這種驗證方式每次都得依賴我們人腦去判斷輸出的結果是否在我們的預期之內，而所謂的預期結果則存放在我們的腦海裡，時間一久，也許就會忘了它是不是對的。我們希望測試程式能夠自動檢查執行結果是不是正確的，而且能夠將測試結果用比較人性化的方式輸出。這樣一來就不必面對一堆奇怪的輸出訊息而手足無措。

這些工作 ASPUnit 這個測試框架都幫我們作好了，雖然一樣要寫上面的測試程式，但是在 ASPUnit 中，我們不必自行輸出這些結果來判斷。我們可以預先把我們預期會得到的結果告訴 ASPUnit ，讓它來決定測試的結果是不是正確的；如果一個測試正確了，畫面就會給我們一個綠色光棒 (後面會詳述) ，一旦全都是綠色光棒時，我們就能確定所有的測試都成功了！

註：綠色光棒在 Java 的 JUnit 測試框架是測試成功的意思，是很有趣也很有意義的一種表示方法。

接下來，我將介紹如何撰寫一個能讓 ASPUnit 解讀的測試程式。 

## 使用 ASPUnit 測試框架

### 基本結構

先來介紹一下 ASPUnit 的基本結構，這樣在撰寫測試時比較能夠清楚自己在做什麼。

你也許已經看過 Java 的 JUnit 測試框架的 UML 圖了，其實 ASPUnit 也是基於 JUnit 的一套測試框架，因此在概念與實作上都非常類似。下面的 UML 圖中，我把 ASPUnit 比較重要的幾個類別畫了出來。

![](/resources/aspunit/images/001.gif)

其中 Test 介面是虛擬的 (實際上並不存在) ，因為 ASP (VBScript) 並沒有介面 (interface) 這種東西，所以就忘了這件事吧，我們朝向 Duck Typing 前進。 (Duck Typing 的意思是說「如果它走起路來像鴨子，叫起來也像鴨子，那麼它一定是鴨子！」)

那麼為什麼要有一個 Test 介面？因為 Test 介面包含了一個 Run 函式，以便 ASPUnitRunner 能夠正確呼叫。因此在意義的表達上， Test 介面是不可或缺的 (只是這裡是用 Duck Typing ) 。 

而實作了 Test 介面的類別，我們稱為測試容器。測試容器是什麼呢？這裡指的就是 TestCase 和 TestSuite 這兩個類別。 TestCase 會包含數個測試案例，算是比較小的容器； TestSuite 則是更大的測試容器，任何實作了 Run 函式的測試容器都可以放到 TestSuite 裡面，包含它自己。

註：上面說的就是 Composite 這個著名的設計模式 (Design Patterns) ！簡單來說就是大的包小的，不然就自己包自己，然後大家都一視同仁 (都是 Test 介面) 。在這篇 [JUnit A Cook's Tour](http://junit.sourceforge.net/doc/cookstour/cookstour.htm) 文章中，提到了 JUnit 用了那些設計模式，有興趣的朋友可以參考看看。

### 建立測試

在 ASPUnit 中，最簡單的測試容器 (Test Container) 類別如下，它會繼承 TestCase ： (當然又是 Duck Typing 。)

檔案： Sample/ProductTest.asp

```
<%
Class ProductTest ' Extends TestCase
    Public Function TestCaseNames()
        TestCaseNames = Array()
    End Function
    Public Sub SetUp()
    End Sub
    Public Sub TearDown()
    End Sub
End Class
%>

```

 TestCaseNames 這個函式會回傳一個包含測試案例名稱的陣列，如果你的測試案例沒放在這裡面，那麼 ASPUnitRunner 就不會執行任何測試。所以這個類別雖然能執行，但也看不出什麼結果。至於 SetUp 及 TearDown 則一定要有，後面我們會說明它們的用途。

現在我們把要測試的類別引入，請在 ProductTest.asp 的第一行加上：

```
<!-- #include file="Product.asp"-->

```

然後為 ProductTest 類別建立一個新的公開函式：

```
Public Sub TestProduct(oTestResult)
    Dim oProduct : Set oProduct = New Product
    oTestResult.AssertExists oProduct, "物件不存在！"
    Set oProduct = Nothing
End Sub

```

這個公開函式就是一個測試案例，它必須帶入一個 TestResult 物件，這個 TestResult 物件會提供下列方法幫我們分析記錄測試的結果：

<li><strong>Assert</strong> (bCondition, sMessage)</li>
<li><strong>AssertEquals</strong> (vExpected, vActual, sMessage)</li>
<li><strong>AssertNotEquals</strong> (vExpected, vActual, sMessage)</li>
<li><strong>AssertExists</strong> (vVariable, sMessage)</li>


Assert 就是斷言的意思，它表示我們認為程式到這裡的執行結果應該為何。而 sMessage 則是當結果不如我們預期時，我們想要顯示的訊息。如果測試成功的話，就只會顯示測試成功。而上面的測試案例是說，我們先建立一個 Product 物件，並斷言此物件是存在的。

寫好測試案例 (函式) 後，記得將它的函式名稱放到 TestCaseNames 的陣列裡：

```
TestCaseNames = Array("TestProduct")

```

這樣 ASPUnitRunner 才能夠知道要測試什麼。

最後的整個測試容器程式如下：

檔案： Sample/ProductTest.asp

```
<!-- #include file="Product.asp" -->
<%
Class ProductTest ' Extends TestCase
    Public Function TestCaseNames()
        TestCaseNames = Array("TestProduct")
    End Function
    Public Sub SetUp()
    End Sub
    Public Sub TearDown()
    End Sub
    Public Sub TestProduct(oTestResult)
        Dim oProduct : Set oProduct = New Product
        oTestResult.AssertExists oProduct, "物件不存在！"
        Set oProduct = Nothing
    End Sub
End Class
%>

```

### 執行測試

好了，當有了測試程式，怎麼讓它跑起來呢？基本上我們就是要用 UnitRunner 去執行所有的測試，請看以下程式：

檔案： Sample/Go.asp

```
<%
Option Explicit
%>
<!-- #include file="../include/ASPUnitRunner.asp"-->
<!-- #include file="ProductTest.asp"-->
<%
Dim oRunner
Set oRunner = New UnitRunner
oRunner.AddTestContainer New ProductTest
oRunner.Display()
%>

```

首先，我們得先引入 UnitRunner 類別，然後引入要測試的容器類別檔。

接著建立一個 UnitRunner 物件及容器物件 (也就是 ProductTest) ，然後把容器物件放到 UnitRunner 裡面。

最後把呼叫 UnitRunner 的 Display 函式，以顯示執行介面。

執行此程式，我們會得到下圖：

![](/resources/aspunit/images/002.gif)

整個 ASPUnitRunner 的執行介面分成了兩個部份：上方的控制台和下方的執行結果。我們可以選擇要測試的容器類別及該容器裡所包含的測試案例，而且也可以選擇是否顯示已經成功通過測試的案例。

但是先別管其他設定，直接按下「執行測試」，就會看到：

![](/resources/aspunit/images/003.gif)

表示我們的測試成功了！

## 進行多個測試案例

前面提過一個測試容器裡面可以包含數個測試案例，而上面的 TestProduct 函式就是一個測試案例。當我們在撰寫測試時，會把被測試類別裡的每一個方法視為一個單元 (注意：這是狹義的解釋) ，每個測試案例都是只針對一個方法來撰寫。測試案例的名稱在 ASPUnit 中是不重要的，只要能夠表達出想測試什麼即可。但是一般還是會按照慣例，使用 TestXXX 的方式來命名。

註：在日本人開發的 ASPunit 中，應該會自動取得 TestXXX 來執行，而不用我們自行加在 TestCaseNames 中。像 JUnit 也是，只要命名成 testXXX() ，那麼測試框架就會自動取得這些測試案例。

我們將 ProductTest 加入以下的測試案例：

```
Public Sub TestGetName(oTestResult)
    Dim oProduct : Set oProduct = New Product
    oProduct.Init "商品1", 100, 1
    oTestResult.AssertEquals "商品1", oProduct.GetName, "名稱不同！"
    Set oProduct = Nothing
End Sub
Public Sub TestGetPrice(oTestResult)
    Dim oProduct : Set oProduct = New Product
    oProduct.Init "商品1", 100, 1
    oTestResult.AssertEquals 100, oProduct.GetPrice, "價格不同！"
    Set oProduct = Nothing
End Sub

```

<strong>注意！在 AssertEquals 函式裡，預期結果要在前面！實際結果在後面！我常會不小心犯下這種錯誤。</strong>

當然，別忘了把這兩個測試案例的名稱放到 TestCaseNames 中：

```
TestCaseNames = Array("TestProduct", "TestGetName", "TestGetPrice")

```

接著再執行 Go.asp ：

![](/resources/aspunit/images/004.gif)

我們可以看到，三個測試都過了。

## 失敗的測試

但是測試過了，不表示一切都完美了，有可能我們根本沒有測試到重點。現在我們再加入一個測試，它會將建立一個打九折的商品，而原價是 100 元，而打折後應該是 90 元。我們說過，要讓測試自動化，所以預期結果 90 元就應該寫在測試中。

```
Public Sub TestGetDiscountedPrice(oTestResult)
    Dim oProduct : Set oProduct = New Product
    oProduct.Init "商品2", 100, 0.9
    oTestResult.AssertEquals 90, oProduct.GetPrice, "價格不同！"
    Set oProduct = Nothing
End Sub

```

別忘了加入 TestCaseName 陣列，再執行一次：

![](/resources/aspunit/images/005.gif)

啥米！竟然失敗了！和我們預期的結果不同，價格仍然是 100 元！為什麼呢？

回到我們的 Product 類別，因為 GetPrice 剛剛已經通過測試，所以想必問題應該會是在 Init 這個初始化函式上：

```
Public Sub Init(sName, iPrice, uDiscount)
    Name = sName
    Price = iPrice '* uDiscount
End Sub

```

看到沒？在乘法符號前竟然多了個單引號，使得後面的運算變成了註解 (雖然這是我故意的) 。把這個單引號去掉之後再執行一次測試：

![](/resources/aspunit/images/006.gif)

不就成功了嗎？

註：黃色的是失敗，紅色則是錯誤，而錯誤通常是指執行時期的 Error ，這裡我就不詳述了。 

## 測試設備

每個測試案例的執行流程 (也就是 Run 函式執行的時候) ，其概念是採用 Template Method 這個設計模式，換句話說，它會依次呼叫以下的測試容器函式成員：

* SetUp() ' 在每個測試案例前做設定動作
* TestXXX() ' 測試案例 
* TearDown() ' 在每個測試案例後做清除動作


註：或許你會覺得很懷疑， Template Method 模式不是要用到繼承嗎？嘿，這就是 ASPUnit 作者們功力高深之處了。有興趣的話去追一下程式，包你功力大增！ (但在追以前請保持頭腦清晰，免得到最後迷失了方向。)

那為什麼要執行 SetUp 和 TearDown 呢？原因在於當我們如果有多個測試案例，而這些測試案例在每次執行時可能都會初始化一些相同的變數或物件，那麼我們就可以把這些相同的動作放到 SetUp 函式裡。相對的，如果要清除這些變數或物件，就會放到 TearDown 中。 

我們把剛剛的 ProductTest.asp 改成下面的型式：

```
<!-- #include file="Product.asp" -->
<%
Class ProductTest ' Extends TestCase
    Private oProduct
    Public Function TestCaseNames()
        TestCaseNames = Array("TestProduct", "TestGetName", "TestGetPrice", "TestGetDiscountedPrice")
    End Function
    Public Sub SetUp()
        Set oProduct = New Product
    End Sub
    Public Sub TearDown()
        Set oProduct = Nothing
    End Sub
    Public Sub TestProduct(oTestResult)
        oTestResult.AssertExists oProduct, "物件不存在！"
    End Sub
    Public Sub TestGetName(oTestResult)
        oProduct.Init "商品1", 100, 1
        oTestResult.AssertEquals "商品1", oProduct.GetName, "名稱不同！"
    End Sub
    Public Sub TestGetPrice(oTestResult)
        oProduct.Init "商品1", 100, 1
        oTestResult.AssertEquals 100, oProduct.GetPrice, "價格不同！"
    End Sub
    Public Sub TestGetDiscountedPrice(oTestResult)
        oProduct.Init "商品2", 100, 0.9
        oTestResult.AssertEquals 90, oProduct.GetPrice, "價格不同！"
    End Sub
End Class
%>

```

在上面的程式裡， oProduct 這個變數變成了 ProductTest 類別的私有變數，所以它在整個 ProductTest 裡都可以被參用到。

在這裡，我們把 oProduct 稱為「測試設備 (Fixture) 」。測試設備可以有很多個，當然最好是每個測試都會用到的物件，我們才將它轉為測試設備；如果只有一個測試案例會用到，那麼直接在該案例中自行建立即可。

因此 Runner 在呼叫測試容器的 Run 函式時，就會依照以下順序去執行其他函式：

* SetUp()
<li><strong>TestProduct()</strong></li>
* TearDown()
* SetUp()
<li><strong>TestGetName()</strong></li>
* TearDown()
* SetUp()
<li><strong>TestGetPrice()</strong></li>
* TearDown()
* SetUp()
<li><strong>TestGetDiscountedPrice()</strong></li>
* TearDown()


那麼為什麼不保留 oProduct 的內容，直接讓接下來的測試案例使用呢？反覆的建立和銷毀，效率不是很差嗎？

錯！單元測試並沒有特別要求測試時的執行效率，其在意的是程式的穩定性；也就是說，我們需要的是每個測試案例自行運作時的獨立性。而 SetUp 和 TearDown 兩個函式能協助我們建立每次執行測試時的隔離環境，讓我們能信任測試結果的可靠性。

## 總結

其實我還很多關於單元測試的東西沒有說明，不過這篇文章主要目的是介紹 ASPUnit 以及單元測試一些簡單的概念。當然我想對大家來說，這篇文章的紀錄意義遠大於實用意義，有多少人會真的會去用它呢？實在很難說。

有很多文章和書籍都提到了測試，以下列出幾本我覺得不錯的中文著作，希望對大家有用：

* [極致軟體製程 (Extreme Programming Explained)](http://www.tenlong.com.tw/BookSearch/Search.php?isbn=9867910311&sid=12245)
* [敏捷軟體開發：原則、樣式及實務 (Agile Software Development: Principles, Patterns, and Practices)](http://www.tenlong.com.tw/BookSearch/Search.php?isbn=9861541489&sid=26120)
* [重構─改善既有程式的設計](http://www.tenlong.com.tw/BookSearch/Search.php?isbn=9867594061&sid=17667)


總而言之，測試是一件非常重要的事情，不論你用哪一種程式語言，找到一個足以信任的測試框架，做好自動化測試，這樣做起事來才能事半功倍。

歡迎隨時回來指正我。

## 相關文章

* [ASP 物件導向 (1) - 基礎](http://www.jaceju.net/blog/archives/51/)
* [ASP 物件導向 (2) - 初級技巧](http://www.jaceju.net/blog/archives/52/)
* [ASP 物件導向 (3) - 進階技巧](http://www.jaceju.net/blog/archives/54/)
* [ASP 物件導向 (4) - 動態載入類別](http://www.jaceju.net/blog/archives/57/)
* [ASP 物件導向 (5) - Me 關鍵字](http://www.jaceju.net/blog/archives/59/)
* [ASP 物件導向 (6) - 單元測試](http://www.jaceju.net/blog/archives/76/)
