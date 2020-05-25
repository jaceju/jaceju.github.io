title: 來試試 Composer Git Hooks 吧
tags:
- PHP
- Git
---

每次幫同事 review PHP 專案時，最常遇到的問題就是程式的 coding style 沒有照規則走。原因是他們不太習慣用 IDE (例如 [PhpStorm](https://www.jetbrains.com/phpstorm/) ) 或其他外部工具 (例如 [php-cs-fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) ) 來輔助調整 coding style ，結果只能在 code review 時用人工來檢查了。

<!--more-->

理想上我們應該要在把程式碼推給同事前先把 coding style 修好以避免同事在 code review 時的負擔；只是該怎麼把這件事自動化呢？這時候就該 [Git Hooks](https://git-scm.com/book/zh-tw/v1/Git-%E5%AE%A2%E8%A3%BD%E5%8C%96-Git-Hooks) 出場了。 Git Hooks 簡單來說就是協助我們在執行某些 git 指令的前後觸發一些腳本命令，這樣就可以自動化地執行某些應該跟著 git 指令走的動作，詳情可以參考官方文件。

Git Hooks 的指令是放在專案目錄的 `.git/hooks` 這個路徑下，當執行完 `git init` 後，在這個路徑下就會有多個可以參考的 `*.example` 範例；隨意開啟一個範例，你可以發現它們都是 shell script 。所以只要將 `.example` 這個副檔名去掉，然後修改裡面的 script 內容，就可以讓 hook 工作了。至於 hook script 該怎麼寫，這裡就不討論了，請大家自行參考官方文件。

Git Hooks 有個很大的問題就是它不會跟著 git repo 走，當我們寫好 hook scripts 後，它們其實僅存在你的本地端，你無法讓它們跟著專案的 repo 散佈給其他開發者。

，我們要想辦法讓每個開發者在下載專案後