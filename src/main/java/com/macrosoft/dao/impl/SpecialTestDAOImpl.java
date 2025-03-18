package com.macrosoft.dao.impl;

import com.macrosoft.dao.SpecialTestDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.SpecialTest;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SpecialTestDAOImpl implements SpecialTestDAO {

    private static final ILogger logger = LoggerFactory.Create(SpecialTestDAOImpl.class.getName());
    private SessionFactory sessionFactory;
    @Autowired
    @Qualifier("sessionFactory")
    public void setSessionFactory(SessionFactory sf) {
        this.sessionFactory = sf;
    }

    @Override
    public void addSpecialTest(long projectId, SpecialTest specialTest) {
        Session session = this.sessionFactory.getCurrentSession();
        specialTest.setProjectId(projectId);
        session.saveOrUpdate(specialTest);
        //
        TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addSpecialTest", String.format("projectId:%s, id: %s", projectId, specialTest.getId()));
    }

    @Override
    public void updateSpecialTest(long projectId, SpecialTest specialTest) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" update SpecialTest set Name =:name, Description =:description, Type =:type,autoIntoUserName =:autoIntoUserName,isParallel =:isParallel,SubpageNumber =:subpageNumber,");
        sqlBuilder.append(" ScriptId =:scriptId");
        sqlBuilder.append("  where projectId =:projectId and id=:id  ");

        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("id", specialTest.getId());
        query.setParameter("projectId", specialTest.getProjectId());
        query.setParameter("name", specialTest.getName());
        query.setParameter("description", specialTest.getDescription());
        query.setParameter("scriptId", specialTest.getScriptId());
        query.setParameter("type", specialTest.getType());
        query.setParameter("isParallel", specialTest.getIsParallel());
        query.setParameter("subpageNumber", specialTest.getSubpageNumber());
        query.setParameter("autoIntoUserName", specialTest.getAutoIntoUserName());

        query.executeUpdate();
        TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateSpecialTest", String.format("projectId:%s, id: %s", projectId, specialTest.getId()));
    }

    @SuppressWarnings("unchecked")
    @Override
    public List<SpecialTest> listSpecialTestsByProjectId(long projectId) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" select * ");
        sqlBuilder.append(" from SpecialTest ");
        sqlBuilder.append(" where projectId = :projectId ");
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("projectId", projectId);
        buildQuerySpecialTest(query);
        List<SpecialTest> list = query.list();
        return list;
    }

    @Override
    public SpecialTest getSpecialTestById(long projectId, long id) {
        Session session = this.sessionFactory.getCurrentSession();
        List<SpecialTest> list = session.createQuery("from SpecialTest where projectId =:projectId and id=:id")
                .setParameter("projectId", projectId)
                .setParameter("id", id).
                list();
        if (list.size() == 0) return null;
        return list.get(0);
    }

    @Override
    public void removeSpecialTest(long projectId, long id) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" delete from SpecialTest where projectId =:projectId and id=:id  ");

        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("projectId", projectId);
        query.setParameter("id", id);
        query.executeUpdate();

        TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeSpecialTest", String.format("projectId:%s, id: %s", projectId, id));
    }


    private SQLQuery buildQuerySpecialTest(SQLQuery query) {
        query.setResultTransformer(Transformers.aliasToBean(SpecialTest.class));
        query.addScalar("id", StandardBasicTypes.INTEGER);
        query.addScalar("projectId", StandardBasicTypes.INTEGER);
        query.addScalar("name", StandardBasicTypes.STRING);
        query.addScalar("description", StandardBasicTypes.STRING);
        query.addScalar("scriptId", StandardBasicTypes.INTEGER);
        query.addScalar("type", StandardBasicTypes.INTEGER);
        query.addScalar("autoIntoUserName", StandardBasicTypes.STRING);
        query.addScalar("subpageNumber", StandardBasicTypes.INTEGER);
        query.addScalar("isParallel", StandardBasicTypes.INTEGER);
        return query;
    }
}
