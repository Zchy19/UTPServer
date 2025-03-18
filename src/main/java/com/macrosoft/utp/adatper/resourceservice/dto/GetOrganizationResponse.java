package com.macrosoft.utp.adatper.resourceservice.dto;

public class GetOrganizationResponse {
	public String updated;
	public String[] organizationList;

	public String[] getOrganizationList() {
		return organizationList;
	}

	public void setOrganizationList(String[] organizationList) {
		this.organizationList = organizationList;
	}

	public String getUpdated() {
		return updated;
	}

	public void setUpdated(String updated) {
		this.updated = updated;
	}

}
