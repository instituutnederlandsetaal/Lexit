package resources;

/**
 * This class contains some constants used in this package
 * This is to make sure only some allowed constants are used and no other values 
 * @author fannee
 *
 */
public class Constants {
	
	// ------------------------------------------------------------------------
	// FOLDERS AND PATHS
	// ------------------------------------------------------------------------
	
	// Base URL  ( www.host.nl / BASE_URL / ... )
	public final static String BASE_URL = "lexit2";
	
	// Tomcat configuration directory
	// (this is the directory in which the JavaScript config files are to be found)
	public final static String CONFIG_DIR = "lexit2_config";
	// (this is the directory in which the DATABASE config files are to be found)
	public final static String DB_CONFIG_ROOT = "etc";
	public final static String DB_CONFIG_DIR = "lexit2_db_config";
	
	
	// ------------------------------------------------------------------------
	// SEPARATOR IN USE IN THE APPLICATION
	// ------------------------------------------------------------------------
	
	// separator for arguments within a single string
	// this must be the same as in the Javascript part (same variable name)
	public final static String ARG_INTERNAL_SEPARATOR = "ArGsEpArAtOr";
	
	
	// ------------------------------------------------------------------------
	// ADMIN AND ACCESS RIGHTS
	// ------------------------------------------------------------------------
	
	// default config file names
	public final static String ADMIN_CONFIG_FILENAME = "LEXIT_SCHEMA";  // admin database
	
	// default project/database names (this corresponds to the 'db' parameter value in the Lex'it URL)
	public final static String ADMIN_DB = "admin";
	
	// default users
	// the admin user, which declares users and their access rights in the admin GUI
	public final static String ADMIN_USER = "admin";	
	public final static String ADMIN_USER_DEFAULT_ROLE = "admin";
	// the public reader, which is allowed to access some projects without logging in, but only in read mode
	// Its specific access rights must be declared the usual way in the admin GUI
	// (this user don't have any default_access_role, as we expect it to access specific projects only)
	public final static String PUBLIC_READER_USER = "publicreader";  
	public final static String PUBLIC_READER_DEFAULT_ROLE = "-";
	
	// users rights
	public final static String USER_IS_ADMIN = "admin";     // admin
	public final static String USER_ALL_ACCESS = "all";     // read, write, delete
	public final static String USER_WRITE_ACCESS = "write"; // read, write
	public final static String USER_READ_ACCESS = "read";   // read
	
	// ------------------------------------------------------------------------
	
	// Lex'it requires some field to act as a primary key
	// so if it is missing (like in view), the application expects
	// the field acting as a primary key to be recognisable as such:
	// it must be called the way it's stated here:
	public final static String PRIMARYKEY_FIELDNAME = "pkid";
	
	
	// ------------------------------------------------------------------------
	// DEFAULT TIMEOUTS BEFORE DISPOSING OF A USERS ETC.
	// ------------------------------------------------------------------------
	
	// maximal allowed time a database object is allowed to keep alive
	// when left unused. After this max duration, this object will be automatically
	// deleted
	public static long MAX_DB_OBJECT_DURATION = 	
			60 *     // minutes
			60 *     // seconds
			1000;    // milliseconds

	public static long MAX_SESSION_ID_DURATION = 
			24 * // hours
			60 * // minutes
			60 * // seconds
			1000; // milliseconds
	
	// amount of time beyond which a user is considered to be 'gone'
	public static long TIME_GONE = 	
			15 *     // minutes
			60 *     // seconds
			1000;    // milliseconds
	
	
	// maximal allowed cost of a count query (in terms of query duration)
	public static int maxAllowedDuration = 2000; // 2 seconds
	
	
	// ------------------------------------------------------------------------
	// CONNECTION POOL DEFAULTS
	// ------------------------------------------------------------------------
	
	// the max number of connections per database 
	// (can be overridden in the database config file with the 'max_pool_size' parameter)
	public static int maxPoolSize = 10; 
	
	public static long connectionTimeoutMs = 30000; // 30 sec
	public static long idleTimeoutMs = 600000; // 10 min
	public static long maxLifetimeMs = TIME_GONE; 
	
	// ------------------------------------------------------------------------
	// DEBUGGING
	// ------------------------------------------------------------------------

	// are we debugging?
	// t.i. show some output in the console to see what happens
	// (N.B.: this is not 'final' as we can modify the setting during a session)
	public static boolean debug = false;
	
	
	// ------------------------------------------------------------------------
}
