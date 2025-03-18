package com.macrosoft.dao.impl;

import com.macrosoft.dao.SpecialTestDataDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.SpecialTestData;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SpecialTestDataDAOImpl implements SpecialTestDataDAO {
	
	private static final ILogger logger = LoggerFactory.Create(SpecialTestDataDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}
	
	@Override
	public void addSpecialTestData(SpecialTestData specialTestData) {

		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(specialTestData);
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addSpecialTestData", String.format(" id: %s",  specialTestData.getId()));
	}

	@Override
	public void updateSpecialTestData(SpecialTestData specialTestData) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update SpecialTestData set specialTestId =:Id, JsonData =:jsonData");
		sqlBuilder.append("  where  id=:id  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", specialTestData.getId());
		query.setParameter("specialTestId", specialTestData.getSpecialTestId());
		query.setParameter("jsonData", specialTestData.getJsonData());
		query.executeUpdate();
		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateSpecialTestData", String.format("specialTestId:%s, id: %s",specialTestData.getSpecialTestId() , specialTestData.getId()));
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<SpecialTestData> listSpecialTestDatasBySpecialTestId(long specialTestId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from SpecialTestData ");
		sqlBuilder.append(" where SpecialTestId =:specialTestId");
		sqlBuilder.append(" order by id desc limit 100 ");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.addEntity(SpecialTestData.class);
		query.setParameter("specialTestId", specialTestId);
		List<SpecialTestData> list = query.list();
		return list;
	}

	@Override
	public void removeSpecialTestDataBySpecialTestId(long specialTestId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" delete from SpecialTestData where specialTestId=:specialTestId ");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("specialTestId", specialTestId);
		query.executeUpdate();
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeSpecialTestDataBySpecialTestId", String.format("specialTestId: %s", specialTestId));
	}

	@Override
	public List<SpecialTestData> listDaySpecialTestDatesBySpecialTestId(long specialTestId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from SpecialTestData ");
		sqlBuilder.append(" where SpecialTestId =:specialTestId AND DATE(startTime) = CURDATE()");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.addEntity(SpecialTestData.class);
		query.setParameter("specialTestId", specialTestId);
		List<SpecialTestData> list = query.list();
		return list;
	}

	@Override
	public void removeSpecialTestData(long id) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from SpecialTestData where id=:id ");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", id);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeSpecialTestData", String.format(" id: %s", id));
	}
 
}
