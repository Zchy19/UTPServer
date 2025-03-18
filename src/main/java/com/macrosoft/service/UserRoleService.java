package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.UserRole;

public interface UserRoleService {
	public void addUserRole(UserRole p);
	public void updateUserRole(UserRole p);
	public List<UserRole> listUserRoles();
	public UserRole getUserRoleById(long id);
	public void removeUserRole(long id);
	
}
