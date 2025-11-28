/**
 * JTT808模拟器 V2 路由管理
 * 负责前端路由和页面导航
 */

window.Router = (function() {
    'use strict';

    // 路由配置
    const routes = new Map();
    const middlewares = [];
    let currentRoute = null;
    let initialized = false;

    // 默认路由配置
    const defaultRoutes = {
        '': { page: 'dashboard', title: '仪表板' },
        'dashboard': { page: 'dashboard', title: '仪表板' },
        'vehicles': { page: 'vehicles', title: '车辆管理' },
        'vehicles/list': { page: 'vehicles', action: 'list', title: '车辆列表' },
        'vehicles/create': { page: 'vehicles', action: 'create', title: '添加车辆' },
        'vehicles/edit/:id': { page: 'vehicles', action: 'edit', title: '编辑车辆' },
        'vehicles/batch': { page: 'vehicles', action: 'batch', title: '批量创建' },
        'gateways': { page: 'gateways', title: '网关管理' },
        'gateways/list': { page: 'gateways', action: 'list', title: '网关列表' },
        'gateways/create': { page: 'gateways', action: 'create', title: '添加网关' },
        'gateways/edit/:id': { page: 'gateways', action: 'edit', title: '编辑网关' },
        'routes': { page: 'routes', title: '路线管理' },
        'routes/list': { page: 'routes', action: 'list', title: '路线列表' },
        'routes/create': { page: 'routes', action: 'create', title: '创建路线' },
        'routes/edit/:id': { page: 'routes', action: 'edit', title: '编辑路线' },
        'tasks': { page: 'tasks', title: '任务管理' },
        'tasks/list': { page: 'tasks', action: 'list', title: '任务列表' },
        'tasks/create': { page: 'tasks', action: 'create', title: '创建任务' },
        'tasks/edit/:id': { page: 'tasks', action: 'edit', title: '编辑任务' },
        'monitor': { page: 'monitor', title: '实时监控' },
        'monitor/map': { page: 'monitor', action: 'map', title: '地图监控' },
        'monitor/data': { page: 'monitor', action: 'data', title: '数据监控' },
        'settings': { page: 'settings', title: '系统配置' },
        'pressure': { page: 'pressure', title: '压测报表' },
        'alerts': { page: 'alerts', title: '警报管理' },
        
        '809/gateways': { page: '809-gateways', title: '809网关配置' },
        
        '809/tasks': { page: '809-tasks', title: '809任务管理' },
        '809/logs': { page: '809-logs', title: '809报文日志管理' }
    };

    // 路由参数解析
    function parseRoute(path) {
        const segments = path.split('/').filter(segment => segment);
        const params = {};
        let matchedRoute = null;
        let matchedPattern = null;

        // 查找匹配的路由
        for (const [pattern, config] of routes) {
            const patternSegments = pattern.split('/').filter(segment => segment);
            
            if (segments.length !== patternSegments.length) {
                continue;
            }

            let isMatch = true;
            const routeParams = {};

            for (let i = 0; i < patternSegments.length; i++) {
                const patternSegment = patternSegments[i];
                const pathSegment = segments[i];

                if (patternSegment.startsWith(':')) {
                    // 参数段
                    const paramName = patternSegment.substring(1);
                    routeParams[paramName] = decodeURIComponent(pathSegment);
                } else if (patternSegment !== pathSegment) {
                    // 不匹配
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                matchedRoute = config;
                matchedPattern = pattern;
                Object.assign(params, routeParams);
                break;
            }
        }

        return {
            path,
            route: matchedRoute,
            pattern: matchedPattern,
            params
        };
    }

    // 构建路由路径
    function buildPath(pattern, params = {}) {
        let path = pattern;
        
        // 替换参数
        Object.keys(params).forEach(key => {
            path = path.replace(`:${key}`, encodeURIComponent(params[key]));
        });

        return path;
    }

    // 导航到指定路径
    function navigate(path, options = {}) {
        const { replace = false, silent = false } = options;

        if (!initialized) {
            console.warn('路由器尚未初始化');
            return false;
        }

        // 解析路由
        const routeInfo = parseRoute(path);
        
        if (!routeInfo.route) {
            console.error(`路由不存在: ${path}`);
            // 导航到404页面或默认页面
            navigate('dashboard', { replace: true });
            return false;
        }

        // 执行中间件
        for (const middleware of middlewares) {
            try {
                const result = middleware(routeInfo);
                if (result === false) {
                    console.log('路由被中间件拦截');
                    return false;
                }
            } catch (error) {
                console.error('中间件执行错误:', error);
                return false;
            }
        }

        // 更新浏览器历史
        if (!silent) {
            if (replace) {
                history.replaceState({ path }, '', `#${path}`);
            } else {
                history.pushState({ path }, '', `#${path}`);
            }
        }

        // 更新当前路由
        currentRoute = routeInfo;

        // 更新页面标题
        if (routeInfo.route.title) {
            document.title = `${routeInfo.route.title} - JTT808模拟器`;
        }

        // 导航到页面
        if (window.App) {
            const params = {
                ...routeInfo.params,
                action: routeInfo.route.action
            };
            App.navigateToPage(routeInfo.route.page, params);
        }

        // 触发路由变化事件
        if (window.App) {
            App.emit('route:changed', routeInfo);
        }

        return true;
    }

    // 返回上一页
    function back() {
        history.back();
    }

    // 前进到下一页
    function forward() {
        history.forward();
    }

    // 重新加载当前页面
    function reload() {
        if (currentRoute) {
            navigate(currentRoute.path, { replace: true });
        }
    }

    // 添加路由
    function addRoute(pattern, config) {
        routes.set(pattern, config);
    }

    // 移除路由
    function removeRoute(pattern) {
        routes.delete(pattern);
    }

    // 添加中间件
    function use(middleware) {
        if (typeof middleware === 'function') {
            middlewares.push(middleware);
        }
    }

    // 获取当前路由信息
    function getCurrentRoute() {
        return currentRoute;
    }

    // 检查路由是否匹配
    function isActive(pattern, params = {}) {
        if (!currentRoute) return false;
        
        if (currentRoute.pattern === pattern) {
            // 检查参数是否匹配
            return Object.keys(params).every(key => 
                currentRoute.params[key] === params[key]
            );
        }
        
        return false;
    }

    // 处理浏览器前进后退
    function handlePopState(event) {
        const path = window.location.hash.substring(1) || '';
        navigate(path, { silent: true });
    }

    // 初始化路由器
    function init() {
        if (initialized) {
            console.warn('路由器已经初始化');
            return;
        }

        // 注册默认路由
        Object.keys(defaultRoutes).forEach(pattern => {
            addRoute(pattern, defaultRoutes[pattern]);
        });

        // 监听浏览器前进后退
        window.addEventListener('popstate', handlePopState);

        // 处理初始路由
        const initialPath = window.location.hash.substring(1) || '';
        navigate(initialPath, { silent: true });

        initialized = true;
        console.log('路由器初始化完成');
    }

    // 销毁路由器
    function destroy() {
        window.removeEventListener('popstate', handlePopState);
        routes.clear();
        middlewares.length = 0;
        currentRoute = null;
        initialized = false;
    }

    // 路由守卫中间件
    const authGuard = function(routeInfo) {
        // 检查是否需要认证
        const publicRoutes = ['login', 'register'];
        const needsAuth = !publicRoutes.includes(routeInfo.route.page);
        
        if (needsAuth) {
            // 检查用户是否已登录
            const user = window.App?.utils?.storage?.get('userInfo');
            if (!user) {
                console.log('需要登录');
                // 重定向到登录页面
                navigate('login', { replace: true });
                return false;
            }
        }
        
        return true;
    };

    // 权限检查中间件
    const permissionGuard = function(routeInfo) {
        // 检查用户权限
        const user = window.App?.utils?.storage?.get('userInfo');
        if (user && routeInfo.route.permission) {
            const hasPermission = user.permissions?.includes(routeInfo.route.permission);
            if (!hasPermission) {
                console.log('权限不足');
                window.App?.showError('您没有访问此页面的权限');
                return false;
            }
        }
        
        return true;
    };

    // 公共API
    return {
        // 核心方法
        init,
        destroy,
        navigate,
        back,
        forward,
        reload,
        
        // 路由管理
        addRoute,
        removeRoute,
        getCurrentRoute,
        isActive,
        
        // 中间件
        use,
        
        // 工具方法
        parseRoute,
        buildPath,
        
        // 内置守卫
        authGuard,
        permissionGuard
    };
})();
