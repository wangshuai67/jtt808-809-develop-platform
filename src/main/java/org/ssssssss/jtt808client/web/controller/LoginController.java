package org.ssssssss.jtt808client.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.ssssssss.jtt808client.web.dto.LoginRequest;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.vo.Result;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

/**
 * 登录控制器
 * 处理用户登录验证和会话管理
 */
@Controller
public class LoginController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

    @Value("${login.username:admin}")
    private String configUsername;

    @Value("${login.password:admin123}")
    private String configPassword;

    /**
     * 显示登录页面 - 重定向到V2登录页面
     */
    @RequestMapping(value = "/login", method = RequestMethod.GET)
    public String loginPage(HttpSession session) {
        // 如果已经登录，重定向到主页
        if (isLoggedIn(session)) {
            return "redirect:/static/v2/index.html";
        }
        return "redirect:/static/v2/login.html";
    }

    /**
     * 检查登录状态
     */
    @RequestMapping(value = "/login/status", method = RequestMethod.GET)
    @ResponseBody
    public Result checkLoginStatus(HttpSession session) {
        Map<String, Object> data = new HashMap<>();
        data.put("isLoggedIn", isLoggedIn(session));
        return Result.success(data);
    }

    /**
     * 处理登录请求
     */
    @RequestMapping(value = "/login/auth", method = RequestMethod.POST)
    @ResponseBody
    public Result authenticate(@RequestParam String username, 
                              @RequestParam String password, 
                              HttpSession session) {
        return performLogin(username, password, session);
    }

    /**
     * 处理API登录请求 (JSON格式)
     */
    @RequestMapping(value = "/api/login", method = RequestMethod.POST)
    @ResponseBody
    public Result apiLogin(@RequestBody LoginRequest loginRequest, 
                          HttpSession session) {
        return performLogin(loginRequest.getUsername(), loginRequest.getPassword(), session);
    }

    /**
     * 执行登录验证的通用方法
     */
    private Result performLogin(String username, String password, HttpSession session) {
        // 验证用户名和密码
        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
            throw new BusinessException(400, "用户名和密码不能为空");
        }
        
        if (!configUsername.equals(username) || !configPassword.equals(password)) {
            logger.warn("登录失败，用户名: {}, IP: {}", username, getIP());
            throw new BusinessException(401, "用户名或密码错误");
        }
        
        // 登录成功，设置会话
        session.setAttribute("user", username);
        session.setAttribute("loginTime", System.currentTimeMillis());
        
        Map<String, Object> data = new HashMap<>();
        data.put("redirectUrl", "/route/index");
        
        logger.info("用户登录成功，用户名: {}, IP: {}", username, getIP());
        return Result.success("登录成功", data);
    }

    /**
     * 退出登录
     */
 @RequestMapping(value = "/logout", method = RequestMethod.POST)
    @ResponseBody
    public Result logoutApi(HttpSession session) {
        session.invalidate();
        logger.info("用户已退出登录");
        return Result.success("退出登录成功");
    }

    /**
     * 检查用户是否已登录
     */
    private boolean isLoggedIn(HttpSession session) {
        return session.getAttribute("user") != null;
    }
}