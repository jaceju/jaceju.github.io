title: 在 Mac OS X 上搭建 Selenium 測試環境
date: 2015-06-03 10:21:45
tags: ["Selenium", "測試"]
---

在開發網站的過程中，因為需要測試介面以模擬使用者的操作，最理想的工具就是 [Selenium](http://www.seleniumhq.org/) 了。

現在我是用 Mac 來當做開發環境，所以簡單記錄一下如何在 OS X 上建立 Selenium 測試環境。

Selenium 的簡單原理與應用可以參考：[自動測試與 TDD 實務開發 - 上課心得 (中)](http://jaceju.net/2015/05/23/skilltree-tdd-2/)

<!-- more -->

## 準備工作

1. 確認可以執行 Java ，因為 Selenium Server 需要用 Java 執行；如果沒有 Java 的話，可以去 Oracle 官方網站[下載](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) 後安裝。
1. 確認可以執行 [homebrew](http://brew.sh/) ，因為稍後有幾個套件會使用它來安裝。
1. 在適合的位置建立一個新資料夾，例如 `~/Selenium` ，接下來的工作都會在這裡進行。
1. 最後在 Terminal 中下載我寫好的 script 並執行它，它會下載 selenium server 並安裝 ChromeDriver 及建立 Firefox Profile。

完整的指令如下：

```bash
mkdir -p ~/Selenium && cd $_
curl -S -s -L https://goo.gl/s519kT > run-selenium
chmod +x run-selenium && mv run-selenium /usr/local/bin
run-selenium init
```

## 設定瀏覽器

先確認好已經安裝 [Firefox](http://mozilla.com.tw/) 、 [Google Chrome](https://www.google.com.tw/chrome/) 等瀏覽器， Safari 則已內建。

### Google Chrome

[ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/) 可以讓 Selenium Server 呼叫 Google Chrome 執行；如果前面已經執行過 `./run-selenium init` 的話，就已經安裝好了。可以在 Terminal 執行 `chromedriver -v` 來驗證是否正確安裝。

### Safari

[SafariDriver](https://github.com/SeleniumHQ/selenium/wiki/SafariDriver) 則可以讓 Selenium Server 呼叫 Safari 執行，它是一個 Safari Extension ，必須手動安裝。

1. 在 Selenium 官網[下載頁](http://www.seleniumhq.org/download/)找到 `SafariDriver` ，下載 `Latest release` 連結的 `SafariDriver.safariextz` 檔。
1. 用滑鼠雙擊 `SafariDriver.safariextz` 檔， Safari 會提示是否安裝 `WebDriver` ，選「安裝」。
1. 開啟 Safari ，在「偏好設定」裡面切換到「延伸功能」頁籤。
1. 在「延伸功能」頁籤畫面上，應該就會有 `WebDriver` ，確認它有被啟用。
1. **最後在「安全性」頁籤畫面上，將「阻擋彈出式視窗」取消勾選，避免阻擋測試程式執行。**

## 啟用並停用 Selenium Server

在要測試之前，啟用 Selenium Server ：

```bash
run-selenium start
```

要結束 Selenium Server 則是：

```bash
run-selenium stop
```

## 測試用範例

這邊已經有個我寫好的[範例](https://github.com/jaceju/selenium-demo)，它整合了以下幾個 Selenium Server 的用法：

* [PHPUnit Selenium](https://github.com/giorgiosironi/phpunit-selenium)
* [PHP WebDriver](https://github.com/instaclick/php-webdriver)
* [Codeception WebDriver Module](http://codeception.com/docs/modules/WebDriver)

用法請參考 [README](https://github.com/jaceju/selenium-demo/blob/master/README.md) 說明。

## 參考

* [Automating Headless Selenium PHPUnit Tests](http://www.hashbangcode.com/blog/automating-headless-selenium-phpunit-tests)
* [Elemental Selenium - How To Use Safari](http://elementalselenium.com/tips/69-safari)