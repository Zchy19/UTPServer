package com.macrosoft.dao.impl;

import com.macrosoft.dao.ScriptDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptContentParser;
import com.macrosoft.model.ScriptType;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.utilities.StringUtility;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class ScriptDAOImpl implements ScriptDAO {

	private static final ILogger logger = LoggerFactory.Create(ScriptDAOImpl.class.getName());

	private SessionFactory sessionFactory;

	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public Script addScript(long projectId, Script script) {
		Session session = this.sessionFactory.getCurrentSession();
		script.setProjectId(projectId);
		session.saveOrUpdate(script);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addScript",
				String.format("projectId:%s, id: %s", projectId, script.getId()));

		return script;
	}

	@Override
	public void updateScript(long projectId, Script script) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(script);

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateScript",
				String.format("projectId:%s, id: %s", projectId, script.getId()));
	}

	@Override
	public void transitToSubscript(long projectId, long scriptId) throws DocumentException {
		Script script = this.getScriptById(projectId, scriptId);
		if (script.getType().equalsIgnoreCase(ScriptType.SubScriptType))
			return;

		String scriptContent = script.getScript();
		if (scriptContent != null) {
			scriptContent = StringUtility.replaceFirst(scriptContent, ScriptContentParser.TESTCASE_BEGIN, "");
			scriptContent = StringUtility.replaceLast(scriptContent, ScriptContentParser.TESTCASE_END, "");
			script.setScript(scriptContent);
		}

		String scriptXml = script.getBlockyXml();
		if (scriptXml != null) {
			Document dom;
			dom = DocumentHelper.parseText(scriptXml);
			Element root = dom.getRootElement();
			Element targetBlock = DocumentHelper.createElement("block");
			targetBlock.addAttribute("type", "procedures_defscript");
			targetBlock.addAttribute("deletable", "false");
			targetBlock.addAttribute("movable", "false");
			Element scriptName = DocumentHelper.createElement("field");
			scriptName.addAttribute("name", "SCRIPTNAME");
			scriptName.setText(script.getName());

			targetBlock.add(scriptName);
			Element params = DocumentHelper.createElement("field");
			params.addAttribute("name", "PARAMS");
			targetBlock.add(params);

			Element statement = DocumentHelper.createElement("statement");
			statement.addAttribute("name", "STACK");
			targetBlock.add(statement);

			Element firstBlock = root.element("block");
			if(firstBlock != null){
				root.remove(firstBlock);
				statement.add(firstBlock);
			}
			root.add(targetBlock);
			scriptXml = dom.asXML();
			script.setBlockyXml(scriptXml);
		}
		script.setType(ScriptType.SubScriptType);
		this.updateScript(projectId, script);
	}

	@Override
	public void transitToScript(long projectId, long subScriptId) throws DocumentException {
		Script script = this.getScriptById(projectId, subScriptId);

		if (script.getType().equalsIgnoreCase(ScriptType.TestCaseType))
			return;

		String scriptContent = script.getScript();
		if (scriptContent != null) {
			//根据"óò"对scriptContent进行切割
			String[] scriptContentArray = scriptContent.split("óò");
			//数组第一个元素替换为" ScriptContentParser.TESTCASE_BEGIN"
			scriptContentArray[0] = ScriptContentParser.TESTCASE_BEGIN;
			//数组最后一个元素替换为" ScriptContentParser.TESTCASE_END"
			scriptContentArray[scriptContentArray.length-1] = ScriptContentParser.TESTCASE_END;
			//将数组拼接为字符串,连接符使用"óò"
			scriptContent = String.join("óò", scriptContentArray);
			script.setScript(scriptContent);
		}
		String scriptXml = script.getBlockyXml();
		if (scriptXml != null) {
			Document dom;
			dom = DocumentHelper.parseText(scriptXml);
			Element root = dom.getRootElement();
			Element firstBlock = root.element("block");
			Element statement = firstBlock.element("statement");
			Element targetBlock = statement.element("block");			
			root.remove(firstBlock);
			if(targetBlock != null){
				statement.remove(targetBlock);
				root.add(targetBlock);
			}
			scriptXml = dom.asXML();
			script.setBlockyXml(scriptXml);
		}
		script.setType(ScriptType.TestCaseType);
		this.updateScript(projectId, script);
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptInfo> listScriptInfosByParentScriptGroupId(long projectId, long parentScriptGroupId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select id,declaredAntbots,projectId,name,description,parentScriptGroupId,parameter,type,rwattribute, ((script is null) or (length(script) = 0)) as isEmpty ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(" where parentScriptGroupId=:parentScriptGroupId and projectId = :projectId");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("parentScriptGroupId", parentScriptGroupId);
		query.setParameter("projectId", projectId);

        return (List<ScriptInfo>) query.list();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Script> listScriptsByParentScriptGroupId(long projectId, long parentScriptGroupId) {

		Session session = this.sessionFactory.getCurrentSession();

        return (List<Script>) session
				.createQuery("from Script where parentScriptGroupId=:parentScriptGroupId  and projectId = :projectId ")
				.setParameter("parentScriptGroupId", parentScriptGroupId).setParameter("projectId", projectId).list();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Script> listScriptsByProjectId(long projectId) {

		Session session = this.sessionFactory.getCurrentSession();

        return (List<Script>) session.createQuery("from Script where projectId = :projectId ")
				.setParameter("projectId", projectId).list();
	}

	@Override
	public Script getScriptById(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();

		List<Script> scripts = session.createQuery("from Script where id=:id  and projectId = :projectId")
				.setParameter("projectId", projectId).setParameter("id", id).list();

		if (scripts.size() == 0)
			return null;
		return scripts.get(0);
	}

	@Override
	public List<Script> getScriptsByScriptIds(long projectId, String scriptIds, String type) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(" where id in ( ");
		sqlBuilder.append(scriptIds);
		sqlBuilder.append(")  and projectId = " + projectId + " and type='" + type + "'");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());

		List<Script> scripts = query.list();
		return scripts;
	}

	@Override
	public Script getScriptByScriptId(long scriptId) {
		Session session = this.sessionFactory.getCurrentSession();

		List<Script> scripts = session.createQuery("from Script where id=:id").setParameter("id", scriptId).list();

		if (scripts.size() == 0)
			return null;
		return scripts.get(0);
	}

	@Override
	public List<Script> listSubScripts() {
		Session session = this.sessionFactory.getCurrentSession();
        return (List<Script>) session.createQuery("from Script where type = 'subscript'").list();
	}

	@Override
	public void updateScript() {
		//替换óòSUBSCRIPT为óòCALL_SCRIPT```
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" UPDATE script SET Script = REPLACE(Script, 'óòSUBSCRIPT```', 'óòCALL_SCRIPT```')");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.executeUpdate();
		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateScript", "replaceóòSUBSCRIPT to CALL_SCRIPT");
	}

	@Override
	public void removeScript(long projectId, long id) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" delete from script where projectId=:projectId and id=:id  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeScript",
				String.format("projectId:%s, id: %s", projectId, id));
	}

	@Override
	public List<ScriptInfo> listScriptInfos(long projectId) {

		logger.debug(String.format("trace performance : listScriptInfos begin..., projectId: %s", projectId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select id,declaredAntbots, projectId,name,description,parentScriptGroupId,parameter,type,rwattribute, ((script is null) or (length(script) = 0)) as isEmpty ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(" where projectId=:projectId");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);

		List<Object[]> rawResults = query.list();
		List<ScriptInfo> scriptInfos = new ArrayList<>();
		for (Object[] row : rawResults) {
			ScriptInfo scriptInfo = new ScriptInfo();
			scriptInfo.setId(((Number) row[0]).longValue());
			scriptInfo.setDeclaredAntbots((String) row[1]);
			scriptInfo.setProjectId(((Number) row[2]).longValue());
			scriptInfo.setName((String) row[3]);
			scriptInfo.setDescription((String) row[4]);
			scriptInfo.setParentScriptGroupId(row[5] != null ? ((Number) row[5]).longValue() : null);
			scriptInfo.setParameter((String) row[6]);
			scriptInfo.setType((String) row[7]);
			scriptInfo.setRwattribute((String) row[8]);
			scriptInfo.setIsEmpty(((Number) row[9]).intValue() == 1); // 假设 isEmpty 是布尔值
			scriptInfos.add(scriptInfo);
		}

		logger.debug(String.format("trace performance : listScriptInfos end..., projectId: %s", projectId));
		return scriptInfos;
	}

	@Override
	public List<ScriptInfo> listScriptInfos(long projectId, String type) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select id,declaredAntbots, projectId,name,description,parentScriptGroupId,parameter,type,rwattribute, ((script is null) or (length(script) = 0)) as isEmpty ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(" where projectId=:projectId and type=:type");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("type", type);

		List<Object[]> rawResults = query.list();
		List<ScriptInfo> scriptInfos = new ArrayList<>();
		for (Object[] row : rawResults) {
			ScriptInfo scriptInfo = new ScriptInfo();
			scriptInfo.setId(((Number) row[0]).longValue());
			scriptInfo.setDeclaredAntbots((String) row[1]);
			scriptInfo.setProjectId(((Number) row[2]).longValue());
			scriptInfo.setName((String) row[3]);
			scriptInfo.setDescription((String) row[4]);
			scriptInfo.setParentScriptGroupId(row[5] != null ? ((Number) row[5]).longValue() : null);
			scriptInfo.setParameter((String) row[6]);
			scriptInfo.setType((String) row[7]);
			scriptInfo.setRwattribute((String) row[8]);
			scriptInfo.setIsEmpty(((Number) row[9]).intValue() == 1); // 假设 isEmpty 是布尔值
			scriptInfos.add(scriptInfo);
		}

		logger.debug(String.format("trace performance : listScriptInfos end..., projectId: %s", projectId));
		return scriptInfos;
	}

	@Override
	public ScriptInfo getScriptInfoById(long projectId, long scriptId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select id, declaredAntbots, projectId,name,description,parentScriptGroupId,parameter,type,rwattribute, ((script is null) or (length(script) = 0)) as isEmpty ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(" where id=:scriptId and projectId=:projectId");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("scriptId", scriptId).setParameter("projectId", projectId);

		Object[] result = (Object[]) query.uniqueResult();
		if (result == null) {
			return null;
		}

		ScriptInfo scriptInfo = new ScriptInfo();
		scriptInfo.setId(((Number) result[0]).longValue());
		scriptInfo.setDeclaredAntbots((String) result[1]);
		scriptInfo.setProjectId(((Number) result[2]).longValue());
		scriptInfo.setName((String) result[3]);
		scriptInfo.setDescription((String) result[4]);
		scriptInfo.setParentScriptGroupId(result[5] != null ? ((Number) result[5]).longValue() : null);
		scriptInfo.setParameter((String) result[6]);
		scriptInfo.setType((String) result[7]);
		scriptInfo.setRwattribute((String) result[8]);
		scriptInfo.setIsEmpty(((Number) result[9]).intValue() == 1);

		return scriptInfo;
	}

	@Override
	public List<ScriptInfo> findReferenceOfSubScriptByScripts(long projectId, long subscriptId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select id,declaredAntbots, projectId,name,description,parentScriptGroupId,parameter,type,rwattribute, ((script is null) or (length(script) = 0)) as isEmpty ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(
				" where projectId=:projectId and id in (select parentScriptId from SubscriptReference where subscriptId=:subscriptId and projectId=:projectId)");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("subscriptId", subscriptId);
		query.setParameter("projectId", projectId);

		List<Object[]> rawResults = query.list();
		List<ScriptInfo> scriptInfos = new ArrayList<>();
		for (Object[] row : rawResults) {
			ScriptInfo scriptInfo = new ScriptInfo();
			scriptInfo.setId(((Number) row[0]).longValue());
			scriptInfo.setDeclaredAntbots((String) row[1]);
			scriptInfo.setProjectId(((Number) row[2]).longValue());
			scriptInfo.setName((String) row[3]);
			scriptInfo.setDescription((String) row[4]);
			scriptInfo.setParentScriptGroupId(row[5] != null ? ((Number) row[5]).longValue() : null);
			scriptInfo.setParameter((String) row[6]);
			scriptInfo.setType((String) row[7]);
			scriptInfo.setRwattribute((String) row[8]);
			scriptInfo.setIsEmpty(((Number) row[9]).intValue() == 1);
			scriptInfos.add(scriptInfo);
		}
		return scriptInfos;
	}

	@Override
	public List<ScriptInfo> getExceptionRecoverCandidates(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select id,declaredAntbots, projectId,name,description,parentScriptGroupId,parameter,type, rwattribute, ((script is null) or (length(script) = 0)) as isEmpty ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(
				" where (parameter is null OR length(parameter) < 3) and type='subscript' and projectId = :projectId");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);

		List<Object[]> rawResults = query.list();
		List<ScriptInfo> scriptInfos = new ArrayList<>();
		for (Object[] row : rawResults) {
			ScriptInfo scriptInfo = new ScriptInfo();
			scriptInfo.setId(((Number) row[0]).longValue());
			scriptInfo.setDeclaredAntbots((String) row[1]);
			scriptInfo.setProjectId(((Number) row[2]).longValue());
			scriptInfo.setName((String) row[3]);
			scriptInfo.setDescription((String) row[4]);
			scriptInfo.setParentScriptGroupId(row[5] != null ? ((Number) row[5]).longValue() : null);
			scriptInfo.setParameter((String) row[6]);
			scriptInfo.setType((String) row[7]);
			scriptInfo.setRwattribute((String) row[8]);
			scriptInfo.setIsEmpty(((Number) row[9]).intValue() == 1);
			scriptInfos.add(scriptInfo);
		}
		return scriptInfos;
	}

}
