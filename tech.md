# 技術選定・実装方針

## 選定方針

### 要件・制約
- **目標規模：** 月4件の問い合わせ（年48件）
- **サーバー：** さくらの共用サーバー（スタンダード/プレミアムプラン）
- **デプロイ：** FTP経由
- **運用工数：** 最小限（月1-2時間）
- **更新頻度：** 低頻度
- **重視ポイント：** 高速表示、営業後確認用

### 段階的導入戦略

#### Phase 1: シンプルスタート（初期リリース）
- 素早くローンチ（2-3週間）
- 最小限の運用負荷
- 基本的なデータ収集
- 必要十分な機能

#### Phase 2: データ分析強化（3-6ヶ月後）
- 詳細分析ツール追加
- ヒートマップ導入
- フォーム最適化

#### Phase 3: 本格最適化（1年後・事業拡大時）
- 複数LP作成
- A/Bテスト本格運用
- マーケティングオートメーション

---

## Phase 1 技術スタック

### フロントエンド
**HTML5 + Tailwind CSS + バニラJavaScript**

#### HTML5
- セマンティックマークアップ
- レスポンシブデザイン対応
- SEO最適化（meta tags, structured data）

#### Tailwind CSS
```bash
# CDN利用またはビルド版
npm install tailwindcss
```
- ユーティリティファースト
- 軽量（使用分のみ）
- レスポンシブ対応
- カスタマイズ容易

#### バニラJavaScript
- 問い合わせフォームバリデーション
- スムーススクロール
- 軽量アニメーション（Intersection Observer）
- Google Analytics 4 連携

### バックエンド
**PHP（さくらサーバー標準）**

#### 問い合わせフォーム処理（セキュリティ強化版）
```php
<?php
// contact_secure.php - セキュリティ強化版

session_start();

// CSRF対策
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$errors = [];
$success = false;

if ($_POST) {
    // CSRF トークン検証
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) {
        die('不正なリクエストです');
    }
    
    // レート制限（セッションベース）
    if (isset($_SESSION['last_submit']) && 
        time() - $_SESSION['last_submit'] < 60) {
        $errors[] = '送信間隔が短すぎます。1分後に再試行してください';
    }
    
    // 入力値検証・サニタイズ
    $company = htmlspecialchars(trim($_POST['company'] ?? ''), ENT_QUOTES, 'UTF-8');
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $message = htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES, 'UTF-8');
    
    // バリデーション
    if (empty($company)) $errors[] = '会社名は必須です';
    if (!$email) $errors[] = '有効なメールアドレスを入力してください';
    if (empty($message)) $errors[] = 'お問い合わせ内容は必須です';
    
    // ハニーポット（スパム対策）
    if (!empty($_POST['website'])) exit; // 人間には見えないフィールド
    
    // 送信処理
    if (empty($errors)) {
        $_SESSION['last_submit'] = time();
        
        // メール送信（管理者宛）
        $to = 'admin@kakusan.co.jp,futagami@kakusan.co.jp';
        $subject = '問い合わせ: ' . $company;
        $mail_body = "会社名: {$company}\n";
        $mail_body .= "メール: {$email}\n";
        $mail_body .= "内容: {$message}\n";
        $mail_body .= "送信日時: " . date('Y-m-d H:i:s') . "\n";
        $mail_body .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
        
        // 自動返信メール
        $return_subject = 'お問い合わせありがとうございます - 株式会社核酸';
        $return_body = "この度はお問い合わせいただき、ありがとうございます。\n\n";
        $return_body .= "内容を確認の上、ご返信させていただきます。\n\n";
        $return_body .= "---\n株式会社核酸\nhttps://kakusan.co.jp/\n";
        
        if (mail($to, $subject, $mail_body) && mail($email, $return_subject, $return_body)) {
            $success = true;
            error_log("Contact form submitted: {$company} - {$email}");
        } else {
            $errors[] = 'メール送信に失敗しました。時間をおいて再試行してください';
            error_log("Mail sending failed: {$company} - {$email}");
        }
    }
    
    // エラーログ記録
    if (!empty($errors)) {
        error_log("Form validation failed: " . json_encode($errors));
    }
}
?>
```

### データ分析
**Google Analytics 4 + Google Search Console**

#### 設定項目
- 基本トラッキング
- 問い合わせコンバージョン
- スクロール深度
- 滞在時間
- 流入元分析

### 開発・デプロイ環境

#### バージョン管理
**Git + GitHub**
- ソースコード管理
- バックアップ
- 変更履歴

#### デプロイ
**Git → Build → FTP**
```bash
# デプロイスクリプト例
npm run build  # CSS最小化等
npm run deploy # FTPアップロード
```

---

## ディレクトリ構成
kakusan_hp/
├── src/ # ソースファイル
│ ├── index.html # メインページ
│ ├── contact.php # 問い合わせフォーム
│ ├── styles/
│ │ ├── main.css # メインCSS
│ │ └── tailwind.css # Tailwind設定
│ ├── scripts/
│ │ ├── main.js # メインJS
│ │ └── analytics.js # GA4設定
│ ├── images/ # 画像ファイル
│ └── assets/ # その他リソース
├── dist/ # ビルド後（FTPアップロード用）
├── tools/ # ビルド・デプロイツール
│ ├── build.js # CSS最小化、画像最適化
│ └── deploy.js # FTPアップロード
├── logs/ # ログファイル
├── backups/ # バックアップ
├── creds/ # 認証情報
├── package.json # Node.js設定
├── tailwind.config.js # Tailwind設定
├── .env # 環境変数
├── .env.example # 環境変数テンプレート
├── .gitignore
└── README.md
---

## 実装詳細

### HTMLテンプレート構造
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <!-- SEO meta tags -->
    <!-- Tailwind CSS -->
    <!-- Google Analytics 4 -->
</head>
<body>
    <!-- Header/Hero -->
    <!-- 課題訴求 -->
    <!-- サービス紹介 -->
    <!-- 実績・事例 -->
    <!-- プロフィール -->
    <!-- 料金・サービス詳細 -->
    <!-- 問い合わせフォーム -->
    <!-- Footer -->
    
    <!-- JavaScript -->
</body>
</html>
```

### CSS設計
**Tailwind CSS + カスタムコンポーネント**

```css
/* main.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* カスタムコンポーネント */
.btn-primary { @apply bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors; }
.section { @apply py-16 px-4; }
.container { @apply max-w-4xl mx-auto; }
```

### JavaScript機能
```javascript
// main.js
// 1. フォームバリデーション
// 2. スムーススクロール
// 3. アニメーション
// 4. GA4イベント送信
```

### 問い合わせフォーム
```php
<?php
// contact.php
$errors = [];
$success = false;

if ($_POST) {
    // バリデーション
    if (empty($_POST['company'])) $errors[] = '会社名は必須です';
    if (empty($_POST['email'])) $errors[] = 'メールアドレスは必須です';
    
    // スパム対策
    if ($_POST['honeypot']) exit; // ハニーポット
    
    if (empty($errors)) {
        // メール送信
        $to = 'contact@kakusan.jp';
        $subject = '問い合わせ: ' . $_POST['company'];
        $message = "会社名: {$_POST['company']}\n...";
        
        if (mail($to, $subject, $message)) {
            $success = true;
        }
    }
}
?>
```

---

## パフォーマンス最適化

### 画像最適化
- WebP対応
- 適切なサイズ
- 遅延読み込み

### CSS/JS最適化
- 最小化・圧縮
- 不要コード削除
- インライン重要CSS

### キャッシュ設定
```apache
# .htaccess
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/* "access plus 1 year"
</IfModule>
```

---

## SEO設定

### 基本設定
```html
<title>法規制対応可能なヘルスケアデータ・AI活用コンサルタント | 山中康寛</title>
<meta name="description" content="PMDA・HIPAA対応経験を持つデータコンサルタント。実証済みROI改善実績。ヘルスケア業界特化でデータ基盤構築から機械学習活用まで一気通貫サポート。">
<meta name="keywords" content="ヘルスケア,データ分析,AI,機械学習,PMDA,HIPAA,コンサルティング">
```

### 構造化データ
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "ヘルスケア特化データ・AI活用コンサルティング",
  "description": "...",
  "provider": {
    "@type": "Person",
    "name": "山中康寛"
  }
}
```

---

## デプロイ・運用

### ビルドスクリプト
```javascript
// tools/build.js
const fs = require('fs');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');

// CSS処理
// 画像最適化
// HTMLminify
```

### FTPデプロイ
```javascript
// tools/deploy.js
const ftp = require('basic-ftp');

async function deploy() {
    const client = new ftp.Client();
    await client.access({
        host: "kakusan.sakura.ne.jp",
        user: "kakusan",
        password: process.env.FTP_PASSWORD
    });
    
    await client.uploadFromDir("dist", "/www");
    client.close();
}
```

### package.json
```json
{
  "scripts": {
    "dev": "tailwindcss -i src/styles/main.css -o dist/styles/main.css --watch",
    "build": "node tools/build.js",
    "deploy": "npm run build && node tools/deploy.js"
  }
}
```

---

## 分析・改善計画

### Phase 1 測定項目
- **アクセス数**（営業後 vs オーガニック）
- **滞在時間・直帰率**
- **問い合わせ率**
- **問い合わせ内容の質**

### 改善サイクル
1. **週次データ確認**（10分）
2. **月次改善検討**（30分）
3. **四半期大幅見直し**（2時間）

### Phase 2 移行判断基準
- 月間アクセス数 500以上
- 営業以外の問い合わせ 月2件以上
- 案件成約率の安定化

---

*この技術選定により、最小限の運用負荷で必要十分な機能を実現し、将来の拡張性も確保します。*

## さくらの共用サーバー制約・設定

### 確認済み環境情報
- **プラン**: スタンダード/プレミアムプラン
- **PHP**: 8.x系対応（5.2.x〜7.x系も選択可能）
- **OS**: FreeBSD（UNIX系）
- **Webサーバー**: nginx + Apache 2.4系
- **ドメイン**: kakusan.co.jp（バリュードメイン管理）
- **SSL**: Let's Encrypt無料SSL使用中

### PHP制限
- **PHPバージョン**: 8.x推奨（7.4 / 8.0 / 8.1 対応）
- **実行時間制限**: 30秒
- **メモリ制限**: 256MB
- **アップロード制限**: 128MB

### メール送信制限
- **ライト/スタンダード/プレミアム**: 15分毎に100通程度（400通/時間、9,600通/日換算）
- **実際の制限**: さくらの公式情報に基づく
- **SPF/DKIM**: 設定推奨

### ディスク・転送制限
- **容量**: プランにより（300GB〜）
- **転送量**: 無制限（公正利用の範囲）

### セキュリティ制限
- root権限なし
- ファイアウォール編集不可
- daemon常駐プログラム実行不可

### .htaccess設定
```apache
# PHP設定
php_value max_execution_time 30
php_value memory_limit 256M
php_value post_max_size 128M

# セキュリティヘッダー
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Referrer-Policy strict-origin-when-cross-origin

# HTTPS強制
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# WWWなし統一
RewriteCond %{HTTP_HOST} ^www\.kakusan\.co\.jp$
RewriteRule ^(.*)$ https://kakusan.co.jp/$1 [R=301,L]

# キャッシュ設定
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/* "access plus 1 year"
</IfModule>
```

---

## 開発環境セットアップ

### 必要環境
- **Node.js**: 18.x以上
- **Git**: 最新版
- **エディタ**: VS Code推奨

### セットアップ手順
```bash
# 1. リポジトリクローン
git clone https://github.com/yourusername/kakusan_hp.git
cd kakusan_hp

# 2. Node.js依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env
# .envファイルを編集してFTP情報等を設定

# 4. 開発サーバー起動
npm run dev

# 5. ブラウザで確認
# http://localhost:3000 でアクセス
```

### 環境変数（.env）
```bash
# FTP設定
FTP_HOST=kakusan.sakura.ne.jp
FTP_USER=kakusan
FTP_PASSWORD=your_password

# メール設定
CONTACT_EMAIL_TO=admin@kakusan.co.jp,futagami@kakusan.co.jp
CONTACT_EMAIL_FROM=admin@kakusan.co.jp

# GA4設定
GA_TRACKING_ID=G-XXXXXXXXXX

# 環境
NODE_ENV=development
```

---

## セキュリティ対策

### 実装必須項目
1. **CSRF対策**
   - トークン生成・検証
   - セッション管理

2. **XSS対策**
   - 入力値サニタイズ
   - htmlspecialchars使用

3. **SQL インジェクション対策**
   - プリペアドステートメント（DB使用時）

4. **レート制限**
   - セッションベース送信制限
   - IP単位の制限検討

5. **スパム対策**
   - ハニーポット
   - reCAPTCHA（必要に応じて）

### エラーハンドリング・監視
```php
<?php
// error_handler.php
class ErrorHandler {
    private $logFile = __DIR__ . '/logs/error.log';
    
    public function logError($message, $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = empty($context) ? '' : ' - ' . json_encode($context);
        $logMessage = "[{$timestamp}] {$message}{$contextStr}\n";
        
        error_log($logMessage, 3, $this->logFile);
    }
    
    public function handleFormError($errors, $postData) {
        $safeData = [
            'company' => $postData['company'] ?? 'N/A',
            'email' => $postData['email'] ?? 'N/A',
            'errors' => $errors,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown'
        ];
        
        $this->logError('Form validation failed', $safeData);
    }
}
?>
```

---

## パフォーマンス最適化

### 画像最適化
- WebP対応
- 適切なサイズ
- 遅延読み込み（Intersection Observer）

### CSS/JS最適化
- 最小化・圧縮
- 不要コード削除
- インライン重要CSS

### HTMLテンプレート構造
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <!-- SEO meta tags -->
    <title>法規制対応可能なヘルスケアデータ・AI活用コンサルタント | 山中康寛</title>
    <meta name="description" content="PMDA・HIPAA対応経験を持つデータコンサルタント。実証済みROI改善実績。ヘルスケア業界特化でデータ基盤構築から機械学習活用まで一気通貫サポート。">
    <link rel="canonical" href="https://kakusan.co.jp/">
    
    <!-- Tailwind CSS -->
    <!-- Google Analytics 4 -->
</head>
<body>
    <!-- Header/Hero -->
    <!-- 課題訴求 -->
    <!-- サービス紹介 -->
    <!-- 実績・事例 -->
    <!-- プロフィール -->
    <!-- 料金・サービス詳細 -->
    <!-- 問い合わせフォーム -->
    <!-- Footer -->
    
    <!-- JavaScript -->
</body>
</html>
```

---

## GA4設定詳細

```javascript
// analytics.js - 詳細設定
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-XXXXXXXXXX', {
    // 拡張計測
    enhanced_conversions: true,
    // カスタムディメンション
    custom_map: {
        'custom_parameter_1': 'form_type',
        'custom_parameter_2': 'user_segment'
    }
});

// フォーム送信イベント
function trackFormSubmit(formType) {
    gtag('event', 'form_submit', {
        'event_category': 'contact',
        'event_label': formType,
        'value': 1
    });
}

// スクロール深度測定
let maxScroll = 0;
window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // 25%, 50%, 75%, 100%でイベント送信
        if ([25, 50, 75, 100].includes(scrollPercent)) {
            gtag('event', 'scroll', {
                'event_category': 'engagement',
                'event_label': `${scrollPercent}%`,
                'value': scrollPercent
            });
        }
    }
});
```

---

## デプロイ・運用

### ビルドスクリプト
```javascript
// tools/build.js
const fs = require('fs');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');

// CSS処理
// 画像最適化
// HTMLminify
```

### FTPデプロイ
```javascript
// tools/deploy.js
const ftp = require('basic-ftp');

async function deploy() {
    const client = new ftp.Client();
    await client.access({
        host: "kakusan.sakura.ne.jp",
        user: "kakusan",
        password: process.env.FTP_PASSWORD
    });
    
    await client.uploadFromDir("dist", "/www");
    client.close();
}
```

### package.json
```json
{
  "scripts": {
    "dev": "tailwindcss -i src/styles/main.css -o dist/styles/main.css --watch",
    "build": "node tools/build.js",
    "deploy": "npm run build && node tools/deploy.js"
  }
}
```

---

## バックアップ戦略

### 自動バックアップ
1. **Git管理**
   - 全ソースコードをGitHubで管理
   - 毎回のコミットが自動バックアップとなる

2. **さくらサーバーバックアップ**
   - 標準機能で14日間の自動バックアップ
   - コントロールパネルから手動復元可能

### 手動バックアップ
```bash
#!/bin/bash
# tools/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backup_${DATE}"

mkdir -p $BACKUP_DIR

# ソースコード
git archive --format=zip --output="${BACKUP_DIR}/source_${DATE}.zip" HEAD

# 設定ファイル
cp .env "${BACKUP_DIR}/"
cp .htaccess "${BACKUP_DIR}/"

echo "Backup completed: ${BACKUP_DIR}"
```

---

## 分析・改善計画

### Phase 1 測定項目
- **アクセス数**（営業後 vs オーガニック）
- **滞在時間・直帰率**
- **問い合わせ率**
- **問い合わせ内容の質**

### 改善サイクル
1. **週次データ確認**（10分）
2. **月次改善検討**（30分）
3. **四半期大幅見直し**（2時間）

### Phase 2 移行判断基準
- 月間アクセス数 500以上
- 営業以外の問い合わせ 月2件以上
- 案件成約率の安定化

---

## 実装チェックリスト

### Phase 1 必須項目
- [ ] HTML5 セマンティックマークアップ
- [ ] Tailwind CSS レスポンシブ対応
- [ ] 問い合わせフォーム（セキュリティ強化版）
- [ ] GA4 基本トラッキング
- [ ] SSL/HTTPS完全対応
- [ ] .htaccess設定
- [ ] エラーハンドリング
- [ ] バックアップ体制

### Phase 1 推奨項目
- [ ] 画像最適化（WebP対応）
- [ ] スクロール深度測定
- [ ] フォームバリデーション
- [ ] ログ監視体制

---

*この技術選定により、最小限の運用負荷で必要十分な機能を実現し、将来の拡張性も確保します。*
