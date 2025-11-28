window.JT809Tasks = (function(){
    function render(){
        return (
            '<div class="p-3">'
            + '<div class="d-flex justify-content-between align-items-center mb-3">'
            + '<h5 class="mb-0">809任务管理</h5>'
            + '</div>'
            + '<div class="mb-2">'
            + '<button class="btn btn-primary" id="btnOpenCreate">创建任务</button>'
            + '<span id="startResult" class="ms-2 text-muted"></span>'
            + '</div>'
            + '<div class="modal fade" id="taskModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">'
            + '<div class="modal-header"><h5 class="modal-title">创建809任务</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>'
            + '<div class="modal-body">'
            + '<div class="row g-3">'
            + '<div class="col-md-4"><label class="form-label">车辆</label><select class="form-select" id="selVehicle" multiple size="8"></select></div>'
            + '<div class="col-md-4"><label class="form-label">线路</label><select class="form-select" id="selRoute"></select></div>'
            + '<div class="col-md-4"><label class="form-label">809网关</label><select class="form-select" id="selGateway"></select></div>'
            + '<div class="col-md-4"><label class="form-label">上报间隔(ms)</label><input class="form-control" id="intervalMs" value="1000"></div>'
            + '</div>'
            + '</div>'
            + '<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">取消</button><button class="btn btn-primary" id="btnStart">启动任务</button></div>'
            + '</div></div></div>'
            + '<div class="card mt-3"><div class="card-body">'
            + '<h6>运行中任务</h6>'
            + '<table class="table table-sm" id="taskTable"><thead><tr><th>ID</th><th>车辆</th><th>网关</th><th>线路</th><th>间隔(ms)</th><th>操作</th></tr></thead><tbody></tbody></table>'
            + '</div></div>'
            + '</div>'
        );
    }
    async function loadVehicles(){
        try {
            const res = await API.get('/vehicle/enabled', {});
            const list = res.data?.data || [];
            const opts = list.map(v => `<option value="${v.plateNumber}">${v.plateNumber}</option>`).join('');
            $('#selVehicle').html(opts);
        } catch(e) {}
    }
    async function loadRoutes(){
        const res = await API.route.list({ page:1, size:100 });
        const list = res.data.records || [];
        const opts = list.map(r => `<option value="${r.id}">${r.name || ('路线'+r.id)}</option>`).join('');
        $('#selRoute').html(opts);
    }
    async function loadGateways(){
        const res = await API.gateway809.list({ page:1, size:100 });
        const list = res.data.content || [];
        const opts = list.map(g => `<option value="${g.id}">${g.name} (${g.ip}:${g.port})</option>`).join('');
        $('#selGateway').html(opts);
    }
    async function loadTasks(){
        const res = await API.get('/809/task/list', {});
        const map = res.data?.data || {};
        const rows = Object.keys(map).map(k => {
            const t = map[k];
            const gw = t.gatewayName || t.gatewayId;
            return `<tr><td>${t.id}</td><td>${t.plate || ''}</td><td>${gw}</td><td>${t.routeId}</td><td>${t.intervalMs}</td><td><button class="btn btn-sm btn-outline-secondary btnLog" data-id="${t.id}">日志</button> <button class="btn btn-sm btn-outline-danger btnStop" data-id="${t.id}">终止</button></td></tr>`;
        }).join('');
        $('#taskTable tbody').html(rows);
        $('.btnStop').off('click').on('click', async function(){
            const id = $(this).data('id');
            await API.post('/809/task/terminate', { id }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
            await loadTasks();
        });
        $('.btnLog').off('click').on('click', function(){ const id=$(this).data('id'); openLogModal(id); });
    }
    function initialize(){
        loadTasks();
        $('#btnOpenCreate').on('click', async function(){
            await loadVehicles();
            await loadRoutes();
            await loadGateways();
            new bootstrap.Modal(document.getElementById('taskModal')).show();
        });
        $('#btnStart').on('click', async function(){
            const plates = $('#selVehicle').val() || [];
            const routeId = $('#selRoute').val();
            const gatewayId = $('#selGateway').val();
            const intervalMs = parseInt($('#intervalMs').val()||'1000', 10);
            try {
                const payload = { routeId, gatewayId, intervalMs };
                if (plates.length === 1) payload.plate = plates[0]; else payload.plates = plates.join(',');
                const res = await API.post('/809/task/run', payload, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
                const id = res.data?.data?.taskId;
                const ids = res.data?.data?.taskIds || [];
                if (id) $('#startResult').text('已启动，任务ID：'+id);
                else $('#startResult').text('已启动 '+(ids.length||0)+' 个任务');
                await loadTasks();
                bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
            } catch(e) {
                $('#startResult').text('启动失败：'+(e.message||'错误'));
            }
        });
    }
    async function openLogModal(id){
        const modalHtml = `
        <div class="modal fade" id="jt809TaskLogModal" tabindex="-1" data-task-id="${id}" data-since="0" data-auto="off">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header"><h6 class="modal-title">809任务日志 #${id}</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
              <div class="modal-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" id="jt809LogRefreshBtn">刷新</button>
                    <button class="btn btn-outline-secondary" id="jt809LogAutoBtn">自动刷新: 关闭</button>
                    <button class="btn btn-outline-danger" id="jt809LogClearBtn">清空</button>
                  </div>
                  <span class="text-muted small" id="jt809LogHint"></span>
                </div>
                <div class="table-responsive">
                  <table class="table table-sm"><thead><tr><th>时间</th><th>类型</th><th>内容</th></tr></thead><tbody id="jt809LogBody"><tr><td colspan="3" class="text-muted">加载中...</td></tr></tbody></table>
                </div>
              </div>
              <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">关闭</button></div>
            </div>
          </div>
        </div>`;
        const container = document.createElement('div'); container.innerHTML = modalHtml; document.body.appendChild(container);
        const $m = $('#jt809TaskLogModal');
        $m.on('hidden.bs.modal', function(){ stopAutoRefresh(); $(this).remove(); container.remove(); });
        $m.modal('show');
        await refreshLogs();
    }

    async function refreshLogs(){
        const $m = $('#jt809TaskLogModal'); if ($m.length===0) return;
        const id = parseInt($m.data('task-id'),10); const since = parseInt($m.data('since')||0,10);
        try{
            const res = await API.get('/809/task/logs', { id, since });
            const logs = res.data?.data || [];
            if (logs.length===0 && since===0){ $('#jt809LogBody').html('<tr><td colspan="3" class="text-muted">暂无日志</td></tr>'); return; }
            const rows = logs.map(l => {
                const t = typeof l.time === 'number' ? l.time : (l.time && Date.parse(l.time));
                const ts = t ? new Date(t).toLocaleString() : '';
                const tp = l.type || '';
                const msg = String(l.message||'');
                return `<tr><td>${ts}</td><td>${tp}</td><td><pre class="mb-0">${msg.replace(/[<>]/g,'')}</pre></td></tr>`;
            }).join('');
            if (since===0) $('#jt809LogBody').html(rows); else $('#jt809LogBody').append(rows);
            const last = logs.length ? logs[logs.length-1] : null;
            if (last && last.time){ const t = typeof last.time==='number' ? last.time : Date.parse(last.time); if (t) $m.data('since', t); }
            $('#jt809LogHint').text(`共 ${$('#jt809LogBody tr').length} 条`);
        }catch(e){ $('#jt809LogBody').html('<tr><td colspan="3" class="text-danger">加载失败</td></tr>'); }
    }

    let logTimer=null; function startAutoRefresh(){ stopAutoRefresh(); logTimer=setInterval(refreshLogs,2000); $('#jt809LogAutoBtn').text('自动刷新: 开启'); $('#jt809TaskLogModal').data('auto','on'); }
    function stopAutoRefresh(){ if(logTimer){ clearInterval(logTimer); logTimer=null; } $('#jt809LogAutoBtn').text('自动刷新: 关闭'); $('#jt809TaskLogModal').data('auto','off'); }
    $(document).on('click','#jt809LogRefreshBtn', function(){ refreshLogs(); });
    $(document).on('click','#jt809LogAutoBtn', function(){ const auto=$('#jt809TaskLogModal').data('auto'); if(auto==='on') stopAutoRefresh(); else startAutoRefresh(); });
    $(document).on('click','#jt809LogClearBtn', async function(){ const id=parseInt($('#jt809TaskLogModal').data('task-id'),10); try{ await API.post('/809/task/logs/clear', { id }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }); stopAutoRefresh(); $('#jt809TaskLogModal').data('since',0); $('#jt809LogBody').html('<tr><td colspan="3" class="text-muted">暂无日志</td></tr>'); $('#jt809LogHint').text('共 0 条'); if(window.App) window.App.showSuccess('日志已清空'); }catch(e){ if(window.App) window.App.showError('清空失败'); } });

    return { render, initialize };
})();
