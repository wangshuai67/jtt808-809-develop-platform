package org.ssssssss.jtt808client.web.mapper;

import org.ssssssss.jtt808client.web.entity.Mapper;
import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.entity.RouteExample;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RouteMapper {
    /**
     */
    long countByExample(RouteExample example);

    /**
     */
    int deleteByExample(RouteExample example);

    /**
     */
    int deleteByPrimaryKey(Long id);

    /**
     */
    int insert(Route record);

    /**
     */
    int insertSelective(Route record);

    /**
     */
    List<Route> selectByExample(RouteExample example);

    /**
     */
    Route selectByPrimaryKey(Long id);

    /**
     */
    int updateByExampleSelective(@Param("record") Route record, @Param("example") RouteExample example);

    /**
     */
    int updateByExample(@Param("record") Route record, @Param("example") RouteExample example);

    /**
     */
    int updateByPrimaryKeySelective(Route record);

    /**
     */
    int updateByPrimaryKey(Route record);
}


