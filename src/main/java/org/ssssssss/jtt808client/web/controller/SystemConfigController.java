package org.ssssssss.jtt808client.web.controller;

import org.ssssssss.jtt808client.web.service.SystemConfigService;
import org.ssssssss.jtt808client.web.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/system/config")
public class SystemConfigController extends BaseController {
    @Autowired
    private SystemConfigService service;

    @RequestMapping("/get")
    @ResponseBody
    public Result get(@RequestParam String key, @RequestParam(required = false) String def) {
        String val = service.getValue(key, def);
        Map<String, String> out = new HashMap<>();
        out.put("key", key);
        out.put("value", val);
        return Result.success(out);
    }

    @RequestMapping("/save")
    @ResponseBody
    public Result save(@RequestParam String key, @RequestParam String value) {
        service.setValue(key, value);
        return Result.success("保存成功");
    }

    @RequestMapping("/defaults")
    @ResponseBody
    public Result defaults() {
        Map<String, String> out = new HashMap<>();
        out.put("pressure.thread.count", String.valueOf(Runtime.getRuntime().availableProcessors()));
        out.put("vehicle-server.addr", System.getProperty("vehicle-server.addr", "127.0.0.1"));
        out.put("vehicle-server.port", System.getProperty("vehicle-server.port", "6808"));
        out.put("map.baidu.key", System.getProperty("map.baidu.key", ""));
        return Result.success(out);
    }
}
