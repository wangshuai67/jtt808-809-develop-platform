/**
 * JTT808模拟器 V2 应用核心
 * 负责应用初始化、全局状态管理和核心功能
 */

window.App = (function() {
    'use strict';

    // 应用配置
    const config = {
        version: '2.0.0',
        apiBase: '/api/v2',
        pageTransition: 300,
        autoSaveInterval: 30000,
        maxRetries: 3,
        requestTimeout: 30000
    };

    // 应用状态
    const state = {
        currentPage: 'dashboard',
        user: null,
        loading: false,
        initialized: false,
        modules: new Map(),
        cache: new Map()
    };

    // 事件系统
    const events = {
        listeners: new Map(),
        
        on(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        },
        
        off(event, callback) {
            if (this.listeners.has(event)) {
                const callbacks = this.listeners.get(event);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        },
        
        emit(event, data) {
            if (this.listeners.has(event)) {
                this.listeners.get(event).forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`事件处理器错误 [${event}]:`, error);
                    }
                });
            }
        }
    };

    // 工具函数
    const utils = {
        // 防抖函数
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
        },

        // 节流函数
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // 格式化日期
        formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            
            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('HH', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        },

        // 生成UUID
        generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        // 深拷贝
        deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
        },

        // 存储管理
        storage: {
            set(key, value, expire = null) {
                const data = {
                    value: value,
                    expire: expire ? Date.now() + expire : null
                };
                localStorage.setItem(`jtt808_${key}`, JSON.stringify(data));
            },

            get(key) {
                try {
                    const item = localStorage.getItem(`jtt808_${key}`);
                    if (!item) return null;
                    
                    const data = JSON.parse(item);
                    if (data.expire && Date.now() > data.expire) {
                        localStorage.removeItem(`jtt808_${key}`);
                        return null;
                    }
                    return data.value;
                } catch (error) {
                    console.error('存储读取错误:', error);
                    return null;
                }
            },

            remove(key) {
                localStorage.removeItem(`jtt808_${key}`);
            },

            clear() {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('jtt808_')) {
                        localStorage.removeItem(key);
                    }
                });
            }
        }
    };

    // 应用初始化
    function init() {
        if (state.initialized) {
            console.warn('应用已经初始化');
            return;
        }

        console.log(`JTT808模拟器 V${config.version} 初始化中...`);
        
        try {
            // 初始化各个模块
            initializeModules();
            if (window.API && typeof window.API.init === 'function') {
                window.API.init();
            }
            
            // 绑定全局事件
            bindGlobalEvents();
            
            // 初始化路由
            if (window.Router) {
                Router.init();
            }
            
            // 加载用户信息
            loadUserInfo();
            
            // 隐藏加载界面
            hideLoading();
            
            // 导航到默认页面
            navigateToPage(getInitialPage());
            
            state.initialized = true;
            events.emit('app:initialized');
            
            console.log('应用初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            showError('应用初始化失败，请刷新页面重试');
        }
    }

    // 初始化模块
    function initializeModules() {
        // 注册核心模块
        if (window.API) registerModule('api', window.API);
        if (window.Utils) registerModule('utils', window.Utils);
        if (window.Components) registerModule('components', window.Components);
        
        // 注册页面模块
        if (window.Dashboard) registerModule('dashboard', window.Dashboard);
        if (window.Vehicles) registerModule('vehicles', window.Vehicles);
        if (window.Gateways) registerModule('gateways', window.Gateways);
        if (window.Routes) registerModule('routes', window.Routes);
        if (window.Tasks) registerModule('tasks', window.Tasks);
        else registerModule('tasks', {
            render: () => '<div class="p-3 text-muted">任务管理模块加载失败</div>',
            initialize: () => {},
            destroy: () => {},
            refresh: () => {}
        });
        if (window.Monitor) registerModule('monitor', window.Monitor);
        if (window.Pressure) registerModule('pressure', window.Pressure);
        if (window.Settings) registerModule('settings', window.Settings);
        if (window.Alerts) registerModule('alerts', window.Alerts);
        
        if (window.JT809Gateways) registerModule('809-gateways', window.JT809Gateways);
        
        if (window.JT809Tasks) registerModule('809-tasks', window.JT809Tasks);
        if (window.JT809Logs) registerModule('809-logs', window.JT809Logs);
    }

    // 注册模块
    function registerModule(name, module) {
        if (state.modules.has(name)) {
            console.warn(`模块 ${name} 已存在，将被覆盖`);
        }
        
        state.modules.set(name, module);
        console.log(`模块 ${name} 注册完成`);
    }

    // 获取模块
    function getModule(name) {
        return state.modules.get(name);
    }

    // 绑定全局事件
    function bindGlobalEvents() {
        // 导航事件
        $(document).on('click', '[data-page]', function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            navigateToPage(page);
        });

        // 侧边栏切换事件
        $(document).on('click', '#sidebarToggle', function(e) {
            e.preventDefault();
            const sidebar = $('#sidebar');
            const mainContent = $('.main-content');
            
            sidebar.toggleClass('collapsed');
            
            // 保存侧边栏状态到localStorage
            const isCollapsed = sidebar.hasClass('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            
            events.emit('sidebar:toggled', { collapsed: isCollapsed });
        });

        // 恢复侧边栏状态
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            $('#sidebar').addClass('collapsed');
        }

        // 全局错误处理
        window.addEventListener('error', function(e) {
            console.error('全局错误:', e.error);
            showError('系统发生错误，请稍后重试');
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', function(e) {
            console.error('未处理的Promise拒绝:', e.reason);
            showError('系统发生错误，请稍后重试');
        });

        // 页面可见性变化
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                events.emit('app:hidden');
            } else {
                events.emit('app:visible');
            }
        });

        // 网络状态变化
        window.addEventListener('online', function() {
            events.emit('network:online');
            showSuccess('网络连接已恢复');
        });

        window.addEventListener('offline', function() {
            events.emit('network:offline');
            showWarning('网络连接已断开');
        });
    }

    // 页面导航
    function navigateToPage(pageName, params = {}) {
        if (state.loading) {
            console.warn('页面正在加载中，请稍候');
            return;
        }

        const module = getModule(pageName);
        if (!module) {
            console.error(`页面模块 ${pageName} 不存在`);
            showError('页面不存在');
            return;
        }

        try {
            setLoading(true);
            
            // 更新导航状态
            updateNavigation(pageName);
            
            // 更新面包屑
            updateBreadcrumb(pageName, params);
            
            // 加载页面内容
            if (typeof module.render === 'function') {
                const content = module.render(params);
                $('#page-content').html(content).addClass('fade-in');
            }
            
            // 初始化页面
            if (typeof module.initialize === 'function') {
                module.initialize(params);
            }
            
            state.currentPage = pageName;
            events.emit('page:changed', { page: pageName, params });
            
        } catch (error) {
            console.error(`页面 ${pageName} 加载失败:`, error);
            showError('页面加载失败');
        } finally {
            setLoading(false);
        }
    }

    // 更新导航状态
    function updateNavigation(pageName) {
        $('.nav-link').removeClass('active');
        $(`.nav-link[data-page="${pageName}"]`).addClass('active');
    }

    // 更新面包屑
    function updateBreadcrumb(pageName, params = {}) {
        const breadcrumbMap = {
            dashboard: [{ text: '仪表板', page: 'dashboard' }],
            vehicles: [{ text: '车辆管理', page: 'vehicles' }],
            gateways: [{ text: '网关管理', page: 'gateways' }],
            routes: [{ text: '路线管理', page: 'routes' }],
            tasks: [{ text: '任务管理', page: 'tasks' }],
            monitor: [{ text: '实时监控', page: 'monitor' }],
            alerts: [{ text: '警报管理', page: 'alerts' }],
            
            '809-gateways': [{ text: '809网关配置', page: '809-gateways' }],
            
            '809-tasks': [{ text: '809任务管理', page: '809-tasks' }],
            '809-logs': [{ text: '809报文日志管理', page: '809-logs' }]
        };

        const breadcrumb = breadcrumbMap[pageName] || [{ text: '未知页面', page: pageName }];
        const breadcrumbHtml = breadcrumb.map(item => {
            if (item.page === pageName) {
                return `<li class="breadcrumb-item active">${item.text}</li>`;
            } else {
                return `<li class="breadcrumb-item"><a href="#" data-page="${item.page}">${item.text}</a></li>`;
            }
        }).join('');

        $('#breadcrumb').html(`
            <li class="breadcrumb-item"><a href="#" data-page="dashboard">首页</a></li>
            ${breadcrumbHtml}
        `);
    }

    // 获取初始页面
    function getInitialPage() {
        const hash = window.location.hash.substring(1);
        return hash || 'dashboard';
    }

    // 加载用户信息
    function loadUserInfo() {
        const userInfo = utils.storage.get('userInfo');
        if (userInfo) {
            state.user = userInfo;
            events.emit('user:loaded', userInfo);
        }
    }

    // 设置加载状态
    function setLoading(loading) {
        state.loading = loading;
        if (loading) {
            $('#page-content').addClass('loading');
        } else {
            $('#page-content').removeClass('loading');
        }
        events.emit('loading:changed', loading);
    }

    // 隐藏加载界面
    function hideLoading() {
        $('#loading').fadeOut(config.pageTransition, function() {
            $('#main-app').removeClass('d-none').addClass('fade-in');
        });
    }

    // 通知方法
    function showNotification(message, type = 'info', duration = 3000) {
        const toastId = utils.generateUUID();
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = $(`
            <div class="toast" id="${toastId}" role="alert">
                <div class="toast-header">
                    <i class="fa ${iconMap[type]} me-2 text-${type}"></i>
                    <strong class="me-auto">系统通知</strong>
                    <small class="text-muted">刚刚</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `);

        $('#toastContainer').append(toast);
        
        const bsToast = new bootstrap.Toast(toast[0], {
            delay: duration
        });
        
        bsToast.show();
        
        // 自动清理
        setTimeout(() => {
            toast.remove();
        }, duration + 1000);
    }

    function showSuccess(message, duration) {
        showNotification(message, 'success', duration);
    }

    function showError(message, duration) {
        showNotification(message, 'error', duration);
    }

    function showWarning(message, duration) {
        showNotification(message, 'warning', duration);
    }

    function showInfo(message, duration) {
        showNotification(message, 'info', duration);
    }

    // 公共API
    return {
        // 核心方法
        init,
        registerModule,
        getModule,
        navigateToPage,
        get api() { return window.API; },
        
        // 状态管理
        getState: () => ({ ...state }),
        getConfig: () => ({ ...config }),
        
        // 事件系统
        on: events.on.bind(events),
        off: events.off.bind(events),
        emit: events.emit.bind(events),
        
        // 工具方法
        utils,
        setLoading,
        
        // 通知方法
        showToast: (msg, type = 'info', duration) => showNotification(msg, type, duration),
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showNotification,
        confirm: (...args) => {
            let message = '确认操作';
            let title = '确认';
            let callback = null;
            if (typeof args[0] === 'string' && typeof args[1] === 'string' && typeof args[2] === 'function') {
                // 用法：confirm(title, message, callback)
                title = args[0];
                message = args[1];
                callback = args[2];
            } else if (typeof args[0] === 'string' && typeof args[1] === 'function') {
                // 用法：confirm(message, callback)
                message = args[0];
                callback = args[1];
            } else if (typeof args[0] === 'string' && typeof args[1] === 'string') {
                // 用法：confirm(message, title)
                message = args[0];
                title = args[1];
            } else if (typeof args[0] === 'string') {
                message = args[0];
            }

            return new Promise((resolve) => {
                const modal = window.Components?.Modal?.create({
                    title,
                    content: message,
                    buttons: [
                        { text: '取消', type: 'secondary', dismiss: true, handler: () => resolve(false) },
                        { text: '确定', type: 'primary', action: 'confirm', dismiss: true, handler: () => resolve(true) }
                    ]
                });
                modal.show();
            }).then((ok) => {
                if (ok && typeof callback === 'function') {
                    try { callback(); } catch (e) {}
                }
                return ok;
            });
        }
    };
})();
