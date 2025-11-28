package org.ssssssss.jtt808client.app;

import org.ssssssss.jtt808client.web.interceptor.CommonInterceptor;
import org.ssssssss.jtt808client.web.interceptor.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * App配置
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Configuration
public class AppConfiguration extends WebMvcConfigurerAdapter {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 添加登录拦截器
        registry.addInterceptor(new LoginInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/login", "/api/login", "/static/**", "/css/**", "/js/**", "/img/**", "/font-awesome/**", "/*.ico", "/*.html",
                        "/vehicle/**", "/gateway/**", "/route/**", "/task/**", "/monitor/**", "/batch/**", "/system/**", "/pressure/**", "/alert/**", "/dashboard/**",
                        "/809/**");

        // 添加通用拦截器
        registry.addInterceptor(new CommonInterceptor()).addPathPatterns("/**");

        super.addInterceptors(registry);
    }
}


