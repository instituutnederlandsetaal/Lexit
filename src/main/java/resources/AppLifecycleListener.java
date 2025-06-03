package resources;

import com.zaxxer.hikari.HikariDataSource;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

@WebListener
public class AppLifecycleListener implements ServletContextListener {
	
	
	// this class is about ensuring proper shutdown of HikariCP pools,
	// otherwise the threads from HikariCP will keep running, causing a memory leak

    private static final List<HikariDataSource> dataSources = new ArrayList<>();

    public static void registerDataSource(HikariDataSource ds) {
        dataSources.add(ds);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // Close all HikariCP data sources
        for (HikariDataSource ds : dataSources) {
            try {
                ds.close();
            } catch (Exception e) {
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
