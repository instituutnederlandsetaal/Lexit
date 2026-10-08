package spy;

import java.util.ArrayList;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

/**
 * The ConnectionsListObject holds a list of info about all connection pools (for the spy mode). 
 * 
 * Each entry holds info for one project, that is: 
 *  projectname, total number of connections, active connections, idle connections, awaiting connections
 */

@XmlRootElement(name="root")
public class ConnectionsListObject {
	
	@XmlElementWrapper(name="connections")
	@XmlElement(name="connection")
	public ArrayList<ConnectionObject> connectionData = new ArrayList<ConnectionObject>();
	@XmlTransient
	public ArrayList<ConnectionObject> getConnectionData(){
		return this.connectionData;
	}
	public void addConnectionData(String[] connectionData){
		ConnectionObject cd = new ConnectionObject(connectionData);
		
		this.connectionData.add(cd);
	}

}
