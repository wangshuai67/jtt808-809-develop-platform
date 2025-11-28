window.Alerts = (function() {
    'use strict';

    let initialized = false;
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 0;

    const template = `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0"><i class="fa fa-bell me-2"></i>模拟警报管理</h5>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary" id="refreshAlerts">刷新</button>
                </div>
            </div>
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>当前车辆警报列表</div>
                    <form id="alertsQueryForm" class="row g-2 align-items-center">
                        <div class="col-auto"><input type="text" class="form-control form-control-sm" id="qPlate" placeholder="车牌"></div>
                        <div class="col-auto"><input type="number" min="0" max="31" class="form-control form-control-sm" id="qIndex" placeholder="报警编号"></div>
                        <div class="col-auto"><input type="datetime-local" class="form-control form-control-sm" id="qFrom"></div>
                        <div class="col-auto"><input type="datetime-local" class="form-control form-control-sm" id="qTo"></div>
                        <div class="col-auto"><select class="form-select form-select-sm" id="qSize"><option value="10" selected>10</option><option value="20">20</option><option value="50">50</option><option value="100">100</option></select></div>
                        <div class="col-auto"><button class="btn btn-sm btn-primary" type="button" id="searchAlerts">查询</button></div>
                    </form>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>报警编号</th>
                                    <th>报警名称</th>
                                    <th>报警报文</th>
                                    <th>车牌号</th>
                                    <th>报警时间</th>
                                    <th>创建时间</th>
                                    <th>经纬度</th>
                                </tr>
                            </thead>
                            <tbody id="alertsListBody"><tr><td colspan="8" class="text-muted text-center py-3">加载中...</td></tr></tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-between align-items-center">
                    <div class="text-muted">显示第 <span id="alertsPageStart">0</span> - <span id="alertsPageEnd">0</span> 条，共 <span id="alertsTotalItems">0</span> 条</div>
                    <nav><ul class="pagination pagination-sm mb-0" id="alertsPagination"></ul></nav>
                </div>
            </div>
        </div>`;

    function render(){ return template; }

    function initialize(){
        if (!initialized) { bindEvents(); initialized = true; }
        refresh(1);
    }

    function bindEvents(){
        $(document).on('click', '#refreshAlerts', function(){ refresh(1); });
        $(document).on('click', '#searchAlerts', function(){ refresh(1); });
        $(document).on('click', '#alertsPagination .page-link', function(e){ e.preventDefault(); const p=$(this).data('page'); if(p) refresh(Number(p)); });
        $(document).on('click', '.show-raw', function(e){ e.preventDefault(); e.stopPropagation(); const raw=$(this).data('raw')||''; showRawModal(raw); });
    }

    function parseDateInput(val){ if(!val) return null; const d=new Date(val); return isNaN(d.getTime())?null:d.getTime(); }
    function toLocal(dt){ return dt ? new Date(dt).toLocaleString('zh-CN') : '-'; }
    function buildPager(page){
        totalPages = Number(page.pageCount||0);
        currentPage = Number(page.pageIndex||1);
        let html = '';
        if (totalPages > 1) {
            html += `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></a>
                </li>
            `;
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            if (startPage > 1) {
                html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
                if (startPage > 2) {
                    html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }
            for (let i = startPage; i <= endPage; i++) {
                html += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            }
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
                html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
            }
            html += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></a>
                </li>
            `;
        }
        return html;
    }

    async function refresh(pageIndex){
        try {
            const plate = $('#qPlate').val()||'';
            const idx = $('#qIndex').val();
            const from = parseDateInput($('#qFrom').val());
            const to = parseDateInput($('#qTo').val());
            pageSize = Number($('#qSize').val()||10);
            currentPage = Number(pageIndex||1);
            const params = { pageIndex: currentPage, pageSize };
            if (plate) params.plateNumber = plate;
            if (idx !== '' && idx != null) params.alarmIndex = Number(idx);
            if (from) params.from = from;
            if (to) params.to = to;
            const res = await window.API.get('/alert/list', params);
            const page = res.data?.data || { list: [], recordCount: 0, pageIndex: currentPage, pageSize, pageCount: 0 };
            const list = page.list || [];
            const rows = list.map(x => {
                const rt = x.reportTime ? new Date(x.reportTime).toLocaleString('zh-CN') : '-';
                const ct = x.createTime ? new Date(x.createTime).toLocaleString('zh-CN') : '-';
                const ll = (x.longitude!=null && x.latitude!=null) ? `${x.longitude}, ${x.latitude}` : '-';
                return `<tr>
                    <td>${x.id ?? ''}</td>
                    <td>${x.alarmIndex!=null ? String(x.alarmIndex).padStart(2,'0') : ''}</td>
                    <td>${x.alarmName ?? ''}</td>
                    <td><a href="javascript:void(0)" class="show-raw" data-raw="${x.rawMessage ? String(x.rawMessage).replace(/"/g,'&quot;').replace(/</g,'&lt;') : ''}"><code>点击查看</code></a></td>
                    <td>${x.plateNumber ?? ''}</td>
                    <td>${rt}</td>
                    <td>${ct}</td>
                    <td>${ll}</td>
                </tr>`;
            }).join('');
            $('#alertsListBody').html(rows || '<tr><td colspan="8" class="text-muted text-center py-3">暂无数据</td></tr>');
            const total = Number(page.recordCount||0);
            const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
            const end = Math.min(currentPage * pageSize, total);
            $('#alertsPageStart').text(start);
            $('#alertsPageEnd').text(end);
            $('#alertsTotalItems').text(page.recordCount||0);
            $('#alertsPagination').html(buildPager(page));
        } catch(e) {
            $('#alertsListBody').html('<tr><td colspan="8" class="text-danger text-center py-3">加载失败</td></tr>');
        }
    }

    function showRawModal(raw){
        const modalHtml = `
        <div class="modal fade" id="alertRawModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header"><h6 class="modal-title">报警报文详情</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
              <div class="modal-body"><pre class="mb-0" style="white-space:pre-wrap;word-break:break-all;">${raw || ''}</pre></div>
              <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">关闭</button></div>
            </div>
          </div>
        </div>`;
        const container = document.createElement('div');
        container.innerHTML = modalHtml;
        document.body.appendChild(container);
        const $modal = $('#alertRawModal');
        $modal.on('hidden.bs.modal', function(){ $(this).remove(); container.remove(); });
        $modal.modal('show');
    }

    function destroy(){ initialized = false; }

    return { render, initialize, destroy };
})();