title: 在 Laravel 上用 MailCatcher 發送測試信件
date: 2015-07-29 15:22:29
tags: ["Laravel"]
---

雖然 Laravel 在寄送測試信件上提供了 [Mailgun](http://www.mailgun.com/) 這個服務的串接方式，不過如果能夠在 Homestead 就可以直接測試是更棒的選擇；而 [MailCatcher](http://mailcatcher.me/) 剛好就提供這樣的功能，它能啟動一個 SMTP 模擬服務，並且讓我們透過 Web 介面來查看信件是否有被發送出來。

> 註：類似的工類還有用 Go 寫的 [MailHog](https://github.com/mailhog/MailHog) ，據說速度更快；雖然我還沒試過，但我想用法應該是相同的。

以下就簡單介紹一下如何在 Laravel 5.1 上使用 MailCatcher 。

<!-- more -->

## 安裝 MailCatcher

這裡我們用 Homestead 示範，先把 Homestead 的 port 1080/1025 導到本機的 port 1080/1025 ，方便稍後在本機操作。執行：

```bash
$ homestead edit
```

> 註： `$ `  為提示字元，不需要輸入。

然後加入：

```yaml
ports:
    - send: 1080
      to: 1080
    - send: 1025
      to: 1025
```

接著進入 Homestead ：

```bash
$ homestead up
$ homestead ssh
```

確認 Ruby 環境是安裝好的：

```bash
$ ruby -v
ruby 2.1.2p95 (2014-05-08) [x86_64-linux-gnu]

$ gem -v
2.2.2
```

然後安裝 MailCatcher ：

```bash
$ sudo gem install mailcatcher --no-ri --no-rdoc
```

安裝完成後，直接執行 `mailcatcher` ：

```bash
$ mailcatcher --ip 0.0.0.0
Starting MailCatcher
==> smtp://0.0.0.0:1025
==> http://0.0.0.0:1080
*** MailCatcher runs as a daemon by default. Go to the web interface to quit.
```

這樣 MailCatcher 的 port 1025 就會監聽 SMTP 請求，而 port 1080 就會是它的 Web 管理介面。

打開本機的瀏覽器，瀏覽 `http://127.0.0.1:1080` ，應該就會看到 MailCatcher 的 Web 管理介面：

![MailCatcher Web UI](/resources/laravel-mailcatcher/mailcatcher-web-ui.png)

## 修改 Laravel Mail 設定

這裡我假設你已經建立一個 Laravel 5.1 專案了，所以修改 `.env` 中的 `MAIL_HOST` 與 `MAIL_PORT` 即可：

```ini
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
```

其他一切都可以不需要改動。

## 測試發送信件

我們可以直接用 tinker 來測試是否能夠發送信件，執行：

```bash
$ php artisan tinker
Psy Shell v0.5.2 (PHP 5.6.8 — cli) by Justin Hileman
>>>
```

然後輸入：

```
Mail::raw('This is a test mail', function ($message) {
$message->subject('Test');
$message->from('laravel@example.com', 'Laravel');
$message->to('user@example.com');
});
```

結果應該會回傳 `1` ，然後你可以回到瀏覽器查看 MailCatcher 是否有收到這封信，結果應該會如下圖所示：

![MailCatcher Result](/resources/laravel-mailcatcher/mailcatcher-result.png)

## 與其他測試框架的整合

MailCatcher 可以跟 PHP 的自動化測試框架做很好的整合，詳情可以參考以下文章：

* PHPUnit - [Testing Emails in PHP. Part 1: PHPUnit](http://codeception.com/12-15-2013/testing-emails-in-php.html)
* Behat - [MailCatcher extension for Behat](https://github.com/kibao/behat-mailcatcher-extension)
* Codeception - [Test emails in your Codeception acceptance tests](https://github.com/captbaritone/codeception-mailcatcher-module)
