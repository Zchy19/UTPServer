package com.macrosoft.datasource;


import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import org.springframework.stereotype.Component;


@Component
public class CurrentTenantIdentifierResolverImpl implements CurrentTenantIdentifierResolver {

	private static final ILogger logger = LoggerFactory.Create(CurrentTenantIdentifierResolverImpl.class.getName());
	
    @Override
    public String resolveCurrentTenantIdentifier() {    	

        if (TenantContext.getTenantId() != null && !TenantContext.getTenantId().isEmpty())
        {
        	logger.info("resolveCurrentTenantIdentifier tenantId :" + TenantContext.getTenantId());
        	return TenantContext.getTenantId();
        }
        
        logger.info("resolveCurrentTenantIdentifier use default tenantId :" + TenantContext.DefaultTenantId);
        return TenantContext.DefaultTenantId;
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
