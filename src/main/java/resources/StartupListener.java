package resources;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;

public class StartupListener implements ServletContextListener {
	
	@Override
    public void contextInitialized(ServletContextEvent sce) {
		
		// make sure that the Tomcat session lasts long enough, as declared
		// in Constants.MAX_SESSION_ID_DURATION (since that is declared in milliseconds, we need to convert that in minutes)
		
        sce.getServletContext().setSessionTimeout((int) Constants.MAX_SESSION_ID_DURATION / (60 * 1000)); // converting to minutes
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // optional cleanup
    }

}
