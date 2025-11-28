package org.ssssssss.jtt808client.web.mapper;

import org.ssssssss.jtt808client.web.entity.Mapper;
import org.ssssssss.jtt808client.web.entity.ScheduleTask;
import org.ssssssss.jtt808client.web.entity.ScheduleTaskExample;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ScheduleTaskMapper {
    /**
     */
    long countByExample(ScheduleTaskExample example);

    /**
     */
    int deleteByExample(ScheduleTaskExample example);

    /**
     */
    int deleteByPrimaryKey(Long id);

    /**
     */
    int insert(ScheduleTask record);

    /**
     */
    int insertSelective(ScheduleTask record);

    /**
     */
    List<ScheduleTask> selectByExample(ScheduleTaskExample example);

    /**
     */
    ScheduleTask selectByPrimaryKey(Long id);

    ScheduleTask selectByTaskId(Long taskId);

    int upsertByTaskId(ScheduleTask task);

    /**
     */
    int updateByExampleSelective(@Param("record") ScheduleTask record, @Param("example") ScheduleTaskExample example);

    /**
     */
    int updateByExample(@Param("record") ScheduleTask record, @Param("example") ScheduleTaskExample example);

    /**
     */
    int updateByPrimaryKeySelective(ScheduleTask record);

    /**
     */
    int updateByPrimaryKey(ScheduleTask record);

    /**
     * 与车辆、驾驶员、线路联合查"
     * @param example
     * @return
     */
    List<ScheduleTask> findTask(ScheduleTaskExample example);
}


