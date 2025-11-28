window.Settings = {
  render() {
    return `
      <div class="p-3">
        <h4 class="mb-3">系统配置</h4>
        <form id="settingsForm" class="row g-3">
          <div class="col-md-4">
            <label class="form-label">压测任务线程数 <span class="text-danger">*</span></label>
            <input type="number" min="1" class="form-control" id="pressureThreadCount" required>
            <div class="form-text">建议不超过CPU核心数的2倍</div>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-md-4">
            <label class="form-label">808网关服务器 <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="vehicleServerAddr" required>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-md-4">
            <label class="form-label">808网关端口 <span class="text-danger">*</span></label>
            <input type="number" class="form-control" id="vehicleServerPort" required>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-md-6">
            <label class="form-label">百度地图AK</label>
            <input type="text" class="form-control" id="baiduMapAk">
          </div>
          <div class="col-md-4">
            <label class="form-label">位置上报频率 <span class="text-danger">*</span></label>
            <select class="form-control" id="locationReportInterval" required>
              <option value="5">5秒</option>
              <option value="10">10秒</option>
              <option value="20">20秒</option>
              <option value="30">30秒</option>
              <option value="60">60秒</option>
              <option value="120">120秒</option>
              <option value="300">300秒</option>
            </select>
            <div class="form-text">车辆位置数据上报间隔时间</div>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-12">
            <button type="button" class="btn btn-primary" id="saveSettings">保存</button>
          </div>
        </form>
      </div>
    `;
  },
  async initialize(){
    try {
      const cfg = await window.API.get('/task/config');
      const data = cfg.data?.data || {};
      document.getElementById('pressureThreadCount').value = parseInt(data.pressureThreadCount||'1',10);
      document.getElementById('vehicleServerAddr').value = data.vehicleServerAddr||'';
      document.getElementById('vehicleServerPort').value = data.vehicleServerPort||'';
      document.getElementById('baiduMapAk').value = data.baiduMapAk||'';
      
      // 获取位置上报频率配置
      const intervalRes = await window.API.get('/api/config/location-report-interval');
      if (intervalRes.data?.data) {
        document.getElementById('locationReportInterval').value = intervalRes.data.data;
      }
    } catch(e) {}
    document.getElementById('saveSettings').addEventListener('click', this.save.bind(this));
  },
  async save(){
    const tc = parseInt(document.getElementById('pressureThreadCount').value,10);
    const host = document.getElementById('vehicleServerAddr').value.trim();
    const port = document.getElementById('vehicleServerPort').value.trim();
    const interval = parseInt(document.getElementById('locationReportInterval').value,10);
    
    if (!tc || tc<1) { this.markInvalid('pressureThreadCount','请输入有效线程数'); return; }
    if (!host) { this.markInvalid('vehicleServerAddr','请输入服务器地址'); return; }
    if (!port) { this.markInvalid('vehicleServerPort','请输入端口'); return; }
    if (!interval || interval<5) { this.markInvalid('locationReportInterval','请选择有效的上报频率'); return; }
    
    try{
      await window.API.post('/system/config/save', { key: 'pressure.thread.count', value: String(tc) }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
      await window.API.post('/system/config/save', { key: 'vehicle-server.addr', value: host }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
      await window.API.post('/system/config/save', { key: 'vehicle-server.port', value: port }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
      
      // 保存位置上报频率
      await window.API.post('/api/config/location-report-interval', { interval: interval }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
      
      const ak = document.getElementById('baiduMapAk').value.trim();
      if (ak) await window.API.post('/system/config/save', { key: 'map.baidu.key', value: ak }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
      if (window.App) window.App.showSuccess('保存成功');
    }catch(e){ const msg=(e&&e.data&&e.data.error&&e.data.error.reason)||e?.message||'保存失败'; if(window.App) window.App.showError(msg); }
  },
  markInvalid(id,msg){ const el=document.getElementById(id); el.classList.add('is-invalid'); const fb=el.nextElementSibling; if(fb && fb.classList.contains('invalid-feedback')) fb.textContent=msg; }
};
