package lexit.resources;

import java.awt.List;
import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import javax.ws.rs.core.UriInfo;

import lexit.table.TableRecordObject;
import lexit.table.TablesListObject;
import lexit.table.UniqueValuesObject;
import lexit.util.Database;


import com.sun.jersey.spi.container.servlet.PerSession;

/**
 * The TableResources class is the main class in a Jersey project
 * Here the different kinds of requests can be mapped to functions and classes
 * 
 * @author Mathieu Fannee (INL)
 *
 */

// PerSession will extend the life-cycle of the webservice to a session (instead of a request)
// This requires implementation of Serializable
// see: https://jersey.java.net/apidocs/1.18/jersey/com/sun/jersey/spi/container/servlet/PerSession.html
// and  http://stackoverflow.com/questions/2294551/java-io-writeabortedexception-writing-aborted-java-io-notserializableexception
@PerSession

//Will map the resource to the tables URL 
@Path("/table")
public class TableResources extends Application implements Serializable  {
	
		
	
	// Allows to insert contextual objects into the class, 
	// e.g. ServletContext, Request, Response, UriInfo
	@Context
	UriInfo uriInfo;
	@Context
	Request request;
	@Context 
	ServletContext context;
	
	// database access objects, needed for caching (for speed)
	HashMap<String, Database> nameToDatabaseObject = new HashMap<String, Database>();
	
	// users access rights
	HashMap<String, String[]> users2roles = new HashMap<String, String[]>();
	
	// sort setting
	boolean weMustSort = true;
	String sortingTable = "", sortingDirection = "", sortingColumn = "";
	
	
	// get the javascript configuration file from the configuration directory
	// call:
	// .../lexit/lexit/table/get_configfile
	@Path("get_configfile")
	@GET
	@Produces({MediaType.TEXT_PLAIN})
	public Response getJsConfigFile(@QueryParam("db_name") String dbName){
		
		if (Constants.debug) System.out.println("Loading config file...");
		
		String fileToSend = null;
		try {
			fileToSend = readJsConfigFile(dbName);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return Response.ok(fileToSend, MediaType.TEXT_PLAIN).build();
	}
	
	
	
	// get the name of the user which had logged in
	// call:
	// .../lexit/lexit/table/get_username
	@Path("get_username")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject showResource(@Context SecurityContext sc) throws IOException {
		
		DbResponseObject response = new DbResponseObject();
		response.setResponse(sc.getUserPrincipal().getName());
		
		return response;
	}
	
	
	// clean the cache of some table
	// call:
	// .../lexit/lexit/table/cleancache?table=....
	@Path("cleancache")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject cleanCache( 
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("db_name") String dbName
			) throws IOException {
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Clean cache of "+tableName);
		
		DbResponseObject dro = new DbResponseObject();
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		getDatabaseObject(dbName).cleanCache(dbName, tableName);
	
		dro.setResponse("OK");
		
		return dro;
	}
	


	// get the list of columns of a table and their type 
	// and their allowed values (in case of Postgres user-defined type)
	// call:
	// .../lexit/lexit/table/getcolumns?table=....
	@Path("getcolumns")
	public TableMetadataInspector showResource( 
			@Context SecurityContext sc,
			@DefaultValue("lemmata") @QueryParam("table") String tableName,
			@QueryParam("db_name") String dbName
			) throws IOException {
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Get Columns from "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
	return new TableMetadataInspector(getDatabaseObject(dbName), getDbName(dbName), tableName);
	}
	
	
	// .../lexit/lexit/table/get_unique_values
	// get all the unique values a column may contain (needed for select boxes)
	@Path("get_unique_values")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UniqueValuesObject getUniqueValues(
			  @Context SecurityContext sc,
			  @QueryParam("db_name") String dbName, 
			  @QueryParam("table_name") String tableName, 
			  @QueryParam("column_name") String columnName)
	  {
	    tableName = tableName.replaceAll("__", ".");
	    if (Constants.debug) System.out.println("### Get unique values for column " + columnName + " in " + tableName);
	    
	    String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);

	    return getDatabaseObject(dbName).getUniqueValues(dbName, tableName, columnName);
	  }
	
	
	// .../lexit/lexit/table/get_row_number
	// get the row number corresponding to a given record (given some value to match in some column)
	@Path("get_row_number")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getRowNumber(
			@Context SecurityContext sc,
			@QueryParam("db_name") String dbName,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("column_value") String columnValue,
			@QueryParam("sort_column") String sortColumn,
			@QueryParam("sort_direction") String sortDirection,
			@QueryParam("filter_column_names") String filterColumns,
			@QueryParam("filter_values") String filterValues
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Get row number for "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject();
		
		String[] filterColumnsArr = filterColumns.trim().isEmpty() ? 
				null : filterColumns.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] filterColumnValuesArr = filterValues.trim().isEmpty() ?
				null : filterValues.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		String rowNumber = Integer.toString(getDatabaseObject(dbName).getRowNumberOfRecord(dbName, tableName, columnName, columnValue, 
						sortColumn, sortDirection, 
						filterColumnsArr, filterColumnValuesArr
						));
		dro.setResponse(rowNumber);
		
		return dro;
	}
	
	// .../lexit/lexit/table/setvalue
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValue(
			@Context SecurityContext sc,
			@QueryParam("row_id") String rowId,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("new_value") String newValue,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### SetValue for "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
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
				getDatabaseObject(dbName).updateOneColumn(getDbName(dbName), tableName, rowIds[i], columnName, newValues[i], dro);			
			}			
		}
		
		// II.	- one single row id
		// 		- more column names, and corresponding new values for these columns in that row
		else if (columnNames.length>1 && rowIds.length == 1)
		{
			getDatabaseObject(dbName).updateWholeRecord(getDbName(dbName), tableName, rowId, columnNames, newValues, dro);
		}
				
		
		return dro;
	}
	
	
	
	// .../lexit/lexit/table/setcomment
	// set the comment of a table or view
	@Path("setcomment")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setComment(
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("new_comment") String newComment,
			@QueryParam("table_type") String tableType,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Set comment for "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		
		getDatabaseObject(dbName).updateComment(getDbName(dbName), tableName, tableType, newComment, dro);
				
		
		return dro;
	}
	
	
	// .../lexit/lexit/table/get_comment
	// get the comment of a table or view
	@Path("get_comment")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getComment(
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("table_type") String tableType,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Get comment on "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		
		// put id of record in response object
		String comment = getDatabaseObject(dbName).getComment(dbName, tableName, tableType);
		dro.setResponse(comment);
		
		return dro;
	}
	
	
	
	// .../lexit/lexit/table/get_id_of_record
	// get the id of a row, given some values to match in records
	@Path("get_id_of_record")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject getIdOfRecord(
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("value") String value,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Get id from record in "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		String[] values = value.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		// put id of record in response object
		String id = getDatabaseObject(dbName).getIdOfRecord(getDbName(dbName), tableName, columnNames, values);
		dro.setResponse(id);
		
		return dro;
	}
	
	
	// .../lexit/lexit/table/get_record
	// get a record, given its id
	@Path("get_record")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject getRecord(
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("id") String id,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Get record from "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		TableRecordObject tro = getDatabaseObject(dbName).getRecord(getDbName(dbName), tableName, id);
				
		return tro;
	}
	
	
	// .../lexit/lexit/table/get_record_without_id
	// get a record, given its id
	@Path("get_record_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject getRecordWithoutId(
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Get record without id from "+tableName);
		
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		TableRecordObject tro = getDatabaseObject(dbName).getRecordWithoutId(getDbName(dbName), tableName, columnNamesToMatch, valuesToMatch);
				
		return tro;
	}
	
	
	// .../lexit/lexit/table/call_function
	// get a record, given its id
	@Path("call_function")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordObject callFunction(
			@Context SecurityContext sc,
			@QueryParam("function_name") String functionName,
			@QueryParam("args") String args,
			@QueryParam("db_name") String dbName
			){
		
		if (Constants.debug) System.out.println("### Call function "+functionName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		TableRecordObject tro = 
			getDatabaseObject(dbName).callFunction(getDbName(dbName), functionName, args.split(Constants.ARG_INTERNAL_SEPARATOR, -1));
				
		return tro;
	}
	
	
	
	// .../lexit/lexit/table/setvalue_without_id
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValueWithoutId(
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("column_name_to_update") String columnNameToUpdate,
			@QueryParam("value_to_update") String valueToUpdate,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Update record without id in "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
				
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNamesToUpdate = columnNameToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToUpdate = valueToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		getDatabaseObject(dbName).updateRecordWithoutId(getDbName(dbName), tableName, 
				columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
		return dro;
	}
	
	
	// .../lexit/lexit/table/setvalue_without_id_for_search_and_replace
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue_without_id_for_search_and_replace")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject setValueWithoutIdForSearchAndReplace(
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("column_name_to_update") String columnNameToUpdate,
			@QueryParam("value_to_update") String valueToUpdate,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Update record (search and replace) without id in "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
				
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNamesToUpdate = columnNameToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToUpdate = valueToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		getDatabaseObject(dbName).updateRecordWithoutId_ForSearchAndReplace(getDbName(dbName), tableName, 
				columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
		return dro;
	}
	
	
	
	// .../lexit/lexit/table/insertvalue
	// insert a new record into a table
	@Path("insertvalue")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecord(
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("value") String newValue,
			@QueryParam("returning") String returningField,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Insert record into "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		if (Constants.debug) System.out.println("'"+returningField+"'");
		
		DbResponseObject dro = new DbResponseObject(); 
				
		String[] newValues = newValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		if (returningField == null || returningField.toLowerCase().equals("null") || returningField.isEmpty())
		{
			getDatabaseObject(dbName).insertRecord(getDbName(dbName), tableName, columnNames, newValues, dro);
			
		}
		else 
		{
			// insert record and get its id
			getDatabaseObject(dbName).insertRecordAndGetItsId(getDbName(dbName), tableName, columnNames, newValues, returningField, dro);
			
		}
		
		return dro;
	}
	
	
	// .../lexit/lexit/tabel/insertmodified
	// insert some new records based on existing records with ids
	// which will be re-inserted with modified values, according to some patterns and replacement strings
	@Path("insertmodified")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecordModified(	
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("filter_column_name") String filterColumnName,
			@QueryParam("filter_value") String filterValue,
			@QueryParam("replacement_value") String replacementValue,
			@QueryParam("column_to_copy") String columnToCopy,
			@QueryParam("row_id") String rowId,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Insert modified record into "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		
		String[] rowIds = rowId.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnsToCopy = columnToCopy.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		if (columnsToCopy[0].isEmpty()) columnsToCopy = null;
		
		getDatabaseObject(dbName).insertFromExistingRecords(getDbName(dbName), tableName, 
				rowIds, columnsToCopy, filterColumnName, filterValue, replacementValue, 
				dro);
		
		
		return dro;
	}
	
	
	// .../lexit/lexit/tabel/insertmodified_without_id
	// insert some new records based on existing records
	// which will be re-inserted with modified values, according to some patterns and replacement strings
	@Path("insertmodified_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject insertRecordModifiedWithoutId(		
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("filter_column_name") String filterColumnName,
			@QueryParam("filter_value") String filterValue,
			@QueryParam("replacement_column_name") String replacementColumnName,
			@QueryParam("replacement_value") String replacementValue,
			@QueryParam("returning") String returningField,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Insert modified record without id into "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
		
		String[] filterColumnNames = filterColumnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] filterValues = filterValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] replacementColumnNames = replacementColumnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] replacementValues = replacementValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		getDatabaseObject(dbName).insertFromExistingRecordsWithoutId(getDbName(dbName), tableName, 
				filterColumnNames, filterValues, replacementColumnNames, replacementValues, 
				returningField, dro);
		
		
		return dro;
	}
	
	
	// .../lexit/lexit/table/delete_row
	// delete a record from a table, given its id
	@Path("delete_row")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject deleteRecord(	
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("row_id") String rowId,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Delete record from "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		DbResponseObject dro = new DbResponseObject(); 
				
		getDatabaseObject(dbName).deleteRecord(getDbName(dbName), tableName, rowId, dro);
		
		return dro;
	}
	
	
	
	// .../lexit/lexit/table/delete_row_without_id
	// delete a record from a table, 
	// given some column names and values to match
	@Path("delete_row_without_id")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public DbResponseObject deleteRecordWithoutId(	
			@Context SecurityContext sc,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("value") String value,
			@QueryParam("db_name") String dbName
			){
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Delete record(s) (without ids) from "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		String[] values = value.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		DbResponseObject dro = new DbResponseObject(); 
				
		getDatabaseObject(dbName).deleteRecordWithoutId(getDbName(dbName), tableName, columnNames, values, dro);
		
		return dro;
	}
	
	

	// .../lexit/lexit/table/gettables
	@Path("gettables")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TablesListObject getTables(
			@Context SecurityContext sc,
			@QueryParam("db_name") String dbName) throws IOException {
		
		if (Constants.debug) System.out.println("We are running Java version " +
				System.getProperty("java.version") +
				" from "+
				System.getProperty("java.vendor"));
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		TablesListObject listOfTables = new TablesListObject();
		listOfTables.setTablesAndDescriptions(getDatabaseObject(dbName).getTableList(getDbName(dbName)));
		
	return listOfTables;
	}
	
	
	// .../lexit/lexit/table/gettable
	@Path("gettable")
	public TableDataInspector getTable( 
			
			@Context SecurityContext sc,
			@DefaultValue("") @FormParam("sDbName") String dbName,
			@DefaultValue("") @FormParam("sTableName") String tableName,
			
			@DefaultValue("") @FormParam("sAllColumns") String allColumns,
			@DefaultValue("0") @FormParam("iSortCol_0") int iSortCol_0,
			@DefaultValue("asc") @FormParam("sSortDir_0") String sSortDir_0,
			@DefaultValue("-1") @FormParam("iSortCol_1") int iSortCol_1,
			@DefaultValue("none") @FormParam("sSortDir_1") String sSortDir_1,
			@DefaultValue("-1") @FormParam("iSortCol_2") int iSortCol_2,
			@DefaultValue("none") @FormParam("sSortDir_2") String sSortDir_2,
			@DefaultValue("-1") @FormParam("iSortCol_3") int iSortCol_3,
			@DefaultValue("none") @FormParam("sSortDir_3") String sSortDir_3,
			@DefaultValue("-1") @FormParam("iSortCol_4") int iSortCol_4,
			@DefaultValue("none") @FormParam("sSortDir_4") String sSortDir_4,
			
			@DefaultValue("10") @FormParam("iDisplayLength") int iDisplayLength,
			@DefaultValue("0") @FormParam("iDisplayStart") int iDisplayStart,	
			
			@DefaultValue("") @FormParam("mDataProp_0") String column0,
			@DefaultValue("") @FormParam("mDataProp_1") String column1,
			@DefaultValue("") @FormParam("mDataProp_2") String column2,
			@DefaultValue("") @FormParam("mDataProp_3") String column3,
			@DefaultValue("") @FormParam("mDataProp_4") String column4,
			@DefaultValue("") @FormParam("mDataProp_5") String column5,
			@DefaultValue("") @FormParam("mDataProp_6") String column6,
			@DefaultValue("") @FormParam("mDataProp_7") String column7,
			@DefaultValue("") @FormParam("mDataProp_8") String column8,
			@DefaultValue("") @FormParam("mDataProp_9") String column9,
			@DefaultValue("") @FormParam("mDataProp_10") String column10,
			@DefaultValue("") @FormParam("mDataProp_11") String column11,
			@DefaultValue("") @FormParam("mDataProp_12") String column12,
			@DefaultValue("") @FormParam("mDataProp_13") String column13,
			@DefaultValue("") @FormParam("mDataProp_14") String column14,
			@DefaultValue("") @FormParam("mDataProp_15") String column15,
			@DefaultValue("") @FormParam("mDataProp_16") String column16,
			@DefaultValue("") @FormParam("mDataProp_17") String column17,
			@DefaultValue("") @FormParam("mDataProp_18") String column18,
			@DefaultValue("") @FormParam("mDataProp_19") String column19,
			@DefaultValue("") @FormParam("mDataProp_20") String column20,
			@DefaultValue("") @FormParam("mDataProp_21") String column21,
			@DefaultValue("") @FormParam("mDataProp_22") String column22,
			@DefaultValue("") @FormParam("mDataProp_23") String column23,
			@DefaultValue("") @FormParam("mDataProp_24") String column24,
			@DefaultValue("") @FormParam("mDataProp_25") String column25,
			@DefaultValue("") @FormParam("mDataProp_26") String column26,
			@DefaultValue("") @FormParam("mDataProp_27") String column27,
			@DefaultValue("") @FormParam("mDataProp_28") String column28,
			@DefaultValue("") @FormParam("mDataProp_29") String column29,
			@DefaultValue("") @FormParam("mDataProp_30") String column30,
			@DefaultValue("") @FormParam("mDataProp_31") String column31,
			@DefaultValue("") @FormParam("mDataProp_32") String column32,
			@DefaultValue("") @FormParam("mDataProp_33") String column33,
			@DefaultValue("") @FormParam("mDataProp_34") String column34,
			@DefaultValue("") @FormParam("mDataProp_35") String column35,
			@DefaultValue("") @FormParam("mDataProp_36") String column36,
			@DefaultValue("") @FormParam("mDataProp_37") String column37,
			@DefaultValue("") @FormParam("mDataProp_38") String column38,
			@DefaultValue("") @FormParam("mDataProp_39") String column39,
			@DefaultValue("") @FormParam("mDataProp_40") String column40,
			@DefaultValue("") @FormParam("mDataProp_41") String column41,
			@DefaultValue("") @FormParam("mDataProp_42") String column42,
			@DefaultValue("") @FormParam("mDataProp_43") String column43,
			@DefaultValue("") @FormParam("mDataProp_44") String column44,
			@DefaultValue("") @FormParam("mDataProp_45") String column45,
			@DefaultValue("") @FormParam("mDataProp_46") String column46,
			@DefaultValue("") @FormParam("mDataProp_47") String column47,
			@DefaultValue("") @FormParam("mDataProp_48") String column48,
			@DefaultValue("") @FormParam("mDataProp_49") String column49,
			@DefaultValue("") @FormParam("mDataProp_50") String column50,
			@DefaultValue("") @FormParam("mDataProp_51") String column51,
			@DefaultValue("") @FormParam("mDataProp_52") String column52,
			@DefaultValue("") @FormParam("mDataProp_53") String column53,
			@DefaultValue("") @FormParam("mDataProp_54") String column54,
			@DefaultValue("") @FormParam("mDataProp_55") String column55,
			@DefaultValue("") @FormParam("mDataProp_56") String column56,
			@DefaultValue("") @FormParam("mDataProp_57") String column57,
			@DefaultValue("") @FormParam("mDataProp_58") String column58,
			@DefaultValue("") @FormParam("mDataProp_59") String column59,
			@DefaultValue("") @FormParam("mDataProp_60") String column60,
			@DefaultValue("") @FormParam("mDataProp_61") String column61,
			@DefaultValue("") @FormParam("mDataProp_62") String column62,
			@DefaultValue("") @FormParam("mDataProp_63") String column63,
			@DefaultValue("") @FormParam("mDataProp_64") String column64,
			@DefaultValue("") @FormParam("mDataProp_65") String column65,
			@DefaultValue("") @FormParam("mDataProp_66") String column66,
			@DefaultValue("") @FormParam("mDataProp_67") String column67,
			@DefaultValue("") @FormParam("mDataProp_68") String column68,
			@DefaultValue("") @FormParam("mDataProp_69") String column69,
			@DefaultValue("") @FormParam("mDataProp_70") String column70,
			@DefaultValue("") @FormParam("mDataProp_71") String column71,
			@DefaultValue("") @FormParam("mDataProp_72") String column72,
			@DefaultValue("") @FormParam("mDataProp_73") String column73,
			@DefaultValue("") @FormParam("mDataProp_74") String column74,
			@DefaultValue("") @FormParam("mDataProp_75") String column75,
			@DefaultValue("") @FormParam("mDataProp_76") String column76,
			@DefaultValue("") @FormParam("mDataProp_77") String column77,
			@DefaultValue("") @FormParam("mDataProp_78") String column78,
			@DefaultValue("") @FormParam("mDataProp_79") String column79,			
			@DefaultValue("") @FormParam("mDataProp_80") String column80,
			@DefaultValue("") @FormParam("mDataProp_81") String column81,
			@DefaultValue("") @FormParam("mDataProp_82") String column82,
			@DefaultValue("") @FormParam("mDataProp_83") String column83,
			@DefaultValue("") @FormParam("mDataProp_84") String column84,
			@DefaultValue("") @FormParam("mDataProp_85") String column85,
			@DefaultValue("") @FormParam("mDataProp_86") String column86,
			@DefaultValue("") @FormParam("mDataProp_87") String column87,
			@DefaultValue("") @FormParam("mDataProp_88") String column88,
			@DefaultValue("") @FormParam("mDataProp_89") String column89,
			@DefaultValue("") @FormParam("mDataProp_90") String column90,
			@DefaultValue("") @FormParam("mDataProp_91") String column91,
			@DefaultValue("") @FormParam("mDataProp_92") String column92,
			@DefaultValue("") @FormParam("mDataProp_93") String column93,
			@DefaultValue("") @FormParam("mDataProp_94") String column94,
			@DefaultValue("") @FormParam("mDataProp_95") String column95,
			@DefaultValue("") @FormParam("mDataProp_96") String column96,
			@DefaultValue("") @FormParam("mDataProp_97") String column97,
			@DefaultValue("") @FormParam("mDataProp_98") String column98,
			@DefaultValue("") @FormParam("mDataProp_99") String column99,
			@DefaultValue("") @FormParam("mDataProp_100") String column100,
			@DefaultValue("") @FormParam("mDataProp_101") String column101,
			@DefaultValue("") @FormParam("mDataProp_102") String column102,
			@DefaultValue("") @FormParam("mDataProp_103") String column103,
			@DefaultValue("") @FormParam("mDataProp_104") String column104,
			@DefaultValue("") @FormParam("mDataProp_105") String column105,
			@DefaultValue("") @FormParam("mDataProp_106") String column106,
			@DefaultValue("") @FormParam("mDataProp_107") String column107,
			@DefaultValue("") @FormParam("mDataProp_108") String column108,
			@DefaultValue("") @FormParam("mDataProp_109") String column109,
			
			@DefaultValue("") @FormParam("sSearch") String sSearch,
			
			@DefaultValue("") @FormParam("sSearch_0") String sSearch0,
			@DefaultValue("") @FormParam("sSearch_1") String sSearch1,
			@DefaultValue("") @FormParam("sSearch_2") String sSearch2,
			@DefaultValue("") @FormParam("sSearch_3") String sSearch3,
			@DefaultValue("") @FormParam("sSearch_4") String sSearch4,
			@DefaultValue("") @FormParam("sSearch_5") String sSearch5,
			@DefaultValue("") @FormParam("sSearch_6") String sSearch6,
			@DefaultValue("") @FormParam("sSearch_7") String sSearch7,
			@DefaultValue("") @FormParam("sSearch_8") String sSearch8,
			@DefaultValue("") @FormParam("sSearch_9") String sSearch9,
			@DefaultValue("") @FormParam("sSearch_10") String sSearch10,
			@DefaultValue("") @FormParam("sSearch_11") String sSearch11,
			@DefaultValue("") @FormParam("sSearch_12") String sSearch12,
			@DefaultValue("") @FormParam("sSearch_13") String sSearch13,
			@DefaultValue("") @FormParam("sSearch_14") String sSearch14,
			@DefaultValue("") @FormParam("sSearch_15") String sSearch15,
			@DefaultValue("") @FormParam("sSearch_16") String sSearch16,
			@DefaultValue("") @FormParam("sSearch_17") String sSearch17,
			@DefaultValue("") @FormParam("sSearch_18") String sSearch18,
			@DefaultValue("") @FormParam("sSearch_19") String sSearch19,
			@DefaultValue("") @FormParam("sSearch_20") String sSearch20,
			@DefaultValue("") @FormParam("sSearch_21") String sSearch21,
			@DefaultValue("") @FormParam("sSearch_22") String sSearch22,
			@DefaultValue("") @FormParam("sSearch_23") String sSearch23,
			@DefaultValue("") @FormParam("sSearch_24") String sSearch24,
			@DefaultValue("") @FormParam("sSearch_25") String sSearch25,
			@DefaultValue("") @FormParam("sSearch_26") String sSearch26,
			@DefaultValue("") @FormParam("sSearch_27") String sSearch27,
			@DefaultValue("") @FormParam("sSearch_28") String sSearch28,
			@DefaultValue("") @FormParam("sSearch_29") String sSearch29,
			@DefaultValue("") @FormParam("sSearch_30") String sSearch30,
			@DefaultValue("") @FormParam("sSearch_31") String sSearch31,
			@DefaultValue("") @FormParam("sSearch_32") String sSearch32,
			@DefaultValue("") @FormParam("sSearch_33") String sSearch33,
			@DefaultValue("") @FormParam("sSearch_34") String sSearch34,
			@DefaultValue("") @FormParam("sSearch_35") String sSearch35,
			@DefaultValue("") @FormParam("sSearch_36") String sSearch36,
			@DefaultValue("") @FormParam("sSearch_37") String sSearch37,
			@DefaultValue("") @FormParam("sSearch_38") String sSearch38,
			@DefaultValue("") @FormParam("sSearch_39") String sSearch39,
			@DefaultValue("") @FormParam("sSearch_40") String sSearch40,
			@DefaultValue("") @FormParam("sSearch_41") String sSearch41,
			@DefaultValue("") @FormParam("sSearch_42") String sSearch42,
			@DefaultValue("") @FormParam("sSearch_43") String sSearch43,
			@DefaultValue("") @FormParam("sSearch_44") String sSearch44,
			@DefaultValue("") @FormParam("sSearch_45") String sSearch45,
			@DefaultValue("") @FormParam("sSearch_46") String sSearch46,
			@DefaultValue("") @FormParam("sSearch_47") String sSearch47,
			@DefaultValue("") @FormParam("sSearch_48") String sSearch48,
			@DefaultValue("") @FormParam("sSearch_49") String sSearch49,
			@DefaultValue("") @FormParam("sSearch_50") String sSearch50,
			@DefaultValue("") @FormParam("sSearch_51") String sSearch51,
			@DefaultValue("") @FormParam("sSearch_52") String sSearch52,
			@DefaultValue("") @FormParam("sSearch_53") String sSearch53,
			@DefaultValue("") @FormParam("sSearch_54") String sSearch54,
			@DefaultValue("") @FormParam("sSearch_55") String sSearch55,
			@DefaultValue("") @FormParam("sSearch_56") String sSearch56,
			@DefaultValue("") @FormParam("sSearch_57") String sSearch57,
			@DefaultValue("") @FormParam("sSearch_58") String sSearch58,
			@DefaultValue("") @FormParam("sSearch_59") String sSearch59,
			@DefaultValue("") @FormParam("sSearch_60") String sSearch60,
			@DefaultValue("") @FormParam("sSearch_61") String sSearch61,
			@DefaultValue("") @FormParam("sSearch_62") String sSearch62,
			@DefaultValue("") @FormParam("sSearch_63") String sSearch63,
			@DefaultValue("") @FormParam("sSearch_64") String sSearch64,
			@DefaultValue("") @FormParam("sSearch_65") String sSearch65,
			@DefaultValue("") @FormParam("sSearch_66") String sSearch66,
			@DefaultValue("") @FormParam("sSearch_67") String sSearch67,
			@DefaultValue("") @FormParam("sSearch_68") String sSearch68,
			@DefaultValue("") @FormParam("sSearch_69") String sSearch69,
			@DefaultValue("") @FormParam("sSearch_70") String sSearch70,
			@DefaultValue("") @FormParam("sSearch_71") String sSearch71,
			@DefaultValue("") @FormParam("sSearch_72") String sSearch72,
			@DefaultValue("") @FormParam("sSearch_73") String sSearch73,
			@DefaultValue("") @FormParam("sSearch_74") String sSearch74,
			@DefaultValue("") @FormParam("sSearch_75") String sSearch75,
			@DefaultValue("") @FormParam("sSearch_76") String sSearch76,
			@DefaultValue("") @FormParam("sSearch_77") String sSearch77,
			@DefaultValue("") @FormParam("sSearch_78") String sSearch78,
			@DefaultValue("") @FormParam("sSearch_79") String sSearch79,			
			@DefaultValue("") @FormParam("sSearch_80") String sSearch80,
			@DefaultValue("") @FormParam("sSearch_81") String sSearch81,
			@DefaultValue("") @FormParam("sSearch_82") String sSearch82,
			@DefaultValue("") @FormParam("sSearch_83") String sSearch83,
			@DefaultValue("") @FormParam("sSearch_84") String sSearch84,
			@DefaultValue("") @FormParam("sSearch_85") String sSearch85,
			@DefaultValue("") @FormParam("sSearch_86") String sSearch86,
			@DefaultValue("") @FormParam("sSearch_87") String sSearch87,
			@DefaultValue("") @FormParam("sSearch_88") String sSearch88,
			@DefaultValue("") @FormParam("sSearch_89") String sSearch89,
			@DefaultValue("") @FormParam("sSearch_90") String sSearch90,
			@DefaultValue("") @FormParam("sSearch_91") String sSearch91,
			@DefaultValue("") @FormParam("sSearch_92") String sSearch92,
			@DefaultValue("") @FormParam("sSearch_93") String sSearch93,
			@DefaultValue("") @FormParam("sSearch_94") String sSearch94,
			@DefaultValue("") @FormParam("sSearch_95") String sSearch95,
			@DefaultValue("") @FormParam("sSearch_96") String sSearch96,
			@DefaultValue("") @FormParam("sSearch_97") String sSearch97,
			@DefaultValue("") @FormParam("sSearch_98") String sSearch98,
			@DefaultValue("") @FormParam("sSearch_99") String sSearch99,
			@DefaultValue("") @FormParam("sSearch_100") String sSearch100,
			@DefaultValue("") @FormParam("sSearch_101") String sSearch101,
			@DefaultValue("") @FormParam("sSearch_102") String sSearch102,
			@DefaultValue("") @FormParam("sSearch_103") String sSearch103,
			@DefaultValue("") @FormParam("sSearch_104") String sSearch104,
			@DefaultValue("") @FormParam("sSearch_105") String sSearch105,
			@DefaultValue("") @FormParam("sSearch_106") String sSearch106,
			@DefaultValue("") @FormParam("sSearch_107") String sSearch107,
			@DefaultValue("") @FormParam("sSearch_108") String sSearch108,
			@DefaultValue("") @FormParam("sSearch_109") String sSearch109,
			@DefaultValue("") @FormParam("bForceExactCount") String sForceExactCount,
			@Context HttpServletRequest req
			) throws IOException {
		
		
		
		// is exact count required by the user?
		getDatabaseObject(dbName).setForceExactCount( sForceExactCount.equals("true") );
				
		
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Get table "+tableName);
		
		String userName = sc.getUserPrincipal().getName();
		if ( !userIsAllowedTo(dbName, sc, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
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
		
		String iSortColName = columnsArr[iSortCol_0];
		
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
		
		
		// keep current settings
		sortingTable = tableName;
		sortingDirection = sSortDir_0;
		sortingColumn = iSortColName;		
		
		// get the count of all records in the table (fast)
		Map countAndCountQualityOfTable = getCountOfTable(dbName, tableName);
		int countOfTable = (Integer) countAndCountQualityOfTable.get("count");
		boolean countQualityOfTable = (Boolean) countAndCountQualityOfTable.get("exactCount");

		
		// sorting
		ArrayList<String> tmpSortCol = new ArrayList<String>();
		ArrayList<String> tmpSortDir = new ArrayList<String>();
		tmpSortCol.add( columnsArr[iSortCol_0] );
		tmpSortDir.add(sSortDir_0);
		if (iSortCol_1 >-1)
		{
			tmpSortCol.add( columnsArr[iSortCol_1] );
			tmpSortDir.add(sSortDir_1);
		}
		if (iSortCol_2 >-1)
		{
			tmpSortCol.add( columnsArr[iSortCol_2] );
			tmpSortDir.add(sSortDir_2);
		}
		if (iSortCol_3 >-1)
		{
			tmpSortCol.add( columnsArr[iSortCol_3] );
			tmpSortDir.add(sSortDir_3);
		}
		if (iSortCol_4 >-1)
		{
			tmpSortCol.add( columnsArr[iSortCol_4] );
			tmpSortDir.add(sSortDir_4);
		}
		// convert to arrays
		String[] aSortCol = tmpSortCol.toArray(new String[tmpSortCol.size()]);
		String[] aSortDir = tmpSortDir.toArray(new String[tmpSortDir.size()]);
		
		// return the table
		return new TableDataInspector(getDatabaseObject(dbName),
				uriInfo, request, getDbName(dbName), tableName, countOfTable, countQualityOfTable,
				allColumns.split(Constants.ARG_INTERNAL_SEPARATOR, -1),
				iDisplayLength, iDisplayStart, setRightSearchValue(sSearch), 
				newColumnsArr, newColumnSearchArr, newCaseSensitiveColumnSearchArr,
				weMustSort, aSortCol, aSortDir
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
		
		if ( (cleanValue.startsWith("\"") && cleanValue.endsWith("\"")) || (cleanValue.startsWith("'") && cleanValue.endsWith("'")) )
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
		
		if ( (cleanValue.startsWith("\"") && cleanValue.endsWith("\"")) || (cleanValue.startsWith("'") && cleanValue.endsWith("'")) )
		{
			return true;
		}
		return false;
	}
	
	
	/**
	 * Query and register the count of a table, or get it from cache when available
	 * @param tableName
	 * @return
	 * @throws IOException
	 */
	private Map getCountOfTable(String dbName, String tableName) throws IOException{
		
		tableName = tableName.replaceAll("__", ".");
		if (Constants.debug) System.out.println("### Get total count of "+tableName);
		
		return getDatabaseObject(dbName).getQuickCountOfAllTableRecords(dbName, tableName);
	}
	
	/**
	 * Retrieve the name of the database stored in the cookie value
	 * (for now, no special implementation, but function is here
	 *  just in case we have to parse the cookie value in the future:
	 *  we will than only have to do some parsing here, and we won't
	 *  need to change the code elsewhere)
	 * @param cookieValue
	 * @return
	 */
	private String getDbName(String dbName){
		return dbName;
	}
	
	/**
	 * return the database access object for a given database name
	 * @param dbName
	 * @return
	 */
	private Database getDatabaseObject(String dbName){
		
//		System.out.println("nameToDatabaseObject contains:");
//		for (String oneKey : nameToDatabaseObject.keySet())
//		{
//			System.out.println(oneKey + " -> "+ nameToDatabaseObject.get(oneKey) );
//		}
//		System.out.println("-------\n\n");
		
		if ( !nameToDatabaseObject.containsKey(dbName) )
			{			
			Database newDbObj = new Database(dbName, context);
			nameToDatabaseObject.put(dbName, newDbObj);			
			}
		
		return nameToDatabaseObject.get(dbName);
	};
	
	/**
	 * Check the user's rights
	 * - 'superuser' can read, write, delete in any database
	 * - 'superreader' can read in any database
	 * - '<dbName>_all' can read, write, delete in database <dbName>
	 * - '<dbName>_write' can read, write in database <dbName>
	 * - '<dbName>_read' can only read in database <dbName>
	 * @param sc
	 * @param action
	 * @return
	 */
	private boolean userIsAllowedTo(String dbName, SecurityContext sc, String action){
		
		// get the username
		String username = sc.getUserPrincipal().getName();
		
		if (action.equals(Constants.USER_READ_ACCESS))
		{
			return 
			userHasRole(username, "superuser") || 
			userHasRole(username, "superreader") || 
			userHasRole(username, dbName+"_all") || 
			userHasRole(username, dbName+"_write") || 
			userHasRole(username, dbName+"_read");
		}
		else if (action.equals(Constants.USER_WRITE_ACCESS))
		{
			return 
			userHasRole(username, "superuser") || 
			userHasRole(username, dbName+"_all") || 
			userHasRole(username, dbName+"_write");
		}
		else if (action.equals(Constants.USER_ALL_ACCESS))
		{
			return 
			userHasRole(username, "superuser") || 
			userHasRole(username, dbName+"_all");
		}	
		
		return false;
	}
	
	/**
	 * check if a given role is part of an array of roles
	 * (subroutine of userIsAllowedTo function)
	 * @param username
	 * @param role
	 * @return
	 */
	private boolean userHasRole(String username, String role){

		String[] roles;
		
		try {
			roles = getUserRoles(username);
			return Arrays.asList(roles).contains(role);
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}
	
	
	/**
	 * read the javascript configuration file from
	 *  the configuration directory
	 * @param dbName
	 * @return
	 * @throws IOException
	 */
	public String readJsConfigFile(String dbName) throws IOException{
		
		if (Constants.debug) System.out.println("Read javascript configuration file '"+dbName+".config.js"+"'...");
		
		String fileName = dbName+".config.js";
		
		String filepath = context.getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar+"lexit"+File.separator+fileName, 
				File.separatorChar+"lexit_config"+File.separator+fileName);
		if (Constants.debug) System.out.println("File: "+filepath);
		
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
	
	
/**
 * read the users access rights file
 * @param username
 * @return String[]
 * @throws IOException
 */
	public String[] getUserRoles(String username) throws IOException{
		
		// if the access rights file has already been read,
		// return relevant content right away
		
		if (users2roles.containsKey(username))
		{
			if (Constants.debug) System.out.println("Get user access rights from cache");
			return users2roles.get(username);
		}			
		
		
		// access rights files hasn't been read yet
		// do it now
		
		if (Constants.debug) System.out.println("Read user access rights...");
		
		String fileName = "users_access.rights";		
		String filepath = context.getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar+"lexit"+File.separator+fileName, 
				File.separatorChar+"lexit_config"+File.separator+fileName);
		
		if (Constants.debug) System.out.println("File: "+filepath);
		
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
			
			return users2roles.get(username);
		}
		catch (Exception e){//Catch exception if any
			throw new RuntimeException("Error while reading users access rights file: "+filepath, e);
		}
	}

	
}
