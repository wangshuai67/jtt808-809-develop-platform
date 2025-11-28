package org.ssssssss.jtt808client.task.event;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Listen
{
    // 事件名称
    public EventEnum when();

    // 事件附件，用于进一步分开
    public String attachment() default "";
}


