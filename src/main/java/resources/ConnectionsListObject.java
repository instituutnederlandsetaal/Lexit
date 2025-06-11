package resources;

import java.util.ArrayList;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

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
