package spy;

import jakarta.xml.bind.annotation.XmlElement;

/**
 * a ConnectionObject holds information about the connection pool of ONE single project 
 * (for the spy mode):
 * 
 * projectname, total number of connections, active connections, idle connections, awaiting connections 
 */

public class ConnectionObject {
	
	@XmlElement(name="item")
    String[] connectionInfo;

    public ConnectionObject(String[] connectionInfo){
        this.connectionInfo = connectionInfo;
    }

    public ConnectionObject(){}

}
