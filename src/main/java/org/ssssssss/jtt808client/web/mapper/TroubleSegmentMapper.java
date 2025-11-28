package org.ssssssss.jtt808client.web.mapper;

import org.ssssssss.jtt808client.web.entity.Mapper;
import org.ssssssss.jtt808client.web.entity.TroubleSegment;
import org.ssssssss.jtt808client.web.entity.TroubleSegmentExample;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface TroubleSegmentMapper {
    /**
     */
    long countByExample(TroubleSegmentExample example);

    /**
     */
    int deleteByExample(TroubleSegmentExample example);

    /**
     */
    int deleteByPrimaryKey(Long id);

    /**
     */
    int insert(TroubleSegment record);

    /**
     */
    int insertSelective(TroubleSegment record);

    /**
     */
    List<TroubleSegment> selectByExample(TroubleSegmentExample example);

    /**
     */
    TroubleSegment selectByPrimaryKey(Long id);

    /**
     */
    int updateByExampleSelective(@Param("record") TroubleSegment record, @Param("example") TroubleSegmentExample example);

    /**
     */
    int updateByExample(@Param("record") TroubleSegment record, @Param("example") TroubleSegmentExample example);

    /**
     */
    int updateByPrimaryKeySelective(TroubleSegment record);

    /**
     */
    int updateByPrimaryKey(TroubleSegment record);
}


