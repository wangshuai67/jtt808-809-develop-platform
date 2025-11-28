/**
 * 应用程序初始化脚本
 * 统一管理所有组件的初始化和配置
 */

// 应用程序主对象
window.App = {
    // 配置选项
    config: {
        // 动画配置
        animations: {
            duration: 300,
            easing: 'ease-in-out',
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        },
        // 响应式断点
        breakpoints: {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        },
        // 加载配置
        loading: {
            minDuration: 500,
            showProgress: true
        },
        // 通知配置
        notifications: {
            position: 'top-right',
            duration: 3000,
            maxVisible: 5
        }
    },

    // 初始化状态
    initialized: false,
    
    // 组件实例
    components: {},

    // 初始化应用程序
    init: function() {
        if (this.initialized) return;
        
        console.log('🚀 初始化JTT808模拟器应用程序...');
        
        // 等待LoadingAnimations实例创建
        setTimeout(() => {
            // 显示全局加载动画
            if (window.loadingAnimations) {
                window.loadingAnimations.showGlobalLoading();
            }
        }, 100);

        // 初始化各个组件
        this.initComponents();
        
        // 设置全局事件监听器
        this.setupGlobalEvents();
        
        // 初始化页面特定功能
        this.initPageSpecific();
        
        // 标记为已初始化
        this.initialized = true;
        
        // 隐藏全局加载动画
        setTimeout(() => {
            if (window.loadingAnimations) {
                window.loadingAnimations.hideGlobalLoading();
            }
            console.log('✅ 应用程序初始化完成');
        }, this.config.loading.minDuration);
    },

    // 初始化组件
    initComponents: function() {
        // 初始化响应式工具
        if (window.ResponsiveUtils) {
            // 如果实例已存在，使用它；否则创建新实例
            if (window.responsive) {
                this.components.responsive = window.responsive;
            } else {
                this.components.responsive = new ResponsiveUtils();
                window.responsive = this.components.responsive;
            }
            console.log('📱 响应式工具已初始化');
        }

        // 初始化UI交互
        if (window.UIInteractions) {
            // 如果实例已存在，使用它；否则创建新实例
            if (window.uiInteractions) {
                this.components.ui = window.uiInteractions;
            } else {
                this.components.ui = new UIInteractions();
                window.uiInteractions = this.components.ui;
            }
            console.log('🎨 UI交互功能已初始化');
        }

        // 初始化加载动画
        if (window.LoadingAnimations) {
            this.components.loading = window.loadingAnimations;
            console.log('⏳ 加载动画已初始化');
        }

        // 初始化表单验证器
        if (window.FormValidator) {
            this.components.validator = FormValidator;
            console.log('✅ 表单验证器已初始化');
        }

        // 初始化Toast通知
        if (window.showToast) {
            console.log('🔔 Toast通知已就绪');
        }

        // 初始化现代菜单
        if (window.ModernMenu) {
            this.components.modernMenu = new ModernMenu();
            console.log('🎨 现代菜单已初始化');
        }
    },

    // 设置全局事件监听器
    setupGlobalEvents: function() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📴 页面已隐藏');
            } else {
                console.log('👁️ 页面已显示');
                this.refreshData();
            }
        });

        // 网络状态变化
        window.addEventListener('online', () => {
            if (window.showToast) {
                showToast('网络连接已恢复', 'success');
            }
            console.log('🌐 网络已连接');
        });

        window.addEventListener('offline', () => {
            if (window.showToast) {
                showToast('网络连接已断开', 'warning');
            }
            console.log('📡 网络已断开');
        });

        // 窗口大小变化
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (this.components.responsive) {
                    this.components.responsive.handleResize();
                }
                this.handleResize();
            }, 250);
        });

        // 全局错误处理
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            if (window.showToast) {
                showToast('发生了一个错误，请刷新页面重试', 'error');
            }
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            if (window.showToast) {
                showToast('操作失败，请重试', 'error');
            }
        });
    },

    // 初始化页面特定功能
    initPageSpecific: function() {
        const path = window.location.pathname;
        
        // 根据页面路径初始化特定功能
        if (path.includes('/vehicle/list')) {
            this.initVehicleListPage();
        } else if (path.includes('/monitor')) {
            this.initMonitorPage();
        } else if (path.includes('/login')) {
            this.initLoginPage();
        }
    },

    // 初始化车辆列表页面
    initVehicleListPage: function() {
        console.log('🚗 初始化车辆列表页面');
        
        // 如果存在loadVehicleData函数，则调用
        if (typeof loadVehicleData === 'function') {
            loadVehicleData();
        }
        
        // 设置自动刷新
        this.setupAutoRefresh('loadVehicleData', 30000); // 30秒刷新一次
    },

    // 初始化监控页面
    initMonitorPage: function() {
        console.log('📍 初始化监控页面');
        
        // 如果存在地图初始化函数，则调用
        if (typeof initMap === 'function') {
            initMap();
        }
        
        // 设置实时更新
        this.setupAutoRefresh('updateVehiclePosition', 5000); // 5秒更新一次
    },

    // 初始化登录页面
    initLoginPage: function() {
        console.log('🔐 初始化登录页面');
        
        // 聚焦到用户名输入框
        const usernameInput = document.querySelector('input[name="username"]');
        if (usernameInput) {
            setTimeout(() => usernameInput.focus(), 100);
        }
    },

    // 设置自动刷新
    setupAutoRefresh: function(functionName, interval) {
        if (typeof window[functionName] === 'function') {
            setInterval(() => {
                if (!document.hidden) {
                    window[functionName]();
                }
            }, interval);
        }
    },

    // 处理窗口大小变化
    handleResize: function() {
        // 重新计算表格高度
        const tables = document.querySelectorAll('.table-responsive');
        tables.forEach(table => {
            // 触发表格重新渲染
            table.dispatchEvent(new Event('resize'));
        });
    },

    // 刷新数据
    refreshData: function() {
        const path = window.location.pathname;
        
        if (path.includes('/vehicle/list') && typeof loadVehicleData === 'function') {
            loadVehicleData();
        } else if (path.includes('/monitor') && typeof updateVehiclePosition === 'function') {
            updateVehiclePosition();
        }
    },

    // 工具方法
    utils: {
        // 防抖函数
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // 节流函数
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        },

        // 格式化日期时间
        formatDateTime: function(date) {
            if (!date) return '-';
            const d = new Date(date);
            return d.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        },

        // 格式化文件大小
        formatFileSize: function(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        // 生成UUID
        generateUUID: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }
};

// DOM加载完成后初始化应用程序
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

// 页面加载完成后的额外初始化
window.addEventListener('load', function() {
    // 启用页面过渡动画
    document.body.classList.add('page-loaded');
    
    // 预加载动画资源
    if (window.loadingAnimations) {
        window.loadingAnimations.preloadAnimations();
    }
    
    // 初始化滚动动画
    if (window.loadingAnimations) {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animated');
            }, index * 100);
        });
    }
});