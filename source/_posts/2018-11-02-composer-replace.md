title: 理解 composer.json 的 replace
date: 2018-11-02 12:30:00
tags: ["PHP"]
---

通常你在 composer.json 裡很少會用到 `replace` 這個 schema 屬性 ，不過在以下情境它就很有用了。

例如你正在開發一個專案 (也就是在 `composer.json` 中的 `type` 為 `project` ) ，它相依 `original/library` 這個套件以及 `other/package` 這個套件。很巧的是， `other/package` 這個套件也相依了 `original/library` 這個套件。

![](/resources/composer-replace/original-library.png)

假設現在你覺得 `orginal/library` 這個可能已經太老舊，但維護者又不想讓你更動它，所以你決定把它 fork 出來改成一個相容但是功能更強大的 `better/library` ，並且把它標上新版號釋出。

現在回到你的專案，將原來的 `original/library` 改成 `better/library` ，並希望一切正常；只是 `other/package` 還相依在 `original/library` ，使得它跟你的 `better/library` 有衝突。那麼該怎麼讓 `other/package` 也改用 `better/library` 呢？我們可不打算再 fork 一份 `other/package` ！

這時候就是 `replace` 出場的時機了。

<!--more-->

`replace` 的用法很簡單，你可以在 `better/library` 的 `composer.json` 裡加入這個設定：

```
"replace": {
    "original/library":"1.*"
}
```

這麼一來 composer 就會在安裝 `other/package` 時，自動把有用到 `original/library` 全換成 `better/library` 了。

![](/resources/composer-replace/better-library.png)

另外 `replace` 也常用在主套件包含多個子套件的用途，因為通常安裝主套件時就會涵蓋所有子套件的功能；例如 `laravel/framework` 就是這樣的用法，你會看到它的 `composer.json` 包含了這段：

```
"replace": {
    "illuminate/auth": "self.version",
    "illuminate/broadcasting": "self.version",
    ...
    "illuminate/view": "self.version",
    "tightenco/collect": "self.version"
},
```

跟前面一樣的邏輯，假設你的專案相依了 `laravel/framework` ，而另一個相依的套件用到了 `illuminate/auth` 的話，那麼它就會以 `laravel/framework` 的版本為主，而不會重複再載入 `illuminate/auth` 。而其中 `self.version` 就是指向主套件目前的版本。

內容來源參考： [How does the “replace” property work with composer?](http://stackoverflow.com/questions/18882201/how-does-the-replace-property-work-with-composer/18905069#18905069)

