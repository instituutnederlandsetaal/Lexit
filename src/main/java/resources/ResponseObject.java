package resources;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

/**
 * DbResponseObject is a general (therefore often used) response object,
 * meant to send a response to the client after some request to the webservice.
 * 
 * The object contains a field response with 'OK' or some error message
 *
 */
@XmlRootElement(name="root")
public class ResponseObject {
	
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
