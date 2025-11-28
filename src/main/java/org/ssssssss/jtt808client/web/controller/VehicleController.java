package org.ssssssss.jtt808client.web.controller;

import org.springframework.web.bind.annotation.RequestBody;
import org.ssssssss.jtt808client.web.entity.Vehicle;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.service.VehicleService;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.ssssssss.jtt808client.web.vo.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Map;
import java.util.Date;

/**
 * 车辆设备管理控制器
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Controller
@RequestMapping("/vehicle")
public class VehicleController extends BaseController {
    
    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);

    @Autowired
    private VehicleService vehicleService;



    /**
     * 分页查询车辆设备列表
     */
    @RequestMapping("/list")
    @ResponseBody
    public Result list(@RequestParam(defaultValue = "") String plateNumber,
                      @RequestParam(defaultValue = "1") int pageIndex,
                      @RequestParam(defaultValue = "20") int pageSize) {
        if (pageIndex <= 0) {
            throw new BusinessException(400, "页码必须大于0");
        }
        if (pageSize <= 0 || pageSize > 100) {
            throw new BusinessException(400, "每页大小必须在1-100之间");
        }
        
        PageVO<Vehicle> vehicles = vehicleService.find(plateNumber, pageIndex, pageSize);
        return Result.success(vehicles);
    }

    /**
     * 获取所有启用的车辆设备（用于下拉选择）
     */
    @RequestMapping("/enabled")
    @ResponseBody
    public Result getEnabledVehicles() {
        List<Vehicle> vehicles = vehicleService.listEnabled();
        return Result.success(vehicles);
    }



    /**
     * 保存车辆设备
     */
    @RequestMapping("/save")
    @ResponseBody
    public Result save(@RequestBody Vehicle vehicle) {
        // 参数验证
        if (!StringUtils.hasText(vehicle.getPlateNumber())) {
            throw new BusinessException(400, "车牌号不能为空");
        }
        if (!StringUtils.hasText(vehicle.getTerminalId())) {
            throw new BusinessException(400, "终端识别码不能为空");
        }
        if (!StringUtils.hasText(vehicle.getSimNumber())) {
            throw new BusinessException(400, "SIM卡号不能为空");
        }

        // 检查车牌号是否重复
        if (vehicleService.existsByPlateNumber(vehicle.getPlateNumber(), vehicle.getId())) {
            throw new BusinessException(400, "车牌号已存在");
        }

        // 检查终端识别码是否重复
        if (vehicleService.existsByTerminalId(vehicle.getTerminalId(), vehicle.getId())) {
            throw new BusinessException(400, "终端识别码已存在");
        }

        // 检查SIM卡号是否重复
        if (vehicleService.existsBySimNumber(vehicle.getSimNumber(), vehicle.getId())) {
            throw new BusinessException(400, "SIM卡号已存在");
        }

        try {
            if (vehicle.getId() == null) {
                // 新增
                vehicleService.create(vehicle);
            } else {
                // 更新
                vehicleService.update(vehicle);
            }
            return Result.success("保存成功");
        } catch (Exception e) {
            logger.error("保存车辆设备失败", e);
            throw new BusinessException(500, "保存失败：" + e.getMessage());
        }
    }

    /**
     * 批量创建模拟车辆
     */
    @RequestMapping(value = "/batchSave", method = RequestMethod.POST)
    @ResponseBody
    public Result batchSave(@RequestBody Map<String, Object> body) {
        int count = parseInt(body.get("count"), 2000);
        String platePrefix = String.valueOf(body.getOrDefault("platePrefix", "新C"));
        int indexStart = parseInt(body.get("indexStart"), 0);
        int indexWidth = parseInt(body.get("indexWidth"), 5);
        String terminalStartStr = String.valueOf(body.getOrDefault("terminalStart", "10000000000"));
        String simStartStr = String.valueOf(body.getOrDefault("simStart", "13900000000"));
        int increment = parseInt(body.get("increment"), 1);
        String description = String.valueOf(body.getOrDefault("description", "模拟车辆"));
        int status = parseInt(body.get("status"), 1);

        if (count <= 0 || count > 2000) {
            throw new BusinessException(400, "批量创建数量必须在1-2000之间");
        }
        if (indexWidth < 1 || indexWidth > 8) {
            throw new BusinessException(400, "序号位数需在1-8之间");
        }
        long terminalStart;
        long simStart;
        try {
            terminalStart = Long.parseLong(terminalStartStr);
            simStart = Long.parseLong(simStartStr);
        } catch (Exception e) {
            throw new BusinessException(400, "设备号或SIM起始值必须为11位数字");
        }
        if (String.valueOf(terminalStart).length() > 11 || String.valueOf(simStart).length() > 11) {
            throw new BusinessException(400, "设备号与SIM起始值长度不能超过11位");
        }
        if (increment <= 0) increment = 1;

        int created = 0;
        int skipped = 0;
        Date now = new Date();

        for (int i = 0; i < count; i++) {
            String plate = platePrefix + String.format("%0" + indexWidth + "d", (indexStart + i));
            long termVal = terminalStart + (long) i * increment;
            long simVal = simStart + (long) i * increment;
            String terminal = String.format("%011d", termVal);
            String sim = String.format("%011d", simVal);

            if (vehicleService.existsByPlateNumber(plate, null)
                || vehicleService.existsByTerminalId(terminal, null)
                || vehicleService.existsBySimNumber(sim, null)) {
                skipped++;
                continue;
            }

            Vehicle v = new Vehicle();
            v.setPlateNumber(plate);
            v.setTerminalId(terminal);
            v.setSimNumber(sim);
            v.setDescription(description);
            v.setStatus(status);
            v.setCreateTime(now);
            v.setUpdateTime(now);

            try {
                vehicleService.create(v);
                created++;
            } catch (Exception e) {
                skipped++;
            }
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("created", created);
        result.put("skipped", skipped);
        result.put("platePrefix", platePrefix);
        result.put("indexStart", indexStart);
        result.put("indexWidth", indexWidth);
        result.put("terminalStart", String.format("%011d", terminalStart));
        result.put("simStart", String.format("%011d", simStart));
        result.put("increment", increment);
        return Result.success(result);
    }

    private int parseInt(Object obj, int def) {
        try { return Integer.parseInt(String.valueOf(obj)); } catch (Exception ignore) { return def; }
    }


    /**
     * 删除车辆设备
     */
    @RequestMapping("/remove")
    @ResponseBody
    public Result remove(@RequestParam Long id) {
        Vehicle vehicle = vehicleService.getById(id);
        if (vehicle == null) {
            throw new BusinessException(404, "车辆设备不存在");
        }
        
        try {
            vehicleService.removeById(id);
            return Result.success("删除成功");
        } catch (Exception e) {
            logger.error("删除车辆设备失败", e);
            throw new BusinessException(500, "删除失败：" + e.getMessage());
        }
    }

    /**
     * 更新车辆设备状态
     */
    @RequestMapping("/updateStatus")
    @ResponseBody
    public Result updateStatus(@RequestParam Long id, @RequestParam Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new BusinessException(400, "状态值无效");
        }
        
        Vehicle vehicle = vehicleService.getById(id);
        if (vehicle == null) {
            throw new BusinessException(404, "车辆设备不存在");
        }
        
        try {
            vehicleService.updateStatus(id, status);
            return Result.success(status == 1 ? "启用成功" : "禁用成功");
        } catch (Exception e) {
            logger.error("更新车辆设备状态失败", e);
            throw new BusinessException(500, "更新状态失败：" + e.getMessage());
        }
    }

    /**
     * 获取车辆设备详情
     */
    @RequestMapping("/detail")
    @ResponseBody
    public Result detail(@RequestParam Long id) {
        Vehicle vehicle = vehicleService.getById(id);
        if (vehicle == null) {
            throw new BusinessException(404, "车辆设备不存在");
        }
        return Result.success(vehicle);
    }
}
