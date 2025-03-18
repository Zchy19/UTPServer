package com.macrosoft.dao.impl;

import java.util.List;

import com.macrosoft.dao.TestsetExecutionTriggerDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.TestsetExecutionTrigger;

@Repository
public class TestsetExecutionTriggerDAOImpl implements TestsetExecutionTriggerDAO {

	private static final ILogger logger = LoggerFactory.Create(TestsetExecutionTriggerDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public void addTestsetExecutionTrigger(TestsetExecutionTrigger p) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(p);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addTestsetExecutionTrigger",
							String.format("projectId:%s, id: %s", p.getProjectId(), p.getId()));
	}

	@Override
	public void updateTestsetExecutionTrigger(TestsetExecutionTrigger p) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(p);

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateTestsetExecutionTrigger",
				String.format("projectId:%s, id: %s", p.getProjectId(), p.getId()));
	}

	@Override
	public TestsetExecutionTrigger getTestsetExecutionTriggerById(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();
		List<TestsetExecutionTrigger> testsetExecutionTriggers = session
				.createQuery("from TestsetExecutionTrigger where projectId =:projectId and id = :id")
				.setParameter("projectId", projectId).setParameter("id", id).list();

		if (testsetExecutionTriggers.size() == 0)
			return null;

		return testsetExecutionTriggers.get(0);
	}

	@Override
	public List<TestsetExecutionTrigger> listTestsetExecutionTrigger() {
		Session session = this.sessionFactory.getCurrentSession();
		List<TestsetExecutionTrigger> testsetExecutionTriggerList = session.createQuery("from TestsetExecutionTrigger")
				.list();

		return testsetExecutionTriggerList;
	}

	@Override
	public List<TestsetExecutionTrigger> getTestsetExecutionTriggerByTestsetId(long projectId, long testsetId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<TestsetExecutionTrigger> testsetExecutionTriggerList = session
				.createQuery("from TestsetExecutionTrigger where projectId =:projectId and testsetId=:testsetId")
				.setParameter("projectId", projectId).setParameter("testsetId", testsetId).list();

		return testsetExecutionTriggerList;
	}

	@Override
	public void removeTestsetExecutionTrigger(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" delete from testsetexecutiontrigger where projectId =:projectId and id=:id  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeTestsetExecutionTrigger",
				String.format("projectId:%s, id: %s", projectId, id));
	}
}
