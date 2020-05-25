title: 探索 Laravel 的 50 個開發技巧
date: 2015-11-23 17:48:24
tags:
---

因為看到這篇 [50 Laravel Tricks in 50 Minutes](https://speakerdeck.com/willroth/50-laravel-tricks-in-50-minutes) ，覺得滿有趣的。可是只有程式碼，所以我就試著自己重新解讀一次。

註：範例我會用 Laravel 5.1 的規範重新改寫。

<!-- more -->

## Eloquent



### 技巧 1 - Automatic Model Validation

這個技巧很簡單，就是在存檔時，利用 `Model::saving` 方法的 callback 來自動做驗證。

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    public static $autoValidate = true;

    protected static $rules = array();

    protected static function boot()
    {
        parent::boot();
        // You can also replace this with static::creating or static::updating
        static::saving(function ($model) {
            if ($model::$autoValidate) {
                return $model->validate();
            }
        });
    }

    public function validate()
    {
    }
}
```

解讀：

當 validate

```
        $validator = Validator::make($this->getAttributes(), static::$rules);
        return $validator->valid();
```