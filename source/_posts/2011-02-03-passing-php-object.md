---
layout: post
title: '[PHP] 簡易的物件傳遞方法'
date: 2011-2-3
wordpress_id: 1592
comments: true
tags: ["PHP"]
---

在 PHP 中，傳遞物件是很容易的事；我們只需要將物件的狀態封裝起來後，以字串的方式傳遞給另一端的程式還原執行即可。物件的傳遞用途很多，例如我們在 Gearman 中，就可以在 client 把物件當做是 job data 傳遞給 Server 。

註： Gearman 的介紹可以參考拙作：[Gearman 心得](http://www.jaceju.net/blog/archives/1211)。

以下我們來看看範例。

<!--more-->

假設我們有個 `Event` 類別：

```php
<?php
class Event
{
    protected $_name = null;
    public function __construct($name)
    {
        $this->_name = (string) $name;
    }
    public function getName()
    {
        return $this->_name;
    }
}
```

然後在 `client.php` 中我們建立了一個 `Event` 物件 `$event` ：

```php
<?php
require_once 'Event.php';
$event = new Event('test');
file_put_contents('event.txt', serialize($event));
```

在這邊我們把 `$event` 實體用 `serialize` 這個方法序列化，這樣就能把 `$event` 實體的狀態封裝起來了。

最後我們在 `server.php` 中還原它：

```php
<?php
require_once 'Event.php';

if (!file_exists('event.txt')) {
    exit;
}

$event = unserialize(file_get_contents('event.txt'));
echo $event->getName();
```

要注意的是，我們必須把 `Event` 類別的宣告也包含進來，這樣 `unserialize` 才能正確還原物件。而還原後的 `$event` 實體，就跟我們在 `client.php` 建立的 `$event` 實體的狀態是一模一樣的了。

當然如果物件裡有些狀態是我們所不想傳遞出去時，這時候可以在類別裡定義 `__sleep` 這個魔術方法來回傳我們想要保留的屬性，而 `__wakeup` 方法則可以協助我們在 `unserialize` 後，執行一些初始化的方法；詳細的說明可以參考官方手冊裡 [Magic Method](http://www.php.net/manual/en/language.oop5.magic.php) 一節。
