---
title: '邁向 PHP 重構之路 - 以 Laravel 程式碼片段為例'
date: 2015-10-05T12:53:48+08:00
tags:
  - Refactoring
  - Laravel
---

來上 TDD 課的學員問到一個 Laravel 程式碼重構的問題，這裡簡單地做分享。未來如果有好的實戰範例，這系列就會延續下去。

<!-- more -->

## 開始重構

當然重構前，我們必須先有測試做保障。在每個步驟完成後，我們都應該確保修改後的程式碼能通過測試的驗證。

接下來開始重構，這是原本的程式碼：

```php
// Step 0
if ($errorRedirectViewType == 'create') {
    return Redirect::route(self::__module . '.' . self::__function . '.' . $errorRedirectViewType)
        ->with('message', '一樣的 message')
        ->withInput($allInput);
} else {
    return Redirect::route(self::__module . '.' . self::__function . '.' . $errorRedirectViewType, ['id' => $allInput['id']])
        ->with('message', '一樣的 message')
        ->withInput($allInput);
}
```

第一步我們引入一個 `$redirect` 變數：

```php
// Step 1
$redirect = null;
if ($errorRedirectViewType == 'create') {
    $redirect = Redirect::route(self::__module . '.' . self::__function . '.' . $errorRedirectViewType)
        ->with('message', '一樣的 message')
        ->withInput($allInput);
} else {
    $redirect = Redirect::route(self::__module . '.' . self::__function . '.' . $errorRedirectViewType, ['id' => $allInput['id']])
        ->with('message', '一樣的 message')
        ->withInput($allInput);
}
return $redirect;
```

第二步我們把共用的部份移出 `if...else` 外：

```php
// Step 2
$redirect = null;
if ($errorRedirectViewType == 'create') {
    $redirect = Redirect::route(self::__module . '.' . self::__function . '.' . $errorRedirectViewType);
} else {
    $redirect = Redirect::route(self::__module . '.' . self::__function . '.' . $errorRedirectViewType, ['id' => $allInput['id']]);
}
return $redirect
        ->with('message', '一樣的 message')
        ->withInput($allInput);
```

第三步把 `if...else` 提煉成 `redirectByViewType` 方法：

```php
// Step 3
// Extracted method
protected function redirectByViewType($errorRedirectViewType, $id)
{
    $redirect = null;
    if ($errorRedirectViewType == 'create') {
        $redirect = Redirect::route(self::__module . '.' . self::__function . '.' . $errorRedirectViewType);
    } else {
        $redirect = Redirect::route(self::__module . '.' . self::__function . '.' . $errorRedirectViewType, ['id' => $id]);
    }
    return $redirect;
}
```

然後改用新的 `redirectByViewType` 方法：

```php
// Step 3
$redirect = $this->redirectByViewType($errorRedirectViewType, $allInput['id']);

return $redirect
        ->with('message', '一樣的 message')
        ->withInput($allInput);
```

至於第二步到第三步要不要做，就看我們有沒有 reuse 這段邏輯的需求；但一般我會做，因為程式碼看起來好讀，後面也可以再做其他重構。

第四步就可以把原來的 `$redirect` 拿掉，因為不需要了。

```php
// Step 4
return $this->redirectByViewType($errorRedirectViewType, $allInput['id'])
        ->with('message', '一樣的 message')
        ->withInput($allInput);
```

這種先引入一個臨時變數讓重構好進行的方式，是很常見的。而什麼時候應該需要使用這個技巧？這就要多累積經驗。通常你可以想像一下重構後的程式碼，大致與重構前會有什麼樣的差異，再判斷是否需要引用一個臨時變數。

第五步，我們把 `redirectByViewType` 重複的程式碼再引用一個解釋用的變數 `$routeName` ：

```php
// Step 5
protected function redirectByViewType($errorRedirectViewType, $id)
{
    $redirect = null;
    $routeName = self::__module . '.' .
               self::__function . '.' .
               $errorRedirectViewType;

    if ($errorRedirectViewType == 'create') {
        $redirect = Redirect::route($routeName);
    } else {
        $redirect = Redirect::route($routeName, ['id' => $id]);
    }
    return $redirect;
}
```

這樣程式碼就更容易被理解了。

## 後記

希望這個小例子可以讓大家瞭解到，實戰中的重構其實是很簡單的。它就是在不更改原有邏輯的狀態下，一步一步讓你的程式碼變得更易讀也更易維護。

當初因為是臨時示範給學員看，所以並沒有特別加上測試，也沒有用 PhpStorm 來協助重構；結果後來我發現在 extract method 時，忘了把 `$allInput['id']` 帶到 `redirectByViewType` 裡面。

這就是一種工程師很容易忽略的盲點，就是太容易相信自己的想法，而不是真正去驗證它。在沒有測試和工具的輔助下，千萬要特別小心這種小錯誤。