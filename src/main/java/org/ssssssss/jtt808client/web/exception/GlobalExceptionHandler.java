package org.ssssssss.jtt808client.web.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.ssssssss.jtt808client.web.vo.Result;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;

import java.util.Set;

/**
 * 全局异常处理器
 * 统一处理系统中的各种异常，返回标准的Result格式
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result handleBusinessException(BusinessException e, HttpServletRequest request) {
        logger.warn("Business Exception: {} - URL: {}", e.getMessage(), request.getRequestURL());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常 - @Valid注解校验失败
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result handleMethodArgumentNotValidException(MethodArgumentNotValidException e, HttpServletRequest request) {
        logger.warn("Validation Exception: {} - URL: {}", e.getMessage(), request.getRequestURL());
        
        StringBuilder errorMsg = new StringBuilder("参数校验失败: ");
        for (FieldError fieldError : e.getBindingResult().getFieldErrors()) {
            errorMsg.append(fieldError.getField()).append(" ").append(fieldError.getDefaultMessage()).append("; ");
        }
        
        return Result.error(400, errorMsg.toString());
    }

    /**
     * 处理参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result handleBindException(BindException e, HttpServletRequest request) {
        logger.warn("Bind Exception: {} - URL: {}", e.getMessage(), request.getRequestURL());
        
        StringBuilder errorMsg = new StringBuilder("参数绑定失败: ");
        for (FieldError fieldError : e.getBindingResult().getFieldErrors()) {
            errorMsg.append(fieldError.getField()).append(" ").append(fieldError.getDefaultMessage()).append("; ");
        }
        
        return Result.error(400, errorMsg.toString());
    }

    /**
     * 处理参数类型不匹配异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e, HttpServletRequest request) {
        logger.warn("Argument Type Mismatch Exception: {} - URL: {}", e.getMessage(), request.getRequestURL());
        
        String errorMsg = String.format("参数类型错误: %s 应该是 %s 类型", 
                e.getName(), e.getRequiredType().getSimpleName());
        
        return Result.error(400, errorMsg);
    }

    /**
     * 处理约束违反异常 - @Validated注解校验失败
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result handleConstraintViolationException(ConstraintViolationException e, HttpServletRequest request) {
        logger.warn("Constraint Violation Exception: {} - URL: {}", e.getMessage(), request.getRequestURL());
        
        StringBuilder errorMsg = new StringBuilder("参数校验失败: ");
        Set<ConstraintViolation<?>> violations = e.getConstraintViolations();
        for (ConstraintViolation<?> violation : violations) {
            errorMsg.append(violation.getPropertyPath()).append(" ").append(violation.getMessage()).append("; ");
        }
        
        return Result.error(400, errorMsg.toString());
    }

    /**
     * 处理404异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result handleNoHandlerFoundException(NoHandlerFoundException e, HttpServletRequest request) {
        logger.warn("No Handler Found Exception: {} - URL: {}", e.getMessage(), request.getRequestURL());
        return Result.error(404, "请求的资源不存在: " + e.getRequestURL());
    }

    /**
     * 处理空指针异常
     */
    @ExceptionHandler(NullPointerException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result handleNullPointerException(NullPointerException e, HttpServletRequest request) {
        logger.error("Null Pointer Exception - URL: {}", request.getRequestURL(), e);
        return Result.error(500, "系统内部错误，请联系管理员");
    }

    /**
     * 处理IllegalArgument异常
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result handleIllegalArgumentException(IllegalArgumentException e, HttpServletRequest request) {
        logger.warn("Illegal Argument Exception: {} - URL: {}", e.getMessage(), request.getRequestURL());
        return Result.error(400, "参数错误: " + e.getMessage());
    }

    /**
     * 处理RuntimeException异常
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        logger.error("Runtime Exception - URL: {}", request.getRequestURL(), e);
        return Result.error(500, "系统运行时错误: " + e.getMessage());
    }

    /**
     * 处理其他所有异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result handleException(Exception e, HttpServletRequest request) {
        logger.error("Unexpected Exception - URL: {}", request.getRequestURL(), e);
        return Result.error(500, "系统异常，请联系管理员");
    }
}