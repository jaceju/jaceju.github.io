## Codeception PHPCI 整合注意事項

## 設定

```yaml
class_name: FunctionalTester
modules:
    enabled: [Filesystem, FunctionalHelper, Laravel5, App\Modules\Migration]
    config:
        Laravel5:
            environment_file: .env.testing
```

## 資料庫

1. 在 PHPCI 伺服器上建立 MySQL 伺服器
1. 建立一個資料庫測試帳號

## Migration

## Rollback

## 隔離

