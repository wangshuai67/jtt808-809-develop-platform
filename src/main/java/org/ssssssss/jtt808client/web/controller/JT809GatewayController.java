package org.ssssssss.jtt808client.web.controller;

import org.ssssssss.jtt808client.web.entity.JT809Gateway;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.service.JT809GatewayService;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.ssssssss.jtt808client.web.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("/809/gateway")
public class JT809GatewayController extends BaseController {
    @Autowired
    private JT809GatewayService service;

    @RequestMapping("/list")
    @ResponseBody
    public Result list(@RequestParam(defaultValue = "") String name,
                       @RequestParam(defaultValue = "1") int pageIndex,
                       @RequestParam(defaultValue = "20") int pageSize) {
        if (pageIndex <= 0) throw new BusinessException(400, "页码必须大于0");
        if (pageSize <= 0 || pageSize > 100) throw new BusinessException(400, "每页大小必须在1-100之间");
        PageVO<JT809Gateway> page = service.find(name, pageIndex, pageSize);
        return Result.success(page);
    }

    @RequestMapping("/enabled")
    @ResponseBody
    public Result enabled() {
        List<JT809Gateway> list = service.listEnabled();
        return Result.success(list);
    }

    @RequestMapping("/save")
    @ResponseBody
    public Result save(@RequestParam(required = false) Long id,
                       @RequestParam String name,
                       @RequestParam String ip,
                       @RequestParam Integer port,
                       @RequestParam(required = false) String userid,
                       @RequestParam(required = false) String pwd,
                       @RequestParam(required = false) Long centerId,
                       @RequestParam(required = false, defaultValue = "2011") String version,
                       @RequestParam(required = false, defaultValue = "0") Integer encryptEnable,
                       @RequestParam(required = false, defaultValue = "0") Long m1,
                       @RequestParam(required = false, defaultValue = "0") Long ia1,
                       @RequestParam(required = false, defaultValue = "0") Long ic1,
                       @RequestParam(defaultValue = "") String description,
                       @RequestParam(defaultValue = "1") Integer status) {
        if (!StringUtils.hasText(name)) throw new BusinessException(400, "名称不能为空");
        if (!StringUtils.hasText(ip)) throw new BusinessException(400, "上级平台地址不能为空");
        if (port == null || port <= 0 || port > 65535) throw new BusinessException(400, "端口不合法");
        if (service.existsByName(name, id)) throw new BusinessException(400, "名称已存在");
        JT809Gateway g = new JT809Gateway();
        g.setId(id);
        g.setName(name);
        g.setIp(ip);
        g.setPort(port);
        g.setUserId(userid);
        g.setPassword(pwd);
        g.setCenterId(centerId);
        g.setVersion(version);
        g.setEncryptEnable(encryptEnable);
        g.setM1(m1);
        g.setIa1(ia1);
        g.setIc1(ic1);
        g.setDescription(description);
        g.setStatus(status);
        if (id == null) service.create(g);
        else service.update(g);
        return Result.success("保存成功");
    }

    @RequestMapping("/remove")
    @ResponseBody
    public Result remove(@RequestParam Long id) {
        JT809Gateway g = service.getById(id);
        if (g == null) throw new BusinessException(404, "记录不存在");
        service.removeById(id);
        return Result.success("删除成功");
    }

    @RequestMapping("/updateStatus")
    @ResponseBody
    public Result updateStatus(@RequestParam Long id, @RequestParam Integer status) {
        if (status == null || (status != 0 && status != 1)) throw new BusinessException(400, "状态值无效");
        JT809Gateway g = service.getById(id);
        if (g == null) throw new BusinessException(404, "记录不存在");
        service.updateStatus(id, status);
        return Result.success(status == 1 ? "启用成功" : "禁用成功");
    }

    @RequestMapping("/detail")
    @ResponseBody
    public Result detail(@RequestParam Long id) {
        JT809Gateway g = service.getById(id);
        if (g == null) throw new BusinessException(404, "记录不存在");
        return Result.success(g);
    }
}