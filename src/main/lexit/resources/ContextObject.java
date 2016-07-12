package lexit.resources;

import java.util.Date;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.SecurityContext;

/*
 * This class is meant to gather the Tomcat context data,
 * username, projectname into one single
 * object that can be easily passed
 * to functions and so on  
 */
public class ContextObject {
	
	// context will give us access to method getRealPath, 
	// so we can access the Lex'it configuration file at
	// the right path on the Tomcat server
	private ServletContext context;
	
	// projectname, username and session id
	private String dbName;
	private String username;
	private String sessionId;
	
	// last time this object was used
	// (old objects will be removed)
	private long timeLastUsed;
	
	
	// constructor
	public ContextObject(			
			ServletContext context,
			SecurityContext sc,
			HttpServletRequest httpServletRequest,
			String dbName){
		
		this.context = context;
		this.dbName = dbName;		
		this.sessionId = httpServletRequest.getSession().getId();
		
		// milliseconds since 1970
		this.timeLastUsed = new Date().getTime(); 
		
		// we set the username right away, because the security object 'dies' 
		// immediately after the request is done. 
		this.username = sc.getUserPrincipal().getName(); 
	}
	
	
	// special methods
	
	 
	public String getUsername(){
		return this.username;
	}
	
	// if the object left unused? 
	// (t.i. last time is was used was longer ago than a given maximal duration)
	public boolean isLeftUnused(){			
		
		return ( (new Date().getTime()) - getTimeLastUsed() > Constants.MAX_DB_OBJECT_DURATION );			
	}
	
	
	// object age management
	
	public long getTimeLastUsed() {
		return timeLastUsed;
	}

	// this one mustn't be used outside this class
	private void setTimeLastUsed() {
		this.timeLastUsed = new Date().getTime(); // milliseconds since 1970
	}
	
	
	
	// Getters and setters
	
	// The first set of methods [part a] are the 'normal ones'.
	// When those are called, we consider it to be genuine user activity,
	// so we update the last-time-used parameter on the fly
	//
	// The second set of methods [part b] are not called
	// during user activity, be are called by a 'spy' to investigate 
	// who is active etc. This is why we mustn't update the 
	// last-time-used parameter in this second set of methods.
	
	// part [a]
	
	public String getDbName() {
		setTimeLastUsed();
		return this.dbName;
	}
	
	public ServletContext getContext() {
		setTimeLastUsed();
		return this.context;
	}
	

	// part [b]

	public String getDbNameForSpy() {
		return this.dbName;
	}
	
	public ServletContext getContextForSpy() {
		return this.context;
	}
	
	public String getSessionIdForSpy() {
		return this.sessionId;
	}
	
	// this unique identifier will be used as a key to get the right database object
	// when some user does some database operations. The combination of
	// username + dbname + sessionId guarantees that each user has its own
	// database object, even when different users logged in with the same account
	// into the same project (which is not allowed, but sadly happens!)
	public String getUniqueIdentifier() {
		return this.username + Constants.ARG_INTERNAL_SEPARATOR + 
				this.dbName + Constants.ARG_INTERNAL_SEPARATOR + 
				this.sessionId;
	}
	
}
