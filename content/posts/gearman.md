---
title: 'Gearman 心得'
date: 2010-06-07 00:00:00 +08:00
tags: ["PHP"]
---

前幾天， Glenn 與 Mark 分享了 Gearman 的觀念與實作，以下就是我簡單的筆記與心得。

<!-- more -->

## 問題

以往我在開發會員註冊功能時，通知信總是即時寄出；雖然寄信這個動作不會花太多時間，但遇到網路塞車或是郵件伺服器反應較慢時，那麼會員就有可能要等好一陣子才能進到下一個網頁。

那麼我們要怎麼解決這種問題呢？

如果大家有用過 SlideShare 或是 YouTube 的話，這些網路服務在我們上傳檔案後，就會開始做轉換的動作，但卻又不必讓我們在那裡傻傻的等；那麼同樣的道理，如果我們能把寄信這個訊息丟到一個負負發信的機器去，然後就繼續處理我們的工作，而不必等候它的通知，這樣不就解決我們的問題了嗎？

這個技巧就稱為「 Message Queue 」。

## Message Queue 原理

想像一下我們人現在正在銀行，現在櫃台窗口的辦事人員都在忙碌，而門口的服務人員會親切地給我們票卡，讓我們在一旁稍等；這時我們可以先看看報紙，或是打電話先到公司交代一些事情，等待有空的窗口呼叫我們就可以了。

用程式的角度來說，當我們發出請求之後並不一定馬上就要處理，而是先進入佇列等候，這時我們就可以先行往下執行其他步驟；當可以處理該需求的資源有空閒時，就會幫我們做處理。這種模式就是 Message Queue 的基本概念。

所以在 Message Queue 中就有以下這三個角色：

* Client ：就是需要服務的客戶；也就是發送需求的程式。

* Job Server ：就是整間銀行，更嚴格的來說，它指的是「瞭解客戶需要何種服務，並查看哪個窗口可以處理這項需求」的機制。一般來說，在系統裡它通常會是個 Daemon 。

* Worker ：負責處理客戶需求的櫃台人員；也就是實際處理需求的程式。

我們簡單用下圖來說明：

[![Message Queue 概念圖](/resources/gearman/message_queue.png)](/resources/gearman/message_queue.png)

 首先，執行 Message Queue 服務的 Job Server 可以是多台伺服器組成，也就是分散式架構。然後我們會在 Job Server 上註冊並執行 Worker 程式，這些 Worker 程式會一直循環地等候，直到 Job Server 呼叫它執行工作。

在 Client 發送出需求之後，會將要需要的資料及動作記錄在 Job Server 上，這時 Job Server 會查看是否有空閒並且符合需求的 Worker ；例如 Client 程式告訴 Job Server 要寄信，那麼 Job Server 就會查看負責寄信的 Worker 目前是否有空。當 Worker 有空時，那麼 Job Server 就會從佇列中把 Client 的需求轉移給 Worker 開始執行。

在 Worker 結束工作後，也會發送通知給 Job Server ，這時 Job Server 就會視狀況把結果回傳給 Client 。也就是這樣的機制，讓 Client 不必再等候需求的執行結果，而可以直接再往下執行其他動作。

值得注意的是，一般 Client 和 Job Server 的主機會是分開的；這樣的架構，才不會造成執行 Client 程式主機的負擔。不過稍後的示範裡，我們會在同一台主機上實作 Client 和 Worker 。

## Gearman 簡介

實作 Message Queue 套件有很多， Gearman 也是其中之一。它的詳細歷史與介紹請參考[官方說明](http://gearman.org/index.php?id=manual)，以下我們簡單介紹它的應用方式：

下圖取自官方手冊，主要是說明 Gearman 的運作機制：

[![Gearman 流程圖](http://gearman.org/img/stack.png)](http://gearman.org/img/stack.png)

藍色部份是由我們開發的程式碼，而黃色部份是由 Gearman 或第三方 API 提供的。也因為只要符合 API 規範就可以跟 Gearman 溝通，所以 Client 和 Worker 並不需要用同樣的語言來實作 API ；例如我們可以在 Client 端使用 PHP 開發程式，在 Worker 端使用 C 或 Perl 來開發，因為它們有提供 Gearman 的 API 來供我們呼叫。

註：在官方網站的[下載頁](http://gearman.org/download/)中，可以看到分別以各種語言實作的 Gearman API Library 。

另外 Gearman 也提供了 Persistent Queues 的功能，也就是當 Worker 在無法提供服務時， Job Server 會將 Queue 保留 Persistent Storage 中，以便在 Worker 恢復運作時能再次運行。

## 安裝 Gearman Job Server

Gearman 在官方網站上已經提供了各種套件版本的[安裝說明](http://gearman.org/getting-started/)，不過目前不論是 Server 端或 Client API 端，都不提供 Windows 版本，因此以下的安裝與範例我都將以 Ubuntu 10.04 為主。

> 註：這裡我也假設大家已經安裝好了 PHP 。

先利用以下的指令來安裝 gearman 及相關套件：

```bash
sudo apt-get install gearman-job-server
```

完成後， Gearman Job Server 就會在我們的系統中啟動了。

## 設定 Persistent Queue

接著我們要在 MySQL 中先建立一個 gearman 資料庫，這樣稍後啟動 Gearman Job Server 時，才能建立所需要的資料表：

```bash
echo 'CREATE DATABASE gearman' > /tmp/temp.sql ; mysql -u root -p < /tmp/temp.sql ; rm -f /tmp/temp.sql
```

而為了讓 Gearman Job Server 能夠串接 MySQL ，我們要在 Service Script 中設定相關參數。編輯 `/etc/init/gearman-job-server.conf` 這個檔案：

將：

```bash
exec start-stop-daemon --start --chuid gearman --exec /usr/sbin/gearmand -- --log-file=/var/log/gearman-job-server/gearman.log
```

置換為：

```bash
script
    . /etc/default/gearman-job-server
    exec start-stop-daemon --start --chuid gearman --exec /usr/sbin/gearmand -- $PARAMS --log-file=/var/log/gearman-job-server/gearman.log
end script
```

> 註：這邊是個 bug ，可以參考 [Ubuntu 14.04 Gearman Config Bug](http://jeremykendall.net/2014/09/04/ubuntu-14-dot-04-gearman-config-bug/) 一文。

然後再編輯 `/etc/default/gearman-job-server` ，將：

```bash
PARAMS="--listen=localhost"
```

置換成：

```bash
PARAMS="-q mysql --mysql-host 127.0.0.1 \
                 --mysql-user root \
                 --mysql-password secret \
                 --mysql-db gearman \
                 --mysql-table gearman_queue"
```

其中 `--mysql-host` 可換成各位慣用的 MySQL 伺服器 IP ，而 `--mysql-user` 、 `--mysql-password` 則是要有 `CREATE TABLE` 的權限。

最後重新啟動 Gearman Job Server ：

```bash
sudo service gearman-job-server restart
```

我們可以用 ps 指令來查看啟動是否成功：

```bash
ps aux | grep gearman
```

出現以下結果的話，就表示我們成功安裝並設定好 Gearman Job Server 了。

```bash
gearman   7158  0.0  0.3 483732  7384 ?        Ssl  16:01   0:00 /usr/sbin/gearmand -q mysql --mysql-host 127.0.0.1 --mysql-user root --mysql-password secret --mysql-db gearman --mysql-table gearman_queue --log-file=/var/log/gearman-job-server/gearman.log
```

## 安裝 PHP Gearman API Extension

因為後面的範例是使用 PHP 做示範，所以我們安裝 Gearman Extension ：

```bash
sudo apt-get install php5-gearman
```

## 簡易實作

接下來，我們可以試著用 PHP API 來連接 Job Server 。前面安裝好 PECL 的 Gearman Extension 後，我們就可以在 PHP 程式裡建立操作 Gearman API 的物件了。

以下我用簡單的方式來模擬 Client 和 Worker 的運作，所以這裡 Client 和 Worker 會在同一部主機上，但實際運作時是不需要的，請大家注意。

### Client 端程式

先看看 client.php ：

```php
<?php
$client = new GearmanClient();
$client->addServer(); // 預設為 localhost
$emailData = array(
    'name' => 'web',
    'email' => 'member@example.com',
);
$imageData = array(
    'image' => '/var/www/pub/image/test.png',
);
$client->doBackground('sendEmail', serialize($emailData));
echo "Email sending is done.\n";
$client->doBackground('resizeImage', serialize($imageData));
echo "Image resizing is done.\n";
```

首先， PHP Gearman Extension 提供了一個名為 [GearmanClient](http://www.php.net/manual/en/class.gearmanclient.php) 的類別，它可以讓程式安排工作給 Job Server 。

而 [addServer](http://www.php.net/manual/en/gearmanclient.addserver.php) 方法表示要通知的是哪些 Job Server ，也就是說如果有多台 Job Server 的話，就可以透過 addServer 新增。

然後我們將要呼叫哪個 Worker 以及該 Worker 所需要的資料，利用 GearmanClient 的 [doBackground](http://www.php.net/manual/en/gearmanclient.dobackground.php) 方法傳送過去。 doBackground 方法顧名思義就是在背景執行， Client 在丟出需求後就可以繼續處理其他的程式，也就是我們常說的「射後不理」。

doBackground 方法的第一個參數是告訴 Job Server 要執行哪個功能，而這個功能則是由 Worker 提供的；要注意是，這個參數只是識別用的，並不是真正的函式名稱。而第二個參數是要傳給 Worker 的資料，它必須是個字串；因此如果要傳送的是陣列的話，我們就要用 PHP 的 serialize 函式來對這些資料做序列化。

### Worker 端程式

接下來我們要製作 Worker ，以下就是 worker.php ：

```php
<?php
$id = microtime(true);
$worker = new GearmanWorker();
$worker->addServer(); // 預設為 localhost
$worker->addFunction('sendEmail', 'doSendEmail');
$worker->addFunction('resizeImage', 'doResizeImage');
while ($worker->work()) {
    if ($worker->returnCode() != GEARMAN_SUCCESS) {
        break;
    }
    sleep(1); // 無限迴圈，並讓 CPU 休息一下
}
function doSendEmail($job)
{
    global $id;
    $data = unserialize($job->workload());
    print_r($data);
    sleep(10); // 模擬處理時間
    echo "$id: Email sending is done really.\n\n";
}

function doResizeImage($job)
{
    global $id;
    $data = unserialize($job->workload());
    print_r($data);
    sleep(10); // 模擬處理時間
    echo "$id: Image resizing is really done.\n\n";
}
```

 PHP 的 Gearman Extension 也提供了一個 GearmanWorker 類別，讓我們可以實作 Worker 。而 GearmanWorker 類別也提供了 [addServer](http://www.php.net/manual/en/gearmanworker.addserver.php) 方法，讓所生成的 Worker 物件可以註冊到 Job Server 中。

另外 GearmanWorker 類別也提供了 [addFuncton](http://www.php.net/manual/en/gearmanworker.addfunction.php) 方法，告訴 Job Server 自己可以處理哪些工作。 addFunction 的第一個參數就是對應到 GearmanClient::doBackground 方法的第一個參數，也就是功能名稱；這使得 Client 和 Worker 能透過這個名稱來互相溝通。而第二個參數則是一個 [callback](http://www.php.net/manual/en/language.pseudo-types.php#language.types.callback) 函式，它會指向真正應該要處理該工作的函式或類別方法等。

最後因為 Worker 因為要隨時準備服務，是不能被中斷的，因此我們透過一個無限迴圈來讓它常駐在 Job Server 中。

### 測試

準備好 Client 和 Worker 的程式後，就可以測試看看了。首先我們必須得先執行 worker.php ，讓它開始服務。

```bash
php worker.php
```

這時我們會看到 worker.php 停駐在螢幕上等待服務。

接著我們開啟另一個 console 視窗來執行 client.php ：

```bash
php client.php
```

會立刻出現以下結果：

```bash
Email sending is done.
Image Resizing is done.
```

而切換到執行 worker.php 的 console 時，就會看到以下執行結果：

```bash
Array
(
    [who_send] => web
    [get_email] => member@example.com
)
Email sending is really done.
Array
(
    [image] => /var/www/pub/image/test.png
)
Image resizing is really done.
```

這表示 Worker 正常地處理 Client 的需求了。

現在試著把 worker.php 停掉 (Ctrl+C) ，然後再執行 client.php ，大家應該會發現 client.php 還是正常地完成它的工作；這是因為 Job Server 幫我們把需求先放在 Queue 裡，等待 Worker 啟動後再處理。

這時可以查看 MySQL 的 gearman 資料庫，在 gearman_queue 資料表中應該就會看到以下結果：

[![Queue 資料表](/resources/gearman/queue_table.png)](/resources/gearman/queue_table.png)

這表示 Job Server 成功地將 Queue 保留在 MySQL 資料表中。

接著再執行 worker.php ，這時 Job Server 會得知 Worker 復活，趕緊將 Queue 裡面屬於該 Worker 應該執行的工作再發送出去以完成作業；而 Worker 完成作業後， Job Server 就會把 Queue 清空了。

是不是很有趣呢？

## 心得

Message Queue 這個架構的應用可以說相當廣泛，尤其在大流量的網站上，我們能透過它來來有效運用分散式的系統架構，以處理更多使用者的需求。

而目前 Gearman 可說是在 PHP 上一個很棒的 Message Queue 支援套件，而且 API 也相當完善；因此如果能善用 Gearman 的話，那麼我們在 PHP 網站的架構上就可以有更大的延展性，也能有更多的可能性。

