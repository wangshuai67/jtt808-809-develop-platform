/**
 * 监控页面
 */
window.Monitor = {
    state: {
        loading: false,
        autoRefresh: true,
        refreshInterval: 2000,
        refreshTimer: null,
        map: null,
        markers: new Map(),
        lastTimes: new Map(),
        akLoaded: false,
        tasks: [],
        selectedIds: new Set(),
        selectAll: true
    },

    template: `
        <div class="monitor-map-page">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h4 class="mb-0">实时监控</h4>
                    <small class="text-muted">在地图上展示所有正在运行车辆的当前位置与方向</small>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="autoRefreshSwitch" checked>
                        <label class="form-check-label" for="autoRefreshSwitch">自动刷新</label>
                    </div>
                    <button type="button" class="btn btn-outline-secondary" id="refreshBtn">
                        <i class="fas fa-sync-alt"></i> 刷新
                    </button>
                </div>
            </div>
            <div class="d-flex gap-3">
                <div id="monitorSidebar" style="width:280px; height: calc(100vh - 180px); border-radius:8px; border:1px solid #e5e7eb; background:#fff; overflow:auto; padding:10px">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong>车辆选择</strong>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="vehicleSelectAll" checked>
                            <label class="form-check-label" for="vehicleSelectAll">全选</label>
                        </div>
                    </div>
                    <div id="vehicleList" class="list-group"></div>
                </div>
                <div id="monitorMap" style="flex:1; height: calc(100vh - 180px); border-radius: 8px; overflow: hidden; background:#f5f6fa"></div>
            </div>
        </div>
    `,

    render() { return this.template; },

    /**
     * 创建车辆PNG图标（支持marker旋转显示方向）
     * @param {number} direction 方向角度(0-360)
     * @param {string} vehicleNumber 车牌或标签
     */
    createVehicleIcon(direction = 0, vehicleNumber = '') {
        const url = this.state.iconUrl || '/img/vehicle.png';
        try {
            const icon = new BMap.Icon(url, new BMap.Size(40, 40), {
                anchor: new BMap.Size(20, 20),
                imageSize: new BMap.Size(40, 40)
            });
            return icon;
        } catch (e) {
            const fallback = new BMap.Icon(this.defaultVehicleSvgUrl(vehicleNumber, direction), new BMap.Size(40, 40), {
                anchor: new BMap.Size(20, 20),
                imageSize: new BMap.Size(40, 40)
            });
            return fallback;
        }
    },

    defaultVehicleSvgUrl(vehicleNumber = '', direction = 0) {
        const svg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#2196F3" />
                        <stop offset="100%" stop-color="#1565C0" />
                    </linearGradient>
                </defs>
                <g transform="rotate(${direction} 20 20)">
                    <polygon points="20,6 26,14 14,14" fill="#FF7043" stroke="#BF360C" stroke-width="1"/>
                    <rect x="10" y="14" width="20" height="10" rx="3" fill="url(#carBody)" stroke="#0D47A1" stroke-width="1"/>
                    <rect x="12" y="15" width="7" height="5" rx="1" fill="#E3F2FD" stroke="#90CAF9" stroke-width="0.8"/>
                    <rect x="21" y="15" width="7" height="5" rx="1" fill="#E3F2FD" stroke="#90CAF9" stroke-width="0.8"/>
                    <circle cx="14" cy="26" r="3" fill="#263238" stroke="#000" stroke-width="0.8"/>
                    <circle cx="26" cy="26" r="3" fill="#263238" stroke="#000" stroke-width="0.8"/>
                </g>
                <rect x="10" y="30" width="20" height="7" rx="2" fill="#ffffff" stroke="#90A4AE" stroke-width="0.6"/>
                <text x="20" y="35" text-anchor="middle" font-size="4.5" fill="#37474F" font-family="Arial, sans-serif">${vehicleNumber}</text>
            </svg>
        `;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    },

    async preloadVehicleIcon() {
        try {
            const res = await fetch('/img/vehicle.png', { method: 'GET', cache: 'no-store', redirect: 'manual' });
            if (res.status >= 200 && res.status < 300) {
                this.state.iconUrl = '/img/vehicle.png';
            } else {
                this.state.iconUrl = this.defaultVehicleSvgUrl('', 0);
            }
        } catch (e) {
            this.state.iconUrl = this.defaultVehicleSvgUrl('', 0);
        }
    },

    async initialize() {
        this.bindEvents();
        await this.loadBMapAk();
        await this.ensureBMap();
        this.initMap();
        await this.preloadVehicleIcon();
        await this.loadAndRenderAll();
        this.startAutoRefresh();
    },

    bindEvents() {
        document.getElementById('refreshBtn').addEventListener('click', () => { this.loadAndRenderAll(); });
        document.getElementById('autoRefreshSwitch').addEventListener('change', (e) => {
            this.state.autoRefresh = e.target.checked;
            if (this.state.autoRefresh) this.startAutoRefresh(); else this.stopAutoRefresh();
        });
    },

    async loadBMapAk() {
        if (window.BMAP_AK) { this.state.akLoaded = true; return; }
        try {
            const cfg = await App.api.get('/task/config');
            const ak = cfg && cfg.data && cfg.data.data && cfg.data.data.baiduMapAk;
            if (ak) { window.BMAP_AK = ak; this.state.akLoaded = true; }
        } catch(e) {}
    },

    async ensureBMap() {
        if (window.Routes && typeof window.Routes.ensureBMap === 'function') { await window.Routes.ensureBMap(); return; }
        if (window.BMap) return;
        const ak = window.BMAP_AK;
        if (!ak) throw new Error('百度AK未配置');
        if (window.__BMAP_LOADING) { await window.__BMAP_LOADING; return; }
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

    initMap() {
        try {
            const map = new BMap.Map('monitorMap', {
                enableMapClick: true,
                enableAutoResize: true
            });
            const center = new BMap.Point(116.404, 39.915);
            map.centerAndZoom(center, 12);
            
            // 启用所有地图交互功能
            map.enableScrollWheelZoom(true);
            map.enableKeyboard();
            map.enableDragging();
            map.enableDoubleClickZoom();
            
            // 添加地图控件
            map.addControl(new BMap.NavigationControl());
            map.addControl(new BMap.ScaleControl());
            map.addControl(new BMap.OverviewMapControl());
            
            this.state.map = map;
            console.log('地图初始化完成');
        } catch (error) {
            console.error('地图初始化失败:', error);
        }
    },

    async loadAndRenderAll() {
        try {
            const res = await App.api.monitor.getData({ pageIndex: 1, pageSize: 100 });
            const page = res.data?.data || {};
            const tasks = page.list || [];
            console.log('[Monitor] 载入监控列表成功', { count: tasks.length, tasks });
            this.state.tasks = tasks;
            this.renderVehicleList(tasks);
            this.renderVehicles(tasks);
        } catch (e) {
            console.error('加载监控列表失败:', e);
            App.showToast('加载监控列表失败', 'error');
        }
    },

    renderVehicleList(tasks) {
        const listEl = document.getElementById('vehicleList');
        if (!listEl) return;
        const html = (tasks || []).map(t => {
            const id = t.id;
            const name = t.vehicleNumber || ('任务#' + id);
            const checked = this.state.selectAll || this.state.selectedIds.has(id);
            return `
                <label class="list-group-item d-flex align-items-center gap-2">
                    <input type="checkbox" class="form-check-input vehicle-item" data-id="${id}" ${checked ? 'checked' : ''}>
                    <span>${name}</span>
                </label>
            `;
        }).join('');
        listEl.innerHTML = html;
        const allEl = document.getElementById('vehicleSelectAll');
        if (allEl) allEl.checked = this.state.selectAll;
        listEl.querySelectorAll('.vehicle-item').forEach(input => {
            input.addEventListener('change', (e) => {
                const vid = parseInt(e.target.getAttribute('data-id'));
                if (e.target.checked) this.state.selectedIds.add(vid); else this.state.selectedIds.delete(vid);
                this.state.selectAll = false;
                const allInput = document.getElementById('vehicleSelectAll');
                if (allInput) allInput.checked = false;
                this.applySelectionVisibility();
            });
        });
        const allInput = document.getElementById('vehicleSelectAll');
        if (allInput) {
            allInput.onchange = (e) => {
                this.state.selectAll = !!e.target.checked;
                if (this.state.selectAll) {
                    this.state.selectedIds = new Set((tasks || []).map(t => t.id));
                    listEl.querySelectorAll('.vehicle-item').forEach(i => { i.checked = true; });
                }
                this.applySelectionVisibility();
            };
        }
        this.applySelectionVisibility();
    },

    applySelectionVisibility() {
        const showAll = this.state.selectAll || this.state.selectedIds.size === 0;
        this.state.markers.forEach((marker, id) => {
            const visible = showAll || this.state.selectedIds.has(id);
            try {
                if (visible) { marker.show ? marker.show() : this.state.map.addOverlay(marker); }
                else { marker.hide ? marker.hide() : this.state.map.removeOverlay(marker); }
            } catch(e) {}
        });
        try {
            const positions = Array.from(this.state.markers.entries())
                .filter(([id, m]) => showAll || this.state.selectedIds.has(id))
                .map(([_, m]) => m.getPosition());
            if (positions.length) this.state.map.setViewport(positions);
        } catch(e) {}
    },

    renderVehicles(tasks) {
        const map = this.state.map;
        const bounds = new BMap.Bounds(new BMap.Point(180,90), new BMap.Point(-180,-90));
        tasks.forEach(t => {
            const id = t.id;
            const lng = (typeof t.longitude === 'number') ? t.longitude : parseFloat(t.longitude);
            const lat = (typeof t.latitude === 'number') ? t.latitude : parseFloat(t.latitude);
            const direction = t.direction || 0; // 获取方向信息，默认为0
            const labelText = t.vehicleNumber || ('任务#' + id);
            if (isNaN(lng) || isNaN(lat)) return;
            const pt = new BMap.Point(lng, lat);
            bounds.extend(pt);
            
            if (!this.state.markers.has(id)) {
                const icon = this.createVehicleIcon(direction, labelText);
                const marker = new BMap.Marker(pt, { icon });
                if (typeof marker.setRotation === 'function') marker.setRotation(direction);
                
                // 添加车辆信息标签
                const label = new BMap.Label(labelText, { 
                    offset: new BMap.Size(20, -35),
                    enableMassClear: false
                });
                label.setStyle({
                    color: '#333',
                    fontSize: '12px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    padding: '2px 6px'
                });
                marker.setLabel(label);
                
                // 添加点击事件处理 - 显示车辆位置信息
                marker.addEventListener('click', () => {
                    const reportTime = t.reportTime ? new Date(t.reportTime).toLocaleString('zh-CN') : '未知';
                    const curPos = marker.getPosition ? marker.getPosition() : pt;
                    const lat = curPos && typeof curPos.lat === 'number' ? curPos.lat.toFixed(6) : '未知';
                    const lng = curPos && typeof curPos.lng === 'number' ? curPos.lng.toFixed(6) : '未知';
                    
                    // 创建信息窗口内容
                    const infoContent = `
                        <div style="padding: 10px; min-width: 200px;">
                            <h5 style="margin: 0 0 10px 0; color: #333;">${labelText}</h5>
                            <div style="margin-bottom: 5px;">
                                <strong>纬度:</strong> ${lat}
                            </div>
                            <div style="margin-bottom: 5px;">
                                <strong>经度:</strong> ${lng}
                            </div>
                            <div style="margin-bottom: 5px;">
                                <strong>报告时间:</strong> ${reportTime}
                            </div>
                            <div style="margin-bottom: 5px;">
                                <strong>状态:</strong> ${t.state || '未知'}
                            </div>
                            ${t.speed ? `<div style="margin-bottom: 5px;">
                                <strong>速度:</strong> ${t.speed} km/h
                            </div>` : ''}
                            ${t.direction ? `<div style="margin-bottom: 5px;">
                                <strong>方向:</strong> ${t.direction}°
                            </div>` : ''}
                        </div>
                    `;
                    
                    // 创建信息窗口
                    const infoWindow = new BMap.InfoWindow(infoContent, {
                        title: '车辆位置信息',
                        width: 250,
                        height: 0,
                        enableAutoPan: true,
                        enableCloseOnClick: true
                    });
                    
                    // 打开信息窗口
                    const posOpen = (marker.getPosition && marker.getPosition()) || pt;
                    map.openInfoWindow(infoWindow, posOpen);
                });
                
                map.addOverlay(marker);
                this.state.markers.set(id, marker);
                const rptT = (typeof t.reportTime === 'number') ? t.reportTime : Number(t.reportTime) || 0;
                this.state.lastTimes.set(id, rptT);
                console.log('[Monitor] 创建车辆标记', { id, lng, lat, direction, reportTime: rptT });
            } else {
                // 更新现有车辆位置
                const marker = this.state.markers.get(id);
                const isZero = (lng === 0 && lat === 0);
                const last = this.state.lastTimes.get(id) || 0;
                if (!isZero || last === 0) {
                    if (typeof marker.setPosition === 'function') {
                        marker.setPosition(pt);
                        const pos = marker.getPosition && marker.getPosition();
                        console.log('[Monitor] 更新车辆位置(初始化列表)', { id, lng, lat, direction, pos });
                    } else {
                        console.warn('[Monitor] Marker不支持setPosition(初始化列表)', marker);
                    }
                } else {
                    console.log('[Monitor] 跳过列表的0,0覆盖', { id, lng, lat, last });
                }
                
                if (direction !== (marker.getDirection || 0)) {
                    if (typeof marker.setRotation === 'function') marker.setRotation(direction);
                    marker.getDirection = direction;
                }
                
                // 更新点击事件处理 - 显示车辆位置信息
                marker.addEventListener('click', () => {
                    const reportTime = t.reportTime ? new Date(t.reportTime).toLocaleString('zh-CN') : '未知';
                    const curPos = marker.getPosition ? marker.getPosition() : pt;
                    const lat = curPos && typeof curPos.lat === 'number' ? curPos.lat.toFixed(6) : '未知';
                    const lng = curPos && typeof curPos.lng === 'number' ? curPos.lng.toFixed(6) : '未知';
                    
                    // 创建信息窗口内容
                    const infoContent = `
                        <div style="padding: 10px; min-width: 200px;">
                            <h5 style="margin: 0 0 10px 0; color: #333;">${labelText}</h5>
                            <div style="margin-bottom: 5px;">
                                <strong>纬度:</strong> ${lat}
                            </div>
                            <div style="margin-bottom: 5px;">
                                <strong>经度:</strong> ${lng}
                            </div>
                            <div style="margin-bottom: 5px;">
                                <strong>报告时间:</strong> ${reportTime}
                            </div>
                            <div style="margin-bottom: 5px;">
                                <strong>状态:</strong> ${t.state || '未知'}
                            </div>
                            ${t.speed ? `<div style="margin-bottom: 5px;">
                                <strong>速度:</strong> ${t.speed} km/h
                            </div>` : ''}
                            ${t.direction ? `<div style="margin-bottom: 5px;">
                                <strong>方向:</strong> ${t.direction}°
                            </div>` : ''}
                        </div>
                    `;
                    
                    // 创建信息窗口
                    const infoWindow = new BMap.InfoWindow(infoContent, {
                        title: '车辆位置信息',
                        width: 250,
                        height: 0,
                        enableAutoPan: true,
                        enableCloseOnClick: true
                    });
                    
                    // 打开信息窗口
                    const posOpen2 = (marker.getPosition && marker.getPosition()) || pt;
                    map.openInfoWindow(infoWindow, posOpen2);
                });
                
                const rptT = (typeof t.reportTime === 'number') ? t.reportTime : Number(t.reportTime) || (this.state.lastTimes.get(id) || 0);
                this.state.lastTimes.set(id, rptT);
            }
        });
        try {
            const positions = Array.from(this.state.markers.values()).map(m => m.getPosition());
            console.log('[Monitor] 设置视野', { markers: this.state.markers.size, positions });
            map.setViewport(positions);
        } catch(e) { console.warn('[Monitor] 设置视野失败', e); }
    },

    async pollPositions() {
        try {
            // 使用Redis优化的批量获取最新位置
            const res = await App.api.get('/monitor/positions/latest');
            const positions = res.data?.data || {};
            console.log('[Monitor] 批量最新位置返回', { count: Object.keys(positions).length, positions });
            
            // 更新所有车辆位置
            Object.entries(positions).forEach(([taskId, position]) => {
                const id = parseInt(taskId);
                const lng = (typeof position.longitude === 'number') ? position.longitude : parseFloat(position.longitude);
                const lat = (typeof position.latitude === 'number') ? position.latitude : parseFloat(position.latitude);
                const direction = position.direction || 0;
                const rpt = (typeof position.reportTime === 'number') ? position.reportTime : Number(position.reportTime) || Date.now();
                if (isNaN(lng) || isNaN(lat)) return;
                const time = this.state.lastTimes.get(id) || 0;
                if (rpt <= time) {
                    console.log('[Monitor] 跳过过期位置', { id, lng, lat, rpt, last: time });
                    return;
                }
                const pt = new BMap.Point(lng, lat);
                let marker = this.state.markers.get(id);
                if (!marker) {
                    const labelText = '任务#' + id;
                    const icon = this.createVehicleIcon(direction, labelText);
                    marker = new BMap.Marker(pt, { icon });
                    if (typeof marker.setRotation === 'function') marker.setRotation(direction);
                    const label = new BMap.Label(labelText, { offset: new BMap.Size(20, -35), enableMassClear: false });
                    label.setStyle({ color: '#333', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #ccc', borderRadius: '3px', padding: '2px 6px' });
                    marker.setLabel(label);
                    this.state.map.addOverlay(marker);
                    this.state.markers.set(id, marker);
                    console.log('[Monitor] 创建车辆标记(批量)', { id, lng, lat, direction, rpt });
                } else {
                    if (typeof marker.setPosition === 'function') {
                        marker.setPosition(pt);
                        const pos = marker.getPosition && marker.getPosition();
                        console.log('[Monitor] 更新车辆位置(批量)', { id, lng, lat, direction, rpt, pos });
                    } else {
                        console.warn('[Monitor] Marker不支持setPosition(批量)', marker);
                    }
                }
                if (direction !== (marker.getDirection || 0)) {
                    if (typeof marker.setRotation === 'function') marker.setRotation(direction);
                    marker.getDirection = direction;
                    console.log('[Monitor] 更新方向', { id, direction });
                }
                marker.addEventListener('click', () => {
                    const reportTime = position.reportTime ? new Date((typeof position.reportTime === 'number') ? position.reportTime : Number(position.reportTime)).toLocaleString('zh-CN') : '未知';
                    const curPos = marker.getPosition ? marker.getPosition() : pt;
                    const latText = curPos && typeof curPos.lat === 'number' ? curPos.lat.toFixed(6) : '未知';
                    const lngText = curPos && typeof curPos.lng === 'number' ? curPos.lng.toFixed(6) : '未知';
                    const labelText = marker.getLabel().getContent();
                    const infoContent = `
                        <div style="padding: 10px; min-width: 200px;">
                            <h5 style="margin: 0 0 10px 0; color: #333;">${labelText}</h5>
                            <div style="margin-bottom: 5px;"><strong>纬度:</strong> ${isNaN(latText) ? '未知' : latText.toFixed(6)}</div>
                            <div style="margin-bottom: 5px;"><strong>经度:</strong> ${isNaN(lngText) ? '未知' : lngText.toFixed(6)}</div>
                            <div style="margin-bottom: 5px;"><strong>报告时间:</strong> ${reportTime}</div>
                            ${position.speed ? `<div style="margin-bottom: 5px;"><strong>速度:</strong> ${position.speed} km/h</div>` : ''}
                            ${position.direction ? `<div style="margin-bottom: 5px;"><strong>方向:</strong> ${position.direction}°</div>` : ''}
                        </div>
                    `;
                    const infoWindow = new BMap.InfoWindow(infoContent, { title: '车辆位置信息', width: 250, height: 0, enableAutoPan: true, enableCloseOnClick: true });
                    const posOpen3 = (marker.getPosition && marker.getPosition()) || pt;
                    this.state.map.openInfoWindow(infoWindow, posOpen3);
                });
                this.state.lastTimes.set(id, rpt);
            });
            try {
                const showAll = this.state.selectAll || this.state.selectedIds.size === 0;
                const positions2 = Array.from(this.state.markers.entries())
                    .filter(([id, m]) => showAll || this.state.selectedIds.has(id))
                    .map(([_, m]) => m.getPosition());
                console.log('[Monitor] 批量位置后设置视野', { markers: this.state.markers.size, positions: positions2 });
                this.state.map.setViewport(positions2);
            } catch(e) { console.warn('[Monitor] 批量设置视野失败', e); }
        } catch (error) {
            console.error('批量获取位置失败，降级到单个获取:', error);
            // 如果批量获取失败，降级到原来的单个获取方式
            await this.pollPositionsFallback();
        }
    },

    // 降级方案：逐个获取位置（兼容模式）
    async pollPositionsFallback() {
        const ids = Array.from(this.state.markers.keys());
        await Promise.all(ids.map(async id => {
            try {
                const time = this.state.lastTimes.get(id) || 0;
                const res = await App.api.get('/monitor/position', { id, time });
                const body = res.data?.data || null;
                // getLocation 当前封装不携带 time，改用直接 GET 并由后端返回最新，前端做简单更新
                if (!body) return;
                const lng = (typeof body.longitude === 'number') ? body.longitude : parseFloat(body.longitude);
                const lat = (typeof body.latitude === 'number') ? body.latitude : parseFloat(body.latitude);
                const direction = body.direction || 0; // 获取方向信息
                const rpt = (typeof body.reportTime === 'number') ? body.reportTime : Number(body.reportTime) || Date.now();
                if (isNaN(lng) || isNaN(lat)) { console.log('[Monitor] 降级：无效坐标', { id, lng, lat }); return; }
                if (rpt <= time) { console.log('[Monitor] 降级：跳过过期位置', { id, lng, lat, rpt, last: time }); return; }
                const pt = new BMap.Point(lng, lat);
                const marker = this.state.markers.get(id);
                if (marker) {
                    marker.setPosition(pt);
                    console.log('[Monitor] 降级：更新车辆位置', { id, lng, lat, direction, rpt });
                    if (time === 0) { try { this.state.map.panTo(pt); } catch(e) {} }
                    
                    // 如果方向改变，重新创建图标
                    if (direction !== (marker.getDirection || 0)) {
                        if (typeof marker.setRotation === 'function') marker.setRotation(direction);
                        marker.getDirection = direction;
                        console.log('[Monitor] 降级：更新方向', { id, direction });
                    }
                    
                    // 更新点击事件处理 - 显示车辆位置信息
                    marker.addEventListener('click', () => {
                        const reportTime = body.reportTime ? new Date(body.reportTime).toLocaleString('zh-CN') : '未知';
                        const lat = body.latitude?.toFixed(6) || '未知';
                        const lng = body.longitude?.toFixed(6) || '未知';
                        const labelText = marker.getLabel().getContent();
                        
                        // 创建信息窗口内容
                        const infoContent = `
                            <div style="padding: 10px; min-width: 200px;">
                                <h5 style="margin: 0 0 10px 0; color: #333;">${labelText}</h5>
                                <div style="margin-bottom: 5px;">
                                    <strong>纬度:</strong> ${lat}
                                </div>
                                <div style="margin-bottom: 5px;">
                                    <strong>经度:</strong> ${lng}
                                </div>
                                <div style="margin-bottom: 5px;">
                                    <strong>报告时间:</strong> ${reportTime}
                                </div>
                                <div style="margin-bottom: 5px;">
                                    <strong>状态:</strong> ${body.state || '未知'}
                                </div>
                                ${body.speed ? `<div style="margin-bottom: 5px;">
                                    <strong>速度:</strong> ${body.speed} km/h
                                </div>` : ''}
                                ${body.direction ? `<div style="margin-bottom: 5px;">
                                    <strong>方向:</strong> ${body.direction}°
                                </div>` : ''}
                            </div>
                        `;
                        
                        // 创建信息窗口
                        const infoWindow = new BMap.InfoWindow(infoContent, {
                            title: '车辆位置信息',
                            width: 250,
                            height: 0,
                            enableAutoPan: true,
                            enableCloseOnClick: true
                        });
                        
                        const posOpen4 = (marker.getPosition && marker.getPosition()) || pt;
                        map.openInfoWindow(infoWindow, posOpen4);
                    });
                }
                this.state.lastTimes.set(id, rpt);
            } catch(e) {}
        }));
    },

    startAutoRefresh() {
        this.stopAutoRefresh();
        if (this.state.autoRefresh) {
            this.state.refreshTimer = setInterval(async () => {
                await this.pollPositions();
                await this.loadAndRenderAll();
            }, this.state.refreshInterval);
        }
    },

    stopAutoRefresh() {
        if (this.state.refreshTimer) {
            clearInterval(this.state.refreshTimer);
            this.state.refreshTimer = null;
        }
    },

    destroy() {
        this.stopAutoRefresh();
        this.state.markers.forEach(m => { try { this.state.map.removeOverlay(m); } catch(e){} });
        this.state.markers.clear();
        this.state.lastTimes.clear();
        this.state.map = null;
    }
};
