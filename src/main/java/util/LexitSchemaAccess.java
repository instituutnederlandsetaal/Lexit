package util;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.xml.bind.DatatypeConverter;

import resources.Constants;
import resources.ContextObject;

/**
 * This class deals with user accounts, access rights, etc. 
 */

public class LexitSchemaAccess {
	
	// default name of the Lex'it schema database
	private String lexitSchemaFileName = Constants.ADMIN_CONFIG_FILENAME+".database";
	
	// database communication object (to be initialized)
	private PostgresConnectionManager dc;
	
	// Lex'it schema database login info
	private ConcurrentHashMap<String, String> lexitSchemaAccessHash = new ConcurrentHashMap<String, String>();
	
	// users login info
	private ConcurrentHashMap<String, String> users2passwords = new ConcurrentHashMap<String, String>();
	
	// users access roles
	private ConcurrentHashMap<String, String[]> users2roles = new ConcurrentHashMap<String, String[]>();
	
	// session id to username (needed for local login)
	private ConcurrentHashMap<String, String> sessionIds2users = new ConcurrentHashMap<String, String>();
	private ConcurrentHashMap<String, Long> sessionIds2generationTime = new ConcurrentHashMap<String, Long>();
	
	
	
	// ------------------------------------------------------------------------
	
	/**
	 * Constructor
	 * the update parameter instructs the function to reload, so as to take new users' roles etc into account
	 * @param context
	 * @param update
	 */
	public LexitSchemaAccess(ServletContext context, boolean update){
		
		Util.debug("Instantiating Lexit schema access");
		
		// contact the database only if it has not be done yet, 
		//                        or if we are instructed to update our knowledge of it
		
		if (update || lexitSchemaAccessHash.size() == 0) {
		
			try {
				// read login into
				readLexitSchemaLoginInfoFile(context);
				
				// create database if it does not exist yet (this is supposed to be a one-time operation)
				createUsersTableIfNotExists();
								
				// get info out of it
				readUsersLogins();
				readUsersRoles();
				
				
			} catch (IOException e) {
				String error = Util.getDebugInfoForConsole("Error while reading the '"+lexitSchemaFileName+"' properties file", new String[] {});
				throw new RuntimeException(error, e);
			}
		}
		
	};
	
	
	/**
	 * Redresh the users and roles info
	 */
	public void refresh() {
		
		users2passwords = new ConcurrentHashMap<String, String>();
		users2roles = new ConcurrentHashMap<String, String[]>();
		
		readUsersLogins();
		readUsersRoles();
	}
	
	
	/**
	 * Create the users table if it does not exist yet
	 */
	private void createUsersTableIfNotExists() {
		
		String query = 
				"DO $$ "
				+ "BEGIN "
				+ "		"
				+ "		CREATE TABLE IF NOT EXISTS \""+ lexitSchemaAccessHash.get("schema") +"\".users ( "
				+ "		    id serial, "
				+ "		    username text, "
				+ "		    password text, "
				+ "		    default_access_role text, "
				+ "		    CONSTRAINT users_unique UNIQUE (username) "
				+ "		); "
				+ "		"
				+ "		CREATE TABLE IF NOT EXISTS \""+ lexitSchemaAccessHash.get("schema") +"\".users_roles ( "
				+ "		    user_id integer, "
				+ "		    projectname text, "  // config filename
				+ "		    access_role text, "
				+ "		    CONSTRAINT users_roles_unique UNIQUE (user_id, projectname, access_role) "
				+ "		); "
				+ "		"
				+ "		"
				+ "		CREATE TABLE IF NOT EXISTS \""+ lexitSchemaAccessHash.get("schema") +"\".projects ( "
				+ "		    project_id serial, "
				+ "		    projectname text, "  // config filename
				+ "		    name  text, "		 // human readable project name
				+ "		    description  text, " // human readable project description
				+ "		    status  text, "
				+ "		    order_in_menu  integer, "
				+ "		    message  text, "
				+ "		    redirect  text, "
				+ "		    CONSTRAINT projects_unique UNIQUE (projectname, name, description, status) "
				+ "		); "
				+ "		"
				+ "		CREATE TABLE IF NOT EXISTS \""+ lexitSchemaAccessHash.get("schema") +"\".statuses ( "
				+ "		    status  text, "
				+ "		    description text, "
				+ "         priority integer,"	// which status must come first in the menu
				+ "		    CONSTRAINT statuses_unique UNIQUE (status) "
				+ "		); "
				+ "		"
				+ "		INSERT INTO \""+ lexitSchemaAccessHash.get("schema") +"\".users(id, username, password, default_access_role) "
						// admin user
						// id specified on purpose, since the password encoding depends on it
				+ "		VALUES ("+ Constants.ADMIN_ID +", '"+ Constants.ADMIN_USER +"', '7d0a0ba4bef831bf484c647fd5a2cf82da5d3ddbd5443a7ae2b02aa455827662', '"+ Constants.ADMIN_USER_DEFAULT_ROLE +"') "
				+ "		ON CONFLICT DO NOTHING; "
				+ "		"
				        // public reader user
						// (password null on purpose, since this user must be able to login without a password)				
				+ "		INSERT INTO \""+ lexitSchemaAccessHash.get("schema") +"\".users(username, password, default_access_role) "
						// admin user
				+ "		VALUES ('"+ Constants.PUBLIC_READER_USER +"', null, '"+ Constants.PUBLIC_READER_DEFAULT_ROLE +"') "
				+ "		ON CONFLICT DO NOTHING; "
				+ "		"
				+ "		INSERT INTO \""+ lexitSchemaAccessHash.get("schema") +"\".projects(projectname, name, description, status, order_in_menu) "
				+ "		VALUES ('spy', 'Loginoverzicht', 'Overzicht actieve accounts en connecties (wordt om de 2 sec bijgewerkt)', 'goody', 0), "
				+ "		       ('admin', 'Gebruikersbeheer', 'Gebruikersbeheer', 'goody', 1), "
				+ "		       ('reset_user_rights', 'Toegangsrechten verversen', 'Handmatig toegangsrechten verversen', 'goody', 2) "
				+ "		ON CONFLICT DO NOTHING; "
				+ "		"
				+ "		INSERT INTO \""+ lexitSchemaAccessHash.get("schema") +"\".statuses(status, description, priority) "
				+ "		VALUES ('production', '', 0), "
				+ "		       ('goody', '', 1), "
				+ "		       ('development', '', 2), "
				+ "		       ('closed', '', 3), "
				+ "		       ('unknown', '', 4) "
				+ "		ON CONFLICT DO NOTHING; "
				+ "		"
				+ "END "
				+ "$$;";
		
		// connect to the lex'it schema database 
		dc = getPostgresConnectionManager();
	
		try {
			dc.sendUpdate(lexitSchemaAccessHash.get("schema"), query);
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Creating the "+ Constants.ADMIN_CONFIG_FILENAME +" content caused an error", new String[] {});
			throw new RuntimeException(error, e);
		}
	}
	
	
	/**
	 * Change the admin password
	 * 
	 * @param oldPassword
	 * @param newPassword
	 */
	public void changeAdminPassword(String oldPassword, String newPassword) {
		
		// check old password
		if (!checkCredentials(Constants.ADMIN_USER, oldPassword)) {
			String error = Util.getDebugInfoForConsole("Old admin password is incorrect.", new String[] {});
			throw new RuntimeException(error);
		}

		// encode the new password
		int idOfUser = getIdOfUser(Constants.ADMIN_USER);
		String salt = getSalt(idOfUser);
		String passwordEncoded = getSha256EncodedPassword(newPassword, salt);

		// connect to the lex'it schema database
		dc = getPostgresConnectionManager();

		String schemaName = "\"" + lexitSchemaAccessHash.get("schema") + "\"";

		String query = 
				"UPDATE " + schemaName + ".users " + 
				"SET password = ? " + 
				"WHERE username = ?;";

		String[] args = new String[] { passwordEncoded, Constants.ADMIN_USER };
		ArgumentTypesObject ato = new ArgumentTypesObject();
		ato.addType("text");
		ato.addType("text");

		try {
			dc.sendPreparedUpdate(schemaName, query, args, ato, null);
			// update local copy of users and passwords
			users2passwords.put(Constants.ADMIN_USER, passwordEncoded);
			
		} catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Changing the admin password caused an error", new String[] {Constants.ADMIN_USER});
			throw new RuntimeException(error, e);
		}
		
	}
	
	
	/**
	 * Show the current content of the users, passwords and roles
	 * For visual check
	 */
	public void showCurrentContent() {
		
		
		System.out.println("=== Users and passwords === ");
		Set<String> keys = users2passwords.keySet();		
        for (String key : keys) {        	
        	System.out.println("User ["+ key + "] has password [" + users2passwords.get(key) + "]" );        	
        }
        System.out.println("=============== ");
        System.out.println();
		
        System.out.println("=== Users and Roles === ");
		keys = users2roles.keySet();		
        for (String key : keys) {        	
        	System.out.println("User ["+ key + "] has roles [" + Util.join(users2roles.get(key), ",") + "]" );        	
        }
        
        System.out.println("=============== ");
        System.out.println();
        
        System.out.println("=== Session IDs to Users === ");
        keys = sessionIds2users.keySet();		
        for (String key : keys) {        	
        	System.out.println("Session ID ["+ key + "] refers to user [" + sessionIds2users.get(key) + "]" );        	
        }
        
        System.out.println("=============== ");
        
        
	}
	
	
	
	/**
	 * Register a session ID corresponding to a given username,
	 * this is needed because - after login - the session ID is the only request parameter allowing us to identify a user
	 * @param sessionId
	 * @param username
	 */
	public void setSessionIdIsUsername(String sessionId, String username) {
		
		Util.debug(sessionId + " represents "+username);
		
		sessionIds2users.put(sessionId, username);
		sessionIds2generationTime.put(sessionId, (new Date().getTime()) );
		
		// if some saved sessionID is older than the max allowed duration, remove it
		for (String key : sessionIds2users.keySet()) {
			
			Util.debug(key + " => "+sessionIds2users.get(key));			
			if ( (new Date().getTime() - sessionIds2generationTime.get(key)) > Constants.MAX_SESSION_ID_DURATION ) {
								
				removeSessionId(key);
			}
				
		}
	}
	

	
	/**
	 * Remove a session ID from the list of registered session IDs
	 * @param sessionId
	 */
	private void removeSessionId(String sessionId) {
		sessionIds2users.remove(sessionId);
		sessionIds2generationTime.remove(sessionId);
	}
	

	
	/**
	 * User roles getter
	 * @return
	 */
	public ConcurrentHashMap<String, String[]> getUsersRoles(){
		return users2roles;		
	}
	
	

	
	/**
	 * Get/compute the username
	 * the way the username is retrieved depends on the way a user logged in.
	 * - in Clarin login, we read the remote_user header param
	 * - in normal mode, we read the username assigned to the current session ID header param
	 *   (after login, the session ID is the only request parameter allowing us to identify a user)
	 * @param httpServletRequest
	 * @return
	 */
	public String getUserName(HttpServletRequest httpServletRequest) {
		
		// first try Clarin login
		String userName = httpServletRequest.getHeader("remote_user");
		if (userName == null) {
			userName = httpServletRequest.getHeader("remote-user");
		}
		
		// get the session Id
		String sessionId = getSessionId(httpServletRequest);
		
		
		// if Clarin login username does exist, register this user as superuser by default
		// (this role might be overwritten by the user's actual roles, if any was saved in the database)
		if (userName != null) {
			users2roles.put(userName, new String[] { "superuser" });
			this.setSessionIdIsUsername(sessionId, userName);
		}
		
		

		Util.debug( "remote_user = "+userName );
		Util.debug( "session ID = "+sessionId );
		
		// at this point, if we don't have a Clarin login username,
		// we try to get the username from the session ID
		if (userName == null)
			userName = sessionIds2users.get(sessionId);
		
		for (String key : sessionIds2users.keySet()) {
			Util.debug(key + " => "+sessionIds2users.get(key));
		}
			
		Util.debug( "computed username = "+userName );
		
		if (userName == null)
			Util.debug("Couldn't identify the user!");
		
		return userName;	
	}
	
	/**
	 * Retrieve the session ID from the request
     * (might be shibSession if using Clarin login, or the session ID otherwise)
     * 
	 * @param request
	 * @return
	 */
	public String getSessionId(HttpServletRequest request) {

		String sessionId = getShibSession(request);
		if (sessionId == null)
			sessionId = request.getSession().getId();

		return sessionId;
	}
	
	
	/**
	 * Retrieve the Shibboleth session ID from the cookies (when using Clarin login)
	 * 
	 * @param request
	 * @return
	 */
	private String getShibSession(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().startsWith("_shibsession_")) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
	
	
	/**
	 * Create a PostgresConnectionManager to access the Lex'it schema database
	 * @return
	 */
	private PostgresConnectionManager createPostgresConnectionManager() {

		ContextObject co = new ContextObject(Constants.ADMIN_CONFIG_FILENAME, lexitSchemaAccessHash.get("user"));
		PostgresConnectionManager postgresDc = new PostgresConnectionManager(co, true, Constants.maxPoolSize);		
		postgresDc.createDataSourceInPool(	lexitSchemaAccessHash.get("host"), 
											lexitSchemaAccessHash.get("port"), 
											lexitSchemaAccessHash.get("db"), 
											lexitSchemaAccessHash.get("user"), 
											lexitSchemaAccessHash.get("pass"));
		
		return postgresDc;		
	}
	
	/**
	 * Retrieve the PostgresConnectionManager to access the Lex'it schema database
	 * @return
	 */
	private PostgresConnectionManager getPostgresConnectionManager() {
		if (this.dc == null) {
			Util.debug("Reconnect to database");
			this.dc = createPostgresConnectionManager();
		}
		return this.dc;
	}
	
	
	
	
	
	/**
	 * Check if a username / password combination is ok to be allowed in.
	 * 
	 * @param username
	 * @param password
	 * @return
	 */
	public boolean checkCredentials(String username, String password) {
		
		// get encoded password from database
		String encodedPasswordInDatabase = users2passwords.get(username);
		
		// generate encoded version of given password
		int idOfUser = getIdOfUser(username);		
		String salt = getSalt(idOfUser);
		String sha256EncodedPassword = getSha256EncodedPassword(password, salt);		
		
		// compare passwords given sha256 conversion  		
		if (sha256EncodedPassword.equalsIgnoreCase(encodedPasswordInDatabase))
			return true;
						
		// if sha256 comparison failed, try md5 comparison (for backwards compatibility)
		String md5EncodedPassword = getMD5EncodedPassword(password);
		if (md5EncodedPassword.equalsIgnoreCase(encodedPasswordInDatabase))
			return true;
		
		// all attempts failed
		return false;
	}
	
	
	/**
	 * Log out a user
	 * 
	 * @param username
	 */
	public void logOutUser(String username) {

		// remove the session ID - username correspondance
		for (String key : sessionIds2users.keySet()) {
			if (sessionIds2users.get(key).equals(username)) {
				removeSessionId(key);
			}
		}
	}
	
	
	/**
	 * Read the users login info frm the database
	 */
	private void readUsersLogins() {
		
		// connect to the lex'it schema database 
		dc = getPostgresConnectionManager();
		
		String schemaName = "\""+lexitSchemaAccessHash.get("schema")+"\"";
		
		String query = 
				"SELECT username, password "+
				"FROM "+schemaName+".users;";
		
		ArrayList<String[]> res;
	    
	    try {
	      
	    	List<Map<String, Object>>  rs = dc.sendQuery(schemaName, query, 0).getRows();

	    	res = Util.getResultSetCopyInAList(rs, new String[] { "username", "password" });
	    	if (res.size() > 0) {
	    		for (String[] oneRecord : res){
	    			String user = oneRecord[0].trim();
	    			String pass = oneRecord[1].trim();	    			
	    			users2passwords.put(user, pass);
	    			
	    		}
	        
	    	}
	    }
	    catch (Exception e) {  	    	
	    	String error = Util.getDebugInfoForConsole("Reading the users login info caused an error", new String[] {});
	    	throw new RuntimeException(error, e);
	    }
		
	}
	
	
	/**
	 * Read the users roles info from the database
	 * 
	 */
	private void readUsersRoles() {
		
		// connect to the lex'it schema database 
		dc = getPostgresConnectionManager();
		
		String schemaName = "\""+lexitSchemaAccessHash.get("schema")+"\"";
		
		String query = 
				"SELECT t.username, string_agg(t.role, ',') as roles "+
				"FROM ("+
				"	(SELECT u.username, u.default_access_role AS role "+
				"	 FROM "+schemaName+".users u) "+
				"	UNION "+
				"	(SELECT u.username, (r.projectname||'_'||r.access_role) AS role "+
				"	 FROM "+schemaName+".users u, "+schemaName+".users_roles r "+
				"	 WHERE u.id = r.user_id "+ 
				"	) "+
				") t "+
				"GROUP BY t.username "+
				"ORDER BY t.username;";
		
		ArrayList<String[]> res;
	    
	    try {
	      
	    	List<Map<String, Object>> rs = dc.sendQuery(schemaName, query, 0).getRows();
			
			res = Util.getResultSetCopyInAList(rs, new String[] { "username", "roles" });
			if (res.size() > 0) {
			    for (String[] oneRecord : res){
			    	users2roles.put(oneRecord[0].trim(), oneRecord[1].trim().split(","));
			    }
			    
			}
	    }
	    catch (Exception e) {  	    	
	    	String error = Util.getDebugInfoForConsole("Reading the users roles caused an error", new String[] {});
	    	throw new RuntimeException(error, e);
	    }

	}
	
	
	/**
	 * Delete a user from the database.
	 * @param username
	 */
	public void deleteUser(String username) {
		
		// the publicreader can't be deleted (delete its roles instead, so it's powerless!)
		if (username.equals(Constants.PUBLIC_READER_USER))
			return;
		

		// connect to the lex'it schema database
		dc = getPostgresConnectionManager();

		String schemaName = "\"" + lexitSchemaAccessHash.get("schema") + "\"";
		
		String deleteUserQuery1 = "DELETE FROM " + schemaName + ".users_roles " + "WHERE user_id = (SELECT id FROM " + schemaName + ".users WHERE username = ?);";
		String deleteUserQuery2 = "DELETE FROM " + schemaName + ".users " + "WHERE username = ?;";

		String[] deleteUserArgs = new String[] { username };
		ArgumentTypesObject deleteUserAto = new ArgumentTypesObject();
		deleteUserAto.addType("text");

		try {
			dc.sendPreparedUpdate(schemaName, deleteUserQuery1, deleteUserArgs, deleteUserAto, null);
			dc.sendPreparedUpdate(schemaName, deleteUserQuery2, deleteUserArgs, deleteUserAto, null);
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Deleting a user caused an error", new String[] {username});
			throw new RuntimeException(error, e);			
		} 
	}
	
	
	/**
	 * delete a role for a given user
	 * @param username
	 * @param dbName
	 */
	public void deleteProjectRoleForUser(String username, String dbName) {

		// connect to the lex'it schema database
		dc = getPostgresConnectionManager();

		String schemaName = "\"" + lexitSchemaAccessHash.get("schema") + "\"";

		String deleteUserQuery = 
				"DELETE FROM " + schemaName + ".users_roles " + 
				"WHERE user_id = (SELECT id FROM " + schemaName + ".users WHERE username = ?) "+
				"AND projectname = ?;";

		String[] deleteUserArgs = new String[] { username, dbName };
		ArgumentTypesObject deleteUserAto = new ArgumentTypesObject();
		deleteUserAto.addType("text");
		deleteUserAto.addType("text");

		try {
			dc.sendPreparedUpdate(schemaName, deleteUserQuery, deleteUserArgs, deleteUserAto, null);
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Deleting a user caused an error", new String[] {username, dbName});
			throw new RuntimeException(error, e);
		} 
	}
	
	/**
	 * Retrieve the default role of a user (superreader, superuser, or none)
	 * @param username
	 * @return
	 */
	public String getUsersDefaultRole(String username) {
	
		// get the default role of a user		
		String role = null;
		
		
		// connect to the lex'it schema database		
		dc = getPostgresConnectionManager();
		
		String schemaName = "\""+lexitSchemaAccessHash.get("schema")+"\"";
		
		String query = "SELECT default_access_role " + "FROM " + schemaName + ".users " + "WHERE username = ?;";
		
		String[] queryArgs = new String[] { username };
		ArgumentTypesObject queryAto = new ArgumentTypesObject();
		
		queryAto.addType("text");
		
		ArrayList<String[]> res;
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schemaName, query, queryArgs, queryAto, 0).getRows();

			res = Util.getResultSetCopyInAList(rs, new String[] { "default_access_role" });
			if (res.size() > 0) {
				role = res.get(0)[0];
			}
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Reading the default role of a user caused an error", new String[] {username});
			throw new RuntimeException(error, e);
		} 
		
		return role;
	}	
	
	
	/**
	 * Add a user and project role
	 * @param username
	 * @param password
	 * @param defaultRole
	 * @param dbName
	 * @param role
	 */
	public void setUserWithRole(String username, String password, String defaultRole, String dbName, String role) {
		
		String schemaName = "\""+lexitSchemaAccessHash.get("schema")+"\"";
		
		// first of all: make sure that the publicreader is not messed up with!
		
		if (username.equals(Constants.PUBLIC_READER_USER)) {
			
			// changing the default role of the public reader is not allowed (we want to prevent it from getting to much rights)
			defaultRole = Constants.PUBLIC_READER_DEFAULT_ROLE;
			
			// the public reader is not allowed to have a writing role in the database
        	// so, any attempt to give it a writing role will be ignored (this is: converted back into reading role)
			role = Constants.USER_READ_ACCESS;		
			
			// the public reader is not supposed to have a password (it won't be checked anyway)
			password = null;
		}
				
		
		
		// encode the password 
		
		String passwordEncoded = null;		
		
		if (password != null && !password.trim().isEmpty()) {
			
			// if user already exists, we need its id to compute the password
			int idOfUser = getIdOfUser(username);
			// otherwise get the id that will be assigned to it
			if (idOfUser < 0) {
				idOfUser = getTheNextValueOfASequence(schemaName, "users", "id");
			} 
			String salt = getSalt(idOfUser); 
			passwordEncoded = getSha256EncodedPassword(password, salt);
		}
		
		
		// if password and default role are given, save those!
		
		if (defaultRole != null && !defaultRole.trim().isEmpty()) {
			
			// connect to the lex'it schema database 
			dc = getPostgresConnectionManager();
			
			String addUserQuery = 
					"INSERT INTO "+schemaName+".users(username, password, default_access_role) "+
					"VALUES (?, ?, ?) "+				
					"ON CONFLICT (username) "+
					"DO UPDATE SET default_access_role = '"+defaultRole+"' " +( (passwordEncoded != null ) ? ", password = '"+passwordEncoded+"'" : "") + " "+
					"WHERE "+schemaName+".users.username = ?;";
			
			String[] addUserArgs = new String[] {username, passwordEncoded, defaultRole, username}; 
	    	ArgumentTypesObject addUserAto = new ArgumentTypesObject();
	    	addUserAto.addType("text");
	    	addUserAto.addType("text");
	    	addUserAto.addType("text");
	    	addUserAto.addType("text");
	    	
	    	
	    	
	    	try {
	    		dc.sendPreparedUpdate(schemaName, addUserQuery, addUserArgs, addUserAto, null);
	  	    }
	  	    catch (Exception e) {  	    	
	  	    	String error = Util.getDebugInfoForConsole("Adding a user caused an error", new String[] {username, defaultRole});
	  	    	throw new RuntimeException(error, e);
	  	    }
		}
			
    	
    	
    	// now add the specific project role
    	
    	if ((dbName != null && !dbName.isEmpty() && !dbName.equals("null")) 
    			&& 
    		(role != null && !role.isEmpty() && !role.equals("null") )) {
    		
    		
    		// first delete the previous role of the user for this project
    		
    		dc = getPostgresConnectionManager();
    		
    		String deletePreviousRole = 
    				"DELETE FROM "+schemaName+".users_roles "+
    				"WHERE user_id = (SELECT id FROM "+schemaName+".users WHERE username = ?) "+
    				"AND projectname = ?;"; 
    		
    		String[] deletePreviousRoleArgs = new String[] {username, dbName.trim()}; 
        	ArgumentTypesObject deletePreviousRoleAto = new ArgumentTypesObject();
        	deletePreviousRoleAto.addType("text");
        	deletePreviousRoleAto.addType("text");
        	
        	try {
        		dc.sendPreparedUpdate(schemaName, deletePreviousRole, deletePreviousRoleArgs, deletePreviousRoleAto, null);
    	    }
    	    catch (Exception e) {  	    
    	    	String error = Util.getDebugInfoForConsole("Removing old user role caused an error", deletePreviousRoleArgs);
    	    	throw new RuntimeException(error, e);
    	    }
        	
        	
        	// now, write the new role of the user for this project        	   		
        	        	
    		String addUserRoleQuery = 
    				"INSERT INTO "+schemaName+".users_roles(user_id, projectname, access_role) "+
    				"SELECT id, '"+dbName+"', '"+role+"' "+
    				"FROM "+schemaName+".users "+
    				"WHERE username = ? "+
    				"ON CONFLICT (user_id, projectname, access_role) DO NOTHING;";
        	
        	String[] addUserRoleArgs = new String[] {username}; 
        	ArgumentTypesObject addUserRoleAto = new ArgumentTypesObject();
        	addUserRoleAto.addType("text");
        	
        	try {
        		dc.sendPreparedUpdate(schemaName, addUserRoleQuery, addUserRoleArgs, addUserRoleAto, null);
    	    }
    	    catch (Exception e) {  	    	
    	    	String error = Util.getDebugInfoForConsole("Adding a user and project role caused an error", new String[] {username});
    	    	throw new RuntimeException(error, e);
    	    }
    	}
    	
	}
	
	/**
	 * Get the id of a user given its username
	 * @param username
	 * @return ID
	 */
	public int getIdOfUser(String username) {

		int id = -1;

		// connect to the lex'it schema database
		dc = getPostgresConnectionManager();

		String schemaName = "\"" + lexitSchemaAccessHash.get("schema") + "\"";

		String query = "SELECT id FROM " + schemaName + ".users " + "WHERE username = ?;";

		String[] queryArgs = new String[] { username };
		ArgumentTypesObject queryAto = new ArgumentTypesObject();
		queryAto.addType("text");

		ArrayList<String[]> res;

		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schemaName, query, queryArgs, queryAto, 0).getRows();

			res = Util.getResultSetCopyInAList(rs, new String[] { "id" });
			if (res.size() > 0) {
				id = Integer.parseInt(res.get(0)[0]);
			}
		} catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Reading the id of a user caused an error", new String[] {username});
			throw new RuntimeException(error, e);
		}

		return id;

	}
	
	
	/**
	 * Get list of users and roles
	 * @return array of usernames and roles (username:::role1,role2,...)
	 */
	public ArrayList<String> getListOfUsersAndRoles() {
		
		ArrayList<String> aOutput = new ArrayList<>();
		Set<String> keys = users2roles.keySet();
		
        for (String key : keys) {        	
        	aOutput.add( key + ":::" + Util.join(users2roles.get(key), ",") );        	
        }
		return aOutput;
	}
	
	
	/**
	 * get list of users
	 * @return array of usernames
	 */
	public ArrayList<String> getListOfUsers(){
		
		ArrayList<String> aOutput = new ArrayList<>();
		Set<String> keys = users2roles.keySet();
		
        for (String key : keys) {        	
        	aOutput.add( key );        	
        }
		return aOutput;

	}
	
	/**
	 * Get list of existing projects
	 * @param fullInfo if true, return projectname (=config_filename), name, description, status, order_in_menu, message, redirect; if false, return only projectname
	 * @return array of projectnames
	 */
	public ArrayList<String> getListOfExistingProjects(boolean fullInfo) {
		
		ArrayList<String> aOutput = new ArrayList<>();
		
		String[] fieldNames = fullInfo ? 
				new String[] { "projectname", "name", "description", "status", "order_in_menu", "message", "redirect" } 
				: 
				new String[] { "projectname" };

		// connect to the lex'it schema database
		dc = getPostgresConnectionManager();

		String schemaName = "\"" + lexitSchemaAccessHash.get("schema") + "\"";

		String query = fullInfo ?
				"SELECT DISTINCT p.projectname, p.name, p.description, p.status, s.priority, p.order_in_menu, p.message, p.redirect "+
				"FROM " + schemaName + ".projects p, " + schemaName + ".statuses s " +
				"WHERE p.status = s.status "+
				"UNION "+
				"SELECT DISTINCT unknown.projectname, unknown.name, unknown.description, unknown.status, s.priority, max.order_in_menu + (row_number() over ()) AS order_in_menu, unknown.message, unknown.redirect "+
				"FROM (" +
				"	SELECT DISTINCT ur.projectname, '' AS name, '' AS description, 'unknown' AS status, '' AS message, '' AS redirect "+
				"	FROM " + schemaName + ".users_roles ur " +
				"	LEFT JOIN " + schemaName + ".projects p "+
				"	ON ur.projectname = p.projectname "+
				"	WHERE p.projectname IS NULL " +
				") unknown, "+
				"( " +
				"	SELECT max(order_in_menu) AS order_in_menu "+
				"	FROM " + schemaName + ".projects "+
				") max, "+
				schemaName + ".statuses s " +
				"WHERE unknown.status = s.status "+
				"ORDER BY priority, order_in_menu;"
				:
				"SELECT DISTINCT projectname "+
				"FROM " + schemaName + ".users_roles " + 
				"ORDER BY projectname;";

		ArrayList<String[]> res;

		try {
			List<Map<String, Object>> rs = dc.sendQuery(schemaName, query, 0).getRows();

			res = Util.getResultSetCopyInAList(rs, fieldNames);
			if (res.size() > 0) {
				for (String[] oneRecord : res) {
					
					// trim each element of the fields array
					Arrays.stream(oneRecord).map(s -> s.trim()).toArray();
					// join the fields
					aOutput.add( Util.join(oneRecord, ":::") );					
				}
			}
		} catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Reading the list of existing projects caused an error",
					new String[] {"fullInfo: "+fullInfo});
			throw new RuntimeException(error, e);
		}

		return aOutput;
	}
	
	
	/**
	 * Set the list of existing projects in the projects table
	 * @param projectList
	 */
	public void setListOfExistingProjects(String projectList) {
		
		// connect to the lex'it schema database
		dc = getPostgresConnectionManager();

		String schemaName = "\"" + lexitSchemaAccessHash.get("schema") + "\"";
		
		String deleteProjectsQuery = "DELETE FROM " + schemaName + ".projects;";
		String insertProjectQuery = 
				"INSERT INTO " + schemaName + ".projects(projectname, name, description, status, order_in_menu, message, redirect) " +
		        "VALUES ";
		
		String[] args = new String[] {};
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] aProjectList = projectList.split(Constants.ARG_INTERNAL_SEPARATOR);
		String separator = "";
		for (String projectInfo : aProjectList) {
			
			// build the query
			insertProjectQuery += separator + "(?, ?, ?, ?, ?, ?, ?)";
			
			// build the arguments
			String[] thisProjectInfo = projectInfo.split(":::", -1); // -1 to include trailing empty strings
			
			args = Util.concatArr(args, thisProjectInfo);
			ato.addType("text");
			ato.addType("text");
			ato.addType("text");
			ato.addType("text");
			ato.addType("integer");
			ato.addType("text");
			ato.addType("text");
			
			separator = ", ";
		}
		insertProjectQuery += ";";
		
		try {
			dc.sendUpdate(schemaName, deleteProjectsQuery);
			dc.sendPreparedUpdate(schemaName, insertProjectQuery, args, ato, null);
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Updating the projects list caused an error", new String[] {});
			throw new RuntimeException(error, e);
		}
	}
	
	/**
	 * Delete a project from the projects table
	 * @param projectname
	 */
	public void deleteProject(String projectname) {
		
		// connect to the lex'it schema database
		dc = getPostgresConnectionManager();

		String schemaName = "\"" + lexitSchemaAccessHash.get("schema") + "\"";
		
		String deleteProjectsQuery = "DELETE FROM " + schemaName + ".projects WHERE projectname = ?;";
		String[] args = new String[] { projectname };
		ArgumentTypesObject ato = new ArgumentTypesObject();
		ato.addType("text");
		
		try {
			dc.sendPreparedUpdate(schemaName, deleteProjectsQuery, args, ato, null);
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Removing the project caused an error", new String[] {});
			throw new RuntimeException(error, e);
		}
		
	}


	
	/**
	 * Read the host and credentials for accessing the Lex'it schema database 
	 * @param context
	 * @throws IOException
	 */
	private void readLexitSchemaLoginInfoFile(ServletContext context) throws IOException{
		
		
		// compute file location
			
		String filepath = context.getRealPath(lexitSchemaFileName);
		
		// remove '/lexit2/...' of url
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator + lexitSchemaFileName, 
				""); 
		// remove remaining '/servlet|webapps' part of url
		filepath = filepath.substring(0, filepath.lastIndexOf(File.separatorChar));
		
		// now add path to right file
		filepath = filepath + File.separatorChar + Constants.DB_CONFIG_ROOT + File.separatorChar + Constants.DB_CONFIG_DIR + File.separatorChar + lexitSchemaFileName;
				
		
		// get info out of file
		
		try{
			FileInputStream fstream = new FileInputStream(filepath);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {
				if (	strLine.indexOf("=")<0  // skip illegal format (we expect key=prop) 
						|| 
						strLine.startsWith("#"))// skip comment lines
					continue;
				String key = strLine.split("=")[0];
				String value = strLine.split("=")[1];
				lexitSchemaAccessHash.put(key, value);
			}
			br.close();
			in.close();
			
			// connect to the lex'it schema database 
			dc = createPostgresConnectionManager();
		}
		catch (Exception e){//Catch exception if any
			String error = Util.getDebugInfoForConsole("Error while reading the '"+lexitSchemaFileName+"' properties file", new String[] {filepath});
			throw new RuntimeException(error, e);
		}
	}
	
	
	/**
	 * Generate a MD5 encoded version of a password (old way; kept for sake of backwards compatibility)
	 * 
	 * @param password
	 * @return
	 */
	private String getMD5EncodedPassword(String password) {
		
		password = password.trim();
		
		MessageDigest md = null;
		try {
			md = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
	    md.update(password.getBytes());
	    byte[] digest = md.digest();

		return DatatypeConverter.printHexBinary(digest);
	}
	
	/**
	 * Generate a SHA-256 encoded version of a password (new way)
	 * 
	 * @param password
	 * @param saltString
	 * @return
	 */
	private String getSha256EncodedPassword(String password, String saltString) {
		
		// see: https://www.javaguides.net/2020/02/java-sha-256-hash-with-salt-example.html
		
		password = password.trim();
		String generatedPassword = null;		
		byte[] salt = saltString.getBytes();
		
		MessageDigest md = null;
		try {
			md = MessageDigest.getInstance("SHA-256");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
	    md.update(salt);
	    byte[] digest = md.digest(password.getBytes());
	    StringBuilder sb = new StringBuilder();
        for (int i = 0; i < digest.length; i++) {
            sb.append(Integer.toString((digest[i] & 0xff) + 0x100, 16).substring(1));
        }
        generatedPassword = sb.toString();

		return generatedPassword;
	}
	
	
	/**
	 * Get a salt string for a given integer value
	 * 
	 * @param intValue
	 * @return
	 */
	public String getSalt(int intValue) {
		
		// salt must be at 16 characters long
		String salt = String.valueOf(intValue) + "lexit_salt_value"; 
		salt = salt.substring(0, 16);
		return salt;
	}

	
	/**
	 * Get the next value of a sequence for a table column
	 * 
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public int getTheNextValueOfASequence(String schema, String tableName, String columnName) {
		
		String sequenceName = "";
		int lastGeneratedValue = -1;
		
		PostgresConnectionManager dc = getPostgresConnectionManager();
		
		
		// get the name of a psql sequence given the table and column name
		
		String getSequenceName = "SELECT pg_get_serial_sequence(?, ?) AS sequence_name;";
		String[] getSequenceArgs = new String[] { schema + "." + tableName, columnName };
		ArgumentTypesObject getSequenceAto = new ArgumentTypesObject();
		getSequenceAto.addType("text");
		getSequenceAto.addType("text");
				
		
		try {			
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, getSequenceName, getSequenceArgs, getSequenceAto, 0).getRows();			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[] { "sequence_name" });
			if (res.size() > 0) {
				sequenceName = res.get(0)[0];
			}

		} catch (Exception e) {
			
			String error = Util.getDebugInfoForConsole("Error while executing query " + getSequenceName, new String[] {schema, tableName, columnName});			
			throw new RuntimeException(error, e);
		}
		
		
		
		// Get the last generated value from the sequence's internal state
		
		String getLastGeneratedValue =	
				"SELECT last_value FROM "+sequenceName+";";

		try {
			List<Map<String, Object>> rs = dc.sendQuery(schema, getLastGeneratedValue, 0).getRows();
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[] { "last_value" });

			if (res.size() > 0) {
				lastGeneratedValue = Integer.parseInt(res.get(0)[0]) + 1; // we want the next value, not the last one!
			}

		} catch (Exception e) {
			
			String error = Util.getDebugInfoForConsole("Error while executing query " + getLastGeneratedValue, new String[] {sequenceName});			
			throw new RuntimeException(error, e);
		}

		return lastGeneratedValue;
	}
	
	
}
