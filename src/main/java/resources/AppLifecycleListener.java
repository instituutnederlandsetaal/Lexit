package resources;

import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Date;
import java.util.Enumeration;
import java.util.concurrent.ConcurrentHashMap;

import com.zaxxer.hikari.HikariDataSource;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class AppLifecycleListener implements ServletContextListener {	
	
	// this class is about ensuring proper shutdown of HikariCP pools,
	// otherwise the threads from HikariCP will keep running, causing a memory leak
	
	
	// projectname to DataSource (connection pool)
	public static ConcurrentHashMap<String, HikariDataSource> project2DataSource = new ConcurrentHashMap<String, HikariDataSource>();
	
	// projectname to last time it was used (in milliseconds since epoch)
	public static ConcurrentHashMap<String, Long> project2TimeLastUsed = new ConcurrentHashMap<String, Long>();
	
	// projectname to credentials (host, username, password, etc.)
	public static ConcurrentHashMap<String, String[]> project2Credentials = new ConcurrentHashMap<String, String[]>();
		

	
	
	// setter
	public static void registerDataSource(String newProjectName, HikariDataSource ds) {		
		
		// clean up the current list
		
		for (String project : project2TimeLastUsed.keySet()) {
    		
			// if this project is unused, close its data source
			// and remove it from the map
			
    		if (isLeftUnused(project)) {
    			
    			// get the source for the project
        		HikariDataSource dataSource = project2DataSource.get(project);
        		
        		// If the data source is not null, close it
        		if (dataSource != null) {    			
        			try {
        				dataSource.close();
    	            } 
    	       		catch (Exception e) {
    	       			e.printStackTrace();
    	            }
        		}
        		 
        		// finally, remove the project from the map after closing its data source
        		try {
        			project2DataSource.remove(project);
        		}
        		catch (Exception e) {
        			e.printStackTrace();
                }
    		}
    	}
		
		
		// register the data source for the new project
		project2DataSource.put(newProjectName, ds);
    }
	
	// getter
	public static HikariDataSource getDataSource(String projectName) {
		
		// register last used time
		project2TimeLastUsed.put(projectName, new Date().getTime());
		
		return project2DataSource.get(projectName);
	}
	
	// getter without time registration
	public static HikariDataSource getDataSourceForSpy(String projectName) {
		
		return project2DataSource.get(projectName);
	}
	
	
	
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
    	
    	// Close all HikariCP data sources
    	
    	for (String project : project2DataSource.keySet()) {
    		
    		// get the source for the project
    		HikariDataSource dataSource = project2DataSource.get(project);
    		
    		// If the data source is not null, close it
    		if (dataSource != null) {    			
    			try {
    				dataSource.close();
	            } 
	       		catch (Exception e) {
	       			e.printStackTrace();
	            }
    		}
    		 
    		// finally, remove the project from the map after closing its data source
    		try {
    			project2DataSource.remove(project);
    		}
    		catch (Exception e) {
    			e.printStackTrace();
            }
    	}
    	
        // Deregister JDBC drivers to avoid memory leaks
    	
        Enumeration<Driver> drivers = DriverManager.getDrivers();
        while (drivers.hasMoreElements()) {
            Driver driver = drivers.nextElement();
            if (driver.getClass().getClassLoader() == getClass().getClassLoader()) {
                try {
                    DriverManager.deregisterDriver(driver);
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // Optional init code
    }
    
    
    // is a DataSource left unused? 
 	// (t.i. last time is was used was longer ago than a given maximal duration)
    private static boolean isLeftUnused(String project){ 		
    	return ( (new Date().getTime()) - getTimeLastUsed(project) > Constants.TIME_GONE );	
 	}
 	
 	private static long getTimeLastUsed(String project) {
		return project2TimeLastUsed.get(project);
	}

}
