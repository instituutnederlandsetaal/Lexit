package lexit.resources;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

@XmlRootElement(name="root")
public class UsersListObject {
	
	@XmlElementWrapper(name="users")
	@XmlElement(name="user")
	public ArrayList<String[]> users_data = new ArrayList<String[]>();
	@XmlTransient
	public ArrayList<String[]> getUsersData(){
		return this.users_data;
		}
	public void addUserData(String[] user_data){
		this.users_data.add(user_data);
		}

}
