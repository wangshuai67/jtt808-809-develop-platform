package org.ssssssss.jtt808client.web.exception;

/**
 * 业务异常类
 * 用于业务逻辑中的异常处理
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
public class BusinessException extends RuntimeException {

    private int code;
    private String message;

    public BusinessException(String message) {
        super(message);
        this.code = 1;
        this.message = message;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * 创建业务异常的静态方法
     */
    public static BusinessException of(String message) {
        return new BusinessException(message);
    }

    public static BusinessException of(int code, String message) {
        return new BusinessException(code, message);
    }

    public static BusinessException of(int code, String message, Throwable cause) {
        return new BusinessException(code, message, cause);
    }
}