window.JT809Gateways = (function(){
    function render(){
        return (
            '<div class="p-3">'
            + '<div class="d-flex justify-content-between align-items-center mb-3">'
            + '<h5 class="mb-0">809上级平台网关配置</h5>'
            + '<div>'
            + '<button class="btn btn-primary" id="btnAdd">添加网关</button>'
            + '</div>'
            + '</div>'
            + '<div class="card"><div class="card-body">'
            + '<div class="row mb-2">'
            + '<div class="col-md-4"><input class="form-control" id="searchKey" placeholder="名称搜索"></div>'
            + '<div class="col-md-2"><button class="btn btn-outline-secondary" id="btnSearch">搜索</button></div>'
            + '</div>'
            + '<table class="table table-striped" id="gwTable">'
            + '<thead><tr>'
            + '<th>名称</th><th>上级平台</th><th>版本</th><th>状态</th><th>操作</th>'
            + '</tr></thead>'
            + '<tbody></tbody>'
            + '</table>'
            + '</div></div>'
            + '<div class="modal fade" id="gwModal" tabindex="-1"><div class="modal-dialog modal-xl"><div class="modal-content">'
            + '<div class="modal-header"><h5 class="modal-title">网关</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>'
            + '<div class="modal-body">'
            + '<div class="row g-3">'
            + '<div class="col-md-6"><label class="form-label">名称</label><input class="form-control" id="fName"></div>'
            + '<div class="col-md-6"><label class="form-label">平台接入码 <span class="text-danger">*</span></label><input class="form-control" id="fCenterId" inputmode="numeric" pattern="\\d*" placeholder="93032772"></div>'
            + '<div class="col-md-4"><label class="form-label">平台IP <span class="text-danger">*</span></label><input class="form-control" id="fIp" value="127.0.0.1" required></div>'
            + '<div class="col-md-4"><label class="form-label">平台端口 <span class="text-danger">*</span></label><input class="form-control" id="fPort" value="8000" inputmode="numeric" pattern="\\d*" required></div>'
            + '<div class="col-md-4"><label class="form-label">用户账号 <span class="text-danger">*</span></label><input class="form-control" id="fUserId" value="1001" required></div>'
            + '<div class="col-md-4"><label class="form-label">用户密码 <span class="text-danger">*</span></label><input class="form-control" id="fPwd" value="hihihihi" required></div>'
            + '<div class="col-md-4"><label class="form-label">密钥M1 <span class="text-danger">*</span></label><input class="form-control" id="fM1" value="0" inputmode="numeric" pattern="\\d*" required></div>'
            + '<div class="col-md-4"><label class="form-label">密钥A1 <span class="text-danger">*</span></label><input class="form-control" id="fIa1" value="0" inputmode="numeric" pattern="\\d*" required></div>'
            + '<div class="col-md-4"><label class="form-label">密钥C1 <span class="text-danger">*</span></label><input class="form-control" id="fIc1" value="0" inputmode="numeric" pattern="\\d*" required></div>'
            + '<div class="col-md-4"><label class="form-label">版本</label><select class="form-select" id="fVersion"><option value="2011">2011</option><option value="2013">2013</option><option value="2019">2019</option></select></div>'
            + '<div class="col-md-4"><label class="form-label">加密开关</label><select class="form-select" id="fEncryptEnable"><option value="0">关闭</option><option value="1">开启</option></select></div>'
            + '<div class="col-12"><label class="form-label">描述</label><textarea class="form-control" id="fDesc"></textarea></div>'
            + '<div class="col-12"><div class="form-check"><input class="form-check-input" type="checkbox" id="fEnabled"><label class="form-check-label" for="fEnabled">启用</label></div></div>'
            + '</div>'
            + '</div>'
            + '<div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button><button type="button" class="btn btn-primary" id="btnSave">保存</button></div>'
            + '</div></div></div>'
            + '</div>'
        );
    }
    async function loadList(){
        const key = $('#searchKey').val() || '';
        const res = await window.API.gateway809.list({ keyword: key, page: 1, size: 50 });
        const list = res.data.content || [];
        const rows = list.map(it => (
            '<tr>'
            + `<td>${it.name || '-'}</td>`
            + `<td>${it.ip}:${it.port}</td>`
            + `<td>${it.version || '-'}</td>`
            + `<td>${it.status === 'active' ? '<span class="text-success">启用</span>' : '<span class="text-muted">禁用</span>'}</td>`
            + `<td>`
            + `<button class="btn btn-sm btn-outline-secondary me-1 btnEdit" data-id="${it.id}">编辑</button>`
            + `<button class="btn btn-sm btn-outline-danger me-1 btnDel" data-id="${it.id}">删除</button>`
            + `<button class="btn btn-sm ${it.status==='active'?'btn-warning':'btn-success'} btnToggle" data-id="${it.id}" data-status="${it.status==='active'?0:1}">${it.status==='active'?'禁用':'启用'}</button>`
            + `</td>`
            + '</tr>'
        )).join('');
        $('#gwTable tbody').html(rows);
        bindRowEvents();
    }
    function bindRowEvents(){
        $('.btnEdit').off('click').on('click', async function(){
            const id = $(this).data('id');
            const res = await window.API.gateway809.get(id);
            const d = res.data || {};
            $('#gwModal').data('id', id);
            $('#fName').val(d.name||'');
            $('#fCenterId').val(d.centerId||'');
            $('#fIp').val(d.ip||d.primaryAddr||'');
            $('#fPort').val(d.port||d.primaryPort||'');
            $('#fUserId').val(d.userId||'');
            $('#fPwd').val(d.password||'');
            $('#fVersion').val(d.version||'2011');
            $('#fEncryptEnable').val(d.encryptEnable?1:0);
            $('#fM1').val(d.m1||0);
            $('#fIa1').val(d.ia1||0);
            $('#fIc1').val(d.ic1||0);
            $('#fDesc').val(d.description||'');
            $('#fEnabled').prop('checked', d.status==='active');
            new bootstrap.Modal(document.getElementById('gwModal')).show();
        });
        $('.btnDel').off('click').on('click', async function(){
            const id = $(this).data('id');
            await window.API.gateway809.delete(id);
            await loadList();
        });
        $('.btnToggle').off('click').on('click', async function(){
            const id = $(this).data('id');
            const status = $(this).data('status');
            await window.API.gateway809.updateStatus(id, status);
            await loadList();
        });
    }
    function initialize(){
        $('#btnAdd').on('click', function(){
            $('#gwModal').removeData('id');
            $('#fName,#fCenterId,#fIp,#fPort,#fUserId,#fPwd,#fDesc').val('');
            $('#fVersion').val('2011');
            $('#fEncryptEnable').val('0');
            $('#fM1').val('0');
            $('#fIa1').val('0');
            $('#fIc1').val('0');
            $('#fEnabled').prop('checked', true);
            new bootstrap.Modal(document.getElementById('gwModal')).show();
        });
        $('#btnSearch').on('click', loadList);
        $('#btnSave').on('click', async function(){
            const id = $('#gwModal').data('id');
            const data = {
                name: $('#fName').val(),
                centerId: $('#fCenterId').val(),
                ip: $('#fIp').val(),
                port: $('#fPort').val(),
                userid: $('#fUserId').val(),
                pwd: $('#fPwd').val(),
                version: $('#fVersion').val(),
                encryptEnable: $('#fEncryptEnable').val(),
                m1: $('#fM1').val(),
                ia1: $('#fIa1').val(),
                ic1: $('#fIc1').val(),
                description: $('#fDesc').val(),
                status: $('#fEnabled').is(':checked')
            };
            if (!data.ip || !data.port || !data.userid || !data.pwd || !data.m1 || !data.ia1 || !data.ic1) {
                alert('请填写必填项：平台IP、端口、账号、密码、M1、A1、C1');
                return;
            }
            if (id) await window.API.gateway809.update(id, data); else await window.API.gateway809.create(data);
            bootstrap.Modal.getInstance(document.getElementById('gwModal')).hide();
            await loadList();
        });
        loadList();
    }
    return { render, initialize };
})();