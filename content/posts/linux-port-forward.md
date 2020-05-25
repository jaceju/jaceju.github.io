---
title: 'Linux 上的 Port Foward 的問題'
date: 2007-09-13T00:00:00+08:00
tags:
  - Linux
---

## 問題

Mark 和我兩個人在研究怎麼把對外的 Port 9000 轉移到內部的 Port 80 ，結果我這個 Linux 新手搞了半天還是搞不出來。

## 環境

我的環境是這樣的：

```
           |-- (DMZ) --> Linux Server 1(192.168.1.1)
IP 分享器 -|
           |-----------> Linux Server 2(192.168.1.2)

```

註：之前示意圖畫錯了，更正一下。

然後從外面來的 Port 9000 要 Forward 到 Linux Server 2 的 Port 80 。

<!-- more -->

## 嘗試

我們用的 IP 分享器僅支援單一 Port 對應的功能 (就是 Port 80 就只能對到 Port 80) ，所以只好把腦筋動到 Linux Server 1 上。

本來以為用 iptables 的 NAT 功能可以用，看了一下[鳥哥的 iptables 教學](http://linux.vbird.org/linux_server/0250simple_firewall.php)，得到以下的方式：

```bash
# iptables -t nat -A PREROUTING -p tcp -i eth0 --dport 9000 -j DNAT --to 192.168.1.2:80
```

不過加入去以後還是不行...後來 Mark 又找到一篇 [iptables 入門](http://linux.tnc.edu.tw/techdoc/firewall/iptables-intro.html)，裡面寫了：

```bash
# iptables -t nat -A PREROUTING -i eth0 -p tcp -d 192.168.1.1 --dport 9000 -j DNAT --to-destination 192.168.1.2:80
```

也是沒用...真是令人洩氣...

## 解決方案

後來我問我的同學 (他是個 FreeBSD 強者) ，他給我一個連結： [[Linux] 簡單的 port forward 工具](http://antontw.blogspot.com/2007/05/linux-port-forward.html)，裡面介紹了 [redir](http://www.linux.org/apps/AppId_865.html) 這個小程式，似乎符合我的要求。

然而我用的 OS 是 CentOS ，要自己編譯 redir ；把 redir 的 source 抓下來後，按照以下方式編譯：

```bash
# cd /usr/local/src
# wget http://sammy.net/~sammy/hacks/redir-2.2.1.tar.gz
# tar xvzf redir-2.2.1.tar.gz
# cd redir-2.2.1
# make (沒有 install)
# mv redir /usr/local/bin/
```

接下來我下的指令是這樣子的：

```bash
# redir --lport 9000 --caddr=192.168.1.2 --cport=80
```

不過還是沒用，而且就 redir 就沒有回應了，因為 redir 主要是跑 Daemon 模式。我想如果加上 Listen 的 Address 應該就可以，所以我把指令改成：

```bash
# redir --laddr 192.168.1.1  --lport 9000 --caddr=192.168.1.2 --cport=80 &amp;
```

沒想到就成功了！讓 Mark 和我著實感動了一陣子。

最後把它加到 `/etc/rc.d/rc.local` 裡，讓它能在開機時自動執行就完成了。

## 後記

雖然我有在玩 Linux ，不過很多技術還是不熟，這次 Mark 出的問題真的讓我學到了不少東西。也感謝我的強者同學，他在 Unix like 方面的知識真的幫了我不少忙。

另外， redir 真的是不錯的小工具，如果要完全靠 iptables 來處理這個問題的話，我這個新手大概弄個三天三夜也搞不定...Orz

當然，如果大家有更好的方法的話，也歡迎分享喔。
