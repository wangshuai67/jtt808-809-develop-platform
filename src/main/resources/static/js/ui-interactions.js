/**
 * UI交互增强功能
 * 提供丰富的用户界面交互体验
 */
class UIInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.initTooltips();
        this.initPopovers();
        this.initSmoothScrolling();
        this.initFormEnhancements();
        this.initButtonEffects();
        this.initTableEnhancements();
        this.initCardAnimations();
        this.initSearchEnhancements();
        this.initKeyboardShortcuts();
        this.initProgressBars();
        this.initCounters();
        this.initLazyLoading();
    }
    
    // 初始化工具提示
    initTooltips() {
        // 为所有带有title属性的元素添加工具提示
        document.querySelectorAll('[title]').forEach(element => {
            this.createTooltip(element);
        });
        
        // 为特定元素添加工具提示
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            this.createTooltip(element, element.getAttribute('data-tooltip'));
        });
    }
    
    createTooltip(element, text = null) {
        const tooltipText = text || element.getAttribute('title');
        if (!tooltipText) return;
        
        // 移除原始title属性以避免默认工具提示
        element.removeAttribute('title');
        
        let tooltip = null;
        
        element.addEventListener('mouseenter', (e) => {
            tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = tooltipText;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            `;
            
            document.body.appendChild(tooltip);
            
            // 计算位置
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 8;
            
            // 边界检查
            if (left < 8) left = 8;
            if (left + tooltipRect.width > window.innerWidth - 8) {
                left = window.innerWidth - tooltipRect.width - 8;
            }
            if (top < 8) {
                top = rect.bottom + 8;
            }
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            
            // 显示动画
            setTimeout(() => {
                if (tooltip) tooltip.style.opacity = '1';
            }, 10);
        });
        
        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 300);
            }
        });
    }
    
    // 初始化弹出框
    initPopovers() {
        document.querySelectorAll('[data-popover]').forEach(element => {
            this.createPopover(element);
        });
    }
    
    createPopover(element) {
        const content = element.getAttribute('data-popover');
        const title = element.getAttribute('data-popover-title') || '';
        
        let popover = null;
        let isVisible = false;
        
        element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isVisible) {
                this.hidePopover();
                return;
            }
            
            // 隐藏其他弹出框
            document.querySelectorAll('.custom-popover').forEach(p => p.remove());
            
            popover = document.createElement('div');
            popover.className = 'custom-popover';
            popover.innerHTML = `
                ${title ? `<div class="popover-header">${title}</div>` : ''}
                <div class="popover-body">${content}</div>
                <div class="popover-arrow"></div>
            `;
            
            popover.style.cssText = `
                position: absolute;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                max-width: 300px;
                opacity: 0;
                transform: scale(0.9);
                transition: all 0.3s ease;
            `;
            
            document.body.appendChild(popover);
            
            // 计算位置
            const rect = element.getBoundingClientRect();
            const popoverRect = popover.getBoundingClientRect();
            
            let left = rect.left + (rect.width / 2) - (popoverRect.width / 2);
            let top = rect.bottom + 8;
            
            // 边界检查
            if (left < 8) left = 8;
            if (left + popoverRect.width > window.innerWidth - 8) {
                left = window.innerWidth - popoverRect.width - 8;
            }
            if (top + popoverRect.height > window.innerHeight - 8) {
                top = rect.top - popoverRect.height - 8;
            }
            
            popover.style.left = left + 'px';
            popover.style.top = top + 'px';
            
            // 显示动画
            setTimeout(() => {
                if (popover) {
                    popover.style.opacity = '1';
                    popover.style.transform = 'scale(1)';
                }
            }, 10);
            
            isVisible = true;
        });
        
        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (isVisible && popover && !popover.contains(e.target) && !element.contains(e.target)) {
                this.hidePopover();
            }
        });
        
        this.hidePopover = () => {
            if (popover) {
                popover.style.opacity = '0';
                popover.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    if (popover && popover.parentNode) {
                        popover.parentNode.removeChild(popover);
                    }
                }, 300);
            }
            isVisible = false;
        };
    }
    
    // 平滑滚动
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // 表单增强
    initFormEnhancements() {
        // 浮动标签效果
        document.querySelectorAll('.form-floating input, .form-floating textarea').forEach(input => {
            this.addFloatingLabel(input);
        });
        
        // 实时验证
        document.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
            this.addRealTimeValidation(input);
        });
        
        // 密码强度指示器
        document.querySelectorAll('input[type="password"]').forEach(input => {
            if (input.classList.contains('password-strength')) {
                this.addPasswordStrengthIndicator(input);
            }
        });
        
        // 字符计数器
        document.querySelectorAll('textarea[maxlength], input[maxlength]').forEach(input => {
            this.addCharacterCounter(input);
        });
    }
    
    addFloatingLabel(input) {
        const label = input.nextElementSibling;
        if (!label || label.tagName !== 'LABEL') return;
        
        const checkFloat = () => {
            if (input.value || input === document.activeElement) {
                label.classList.add('floating');
            } else {
                label.classList.remove('floating');
            }
        };
        
        input.addEventListener('focus', checkFloat);
        input.addEventListener('blur', checkFloat);
        input.addEventListener('input', checkFloat);
        
        // 初始检查
        checkFloat();
    }
    
    addRealTimeValidation(input) {
        const showValidation = () => {
            if (input.value) {
                if (input.checkValidity()) {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                } else {
                    input.classList.remove('is-valid');
                    input.classList.add('is-invalid');
                }
            } else {
                input.classList.remove('is-valid', 'is-invalid');
            }
        };
        
        input.addEventListener('input', showValidation);
        input.addEventListener('blur', showValidation);
    }
    
    addPasswordStrengthIndicator(input) {
        const indicator = document.createElement('div');
        indicator.className = 'password-strength-indicator';
        indicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text">密码强度：<span>弱</span></div>
        `;
        
        input.parentNode.appendChild(indicator);
        
        input.addEventListener('input', () => {
            const strength = this.calculatePasswordStrength(input.value);
            const fill = indicator.querySelector('.strength-fill');
            const text = indicator.querySelector('.strength-text span');
            
            fill.style.width = strength.percentage + '%';
            fill.className = `strength-fill strength-${strength.level}`;
            text.textContent = strength.text;
        });
    }
    
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 25;
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;
        
        let level, text;
        if (score < 30) {
            level = 'weak';
            text = '弱';
        } else if (score < 60) {
            level = 'medium';
            text = '中等';
        } else if (score < 90) {
            level = 'strong';
            text = '强';
        } else {
            level = 'very-strong';
            text = '很强';
        }
        
        return { percentage: score, level, text };
    }
    
    addCharacterCounter(input) {
        const maxLength = parseInt(input.getAttribute('maxlength'));
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            font-size: 12px;
            color: #6b7280;
            text-align: right;
            margin-top: 4px;
        `;
        
        input.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const current = input.value.length;
            counter.textContent = `${current}/${maxLength}`;
            
            if (current > maxLength * 0.9) {
                counter.style.color = '#ef4444';
            } else if (current > maxLength * 0.7) {
                counter.style.color = '#f59e0b';
            } else {
                counter.style.color = '#6b7280';
            }
        };
        
        input.addEventListener('input', updateCounter);
        updateCounter();
    }
    
    // 按钮效果
    initButtonEffects() {
        document.querySelectorAll('.btn').forEach(button => {
            this.addRippleEffect(button);
            this.addLoadingState(button);
        });
    }
    
    addRippleEffect(button) {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    addLoadingState(button) {
        if (button.classList.contains('btn-loading')) {
            button.addEventListener('click', () => {
                this.setButtonLoading(button, true);
                
                // 模拟异步操作
                setTimeout(() => {
                    this.setButtonLoading(button, false);
                }, 2000);
            });
        }
    }
    
    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            
            const spinner = document.createElement('span');
            spinner.className = 'loading-spinner';
            spinner.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
            
            const originalText = button.innerHTML;
            button.setAttribute('data-original-text', originalText);
            button.innerHTML = '';
            button.appendChild(spinner);
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    }
    
    // 表格增强
    initTableEnhancements() {
        document.querySelectorAll('.table').forEach(table => {
            this.addTableSorting(table);
            this.addTableFiltering(table);
            this.addRowHover(table);
        });
    }
    
    addTableSorting(table) {
        const headers = table.querySelectorAll('th[data-sortable]');
        
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.innerHTML += ' <i class="fa fa-sort sort-icon"></i>';
            
            header.addEventListener('click', () => {
                this.sortTable(table, header);
            });
        });
    }
    
    sortTable(table, header) {
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const isAscending = !header.classList.contains('sort-asc');
        
        // 重置所有排序图标
        table.querySelectorAll('.sort-icon').forEach(icon => {
            icon.className = 'fa fa-sort sort-icon';
        });
        
        // 设置当前列的排序图标
        const icon = header.querySelector('.sort-icon');
        icon.className = `fa fa-sort-${isAscending ? 'up' : 'down'} sort-icon`;
        header.classList.toggle('sort-asc', isAscending);
        header.classList.toggle('sort-desc', !isAscending);
        
        // 排序行
        rows.sort((a, b) => {
            const aText = a.children[columnIndex].textContent.trim();
            const bText = b.children[columnIndex].textContent.trim();
            
            // 尝试数字比较
            const aNum = parseFloat(aText);
            const bNum = parseFloat(bText);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? aNum - bNum : bNum - aNum;
            }
            
            // 文本比较
            return isAscending ? aText.localeCompare(bText) : bText.localeCompare(aText);
        });
        
        // 重新插入排序后的行
        const tbody = table.querySelector('tbody');
        rows.forEach(row => tbody.appendChild(row));
    }
    
    addTableFiltering(table) {
        if (!table.querySelector('.table-filter')) return;
        
        const filterInput = table.querySelector('.table-filter');
        const rows = table.querySelectorAll('tbody tr');
        
        filterInput.addEventListener('input', (e) => {
            const filter = e.target.value.toLowerCase();
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
    }
    
    addRowHover(table) {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = '#f8fafc';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
            });
        });
    }
    
    // 卡片动画
    initCardAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.card').forEach(card => {
            observer.observe(card);
        });
    }
    
    // 搜索增强
    initSearchEnhancements() {
        document.querySelectorAll('.search-input').forEach(input => {
            this.addSearchSuggestions(input);
        });
    }
    
    addSearchSuggestions(input) {
        const suggestions = input.getAttribute('data-suggestions');
        if (!suggestions) return;
        
        const suggestionList = JSON.parse(suggestions);
        const dropdown = document.createElement('div');
        dropdown.className = 'search-suggestions';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 6px 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(dropdown);
        
        input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            if (value.length < 2) {
                dropdown.style.display = 'none';
                return;
            }
            
            const matches = suggestionList.filter(item => 
                item.toLowerCase().includes(value)
            );
            
            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(match => 
                    `<div class="suggestion-item" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f1f5f9;">${match}</div>`
                ).join('');
                dropdown.style.display = 'block';
                
                // 添加点击事件
                dropdown.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        input.value = item.textContent;
                        dropdown.style.display = 'none';
                    });
                });
            } else {
                dropdown.style.display = 'none';
            }
        });
        
        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
    
    // 键盘快捷键
    initKeyboardShortcuts() {
        const shortcuts = {
            'ctrl+k': () => this.focusSearch(),
            'ctrl+/': () => this.showShortcutsHelp(),
            'esc': () => this.closeModals()
        };
        
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });
    }
    
    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }
    
    focusSearch() {
        const searchInput = document.querySelector('.search-input, input[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    showShortcutsHelp() {
        // 显示快捷键帮助
        console.log('快捷键帮助');
    }
    
    closeModals() {
        // 关闭所有模态框
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // 进度条动画
    initProgressBars() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateProgressBar(entry.target);
                }
            });
        });
        
        document.querySelectorAll('.progress-bar').forEach(bar => {
            observer.observe(bar);
        });
    }
    
    animateProgressBar(bar) {
        const width = bar.getAttribute('data-width') || bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-in-out';
            bar.style.width = width;
        }, 100);
    }
    
    // 数字计数器
    initCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                }
            });
        });
        
        document.querySelectorAll('.counter').forEach(counter => {
            observer.observe(counter);
        });
    }
    
    animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    }
    
    // 懒加载
    initLazyLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            observer.observe(img);
        });
    }
}

// 全局实例
window.UIInteractions = UIInteractions;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.uiInteractions = new UIInteractions();
});

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIInteractions;
}