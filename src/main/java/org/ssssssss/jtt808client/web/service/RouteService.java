package org.ssssssss.jtt808client.web.service;

import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.entity.RouteExample;
import org.ssssssss.jtt808client.web.mapper.RouteMapper;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Created by houcheng when 2018/11/25.
 */
@Service
public class RouteService
{
    @Autowired
    RouteMapper routeMapper;

    public int create(Route route)
    {
        return routeMapper.insert(route);
    }

    public int update(Route route)
    {
        return routeMapper.updateByPrimaryKey(route);
    }

    public int remove(Route route)
    {
        return removeById(route.getId());
    }

    public int removeById(Long id)
    {
        return routeMapper.deleteByPrimaryKey(id);
    }

    public Route getById(Long id)
    {
        return routeMapper.selectByPrimaryKey(id);
    }

    public List<Route> list()
    {
        return routeMapper.selectByExample(new RouteExample().createCriteria().example());
    }

    public PageVO<Route> find(String name, int pageIndex, int pageSize)
    {
        PageVO<Route> page = new PageVO<Route>(pageIndex, pageSize);
        RouteExample.Criteria criteria = new RouteExample().createCriteria();
        criteria.andMinSpeedIsNotNull();
        if (!StringUtils.isEmpty(name))
        {
            criteria.andNameLike("%" + name + "%");
        }
        criteria.example().setPageInfo(pageIndex, pageSize);
        criteria.example().setOrderByClause(Route.Column.id.desc());
        page.setList(routeMapper.selectByExample(criteria.example()));
        page.setRecordCount(routeMapper.countByExample(criteria.example()));
        return page;
    }
}


