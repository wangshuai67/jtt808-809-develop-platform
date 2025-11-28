/* 初始的配置项 */
select 1;

/* 初始网关配置数据 - 使用条件插入避免重复 */
INSERT INTO gateway (id, name, host, port, description, status) 
SELECT 1, '默认网关', '127.0.0.1', 20021, '本地测试网关', 1 
WHERE NOT EXISTS (SELECT 1 FROM gateway WHERE id = 1);

INSERT INTO gateway (id, name, host, port, description, status) 
SELECT 2, '生产网关', '10.84.176.75', 9093, '生产环境网关', 1
WHERE NOT EXISTS (SELECT 1 FROM gateway WHERE id = 2);

-- 初始化车辆设备数据 - 使用条件插入避免重复
INSERT INTO vehicle (id, plate_number, terminal_id, sim_number, description, status, create_time, update_time) 
SELECT 1, '京A12345', '123456789012345', '13800138001', '测试车辆1', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicle WHERE id = 1);

INSERT INTO vehicle (id, plate_number, terminal_id, sim_number, description, status, create_time, update_time) 
SELECT 2, '京B67890', '123456789012346', '13800138002', '测试车辆2', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicle WHERE id = 2);

INSERT INTO vehicle (id, plate_number, terminal_id, sim_number, description, status, create_time, update_time) 
SELECT 3, '沪C11111', '123456789012347', '13800138003', '测试车辆3', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicle WHERE id = 3);