/**
 * 响应式工具类
 * 处理设备检测、断点管理和响应式行为
 */
class ResponsiveUtils {
    constructor() {
        this.breakpoints = {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        };
        
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.isMobile = this.checkIsMobile();
        this.isTablet = this.checkIsTablet();
        this.isDesktop = this.checkIsDesktop();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.handleInitialLoad();
    }
    
    bindEvents() {
        // 监听窗口大小变化
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // 监听设备方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // 监听触摸事件（移动端优化）
        if (this.isMobile) {
            this.handleTouchEvents();
        }
    }
    
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= this.breakpoints.xxl) return 'xxl';
        if (width >= this.breakpoints.xl) return 'xl';
        if (width >= this.breakpoints.lg) return 'lg';
        if (width >= this.breakpoints.md) return 'md';
        if (width >= this.breakpoints.sm) return 'sm';
        return 'xs';
    }
    
    checkIsMobile() {
        return window.innerWidth < this.breakpoints.md;
    }
    
    checkIsTablet() {
        return window.innerWidth >= this.breakpoints.md && window.innerWidth < this.breakpoints.lg;
    }
    
    checkIsDesktop() {
        return window.innerWidth >= this.breakpoints.lg;
    }
    
    handleInitialLoad() {
        // 设置初始CSS类
        this.updateBodyClasses();
        
        // 初始化表格响应式
        this.initTableResponsive();
        
        // 初始化移动端菜单
        if (this.isMobile) {
            this.initMobileMenu();
        }
        
        // 初始化触摸优化
        if (this.isTouchDevice()) {
            document.body.classList.add('touch-device');
        }
    }
    
    handleResize() {
        const oldBreakpoint = this.currentBreakpoint;
        const oldIsMobile = this.isMobile;
        
        // 更新断点信息
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.isMobile = this.checkIsMobile();
        this.isTablet = this.checkIsTablet();
        this.isDesktop = this.checkIsDesktop();
        
        // 更新CSS类
        this.updateBodyClasses();
        
        // 如果断点发生变化
        if (oldBreakpoint !== this.currentBreakpoint) {
            this.onBreakpointChange(oldBreakpoint, this.currentBreakpoint);
        }
        
        // 如果移动端状态发生变化
        if (oldIsMobile !== this.isMobile) {
            this.onMobileStateChange(this.isMobile);
        }
        
        // 更新表格响应式
        this.updateTableResponsive();
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('responsiveChange', {
            detail: {
                breakpoint: this.currentBreakpoint,
                isMobile: this.isMobile,
                isTablet: this.isTablet,
                isDesktop: this.isDesktop
            }
        }));
    }
    
    handleOrientationChange() {
        // 处理设备方向变化
        this.handleResize();
        
        // 移动端侧边栏处理
        if (this.isMobile) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('show')) {
                this.closeMobileSidebar();
            }
        }
    }
    
    updateBodyClasses() {
        const body = document.body;
        
        // 移除旧的断点类
        Object.keys(this.breakpoints).forEach(bp => {
            body.classList.remove(`bp-${bp}`);
        });
        
        // 添加当前断点类
        body.classList.add(`bp-${this.currentBreakpoint}`);
        
        // 设备类型类
        body.classList.toggle('is-mobile', this.isMobile);
        body.classList.toggle('is-tablet', this.isTablet);
        body.classList.toggle('is-desktop', this.isDesktop);
    }
    
    onBreakpointChange(oldBreakpoint, newBreakpoint) {
        console.log(`断点变化: ${oldBreakpoint} -> ${newBreakpoint}`);
        
        // 处理侧边栏状态
        this.handleSidebarBreakpointChange(newBreakpoint);
        
        // 处理表格显示模式
        this.handleTableBreakpointChange(newBreakpoint);
    }
    
    onMobileStateChange(isMobile) {
        if (isMobile) {
            this.initMobileMenu();
            this.closeMobileSidebar();
        } else {
            this.destroyMobileMenu();
            this.showDesktopSidebar();
        }
    }
    
    handleSidebarBreakpointChange(breakpoint) {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        if (breakpoint === 'xs' || breakpoint === 'sm') {
            // 移动端：隐藏侧边栏
            sidebar.classList.remove('show');
        } else {
            // 桌面端：显示侧边栏
            sidebar.classList.add('show');
        }
    }
    
    initTableResponsive() {
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            this.makeTableResponsive(table);
        });
    }
    
    updateTableResponsive() {
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            if (this.currentBreakpoint === 'xs') {
                this.enableTableStack(table);
            } else {
                this.disableTableStack(table);
            }
        });
    }
    
    makeTableResponsive(table) {
        // 为表格添加响应式包装器
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
        
        // 为表格单元格添加数据标签（用于堆叠显示）
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index].textContent.trim());
                }
            });
        });
    }
    
    enableTableStack(table) {
        table.classList.add('table-stack');
    }
    
    disableTableStack(table) {
        table.classList.remove('table-stack');
    }
    
    handleTableBreakpointChange(breakpoint) {
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            if (breakpoint === 'xs') {
                this.enableTableStack(table);
            } else {
                this.disableTableStack(table);
            }
        });
    }
    
    initMobileMenu() {
        // 创建移动端菜单按钮
        this.createMobileMenuButton();
        
        // 绑定移动端事件
        this.bindMobileEvents();
    }
    
    destroyMobileMenu() {
        // 移除移动端菜单按钮
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.remove();
        }
        
        // 移除遮罩层
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    createMobileMenuButton() {
        // 检查是否已存在
        if (document.querySelector('.mobile-menu-btn')) return;
        
        const navbar = document.querySelector('.top-navbar');
        if (!navbar) return;
        
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '<i class="fa fa-bars"></i>';
        menuBtn.style.cssText = `
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            font-size: 18px;
            color: var(--gray-600);
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        
        menuBtn.addEventListener('click', () => {
            this.toggleMobileSidebar();
        });
        
        navbar.appendChild(menuBtn);
    }
    
    bindMobileEvents() {
        // 点击遮罩层关闭侧边栏
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sidebar-overlay')) {
                this.closeMobileSidebar();
            }
        });
        
        // ESC键关闭侧边栏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobile) {
                this.closeMobileSidebar();
            }
        });
    }
    
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        if (sidebar.classList.contains('show')) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }
    
    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // 显示侧边栏
        sidebar.classList.add('show');
        
        // 创建遮罩层
        this.createSidebarOverlay();
        
        // 禁止背景滚动
        document.body.style.overflow = 'hidden';
    }
    
    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // 隐藏侧边栏
        sidebar.classList.remove('show');
        
        // 移除遮罩层
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }
    
    showDesktopSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        sidebar.classList.add('show');
        document.body.style.overflow = '';
    }
    
    createSidebarOverlay() {
        // 检查是否已存在
        if (document.querySelector('.sidebar-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    handleTouchEvents() {
        // 优化触摸滚动
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: true });
        
        // 处理侧边栏滑动手势
        this.initSwipeGestures();
    }
    
    initSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let isSwipe = false;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipe = false;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isSwipe) {
                const deltaX = Math.abs(e.touches[0].clientX - startX);
                const deltaY = Math.abs(e.touches[0].clientY - startY);
                
                if (deltaX > deltaY && deltaX > 30) {
                    isSwipe = true;
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (isSwipe) {
                const endX = e.changedTouches[0].clientX;
                const deltaX = endX - startX;
                
                // 从左边缘向右滑动打开侧边栏
                if (startX < 50 && deltaX > 100) {
                    this.openMobileSidebar();
                }
                
                // 向左滑动关闭侧边栏
                if (deltaX < -100) {
                    this.closeMobileSidebar();
                }
            }
        }, { passive: true });
    }
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // 工具函数：防抖
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 获取当前设备信息
    getDeviceInfo() {
        return {
            breakpoint: this.currentBreakpoint,
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop,
            isTouch: this.isTouchDevice(),
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    
    // 检查是否匹配指定断点
    matchBreakpoint(breakpoint) {
        if (Array.isArray(breakpoint)) {
            return breakpoint.includes(this.currentBreakpoint);
        }
        return this.currentBreakpoint === breakpoint;
    }
    
    // 在指定断点执行函数
    onBreakpoint(breakpoint, callback) {
        if (this.matchBreakpoint(breakpoint)) {
            callback(this.getDeviceInfo());
        }
    }
}

// 全局实例
window.ResponsiveUtils = ResponsiveUtils;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.responsive = new ResponsiveUtils();
    
    // 暴露全局方法
    window.isMobile = () => window.responsive.isMobile;
    window.isTablet = () => window.responsive.isTablet;
    window.isDesktop = () => window.responsive.isDesktop;
    window.getCurrentBreakpoint = () => window.responsive.currentBreakpoint;
});

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveUtils;
}