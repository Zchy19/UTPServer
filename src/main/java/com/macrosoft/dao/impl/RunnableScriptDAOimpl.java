package com.macrosoft.dao.impl;

import com.macrosoft.dao.RunnableScriptDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.RunnableScript;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

@Repository
public class RunnableScriptDAOimpl implements RunnableScriptDAO {

     private static final ILogger logger = LoggerFactory.Create(RunnableScriptDAOimpl.class.getName());

     private SessionFactory sessionFactory;

     @Autowired
     @Qualifier("sessionFactory")
     public void setSessionFactory(SessionFactory sf) {
     	this.sessionFactory = sf;
     }

    @Override
    public void addRunnableScript(RunnableScript runnableScript) {
        Session session = this.sessionFactory.getCurrentSession();
        session.saveOrUpdate(runnableScript);
        TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addRunnableScript", String.format("id: %s", runnableScript.getId()));
    }

    @Override
    public void updateRunnableScript(RunnableScript runnableScript) {
        Session session = this.sessionFactory.getCurrentSession();
        session.update(runnableScript);
        TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateRunnableScript", String.format("id: %s", runnableScript.getId()));
    }

    @Override
    public RunnableScript getRunnableScriptById(long id) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("select * from RunnableScript where id=:id");
        //根据id降序排序
        sqlBuilder.append(" order by id desc ");
        RunnableScript runnableScript = (RunnableScript) session.createSQLQuery(sqlBuilder.toString())
                .addEntity(RunnableScript.class)
                .setParameter("id", id)
                .uniqueResult();
        return runnableScript;
    }

    @Override
    public void removeRunnableScript(long id) {
        Session session = this.sessionFactory.getCurrentSession();
        RunnableScript runnableScript = (RunnableScript) session.get(RunnableScript.class, id);
        if (runnableScript != null) {
            session.delete(runnableScript);
            TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeRunnableScript", String.format("id: %s", id));
        }
    }


}
