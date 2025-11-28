package org.ssssssss.jtt808client.web.dto;

/**
 * 登录请求DTO
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
public class LoginRequest {
    private String username;
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}