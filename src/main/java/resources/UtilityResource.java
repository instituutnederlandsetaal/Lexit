package resources;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import tables.TableRecordObject;
import database.LexitSchemaAccess;
import util.ServiceCaller;
import util.Util;


// This will map the resource to the URL
@Path("/api")
public class UtilityResource {
	
	private final ResourceContextService service = SharedResources.SERVICE;
	
	
	// .../api/get_neutral_separator
	// get all the unique values a column may contain (needed for select boxes)
	@Path("get_neutral_separator")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject getNeutralSeparator(
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			)
	  {
		
		ResponseObject dro = new ResponseObject(); 
		
		try {			
			dro.setResponse( Constants.ARG_INTERNAL_SEPARATOR );
			
			// since the getNeutralSeparator function if always the very first server function to be called
			// this is the time to initialize the LexitSchemaAccess object:
			// it gives us access to the lex'it users login and roles
					
			if (service.getLexitInfo() == null)
				service.setLexitInfo( new LexitSchemaAccess(context, false) );
		
		}
		catch (Exception e) {
			
			StringWriter stringWriter = new StringWriter();
	        PrintWriter printWriter = new PrintWriter(stringWriter);
	        e.printStackTrace(printWriter);
			String stackTrace = stringWriter.toString();
			
			throw new RuntimeException(stackTrace);
		}

		return dro;
	  }
	
	
	
	// call a webservice through the Lex'it webservice, to avoid 'strict-origin-when-cross-origin' errors
	// call:
	// .../api/call_external_service
	@Path("call_external_service")
	@POST
	@Produces({MediaType.TEXT_PLAIN})
	public Response callExternalService(
			@FormParam("url") String url,
			@DefaultValue("GET") @FormParam("type") String requestMethod, 
			@FormParam("data") String urlParameters, 
			@DefaultValue("UTF-8") @FormParam("encoding") String charEncoding, 
			@DefaultValue("application/x-www-form-urlencoded") @FormParam("contentType") String contentType,
			@DefaultValue("xml") @FormParam("dataType") String dataType,
			@Context HttpServletRequest httpServletRequest
			) {
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		
		// create a service caller 
		ServiceCaller sc = new ServiceCaller(url);
		
		// call the service with it
		String response = sc.call(requestMethod, urlParameters, charEncoding, contentType, dataType, userName);
		
		// return the service response
		return Response.ok(response, MediaType.TEXT_PLAIN).build();
	}
	
	
	
	
	
	
	// .../api/call_function
	@Path("call_function")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject callFunction(
			@FormParam("function_name") String functionName,
			@DefaultValue("true_null") @FormParam("args") String args,	// true null
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Call function "+functionName);
		
		// true null must be null (we must be able to make the difference between an empty string and null)
		if (args != null && args.equals("true_null")) 
			args = null;		
		String[] argsArr = (args != null) ?
				args.split(Constants.ARG_INTERNAL_SEPARATOR, -1)
				:
				new String[]{};		
		
		
		// first check the function operation type (= writing/reading)
		String functionOperationType = service.getDatabaseObject(co).getFunctionOperationType(functionName, argsArr.length);
		
		// function type must match the user's access rights
		if ( !service.userIsAllowedTo(co, functionOperationType))
			throw new RuntimeException("Permission denied to "+userName);	
		
		TableRecordObject tro = 
				service.getDatabaseObject(co).callFunction(functionName, argsArr);
				
		return tro;
	}
	
	
	// turn debug mode on/off
	// call:
	// .../api/debug?mode=....
	@Path("debug")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject debugMode(
			@DefaultValue("off") @QueryParam("mode") String debugMode,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, "RaNdOmDaTaBaSe", userName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		if (debugMode.equals("on"))
			Constants.debug = true;
		else
			Constants.debug = false;
		
		System.out.println("### Debug mode is now turned "+(Constants.debug ? "ON":"OFF") );
	
		ResponseObject dro = new ResponseObject();
		dro.setResponse("OK");
		
		return dro;
	}
	
	

}
