title: 在 Laravel 中使用 Behat 來加強測試的可讀性
date: 2018-11-01 16:37:46

tags: ["測試", "Laravel"]
---

Laravel 的測試框架是基於 PHPUnit 上所建立出來的，而在 Laravel 5.5 之後，測試框架的功能也大幅地加強了。只不過在越來越複雜的專案規格下，我個人覺得 PHPUnit 在情境案例的描述能力上還是不太夠，最好可以用人們看得懂的語言；而目前能夠用自然語言來描述規格情境的，當然就是 [Cucumber](https://cucumber.io/) 的 [Gherkin](http://behat.org/en/latest/user_guide/gherkin.html) 語法了。

<!--more-->

Cucumber 在 PHP 中的實作，就是 [Behat](http://behat.org) 這個 BDD 框架；雖然我很早就接觸過它了，但實際熟悉它則是在 91 哥的 TDD 課程之後的自我練習裡。後來我看到 Laracasts 裡 Jeffrey Way 介紹他開發的 [Behat-Laravel-Extension](https://github.com/laracasts/Behat-Laravel-Extension) 可以將 Behat 整合到 Laravel 中，著實讓我開心了一陣子。

不久後我就透過 Behat-Laravel-Extension 在新開發的 API 專案裡整合了 Behat ，也確實體會到了 BDD 的優異之處；而同事也在接手這個專案時，因為透過自然語言所描述的情境，很快地掌握了整個專案的規格。我們就這樣透過 BDD 很快地把一個又一個的 API 生出來，兼顧了開發效率與規格文件。

不過這一兩年來 Behat-Laravel-Extension 已經很久沒人維護了，在我試圖升級專案的 Laravel 版本時，這個套件發生了版本不相容的問題；加上 Behat-Laravel-Extension 相依了許多我其實用不到的 Behat 延伸套件，因此找出一個更精簡的方案就勢在必行了。

## 突破點

要把 Behat 用在 Laravel 的測試上，最大的問題是如何初始化 Application 。事實上 Behat 執行時只是把 `features/*.feature` 檔的 step definitions 和 `FeatureContext` 類別 (`features/bootstrap/FeatureContext.php`) 裡的 method 對應起來後，再跑遍每個 scenario 而已，所以初始化 Application 它並不負責。

不過如果各位有追蹤過 Laravel 專案的 `Illuminate\Foundation\Testing\TestCase` 這個類別的原始碼，你會發現它在 `setUp` 裡已經初始化了 Application ；而既然已經有類別把這件事做好，我是不是就可以直接拿它來用？沒錯！這就是我後來想到的方法。

因此我就直接把 `FeatureContext` 類別繼承 Laravel 附帶的 `TestCase` 這個類別 (`tests/TestCase.php`) ，加上 Behat 僅要求 `FeatureContext` 類別實作 `Behat\Behat\Context\Context` 這個介面就好，所以我也不必擔心多重繼承問題。

註：其實 Behat-Laravel-Extension 主要也是用來幫忙做初始化 Application 的工作。



就想說是不是也有人有同樣的想法，結果還真的有。





因為 Behat 的 context 檔其實只需要後來我把腦筋動到了