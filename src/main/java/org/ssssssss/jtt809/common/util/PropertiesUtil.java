package org.ssssssss.jtt809.common.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

import org.ssssssss.jtt809.common.exception.BizProcessException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class PropertiesUtil {

    private PropertiesUtil() {
    }

    private static Properties props;

    static {
        String fileName = "application.properties";
        props = new Properties();
        try {
            File configFile = new File(
                    System.getProperty("user.dir") + File.separator + fileName);
            InputStream in = configFile.exists()
                    ? new FileInputStream(configFile)
                    : PropertiesUtil.class.getClassLoader()
                            .getResourceAsStream(fileName);
            props.load(new InputStreamReader(in, StandardCharsets.UTF_8));
        } catch (IOException e) {
            log.error("配置文件读取异常", e);
        }
    }

    public static String getString(String key) {
        String value = props.getProperty(key.trim());
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    public static String getString(String key, String defaultValue) {
        String value = props.getProperty(key.trim());
        if (value == null || value.trim().isEmpty()) {
            value = defaultValue;
        }
        return value.trim();
    }

    public static int getInteger(String key) {
        String value = props.getProperty(key.trim());
        if (value == null || value.trim().isEmpty()) {
            throw new BizProcessException("没有配置属性：" + key);
        }
        return Integer.parseInt(value.trim());
    }

    public static int getInteger(String key, int defaultValue) {
        String value = props.getProperty(key.trim());
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        return Integer.parseInt(value.trim());
    }

    public static String getProperty(String key, String defaultValue) {
        String value = props.getProperty(key.trim());
        if (value.isEmpty()) {
            value = defaultValue;
        }
        return value.trim();
    }
}
