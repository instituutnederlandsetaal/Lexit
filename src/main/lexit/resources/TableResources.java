package lexit.resources;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.inject.Singleton;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

import lexit.table.TableRecordObject;
import lexit.table.TableRecordsObject;
import lexit.table.TablesListObject;
import lexit.table.UniqueValuesObject;
import lexit.util.Database;
import lexit.util.Util;

/**
 * The TableResources class is the main class in a Jersey project
 * Here the different kinds of requests can be mapped to functions and classes
 * 
 * @author Mathieu Fannee (INL)
 *
 */

@Singleton


// This will map the resource to the tables URL 
@Path("/table")
public class TableResources {
		
	// database access objects, needed for caching (for speed)
	ConcurrentHashMap<String, Database> nameToDatabaseObject = new ConcurrentHashMap<String, Database>();
	
	// users access rights
	ConcurrentHashMap<String, String[]> users2roles = new ConcurrentHashMap<String, String[]>();
	
	
	
	
	// get the javascript configuration file from the configuration directory
	// call:
	// .../table/get_configfile
	@Path("get_configfile")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getConfigJsFile(
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest 
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "Loading config file...");
		
		String fileToSend = null;
		try {
			fileToSend = readConfigJsFile(co);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return Response.ok(fileToSend, MediaType.TEXT_PLAIN).build();
	}
	
	
	
	// get the javascript projects overview file from the configuration directory
	// call:
	// .../table/get_projects_overview
	@Path("get_projects_overview")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getProjectsOverviewJsFile(
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, null);
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
	
	
	
	// get the name of the user which had logged in
	// call:
	// .../table/get_username
	@Path("get_username")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject showResource(
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		DbResponseObject response = new DbResponseObject();
		response.setResponse(sc.getUserPrincipal().getName());
		
		return response;
	}
	
	
	// clean the cache of some table
	// call:
	// .../table/cleancache?table=....
	@Path("cleancache")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject cleanCache(
			@QueryParam("table_name") String tableName,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Clean cache of "+tableName);
		
		DbResponseObject dro = new DbResponseObject();
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		getDatabaseObject(co).cleanCache(tableName);
	
		dro.setResponse("OK");
		
		return dro;
	}
	
	
	
	// reset user rights 
	// call:
	// .../table/reset_user_rights
	@Path("reset_user_rights")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject resetConfig(
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		DbResponseObject dro = new DbResponseObject();
				
		users2roles = new ConcurrentHashMap<String, String[]>();
	
		dro.setResponse("OK");
		
		return dro;
	}
	
	
	
	// turn debug mode on/off
	// call:
	// .../table/debug?mode=....
	@Path("debug")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject debugMode(
			@DefaultValue("off") @QueryParam("mode") String debugMode,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, "RaNdOmDaTaBaSe");
		
		if ( !userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		if (debugMode.equals("on"))
			Constants.debug = true;
		else
			Constants.debug = false;
		
		System.out.println("### Debug mode is now turned "+(Constants.debug ? "ON":"OFF") );
	
		DbResponseObject dro = new DbResponseObject();
		dro.setResponse("OK");
		
		return dro;
	}
	


	// get the list of columns of a table and their type 
	// and their allowed values (in case of Postgres user-defined type)
	// call:
	// .../table/getcolumns?table=....
	@Path("getcolumns")
	public TableMetadataInspector showResource( 
			@QueryParam("table") String tableName,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Get Columns from "+tableName);
		
				
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
				
		return new TableMetadataInspector(getDatabaseObject(co), tableName);
	}
	
	
	// .../table/get_unique_values
	// get all the unique values a column may contain (needed for select boxes)
	@Path("get_unique_values")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UniqueValuesObject getUniqueValues(
			  @QueryParam("db_name") String dbName, 
			  @QueryParam("table_name") String tableName, 
			  @QueryParam("column_name") String columnName,
			  @Context ServletContext context,
			  @Context SecurityContext sc,
				@Context HttpServletRequest httpServletRequest
				)
	  {
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		
	    Util.debug(co, "### Get unique values for column " + columnName + " in " + tableName);
	    
	    
	    String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);

		
	    return getDatabaseObject(co).getUniqueValues(tableName, columnName);
	  }
	
	
	// .../table/get_row_number
	// get the row number corresponding to a given record (given some value to match in some column)
	@Path("get_row_number")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getRowNumber(
			@QueryParam("db_name") String dbName,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("column_value") String columnValue,
			@QueryParam("sort_columns") String sortColumns,
			@QueryParam("sort_directions") String sortDirections,
			@QueryParam("filter_column_names") String filterColumns,
			@QueryParam("filter_values") String filterValues,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Get row number for "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject();
		
		String[] filterColumnsArr = filterColumns.trim().isEmpty() ? 
				null : filterColumns.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] filterColumnValuesArr = filterValues.trim().isEmpty() ?
				null : filterValues.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		String rowNumber = Integer.toString(getDatabaseObject(co).getRowNumberOfRecord(tableName, columnName, columnValue, 
						sortColumns, sortDirections, 
						filterColumnsArr, filterColumnValuesArr
						));
		dro.setResponse(rowNumber);
		
		return dro;
	}
	
	// .../table/setvalue
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValue(
			@QueryParam("row_id") String rowId,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("new_value") String newValue,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### SetValue for "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
		
		String[] rowIds = rowId.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] newValues = newValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		
		// two possibilities:
		
		// I.	- one single column name
		//		- one or more row id's, and corresponding new values for that column in all these rows
		if (columnNames.length==1)
		{
			int numberOfRowsToUpdate = rowIds.length;
			for (int i=0; i<numberOfRowsToUpdate; i++)
			{
				getDatabaseObject(co).updateOneColumn(tableName, rowIds[i], columnName, newValues[i], dro);			
			}			
		}
		
		// II.	- one single row id
		// 		- more column names, and corresponding new values for these columns in that row
		else if (columnNames.length>1 && rowIds.length == 1)
		{
			getDatabaseObject(co).updateWholeRecord(tableName, rowId, columnNames, newValues, dro);
		}
				
		
		return dro;
	}

	// .../table/setcomment
	// set the comment of a table or view
	@Path("setcomment")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setComment(
			@QueryParam("table_name") String tableName,
			@QueryParam("new_comment") String newComment,
			@QueryParam("table_type") String tableType,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Set comment for "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		
		
		getDatabaseObject(co).updateComment(tableName, tableType, newComment, dro);
				
		
		return dro;
	}
	
	
	// .../table/get_comment
	// get the comment of a table or view
	@Path("get_comment")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getComment(
			@QueryParam("table_name") String tableName,
			@QueryParam("table_type") String tableType,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Get comment on "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		
		// put id of record in response object
		
		String comment = getDatabaseObject(co).getComment(tableName, tableType);
		dro.setResponse(comment);
		
		return dro;
	}
	
	
	
	// .../table/get_id_of_record
	// get the id of a row, given some values to match in records
	@Path("get_id_of_record")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getIdOfRecord(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("value") String value,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Get id from record in "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		String[] values = value.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		// put id of record in response object
		
		String id = getDatabaseObject(co).getIdOfRecord(tableName, columnNames, values);
		dro.setResponse(id);
		
		return dro;
	}
	
	
	// .../table/get_record
	// get a record, given its id
	@Path("get_record")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject getRecord(
			@QueryParam("table_name") String tableName,
			@QueryParam("id") String id,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Get record from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		TableRecordObject tro = getDatabaseObject(co).getRecord(tableName, id);
				
		return tro;
	}
	
	
	// .../table/get_records
	// get multiple records, given their ids
	@Path("get_records")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordsObject getRecords(
			@QueryParam("table_name") String tableName,
			@QueryParam("ids") String idsStr,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Get multiple records from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		String[] ids = idsStr.split(Constants.ARG_INTERNAL_SEPARATOR);
		
		TableRecordsObject tro = getDatabaseObject(co).getRecords(tableName, ids);
				
		return tro;
	}
	
	
	
	// .../table/get_record_without_id
	// get a record, given its id
	@Path("get_record_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject getRecordWithoutId(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Get record without id from "+tableName);
		
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		
		TableRecordObject tro = getDatabaseObject(co).getRecordWithoutId(tableName, columnNamesToMatch, valuesToMatch);
				
		return tro;
	}
	
	
	// .../table/call_function
	// get a record, given its id
	@Path("call_function")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject callFunction(
			@QueryParam("function_name") String functionName,
			@QueryParam("args") String args,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Call function "+functionName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		
		TableRecordObject tro = 
			getDatabaseObject(co).callFunction(functionName, args.split(Constants.ARG_INTERNAL_SEPARATOR, -1));
				
		return tro;
	}
	
	
	
	// .../table/setvalue_without_id
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValueWithoutId(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("column_name_to_update") String columnNameToUpdate,
			@QueryParam("value_to_update") String valueToUpdate,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Update record without id in "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
				
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNamesToUpdate = columnNameToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToUpdate = valueToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		
		getDatabaseObject(co).updateRecordWithoutId(tableName, 
				columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
		return dro;
	}
	
	
	// .../table/setvalue_without_id_for_search_and_replace
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue_without_id_for_search_and_replace")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValueWithoutIdForSearchAndReplace(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("column_name_to_update") String columnNameToUpdate,
			@QueryParam("value_to_update") String valueToUpdate,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Update record (search and replace) without id in "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
				
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNamesToUpdate = columnNameToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToUpdate = valueToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		
		getDatabaseObject(co).updateRecordWithoutId_ForSearchAndReplace(tableName, 
				columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
		return dro;
	}
	
	
	
	// .../table/insertvalue
	// insert a new record into a table
	@Path("insertvalue")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecord(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("value") String newValue,
			@QueryParam("returning") String returningField,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Insert record into "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		Util.debug(co, "'"+returningField+"'");
		
		DbResponseObject dro = new DbResponseObject(); 
		
				
		String[] newValues = newValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		if (returningField == null || returningField.toLowerCase().equals("null") || returningField.isEmpty())
		{
			getDatabaseObject(co).insertRecord(tableName, columnNames, newValues, dro);
			
		}
		else 
		{
			// insert record and get its id
			getDatabaseObject(co).insertRecordAndGetItsId(tableName, columnNames, newValues, returningField, dro);
			
		}
		
		return dro;
	}
	
	
	// .../tabel/insertmodified
	// insert some new records based on existing records with ids
	// which will be re-inserted with modified values, according to some patterns and replacement strings
	@Path("insertmodified")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecordModified(
			@QueryParam("table_name") String tableName,
			@QueryParam("filter_column_name") String filterColumnName,
			@QueryParam("filter_value") String filterValue,
			@QueryParam("replacement_value") String replacementValue,
			@QueryParam("column_to_copy") String columnToCopy,
			@QueryParam("row_id") String rowId,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Insert modified record into "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
		
		String[] rowIds = rowId.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnsToCopy = columnToCopy.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		if (columnsToCopy[0].isEmpty()) columnsToCopy = null;
		
		
		getDatabaseObject(co).insertFromExistingRecords(tableName, 
				rowIds, columnsToCopy, filterColumnName, filterValue, replacementValue, 
				dro);
		
		
		return dro;
	}
	
	
	// .../tabel/insertmodified_without_id
	// insert some new records based on existing records
	// which will be re-inserted with modified values, according to some patterns and replacement strings
	@Path("insertmodified_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecordModifiedWithoutId(
			@QueryParam("table_name") String tableName,
			@QueryParam("filter_column_name") String filterColumnName,
			@QueryParam("filter_value") String filterValue,
			@QueryParam("replacement_column_name") String replacementColumnName,
			@QueryParam("replacement_value") String replacementValue,
			@QueryParam("returning") String returningField,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Insert modified record without id into "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 
		
		String[] filterColumnNames = filterColumnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] filterValues = filterValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] replacementColumnNames = replacementColumnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] replacementValues = replacementValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		getDatabaseObject(co).insertFromExistingRecordsWithoutId(tableName, 
				filterColumnNames, filterValues, replacementColumnNames, replacementValues, 
				returningField, dro);
		
		
		return dro;
	}
	
	
	// .../table/delete_row
	// delete a record from a table, given its id
	@Path("delete_row")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject deleteRecord(
			@QueryParam("table_name") String tableName,
			@QueryParam("row_id") String rowId,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Delete record from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		DbResponseObject dro = new DbResponseObject(); 				
		
		getDatabaseObject(co).deleteRecord(tableName, rowId, dro);
		
		return dro;
	}
	
	
	
	// .../table/delete_row_without_id
	// delete a record from a table, 
	// given some column names and values to match
	@Path("delete_row_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject deleteRecordWithoutId(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("value") String value,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "### Delete record(s) (without ids) from "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		String[] values = value.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		DbResponseObject dro = new DbResponseObject(); 
				
		getDatabaseObject(co).deleteRecordWithoutId(tableName, columnNames, values, dro);
		
		return dro;
	}
	
	

	// .../table/gettables
	@Path("gettables")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TablesListObject getTables(
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		Util.debug(co, "We are running Java version " +
				System.getProperty("java.version") +
				" from "+
				System.getProperty("java.vendor"));
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		TablesListObject listOfTables = new TablesListObject();
		
		
		listOfTables.setTablesAndDescriptions(getDatabaseObject(co).getTableList());
		
	return listOfTables;
	}
	
	
	// .../table/get_neutral_separator
	// get all the unique values a column may contain (needed for select boxes)
	@Path("get_neutral_separator")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getNeutralSeparator()
	  {
		DbResponseObject dro = new DbResponseObject(); 
		dro.setResponse( Constants.ARG_INTERNAL_SEPARATOR );
		return dro;
	  }
	
	
	// .../table/gettable
	@Path("gettable")
	@Produces({MediaType.APPLICATION_JSON})
	public TableDataInspector getTable(
			@DefaultValue("") @FormParam("sDbName") String dbName,
			@DefaultValue("") @FormParam("sTableName") String tableName,
			
			@DefaultValue("") @FormParam("sAllColumns") String allColumns,
			@DefaultValue("0") @FormParam("order[0][column]") int iSortCol_0,
			@DefaultValue("asc") @FormParam("order[0][dir]") String sSortDir_0,
			@DefaultValue("-1") @FormParam("order[1][column]") int iSortCol_1,
			@DefaultValue("none") @FormParam("order[1][dir]") String sSortDir_1,
			@DefaultValue("-1") @FormParam("order[2][column]") int iSortCol_2,
			@DefaultValue("none") @FormParam("order[2][dir]") String sSortDir_2,
			@DefaultValue("-1") @FormParam("order[3][column]") int iSortCol_3,
			@DefaultValue("none") @FormParam("order[3][dir]") String sSortDir_3,
			@DefaultValue("-1") @FormParam("order[4][column]") int iSortCol_4,
			@DefaultValue("none") @FormParam("order[4][dir]") String sSortDir_4,
			
			@DefaultValue("10") @FormParam("length") int iDisplayLength,
			@DefaultValue("0") @FormParam("start") int iDisplayStart,	
			
			@DefaultValue("") @FormParam("columns[0][data]") String column0,
			@DefaultValue("") @FormParam("columns[1][data]") String column1,
			@DefaultValue("") @FormParam("columns[2][data]") String column2,
			@DefaultValue("") @FormParam("columns[3][data]") String column3,
			@DefaultValue("") @FormParam("columns[4][data]") String column4,
			@DefaultValue("") @FormParam("columns[5][data]") String column5,
			@DefaultValue("") @FormParam("columns[6][data]") String column6,
			@DefaultValue("") @FormParam("columns[7][data]") String column7,
			@DefaultValue("") @FormParam("columns[8][data]") String column8,
			@DefaultValue("") @FormParam("columns[9][data]") String column9,
			@DefaultValue("") @FormParam("columns[10][data]") String column10,
			@DefaultValue("") @FormParam("columns[11][data]") String column11,
			@DefaultValue("") @FormParam("columns[12][data]") String column12,
			@DefaultValue("") @FormParam("columns[13][data]") String column13,
			@DefaultValue("") @FormParam("columns[14][data]") String column14,
			@DefaultValue("") @FormParam("columns[15][data]") String column15,
			@DefaultValue("") @FormParam("columns[16][data]") String column16,
			@DefaultValue("") @FormParam("columns[17][data]") String column17,
			@DefaultValue("") @FormParam("columns[18][data]") String column18,
			@DefaultValue("") @FormParam("columns[19][data]") String column19,
			@DefaultValue("") @FormParam("columns[20][data]") String column20,
			@DefaultValue("") @FormParam("columns[21][data]") String column21,
			@DefaultValue("") @FormParam("columns[22][data]") String column22,
			@DefaultValue("") @FormParam("columns[23][data]") String column23,
			@DefaultValue("") @FormParam("columns[24][data]") String column24,
			@DefaultValue("") @FormParam("columns[25][data]") String column25,
			@DefaultValue("") @FormParam("columns[26][data]") String column26,
			@DefaultValue("") @FormParam("columns[27][data]") String column27,
			@DefaultValue("") @FormParam("columns[28][data]") String column28,
			@DefaultValue("") @FormParam("columns[29][data]") String column29,
			@DefaultValue("") @FormParam("columns[30][data]") String column30,
			@DefaultValue("") @FormParam("columns[31][data]") String column31,
			@DefaultValue("") @FormParam("columns[32][data]") String column32,
			@DefaultValue("") @FormParam("columns[33][data]") String column33,
			@DefaultValue("") @FormParam("columns[34][data]") String column34,
			@DefaultValue("") @FormParam("columns[35][data]") String column35,
			@DefaultValue("") @FormParam("columns[36][data]") String column36,
			@DefaultValue("") @FormParam("columns[37][data]") String column37,
			@DefaultValue("") @FormParam("columns[38][data]") String column38,
			@DefaultValue("") @FormParam("columns[39][data]") String column39,
			@DefaultValue("") @FormParam("columns[40][data]") String column40,
			@DefaultValue("") @FormParam("columns[41][data]") String column41,
			@DefaultValue("") @FormParam("columns[42][data]") String column42,
			@DefaultValue("") @FormParam("columns[43][data]") String column43,
			@DefaultValue("") @FormParam("columns[44][data]") String column44,
			@DefaultValue("") @FormParam("columns[45][data]") String column45,
			@DefaultValue("") @FormParam("columns[46][data]") String column46,
			@DefaultValue("") @FormParam("columns[47][data]") String column47,
			@DefaultValue("") @FormParam("columns[48][data]") String column48,
			@DefaultValue("") @FormParam("columns[49][data]") String column49,
			@DefaultValue("") @FormParam("columns[50][data]") String column50,
			@DefaultValue("") @FormParam("columns[51][data]") String column51,
			@DefaultValue("") @FormParam("columns[52][data]") String column52,
			@DefaultValue("") @FormParam("columns[53][data]") String column53,
			@DefaultValue("") @FormParam("columns[54][data]") String column54,
			@DefaultValue("") @FormParam("columns[55][data]") String column55,
			@DefaultValue("") @FormParam("columns[56][data]") String column56,
			@DefaultValue("") @FormParam("columns[57][data]") String column57,
			@DefaultValue("") @FormParam("columns[58][data]") String column58,
			@DefaultValue("") @FormParam("columns[59][data]") String column59,
			@DefaultValue("") @FormParam("columns[60][data]") String column60,
			@DefaultValue("") @FormParam("columns[61][data]") String column61,
			@DefaultValue("") @FormParam("columns[62][data]") String column62,
			@DefaultValue("") @FormParam("columns[63][data]") String column63,
			@DefaultValue("") @FormParam("columns[64][data]") String column64,
			@DefaultValue("") @FormParam("columns[65][data]") String column65,
			@DefaultValue("") @FormParam("columns[66][data]") String column66,
			@DefaultValue("") @FormParam("columns[67][data]") String column67,
			@DefaultValue("") @FormParam("columns[68][data]") String column68,
			@DefaultValue("") @FormParam("columns[69][data]") String column69,
			@DefaultValue("") @FormParam("columns[70][data]") String column70,
			@DefaultValue("") @FormParam("columns[71][data]") String column71,
			@DefaultValue("") @FormParam("columns[72][data]") String column72,
			@DefaultValue("") @FormParam("columns[73][data]") String column73,
			@DefaultValue("") @FormParam("columns[74][data]") String column74,
			@DefaultValue("") @FormParam("columns[75][data]") String column75,
			@DefaultValue("") @FormParam("columns[76][data]") String column76,
			@DefaultValue("") @FormParam("columns[77][data]") String column77,
			@DefaultValue("") @FormParam("columns[78][data]") String column78,
			@DefaultValue("") @FormParam("columns[79][data]") String column79,			
			@DefaultValue("") @FormParam("columns[80][data]") String column80,
			@DefaultValue("") @FormParam("columns[81][data]") String column81,
			@DefaultValue("") @FormParam("columns[82][data]") String column82,
			@DefaultValue("") @FormParam("columns[83][data]") String column83,
			@DefaultValue("") @FormParam("columns[84][data]") String column84,
			@DefaultValue("") @FormParam("columns[85][data]") String column85,
			@DefaultValue("") @FormParam("columns[86][data]") String column86,
			@DefaultValue("") @FormParam("columns[87][data]") String column87,
			@DefaultValue("") @FormParam("columns[88][data]") String column88,
			@DefaultValue("") @FormParam("columns[89][data]") String column89,
			@DefaultValue("") @FormParam("columns[90][data]") String column90,
			@DefaultValue("") @FormParam("columns[91][data]") String column91,
			@DefaultValue("") @FormParam("columns[92][data]") String column92,
			@DefaultValue("") @FormParam("columns[93][data]") String column93,
			@DefaultValue("") @FormParam("columns[94][data]") String column94,
			@DefaultValue("") @FormParam("columns[95][data]") String column95,
			@DefaultValue("") @FormParam("columns[96][data]") String column96,
			@DefaultValue("") @FormParam("columns[97][data]") String column97,
			@DefaultValue("") @FormParam("columns[98][data]") String column98,
			@DefaultValue("") @FormParam("columns[99][data]") String column99,
			@DefaultValue("") @FormParam("columns[100][data]") String column100,
			@DefaultValue("") @FormParam("columns[101][data]") String column101,
			@DefaultValue("") @FormParam("columns[102][data]") String column102,
			@DefaultValue("") @FormParam("columns[103][data]") String column103,
			@DefaultValue("") @FormParam("columns[104][data]") String column104,
			@DefaultValue("") @FormParam("columns[105][data]") String column105,
			@DefaultValue("") @FormParam("columns[106][data]") String column106,
			@DefaultValue("") @FormParam("columns[107][data]") String column107,
			@DefaultValue("") @FormParam("columns[108][data]") String column108,
			@DefaultValue("") @FormParam("columns[109][data]") String column109,
			
			@DefaultValue("") @FormParam("search[value]") String sSearch,
			
			@DefaultValue("") @FormParam("columns[0][search][value]") String sSearch0,
			@DefaultValue("") @FormParam("columns[1][search][value]") String sSearch1,
			@DefaultValue("") @FormParam("columns[2][search][value]") String sSearch2,
			@DefaultValue("") @FormParam("columns[3][search][value]") String sSearch3,
			@DefaultValue("") @FormParam("columns[4][search][value]") String sSearch4,
			@DefaultValue("") @FormParam("columns[5][search][value]") String sSearch5,
			@DefaultValue("") @FormParam("columns[6][search][value]") String sSearch6,
			@DefaultValue("") @FormParam("columns[7][search][value]") String sSearch7,
			@DefaultValue("") @FormParam("columns[8][search][value]") String sSearch8,
			@DefaultValue("") @FormParam("columns[9][search][value]") String sSearch9,
			@DefaultValue("") @FormParam("columns[10][search][value]") String sSearch10,
			@DefaultValue("") @FormParam("columns[11][search][value]") String sSearch11,
			@DefaultValue("") @FormParam("columns[12][search][value]") String sSearch12,
			@DefaultValue("") @FormParam("columns[13][search][value]") String sSearch13,
			@DefaultValue("") @FormParam("columns[14][search][value]") String sSearch14,
			@DefaultValue("") @FormParam("columns[15][search][value]") String sSearch15,
			@DefaultValue("") @FormParam("columns[16][search][value]") String sSearch16,
			@DefaultValue("") @FormParam("columns[17][search][value]") String sSearch17,
			@DefaultValue("") @FormParam("columns[18][search][value]") String sSearch18,
			@DefaultValue("") @FormParam("columns[19][search][value]") String sSearch19,
			@DefaultValue("") @FormParam("columns[20][search][value]") String sSearch20,
			@DefaultValue("") @FormParam("columns[21][search][value]") String sSearch21,
			@DefaultValue("") @FormParam("columns[22][search][value]") String sSearch22,
			@DefaultValue("") @FormParam("columns[23][search][value]") String sSearch23,
			@DefaultValue("") @FormParam("columns[24][search][value]") String sSearch24,
			@DefaultValue("") @FormParam("columns[25][search][value]") String sSearch25,
			@DefaultValue("") @FormParam("columns[26][search][value]") String sSearch26,
			@DefaultValue("") @FormParam("columns[27][search][value]") String sSearch27,
			@DefaultValue("") @FormParam("columns[28][search][value]") String sSearch28,
			@DefaultValue("") @FormParam("columns[29][search][value]") String sSearch29,
			@DefaultValue("") @FormParam("columns[30][search][value]") String sSearch30,
			@DefaultValue("") @FormParam("columns[31][search][value]") String sSearch31,
			@DefaultValue("") @FormParam("columns[32][search][value]") String sSearch32,
			@DefaultValue("") @FormParam("columns[33][search][value]") String sSearch33,
			@DefaultValue("") @FormParam("columns[34][search][value]") String sSearch34,
			@DefaultValue("") @FormParam("columns[35][search][value]") String sSearch35,
			@DefaultValue("") @FormParam("columns[36][search][value]") String sSearch36,
			@DefaultValue("") @FormParam("columns[37][search][value]") String sSearch37,
			@DefaultValue("") @FormParam("columns[38][search][value]") String sSearch38,
			@DefaultValue("") @FormParam("columns[39][search][value]") String sSearch39,
			@DefaultValue("") @FormParam("columns[40][search][value]") String sSearch40,
			@DefaultValue("") @FormParam("columns[41][search][value]") String sSearch41,
			@DefaultValue("") @FormParam("columns[42][search][value]") String sSearch42,
			@DefaultValue("") @FormParam("columns[43][search][value]") String sSearch43,
			@DefaultValue("") @FormParam("columns[44][search][value]") String sSearch44,
			@DefaultValue("") @FormParam("columns[45][search][value]") String sSearch45,
			@DefaultValue("") @FormParam("columns[46][search][value]") String sSearch46,
			@DefaultValue("") @FormParam("columns[47][search][value]") String sSearch47,
			@DefaultValue("") @FormParam("columns[48][search][value]") String sSearch48,
			@DefaultValue("") @FormParam("columns[49][search][value]") String sSearch49,
			@DefaultValue("") @FormParam("columns[50][search][value]") String sSearch50,
			@DefaultValue("") @FormParam("columns[51][search][value]") String sSearch51,
			@DefaultValue("") @FormParam("columns[52][search][value]") String sSearch52,
			@DefaultValue("") @FormParam("columns[53][search][value]") String sSearch53,
			@DefaultValue("") @FormParam("columns[54][search][value]") String sSearch54,
			@DefaultValue("") @FormParam("columns[55][search][value]") String sSearch55,
			@DefaultValue("") @FormParam("columns[56][search][value]") String sSearch56,
			@DefaultValue("") @FormParam("columns[57][search][value]") String sSearch57,
			@DefaultValue("") @FormParam("columns[58][search][value]") String sSearch58,
			@DefaultValue("") @FormParam("columns[59][search][value]") String sSearch59,
			@DefaultValue("") @FormParam("columns[60][search][value]") String sSearch60,
			@DefaultValue("") @FormParam("columns[61][search][value]") String sSearch61,
			@DefaultValue("") @FormParam("columns[62][search][value]") String sSearch62,
			@DefaultValue("") @FormParam("columns[63][search][value]") String sSearch63,
			@DefaultValue("") @FormParam("columns[64][search][value]") String sSearch64,
			@DefaultValue("") @FormParam("columns[65][search][value]") String sSearch65,
			@DefaultValue("") @FormParam("columns[66][search][value]") String sSearch66,
			@DefaultValue("") @FormParam("columns[67][search][value]") String sSearch67,
			@DefaultValue("") @FormParam("columns[68][search][value]") String sSearch68,
			@DefaultValue("") @FormParam("columns[69][search][value]") String sSearch69,
			@DefaultValue("") @FormParam("columns[70][search][value]") String sSearch70,
			@DefaultValue("") @FormParam("columns[71][search][value]") String sSearch71,
			@DefaultValue("") @FormParam("columns[72][search][value]") String sSearch72,
			@DefaultValue("") @FormParam("columns[73][search][value]") String sSearch73,
			@DefaultValue("") @FormParam("columns[74][search][value]") String sSearch74,
			@DefaultValue("") @FormParam("columns[75][search][value]") String sSearch75,
			@DefaultValue("") @FormParam("columns[76][search][value]") String sSearch76,
			@DefaultValue("") @FormParam("columns[77][search][value]") String sSearch77,
			@DefaultValue("") @FormParam("columns[78][search][value]") String sSearch78,
			@DefaultValue("") @FormParam("columns[79][search][value]") String sSearch79,			
			@DefaultValue("") @FormParam("columns[80][search][value]") String sSearch80,
			@DefaultValue("") @FormParam("columns[81][search][value]") String sSearch81,
			@DefaultValue("") @FormParam("columns[82][search][value]") String sSearch82,
			@DefaultValue("") @FormParam("columns[83][search][value]") String sSearch83,
			@DefaultValue("") @FormParam("columns[84][search][value]") String sSearch84,
			@DefaultValue("") @FormParam("columns[85][search][value]") String sSearch85,
			@DefaultValue("") @FormParam("columns[86][search][value]") String sSearch86,
			@DefaultValue("") @FormParam("columns[87][search][value]") String sSearch87,
			@DefaultValue("") @FormParam("columns[88][search][value]") String sSearch88,
			@DefaultValue("") @FormParam("columns[89][search][value]") String sSearch89,
			@DefaultValue("") @FormParam("columns[90][search][value]") String sSearch90,
			@DefaultValue("") @FormParam("columns[91][search][value]") String sSearch91,
			@DefaultValue("") @FormParam("columns[92][search][value]") String sSearch92,
			@DefaultValue("") @FormParam("columns[93][search][value]") String sSearch93,
			@DefaultValue("") @FormParam("columns[94][search][value]") String sSearch94,
			@DefaultValue("") @FormParam("columns[95][search][value]") String sSearch95,
			@DefaultValue("") @FormParam("columns[96][search][value]") String sSearch96,
			@DefaultValue("") @FormParam("columns[97][search][value]") String sSearch97,
			@DefaultValue("") @FormParam("columns[98][search][value]") String sSearch98,
			@DefaultValue("") @FormParam("columns[99][search][value]") String sSearch99,
			@DefaultValue("") @FormParam("columns[100][search][value]") String sSearch100,
			@DefaultValue("") @FormParam("columns[101][search][value]") String sSearch101,
			@DefaultValue("") @FormParam("columns[102][search][value]") String sSearch102,
			@DefaultValue("") @FormParam("columns[103][search][value]") String sSearch103,
			@DefaultValue("") @FormParam("columns[104][search][value]") String sSearch104,
			@DefaultValue("") @FormParam("columns[105][search][value]") String sSearch105,
			@DefaultValue("") @FormParam("columns[106][search][value]") String sSearch106,
			@DefaultValue("") @FormParam("columns[107][search][value]") String sSearch107,
			@DefaultValue("") @FormParam("columns[108][search][value]") String sSearch108,
			@DefaultValue("") @FormParam("columns[109][search][value]") String sSearch109,
			
			@DefaultValue("") @FormParam("bForceExactCount") String sForceExactCount,
			
			@FormParam("draw") int iEcho,	
			
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			
			) throws IOException {
		
				
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName);
		
		// is exact count required by the user for this call?
		getDatabaseObject(co).setForceExactCount( sForceExactCount.equalsIgnoreCase("true") );				
		
		
		Util.debug(co, "### Get table "+tableName);
		
		if ( !userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		String[] columnsArr = new String[]{
				column0, 
				column1, column2, column3,
				column4, column5, column6,
				column7, column8, column9,
				column10, 
				column11, column12, column13,
				column14, column15, column16,
				column17, column18, column19,
				column20, 
				column21, column22, column23,
				column24, column25, column26,
				column27, column28, column29,
				column30, 
				column31, column32, column33,
				column34, column35, column36,
				column37, column38, column39,
				column40, 
				column41, column42, column43,
				column44, column45, column46,
				column47, column48, column49,
				column50, 
				column51, column52, column53,
				column54, column55, column56,
				column57, column58, column59,
				column60, 
				column61, column62, column63,
				column64, column65, column66,
				column67, column68, column69,
				column70, 
				column71, column72, column73,
				column74, column75, column76,
				column77, column78, column79,
				column80, 
				column81, column82, column83,
				column84, column85, column86,
				column87, column88, column89,
				column90, 
				column91, column92, column93,
				column94, column95, column96,
				column97, column98, column99,
				column100, 
				column101, column102, column103,
				column104, column105, column106,
				column107, column108, column109};
		
		String[] columnSearchArr = new String[]{
				sSearch0, 
				sSearch1, sSearch2, sSearch3,
				sSearch4, sSearch5, sSearch6,
				sSearch7, sSearch8, sSearch9,
				sSearch10, 
				sSearch11, sSearch12, sSearch13,
				sSearch14, sSearch15, sSearch16,
				sSearch17, sSearch18, sSearch19,
				sSearch20, 
				sSearch21, sSearch22, sSearch23,
				sSearch24, sSearch25, sSearch26,
				sSearch27, sSearch28, sSearch29,
				sSearch30, 
				sSearch31, sSearch32, sSearch33,
				sSearch34, sSearch35, sSearch36,
				sSearch37, sSearch38, sSearch39,
				sSearch40, 
				sSearch41, sSearch42, sSearch43,
				sSearch44, sSearch45, sSearch46,
				sSearch47, sSearch48, sSearch49,
				sSearch50, 
				sSearch51, sSearch52, sSearch53,
				sSearch54, sSearch55, sSearch56,
				sSearch57, sSearch58, sSearch59,
				sSearch60, 
				sSearch61, sSearch62, sSearch63,
				sSearch64, sSearch65, sSearch66,
				sSearch67, sSearch68, sSearch69,
				sSearch70, 
				sSearch71, sSearch72, sSearch73,
				sSearch74, sSearch75, sSearch76,
				sSearch77, sSearch78, sSearch79,
				sSearch80, 
				sSearch81, sSearch82, sSearch83,
				sSearch84, sSearch85, sSearch86,
				sSearch87, sSearch88, sSearch89,
				sSearch90, 
				sSearch91, sSearch92, sSearch93,
				sSearch94, sSearch95, sSearch96,
				sSearch97, sSearch98, sSearch99,
				sSearch100, 
				sSearch101, sSearch102, sSearch103,
				sSearch104, sSearch105, sSearch106,
				sSearch107, sSearch108, sSearch109};
		
		ArrayList<String> newColumnsArr = new ArrayList<String>();
		ArrayList<String> newColumnSearchArr = new ArrayList<String>();
		ArrayList<Boolean> newCaseSensitiveColumnSearchArr = new ArrayList<Boolean>();
		
		// gather search data for all columns
		for (int i=0; i<columnSearchArr.length; i++)
		{
			String oneSearchColumn = columnSearchArr[i].trim();
			if ( !oneSearchColumn.isEmpty())
			{				
				newColumnsArr.add( columnsArr[i] );  
				newCaseSensitiveColumnSearchArr.add( setRightCaseSensitivity(oneSearchColumn) );
				newColumnSearchArr.add(  setRightSearchValue(oneSearchColumn)  );
			}
		}
		
		
		
		// get the count of all records in the table (fast)
		Map<String, Object> countAndCountQualityOfTable = getCountOfTable(co, tableName);
		int countOfTable = (Integer) countAndCountQualityOfTable.get("count");
		boolean countQualityOfTable = (Boolean) countAndCountQualityOfTable.get("exactCount");

		
		// sorting
		ArrayList<String> tmpSortCol = new ArrayList<String>();
		ArrayList<String> tmpSortDir = new ArrayList<String>();
		tmpSortCol.add( columnsArr[iSortCol_0] );
		tmpSortDir.add(sSortDir_0);
		if (iSortCol_1 >-1 && sSortDir_1.toLowerCase().matches("asc|desc"))
		{
			tmpSortCol.add( columnsArr[iSortCol_1] );
			tmpSortDir.add(sSortDir_1);
		}
		if (iSortCol_2 >-1 && sSortDir_2.toLowerCase().matches("asc|desc"))
		{
			tmpSortCol.add( columnsArr[iSortCol_2] );
			tmpSortDir.add(sSortDir_2);
		}
		if (iSortCol_3 >-1 && sSortDir_3.toLowerCase().matches("asc|desc"))
		{
			tmpSortCol.add( columnsArr[iSortCol_3] );
			tmpSortDir.add(sSortDir_3);
		}
		if (iSortCol_4 >-1 && sSortDir_4.toLowerCase().matches("asc|desc"))
		{
			tmpSortCol.add( columnsArr[iSortCol_4] );
			tmpSortDir.add(sSortDir_4);
		}
		// convert to arrays
		String[] aSortCol = tmpSortCol.toArray(new String[tmpSortCol.size()]);
		String[] aSortDir = tmpSortDir.toArray(new String[tmpSortDir.size()]);
		
		// return the table		
		return new TableDataInspector(getDatabaseObject(co),
				tableName, countOfTable, countQualityOfTable,
				allColumns.split(Constants.ARG_INTERNAL_SEPARATOR, -1),
				iDisplayLength, iDisplayStart, setRightSearchValue(sSearch), 
				newColumnsArr, newColumnSearchArr, newCaseSensitiveColumnSearchArr,
				true, aSortCol, aSortDir, iEcho
				);
		
	}
	
	// normally does nothing, but
	// special cases: 
	// - NULL in a string should be interpreted as null
	// - "..." should behave like in google
	// - "" should be interpreted as an empty string
	private static String setRightSearchValue(String value){
		
		if (value.equals("NULL")) 
		{
			return null;
		}
		
		// if we have an operator in front, split the search string into operator string and searched value
		// (like  '!word' ->  '!' and 'word')
		String cleanValue = Database.removeFrontOperator(value);
		String operator   = value.substring(0, value.length()-cleanValue.length());
		
		if ( (cleanValue.startsWith("\"") && cleanValue.endsWith("\"")) || 
			 (cleanValue.startsWith("'") && cleanValue.endsWith("'")) )
		{
			cleanValue = cleanValue.substring(1, cleanValue.length()-1);
			if (cleanValue.isEmpty()) cleanValue = "^$";
			
			// rebuild the original search string with operator (if available; operator may be empty)
			value = operator + cleanValue;
			return value;
		}
		
		// default
		return value;
	}
	
	// normally does nothing, but
	// special cases:
	// - "..." is case sensitive
	// - in all other cases, case insensitive!
	private static boolean setRightCaseSensitivity(String value){
		
		// remove operator in front, if it's there
		// (like  '!word' -> 'word')
		String cleanValue = Database.removeFrontOperator(value);
		
		// quotes?
		if ( (cleanValue.startsWith("\"") && cleanValue.endsWith("\"")) || 
			 (cleanValue.startsWith("'") && cleanValue.endsWith("'")) )
		{
			return true;
		}
		return false;
	}
	
	
	// Query and register the count of a table, or get it from cache when available
	private Map<String, Object> getCountOfTable(ContextObject co, String tableName) throws IOException{
		
		Util.debug(co, "### Get total count of "+tableName);
		
		return getDatabaseObject(co).getQuickCountOfAllTableRecords(tableName);
	}
	
	
	// return the database access object for a given database name
	private synchronized Database getDatabaseObject(ContextObject co){
		
		Database newDbObj;
				
		// first do some cleanup
		
		// get a list of 'old' ContextObjects
		
		ArrayList<String> keysToDelete = new ArrayList<String>();
		for (String key : nameToDatabaseObject.keySet())
		{
			Database tmpDbObj = nameToDatabaseObject.get(key);
			if ( tmpDbObj.getContextObject().isLeftUnused() )
				keysToDelete.add(key);
		}
		
		// remove the 'old' ContextObjects
		
		for (String key : keysToDelete)
		{
			nameToDatabaseObject.remove(key);
			Util.debug("Removed old Database object: "+key);
		}
		
		
		// now get (or create) the database object needed
		
		// key to right database object, given current user, project and session (safe!) 
		String cachingKey = co.getUniqueIdentifier();
		
		if ( !nameToDatabaseObject.containsKey(cachingKey) )
			{			
			Util.debug(co, "## >>> BOUW NIEUW DATABASE OBJECT " + cachingKey);
			newDbObj = new Database(co);
			nameToDatabaseObject.put(cachingKey, newDbObj);			
			}
		
		Util.debug(co, "## >>> PAK DATABASE OBJECT "+cachingKey);
		newDbObj = nameToDatabaseObject.get(cachingKey);
		newDbObj.updateContextObject(co);
		return newDbObj;
	};
	
	
	// .../table/get_users
	@Path("get_users")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UsersListObject getListOfActiveUsers(){
		
		UsersListObject ulo = new UsersListObject();
		
		for (String key : nameToDatabaseObject.keySet())
		{
			Database currentDbObj = nameToDatabaseObject.get(key);
			
			ContextObject co = currentDbObj.getContextObject();
		
			String dbName = co.getDbNameForSpy();
			String userName = co.getUsername();
			Date date=new Date(co.getTimeLastUsed());
			String sessionId = co.getSessionIdForSpy();
			SimpleDateFormat df2 = new SimpleDateFormat("yyyy.MM.dd 'om' HH:mm:ss");
			String lastActive = df2.format(date);
			String activeRecently = (co.isLeftUnused() ? "Slaapstand" : "Nu actief");
			
			ulo.addUserData(new String[]{dbName, userName, sessionId, lastActive, activeRecently});
		}
		return ulo;
	}
	
	/**
	 * Check the user's rights
	 * - 'superuser' can read, write, delete in any database
	 * - 'superreader' can read in any database
	 * - '<dbName>_all' can read, write, delete in database <dbName>
	 * - '<dbName>_write' can read, write in database <dbName>
	 * - '<dbName>_read' can only read in database <dbName>
	 */
	private boolean userIsAllowedTo(ContextObject co, String action){
		
		// get the dbname (we need it to match the tomcat user role)		
		String dbName = co.getDbName();
		
		if (action.equals(Constants.USER_READ_ACCESS))
		{
			return 
			userHasRole(co, "superuser") || 
			userHasRole(co, "superreader") || 
			userHasRole(co, dbName+"_all") || 
			userHasRole(co, dbName+"_write") || 
			userHasRole(co, dbName+"_read");
		}
		else if (action.equals(Constants.USER_WRITE_ACCESS))
		{
			return 
			userHasRole(co, "superuser") || 
			userHasRole(co, dbName+"_all") || 
			userHasRole(co, dbName+"_write");
		}
		else if (action.equals(Constants.USER_ALL_ACCESS))
		{
			return 
			userHasRole(co, "superuser") || 
			userHasRole(co, dbName+"_all");
		}	
		
		return false;
	}
	
	// check if a given role is part of an array of roles
	// (subroutine of userIsAllowedTo function)
	private boolean userHasRole(ContextObject co, String role){

		String[] roles;
		
		try {
			roles = getUserRoles(co);
			return Arrays.asList(roles).contains(role);
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		return false;
	}
	
	
	// read the javascript configuration file from
	//  the configuration directory
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
			throw new RuntimeException("Error while reading the "+filepath+" file", e);
		}
		
		return sb.toString();
	}
	
	
	// read the users access rights file
	public String[] getUserRoles(ContextObject co) throws IOException{
		
		// if the access rights file has already been read,
		// return relevant content right away
		
		if (users2roles.containsKey(co.getUsername()))
		{
			Util.debug(co, "Get user access rights from cache");
			return users2roles.get(co.getUsername());
		}			
		
		
		// if the access rights file hasn't been read yet
		// read it now  (only one thread at the time)		
		
		synchronized (TableResources.class){
			
			Util.debug(co, "Read user access rights...");
			
			String fileName = "users_access.rights";		
			String filepath = co.getContext().getRealPath(fileName);
			
			filepath = filepath.replace(
					File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
					File.separatorChar + Constants.CONFIG_DIR + File.separator+fileName);
			
			Util.debug(co, "File: "+filepath);
			
			try{
				FileInputStream fstream = new FileInputStream(filepath);
				// Get the object of DataInputStream
				DataInputStream in = new DataInputStream(fstream);
				BufferedReader br = new BufferedReader(new InputStreamReader(in));
				String strLine;
				while ((strLine = br.readLine()) != null) {
					if (	strLine.indexOf("=")<0  // skip illegal format (we expect key=prop) 
							|| 
							strLine.startsWith("#"))// skip comment lines
						continue;
					String key = strLine.split("=")[0];
					String value = strLine.split("=")[1];
					users2roles.put(key, value.split(","));
				}
				br.close();
				in.close();
				
				return users2roles.get(co.getUsername());
			}
			catch (Exception e){
				throw new RuntimeException("Error while reading users access rights file: "+filepath, e);
			}
		}		
		
	}

	
}
