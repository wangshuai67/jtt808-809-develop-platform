/**
 * 侧边栏交互功能
 */

// 切换侧边栏显示/隐藏（移动端）
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('show');
        
        // 创建或移除遮罩层
        if (sidebar.classList.contains('show')) {
            if (!overlay) {
                const newOverlay = document.createElement('div');
                newOverlay.className = 'sidebar-overlay';
                newOverlay.onclick = closeSidebar;
                document.body.appendChild(newOverlay);
            }
        } else {
            if (overlay) {
                overlay.remove();
            }
        }
    }
}

// 关闭侧边栏
function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.remove('show');
    }
    
    if (overlay) {
        overlay.remove();
    }
}

// 设置当前活动的导航项
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // 检查链接是否匹配当前路径
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.split('/').pop())) {
            link.classList.add('active');
        }
    });
}

// 添加导航链接点击动画
function addNavLinkAnimations() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 添加点击波纹效果
            const ripple = document.createElement('span');
            ripple.className = 'nav-ripple';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            // 移除波纹效果
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// 初始化侧边栏功能
function initSidebar() {
    // 设置当前活动导航项
    setActiveNavItem();
    
    // 添加导航链接动画
    addNavLinkAnimations();
    
    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
    
    // ESC键关闭侧边栏
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSidebar);

// 导出函数供全局使用
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;