<?php
/**
 * luckluck - お問い合わせフォーム処理
 * ヘルスケア企業向けデータ活用支援サービス
 */

// PHP5.4用の文字エンコーディング設定
if (function_exists('mb_internal_encoding')) {
    mb_internal_encoding('UTF-8');
}
if (function_exists('mb_http_output')) {
    mb_http_output('UTF-8');
}

// デフォルト文字セットの設定
ini_set('default_charset', 'UTF-8');

// エラー表示を無効化（本番環境）
error_reporting(0);
ini_set('display_errors', 0);

// Output Bufferingを開始
ob_start();

// レスポンスヘッダーの設定
header('Content-Type: application/json; charset=UTF-8');

try {
    // POSTリクエストのみ受け付ける
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method Not Allowed');
    }

    // フォームデータの取得（UTF-8変換）
    $company = isset($_POST['company']) ? mb_convert_encoding(trim($_POST['company']), 'UTF-8', 'auto') : '';
    $name = isset($_POST['name']) ? mb_convert_encoding(trim($_POST['name']), 'UTF-8', 'auto') : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $inquiry_type = isset($_POST['inquiry_type']) ? mb_convert_encoding(trim($_POST['inquiry_type']), 'UTF-8', 'auto') : '';
    $message = isset($_POST['message']) ? mb_convert_encoding(trim($_POST['message']), 'UTF-8', 'auto') : '';

    // バリデーション
    $errors = array();

    if (empty($company)) {
        $errors[] = '会社名が入力されていません。';
    }

    if (empty($name)) {
        $errors[] = 'お名前が入力されていません。';
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = '正しいメールアドレスを入力してください。';
    }

    if (empty($inquiry_type)) {
        $errors[] = 'お問い合わせ内容を選択してください。';
    }

    // エラーがある場合
    if (!empty($errors)) {
        $response = array(
            'success' => false,
            'message' => implode("\n", $errors)
        );
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // メール送信処理
    $admin_email = 'info@luckluck.jp';
    $subject = mb_encode_mimeheader('[luckluck] お問い合わせ', 'UTF-8');
    
    $body = "お問い合わせを受け付けました。\n\n";
    $body .= "【お問い合わせ内容】\n";
    $body .= "会社名: " . $company . "\n";
    $body .= "お名前: " . $name . "\n";  
    $body .= "メールアドレス: " . $email . "\n";
    $body .= "電話番号: " . $phone . "\n";
    $body .= "お問い合わせ種別: " . $inquiry_type . "\n\n";
    $body .= "メッセージ:\n" . $message . "\n";
    $body .= "\n送信日時: " . date('Y年m月d日 H:i:s') . "\n";

    // メールヘッダー
    $headers = "From: info@luckluck.jp\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit\r\n";

    // Envelope-From（Return-Path）を明示的に設定
    $extra_param = '-f info@luckluck.jp';

    // メール送信
    $mail_sent = @mail($admin_email, $subject, $body, $headers, $extra_param);

    // 自動返信メール
    if ($mail_sent) {
        $auto_reply_subject = mb_encode_mimeheader('[luckluck] お問い合わせありがとうございます', 'UTF-8');
        $auto_reply_body = $name . " 様\n\n";
        $auto_reply_body .= "この度は、luckluckへお問い合わせいただき、誠にありがとうございます。\n";
        $auto_reply_body .= "以下の内容でお問い合わせを受け付けました。\n\n";
        $auto_reply_body .= "【お問い合わせ内容】\n";
        $auto_reply_body .= "会社名: " . $company . "\n";
        $auto_reply_body .= "お名前: " . $name . "\n";
        $auto_reply_body .= "メールアドレス: " . $email . "\n";
        $auto_reply_body .= "電話番号: " . $phone . "\n";
        $auto_reply_body .= "お問い合わせ種別: " . $inquiry_type . "\n\n";
        $auto_reply_body .= "メッセージ:\n" . $message . "\n\n";
        $auto_reply_body .= "内容を確認の上、担当者より2営業日以内にご連絡させていただきます。\n\n";
        $auto_reply_body .= "luckluck\n";
        $auto_reply_body .= "Email: info@luckluck.jp\n";
        $auto_reply_body .= "URL: https://luckluck.jp\n";

        @mail($email, $auto_reply_subject, $auto_reply_body, $headers, $extra_param);
    }

    // レスポンス送信
    $response = array(
        'success' => $mail_sent,
        'message' => $mail_sent ? 'お問い合わせを受け付けました。確認メールをお送りしましたのでご確認ください。' : '送信に失敗しました。しばらく経ってから再度お試しください。'
    );

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    $response = array(
        'success' => false,
        'message' => 'エラーが発生しました。しばらく経ってから再度お試しください。'
    );
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

// バッファをフラッシュして終了
ob_end_flush();
exit;
?> 