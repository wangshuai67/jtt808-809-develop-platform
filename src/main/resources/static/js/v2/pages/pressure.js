window.Pressure = {
  state: { currentId: null, timer: null, labels: [], qps: [], active: [], lastMsg: 0, lastTime: 0, currentPage: 1, pageSize: 10, totalPages: 0 },
  render(){
    return `
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">压测报表</h4>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" id="pressureRefreshList">刷新列表</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0"><thead class="table-light">
                <tr><th>ID</th><th>名称</th><th>开始时间</th><th>任务数</th><th>服务器</th><th>线路模式</th><th>操作</th></tr>
              </thead><tbody id="pressureTBody"><tr><td colspan="7" class="text-muted text-center py-3">加载中...</td></tr></tbody></table>
            </div>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="text-muted">显示第 <span id="pressurePageStart">0</span> - <span id="pressurePageEnd">0</span> 条，共 <span id="pressureTotalItems">0</span> 条</div>
            <nav><ul class="pagination pagination-sm mb-0" id="pressurePagination"></ul></nav>
          </div>
        </div>
      </div>`;
  },
  async initialize(){
    document.addEventListener('click', (e)=>{ const t=e.target.closest('[data-report]'); if(t){ const id=parseInt(t.dataset.report,10); this.openDetailModal(id); } });
    document.addEventListener('click', (e)=>{ if(e.target && e.target.id==='pressureRefreshList'){ this.loadList(1); } });
    document.addEventListener('click', (e)=>{ if(e.target && e.target.closest('#pressurePagination .page-link')){ e.preventDefault(); const a=e.target.closest('.page-link'); const p=parseInt(a.dataset.page,10); if(p) this.loadList(p); } });
    await this.loadList(1);
  },
  async loadList(pageIndex){
    try{
      this.state.currentPage = pageIndex || 1;
      const res = await window.API.get('/pressure/report/list', { pageIndex: this.state.currentPage, pageSize: this.state.pageSize });
      const data = res.data?.data || {};
      const list = data.list || [];
      const totalElements = data.recordCount || 0;
      this.state.totalPages = data.pageCount || 0;
      const tbody = document.getElementById('pressureTBody');
      if(!list.length){ tbody.innerHTML='<tr><td colspan="7" class="text-muted text-center py-3">暂无报表</td></tr>'; } else {
        tbody.innerHTML = list.map(r=>`
          <tr>
            <td>${r.id}</td>
            <td>${r.name||'-'}</td>
            <td>${this.format(r.startTime)}</td>
            <td>${r.taskCount||r.createdCount||0}</td>
            <td>${r.serverAddress||'-'}:${r.serverPort||''}</td>
            <td>${r.routeMode||'-'}</td>
            <td><button class="btn btn-sm btn-outline-primary" data-report="${r.id}">查看</button></td>
          </tr>
        `).join('');
      }
      const start = totalElements===0 ? 0 : (this.state.currentPage-1)*this.state.pageSize + 1;
      const end = Math.min(this.state.currentPage*this.state.pageSize, totalElements);
      document.getElementById('pressurePageStart').textContent = String(start);
      document.getElementById('pressurePageEnd').textContent = String(end);
      document.getElementById('pressureTotalItems').textContent = String(totalElements);
      this.renderPagination();
    }catch(e){ const tbody=document.getElementById('pressureTBody'); if(tbody) tbody.innerHTML='<tr><td colspan="7" class="text-danger text-center py-3">加载失败</td></tr>'; }
  },
  renderPagination(){
    const ul = document.getElementById('pressurePagination');
    if(!ul) return;
    const totalPages = this.state.totalPages || 0;
    let html = '';
    const currentPage = this.state.currentPage;
    if (totalPages > 1) {
      html += `<li class="page-item ${currentPage===1?'disabled':''}"><a class="page-link" href="javascript:void(0)" data-page="${currentPage-1}"><i class="fas fa-chevron-left"></i></a></li>`;
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="1">1</a></li>`;
        if (startPage > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i===currentPage?'active':''}"><a class="page-link" href="javascript:void(0)" data-page="${i}">${i}</a></li>`;
      }
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        html += `<li class="page-item"><a class="page-link" href="javascript:void(0)" data-page="${totalPages}">${totalPages}</a></li>`;
      }
      html += `<li class="page-item ${currentPage===totalPages?'disabled':''}"><a class="page-link" href="javascript:void(0)" data-page="${currentPage+1}"><i class="fas fa-chevron-right"></i></a></li>`;
    }
    ul.innerHTML = html;
  },
  async openDetailModal(id){
    try{
      const res = await window.API.get('/pressure/report/detail', { id });
      const data = res.data?.data || {}; const r = data.report || {}; const m = data.metrics || {};
      this.state.currentId = r.id;
      this.state.labels = []; this.state.qps = []; this.state.active = []; this.state.lastMsg = m.messageCount||0; this.state.lastTime = Date.now();
      const modalHtml = `
      <div class="modal fade" id="pressureDetailModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header"><h6 class="modal-title">报表详情 #${r.id}</h6><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="pressureAuto" checked><label class="form-check-label" for="pressureAuto">自动刷新</label></div>
                <select class="form-select form-select-sm" id="pressureInterval" style="width:auto"><option value="5">5秒</option><option value="10">10秒</option><option value="30">30秒</option></select>
              </div>
              <div class="row g-3 mb-3">
                <div class="col-md-2"><div class="text-muted">任务总数</div><div class="fw-medium" id="prTaskTotal">${String(m.taskTotal||r.taskCount||0)}</div></div>
                <div class="col-md-2"><div class="text-muted">活动连接</div><div class="fw-medium" id="prActive">${String(m.activeConnections||0)}</div></div>
                <div class="col-md-2"><div class="text-muted">累计消息</div><div class="fw-medium" id="prMessages">${String(m.messageCount||0)}</div></div>
                <div class="col-md-2"><div class="text-muted">平均吞吐</div><div class="fw-medium" id="prAvgQps">-</div></div>
                <div class="col-md-2"><div class="text-muted">开始时间</div><div class="fw-medium" id="prStart">${this.format(r.startTime)}</div></div>
                <div class="col-md-2"><div class="text-muted">持续时长</div><div class="fw-medium" id="prDuration">-</div></div>
              </div>
              <div class="row g-3">
                <div class="col-lg-6"><canvas id="prThroughput"></canvas></div>
                <div class="col-lg-6"><canvas id="prActiveChart"></canvas></div>
              </div>
              <div class="mt-3">
                <div class="d-flex justify-content-between align-items-center mb-2"><div class="fw-medium">连接详情</div><button class="btn btn-sm btn-outline-secondary" id="pressureRefreshConns">刷新连接</button></div>
                <div class="table-responsive">
                  <table class="table table-sm align-middle">
                    <thead class="table-light"><tr><th>通道ID</th><th>客户端</th><th>连接时间</th><th>最后活跃</th><th>消息数</th><th>状态</th></tr></thead>
                    <tbody id="pressureConnBody"><tr><td colspan="6" class="text-muted text-center py-3">加载中...</td></tr></tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">关闭</button></div>
          </div>
        </div>
      </div>`;
      const container = document.createElement('div'); container.innerHTML = modalHtml; document.body.appendChild(container);
      const $m = $('#pressureDetailModal');
      $m.on('hidden.bs.modal', ()=>{ this.stopAuto(); if(this.throughputChart) this.throughputChart.destroy(); if(this.activeChart) this.activeChart.destroy(); $('#pressureDetailModal').remove(); container.remove(); });
      $m.modal('show');
      this.initCharts();
      await this.loadConnections(id);
      const startTs = r.startTime ? new Date(r.startTime).getTime() : 0; const durMs = Date.now() - startTs; document.getElementById('prDuration').textContent = durMs>0 ? this.formatDuration(durMs) : '-'; const avgQps = durMs>0 ? Math.round((m.messageCount||0) / (durMs/1000)) : 0; document.getElementById('prAvgQps').textContent = String(avgQps);
      $(document).on('click', '#pressureRefreshConns', async ()=>{ await this.loadConnections(id); });
      $(document).on('change', '#pressureAuto', ()=>{ const on=$('#pressureAuto').is(':checked'); if(on) this.startAuto(); else this.stopAuto(); });
      $(document).on('change', '#pressureInterval', ()=>{ this.startAuto(); });
      const autoEl = document.getElementById('pressureAuto'); if(autoEl && autoEl.checked) this.startAuto();
    }catch(e){ if(window.App) window.App.showError(e?.message||'加载失败'); }
  },
  async loadConnections(id){
    try{
      const res = await window.API.get('/pressure/report/connections', { id });
      const list = res.data?.data || [];
      const tbody = document.getElementById('pressureConnBody');
      if(!tbody) return;
      if(!list.length){ tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center py-3">暂无数据</td></tr>'; return; }
      tbody.innerHTML = list.map(x => `
        <tr>
          <td>${x.channelId}</td>
          <td>${x.clientIp||'-'}</td>
          <td>${this.format(x.connectTime)}</td>
          <td>${this.format(x.lastActiveTime)}</td>
          <td>${x.messageCount||0}</td>
          <td>${x.status||'-'}</td>
        </tr>
      `).join('');
    }catch(e){ const tbody=document.getElementById('pressureConnBody'); if(tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center py-3">加载失败</td></tr>'; }
  },
  initCharts(){
    const ctx1 = document.getElementById('prThroughput');
    const ctx2 = document.getElementById('prActiveChart');
    this.throughputChart = new Chart(ctx1, { type: 'line', data: { labels: this.state.labels, datasets: [{ label: '吞吐(QPS)', data: this.state.qps, borderColor: '#4e73df', backgroundColor: 'rgba(78,115,223,0.1)', tension: 0.3, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } } });
    this.activeChart = new Chart(ctx2, { type: 'line', data: { labels: this.state.labels, datasets: [{ label: '活动连接', data: this.state.active, borderColor: '#1cc88a', backgroundColor: 'rgba(28,200,138,0.1)', tension: 0.3, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } } });
  },
  startAuto(){
    this.stopAuto();
    const ivEl = document.getElementById('pressureInterval');
    const iv = ivEl ? parseInt(ivEl.value||'5',10)*1000 : 5000;
    this.state.timer = setInterval(async ()=>{ await this.tick(); }, iv);
  },
  stopAuto(){ if(this.state.timer){ clearInterval(this.state.timer); this.state.timer=null; } },
  async tick(){
    if(!this.state.currentId) return;
    try{
      const res = await window.API.get('/pressure/report/detail', { id: this.state.currentId });
      const data = res.data?.data || {}; const m = data.metrics || {}; const r = data.report || {};
      const now = Date.now();
      const msg = m.messageCount||0;
      const dt = Math.max(now - this.state.lastTime, 1);
      const dmsg = Math.max(msg - this.state.lastMsg, 0);
      const curQps = Math.round(dmsg / (dt/1000));
      this.state.lastMsg = msg; this.state.lastTime = now;
      const activeEl = document.getElementById('prActive'); const msgEl = document.getElementById('prMessages'); const durEl = document.getElementById('prDuration'); const avgEl = document.getElementById('prAvgQps');
      if(activeEl) activeEl.textContent = String(m.activeConnections||0);
      if(msgEl) msgEl.textContent = String(msg);
      const startTs = r.startTime ? new Date(r.startTime).getTime() : 0; const durMs = now - startTs; if(durEl) durEl.textContent = durMs>0 ? this.formatDuration(durMs) : '-'; const avgQps = durMs>0 ? Math.round(msg / (durMs/1000)) : 0; if(avgEl) avgEl.textContent = String(avgQps);
      const label = new Date(now).toLocaleTimeString('zh-CN',{hour12:false});
      this.state.labels.push(label); this.state.qps.push(curQps); this.state.active.push(m.activeConnections||0);
      if(this.state.labels.length>50){ this.state.labels.shift(); this.state.qps.shift(); this.state.active.shift(); }
      if(this.throughputChart && this.activeChart){ this.throughputChart.update(); this.activeChart.update(); }
    }catch(e){}
  },
  format(ts){ if(!ts) return '-'; const d=new Date(ts); return d.toLocaleString('zh-CN'); },
  formatDuration(ms){ const s=Math.floor(ms/1000); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const ss=s%60; return `${h}小时${m}分${ss}秒`; }
};
