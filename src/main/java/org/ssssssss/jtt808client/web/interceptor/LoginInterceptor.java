package org.ssssssss.jtt808client.web.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * 登录拦截器
 * 拦截需要登录才能访问的页面
 */
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        
        // 不需要登录验证的路径
        if (uri.equals("/login") || uri.startsWith("/login/") || 
            uri.startsWith("/static/") || uri.startsWith("/css/") || 
            uri.startsWith("/js/") || uri.startsWith("/img/") ||
            uri.startsWith("/font-awesome/") || uri.endsWith(".css") || 
            uri.endsWith(".js") || uri.endsWith(".png") || 
            uri.endsWith(".jpg") || uri.endsWith(".gif") || 
            uri.endsWith(".ico")) {
            return true;
        }
        
        HttpSession session = request.getSession();
        Object user = session.getAttribute("user");
        
        if (user != null) {
            // 已登录，允许访问
            return true;
        } else {
            // 未登录，重定向到登录页面
            response.sendRedirect("/login");
            return false;
        }
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        // 可以在这里添加一些通用的模型数据
        if (modelAndView != null) {
            HttpSession session = request.getSession();
            Object user = session.getAttribute("user");
            if (user != null) {
                modelAndView.addObject("currentUser", user);
            }
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 请求完成后的清理工作
    }
}