package org.ssssssss.jtt808client.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.ssssssss.jtt808client.task.TaskManager;
import org.ssssssss.jtt808client.web.entity.AlertLog;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.service.AlertLogService;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.ssssssss.jtt808client.web.vo.Result;

/**
 * 警报控制器
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Controller
@RequestMapping("/alert")
public class AlertController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(AlertController.class);

    @Autowired
    private AlertLogService alertLogService;

    @RequestMapping("/list")
    @ResponseBody
    public Result list(@RequestParam(defaultValue = "1") int pageIndex,
                       @RequestParam(defaultValue = "10") int pageSize,
                       @RequestParam(required = false) String plateNumber,
                       @RequestParam(required = false) Integer alarmIndex,
                       @RequestParam(required = false) Long from,
                       @RequestParam(required = false) Long to) {
        java.util.Date fromTime = (from != null && from > 0) ? new java.util.Date(from) : null;
        java.util.Date toTime = (to != null && to > 0) ? new java.util.Date(to) : null;
        PageVO<AlertLog> page = alertLogService.find(plateNumber, alarmIndex, fromTime, toTime, pageIndex, pageSize);
        return Result.success(page);
    }

    @RequestMapping("/set")
    @ResponseBody
    public Result set(@RequestParam Long id,
                      @RequestParam String flags) {
        if (id == null || id <= 0) throw new BusinessException(400, "任务ID不能为空且必须大于0");
        if (flags == null || flags.trim().isEmpty()) throw new BusinessException(400, "警报索引不能为空");
        try {
            String[] parts = flags.split(",");
            for (String s : parts) {
                s = s.trim();
                if (s.isEmpty()) continue;
                int idx = Integer.parseInt(s);
                TaskManager.getInstance().setWarningFlagById(id, idx, true);
            }
            logger.info("已设置警报标志 - 任务ID: {}, flags: {}", id, flags);
            return Result.success("设置成功");
        } catch (Exception e) {
            logger.error("设置警报失败 - 任务ID: {}", id, e);
            return Result.error(500, "设置警报失败: " + e.getMessage());
        }
    }
}