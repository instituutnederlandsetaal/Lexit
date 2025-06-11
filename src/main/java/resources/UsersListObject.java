package resources;

import java.util.ArrayList;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

@XmlRootElement(name="root")
public class UsersListObject {
	
	@XmlElementWrapper(name="users")
	@XmlElement(name="user")
	public ArrayList<UserObject> users_data = new ArrayList<UserObject>();
	@XmlTransient
	public ArrayList<UserObject> getUsersData(){
		return this.users_data;
	}
	public void addUserData(String[] user_data){
		UserObject uo = new UserObject(user_data);
		
		this.users_data.add(uo);
	}

}
