package lexit.resources;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

/**
 * DbResponseObject is meant to be sent
 * as a response to the web application after some request
 * The object contains a field response with 'OK' or some error message
 * @author Fannee
 *
 */
@XmlRootElement(name="root")
public class DbResponseObject {
	
	@XmlElement(name="response")
	public String resp;
	@XmlTransient
	public String getResponse(){
		return this.resp;
	}
	public void setResponse(String resp){
		
		if (Constants.debug)
			System.out.println("!!! Response was set to '"+resp+"'");
		this.resp = resp;
	}

}
