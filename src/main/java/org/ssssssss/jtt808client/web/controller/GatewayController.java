package org.ssssssss.jtt808client.web.controller;

import org.ssssssss.jtt808client.web.entity.Gateway;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.service.GatewayService;
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
import org.ssssssss.jtt808client.task.net.ConnectionPool;
import java.util.HashMap;

import java.util.List;

/**
 * 808网关配置控制器
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Controller
@RequestMapping("/gateway")
public class GatewayController extends BaseController {
    
    private static final Logger logger = LoggerFactory.getLogger(GatewayController.class);

    @Autowired
    private GatewayService gatewayService;



    /**
     * 分页查询网关配置列表
     */
    @RequestMapping("/list")
    @ResponseBody
    public Result list(@RequestParam(defaultValue = "") String name,
                      @RequestParam(defaultValue = "1") int pageIndex,
                      @RequestParam(defaultValue = "20") int pageSize) {
        if (pageIndex <= 0) {
            throw new BusinessException(400, "页码必须大于0");
        }
        if (pageSize <= 0 || pageSize > 100) {
            throw new BusinessException(400, "每页大小必须在1-100之间");
        }
        
        PageVO<Gateway> gateways = gatewayService.find(name, pageIndex, pageSize);
        return Result.success(gateways);
    }

    /**
     * 获取所有启用的网关配置（用于下拉选择）
     */
    @RequestMapping("/enabled")
    @ResponseBody
    public Result getEnabledGateways() {
        List<Gateway> gateways = gatewayService.listEnabled();
        return Result.success(gateways);
    }



    /**
     * 保存网关配置
     */
    @RequestMapping("/save")
    @ResponseBody
    public Result save(@RequestParam(required = false) Long id,
                      @RequestParam String name,
                      @RequestParam String host,
                      @RequestParam Integer port,
                      @RequestParam(defaultValue = "") String description,
                      @RequestParam(defaultValue = "1") Integer status) {
        
        // 参数验证
        if (!StringUtils.hasText(name)) {
            throw new BusinessException(400, "网关名称不能为空");
        }
        if (!StringUtils.hasText(host)) {
            throw new BusinessException(400, "主机地址不能为空");
        }
        if (port == null || port <= 0 || port > 65535) {
            throw new BusinessException(400, "端口号必须在1-65535之间");
        }
        
        // 检查名称是否重复
        if (gatewayService.existsByName(name, id)) {
            throw new BusinessException(400, "网关名称已存在");
        }
        
        // 检查主机和端口组合是否重复
        if (gatewayService.existsByHostAndPort(host, port, id)) {
            throw new BusinessException(400, "该主机和端口组合已存在");
        }
        
        Gateway gateway = new Gateway();
        gateway.setId(id);
        gateway.setName(name);
        gateway.setHost(host);
        gateway.setPort(port);
        gateway.setDescription(description);
        gateway.setStatus(status);
        
        try {
            if (id == null) {
                // 新增
                gatewayService.create(gateway);
            } else {
                // 更新
                gatewayService.update(gateway);
            }
            return Result.success("保存成功");
        } catch (Exception e) {
            logger.error("保存网关配置失败", e);
            throw new BusinessException(500, "保存失败：" + e.getMessage());
        }
    }

    /**
     * 删除网关配置
     */
    @RequestMapping("/remove")
    @ResponseBody
    public Result remove(@RequestParam Long id) {
        Gateway gateway = gatewayService.getById(id);
        if (gateway == null) {
            throw new BusinessException(404, "网关配置不存在");
        }
        
        try {
            gatewayService.removeById(id);
            return Result.success("删除成功");
        } catch (Exception e) {
            logger.error("删除网关配置失败", e);
            throw new BusinessException(500, "删除失败：" + e.getMessage());
        }
    }

    /**
     * 更新网关状态
     */
    @RequestMapping("/updateStatus")
    @ResponseBody
    public Result updateStatus(@RequestParam Long id, @RequestParam Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            throw new BusinessException(400, "状态值无效");
        }
        
        Gateway gateway = gatewayService.getById(id);
        if (gateway == null) {
            throw new BusinessException(404, "网关配置不存在");
        }
        
        try {
            gatewayService.updateStatus(id, status);
            return Result.success(status == 1 ? "启用成功" : "禁用成功");
        } catch (Exception e) {
            logger.error("更新网关状态失败", e);
            throw new BusinessException(500, "更新状态失败：" + e.getMessage());
        }
    }

    /**
     * 获取网关详情
     */
    @RequestMapping("/detail")
    @ResponseBody
    public Result detail(@RequestParam Long id) {
        Gateway gateway = gatewayService.getById(id);
        if (gateway == null) {
            throw new BusinessException(404, "网关配置不存在");
        }
        return Result.success(gateway);
    }

    /**
     * 连接监控（当前实现为全局连接池视图，与具体网关未绑定）
     */
    @RequestMapping("/connections")
    @ResponseBody
    public Result connections(@RequestParam Long id) {
        ConnectionPool pool = ConnectionPool.getInstance();
        java.util.List<ConnectionPool.ConnectionInfo> list = pool.listConnections();
        HashMap<String, Object> data = new HashMap<>();
        data.put("totalConnections", pool.totalConnections());
        int active = pool.activeConnections();
        data.put("activeConnections", active);
        data.put("idleConnections", pool.totalConnections() - active);
        data.put("messagesPerSecond", 0);
        java.util.List<HashMap<String, Object>> items = new java.util.ArrayList<>();
        for (ConnectionPool.ConnectionInfo ci : list) {
            HashMap<String, Object> m = new HashMap<>();
            m.put("deviceId", ci.channelId);
            m.put("clientIp", ci.clientIp);
            m.put("connectTime", ci.connectTime);
            m.put("lastActiveTime", ci.lastActiveTime);
            m.put("messageCount", ci.messageCount);
            m.put("status", ci.status);
            items.add(m);
        }
        data.put("connections", items);
        return Result.success(data);
    }
}
