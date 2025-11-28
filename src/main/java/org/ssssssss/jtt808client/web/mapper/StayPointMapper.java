package org.ssssssss.jtt808client.web.mapper;

import org.ssssssss.jtt808client.web.entity.Mapper;
import org.ssssssss.jtt808client.web.entity.StayPoint;
import org.ssssssss.jtt808client.web.entity.StayPointExample;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StayPointMapper {
    /**
     */
    long countByExample(StayPointExample example);

    /**
     */
    int deleteByExample(StayPointExample example);

    /**
     */
    int deleteByPrimaryKey(Long id);

    /**
     */
    int insert(StayPoint record);

    /**
     */
    int insertSelective(StayPoint record);

    /**
     */
    List<StayPoint> selectByExample(StayPointExample example);

    /**
     */
    StayPoint selectByPrimaryKey(Long id);

    /**
     */
    int updateByExampleSelective(@Param("record") StayPoint record, @Param("example") StayPointExample example);

    /**
     */
    int updateByExample(@Param("record") StayPoint record, @Param("example") StayPointExample example);

    /**
     */
    int updateByPrimaryKeySelective(StayPoint record);

    /**
     */
    int updateByPrimaryKey(StayPoint record);
}


