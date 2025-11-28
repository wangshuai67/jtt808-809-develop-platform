package org.ssssssss.jtt808client.web.mapper;

import org.ssssssss.jtt808client.web.entity.PressureReport;
import java.util.List;

public interface PressureReportMapper {
    int insert(PressureReport report);
    int update(PressureReport report);
    PressureReport selectById(Long id);
    List<PressureReport> list();
}
