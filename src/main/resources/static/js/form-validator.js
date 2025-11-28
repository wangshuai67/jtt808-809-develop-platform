/**
 * 现代化表单验证组件
 * 提供统一的验证规则和错误提示
 */

class FormValidator {
    constructor(formSelector, options = {}) {
        this.form = typeof formSelector === 'string' ? document.querySelector(formSelector) : formSelector;
        this.options = {
            showErrorsInline: true,
            showErrorsAsToast: false,
            validateOnBlur: true,
            validateOnInput: false,
            errorClass: 'form-error',
            successClass: 'form-success',
            ...options
        };
        
        this.rules = {};
        this.messages = {};
        this.errors = {};
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // 阻止默认提交
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validate();
        });
        
        // 绑定实时验证
        if (this.options.validateOnBlur || this.options.validateOnInput) {
            this.bindRealTimeValidation();
        }
    }
    
    // 添加验证规则
    addRule(fieldName, rules, message = '') {
        this.rules[fieldName] = rules;
        if (message) {
            this.messages[fieldName] = message;
        }
        return this;
    }
    
    // 批量添加规则
    addRules(rulesObject) {
        Object.keys(rulesObject).forEach(fieldName => {
            const rule = rulesObject[fieldName];
            if (typeof rule === 'object' && rule.rules) {
                this.addRule(fieldName, rule.rules, rule.message);
            } else {
                this.addRule(fieldName, rule);
            }
        });
        return this;
    }
    
    // 验证单个字段
    validateField(fieldName, value = null) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return true;
        
        const fieldValue = value !== null ? value : field.value;
        const rules = this.rules[fieldName];
        
        if (!rules) return true;
        
        // 清除之前的错误
        delete this.errors[fieldName];
        this.clearFieldError(field);
        
        // 执行验证规则
        for (let rule of rules) {
            const result = this.executeRule(rule, fieldValue, field);
            if (!result.valid) {
                this.errors[fieldName] = result.message;
                this.showFieldError(field, result.message);
                return false;
            }
        }
        
        this.showFieldSuccess(field);
        return true;
    }
    
    // 验证整个表单
    validate() {
        this.errors = {};
        let isValid = true;
        
        Object.keys(this.rules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            this.onSuccess();
        } else {
            this.onError();
        }
        
        return isValid;
    }
    
    // 执行单个验证规则
    executeRule(rule, value, field) {
        if (typeof rule === 'function') {
            return rule(value, field);
        }
        
        if (typeof rule === 'object') {
            const { type, param, message } = rule;
            return this.executeBuiltInRule(type, value, param, message, field);
        }
        
        if (typeof rule === 'string') {
            return this.executeBuiltInRule(rule, value, null, null, field);
        }
        
        return { valid: true };
    }
    
    // 执行内置验证规则
    executeBuiltInRule(type, value, param, message, field) {
        const fieldName = field.name || field.id || '字段';
        
        switch (type) {
            case 'required':
                if (!value || value.trim() === '') {
                    return { valid: false, message: message || `${fieldName}不能为空` };
                }
                break;
                
            case 'minLength':
                if (value.length < param) {
                    return { valid: false, message: message || `${fieldName}长度不能少于${param}个字符` };
                }
                break;
                
            case 'maxLength':
                if (value.length > param) {
                    return { valid: false, message: message || `${fieldName}长度不能超过${param}个字符` };
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    return { valid: false, message: message || `请输入有效的邮箱地址` };
                }
                break;
                
            case 'phone':
                const phoneRegex = /^1[3-9]\d{9}$/;
                if (value && !phoneRegex.test(value)) {
                    return { valid: false, message: message || `请输入有效的手机号码` };
                }
                break;
                
            case 'number':
                if (value && isNaN(value)) {
                    return { valid: false, message: message || `${fieldName}必须是数字` };
                }
                break;
                
            case 'min':
                if (value && parseFloat(value) < param) {
                    return { valid: false, message: message || `${fieldName}不能小于${param}` };
                }
                break;
                
            case 'max':
                if (value && parseFloat(value) > param) {
                    return { valid: false, message: message || `${fieldName}不能大于${param}` };
                }
                break;
                
            case 'pattern':
                if (value && !param.test(value)) {
                    return { valid: false, message: message || `${fieldName}格式不正确` };
                }
                break;
        }
        
        return { valid: true };
    }
    
    // 显示字段错误
    showFieldError(field, message) {
        field.classList.remove(this.options.successClass);
        field.classList.add(this.options.errorClass);
        
        if (this.options.showErrorsInline) {
            this.showInlineError(field, message);
        }
        
        if (this.options.showErrorsAsToast) {
            if (window.Notification) {
                Notification.error(message);
            }
        }
    }
    
    // 显示字段成功状态
    showFieldSuccess(field) {
        field.classList.remove(this.options.errorClass);
        field.classList.add(this.options.successClass);
        this.clearInlineError(field);
    }
    
    // 清除字段错误
    clearFieldError(field) {
        field.classList.remove(this.options.errorClass, this.options.successClass);
        this.clearInlineError(field);
    }
    
    // 显示内联错误消息
    showInlineError(field, message) {
        this.clearInlineError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error-message';
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 12px;
            margin-top: 4px;
            display: block;
        `;
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }
    
    // 清除内联错误消息
    clearInlineError(field) {
        const errorElement = field.parentNode.querySelector('.field-error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    // 绑定实时验证
    bindRealTimeValidation() {
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (!field) return;
            
            if (this.options.validateOnBlur) {
                field.addEventListener('blur', () => {
                    this.validateField(fieldName);
                });
            }
            
            if (this.options.validateOnInput) {
                field.addEventListener('input', () => {
                    // 延迟验证，避免频繁触发
                    clearTimeout(field.validateTimeout);
                    field.validateTimeout = setTimeout(() => {
                        this.validateField(fieldName);
                    }, 300);
                });
            }
        });
    }
    
    // 成功回调
    onSuccess() {
        if (this.options.onSuccess) {
            this.options.onSuccess(this.getFormData());
        }
    }
    
    // 错误回调
    onError() {
        if (this.options.onError) {
            this.options.onError(this.errors);
        } else if (this.options.showErrorsAsToast) {
            const firstError = Object.values(this.errors)[0];
            if (firstError && window.Notification) {
                Notification.error(firstError);
            }
        }
    }
    
    // 获取表单数据
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }
    
    // 重置表单
    reset() {
        this.form.reset();
        this.errors = {};
        
        // 清除所有错误状态
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.clearFieldError(field);
            }
        });
    }
}

// 添加CSS样式
const validatorStyle = document.createElement('style');
validatorStyle.textContent = `
    .form-error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .form-success {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
    
    .field-error-message {
        animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(validatorStyle);

// 全局暴露
window.FormValidator = FormValidator;

console.log('表单验证组件已加载');