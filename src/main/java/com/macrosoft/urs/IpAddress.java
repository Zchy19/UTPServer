package com.macrosoft.urs;

public class IpAddress {

	public String ipAddress;
	public Long port;
	public String engineName;

	public IpAddress() {
	}

	public IpAddress(String ipAddress, Long port, String engineName) {
		this.ipAddress = ipAddress;
		this.port = port;
		this.engineName = engineName;
	}

	public String getIpAddress() {
		return ipAddress;
	}

	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}

	public Long getPort() {
		return port;
	}

	public void setPort(Long port) {
		this.port = port;
	}

	public String getEngineName() {
		return engineName;
	}

	public void setEngineName(String engineName) {
		this.engineName = engineName;
	}
}
