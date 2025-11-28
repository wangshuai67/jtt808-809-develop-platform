package org.ssssssss;

import org.ssssssss.jtt808client.manager.RouteManager;
import org.ssssssss.jtt808client.task.TaskManager;
import org.ssssssss.jtt808client.task.event.EventDispatcher;
import org.ssssssss.jtt808client.task.runner.RunnerManager;
import org.ssssssss.jtt808client.task.net.ConnectionPool;
import org.ssssssss.jtt808client.util.BeanUtils;
import org.ssssssss.jtt808client.util.Configs;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import java.util.TimeZone;


@MapperScan(basePackages = "org.ssssssss")
@SpringBootApplication
public class Jtt808809APP {


    public static void main(String[] args) throws Exception {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
        ApplicationContext context = SpringApplication.run(Jtt808809APP.class, args);
        BeanUtils.init(context);
        Configs.init(context);

        RouteManager.getInstance().init();
        TaskManager.init();

        RunnerManager.init();
        EventDispatcher.init();
        ConnectionPool.init();
    }
}

