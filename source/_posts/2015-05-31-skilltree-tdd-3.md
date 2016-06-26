title: "自動測試與 TDD 實務開發 - 上課心得 (下)"
date: 2015-05-31 10:10:10
tags: ["TDD", "測試"]
---

第三週是這門課程的最後一堂課，上完課的我心裡其實有很大的衝擊，一直不知道該怎麼整理這最後的心得；就好像美妙的音樂感動了你的心靈，但自己一時之間卻很難重現那樣的弦律。

前兩週講師介紹了[單元測試基礎](http://jaceju.net/2015/05/17/skilltree-tdd/)以及[如何重構舊有程式](http://jaceju.net/2015/05/23/skilltree-tdd-2/)之後，但我們依舊面臨了一個很大的問題，那就是：「我們寫出來的程式，不見得就是我們所想的；而就算符合我們想的，也不見得是需求要的。」

```
「嘿！你沒睡好嗎？上星期提的搜尋功能你應該完成了吧？」
「嗯，我昨天加班完成了，還加上了測試，應該很完美，你試試。」

不久後...

「怎麼我搜尋『特價』這個字，沒有出現特價商品的類別頁？」
「不是吧？搜尋結果應該是獨立的搜尋列表呀！這不是 common sense 嗎？」
「不對不對，你應該在我搜尋『特價』的時候，直接導到特價商品頁就好了。」
「靠！這兩回事吧？而且你給的的需求只有搜尋商品而已，剩下的要我自己腦補喔？」
```

如果這種戲碼常常在辦公室上演的話，浪費的可不只是開發人員的時間呀！面對不清不楚的需求，或是雙方對需求的認知上有所誤解，甚至開發人員「善意地」加入根本不在需求裡的程式碼，這些問題都將可能拖垮整個專案的進度！

所以最後一週，講師為我們帶來了整套課程的高潮：不僅僅是以規格來完成程式碼，更能**用規格來自動驗證你的程式碼！**

<!-- more -->

## 測試驅動了開發，那什麼驅動了測試？

自從大師們對 TDD 進行一場論戰後，很多人發現自己誤解了 TDD 的真義，那就是：所謂的測試驅動從來不是為了「讓系統因為有寫測試而顯得專業」或是「儘可能寫出完美而獨立的測試程式」，而是「從有目標的測試中來完成程式碼」。

TDD 雖然能驅動著開發者專注在測試所在乎的目標上，讓程式碼不會有過度設計的問題；但當目標錯誤的話，即便測試寫得再完整也是白搭。然而測試的目標到底是什麼呢？想當然爾就是我們的需求規格；不過這兩者之間還是存在著巨大的門檻，所以我們要面對的問題是：到底要怎麼讓需求轉換成測試的目標？而且隨著需求不斷地成長，也要能驅動我們的測試持續演進？

## 需求該如何描述？

「網站這麼大，使用者很難一下子就找到他們要的商品，我們是不是應該有個搜尋商品的功能？」當客戶提出這樣的需求時，他們通常不明白也不需要明白程式是怎麼做的 (他們只知道這樣的描述可以讓工程師累垮) 。為了避免客戶與工程師之間有認知上的落差，專案負責人 (PO, Product Owner) 可能就會想辦法生出一大堆文件，來描述詳細的系統規格。

然而我們都知道在大環境的變化下，需求可能會被改得面目全非，先前寫好的文件已然成為一堆廢紙。為了不要大家做白工，敏捷開發提出了 User Stories 這個方式，讓真正有價值的需求能被先簡約地描述出來，而不是一開始就陷在文件地獄裡。

通常一個 User Story 可以用以下的格式來描述：

```
As a <role>, I want to <action> because of <business value>.
(「某個角色」可以「做某件事」來得到「有商業價值的結果」)
```

例如：

```
「使用者」可以「輸入關鍵字」來「找出站內的商品」
```

這樣就是一個 User Story ，它明白地指出需求的目標是什麼，而不會包含技術細節。基本上，我們可以把 User Story 想成是用來確認產品功能的大綱，實作細節可以在之後補上，就不會因為需求的變化而浪費大家的時間。更詳細的 User Story 介紹可以參考以下文章：

* [User Stories (1) 什麼是 User Story? by ihower](https://ihower.tw/blog/archives/2090) (結果這系列好像富奸了...)
* [撰寫使用者故事常見的問題 by David Ko](http://kojenchieh.pixnet.net/blog/post/386322818)

當然只靠 User Story 的描述對開發者來說是不友善的，所以我們需要靠一些方法讓 User Story 和我們的程式有所繫結；也就是說我們要從 User Story 中找出更詳細的規格，進而整合到前面 TDD 的測試目標裡。當通過了以規格所建立出來的測試，我們的程式碼也才真正地符合需求。

為了能達到開發、測試與需求三位一體的目標，所以 [BDD - Behavior Driven Development (行為驅動開發)](http://goo.gl/gyuAWY) 就誕生了。

## 告訴我，這個功能會怎麼被使用

BDD 定義了需求方如何撰寫 User Story ，以及開發人員如何把 User Story 轉換成測試；所以 BDD 的重點並不是測試，而是在定義需求的規格。 BDD 在不同的程式語言中都有實作，例如：

* [JBehave](http://jbehave.org/) - Java 上的 BDD 框架，同時也是最早的 BDD 框架。
* [RSpec](http://rspec.info/) - Ruby 上的 BDD 框架，使用 ruby 來直接描述規格。
* [PHPSpec](http://www.phpspec.net/) - PHP 上的 BDD 框架，使用 php 來直接描述規格。
* [Cucumber](https://cucumber.io/) - 一個用 Ruby 寫的 BDD 框架，後來因為推出 Cucumber-JVM 後，讓其他 JVM-based 語言也可以使用。它的特色是用文字格式的規格檔案來執行測試，後來就變成了一個業界非成文的標準，後來有[很多 BDD 框架](https://cucumber.io/docs#cucumber-implementations)就參考它的運作方式來實作了。
* [SpecFlow](http://www.specflow.org/) - .Net 上的 Cucumber 實作，同時也是這次上課所使用的框架。
* [Behat](http://behat.org/) - PHP 上的 Cucumber 實作。

Cucumber 利用 [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin) 語法來描述需求規格，所以前面的 User Story 就會變成一個 feature 檔：

```
# features/products_searching

Feature: 使用者可以輸入關鍵字來找出站內的商品
    In order to 找出指定的商品
    As a 使用者
    I want to 輸入關鍵字
```

* 註：這裡我不會用課程裡的範例，一是我希望自己是真的理解了 BDD ，所以自己試著如何去應用；二是課程裡的範例更加有挑戰性，我不想破了講師的哏。

接著要定義出這個需求的使用場景，也就是更明確地說明這個需求的功能「要怎麼被使用」，我們稱為 Scenario 。

```
Scenario: 搜尋 "iphone" ，找出的商品包含了 5 個名稱中符合 "iphone" 的商品
    Given 在搜尋輸入框中輸入 "iphone"
    When 我按下搜尋按鈕
    Then 在搜尋頁得到 5 個名稱中符合 "iphone" 的商品

Scenario: 搜尋 "特價" ，會導向特價商品活動頁
    Given 在搜尋輸入框中輸入 "特價"
    When 我按下搜尋按鈕
    Then 導向特價商品活動頁
```

每個 Scenario 都是一條完整的功能執行路徑，只要有路徑分叉 (例如 `if` 判斷) 的話，就要有不同的 Scenario 。其中 Given-When-Then 就是用來描述一個 Scenario 的三要角，它們組合起來的意思是：

```
假定 (Given) 在某個條件下，當 (When) 我做了某個動作，然後 (Then) 就會發生什麼結果。
```

是不是有種既視感？沒錯！ Given-When-Then 剛好對應到 3A 原則的： Arrange-Act-Assert ，所以 Scenario 可以被轉換成測試！

### 我想用中文

前面在 feature 檔案保留英文單字，是為了讓 Gherkin 的語法解釋器能夠辨別；如果不喜歡這種寫法，也可以用中文，只要在檔案開頭加上 `# language: zh-TW` 就可以。

然後原來的 feature 檔就可以改成：

```
# features/product_searching.feature
# language: zh-TW

功能: 使用者可以輸入關鍵字來找出站內的商品
    為了 找出指定的商品
    身為 "使用者"  # 註：這裡以「者」結尾的話在 behat 裡會變亂碼，所以特別處理
    我要 輸入關鍵字

場景: 搜尋 "iphone" ，找出的商品包含了 5 個名稱中符合 "iphone" 的商品
    假定 在搜尋輸入框中輸入 "iphone"
    當 我按下搜尋按鈕
    那麼 在搜尋頁得到 5 個名稱中符合 "iphone" 的商品

場景: 搜尋 "特價" ，會導向特價商品活動頁
    假定 在搜尋輸入框中輸入 "特價"
    當 我按下搜尋按鈕
    那麼 導向特價商品活動頁
```

註：這裡因為我是用 Behat ，所以關鍵字的部份是採用 Behat 的語法 (可以用 `behat --story-syntax --lang zh-TW` 看到範例) 。

## 讓測試程式跟著需求跑

課程裡是使用 SpecFlow ，這裡我改用 Behat 來練習。先在專案裡面初始化 Behat 的執行環境：

```
behat --init
```

它會產生一個 `features/bootstrap/FeatureContext.php` ，而它就是連繫 feature 和測試的關鍵。

建立一個 `features/products_searching.feature` 檔，然後把前面定義的 featrue 內容貼上去，接著再執行 `behat` 指令就會得到以下輸出內容：

![Behat 執行結果](/resources/skilltree-tdd/behat-01.png)

可以看到 Behat 把 feature 檔裡的 Given-When-Then 都變成了方法，它們稱為 Step Definition 。 Step Definition 是可以被重複使用的，所以可以看到兩個 Scenario 共用了其中兩個方法。不過因為 PHP 不支援用中文當做方法名稱，因此 Behat 幫我們用很奇怪的拼音組成方法名稱。

把 Behat 產生的方法複製到 `FeatureContext.php` 裡，然後把方法名稱改成易懂的英文，例如：

```php
// ... 略 ...
class FeatureContext implements Context, SnippetAcceptingContext
{
    /**
     * @Given 在搜尋輸入框中輸入 :arg1
     */
    public function typingInSearchField($arg1)
    {
        throw new PendingException();
    }

    /**
     * @When 我按下搜尋按鈕
     */
    public function iEnterSearchButton()
    {
        throw new PendingException();
    }

    /**
     * @Then 在搜尋頁得到 :arg2 個名稱中符合 :arg1 的商品
     */
    public function getProductsThatIncludeInNameOnResultPage($arg1, $arg2)
    {
        throw new PendingException();
    }

    /**
     * @Then 導向特價商品活動頁
     */
    public function redirectToPageOfSpecialOffer()
    {
        throw new PendingException();
    }
}
```

接下來再執行一次 `behat` ，就會看到 Behat 要我們一步一步完成測試碼：

![Behat 執行結果](/resources/skilltree-tdd/behat-02.png)

這實在是太酷了！現在我們已經讓測試跟規格文件繫結在一起，想要增加需求或修改需求，就是更改測試步驟。而且 Scenario 之間通常只是一兩個步驟的變化，所有已經測試過的步驟都可以重覆利用；而我們要做的就是隨著增長的規格，補上新增的 Step Definition 就可以！

至於怎麼寫測試呢？其實就和單元測試很像，只不過換了一種寫法，前兩週學的都可以應用在這裡面！這樣的開發方式真叫人欲罷不能！

註：心得不打算介紹太多實作，有機會我再補充 Behat 的做法。

## 不再是對立，而是能一起驗收需求

定義好了 feature 檔，我們只要把一個個的 Scenario 完成；就像雕刻一樣，一刀一刀切，最後就會看到完整的成品。而 PO 驗收專案時只需要對照 feature 所對應的測試是否為綠燈，只要通過了，也就是符合需求！這樣一來辦公室就再也不會有劍拔弩張的氣氛了！

當然一開始不見得會這麼順利，身為 BDD 的導入者，或許我們需要花更多耐心來引導 PO 協助我們去撰寫 Scenario ；當他漸漸瞭解這樣做的好處時，就會知道用這個方式能讓需求更快被滿足。未來只要整個團隊認同並遵循這樣的做法，我相信 BDD 一定能為專案帶來莫大的益處。

## 讓文件活下去

基本上， 多數的 Developer 通常很討厭：

* 寫文件
* 寫註解
* 寫測試

但是更討厭：

* 別的 Developer 都不寫文件
* 別的 Developer 都不寫註解
* 別的 Developer 都不寫測試

現在有了 feature 檔，也就同時有了文件和測試，更酷的是這兩者是隨著程式碼一起成長的！

而這門課最有價值的一節，就是教你如何把 feature 執行的結果轉換成 HTML 及 Word 文件，這樣一來只要搭配 CI 就可以讓所有作業一氣呵成！這樣的快感，是工程師夢寐以求的呀！

詳細方法當然還是上課才有的福利囉，至於 PHP 的方法我還在找尋中，這時就不得不說學 .Net 的朋友真是幸福。

## 總結

不要一直想著要寫出完美的測試，因為那通常已經偏離了真正的需求。讓程式符合需求才是開發者的最終目標，只是完整而詳細的需求卻不會自己長腳跑來。

讓真正瞭解需求的人協助你一起完成規格，讓這些規格協助你建立測試，而且執行測試。最後我們唯一要關注的，就是如何去滿足這些測試的目標。對整個團隊來說，真的能改善不少浪費的問題。

如果有機會再開課的話，我強烈推薦大家報名參加呀！趕快關注「[自動測試與 TDD 實務開發](http://skilltree.my/events/ebg)」的下一梯課程吧！