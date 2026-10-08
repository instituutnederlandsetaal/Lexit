package resources;

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
import tables.UniqueValuesObject;
import util.Util;

// This will map the resource to the URL
@Path("/api")
public class ColumnsResource {
	
	private final ResourceContextService service = SharedResources.SERVICE;
	
	
	// .../api/setvalue
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject setValue(
			@FormParam("row_id") String rowId,
			@FormParam("table_name") String tableName,
			@FormParam("column_name") String columnName,
			@FormParam("new_value") String newValue,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### SetValue for "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		ResponseObject dro = new ResponseObject(); 
		
		String[] rowIds = rowId.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] newValues = newValue.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNames = columnName.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		
		
		// two possibilities:
		
		// I.	- one single column name
		//		- one or more row id's, and corresponding new values for that column in all these rows
		if (columnNames.length==1) {
			int numberOfRowsToUpdate = rowIds.length;
			for (int i=0; i<numberOfRowsToUpdate; i++) {
				service.getDatabaseObject(co).updateOneColumn(tableName, rowIds[i], columnName, newValues[i], dro);			
			}			
		}
		
		// II.	- one single row id
		// 		- more column names, and corresponding new values for these columns in that row
		else if (columnNames.length>1 && rowIds.length == 1) {
			service.getDatabaseObject(co).updateWholeRecord(tableName, rowId, columnNames, newValues, dro);
		}
				
		
		return dro;
	}
	
	
	// .../api/setvalue_without_id
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue_without_id")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject setValueWithoutId(
			@FormParam("table_name") String tableName,
			@FormParam("column_name_to_match") String columnNameToMatch,
			@FormParam("value_to_match") String valueToMatch,
			@FormParam("column_name_to_update") String columnNameToUpdate,
			@FormParam("value_to_update") String valueToUpdate,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Update record without id in "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		ResponseObject dro = new ResponseObject(); 
				
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNamesToUpdate = columnNameToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToUpdate = valueToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		
		service.getDatabaseObject(co).updateRecordWithoutId(tableName, 
				columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
		return dro;
	}
	
	
	
	
	// .../api/setvalue_without_id_for_search_and_replace
	// it is possible to send more row_id's, new_value's and column names as input,
	// they must be comma-separated
	// (see explanation in code)
	@Path("setvalue_without_id_for_search_and_replace")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject setValueWithoutIdForSearchAndReplace(
			@FormParam("table_name") String tableName,
			@FormParam("column_name_to_match") String columnNameToMatch,
			@FormParam("value_to_match") String valueToMatch,
			@FormParam("column_name_to_update") String columnNameToUpdate,
			@FormParam("value_to_update") String valueToUpdate,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Update record (search and replace) without id in "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		ResponseObject dro = new ResponseObject(); 
				
		String[] columnNamesToMatch = columnNameToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToMatch = valueToMatch.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] columnNamesToUpdate = columnNameToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
		String[] valuesToUpdate = valueToUpdate.split(Constants.ARG_INTERNAL_SEPARATOR, -1);
				
		
		service.getDatabaseObject(co).updateRecordWithoutId_ForSearchAndReplace(tableName, 
				columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
		return dro;
	}
	
	
	// .../api/get_unique_values
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
			){
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
	    Util.debug(co, "### Get unique values for column " + columnName + " in " + tableName);	    
	    
	    if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
	    return service.getDatabaseObject(co).getUniqueValues(tableName, columnName);
	  }
	
	
	// .../api/get_unique_values_with_limit
	// get all the unique values a column may contain (needed for select boxes)
	@Path("get_unique_values_with_limit")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public UniqueValuesObject getUniqueValuesWithLimit(
			@QueryParam("db_name") String dbName, 
			@QueryParam("table_name") String tableName, 
			@QueryParam("column_name") String columnName,
			@QueryParam("column_value_filter") String columnValueFilter,	// regex filter box value in the Query Builder
			@QueryParam("other_columns_filters_and_values") String otherFiltersAndValues, // existing search box filters from table, which we expect to operate
			@QueryParam("limit") String limit,
			@DefaultValue("false") @QueryParam("sort_by_freq") String sortByFrequency,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
		)
	  {
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
	    Util.debug(co, "### Get unique values (with limit) for column " + columnName + " in " + tableName);
	    
	    if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
	    return service.getDatabaseObject(co).getUniqueValuesWithFreqs(tableName, columnName, columnValueFilter, otherFiltersAndValues, limit, sortByFrequency.toLowerCase().equals("true"));
	  }

}
