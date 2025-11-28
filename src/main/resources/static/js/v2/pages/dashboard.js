/**
 * JTT808模拟器 V2 仪表板页面
 * 显示系统概览和统计信息
 */

window.Dashboard = (function() {
    'use strict';

    let initialized = false;
    let refreshTimer = null;
    let chartInstances = {};

    // 页面模板
    const template = `
        <div class="dashboard-container">
            <!-- 快速操作 -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="btn-group">
                    <a href="#" class="btn btn-primary" data-page="tasks" id="quickCreateTask"><i class="fas fa-plus me-2"></i>创建任务</a>
                    <a href="#" class="btn btn-outline-primary" data-page="vehicles" id="quickAddVehicle"><i class="fas fa-car me-2"></i>添加车辆</a>
                    <a href="#" class="btn btn-outline-primary" data-page="gateways" id="quickAddGateway"><i class="fas fa-server me-2"></i>添加网关</a>
                    <a href="#" class="btn btn-outline-primary" data-page="routes" id="quickAddRoute"><i class="fas fa-route me-2"></i>新增路线</a>
                </div>
                <button class="btn btn-outline-secondary refresh-btn"><i class="fas fa-sync-alt"></i> 刷新</button>
            </div>

            <!-- 统计卡片 -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stats-card primary">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        在线车辆
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800" id="onlineVehicles">0</div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-car fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stats-card success">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        活跃网关
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800" id="activeGateways">0</div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-server fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stats-card info">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        运行任务
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800" id="runningTasks">0</div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-tasks fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stats-card warning">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        总消息
                                    </div>
                                    <div class="h5 mb-0 font-weight-bold text-gray-800" id="totalMessages">0</div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-comments fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 图表区域 -->
            <div class="row mb-4">
                <div class="col-xl-8 col-lg-7">
                    <div class="card shadow mb-4">
                        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 class="m-0 font-weight-bold text-primary">消息流量趋势</h6>
                            <div class="dropdown no-arrow">
                                <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                                   data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in">
                                    <div class="dropdown-header">时间范围:</div>
                                    <a class="dropdown-item" href="#" data-range="1h">最近1小时</a>
                                    <a class="dropdown-item" href="#" data-range="6h">最近6小时</a>
                                    <a class="dropdown-item" href="#" data-range="24h">最近24小时</a>
                                    <a class="dropdown-item" href="#" data-range="7d">最近7天</a>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="chart-area">
                                <canvas id="messageChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-5">
                    <div class="card shadow mb-4">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">车辆状态分布</h6>
                        </div>
                        <div class="card-body">
                            <div class="chart-pie pt-4 pb-2">
                                <canvas id="vehicleStatusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 最近活动 -->
            <div class="row">
                <div class="col-lg-6 mb-4">
                    <div class="card shadow">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">最近活动</h6>
                        </div>
                        <div class="card-body">
                            <div class="activity-list" id="recentActivity">
                                <!-- 活动列表将在这里动态生成 -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 mb-4">
                    <div class="card shadow">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">系统状态</h6>
                        </div>
                        <div class="card-body">
                            <div class="system-status" id="systemStatus">
                                <!-- 系统状态将在这里动态生成 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-6 mb-4">
                    <div class="card shadow">
                        <div class="card-header py-3"><h6 class="m-0 font-weight-bold text-primary">活跃任务</h6></div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-sm mb-0"><thead class="table-light"><tr><th>ID</th><th>车牌</th><th>SIM</th><th>状态</th><th>操作</th></tr></thead><tbody id="activeTasksBody"><tr><td colspan="5" class="text-muted text-center py-3">加载中...</td></tr></tbody></table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 mb-4">
                    <div class="card shadow">
                        <div class="card-header py-3"><h6 class="m-0 font-weight-bold text-primary">网关健康</h6></div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-sm mb-0"><thead class="table-light"><tr><th>名称</th><th>地址</th><th>端口</th><th>状态</th></tr></thead><tbody id="gatewayHealthBody"><tr><td colspan="4" class="text-muted text-center py-3">加载中...</td></tr></tbody></table>
                            </div>
                        </div>
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

        console.log('初始化仪表板页面');

        // 加载统计数据
        loadStatistics();

        // 初始化图表
        initializeCharts();

        loadActiveTasks();
        loadGatewayHealth();

        // 绑定事件
        bindEvents();

        // 设置自动刷新
        startAutoRefresh();

        initialized = true;
    }

    // 加载统计数据
    async function loadStatistics() {
        try {
            const res = await window.API.get('/dashboard/summary');
            const d = res.data?.data || {};
            $('#onlineVehicles').text(String(d.onlineVehicles||0));
            $('#activeGateways').text(String(d.activeGateways||0));
            $('#runningTasks').text(String(d.runningTasks||0));
            $('#totalMessages').text(formatNumber(d.messagesTotal||0));
            animateNumbers();
        } catch (error) {
            if (window.App) window.App.showError('加载统计数据失败');
        }
    }

    // 初始化图表
    function initializeCharts() {
        // 消息流量趋势图
        initMessageChart();
        
        // 车辆状态分布图
        initVehicleStatusChart();
    }

    // 初始化消息流量图表
    function initMessageChart() {
        const ctx = document.getElementById('messageChart');
        if (!ctx) return;
        chartInstances.messageChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'QPS',
                    data: [],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 6
                    }
                }
            }
        });
        chartInstances.lastMsgTotal = 0;
        chartInstances.lastTs = Date.now();
    }

    // 初始化车辆状态图表
    function initVehicleStatusChart() {
        const ctx = document.getElementById('vehicleStatusChart');
        if (!ctx) return;

        chartInstances.vehicleStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['在线', '离线', '故障', '维护'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#10b981',
                        '#94a3b8',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '70%'
            }
        });
        try {
            window.API.get('/dashboard/vehicleStatus').then(res => { const d = res.data?.data || {}; const ds = chartInstances.vehicleStatusChart.data.datasets[0]; ds.data = [d.online||0, d.offline||0, d.fault||0, d.maintenance||0]; chartInstances.vehicleStatusChart.update(); });
        } catch (e) {}
    }

    // 加载最近活动
    async function loadRecentActivity() {
        try { const res = await window.API.get('/dashboard/activities'); const list = res.data?.data || []; const html = list.map(x => `<div class="activity-item d-flex align-items-center mb-3"><div class="activity-icon me-3"><div class="icon-circle bg-secondary"><i class="fa fa-network-wired text-white"></i></div></div><div class="activity-content flex-grow-1"><div class="activity-title">${x.title||'-'}</div><div class="activity-time text-muted small">${x.time?new Date(x.time).toLocaleString('zh-CN'):'-'}</div></div></div>`).join(''); $('#recentActivity').html(html || '<div class="text-muted">暂无活动</div>'); } catch(e) { $('#recentActivity').html('<div class="text-danger">加载失败</div>'); }
    }

    // 加载系统状态
    async function loadSystemStatus() {
        try {
            const res = await window.API.get('/dashboard/system');
            const d = res.data?.data || {};
            const mem = Number(d.memory || 0);
            const threads = Number(d.threads || 0);
            const memoryHtml = `<div class="status-item mb-3"><div class="d-flex justify-content-between align-items-center mb-1"><div class="status-label"><i class="fa fa-memory me-2"></i>内存使用率</div><div class="status-value">${mem}%</div></div><div class="progress" style="height: 6px;"><div class="progress-bar bg-${mem>80?'danger':(mem>60?'warning':'success')}" style="width: ${Math.min(mem,100)}%"></div></div></div>`;
            const threadsHtml = `<div class="status-item mb-3"><div class="d-flex justify-content-between align-items-center mb-1"><div class="status-label"><i class="fa fa-stream me-2"></i>线程数</div><div class="status-value">${threads} 个</div></div></div>`;
            $('#systemStatus').html(memoryHtml + threadsHtml);
        } catch(e) {
            $('#systemStatus').html('<div class="text-danger">加载失败</div>');
        }
    }

    // 绑定事件
    function bindEvents() {
        // 时间范围切换
        $(document).on('click', '[data-range]', function(e) {
            e.preventDefault();
            const range = $(this).data('range');
            updateMessageChart(range);
        });

        // 刷新按钮
        $(document).on('click', '.refresh-btn', function() {
            refresh();
        });

        // 快速操作：打开弹框或跳转页面后由页面自身处理创建
        $(document).on('click', '#quickCreateTask', function(e){ e.preventDefault(); window.App.navigateToPage('tasks'); setTimeout(function(){ $('#openSingleTask').trigger('click'); }, 300); });
        $(document).on('click', '#quickAddVehicle', function(e){ e.preventDefault(); window.App.navigateToPage('vehicles'); setTimeout(function(){ $('#addVehicleBtn').trigger('click'); }, 300); });
        $(document).on('click', '#quickAddGateway', function(e){ e.preventDefault(); window.App.navigateToPage('gateways'); setTimeout(function(){ $('#addGatewayBtn').trigger('click'); }, 300); });
        $(document).on('click', '#quickAddRoute', function(e){ e.preventDefault(); window.App.navigateToPage('routes'); setTimeout(function(){ document.getElementById('addRouteBtn').click(); }, 300); });
    }

    async function loadActiveTasks() {
        try {
            const res = await window.API.task.list({ page: 1, size: 5 });
            const data = res.data || {};
            const list = data.content || [];
            const rows = list.map(x => `
                <tr>
                    <td>${x.id}</td>
                    <td>${x.vehicleNumber || '-'}</td>
                    <td>${x.simNumber || '-'}</td>
                    <td><span class="badge ${x.state === 'running' ? 'bg-success' : 'bg-secondary'}">${x.state || '-'}</span></td>
                    <td><button class="btn btn-outline-danger btn-sm" data-id="${x.id}" onclick="DashboardTerminate(${x.id})">终止</button></td>
                </tr>`).join('');
            $('#activeTasksBody').html(rows || '<tr><td colspan="5" class="text-muted text-center py-3">暂无任务</td></tr>');
        } catch (e) {
            $('#activeTasksBody').html('<tr><td colspan="5" class="text-danger text-center py-3">加载失败</td></tr>');
        }
    }
    window.DashboardTerminate = async function(id){ try{ await window.API.task.terminate(id); if(window.App) window.App.showSuccess('任务终止成功'); loadActiveTasks(); }catch(e){ if(window.App) window.App.showError('任务终止失败'); } };

    async function loadGatewayHealth() {
        try {
            const res = await window.API.gateway.list({ page: 1, size: 5 });
            const data = res.data || {};
            const list = data.content || [];
            const rows = list.map(g => `
                <tr>
                    <td>${g.gatewayName || '-'}</td>
                    <td>${g.ipAddress || '-'}</td>
                    <td>${g.port || '-'}</td>
                    <td><span class="badge ${g.status === 'active' ? 'bg-success' : 'bg-secondary'}">${g.status}</span></td>
                </tr>`).join('');
            $('#gatewayHealthBody').html(rows || '<tr><td colspan="4" class="text-muted text-center py-3">暂无数据</td></tr>');
        } catch (e) {
            $('#gatewayHealthBody').html('<tr><td colspan="4" class="text-danger text-center py-3">加载失败</td></tr>');
        }
    }

    function startAutoRefresh() {
        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(() => { loadStatistics(); loadActiveTasks(); loadGatewayHealth(); loadRecentActivity(); loadSystemStatus(); }, 30000);
        if (chartInstances.messageChart) {
            if (chartInstances.tickTimer) clearInterval(chartInstances.tickTimer);
            chartInstances.tickTimer = setInterval(async () => { try { const res = await window.API.get('/dashboard/messages/current'); const d = res.data?.data || {}; const now = d.timestamp || Date.now(); const total = Number(d.messagesTotal||0); const dt = Math.max(now - (chartInstances.lastTs||now), 1); const diff = Math.max(total - (chartInstances.lastMsgTotal||0), 0); const qps = Math.round(diff / (dt/1000)); chartInstances.lastMsgTotal = total; chartInstances.lastTs = now; const label = new Date(now).toLocaleTimeString('zh-CN',{hour12:false}); const data = chartInstances.messageChart.data; data.labels.push(label); data.datasets[0].data.push(qps); if (data.labels.length>60){ data.labels.shift(); data.datasets[0].data.shift(); } chartInstances.messageChart.update(); document.getElementById('totalMessages').textContent = formatNumber(total); } catch(e) {} }, 5000);
        }
    }

    function refresh() {
        loadStatistics();
        loadActiveTasks();
        loadGatewayHealth();
        loadRecentActivity();
        loadSystemStatus();
    }

    // 更新消息图表
    function updateMessageChart(range) {
        if (!chartInstances.messageChart) return;

        // 根据时间范围生成新数据
        const chart = chartInstances.messageChart;
        const labels = [];
        const data = [];
        
        let intervals, format;
        switch (range) {
            case '1h':
                intervals = 12; // 5分钟间隔
                format = (i) => {
                    const time = new Date(Date.now() - i * 5 * 60 * 1000);
                    return time.getHours() + ':' + String(time.getMinutes()).padStart(2, '0');
                };
                break;
            case '6h':
                intervals = 12; // 30分钟间隔
                format = (i) => {
                    const time = new Date(Date.now() - i * 30 * 60 * 1000);
                    return time.getHours() + ':' + String(time.getMinutes()).padStart(2, '0');
                };
                break;
            case '24h':
                intervals = 24; // 1小时间隔
                format = (i) => {
                    const time = new Date(Date.now() - i * 60 * 60 * 1000);
                    return time.getHours() + ':00';
                };
                break;
            case '7d':
                intervals = 7; // 1天间隔
                format = (i) => {
                    const time = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                    return (time.getMonth() + 1) + '/' + time.getDate();
                };
                break;
            default:
                return;
        }

        for (let i = intervals - 1; i >= 0; i--) {
            labels.push(format(i));
            data.push(Math.floor(Math.random() * 1000) + 100);
        }

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    }

    // 数字动画
    function animateNumbers() {
        $('.stats-card .h5').each(function() {
            const $this = $(this);
            const target = parseInt($this.text().replace(/,/g, ''));
            const duration = 1000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                $this.text(formatNumber(Math.floor(current)));
            }, 16);
        });
    }

    // 格式化数字
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // 开始自动刷新
    function startAutoRefresh() {
        // 每30秒刷新一次数据
        refreshTimer = setInterval(() => {
            loadStatistics();
            loadRecentActivity();
            loadSystemStatus();
        }, 30000);
    }

    // 停止自动刷新
    function stopAutoRefresh() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    }

    // 刷新页面数据
    function refresh() {
        loadStatistics();
        loadRecentActivity();
        loadSystemStatus();
    }

    // 销毁页面
    function destroy() {
        stopAutoRefresh();
        
        // 销毁图表实例
        Object.values(chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        chartInstances = {};
        
        initialized = false;
    }

    // 初始化模块
    function init() {
        console.log('仪表板模块初始化完成');
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
