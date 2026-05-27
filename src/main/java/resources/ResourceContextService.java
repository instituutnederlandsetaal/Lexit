package resources;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.inject.Singleton;
import database.Database;
import database.LexitSchemaAccess;
import util.Util;

/**
 * The ResourceContextService class is the main class 
 * Here the different kinds of requests can be mapped to functions and classes
 * 
 * @author Mathieu Fannee (INL)
 *
 */

@Singleton

public class ResourceContextService {
	
	// database access objects, needed for caching (for speed)
	private final ConcurrentHashMap<String, Database> nameToDatabaseObject = new ConcurrentHashMap<String, Database>();	

	// users access rights
	private static ConcurrentHashMap<String, String[]> users2roles = new ConcurrentHashMap<String, String[]>();

    // container for user login and roles info
	private LexitSchemaAccess lexitInfo;
	
	
	
	/**
	 * Retrieve the LexitSchemaAccess object
	 * @return
	 */
	public LexitSchemaAccess getLexitInfo(){
		return this.lexitInfo;
	}
	/**
	 * Set the LexitSchemaAccess object
	 * @param lexitInfo
	 */
	public void setLexitInfo(LexitSchemaAccess lexitInfo){
		this.lexitInfo = lexitInfo;
	}
	
	
	
	
	/**
	 * Retrieve the mapping from database name to database access objects
	 * @return
	 */
	public ConcurrentHashMap<String, Database> getNameToDatabaseObject() {
		return this.nameToDatabaseObject;
	}
	
	/**
	 * Get rid of a cached database access objects
	 * @param key
	 */
	public void removeFromNameToDatabaseObject(String key) {
		this.nameToDatabaseObject.remove(key);
	}
	
	
	
	
	/**
	 * Retrieve the database access object for a given database name
	 * @param co
	 * @return
	 */
	public synchronized Database getDatabaseObject(ContextObject co){
		
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
	
	
	
	/**
	 * Check the user's rights
	 * - 'superuser' can read, write, delete in any database
	 * - 'superreader' can read in any database
	 * - '<dbName>_all' can read, write, delete in database <dbName>
	 * - '<dbName>_write' can read, write in database <dbName>
	 * - '<dbName>_read' can only read in database <dbName>
	 */
	public boolean userIsAllowedTo(ContextObject co, String action){
		
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
	
	/**
	 * Check if a given role is part of an array of roles 
	 * (subroutine of userIsAllowedTo function)
	 * 
	 * @param co
	 * @param role
	 * @return
	 */
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
	
	/**
	 * Retrieve the users roles
	 * (read the users access rights file if that hasn't been done yet)
	 * 
	 * @param co
	 * @return
	 * @throws IOException
	 */
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
		
		synchronized (ResourceContextService.class){
			
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
	
	/**
	 * Set users roles variable
	 * @param users2roles
	 */
	public void setUserRoles(ConcurrentHashMap<String, String[]> theseUsers2roles) {
		users2roles = theseUsers2roles;
	}

}
