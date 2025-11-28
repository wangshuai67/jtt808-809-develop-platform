/**
 * JTT808模拟器 V2 工具函数库
 * 提供常用的工具方法和辅助函数
 */

window.Utils = (function() {
    'use strict';

    // 数据验证工具
    const validator = {
        // 验证手机号
        isPhone(phone) {
            return /^1[3-9]\d{9}$/.test(phone);
        },

        // 验证邮箱
        isEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        // 验证身份证号
        isIdCard(idCard) {
            return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
        },

        // 验证车牌号
        isLicensePlate(plate) {
            return true;
        },

        // 验证IP地址
        isIP(ip) {
            return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
        },

        // 验证端口号
        isPort(port) {
            const num = parseInt(port);
            return num >= 1 && num <= 65535;
        },

        // 验证URL
        isURL(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },

        // 验证必填字段
        required(value) {
            return value !== null && value !== undefined && value !== '';
        },

        // 验证最小长度
        minLength(value, min) {
            return value && value.length >= min;
        },

        // 验证最大长度
        maxLength(value, max) {
            return !value || value.length <= max;
        },

        // 验证数字范围
        range(value, min, max) {
            const num = parseFloat(value);
            return !isNaN(num) && num >= min && num <= max;
        }
    };

    // 数据格式化工具
    const formatter = {
        // 格式化文件大小
        fileSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        // 格式化数字（千分位）
        number(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        // 格式化百分比
        percent(value, decimals = 2) {
            return (value * 100).toFixed(decimals) + '%';
        },

        // 格式化货币
        currency(amount, currency = '¥') {
            return currency + this.number(parseFloat(amount).toFixed(2));
        },

        // 格式化时间差
        timeDiff(startTime, endTime = new Date()) {
            const diff = new Date(endTime) - new Date(startTime);
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return `${days}天前`;
            if (hours > 0) return `${hours}小时前`;
            if (minutes > 0) return `${minutes}分钟前`;
            return `${seconds}秒前`;
        },

        // 格式化持续时间
        duration(ms) {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            const parts = [];
            if (days > 0) parts.push(`${days}天`);
            if (hours % 24 > 0) parts.push(`${hours % 24}小时`);
            if (minutes % 60 > 0) parts.push(`${minutes % 60}分钟`);
            if (seconds % 60 > 0) parts.push(`${seconds % 60}秒`);

            return parts.join('') || '0秒';
        },

        // 格式化状态
        status(status, statusMap = {}) {
            return statusMap[status] || status;
        }
    };

    // DOM操作工具
    const dom = {
        // 创建元素
        create(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'innerHTML') {
                    element.innerHTML = attributes[key];
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });
            
            if (content) {
                element.innerHTML = content;
            }
            
            return element;
        },

        // 查找元素
        find(selector, context = document) {
            return context.querySelector(selector);
        },

        // 查找所有元素
        findAll(selector, context = document) {
            return Array.from(context.querySelectorAll(selector));
        },

        // 添加类名
        addClass(element, className) {
            if (element) {
                element.classList.add(className);
            }
        },

        // 移除类名
        removeClass(element, className) {
            if (element) {
                element.classList.remove(className);
            }
        },

        // 切换类名
        toggleClass(element, className) {
            if (element) {
                element.classList.toggle(className);
            }
        },

        // 检查是否有类名
        hasClass(element, className) {
            return element ? element.classList.contains(className) : false;
        },

        // 设置样式
        setStyle(element, styles) {
            if (element && typeof styles === 'object') {
                Object.keys(styles).forEach(key => {
                    element.style[key] = styles[key];
                });
            }
        },

        // 获取元素位置
        getPosition(element) {
            if (!element) return { top: 0, left: 0 };
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top + window.pageYOffset,
                left: rect.left + window.pageXOffset,
                width: rect.width,
                height: rect.height
            };
        },

        // 滚动到元素
        scrollTo(element, options = {}) {
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    ...options
                });
            }
        }
    };

    // 数组工具
    const array = {
        // 数组去重
        unique(arr, key = null) {
            if (key) {
                const seen = new Set();
                return arr.filter(item => {
                    const value = item[key];
                    if (seen.has(value)) {
                        return false;
                    }
                    seen.add(value);
                    return true;
                });
            }
            return [...new Set(arr)];
        },

        // 数组分组
        groupBy(arr, key) {
            return arr.reduce((groups, item) => {
                const group = typeof key === 'function' ? key(item) : item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        },

        // 数组排序
        sortBy(arr, key, order = 'asc') {
            return [...arr].sort((a, b) => {
                const aVal = typeof key === 'function' ? key(a) : a[key];
                const bVal = typeof key === 'function' ? key(b) : b[key];
                
                if (aVal < bVal) return order === 'asc' ? -1 : 1;
                if (aVal > bVal) return order === 'asc' ? 1 : -1;
                return 0;
            });
        },

        // 数组分页
        paginate(arr, page, pageSize) {
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            return {
                data: arr.slice(start, end),
                total: arr.length,
                page,
                pageSize,
                totalPages: Math.ceil(arr.length / pageSize)
            };
        },

        // 数组查找
        findBy(arr, key, value) {
            return arr.find(item => item[key] === value);
        },

        // 数组过滤
        filterBy(arr, filters) {
            return arr.filter(item => {
                return Object.keys(filters).every(key => {
                    const filterValue = filters[key];
                    const itemValue = item[key];
                    
                    if (typeof filterValue === 'string') {
                        return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                    }
                    
                    return itemValue === filterValue;
                });
            });
        }
    };

    // 对象工具
    const object = {
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

        // 对象合并
        merge(target, ...sources) {
            if (!sources.length) return target;
            const source = sources.shift();

            if (this.isObject(target) && this.isObject(source)) {
                for (const key in source) {
                    if (this.isObject(source[key])) {
                        if (!target[key]) Object.assign(target, { [key]: {} });
                        this.merge(target[key], source[key]);
                    } else {
                        Object.assign(target, { [key]: source[key] });
                    }
                }
            }

            return this.merge(target, ...sources);
        },

        // 检查是否为对象
        isObject(item) {
            return item && typeof item === 'object' && !Array.isArray(item);
        },

        // 获取嵌套属性
        get(obj, path, defaultValue = undefined) {
            const keys = path.split('.');
            let result = obj;
            
            for (const key of keys) {
                if (result === null || result === undefined) {
                    return defaultValue;
                }
                result = result[key];
            }
            
            return result !== undefined ? result : defaultValue;
        },

        // 设置嵌套属性
        set(obj, path, value) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            let current = obj;
            
            for (const key of keys) {
                if (!(key in current) || !this.isObject(current[key])) {
                    current[key] = {};
                }
                current = current[key];
            }
            
            current[lastKey] = value;
            return obj;
        },

        // 删除属性
        unset(obj, path) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            let current = obj;
            
            for (const key of keys) {
                if (!(key in current)) {
                    return false;
                }
                current = current[key];
            }
            
            delete current[lastKey];
            return true;
        }
    };

    // 字符串工具
    const string = {
        // 首字母大写
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // 驼峰命名
        camelCase(str) {
            return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
        },

        // 短横线命名
        kebabCase(str) {
            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        },

        // 下划线命名
        snakeCase(str) {
            return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        },

        // 截断字符串
        truncate(str, length, suffix = '...') {
            if (str.length <= length) return str;
            return str.substring(0, length) + suffix;
        },

        // 移除HTML标签
        stripTags(str) {
            return str.replace(/<[^>]*>/g, '');
        },

        // 转义HTML
        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        // 反转义HTML
        unescapeHtml(str) {
            const div = document.createElement('div');
            div.innerHTML = str;
            return div.textContent || div.innerText || '';
        }
    };

    // URL工具
    const url = {
        // 解析URL参数
        parseQuery(search = window.location.search) {
            const params = new URLSearchParams(search);
            const result = {};
            for (const [key, value] of params) {
                result[key] = value;
            }
            return result;
        },

        // 构建URL参数
        buildQuery(params) {
            const searchParams = new URLSearchParams();
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    searchParams.append(key, params[key]);
                }
            });
            return searchParams.toString();
        },

        // 更新URL参数
        updateQuery(params, replace = false) {
            const currentParams = this.parseQuery();
            const newParams = { ...currentParams, ...params };
            const queryString = this.buildQuery(newParams);
            const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
            
            if (replace) {
                history.replaceState(null, '', newUrl);
            } else {
                history.pushState(null, '', newUrl);
            }
        },

        // 移除URL参数
        removeQuery(keys) {
            const currentParams = this.parseQuery();
            keys.forEach(key => delete currentParams[key]);
            const queryString = this.buildQuery(currentParams);
            const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
            history.replaceState(null, '', newUrl);
        }
    };

    // 设备检测工具
    const device = {
        // 检查是否为移动设备
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        // 检查是否为平板
        isTablet() {
            return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
        },

        // 检查是否为桌面设备
        isDesktop() {
            return !this.isMobile() && !this.isTablet();
        },

        // 获取屏幕尺寸
        getScreenSize() {
            return {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight
            };
        },

        // 获取视口尺寸
        getViewportSize() {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
    };

    // 初始化工具库
    function init() {
        console.log('工具库初始化完成');
    }

    // 公共API
    return {
        init,
        validator,
        formatter,
        dom,
        array,
        object,
        string,
        url,
        device
    };
})();