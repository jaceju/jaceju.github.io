---
layout: post
title: "PHP + MongoDB 設定心得"
date: 2013-04-26 02:50
comments: true
tags: ["PHP","MongoDB"]
---

這陣子被 MongoDB 的低效與不穩定性搞得焦頭爛額，但查了很多文件與資訊，都發現 MongoDB 的表現不應該如此不堪。而且查看系統的運作狀況，其實 CPU 連 30% 都沒跑到。為什麼會這樣呢？

而最常發生的問題就是大量寫入時，總是會出現 `No candidate servers found` 的訊息，然後程式就中斷了。幾經檢查，才發現是舊的第三方 mongodb library 寫法不能跟新的 PHP Mongo Native Driver 匹配。

以下就把我的設定心得記下來，供大家參考。

<!-- more -->

## 設定注意事項

使用 PHP Mongo Native Driver 來存取 MongoDB Replica Set 架構時，最基本的部份有以下幾點要注意：

* [PHP MongoDB Native Driver](http://www.php.net/manual/en/book.mongo.php) 要升級到 1.3.4 以上版本。 ( `pecl upgrade mongo` )
* 程式裡要用 [MongoClient](http://www.php.net/manual/en/mongoclient.construct.php) 類別來連接，而不要用舊版的 MongoDB ， [MongoDB](http://www.php.net/manual/en/class.mongodb.php) 在新版本裡已經是不同的用途了。
* 不要用 hostname 來存取 (像是 `localhost` ) ，要直接給 `IP:PORT` 位址。
* 在 [MongoClient](http://www.php.net/manual/en/mongoclient.construct.php) 的 `server` 參數，要把所有可以連結到的 Secondary `IP:PORT` 都設定上去。
* 雖然手冊上沒寫，但 [MongoClient](http://www.php.net/manual/en/mongoclient.construct.php) 的 `options` 參數裡， `slaveOkay` 一定要設定為 `true` 。而原來的 `MongoDB::setSlaveOkay()` 方法已經被廢棄了，不建議再用。
* `readPreference` 要設定為 `MongoClient::RP_SECONDARY_PREFERRED` 。
* 檢查程式中所用的 MongoDB library 是不是符合以上的設定。有些 library 是採用舊版的 mongo driver 寫法，效能會大打折扣。

其他有關效能的部份，像是 Collection 的 Indexes ，都可以參考[線上手冊](http://docs.mongodb.org/manual/)的說明。

## 範例

```php
$hosts = implode(',', [
    '127.0.0.1:27017',
    '127.0.0.1:27018',
    '127.0.0.1:27019',
]);
$m = new MongoClient('mongodb://' . $hosts, [
    'replicaSet'     => 'rsname',
    'slaveOkay'      => true,
    'readPreference' => MongoClient::RP_SECONDARY_PREFERRED,
]);
$db = $m->selectDB("dbname");
```

當然這些可能還是有不足的地方，也歡迎大家能分享自己的設定心得。