package org.ssssssss.jtt808client.task.event;

import lombok.Data;
import lombok.Getter;
import org.ssssssss.jtt808client.task.AbstractDriveTask;
import org.ssssssss.jtt808client.task.runner.RunnerManager;
import org.ssssssss.jtt808client.task.runner.Executable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
public final class EventDispatcher {
    static Logger logger = LoggerFactory.getLogger(EventDispatcher.class);

    @Getter
    private static final EventDispatcher instance = new EventDispatcher();
    ConcurrentHashMap<String, Method> listenerMap;

    private EventDispatcher() {
        listenerMap = new ConcurrentHashMap<>(128);
    }

    // 事件委托
    public void dispatch(AbstractDriveTask driveTask, String tag, String attachment, final Object data) {
        try {
            attachment = attachment == null ? "" : attachment;

            String className = driveTask.getClass().getName();
            String mName = className + ":::" + tag + ":::" + attachment;
            if ("connected".equals(tag) || "message_received".equals(tag)) {
                logger.info("事件分发 - class:{}, tag:{}, attachment:{}, taskId:{}", className, tag, attachment, driveTask.getId());
            } else {
                logger.debug("事件分发 - class:{}, tag:{}, attachment:{}, taskId:{}", className, tag, attachment, driveTask.getId());
            }
            Method method = listenerMap.get(mName);
            if (method == null) {
                // TODO: 是否有必要收集，以及是否应该交由LoopRunner去执行？
                logger.error("未找到事件处理方法: {}:::{}，class:{}", tag, attachment, className);
                return;
            }
            Method gMethod = listenerMap.get(className + ":::" + tag + ":::");

            // TODO: 暂时只有一个参数或没有参数，后面再想办法做参数类型型匹配，按需赋值，就跟spring一"

            final String fClassName = className;
            final String fTag = tag;
            final String fAttachment = attachment;
            final Method fMethod = method;
            final Method fGMethod = gMethod;
            RunnerManager.getInstance().execute(driveTask, new Executable() {
                @Override
                public void execute(AbstractDriveTask driveTask) {
                    if ("connected".equals(fTag) || "message_received".equals(fTag)) {
                        logger.info("执行事件处理 - class:{}, tag:{}, attachment:{}, method:{}", fClassName, fTag, fAttachment, fMethod.getName());
                    } else {
                        logger.debug("执行事件处理 - class:{}, tag:{}, attachment:{}, method:{}", fClassName, fTag, fAttachment, fMethod.getName());
                    }
                    Object[] args = new Object[fMethod.getParameterCount()];
                    if (args.length == 1) args[0] = data;

                    try {
                        // 触发一下message_received事件的回"
                        if (fGMethod != null && fGMethod.equals(fMethod) == false) {
                            logger.debug("先执行通用事件处理 - method:{}", fGMethod.getName());
                            fGMethod.invoke(driveTask, args);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    try {
                        fMethod.invoke(driveTask, args);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        } catch (Exception ex) {
            // throw new RuntimeException(ex);
            logger.error("event dispatch failed", ex);
        }
    }

    private void register0(AbstractDriveTask driveTask) {
        String className = driveTask.getClass().getName();
        if (listenerMap.containsKey(className)) return;

        Method[] methods = driveTask.getClass().getMethods();
        int count = 0;
        for (Method m : methods) {
            Listen anno = m.getAnnotation(Listen.class);
            if (anno == null) continue;
            String key = className + ":::" + anno.when() + ":::" + anno.attachment();
            listenerMap.put(key, m);
            logger.debug("注册事件监听 - class:{}, when:{}, attachment:{}, method:{}", className, anno.when(), anno.attachment(), m.getName());
            count++;
        }
        logger.info("事件监听注册完成 - class:{}, handlers:{}", className, count);
    }

    public static void register(AbstractDriveTask driveTask) {
        instance.register0(driveTask);
    }

    public static void init() {
        // ...
    }

}


