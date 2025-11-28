/**
 * 统一的消息提示组件系统
 * 整合Toast、Modal和传统toastr功能
 */

// 统一的消息提示接口
window.Notification = {
    
    // 成功消息
    success: function(message, title = '成功', options = {}) {
        if (window.modernToast) {
            modernToast.success(message, title, options);
        } else if (window.toastr) {
            toastr('success', message);
        } else {
            alert(message);
        }
    },
    
    // 错误消息
    error: function(message, title = '错误', options = {}) {
        if (window.modernToast) {
            modernToast.error(message, title, options);
        } else if (window.toastr) {
            toastr('error', message);
        } else {
            alert(message);
        }
    },
    
    // 警告消息
    warning: function(message, title = '警告', options = {}) {
        if (window.modernToast) {
            modernToast.warning(message, title, options);
        } else if (window.toastr) {
            toastr('warning', message);
        } else {
            alert(message);
        }
    },
    
    // 信息消息
    info: function(message, title = '提示', options = {}) {
        if (window.modernToast) {
            modernToast.info(message, title, options);
        } else if (window.toastr) {
            toastr('info', message);
        } else {
            alert(message);
        }
    },
    
    // 确认对话框
    confirm: function(message, title = '确认', onConfirm = null, onCancel = null, options = {}) {
        if (window.modernModal) {
            modernModal.confirm(message, title, onConfirm, onCancel, options);
        } else {
            if (confirm(message)) {
                if (onConfirm) onConfirm();
            } else {
                if (onCancel) onCancel();
            }
        }
    },
    
    // 信息对话框
    alert: function(message, title = '提示', onClose = null, options = {}) {
        if (window.modernModal) {
            modernModal.alert(message, title, onClose, options);
        } else {
            alert(message);
            if (onClose) onClose();
        }
    },
    
    // 加载提示
    loading: function(message = '加载中...', options = {}) {
        if (window.modernModal) {
            return modernModal.loading(message, options);
        } else {
            // 简单的加载提示实现
            const loadingId = 'loading-' + Date.now();
            const loadingDiv = document.createElement('div');
            loadingDiv.id = loadingId;
            loadingDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 10000;
                font-size: 14px;
            `;
            loadingDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="margin-bottom: 10px;">⏳</div>
                    <div>${message}</div>
                </div>
            `;
            document.body.appendChild(loadingDiv);
            
            return {
                close: function() {
                    const el = document.getElementById(loadingId);
                    if (el) el.remove();
                }
            };
        }
    },
    
    // 进度提示
    progress: function(message = '处理中...', progress = 0, options = {}) {
        if (window.modernModal) {
            return modernModal.progress(message, progress, options);
        } else {
            return this.loading(message + ' (' + Math.round(progress) + '%)', options);
        }
    }
};

// 为了向后兼容，保留原有的toastr函数
if (!window.toastr) {
    window.toastr = function(type, message) {
        switch(type) {
            case 'success':
                Notification.success(message);
                break;
            case 'error':
                Notification.error(message);
                break;
            case 'warning':
                Notification.warning(message);
                break;
            case 'info':
                Notification.info(message);
                break;
            default:
                Notification.info(message);
        }
    };
}

// 简化的全局函数
window.notify = window.Notification;
window.showSuccess = function(message) { Notification.success(message); };
window.showError = function(message) { Notification.error(message); };
window.showWarning = function(message) { Notification.warning(message); };
window.showInfo = function(message) { Notification.info(message); };
window.showConfirm = function(message, onConfirm, onCancel) { 
    Notification.confirm(message, '确认', onConfirm, onCancel); 
};

console.log('统一消息提示组件系统已加载');