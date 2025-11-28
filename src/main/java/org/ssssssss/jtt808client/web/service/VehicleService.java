package org.ssssssss.jtt808client.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ssssssss.jtt808client.web.entity.Vehicle;
import org.ssssssss.jtt808client.web.mapper.VehicleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.ssssssss.jtt808client.web.vo.PageVO;

import java.util.Date;
import java.util.List;

/**
 * 车辆设备管理服务
 */
@Service
public class VehicleService {
    
    @Autowired
    private VehicleMapper vehicleMapper;

    /**
     * 创建车辆设备
     */
    public int create(Vehicle vehicle) {
        vehicle.setCreateTime(new Date());
        vehicle.setUpdateTime(new Date());
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(1); // 默认启用
        }
        return vehicleMapper.insert(vehicle);
    }

    /**
     * 更新车辆设备
     */
    public int update(Vehicle vehicle) {
        vehicle.setUpdateTime(new Date());
        return vehicleMapper.updateById(vehicle);
    }

    /**
     * 删除车辆设备
     */
    public int remove(Vehicle vehicle) {
        return removeById(vehicle.getId());
    }

    /**
     * 根据ID删除车辆设备
     */
    public int removeById(Long id) {
        return vehicleMapper.deleteById(id);
    }

    /**
     * 根据ID获取车辆设备
     */
    public Vehicle getById(Long id) {
        return vehicleMapper.selectById(id);
    }

    /**
     * 获取所有车辆设备列表
     */
    public List<Vehicle> list() {
        QueryWrapper<Vehicle> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("create_time");
        return vehicleMapper.selectList(queryWrapper);
    }

    /**
     * 获取所有启用的车辆设备
     */
    public List<Vehicle> listEnabled() {
        QueryWrapper<Vehicle> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", 1);
        queryWrapper.orderByDesc("create_time");
        return vehicleMapper.selectList(queryWrapper);
    }

    /**
     * 分页查询车辆设备
     */
    public PageVO<Vehicle> find(String plateNumber, int pageIndex, int pageSize) {
        QueryWrapper<Vehicle> queryWrapper = new QueryWrapper<>();
        
        if (StringUtils.hasText(plateNumber)) {
            queryWrapper.like("plate_number", plateNumber)
                    .or().like("terminal_id", plateNumber)
                    .or().like("sim_number", plateNumber);
        }
        
        queryWrapper.orderByDesc("create_time");
        
        Page<Vehicle> page = new Page<>(pageIndex, pageSize);
        IPage<Vehicle> result = vehicleMapper.selectPage(page, queryWrapper);
        
        PageVO<Vehicle> customPage =
            new PageVO<>(pageIndex, pageSize);
        customPage.setList(result.getRecords());
        customPage.setRecordCount((int) result.getTotal());
        return customPage;
    }

    /**
     * 启用/禁用车辆设备
     */
    public int updateStatus(Long id, Integer status) {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(id);
        vehicle.setStatus(status);
        vehicle.setUpdateTime(new Date());
        return vehicleMapper.updateById(vehicle);
    }

    /**
     * 检查车牌号是否存在
     */
    public boolean existsByPlateNumber(String plateNumber, Long excludeId) {
        QueryWrapper<Vehicle> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("plate_number", plateNumber);
        
        if (excludeId != null) {
            queryWrapper.ne("id", excludeId);
        }
        
        return vehicleMapper.selectCount(queryWrapper) > 0;
    }

    /**
     * 检查终端识别码是否存在
     */
    public boolean existsByTerminalId(String terminalId, Long excludeId) {
        QueryWrapper<Vehicle> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("terminal_id", terminalId);
        
        if (excludeId != null) {
            queryWrapper.ne("id", excludeId);
        }
        
        return vehicleMapper.selectCount(queryWrapper) > 0;
    }

    /**
     * 检查SIM卡号是否存在
     */
    public boolean existsBySimNumber(String simNumber, Long excludeId) {
        QueryWrapper<Vehicle> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("sim_number", simNumber);
        
        if (excludeId != null) {
            queryWrapper.ne("id", excludeId);
        }
        
        return vehicleMapper.selectCount(queryWrapper) > 0;
    }
}
