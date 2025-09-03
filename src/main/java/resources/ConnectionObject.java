package resources;

import jakarta.xml.bind.annotation.XmlElement;

public class ConnectionObject {
	
	@XmlElement(name="item")
    String[] connectionInfo;

    public ConnectionObject(String[] connectionInfo){
        this.connectionInfo = connectionInfo;
    }

    public ConnectionObject(){}

}
