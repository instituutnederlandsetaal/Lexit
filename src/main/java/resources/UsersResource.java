package resources;

import java.io.IOException;
import java.util.ArrayList;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;
import database.Database;
import util.Util;

// This will map the resource to the URL
@Path("/api")
public class UsersResource {
	
	private final ResourceContextService service = SharedResources.SERVICE;
	
	
 	// login for normal users
 	@Path("login")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject login(
 			@FormParam("username") String username,
 			@FormParam("password") String password,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest			
 			) {
 		
 		ResponseObject dro = new ResponseObject();
 		
 		boolean loginSuccessfull = service.getLexitInfo().checkCredentials(username, password);
 		
 		// if login is successful, return the session ID
 		if (loginSuccessfull) {
 			
 			// set the session timeout to the maximum allowed duration
 	 		// (this is needed to avoid that sessions expire too soon, as set in Tomcat's web.xml)
 	 		//context.setSessionTimeout( (int) (Constants.MAX_SESSION_ID_DURATION / (60*1000)) ); // (needs to be set in minutes!)
 			
 	 		// get session ID
 			String sessionId = service.getLexitInfo().getSessionId(httpServletRequest);
 			
 			// remember that this session ID represents this user
 			service.getLexitInfo().setSessionIdIsUsername(sessionId, username);
 			
 			// return the session ID to the client:
 			// it will be used identify the user when a request comes in!
 			dro.setResponse( sessionId );
 		}		
 		else {
 			dro.setResponse( "Access denied" );
 		}
 		
 		return dro;
 	}
 	
 	
 	
 	// public reader login
 	@Path("reader_login")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject loginReader(
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest			
 			) {
 		
 		ResponseObject dro = new ResponseObject();
 		
 		String sessionId = service.getLexitInfo().getSessionId(httpServletRequest);
			
		// remember that this session ID represents the reader
		service.getLexitInfo().setSessionIdIsUsername(sessionId, Constants.PUBLIC_READER_USER);
 		
 		return dro;
 	}
 	
 	
	// get the name of the user which had logged in
 	// call:
 	// .../api/get_username
 	@Path("get_username")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject getUserName(
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		ResponseObject response = new ResponseObject();
 		String userName = service.getLexitInfo().getUserName(httpServletRequest);
 		String sessionId = service.getLexitInfo().getSessionId(httpServletRequest);
 		
 		response.setResponse(userName + Constants.ARG_INTERNAL_SEPARATOR + sessionId);
 		
 		return response;
 	}
 	
 	
 	// logout user from lex'it
 	@Path("logout")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject logout(
 			@FormParam("username") String username,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest			
 			) {
 		
 		System.out.println("### Logging out user "+username);
 		
		// get a list of the ContextObjects of the user to be logged out
	
		ArrayList<String> keysToDelete = new ArrayList<String>();

		for (String key : service.getNameToDatabaseObject().keySet()){
			
			Database tmpDbObj = service.getNameToDatabaseObject().get(key);
			String thisUserName = tmpDbObj.getContextObject().getUsername();
			
			// match the user? note it must be thrown away
			if ( thisUserName == null || thisUserName.equals(username) ) {
				keysToDelete.add(key);
			}
		}
		
		// remove those ContextObjects
		
		for (String key : keysToDelete) {
			// remove ContextObject since it's left unused
			service.removeFromNameToDatabaseObject(key);
			Util.debug("Removed old Database object: "+key);
		}
		
		// log out
		
		service.getLexitInfo().logOutUser(username);
 		
 		ResponseObject dro = new ResponseObject();
 		dro.setResponse(username + " was logged out from Lex'it"); 		
 		return dro;
 	}
 	
 	
 	// reset user rights 
 	@Path("reset_user_rights")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject resetUserRoles(
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);		
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName); 		
 		if ( !service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 				
 		synchronized (TableResources.class){
 		
 			// refresh the user rights
 			// (don't re-instantiate the LexitSchemaAccess object, as it would cause current users to be logged out)
 			service.getLexitInfo().refresh();	
 			
 			// get copy of the user rights into this main class
 			service.setUserRoles( service.getLexitInfo().getUsersRoles() );
 		}
 		
 		ResponseObject dro = new ResponseObject();	
 		dro.setResponse("OK");
 		
 		return dro;
 	}
 	
 	
 	// remove a user
 	@Path("delete_user")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject deleteUser(
 			@DefaultValue("") @FormParam("username") String username,
 			@Context SecurityContext sc,
 			@Context ServletContext context,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		service.getLexitInfo().deleteUser(username);
 		
 		ResponseObject response = new ResponseObject();
 		response.setResponse("OK");
 		
 		return response;
 	}

 	
 	// remove a user's project role
 	@Path("delete_projectrole_for_user")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject deleteProjectRoleForUser(
			@DefaultValue("") @FormParam("username") String username,
			@DefaultValue("") @FormParam("db_name") String dbname, 
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}

		service.getLexitInfo().deleteProjectRoleForUser(username, dbname);

		ResponseObject response = new ResponseObject();
		response.setResponse("OK");

		return response;
	}

 	
 	
 	@Path("get_user_default_role")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject getUserDefaultRole(
 			@DefaultValue("") @QueryParam("username") String username,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest) {
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		
 		String role = service.getLexitInfo().getUsersDefaultRole(username);
 		
 		ResponseObject response = new ResponseObject();
 		response.setResponse(role);
 		
 		return response;

 	}
 	
 	// set a user with a default role  and a project role
 	@Path("set_user_with_role")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject setUserWithRole(
 			@DefaultValue("") @FormParam("username") String username,
 			@DefaultValue("") @FormParam("password") String password,
 			@DefaultValue("") @FormParam("default_role") String defaultRole,
 			@DefaultValue("") @FormParam("db_name") String dbName,
 			@DefaultValue("") @FormParam("role") String role,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		
 		service.getLexitInfo().setUserWithRole(username, password, defaultRole, dbName, role);
 		
 		ResponseObject response = new ResponseObject();
 		response.setResponse("OK");
 		
 		return response;
 	}
 	
 	
 	// change the password of the admin user
 	@Path("change_admin_password")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject changeAdminPassword(
 			@DefaultValue("") @FormParam("old_password") String oldPassword,
 			@DefaultValue("") @FormParam("new_password") String newPassword,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		service.getLexitInfo().changeAdminPassword(oldPassword, newPassword);
 		
 		ResponseObject response = new ResponseObject();
 		response.setResponse("OK");
 		
 		return response;
 	}

 	
 	
 	
 	@Path("get_list_of_users_and_roles")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject getListOfUsersAndRoles(
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) {
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		
 		ResponseObject response = new ResponseObject();
 		
 		String output = Util.join( service.getLexitInfo().getListOfUsersAndRoles(), Constants.ARG_INTERNAL_SEPARATOR);		
 		response.setResponse( output );
 		
 		return response;	
 	}
 	
 	@Path("get_list_of_users")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject getListOfUsers(
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) {
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		ResponseObject response = new ResponseObject();
 		
 		String output = Util.join( service.getLexitInfo().getListOfUsers(), Constants.ARG_INTERNAL_SEPARATOR);		
 		response.setResponse( output );
 		
 		return response;	
 	}
 	
 	
 	// get the list of existing projects and their info (if fullinfo=true)
 	@Path("get_list_of_existing_projects")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject getListOfExistingProjects(
			@DefaultValue("false") @QueryParam("fullinfo") String fullInfo,
			@Context ServletContext context, 
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws IOException {

		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
		if (!service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
			throw new RuntimeException("Permission denied to " + loginName);
		}

		ResponseObject response = new ResponseObject();

		boolean getFullInfo = fullInfo.equals("true");
		String output = Util.join(service.getLexitInfo().getListOfExistingProjects( getFullInfo ), Constants.ARG_INTERNAL_SEPARATOR);
		response.setResponse(output);

		return response;
	}
 	
 	
 	// set the list of existing projects 
 	@Path("set_list_of_existing_projects")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject setListOfExistingProjects(
			@DefaultValue("") @FormParam("projectlist") String projectList,
			@Context ServletContext context, 
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws IOException {
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
		if (!service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
			throw new RuntimeException("Permission denied to " + loginName);
		}
 		
 		ResponseObject response = new ResponseObject();
 		
 		try {
 			service.getLexitInfo().setListOfExistingProjects( projectList );
 			response.setResponse("OK");
 		}
		catch (Exception e) {
			response.setResponse("Something went wrong when setting the list of existing projects: " + e.getMessage());
			return response;
		}
 		
 		return response;
 	}
 	
 	
 	// remove a project
 	@Path("remove_project")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject removeProject(
			@DefaultValue("") @FormParam("db_name") String dbName,
			@Context ServletContext context, 
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws IOException {
 		
 		
 		String loginName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
		if (!service.userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
			throw new RuntimeException("Permission denied to " + loginName);
		}
 		
 		ResponseObject response = new ResponseObject();
 		
 		try {
 			service.getLexitInfo().deleteProject(dbName);
 			response.setResponse("OK");
 		}
		catch (Exception e) {
			response.setResponse("Something went wrong when deleting project '"+dbName+"': " + e.getMessage());
			return response;
		}
 		
 		return response;
 	}

 	
 	

 	
 	
 	// keep track of the active tab a user is currently viewing 
 	// .../api/set_active_tab_id
 	@Path("set_active_tab_id")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject setActiveTab(
 			@FormParam("db_name") String dbName,
 			@FormParam("active_tab_id") String activeTabId,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest){
 		
 		ResponseObject response = new ResponseObject();
 		
 		if (dbName.equals("spy") || dbName.equals(Constants.ADMIN_DB)) {
 			response.setResponse("active_tab_id needn't to be set in "+dbName+" mode ");
 		}
 		else {
 			
 			String userName = service.getLexitInfo().getUserName(httpServletRequest);
 			ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);	
 			
 			if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
 				throw new RuntimeException("Permission denied to "+co.getUsername());
 			
 			// register the database + tab id the user is currently viewing
 			service.getDatabaseObject(co).setActiveTabId(dbName+"_"+activeTabId);
 			
 			response.setResponse("active_tab_id set to "+co.getActiveTabIdForSpy());
 		}		
 		
 		return response;
 	}
}
