title: Laravel 執行測試時出現 Function name must be a string
tags:
  - Laravel
  - 測試
date: 2019-01-28 12:26:42
---


在 Laravel 撰寫單元測試有用到 `@dataProvider` ，執行測試時卻出現 `Function name must be a string` 的錯誤。

這是因為所有的 Data Provider 會比 `setUp` 更早被執行，所以不能在 Data Provider 裡用任何在 `setUp` 後才會有的東西，例如 `$this->app` 或 helper function ，因為這時候它們還沒有被初始化或被 autoload 載入。
