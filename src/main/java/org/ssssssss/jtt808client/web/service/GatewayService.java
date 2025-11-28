package org.ssssssss.jtt808client.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.ssssssss.jtt808client.web.entity.Gateway;
import org.ssssssss.jtt808client.web.mapper.GatewayMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.ssssssss.jtt808client.web.vo.PageVO;

import java.util.Date;
import java.util.List;

/**
 * 808网关配置服务
 */
@Service
public class GatewayService {
    
    @Autowired
    private GatewayMapper gatewayMapper;

    /**
     * 创建网关配置
     */
    public int create(Gateway gateway) {
        gateway.setCreateTime(new Date());
        gateway.setUpdateTime(new Date());
        if (gateway.getStatus() == null) {
            gateway.setStatus(1); // 默认启用
        }
        return gatewayMapper.insert(gateway);
    }

    /**
     * 更新网关配置
     */
    public int update(Gateway gateway) {
        gateway.setUpdateTime(new Date());
        return gatewayMapper.updateById(gateway);
    }

    /**
     * 删除网关配置
     */
    public int remove(Gateway gateway) {
        return removeById(gateway.getId());
    }

    /**
     * 根据ID删除网关配置
     */
    public int removeById(Long id) {
        return gatewayMapper.deleteById(id);
    }

    /**
     * 根据ID获取网关配置
     */
    public Gateway getById(Long id) {
        return gatewayMapper.selectById(id);
    }

    /**
     * 获取所有网关配置列表
     */
    public List<Gateway> list() {
        QueryWrapper<Gateway> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("create_time");
        return gatewayMapper.selectList(queryWrapper);
    }

    /**
     * 获取所有启用的网关配置
     */
    public List<Gateway> listEnabled() {
        QueryWrapper<Gateway> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", 1);
        return gatewayMapper.selectList(queryWrapper);
    }

    /**
     * 分页查询网关配置
     */
    public PageVO<Gateway> find(String name, int pageIndex, int pageSize) {
        QueryWrapper<Gateway> queryWrapper = new QueryWrapper<>();
        
        if (StringUtils.hasText(name)) {
            queryWrapper.like("name", name);
        }
        
        queryWrapper.orderByDesc("create_time");
        
        Page<Gateway> page = new Page<>(pageIndex, pageSize);
        IPage<Gateway> result = gatewayMapper.selectPage(page, queryWrapper);
        
        PageVO<Gateway> customPage =
            new PageVO<>(pageIndex, pageSize);
        customPage.setList(result.getRecords());
        customPage.setRecordCount((int) result.getTotal());
        return customPage;
    }

    /**
     * 启用/禁用网关
     */
    public int updateStatus(Long id, Integer status) {
        Gateway gateway = new Gateway();
        gateway.setId(id);
        gateway.setStatus(status);
        gateway.setUpdateTime(new Date());
        return gatewayMapper.updateById(gateway);
    }

    /**
     * 检查网关名称是否存在
     */
    public boolean existsByName(String name, Long excludeId) {
        QueryWrapper<Gateway> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("name", name);
        
        if (excludeId != null) {
            queryWrapper.ne("id", excludeId);
        }
        
        return gatewayMapper.selectCount(queryWrapper) > 0;
    }

    /**
     * 检查主机和端口组合是否存在
     */
    public boolean existsByHostAndPort(String host, Integer port, Long excludeId) {
        QueryWrapper<Gateway> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("host", host);
        queryWrapper.eq("port", port);
        
        if (excludeId != null) {
            queryWrapper.ne("id", excludeId);
        }
        
        return gatewayMapper.selectCount(queryWrapper) > 0;
    }
}