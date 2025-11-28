/**
 * JTT808模拟器 V2 车辆管理页面
 * 车辆的增删改查和状态管理
 */

window.Vehicles = (function() {
    'use strict';

    let initialized = false;
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 0;
    let searchKeyword = '';
    let statusFilter = '';
    let dataTable = null;

    // 页面模板
    const template = `
        <div class="vehicles-container">
            <!-- 页面头部 -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-0 text-gray-800">车辆管理</h1>
                    <p class="mb-0 text-muted">管理和监控所有模拟车辆</p>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-primary" id="addVehicleBtn">
                        <i class="fas fa-plus me-2"></i>添加车辆
                    </button>
                    <button type="button" class="btn btn-outline-primary" id="batchCreateVehiclesBtn">
                        <i class="fas fa-layer-group me-2"></i>批量创建模拟车辆
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
                                       placeholder="搜索车牌号、设备号...">
                                <i class="fas fa-search search-icon"></i>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="statusFilter">
                                <option value="">全部状态</option>
                                <option value="online">在线</option>
                                <option value="offline">离线</option>
                                <option value="fault">故障</option>
                                <option value="maintenance">维护</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="typeFilter">
                                <option value="">全部类型</option>
                                <option value="truck">货车</option>
                                <option value="bus">客车</option>
                                <option value="taxi">出租车</option>
                                <option value="private">私家车</option>
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

            <!-- 车辆列表 -->
            <div class="card shadow">
                <div class="card-header py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="m-0 font-weight-bold text-primary">车辆列表</h6>
                        <div class="d-flex align-items-center">
                            <span class="text-muted me-3" id="totalCount">共 0 辆车</span>
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
                        <table class="table table-hover table-sm align-middle mb-0" id="vehiclesTable">
                            <thead class="table-light">
                                <tr>
                                    <th width="40">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="selectAll">
                                        </div>
                                    </th>
                                    <th>车牌号</th>
                                    <th>设备号</th>
                                    <th>备注</th>
                                    <th>状态</th>
                                    <th>位置</th>
                                    <th>最后上报</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="vehiclesTableBody">
                                <!-- 数据将在这里动态生成 -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 空状态 -->
                    <div class="empty-state text-center py-5" id="emptyState" style="display: none;">
                        <i class="fas fa-car fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">暂无车辆数据</h5>
                        <p class="text-muted">点击上方"添加车辆"按钮开始添加车辆</p>
                    </div>
                    
                    <!-- 加载状态 -->
                    <div class="loading-state text-center py-5" id="loadingState" style="display: none;">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">加载中...</span>
                        </div>
                        <p class="text-muted mt-2">正在加载车辆数据...</p>
                    </div>
                </div>
                
                <!-- 分页 -->
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            显示第 <span id="vehiclesPageStart">0</span> - <span id="vehiclesPageEnd">0</span> 条，
                            共 <span id="vehiclesTotalItems">0</span> 条记录
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0" id="vehiclesPagination">
                                <!-- 分页将在这里动态生成 -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <!-- 车辆详情模态框 -->
        <div class="modal fade" id="vehicleDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">车辆详情</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="vehicleDetailContent">
                        <!-- 详情内容将在这里动态生成 -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" id="editVehicleBtn">编辑车辆</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 车辆表单模态框 -->
        <div class="modal fade" id="vehicleFormModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header d-flex align-items-center justify-content-between">
                        <h5 class="modal-title" id="vehicleFormTitle">添加车辆</h5>
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" class="btn btn-outline-secondary btn-sm" id="mockVehicleBtn">mock数据</button>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                    </div>
                    <div class="modal-body">
                        <form id="vehicleForm">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="plateNumber" class="form-label">车牌号 <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="plateNumber" name="plateNumber" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-6">
                                    <label for="terminalId" class="form-label">设备号 <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="terminalId" name="terminalId" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <!-- 车辆类型字段在Vehicle实体中不存在，所以注释掉 -->
                                <!--
                                <div class="col-md-6">
                                    <label for="vehicleType" class="form-label">车辆类型</label>
                                    <select class="form-select" id="vehicleType" name="vehicleType">
                                        <option value="truck">货车</option>
                                        <option value="bus">客车</option>
                                        <option value="taxi">出租车</option>
                                        <option value="private">私家车</option>
                                    </select>
                                </div>
                                -->
                                <div class="col-md-6">
                                    <label for="simNumber" class="form-label">SIM卡号 <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="simNumber" name="simNumber" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <!-- 司机姓名和司机电话字段在Vehicle实体中不存在，所以注释掉 -->
                                <!--
                                <div class="col-md-6">
                                    <label for="driverName" class="form-label">司机姓名</label>
                                    <input type="text" class="form-control" id="driverName" name="driverName">
                                </div>
                                <div class="col-md-6">
                                    <label for="driverPhone" class="form-label">司机电话</label>
                                    <input type="tel" class="form-control" id="driverPhone" name="driverPhone">
                                </div>
                                -->
                                <div class="col-12">
                                    <label for="description" class="form-label">备注</label>
                                    <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="saveVehicleBtn">
                            <i class="fas fa-save me-2"></i>保存
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 批量创建车辆模态框 -->
        <div class="modal fade" id="batchVehicleModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">批量创建模拟车辆</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="batchVehicleForm">
                            <div class="row g-3">
                                <div class="col-md-3">
                                    <label class="form-label">数量</label>
                                    <input type="number" class="form-control" name="count" value="2000" min="1" max="2000">
                                    <small class="text-muted">一次最多创建2000辆</small>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">车牌前缀</label>
                                    <input type="text" class="form-control" name="platePrefix" value="新C">
                                    <small class="text-muted">如：新C</small>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">起始序号</label>
                                    <input type="number" class="form-control" name="indexStart" value="0" min="0">
                                    <small class="text-muted">从该序号开始，如0→00000</small>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">序号位数</label>
                                    <input type="number" class="form-control" name="indexWidth" value="5" min="1" max="8">
                                    <small class="text-muted">用于补零，如5位→00000</small>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">设备号起始（11位）</label>
                                    <input type="text" class="form-control" name="terminalStart" value="10000000000">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">SIM卡号起始（11位）</label>
                                    <input type="text" class="form-control" name="simStart" value="13900000000">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">递增步长</label>
                                    <input type="number" class="form-control" name="increment" value="1" min="1" max="1000000">
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label">备注</label>
                                    <input type="text" class="form-control" name="description" value="模拟车辆">
                                </div>
                            </div>
                            <hr>
                            <div class="alert alert-info">
                                规则说明：最终车牌为 <code>前缀 + 序号补零</code>（如 新C00000 ~ 新C02000）；设备号与SIM卡号均为11位数字，从起始值按步长递增，数量与车牌一致。可通过“起始序号/起始号段”从任意位置继续批量创建。
                            </div>
                            <div id="batchPreview" class="small text-muted"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="doBatchCreateBtn">
                            <i class="fas fa-play me-2"></i>生成并创建
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

        console.log('初始化车辆管理页面');

        // 绑定事件
        bindEvents();

        // 加载车辆列表
        loadVehicles();

        initialized = true;
    }

    // 绑定事件
    function bindEvents() {
        // 添加车辆按钮
        $(document).on('click', '#addVehicleBtn', function() {
            showVehicleForm();
        });

        // 批量创建按钮
        $(document).on('click', '#batchCreateVehiclesBtn', function() {
            showBatchCreateModal();
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
        $(document).on('change', '#statusFilter, #typeFilter', function() {
            search();
        });

        // 全选/取消全选
        $(document).on('change', '#selectAll', function() {
            const checked = $(this).prop('checked');
            $('.vehicle-checkbox').prop('checked', checked);
            updateBatchButtons();
        });

        // 单选
        $(document).on('change', '.vehicle-checkbox', function() {
            updateSelectAll();
            updateBatchButtons();
        });

        // 批量操作
        // 批量启动/停止已移除

        $(document).on('click', '#batchDeleteBtn', function() {
            batchOperation('delete');
        });

        // 车辆操作
        $(document).on('click', '.view-btn', function() {
            const vehicleId = $(this).data('id');
            showVehicleDetail(vehicleId);
        });

        $(document).on('click', '.edit-btn', function() {
            const vehicleId = $(this).data('id');
            showVehicleForm(vehicleId);
        });

        $(document).on('click', '#vehiclesTable .delete-btn', function() {
            const vehicleId = $(this).data('id');
            deleteVehicle(vehicleId);
        });

        // 单车启动/停止按钮已移除

        // 保存车辆
        $(document).on('click', '#saveVehicleBtn', function() {
            saveVehicle();
        });
        $(document).on('click', '#mockVehicleBtn', function() {
            mockVehicle();
        });

        // 批量创建提交
        $(document).on('click', '#doBatchCreateBtn', function() {
            doBatchCreate();
        });

        // 编辑车辆（从详情页）
        $(document).on('click', '#editVehicleBtn', function() {
            const vehicleId = $(this).data('id');
            $('#vehicleDetailModal').modal('hide');
            setTimeout(() => {
                showVehicleForm(vehicleId);
            }, 300);
        });

        // 分页
        $(document).on('click', '#vehiclesPagination .page-link', function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            if (page && page !== currentPage) {
                currentPage = page;
                loadVehicles();
            }
        });
    }

    // 加载车辆列表
    async function loadVehicles() {
        try {
            showLoading(true);

            const params = {
                pageIndex: currentPage,
                pageSize: pageSize,
                plateNumber: searchKeyword,
                status: statusFilter,
                type: $('#typeFilter').val()
            };

            const response = await window.API.vehicle.list(params);
            // 处理API响应结构：{ error: {...}, data: {...} }
            const data = response.data?.data || response.data || {};

            renderVehicleTable(data.list || []);
            updatePagination(data);
            updateStatistics(data);

        } catch (error) {
            console.error('加载车辆列表失败:', error);
            if (window.App) {
                window.App.showError('加载车辆列表失败');
            }
            showEmpty();
        } finally {
            showLoading(false);
        }
    }

    // 渲染车辆表格
    function renderVehicleTable(vehicles) {
        const tbody = $('#vehiclesTableBody');
        
        if (!vehicles || vehicles.length === 0) {
            showEmpty();
            return;
        }

        const html = vehicles.map(vehicle => `
            <tr>
                <td>
                    <div class="form-check">
                        <input class="form-check-input vehicle-checkbox" type="checkbox" 
                               value="${vehicle.id}">
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="vehicle-avatar me-2">
                            <i class="fas fa-car text-primary"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${vehicle.plateNumber}</div>
                        </div>
                    </div>
                </td>
                <td>${vehicle.terminalId}</td>
                <td>
                    <span class="badge bg-light text-dark">
                        ${vehicle.description || '普通车辆'}
                    </span>
                </td>
                <td>
                    <span class="badge ${getStatusBadgeClass(vehicle.status)}">
                        ${getStatusText(vehicle.status)}
                    </span>
                </td>
                <td>
                    <div class="location-info">
                        <div>${vehicle.location || '未知位置'}</div>
                        <small class="text-muted">${vehicle.latitude && vehicle.longitude ? `经纬度: ${vehicle.latitude}, ${vehicle.longitude}` : '暂无位置信息'}</small>
                    </div>
                </td>
                <td>
                    <div class="time-info">
                        <div>${formatDateTime(vehicle.lastReportTime || vehicle.updateTime || vehicle.createTime)}</div>
                        <small class="text-muted">最后上报</small>
                    </div>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary view-btn" 
                                data-id="${vehicle.id}" title="查看详情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-secondary edit-btn" 
                                data-id="${vehicle.id}" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger delete-btn" 
                                data-id="${vehicle.id}" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.html(html);
        $('#emptyState').hide();
    }

    // 显示车辆详情
    async function showVehicleDetail(vehicleId) {
        try {
            if (window.App) {
                window.App.setLoading(true);
            }

            const response = await window.API.vehicle.get(vehicleId);
            const vehicle = response.data;

            const detailHtml = `
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">车牌号</label>
                            <div class="info-value">${vehicle.plateNumber}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">设备号</label>
                            <div class="info-value">${vehicle.terminalId}</div>
                        </div>
                    </div>
                    <!-- 车辆类型字段在Vehicle实体中不存在，所以注释掉 -->
                    <!--
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">车辆类型</label>
                            <div class="info-value">${getVehicleTypeText(vehicle.vehicleType)}</div>
                        </div>
                    </div>
                    -->
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">状态</label>
                            <div class="info-value">
                                <span class="badge ${getStatusBadgeClass(vehicle.status)}">
                                    ${getStatusText(vehicle.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">SIM卡号</label>
                            <div class="info-value">${vehicle.simNumber || '-'}</div>
                        </div>
                    </div>
                    <!-- 司机姓名字段在Vehicle实体中不存在，所以注释掉 -->
                    <!--
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">司机姓名</label>
                            <div class="info-value">${vehicle.driverName || '-'}</div>
                        </div>
                    </div>
                    -->
                    <!-- 司机电话字段在Vehicle实体中不存在，所以注释掉 -->
                    <!--
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">司机电话</label>
                            <div class="info-value">${vehicle.driverPhone || '-'}</div>
                        </div>
                    </div>
                    -->
                    <div class="col-md-6">
                        <div class="info-item">
                            <label class="form-label">最后上报时间</label>
                            <div class="info-value">${formatDateTime(vehicle.lastReportTime)}</div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="info-item">
                            <label class="form-label">当前位置</label>
                            <div class="info-value">
                                ${vehicle.location || '未知位置'}
                                ${vehicle.latitude ? `<br><small class="text-muted">经纬度: ${vehicle.latitude}, ${vehicle.longitude}</small>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="info-item">
                            <label class="form-label">备注</label>
                            <div class="info-value">${vehicle.description || '-'}</div>
                        </div>
                    </div>
                </div>
            `;

            $('#vehicleDetailContent').html(detailHtml);
            $('#editVehicleBtn').data('id', vehicleId);
            $('#vehicleDetailModal').modal('show');

        } catch (error) {
            console.error('获取车辆详情失败:', error);
            if (window.App) {
                window.App.showError('获取车辆详情失败');
            }
        } finally {
            if (window.App) {
                window.App.setLoading(false);
            }
        }
    }

    // 显示车辆表单
    async function showVehicleForm(vehicleId = null) {
        const isEdit = !!vehicleId;
        
        $('#vehicleFormTitle').text(isEdit ? '编辑车辆' : '添加车辆');
        const formEl = $('#vehicleForm')[0];
        if (formEl && typeof formEl.reset === 'function') formEl.reset();
        $('#vehicleForm .is-invalid').removeClass('is-invalid');

        if (isEdit) {
            try {
                if (window.App) {
                    window.App.setLoading(true);
                }

                const response = await window.API.vehicle.get(vehicleId);
                const vehicle = response.data;

                // 填充表单 - 修复字段映射和数据处理
                $('#plateNumber').val(vehicle.plateNumber ? vehicle.plateNumber.trim() : '');
                $('#terminalId').val(vehicle.terminalId || '');
                $('#simNumber').val(vehicle.simNumber || '');
                $('#description').val(vehicle.description || '');
                // vehicleType在Vehicle实体中不存在，所以注释掉
                // $('#vehicleType').val(vehicle.vehicleType || 'truck');
                // driverName和driverPhone在Vehicle实体中也不存在
                // $('#driverName').val(vehicle.driverName || '');
                // $('#driverPhone').val(vehicle.driverPhone || '');

                $('#saveVehicleBtn').data('id', vehicleId);

            } catch (error) {
                console.error('获取车辆信息失败:', error);
                if (window.App) {
                    window.App.showError('获取车辆信息失败');
                }
                return;
            } finally {
                if (window.App) {
                    window.App.setLoading(false);
                }
            }
        } else {
            $('#saveVehicleBtn').removeData('id');
        }

        $('#vehicleFormModal').modal('show');
    }

    function mockVehicle() {
        const plates = ['京','沪','浙','粤','川','渝','苏','鲁','晋','豫','鄂','湘','赣','皖','琼','辽','吉','黑','蒙','桂','云','贵','陕','甘','青','宁','藏','新'];
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const digits = String(Math.floor(10000 + Math.random() * 89999));
        const plate = plates[Math.floor(Math.random() * plates.length)] + letter + digits;
        const term = String(Math.floor(100000000000000 + Math.random() * 899999999999999));
        const sim = '13' + String(Math.floor(800000000 + Math.random() * 199999999));
        $('#plateNumber').val(plate);
        $('#terminalId').val(term);
        $('#simNumber').val(sim);
        $('#description').val('模拟车辆');
    }

    // 保存车辆
    async function saveVehicle() {
        const form = $('#vehicleForm')[0];
        const formData = new FormData(form);
        const vehicleId = $('#saveVehicleBtn').data('id');
        const isEdit = !!vehicleId;

        // 表单验证
        if (!validateForm()) {
            return;
        }

        try {
            if (window.App) {
                window.App.setLoading(true);
            }

            const data = Object.fromEntries(formData.entries());
            
            // 清理数据
            if (data.plateNumber) {
                data.plateNumber = data.plateNumber.trim();
            }

            let response;
            if (isEdit) {
                response = await window.API.vehicle.update(vehicleId, data);
            } else {
                response = await window.API.vehicle.create(data);
            }

            if (window.App) {
                window.App.showSuccess(isEdit ? '车辆更新成功' : '车辆添加成功');
            }

            $('#vehicleFormModal').modal('hide');
            loadVehicles();

        } catch (error) {
            console.error('保存车辆失败:', error);
            if (window.App) {
                window.App.showError('保存车辆失败');
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
        const form = $('#vehicleForm');

        // 清除之前的验证状态
        form.find('.is-invalid').removeClass('is-invalid');

        // 车牌号验证
        const plateNumber = $('#plateNumber').val().trim();
        if (!plateNumber) {
            showFieldError('plateNumber', '请输入车牌号');
            isValid = false;
        } else if (!window.Utils.validator.isLicensePlate(plateNumber)) {
            showFieldError('plateNumber', '车牌号格式不正确');
            isValid = false;
        }

        // 设备号验证
        const terminalId = $('#terminalId').val().trim();
        if (!terminalId) {
            showFieldError('terminalId', '请输入设备号');
            isValid = false;
        }

        // SIM卡号验证
        const simNumber = $('#simNumber').val().trim();
        if (!simNumber) {
            showFieldError('simNumber', '请输入SIM卡号');
            isValid = false;
        }

        // 司机电话验证 - 注释掉因为driverPhone字段不存在
        // const driverPhone = $('#driverPhone').val().trim();
        // if (driverPhone && !window.Utils.validator.isPhone(driverPhone)) {
        //     showFieldError('driverPhone', '电话号码格式不正确');
        //     isValid = false;
        // }

        return isValid;
    }

    // 显示字段错误
    function showFieldError(fieldName, message) {
        const field = $(`#${fieldName}`);
        field.addClass('is-invalid');
        field.siblings('.invalid-feedback').text(message);
    }

    // 删除车辆
    const deletingVehicleIds = new Set();
    function deleteVehicle(vehicleId) {
        if (deletingVehicleIds.has(vehicleId)) return;
        if (window.App && window.App.confirm) {
            window.App.confirm('确认删除', '确定要删除这辆车吗？此操作不可恢复。', async () => {
                try {
                    if (window.App) {
                        window.App.setLoading(true);
                    }
                    deletingVehicleIds.add(vehicleId);
                    await window.API.vehicle.delete(vehicleId);
                    
                    if (window.App) {
                        window.App.showSuccess('车辆删除成功');
                    }
                    
                    loadVehicles();

                } catch (error) {
                    console.error('删除车辆失败:', error);
                    if (window.App) {
                        window.App.showError('删除车辆失败');
                    }
                } finally {
                    if (window.App) {
                        window.App.setLoading(false);
                    }
                    deletingVehicleIds.delete(vehicleId);
                }
            });
        }
    }

    // 启动车辆
    async function startVehicle(vehicleId) {
        try {
            if (window.App) {
                window.App.setLoading(true);
            }

            await window.API.vehicle.start(vehicleId);
            
            if (window.App) {
                window.App.showSuccess('车辆启动成功');
            }
            
            loadVehicles();

        } catch (error) {
            console.error('启动车辆失败:', error);
            if (window.App) {
                window.App.showError('启动车辆失败');
            }
        } finally {
            if (window.App) {
                window.App.setLoading(false);
            }
        }
    }

    // 停止车辆
    async function stopVehicle(vehicleId) {
        try {
            if (window.App) {
                window.App.setLoading(true);
            }

            await window.API.vehicle.stop(vehicleId);
            
            if (window.App) {
                window.App.showSuccess('车辆停止成功');
            }
            
            loadVehicles();

        } catch (error) {
            console.error('停止车辆失败:', error);
            if (window.App) {
                window.App.showError('停止车辆失败');
            }
        } finally {
            if (window.App) {
                window.App.setLoading(false);
            }
        }
    }

    // 搜索
    function search() {
        searchKeyword = $('#searchInput').val().trim();
        statusFilter = $('#statusFilter').val();
        currentPage = 1;
        loadVehicles();
    }

    // 批量操作
    function batchOperation(operation) {
        const selectedIds = $('.vehicle-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            if (window.App) {
                window.App.showWarning('请选择要操作的车辆');
            }
            return;
        }

        let message = '';
        switch (operation) {
            case 'delete':
                message = `确定要删除选中的 ${selectedIds.length} 辆车吗？此操作不可恢复。`;
                break;
        }

        if (window.App && window.App.confirm) {
            window.App.confirm('批量操作确认', message, async () => {
                try {
                    if (window.App) {
                        window.App.setLoading(true);
                    }

                    await window.API.vehicle.batch(operation, selectedIds);
                    
                    if (window.App) {
                        window.App.showSuccess('批量操作成功');
                    }
                    
                    loadVehicles();

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
        const total = $('.vehicle-checkbox').length;
        const checked = $('.vehicle-checkbox:checked').length;
        
        $('#selectAll').prop('indeterminate', checked > 0 && checked < total);
        $('#selectAll').prop('checked', checked === total && total > 0);
    }

    // 更新批量操作按钮状态
    function updateBatchButtons() {
        const selectedCount = $('.vehicle-checkbox:checked').length;
        const hasSelection = selectedCount > 0;
        
        $('#batchStartBtn, #batchStopBtn, #batchDeleteBtn').prop('disabled', !hasSelection);
    }

    // 更新分页
    function updatePagination(data) {
        totalPages = data.pageCount || 0;
        const totalElements = data.recordCount || 0;
        
        // 更新统计信息
        const start = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalElements);
        
        $('#vehiclesPageStart').text(start);
        $('#vehiclesPageEnd').text(end);
        $('#vehiclesTotalItems').text(totalElements);

        // 生成分页
        const pagination = $('#vehiclesPagination');
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
        const totalElements = data.recordCount || 0;
        $('#totalCount').text(`共 ${totalElements} 辆车`);
    }

    // 显示加载状态
    function showLoading(show) {
        if (show) {
            $('#loadingState').show();
            $('#emptyState').hide();
            $('#vehiclesTableBody').empty();
        } else {
            $('#loadingState').hide();
        }
    }

    // 显示空状态
    function showEmpty() {
        $('#emptyState').show();
        $('#loadingState').hide();
        $('#vehiclesTableBody').empty();
    }

    // 获取车辆类型文本
    function getVehicleTypeText(type) {
        const types = {
            truck: '货车',
            bus: '客车',
            taxi: '出租车',
            private: '私家车'
        };
        return types[type] || type;
    }

    // 获取状态文本
    function getStatusText(status) {
        const statuses = {
            0: '禁用',
            1: '启用',
            online: '在线',
            offline: '离线',
            fault: '故障',
            maintenance: '维护'
        };
        return statuses[status] || status;
    }

    // 获取状态徽章样式
    function getStatusBadgeClass(status) {
        const classes = {
            0: 'bg-secondary',
            1: 'bg-success',
            online: 'bg-success',
            offline: 'bg-secondary',
            fault: 'bg-danger',
            maintenance: 'bg-warning'
        };
        return classes[status] || 'bg-secondary';
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
        loadVehicles();
    }

    // 销毁页面
    function destroy() {
        initialized = false;
    }

    // 初始化模块
    function init() {
        console.log('车辆管理模块初始化完成');
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
    function showBatchCreateModal() {
        const $m = $('#batchVehicleModal');
        if ($m.length === 0) return;
        // 填充预览
        updateBatchPreview();
        $m.modal('show');
        $('#batchVehicleForm input').off('input').on('input', updateBatchPreview);
    }

    function updateBatchPreview() {
        const f = Object.fromEntries(new FormData(document.getElementById('batchVehicleForm')).entries());
        const count = parseInt(f.count || '2000', 10);
        const prefix = f.platePrefix || '新C';
        const start = parseInt(f.indexStart || '0', 10);
        const width = parseInt(f.indexWidth || '5', 10);
        const termStart = String(f.terminalStart || '10000000000');
        const simStart = String(f.simStart || '13900000000');
        const inc = parseInt(f.increment || '1', 10);
        const first = prefix + String(start).padStart(width, '0');
        const last = prefix + String(start + Math.max(count - 1, 0)).padStart(width, '0');
        $('#batchPreview').html(`示例范围：<code>${first}</code> ~ <code>${last}</code>，设备号从 <code>${termStart}</code> 起，每次+${inc}；SIM从 <code>${simStart}</code> 起，每次+${inc}`);
    }

    async function doBatchCreate() {
        const form = document.getElementById('batchVehicleForm');
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.count = parseInt(payload.count || '2000', 10);
        payload.indexStart = parseInt(payload.indexStart || '0', 10);
        payload.indexWidth = parseInt(payload.indexWidth || '5', 10);
        payload.increment = parseInt(payload.increment || '1', 10);
        try {
            if (window.App) window.App.setLoading(true);
            const res = await window.API.vehicle.batchCreate(payload);
            const body = res.data?.data || {};
            $('#batchVehicleModal').modal('hide');
            if (window.App) window.App.showSuccess(`创建成功 ${body.created || 0} 辆，跳过 ${body.skipped || 0} 辆`);
            refresh();
        } catch (e) {
            console.error('批量创建失败:', e);
            if (window.App) window.App.showError('批量创建失败');
        } finally {
            if (window.App) window.App.setLoading(false);
        }
    }
