package org.ssssssss.jtt809.common.config;

import org.ssssssss.jtt809.common.util.PropertiesUtil;

public class EncryptConfig {
  
    private int encryptFlag;
    private int m1;
    private int ia1;
    private int ic1;

    private EncryptConfig() {
        encryptFlag = PropertiesUtil.getInteger("message.encrypt.enable", 0);
        m1 = PropertiesUtil.getInteger("superior.server.m1", 0);
        ia1 = PropertiesUtil.getInteger("superior.server.ia1", 0);
        ic1 = PropertiesUtil.getInteger("superior.server.ic1", 0);
    }
    
    private static class EncryptConfigHolder {
        private static EncryptConfig instance = new EncryptConfig();
    }

    public static EncryptConfig getInstance() {
      return EncryptConfigHolder.instance;
    }

    public int getM1() {
        return m1;
    }

    public int getIa1() {
        return ia1;
    }

    public int getIc1() {
        return ic1;
    }

    public int getEncryptFlag() {
        return encryptFlag;
    }
    
    public void update(int encryptFlag, long m1, long ia1, long ic1) {
        this.encryptFlag = (int)Math.max(0, encryptFlag);
        this.m1 = (int)m1;
        this.ia1 = (int)ia1;
        this.ic1 = (int)ic1;
    }
    
    

}
