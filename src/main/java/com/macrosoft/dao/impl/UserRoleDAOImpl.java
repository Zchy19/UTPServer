package com.macrosoft.dao.impl;

import java.util.List;

import com.macrosoft.dao.UserRoleDAO;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.UserRole;

@Repository
public class UserRoleDAOImpl implements UserRoleDAO {
	

	private static final ILogger logger = LoggerFactory.Create(TestsetExecutionTriggerDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addUserRole(UserRole p) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(p);
		//logger.info("UserRole saved successfully, UserRole Details="+p);
	}

	@Override
	public void updateUserRole(UserRole p) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(p);
		//logger.info("UserRole updated successfully, UserRole Details="+p);
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<UserRole> listUserRoles() {
		Session session = this.sessionFactory.getCurrentSession();
		List<UserRole> personsList = session.createQuery("from UserRole").list();
		for(UserRole p : personsList){
			//logger.info("UserRole List::"+p);
		}
		return personsList;
	}

	@Override
	public UserRole getUserRoleById(long id) {
		Session session = this.sessionFactory.getCurrentSession();		
		UserRole p = (UserRole) session.load(UserRole.class, new Long(id));
		//logger.info("UserRole loaded successfully, UserRole details="+p);
		return p;
	}

	@Override
	public void removeUserRole(long id) {
		Session session = this.sessionFactory.getCurrentSession();
		UserRole p = (UserRole) session.load(UserRole.class, new Long(id));
		if(null != p){
			session.delete(p);
		}
		//logger.info("UserRole deleted successfully, person details="+p);
	}

}
