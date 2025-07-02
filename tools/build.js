const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ビルド処理の開始
console.log('🚀 ビルド処理を開始します...');

// ディレクトリ構造の確認と作成
const dirs = ['dist', 'dist/css', 'dist/js', 'dist/images'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`📁 ${dir}ディレクトリを作成します`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// HTMLファイルのコピー
try {
  console.log('📄 HTMLファイルをコピーしています...');
  const htmlFiles = fs.readdirSync('public')
    .filter(file => file.endsWith('.html') || file.endsWith('.php'));
  
  htmlFiles.forEach(file => {
    const source = path.join('public', file);
    const dest = path.join('dist', file);
    fs.copyFileSync(source, dest);
    console.log(`✅ ${file}をコピーしました`);
  });
} catch (error) {
  console.error('❌ HTMLファイルのコピーに失敗しました:', error);
}

// CSSの処理
try {
  console.log('🎨 CSSファイルを処理しています...');
  if (fs.existsSync('public/css')) {
    const cssFiles = fs.readdirSync('public/css')
      .filter(file => file.endsWith('.css'));
    
    cssFiles.forEach(file => {
      const source = path.join('public/css', file);
      const dest = path.join('dist/css', file);
      fs.copyFileSync(source, dest);
      console.log(`✅ ${file}をコピーしました`);
    });
  }
} catch (error) {
  console.error('❌ CSSファイルの処理に失敗しました:', error);
}

// JavaScriptファイルのコピー
try {
  console.log('📜 JavaScriptファイルをコピーしています...');
  if (fs.existsSync('public/js')) {
    const jsFiles = fs.readdirSync('public/js')
      .filter(file => file.endsWith('.js'));
    
    jsFiles.forEach(file => {
      const source = path.join('public/js', file);
      const dest = path.join('dist/js', file);
      fs.copyFileSync(source, dest);
      console.log(`✅ ${file}をコピーしました`);
    });
  }
} catch (error) {
  console.error('❌ JavaScriptファイルのコピーに失敗しました:', error);
}

// 画像ファイルのコピー
try {
  console.log('🖼️ 画像ファイルをコピーしています...');
  if (fs.existsSync('public/images')) {
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];
    const imageFiles = fs.readdirSync('public/images')
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExts.includes(ext);
      });
    
    imageFiles.forEach(file => {
      const source = path.join('public/images', file);
      const dest = path.join('dist/images', file);
      fs.copyFileSync(source, dest);
      console.log(`✅ ${file}をコピーしました`);
    });
  }
} catch (error) {
  console.error('❌ 画像ファイルのコピーに失敗しました:', error);
}

console.log('✨ ビルド処理が完了しました！');
