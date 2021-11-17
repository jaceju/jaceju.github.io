---
title: 網站架構與部署策略筆記
date: 2013-03-23T03:26:00+08:00
tags:
  - 'Web 開發'
  - 伺服器安裝與設定
---

這陣子為了公司的網站搞得自己焦頭爛額，其實自己很清楚在系統這個方面的涉獵並不深，但既然接了這個任務就得想辦法做好。

不過也因為不夠熟悉，讓系統出了很多問題。因此公司就請了我的好友 John 和他的師父來給我們一些系統層面的建議。這份筆記是主要是記錄我從他們口中所得到的心得，當然詳細的資訊還是需要花時間去研究與實作。而裡面有一些名詞是我沒有聽過的，所以可能記錯。

以下就是我個人覺得比較關鍵的部份：

<!-- more -->

## Virtual Machine

機器一來時，別急著在上面建立相關的 Web 服務或資料庫系統。

其實一台實體主機上面可以跑多個虛擬機器 (Virtual Machine, VM)  只要視機器等級切出適當的 VM 數量，這樣我們就能有效建立出一個多節點的系統。

另外 VM 也非常容易管理，像是安裝好第一個基本的 VM 系統後就隨時可以複製出新的 VM ，或是在某個 VM 爛掉時刪除它；這樣的方式就可以大大減少部署機器所花費的心力。

剛開始可以先使用 VMware vSphere 的免費版本，它有 Windows 版本的管理 UI 介面。

* [VMware vSphere 5 企業建置教戰手扎](http://www.tenlong.com.tw/items/986868921X?item_id=437567)

## 將 Log 紀錄獨立存放

Log 檔的處理也是一個很大的學問，比較好的方法是建立一台 syslogd 伺服器，然後把 log 都往這邊丟。這台伺服器等級不需要太好，但磁碟空間一定要夠大。

用 syslogd 的一個好處是，它是射後不理的，我們的服務只要向它丟 Log 即可，就算它掛了也不會影響我們的所有服務。

另外可以寫一個 Watch Dog 來分析 Log 中的惡意連結，當出現關鍵字的 Pattern 時，就記錄下這個 IP ，再利用 script 將這個 IP 發送到各節點上，將它擋下！

* [Sending Apache httpd Logs to Syslog](http://www.oreillynet.com/pub/a/sysadmin/2006/10/12/httpd-syslog.html)
* [Syslog-架設 Log 伺服器](http://www.weithenn.org/cgi-bin/wiki.pl?Syslog-%E6%9E%B6%E8%A8%AD_Log_%E4%BC%BA%E6%9C%8D%E5%99%A8)

## 高併發要求

靜態內容網站一定要使用 Reverse Proxy ，它可以提高網站的吞吐量。而網站是動態內容的話，就一定要想辦法讓它分散到各節點上。

而一般大流量網站通常不會有防火牆，而是用機海來應付。因為防火牆在大流量的狀況下，反而容易掛點。

## 系統擴展

服務與資料庫一定要考慮到橫向擴充，在任何時候都可以將一台機器加入或移除，而不影響到整體運作。

以前的架構是一台 Master 對多台 Slave ，而 Master 掛掉後就由所有的 Slave 推舉出新的 Master ，但這樣一來就不知道誰是 Master 了。

改良的做法是環狀結構，讓每一台機器都是下一台機器的 Master ，同時也是上一台機器的 Slave 。這樣如果其中一台掛點，系統就會主動再將這個環重新連結。

## 兩層式的程式部署

程式的部署需要自動化，而兩層式部署是比較簡單的方式，一層為 testing ，一層為 release 。

方法是在版本控制系統裡面將程式分成 testing 及 release 兩個分支， testing 分支是目前最新的程式碼，而 release 分支則是最穩定的程式碼。

在 testing 環境裡的程式碼必須都是可以執行無誤的，不可以有未完成的功能。當 testing 環境做完壓力測試後，管理者就可以程式碼放到 release 分支中。而所有的 production 都會主動查看 release 分支，當有新版本時就會自動更新。

不過兩層式部署還是有風險在，所以通常還會有 release candidate 版本的分支。有些大公司甚至做到了 16 層，也就是說所有的功能都必須經過 16 道檢驗才能上線。

## 壓力測試

利用 Switch 的 port mirroring 功能，將線上流量複製到準備要上線的機器，看它是否能撐住。通常這樣的壓力測試要跑三天至一週，確保系統的穩定性。

甚至也可以再讓多個 port 做 mirroring ，利用兩倍以上的流量來測試。這樣的目的主要是找出該機器的極限，也同時瞭解需要多少機器才能撐住預估的流量。

## 不影響運作的系統更新

系統在更新程式前，會先把自己從 Load Balance 裡移下來，等確定沒問題後自動上線。

在資料庫系統方面，有些 Plugin 可以做到當 Slave 機器加入服務，與 Master 做同步資料的時候，先將自己隱藏起來，等到同步完成後，再讓服務啟動並上線。

## 心得

據 John 的師父說，他們已經做到將這些行為完全自動化，並且只要在 Dashboard 上就可以看到所有服務的狀態；甚至後來還以紅綠燈配合聲音來做警示，聽完後我下巴都掉了。

事實上在人力有限，卻要管理幾十台機器的狀況下，這樣的做法才是身為一個技術人員應該去做的。

再次感謝 John 和他師父，讓我學到不少有關系統管理方面的知識。