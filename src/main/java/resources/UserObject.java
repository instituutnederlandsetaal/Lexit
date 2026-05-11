package resources;

import jakarta.xml.bind.annotation.XmlElement;

/**
 * The UserObject holds info about one single user,
 * that is: username, session ID, accessed database name, active tab, last activity time, status (=active/sleep)
 * 
 * This object to be used as part of the UsersListObject (which hold a list of users info), 
 * for the spy mode.
 */

public class UserObject {
	
	@XmlElement(name="item")
    String[] userData;

    public UserObject(String[] userData){
        this.userData = userData;
    }

    public UserObject(){}

}
