package com.macrosoft.dao.impl;

import com.macrosoft.dao.TestCaseDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.TestCase;
import org.hibernate.SQLQuery;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TestCaseDAOimpl implements TestCaseDAO {

    private static final ILogger logger = LoggerFactory.Create(TestCaseDAOimpl.class.getName());
    private SessionFactory sessionFactory;

    @Autowired
    @Qualifier("sessionFactory")
    public void setSessionFactory(SessionFactory sf) {
        this.sessionFactory = sf;
    }

    @Override
    public void addTestCase(TestCase testCase) {
        try {
            sessionFactory.getCurrentSession().saveOrUpdate(testCase);
        } catch (Exception e) {
            logger.error("Error adding test case: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateTestCase(TestCase testCase) {
        try {
            sessionFactory.getCurrentSession().update(testCase);
        } catch (Exception e) {
            logger.error("Error updating test case: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public TestCase getTestCaseById(long projectId, long id) {
        try {
            String sql = "SELECT * FROM TestCase WHERE projectId = :projectId AND id = :id";
            SQLQuery query = sessionFactory.getCurrentSession().createSQLQuery(sql);
            query.setParameter("projectId", projectId);
            query.setParameter("id", id);
            query.addEntity(TestCase.class);
            List<TestCase> results = query.list();
            return results.isEmpty() ? null : results.get(0);
        } catch (Exception e) {
            logger.error("Error retrieving test case by ID: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void removeTestCase(long projectId, long id) {
        try {
            String sql = "DELETE FROM TestCase WHERE projectId = :projectId AND id = :id";
            SQLQuery query = sessionFactory.getCurrentSession().createSQLQuery(sql);
            query.setParameter("projectId", projectId);
            query.setParameter("id", id);
            query.executeUpdate();
        } catch (Exception e) {
            logger.error("Error removing test case: " + e.getMessage());
            throw e;
        }
    }

}
