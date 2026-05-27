package resources;

import java.io.IOException;

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
import jakarta.ws.rs.core.SecurityContext;

// This will map the resource to the URL
@Path("/api")
public class ProjectsResource {
	
	private final ResourceContextService service = SharedResources.SERVICE;
	
 	
 	// remove the database object from the cache
 	// call:
 	// .../api/reset_project
 	@Path("reset_project")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject resetProject(
			@DefaultValue("") @FormParam("db_name") String dbName, 
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		ResponseObject dro = new ResponseObject();
 		
 		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		try {
			AppLifecycleListener.deletePool(dbName);
			dro.setResponse("OK");
		}
		catch (Exception e) {
			dro.setResponse("Something went wrong when resetting project "+dbName+" : "+e.getMessage());
		}
 		return dro;
 	}
 	
 	
 	// set current project to work in another schema than the default one
 	// (the default schema is the one specified in the .database config file)
 	// call:
 	// .../api/set_schema?db_name=...&schema_name=...
 	@Path("set_schema")
 	@POST
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject setSchema(
 			@FormParam("db_name") String dbName,
 			@FormParam("schema_name") String schemaName,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest){
 		
 		return doSetSchema(dbName, schemaName, context,	sc,	httpServletRequest);
 	}
 	
 	// keep this one for backwards compatibility (some old config.js target this endpoint), but it's better to use the POST version of this function (see above)
 	@Path("set_schema")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject setSchemaGet(
 			@QueryParam("db_name") String dbName,
 			@QueryParam("schema_name") String schemaName,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest){
 		
 		return doSetSchema(dbName, schemaName, context,	sc,	httpServletRequest);
 	}
 	
 	// private helper for functions hereabove
 	private ResponseObject doSetSchema(
 			String dbName,
 			String schemaName,
 			ServletContext context,
 			SecurityContext sc,
 			HttpServletRequest httpServletRequest){
 		
 		String userName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
 		
 		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
 			throw new RuntimeException("Permission denied to "+co.getUsername());
 		
 		// change psql search path
 		service.getDatabaseObject(co).setSchemaName(schemaName);
 		
 		ResponseObject response = new ResponseObject();
 		response.setResponse("search_path set to "+schemaName);
 		
 		return response;
 	}
 	
 	
 	// get host and database name of a project 
 	// call:
 	// .../api/get_dbinfo?db=...
 	@Path("get_dbinfo")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public ResponseObject getProjectDbInfo(
 			@QueryParam("db") String dbName,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest			
 			) throws IOException {
 		
 		String userName = service.getLexitInfo().getUserName(httpServletRequest);
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
 		
 		// NO CHECK OF ACCESS RIGHTS HERE, SINCE THIS FUNCTIONALITY IS TYPICALLY ACCESSED BEFORE LOGGING IN!		
 		
 		String[] dbInfo = service.getDatabaseObject(co).getDatabaseInfo();
 		String infoStr = "database '"+dbInfo[0]+"' on host '"+dbInfo[1]+"'";
 		
 		ResponseObject response = new ResponseObject();
 		response.setResponse(infoStr);
 		
 		return response;
 	}
 	
 	
 	
 	
 	

}
