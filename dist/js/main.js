/**
 * luckluck - Main JavaScript
 * ヘルスケア企業向けデータ活用支援サービス
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ================================================
    // ナビゲーションのスクロール制御
    // ================================================
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg');
        } else {
            navbar.classList.remove('shadow-lg');
        }
    });

    // ================================================
    // スムーススクロール（アンカーリンク）
    // ================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ================================================
    // モバイルメニューの自動閉じ
    // ================================================
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        });
    });

    // ================================================
    // フォームバリデーション
    // ================================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // フォームの各要素を取得
            const company = document.getElementById('company').value.trim();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const inquiryType = document.getElementById('inquiry_type').value;
            const message = document.getElementById('message').value.trim();
            
            // バリデーションエラーのフラグ
            let hasError = false;
            
            // 必須項目のチェック
            if (!company || !name || !email || !inquiryType) {
                alert('必須項目を入力してください。');
                hasError = true;
            }
            
            // メールアドレスの形式チェック
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('正しいメールアドレスを入力してください。');
                hasError = true;
            }
            
            // 電話番号の形式チェック（入力されている場合のみ）
            if (phone && !/^[\d-]+$/.test(phone)) {
                alert('電話番号は数字とハイフンのみで入力してください。');
                hasError = true;
            }
            
            // エラーがなければ送信
            if (!hasError) {
                // ボタンを無効化
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = '送信中...';
                
                // フォームデータを作成
                const formData = new FormData(contactForm);
                
                // 実際の送信処理（サーバーサイドの実装が必要）
                fetch('/contact.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    console.log('Response status:', response.status);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    // まずtextで取得してからJSONパース
                    return response.text();
                })
                .then(text => {
                    console.log('Raw response:', text);
                    
                    // 空の場合はエラー
                    if (!text.trim()) {
                        throw new Error('Empty response from server');
                    }
                    
                    // JSONパースを試行
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('JSON Parse Error:', e);
                        console.error('Response text:', text);
                        throw new Error('Invalid JSON response: ' + text.substring(0, 100));
                    }
                })
                .then(data => {
                    if (data.success) {
                        showMessage(data.message, 'success');
                        contactForm.reset();
                    } else {
                        showMessage(data.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('送信中にエラーが発生しました: ' + error.message, 'error');
                });
            }
        });
    }

    // ================================================
    // スクロールアニメーション（Intersection Observer）
    // ================================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を監視
    const animateElements = document.querySelectorAll('.card, .case-study-content, .results-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // アニメーションクラスの追加時のスタイル
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // ================================================
    // ページトップへ戻るボタン（オプション）
    // ================================================
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(scrollTopBtn);
    
    // スクロール位置に応じて表示/非表示
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });
    
    // クリックでトップへスクロール
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ================================================
    // フォーム入力時のリアルタイムバリデーション
    // ================================================
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !/^[\d-]+$/.test(this.value)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }

});

// ================================================
// メッセージ表示関数（60行目付近に追加）
// ================================================
function showMessage(message, type = 'info') {
    // 既存のアラートを削除
    const existingAlert = document.querySelector('.contact-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // アラート要素を作成
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show contact-alert`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // フォームの前に挿入
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.parentNode.insertBefore(alertDiv, contactForm);
        
        // ボタンを再度有効化
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '送信';
        }
    }

    // 5秒後に自動的に消える
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
} 