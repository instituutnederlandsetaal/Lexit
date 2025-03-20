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
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.xml.bind.DatatypeConverter;

import resources.Constants;
import resources.ContextObject;

public class LexitSchemaAccess {
	
	// default name of the Lex'it schema database
	private String lexitSchemaFileName = "LEXIT_SCHEMA.database";
	
	// database communication object (to be initialized)
	private PostgresDatabaseCommunication dc;
	
	// Lex'it schema database login info
	private ConcurrentHashMap<String, String> lexitSchemaAccessHash = new ConcurrentHashMap<String, String>();
	
	// users login info
	private ConcurrentHashMap<String, String> users2passwords = new ConcurrentHashMap<String, String>();
	
	// users access roles
	private ConcurrentHashMap<String, String[]> users2roles = new ConcurrentHashMap<String, String[]>();
	
	// session id to username (needed for local login)
	private ConcurrentHashMap<String, String> sessionIds2users = new ConcurrentHashMap<String, String>();
	private ConcurrentHashMap<String, Long> sessionIds2generationTime = new ConcurrentHashMap<String, Long>();
	
	
	
	
	// constructor
	// the update parameter instructs the function to reload, so as to take new users' roles etc into account
	
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
				throw new RuntimeException("Error while reading the '"+lexitSchemaFileName+"' properties file", e);
			}
		}
		
	};
	
	
	public void refresh() {
		
		users2passwords = new ConcurrentHashMap<String, String>();
		users2roles = new ConcurrentHashMap<String, String[]>();
		
		readUsersLogins();
		readUsersRoles();
	}
	
	
	// create the users table if it does not exist yet
	private void createUsersTableIfNotExists() {
		
		String query = 
				"DO $$ "
				+ "BEGIN "
				+ "		"
				+ "		CREATE TABLE IF NOT EXISTS \""+lexitSchemaAccessHash.get("schema")+"\".users ( "
				+ "		    id serial, "
				+ "		    username text, "
				+ "		    password text, "
				+ "		    default_access_role text, "
				+ "		    CONSTRAINT users_unique UNIQUE (username) "
				+ "		); "
				+ "		"
				+ "		CREATE TABLE IF NOT EXISTS \""+lexitSchemaAccessHash.get("schema")+"\".users_roles ( "
				+ "		    user_id integer, "
				+ "		    projectname text, "
				+ "		    access_role text, "
				+ "		    CONSTRAINT users_roles_unique UNIQUE (user_id, projectname, access_role) "
				+ "		); "
				+ "		"
				+ "		INSERT INTO \""+lexitSchemaAccessHash.get("schema")+"\".users(username, password, default_access_role) "  // password is KrommeBananen
				+ "		SELECT 'admin', 'dfaef8346ba91dc59fa762dfc7fe6eac', 'admin' "
				+ "		ON CONFLICT DO NOTHING; "
				+ "		"
				+ "END "
				+ "$$;";
		
		// connect to the lex'it schema database 
		dc = connectDatabase();
	
		try {
			dc.sendUpdate(query);
		}
		catch (Exception e) {  	    	
			throw new RuntimeException("Creating the LEXIT_SCHEMA content caused an error.", e);
		}
	}
	
	
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
	
	
	// register a session ID corresponding to a given username
	// this is needed because - after login - the session ID is the only request parameter allowing us to identify a user 
	public void setSessionIdIsUsername(String sessionId, String username) {
		
		Util.debug(sessionId + " represents "+username);
		
		sessionIds2users.put(sessionId, username);
		sessionIds2generationTime.put(sessionId, (new Date().getTime()) );
		
		// if some saved sessionID is older than the max allowed duration, remove it
		for (String key : sessionIds2users.keySet()) {
			
			Util.debug(key + " => "+sessionIds2users.get(key));			
			if ( (new Date().getTime()) - sessionIds2generationTime.get(key) > Constants.MAX_SESSION_ID_DURATION ) {
								
				removeSessionId(key);
			}
				
		}
	}
	
	// clean up our knowledge about session ID - username correspondance
	// when some sessions are finished
//	public void cleanUpSessionIds(ConcurrentHashMap<String, Database> nameToDatabaseObject) {
//		
//		HashSet<String> activeSessionIds = new HashSet<String>();
//		HashSet<String> activeUsers = new HashSet<String>();
//		
//		
//		// gather the active session IDs
//		for (String key : nameToDatabaseObject.keySet()) {
//			
//			Database currentDbObj = nameToDatabaseObject.get(key);			
//			ContextObject co = currentDbObj.getContextObject();
//			
//			String sessionId = co.getSessionIdForSpy();
//			String userName = co.getUsername();
//			
//			activeSessionIds.add(sessionId);
//			activeUsers.add(userName);
//		}
//		
//		// remove session IDs that are not active anymore
//		// (check on username as well, otherwise we might remove a session ID that is still active)
//		for (String sessionId : sessionIds2users.keySet()) {
//			if ( !activeSessionIds.contains(sessionId) ) {		
//				if ( !activeUsers.contains(sessionIds2users.get(sessionId))) {
//					Util.debug("Cleaning up session ID "+sessionId);
//					sessionIds2users.remove(sessionId);	
//					System.out.println("Session ID "+sessionId+" removed.");
//				}				
//			}
//		}
//	}
	
	
	private void removeSessionId(String sessionId) {
		sessionIds2users.remove(sessionId);
		sessionIds2generationTime.remove(sessionId);
	}
	

	
	// user roles getter
	
	public ConcurrentHashMap<String, String[]> getUsersRoles(){
		return users2roles;		
	}
	
	
	// get/compute the username
	// the way the username is retrieved depends on the way a user logged in.
	// - in Clarin login, we read the remote_user header param
	// - in normal mode, we read the username assigned to the current session ID header param
	//   (after login, the session ID is the only request parameter allowing us to identify a user)
	
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
	
	/*
	 * Retrieve the session ID from the request
     * (might be shibSession if using Clarin login, or the session ID otherwise)
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
	
	
	// connect to lex'it schema database
	private PostgresDatabaseCommunication connectDatabase() {

		PostgresDatabaseCommunication postgresDc = new PostgresDatabaseCommunication(null, true);		
		postgresDc.connectTo(	lexitSchemaAccessHash.get("host"), 
								lexitSchemaAccessHash.get("port"), 
								lexitSchemaAccessHash.get("db"), 
								lexitSchemaAccessHash.get("user"), 
								lexitSchemaAccessHash.get("pass"));
		
		return postgresDc;		
	}
	
	// check if a username / password combination is ok to be allowed in.
	public boolean checkCredentials(String username, String password) {
		
		//showCurrentContent();
		
		MessageDigest md = null;
		try {
			md = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
	    md.update(password.getBytes());
	    byte[] digest = md.digest();

		
		String md5Hex = DatatypeConverter.printHexBinary(digest);		
		String md5InDatabase = users2passwords.get(username);
						
		// if MD5 conversion of password matches the database version of it! 
		if (md5Hex.equalsIgnoreCase(md5InDatabase))
			return true;
		
		return false;
	}
	
	
	// log out a user
	public void logOutUser(String username) {

		// remove the session ID - username correspondance
		for (String key : sessionIds2users.keySet()) {
			if (sessionIds2users.get(key).equals(username)) {
				removeSessionId(key);
			}
		}
	}
	
	
	// read the users login info frm the database
	private void readUsersLogins() {
		
		// connect to the lex'it schema database 
		dc = connectDatabase();
		
		String schemaName = "\""+lexitSchemaAccessHash.get("schema")+"\"";
		
		String query = 
				"SELECT username, password "+
				"FROM "+schemaName+".users;";
		
		ArrayList<String[]> res;
	    
	    try {
	      
	      ResultSet rs = dc.sendQuery(query, 0);

	      res = getResultsInAList(rs, new String[] { "username", "password" });
	      if (res.size() > 0) {
	        for (String[] oneRecord : res){
	        	users2passwords.put(oneRecord[0].trim(), oneRecord[1].trim());
	        }
	        
	      }
	    }
	    catch (Exception e) {  	    	
	    	throw new RuntimeException("Reading the users login info caused an error.", e);
	    }

		
	}
	
	
	// read the users roles info from the database
	private void readUsersRoles() {
		
		// connect to the lex'it schema database 
		dc = connectDatabase();
		
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
	      
	      ResultSet rs = dc.sendQuery(query, 0);

	      res = getResultsInAList(rs, new String[] { "username", "roles" });
	      if (res.size() > 0) {
	        for (String[] oneRecord : res){
	        	users2roles.put(oneRecord[0].trim(), oneRecord[1].trim().split(","));
	        }
	        
	      }
	    }
	    catch (Exception e) {  	    	
	    	throw new RuntimeException("Reading the users roles caused an error.", e);
	    }

	}
	
	
	
	public void deleteUser(String username) {

		// connect to the lex'it schema database
		dc = connectDatabase();

		String schemaName = "\"" + lexitSchemaAccessHash.get("schema") + "\"";
		
		String deleteUserQuery1 = "DELETE FROM " + schemaName + ".users_roles " + "WHERE user_id = (SELECT id FROM " + schemaName + ".users WHERE username = ?);";
		String deleteUserQuery2 = "DELETE FROM " + schemaName + ".users " + "WHERE username = ?;";

		String[] deleteUserArgs = new String[] { username };
		ArgumentTypesObject deleteUserAto = new ArgumentTypesObject();
		deleteUserAto.addType("text");

		try {
			dc.sendPreparedUpdate(deleteUserQuery1, deleteUserArgs, deleteUserAto, null);
			dc.sendPreparedUpdate(deleteUserQuery2, deleteUserArgs, deleteUserAto, null);
		} 
		catch (Exception e) {
			throw new RuntimeException("Deleting a user caused an error.", e);
		} 

	}
	
	
	public void deleteProjectRoleForUser(String username, String dbName) {

		// connect to the lex'it schema database
		dc = connectDatabase();

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
			dc.sendPreparedUpdate(deleteUserQuery, deleteUserArgs, deleteUserAto, null);
		} 
		catch (Exception e) {
			throw new RuntimeException("Deleting a user caused an error.", e);
		} 

	}
	
	
	public String getUsersDefaultRole(String username) {
	
		// get the default role of a user		
		String role = null;
		
		
		// connect to the lex'it schema database
		
		dc = connectDatabase();
		
		String schemaName = "\""+lexitSchemaAccessHash.get("schema")+"\"";
		
		String query = "SELECT default_access_role " + "FROM " + schemaName + ".users " + "WHERE username = ?;";
		
		String[] queryArgs = new String[] { username };
		ArgumentTypesObject queryAto = new ArgumentTypesObject();
		
		queryAto.addType("text");
		
		ArrayList<String[]> res;
		
		try {
			ResultSet rs = dc.sendPreparedQuery(query, queryArgs, queryAto, 0);

			res = getResultsInAList(rs, new String[] { "default_access_role" });
			if (res.size() > 0) {
				role = res.get(0)[0];
			}
		} 
		catch (Exception e) {
			throw new RuntimeException("Reading the default role of a user caused an error.", e);
		} 
		
		return role;
	}	
	
	
	// add a user and project role
	public void setUserWithRole(String username, String password, String defaultRole, String dbName, String role) {
		
		String schemaName = "\""+lexitSchemaAccessHash.get("schema")+"\"";
		
		// convert the password to MD5
		
		String passwordMd5Hex = null;		
		
		if (password != null && !password.trim().isEmpty()) {
			
			password = password.trim();
			
			MessageDigest md = null;
			try {
				md = MessageDigest.getInstance("MD5");
			} catch (NoSuchAlgorithmException e) {
				e.printStackTrace();
			}
		    md.update(password.getBytes());
		    byte[] digest = md.digest();

			passwordMd5Hex = DatatypeConverter.printHexBinary(digest);			
		}
		
		
		// if password and default role are given, save those!
		
		if (defaultRole != null && !defaultRole.trim().isEmpty()) {
			
			// connect to the lex'it schema database 
			dc = connectDatabase();
			
			
//			System.out.println("Adding user "+username+" with password "+password+" and default role "+defaultRole);
//			System.out.println("password is null = "+(password == null));
//			System.out.println("password is empty = "+(password != null && password.isEmpty()));
			
			String addUserQuery = 
					"INSERT INTO "+schemaName+".users(username, password, default_access_role) "+
					"VALUES (?, ?, ?) "+				
					"ON CONFLICT (username) "+
					"DO UPDATE SET default_access_role = '"+defaultRole+"' " +( (passwordMd5Hex != null ) ? ", password = '"+passwordMd5Hex+"'" : "") + " "+
					"WHERE "+schemaName+".users.username = ?;";
			
			String[] addUserArgs = new String[] {username, passwordMd5Hex, defaultRole, username}; 
	    	ArgumentTypesObject addUserAto = new ArgumentTypesObject();
	    	addUserAto.addType("text");
	    	addUserAto.addType("text");
	    	addUserAto.addType("text");
	    	addUserAto.addType("text");
	    	
	    	
	    	
	    	try {
	    		dc.sendPreparedUpdate(addUserQuery, addUserArgs, addUserAto, null);
	  	    }
	  	    catch (Exception e) {  	    	
	  	    	throw new RuntimeException("Adding a user caused an error.", e);
	  	    }
			
		}
			
    	
    	
    	// now add the specific project role
    	
    	if ((dbName != null && !dbName.isEmpty() && !dbName.equals("null")) && (role != null && !role.isEmpty()  && !role.equals("null") )) {
    		
    		dc = connectDatabase();
    		
    		String deletePreviousRole = 
    				"DELETE FROM "+schemaName+".users_roles "+
    				"WHERE user_id = (SELECT id FROM "+schemaName+".users WHERE username = ?) "+
    				"AND projectname = ?;"; 
    		
    		String[] deletePreviousRoleArgs = new String[] {username, dbName}; 
        	ArgumentTypesObject deletePreviousRoleAto = new ArgumentTypesObject();
        	deletePreviousRoleAto.addType("text");
        	deletePreviousRoleAto.addType("text");
        	
        	try {
        		dc.sendPreparedUpdate(deletePreviousRole, deletePreviousRoleArgs, deletePreviousRoleAto, null);
    	    }
    	    catch (Exception e) {  	    	
    	    	throw new RuntimeException("Removing old user role caused an error.", e);
    	    }
        	
    		
        	
        	dc = connectDatabase();
        	
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
        		dc.sendPreparedUpdate(addUserRoleQuery, addUserRoleArgs, addUserRoleAto, null);
    	    }
    	    catch (Exception e) {  	    	
    	    	throw new RuntimeException("Adding a user and project role caused an error.", e);
    	    }
    		
    	}
    	
	}
	
	
	// get list of users and roles
	public ArrayList<String> getListOfUsersAndRoles() {
		
		ArrayList<String> aOutput = new ArrayList<>();
		Set<String> keys = users2roles.keySet();
		
        for (String key : keys) {        	
        	aOutput.add( key + ":::" + Util.join(users2roles.get(key), ",") );        	
        }
		return aOutput;
	}
	// get list of users
	public ArrayList<String> getListOfUsers(){
		
		ArrayList<String> aOutput = new ArrayList<>();
		Set<String> keys = users2roles.keySet();
		
        for (String key : keys) {
        	
        	aOutput.add( key );
        	
        }
		return aOutput;

	}


	
	// read the host and credentials for accessing the Lex'it schema database 
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
		}
		catch (Exception e){//Catch exception if any
			throw new RuntimeException("Error while reading the '"+lexitSchemaFileName+"' properties file", e);
		}
	}

	
	
	// close the database connection
//	private void closeDatabase()
//	{
//		if (dc != null)
//			dc.closeConnection();
//		if (Constants.debug)
//			Util.debug("Connection with the Lex'it schema closed.\n");
//	}
	
	
	
	// convert database output into an array list
	
	private ArrayList<String[]> getResultsInAList(ResultSet rs, String[] fieldnames) throws UnsupportedEncodingException, SQLException{
		
		ArrayList<String[]> list = new ArrayList<String[]>();
		
		if (rs == null)  {
			Util.debug("Result list empty!");
			return list;
		}
		
		try  {
			try {
				while (rs.next()) {
					
					String[] fieldvalue = new String[fieldnames.length];
					for (int i=0; i<fieldnames.length; i++) {
						String veld = fieldnames[i];						
						
						byte[] col = rs.getBytes(veld);
						if (col != null) {
							String str = new String(col, "UTF-8");
							fieldvalue[i] = str; 
						}
						else {
							fieldvalue[i] = "";
						}						
					}
					list.add(fieldvalue);
					
				}
				return list;
			}
			finally {
				rs.close();
			}
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
		
	}

}
