package resources;

import jakarta.inject.Singleton;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;

import table.*;
import util.Database;
import util.LexitSchemaAccess;
import util.ServiceCaller;
import util.Util;



import java.io.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The TableResources class is the main class 
 * Here the different kinds of requests can be mapped to functions and classes
 * 
 * @author Mathieu Fannee (INL)
 *
 * USEFUL NOTE
 * call http://localhost:8080/lexit2/webservice/application.wadl
 * to get an overview of the available resources of the API
 *
 */

@Singleton


// This will map the resource to the tables URL
@Path("/api")
public class TableResources {

	// database access objects, needed for caching (for speed)
	public ConcurrentHashMap<String, Database> nameToDatabaseObject = new ConcurrentHashMap<String, Database>();	

	// users access rights
	public static ConcurrentHashMap<String, String[]> users2roles = new ConcurrentHashMap<String, String[]>();

    // container for user login and roles info
 	LexitSchemaAccess lexitInfo;
 	
 	
 	
 	// ----- USER MANAGEMENT ------------------------------------------------
 	
 	
 	@Path("login")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject login(
 			@FormParam("username") String username,
 			@FormParam("password") String password,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest			
 			) {
 		
 		// response object to be returned to the client
 		DbResponseObject dro = new DbResponseObject();
 		
 		// get session ID
 		String sessionId = lexitInfo.getSessionId(httpServletRequest);
 		
 		
 		// first check if the session is blocked due to too many failed login attempts
 		
 		if (lexitInfo.isSessionBlocked(sessionId)) {
 			
 			// if the session is blocked, return an error message
 			dro.setResponse( "Access denied. This session is blocked. Try again in "+ lexitInfo.getTimeUntilSessionIsUnblocked(sessionId));
 		}
 		
 		// if the session is not blocked, check the credentials
 		
 		else {
 			
 			// evaluation of the credentials
 	 		boolean loginSuccessfull = lexitInfo.checkCredentials(username, password);
 	 		
 	 		
 	 		// if login is successful, return the session ID
 	 		if (loginSuccessfull) {
 	 			 			
 	 			// if some failed attempt was registered, remove it, as the user has now logged in successfully
 	 			lexitInfo.releaseSession(sessionId);
 	 			
 	 			// remember that this session ID represents this user
 	 			lexitInfo.setSessionIdIsUsername(sessionId, username);
 	 			
 	 			// return the session ID to the client:
 	 			// it will be used identify the user when a request comes in!
 	 			dro.setResponse( sessionId );
 	 		}
 	 		
 	 		// wrong password entered, register this as a failed attempt for this session ID, and return an error message
 	 		else {
 	 			lexitInfo.addFailedAttempt(sessionId);
 	 			
 	 			dro.setResponse( "Access denied" );
 	 		}
 			
 		}
 		
 		return dro;
 	}
 	
 	
 	
 	
 	@Path("reader_login")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject loginReader(
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest			
 			) {
 		
 		DbResponseObject dro = new DbResponseObject();
 		
 		String sessionId = lexitInfo.getSessionId(httpServletRequest);
			
		// remember that this session ID represents the reader
		lexitInfo.setSessionIdIsUsername(sessionId, Constants.PUBLIC_READER_USER);
 		
 		return dro;
 	}
 	
 	
 	// logout user from lex'it
 	@Path("logout")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject logout(
 			@FormParam("username") String username,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest			
 			) {
 		
 		System.out.println("### Logging out user "+username);
 		
		// get a list of the ContextObjects of the user to be logged out
	
		ArrayList<String> keysToDelete = new ArrayList<String>();

		for (String key : nameToDatabaseObject.keySet()){
			
			Database tmpDbObj = nameToDatabaseObject.get(key);
			String thisUserName = tmpDbObj.getContextObject().getUsername();
			
			// match the user? note it must be thrown away
			if ( thisUserName == null || thisUserName.equals(username) ) {
				keysToDelete.add(key);
			}
		}
		
		// remove those ContextObjects
		
		for (String key : keysToDelete) {
			// remove ContextObject since it's left unused
			nameToDatabaseObject.remove(key);
			Util.debug("Removed old Database object: "+key);
		}
		
		// log out
		
		lexitInfo.logOutUser(username);
 		
 		DbResponseObject dro = new DbResponseObject();
 		dro.setResponse(username + " was logged out from Lex'it"); 		
 		return dro;
 	}
 	
 	
 	// reset user rights 
 	@Path("reset_user_rights")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject resetConfig(
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);		
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName); 		
 		if ( !userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 				
 		synchronized (TableResources.class){
 		
 			// refresh the user rights
 			// (don't re-instantiate the LexitSchemaAccess object, as it would cause current users to be logged out)
 			lexitInfo.refresh();	
 			
 			// get copy of the user rights into this main class
 			users2roles = lexitInfo.getUsersRoles();
 		}
 		
 		DbResponseObject dro = new DbResponseObject();	
 		dro.setResponse("OK");
 		
 		return dro;
 	}
 	
 	
 	// remove a user
 	@Path("delete_user")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject deleteUser(
 			@DefaultValue("") @FormParam("username") String username,
 			@Context SecurityContext sc,
 			@Context ServletContext context,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		lexitInfo.deleteUser(username);
 		
 		DbResponseObject response = new DbResponseObject();
 		response.setResponse("OK");
 		
 		return response;
 	}

 	
 	// remove a user's project role
 	@Path("delete_projectrole_for_user")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject deleteProjectRoleForUser(
			@DefaultValue("") @FormParam("username") String username,
			@DefaultValue("") @FormParam("db_name") String dbname, 
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}

		lexitInfo.deleteProjectRoleForUser(username, dbname);

		DbResponseObject response = new DbResponseObject();
		response.setResponse("OK");

		return response;
	}

 	
 	
 	@Path("get_user_default_role")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject getUserDefaultRole(
 			@DefaultValue("") @QueryParam("username") String username,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest) {
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		
 		String role = lexitInfo.getUsersDefaultRole(username);
 		
 		DbResponseObject response = new DbResponseObject();
 		response.setResponse(role);
 		
 		return response;

 	}
 	
 	// set a user with a default role  and a project role
 	@Path("set_user_with_role")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject setUserWithRole(
 			@DefaultValue("") @FormParam("username") String username,
 			@DefaultValue("") @FormParam("password") String password,
 			@DefaultValue("") @FormParam("default_role") String defaultRole,
 			@DefaultValue("") @FormParam("db_name") String dbName,
 			@DefaultValue("") @FormParam("role") String role,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		
 		lexitInfo.setUserWithRole(username, password, defaultRole, dbName, role);
 		
 		DbResponseObject response = new DbResponseObject();
 		response.setResponse("OK");
 		
 		return response;
 	}
 	
 	
 	// change the password of the admin user
 	@Path("change_admin_password")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject changeAdminPassword(
 			@DefaultValue("") @FormParam("old_password") String oldPassword,
 			@DefaultValue("") @FormParam("new_password") String newPassword,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		lexitInfo.changeAdminPassword(oldPassword, newPassword);
 		
 		DbResponseObject response = new DbResponseObject();
 		response.setResponse("OK");
 		
 		return response;
 	}

 	
 	
 	
 	@Path("get_list_of_users_and_roles")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject getListOfUsersAndRoles(
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) {
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		
 		DbResponseObject response = new DbResponseObject();
 		
 		String output = Util.join( lexitInfo.getListOfUsersAndRoles(), Constants.ARG_INTERNAL_SEPARATOR);		
 		response.setResponse( output );
 		
 		return response;	
 	}
 	
 	@Path("get_list_of_users")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject getListOfUsers(
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) {
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
 		if ( !userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
 			throw new RuntimeException("Permission denied to "+loginName);
 		}
 		
 		DbResponseObject response = new DbResponseObject();
 		
 		String output = Util.join( lexitInfo.getListOfUsers(), Constants.ARG_INTERNAL_SEPARATOR);		
 		response.setResponse( output );
 		
 		return response;	
 	}
 	
 	
 	// get the list of existing projects and their info (if fullinfo=true)
 	@Path("get_list_of_existing_projects")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getListOfExistingProjects(
			@DefaultValue("false") @QueryParam("fullinfo") String fullInfo,
			@Context ServletContext context, 
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws IOException {

		String loginName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
		if (!userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
			throw new RuntimeException("Permission denied to " + loginName);
		}

		DbResponseObject response = new DbResponseObject();

		boolean getFullInfo = fullInfo.equals("true");
		String output = Util.join(lexitInfo.getListOfExistingProjects( getFullInfo ), Constants.ARG_INTERNAL_SEPARATOR);
		response.setResponse(output);

		return response;
	}
 	
 	
 	// set the list of existing projects 
 	@Path("set_list_of_existing_projects")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject setListOfExistingProjects(
			@DefaultValue("") @FormParam("projectlist") String projectList,
			@Context ServletContext context, 
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws IOException {
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
		if (!userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
			throw new RuntimeException("Permission denied to " + loginName);
		}
 		
 		DbResponseObject response = new DbResponseObject();
 		
 		try {
 			lexitInfo.setListOfExistingProjects( projectList );
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
 	public DbResponseObject removeProject(
			@DefaultValue("") @FormParam("db_name") String dbName,
			@Context ServletContext context, 
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws IOException {
 		
 		
 		String loginName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, Constants.ADMIN_DB, loginName);
		if (!userIsAllowedTo(co, Constants.USER_IS_ADMIN)) {
			throw new RuntimeException("Permission denied to " + loginName);
		}
 		
 		DbResponseObject response = new DbResponseObject();
 		
 		try {
 			lexitInfo.deleteProject(dbName);
 			response.setResponse("OK");
 		}
		catch (Exception e) {
			response.setResponse("Something went wrong when deleting project '"+dbName+"': " + e.getMessage());
			return response;
		}
 		
 		return response;
 	}
 	

 	// ------------------------------------------------------------------------------------------------
 	// Project reset
 	// ------------------------------------------------------------------------------------------------
 	
 	
 	// remove the database object from the cache
 	// call:
 	// .../api/reset_project
 	@Path("reset_project")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public DbResponseObject resetProject(
			@DefaultValue("") @FormParam("db_name") String dbName, 
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		DbResponseObject dro = new DbResponseObject();
 		
 		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		try {
			AppLifecycleListener.deletePool(dbName);
			dro.setResponse("OK");
		}
		catch (Exception e) {
			dro.setResponse("Something went wrong when resetting project "+dbName+" : "+e.getMessage());
		}
 		return dro;
 	}



	// --------------------------------------------------------------------------------------

	// get the javascript configuration file from the configuration directory
	// call:
	// .../api/get_configfile
	@Path("get_configfile")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getConfigJsFile(
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest 
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "Loading config file...");
		
		String fileToSend = null;
		try {
			fileToSend = readConfigJsFile(co);
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return Response.ok(fileToSend, MediaType.TEXT_PLAIN).build();
	}
	
	// get the javascript WELCOME file from the configuration directory
	@Path("get_welcome_page")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getWelcomeJsFile(
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest 
			){
		
		String fileToSend = null;
		try {
			fileToSend = readWelcomeJsFile(context, dbName);
		} catch (IOException e) {
			
			// a welcome page is not mandatory, so no need to throw an exception
			
			fileToSend = "NOT_AVAILABLE"; // don't change this value, as the client will check for it!
		}
		
		return Response.ok(fileToSend, MediaType.TEXT_PLAIN).build();
	}
	
	
	
	
	// get the javascript projects overview file from the configuration directory
	// call:
	// .../api/get_projects_overview
	@Path("get_projects_overview")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getProjectsOverviewJsFile(
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, null, userName);
		Util.debug(co, "Loading projects overview file...");
		
		String fileToSend = null;
		try {
			fileToSend = readProjectsOverviewFile(co);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return Response.ok(fileToSend, MediaType.TEXT_PLAIN).build();
	}
	
	
	
	// get the name of the user which had logged in
	// call:
	// .../api/get_username
	@Path("get_username")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject showResource(
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		DbResponseObject response = new DbResponseObject();
		String userName = lexitInfo.getUserName(httpServletRequest);
		String sessionId = lexitInfo.getSessionId(httpServletRequest);
		
		response.setResponse(userName + Constants.ARG_INTERNAL_SEPARATOR + sessionId);
		
		return response;
	}
	
	
	// register the active tab a user is currently viewing 
	// .../api/set_active_tab_id
	@Path("set_active_tab_id")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setActiveTab(
			@FormParam("db_name") String dbName,
			@FormParam("active_tab_id") String activeTabId,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest){
		
		DbResponseObject response = new DbResponseObject();
		
		if (dbName.equals("spy") || dbName.equals(Constants.ADMIN_DB)) {
			response.setResponse("active_tab_id needn't to be set in "+dbName+" mode ");
		}
		else {
			
			String userName = lexitInfo.getUserName(httpServletRequest);
			ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);	
			
			if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
				throw new RuntimeException("Permission denied to "+co.getUsername());
			
			// register the database + tab id the user is currently viewing
			getDatabaseObject(co).setActiveTabId(dbName+"_"+activeTabId);
			
			response.setResponse("active_tab_id set to "+co.getActiveTabIdForSpy());
		}		
		
		return response;
	}
	
	
	// set current project to work in another schema than the default one
	// (the default schema is the one specified in the .database config file)
	// call:
	// .../api/set_schema?db_name=...&schema_name=...
	@Path("set_schema")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setSchema(
			@FormParam("db_name") String dbName,
			@FormParam("schema_name") String schemaName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest){
		
		return doSetSchema(dbName, schemaName, context,	sc,	httpServletRequest);
	}
	
	// keep this one for backwards compatibility (some old config.js target this endpoint), but it's better to use the POST version of this function (see above)
	@Path("set_schema")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setSchemaGet(
			@QueryParam("db_name") String dbName,
			@QueryParam("schema_name") String schemaName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest){
		
		return doSetSchema(dbName, schemaName, context,	sc,	httpServletRequest);
	}
	
	// private helper for functions hereabove
	private DbResponseObject doSetSchema(
			String dbName,
			String schemaName,
			ServletContext context,
			SecurityContext sc,
			HttpServletRequest httpServletRequest){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		// change psql search path
		getDatabaseObject(co).setSchemaName(schemaName);
		
		DbResponseObject response = new DbResponseObject();
		response.setResponse("search_path set to "+schemaName);
		
		return response;
	}
	
	
	// get host and database name of a project 
	// call:
	// .../api/get_dbinfo?db=...
	@Path("get_dbinfo")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getDbInfo(
			@QueryParam("db") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest			
			) throws IOException {
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		// NO CHECK OF ACCESS RIGHTS HERE, SINCE THIS FUNCTIONALITY IS TYPICALLY ACCESSED BEFORE LOGGING IN!		
		
		String[] dbInfo = getDatabaseObject(co).getDatabaseInfo();
		String infoStr = "database '"+dbInfo[0]+"' on host '"+dbInfo[1]+"'";
		
		DbResponseObject response = new DbResponseObject();
		response.setResponse(infoStr);
		
		return response;
	}
	
	
	// get the list of projects Javascript config files
	// call:
	// .../api/get_configfiles_list
	@Path("get_configfiles_list")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getListOfConfigFiles(
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, null, userName);
		
		// trick to get the path where the other files are
		String fileName = "projects_overview.js";
		String filepath = co.getContext().getRealPath(fileName);			
		
		
		filepath = filepath.replace(
			File.separatorChar + Constants.BASE_URL + File.separator + fileName, 
			File.separatorChar + Constants.CONFIG_DIR); // remove filename as we only need the path here
		
		DbResponseObject response = new DbResponseObject();
		response.setResponse( Util.getListOfFiles(filepath) );
		
		return response;
	}
	
	
	// clean the cache of some table
	// call:
	// .../webservice/api/cleancache?table_name=...&db_name=...
	@Path("cleancache")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject cleanCache(
			@FormParam("table_name") String tableName,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Clean cache of "+tableName);
		
		DbResponseObject dro = new DbResponseObject();
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		getDatabaseObject(co).cleanCache(tableName);
	
		dro.setResponse("OK");
		
		return dro;
	}
	
	
	// refresh a materialized view
	// call:
	// .../webservice/api/refresh_materialized_view?table_name=...&db_name=...
	@Path("refresh_materialized_view")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject refreshMaterializedView(
			@FormParam("table_name") String tableName,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) {
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Refresh materialized view "+tableName);
		
		DbResponseObject dro = new DbResponseObject();
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		getDatabaseObject(co).refreshMaterializedView(tableName);
		
		dro.setResponse("OK");
		
		return dro;
	}
	
	
	
	
	
	
	
	// turn debug mode on/off
	// call:
	// .../api/debug?mode=....
	@Path("debug")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject debugMode(
			@DefaultValue("off") @QueryParam("mode") String debugMode,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, "RaNdOmDaTaBaSe", userName);
		
		if ( !userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		if (debugMode.equals("on"))
			Constants.debug = true;
		else
			Constants.debug = false;
		
		System.out.println("### Debug mode is now turned "+(Constants.debug ? "ON":"OFF") );
	
		DbResponseObject dro = new DbResponseObject();
		dro.setResponse("OK");
		
		return dro;
	}
	


	// get the list of columns of a table and their type 
	// and their allowed values (in case of Postgres user-defined type)
	// call:
	// .../api/getcolumns?table=....
	@Path("getcolumns")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableMetadataInspector getColumns( 
			@QueryParam("table") String tableName,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get Columns from "+tableName);
		
				
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
				
		TableMetadataInspector tmi = new TableMetadataInspector(getDatabaseObject(co), tableName);
		tmi.setColumnNames();
		return tmi;
	}
	
	
	// .../api/get_unique_values
	// get all the unique values a column may contain (needed for select boxes)
	@Path("get_unique_values")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UniqueValuesObject getUniqueValues(
			  @QueryParam("db_name") String dbName, 
			  @QueryParam("table_name") String tableName, 
			  @QueryParam("column_name") String columnName,
			  @Context ServletContext context,
			  @Context SecurityContext sc,
			  @Context HttpServletRequest httpServletRequest
			){
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
	    Util.debug(co, "### Get unique values for column " + columnName + " in " + tableName);	    
	    
	    if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
	    return getDatabaseObject(co).getUniqueValues(tableName, columnName);
	  }
	
	
	// .../api/get_unique_values_with_limit
	// get all the unique values a column may contain (needed for select boxes)
	@Path("get_unique_values_with_limit")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UniqueValuesObject getUniqueValuesWithLimit(
			@QueryParam("db_name") String dbName, 
			@QueryParam("table_name") String tableName, 
			@QueryParam("column_name") String columnName,
			@QueryParam("column_value_filter") String columnValueFilter,	// regex filter box value in the Query Builder
			@QueryParam("other_columns_filters_and_values") String otherFiltersAndValues, // existing search box filters from table, which we expect to operate
			@QueryParam("limit") String limit,
			@DefaultValue("false") @QueryParam("sort_by_freq") String sortByFrequency,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
		)
	  {
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
	    Util.debug(co, "### Get unique values (with limit) for column " + columnName + " in " + tableName);
	    
	    if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
	    return getDatabaseObject(co).getUniqueValuesWithFreqs(tableName, columnName, columnValueFilter, otherFiltersAndValues, limit, sortByFrequency.toLowerCase().equals("true"));
	  }
	
	
	// .../api/get_row_number
	// get the row number corresponding to a given record (given some value to match in some column)
	@Path("get_row_number")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getRowNumber(
			@QueryParam("db_name") String dbName,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("column_value") String columnValue,
			@QueryParam("occurence_nr") int occurenceNr,
			@QueryParam("sort_columns") String sortColumns,
			@QueryParam("sort_directions") String sortDirections,
			@QueryParam("filter_column_names") String filterColumns,
			@QueryParam("filter_values") String filterValues,
			@QueryParam("display_length") int iDisplayLength,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get row number for "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject();
		
		String[] filterColumnsArr = filterColumns.trim().isEmpty() ? 
				null : filterColumns.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] filterColumnValuesArr = filterValues.trim().isEmpty() ?
				null : filterValues.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		String output = getDatabaseObject(co).getRowNumberOfRecord(tableName, columnName, columnValue, 
						occurenceNr, sortColumns, sortDirections, 
						filterColumnsArr, filterColumnValuesArr, iDisplayLength
						);
		dro.setResponse(output);
		
		return dro;
	}
	
	// .../api/setvalue
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValue(
			@FormParam("row_id") String rowId,
			@FormParam("table_name") String tableName,
			@FormParam("column_name") String columnName,
			@FormParam("new_value") String newValue,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### SetValue for "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
		
		String[] rowIds = rowId.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] newValues = newValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		// two possibilities:
		
		// I.	- one single column name
		//		- one or more row id's, and corresponding new values for that column in all these rows
		if (columnNames.length==1) {
			int numberOfRowsToUpdate = rowIds.length;
			for (int i=0; i<numberOfRowsToUpdate; i++) {
				getDatabaseObject(co).updateOneColumn(tableName, rowIds[i], columnName, newValues[i], dro);			
			}			
		}
		
		// II.	- one single row id
		// 		- more column names, and corresponding new values for these columns in that row
		else if (columnNames.length>1 && rowIds.length == 1) {
			getDatabaseObject(co).updateWholeRecord(tableName, rowId, columnNames, newValues, dro);
		}
				
		
		return dro;
	}
	
	

	// .../api/setcomment
	// set the comment of a table or view
	@Path("setcomment")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setComment(
			@FormParam("table_name") String tableName,
			@FormParam("new_comment") String newComment,
			@FormParam("table_type") String tableType,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Set comment for "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 		
		
		getDatabaseObject(co).updateComment(tableName, tableType, newComment, dro);				
		
		return dro;
	}
	
	
	// .../api/get_comment
	// get the comment of a table or view
	@Path("get_comment")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getComment(
			@QueryParam("table_name") String tableName,
			@QueryParam("table_type") String tableType,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get comment on "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		
		// put id of record in response object
		
		String comment = getDatabaseObject(co).getComment(tableName);
		dro.setResponse(comment);
		
		return dro;
	}
	
	
	
	// .../api/get_id_of_record
	// get the id of a row, given some values to match in records
	@Path("get_id_of_record")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getIdOfRecord(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("value") String value,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){

		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get id from record in "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		String[] values = value.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		// put id of record in response object
		
		String id = getDatabaseObject(co).getIdOfRecord(tableName, columnNames, values);
		dro.setResponse(id);
		
		return dro;
	}
	
	
	// .../api/get_record
	// get a record, given its id
	@Path("get_record")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject getRecord(
			@QueryParam("table_name") String tableName,
			@QueryParam("id") String id,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get record from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		TableRecordObject tro = getDatabaseObject(co).getRecord(tableName, id);
				
		return tro;
	}
	
	
	// .../api/get_records
	// get multiple records, given their ids
	@Path("get_records")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordsObject getRecords(
			@QueryParam("table_name") String tableName,
			@QueryParam("ids") String idsStr,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get multiple records from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		String[] ids = idsStr.split(Constants.ARG_INTERNAL_SEPARATOR);
		
		TableRecordsObject tro = getDatabaseObject(co).getRecords(tableName, ids);
				
		return tro;
	}

	
	// .../api/get_record_without_id
	// get a record, given its id
	@Path("get_record_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject getRecordWithoutId(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){

		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get record without id from "+tableName);
		
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);		
		
		TableRecordObject tro = getDatabaseObject(co).getRecordWithoutId(tableName, columnNamesToMatch, valuesToMatch);
				
		return tro;
	}
	
	

	// .../api/get_records_without_ids
	// get multiple records with specifying any id
	@Path("get_records_without_ids")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordsObject getRecordsWithoutIds(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get multiple records without id from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		TableRecordsObject tro = getDatabaseObject(co).getRecordsWithoutIds(tableName, columnNamesToMatch, valuesToMatch);
				
		return tro;
	}
	
	
	
	// call a webservice through the Lex'it webservice, to avoid 'strict-origin-when-cross-origin' errors
	// call:
	// .../api/call_external_service
	@Path("call_external_service")
	@POST
	@Produces({MediaType.TEXT_PLAIN})
	public Response callExternalService(
			@FormParam("url") String url,
			@DefaultValue("GET") @FormParam("type") String requestMethod, 
			@FormParam("data") String urlParameters, 
			@DefaultValue("UTF-8") @FormParam("encoding") String charEncoding, 
			@DefaultValue("application/x-www-form-urlencoded") @FormParam("contentType") String contentType,
			@DefaultValue("xml") @FormParam("dataType") String dataType,
			@Context HttpServletRequest httpServletRequest
			) {
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		
		// create a service caller 
		ServiceCaller sc = new ServiceCaller(url);
		
		// call the service with it
		String response = sc.call(requestMethod, urlParameters, charEncoding, contentType, dataType, userName);
		
		// return the service response
		return Response.ok(response, MediaType.TEXT_PLAIN).build();
	}
	
	
	
	
	
	
	// .../api/call_function
	@Path("call_function")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject callFunction(
			@FormParam("function_name") String functionName,
			@DefaultValue("true_null") @FormParam("args") String args,	// true null
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Call function "+functionName);
		
		// true null must be null (we must be able to make the difference between an empty string and null)
		if (args != null && args.equals("true_null")) 
			args = null;		
		String[] argsArr = (args != null) ?
				args.split(Constants.ARG_INTERNAL_SEPARATOR, -1)
				:
				new String[]{};		
		
		
		// first check the function operation type (= writing/reading)
		String functionOperationType = getDatabaseObject(co).getFunctionOperationType(functionName, argsArr.length);
		
		// function type must match the user's access rights
		if ( !userIsAllowedTo(co, functionOperationType))
			throw new RuntimeException("Permission denied to "+userName);	
		
		TableRecordObject tro = 
			getDatabaseObject(co).callFunction(functionName, argsArr);
				
		return tro;
	}
	
	
	
	// .../api/setvalue_without_id
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue_without_id")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValueWithoutId(
			@FormParam("table_name") String tableName,
			@FormParam("column_name_to_match") String columnNameToMatch,
			@FormParam("value_to_match") String valueToMatch,
			@FormParam("column_name_to_update") String columnNameToUpdate,
			@FormParam("value_to_update") String valueToUpdate,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Update record without id in "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
				
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNamesToUpdate = columnNameToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToUpdate = valueToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		
		getDatabaseObject(co).updateRecordWithoutId(tableName, 
				columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
		return dro;
	}
	
	
	
	
	// .../api/setvalue_without_id_for_search_and_replace
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue_without_id_for_search_and_replace")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValueWithoutIdForSearchAndReplace(
			@FormParam("table_name") String tableName,
			@FormParam("column_name_to_match") String columnNameToMatch,
			@FormParam("value_to_match") String valueToMatch,
			@FormParam("column_name_to_update") String columnNameToUpdate,
			@FormParam("value_to_update") String valueToUpdate,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Update record (search and replace) without id in "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
				
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNamesToUpdate = columnNameToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToUpdate = valueToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		
		getDatabaseObject(co).updateRecordWithoutId_ForSearchAndReplace(tableName, 
				columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
		return dro;
	}
	
	
	
	// .../api/insertvalue
	// insert a new record into a table
	@Path("insertvalue")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecord(
			@FormParam("table_name") String tableName,
			@FormParam("column_name") String columnName,
			@FormParam("value") String newValue,
			@FormParam("returning") String returningField,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
				
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Insert record into "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		Util.debug(co, "'"+returningField+"'");
		
		DbResponseObject dro = new DbResponseObject(); 
		
				
		String[] newValues = newValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		if (returningField == null || returningField.toLowerCase().equals("null") || returningField.isEmpty()) {
			getDatabaseObject(co).insertRecord(tableName, columnNames, newValues, dro);			
		}
		else {
			// insert record and get its id
			getDatabaseObject(co).insertRecordAndGetItsId(tableName, columnNames, newValues, returningField, dro);			
		}
		
		return dro;
	}
	
	
	
	// .../api/duplicaterecord
	// duplicate a record in a table and get its id
	@Path("duplicaterecord")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject duplicateRecord(
			@FormParam("table_name") String tableName,
			@FormParam("columns_to_skip") String columnsToSkip,
			@FormParam("pk_substitute") String pkSubstitute,
			@FormParam("pk_value") String pkValue,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Duplicate record in "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		Util.debug(co, "'"+pkValue+"'");
		
		DbResponseObject dro = new DbResponseObject();		
				
		String[] columnsToSkipArr = columnsToSkip.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		// duplicate record and get its id
		getDatabaseObject(co).duplicateRecordAndGetItsId(tableName, columnsToSkipArr, pkSubstitute, pkValue, dro);		
		
		return dro;
	}
	
	
	// .../tabel/insertmodified
	// insert some new records based on existing records with ids
	// which will be re-inserted with modified values, according to some patterns and replacement strings
	@Path("insertmodified")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecordModified(
			@FormParam("table_name") String tableName,
			@FormParam("filter_column_name") String filterColumnName,
			@FormParam("filter_value") String filterValue,
			@FormParam("replacement_value") String replacementValue,
			@FormParam("column_to_copy") String columnToCopy,
			@FormParam("row_id") String rowId,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Insert modified record into "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
		
		String[] rowIds = rowId.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnsToCopy = columnToCopy.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		if (columnsToCopy[0].isEmpty()) columnsToCopy = null;
		
		
		getDatabaseObject(co).insertFromExistingRecords(tableName, 
				rowIds, columnsToCopy, filterColumnName, filterValue, replacementValue, 
				dro);
		
		
		return dro;
	}

	
	
	// .../tabel/insertmodified_without_id
	// insert some new records based on existing records
	// which will be re-inserted with modified values, according to some patterns and replacement strings
	@Path("insertmodified_without_id")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecordModifiedWithoutId(
			@FormParam("table_name") String tableName,
			@FormParam("filter_column_name") String filterColumnName,
			@FormParam("filter_value") String filterValue,
			@FormParam("replacement_column_name") String replacementColumnName,
			@FormParam("replacement_value") String replacementValue,
			@FormParam("returning") String returningField,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Insert modified record without id into "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
		
		String[] filterColumnNames = filterColumnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] filterValues = filterValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] replacementColumnNames = replacementColumnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] replacementValues = replacementValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		getDatabaseObject(co).insertFromExistingRecordsWithoutId(tableName, 
				filterColumnNames, filterValues, replacementColumnNames, replacementValues, 
				returningField, dro);		
		
		return dro;
	}
	
	
	// .../api/delete_row
	// delete a record from a table, given its id
	@Path("delete_row")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject deleteRecord(
			@FormParam("table_name") String tableName,
			@FormParam("row_id") String rowId,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Delete record from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 				
		
		getDatabaseObject(co).deleteRecord(tableName, rowId, dro);
		
		return dro;
	}

	
	
	
	// .../api/delete_row_without_id
	// delete a record from a table, 
	// given some column names and values to match
	@Path("delete_row_without_id")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject deleteRecordWithoutId(
			@FormParam("table_name") String tableName,
			@FormParam("column_name") String columnName,
			@FormParam("value") String value,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Delete record(s) (without ids) from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		String[] values = value.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		DbResponseObject dro = new DbResponseObject(); 
				
		getDatabaseObject(co).deleteRecordWithoutId(tableName, columnNames, values, dro);
		
		return dro;
	}

	
	

	// .../api/gettables
	@Path("gettables")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TablesListObject getTables(
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = lexitInfo.getUserName(httpServletRequest);
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "We are running Java version " +
				System.getProperty("java.version") +
				" from "+
				System.getProperty("java.vendor"));
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		TablesListObject listOfTables = new TablesListObject();
		
		listOfTables.setTablesAndDescriptions(getDatabaseObject(co).getTableList());
		
	return listOfTables;
	}
	
	
	// .../api/get_neutral_separator
	// get all the unique values a column may contain (needed for select boxes)
	@Path("get_neutral_separator")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getNeutralSeparator(
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			)
	  {
		
		DbResponseObject dro = new DbResponseObject(); 
		
		try {			
			dro.setResponse( Constants.ARG_INTERNAL_SEPARATOR );
			
			// since the getNeutralSeparator function if always the very first server function to be called
			// this is the time to initialize the LexitSchemaAccess object:
			// it gives us access to the lex'it users login and roles
					
			if (lexitInfo == null)
				lexitInfo = new LexitSchemaAccess(context, false);
		
		}
		catch (Exception e) {
			
			StringWriter stringWriter = new StringWriter();
	        PrintWriter printWriter = new PrintWriter(stringWriter);
	        e.printStackTrace(printWriter);
			String stackTrace = stringWriter.toString();
			
			throw new RuntimeException(stackTrace);
		}

		return dro;
	  }


	@Path("upload_file")
	@POST
	@Consumes(MediaType.MULTIPART_FORM_DATA)	
	public DbResponseObject uploadFile(
			@FormDataParam("file") InputStream fileInputStream,
			@FormDataParam("file") FormDataContentDisposition fileMetaData,
			@FormDataParam("db") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws Exception {

		String userName = lexitInfo.getUserName(httpServletRequest);		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());

		DbResponseObject ro = getDatabaseObject(co).convertFileIntoTable(dbName, fileInputStream, fileMetaData);

		fileInputStream.close(); // avoid memory leaks!

		return ro;
	}
	
	@Path("remove_uploaded_table")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject removeUploadedFile(
			@FormParam("db_name") String dbName,
			@FormParam("table_name") String tableName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws Exception {

		String userName = lexitInfo.getUserName(httpServletRequest);		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		if ( !userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());

		DbResponseObject ro = getDatabaseObject(co).removeUploadedFile(tableName);

		return ro;
	}

	
	
	// .../api/gettable
	@Path("gettable")
	@POST
	@Produces({MediaType.APPLICATION_JSON})
	public ResultObject getTable(
			String requestBody, 
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		
		// Get the request body into a hash
		
		String[] requestBodyArr = requestBody.split("&");
		ConcurrentHashMap<String, String> requestBodyMap = new ConcurrentHashMap<String, String>();
		int iNumberOfColumns = 0;
		int iNumberOfSortedColumns = 0;
		
		
		for (int i=0; i<requestBodyArr.length; i++) {
			
			String onePair =	requestBodyArr[i];
			String key = 		onePair.split("=")[0];
			String value = 		(onePair.split("=").length>1) ? onePair.split("=")[1] : ""; // make sure we have at least an empty string (no null!)
			
			// first decode the values (as those might be URL encoded)
			try {				
				key = 	java.net.URLDecoder.decode(key, "UTF-8");
				value =	java.net.URLDecoder.decode(value, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				throw new RuntimeException("Error while parsing the requestBody", e);
			}
		
			
			// if we encounter a column parameter, increase columns counter
			if (key.startsWith("columns[") && key.endsWith("name]"))
				iNumberOfColumns++;
			
			// if we encounter a sorted column, increase sorted columns counter
			if (key.startsWith("order[") && key.endsWith("[column]"))
				iNumberOfSortedColumns++;
			
			// put the key/value into our requestBodyMap
			requestBodyMap.put(key, value);
			
		}
		
		
		
		// ---------------------------------------------------------
		// we have a parsed request body, now extract all parameters
		// ---------------------------------------------------------
		
		String dbName = 			requestBodyMap.get("sDbName");
		String sForceExactCount =	requestBodyMap.get("bForceExactCount");
		String tableName = 			requestBodyMap.get("sTableName");
		String sGoToRowIds = 		requestBodyMap.get("sGoToRowIds");
		String sSearch =			requestBodyMap.get("search[value]");
		
		String sDisplayStart = 		requestBodyMap.get("start");
		int iDisplayStart = 		sDisplayStart.equalsIgnoreCase("null") ? 0 : Integer.parseInt(sDisplayStart);
		String sDisplayLength =		requestBodyMap.get("length");
		int iDisplayLength =		sDisplayLength.equalsIgnoreCase("null") ? 10 : Integer.parseInt(sDisplayLength);
		String sEcho =				requestBodyMap.get("draw");
		int iEcho =					sEcho.equalsIgnoreCase("null") ? 0 : Integer.parseInt(sEcho);
		
		
		// column names and search values parameters
		
		ArrayList<String> aAllColumnsList = new ArrayList<String>();
		ArrayList<String>  aAllColumnSearchValuesList = new ArrayList<String>();
		
		for (int i = 0; i<iNumberOfColumns; i++) {
			
			String sColumnKey = "columns["+i+"][name]";
			String sColumnSearchKey = "columns["+i+"][search][value]";
			
			String sColumnValue = requestBodyMap.get(sColumnKey);
			String sColumnSearchValue = requestBodyMap.get(sColumnSearchKey);
			sColumnSearchValue = (sColumnSearchValue == null) ? "" : sColumnSearchValue;
			
			aAllColumnsList.add(sColumnValue);
			aAllColumnSearchValuesList.add(sColumnSearchValue);
			
		}

		// convert to arrays
		String[] aAllColumns = new String[iNumberOfColumns];
		aAllColumns = aAllColumnsList.toArray(aAllColumns);
		String[] aAllColumnSearchValues = new String[iNumberOfColumns];
		aAllColumnSearchValues = aAllColumnSearchValuesList.toArray(aAllColumnSearchValues);
		
		
		// sorted columns
		
		ArrayList<String> tmpSortCol = new ArrayList<String>();
		ArrayList<String> tmpSortDir = new ArrayList<String>();
		
		// it might happen that no sorting was set,
		// in that case, we add a default sorted column
		if (iNumberOfSortedColumns == 0) {
			tmpSortCol.add( aAllColumns[0] );
			tmpSortDir.add( "asc" );
		}
		
		// now set the sorted columns arrays
		for (int i = 0; i<iNumberOfSortedColumns ; i++) {
			
			String sSortedColumn = "order["+i+"][column]";
			String sSortedColumnDir = "order["+i+"][dir]";
			
			int iSortCol = Integer.parseInt(requestBodyMap.get(sSortedColumn));
			String sSortDir = requestBodyMap.get(sSortedColumnDir);
			
			// Sanity check
			if (!sSortDir.toLowerCase().matches("^(asc|asc_reverse|desc|desc_reverse|nulls first|nulls last)$")) {
				throw new RuntimeException("Illegal sort direction in request: "+sSortDir);
			}
			
			tmpSortCol.add( aAllColumns[iSortCol] );
			tmpSortDir.add( sSortDir );
		}
		
		// convert to arrays
		String[] aSortCol = tmpSortCol.toArray(new String[tmpSortCol.size()]);
		String[] aSortDir = tmpSortDir.toArray(new String[tmpSortDir.size()]);
				
		
		
		// ---------------------------------------
		// now we have all parameters, do the job!
		// ---------------------------------------
		
		// get context object, given the current database name
		String userName = lexitInfo.getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		// is exact count required by the user for this call?		
		getDatabaseObject(co).setForceExactCount( sForceExactCount.equalsIgnoreCase("true") );				
		
		
		Util.debug(co, "### Get table "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		
		// Compute useful part of the arrays
		// We need this because the tail of the arrays consists of empty values, since the table is mostly smaller than the max number of allowed columns
		
		int startOfEmptyRange = Util.getIndexOf("", aAllColumns);
		String[] aCleanAllColumns = startOfEmptyRange > -1 ? Arrays.copyOfRange(aAllColumns, 0, startOfEmptyRange) : aAllColumns;
		
		
		
		// search arrays: those will contain ONLY non-empty values
		// (which is the difference between these arrays and the previous ones, which contained all parameters, even when those had empty values)
		
		ArrayList<String> aSearchColumnNames = new ArrayList<String>();
		ArrayList<String> aSearchColumnValues = new ArrayList<String>();
		ArrayList<Boolean> aCaseSensitiveColumnSearch = new ArrayList<Boolean>();
		
		// Is the current call triggers by a call of the GoTo function?
		// (beware: the particular case in which we use row-ids for speed;
		//  See info at Database.getRowNumberOfRecord)
		
		
		boolean bCallForGoToFunction = !sGoToRowIds.isEmpty();   // sGoToRowIds has the form 'column name':'ids'
		
		
		// gather search data for all columns
		
		// first add the row ids searched for (this occurs only when carrying out a GoTo operation [making use of row ids -when available- for speed!])
		if ( bCallForGoToFunction ) {
			
			String idsColumn = (sGoToRowIds.split(":"))[0];	// column name
			String idsValues = (sGoToRowIds.split(":"))[1];	// ids
			int idsColumnIdx = Util.getIndexOf(idsColumn, aAllColumns);
			
			aAllColumnSearchValues[idsColumnIdx] = idsValues;
			
			// Set start position to 0, as we're targeting some row ids, so we don't want the webservice to set an offset.
			// But since this is part of a GoTo operation, we let the client think it is requesting some given page number
			// so apparently the function really behaves like a GoTo function (t.i. a navigation function, leading to some page number).
			// In reality, we've been requesting a list of row ids, and get page 1 of the results!
			iDisplayStart = 0;
		}
		
		// now gather the search data for all columns
		for (int i=0; i<aAllColumnSearchValues.length; i++) {
			
			String oneSearchColumn = aAllColumnSearchValues[i].trim();
			if ( !oneSearchColumn.isEmpty()) {
				
				aSearchColumnNames.add( aAllColumns[i] ); 				
				aSearchColumnValues.add(  setRightSearchValue(oneSearchColumn)  );
				aCaseSensitiveColumnSearch.add( setRightCaseSensitivity(oneSearchColumn) );
			}
		}
		
		
		// get the count of all records in the table (fast)
		
		Map<String, Object> countAndCountQualityOfTable = getCountOfTable(co, tableName);
		int countOfTable = (Integer) countAndCountQualityOfTable.get("count");
		boolean countQualityOfTable = (Boolean) countAndCountQualityOfTable.get("exactCount");		
		
		
		// return the table		
		return new ResultObject(getDatabaseObject(co),
				tableName, countOfTable, countQualityOfTable,
				aCleanAllColumns,
				iDisplayLength, iDisplayStart, setRightSearchValue(sSearch), 
				aSearchColumnNames, aSearchColumnValues, aCaseSensitiveColumnSearch,
				true, aSortCol, aSortDir, iEcho, bCallForGoToFunction
				);
		
	}
	
	// normally does nothing, but
	// special cases: 
	// - NULL in a string should be interpreted as null
	// - "..." means case sensitive
	// - "" should be interpreted as an empty string
	public static String setRightSearchValue(String value){
		
		if (value.equals("NULL")) {
			return null;
		}
		
		// remove quotes if they are there
		//
		// important: if we have an operator in front, split the search string into operator string and searched value
		// (like  '!word' ->  '!' and 'word') so as to process the quotes properly
		String cleanValue = Database.removeFrontOperator(value);
		String operator   = value.substring(0, value.length()-cleanValue.length());
		
		if ( (cleanValue.length()>=2 && cleanValue.startsWith("\"") && cleanValue.endsWith("\"")) 
				|| 
			 (cleanValue.length()>=2 && cleanValue.startsWith("'") && cleanValue.endsWith("'")) )
		{
			// in a jsonb query, we might have quotes which have to be kept!
			// (like {"name": "Piet"})			
			if (cleanValue.matches(".*\"[^\"]+\"[ \\s]*:[ \\s]*\"[^\"]+\".*"))
				return value;
			
			// at this point, we are sure we do have to remove the quotes, 
			// do it!
			cleanValue = cleanValue.substring(1, cleanValue.length()-1);
			if (cleanValue.isEmpty()) cleanValue = "^$";
			
			// rebuild the original search string with operator (if available; operator may be empty)
			value = operator + cleanValue;
			return value;
		}
		
		// default
		return value;
	}
	
	// normally does nothing, but
	// special cases:
	// - "..." is case sensitive
	// - in all other cases, case insensitive!
	private static boolean setRightCaseSensitivity(String value){
		
		// remove operator in front, if it's there
		// (like  '!word' -> 'word')
		String cleanValue = Database.removeFrontOperator(value);
		
		// quotes?
		if ( (cleanValue.startsWith("\"") && cleanValue.endsWith("\"")) || 
			 (cleanValue.startsWith("'") && cleanValue.endsWith("'")) ) {
			return true;
		}
		return false;
	}
	
	
	// Query and register the count of a table, or get it from cache when available
	private Map<String, Object> getCountOfTable(ContextObject co, String tableName) throws IOException{
		
		Util.debug(co, "### Get total count of "+tableName);
		
		return getDatabaseObject(co).getQuickCountOfAllTableRecords(tableName);
	}
	
	
	// return the database access object for a given database name
	private synchronized Database getDatabaseObject(ContextObject co){
		
		Database newDbObj;
				
		// first do some cleanup
		
		// get a list of 'old' ContextObjects
		
		ArrayList<String> keysToDelete = new ArrayList<String>();

		for (String key : nameToDatabaseObject.keySet()) {
			
			Database tmpDbObj = nameToDatabaseObject.get(key);			
			// unused? note it must be thrown away
			if ( tmpDbObj.getContextObject().isLeftUnused() ) {
				keysToDelete.add(key);
			}
		}
		
		// remove the 'old' ContextObjects
		
		for (String key : keysToDelete) {
			
			// remove ContextObject since it's left unused
			nameToDatabaseObject.remove(key);
			Util.debug("Removed old Database object: "+key);
		}
		
		
		// now get (or create) the database object needed
		
		// key to right database object, given current user, project and session (safe!) 
		String cachingKey = co.getUniqueIdentifier();
		
		if ( !nameToDatabaseObject.containsKey(cachingKey) ) {			
			Util.debug(co, "## >>> BOUW NIEUW DATABASE OBJECT " + cachingKey);
			newDbObj = new Database(co);
			nameToDatabaseObject.put(cachingKey, newDbObj);			
		}
		
		Util.debug(co, "## >>> PAK DATABASE OBJECT "+cachingKey);
		newDbObj = nameToDatabaseObject.get(cachingKey);
		newDbObj.updateContextObject(co); // make sure that data newly added to context object is saved in DatabaseObject
		
		return newDbObj;
	};
	
	
	// This is to be used by the spy tool
	// this function gets users' info out of the map of ContextObjects
	//
	// .../api/get_users
	@Path("get_users")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UsersListObject getListOfActiveUsers(){
		
		UsersListObject ulo = new UsersListObject();
		
		for (String key : nameToDatabaseObject.keySet()) {
			
			Database currentDbObj = nameToDatabaseObject.get(key);
			
			ContextObject co = currentDbObj.getContextObject();
		
			String dbName = co.getDbNameForSpy();
			String userName = co.getUsername();
			Date date = new Date(co.getTimeLastUsed());
			String sessionId = co.getSessionIdForSpy();
			String activeTabId = co.getActiveTabIdForSpy();
			SimpleDateFormat df2 = new SimpleDateFormat("yyyy.MM.dd 'at' HH:mm:ss");
			String lastActive = df2.format(date);
			String activeRecently = (co.userIsGone() ? "Sleep mode" : "Active now");
			
			ulo.addUserData(new String[]{dbName, (userName != null ? userName : "SYSTEM"), sessionId, (activeTabId != null ? activeTabId : "N/A"), lastActive, activeRecently});
		}
		return ulo;
	}
	
	
	
	@Path("get_connections_state")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ConnectionsListObject getConnectionsState() {
		
		ConnectionsListObject clo = new ConnectionsListObject();
		
		for (String project : AppLifecycleListener.project2DataSource.keySet()) {
    		
    		// get the source for the project
    		HikariDataSource dataSource = AppLifecycleListener.getDataSourceForSpy(project);
    		
    		// If the data source is not null, close it
    		if (dataSource != null) {	
    			HikariPoolMXBean poolMXBean = dataSource.getHikariPoolMXBean();
    			
    			int activeConnections = poolMXBean.getActiveConnections();
    			int idleConnections = poolMXBean.getIdleConnections();
    			int totalConnections = poolMXBean.getTotalConnections();
				int threadsAwaitingConnection = poolMXBean.getThreadsAwaitingConnection();				

				// add the data to the ConnectionsListObject
				clo.addConnectionData(
						new String[] { project, String.valueOf(activeConnections), String.valueOf(idleConnections),
								String.valueOf(totalConnections), String.valueOf(threadsAwaitingConnection) });
    		}
    		 
    	}
		
		
		return clo;
		
	}
	
	/**
	 * Check the user's rights
	 * - 'superuser' can read, write, delete in any database
	 * - 'superreader' can read in any database
	 * - '<dbName>_all' can read, write, delete in database <dbName>
	 * - '<dbName>_write' can read, write in database <dbName>
	 * - '<dbName>_read' can only read in database <dbName>
	 */
	private boolean userIsAllowedTo(ContextObject co, String action){
		
		// get the dbname (we need it to match the tomcat user role)		
		String dbName = co.getDbName();
		
		
		// admin project is allowed for admin, that's all
		if (dbName.equals(Constants.ADMIN_DB) && action.equals(Constants.USER_IS_ADMIN)) {
			return true;
		}
		
		// normal lex'it projects (t.i. anything BUT the admin project) 
		// are NOT allowed for admin,
		// but are allowed to any other users, it they have the right role
		else if (action.equals(Constants.USER_READ_ACCESS)) {
			return			 
			userHasRole(co, "superuser") || 
			userHasRole(co, "superreader") || 
			userHasRole(co, dbName+"_all") || 
			userHasRole(co, dbName+"_write") || 
			userHasRole(co, dbName+"_read");
		}
		else if (action.equals(Constants.USER_WRITE_ACCESS)) {
			return
			userHasRole(co, "superuser") || 
			userHasRole(co, dbName+"_all") || 
			userHasRole(co, dbName+"_write");
		}
		else if (action.equals(Constants.USER_ALL_ACCESS)) {
			return 
			userHasRole(co, "superuser") || 
			userHasRole(co, dbName+"_all");
		}	
		
		return false;
	}
	
	// check if a given role is part of an array of roles
	// (subroutine of userIsAllowedTo function)
	private boolean userHasRole(ContextObject co, String role){

		String[] roles;
		
		try {
			roles = getUserRoles(co);
			return Arrays.asList(roles).contains(role);
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		return false;
	}
	
	
	// Read the javascript configuration file from
	// the configuration directory
	public synchronized String readConfigJsFile(ContextObject co) throws IOException{
		
		Util.debug(co, "Read javascript configuration file '"+co.getDbName()+".config.js"+"'...");
		
		String fileName = co.getDbName()+".config.js";
		
		String filepath = co.getContext().getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
				File.separatorChar + Constants.CONFIG_DIR + File.separator+fileName);
		Util.debug(co, "File: "+filepath);
		
		StringBuilder sb = new StringBuilder();
		
		try{
			FileInputStream fstream = new FileInputStream(filepath);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {				
				sb.append(strLine);
				sb.append("\n");
			}
			br.close();
			in.close();
		}
		catch (Exception e){//Catch exception if any
			throw new RuntimeException("Error while reading the "+filepath+" configuration file", e);
		}
		
		return sb.toString();
	}
	
	
	public synchronized String readWelcomeJsFile(ServletContext co, String dbName) throws IOException{
		
		String fileName = dbName+".welcome.js";
		String filepath = co.getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
				File.separatorChar + Constants.CONFIG_DIR + File.separator+fileName);
		
		StringBuilder sb = new StringBuilder();
		
		try{
			FileInputStream fstream = new FileInputStream(filepath);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {				
				sb.append(strLine);
				sb.append("\n");
			}
			br.close();
			in.close();
		}
		catch (Exception e){ 
			sb = new StringBuilder();
			sb.append("NOT_AVAILABLE"); // don't change this value, as the client will check for it!
		}
		
		return sb.toString();
	}
	
	
	// same as readConfigJsFile, but specialize for the projects overview file
	public synchronized String readProjectsOverviewFile(ContextObject co) throws IOException{
		
		Util.debug(co, "Read javascript projects overview file...");
		
		String fileName = "projects_overview.js";
		
		String filepath = co.getContext().getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
				File.separatorChar + Constants.CONFIG_DIR + File.separator+fileName);
		Util.debug(co, "File: "+filepath);
		
		StringBuilder sb = new StringBuilder();
		
		try {
			FileInputStream fstream = new FileInputStream(filepath);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {				
				sb.append(strLine);
				sb.append("\n");
			}
			br.close();
			in.close();
		}
		catch (Exception e) { 
			throw new RuntimeException("Error while reading the "+filepath+" file", e);
		}
		
		return sb.toString();
	}
	
	
	// read the users access rights file
	public String[] getUserRoles(ContextObject co) throws IOException {
		
		// if the access rights file has already been read,
		// return relevant content right away
		
		if (users2roles != null && co.getUsername() != null && users2roles.containsKey(co.getUsername())) {
			Util.debug(co, "Get user access rights from cache");
			//lexitInfo.showCurrentContent();
			return users2roles.get(co.getUsername());
		}			
		
		
		// if the access rights file hasn't been read yet
		// read it now  (only one thread at the time)		
		
		synchronized (TableResources.class){
			
			try {
				Util.debug(co, "Read user access rights...");			
				users2roles = lexitInfo.getUsersRoles();			
				return users2roles.get(co.getUsername());
			}
			catch (NullPointerException e) {
				// this may happen when the access rights file is not available
                // or when the user is not logged in
                Util.debug(co, "No user roles found for user "+co.getUsername() + ". The user might not be logged in.");
                return new String[]{};
            }
            
		}		
		
	}

	
}
