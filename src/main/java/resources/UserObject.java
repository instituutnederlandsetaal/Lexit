package resources;

import jakarta.xml.bind.annotation.XmlElement;

public class UserObject {
	
	@XmlElement(name="item")
    String[] userData;

    public UserObject(String[] userData){
        this.userData = userData;
    }

    public UserObject(){}

}
