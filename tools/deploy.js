require('dotenv').config();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// FTP設定
const FTP_HOST = process.env.FTP_HOST || 'luckluck.sakura.ne.jp';
const FTP_USER = process.env.FTP_USER || 'luckluck';
const FTP_PASSWORD = process.env.FTP_PASSWORD;
const FTP_TARGET_DIR = process.env.FTP_TARGET_DIR || '/home/kakusan/www/luckluck/public';

// 環境変数のチェック
if (!FTP_PASSWORD) {
  console.error('❌ FTP_PASSWORDが設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

/**
 * FTPデプロイを実行する関数
 */
async function deploy() {
  console.log('🚀 デプロイ処理を開始します...');
  
  // distディレクトリの存在確認
  if (!fs.existsSync('dist')) {
    console.error('❌ distディレクトリが見つかりません。先にビルド処理を実行してください。');
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;
  
  try {
    console.log(`📡 FTPサーバーに接続しています... (${FTP_HOST})`);
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: false
    });
    
    console.log('✅ FTPサーバーに接続しました');
    
    // ルートディレクトリを確認
    try {
      console.log('📂 現在のディレクトリを確認しています...');
      const currentDir = await client.pwd();
      console.log(`📂 現在のディレクトリ: ${currentDir}`);
      
      // ターゲットディレクトリの確認
      console.log(`📂 ターゲットディレクトリを確認しています... (${FTP_TARGET_DIR})`);
      
      // ディレクトリが存在するか確認し、なければ作成を試みる
      try {
        await client.cd(FTP_TARGET_DIR);
        console.log(`✅ ディレクトリが存在します: ${FTP_TARGET_DIR}`);
      } catch (error) {
        console.log(`📁 ディレクトリが存在しないため作成を試みます: ${FTP_TARGET_DIR}`);
        
        // ディレクトリを階層的に作成
        const parts = FTP_TARGET_DIR.split('/').filter(Boolean);
        let currentPath = '';
        
        for (const part of parts) {
          currentPath += '/' + part;
          try {
            await client.cd(currentPath);
            console.log(`✅ ディレクトリが存在します: ${currentPath}`);
          } catch (error) {
            try {
              await client.mkdir(currentPath);
              await client.cd(currentPath);
              console.log(`✅ ディレクトリを作成しました: ${currentPath}`);
            } catch (mkdirError) {
              console.error(`❌ ディレクトリの作成に失敗しました: ${currentPath} - ${mkdirError.message}`);
              throw mkdirError;
            }
          }
        }
      }
      
      // ファイルのアップロード
      console.log('📤 ファイルをアップロードしています...');
      await client.uploadFromDir('dist', '.');
      
      console.log('✅ アップロードが完了しました');
    } catch (error) {
      console.error(`❌ ディレクトリの操作中にエラーが発生しました: ${error.message}`);
      throw error;
    }
    
  } catch (error) {
    console.error(`❌ デプロイ中にエラーが発生しました: ${error.message}`);
  } finally {
    client.close();
    console.log('📡 FTP接続を閉じました');
  }
  
  console.log('✨ デプロイ処理が完了しました！');
}

// スクリプトが直接実行された場合にデプロイを実行
if (require.main === module) {
  deploy().catch(err => {
    console.error('❌ デプロイ処理に失敗しました:', err);
    process.exit(1);
  });
}

module.exports = { deploy };
