package org.ssssssss.jtt808client.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.ssssssss.jtt808client.web.entity.JT809Gateway;
import org.ssssssss.jtt808client.web.mapper.JT809GatewayMapper;
import org.ssssssss.jtt808client.web.vo.PageVO;

import java.util.Date;
import java.util.List;

@Service
public class JT809GatewayService {
    @Autowired
    private JT809GatewayMapper mapper;

    public int create(JT809Gateway gateway) {
        gateway.setCreateTime(new Date());
        gateway.setUpdateTime(new Date());
        if (gateway.getStatus() == null) gateway.setStatus(1);
        return mapper.insert(gateway);
    }

    public int update(JT809Gateway gateway) {
        gateway.setUpdateTime(new Date());
        return mapper.updateById(gateway);
    }

    public int removeById(Long id) {
        return mapper.deleteById(id);
    }

    public JT809Gateway getById(Long id) {
        return mapper.selectById(id);
    }

    public List<JT809Gateway> list() {
        QueryWrapper<JT809Gateway> q = new QueryWrapper<>();
        q.orderByDesc("create_time");
        return mapper.selectList(q);
    }

    public List<JT809Gateway> listEnabled() {
        QueryWrapper<JT809Gateway> q = new QueryWrapper<>();
        q.eq("status", 1);
        return mapper.selectList(q);
    }

    public PageVO<JT809Gateway> find(String name, int pageIndex, int pageSize) {
        QueryWrapper<JT809Gateway> q = new QueryWrapper<>();
        if (StringUtils.hasText(name)) q.like("name", name);
        q.orderByDesc("create_time");
        Page<JT809Gateway> page = new Page<>(pageIndex, pageSize);
        IPage<JT809Gateway> result = mapper.selectPage(page, q);
        PageVO<JT809Gateway> p = new PageVO<>(pageIndex, pageSize);
        p.setList(result.getRecords());
        p.setRecordCount((int) result.getTotal());
        return p;
    }

    public int updateStatus(Long id, Integer status) {
        JT809Gateway g = new JT809Gateway();
        g.setId(id);
        g.setStatus(status);
        g.setUpdateTime(new Date());
        return mapper.updateById(g);
    }

    public boolean existsByName(String name, Long excludeId) {
        QueryWrapper<JT809Gateway> q = new QueryWrapper<>();
        q.eq("name", name);
        if (excludeId != null) q.ne("id", excludeId);
        return mapper.selectCount(q) > 0;
    }

    public boolean existsByAddrs(String pAddr, Integer pPort, String sAddr, Integer sPort, Long excludeId) {
        QueryWrapper<JT809Gateway> q = new QueryWrapper<>();
        q.eq("ip", pAddr);
        q.eq("port", pPort);
        if (excludeId != null) q.ne("id", excludeId);
        return mapper.selectCount(q) > 0;
    }
}