package com.macrosoft.service.impl;

import java.util.HashMap;
import java.util.List;

import com.macrosoft.model.TestCaseRequirementMapping;
import com.macrosoft.service.RequirementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.dao.RequirementDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.Project;
import com.macrosoft.model.Requirement;
import com.macrosoft.model.composition.RequirementScriptTraceInfo;
import com.macrosoft.model.composition.ScriptInfo;

@Service
public class RequirementServiceImpl implements RequirementService {

	private static final ILogger logger = LoggerFactory.Create(RequirementServiceImpl.class.getName());
	private RequirementDAO RequirementDAO;
	private ProjectDAO projectDAO;
	@Autowired
	public void setRequirementDAO(RequirementDAO RequirementDAO) {
		this.RequirementDAO = RequirementDAO;
	}
	@Autowired
	public void setProjectDAO(ProjectDAO projectDAO) {
		this.projectDAO = projectDAO;
	}
	
	@Override
	@Transactional
	public Requirement addRequirement(long projectId, Requirement requirement) {
		requirement.setId(0);
		
		if(requirement.getParentId() != 0){
			Requirement parent = this.RequirementDAO.getRequirementById(projectId, requirement.getParentId());
			if (parent == null)
			{
				return requirement;
			}
		}
		
		// get next requirementId from project entity.
		Project project = projectDAO.getProjectById(projectId);
		long newRequirementId = project.getNextRequirementId() + 1;
		
		project.setNextRequirementId(newRequirementId);
		projectDAO.updateProject(project);
		
		requirement.setId(newRequirementId);
		//如果customizedId为空，则使用newRequirementId作为customizedId
		if(requirement.getType().equals("requirement")){
			if(requirement.getCustomizedId() == null || requirement.getCustomizedId().isEmpty()||requirement.getCustomizedId()==""){
				requirement.setCustomizedId("REQ_"+String.valueOf(newRequirementId));
			}
		}
		if (requirement.getType().equals("requirementgroup")){
			if(requirement.getCustomizedId() == null || requirement.getCustomizedId().isEmpty()||requirement.getCustomizedId()==""){
				requirement.setCustomizedId("TESTCASE_"+String.valueOf(newRequirementId));
			}
		}
		requirement.setProjectId(projectId);
		
		return this.RequirementDAO.addRequirement(projectId, requirement);
	}

	@Override
	@Transactional
	public void updateRequirement(long projectId, Requirement requirement) {
		this.RequirementDAO.updateRequirement(projectId, requirement);
	}

	@Override
	@Transactional
	public void removeRequirement(long projectId, long id) {
		this.RequirementDAO.removeRequirement(projectId, id);
	}
	

	@Override
	@Transactional
	public void removeRequirement(long projectId, long id, boolean forceDeleteMapping) {
		this.RequirementDAO.removeRequirement(projectId, id);
		this.RequirementDAO.removeScriptRequirementMappingByScriptId(projectId, id);
	}

	@Override
	@Transactional
	public List<Requirement> getRequirementByProjectId(long projectId) {
		return this.RequirementDAO.getRequirementByProjectId(projectId);
		
	}


	@Override
	@Transactional
	public void calculateCoverage(long projectId)
	{
		List<Requirement> requirements = this.getRequirementByProjectId(projectId);
		List<TestCaseRequirementMapping> mappings = this.getRequirementMappingByProjectId(projectId);
		
		
		HashMap<Long, Requirement> reqs = new HashMap<Long, Requirement>();
		for (Requirement req : requirements)
		{
			reqs.put(req.getId(), req);
		}
		
		for (Requirement req : requirements)
		{
			if (!req.getLeaf()) continue;
			
			req.setTotalCount(1);
			
			boolean hasReference = !this.findReferenceOfScriptByRequirementId(projectId, req.getId()).isEmpty();
			
			long parentReqId = req.getParentId();
			while (parentReqId > 0)
			{
				if (!reqs.containsKey(parentReqId)) break;
				
				Requirement parentRequirement = reqs.get(parentReqId);
				parentRequirement.setTotalCount(parentRequirement.getTotalCount() + 1);		
				if (hasReference)
				{
					parentRequirement.setReferenceCount(parentRequirement.getReferenceCount() + 1);		
					req.setReferenceCount(1);
				}
				
				parentReqId = parentRequirement.getParentId();
			}
		}

		for (Requirement req : requirements)
		{
			if (req.getReferenceCount() == 0) continue;
			
			req.setCoveragePercentage(req.getReferenceCount() * 1.0000f /req.getTotalCount());
			
			this.RequirementDAO.updateCoveragePercentage(projectId, req);
		}
		
	}

	@Override
	@Transactional
	public List<Requirement> getRequirementByParentId(long projectId, long parentId)
	{
		return this.RequirementDAO.getRequirementByParentId(projectId, parentId);
	}
	
	@Override
	@Transactional
	public List<Requirement> getRequirementsByRequirementIds(long projectId, String requirementIds)
	{
		return this.RequirementDAO.getRequirementsByRequirementIds(projectId, requirementIds);
	}
	
	@Override
	@Transactional
	public Requirement getRequirementById(long projectId, long id) {
		return this.RequirementDAO.getRequirementById(projectId, id);
	}

	@Override
	@Transactional
	public List<ScriptInfo> findReferenceOfScriptByRequirementId(long projectId, long requirementId) {
		return this.RequirementDAO.findReferenceOfScriptByRequirementId(projectId, requirementId);
	}

	@Override
	@Transactional
	public List<Requirement> findReferenceOfRequirementByScriptId(long projectId, long scriptId) {
		return this.RequirementDAO.findReferenceOfRequirementByScriptId(projectId, scriptId);
	}

	@Override
	@Transactional
	public void addScriptRequirementMapping(long projectId, long scriptId, long requirementId)
	{
		this.RequirementDAO.addScriptRequirementMapping(projectId, scriptId, requirementId);
	}
	
	@Override
	@Transactional
	public void removeScriptRequirementMapping(long projectId, long requirementId)
	{
		this.RequirementDAO.removeScriptRequirementMappingByScriptId(projectId, requirementId);
	}
	
	@Override
	@Transactional
	public void updateScriptRequirementMapping(long projectId, long scriptId, String requirementIdsWithCommaSeperator)
	{
		this.RequirementDAO.removeScriptRequirementMappingByScriptId(projectId, scriptId);
		
		String[] requirementIds = requirementIdsWithCommaSeperator.split(",");
		
		for (String requirementId : requirementIds)
		{
			if (requirementId == null || requirementId.isEmpty())
				continue;
			
			this.RequirementDAO.addScriptRequirementMapping(projectId, scriptId, Long.parseLong(requirementId));
		}
	}

	@Override
	@Transactional
	public List<TestCaseRequirementMapping> getRequirementMappingByProjectId(long projectId)
	{
		return this.RequirementDAO.getRequirementMappingByProjectId(projectId);
	}

	@Override
	@Transactional
	public List<RequirementScriptTraceInfo> listRequirementScriptTraceInfo(long projectId)
	{
		return this.RequirementDAO.listRequirementScriptTraceInfo(projectId);
	}

	@Override
	@Transactional
	public void addRequirements(List<Requirement> requirements) {
		
		HashMap<Long, Long> tempParentIdCache = new HashMap<Long, Long>();

		// sort requirement by parentId
		//requirements.sort(Comparator.comparing(Requirement::getParentId));
		
		for(Requirement requirement : requirements){

			long projectId = requirement.getProjectId();
			Project project = projectDAO.getProjectById(projectId);
			long newRequirementId = project.getNextRequirementId() + 1;
			
			project.setNextRequirementId(newRequirementId);
			
			projectDAO.updateProject(project);

			logger.info("requirement, id:" + requirement.getId() + " newRequirementId:" + newRequirementId + "title:" + requirement.getTitle());	

			
			updateRequirementIdCache(tempParentIdCache,requirement.getId(), newRequirementId);
		}
		
		for(Requirement requirement : requirements){

			long newRequirementId = resolveNewRequirementId(tempParentIdCache, requirement.getId());
			long newParentRequirementId = resolveNewRequirementId(tempParentIdCache, requirement.getParentId());
			
			requirement.setId(newRequirementId);	
			requirement.setParentId(newParentRequirementId);
			
			this.RequirementDAO.addRequirement(requirement.getProjectId(), requirement);
		}
	}
	

	private void updateRequirementIdCache(HashMap<Long, Long> tempRequirementIdCache, long oriRequirementId, long newRequirementId)
	{
		if (tempRequirementIdCache.containsKey(oriRequirementId)) return;
		
		tempRequirementIdCache.put(oriRequirementId,newRequirementId);
	}

	private long resolveNewRequirementId(HashMap<Long, Long> tempRequirementIdCache, long oriRequirementId)
	{
		if (tempRequirementIdCache.containsKey(oriRequirementId))
		{
			return tempRequirementIdCache.get(oriRequirementId);
		}
		
		return 0;
	}
}
