package com.macrosoft.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.model.UserRole;
import com.macrosoft.service.UserRoleService;

class AccountType {
	public String accountTypeID;
	public String accountTypeName;

	public String getAccountTypeID() {
		return accountTypeID;
	}

	public void setAccountTypeID(String accountTypeID) {
		this.accountTypeID = accountTypeID;
	}

	public String getAccountTypeName() {
		return accountTypeName;
	}

	public void setAccountTypeName(String accountTypeName) {
		this.accountTypeName = accountTypeName;
	}

}

class Identity {
	public String accountTypeID;

	public String getAccountTypeID() {
		return accountTypeID;
	}

	public void setAccountTypeID(String accountTypeID) {
		this.accountTypeID = accountTypeID;
	}

	public String getUserID() {
		return userID;
	}

	public void setUserID(String userID) {
		this.userID = userID;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String userID;
	public String password;
}

class AuthorizationKeyDTO {
	private String AuthorizationKey;

	public String getAuthorizationKey() {
		return AuthorizationKey;
	}

	public void setAuthorizationKey(String authorizationKey) {
		AuthorizationKey = authorizationKey;
	}
}

class AgentType {
	public String name;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

}

class Organization {
	public String id;
	public String name;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

}

@Controller
public class MockUrsController {

	@RequestMapping(value = MockUrsRestURIConstants.GetAccountTypeList, method = RequestMethod.GET)
	public @ResponseBody List<AccountType> getAllAccountTypeList() {

		AccountType accountType = new AccountType();
		accountType.setAccountTypeID("1");
		accountType.setAccountTypeName("Email");

		ArrayList<AccountType> list = new ArrayList<AccountType>();
		list.add(accountType);
		return list;
	}

	// For add and update person both
	@RequestMapping(value = MockUrsRestURIConstants.GetAuthorizationKey, method = RequestMethod.POST)
	public @ResponseBody AuthorizationKeyDTO getAuthorizationKey(@RequestBody Identity p) {
		AuthorizationKeyDTO dto = new AuthorizationKeyDTO();
		dto.setAuthorizationKey("mockKey");
		return dto;
	}

	@RequestMapping(value = MockUrsRestURIConstants.GetOrganizationList, method = RequestMethod.GET)
	public @ResponseBody List<Organization> getOrganizationList(@RequestParam("AuthorizationKey") String key) {
		List<Organization> list = new ArrayList<Organization>();
		Organization o1 = new Organization();
		o1.setId("1");
		o1.setName("org1");
		list.add(o1);
		return list;
	}

	@RequestMapping(value = MockUrsRestURIConstants.GetAgentTypeList, method = RequestMethod.GET)
	public @ResponseBody List<AgentType> getAgentTypeList(@RequestParam("OrganizationID") String OrgID,
			@RequestParam("AuthorizationKey") String key) {
		List<AgentType> list = new ArrayList<AgentType>();
		AgentType a1 = new AgentType();
		a1.setName("GuiAgent");
		list.add(a1);
		AgentType a2 = new AgentType();
		a2.setName("AndroidAgent");
		list.add(a2);
		return list;
	}

	public class MockUrsRestURIConstants {
		public static final String GetAccountTypeList = "/api/AccountType/GetAccountTypeList";

		public static final String GetAuthorizationKey = "/api/User/Authorization";

		public static final String GetOrganizationList = "/api/Organization/GetUserOrganizationList";
		public static final String GetAgentTypeList = "/api/Tool/Agent/GetOrganizationAgentTypeList";
	}
}
