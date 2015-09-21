package lexit.resources;

/**
 * This class contains some constants used in this package
 * This is to make sure only some allowed constants are used and no other values 
 * @author fannee
 *
 */
public class Constants {
	
	// separator for arguments within a single string
	// this must be the same as in the Javascript part (same variable name)
	public final static String ARG_INTERNAL_SEPARATOR = "ArGsEpArAtOr"; 

	// users rights
	public final static String USER_ALL_ACCESS = "all";     // read, write, delete
	public final static String USER_WRITE_ACCESS = "write"; // read, write
	public final static String USER_READ_ACCESS = "read";   // read
	
	// Lex'it requires some field to act as a primary key
	// so if it is missing (like in view), the application expects
	// the field acting as a primary key to be recognisable as such:
	// it must be called the way it's stated here:
	public final static String PRIMARYKEY_FIELDNAME = "pkid";
	
	// neutral separator, if needed
	public final String NEUTRAL_SEPARATOR = "nEuTrAlSePaRaToR";
	
	// are we debugging?
	// t.i. show some output in the console to see what happens
	// (N.B.: this is not 'final' as we can modify the setting during a session)
	public static boolean debug = false;
}
