package com.macrosoft.dao.impl;

import com.macrosoft.dao.ScriptGroupDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.ScriptGroup;
import com.macrosoft.model.composition.ScriptInfo;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 脚本组数据访问对象实现类
 * 提供对脚本组相关数据的数据库操作实现
 */
@Repository
public class ScriptGroupDAOImpl implements ScriptGroupDAO {

	private static final ILogger logger = LoggerFactory.Create(ScriptGroupDAOImpl.class.getName());
	private SessionFactory sessionFactory;

	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	/**
	 * 添加新的脚本组
	 * @param projectId 项目ID
	 * @param scriptGroup 脚本组对象
	 * @return 添加成功的脚本组对象
	 */
	@Override
	public ScriptGroup addScriptGroup(long projectId, ScriptGroup scriptGroup) {
		Session session = this.sessionFactory.getCurrentSession();

		String sql = "INSERT INTO scriptgroup (id, ProjectId, Name, Description, ParentScriptGroupId, type) " +
				"VALUES (:newScriptGroupId, :projectId, :name, :description, :parentScriptGroupId, :type)";

		SQLQuery query = session.createSQLQuery(sql);
		query.setParameter("newScriptGroupId", scriptGroup.getId())
				.setParameter("projectId", projectId)
				.setParameter("name", scriptGroup.getName())
				.setParameter("description", scriptGroup.getDescription())
				.setParameter("parentScriptGroupId", scriptGroup.getParentScriptGroupId())
				.setParameter("type", scriptGroup.getType());

		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addScriptGroup",
				String.format("projectId:%s, id:%s", projectId, scriptGroup.getId()));

		return scriptGroup;
	}

	/**
	 * 更新脚本组信息
	 * @param projectId 项目ID
	 * @param scriptGroup 要更新的脚本组对象
	 */
	@Override
	public void updateScriptGroup(long projectId, ScriptGroup scriptGroup) {
		Session session = this.sessionFactory.getCurrentSession();

		String sql = "UPDATE scriptgroup SET name = :name, description = :description, " +
				"parentScriptGroupId = :parentScriptGroupId, type = :type " +
				"WHERE projectId = :projectId AND id = :id";

		SQLQuery query = session.createSQLQuery(sql);
		query.setParameter("name", scriptGroup.getName())
				.setParameter("description", scriptGroup.getDescription())
				.setParameter("parentScriptGroupId", scriptGroup.getParentScriptGroupId())
				.setParameter("type", scriptGroup.getType())
				.setParameter("projectId", projectId)
				.setParameter("id", scriptGroup.getId());

		query.executeUpdate();
	}

	/**
	 * 获取项目下所有脚本组列表
	 * @param projectId 项目ID
	 * @return 脚本组列表
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptGroup> listScriptGroups(long projectId) {
		logger.debug(String.format("trace performance : listScriptGroups begin..., projectId: %s", projectId));

		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptGroup> scriptGroupList = session.createQuery(
						"FROM ScriptGroup WHERE ProjectId = :ProjectId")
				.setParameter("ProjectId", projectId)
				.list();

		logger.debug(String.format("trace performance : listScriptGroups end..., projectId: %s", projectId));
		return scriptGroupList;
	}

	/**
	 * 获取项目顶级脚本组列表
	 * @param projectId 项目ID
	 * @return 顶级脚本组列表
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptGroup> listScriptGroupsInTopLevel(long projectId) {
		logger.debug(String.format("trace performance : listScriptGroupsInTopLevel begin..., projectId: %s", projectId));

		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptGroup> scriptGroupList = session.createQuery(
						"FROM ScriptGroup WHERE ProjectId = :ProjectId AND parentScriptGroupId = 0")
				.setParameter("ProjectId", projectId)
				.list();

		logger.debug(String.format("trace performance : listScriptGroupsInTopLevel end..., projectId: %s", projectId));
		return scriptGroupList;
	}

	/**
	 * 获取指定父脚本组下的子脚本组列表
	 * @param projectId 项目ID
	 * @param parentScriptGroupId 父脚本组ID
	 * @return 子脚本组列表
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptGroup> listScriptGroupsByParentScriptGroupId(long projectId, long parentScriptGroupId) {
		Session session = this.sessionFactory.getCurrentSession();
		return session.createQuery(
						"FROM ScriptGroup WHERE projectId = :projectId AND ParentScriptGroupId = :ParentScriptGroupId " +
								"AND ParentScriptGroupId > 0")
				.setParameter("projectId", projectId)
				.setParameter("ParentScriptGroupId", parentScriptGroupId)
				.list();
	}

	/**
	 * 根据ID获取脚本组
	 * @param projectId 项目ID
	 * @param id 脚本组ID
	 * @return 脚本组对象，如果不存在返回null
	 */
	@SuppressWarnings("unchecked")
	@Override
	public ScriptGroup getScriptGroupById(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptGroup> scriptGroups = session.createQuery(
						"FROM ScriptGroup WHERE projectId = :projectId AND id = :id")
				.setParameter("projectId", projectId)
				.setParameter("id", id)
				.list();

		return scriptGroups.isEmpty() ? null : scriptGroups.get(0);
	}

	/**
	 * 删除指定脚本组
	 * @param projectId 项目ID
	 * @param id 脚本组ID
	 */
	@Override
	public void removeScriptGroup(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();
		String sql = "DELETE FROM scriptgroup WHERE projectId = :projectId AND id = :id";

		SQLQuery query = session.createSQLQuery(sql);
		query.setParameter("projectId", projectId)
				.setParameter("id", id);

		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeScriptGroup",
				String.format("projectId:%s, id:%s", projectId, id));
	}

	/**
	 * 查找脚本组下被引用的所有子脚本
	 * @param projectId 项目ID
	 * @param scriptGroupId 脚本组ID
	 * @return 被引用的子脚本信息列表
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptInfo> findAllReferenceOfSubScriptByScript(long projectId, long scriptGroupId) {
		Session session = this.sessionFactory.getCurrentSession();
		String sql = "SELECT s.id, s.name " +
				"FROM script s " +
				"LEFT JOIN SubscriptReference r ON r.subscriptId = s.id " +
				"WHERE s.projectId = :projectId AND r.projectId = :projectId " +
				"AND s.type = 'subscript' AND s.ParentScriptGroupId = :scriptGroupId " +
				"AND r.subscriptId IS NOT NULL";

		SQLQuery query = session.createSQLQuery(sql);
		query.setParameter("projectId", projectId)
				.setParameter("scriptGroupId", scriptGroupId);

		return buildQueryScriptInfoResult(query).list();
	}

	/**
	 * 查找脚本组下被恢复脚本引用的所有子脚本
	 * @param projectId 项目ID
	 * @param scriptGroupId 脚本组ID
	 * @return 被引用的子脚本信息列表
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptInfo> findAllReferenceOfSubScriptByRecoverScript(long projectId, long scriptGroupId) {
		Session session = this.sessionFactory.getCurrentSession();
		String sql = "SELECT s.id, s.name " +
				"FROM script s " +
				"LEFT JOIN RecoverSubscriptReference r ON r.subscriptId = s.id " +
				"WHERE s.projectId = :projectId AND r.projectId = :projectId " +
				"AND s.type = 'subscript' AND s.ParentScriptGroupId = :scriptGroupId " +
				"AND r.subscriptId IS NOT NULL";

		SQLQuery query = session.createSQLQuery(sql);
		query.setParameter("projectId", projectId)
				.setParameter("scriptGroupId", scriptGroupId);

		return buildQueryScriptInfoResult(query).list();
	}

	/**
	 * 查找脚本组下被测试集引用的所有脚本
	 * @param projectId 项目ID
	 * @param scriptGroupId 脚本组ID
	 * @return 被引用的脚本信息列表
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptInfo> findAllScriptReferencedByTestset(long projectId, long scriptGroupId) {
		Session session = this.sessionFactory.getCurrentSession();
		String sql = "SELECT s.id, s.name " +
				"FROM script s " +
				"LEFT JOIN ScriptLink ts ON s.id = ts.scriptId " +
				"WHERE s.projectId = :projectId AND ts.projectId = :projectId " +
				"AND s.type = 'testcase' AND s.ParentScriptGroupId = :scriptGroupId " +
				"AND ts.scriptId IS NOT NULL";

		SQLQuery query = session.createSQLQuery(sql);
		query.setParameter("projectId", projectId)
				.setParameter("scriptGroupId", scriptGroupId);

		return buildQueryScriptInfoResult(query).list();
	}

	/**
	 * 根据类型获取项目下的脚本组列表
	 * @param projectId 项目ID
	 * @param type 脚本组类型
	 * @return 指定类型的脚本组列表
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptGroup> listScriptGroupsByType(long projectId, String type) {
		Session session = this.sessionFactory.getCurrentSession();
		return session.createQuery(
						"FROM ScriptGroup WHERE ProjectId = :ProjectId AND type = :type")
				.setParameter("ProjectId", projectId)
				.setParameter("type", type)
				.list();
	}

	@Override
	public ScriptGroup getScriptGroupByName(String scriptGroupName, Long parentScriptGroupId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptGroup> scriptGroups = session.createQuery(
						"FROM ScriptGroup WHERE name = :name AND parentScriptGroupId = :parentScriptGroupId")
				.setParameter("name", scriptGroupName)
				.setParameter("parentScriptGroupId", parentScriptGroupId)
				.list();
		return scriptGroups.isEmpty() ? null : scriptGroups.get(0);
	}

	/**
	 * 配置SQL查询以返回ScriptInfo对象
	 * @param query 要配置的SQL查询对象
	 * @return 配置后的SQL查询对象
	 * @deprecated 使用直接在查询中配置的方式替代
	 */
	private SQLQuery buildQueryScriptInfoResult(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ScriptInfo.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("name", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("parentScriptGroupId", StandardBasicTypes.LONG);
		query.addScalar("parameter", StandardBasicTypes.STRING);
		query.addScalar("type", StandardBasicTypes.STRING);
		query.addScalar("isEmpty", StandardBasicTypes.BOOLEAN);
		return query;
	}
}