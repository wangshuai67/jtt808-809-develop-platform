package org.ssssssss.jtt808client.web.vo;

import java.util.ArrayList;
import java.util.List;

/**
 * 分页
 * @author 冰点
 * @param <T>
 */
public class PageVO<T> {
    private int pageIndex;
    private int pageSize;
    public long pageCount;
    public long recordCount;

    private List<T> list = new ArrayList<T>();

    public PageVO(int pageIndex, int pageSize) {
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
    }

    public int getPageIndex() {
        return pageIndex;
    }

    public void setPageIndex(int pageIndex) {
        this.pageIndex = Math.max(1, pageIndex);
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getPageCount() {
        return pageCount;
    }

    public void setPageCount(long pageCount) {
        this.pageCount = pageCount;
    }

    public long getRecordCount() {
        return recordCount;
    }

    public void setRecordCount(long recordCount) {
        this.pageCount = (int) Math.ceil((float) recordCount / pageSize);
        this.recordCount = recordCount;
    }

    public List<T> getList() {
        return list;
    }

    public void setList(List list) {
        this.list = list;
    }
}


