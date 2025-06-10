package resources;

import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
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
		

	
	
	// setter
	public static void registerDataSource(String projectName, HikariDataSource ds) {
		project2DataSource.put(projectName, ds);
    }
	
	// getter
	public static HikariDataSource getDataSource(String projectName) {
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
}
