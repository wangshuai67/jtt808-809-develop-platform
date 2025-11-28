window.JT809Logs = (function(){
    function render(){
        return (
            '<div class="p-3">'
            + '<div class="d-flex justify-content-between align-items-center mb-3">'
            + '<h5 class="mb-0">809报文日志管理</h5>'
            + '<div class="d-flex align-items-center">'
            + '<label class="me-2">任务:</label>'
            + '<select class="form-select form-select-sm" id="sel809Task" style="width:240px"></select>'
            + '<button class="btn btn-sm btn-outline-secondary ms-2" id="btnReload">刷新</button>'
            + '<button class="btn btn-sm btn-outline-danger ms-2" id="btnClear">清空当前任务日志</button>'
            + '</div>'
            + '</div>'
            + '<ul class="nav nav-tabs" id="logTabs" role="tablist">'
            + '  <li class="nav-item" role="presentation">'
            + '    <button class="nav-link active" id="tabUp" data-bs-toggle="tab" data-type="MESSAGE_OUT" type="button" role="tab">上行报文</button>'
            + '  </li>'
            + '  <li class="nav-item" role="presentation">'
            + '    <button class="nav-link" id="tabRsp" data-bs-toggle="tab" data-type="MESSAGE_IN" type="button" role="tab">应答报文</button>'
            + '  </li>'
            + '</ul>'
            + '<div class="card mt-3"><div class="card-body">'
            + '<div class="table-responsive">'
            + '<table class="table table-sm" id="tblLogs">'
            + '<thead><tr><th style="width:160px">时间</th><th style="width:120px">类型</th><th>十六进制</th></tr></thead>'
            + '<tbody></tbody>'
            + '</table>'
            + '</div>'
            + '</div></div>'
            + '</div>'
        );
    }

    function initialize(){
        let currentTaskId = null;
        let since = 0;
        let currentType = 'MESSAGE_OUT';
        let timer = null;

        function fmt(ts){
            return window.App?.utils?.formatDate(ts) || '';
        }

        function loadTasks(){
            return $.get('/809/task/list').then(function(res){
                const metas = res && res.data ? res.data : {};
                const $sel = $('#sel809Task');
                $sel.empty();
                Object.keys(metas).forEach(function(id){
                    const m = metas[id];
                    const gw = m.gatewayName || m.gatewayId;
                    const txt = `${id} / 网关${gw} / 车辆${m.plate || ''}`;
                    $('<option>').val(id).text(txt).appendTo($sel);
                });
                if (!currentTaskId) {
                    currentTaskId = Object.keys(metas)[0] || null;
                }
                if (currentTaskId) {
                    $sel.val(String(currentTaskId));
                }
            });
        }

        function renderLogs(items){
            const $tbody = $('#tblLogs tbody');
            const rows = [];
            (items||[]).forEach(function(it){
                if (it.type !== currentType) return;
                rows.push('<tr>'
                    + `<td>${fmt(it.time)}</td>`
                    + `<td>${it.type}</td>`
                    + `<td><code>${it.message}</code></td>`
                    + '</tr>');
                since = Math.max(since, it.time || 0);
            });
            if (rows.length) {
                $tbody.prepend(rows.join(''));
            }
        }

        function loadLogs(){
            if (!currentTaskId) return;
            $.get('/809/task/logs', { id: currentTaskId, since: since }).then(function(res){
                const list = res && res.data ? res.data : [];
                renderLogs(list);
            });
        }

        function startPolling(){
            if (timer) clearInterval(timer);
            timer = setInterval(loadLogs, 1500);
        }

        $('#sel809Task').on('change', function(){
            currentTaskId = $(this).val();
            since = 0;
            $('#tblLogs tbody').empty();
            loadLogs();
        });

        $('#btnReload').on('click', function(){ since = 0; $('#tblLogs tbody').empty(); loadLogs(); });
        $('#btnClear').on('click', function(){
            if (!currentTaskId) return;
            $.post('/809/task/logs/clear', { id: currentTaskId }).done(function(){ $('#tblLogs tbody').empty(); since = 0; });
        });

        $('#logTabs .nav-link').on('click', function(){
            currentType = $(this).data('type');
            $('#tblLogs tbody').empty();
            since = 0;
            loadLogs();
        });

        loadTasks().then(function(){ loadLogs(); startPolling(); });
    }

    return { render, initialize };
})();
