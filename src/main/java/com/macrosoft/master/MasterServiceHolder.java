package com.macrosoft.master;


public class MasterServiceHolder
{
	private static MasterService masterService;

	public static MasterService getMasterService() {
		return masterService;
	}

	public static void setMasterService(MasterService masterService) {
		MasterServiceHolder.masterService = masterService;
	}
}
