package resources;

import java.util.Date;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.SecurityContext;


/*
 * This class is meant to gather the Tomcat context data,
 * username, projectname into one single
 * object that can be easily passed
 * to functions and so on. 
 * 
 * This object is saved into the DatabaseObject
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
	
	// active tab_id (consists of a database name and a page_id [=tab-id])
	private String activeTabId;
	
	
	// constructor
	public ContextObject(			
			ServletContext context,
			SecurityContext sc,
			HttpServletRequest httpServletRequest,
			String dbName,
			String username){
		
		this.context = context;
		this.dbName = dbName;		
		this.sessionId = getSessionId(httpServletRequest);
		
		// milliseconds since 1970
		this.timeLastUsed = new Date().getTime(); 
		
		// we set the username right away, because the security object 'dies' 
		// immediately after the request is done. 
		if (username != null)
			this.username = username.trim();
	}
	
	// mini constructor (t.i. without servlet context info etc.)
	// (THIS IS MEANT FOR TEMPORARY USE WITHOUT CACHING)
	public ContextObject(			
			String dbName,
			String username){
		
		this.dbName = dbName;
		this.username = username.trim();	
		// milliseconds since 1970
		this.timeLastUsed = new Date().getTime();
	}
	
	
	
	
	public void setActiveTabId(String activeTab) {
		this.activeTabId = activeTab;
	}
	
	// special methods
	
	 
	public String getUsername(){
		return this.username;
	}
	
	// is the object left unused? 
	// (t.i. last time is was used was longer ago than a given maximal duration)
	public boolean isLeftUnused(){			
		
		return ( 
			(new Date().getTime() - getTimeLastUsed()) > Constants.MAX_DB_OBJECT_DURATION  
		);			
	}
	
	// is the user gone?
	// (only in use in spy mode)
	public boolean userIsGone(){			
		
		return ( 
			(new Date().getTime() - getTimeLastUsed()) > Constants.TIME_GONE 
		);			
	}
	
	
	// object age management
	
	public long getTimeLastUsed() {
		return timeLastUsed;
	}

	// this one mustn't be used outside this class
	private void setTimeLastUsed() {
		this.timeLastUsed = new Date().getTime(); // milliseconds since 1970
	}
	
	
	
	// Getters
	
	// The first set of methods [part a] are the 'normal ones'.
	// When those are called, we consider it to be genuine user activity,
	// so we update the last-time-used parameter on the fly
	//
	// The second set of methods [part b] are not called
	// during user activity, but are called by a 'spy' to investigate 
	// who is active etc. This is why we mustn't update the 
	// last-time-used parameter in this second set of methods.
	
	// part [a]
	
	public String getDbName() {
		setTimeLastUsed();
		return this.dbName;
	}
	
	public String getActiveTabId() {
		setTimeLastUsed();
		return this.activeTabId;
	}
	
	public ServletContext getContext() {
		setTimeLastUsed();
		return this.context;
	}
	
	public String getSessionId() {
		setTimeLastUsed();
		return this.sessionId;
	}
	
	// getter without notifying that this object was accessed 
	// (as this would tell the app that the object is still in use)
	public String getSessionIdSecretly() {
		return this.sessionId;
	}
	

	// part [b]

	public String getDbNameForSpy() {
		return this.dbName;
	}
	
	public String getActiveTabIdForSpy() {
		return this.activeTabId;
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
	// into the same project (which is not recommended, but can happen!)
	public String getUniqueIdentifier() {
		return this.username + Constants.ARG_INTERNAL_SEPARATOR + 
				this.dbName + Constants.ARG_INTERNAL_SEPARATOR + 
				this.sessionId;
	}
	
	
	/**
	 * Retrieve the session ID from the request
     * (might be shibSession if using Clarin login, or the session ID otherwise)
     * @param request
     * @return session ID
	 */
    private String getSessionId(HttpServletRequest request) {

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
	
}
