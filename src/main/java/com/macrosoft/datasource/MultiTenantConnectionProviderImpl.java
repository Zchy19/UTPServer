package com.macrosoft.datasource;



import org.hibernate.engine.jdbc.connections.spi.AbstractDataSourceBasedMultiTenantConnectionProviderImpl;
import javax.sql.DataSource;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.MasterService;
import com.macrosoft.master.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class MultiTenantConnectionProviderImpl extends AbstractDataSourceBasedMultiTenantConnectionProviderImpl {

	private static final ILogger logger = LoggerFactory.Create(MultiTenantConnectionProviderImpl.class.getName());

	private MasterService masterService;

	@Autowired
	public void setMasterService(MasterService masterService) {
		this.masterService = masterService;
	}

	@Override
    protected DataSource selectAnyDataSource() {
		logger.info("selectAnyDataSource tenantId :" + TenantContext.DefaultTenantId);
        return this.masterService.getDataSourceHashMap().get(TenantContext.DefaultTenantId);
    }

    @Override
    protected DataSource selectDataSource(String tenantIdentifier) {
    	logger.info("selectDataSource tenantId :" + tenantIdentifier);
        return this.masterService.getDataSourceHashMap().get(tenantIdentifier);
    }

}
