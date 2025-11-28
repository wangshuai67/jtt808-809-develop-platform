/**
 * 现代化Toast消息提示组件
 * 支持多种类型：success, error, warning, info
 */
class ModernToast {
    constructor() {
        this.toastContainer = null;
        this.toasts = [];
        this.init();
    }

    init() {
        this.createToastContainer();
        this.addStyles();
    }

    createToastContainer() {
        // 首先检查是否已经存在容器
        const existingContainer = document.getElementById('toast-container');
        if (existingContainer) {
            this.toastContainer = existingContainer;
            return;
        }

        // 确保DOM已经加载完成
        if (document.body) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
            this.toastContainer = container;
        } else {
            // 如果body还没准备好，等待DOM加载完成
            const self = this;
            document.addEventListener('DOMContentLoaded', function() {
                const container = document.createElement('div');
                container.id = 'toast-container';
                document.body.appendChild(container);
                self.toastContainer = container;
            });
        }
    }

    addStyles() {
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                #toast-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10001;
                    pointer-events: none;
                }

                .toast {
                    background: white;
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-bottom: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    border-left: 4px solid;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 300px;
                    max-width: 400px;
                    transform: translateX(100%);
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    pointer-events: auto;
                    position: relative;
                    overflow: hidden;
                }

                .toast.show {
                    transform: translateX(0);
                }

                .toast.hide {
                    transform: translateX(100%);
                    opacity: 0;
                }

                .toast.success {
                    border-left-color: #10B981;
                }

                .toast.error {
                    border-left-color: #EF4444;
                }

                .toast.warning {
                    border-left-color: #F59E0B;
                }

                .toast.info {
                    border-left-color: #6B46C1;
                }

                .toast-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: white;
                    font-weight: bold;
                    flex-shrink: 0;
                }

                .toast.success .toast-icon {
                    background: linear-gradient(135deg, #10B981, #34D399);
                }

                .toast.error .toast-icon {
                    background: linear-gradient(135deg, #EF4444, #F87171);
                }

                .toast.warning .toast-icon {
                    background: linear-gradient(135deg, #F59E0B, #FBBF24);
                }

                .toast.info .toast-icon {
                    background: linear-gradient(135deg, #6B46C1, #8B5CF6);
                }

                .toast-content {
                    flex: 1;
                }

                .toast-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1F2937;
                    margin-bottom: 2px;
                }

                .toast-message {
                    font-size: 13px;
                    color: #6B7280;
                    line-height: 1.4;
                }

                .toast-close {
                    background: none;
                    border: none;
                    color: #9CA3AF;
                    cursor: pointer;
                    font-size: 18px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .toast-close:hover {
                    background: #F3F4F6;
                    color: #6B7280;
                }

                .toast-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: linear-gradient(90deg, rgba(107, 70, 193, 0.3), rgba(139, 92, 246, 0.3));
                    transition: width linear;
                }

                .toast.success .toast-progress {
                    background: linear-gradient(90deg, rgba(16, 185, 129, 0.3), rgba(52, 211, 153, 0.3));
                }

                .toast.error .toast-progress {
                    background: linear-gradient(90deg, rgba(239, 68, 68, 0.3), rgba(248, 113, 113, 0.3));
                }

                .toast.warning .toast-progress {
                    background: linear-gradient(90deg, rgba(245, 158, 11, 0.3), rgba(251, 191, 36, 0.3));
                }

                @media (max-width: 480px) {
                    #toast-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                    }

                    .toast {
                        min-width: auto;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(options = {}) {
        // 确保容器存在
        if (!this.toastContainer) {
            this.createToastContainer();
        }
        
        // 如果容器仍然不存在，尝试强制创建
        if (!this.toastContainer && document.body) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
            this.toastContainer = container;
        }
        
        // 最后的fallback检查
        if (!this.toastContainer) {
            console.warn('Toast container not available, using alert fallback');
            alert(options.message || '操作完成');
            return;
        }

        const {
            type = 'info',
            title = '',
            message = '',
            duration = 4000,
            closable = true
        } = options;

        const toastId = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const toastHTML = `
            <div class="toast ${type}" id="${toastId}">
                <div class="toast-icon">
                    ${this.getIcon(type)}
                </div>
                <div class="toast-content">
                    ${title ? `<div class="toast-title">${title}</div>` : ''}
                    <div class="toast-message">${message}</div>
                </div>
                ${closable ? `<button class="toast-close" onclick="modernToast.close('${toastId}')">&times;</button>` : ''}
                ${duration > 0 ? `<div class="toast-progress" style="width: 100%; transition-duration: ${duration}ms;"></div>` : ''}
            </div>
        `;

        this.toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);

        // 添加到管理数组
        this.toasts.push(toastId);

        // 显示动画
        setTimeout(() => {
            toastElement.classList.add('show');
        }, 10);

        // 启动进度条动画
        if (duration > 0) {
            const progressBar = toastElement.querySelector('.toast-progress');
            if (progressBar) {
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 100);
            }
        }

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.close(toastId);
            }, duration);
        }

        return toastId;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    close(toastId) {
        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            toastElement.classList.add('hide');
            setTimeout(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                // 从管理数组中移除
                this.toasts = this.toasts.filter(id => id !== toastId);
            }, 300);
        }
    }

    closeAll() {
        this.toasts.forEach(toastId => {
            this.close(toastId);
        });
    }

    // 便捷方法
    success(message, title = '成功') {
        return this.show({
            type: 'success',
            title: title,
            message: message
        });
    }

    error(message, title = '错误') {
        return this.show({
            type: 'error',
            title: title,
            message: message,
            duration: 6000 // 错误消息显示更长时间
        });
    }

    warning(message, title = '警告') {
        return this.show({
            type: 'warning',
            title: title,
            message: message,
            duration: 5000
        });
    }

    info(message, title = '提示') {
        return this.show({
            type: 'info',
            title: title,
            message: message
        });
    }
}

// 创建全局实例
const modernToast = new ModernToast();