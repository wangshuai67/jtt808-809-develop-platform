/**
 * 路线管理页面
 */
window.Routes = {
    // 页面状态
    state: {
        routes: [],
        currentPage: 1,
        pageSize: 10,
        total: 0,
        loading: false,
        searchKeyword: '',
        selectedRoutes: new Set(),
        sortField: 'createTime',
        sortOrder: 'desc'
    },

    // 页面模板
    template: `
        <div class="routes-page">
            <!-- 页面头部 -->
            <div class="page-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="mb-1">路线管理</h4>
                        <p class="text-muted mb-0">管理车辆行驶路线和轨迹</p>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-outline-secondary" id="refreshBtn">
                            <i class="fas fa-sync-alt"></i> 刷新
                        </button>
                        <button type="button" class="btn btn-primary" id="addRouteBtn">
                            <i class="fas fa-plus"></i> 新增路线
                        </button>
                    </div>
                </div>
            </div>

            <!-- 搜索和筛选 -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="search-box">
                                <input type="text" class="form-control" id="searchInput" placeholder="搜索路线名称...">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="statusFilter">
                                <option value="">全部状态</option>
                                <option value="active">启用</option>
                                <option value="inactive">禁用</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="typeFilter">
                                <option value="">全部类型</option>
                                <option value="normal">普通路线</option>
                                <option value="loop">循环路线</option>
                                <option value="custom">自定义路线</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button type="button" class="btn btn-outline-primary w-100" id="searchBtn">
                                <i class="fas fa-search"></i> 搜索
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 批量操作工具栏 -->
            <div class="batch-toolbar" id="batchToolbar" style="display: none;">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="selected-count">已选择 <strong id="selectedCount">0</strong> 项</span>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-danger" id="batchDeleteBtn">
                            <i class="fas fa-trash"></i> 批量删除
                        </button>
                    </div>
                </div>
            </div>

            <!-- 路线列表 -->
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover" id="routesTable">
                            <thead>
                                <tr>
                                    <th width="40">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="selectAll">
                                        </div>
                                    </th>
                                    <th>路线名称</th>
                                    <th>类型</th>
                                    <th>起点</th>
                                    <th>终点</th>
                                    <th>距离</th>
                                    <th>点数</th>
                                    <th>状态</th>
                                    <th>创建时间</th>
                                    <th width="200">操作</th>
                                </tr>
                            </thead>
                            <tbody id="routesTableBody">
                                <!-- 动态内容 -->
                            </tbody>
                        </table>
                    </div>

                    <!-- 分页 -->
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div class="text-muted">
                            显示第 <span id="pageStart">0</span> 到 <span id="pageEnd">0</span> 条，共 <span id="totalCount">0</span> 条记录
                        </div>
                        <nav>
                            <ul class="pagination mb-0" id="routesPagination">
                                <!-- 动态分页 -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <!-- 路线详情模态框 -->
        <div class="modal fade" id="routeDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">路线详情</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="routeDetailContent">
                        <!-- 动态内容 -->
                    </div>
                </div>
            </div>
        </div>

        <!-- 新增/编辑路线模态框 -->
        <div class="modal fade" id="routeFormModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header d-flex align-items-center justify-content-between">
                        <h5 class="modal-title" id="routeFormTitle">新增路线</h5>
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" class="btn btn-outline-secondary btn-sm" id="mockRouteBtn">mock数据</button>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                    </div>
                    <div class="modal-body">
                        <form id="routeForm">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">路线名称 <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="name" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">路线类型</label>
                                    <select class="form-select" name="type">
                                        <option value="normal">普通路线</option>
                                        <option value="loop">循环路线</option>
                                        <option value="custom">自定义路线</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">起点名称</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="startName">
                                        <button class="btn btn-outline-secondary" type="button" id="openMapStartBtn">地图</button>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">终点名称</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="endName">
                                        <button class="btn btn-outline-secondary" type="button" id="openMapEndBtn">地图</button>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">起点坐标</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="startCoord" placeholder="经度,纬度">
                                        <button class="btn btn-outline-secondary" type="button" id="resolveRouteBtn">解析路线</button>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">终点坐标</label>
                                    <input type="text" class="form-control" name="endCoord" placeholder="经度,纬度">
                                </div>
                                <div class="col-12">
                                    <label class="form-label">路线描述</label>
                                    <textarea class="form-control" name="description" rows="3"></textarea>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">路线点数据 (JSON格式)</label>
                                    <textarea class="form-control" name="points" rows="5" placeholder='[{"lng": 116.404, "lat": 39.915, "speed": 60}, ...]'></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="saveRouteBtn">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    // 渲染页面
    render() {
        return this.template;
    },

    // 初始化页面（在DOM渲染后调用）
    initialize() {
        this.bindEvents();
        this.loadRoutes();
    },

    // 绑定事件
    bindEvents() {
        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadRoutes();
        });

        // 新增路线按钮
        document.getElementById('addRouteBtn').addEventListener('click', () => {
            this.showRouteForm();
        });

        // 搜索
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.search();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });

        // 筛选
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.search();
        });

        document.getElementById('typeFilter').addEventListener('change', () => {
            this.search();
        });

        // 全选
        document.getElementById('selectAll').addEventListener('change', (e) => {
            this.selectAll(e.target.checked);
        });

        // 批量操作
        // 启停按钮移除

        document.getElementById('batchDeleteBtn').addEventListener('click', () => {
            this.batchOperation('delete');
        });

        // 保存路线
        document.getElementById('saveRouteBtn').addEventListener('click', () => {
            this.saveRoute();
        });
        // 读取百度AK
        (async () => {
            try {
                const cfg = await App.api.get('/task/config');
                const ak = cfg && cfg.data && cfg.data.data && cfg.data.data.baiduMapAk;
                if (ak) window.BMAP_AK = ak;
            } catch (e) {}
        })();
        // mock路线
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'mockRouteBtn') {
                this.mockRoute();
            }
        });
    },

    // 生成并填充mock路线数据
    mockRoute() {
        const form = document.getElementById('routeForm');
        if (!form) return;
        const names = ['市区环线','机场快速路','滨海大道','高架主线','工业园区线','景区环线'];
        const startStops = ['国贸立交','火车站','科技园','市政府','国际会展中心'];
        const endStops = ['机场T2','东站','北湖公园','体育中心','大学城'];
        const name = names[Math.floor(Math.random()*names.length)];
        const startName = startStops[Math.floor(Math.random()*startStops.length)];
        const endName = endStops[Math.floor(Math.random()*endStops.length)];

        // 随机生成北京附近经纬度
        function randCoord(baseLng=116.40, baseLat=39.90, dLng=0.08, dLat=0.06) {
            const lng = baseLng + (Math.random()-0.5)*dLng*2;
            const lat = baseLat + (Math.random()-0.5)*dLat*2;
            return { lng: parseFloat(lng.toFixed(6)), lat: parseFloat(lat.toFixed(6)) };
        }
        const A = randCoord();
        const B = randCoord();
        form.name.value = name;
        form.type.value = 'normal';
        form.startName.value = startName;
        form.endName.value = endName;
        form.startCoord.value = `${A.lng},${A.lat}`;
        form.endCoord.value = `${B.lng},${B.lat}`;
        form.description.value = '自动生成的模拟路线';

        // 生成沿线点（5~12个）
        const count = 6 + Math.floor(Math.random()*7);
        const points = [];
        for (let i=0;i<count;i++) {
            const t = i/(count-1);
            const lng = parseFloat((A.lng + (B.lng - A.lng)*t + (Math.random()-0.5)*0.001).toFixed(6));
            const lat = parseFloat((A.lat + (B.lat - A.lat)*t + (Math.random()-0.5)*0.001).toFixed(6));
            const speed = 30 + Math.floor(Math.random()*50);
            points.push({ lng, lat, speed });
        }
        form.points.value = JSON.stringify(points, null, 2);
    },

    // 加载路线列表
    async loadRoutes() {
        if (this.state.loading) return;

        this.state.loading = true;
        this.showLoading();

        try {
            const params = {
                page: this.state.currentPage,
                size: this.state.pageSize,
                keyword: this.state.searchKeyword,
                status: document.getElementById('statusFilter')?.value || '',
                type: document.getElementById('typeFilter')?.value || '',
                sortField: this.state.sortField,
                sortOrder: this.state.sortOrder
            };

            const response = await App.api.routeAPI.list(params);
            this.state.routes = response.data.records || [];
            // 追加统计信息（距离/点数/状态/创建时间）
            const ids = this.state.routes.map(r => r.id).filter(Boolean);
            if (ids.length) {
                const statsRes = await App.api.routeAPI.stats(ids);
                const statsMap = new Map((statsRes.data || []).map(s => [s.id, s]));
                this.state.routes = this.state.routes.map(r => {
                    const st = statsMap.get(r.id) || {};
                    return {
                        ...r,
                        distance: st.distance ?? r.mileages ?? 0,
                        pointCount: st.pointCount ?? 0,
                        startName: st.startName ?? r.startName ?? '-',
                        endName: st.endName ?? r.endName ?? '-',
                        status: st.status ?? 'active',
                        createTime: st.createTime ?? r.createTime ?? null
                    };
                });
            }
            this.state.total = response.data.total || 0;
            this.renderRoutes();
            this.renderPagination();
        } catch (error) {
            console.error('加载路线列表失败:', error);
            App.showToast('加载路线列表失败', 'error');
        } finally {
            this.state.loading = false;
            this.hideLoading();
        }
    },

    // 渲染路线列表
    renderRoutes() {
        const tbody = document.getElementById('routesTableBody');
        
        if (this.state.routes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-route fa-3x text-muted mb-3"></i>
                            <p class="text-muted">暂无路线数据</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.state.routes.map(route => `
            <tr>
                <td>
                    <div class="form-check">
                        <input class="form-check-input route-checkbox" type="checkbox" 
                               value="${route.id}" onchange="Routes.onRouteSelect(this)">
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-route text-primary me-2"></i>
                        <div>
                            <div class="fw-medium">${route.name || '-'}</div>
                            ${route.description ? `<small class="text-muted">${route.description}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-${this.getTypeColor(route.type)}">${this.getTypeText(route.type)}</span>
                </td>
                <td>${route.startName || '-'}</td>
                <td>${route.endName || '-'}</td>
                <td>${this.formatDistance(route.distance)}</td>
                <td>${route.pointCount || 0}</td>
                <td>
                    <span class="badge bg-${route.status === 'active' ? 'success' : 'secondary'}">
                        ${route.status === 'active' ? '启用' : '禁用'}
                    </span>
                </td>
                <td>${this.formatDateTime(route.createTime)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary view-route-btn" 
                                data-id="${route.id}" title="查看">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-success edit-route-btn" 
                                data-id="${route.id}" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger delete-route-btn" 
                                data-id="${route.id}" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateSelectAllStatus();
    },

    // 路线选择事件
    onRouteSelect(checkbox) {
        const routeId = parseInt(checkbox.value);
        if (checkbox.checked) {
            this.state.selectedRoutes.add(routeId);
        } else {
            this.state.selectedRoutes.delete(routeId);
        }
        this.updateBatchToolbar();
        this.updateSelectAllStatus();
    },

    // 全选/取消全选
    selectAll(checked) {
        const checkboxes = document.querySelectorAll('.route-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const routeId = parseInt(checkbox.value);
            if (checked) {
                this.state.selectedRoutes.add(routeId);
            } else {
                this.state.selectedRoutes.delete(routeId);
            }
        });
        this.updateBatchToolbar();
    },

    // 更新全选状态
    updateSelectAllStatus() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.route-checkbox');
        const checkedCount = document.querySelectorAll('.route-checkbox:checked').length;
        
        if (checkedCount === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedCount === checkboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    },

    // 更新批量操作工具栏
    updateBatchToolbar() {
        const toolbar = document.getElementById('batchToolbar');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.state.selectedRoutes.size > 0) {
            toolbar.style.display = 'block';
            selectedCount.textContent = this.state.selectedRoutes.size;
        } else {
            toolbar.style.display = 'none';
        }
    },

    // 搜索
    search() {
        this.state.searchKeyword = document.getElementById('searchInput').value.trim();
        this.state.currentPage = 1;
        this.loadRoutes();
    },

    // 查看路线详情
    async viewRoute(routeId) {
        try {
            const response = await App.api.routeAPI.get(routeId);
            if (response.success && response.data) this.showRouteDetail(response.data);
            else App.showToast('获取路线详情失败', 'error');
        } catch (error) {
            console.error('获取路线详情失败:', error);
            App.showToast('获取路线详情失败', 'error');
        }
    },

    // 显示路线详情
    showRouteDetail(route) {
        const content = document.getElementById('routeDetailContent');
        content.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label text-muted">路线名称</label>
                    <p class="fw-medium">${route.name || '-'}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">路线类型</label>
                    <p><span class="badge bg-${this.getTypeColor(route.type)}">${this.getTypeText(route.type)}</span></p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">起点</label>
                    <p>${route.startName || '-'}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">终点</label>
                    <p>${route.endName || '-'}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">距离</label>
                    <p>${this.formatDistance(route.distance)}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">点数</label>
                    <p>${route.pointCount || 0}</p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">状态</label>
                    <p><span class="badge bg-${route.status === 'active' ? 'success' : 'secondary'}">${route.status === 'active' ? '启用' : '禁用'}</span></p>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted">创建时间</label>
                    <p>${this.formatDateTime(route.createTime)}</p>
                </div>
                <div class="col-12">
                    <label class="form-label text-muted">描述</label>
                    <p>${route.description || '-'}</p>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('routeDetailModal'));
        modal.show();
    },

    // 显示路线表单
    showRouteForm(route = null) {
        const modal = new bootstrap.Modal(document.getElementById('routeFormModal'));
        const title = document.getElementById('routeFormTitle');
        const form = document.getElementById('routeForm');

        if (route) {
            title.textContent = '编辑路线';
            // 填充表单数据
            form.name.value = route.name || '';
            form.type.value = route.type || 'normal';
            form.startName.value = route.startName || '';
            form.endName.value = route.endName || '';
            form.startCoord.value = route.startCoord || '';
            form.endCoord.value = route.endCoord || '';
            form.description.value = route.description || '';
            form.points.value = route.points ? JSON.stringify(route.points, null, 2) : '';
            form.dataset.routeId = route.id;
        } else {
            title.textContent = '新增路线';
            form.reset();
            delete form.dataset.routeId;
        }

        modal.show();
    },

    // 编辑路线
    async editRoute(routeId) {
        try {
            const response = await App.api.routeAPI.get(routeId);
            if (response.success && response.data) this.showRouteForm(response.data);
            else App.showToast('获取路线信息失败', 'error');
        } catch (error) {
            console.error('获取路线信息失败:', error);
            App.showToast('获取路线信息失败', 'error');
        }
    },

    // 保存路线
    async saveRoute() {
        const form = document.getElementById('routeForm');
        if (!this.validateForm(form)) {
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 解析坐标和点数据
        try {
            if (data.points) {
                data.points = JSON.parse(data.points);
            }
        } catch (error) {
            App.showToast('路线点数据格式错误', 'error');
            return;
        }

        try {
            let response;
            if (form.dataset.routeId) {
                // 编辑
                response = await App.api.routeAPI.update(form.dataset.routeId, data);
            } else {
                // 新增
                response = await App.api.routeAPI.create(data);
            }

            if (response.success) {
                App.showToast(form.dataset.routeId ? '路线更新成功' : '路线创建成功', 'success');
                bootstrap.Modal.getInstance(document.getElementById('routeFormModal')).hide();
                this.loadRoutes();
            } else {
                App.showToast('保存失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('保存路线失败:', error);
            App.showToast('保存路线失败', 'error');
        }
    },

    // 切换路线状态
    async toggleStatus(routeId) {
        try {
            const response = await App.api.routeAPI.toggleStatus(routeId);
            if (response.success) {
                App.showToast('状态更新成功', 'success');
                this.loadRoutes();
            } else {
                App.showToast('状态更新失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('状态更新失败:', error);
            App.showToast('状态更新失败', 'error');
        }
    },

    // 删除路线
    async deleteRoute(routeId) {
        const result = await App.confirm('确定要删除这条路线吗？', '删除确认');
        if (!result) return;

        try {
            const response = await App.api.routeAPI.delete(routeId);
            if (response.success) {
                App.showToast('删除成功', 'success');
                this.loadRoutes();
            } else {
                App.showToast('删除失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('删除路线失败:', error);
            App.showToast('删除路线失败', 'error');
        }
    },

    async geocode(name) {
        if (!name || !name.trim()) return null;
        const ak = window.BMAP_AK;
        if (!ak) { App.showToast('请配置百度地图AK: window.BMAP_AK', 'warning'); return null; }
        await this.ensureBMap();
        return await new Promise((resolve) => {
            const geo = new BMap.Geocoder();
            geo.getPoint(name, function(pt){
                if (!pt) return resolve(null);
                resolve({ lng: parseFloat(pt.lng.toFixed(6)), lat: parseFloat(pt.lat.toFixed(6)) });
            });
        });
    },

    async routeBetween(a, b) {
        const ak = window.BMAP_AK;
        if (!ak) { App.showToast('请配置百度地图AK: window.BMAP_AK', 'warning'); return []; }
        await this.ensureBMap();
        return await new Promise((resolve) => {
            const map = new BMap.Map(document.createElement('div'));
            const driving = new BMap.DrivingRoute(map, { onSearchComplete: function(rs){
                try {
                    const plan = rs && rs.getPlan(0);
                    const route = plan && plan.getRoute(0);
                    const path = route && route.getPath() || [];
                    const pts = path.map(p => ({ lng: parseFloat(p.lng.toFixed(6)), lat: parseFloat(p.lat.toFixed(6)) }));
                    resolve(pts);
                } catch(e) { resolve([]); }
            }});
            const sp = new BMap.Point(a.lng, a.lat);
            const ep = new BMap.Point(b.lng, b.lat);
            driving.search(sp, ep);
        });
    },

    downsample(points, max = 100) {
        if (!points || points.length <= max) return points;
        const step = Math.ceil(points.length / max);
        const out = [];
        for (let i = 0; i < points.length; i += step) out.push(points[i]);
        if (out[out.length - 1] !== points[points.length - 1]) out.push(points[points.length - 1]);
        return out;
    },

    async resolveRoute() {
        const form = document.getElementById('routeForm');
        const startName = form.startName.value.trim();
        const endName = form.endName.value.trim();
        let A = null, B = null;
        if (startName) A = await this.geocode(startName);
        if (endName) B = await this.geocode(endName);
        const sc = form.startCoord.value.trim();
        const ec = form.endCoord.value.trim();
        if (!A && sc) {
            const s = sc.split(',').map(x => parseFloat(x));
            if (s.length === 2 && !isNaN(s[0]) && !isNaN(s[1])) A = { lng: s[0], lat: s[1] };
        }
        if (!B && ec) {
            const e = ec.split(',').map(x => parseFloat(x));
            if (e.length === 2 && !isNaN(e[0]) && !isNaN(e[1])) B = { lng: e[0], lat: e[1] };
        }
        if (!A || !B) { App.showToast('请填写或选取有效的起点和终点', 'warning'); return; }
        form.startCoord.value = `${A.lng},${A.lat}`;
        form.endCoord.value = `${B.lng},${B.lat}`;
        try {
            const line = await this.routeBetween(A, B);
            const ds = this.downsample(line, 100).map(p => ({ ...p, speed: 60 }));
            form.points.value = JSON.stringify(ds, null, 2);
            App.showToast('已解析并生成路线点', 'success');
        } catch (e) { App.showToast('生成路线失败', 'error'); }
    },

    async openMap(which) {
        const form = document.getElementById('routeForm');
        if (!window.BMAP_AK) {
            try {
                const cfg = await App.api.get('/task/config');
                const ak = cfg && cfg.data && cfg.data.data && cfg.data.data.baiduMapAk;
                if (ak) window.BMAP_AK = ak;
            } catch (e) {}
        }
        const modalHtml = `
        <div class="modal fade" id="pickMapModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header"><h6 class="modal-title">选择${which==='start'?'起点':'终点'}</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
              <div class="modal-body" style="height:420px">
                <div id="mapContainer" style="height:100%"></div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                <button class="btn btn-primary" id="confirmMapPickBtn" disabled>确认</button>
              </div>
            </div>
          </div>
        </div>`;
        const container = document.createElement('div');
        container.innerHTML = modalHtml;
        document.body.appendChild(container);
        const $m = $('#pickMapModal');
        $m.on('hidden.bs.modal', function(){ $(this).remove(); container.remove(); });
        $m.modal('show');
        const ak = window.BMAP_AK;
        if (!ak) { App.showToast('请配置百度地图AK: window.BMAP_AK', 'warning'); return; }
        await this.ensureBMap();
        const map = new window.BMap.Map('mapContainer');
        const center = new BMap.Point(116.404, 39.915);
        map.centerAndZoom(center, 12);
        map.enableScrollWheelZoom(true);
        let marker = null;
        let pickedPoint = null;
        map.addEventListener('click', function(e){
            const pt = e.point;
            const lat = parseFloat(pt.lat.toFixed(6));
            const lng = parseFloat(pt.lng.toFixed(6));
            if (marker) marker.setPosition(pt); else marker = new BMap.Marker(pt), map.addOverlay(marker);
            pickedPoint = pt;
            document.getElementById('confirmMapPickBtn').disabled = false;
        });

        const confirmBtn = document.getElementById('confirmMapPickBtn');
        confirmBtn.addEventListener('click', async function(){
            if (!pickedPoint) return;
            const lat = parseFloat(pickedPoint.lat.toFixed(6));
            const lng = parseFloat(pickedPoint.lng.toFixed(6));
            const coordText = `${lng},${lat}`;
            const geo = new BMap.Geocoder();
            geo.getLocation(pickedPoint, function(rs){
                let name = '';
                try {
                    if (rs && rs.address) name = rs.address;
                    else if (rs && rs.addressComponents) {
                        const c = rs.addressComponents;
                        name = [c.province, c.city, c.district, c.street, c.streetNumber].filter(Boolean).join('');
                    }
                } catch(e) {}
                if (which === 'start') {
                    form.startCoord.value = coordText;
                    if (name) form.startName.value = name;
                } else {
                    form.endCoord.value = coordText;
                    if (name) form.endName.value = name;
                }
                $('#pickMapModal').modal('hide');
                App.showToast('已选择坐标并填充到表单', 'success');
            });
        });
    },

    async ensureBMap() {
        if (window.BMap) return;
        if (window.__BMAP_LOADING) { await window.__BMAP_LOADING; return; }
        const ak = window.BMAP_AK;
        if (!ak) throw new Error('百度AK未配置');
        window.__BMAP_LOADING = new Promise((resolve, reject) => {
            window.__bmap_init_cb = function(){ resolve(); window.__BMAP_LOADING = null; };
            const script = document.createElement('script');
            script.src = `https://api.map.baidu.com/api?v=3.0&ak=${ak}&callback=__bmap_init_cb`;
            script.async = true;
            script.onerror = function(){ reject(new Error('加载百度地图失败')); window.__BMAP_LOADING = null; };
            document.head.appendChild(script);
        });
        await window.__BMAP_LOADING;
    },

    // 批量操作
    async batchOperation(operation) {
        if (this.state.selectedRoutes.size === 0) {
            App.showToast('请选择要操作的路线', 'warning');
            return;
        }

        const routeIds = Array.from(this.state.selectedRoutes);
        let confirmMessage = '';
        
        switch (operation) {
            case 'enable':
                confirmMessage = `确定要启用选中的 ${routeIds.length} 条路线吗？`;
                break;
            case 'disable':
                confirmMessage = `确定要禁用选中的 ${routeIds.length} 条路线吗？`;
                break;
            case 'delete':
                confirmMessage = `确定要删除选中的 ${routeIds.length} 条路线吗？此操作不可恢复！`;
                break;
        }

        const result = await App.confirm(confirmMessage, '批量操作确认');
        if (!result) return;

        try {
            const response = await App.api.routeAPI.batchOperation(operation, routeIds);
            if (response.success) {
                App.showToast('批量操作成功', 'success');
                this.state.selectedRoutes.clear();
                this.loadRoutes();
            } else {
                App.showToast('批量操作失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('批量操作失败:', error);
            App.showToast('批量操作失败', 'error');
        }
    },

    // 表单验证
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                App.showToast(`请填写${field.previousElementSibling.textContent.replace('*', '').trim()}`, 'warning');
                return false;
            }
        }
        return true;
    },

    // 渲染分页
    renderPagination() {
        const pagination = document.getElementById('routesPagination');
        const totalPages = Math.ceil(this.state.total / this.state.pageSize);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // 上一页
        paginationHTML += `
            <li class="page-item ${this.state.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="Routes.goToPage(${this.state.currentPage - 1})">上一页</a>
            </li>
        `;

        // 页码
        const startPage = Math.max(1, this.state.currentPage - 2);
        const endPage = Math.min(totalPages, this.state.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onclick="Routes.goToPage(1)">1</a></li>`;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.state.currentPage ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0)" onclick="Routes.goToPage(${i})">${i}</a>
                </li>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHTML += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onclick="Routes.goToPage(${totalPages})">${totalPages}</a></li>`;
        }

        // 下一页
        paginationHTML += `
            <li class="page-item ${this.state.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="Routes.goToPage(${this.state.currentPage + 1})">下一页</a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;

        // 更新统计信息
        const start = (this.state.currentPage - 1) * this.state.pageSize + 1;
        const end = Math.min(this.state.currentPage * this.state.pageSize, this.state.total);
        
        document.getElementById('pageStart').textContent = this.state.total > 0 ? start : 0;
        document.getElementById('pageEnd').textContent = end;
        document.getElementById('totalCount').textContent = this.state.total;
    },

    // 跳转页面
    goToPage(page) {
        if (page < 1 || page > Math.ceil(this.state.total / this.state.pageSize)) return;
        this.state.currentPage = page;
        this.loadRoutes();
    },

    // 显示加载状态
    showLoading() {
        const tbody = document.getElementById('routesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4">
                    <div class="loading-state">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">加载中...</span>
                        </div>
                        <p class="mt-2 text-muted">加载中...</p>
                    </div>
                </td>
            </tr>
        `;
    },

    // 隐藏加载状态
    hideLoading() {
        // 加载完成后会重新渲染表格，所以这里不需要特殊处理
    },

    // 刷新页面
    refresh() {
        this.state.selectedRoutes.clear();
        this.loadRoutes();
    },

    // 销毁页面
    destroy() {
        // 清理事件监听器和定时器
        this.state.selectedRoutes.clear();
    },

    // 工具方法
    getTypeColor(type) {
        const colors = {
            normal: 'primary',
            loop: 'success',
            custom: 'warning'
        };
        return colors[type] || 'secondary';
    },

    getTypeText(type) {
        const texts = {
            normal: '普通路线',
            loop: '循环路线',
            custom: '自定义路线'
        };
        return texts[type] || '未知';
    },

    formatDistance(distance) {
        if (!distance) return '-';
        if (distance < 1000) {
            return distance + 'km';
        }
        return  distance + 'km';
    },

    formatDateTime(dateTime) {
        if (!dateTime) return '-';
        return new Date(dateTime).toLocaleString('zh-CN');
    }
};
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'openMapStartBtn') window.Routes.openMap('start');
            if (e.target && e.target.id === 'openMapEndBtn') window.Routes.openMap('end');
            if (e.target && e.target.id === 'resolveRouteBtn') window.Routes.resolveRoute();
        });

        $(document).on('click', '.view-route-btn', function(){ const id=$(this).data('id'); Routes.viewRoute(id); });
        $(document).on('click', '.edit-route-btn', function(){ const id=$(this).data('id'); Routes.editRoute(id); });
        $(document).on('click', '.delete-route-btn', function(){ const id=$(this).data('id'); Routes.deleteRoute(id); });
