package resources;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;
import tables.TableRecordObject;
import tables.TableRecordsObject;
import util.Util;

// This will map the resource to the URL
@Path("/api")
public class RecordsResource {
	
	private final ResourceContextService service = SharedResources.SERVICE;
	
	
	// .../api/get_id_of_record
	// get the id of a row, given some values to match in records
	@Path("get_id_of_record")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject getIdOfRecord(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("value") String value,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){

		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get id from record in "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		ResponseObject dro = new ResponseObject(); 
		String[] values = value.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		// put id of record in response object
		
		String id = service.getDatabaseObject(co).getIdOfRecord(tableName, columnNames, values);
		dro.setResponse(id);
		
		return dro;
	}
	
	
	// .../api/get_record
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
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get record from "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		TableRecordObject tro = service.getDatabaseObject(co).getRecord(tableName, id);
				
		return tro;
	}
	
	
	// .../api/get_records
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
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get multiple records from "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		String[] ids = idsStr.split(Constants.ARG_INTERNAL_SEPARATOR);
		
		TableRecordsObject tro = service.getDatabaseObject(co).getRecords(tableName, ids);
				
		return tro;
	}

	
	// .../api/get_record_without_id
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

		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get record without id from "+tableName);
		
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);		
		
		TableRecordObject tro = service.getDatabaseObject(co).getRecordWithoutId(tableName, columnNamesToMatch, valuesToMatch);
				
		return tro;
	}
	
	

	// .../api/get_records_without_ids
	// get multiple records with specifying any id
	@Path("get_records_without_ids")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableRecordsObject getRecordsWithoutIds(
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name_to_match") String columnNameToMatch,
			@QueryParam("value_to_match") String valueToMatch,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get multiple records without id from "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		TableRecordsObject tro = service.getDatabaseObject(co).getRecordsWithoutIds(tableName, columnNamesToMatch, valuesToMatch);
				
		return tro;
	}
	
	
	// .../api/insertvalue
	// insert a new record into a table
	@Path("insertvalue")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject insertRecord(
			@FormParam("table_name") String tableName,
			@FormParam("column_name") String columnName,
			@FormParam("value") String newValue,
			@FormParam("returning") String returningField,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
				
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Insert record into "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		Util.debug(co, "'"+returningField+"'");
		
		ResponseObject dro = new ResponseObject(); 
		
				
		String[] newValues = newValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		if (returningField == null || returningField.toLowerCase().equals("null") || returningField.isEmpty()) {
			service.getDatabaseObject(co).insertRecord(tableName, columnNames, newValues, dro);			
		}
		else {
			// insert record and get its id
			service.getDatabaseObject(co).insertRecordAndGetItsId(tableName, columnNames, newValues, returningField, dro);			
		}
		
		return dro;
	}
	
	
	
	// .../api/duplicaterecord
	// duplicate a record in a table and get its id
	@Path("duplicaterecord")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject duplicateRecord(
			@FormParam("table_name") String tableName,
			@FormParam("columns_to_skip") String columnsToSkip,
			@FormParam("pk_substitute") String pkSubstitute,
			@FormParam("pk_value") String pkValue,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Duplicate record in "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		Util.debug(co, "'"+pkValue+"'");
		
		ResponseObject dro = new ResponseObject();		
				
		String[] columnsToSkipArr = columnsToSkip.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		// duplicate record and get its id
		service.getDatabaseObject(co).duplicateRecordAndGetItsId(tableName, columnsToSkipArr, pkSubstitute, pkValue, dro);		
		
		return dro;
	}
	
	
	// .../tabel/insertmodified
	// insert some new records based on existing records with ids
	// which will be re-inserted with modified values, according to some patterns and replacement strings
	@Path("insertmodified")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject insertRecordModified(
			@FormParam("table_name") String tableName,
			@FormParam("filter_column_name") String filterColumnName,
			@FormParam("filter_value") String filterValue,
			@FormParam("replacement_value") String replacementValue,
			@FormParam("column_to_copy") String columnToCopy,
			@FormParam("row_id") String rowId,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Insert modified record into "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		ResponseObject dro = new ResponseObject(); 
		
		String[] rowIds = rowId.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnsToCopy = columnToCopy.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		if (columnsToCopy[0].isEmpty()) columnsToCopy = null;
		
		
		service.getDatabaseObject(co).insertFromExistingRecords(tableName, 
				rowIds, columnsToCopy, filterColumnName, filterValue, replacementValue, 
				dro);
		
		
		return dro;
	}

	
	
	// .../tabel/insertmodified_without_id
	// insert some new records based on existing records
	// which will be re-inserted with modified values, according to some patterns and replacement strings
	@Path("insertmodified_without_id")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject insertRecordModifiedWithoutId(
			@FormParam("table_name") String tableName,
			@FormParam("filter_column_name") String filterColumnName,
			@FormParam("filter_value") String filterValue,
			@FormParam("replacement_column_name") String replacementColumnName,
			@FormParam("replacement_value") String replacementValue,
			@FormParam("returning") String returningField,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Insert modified record without id into "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		ResponseObject dro = new ResponseObject(); 
		
		String[] filterColumnNames = filterColumnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] filterValues = filterValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] replacementColumnNames = replacementColumnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] replacementValues = replacementValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		service.getDatabaseObject(co).insertFromExistingRecordsWithoutId(tableName, 
				filterColumnNames, filterValues, replacementColumnNames, replacementValues, 
				returningField, dro);		
		
		return dro;
	}
	
	
	// .../api/delete_row
	// delete a record from a table, given its id
	@Path("delete_row")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject deleteRecord(
			@FormParam("table_name") String tableName,
			@FormParam("row_id") String rowId,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Delete record from "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		ResponseObject dro = new ResponseObject(); 				
		
		service.getDatabaseObject(co).deleteRecord(tableName, rowId, dro);
		
		return dro;
	}

	
	
	
	// .../api/delete_row_without_id
	// delete a record from a table, 
	// given some column names and values to match
	@Path("delete_row_without_id")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject deleteRecordWithoutId(
			@FormParam("table_name") String tableName,
			@FormParam("column_name") String columnName,
			@FormParam("value") String value,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Delete record(s) (without ids) from "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_ALL_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		String[] values = value.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		ResponseObject dro = new ResponseObject(); 
				
		service.getDatabaseObject(co).deleteRecordWithoutId(tableName, columnNames, values, dro);
		
		return dro;
	}
		
	// .../api/get_row_number
	// get the row number corresponding to a given record (given some value to match in some column)
	@Path("get_row_number")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject getRowNumber(
			@QueryParam("db_name") String dbName,
			@QueryParam("table_name") String tableName,
			@QueryParam("column_name") String columnName,
			@QueryParam("column_value") String columnValue,
			@QueryParam("occurence_nr") int occurenceNr,
			@QueryParam("sort_columns") String sortColumns,
			@QueryParam("sort_directions") String sortDirections,
			@QueryParam("filter_column_names") String filterColumns,
			@QueryParam("filter_values") String filterValues,
			@QueryParam("display_length") int iDisplayLength,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get row number for "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		ResponseObject dro = new ResponseObject();
		
		String[] filterColumnsArr = filterColumns.trim().isEmpty() ? 
				null : filterColumns.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] filterColumnValuesArr = filterValues.trim().isEmpty() ?
				null : filterValues.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		String output = service.getDatabaseObject(co).getRowNumberOfRecord(tableName, columnName, columnValue, 
						occurenceNr, sortColumns, sortDirections, 
						filterColumnsArr, filterColumnValuesArr, iDisplayLength
						);
		dro.setResponse(output);
		
		return dro;
	}

}
