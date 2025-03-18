package com.macrosoft.intercepter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.macrosoft.master.MasterServiceHolder;
import com.macrosoft.master.TenantContext;
import com.macrosoft.utilities.ParserResult;
import com.macrosoft.utilities.StringUtility;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;

@Component
public class ValidateTenantInterceptor implements HandlerInterceptor {

	private static final ILogger logger = LoggerFactory.Create(ValidateTenantInterceptor.class.getName());

	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		
		logger.info("ValidateTenantInterceptor.preHandle ...");
		
    	TenantContext.setTenantId(TenantContext.DefaultTenantId);
		
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
	    
        // validate uri for specific key words:
        String currentPath = attr.getRequest().getRequestURI();
        boolean needValidate = currentPath.contains("/api/") || currentPath.contains("/rest/");
        if (!needValidate)
        {
        	return true;
        }
        
        if (attr != null && attr.getRequest().getHeader("tenantId") != null)
        {
        	String orgId = attr.getRequest().getHeader("tenantId");
        	ParserResult<Long> paserResult = StringUtility.parseLongSafely(orgId);
        	
        	if (paserResult.isParserSuccess())
        	{
        		long tenantId = MasterServiceHolder.getMasterService().resolveTenantId(Long.parseLong(orgId));
        		
            	TenantContext.setTenantId(Long.toString(tenantId));

            	TenantContext.setOrgId(orgId);
            	
        		String userId = attr.getRequest().getHeader("userId");

        		if (userId == null) userId = "";
            	
            	TenantContext.setUserId(userId);

            	logger.info(String.format("HttpRequest - orgId : %s, resolved tenantId : %s, userId: ", orgId, TenantContext.getTenantId(), userId));
            	return true;
        	}
        }
        response.getWriter().append("Validate tenantId from header failed.");
        response.getWriter().flush();
        response.sendError(900);
		
		return false;
	}

	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		// TODO Auto-generated method stub
		
	}
}
