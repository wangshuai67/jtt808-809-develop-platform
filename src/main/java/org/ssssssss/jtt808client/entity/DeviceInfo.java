package org.ssssssss.jtt808client.entity;

import org.ssssssss.jtt808client.jtt808.util.DeviceAttributesetUtils;

import java.io.Serializable;
import java.util.Map;


public class DeviceInfo implements Serializable {
    /** 车辆标识，这里就是车牌号 */
    private String vehicleNumber;
    
    /** 省域ID"个字"*/
    private int provinceId;
    
    /** 市县域ID"个字"*/
    private int cityId;
    
    /** 制造商ID，最"个字"*/
    private String manufacturerId;
    
    /** 终端型号，最"0个字"*/
    private String deviceModel;
    
    /** 车牌颜色"个字"*/
    private int plateColor;

    /** 终端属性集"*/
    public Map<Integer, byte[]> attributeset;

    /**
     * 根据属性名称获取属性"
     * @param name 属性名"
     * @return 属性值字节数"
     */
    public byte[] getAttribute(String name) {
        return getAttribute(DeviceAttributesetUtils.getAttributeId(name));
    }

    /**
     * 根据属性ID获取属性"
     * @param attrId 属性ID
     * @return 属性值字节数"
     */
    public byte[] getAttribute(int attrId) {
        if (attrId == -1) return null;
        return null;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public DeviceInfo withVehicleNumber(String vehicleNumber) {
        setVehicleNumber(vehicleNumber);
        return this;
    }

    public int getProvinceId() {
        return provinceId;
    }

    public void setProvinceId(int provinceId) {
        this.provinceId = provinceId;
    }

    public DeviceInfo withProvinceId(int provinceId) {
        setProvinceId(provinceId);
        return this;
    }

    public int getCityId() {
        return cityId;
    }

    public void setCityId(int cityId) {
        this.cityId = cityId;
    }

    public DeviceInfo withCityId(int cityId) {
        setCityId(cityId);
        return this;
    }

    public String getManufacturerId() {
        return manufacturerId;
    }

    public void setManufacturerId(String manufacturerId) {
        this.manufacturerId = manufacturerId;
    }

    public DeviceInfo withManufacturerId(String manufacturerId) {
        setManufacturerId(manufacturerId);
        return this;
    }

    public String getDeviceModel() {
        return deviceModel;
    }

    public void setDeviceModel(String deviceModel) {
        this.deviceModel = deviceModel;
    }

    public DeviceInfo withDeviceModel(String deviceModel) {
        setDeviceModel(deviceModel);
        return this;
    }

    public int getPlateColor() {
        return plateColor;
    }

    public void setPlateColor(int plateColor) {
        this.plateColor = plateColor;
    }

    public DeviceInfo withPlateColor(int color) {
        setPlateColor(color);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DeviceInfo)) return false;

        DeviceInfo that = (DeviceInfo) o;

        if (getProvinceId() != that.getProvinceId()) return false;
        if (getCityId() != that.getCityId()) return false;
        if (getPlateColor() != that.getPlateColor()) return false;
        if (getVehicleNumber() != null ? !getVehicleNumber().equals(that.getVehicleNumber()) : that.getVehicleNumber() != null)
            return false;
        if (getManufacturerId() != null ? !getManufacturerId().equals(that.getManufacturerId()) : that.getManufacturerId() != null)
            return false;
        return getDeviceModel() != null ? getDeviceModel().equals(that.getDeviceModel()) : that.getDeviceModel() == null;
    }

    @Override
    public int hashCode() {
        int result = getVehicleNumber() != null ? getVehicleNumber().hashCode() : 0;
        result = 31 * result + getProvinceId();
        result = 31 * result + getCityId();
        result = 31 * result + (getManufacturerId() != null ? getManufacturerId().hashCode() : 0);
        result = 31 * result + (getDeviceModel() != null ? getDeviceModel().hashCode() : 0);
        result = 31 * result + getPlateColor();
        return result;
    }

    @Override
    public String toString() {
        return "DeviceInfo{" +
                "vehicleNumber='" + vehicleNumber + '\'' +
                ", provinceId=" + provinceId +
                ", cityId=" + cityId +
                ", manufacturerId='" + manufacturerId + '\'' +
                ", deviceModel='" + deviceModel + '\'' +
                ", plateColor=" + plateColor +
                '}';
    }
}


