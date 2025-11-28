/**
 * 现代简洁菜单交互
 * 提供基础的菜单功能，无复杂动画
 */

class ModernMenu {
    constructor() {
        this.sidebar = null;
        this.mobileToggle = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.sidebar = document.querySelector('.sidebar');
            this.mobileToggle = document.querySelector('.mobile-menu-toggle');
            
            if (this.sidebar) {
                this.setupNavigation();
                this.setupMobileMenu();
                this.setupKeyboardNavigation();
                this.isInitialized = true;
                console.log('✨ 现代简洁菜单已初始化');
            }
        } catch (error) {
            console.error('菜单初始化失败:', error);
        }
    }
    
    setupNavigation() {
        const navLinks = this.sidebar.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // 简单的点击处理
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
            
            // 基础的焦点处理
            link.addEventListener('focus', () => {
                this.handleNavFocus(link);
            });
        });
    }
    
    handleNavClick(e, link) {
        // 移除其他活动状态
        const activeLinks = this.sidebar.querySelectorAll('.nav-link.active');
        activeLinks.forEach(activeLink => {
            activeLink.classList.remove('active');
        });
        
        // 添加当前活动状态
        link.classList.add('active');
        
        // 在移动端点击后关闭菜单
        if (window.innerWidth <= 768) {
            this.closeMobileMenu();
        }
    }
    
    handleNavFocus(link) {
        // 确保焦点元素可见
        link.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
    
    setupMobileMenu() {
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.sidebar && 
                this.sidebar.classList.contains('show') &&
                !this.sidebar.contains(e.target) &&
                !this.mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // ESC键关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && 
                window.innerWidth <= 768 && 
                this.sidebar && 
                this.sidebar.classList.contains('show')) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        if (!this.sidebar) return;
        
        if (this.sidebar.classList.contains('show')) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.add('show');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        // 焦点管理
        const firstLink = this.sidebar.querySelector('.nav-link');
        if (firstLink) {
            firstLink.focus();
        }
    }
    
    closeMobileMenu() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.remove('show');
        document.body.style.overflow = ''; // 恢复滚动
        
        // 返回焦点到切换按钮
        if (this.mobileToggle) {
            this.mobileToggle.focus();
        }
    }
    
    setupKeyboardNavigation() {
        const navLinks = this.sidebar.querySelectorAll('.nav-link');
        
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextLink = navLinks[index + 1] || navLinks[0];
                        nextLink.focus();
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevLink = navLinks[index - 1] || navLinks[navLinks.length - 1];
                        prevLink.focus();
                        break;
                        
                    case 'Home':
                        e.preventDefault();
                        navLinks[0].focus();
                        break;
                        
                    case 'End':
                        e.preventDefault();
                        navLinks[navLinks.length - 1].focus();
                        break;
                }
            });
        });
    }
    
    // 响应式处理
    handleResize() {
        if (window.innerWidth > 768 && this.sidebar && this.sidebar.classList.contains('show')) {
            this.closeMobileMenu();
        }
    }
    
    // 设置当前活动页面
    setActivePage(href) {
        const navLinks = this.sidebar.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('href') === href || 
                (href && link.getAttribute('href') && href.includes(link.getAttribute('href')))) {
                link.classList.add('active');
            }
        });
    }
    
    // 销毁方法
    destroy() {
        if (this.mobileToggle) {
            this.mobileToggle.removeEventListener('click', this.toggleMobileMenu);
        }
        
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleEscapeKey);
        
        this.isInitialized = false;
    }
}

// 全局暴露
window.ModernMenu = ModernMenu;

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    if (!window.modernMenu) {
        window.modernMenu = new ModernMenu();
        
        // 响应式处理
        window.addEventListener('resize', () => {
            if (window.modernMenu) {
                window.modernMenu.handleResize();
            }
        });
        
        // 根据当前URL设置活动状态
        const currentPath = window.location.pathname;
        if (window.modernMenu && currentPath) {
            window.modernMenu.setActivePage(currentPath);
        }
    }
});

// 页面卸载时清理
window.addEventListener('beforeunload', function() {
    if (window.modernMenu) {
        window.modernMenu.destroy();
    }
});