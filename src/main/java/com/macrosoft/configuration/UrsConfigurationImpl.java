package com.macrosoft.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component("ursConfig")
public class UrsConfigurationImpl {

	private  String mipAddress;

	public String getIpAddress() {
		return mipAddress;
	}

	@Value("${app.ipAddress}")
	public void setIpAddress(String ipAddress) {
		mipAddress = ipAddress;
	}

}
