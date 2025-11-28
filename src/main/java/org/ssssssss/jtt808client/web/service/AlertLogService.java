package org.ssssssss.jtt808client.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.ssssssss.jtt808client.web.entity.AlertLog;
import org.ssssssss.jtt808client.web.mapper.AlertLogMapper;
import org.ssssssss.jtt808client.web.vo.PageVO;

import java.util.Date;

@Service
public class AlertLogService {
    private static final Logger logger = LoggerFactory.getLogger(AlertLogService.class);

    @Autowired
    private AlertLogMapper mapper;

    public void save(AlertLog log) {
        if (log.getCreateTime() == null) log.setCreateTime(new Date());
        mapper.insert(log);
        logger.debug("保存报警记录成功 - alarmIndex:{}, plate:{}", log.getAlarmIndex(), log.getPlateNumber());
    }

    public PageVO<AlertLog> find(String plateNumber,
                                 Integer alarmIndex,
                                 Date fromTime,
                                 Date toTime,
                                 int pageIndex,
                                 int pageSize) {
        Page<AlertLog> mpPage = new Page<>(pageIndex, pageSize);
        QueryWrapper<AlertLog> qw = new QueryWrapper<>();
        if (plateNumber != null && plateNumber.trim().length() > 0) {
            qw.like("plate_number", plateNumber.trim());
        }
        if (alarmIndex != null) {
            qw.eq("alarm_index", alarmIndex);
        }
        if (fromTime != null) {
            qw.ge("report_time", fromTime);
        }
        if (toTime != null) {
            qw.le("report_time", toTime);
        }
        qw.orderByDesc("create_time");
        Page<AlertLog> result = mapper.selectPage(mpPage, qw);
        PageVO<AlertLog> page = new PageVO<>(pageIndex, pageSize);
        page.setList(result.getRecords());
        page.setRecordCount(result.getTotal());
        return page;
    }
}