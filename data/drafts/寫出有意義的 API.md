# 寫出有意義的 API

看到這篇[討論用布林型態來當方法參數](https://twitter.com/reinink/status/660411914552496128)的 tweet 滿有趣的，我也來寫寫我的想法。

<!-- more -->

原作者舉了以下的例子：

```php
// 不好的例子
$user->getFriends(true);

// 改成有語意化的例子
$user->getBestFriends();

// 不好的例子
$user->getFriends(true, true);

// 改成有語意化的例子
$user->getBestFriendsWhoAreOnline();
```

可以看到 Jonathan Reinink 喜歡有語意化的方法名稱，而這也是 clear code 的經典用法。

但 Giuseppe Mazzapica 覺得這個寫法沒有可擴充性，因為一旦條件式越多，方法名稱就可能會越長。所以將這個例子改成這個寫法：

http://pastebin.com/vP9dJrLs

```php
$user = new UserRepositoryInterface( DbDriverFactory::getInstance() );

$user->getFriends( new BestFriendCondition() );

$user->getFriends( new OnlineCondition() );

$user->getFriends( new CompositeCondition( [ new BestFriendCondion(), new OnlineCondition() ] ) );
```

Jonathan Reinink 則是認為過度設計了，事實上也是如此。

我個人是認為兩邊的觀念都正確，但作法可以修正。

另外有一派的人認為會有這個問題的原因，就在於 PHP 沒有 named parameter 。不過我認為其實不見得一定要用 named parameter 才能解決問題，以下我提出我的做法：

```php
$user->friends()->whoAreBest()->andOnline()->get();
```

做法如下：

```php
class Query
{
    protected $conditions = [];

    public function __construct($target);

    public function __call($name, $params)
    {

    }
}
```