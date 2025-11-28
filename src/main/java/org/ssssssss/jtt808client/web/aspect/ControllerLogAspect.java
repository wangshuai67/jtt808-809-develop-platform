package org.ssssssss.jtt808client.web.aspect;

import com.alibaba.fastjson.JSON;
import com.google.gson.Gson;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

/**
 * Controller日志切面
 * 统一记录Controller方法的入参、响应和异常信息
 */
@Aspect
@Component
public class ControllerLogAspect {

    private static final Logger logger = LoggerFactory.getLogger(ControllerLogAspect.class);


    /**
     * 定义切点：匹配所有Controller包下的方法
     */
    @Pointcut("execution(* org.ssssssss.jtt808client.web.controller..*.*(..))")
    public void controllerMethods() {}

    /**
     * 环绕通知：记录方法执行前后的信息
     */
    @Around("controllerMethods()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        // 获取请求信息
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = null;
        if (attributes != null) {
            request = attributes.getRequest();
        }
        
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        // 记录请求开始日志
        logger.info("=== Controller Request Start ===");
        logger.info("Class: {}", className);
        logger.info("Method: {}", methodName);
        
        if (request != null) {
            logger.info("URL: {} {}", request.getMethod(), request.getRequestURL().toString());
            logger.info("IP: {}", getClientIpAddress(request));
            logger.info("User-Agent: {}", request.getHeader("User-Agent"));
        }
        
        // 记录入参（过滤敏感信息）
        if (args != null && args.length > 0) {
            try {
                String argsJson = JSON.toJSONString(filterSensitiveData(args));
                logger.info("Request Args: {}", argsJson);
            } catch (Exception e) {
                logger.info("Request Args: {}", Arrays.toString(args));
            }
        }
        
        Object result = null;
        Exception exception = null;
        
        try {
            // 执行目标方法
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            
            // 记录响应日志
            if (exception == null) {
                logger.info("Response: {}", result != null ? JSON.toJSONString(result) : "null");
                logger.info("Execution Time: {}ms", executionTime);
                logger.info("=== Controller Request Success ===");
            } else {
                logger.error("Exception: {}", exception.getMessage());
                logger.error("Execution Time: {}ms", executionTime);
                logger.error("=== Controller Request Failed ===");
            }
        }
    }

    /**
     * 异常通知：记录异常信息
     */
    @AfterThrowing(pointcut = "controllerMethods()", throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Exception ex) {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        
        logger.error("=== Controller Exception ===");
        logger.error("Class: {}", className);
        logger.error("Method: {}", methodName);
        logger.error("Exception Type: {}", ex.getClass().getSimpleName());
        logger.error("Exception Message: {}", ex.getMessage());
        logger.error("Exception Stack Trace: ", ex);
    }

    /**
     * 获取客户端真实IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * 过滤敏感数据
     */
    private Object[] filterSensitiveData(Object[] args) {
        if (args == null) return null;
        
        Object[] filteredArgs = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            Object arg = args[i];
            if (arg != null) {
                String argStr = arg.toString().toLowerCase();
                // 如果包含敏感字段，则进行脱敏处理
                if (argStr.contains("password") || argStr.contains("pwd") || 
                    argStr.contains("token") || argStr.contains("secret")) {
                    filteredArgs[i] = "[FILTERED]";
                } else {
                    filteredArgs[i] = arg;
                }
            } else {
                filteredArgs[i] = null;
            }
        }
        return filteredArgs;
    }
}