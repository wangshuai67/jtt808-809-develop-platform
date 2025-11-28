package org.ssssssss.jtt808client.web.mapper;

import org.apache.ibatis.annotations.Param;
import org.ssssssss.jtt808client.web.entity.SystemConfig;

public interface SystemConfigMapper {
    SystemConfig selectByKey(@Param("cfgKey") String cfgKey);
    int upsert(@Param("cfgKey") String cfgKey, @Param("cfgValue") String cfgValue);
}
