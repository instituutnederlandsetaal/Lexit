package util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;

/**
 * This class is about calling services (using the Lex'it webservice as a proxy)
 */

public class ServiceCaller {
	
	String url = "";
	
	// debug modus
	private boolean debug = false;
	
	public ServiceCaller(String url) {
		this.url = url;
	}	
	
	
	
	// Call a webservice and return response
	// see: https://stackoverflow.com/questions/4205980/java-sending-http-parameters-via-post-method-easily
	
	public String call(String requestMethod, String urlParameters, String charEncoding, String contentType, String responseFormat, String userName) {
		
		String urlString = this.url;
		
		if (debug) {
			System.out.println("SERVICE CALLER ----------------------");
			System.out.println(urlString);		
			System.out.println(charEncoding);
			System.out.println(contentType);
			System.out.println(urlParameters);			
		}
		
		
		String xmlResponse;
	
		// -----------------------------------------------------------------
		// POST request
		
		if (requestMethod.equalsIgnoreCase("post")){
			
			if (debug)
				System.out.println("Doing a POST request");
			
			
			URL oracle = null;
			try {
				oracle = new URL(urlString);
				
			} catch (MalformedURLException e) {
				System.out.println("url:" + urlString);
				e.printStackTrace();
			}
			
			// prepare to send the data to be POSTed
			
			byte[] postDataBytes = null;
			
			// set character encoding
			
			try {
				postDataBytes = urlParameters.getBytes( charEncoding );
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
		
			
			// open connection
			
			HttpURLConnection conn = null;
			try {
				conn = (HttpURLConnection) oracle.openConnection();				
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			
			// set POST method
			
			try {
				conn.setRequestMethod("POST");
			} catch (ProtocolException e) {
				e.printStackTrace();
			}
			conn.setRequestProperty("Content-Type", contentType);
			conn.setRequestProperty("charset", charEncoding);
			conn.setRequestProperty("Content-Length", Integer.toString( postDataBytes.length));
			conn.setRequestProperty("Accept", "application/"+responseFormat);
			conn.setDoOutput(true);
			
			// add user name to request (Clarin)
			if (userName != null && !userName.trim().isEmpty())
				conn.setRequestProperty("remote-user", userName);
			
			// post data !
			try {
				conn.getOutputStream().write(postDataBytes);
			} catch (IOException e) {
				e.printStackTrace();
			}

			
			// get response
			
			StringBuffer sb = new StringBuffer();
			
			try (BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream(), charEncoding))) {

				String line = "";
				while ((line = rd.readLine()) != null) {
					sb.append(line);
				}

			} catch (Exception e) {
				e.printStackTrace();
			}

			xmlResponse = sb.toString();
		}
		
		// -----------------------------------------------------------------
		// Any other type of requestMethod
		// will be considered a GET request
		
		else {
			
			if (debug) System.out.println("Doing a GET request");
			
			URL oracle = null;
			HttpURLConnection conn = null;

			try {
				if (urlParameters != null && !urlParameters.trim().isEmpty()) {
					urlString += "?" + urlParameters;
				}
				oracle = new URL(urlString);
				
				// open connection
				conn = (HttpURLConnection) oracle.openConnection();
				
				// set GET method
				conn.setRequestMethod("GET");
				conn.setRequestProperty("Accept", "application/"+responseFormat);
				
				// add user name to request (Clarin)
				if (userName != null && !userName.trim().isEmpty())
					conn.setRequestProperty("remote-user", userName);
				
			} catch (MalformedURLException e) {
				System.out.println("url:" + url);
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			// get the response of the webservice
			
			StringBuffer sb = new StringBuffer();

			try (BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream(), charEncoding))) {

				String line = "";
				while ((line = rd.readLine()) != null) {
					sb.append(line);
				}

			} catch (Exception e) {
				e.printStackTrace();
			}

			xmlResponse = sb.toString();
		}
		
		if (debug) System.out.println(xmlResponse);
		
		return xmlResponse;
	}

}
