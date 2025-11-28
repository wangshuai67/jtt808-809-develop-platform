package org.ssssssss.jtt808client.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.ssssssss.jtt808client.jtt809.JT809ClientManager;
import org.ssssssss.jtt808client.web.vo.Result;

@Controller
@RequestMapping("/809")
public class JT809Controller extends BaseController {

    @Autowired
    private JT809ClientManager manager;

    @RequestMapping("/connect")
    @ResponseBody
    public Result connect() {
        try {
            manager.connect();
            return Result.success(Result.values("connected", manager.isConnected()));
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }

    @RequestMapping("/disconnect")
    @ResponseBody
    public Result disconnect() {
        manager.disconnect();
        return Result.success(Result.values("connected", false));
    }

    @RequestMapping("/sendLocation")
    @ResponseBody
    public Result sendLocation(@RequestParam String plate,
                               @RequestParam double lon,
                               @RequestParam double lat) {
        manager.sendDemoLocation(plate, lon, lat);
        return Result.success(Result.values("sent", true));
    }
}