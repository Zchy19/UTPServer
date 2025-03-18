package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.UserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.UserRoleDAO;
import com.macrosoft.model.UserRole;

@Service
public class UserRoleServiceImpl implements UserRoleService {
	
	private UserRoleDAO userRoleDAO;
	@Autowired
	public void setUserRoleDAO(UserRoleDAO userRoleDAO) {
		this.userRoleDAO = userRoleDAO;
	}
	
	@Override
	@Transactional
	public void addUserRole(UserRole p) {
		p.setId(0);
		this.userRoleDAO.addUserRole(p);
	}

	@Override
	@Transactional
	public void updateUserRole(UserRole p) {
		this.userRoleDAO.updateUserRole(p);
	}

	@Override
	@Transactional
	public List<UserRole> listUserRoles() {
		return this.userRoleDAO.listUserRoles();
	}

	@Override
	@Transactional
	public UserRole getUserRoleById(long id) {
		return this.userRoleDAO.getUserRoleById(id);
	}

	@Override
	@Transactional
	public void removeUserRole(long id) {
		this.userRoleDAO.removeUserRole(id);
	}

}
