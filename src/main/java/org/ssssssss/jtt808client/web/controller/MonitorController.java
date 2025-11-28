package org.ssssssss.jtt808client.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.ssssssss.jtt808client.entity.TaskInfo;
import org.ssssssss.jtt808client.task.TaskManager;
import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.service.RouteService;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.ssssssss.jtt808client.web.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 监控列表控制"
 * 提供任务监控列表的页面展示和数据接口
 * 
 * @author houcheng
 * @since 2018/11/25
 */
@Controller
@RequestMapping("/monitor/list")
public class MonitorController extends BaseController {
    
    private static final Logger logger = LoggerFactory.getLogger(MonitorController.class);
    
    @Autowired
    RouteService routeService;



    /**
     * 获取任务监控列表的JSON数据
     * 
     * @param pageIndex 页码，默认为1
     * @param pageSize 每页大小，默认为20
     * @return 包含任务信息的分页结果
     */
    @RequestMapping("/json")
    @ResponseBody
    public Result listJson(@RequestParam(defaultValue = "1") int pageIndex, @RequestParam(defaultValue = "20") int pageSize) {
        // 参数校验
        if (pageIndex <= 0) {
            throw new BusinessException(400, "页码必须大于0");
        }
        if (pageSize <= 0 || pageSize > 100) {
            throw new BusinessException(400, "每页大小必须在1-100之间");
        }
        
        PageVO<TaskInfo> page = TaskManager.getInstance().find(pageIndex, pageSize);
        for (TaskInfo task : page.getList()) {
            Route route = routeService.getById(task.getRouteId());
            if (route != null) {
                task.setRouteName(route.getName());
                task.setRouteMileages(route.getMileages());
            }
        }
        
        logger.debug("获取任务监控列表，页码: {}, 每页大小: {}, 总数: {}", pageIndex, pageSize, page.getRecordCount());
        return Result.success(page);
    }
}


