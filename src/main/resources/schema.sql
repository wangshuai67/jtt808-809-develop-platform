/* 模拟器相关表 */
CREATE TABLE if not exists `x_route` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(100) DEFAULT NULL COMMENT 'name',
  `minSpeed` int(11) DEFAULT NULL COMMENT 'minSpeed（公里每小时）',
  `maxSpeed` int(11) DEFAULT NULL COMMENT 'maxSpeed',
  `mileages` int(11) DEFAULT NULL COMMENT '里程（公里）',
  `fingerPrint` varchar(100) DEFAULT NULL COMMENT '线路指纹',
  `type` varchar(20) DEFAULT 'normal' COMMENT '线路类型',
  `startName` varchar(100) DEFAULT NULL COMMENT '起点名称',
  `endName` varchar(100) DEFAULT NULL COMMENT '终点名称',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) COMMENT='线路';

-- 兼容已存在库，添加缺失列
ALTER TABLE x_route ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'normal';
ALTER TABLE x_route ADD COLUMN IF NOT EXISTS startName VARCHAR(100);
ALTER TABLE x_route ADD COLUMN IF NOT EXISTS endName VARCHAR(100);
ALTER TABLE x_route ADD COLUMN IF NOT EXISTS create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE x_route ADD COLUMN IF NOT EXISTS update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE if not exists `x_route_point` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `routeId` bigint(20) DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) COMMENT='线路轨迹点';

create index if not exists idx_route_id on x_route_point(routeId);

CREATE TABLE if not exists `x_schedule_task` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `taskId` bigint(20) DEFAULT NULL COMMENT '运行时任务ID',
  `routeId` bigint(20) DEFAULT NULL COMMENT '线路ID',
  `driverId` bigint(20) DEFAULT NULL COMMENT '驾驶员ID',
  `vehicleId` bigint(20) DEFAULT NULL COMMENT '车辆ID',
  `fromTime` varchar(20) DEFAULT NULL COMMENT '行程的开始时间的最早时间',
  `endTime` varchar(20) DEFAULT NULL COMMENT '行程的开始时间的最晚时间',
  `ratio` int(11) DEFAULT NULL COMMENT '概率，',
  `daysInterval` int(11) DEFAULT NULL COMMENT '每隔几天运行一次',
  `driveCount` int(11) DEFAULT NULL COMMENT '行驶次数计数',
  `lastDriveTime` datetime DEFAULT NULL COMMENT '最后行驶开始时间',
  `runCount` int(11) DEFAULT NULL COMMENT '运行次数',
  PRIMARY KEY (`id`)
) COMMENT='线路行程计划任务';

create index if not exists idx_schedule_route_id on x_schedule_task(routeId);
create index if not exists idx_schedule_driver_id on x_schedule_task(driverId);
create index if not exists idx_schedule_vehicle_id on x_schedule_task(vehicleId);

CREATE TABLE if not exists `x_stay_point` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `routeid` bigint(20) DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `minTime` int(11) DEFAULT NULL,
  `maxTime` int(11) DEFAULT NULL,
  `ratio` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) COMMENT='线路停留点';

create index if not exists idx_stay_point_route_id on x_stay_point(routeId);

CREATE TABLE if not exists `x_trouble_segment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `routeId` bigint(20) DEFAULT NULL,
  `startIndex` int(11) DEFAULT NULL,
  `endIndex` int(11) DEFAULT NULL,
  `eventCode` varchar(20) DEFAULT NULL,
  `ratio` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) COMMENT='线路问题路段';

create index if not exists idx_trouble_segment_route_id on x_trouble_segment(routeId);

-- 车辆设备信息表
CREATE TABLE IF NOT EXISTS vehicle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    terminal_id VARCHAR(50) NOT NULL,
    sim_number VARCHAR(20) NOT NULL,
    description VARCHAR(255) DEFAULT '',
    status TINYINT DEFAULT 1,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS uk_vehicle_plate_number ON vehicle(plate_number);
CREATE UNIQUE INDEX IF NOT EXISTS uk_vehicle_terminal_id ON vehicle(terminal_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_vehicle_sim_number ON vehicle(sim_number);

-- 创建普通索引
CREATE INDEX IF NOT EXISTS idx_vehicle_status ON vehicle(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_create_time ON vehicle(create_time);

/* 808网关配置表 */
CREATE TABLE if not exists `gateway` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `host` varchar(100) NOT NULL,
  `port` int(11) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gateway_name` (`name`),
  UNIQUE KEY `uk_gateway_host_port` (`host`, `port`)
);

-- 系统配置表
CREATE TABLE if not exists `system_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cfg_key` varchar(100) NOT NULL,
  `cfg_value` varchar(500) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_system_config_key` (`cfg_key`)
);

CREATE TABLE if not exists `pressure_report` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `end_time` datetime DEFAULT NULL,
  `created_count` int(11) DEFAULT 0,
  `skipped_count` int(11) DEFAULT 0,
  `task_count` int(11) DEFAULT 0,
  `server_address` varchar(100) DEFAULT NULL,
  `server_port` int(11) DEFAULT NULL,
  `route_mode` varchar(20) DEFAULT NULL,
  `route_ids` varchar(500) DEFAULT NULL,
  `task_ids` text,
  `status` varchar(20) DEFAULT 'done',
  PRIMARY KEY (`id`)
);
ALTER TABLE x_schedule_task ADD COLUMN IF NOT EXISTS taskId BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS uk_schedule_task_taskId ON x_schedule_task(taskId);

-- 报警记录表
CREATE TABLE IF NOT EXISTS alert_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT,
  alarm_index INT,
  alarm_name VARCHAR(64),
  raw_message CLOB,
  plate_number VARCHAR(32),
  report_time TIMESTAMP,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  longitude DOUBLE,
  latitude DOUBLE
);

CREATE INDEX IF NOT EXISTS idx_alert_log_create_time ON alert_log(create_time);
CREATE INDEX IF NOT EXISTS idx_alert_log_plate_time ON alert_log(plate_number, report_time);
CREATE TABLE IF NOT EXISTS `jt809_gateway` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID，自增',
  `name` VARCHAR(100) NOT NULL COMMENT '网关名称（唯一标识网关）',
  `primary_addr` VARCHAR(100) DEFAULT NULL COMMENT '主连接地址（主服务器IP/域名）',
  `primary_port` INT(11) DEFAULT NULL COMMENT '主连接端口',
  `sub_addr` VARCHAR(100) DEFAULT NULL COMMENT '备用连接地址（备用服务器IP/域名）',
  `sub_port` INT(11) DEFAULT NULL COMMENT '备用连接端口',
  `center_id` BIGINT(20) DEFAULT NULL COMMENT '关联的中心平台ID',
  `version` VARCHAR(20) DEFAULT NULL COMMENT 'JT809协议版本（如：2011/2019）',
  `encrypt_flag` INT(11) DEFAULT NULL COMMENT '加密标志（兼容旧版加密标识：0-不加密，1-加密）',
  `encrypt_key` VARCHAR(100) DEFAULT NULL COMMENT '加密密钥（JT809协议对称加密密钥，如SM4/AES密钥）',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '网关描述信息',
  `status` INT(11) DEFAULT 1 COMMENT '网关状态：1-启用，0-禁用，2-异常',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间（自动填充当前时间）',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间（自动更新为当前时间）',
  `ip` VARCHAR(100) DEFAULT NULL COMMENT '本地绑定IP（网关监听IP）',
  `port` INT(11) DEFAULT NULL COMMENT '本地绑定端口（网关监听端口）',
  `userid` VARCHAR(100) DEFAULT NULL COMMENT '登录用户名（JT809协议认证用户ID）',
  `pwd` VARCHAR(100) DEFAULT NULL COMMENT '登录密码（JT809协议认证密码）',
  `encrypt_enable` INT(11) DEFAULT NULL COMMENT '加密启用状态：1-启用，0-禁用（新版加密控制开关）',
  `m1` BIGINT(20) DEFAULT NULL COMMENT 'JT809加密相关字段1（如加密模式参数/密钥索引，兼容协议扩展）',
  `ia1` BIGINT(20) DEFAULT NULL COMMENT 'JT809加密相关字段2（如加密向量偏移量/时间戳因子，用于加密同步）',
  `ic1` BIGINT(20) DEFAULT NULL COMMENT 'JT809加密相关字段3（如加密校验位/算法标识，匹配协议加密规范）',
  PRIMARY KEY (`id`)
) COMMENT='JT809网关配置表（存储JT809协议网关的连接、认证、加密等核心配置信息)';
