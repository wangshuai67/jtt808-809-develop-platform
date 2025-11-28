/**
 * 现代化弹窗组件 - 替换原生alert
 * 支持多种类型：success, error, warning, info, confirm
 */
class ModernModal {
    constructor() {
        this.modalContainer = null;
        this.init();
    }

    init() {
        // 创建弹窗容器
        this.createModalContainer();
        // 添加样式
        this.addStyles();
    }

    createModalContainer() {
        if (!document.getElementById('modern-modal-container')) {
            // 确保DOM已经加载完成
            if (document.body) {
                const container = document.createElement('div');
                container.id = 'modern-modal-container';
                document.body.appendChild(container);
                this.modalContainer = container;
            } else {
                // 如果body还没准备好，等待DOM加载完成
                document.addEventListener('DOMContentLoaded', () => {
                    this.createModalContainer();
                });
            }
        }
    }

    addStyles() {
        if (!document.getElementById('modern-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modern-modal-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .modal-overlay.show {
                    opacity: 1;
                }

                .modal-content {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                    transform: scale(0.9) translateY(20px);
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                }

                .modal-overlay.show .modal-content {
                    transform: scale(1) translateY(0);
                }

                .modal-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: white;
                }

                .modal-icon.success {
                    background: linear-gradient(135deg, #10B981, #34D399);
                }

                .modal-icon.error {
                    background: linear-gradient(135deg, #EF4444, #F87171);
                }

                .modal-icon.warning {
                    background: linear-gradient(135deg, #F59E0B, #FBBF24);
                }

                .modal-icon.info {
                    background: linear-gradient(135deg, #6B46C1, #8B5CF6);
                }

                .modal-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #1F2937;
                    text-align: center;
                    margin-bottom: 12px;
                }

                .modal-message {
                    font-size: 16px;
                    color: #6B7280;
                    text-align: center;
                    line-height: 1.5;
                    margin-bottom: 24px;
                }

                .modal-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .modal-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 80px;
                }

                .modal-btn.primary {
                    background: linear-gradient(135deg, #6B46C1, #8B5CF6);
                    color: white;
                }

                .modal-btn.primary:hover {
                    background: linear-gradient(135deg, #553C9A, #7C3AED);
                    transform: translateY(-1px);
                }

                .modal-btn.secondary {
                    background: #F3F4F6;
                    color: #6B7280;
                    border: 1px solid #E5E7EB;
                }

                .modal-btn.secondary:hover {
                    background: #E5E7EB;
                    color: #374151;
                }

                .modal-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #9CA3AF;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .modal-close:hover {
                    background: #F3F4F6;
                    color: #6B7280;
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(options = {}) {
        const {
            type = 'info',
            title = '',
            message = '',
            confirmText = '确定',
            cancelText = '取消',
            showCancel = false,
            onConfirm = null,
            onCancel = null,
            closable = true
        } = options;

        // 创建弹窗HTML
        const modalHTML = `
            <div class="modal-overlay" id="current-modal">
                <div class="modal-content">
                    ${closable ? '<button class="modal-close" onclick="modernModal.close()">&times;</button>' : ''}
                    <div class="modal-icon ${type}">
                        ${this.getIcon(type)}
                    </div>
                    ${title ? `<div class="modal-title">${title}</div>` : ''}
                    <div class="modal-message">${message}</div>
                    <div class="modal-buttons">
                        ${showCancel ? `<button class="modal-btn secondary" onclick="modernModal.handleCancel()">${cancelText}</button>` : ''}
                        <button class="modal-btn primary" onclick="modernModal.handleConfirm()">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;

        this.modalContainer.innerHTML = modalHTML;
        
        // 存储回调函数
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;

        // 显示动画
        setTimeout(() => {
            const overlay = document.getElementById('current-modal');
            if (overlay) {
                overlay.classList.add('show');
            }
        }, 10);

        // 阻止页面滚动
        document.body.style.overflow = 'hidden';
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

    close() {
        const overlay = document.getElementById('current-modal');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                this.modalContainer.innerHTML = '';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    handleConfirm() {
        if (this.onConfirm && typeof this.onConfirm === 'function') {
            this.onConfirm();
        }
        this.close();
    }

    handleCancel() {
        if (this.onCancel && typeof this.onCancel === 'function') {
            this.onCancel();
        }
        this.close();
    }

    // 便捷方法
    alert(message, title = '提示') {
        this.show({
            type: 'info',
            title: title,
            message: message
        });
    }

    success(message, title = '成功') {
        this.show({
            type: 'success',
            title: title,
            message: message
        });
    }

    error(message, title = '错误') {
        this.show({
            type: 'error',
            title: title,
            message: message
        });
    }

    warning(message, title = '警告') {
        this.show({
            type: 'warning',
            title: title,
            message: message
        });
    }

    confirm(message, title = '确认', onConfirm = null, onCancel = null) {
        this.show({
            type: 'warning',
            title: title,
            message: message,
            showCancel: true,
            onConfirm: onConfirm,
            onCancel: onCancel
        });
    }
}

// 创建全局实例
const modernModal = new ModernModal();

// 重写原生alert方法
window.alert = function(message) {
    modernModal.alert(message);
};

// 重写原生confirm方法
window.confirm = function(message) {
    return new Promise((resolve) => {
        modernModal.confirm(message, '确认', 
            () => resolve(true), 
            () => resolve(false)
        );
    });
};