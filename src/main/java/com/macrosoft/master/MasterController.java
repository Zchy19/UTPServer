package com.macrosoft.master;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;

@Controller
public class MasterController {
	private static final ILogger logger = LoggerFactory.Create(MasterController.class.getName());
	private MasterService MasterService;
	
	@Autowired(required=true)
	public void setMasterService(MasterService masterService){
		this.MasterService = masterService;
	}


	@RequestMapping(value = "/api/master/allConnections", method = RequestMethod.GET)
	public @ResponseBody List<ClientDbConnection> getAllConnections() {

		logger.debug("getAllConnections start ...");
        try
        {
    		return this.MasterService.getClientDbConnections();
        }
		catch (Exception ex)
		{
			logger.error("getAllConnections", ex);
			return new ArrayList<ClientDbConnection>();
		}
        finally
        {
        	logger.debug("getAllConnections end ...");
        }
	}
	
	@RequestMapping(value = "/api/master/createOrg/{orgId}/{keepData}", method = RequestMethod.POST)
	public @ResponseBody boolean createOrg(@PathVariable("orgId") long orgId, @PathVariable("keepData") boolean keepData) {

		logger.info(String.format("createOrg %s start ... keepData: %s ", orgId, keepData));
        try
        {

    		this.MasterService.createOrg(orgId, keepData);;
    		return true;
        }
		catch (Exception ex)
		{
			logger.error("createOrg", ex);
			return false;
		}
        finally
        {
        	logger.info(String.format("createOrg %s end ...", Long.toString(orgId)));
        }
	}

	@RequestMapping(value = "/api/master/deleteOrg/{orgId}", method = RequestMethod.POST)
	public @ResponseBody boolean deleteOrg(@PathVariable("orgId") long orgId) {

		logger.info(String.format("deleteOrg %s start ...", orgId));
        try
        {

    		this.MasterService.deleteOrg(orgId);;
    		return true;
        }
		catch (Exception ex)
		{
			logger.error("deleteOrg", ex);
			return false;
		}
        finally
        {
        	logger.info(String.format("deleteOrg %s end ...", Long.toString(orgId)));
        }
	}
	

}

