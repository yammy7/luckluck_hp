<?php
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>メール送信テスト</title>
    <meta charset="UTF-8">
</head>
<body>
    <h2>メール送信テスト</h2>
    
<?php
if ($_POST) {
    $test_email = $_POST['email'];
    $subject = 'luckluck テストメール';
    $message = 'これはテストメールです。' . "\n" . '送信日時: ' . date('Y-m-d H:i:s');
    
    $headers = "From: info@luckluck.jp\r\n";
    $headers .= "Reply-To: info@luckluck.jp\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    echo "<h3>送信結果</h3>";
    echo "<p>送信先: " . htmlspecialchars($test_email) . "</p>";
    echo "<p>件名: " . htmlspecialchars($subject) . "</p>";
    
    $result = mail($test_email, $subject, $message, $headers);
    
    if ($result) {
        echo "<p style='color: green;'>✓ PHP mail()関数: 成功</p>";
        echo "<p>メールボックスを確認してください（スパムフォルダも含む）</p>";
    } else {
        echo "<p style='color: red;'>✗ PHP mail()関数: 失敗</p>";
    }
    
    echo "<h3>PHP設定情報</h3>";
    echo "<p>sendmail_path: " . ini_get('sendmail_path') . "</p>";
    echo "<p>PHP Version: " . phpversion() . "</p>";
    
} else {
?>
    <form method="POST">
        <p>
            <label>テスト送信先メールアドレス:</label><br>
            <input type="email" name="email" required style="width: 300px; padding: 5px;">
        </p>
        <p>
            <button type="submit" style="padding: 10px 20px;">テスト送信</button>
        </p>
    </form>
<?php } ?>
</body>
</html>
