package resources;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Consumes;
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
import util.FileProcessor;
import util.Util;

// This will map the resource to the URL
@Path("/api")
public class FilesResource {
	
	private final ResourceContextService service = SharedResources.SERVICE;
	
	
	// get the list of projects Javascript config files
	// call:
	// .../api/get_configfiles_list
	@Path("get_configfiles_list")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject getListOfConfigFiles(
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, null, userName);
		
		// trick to get the path where the other files are
		String fileName = "projects_overview.js";
		String filepath = co.getContext().getRealPath(fileName);			
		
		
		filepath = filepath.replace(
			File.separatorChar + Constants.BASE_URL + File.separator + fileName, 
			File.separatorChar + Constants.CONFIG_DIR); // remove filename as we only need the path here
		
		ResponseObject response = new ResponseObject();
		response.setResponse( FileProcessor.getListOfFiles(filepath) );
		
		return response;
	}
	
	
	
	@Path("upload_file")
	@POST
	@Consumes(MediaType.MULTIPART_FORM_DATA)	
	public ResponseObject uploadFile(
			@FormDataParam("file") InputStream fileInputStream,
			@FormDataParam("file") FormDataContentDisposition fileMetaData,
			@FormDataParam("db") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws Exception {

		String userName = service.getLexitInfo().getUserName(httpServletRequest);		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		// get file processor and convert the file into a table in the database
		FileProcessor fp = new FileProcessor(service, co);
		ResponseObject ro = fp.convertFileIntoTable(dbName, fileInputStream, fileMetaData);

		fileInputStream.close(); // avoid memory leaks!

		return ro;
	}
	
	
	@Path("get_upload_info")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject getUploadInfo(
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws Exception {
		
		ResponseObject ro = new ResponseObject();
		
		// retrieve context object so as to get the session id and the upload info for this session
		String userName = service.getLexitInfo().getUserName(httpServletRequest);		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		// retrieve the session id from the context object and get the upload info for this session
		String sesionId = co.getSessionId();
		String uploadInfo = service.getLexitInfo().getSessionIdUploadInfo(sesionId);
		
		ro.setResponse(uploadInfo);
		return ro;
	}
	
	
	@Path("remove_uploaded_table")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject removeUploadedFile(
			@FormParam("db_name") String dbName,
			@FormParam("table_name") String tableName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) throws Exception {

		String userName = service.getLexitInfo().getUserName(httpServletRequest);		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());

		FileProcessor fp = new FileProcessor(service, co);
		ResponseObject ro = fp.removeUploadedFile(tableName);

		return ro;
	}
	
	// get the javascript configuration file from the configuration directory
	// call:
	// .../api/get_configfile
	@Path("get_configfile")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getConfigJsFile(
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest 
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "Loading config file...");
		
		String fileToSend = null;
		try {
			fileToSend = readConfigJsFile(co);
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return Response.ok(fileToSend, MediaType.TEXT_PLAIN).build();
	}
	
	// get the javascript WELCOME file from the configuration directory
	@Path("get_welcome_page")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getWelcomeJsFile(
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest 
			){
		
		String fileToSend = null;
		try {
			fileToSend = readWelcomeJsFile(context, dbName);
		} catch (IOException e) {
			
			// a welcome page is not mandatory, so no need to throw an exception
			
			fileToSend = "NOT_AVAILABLE"; // don't change this value, as the client will check for it!
		}
		
		return Response.ok(fileToSend, MediaType.TEXT_PLAIN).build();
	}
	
	
	
	
	// get the javascript projects overview file from the configuration directory
	// call:
	// .../api/get_projects_overview
	@Path("get_projects_overview")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getProjectsOverviewJsFile(
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, null, userName);
		Util.debug(co, "Loading projects overview file...");
		
		String fileToSend = null;
		try {
			fileToSend = readProjectsOverviewFile(co);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return Response.ok(fileToSend, MediaType.TEXT_PLAIN).build();
	}
	
	
	// Read the javascript configuration file from
	// the configuration directory
	public synchronized String readConfigJsFile(ContextObject co) throws IOException{
		
		Util.debug(co, "Read javascript configuration file '"+co.getDbName()+".config.js"+"'...");
		
		String fileName = co.getDbName()+".config.js";
		
		String filepath = co.getContext().getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
				File.separatorChar + Constants.CONFIG_DIR + File.separator+fileName);
		Util.debug(co, "File: "+filepath);
		
		StringBuilder sb = new StringBuilder();
		
		try{
			FileInputStream fstream = new FileInputStream(filepath);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {				
				sb.append(strLine);
				sb.append("\n");
			}
			br.close();
			in.close();
		}
		catch (Exception e){//Catch exception if any
			throw new RuntimeException("Error while reading the "+filepath+" configuration file", e);
		}
		
		return sb.toString();
	}
	
	
	public synchronized String readWelcomeJsFile(ServletContext co, String dbName) throws IOException{
		
		String fileName = dbName+".welcome.js";
		String filepath = co.getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
				File.separatorChar + Constants.CONFIG_DIR + File.separator+fileName);
		
		StringBuilder sb = new StringBuilder();
		
		try{
			FileInputStream fstream = new FileInputStream(filepath);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {				
				sb.append(strLine);
				sb.append("\n");
			}
			br.close();
			in.close();
		}
		catch (Exception e){ 
			sb = new StringBuilder();
			sb.append("NOT_AVAILABLE"); // don't change this value, as the client will check for it!
		}
		
		return sb.toString();
	}
	
	
	// same as readConfigJsFile, but specialize for the projects overview file
	public synchronized String readProjectsOverviewFile(ContextObject co) throws IOException{
		
		Util.debug(co, "Read javascript projects overview file...");
		
		String fileName = "projects_overview.js";
		
		String filepath = co.getContext().getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
				File.separatorChar + Constants.CONFIG_DIR + File.separator+fileName);
		Util.debug(co, "File: "+filepath);
		
		StringBuilder sb = new StringBuilder();
		
		try {
			FileInputStream fstream = new FileInputStream(filepath);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {				
				sb.append(strLine);
				sb.append("\n");
			}
			br.close();
			in.close();
		}
		catch (Exception e) { 
			throw new RuntimeException("Error while reading the "+filepath+" file", e);
		}
		
		return sb.toString();
	}

}
