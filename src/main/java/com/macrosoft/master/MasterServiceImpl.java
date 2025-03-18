package com.macrosoft.master;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;


import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utilities.HarmonizedConfig;
import com.macrosoft.utilities.HarmonizedUtil;
import com.macrosoft.utilities.MasterDbUtil;

@Repository
public class MasterServiceImpl implements MasterService {
	private static final ILogger logger = LoggerFactory.Create(MasterServiceImpl.class.getName());

	private SessionFactory masterSessionFactory;

	private List<ClientDbConnection> cachedConnections;
	private MultiTenantDataSourceLookup multiTenantDataSourceLookup;

	@Autowired
	@Qualifier(value="masterSessionFactory")
	public void setMasterSessionFactory(SessionFactory masterSessionFactory){
		this.masterSessionFactory = masterSessionFactory; 
    	
		MasterServiceHolder.setMasterService(this);
		
		logger.info("MasterServiceImpl is created.");
	}

	@Override
	public void testNewDbCreation(long orgId) {
    	Session session = masterSessionFactory.openSession();

		// 2. create empty database for new organization
		SQLQuery sqlQuery = session.createSQLQuery("CALL sp_CreateNewDatabase(:p_OrgId)");
		sqlQuery.setParameter("p_OrgId", orgId);
		sqlQuery.executeUpdate();
		
    	RestoreTemplateToNewDatabase(orgId);
	}
	
	@Override
	public synchronized  boolean createOrg(long orgId, boolean keepData) {

		if (this.getClientDbConnectionByOrgId(orgId) != null)
		{
			// this org has been created already.
			return true;
		}
		
    	Session session = masterSessionFactory.openSession();

        try {
        	
	    	// 1. add connection information into master database
	    	boolean result = addDbConnection(session, orgId);
	    	if (!result) return false;
	    	
	
	    	// 2. reload cache connections
	    	UpdateCacheConnections(getClientDbConnections());
	    	
	    	// 3. restore template database to new database
	    	RestoreTemplateToNewDatabase(orgId);
	   
        	// 4. migrate 
	    	if (keepData)
	    	{
	    		// migrate data from default database to new database
	    		 result = migrateDataForSpecificTenant(session, orgId);
		    	 if (!result) return false;
	    	}
        	
    		return true;
        } catch (Exception ex) {
        	logger.error("createOrg", ex);
    		return false;
        }
        finally 
        {
        	session.close();
        }
	}
	
	private boolean addDbConnection(Session session, long orgId)
	{
    	Transaction tx = session.beginTransaction();
        try {
        	// 1. add connection information into master database
        	ClientDbConnection dbConnection = new ClientDbConnection();
        	dbConnection.setTenantId(orgId);
        	dbConnection.setTenantName(String.format("utp_client_%s", orgId));
        	dbConnection.setDbUrl(String.format(MasterDbUtil.getInstance().getUrl(), orgId));
        	dbConnection.setDbUser(MasterDbUtil.getInstance().getUsername());
        	dbConnection.setDbPassword(MasterDbUtil.getInstance().getPassword());
        	dbConnection.setState(1);
    		session.saveOrUpdate(dbConnection);
        	
    		// 2. create empty database for new organization
    		SQLQuery sqlQuery = session.createSQLQuery("CALL sp_CreateNewDatabase(:p_OrgId)");
    		sqlQuery.setParameter("p_OrgId", orgId);
    		sqlQuery.executeUpdate();

        	tx.commit();
 
    		logger.info("ClientDbConnection saved successfully, connection Details="+ dbConnection);
    		return true;
        } catch (Exception ex) {
        	tx.rollback();
        	logger.error("addClientDbConnection", ex);
    		return false;
        }
	}

	private boolean migrateDataForSpecificTenant(Session session, long orgId)
	{
    	Transaction tx = session.beginTransaction();
        try {
    		SQLQuery sqlQuery = session.createSQLQuery("CALL sp_MigrateDataForSpecificTenant(:p_orgId)");
    		sqlQuery.setParameter("p_orgId", orgId);
    		sqlQuery.executeUpdate();

        	tx.commit();
 
    		logger.info("migrateDataForSpecificTenant  successfully.");
    		return true;
        } catch (Exception ex) {
        	tx.rollback();
        	logger.error("migrateDataForSpecificTenant", ex);
    		return false;
        }
	}
	
	private void RestoreTemplateToNewDatabase(long orgId)
	{
	 	try
    	{
	 		HarmonizedConfig harmanizedConfig = HarmonizedUtil.getInstance().config;
	 		
	 		String restoreCommand = "";
	 		int processComplete = -1;
	 		Process process;
	 		if (HarmonizedUtil.isWindows()) {
	        	String restoreCommandFormat = "cmd /c \"%s\"  -u%s -p%s  --default-character-set=utf8  utp_client_%s  <  %s ";
	        	
	        	restoreCommand = String.format(restoreCommandFormat, harmanizedConfig.getMysqlExePath(), harmanizedConfig.getDbUserName(), harmanizedConfig.getDbPassword(), orgId, harmanizedConfig.getRestoreTemplatePath());
	        	//restoreCommand = "cmd /c \"C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\mysql.exe\"  -uroot -proot --default-character-set=utf8 utp_client_106 < D:\\utp3_template.sql";
	 		

		 		logger.info(String.format("restoreCommand: %s", restoreCommand));
		 		
		 		Runtime rt = Runtime.getRuntime();  
		 		process = rt.exec(restoreCommand);
		 		processComplete = process.waitFor();
	 		}
	 		else {

	 			try {
	 				List<String> cmd = new ArrayList<String>();	       
	 				ProcessBuilder pb = new ProcessBuilder();

	 			    cmd.add("/bin/sh");
	 			    cmd.add("-c");
		 			String restoreCommandFormat = "mysql -u%s -p%s --default-character-set=utf8  -Dutp_client_%s  <  %s ";
		        	restoreCommand = String.format(restoreCommandFormat, harmanizedConfig.getDbUserName(), harmanizedConfig.getDbPassword(), orgId, harmanizedConfig.getRestoreTemplatePath());
		        	cmd.add(restoreCommand);
 					logger.info(restoreCommand);
	 				pb.directory(new File("/usr/bin"));
	 				pb.command(cmd);
	 				pb.redirectErrorStream(true);
	 				 
	 				process = pb.start();
	 				processComplete = process.waitFor();
	 				String line;
	 				final BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
	 				StringBuilder processResult = new StringBuilder();
	 				while ((line = reader.readLine()) != null)
	 					processResult.append(line);
	 				
	 					logger.info(processResult.toString());
	 				}
	 				catch (Exception ex) {
	 					logger.error(ex.toString());
	 				}
	 			}

	 		if (processComplete == 0) {
	 			logger.info(String.format("RestoreTemplate To New database success, tenantId: %s", orgId));
	 		}
	 		else
	 		{
	 			logger.info(String.format("RestoreTemplate To New database failed, tenantId: %s", orgId));
	 		}
    	}
    	catch (Exception ex)
    	{
			logger.error("RestoreTemplateToNewDatabase", ex);
    	}
	}

	@Override
	public synchronized  boolean deleteOrg(long orgId) {

    	Session session = masterSessionFactory.openSession();
    	Transaction tx = session.beginTransaction();
        try {
    		StringBuilder sqlBuilder = new StringBuilder();  
    		sqlBuilder.append(" update ClientDbConnection set state = 0 where tenantId=:tenantId  ");
    		
    		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
    		query.setParameter("tenantId", orgId);
    		query.executeUpdate();
        	tx.commit();

        	UpdateCacheConnections(getClientDbConnections());
    		logger.info("dropOrg successfully, orgId ="+ orgId);
    		return true;
        } catch (Exception ex) {
        	tx.rollback();
        	logger.error("deleteOrg", ex);
    		return false;
        }
        finally 
        {
        	session.close();
        }
	}

	private void UpdateCacheConnections(List<ClientDbConnection> updatingConnections)
	{
		cachedConnections = new ArrayList<ClientDbConnection>();
		cachedConnections.addAll(updatingConnections);
	}
	
	public long resolveTenantId(long orgId)
	{
		logger.info("resolveTenantId enter, orgId:" + orgId);
		List<ClientDbConnection> validConnections = getClientDbConnections();

		boolean foundSpecificConnection = false;
		for (ClientDbConnection connection : validConnections)
		{
			// LoggerFacade.info("connection tenantId is :" + connection.getTenantId() + " and orgId is:" + orgId);
			
			if (connection.getTenantId() == orgId)
			{
				logger.info("found tenantId same as orgId :"  + orgId);
				foundSpecificConnection = true;
			}
		}
		
		if (foundSpecificConnection) return orgId;
		
		return Long.parseLong(TenantContext.DefaultTenantId);
	}
	
	@Override
	public List<ClientDbConnection> getClientDbConnections() {
		
		if (cachedConnections != null)
		{
			return cachedConnections;
		}
		
    	Session session = masterSessionFactory.openSession();
    	Transaction tx = session.beginTransaction();
        try {
    		List<ClientDbConnection> clientDbConnections = session.createQuery("from ClientDbConnection where state = 1").list();
    		tx.commit();
    		if (clientDbConnections.isEmpty())
    		{
    			return new ArrayList<ClientDbConnection>();
    		}
    		
    		UpdateCacheConnections(clientDbConnections);
    		
    		return clientDbConnections;
        } catch (Exception ex) {
        	tx.rollback();
        	logger.error("getClientDbConnections", ex);
    		return null;
        }
        finally 
        {
        	session.close();
        }
	}
	
	@Override
	public ClientDbConnection getClientDbConnectionByOrgId(long orgId) {
		
    	Session session = masterSessionFactory.openSession();
    	Transaction tx = session.beginTransaction();
        try {
        	
    		List<ClientDbConnection> clientDbConnections = session.createQuery("from ClientDbConnection where tenantId = :tenantId").setParameter("tenantId", orgId).list();
    		tx.commit();
    		if (clientDbConnections.isEmpty())
    		{
    			return null;
    		}
    		
    		return clientDbConnections.get(0);
        } catch (Exception ex) {
        	tx.rollback();
        	logger.error("getClientDbConnectionByOrgId", ex);
    		return null;
        }
        finally 
        {
        	session.close();
        }
	}
	
	@Override
	public synchronized Map<String, DataSource> getDataSourceHashMap() {

		logger.info("getDataSourceHashMap called.");

		List<ClientDbConnection> clientDbConnections = getClientDbConnections();

		
        if (multiTenantDataSourceLookup == null)
        {
        	multiTenantDataSourceLookup = new MultiTenantDataSourceLookup(clientDbConnections);

        	logger.info("multiTenantDataSourceLookup is created.");
        }
        
        for (ClientDbConnection dbConnection : clientDbConnections)
        {
        	multiTenantDataSourceLookup.TryExtendDatasourceDynamicly(dbConnection);
        }
        
        return multiTenantDataSourceLookup.getDataSources();
		
	}
}
