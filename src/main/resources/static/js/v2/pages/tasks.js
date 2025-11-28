window.Tasks = (function() {
    'use strict';

    let initialized = false;

    const template = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="btn-group">
                    <button class="btn btn-primary" id="openSingleTask">创建任务</button>
                    <button class="btn btn-outline-primary" id="openBatchTask">批量创建</button>
                   <button class="btn btn-outline-primary" id="openPressureBatchTask">批量压测任务</button>
                </div>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary" id="refreshTasks">刷新</button>
                    <button class="btn btn-outline-primary" id="openHistoryTasks">历史任务</button>

                    <button class="btn btn-outline-secondary" id="openSystemConfig">系统配置</button>
                    <button class="btn btn-danger" id="batchTerminateTasks" disabled>批量终止</button>
                </div>
            </div>
            <div class="card">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th width="40"><div class="form-check"><input class="form-check-input" type="checkbox" id="selectAllTasks"></div></th>
                                    <th>ID</th>
                                    <th>车牌号</th>
                                    <th>终端ID</th>
                                    <th>SIM卡号</th>
                                    <th>线路名称</th>
                                    <th>轨迹点数</th>
                                    <th>状态</th>
                                    <th>开始时间</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="tasksListBody"></tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-between align-items-center">
                    <div class="text-muted">显示第 <span id="pageStart">0</span> - <span id="pageEnd">0</span> 条，共 <span id="totalItems">0</span> 条</div>
                    <nav><ul class="pagination pagination-sm mb-0" id="tasksPagination"></ul></nav>
                </div>
            </div>

            <div class="modal fade" id="singleTaskModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header"><h6 class="modal-title">创建临时行程任务</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                        <div class="modal-body">
                            <form id="singleTaskForm">
                                <div class="row g-3">
                                    <div class="col-md-6"><label class="form-label">选择车辆</label><select class="form-select" id="vehicleSelect"><option value="">- 请选择车辆 -</option></select><div class="invalid-feedback"></div></div>
                                    <div class="col-md-6"><label class="form-label">行驶线路 <span class="text-danger">*</span></label><select class="form-select" id="routeId" required><option value="0">- 请选择行驶线路 -</option></select><div class="invalid-feedback"></div></div>

                                    <div class="col-md-6"><label class="form-label">车牌号 <span class="text-danger">*</span></label><input type="text" class="form-control" id="vehicleNumber" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-6"><label class="form-label">终端ID <span class="text-danger">*</span></label><input type="text" class="form-control" id="deviceSn" required><div class="invalid-feedback"></div></div>

                                    <div class="col-md-6"><label class="form-label">终端SIM卡号 <span class="text-danger">*</span></label><input type="text" class="form-control" id="simNumber" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-6"><label class="form-label">初始里程数(公里)</label><input type="number" class="form-control" id="mileages" value="0"><div class="invalid-feedback"></div></div>

                                    <div class="col-md-6"><label class="form-label">选择808网关</label><select class="form-select" id="gatewaySelect"><option value="">- 请选择网关 -</option></select><div class="invalid-feedback"></div></div>
                                    <div class="col-md-6"><label class="form-label">808网关服务器 <span class="text-danger">*</span></label><input type="text" class="form-control" id="serverAddress" required><div class="invalid-feedback"></div></div>

                                    <div class="col-md-6"><label class="form-label">808网关端口 <span class="text-danger">*</span></label><input type="number" class="form-control" id="serverPort" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-6"></div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">取消</button><button type="button" class="btn btn-primary" id="saveSingleTask">启动</button></div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="batchTaskModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header"><h6 class="modal-title">批量创建行程任务</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                        <div class="modal-body">
                            <form id="batchTaskForm">
                                <div class="mb-3"><label class="form-label">行驶线路</label><select class="form-select" id="routeIdList" multiple size="6"><option value="0" selected>- 随机分配 -</option></select></div>
                                <div class="mb-3"><label class="form-label">车辆数量 <span class="text-danger">*</span></label><input type="number" class="form-control" id="vehicleCount" value="100" min="1" required><div class="invalid-feedback"></div></div>
                                <div class="mb-3"><label class="form-label">车牌号模式 <span class="text-danger">*</span></label><input type="text" class="form-control" id="vehicleNumberPattern" value="京%06d" required><div class="invalid-feedback"></div></div>
                                <div class="mb-3"><label class="form-label">终端ID模式 <span class="text-danger">*</span></label><input type="text" class="form-control" id="deviceSnPattern" value="A%06d" required><div class="invalid-feedback"></div></div>
                                <div class="mb-3"><label class="form-label">SIM卡号模式 <span class="text-danger">*</span></label><input type="text" class="form-control" id="simNumberPattern" value="013800%06d" required><div class="invalid-feedback"></div></div>
                                <div class="mb-3"><label class="form-label">选择808网关</label><select class="form-select" id="batchGatewaySelect"><option value="">- 请选择网关 -</option></select><div class="invalid-feedback"></div></div>
                                <div class="mb-3"><label class="form-label">808网关服务器 <span class="text-danger">*</span></label><input type="text" class="form-control" id="batchServerAddress" required><div class="invalid-feedback"></div></div>
                                <div class="mb-3"><label class="form-label">808网关端口 <span class="text-danger">*</span></label><input type="number" class="form-control" id="batchServerPort" required><div class="invalid-feedback"></div></div>
                            </form>
                        </div>
                        <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">取消</button><button type="button" class="btn btn-primary" id="saveBatchTask">创建</button></div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="pressureBatchTaskModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header"><h6 class="modal-title">批量压测任务（按车辆规则）</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                        <div class="modal-body">
                            <form id="pressureBatchTaskForm">
                                <div class="mb-3"><label class="form-label">行驶线路</label><select class="form-select" id="pressureRouteIdList" multiple size="6"><option value="0" selected>- 随机分配 -</option></select></div>
                                <div class="row g-3">
                                    <div class="col-md-3"><label class="form-label">数量 <span class="text-danger">*</span></label><input type="number" class="form-control" name="count" value="2000" min="1" max="20000" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-3"><label class="form-label">车牌前缀 <span class="text-danger">*</span></label><input type="text" class="form-control" name="platePrefix" value="新C" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-3"><label class="form-label">起始序号</label><input type="number" class="form-control" name="indexStart" value="0" min="0"><div class="invalid-feedback"></div></div>
                                    <div class="col-md-3"><label class="form-label">序号位数 <span class="text-danger">*</span></label><input type="number" class="form-control" name="indexWidth" value="5" min="1" max="8" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-4"><label class="form-label">设备号起始（11位） <span class="text-danger">*</span></label><input type="text" class="form-control" name="terminalStart" value="10000000000" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-4"><label class="form-label">SIM起始（11位） <span class="text-danger">*</span></label><input type="text" class="form-control" name="simStart" value="13900000000" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-4"><label class="form-label">递增步长</label><input type="number" class="form-control" name="increment" value="1" min="1" max="1000000"><div class="invalid-feedback"></div></div>
                                    <div class="col-md-6"><label class="form-label">选择808网关</label><select class="form-select" id="pressureGatewaySelect"><option value="">- 请选择网关 -</option></select></div>
                                    <div class="col-md-6"><label class="form-label">808网关服务器 <span class="text-danger">*</span></label><input type="text" class="form-control" id="pressureServerAddress" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-6"><label class="form-label">808网关端口 <span class="text-danger">*</span></label><input type="number" class="form-control" id="pressureServerPort" required><div class="invalid-feedback"></div></div>
                                    <div class="col-md-3"><label class="form-label">定位上报频率(秒)</label><input type="number" class="form-control" name="locationIntervalSec" value="10" min="1"><div class="invalid-feedback"></div></div>
                                    <div class="col-md-9"><label class="form-label">警报类型索引(逗号分隔)</label><input type="text" class="form-control" name="alertFlags" placeholder="如: 0,1,2"><div class="invalid-feedback"></div><div class="form-text">参考旧版监控页32位警报：00紧急、01超速、02疲劳驾驶、03危险预警、04GNSS故障等。</div></div>
                                </div>
                                <hr>
                                <div class="alert alert-info">
                                    规则说明：车牌为 <code>前缀 + 序号补零</code>（如 新C00000 ~ 新C02000）；设备号与SIM为11位数字，从起始值按步长递增，数量一致。可通过“起始序号/起始号段”从任意位置继续批量创建。
                                </div>
                                <div id="pressurePreview" class="small text-muted"></div>
                            </form>
                        </div>
                        <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">取消</button><button type="button" class="btn btn-primary" id="savePressureBatchTask">创建</button></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    function render() { return template; }

    function initialize() {
        if (initialized) return;
        bindEvents();
        loadConfigAndRoutes();
        loadTasksPage(1);
        initialized = true;
    }

    function bindEvents() {
        $(document).on('click', '#openSingleTask', async function(){
            $('#singleTaskForm')[0].reset();
            await ensureDropdownsLoaded();
            $('#singleTaskModal').modal('show');
        });
        $(document).on('click', '#openBatchTask', async function(){
            $('#batchTaskForm')[0].reset();
            await ensureDropdownsLoaded();
            $('#batchTaskModal').modal('show');
        });
        $(document).on('click', '#saveSingleTask', runSingleTask);
        $(document).on('click', '#saveBatchTask', runBatchTasks);
        $(document).on('click', '#refreshTasks', function(){ loadTasksPage(1); });
        $(document).on('click', '#openHistoryTasks', function(){ openHistoryModal(); });
        $(document).on('click', '#openPressureBatchTask', function(){ openPressureBatchModal(); });
        $(document).on('click', '#openSystemConfig', function(){ openSystemConfigModal(); });
        $(document).on('click', '#tasksPagination .page-link', function(e){ e.preventDefault(); const p=$(this).data('page'); if(p) loadTasksPage(p); });
        $(document).on('click', '.terminate-task', function(){ const id=$(this).data('id'); terminateTask(id); });
        $(document).on('click', '.log-task', function(){ const id=$(this).data('id'); openLogModal(id); });
        $(document).on('change', '#vehicleSelect', onVehicleSelected);
        $(document).on('change', '#gatewaySelect', onGatewaySelected);
        $(document).on('change', '#batchGatewaySelect', onBatchGatewaySelected);
        $(document).on('change', '#pressureGatewaySelect', onPressureGatewaySelected);
        $(document).on('click', '#savePressureBatchTask', runPressureBatchTasks);
        $(document).on('change', '#selectAllTasks', function(){ const on=$(this).is(':checked'); $('#tasksListBody .task-select').prop('checked', on); updateBatchTerminateButton(); });
        $(document).on('change', '#tasksListBody .task-select', function(){ updateBatchTerminateButton(); });
        $(document).on('click', '#batchTerminateTasks', batchTerminate);
    }

    async function openHistoryModal(){
        const modalHtml = `
        <div class="modal fade" id="historyTasksModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header"><h6 class="modal-title">历史任务</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
              <div class="modal-body">
                <div class="table-responsive">
                  <table class="table table-sm align-middle mb-0">
                    <thead class="table-light"><tr><th>ID</th><th>线路</th><th>车辆</th><th>运行次数</th><th>最后运行时间</th></tr></thead>
                    <tbody id="historyTasksBody"><tr><td colspan="5" class="text-muted text-center py-3">加载中...</td></tr></tbody>
                  </table>
                </div>
                <nav class="mt-2"><ul class="pagination pagination-sm mb-0" id="historyTasksPagination"></ul></nav>
              </div>
              <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">关闭</button></div>
            </div>
          </div>
        </div>`;
        const container = document.createElement('div');
        container.innerHTML = modalHtml;
        document.body.appendChild(container);
        const $modal = $('#historyTasksModal');
        $modal.on('hidden.bs.modal', function(){ $(this).remove(); container.remove(); });
        $modal.modal('show');
        await loadHistoryPage(1);
    }

    async function loadHistoryPage(page){
        try{
            const size = 10;
            const res = await window.API.task.history({ page, size });
            const data = res.data || {};
            const list = data.content || [];
            const tbody = $('#historyTasksBody');
            if(!list.length){ tbody.html('<tr><td colspan="5" class="text-muted text-center py-3">暂无历史任务</td></tr>'); }
            else{
                const rows = list.map(x => `
                    <tr>
                        <td>${x.id}</td>
                        <td>${x.routeName || x.routeId || '-'}</td>
                        <td>${x.vehicleName || '-'}</td>
                        <td>${x.runCount || 0}</td>
                        <td>${x.lastDriveTime ? new Date(x.lastDriveTime).toLocaleString() : '-'}</td>
                    </tr>`).join('');
                tbody.html(rows);
            }
            renderHistoryPagination(page, size, data.totalElements || 0, data.totalPages || 0);
        }catch(e){ $('#historyTasksBody').html('<tr><td colspan="5" class="text-danger text-center py-3">加载失败</td></tr>'); }
    }

    function renderHistoryPagination(page, size, totalElements, totalPages){
        const ul = $('#historyTasksPagination'); ul.empty();
        if((totalPages||0)<=1) return;
        ul.append(`<li class="page-item ${page===1?'disabled':''}"><a class="page-link" href="#" data-pg="${page-1}">上一页</a></li>`);
        const sp = Math.max(1, page-2); const ep = Math.min(totalPages, page+2);
        for(let i=sp;i<=ep;i++) ul.append(`<li class="page-item ${i===page?'active':''}"><a class="page-link" href="#" data-pg="${i}">${i}</a></li>`);
        ul.append(`<li class="page-item ${page===totalPages?'disabled':''}"><a class="page-link" href="#" data-pg="${page+1}">下一页</a></li>`);
        ul.find('.page-link').on('click', function(e){ e.preventDefault(); const p=$(this).data('pg'); if(p) loadHistoryPage(p); });
    }

    async function loadTasksPage(page){
        const size = 10;
        try{
            const res = await window.API.task.list({ page, size });
            const data = res.data || {};
            const list = data.content || [];
            renderTasks(list);
            renderPagination(page, size, data.totalElements, data.totalPages);
        }catch(e){
            console.error('加载任务失败:', e);
            const tbody = $('#tasksListBody');
            tbody.html('<tr><td colspan="9" class="text-center text-danger py-3">加载任务失败，请检查API连接</td></tr>');
        }
    }

    function renderTasks(list){
        const tbody = $('#tasksListBody');
        if(!list || list.length===0){ tbody.html('<tr><td colspan="9" class="text-center text-muted py-3">暂无任务</td></tr>'); return; }
        const html = list.map(x => `
            <tr>
                <td><div class="form-check"><input class="form-check-input task-select" type="checkbox" value="${x.id}"></div></td>
                <td>${x.id}</td>
                <td>${x.vehicleNumber||''}</td>
                <td>${x.deviceSn||''}</td>
                <td>${x.simNumber||''}</td>
                <td>${x.routeName||x.routeId||'-'}</td>
                <td>${x.routePointCount||0}</td>
                <td>${x.state||''}</td>
                <td>${x.startTime ? new Date(x.startTime).toLocaleString() : '-'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info log-task" data-id="${x.id}">日志</button>
                        <button class="btn btn-outline-danger terminate-task" data-id="${x.id}">终止</button>
                    </div>
                </td>
            </tr>
        `).join('');
        tbody.html(html);
        updateBatchTerminateButton();
    }

    function renderPagination(page, size, totalElements, totalPages){
        const start = totalElements>0 ? (page-1)*size+1 : 0;
        const end = Math.min(page*size, totalElements||0);
        $('#pageStart').text(start);
        $('#pageEnd').text(end);
        $('#totalItems').text(totalElements||0);
        const ul = $('#tasksPagination'); ul.empty();
        if((totalPages||0)<=1) return;
        ul.append(`<li class="page-item ${page===1?'disabled':''}"><a class="page-link" href="#" data-page="${page-1}">上一页</a></li>`);
        const sp = Math.max(1, page-2); const ep = Math.min(totalPages, page+2);
        for(let i=sp;i<=ep;i++) ul.append(`<li class="page-item ${i===page?'active':''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
        ul.append(`<li class="page-item ${page===totalPages?'disabled':''}"><a class="page-link" href="#" data-page="${page+1}">下一页</a></li>`);
    }

    async function terminateTask(id){
        try{ await window.API.task.terminate(id); if(window.App) window.App.showSuccess('任务终止成功'); loadTasksPage(1);}catch(e){ if(window.App) window.App.showError('任务终止失败'); }
    }

    async function openLogModal(id){
        const modalHtml = `
        <div class="modal fade" id="taskLogModal" tabindex="-1" data-task-id="${id}" data-since="0" data-auto="off">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header"><h6 class="modal-title">任务日志 #${id}</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
              <div class="modal-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" id="taskLogRefreshBtn">刷新</button>
                    <button class="btn btn-outline-secondary" id="taskLogAutoBtn">自动刷新: 关闭</button>
                    <button class="btn btn-outline-danger" id="taskLogClearBtn">清空</button>
                  </div>
                  <span class="text-muted small" id="taskLogHint"></span>
                </div>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead><tr><th>时间</th><th>类型</th><th>内容</th></tr></thead>
                    <tbody id="taskLogBody"><tr><td colspan="3" class="text-muted">加载中...</td></tr></tbody>
                  </table>
                </div>
              </div>
              <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">关闭</button></div>
            </div>
          </div>
        </div>`;
        const container = document.createElement('div');
        container.innerHTML = modalHtml;
        document.body.appendChild(container);
        const $modal = $('#taskLogModal');
        $modal.on('hidden.bs.modal', function(){
            stopLogAutoRefresh();
            $(this).remove();
            container.remove();
        });
        $modal.modal('show');
        await refreshTaskLog();
    }

    async function refreshTaskLog(){
        const $modal = $('#taskLogModal');
        if ($modal.length === 0) return;
        const id = parseInt($modal.data('task-id'), 10);
        const since = parseInt($modal.data('since') || 0, 10);
        try{
            const res = await window.API.task.logs(id, since);
            const logs = res.data || [];
            if (logs.length === 0 && since === 0) {
                $('#taskLogBody').html('<tr><td colspan="3" class="text-muted">暂无日志</td></tr>');
                return;
            }
            const rows = logs.map(l => {
                const t = typeof l.time === 'number' ? l.time : (l.time && Date.parse(l.time));
                const ts = t ? new Date(t).toLocaleString() : '';
                const tp = (l.type && l.type.name) || l.type || '';
                const msg = (l.attachment||'').replace(/[<>]/g, '');
                return `<tr><td>${ts}</td><td>${tp}</td><td><pre class="mb-0">${msg}</pre></td></tr>`;
            }).join('');
            if (since === 0) $('#taskLogBody').html(rows);
            else $('#taskLogBody').append(rows);
            const last = logs.length ? logs[logs.length - 1] : null;
            if (last && last.time){
                const t = typeof last.time === 'number' ? last.time : Date.parse(last.time);
                if (t) $modal.data('since', t);
            }
            $('#taskLogHint').text(`共 ${$('#taskLogBody tr').length} 条`);
        }catch(e){ $('#taskLogBody').html('<tr><td colspan="3" class="text-danger">加载日志失败</td></tr>'); }
    }

    let taskLogTimer = null;
    function startLogAutoRefresh(){
        stopLogAutoRefresh();
        taskLogTimer = setInterval(refreshTaskLog, 2000);
        $('#taskLogAutoBtn').text('自动刷新: 开启');
        $('#taskLogModal').data('auto','on');
    }
    function stopLogAutoRefresh(){
        if (taskLogTimer){ clearInterval(taskLogTimer); taskLogTimer = null; }
        $('#taskLogAutoBtn').text('自动刷新: 关闭');
        $('#taskLogModal').data('auto','off');
    }

    $(document).on('click', '#taskLogRefreshBtn', function(){ refreshTaskLog(); });
    $(document).on('click', '#taskLogAutoBtn', function(){
        const auto = $('#taskLogModal').data('auto');
        if (auto === 'on') stopLogAutoRefresh(); else startLogAutoRefresh();
    });

    $(document).on('click', '#taskLogClearBtn', async function(){
        const $modal = $('#taskLogModal');
        const id = parseInt($modal.data('task-id'), 10);
        try{
            await window.API.task.clearLogs(id);
            stopLogAutoRefresh();
            $modal.data('since', 0);
            $('#taskLogBody').html('<tr><td colspan="3" class="text-muted">暂无日志</td></tr>');
            $('#taskLogHint').text('共 0 条');
            if (window.App) window.App.showSuccess('日志已清空');
        }catch(e){ if (window.App) window.App.showError('清空日志失败'); }
    });

    async function loadConfigAndRoutes() {
        try {
            const cfg = await window.API.get('/task/config');
            const data = cfg.data?.data || {};
            $('#serverAddress').val(data.vehicleServerAddr || '');
            $('#serverPort').val(data.vehicleServerPort || '');
            $('#batchServerAddress').val(data.vehicleServerAddr || '');
            $('#batchServerPort').val(data.vehicleServerPort || '');
            window.__PRESSURE_THREADS = data.pressureThreadCount ? parseInt(data.pressureThreadCount,10) : (window.__PRESSURE_THREADS||1);
        } catch (e) { console.warn('加载系统配置失败:', e); }
        try {
            const res = await window.API.get('/task/routes');
            const routes = res.data?.data || [];
            const options = routes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
            $('#routeId').find('option:not(:first)').remove();
            $('#routeId').append(options);
            $('#routeIdList').find('option:not(:first)').remove();
            $('#routeIdList').append(options);
            $('#pressureRouteIdList').find('option:not(:first)').remove();
            $('#pressureRouteIdList').append(options);
        } catch (e) {
            console.error('加载线路失败:', e);
            $('#routeId').append('<option value="0" disabled>线路加载失败</option>');
            $('#routeIdList').append('<option value="0" disabled>线路加载失败</option>');
            $('#pressureRouteIdList').append('<option value="0" disabled>线路加载失败</option>');
            if (window.App) window.App.showError('线路列表加载失败');
        }
        try {
            const vres = await window.API.get('/vehicle/enabled');
            const vlist = vres.data?.data || [];
            const vopt = vlist.map(v => `<option value="${v.id}" data-number="${v.plateNumber||''}" data-sn="${v.terminalId||''}" data-sim="${v.simNumber||''}">${(v.plateNumber||'未命名')} - ${(v.terminalId||'无终端')}</option>`).join('');
            $('#vehicleSelect').find('option:not(:first)').remove();
            $('#vehicleSelect').append(vopt);
        } catch (e) {
            console.error('加载车辆失败:', e);
            $('#vehicleSelect').append('<option value="" disabled>车辆加载失败</option>');
            if (window.App) window.App.showError('车辆列表加载失败');
        }
        try {
            const gres = await window.API.gateway.list({ page: 1, size: 100 });
            const glist = gres.data?.content || [];
            const gopt = glist.map(g => `<option value="${g.id}" data-host="${g.ipAddress}" data-port="${g.port}">${g.gatewayName} (${g.ipAddress}:${g.port})</option>`).join('');
            $('#gatewaySelect').find('option:not(:first)').remove();
            $('#gatewaySelect').append(gopt);
            $('#batchGatewaySelect').find('option:not(:first)').remove();
            $('#batchGatewaySelect').append(gopt);
            $('#pressureGatewaySelect').find('option:not(:first)').remove();
            $('#pressureGatewaySelect').append(gopt);
        } catch (e) {
            console.error('加载网关失败:', e);
            const opt = '<option value="" disabled>网关加载失败</option>';
            $('#gatewaySelect').append(opt);
            $('#batchGatewaySelect').append(opt);
            $('#pressureGatewaySelect').append(opt);
            if (window.App) window.App.showError('网关列表加载失败');
        }
    }

    async function ensureDropdownsLoaded(){
        const needRoutes = ($('#routeId option').length <= 1) || ($('#routeIdList option').length <= 1) || ($('#pressureRouteIdList option').length <= 1);
        const needVehicles = ($('#vehicleSelect option').length <= 1);
        const needGateways = ($('#gatewaySelect option').length <= 1) || ($('#batchGatewaySelect option').length <= 1) || ($('#pressureGatewaySelect option').length <= 1);
        if (needRoutes || needVehicles || needGateways) {
            await loadConfigAndRoutes();
        }
    }

    async function openSystemConfigModal(){
        const html = `
        <div class="modal fade" id="systemConfigModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header"><h6 class="modal-title">系统配置</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
              <div class="modal-body">
                <form id="systemConfigForm">
                  <div class="mb-3">
                    <label class="form-label">压测任务线程数 <span class="text-danger">*</span></label>
                    <input type="number" min="1" class="form-control" id="pressureThreadCount" value="${window.__PRESSURE_THREADS||1}">
                    <div class="form-text">建议不超过CPU核心数的2倍</div>
                  </div>
                </form>
              </div>
              <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">取消</button><button class="btn btn-primary" id="saveSystemConfig">保存</button></div>
            </div>
          </div>
        </div>`;
        const container = document.createElement('div'); container.innerHTML = html; document.body.appendChild(container);
        const $m = $('#systemConfigModal');
        $m.on('hidden.bs.modal', function(){ $(this).remove(); container.remove(); });
        $m.modal('show');
        $(document).on('click', '#saveSystemConfig', async function(){
            const v = parseInt($('#pressureThreadCount').val(),10);
            if (!v || v<1) { $('#pressureThreadCount').addClass('is-invalid'); return; }
            try{
                await window.API.post('/system/config/save', { key: 'pressure.thread.count', value: String(v) }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
                window.__PRESSURE_THREADS = v;
                if (window.App) window.App.showSuccess('保存成功');
                $('#systemConfigModal').modal('hide');
            }catch(e){ if (window.App) window.App.showError(e?.message||'保存失败'); }
        });
    }

    async function openPressureBatchModal(){
        $('#pressureBatchTaskForm')[0].reset();
        const needLoadRoutes = ($('#pressureRouteIdList option').length <= 1);
        const needLoadGateways = ($('#pressureGatewaySelect option').length <= 1);
        if (needLoadRoutes || needLoadGateways) {
            await loadConfigAndRoutes();
        }
        updatePressurePreview();
        $('#pressureBatchTaskModal').modal('show');
        $('#pressureBatchTaskForm input').off('input').on('input', function(){ $(this).removeClass('is-invalid'); $(this).siblings('.invalid-feedback').text(''); updatePressurePreview(); });
        $('#pressureBatchTaskForm select').off('change').on('change', function(){ $(this).removeClass('is-invalid'); $(this).siblings('.invalid-feedback').text(''); });
    }

    function updatePressurePreview(){
        const f = Object.fromEntries(new FormData(document.getElementById('pressureBatchTaskForm')).entries());
        const count = parseInt(f.count || '2000', 10);
        const prefix = f.platePrefix || '新C';
        const start = parseInt(f.indexStart || '0', 10);
        const width = parseInt(f.indexWidth || '5', 10);
        const termStart = String(f.terminalStart || '10000000000');
        const simStart = String(f.simStart || '13900000000');
        const inc = parseInt(f.increment || '1', 10);
        const first = prefix + String(start).padStart(width, '0');
        const last = prefix + String(start + Math.max(count - 1, 0)).padStart(width, '0');
        $('#pressurePreview').html(`示例范围：<code>${first}</code> ~ <code>${last}</code>，设备号从 <code>${termStart}</code> 起，每次+${inc}；SIM从 <code>${simStart}</code> 起，每次+${inc}`);
    }

    async function runPressureBatchTasks(){
        $('#pressureBatchTaskForm .is-invalid').removeClass('is-invalid');
        const idList = $('#pressureRouteIdList').val() || [];
        const f = Object.fromEntries(new FormData(document.getElementById('pressureBatchTaskForm')).entries());
        function markInvalid(sel,msg){ const el=$(sel); el.addClass('is-invalid'); const fb=el.siblings('.invalid-feedback'); if(fb.length) fb.text(msg); }
        const count = parseInt(f.count||'0',10); if(!count||count<1){ markInvalid('input[name="count"]','请输入数量'); if(window.App) window.App.showError('请输入数量'); return; }
        if(!(f.platePrefix||'').trim()){ markInvalid('input[name="platePrefix"]','请输入车牌前缀'); if(window.App) window.App.showError('请输入车牌前缀'); return; }
        const iw = parseInt(f.indexWidth||'0',10); if(!iw||iw<1||iw>8){ markInvalid('input[name="indexWidth"]','序号位数需在1-8之间'); if(window.App) window.App.showError('序号位数需在1-8之间'); return; }
        if(!(f.terminalStart||'').trim()){ markInvalid('input[name="terminalStart"]','请输入设备号起始'); if(window.App) window.App.showError('请输入设备号起始'); return; }
        if(!(f.simStart||'').trim()){ markInvalid('input[name="simStart"]','请输入SIM起始'); if(window.App) window.App.showError('请输入SIM起始'); return; }
        const addr = ($('#pressureServerAddress').val()||'').trim();
        const port = ($('#pressureServerPort').val()||'').trim();
        const gw = ($('#pressureGatewaySelect').val()||'').trim();
        if(!gw && (!addr || !port)){
            markInvalid('#pressureGatewaySelect','请选择网关或填写服务器地址与端口');
            if(!addr) markInvalid('#pressureServerAddress','请输入服务器地址');
            if(!port) markInvalid('#pressureServerPort','请输入端口');
            if(window.App) window.App.showError('请选择网关，或填写服务器地址与端口');
            return;
        }
        if(!addr){ markInvalid('#pressureServerAddress','请输入服务器地址'); if(window.App) window.App.showError('请输入服务器地址'); return; }
        if(!port){ markInvalid('#pressureServerPort','请输入端口'); if(window.App) window.App.showError('请输入端口'); return; }

        const payload = {
            'routeIdList[]': idList,
            count: count,
            platePrefix: f.platePrefix || '新C',
            indexStart: parseInt(f.indexStart || '0', 10),
            indexWidth: iw,
            terminalStart: f.terminalStart,
            simStart: f.simStart,
            increment: parseInt(f.increment || '1', 10),
            serverAddress: addr,
            serverPort: port,
            alertFlags: (f.alertFlags || '').trim(),
            locationIntervalSec: f.locationIntervalSec ? parseInt(f.locationIntervalSec,10) : undefined
        };
        try{
            await window.API.post('/batch/runByRule', payload, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
            if(window.App) window.App.showSuccess('批量创建成功');
            $('#pressureBatchTaskModal').modal('hide');
            loadTasksPage(1);
        }catch(e){ const msg = (e && e.data && e.data.error && e.data.error.reason) || e?.message || '批量创建失败'; if(window.App) window.App.showError(msg); }
    }

    function onVehicleSelected(){
        const sel = $('#vehicleSelect option:selected');
        $('#vehicleNumber').val(sel.data('number')||'');
        $('#deviceSn').val(sel.data('sn')||'');
        $('#simNumber').val(sel.data('sim')||'');
    }

    function onGatewaySelected(){
        const sel = $('#gatewaySelect option:selected');
        const host = sel.data('host')||''; const port = sel.data('port')||'';
        $('#serverAddress').val(host); $('#serverPort').val(port);
    }

    function onBatchGatewaySelected(){
        const sel = $('#batchGatewaySelect option:selected');
        const host = sel.data('host')||''; const port = sel.data('port')||'';
        $('#batchServerAddress').val(host); $('#batchServerPort').val(port);
    }

    async function runSingleTask() {
        $('#singleTaskForm .is-invalid').removeClass('is-invalid');
        function err(id,msg){ const el=$('#'+id); el.addClass('is-invalid'); el.siblings('.invalid-feedback').text(msg); }
        const rid = $('#routeId').val(); if (!rid || rid === '0') { err('routeId','请选择行驶线路'); return; }
        const vnum = $('#vehicleNumber').val().trim(); if (!vnum) { err('vehicleNumber','请输入车牌号'); return; }
        const sn = $('#deviceSn').val().trim(); if (!sn) { err('deviceSn','请输入终端ID'); return; }
        const sim = $('#simNumber').val().trim(); if (!sim) { err('simNumber','请输入SIM卡号'); return; }
        const addr = $('#serverAddress').val().trim(); if (!addr) { err('serverAddress','请输入服务器地址'); return; }
        const port = $('#serverPort').val().trim(); if (!port) { err('serverPort','请输入端口'); return; }
        const payload = {
            routeId: $('#routeId').val(),
            vehicleNumber: $('#vehicleNumber').val(),
            deviceSn: $('#deviceSn').val(),
            simNumber: $('#simNumber').val(),
            mileages: $('#mileages').val(),
            serverAddress: $('#serverAddress').val(),
            serverPort: $('#serverPort').val()
        };
        try {
            await window.API.post('/task/run', payload, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
            if (window.App) window.App.showSuccess('任务启动成功');
            $('#singleTaskModal').modal('hide');
            loadTasksPage(1);
        } catch (e) {
            const msg = (e && e.data && e.data.error && e.data.error.reason) || e?.message || '任务启动失败';
            if (window.App) window.App.showError(msg);
        }
    }

    async function runBatchTasks() {
        $('#batchTaskForm .is-invalid').removeClass('is-invalid');
        function errb(id,msg){ const el=$('#'+id); el.addClass('is-invalid'); el.siblings('.invalid-feedback').text(msg); }
        const cnt = parseInt($('#vehicleCount').val(),10); if (!cnt || cnt<1) { errb('vehicleCount','请输入车辆数量'); return; }
        if (!$('#vehicleNumberPattern').val().trim()) { errb('vehicleNumberPattern','请输入车牌号模式'); return; }
        if (!$('#deviceSnPattern').val().trim()) { errb('deviceSnPattern','请输入终端ID模式'); return; }
        if (!$('#simNumberPattern').val().trim()) { errb('simNumberPattern','请输入SIM卡号模式'); return; }
        const baddr = $('#batchServerAddress').val().trim(); if (!baddr) { errb('batchServerAddress','请输入服务器地址'); return; }
        const bport = $('#batchServerPort').val().trim(); if (!bport) { errb('batchServerPort','请输入端口'); return; }
        const idList = $('#routeIdList').val() || [];
        const payload = {
            'routeIdList[]': idList,
            vehicleCount: $('#vehicleCount').val(),
            vehicleNumberPattern: $('#vehicleNumberPattern').val(),
            deviceSnPattern: $('#deviceSnPattern').val(),
            simNumberPattern: $('#simNumberPattern').val(),
            serverAddress: $('#batchServerAddress').val(),
            serverPort: $('#batchServerPort').val()
        };
        try {
            await window.API.post('/batch/run', payload, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
            if (window.App) window.App.showSuccess('批量创建成功');
            $('#batchTaskModal').modal('hide');
            loadTasksPage(1);
        } catch (e) {
            const msg = (e && e.data && e.data.error && e.data.error.reason) || e?.message || '批量创建失败';
            if (window.App) window.App.showError(msg);
        }
    }

    function destroy() { initialized = false; }

    return { render, initialize, destroy };
})();
    function onPressureGatewaySelected(){
        const sel = $('#pressureGatewaySelect option:selected');
        const host = sel.data('host')||''; const port = sel.data('port')||'';
        $('#pressureServerAddress').val(host); $('#pressureServerPort').val(port);
    }
    function getSelectedTaskIds(){
        return $('#tasksListBody .task-select:checked').map(function(){ return $(this).val(); }).get();
    }

    function updateBatchTerminateButton(){
        const ids = getSelectedTaskIds();
        const btn = $('#batchTerminateTasks');
        if (ids.length > 0) btn.prop('disabled', false); else btn.prop('disabled', true);
    }

    async function batchTerminate(){
        const ids = getSelectedTaskIds();
        if (!ids.length) return;
        try{
            await window.API.task.terminateBatch(ids);
            if(window.App) window.App.showSuccess('批量终止成功');
            loadTasksPage(1);
        }catch(e){ if(window.App) window.App.showError('批量终止失败'); }
    }
