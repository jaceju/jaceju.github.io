---
title: "用 mitmproxy 查看 iOS 的網路連線"
date: 2020-09-10T11:39:59+08:00
draft: true
toc: false
images:
tags:
  - Web
---

因為遇到 iOS App 所串接的後端 API 給出原因不明的錯誤，而同事行雲流水般地利用工具一下子就找到問題點，所以就有了這篇文章。

<!--more-->

事情的經過是這樣的，有某個用戶回報了一個 bug ，是他在 iOS App 上修改個人資料時，發生了 API 錯誤。

```bash
$ brew install mitmproxy
```

```
$ mitmweb
```

設定 iOS 的 Proxy ：

1. 首先按住 Mac 鍵盤上的 `option` 鍵，然後用滑鼠點一下螢幕畫面上方選單的網路連線圖示，這時候就會出現「 IP 位址」，這個就是我們的代理伺服器 IP ，將它記下來。
1. 回到手機，打開 iOS 的設定，選擇 `WiFi`，然後點開目前連線名稱後面的資訊圖示，以開啟它的設定頁。
1. 在目前連線的設定頁裡，往下找到「設定代理伺服器」，然後點進去。
1. 選擇「手動」後，「伺服器」填上步驟 1 得到的 IP ，「連接埠」填上 `8080` 後，按下「儲存」。

接下來為了能解開 SSL ，我們需要在 iOS 安裝 mitmproxy 的憑證，步驟如下：

1. 在連上代理伺服器的狀態下，用 Safari 開啟這個網址： https://mitm.it/ ，並下載 Apple 用的描述檔。
1. 開啟「設定 > 一般 > 描述檔」，選擇「 mitmproxy 」，按下「安裝」並依指示安裝描述檔。出現「已驗證」即安裝完成。
1. 回到「一般」的設定頁，選擇「關於本機 > 憑證信任設定」，打開「 mitmproxy 」。

而 Mac 安裝憑證的步驟如下：

不需要到 httsp://mitm.it ，直接在 Terminal 中輸入：

```
$ open ~/.mitmporxy/mitmproxy-ca-cert.pem
```

然後將 `mitmproxy` 這個設為「永遠信任」即可。

## 參考

- [中間人攻擊（爬蟲工具）mitmproxy 使用指南](https://codertw.com/%E7%A8%8B%E5%BC%8F%E8%AA%9E%E8%A8%80/726957/)
- [mitmweb 的使用](https://www.cnblogs.com/shenhf/p/9783174.html)