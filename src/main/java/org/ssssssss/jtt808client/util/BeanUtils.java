package org.ssssssss.jtt808client.util;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.ApplicationContext;

/**
 * Spring Bean工具类类型
 * 提供Spring容器中Bean的创建、销毁等操作
 * 
 * @author Expect
 * @since 2018/1/25
 */
public final class BeanUtils {
    private static BeanFactory beanFactory;

    /**
     * 初始化Bean工厂
     * 
     * @param context Spring应用上下文
     */
    public static void init(ApplicationContext context) {
        BeanUtils.beanFactory = context;
    }

    /**
     * 根据类型型创建Bean实例
     * 
     * @param serviceClass Bean的类型型
     * @param <T> 泛型类型型
     * @return Bean实例
     */
    public static <T> T create(Class serviceClass) {
        return (T)beanFactory.getBean(serviceClass);
    }

    /**
     * 销毁Bean实例
     * 
     * @param bean 要销毁的Bean实例
     */
    public static void destroy(Object bean) {
        // ...
    }

    /**
     * 释放Bean实例
     * 
     * @param bean 要释放的Bean实例
     */
    public static void free(Object bean) {
        // ...
    }
}


