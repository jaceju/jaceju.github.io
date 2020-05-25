---
title: "Laravel 5.1 Events Broadcasting 實務練習"
date: 2015-07-26 00:38:37 +08:00
tags: ["Laravel", "PHP"]
---

Laravel 5.1 提供了一個非常棒的 Events Broadcasting 特色，它能讓開發者建立一個 RealTime Web App 。作者 Taylor 也錄製了一個 Events Broadcasting 的[教學影片](https://laracasts.com/lessons/broadcasting-events-in-laravel-5-1)，讓開發者可以更快瞭解這個新功能。

教學影片中雖然是使用 [Pusher](https://pusher.com/) 服務來做事件推送，不過 Laravel 也可以搭配 [Redis](http://redis.io/) 來做到同樣的事情。考量到未來的系統發展，我打算採用 Redis 來當做事件推送伺服器，所以本文也會在此基礎進行說明。

以下就來介紹如何用 Laravel 的 Events Broadcasting 來實作一個簡單的聊天室。

<!-- more -->

## 原理

簡單說明一下本文的實作原理：

1. 啟動 Redis 伺服器來監聽 Laravel 發送出來的事件。
2. 透過 Node Express 建立一個 Socket.IO Server ，並且接收 Redis Server 推送過來的事件，然後將它廣播到 WebSocket 上。
3. 瀏覽器上建立與 Socket.IO Server 的連結，透過 WebSocket 接收事件來完成即時互動。

## 開發環境

Laravel 官方推薦開發者使用 Homestead ，原因是它已經幫我們安裝好所有 Laravel 需要的執行環境，例如 Redis 與 Node.js 。在繼續下去之前，請先依照[官方說明](http://laravel.com/docs/5.1/homestead) ([中文版](http://laravel.tw/docs/5.1/homestead)) 將 Homestead 安裝好。

然後利用 `homestead edit` 打開 Homestead 的設定檔：

> 註：以下指令中，開頭的 `$ ` 為系統提示符號，不用輸入。

```bash
$ homestead edit
```

確認本機路徑 `~/Projects` 有正確 mount 到 Homestead 的 `/home/vagrant/Projects` 上。

```yaml
folders:
    - map: ~/Projects
      to: /home/vagrant/Projects
```

要連上 Homestead 裡的虛擬站台 (Virtual Host) ，必須要讓本機認得專案對應的 hostname 。所以要編輯本機的 `/etc/hosts` ，加入 IP 與 hostname 的對應：

```text
192.168.10.10 chat-room.app
```

`192.168.10.10` 是在 Homestead.yml 中設定的 IP 。

啟動 Homestead ，並用 ssh 連入 Homestead ：

```bash
$ homestead up
$ homestead ssh
```

檢查 node.js 版本：

```bash
$ node -v
v1.8.1
```

> 註： Homestead 是透過 nvm 安裝 io.js ，所以可以自行升級 io.js 到最新版。

檢查 redis 是否啟動：

```bash
$ redis-cli ping
PONG
```

新增一個虛擬站台：

```bash
$ serve chat-room.app ~/Projects/chat-room/public
```

## 建立應用程式

在 Homestead 中，利用 composer 來下載已經設定好的 Laravel 5.1 Boilerplate ，執行：

```bash
$ cd ~/Projects
$ composer create-project jaceju/b5 chat-room -s dev
```

程式就會開始下載並進行安裝。完成後進入專案資料夾，以便進行後續操作。

```bash
$ cd chat-room
```

### 調整 gulpfile.js

在 Homestead 上開發時，不需要啟動 Web Server ，因此要調整 `gulpfile.js` 。

編輯 `gulpfile.js` ，把 `port` 變數與 `serve` task 移除，並將 `proxy` 改到 `chat-room.app` ，完成後如下：

```js
// ... (略)

elixir(function (mix) {
    mix.clean()
        .sass('*.scss')
        .wiredep()
        .jshint()
        .sync('resources/assets/js/**/*.js', 'public/js');

    if (elixir.config.production) {
        mix.useref({ src: false })
            .version(['js/*.js', 'css/*.css'])
    }
});
```

## 安裝必要套件

Laravel 操作 Redis 是透過 [Predis](https://github.com/nrk/predis) 套件，所以我們要透過 composer 安裝：

```bash
$ composer require predis/predis
```

接下來要透過 Npm 與 Bower 安裝 Socket.IO Server 相關套件，包含前後端：

```bash
$ npm install express ioredis socket.io --save
$ bower install socket.io-client --save
```

## 建立 Socket.IO Server

接下來要利用 Node.js 的 express 和 http 模組建立一個 Web Server ，然後讓 Socket.IO 透過這個 WebServer 來廣播從 Redis 接收到的事件。先建立 `socket.js` ，內容為：

```js
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Redis = require('ioredis');
var redis = new Redis();

// Redis 訂閱 `chat-channel` 頻道
redis.subscribe('chat-channel', function (err, count) {
});

// 當 Redis 有事件發生時，透過 Socket.IO Server 發送事件
redis.on('message', function (channel, message) {
    message = JSON.parse(message);
    io.emit(channel + ':' + message.event, message.data);
});

// 讓用戶端可以透過 Port 3000 連接 Socket.IO Server
http.listen(3000, function () {
    console.log('Listening on Port 3000');
});
```

然後在 Homestead 上啟動 Socket.IO Server ：

```bash
$ node socket.js &
Listening on Port 3000
```

## 修改設定

Laravel 5.1 預設是使用 Pusher 做為事件推送伺服器，可以在 `config/broadcasting.php` 裡看到這個設定：

```php
'default' => env('BROADCAST_DRIVER', 'pusher'),
```

因為這裡使用了 `env` 函式，所以我們可以編輯 `.env` ，加入以下設定來改用 Redis 伺服器：

```ini
BROADCAST_DRIVER=redis
```

## 建立 Event 類別

接下來就要讓 Laravel 能夠發送事件了，在 Laravel 5.0 以後的版本提供了 `make:event` 這個指令可以協助我們建立 Event 類別。首先我們的聊天室需要一個「訊息被建立」的事件，所以執行：

```bash
$ php artisan make:event MessageCreated
```

這樣就會建立 `app/Events/MessageCreated.php` 。

接著我們要讓 `MessageCreated` 類別能夠被 Redis 推送，所以編輯 `app/Events/MessageCreated.php` ，讓它實作 `Illuminate\Contracts\Broadcasting\ShouldBroadcast` 介面。

```php
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class MessageCreated extends Event implements ShouldBroadcast
```

在推送事件時，我們可以附帶一組要傳送的資料，稱為 payload 。通常我們會在 Event 類別的建構子中帶入 payload 。修改 `MessageCreated` 類別，加入 `$username` 與 `$message` 屬性，並在建構子中注入：

```php
    private $username;

    private $message;

    public function __construct($username, $message)
    {
        $this->username = $username;
        $this->message = $message;
    }
```

接著我們要讓它能在推送事件時，把這兩個屬性一起傳送出去；主要是透過 `broadcastWith` 這個方法：

```php
    public function broadcastWith()
    {
        return [
            'username' => $this->username,
            'message' => $this->message,
        ];
    }
```

最後我們需要一個頻道來廣播事件，這是因為要讓 Redis 可以識別要廣播的對象。我們可以在 `broadcastOn` 方法回傳 Redis 訂閱的頻道名稱，即為前面指定的 `chat-channel` ：

```php
    public function broadcastOn()
    {
        return ['chat-channel'];
    }
```

> 註：一個事件可以廣播給數個頻道，所以這裡要回傳一個陣列。

完成後的程式碼如下：

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class MessageCreated extends Event implements ShouldBroadcast
{
    use SerializesModels;

    private $username;

    private $message;

    public function __construct($username, $message)
    {
        $this->username = $username;
        $this->message = $message;
    }

    public function broadcastWith()
    {
        return [
            'username' => $this->username,
            'message' => $this->message,
        ];
    }

    public function broadcastOn()
    {
        return ['chat-channel'];
    }
}
```

## 建立 Routes 與 Controller

這裡我們只需要兩個 route ：聊天室頁面，以及發送訊息。改寫 `app/Http/routes.php` ，內容如下：

```php
<?php
get('/', 'ChatController@index'); // 聊天室頁面
post('send-message', 'ChatController@sendMessage'); // 發送訊息
```

然後要建立 `ChatController` 來處理程式流程，在 Terminal 中執行：

```bash
$ php artisan make:controller ChatController --plain
```

編輯新建立的 `app/Http/Controllers/ChatController.php` ，先加入 `index` 方法：

```php
    public function index()
    {
        srand(time()); // 亂數種子
        $username = sprintf('user%06d', rand(1, 100000)); // 決定 user 名稱 (註)
        return view('chat', compact('username'));
    }
```

在 `index` 方法中，主要是產生一個隨機的使用者名稱，並顯示在首頁樣版裡。

> 註：這裡產生 `username` 的方法並不嚴謹，沒有考慮到名稱重複的問題，但現階段先暫時這樣。

接下來我們要接收使用者建立的訊息，然後發送一個「訊息被建立」的事件，所以新增 `sendMessage` 方法，內容為：

```php
    public function sendMessage(Request $request)
    {
        $username = $request->get('username');
        $message = $request->get('message');
        event(new MessageCreated($username, $message));
        return 'message sent';
    }
```

## 建立樣版頁面

切換到前端開發模式，我們要修改一下介面的呈現。

先處理 HTML 的部份，將原來的 `resources/views/welcome.blade.php` 重新命名為 `resources/views/chat.blade.php` ，將 `div.container` 的內容修改如下：

```html
<div class="container">
    <div class="row">
        <div class="col-md-6 col-md-offset-3">
            <h1>Chat Room Demo</h1>

            <!-- 訊息列表框 -->
            <div id="chat-room">

            </div>

            <!-- 輸入訊息的表單 -->
            <form id="send-message" method="post" action="/send-message">
                {!! csrf_field() !!}
                <input type="hidden" name="username" value="{{ $username }}" />
                <div class="input-group">
                    <label class="input-group-addon">{{ $username }}</label>
                    <input id="message" type="text" value="" class="form-control" />
                    <span class="input-group-btn">
                        <button class="btn btn-success" id="send">Send</button>
                    </span>
                </div>
            </form>
        </div>
    </div>
</div>
```

這樣會讓畫面上有一個訊息列表框以及一個輸入訊息的表單，如下圖所示。

![介面](/resources/chat-room-demo/interface.png)

接下來稍微調整介面的樣式，編輯 `resources/assets/sass/app.scss` ，將內容修改如下：

```scss
@import "../../../public/bower_components/bootstrap-sass/assets/stylesheets/bootstrap";

html, body {
  height: 100%;
}

// 訊息列表框
#chat-room {
  border: 1px solid #ccc;
  height: 20rem;
  padding: 1rem;
  overflow-x: hidden;
  overflow-y: auto;

  // 單則訊息
  .message {
    padding: 1rem;
    margin-bottom: 1rem;
  }
}

// 輸入訊息的表單
#send-message {
  margin-top: -1px;

  .input-group-addon {
    border-top-left-radius: 0;
  }

  .input-group-btn > .btn {
    border-top-right-radius: 0;
  }
}
```

最後透過 JavaScript 讓所有東西串在一起，

編輯 `resources/assets/js/app.js` ，內容如下：

```js
'use strict';
var $chatRoom = $('#chat-room');
var $sendMessage = $('#send-message');
var $messageInput = $sendMessage.find('input[name=message]');
var io = window.io;
var socket = io('http://chat-room.app:3000');

// 當送出表單時，改用 Ajax 傳送，並清空輸入框。
$sendMessage.on('submit', function () {
    $.post(this.action, $sendMessage.serialize());
    $messageInput.val('');
    return false;
});

// 當接收到訊息建立的事件時，將接收到的 payload
socket.on('chat-channel:App\\Events\\MessageCreated', function (payload) {

    var html = '<div class="message alert-info" style="display: none;">';
    html += payload.username + ': ';
    html += payload.message;
    html += '</div>';

    var $message = $(html);
    $chatRoom.append($message);
    $message.fadeIn('fast');
    $chatRoom.animate({scrollTop: $chatRoom[0].scrollHeight}, 1000);
});
```

## 執行測試

在 Homestead 上執行：

```bash
$ gulp
```

然後在本機分別開啟兩個瀏覽器視窗瀏覽 `http://chat-room.app` ，然後在輸出框上輸入文字後按 `Send` ，應該就會讓兩個瀏覽器同時出現相同的文字。

![展示](/resources/chat-room-demo/in-use.png)

完成的範例可以在我的 [GitHub](https://github.com/jaceju/example-laravel-chat-room) 上找到。

## 結論

這個 Demo 如果真的要在實務上使用，還有很多地方要考慮，例如訊息歷史、使用者登入等等。不過這已經足夠讓我們瞭解 Laravel 5.1 在實作 Broadcasting 時有多麼輕鬆，使得我們更容易在專案前期就先實現很多想法。

希望這個簡單的教學，能對大家使用 Laravel 來開發即時系統時有所幫助。

## 參考

* [Step by Step Guide to Installing Socket.io and Broadcasting Events with Laravel 5.1 ](https://laracasts.com/discuss/channels/general-discussion/step-by-step-guide-to-installing-socketio-and-broadcasting-events-with-laravel-51)