package com.macrosoft.master;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.sql.DataSource;

import org.springframework.jdbc.datasource.lookup.MapDataSourceLookup;
import com.jolbox.bonecp.BoneCPDataSource;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;


public class MultiTenantDataSourceLookup extends MapDataSourceLookup {

	private static final ILogger logger = LoggerFactory.Create(MultiTenantDataSourceLookup.class.getName());

  public MultiTenantDataSourceLookup(List<ClientDbConnection> clientConnections) {
    super();
    
    try {
      initializeDataSources(clientConnections);
      logger.info("MultiTenantDataSourceLookup initialized.");
    } catch (IOException ex) {
        logger.error("MultiTenantDataSourceLookup", ex);
    }
  }

  private void initializeDataSources(List<ClientDbConnection> clientConnections) throws IOException {

	  for (ClientDbConnection connection : clientConnections)
	  {
		  String tenantId = Long.toString(connection.getTenantId());
	      BoneCPDataSource customDataSource = createTenantDataSource(connection.getDbUrl(), connection.getDbUser(), connection.getDbPassword());
	      addDataSource(tenantId, customDataSource); // It replace if tenantId was already there.
	      logger.info("addDataSource for tenantId:" + tenantId);
	  }
	 }
 
  public void TryExtendDatasourceDynamicly(ClientDbConnection connection)
  {
	  String tenantId = Long.toString(connection.getTenantId());
	  DataSource datasource = this.getDataSource(tenantId);
	  if (datasource == null)
	  {
	      BoneCPDataSource customDataSource = createTenantDataSource(connection.getDbUrl(), connection.getDbUser(), connection.getDbPassword());
	      addDataSource(tenantId, customDataSource); // It replace if tenantId was already there.
	  }
  }

  private BoneCPDataSource createTenantDataSource(String dbUrl, String userName, String pwd)
  {
    BoneCPDataSource customDataSource = new BoneCPDataSource();
    //url, username and password must be unique per tenant so there is not default value
    customDataSource.setJdbcUrl(dbUrl); 
    customDataSource.setUsername(userName); 
    customDataSource.setPassword(pwd);
    //These has default values in defaultDataSource
    //customDataSource.setDriverClass(tenantProps.getProperty("database.driverClassName", defaultDataSource.getDriverClass()));
    customDataSource.setDriverClass("com.mysql.jdbc.Driver");

	customDataSource.setIdleConnectionTestPeriodInMinutes(1);
	customDataSource.setConnectionTestStatement("Select 1");
	customDataSource.setIdleMaxAgeInMinutes(20);
	customDataSource.setMaxConnectionAge(9, TimeUnit.MINUTES);
    customDataSource.setConnectionTimeoutInMs(100000);
    customDataSource.setLogStatementsEnabled(false);
    //customDataSource.setStatementCacheSize(10);
    
    customDataSource.setMaxConnectionsPerPartition(4);
    customDataSource.setMinConnectionsPerPartition(4);
    customDataSource.setPartitionCount(4);
/*
    customDataSource.setAcquireIncrement(Integer.valueOf(tenantProps.getProperty(
      "database.acquireIncrement", String.valueOf(defaultDataSource.getAcquireIncrement()))));
    customDataSource.setStatementsCacheSize(Integer.valueOf(tenantProps.getProperty(
      "database.statementsCacheSize",String.valueOf(defaultDataSource.getStatementCacheSize()))));
    customDataSource.setReleaseHelperThreads(Integer.valueOf(tenantProps.getProperty(
      "database.releaseHelperThreads", String.valueOf(defaultDataSource.getReleaseHelperThreads()))));customDataSource.setDriverClass(tenantProps.getProperty("database.driverClassName"));
*/
    return customDataSource;
  }
}