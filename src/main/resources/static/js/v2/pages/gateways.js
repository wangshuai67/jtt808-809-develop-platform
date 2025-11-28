/**
 * JTT808模拟器 V2 网关管理页面
 * 网关的增删改查和状态管理
 */

window.Gateways = (function() {
    'use strict';

    let initialized = false;
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 0;
    let searchKeyword = '';
    let statusFilter = '';

    // 页面模板
    const template = `
        <div class="gateways-container">
            <!-- 页面头部 -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-0 text-gray-800">网关管理</h1>
                    <p class="mb-0 text-muted">管理和监控JTT808协议网关</p>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-primary" id="addGatewayBtn">
                        <i class="fas fa-plus me-2"></i>添加网关
                    </button>
                    <button type="button" class="btn btn-outline-secondary" id="refreshBtn">
                        <i class="fas fa-sync-alt me-2"></i>刷新
                    </button>
                </div>
            </div>

            <!-- 搜索和筛选 -->
            <div class="card shadow mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="search-box">
                                <input type="text" class="form-control" id="searchInput" 
                                       placeholder="搜索网关名称、IP地址...">
                                <i class="fas fa-search search-icon"></i>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="statusFilter">
                                <option value="">全部状态</option>
                                <option value="active">活跃</option>
                                <option value="inactive">非活跃</option>
                                <option value="error">错误</option>
                                <option value="maintenance">维护</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="protocolFilter">
                                <option value="">全部协议</option>
                                <option value="jtt808-2011">JTT808-2011</option>
                                <option value="jtt808-2013">JTT808-2013</option>
                                <option value="jtt808-2019">JTT808-2019</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button type="button" class="btn btn-outline-primary w-100" id="searchBtn">
                                <i class="fas fa-search me-2"></i>搜索
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 网关列表 -->
            <div class="card shadow">
                <div class="card-header py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="m-0 font-weight-bold text-primary">网关列表</h6>
                        <div class="d-flex align-items-center">
                            <span class="text-muted me-3" id="totalCount">共 0 个网关</span>
                            <div class="btn-group btn-group-sm">
                                <button type="button" class="btn btn-outline-danger" id="batchDeleteBtn" disabled>
                                    <i class="fas fa-trash me-1"></i>批量删除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0" id="gatewaysTable">
                            <thead class="table-light">
                                <tr>
                                    <th width="40">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="selectAll">
                                        </div>
                                    </th>
                                    <th>网关名称</th>
                                    <th>IP地址</th>
                                    <th>端口</th>
                                    <th>协议版本</th>
                                    <th>状态</th>
                                    <th>连接数</th>
                                    <th>最后活跃</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="gatewaysTableBody">
                                <!-- 数据将在这里动态生成 -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 空状态 -->
                    <div class="empty-state text-center py-5" id="emptyState" style="display: none;">
                        <i class="fas fa-server fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">暂无网关数据</h5>
                        <p class="text-muted">点击上方"添加网关"按钮开始添加网关</p>
                    </div>
                    
                    <!-- 加载状态 -->
                    <div class="loading-state text-center py-5" id="loadingState" style="display: none;">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">加载中...</span>
                        </div>
                        <p class="text-muted mt-2">正在加载网关数据...</p>
                    </div>
                </div>
                
                <!-- 分页 -->
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            显示第 <span id="gatewaysPageStart">0</span> - <span id="gatewaysPageEnd">0</span> 条，
                            共 <span id="gatewaysTotalItems">0</span> 条记录
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0" id="gatewaysPagination">
                                <!-- 分页将在这里动态生成 -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <!-- 网关详情模态框 -->
        <div class="modal fade" id="gatewayDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">网关详情</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="gatewayDetailContent">
                        <!-- 详情内容将在这里动态生成 -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" id="editGatewayBtn">编辑网关</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 网关表单模态框 -->
        <div class="modal fade" id="gatewayFormModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="gatewayFormTitle">添加网关</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="gatewayForm">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="gatewayName" class="form-label">网关名称 <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="gatewayName" name="gatewayName" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-6">
                                    <label for="ipAddress" class="form-label">IP地址 <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="ipAddress" name="ipAddress" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-6">
                                    <label for="port" class="form-label">端口 <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control" id="port" name="port" min="1" max="65535" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-6">
                                    <label for="protocolVersion" class="form-label">协议版本</label>
                                    <select class="form-select" id="protocolVersion" name="protocolVersion">
                                        <option value="jtt808-2011">JTT808-2011</option>
                                        <option value="jtt808-2013">JTT808-2013</option>
                                        <option value="jtt808-2019">JTT808-2019</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label for="maxConnections" class="form-label">最大连接数</label>
                                    <input type="number" class="form-control" id="maxConnections" name="maxConnections" min="1" value="1000">
                                </div>
                                <div class="col-md-6">
                                    <label for="timeout" class="form-label">超时时间(秒)</label>
                                    <input type="number" class="form-control" id="timeout" name="timeout" min="1" value="30">
                                </div>
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="autoStart" name="autoStart" checked>
                                        <label class="form-check-label" for="autoStart">
                                            自动启动
                                        </label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label for="description" class="form-label">描述</label>
                                    <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="saveGatewayBtn">
                            <i class="fas fa-save me-2"></i>保存
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 连接监控模态框 -->
        <div class="modal fade" id="connectionMonitorModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">连接监控</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h5 class="card-title text-primary" id="totalConnections">0</h5>
                                        <p class="card-text">总连接数</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h5 class="card-title text-success" id="activeConnections">0</h5>
                                        <p class="card-text">活跃连接</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h5 class="card-title text-warning" id="idleConnections">0</h5>
                                        <p class="card-text">空闲连接</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <h5 class="card-title text-info" id="messagesPerSecond">0</h5>
                                        <p class="card-text">消息/秒</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>设备ID</th>
                                        <th>IP地址</th>
                                        <th>连接时间</th>
                                        <th>最后活跃</th>
                                        <th>消息数</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody id="connectionsTableBody">
                                    <!-- 连接数据将在这里动态生成 -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" id="refreshConnectionsBtn">
                            <i class="fas fa-sync-alt me-2"></i>刷新
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 渲染页面
    function render(params = {}) {
        return template;
    }

    // 初始化页面
    function initialize(params = {}) {
        if (initialized) {
            refresh();
            return;
        }

        console.log('初始化网关管理页面');

        // 绑定事件
        bindEvents();

        // 加载网关列表
        loadGateways();

        initialized = true;
    }

    // 绑定事件
    function bindEvents() {
        // 添加网关按钮
        $(document).on('click', '#addGatewayBtn', function() {
            showGatewayForm();
        });

        // 刷新按钮
        $(document).on('click', '#refreshBtn', function() {
            refresh();
        });

        // 搜索
        $(document).on('click', '#searchBtn', function() {
            search();
        });

        $(document).on('keypress', '#searchInput', function(e) {
            if (e.which === 13) {
                search();
            }
        });

        // 筛选
        $(document).on('change', '#statusFilter, #protocolFilter', function() {
            search();
        });

        // 全选/取消全选
        $(document).on('change', '#selectAll', function() {
            const checked = $(this).prop('checked');
            $('.gateway-checkbox').prop('checked', checked);
            updateBatchButtons();
        });

        // 单选
        $(document).on('change', '.gateway-checkbox', function() {
            updateSelectAll();
            updateBatchButtons();
        });

        // 批量操作
        // 批量启动/停止已移除

        $(document).on('click', '#batchDeleteBtn', function() {
            batchOperation('delete');
        });

        // 网关操作
        $(document).on('click', '.view-btn', function() {
            const gatewayId = $(this).data('id');
            showGatewayDetail(gatewayId);
        });

        $(document).on('click', '.edit-btn', function() {
            const gatewayId = $(this).data('id');
            showGatewayForm(gatewayId);
        });

        $(document).on('click', '#gatewaysTable .delete-btn', function() {
            const gatewayId = $(this).data('id');
            deleteGateway(gatewayId);
        });

        // 单网关启动/停止已移除

        $(document).on('click', '.monitor-btn', function() {
            const gatewayId = $(this).data('id');
            showConnectionMonitor(gatewayId);
        });

        // 保存网关
        $(document).on('click', '#saveGatewayBtn', function() {
            saveGateway();
        });

        // 编辑网关（从详情页）
        $(document).on('click', '#editGatewayBtn', function() {
            const gatewayId = $(this).data('id');
            $('#gatewayDetailModal').modal('hide');
            setTimeout(() => {
                showGatewayForm(gatewayId);
            }, 300);
        });

        // 刷新连接监控
        $(document).on('click', '#refreshConnectionsBtn', function() {
            const gatewayId = $('#connectionMonitorModal').data('gateway-id');
            if (gatewayId) {
                loadConnectionMonitor(gatewayId);
            }
        });

        // 分页
        $(document).on('click', '#gatewaysPagination .page-link', function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            if (page && page !== currentPage) {
                currentPage = page;
                loadGateways();
            }
        });
    }

    // 加载网关列表
    async function loadGateways() {
        try {
            showLoading(true);

            const params = {
                page: currentPage,
                size: pageSize,
                keyword: searchKeyword,
                status: statusFilter,
                protocol: $('#protocolFilter').val()
            };

            const response = await window.API.gateway.list(params);
            const data = response.data || {};

            renderGatewayTable(data.content || []);
            updatePagination(data);
            updateStatistics(data);

        } catch (error) {
            console.error('加载网关列表失败:', error);
            if (window.App) {
                window.App.showError('加载网关列表失败');
            }
            showEmpty();
        } finally {
            showLoading(false);
        }
    }

    // 渲染网关表格
    function renderGatewayTable(gateways) {
        const tbody = $('#gatewaysTableBody');
        
        if (!gateways || gateways.length === 0) {
            showEmpty();
            return;
        }

        const html = gateways.map(gateway => `
            <tr>
                <td>
                    <div class="form-check">
                        <input class="form-check-input gateway-checkbox" type="checkbox" 
                               value="${gateway.id}">
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="gateway-avatar me-2">
                            <i class="fas fa-server text-primary"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${gateway.gatewayName}</div>
                            <small class="text-muted">${gateway.id}</small>
                        </div>
                    </div>
                </td>
                <td>${gateway.ipAddress}</td>
                <td>${gateway.port}</td>
                <td>
                    <span class="badge bg-light text-dark">
                        ${getProtocolText(gateway.protocolVersion)}
                    </span>
                </td>
                <td>
                    <span class="badge ${getStatusBadgeClass(gateway.status)}">
                        ${getStatusText(gateway.status)}
                    </span>
                </td>
                <td>
                    <div class="connection-info">
                        <div>${gateway.currentConnections || 0}/${gateway.maxConnections || 0}</div>
                        <div class="progress mt-1" style="height: 4px;">
                            <div class="progress-bar ${getConnectionProgressClass(gateway)}" 
                                 style="width: ${getConnectionPercentage(gateway)}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="time-info">
                        <div>${formatDateTime(gateway.lastActiveTime)}</div>
                        <small class="text-muted">${getTimeAgo(gateway.lastActiveTime)}</small>
                    </div>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary view-btn" 
                                data-id="${gateway.id}" title="查看详情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-secondary edit-btn" 
                                data-id="${gateway.id}" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-outline-info monitor-btn" 
                                data-id="${gateway.id}" title="连接监控">
                            <i class="fas fa-chart-line"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger delete-btn" 
                                data-id="${gateway.id}" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.html(html);
        $('#emptyState').hide();
    }

    // 显示网关详情
    async function showGatewayDetail(gatewayId) {
        try {
            if (window.App) {
                window.App.setLoading(true);
            }

            const response = await window.API.gateway.get(gatewayId);
            const gateway = response.data;

            const detailHtml = `
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">网关名称</label>
                            <div class="info-value">${gateway.gatewayName}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">IP地址</label>
                            <div class="info-value">${gateway.ipAddress}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">端口</label>
                            <div class="info-value">${gateway.port}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">协议版本</label>
                            <div class="info-value">${getProtocolText(gateway.protocolVersion)}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">状态</label>
                            <div class="info-value">
                                <span class="badge ${getStatusBadgeClass(gateway.status)}">
                                    ${getStatusText(gateway.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">最大连接数</label>
                            <div class="info-value">${gateway.maxConnections}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">当前连接数</label>
                            <div class="info-value">${gateway.currentConnections || 0}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">超时时间</label>
                            <div class="info-value">${gateway.timeout}秒</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">自动启动</label>
                            <div class="info-value">
                                <span class="badge ${gateway.autoStart ? 'bg-success' : 'bg-secondary'}">
                                    ${gateway.autoStart ? '是' : '否'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">创建时间</label>
                            <div class="info-value">${formatDateTime(gateway.createTime)}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">最后活跃时间</label>
                            <div class="info-value">${formatDateTime(gateway.lastActiveTime)}</div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="info-item">
                            <label class="form-label">描述</label>
                            <div class="info-value">${gateway.description || '-'}</div>
                        </div>
                    </div>
                </div>
            `;

            $('#gatewayDetailContent').html(detailHtml);
            $('#editGatewayBtn').data('id', gatewayId);
            $('#gatewayDetailModal').modal('show');

        } catch (error) {
            console.error('获取网关详情失败:', error);
            if (window.App) {
                window.App.showError('获取网关详情失败');
            }
        } finally {
            if (window.App) {
                window.App.setLoading(false);
            }
        }
    }

    // 显示网关表单
    async function showGatewayForm(gatewayId = null) {
        const isEdit = !!gatewayId;
        
        $('#gatewayFormTitle').text(isEdit ? '编辑网关' : '添加网关');
        const formEl = $('#gatewayForm')[0];
        if (formEl && typeof formEl.reset === 'function') formEl.reset();
        $('#gatewayForm .is-invalid').removeClass('is-invalid');

        if (isEdit) {
            try {
                if (window.App) {
                    window.App.setLoading(true);
                }

                const response = await window.API.gateway.get(gatewayId);
                const gateway = response.data;

                // 填充表单（映射后端字段）
                $('#gatewayName').val(gateway.gatewayName || '');
                $('#ipAddress').val(gateway.ipAddress || '');
                $('#port').val(gateway.port || '');
                $('#description').val(gateway.description || '');
                $('#autoStart').prop('checked', gateway.status === 'active' || gateway.autoStart === true);

                $('#saveGatewayBtn').data('id', gatewayId);

            } catch (error) {
                console.error('获取网关信息失败:', error);
                if (window.App) {
                    window.App.showError('获取网关信息失败');
                }
                return;
            } finally {
                if (window.App) {
                    window.App.setLoading(false);
                }
            }
        } else {
            $('#saveGatewayBtn').removeData('id');
        }

        $('#gatewayFormModal').modal('show');
    }

    // 保存网关
    async function saveGateway() {
        const form = $('#gatewayForm')[0];
        const formData = new FormData(form);
        const gatewayId = $('#saveGatewayBtn').data('id');
        const isEdit = !!gatewayId;

        // 表单验证
        if (!validateForm()) {
            return;
        }

        try {
            if (window.App) {
                window.App.setLoading(true);
            }

            const data = Object.fromEntries(formData.entries());
            data.autoStart = $('#autoStart').prop('checked');

            let response;
            if (isEdit) {
                response = await window.API.gateway.update(gatewayId, data);
            } else {
                response = await window.API.gateway.create(data);
            }

            if (window.App) {
                window.App.showSuccess(isEdit ? '网关更新成功' : '网关添加成功');
            }

            $('#gatewayFormModal').modal('hide');
            loadGateways();

        } catch (error) {
            console.error('保存网关失败:', error);
            if (window.App) {
                window.App.showError('保存网关失败');
            }
        } finally {
            if (window.App) {
                window.App.setLoading(false);
            }
        }
    }

    // 表单验证
    function validateForm() {
        let isValid = true;
        const form = $('#gatewayForm');

        // 清除之前的验证状态
        form.find('.is-invalid').removeClass('is-invalid');

        // 网关名称验证
        const gatewayName = $('#gatewayName').val().trim();
        if (!gatewayName) {
            showFieldError('gatewayName', '请输入网关名称');
            isValid = false;
        }

        // IP地址验证
        const ipAddress = $('#ipAddress').val().trim();
        if (!ipAddress) {
            showFieldError('ipAddress', '请输入IP地址');
            isValid = false;
        } else if (!window.Utils.validator.isIP(ipAddress)) {
            showFieldError('ipAddress', 'IP地址格式不正确');
            isValid = false;
        }

        // 端口验证
        const port = parseInt($('#port').val());
        if (!port || port < 1 || port > 65535) {
            showFieldError('port', '请输入有效的端口号(1-65535)');
            isValid = false;
        }

        return isValid;
    }

    // 显示字段错误
    function showFieldError(fieldName, message) {
        const field = $(`#${fieldName}`);
        field.addClass('is-invalid');
        field.siblings('.invalid-feedback').text(message);
    }

    // 删除网关
    const deletingGatewayIds = new Set();
    function deleteGateway(gatewayId) {
        if (deletingGatewayIds.has(gatewayId)) return;
        if (window.App && window.App.confirm) {
            window.App.confirm('确认删除', '确定要删除这个网关吗？此操作不可恢复。', async () => {
                try {
                    if (window.App) {
                        window.App.setLoading(true);
                    }
                    deletingGatewayIds.add(gatewayId);
                    await window.API.gateway.delete(gatewayId);
                    
                    if (window.App) {
                        window.App.showSuccess('网关删除成功');
                    }
                    
                    loadGateways();

                } catch (error) {
                    console.error('删除网关失败:', error);
                    if (window.App) {
                        window.App.showError('删除网关失败');
                    }
                } finally {
                    if (window.App) {
                        window.App.setLoading(false);
                    }
                    deletingGatewayIds.delete(gatewayId);
                }
            });
        }
    }

    // 启动网关
    async function startGateway(gatewayId) {
        try {
            if (window.App) {
                window.App.setLoading(true);
            }

            await window.API.gateway.start(gatewayId);
            
            if (window.App) {
                window.App.showSuccess('网关启动成功');
            }
            
            loadGateways();

        } catch (error) {
            console.error('启动网关失败:', error);
            if (window.App) {
                window.App.showError('启动网关失败');
            }
        } finally {
            if (window.App) {
                window.App.setLoading(false);
            }
        }
    }

    // 停止网关
    async function stopGateway(gatewayId) {
        try {
            if (window.App) {
                window.App.setLoading(true);
            }

            await window.API.gateway.stop(gatewayId);
            
            if (window.App) {
                window.App.showSuccess('网关停止成功');
            }
            
            loadGateways();

        } catch (error) {
            console.error('停止网关失败:', error);
            if (window.App) {
                window.App.showError('停止网关失败');
            }
        } finally {
            if (window.App) {
                window.App.setLoading(false);
            }
        }
    }

    // 显示连接监控
    async function showConnectionMonitor(gatewayId) {
        $('#connectionMonitorModal').data('gateway-id', gatewayId);
        $('#connectionMonitorModal').modal('show');
        await loadConnectionMonitor(gatewayId);
    }

    // 加载连接监控数据
    async function loadConnectionMonitor(gatewayId) {
        try {
            const response = await window.API.gateway.getConnections(gatewayId);
            const data = response.data || {};

            // 更新统计信息
            $('#totalConnections').text(data.totalConnections || 0);
            $('#activeConnections').text(data.activeConnections || 0);
            $('#idleConnections').text(data.idleConnections || 0);
            $('#messagesPerSecond').text(data.messagesPerSecond || 0);

            // 渲染连接表格
            const connections = data.connections || [];
            const tbody = $('#connectionsTableBody');
            
            if (connections.length === 0) {
                tbody.html('<tr><td colspan="7" class="text-center text-muted">暂无连接数据</td></tr>');
                return;
            }

            const html = connections.map(conn => `
                <tr>
                    <td>${conn.deviceId}</td>
                    <td>${conn.clientIp}</td>
                    <td>${formatDateTime(conn.connectTime)}</td>
                    <td>${formatDateTime(conn.lastActiveTime)}</td>
                    <td>${conn.messageCount || 0}</td>
                    <td>
                        <span class="badge ${conn.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                            ${conn.status === 'active' ? '活跃' : '空闲'}
                        </span>
                    </td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-danger" 
                                onclick="disconnectClient('${conn.deviceId}')">
                            断开
                        </button>
                    </td>
                </tr>
            `).join('');

            tbody.html(html);

        } catch (error) {
            console.error('加载连接监控数据失败:', error);
            if (window.App) {
                window.App.showError('加载连接监控数据失败');
            }
        }
    }

    // 搜索
    function search() {
        searchKeyword = $('#searchInput').val().trim();
        statusFilter = $('#statusFilter').val();
        currentPage = 1;
        loadGateways();
    }

    // 批量操作
    function batchOperation(operation) {
        const selectedIds = $('.gateway-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            if (window.App) {
                window.App.showWarning('请选择要操作的网关');
            }
            return;
        }

        let message = '';
        switch (operation) {
            case 'start':
                message = `确定要启动选中的 ${selectedIds.length} 个网关吗？`;
                break;
            case 'stop':
                message = `确定要停止选中的 ${selectedIds.length} 个网关吗？`;
                break;
            case 'delete':
                message = `确定要删除选中的 ${selectedIds.length} 个网关吗？此操作不可恢复。`;
                break;
        }

        if (window.App && window.App.confirm) {
            window.App.confirm('批量操作确认', message, async () => {
                try {
                    if (window.App) {
                        window.App.setLoading(true);
                    }

                    await window.API.gateway.batch(operation, selectedIds);
                    
                    if (window.App) {
                        window.App.showSuccess('批量操作成功');
                    }
                    
                    loadGateways();

                } catch (error) {
                    console.error('批量操作失败:', error);
                    if (window.App) {
                        window.App.showError('批量操作失败');
                    }
                } finally {
                    if (window.App) {
                        window.App.setLoading(false);
                    }
                }
            });
        }
    }

    // 更新全选状态
    function updateSelectAll() {
        const total = $('.gateway-checkbox').length;
        const checked = $('.gateway-checkbox:checked').length;
        
        $('#selectAll').prop('indeterminate', checked > 0 && checked < total);
        $('#selectAll').prop('checked', checked === total && total > 0);
    }

    // 更新批量操作按钮状态
    function updateBatchButtons() {
        const selectedCount = $('.gateway-checkbox:checked').length;
        const hasSelection = selectedCount > 0;
        
        $('#batchStartBtn, #batchStopBtn, #batchDeleteBtn').prop('disabled', !hasSelection);
    }

    // 更新分页
    function updatePagination(data) {
        totalPages = data.totalPages || 0;
        const totalElements = data.totalElements || 0;
        
        // 更新统计信息
        const start = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalElements);
        
        $('#gatewaysPageStart').text(start);
        $('#gatewaysPageEnd').text(end);
        $('#gatewaysTotalItems').text(totalElements);

        // 生成分页
        const pagination = $('#gatewaysPagination');
        let paginationHtml = '';

        if (totalPages > 1) {
            // 上一页
            paginationHtml += `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="javascript:void(0)" data-page="${currentPage - 1}">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;

            // 页码
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);

            if (startPage > 1) {
                paginationHtml += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="1">1</a></li>`;
                if (startPage > 2) {
                    paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHtml += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="javascript:void(0)" data-page="${i}">${i}</a>
                    </li>
                `;
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
                paginationHtml += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="${totalPages}">${totalPages}</a></li>`;
            }

            // 下一页
            paginationHtml += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="javascript:void(0)" data-page="${currentPage + 1}">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }

        pagination.html(paginationHtml);
    }

    // 更新统计信息
    function updateStatistics(data) {
        const totalElements = data.totalElements || 0;
        $('#totalCount').text(`共 ${totalElements} 个网关`);
    }

    // 显示加载状态
    function showLoading(show) {
        if (show) {
            $('#loadingState').show();
            $('#emptyState').hide();
            $('#gatewaysTableBody').empty();
        } else {
            $('#loadingState').hide();
        }
    }

    // 显示空状态
    function showEmpty() {
        $('#emptyState').show();
        $('#loadingState').hide();
        $('#gatewaysTableBody').empty();
    }

    // 获取协议文本
    function getProtocolText(protocol) {
        const protocols = {
            'jtt808-2011': 'JTT808-2011',
            'jtt808-2013': 'JTT808-2013',
            'jtt808-2019': 'JTT808-2019'
        };
        return protocols[protocol] || protocol;
    }

    // 获取状态文本
    function getStatusText(status) {
        const statuses = {
            active: '活跃',
            inactive: '非活跃',
            error: '错误',
            maintenance: '维护'
        };
        return statuses[status] || status;
    }

    // 获取状态徽章样式
    function getStatusBadgeClass(status) {
        const classes = {
            active: 'bg-success',
            inactive: 'bg-secondary',
            error: 'bg-danger',
            maintenance: 'bg-warning'
        };
        return classes[status] || 'bg-secondary';
    }

    // 获取连接进度条样式
    function getConnectionProgressClass(gateway) {
        const percentage = getConnectionPercentage(gateway);
        if (percentage >= 90) return 'bg-danger';
        if (percentage >= 70) return 'bg-warning';
        return 'bg-success';
    }

    // 获取连接百分比
    function getConnectionPercentage(gateway) {
        const current = gateway.currentConnections || 0;
        const max = gateway.maxConnections || 1;
        return Math.round((current / max) * 100);
    }

    // 格式化日期时间
    function formatDateTime(dateTime) {
        if (!dateTime) return '-';
        return new Date(dateTime).toLocaleString('zh-CN');
    }

    // 获取时间差
    function getTimeAgo(dateTime) {
        if (!dateTime) return '';
        const now = new Date();
        const time = new Date(dateTime);
        const diff = now - time;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        return Math.floor(diff / 86400000) + '天前';
    }

    // 刷新页面数据
    function refresh() {
        loadGateways();
    }

    // 销毁页面
    function destroy() {
        initialized = false;
    }

    // 初始化模块
    function init() {
        console.log('网关管理模块初始化完成');
    }

    // 公共API
    return {
        init,
        render,
        initialize,
        refresh,
        destroy
    };
})();
