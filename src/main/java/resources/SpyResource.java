package resources;

import java.text.SimpleDateFormat;
import java.util.Date;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import spy.ConnectionsListObject;
import spy.UsersListObject;
import database.Database;


// This will map the resource to the URL
@Path("/api")
public class SpyResource {
	
	private final ResourceContextService service = SharedResources.SERVICE;
	
	// This is to be used by the spy tool
	// this function gets users' info out of the map of ContextObjects
	//
	// .../api/get_users
	@Path("get_users")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UsersListObject getListOfActiveUsers(){
		
		UsersListObject ulo = new UsersListObject();
		
		for (String key : service.getNameToDatabaseObject().keySet()) {
			
			Database currentDbObj = service.getNameToDatabaseObject().get(key);
			
			ContextObject co = currentDbObj.getContextObject();
		
			String dbName = co.getDbNameForSpy();
			String userName = co.getUsername();
			Date date = new Date(co.getTimeLastUsed());
			String sessionId = co.getSessionIdForSpy();
			String activeTabId = co.getActiveTabIdForSpy();
			SimpleDateFormat df2 = new SimpleDateFormat("yyyy.MM.dd 'at' HH:mm:ss");
			String lastActive = df2.format(date);
			String activeRecently = (co.userIsGone() ? "Sleep mode" : "Active now");
			
			ulo.addUserData(new String[]{dbName, (userName != null ? userName : "SYSTEM"), sessionId, (activeTabId != null ? activeTabId : "N/A"), lastActive, activeRecently});
		}
		return ulo;
	}
	
	
	
	@Path("get_connections_state")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ConnectionsListObject getConnectionsState() {
		
		ConnectionsListObject clo = new ConnectionsListObject();
		
		for (String project : AppLifecycleListener.project2DataSource.keySet()) {
    		
    		// get the source for the project
    		HikariDataSource dataSource = AppLifecycleListener.getDataSourceForSpy(project);
    		
    		// If the data source is not null, close it
    		if (dataSource != null) {	
    			HikariPoolMXBean poolMXBean = dataSource.getHikariPoolMXBean();
    			
    			int activeConnections = poolMXBean.getActiveConnections();
    			int idleConnections = poolMXBean.getIdleConnections();
    			int totalConnections = poolMXBean.getTotalConnections();
				int threadsAwaitingConnection = poolMXBean.getThreadsAwaitingConnection();				

				// add the data to the ConnectionsListObject
				clo.addConnectionData(
						new String[] { project, String.valueOf(activeConnections), String.valueOf(idleConnections),
								String.valueOf(totalConnections), String.valueOf(threadsAwaitingConnection) });
    		}
    		 
    	}
		
		
		return clo;
		
	}

}
