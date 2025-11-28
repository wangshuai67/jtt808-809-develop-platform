package org.ssssssss.jtt808client.jtt809;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class HexFileLogger {
    private static final Path dir = Paths.get("logs");
    private static final Path file = dir.resolve("809-hex.log");
    private static final Object lock = new Object();
    private static final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    public static void log(String type, String hex) {
        String line = fmt.format(LocalDateTime.now()) + " " + type + " " + hex + System.lineSeparator();
        try {
            synchronized (lock) {
                if (!Files.exists(dir)) Files.createDirectories(dir);
                Files.write(file, line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            }
        } catch (Throwable ignore) {}
    }
}