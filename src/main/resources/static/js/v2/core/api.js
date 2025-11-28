/**
 * JTT808模拟器 V2 API服务层
 * 负责与后端API的通信
 */

window.API = (function() {
    'use strict';

    // API配置
    const config = {
        baseURL: '',
        timeout: 30000,
        retryCount: 3,
        retryDelay: 1000
    };

    // 请求拦截器
    const requestInterceptors = [];
    const responseInterceptors = [];

    // 请求队列（用于防重复请求）
    const requestQueue = new Map();

    // 创建请求唯一标识
    function createRequestKey(url, method, data) {
        return `${method.toUpperCase()}:${url}:${JSON.stringify(data || {})}`;
    }

    // 基础请求方法
    async function request(options) {
        const {
            url,
            method = 'GET',
            data = null,
            headers = {},
            timeout = config.timeout,
            retry = config.retryCount,
            preventDuplicate = true
        } = options;

        // 创建请求标识
        const requestKey = createRequestKey(url, method, data);

        // 防重复请求
        if (preventDuplicate && requestQueue.has(requestKey)) {
            console.log(`请求已在队列中: ${requestKey}`);
            return requestQueue.get(requestKey);
        }

        // 构建完整URL
        const fullURL = url.startsWith('http') ? url : `${config.baseURL}${url}`;

        // 默认请求头
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };

        // 合并请求头
        const finalHeaders = { ...defaultHeaders, ...headers };
        
        // 提取并设置 contentType（jQuery 使用该配置设置请求头）
        const contentType = finalHeaders['Content-Type'] || 'application/json';
        
        // 从 headers 中移除 Content-Type，避免与 contentType 重复
        const { ['Content-Type']: _omit, ...headersWithoutContentType } = finalHeaders;

        // 执行请求拦截器
        let requestConfig = {
            url: fullURL,
            method: method.toUpperCase(),
            data,
            headers: headersWithoutContentType,
            contentType,
            timeout
        };

        for (const interceptor of requestInterceptors) {
            try {
                requestConfig = await interceptor(requestConfig);
                if (!requestConfig) {
                    throw new Error('请求被拦截器取消');
                }
            } catch (error) {
                console.error('请求拦截器错误:', error);
                throw error;
            }
        }

        // 创建Promise并加入队列
        const requestPromise = executeRequest(requestConfig, retry);
        
        if (preventDuplicate) {
            requestQueue.set(requestKey, requestPromise);
        }

        try {
            const response = await requestPromise;
            
            // 执行响应拦截器
            let finalResponse = response;
            for (const interceptor of responseInterceptors) {
                try {
                    finalResponse = await interceptor(finalResponse);
                } catch (error) {
                    console.error('响应拦截器错误:', error);
                    throw error;
                }
            }

            return finalResponse;
        } finally {
            // 从队列中移除
            if (preventDuplicate) {
                requestQueue.delete(requestKey);
            }
        }
    }

    // 执行实际请求
    async function executeRequest(config, retryCount) {
        const { url, method, data, headers, contentType, timeout } = config;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
                let requestData = data;
                
                // 根据Content-Type处理数据格式
                if (method !== 'GET' && data) {
                    const ct = contentType || '';
                    if (ct.includes('application/x-www-form-urlencoded')) {
                        // 转换为URL编码格式
                        requestData = $.param(data);
                    } else if (ct.includes('application/json')) {
                        // JSON格式
                        requestData = JSON.stringify(data);
                    }
                }

                const response = await $.ajax({
                    url,
                    method,
                    data: method === 'GET' ? data : requestData,
                    headers,
                    contentType,
                    timeout,
                    dataType: 'json'
                });

                return {
                    data: response,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config
                };

            } catch (error) {
                console.error(`请求失败 (尝试 ${attempt + 1}/${retryCount + 1}):`, error);

                // 如果是最后一次尝试，抛出错误
                if (attempt === retryCount) {
                    throw formatError(error, config);
                }

                // 等待后重试
                if (attempt < retryCount) {
                    await sleep(config.retryDelay * (attempt + 1));
                }
            }
        }
    }

    // 格式化错误
    function formatError(error, config) {
        const formattedError = {
            message: '请求失败',
            status: 0,
            statusText: '',
            data: null,
            config
        };

        if (error.responseJSON) {
            formattedError.data = error.responseJSON;
            formattedError.message = (error.responseJSON.error && error.responseJSON.error.reason) || error.responseJSON.message || '服务器错误';
        } else if (error.responseText) {
            formattedError.message = error.responseText;
        } else if (error.statusText) {
            formattedError.message = error.statusText;
        }

        formattedError.status = (error.responseJSON && error.responseJSON.error && error.responseJSON.error.code) || error.status || 0;
        formattedError.statusText = error.statusText || '';

        return formattedError;
    }

    // 睡眠函数
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // HTTP方法快捷方式
    const get = (url, params, options = {}) => {
        return request({
            url,
            method: 'GET',
            data: params,
            ...options
        });
    };

    const post = (url, data, options = {}) => {
        return request({
            url,
            method: 'POST',
            data,
            ...options
        });
    };

    const put = (url, data, options = {}) => {
        return request({
            url,
            method: 'PUT',
            data,
            ...options
        });
    };

    const del = (url, options = {}) => {
        return request({
            url,
            method: 'DELETE',
            ...options
        });
    };

    const patch = (url, data, options = {}) => {
        return request({
            url,
            method: 'PATCH',
            data,
            ...options
        });
    };

    // 文件上传
    async function upload(url, file, options = {}) {
        const {
            onProgress,
            headers = {},
            data = {}
        } = options;

        const formData = new FormData();
        formData.append('file', file);
        
        // 添加额外数据
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        return new Promise((resolve, reject) => {
            $.ajax({
                url: url.startsWith('http') ? url : `${config.baseURL}${url}`,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers,
                xhr: function() {
                    const xhr = new window.XMLHttpRequest();
                    if (onProgress) {
                        xhr.upload.addEventListener('progress', function(e) {
                            if (e.lengthComputable) {
                                const percentComplete = (e.loaded / e.total) * 100;
                                onProgress(percentComplete);
                            }
                        });
                    }
                    return xhr;
                },
                success: function(response) {
                    resolve({
                        data: response,
                        status: 200,
                        statusText: 'OK'
                    });
                },
                error: function(error) {
                    reject(formatError(error));
                }
            });
        });
    }

    // 添加请求拦截器
    function addRequestInterceptor(interceptor) {
        if (typeof interceptor === 'function') {
            requestInterceptors.push(interceptor);
        }
    }

    // 添加响应拦截器
    function addResponseInterceptor(interceptor) {
        if (typeof interceptor === 'function') {
            responseInterceptors.push(interceptor);
        }
    }

    // 设置配置
    function setConfig(newConfig) {
        Object.assign(config, newConfig);
    }

    // 获取配置
    function getConfig() {
        return { ...config };
    }

    // 清空请求队列
    function clearQueue() {
        requestQueue.clear();
    }

    // 业务API方法
    const vehicleAPI = {
        // 获取车辆列表
        list(params) {
            return get('/vehicle/list', params);
        },
        
        // 兼容旧方法名
        getList(params) {
            return this.list(params);
        },

        // 获取车辆详情
        get(id) {
            return get(`/vehicle/detail`, { id }).then(res => ({
                data: res.data?.data || {},
                status: res.status,
                statusText: res.statusText
            }));
        },
        
        // 兼容旧方法名
        getDetail(id) {
            return this.get(id);
        },

        // 创建车辆
        create(data) {
            return post('/vehicle/save', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },

        // 更新车辆
        update(id, data) {
            return post('/vehicle/save', { ...data, id }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },

        // 删除车辆
        delete(id) {
            return post('/vehicle/remove', { id }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        },

        // 启动车辆（实际是更新状态为启用）
        start(id) {
            return post('/vehicle/updateStatus', { id, status: 1 });
        },

        // 停止车辆（实际是更新状态为禁用）
        stop(id) {
            return post('/vehicle/updateStatus', { id, status: 0 });
        },

        // 批量操作
        batch(operation, ids) {
            return post(`/vehicle/batch/${operation}`, { ids });
        },

        // 批量创建车辆
        batchCreate(data) {
            return post('/vehicle/batchSave', data);
        },

        // 更新车辆状态
        updateStatus(id, status) {
            return post('/vehicle/updateStatus', { id, status });
        }
    };

    const gatewayAPI = {
        // 获取网关列表
        list(params = {}) {
            const query = {
                name: params.keyword || '',
                pageIndex: params.page || 1,
                pageSize: params.size || 10
            };
            return get('/gateway/list', query).then(res => {
                const page = res.data?.data || {};
                const list = (page.list || []).map(item => ({
                    id: item.id,
                    gatewayName: item.name,
                    ipAddress: item.host,
                    port: item.port,
                    status: (item.status === 1 ? 'active' : 'inactive'),
                    protocolVersion: 'jtt808-2013',
                    currentConnections: 0,
                    maxConnections: 0,
                    lastActiveTime: item.updateTime,
                    description: item.description || ''
                }));
                return {
                    data: {
                        content: list,
                        totalElements: page.recordCount || 0,
                        totalPages: page.pageCount || 0
                    },
                    status: res.status,
                    statusText: res.statusText
                };
            });
        },
        
        // 兼容旧方法名
        getList(params) {
            return this.list(params);
        },

        // 获取网关详情
        get(id) {
            return get('/gateway/detail', { id }).then(res => {
                const gw = res.data?.data || {};
                const mapped = {
                    id: gw.id,
                    gatewayName: gw.name,
                    ipAddress: gw.host,
                    port: gw.port,
                    status: (gw.status === 1 ? 'active' : 'inactive'),
                    protocolVersion: 'jtt808-2013',
                    maxConnections: 0,
                    currentConnections: 0,
                    timeout: 30,
                    autoStart: gw.status === 1,
                    description: gw.description || ''
                };
                return { data: mapped, status: res.status, statusText: res.statusText };
            });
        },

        // 创建网关
        create(data) {
            const payload = {
                name: data.gatewayName,
                host: data.ipAddress,
                port: parseInt(data.port, 10),
                description: data.description || '',
                status: data.autoStart ? 1 : 0
            };
            return post('/gateway/save', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        },

        // 更新网关
        update(id, data) {
            const payload = {
                id,
                name: data.gatewayName,
                host: data.ipAddress,
                port: parseInt(data.port, 10),
                description: data.description || '',
                status: data.autoStart ? 1 : 0
            };
            return post('/gateway/save', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        },

        // 删除网关
        delete(id) {
            return post('/gateway/remove', { id }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        },

        // 更新网关状态
        updateStatus(id, status) {
            return post('/gateway/updateStatus', { id, status }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        },

        // 连接监控
        getConnections(id) {
            return get('/gateway/connections', { id }).then(res => ({ data: res.data?.data || {}, status: res.status }));
        }
    };

    const gateway809API = {
        list(params = {}) {
            const query = {
                name: params.keyword || '',
                pageIndex: params.page || 1,
                pageSize: params.size || 10
            };
            return get('/809/gateway/list', query).then(res => {
                const page = res.data?.data || {};
                const list = (page.list || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    ip: item.ip || item.primaryAddr,
                    port: item.port || item.primaryPort,
                    centerId: item.centerId,
                    version: item.version,
                    status: (item.status === 1 ? 'active' : 'inactive'),
                    description: item.description || ''
                }));
                return {
                    data: {
                        content: list,
                        totalElements: page.recordCount || 0,
                        totalPages: page.pageCount || 0
                    },
                    status: res.status,
                    statusText: res.statusText
                };
            });
        },
        get(id) {
            return get('/809/gateway/detail', { id }).then(res => {
                const gw = res.data?.data || {};
                const mapped = {
                    id: gw.id,
                    name: gw.name,
                    ip: gw.ip || gw.primaryAddr,
                    port: gw.port || gw.primaryPort,
                    userId: gw.userId,
                    password: gw.password,
                    centerId: gw.centerId,
                    version: gw.version,
                    encryptEnable: gw.encryptEnable,
                    m1: gw.m1,
                    ia1: gw.ia1,
                    ic1: gw.ic1,
                    status: (gw.status === 1 ? 'active' : 'inactive'),
                    description: gw.description || ''
                };
                return { data: mapped, status: res.status, statusText: res.statusText };
            });
        },
        create(data) {
            const payload = {
                name: data.name,
                ip: data.ip,
                port: parseInt(data.port, 10),
                userid: data.userid,
                pwd: data.pwd,
                centerId: data.centerId ? parseInt(data.centerId, 10) : undefined,
                version: data.version || '2011',
                encryptEnable: parseInt(data.encryptEnable || '0', 10),
                m1: parseInt(data.m1 || '0', 10),
                ia1: parseInt(data.ia1 || '0', 10),
                ic1: parseInt(data.ic1 || '0', 10),
                description: data.description || '',
                status: data.status ? 1 : 0
            };
            return post('/809/gateway/save', payload, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
        },
        update(id, data) {
            const payload = {
                id,
                name: data.name,
                ip: data.ip,
                port: parseInt(data.port, 10),
                userid: data.userid,
                pwd: data.pwd,
                centerId: data.centerId ? parseInt(data.centerId, 10) : undefined,
                version: data.version || '2011',
                encryptEnable: parseInt(data.encryptEnable || '0', 10),
                m1: parseInt(data.m1 || '0', 10),
                ia1: parseInt(data.ia1 || '0', 10),
                ic1: parseInt(data.ic1 || '0', 10),
                description: data.description || '',
                status: data.status ? 1 : 0
            };
            return post('/809/gateway/save', payload, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
        },
        delete(id) {
            return post('/809/gateway/remove', { id }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
        },
        updateStatus(id, status) {
            return post('/809/gateway/updateStatus', { id, status }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
        }
    };

    const routeAPI = {
        // 获取路线列表（分页）
        list(params = {}) {
            const query = {
                pageIndex: params.page || 1,
                pageSize: params.size || 10
            };
            return get('/route/list', query).then(res => {
                const page = res.data?.data || {};
                return {
                    success: true,
                    data: {
                        records: page.list || [],
                        total: page.recordCount || 0,
                        pageIndex: page.pageIndex || query.pageIndex,
                        pageSize: page.pageSize || query.pageSize
                    },
                    status: res.status,
                    statusText: res.statusText
                };
            });
        },

        stats(ids = []) {
            const queryIds = Array.isArray(ids) ? ids.join(',') : String(ids || '');
            if (!queryIds) return Promise.resolve({ success: true, data: [] });
            return get('/route/stats', { ids: queryIds }).then(res => ({ success: true, data: res.data?.data || [] }));
        },

        // 详情
        get(id) {
            return get('/route/detail', { id }).then(res => {
                const data = res.data?.data || null;
                return { success: !!data, data, status: res.status, statusText: res.statusText };
            });
        },

        // 创建路线（适配 /route/save 所需参数）
        create(data) {
            const name = data.name || '未命名路线';
            const minSpeed = parseInt(data.minSpeed || 10, 10);
            const maxSpeed = parseInt(data.maxSpeed || 120, 10);
            const type = data.type || 'normal';
            const startName = data.startName || '';
            const endName = data.endName || '';
            let points = [];
            try {
                if (Array.isArray(data.points)) points = data.points;
                else if (typeof data.points === 'string' && data.points.trim()) points = JSON.parse(data.points);
            } catch (e) {}
            if (!points || points.length === 0) {
                const sc = (data.startCoord || '').split(',').map(s => parseFloat(s));
                const ec = (data.endCoord || '').split(',').map(s => parseFloat(s));
                if (sc.length === 2 && ec.length === 2 && !isNaN(sc[0]) && !isNaN(sc[1]) && !isNaN(ec[0]) && !isNaN(ec[1])) {
                    points = [ { lng: sc[0], lat: sc[1], speed: 60 }, { lng: ec[0], lat: ec[1], speed: 60 } ];
                }
            }
            const mileages = data.mileages ? parseInt(data.mileages, 10) : Math.max(10, (points?.length || 2) * 1);
            const payload = {
                name,
                minSpeed,
                maxSpeed,
                mileages,
                type,
                startName,
                endName,
                pointsJsonText: JSON.stringify(points || []),
                stayPointsJsonText: JSON.stringify([]),
                segmentsJsonText: JSON.stringify([])
            };
            return post('/route/save', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            }).then(() => ({ success: true }));
        },
        // 更新路线（后端无更新接口，先删除再创建）
        update(id, data) {
            return post('/route/remove', { id }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            }).then(() => this.create(data));
        },

        // 删除
        delete(id) {
            return post('/route/remove', { id }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            }).then(() => ({ success: true }));
        },

        // 切换状态/批量操作（后端无接口，直接成功）
        toggleStatus(id) { return Promise.resolve({ success: true }); },
        batchOperation(op, ids) { return Promise.resolve({ success: true }); }
    };

    const taskAPI = {
        list(params = {}) {
            const query = {
                pageIndex: params.page || 1,
                pageSize: params.size || 20
            };
            return get('/task/list', query).then(res => {
                const page = res.data?.data || {};
                return {
                    data: {
                        content: page.list || [],
                        totalElements: page.recordCount || 0,
                        totalPages: page.pageCount || 0
                    },
                    status: res.status,
                    statusText: res.statusText
                };
            });
        },
        terminate(id) {
            return post('/task/terminate', { id }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        },
        terminateBatch(ids) {
            const payload = { ids: Array.isArray(ids) ? ids.join(',') : String(ids||'') };
            return post('/task/terminateBatch', payload, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        },
        logs(id, since = 0) {
            return get('/task/logs', { id, since }).then(res => ({ data: res.data?.data || [], status: res.status }));
        },
        clearLogs(id) {
            return post('/task/logs/clear', { id }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        },
        history(params = {}) {
            const query = { pageIndex: params.page || 1, pageSize: params.size || 20 };
            return get('/task/history', query).then(res => {
                const page = res.data?.data || {};
                return {
                    data: {
                        content: page.list || [],
                        totalElements: page.recordCount || 0,
                        totalPages: page.pageCount || 0
                    },
                    status: res.status,
                    statusText: res.statusText
                };
            });
        }
    };

    const monitorAPI = {
        // 获取监控数据（任务监控列表）
        getData(params) {
            return get('/monitor/list/json', params);
        },

        // 获取实时位置
        getLocation(vehicleId) {
            return get('/monitor/position', { id: vehicleId, time: Date.now() });
        },

        // 获取统计信息（暂时返回模拟数据，因为后端没有对应接口）
        getStats() {
            // 返回模拟统计数据
            return Promise.resolve({
                data: {
                    onlineVehicles: 0,
                    activeGateways: 0,
                    runningTasks: 0,
                    todayMessages: 0
                }
            });
        }
    };

    // 初始化API
    function init() {
        // 添加默认请求拦截器
        addRequestInterceptor(async (config) => {
            // 添加认证token
            const token = window.App?.utils?.storage?.get('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            
            // 显示加载状态
            if (window.App) {
                window.App.setLoading(true);
            }
            
            return config;
        });

        // 添加默认响应拦截器
        addResponseInterceptor(async (response) => {
            if (window.App) {
                window.App.setLoading(false);
            }

            const body = response.data;
            if (body && body.error && typeof body.error.code !== 'undefined') {
                if (body.error.code !== 0) {
                    const error = new Error(body.error.reason || '请求失败');
                    error.code = body.error.code;
                    error.data = body;
                    throw error;
                }
            }

            return response;
        });

        console.log('API服务初始化完成');
    }

    // 公共API
    return {
        // 核心方法
        init,
        request,
        get,
        post,
        put,
        delete: del,
        patch,
        upload,
        
        // 配置管理
        setConfig,
        getConfig,
        
        // 拦截器
        addRequestInterceptor,
        addResponseInterceptor,
        
        // 工具方法
        clearQueue,
        
        // 业务API
        vehicle: vehicleAPI,
        gateway: gatewayAPI,
        gateway809: gateway809API,
        route: routeAPI,
        routeAPI: routeAPI,
        task: taskAPI,
        monitor: monitorAPI
    };
})();
