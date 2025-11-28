package org.ssssssss.jtt808client.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.ssssssss.jtt808client.web.controller.BaseController;

/**
 * Created by matrixy when 2020/5/14.
 */
@Controller
public class IndexController extends BaseController
{
    private static final Logger logger = LoggerFactory.getLogger(IndexController.class);
    
    @RequestMapping("/")
    public String index()
    {
        logger.info("访问首页，重定向到V2前端");
        return "redirect:/static/v2/index.html";
    }
}


