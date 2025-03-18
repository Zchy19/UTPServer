package com.macrosoft.master;


import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

public interface MasterService {
	public void testNewDbCreation(long orgId);
	public boolean createOrg(long orgId, boolean keepData);
	public boolean deleteOrg(long orgId);
	public List<ClientDbConnection> getClientDbConnections();
	
	public ClientDbConnection getClientDbConnectionByOrgId(long orgId);

	public long resolveTenantId(long orgId);
	
	public Map<String, DataSource> getDataSourceHashMap();
	
}
