## SOLID

```php
class Game
{
    public $game;

    public function __construct(GameInterface $game, Database $database)
    {
        $this->game = $game;
    }

    public function run()
    {
        return $this->game->run();
    }
}

class Mario implements GameInterface
{
    public function run() {
        return 'do something....';
    }
}

(new Game(new Mario, new Database))->run();
```

先用一個最基本的設定，先不管 interface 那些，但現實生活遇到的可能會是，雖然這些遊戲有很多是共同設計調用的內容，但各自遊戲還是很有可能有一些細節會變成自己要開 function 去拿，當然可以寫在 Game.php 一樣透過，但這樣就會變成為了某些 Game 開了特例，如果不想這樣某些特殊功能直接去 call 該 class 的話，那從 Game 注入的東西就沒辦法用，可能會變成像這樣

```
class GT implements GameInterface
{
    public function run() {
        return 'do something....';
    }

    public function doSomethingNeedConnect(Database $database)
    {

    }
}

$game = new GT;
$game->doSomethingNeedConnect(new Database);
```

會是這樣嗎，還是如果其實每個 Game 雖然有部分的東西是帶參數就可以解決，有一大部分會是各自不同的結果的話不是用這樣的設計，用個 abstract class 來做比較適合？

oomusou [12:38 PM]
純討論，我的想法是，既然實作GameInterface，就不應該在另外開doSomethingNeedConnect()，這樣就違反LSP了

```
inteface GameInterface
{
    public function run();
    public funciton runPlugin();
}

interface INeedConnect
{
    public function doSomethingNeedConnect(Database $database);
}

class NeedConnectPlugin implements INeedConnect
{
    public function doSomethingNeedConnect(Database $database)
    {
       ...
    }
}

class Game
{
    public $game;

    public function __construct(GameInterface $game, Database $database)
    {
        $this->game = $game;
    }

    public function run()
    {
        return $this->game->run();
    }
}

class GT implements GameInterface
{
    protected $plugin;

    public __construct(INeedConnect $plugin)
    {
         $this->plugin = $plugin
    }

    public function run() {
        return 'do something....';
    }

    public runPlugin() {
        $this->plugin->doSomethingNeedConnect();
    }
}

$plugin = new NeedConnectPlugin(new Database);
$game = new GT($plugin);
$game->runPlugin();
```

改用組合的方式覺得如何？

chan15 [1:29 PM]
我的問題是，Game1 在 Game 之下可能衍生了自己的三個 method 要用，Game2 可能是四個之類的，該怎麼設計才好，而且這樣的寫法在透過 Game 獨立調用 GT 時也會出問題
再來是 interface 只是強制該 class 「要有」其 method，並不是要求該 class 「只有」其 method

oomusou [1:31 PM]
我是覺得覺得LSP要求我們’只有`
一加method, LSP就破壞了

chan15 [1:32 PM]
LSP  是 Liskov，不是在談替換原則嗎？

extends 大 class 就可以用別名一樣注入 class 的原則

還是說這個設計原則套用的 interface 就是不能有 interface 以外其他的 method 的話，我這樣用 abstract  去叫比較好，不透過 (new Game(new Mario))->method()

會變成

oomusou [1:56 PM]
我可能是錯的，聽聽看鐵哥怎麼講

oomusou [1:57 PM]
這是個好問題，其實我也困擾很久

chan15 [2:02 PM]
我一直不得其門而入 XD

```
abstract class Common
{
    abstract function getInfo();

    public function commonMethod()
    {
        return 'This is common method and also need '.$this->db->connected();
    }
}

class Game1 extends Common
{
    public $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function getInfo()
    {
        return 'Get info from game1';
    }
}

class Game2 extends Common
{
    public $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function getInfo()
    {
        return 'Get info from game2';
    }

    public function myMethod()
    {
        return 'This method only for game2 and need '.$this->db->connected();
    }
}

class Database
{
    public function connected()
    {
        return 'connect to server';
    }
}

$database = new Database();
$game1 = new Game1($database);
echo $game1->getInfo().'<br>';
echo $game1->commonMethod().'<br>';

$game2 = new Game2($database);
echo $game2->getInfo().'<br>';
echo $game2->myMethod().'<br>';
```

這樣好像彈性最大

也可以反過來就是

```
<?php

trait GameCommon
{
    public function commonMethod()
    {
        return 'This is common method and also need '.$this->db->connected();
    }
}

interface GameInterface
{
    public function getInfo();
}

class Game1 implements GameInterface
{
    use GameCommon;

    public $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function getInfo()
    {
        return 'Get info from game1';
    }
}

class Game2 implements GameInterface
{
    public $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function getInfo()
    {
        return 'Get info from game2';
    }

    public function myMethod()
    {
        return 'This method only for game2 and need '.$this->db->connected();
    }
}

class Database
{
    public function connected()
    {
        return 'connect to server';
    }
}

$database = new Database();
$game1 = new Game1($database);
echo $game1->getInfo().'<br>';
echo $game1->commonMethod().'<br>';

$game2 = new Game2($database);
echo $game2->getInfo().'<br>';
echo $game2->myMethod().'<br>';
```

chan15 [2:08 PM]
不過 trait 5.4 才能用，公司有些 server 還在 5.3，慢慢革命

chan15 [2:08 PM]
不過我希望可以學到 SOLID 真髓..