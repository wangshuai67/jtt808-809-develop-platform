package org.ssssssss.jtt808client.web.service;

import org.ssssssss.jtt808client.web.entity.SystemConfig;
import org.ssssssss.jtt808client.web.mapper.SystemConfigMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SystemConfigService {
    @Autowired
    private SystemConfigMapper mapper;

    public String getValue(String key, String def) {
        SystemConfig sc = mapper.selectByKey(key);
        return sc != null && sc.getCfgValue() != null ? sc.getCfgValue() : def;
    }

    public int setValue(String key, String value) {
        return mapper.upsert(key, value);
    }
}
