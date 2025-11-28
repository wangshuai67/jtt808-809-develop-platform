/**
 * JTT808模拟器 V2 通用组件库
 * 提供可复用的UI组件和交互功能
 */

window.Components = (function() {
    'use strict';

    // 组件注册表
    const components = new Map();

    // 数据表格组件
    const DataTable = {
        // 创建数据表格
        create(containerId, options = {}) {
            const {
                columns = [],
                data = [],
                pagination = true,
                pageSize = 10,
                searchable = true,
                sortable = true,
                selectable = false,
                actions = [],
                emptyText = '暂无数据',
                loadingText = '加载中...',
                onRowClick = null,
                onSelectionChange = null
            } = options;

            const container = $(`#${containerId}`);
            if (!container.length) {
                console.error(`容器 #${containerId} 不存在`);
                return null;
            }

            // 生成表格HTML
            const tableHtml = `
                <div class="data-table-wrapper">
                    ${searchable ? `
                        <div class="data-table-header mb-3">
                            <div class="row align-items-center">
                                <div class="col-md-6">
                                    <div class="search-box">
                                        <input type="text" class="form-control" placeholder="搜索..." id="${containerId}_search">
                                        <i class="fa fa-search search-icon"></i>
                                    </div>
                                </div>
                                <div class="col-md-6 text-end">
                                    <div class="table-actions">
                                        ${actions.map(action => `
                                            <button type="button" class="btn btn-${action.type || 'primary'} btn-sm me-2" 
                                                    data-action="${action.name}">
                                                <i class="fa ${action.icon}"></i> ${action.label}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="table-responsive">
                        <table class="table table-hover" id="${containerId}_table">
                            <thead class="table-light">
                                <tr>
                                    ${selectable ? '<th><input type="checkbox" class="form-check-input" id="selectAll"></th>' : ''}
                                    ${columns.map(col => `
                                        <th ${sortable && col.sortable !== false ? `class="sortable" data-sort="${col.key}"` : ''}>
                                            ${col.title}
                                            ${sortable && col.sortable !== false ? '<i class="fa fa-sort ms-1"></i>' : ''}
                                        </th>
                                    `).join('')}
                                    ${actions.length > 0 ? '<th width="120">操作</th>' : ''}
                                </tr>
                            </thead>
                            <tbody id="${containerId}_tbody">
                                <!-- 数据行将在这里动态生成 -->
                            </tbody>
                        </table>
                    </div>
                    
                    ${pagination ? `
                        <div class="data-table-footer mt-3">
                            <div class="row align-items-center">
                                <div class="col-md-6">
                                    <div class="table-info">
                                        显示 <span id="${containerId}_start">0</span> 到 <span id="${containerId}_end">0</span> 
                                        共 <span id="${containerId}_total">0</span> 条记录
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <nav>
                                        <ul class="pagination pagination-sm justify-content-end mb-0" id="${containerId}_pagination">
                                            <!-- 分页按钮将在这里动态生成 -->
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="table-loading d-none">
                        <div class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">${loadingText}</span>
                            </div>
                            <div class="mt-2">${loadingText}</div>
                        </div>
                    </div>
                    
                    <div class="table-empty d-none">
                        <div class="text-center py-4 text-muted">
                            <i class="fa fa-inbox fa-3x mb-3"></i>
                            <div>${emptyText}</div>
                        </div>
                    </div>
                </div>
            `;

            container.html(tableHtml);

            // 创建表格实例
            const instance = {
                containerId,
                options,
                data: [...data],
                filteredData: [...data],
                currentPage: 1,
                pageSize,
                sortColumn: null,
                sortDirection: 'asc',
                selectedRows: new Set(),

                // 渲染数据
                render() {
                    const tbody = $(`#${containerId}_tbody`);
                    const startIndex = (this.currentPage - 1) * this.pageSize;
                    const endIndex = startIndex + this.pageSize;
                    const pageData = this.filteredData.slice(startIndex, endIndex);

                    if (pageData.length === 0) {
                        tbody.empty();
                        this.showEmpty();
                        return;
                    }

                    this.hideEmpty();
                    
                    const rowsHtml = pageData.map((row, index) => {
                        const actualIndex = startIndex + index;
                        return `
                            <tr data-index="${actualIndex}" ${onRowClick ? 'style="cursor: pointer;"' : ''}>
                                ${selectable ? `
                                    <td>
                                        <input type="checkbox" class="form-check-input row-select" 
                                               value="${actualIndex}" ${this.selectedRows.has(actualIndex) ? 'checked' : ''}>
                                    </td>
                                ` : ''}
                                ${columns.map(col => {
                                    let value = row[col.key];
                                    if (col.render && typeof col.render === 'function') {
                                        value = col.render(value, row, actualIndex);
                                    }
                                    return `<td>${value || ''}</td>`;
                                }).join('')}
                                ${actions.length > 0 ? `
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            ${actions.filter(action => action.rowAction).map(action => `
                                                <button type="button" class="btn btn-outline-${action.type || 'primary'}" 
                                                        data-action="${action.name}" data-index="${actualIndex}"
                                                        title="${action.label}">
                                                    <i class="fa ${action.icon}"></i>
                                                </button>
                                            `).join('')}
                                        </div>
                                    </td>
                                ` : ''}
                            </tr>
                        `;
                    }).join('');

                    tbody.html(rowsHtml);
                    
                    if (pagination) {
                        this.renderPagination();
                        this.updateInfo();
                    }
                },

                // 渲染分页
                renderPagination() {
                    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
                    const pagination = $(`#${containerId}_pagination`);
                    
                    if (totalPages <= 1) {
                        pagination.empty();
                        return;
                    }

                    let paginationHtml = '';
                    
                    // 上一页
                    paginationHtml += `
                        <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${this.currentPage - 1}">上一页</a>
                        </li>
                    `;
                    
                    // 页码
                    const startPage = Math.max(1, this.currentPage - 2);
                    const endPage = Math.min(totalPages, this.currentPage + 2);
                    
                    if (startPage > 1) {
                        paginationHtml += '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>';
                        if (startPage > 2) {
                            paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
                        }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                        paginationHtml += `
                            <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                                <a class="page-link" href="#" data-page="${i}">${i}</a>
                            </li>
                        `;
                    }
                    
                    if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                            paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
                        }
                        paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
                    }
                    
                    // 下一页
                    paginationHtml += `
                        <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="#" data-page="${this.currentPage + 1}">下一页</a>
                        </li>
                    `;
                    
                    pagination.html(paginationHtml);
                },

                // 更新信息
                updateInfo() {
                    const startIndex = (this.currentPage - 1) * this.pageSize + 1;
                    const endIndex = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
                    
                    $(`#${containerId}_start`).text(this.filteredData.length > 0 ? startIndex : 0);
                    $(`#${containerId}_end`).text(endIndex);
                    $(`#${containerId}_total`).text(this.filteredData.length);
                },

                // 搜索
                search(keyword) {
                    if (!keyword) {
                        this.filteredData = [...this.data];
                    } else {
                        this.filteredData = this.data.filter(row => {
                            return columns.some(col => {
                                const value = row[col.key];
                                return value && value.toString().toLowerCase().includes(keyword.toLowerCase());
                            });
                        });
                    }
                    this.currentPage = 1;
                    this.render();
                },

                // 排序
                sort(column, direction) {
                    this.sortColumn = column;
                    this.sortDirection = direction;
                    
                    this.filteredData.sort((a, b) => {
                        const aVal = a[column];
                        const bVal = b[column];
                        
                        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                        return 0;
                    });
                    
                    this.render();
                },

                // 跳转页面
                goToPage(page) {
                    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
                    if (page >= 1 && page <= totalPages) {
                        this.currentPage = page;
                        this.render();
                    }
                },

                // 更新数据
                setData(newData) {
                    this.data = [...newData];
                    this.filteredData = [...newData];
                    this.currentPage = 1;
                    this.selectedRows.clear();
                    this.render();
                },

                // 添加数据
                addRow(row) {
                    this.data.push(row);
                    this.filteredData.push(row);
                    this.render();
                },

                // 删除数据
                removeRow(index) {
                    this.data.splice(index, 1);
                    this.filteredData = [...this.data];
                    this.selectedRows.delete(index);
                    this.render();
                },

                // 获取选中行
                getSelectedRows() {
                    return Array.from(this.selectedRows).map(index => this.data[index]);
                },

                // 显示加载状态
                showLoading() {
                    container.find('.table-loading').removeClass('d-none');
                    container.find('.table-responsive').addClass('d-none');
                },

                // 隐藏加载状态
                hideLoading() {
                    container.find('.table-loading').addClass('d-none');
                    container.find('.table-responsive').removeClass('d-none');
                },

                // 显示空状态
                showEmpty() {
                    container.find('.table-empty').removeClass('d-none');
                    container.find('.table-responsive').addClass('d-none');
                },

                // 隐藏空状态
                hideEmpty() {
                    container.find('.table-empty').addClass('d-none');
                    container.find('.table-responsive').removeClass('d-none');
                }
            };

            // 绑定事件
            bindTableEvents(instance);

            // 初始渲染
            instance.render();

            return instance;
        }
    };

    // 绑定表格事件
    function bindTableEvents(instance) {
        const { containerId, options } = instance;
        const { onRowClick, onSelectionChange, actions } = options;

        // 搜索事件
        $(`#${containerId}_search`).on('input', function() {
            const keyword = $(this).val();
            instance.search(keyword);
        });

        // 排序事件
        $(`#${containerId}_table`).on('click', '.sortable', function() {
            const column = $(this).data('sort');
            const currentDirection = instance.sortColumn === column ? instance.sortDirection : 'asc';
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
            
            // 更新排序图标
            $(`#${containerId}_table .sortable i`).removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
            $(this).find('i').removeClass('fa-sort').addClass(newDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
            
            instance.sort(column, newDirection);
        });

        // 分页事件
        $(`#${containerId}_pagination`).on('click', 'a.page-link', function(e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (!isNaN(page)) {
                instance.goToPage(page);
            }
        });

        // 行点击事件
        if (onRowClick) {
            $(`#${containerId}_tbody`).on('click', 'tr', function(e) {
                if (!$(e.target).is('input, button, a')) {
                    const index = parseInt($(this).data('index'));
                    const row = instance.data[index];
                    onRowClick(row, index);
                }
            });
        }

        // 全选事件
        $(`#${containerId} #selectAll`).on('change', function() {
            const checked = $(this).prop('checked');
            $(`#${containerId} .row-select`).prop('checked', checked);
            
            if (checked) {
                instance.filteredData.forEach((_, index) => {
                    instance.selectedRows.add(index);
                });
            } else {
                instance.selectedRows.clear();
            }
            
            if (onSelectionChange) {
                onSelectionChange(instance.getSelectedRows());
            }
        });

        // 行选择事件
        $(`#${containerId}_tbody`).on('change', '.row-select', function() {
            const index = parseInt($(this).val());
            const checked = $(this).prop('checked');
            
            if (checked) {
                instance.selectedRows.add(index);
            } else {
                instance.selectedRows.delete(index);
            }
            
            // 更新全选状态
            const totalRows = $(`#${containerId} .row-select`).length;
            const selectedRows = $(`#${containerId} .row-select:checked`).length;
            $(`#${containerId} #selectAll`).prop('checked', selectedRows === totalRows);
            
            if (onSelectionChange) {
                onSelectionChange(instance.getSelectedRows());
            }
        });

        // 操作按钮事件
        $(`#${containerId}`).on('click', '[data-action]', function(e) {
            e.preventDefault();
            const actionName = $(this).data('action');
            const rowIndex = $(this).data('index');
            const action = actions.find(a => a.name === actionName);
            
            if (action && action.handler) {
                if (rowIndex !== undefined) {
                    // 行操作
                    const row = instance.data[rowIndex];
                    action.handler(row, rowIndex, instance);
                } else {
                    // 全局操作
                    action.handler(instance.getSelectedRows(), instance);
                }
            }
        });
    }

    // 模态框组件
    const Modal = {
        // 创建模态框
        create(options = {}) {
            const {
                id = 'modal_' + Date.now(),
                title = '提示',
                content = '',
                size = 'md', // sm, md, lg, xl
                backdrop = true,
                keyboard = true,
                buttons = []
            } = options;

            const modalHtml = `
                <div class="modal fade" id="${id}" tabindex="-1" data-bs-backdrop="${backdrop}" data-bs-keyboard="${keyboard}">
                    <div class="modal-dialog modal-${size}">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${title}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${content}
                            </div>
                            ${buttons.length > 0 ? `
                                <div class="modal-footer">
                                    ${buttons.map(btn => `
                                        <button type="button" class="btn btn-${btn.type || 'secondary'}" 
                                                data-action="${btn.action || ''}" ${btn.dismiss ? 'data-bs-dismiss="modal"' : ''}>
                                            ${btn.text}
                                        </button>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            // 移除已存在的模态框
            $(`#${id}`).remove();
            
            // 添加到页面
            $('body').append(modalHtml);
            
            const modalElement = $(`#${id}`);
            const bsModal = new bootstrap.Modal(modalElement[0]);

            // 绑定按钮事件
            modalElement.on('click', '[data-action]', function() {
                const action = $(this).data('action');
                const button = buttons.find(btn => btn.action === action);
                if (button && button.handler) {
                    button.handler(bsModal, modalElement);
                }
            });

            // 清理事件
            modalElement.on('hidden.bs.modal', function() {
                modalElement.remove();
            });

            return {
                show() {
                    bsModal.show();
                },
                hide() {
                    bsModal.hide();
                },
                setTitle(newTitle) {
                    modalElement.find('.modal-title').text(newTitle);
                },
                setContent(newContent) {
                    modalElement.find('.modal-body').html(newContent);
                },
                element: modalElement,
                bootstrap: bsModal
            };
        },

        // 确认对话框
        confirm(message, options = {}) {
            const {
                title = '确认',
                confirmText = '确定',
                cancelText = '取消',
                onConfirm = null,
                onCancel = null
            } = options;

            return this.create({
                title,
                content: message,
                buttons: [
                    {
                        text: cancelText,
                        type: 'secondary',
                        dismiss: true,
                        handler: onCancel
                    },
                    {
                        text: confirmText,
                        type: 'primary',
                        action: 'confirm',
                        handler: (modal) => {
                            if (onConfirm) {
                                onConfirm();
                            }
                            modal.hide();
                        }
                    }
                ]
            });
        },

        // 警告对话框
        alert(message, options = {}) {
            const {
                title = '提示',
                buttonText = '确定',
                onClose = null
            } = options;

            return this.create({
                title,
                content: message,
                buttons: [
                    {
                        text: buttonText,
                        type: 'primary',
                        dismiss: true,
                        handler: onClose
                    }
                ]
            });
        }
    };

    // 表单组件
    const Form = {
        // 创建表单
        create(containerId, options = {}) {
            const {
                fields = [],
                data = {},
                validation = {},
                onSubmit = null,
                submitText = '提交',
                resetText = '重置'
            } = options;

            const container = $(`#${containerId}`);
            if (!container.length) {
                console.error(`容器 #${containerId} 不存在`);
                return null;
            }

            // 生成表单HTML
            const formHtml = `
                <form id="${containerId}_form" novalidate>
                    ${fields.map(field => this.renderField(field, data[field.name])).join('')}
                    <div class="form-actions mt-4">
                        <button type="submit" class="btn btn-primary me-2">
                            <i class="fa fa-save"></i> ${submitText}
                        </button>
                        <button type="button" class="btn btn-secondary" id="${containerId}_reset">
                            <i class="fa fa-undo"></i> ${resetText}
                        </button>
                    </div>
                </form>
            `;

            container.html(formHtml);

            // 创建表单实例
            const instance = {
                containerId,
                options,
                data: { ...data },

                // 获取表单数据
                getData() {
                    const formData = {};
                    fields.forEach(field => {
                        const element = $(`#${field.name}`);
                        if (element.length) {
                            if (field.type === 'checkbox') {
                                formData[field.name] = element.prop('checked');
                            } else if (field.type === 'radio') {
                                formData[field.name] = $(`input[name="${field.name}"]:checked`).val();
                            } else {
                                formData[field.name] = element.val();
                            }
                        }
                    });
                    return formData;
                },

                // 设置表单数据
                setData(newData) {
                    this.data = { ...newData };
                    fields.forEach(field => {
                        const element = $(`#${field.name}`);
                        const value = newData[field.name];
                        
                        if (element.length && value !== undefined) {
                            if (field.type === 'checkbox') {
                                element.prop('checked', !!value);
                            } else if (field.type === 'radio') {
                                $(`input[name="${field.name}"][value="${value}"]`).prop('checked', true);
                            } else {
                                element.val(value);
                            }
                        }
                    });
                },

                // 验证表单
                validate() {
                    let isValid = true;
                    const errors = {};

                    fields.forEach(field => {
                        const element = $(`#${field.name}`);
                        const value = element.val();
                        const rules = validation[field.name] || [];

                        // 清除之前的错误状态
                        element.removeClass('is-invalid');
                        element.siblings('.invalid-feedback').remove();

                        // 执行验证规则
                        for (const rule of rules) {
                            if (!rule.validator(value, this.getData())) {
                                isValid = false;
                                errors[field.name] = rule.message;
                                
                                // 显示错误状态
                                element.addClass('is-invalid');
                                element.after(`<div class="invalid-feedback">${rule.message}</div>`);
                                break;
                            }
                        }
                    });

                    return { isValid, errors };
                },

                // 重置表单
                reset() {
                    $(`#${containerId}_form`)[0].reset();
                    $(`#${containerId}_form .is-invalid`).removeClass('is-invalid');
                    $(`#${containerId}_form .invalid-feedback`).remove();
                }
            };

            // 绑定事件
            this.bindFormEvents(instance);

            return instance;
        },

        // 渲染字段
        renderField(field, value = '') {
            const {
                name,
                type = 'text',
                label,
                placeholder = '',
                required = false,
                options = [],
                attributes = {}
            } = field;

            const attrs = Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(' ');
            const requiredMark = required ? '<span class="text-danger">*</span>' : '';

            switch (type) {
                case 'select':
                    return `
                        <div class="mb-3">
                            <label for="${name}" class="form-label">${label} ${requiredMark}</label>
                            <select class="form-select" id="${name}" name="${name}" ${attrs}>
                                <option value="">${placeholder || '请选择'}</option>
                                ${options.map(opt => `
                                    <option value="${opt.value}" ${opt.value == value ? 'selected' : ''}>
                                        ${opt.label}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    `;

                case 'textarea':
                    return `
                        <div class="mb-3">
                            <label for="${name}" class="form-label">${label} ${requiredMark}</label>
                            <textarea class="form-control" id="${name}" name="${name}" 
                                      placeholder="${placeholder}" ${attrs}>${value}</textarea>
                        </div>
                    `;

                case 'checkbox':
                    return `
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="${name}" name="${name}" 
                                       ${value ? 'checked' : ''} ${attrs}>
                                <label class="form-check-label" for="${name}">
                                    ${label} ${requiredMark}
                                </label>
                            </div>
                        </div>
                    `;

                case 'radio':
                    return `
                        <div class="mb-3">
                            <label class="form-label">${label} ${requiredMark}</label>
                            ${options.map(opt => `
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" id="${name}_${opt.value}" 
                                           name="${name}" value="${opt.value}" ${opt.value == value ? 'checked' : ''} ${attrs}>
                                    <label class="form-check-label" for="${name}_${opt.value}">
                                        ${opt.label}
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    `;

                default:
                    return `
                        <div class="mb-3">
                            <label for="${name}" class="form-label">${label} ${requiredMark}</label>
                            <input type="${type}" class="form-control" id="${name}" name="${name}" 
                                   placeholder="${placeholder}" value="${value}" ${attrs}>
                        </div>
                    `;
            }
        },

        // 绑定表单事件
        bindFormEvents(instance) {
            const { containerId, options } = instance;
            const { onSubmit } = options;

            // 提交事件
            $(`#${containerId}_form`).on('submit', function(e) {
                e.preventDefault();
                
                const validation = instance.validate();
                if (validation.isValid) {
                    if (onSubmit) {
                        onSubmit(instance.getData(), instance);
                    }
                } else {
                    console.log('表单验证失败:', validation.errors);
                }
            });

            // 重置事件
            $(`#${containerId}_reset`).on('click', function() {
                instance.reset();
            });
        }
    };

    // 初始化组件库
    function init() {
        // 注册组件
        components.set('DataTable', DataTable);
        components.set('Modal', Modal);
        components.set('Form', Form);
        
        console.log('组件库初始化完成');
    }

    // 获取组件
    function getComponent(name) {
        return components.get(name);
    }

    // 注册组件
    function registerComponent(name, component) {
        components.set(name, component);
    }

    // 公共API
    return {
        init,
        getComponent,
        registerComponent,
        DataTable,
        Modal,
        Form
    };
})();