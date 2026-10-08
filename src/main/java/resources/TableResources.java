package resources;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
import tables.ResultObject;
import tables.TableMetadata;
import tables.TablesListObject;
import util.Util;



// This will map the resource to the tables URL
@Path("/api")
public class TableResources {
 	
	private final ResourceContextService service = SharedResources.SERVICE;
	
	
	// clean the cache of some table
	// call:
	// .../webservice/api/cleancache?table_name=...&db_name=...
	@Path("cleancache")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject cleanCache(
			@FormParam("table_name") String tableName,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Clean cache of "+tableName);
		
		ResponseObject dro = new ResponseObject();
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		service.getDatabaseObject(co).cleanCache(tableName);
	
		dro.setResponse("OK");
		
		return dro;
	}
	
	
	// refresh a materialized view
	// call:
	// .../webservice/api/refresh_materialized_view?table_name=...&db_name=...
	@Path("refresh_materialized_view")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject refreshMaterializedView(
			@FormParam("table_name") String tableName,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest) {
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Refresh materialized view "+tableName);
		
		ResponseObject dro = new ResponseObject();
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		service.getDatabaseObject(co).refreshMaterializedView(tableName);
		
		dro.setResponse("OK");
		
		return dro;
	}
	
	
	


	// get the list of columns of a table and their type 
	// and their allowed values (in case of Postgres user-defined type)
	// call:
	// .../api/getcolumns?table=....
	@Path("getcolumns")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableMetadata getColumns( 
			@QueryParam("table") String tableName,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get Columns from "+tableName);
		
				
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
				
		TableMetadata tmi = new TableMetadata(service.getDatabaseObject(co), tableName);
		tmi.setColumnNames();
		return tmi;
	}
	
	
	
	
	
	
	
	
	
	

	// .../api/setcomment
	// set the comment of a table or view
	@Path("setcomment")
	@POST
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject setComment(
			@FormParam("table_name") String tableName,
			@FormParam("new_comment") String newComment,
			@FormParam("table_type") String tableType,
			@FormParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Set comment for "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_WRITE_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		ResponseObject dro = new ResponseObject(); 		
		
		service.getDatabaseObject(co).updateComment(tableName, tableType, newComment, dro);				
		
		return dro;
	}
	
	
	// .../api/get_comment
	// get the comment of a table or view
	@Path("get_comment")
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public ResponseObject getComment(
			@QueryParam("table_name") String tableName,
			@QueryParam("table_type") String tableType,
			@QueryParam("db_name") String dbName,
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			){
		
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		Util.debug(co, "### Get comment on "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+userName);
		
		ResponseObject dro = new ResponseObject(); 
		
		// put id of record in response object
		
		String comment = service.getDatabaseObject(co).getComment(tableName);
		dro.setResponse(comment);
		
		return dro;
	}
	
	
	
	
	// .../api/gettables
 	@Path("gettables")
 	@GET
 	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
 	public TablesListObject getTables(
 			@QueryParam("db_name") String dbName,
 			@Context ServletContext context,
 			@Context SecurityContext sc,
 			@Context HttpServletRequest httpServletRequest
 			) throws IOException {
 		
 		String userName = service.getLexitInfo().getUserName(httpServletRequest);
 		
 		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
 		Util.debug(co, "We are running Java version " +
 				System.getProperty("java.version") +
 				" from "+
 				System.getProperty("java.vendor"));
 		
 		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
 			throw new RuntimeException("Permission denied to "+co.getUsername());
 		
 		TablesListObject listOfTables = new TablesListObject();
 		
 		listOfTables.setTablesAndDescriptions(service.getDatabaseObject(co).getTablesList());
 		
 	return listOfTables;
 	}

	
	
	// .../api/gettable
	@Path("gettable")
	@POST
	@Produces({MediaType.APPLICATION_JSON})
	public ResultObject getTable(
			String requestBody, 
			@Context ServletContext context,
			@Context SecurityContext sc,
			@Context HttpServletRequest httpServletRequest
			) throws IOException {
		
		
		// Get the request body into a hash
		
		String[] requestBodyArr = requestBody.split("&");
		ConcurrentHashMap<String, String> requestBodyMap = new ConcurrentHashMap<String, String>();
		int iNumberOfColumns = 0;
		int iNumberOfSortedColumns = 0;
		
		
		for (int i=0; i<requestBodyArr.length; i++) {
			
			String onePair =	requestBodyArr[i];
			String key = 		onePair.split("=")[0];
			String value = 		(onePair.split("=").length>1) ? onePair.split("=")[1] : ""; // make sure we have at least an empty string (no null!)
			
			// first decode the values (as those might be URL encoded)
			try {				
				key = 	java.net.URLDecoder.decode(key, "UTF-8");
				value =	java.net.URLDecoder.decode(value, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				throw new RuntimeException("Error while parsing the requestBody", e);
			}
		
			
			// if we encounter a column parameter, increase columns counter
			if (key.startsWith("columns[") && key.endsWith("name]"))
				iNumberOfColumns++;
			
			// if we encounter a sorted column, increase sorted columns counter
			if (key.startsWith("order[") && key.endsWith("[column]"))
				iNumberOfSortedColumns++;
			
			// put the key/value into our requestBodyMap
			requestBodyMap.put(key, value);
			
		}
		
		
		
		// ---------------------------------------------------------
		// we have a parsed request body, now extract all parameters
		// ---------------------------------------------------------
		
		String dbName = 			requestBodyMap.get("sDbName");
		String sForceExactCount =	requestBodyMap.get("bForceExactCount");
		String tableName = 			requestBodyMap.get("sTableName");
		String sGoToRowIds = 		requestBodyMap.get("sGoToRowIds");
		String sSearch =			requestBodyMap.get("search[value]");
		
		String sDisplayStart = 		requestBodyMap.get("start");
		int iDisplayStart = 		sDisplayStart.equalsIgnoreCase("null") ? 0 : Integer.parseInt(sDisplayStart);
		String sDisplayLength =		requestBodyMap.get("length");
		int iDisplayLength =		sDisplayLength.equalsIgnoreCase("null") ? 10 : Integer.parseInt(sDisplayLength);
		String sEcho =				requestBodyMap.get("draw");
		int iEcho =					sEcho.equalsIgnoreCase("null") ? 0 : Integer.parseInt(sEcho);
		
		
		// column names and search values parameters
		
		ArrayList<String> aAllColumnsList = new ArrayList<String>();
		ArrayList<String>  aAllColumnSearchValuesList = new ArrayList<String>();
		
		for (int i = 0; i<iNumberOfColumns; i++) {
			
			String sColumnKey = "columns["+i+"][name]";
			String sColumnSearchKey = "columns["+i+"][search][value]";
			
			String sColumnValue = requestBodyMap.get(sColumnKey);
			String sColumnSearchValue = requestBodyMap.get(sColumnSearchKey);
			sColumnSearchValue = (sColumnSearchValue == null) ? "" : sColumnSearchValue;
			
			aAllColumnsList.add(sColumnValue);
			aAllColumnSearchValuesList.add(sColumnSearchValue);
			
		}

		// convert to arrays
		String[] aAllColumns = new String[iNumberOfColumns];
		aAllColumns = aAllColumnsList.toArray(aAllColumns);
		String[] aAllColumnSearchValues = new String[iNumberOfColumns];
		aAllColumnSearchValues = aAllColumnSearchValuesList.toArray(aAllColumnSearchValues);
		
		
		// sorted columns
		
		ArrayList<String> tmpSortCol = new ArrayList<String>();
		ArrayList<String> tmpSortDir = new ArrayList<String>();
		
		// it might happen that no sorting was set,
		// in that case, we add a default sorted column
		if (iNumberOfSortedColumns == 0) {
			tmpSortCol.add( aAllColumns[0] );
			tmpSortDir.add( "asc" );
		}
		
		// now set the sorted columns arrays
		for (int i = 0; i<iNumberOfSortedColumns ; i++) {
			
			String sSortedColumn = "order["+i+"][column]";
			String sSortedColumnDir = "order["+i+"][dir]";
			
			int iSortCol = Integer.parseInt(requestBodyMap.get(sSortedColumn));
			String sSortDir = requestBodyMap.get(sSortedColumnDir);
			
			// Sanity check
			if (!sSortDir.toLowerCase().matches("^(asc|asc_reverse|desc|desc_reverse|nulls first|nulls last)$")) {
				throw new RuntimeException("Illegal sort direction in request: "+sSortDir);
			}
			
			tmpSortCol.add( aAllColumns[iSortCol] );
			tmpSortDir.add( sSortDir );
		}
		
		// convert to arrays
		String[] aSortCol = tmpSortCol.toArray(new String[tmpSortCol.size()]);
		String[] aSortDir = tmpSortDir.toArray(new String[tmpSortDir.size()]);
				
		
		
		// ---------------------------------------
		// now we have all parameters, do the job!
		// ---------------------------------------
		
		// get context object, given the current database name
		String userName = service.getLexitInfo().getUserName(httpServletRequest);
		ContextObject co = new ContextObject(context, sc, httpServletRequest, dbName, userName);
		
		// is exact count required by the user for this call?		
		service.getDatabaseObject(co).getCache().setExactCountRequired( tableName, sForceExactCount.equalsIgnoreCase("true") );				
		
		
		Util.debug(co, "### Get table "+tableName);
		
		if ( !service.userIsAllowedTo(co, Constants.USER_READ_ACCESS))
			throw new RuntimeException("Permission denied to "+co.getUsername());
		
		
		
		// Compute useful part of the arrays
		// We need this because the tail of the arrays consists of empty values, since the table is mostly smaller than the max number of allowed columns
		
		int startOfEmptyRange = Util.getIndexOf("", aAllColumns);
		String[] aCleanAllColumns = startOfEmptyRange > -1 ? Arrays.copyOfRange(aAllColumns, 0, startOfEmptyRange) : aAllColumns;
		
		
		
		// search arrays: those will contain ONLY non-empty values
		// (which is the difference between these arrays and the previous ones, which contained all parameters, even when those had empty values)
		
		ArrayList<String> aSearchColumnNames = new ArrayList<String>();
		ArrayList<String> aSearchColumnValues = new ArrayList<String>();
		ArrayList<Boolean> aCaseSensitiveColumnSearch = new ArrayList<Boolean>();
		
		// Is the current call triggers by a call of the GoTo function?
		// (beware: the particular case in which we use row-ids for speed;
		//  See info at Database.getRowNumberOfRecord)
		
		
		boolean bCallForGoToFunction = !sGoToRowIds.isEmpty();   // sGoToRowIds has the form 'column name':'ids'
		
		
		// gather search data for all columns
		
		// first add the row ids searched for (this occurs only when carrying out a GoTo operation [making use of row ids -when available- for speed!])
		if ( bCallForGoToFunction ) {
			
			String idsColumn = (sGoToRowIds.split(":"))[0];	// column name
			String idsValues = (sGoToRowIds.split(":"))[1];	// ids
			int idsColumnIdx = Util.getIndexOf(idsColumn, aAllColumns);
			
			aAllColumnSearchValues[idsColumnIdx] = idsValues;
			
			// Set start position to 0, as we're targeting some row ids, so we don't want the webservice to set an offset.
			// But since this is part of a GoTo operation, we let the client think it is requesting some given page number
			// so apparently the function really behaves like a GoTo function (t.i. a navigation function, leading to some page number).
			// In reality, we've been requesting a list of row ids, and get page 1 of the results!
			iDisplayStart = 0;
		}
		
		// now gather the search data for all columns
		for (int i=0; i<aAllColumnSearchValues.length; i++) {
			
			String oneSearchColumn = aAllColumnSearchValues[i].trim();
			if ( !oneSearchColumn.isEmpty()) {
				
				aSearchColumnNames.add( aAllColumns[i] ); 				
				aSearchColumnValues.add( Util.setRightSearchValue(oneSearchColumn)  );
				aCaseSensitiveColumnSearch.add( Util.setRightCaseSensitivity(oneSearchColumn) );
			}
		}
		
		
		// get the count of all records in the table (fast)
		
		Map<String, Object> countAndCountQualityOfTable = getCountOfTable(co, tableName);
		int countOfTable = (Integer) countAndCountQualityOfTable.get("count");
		boolean countQualityOfTable = (Boolean) countAndCountQualityOfTable.get("exactCount");		
		
		
		// return the table		
		return new ResultObject(service.getDatabaseObject(co),
				tableName, countOfTable, countQualityOfTable,
				aCleanAllColumns,
				iDisplayLength, iDisplayStart, Util.setRightSearchValue(sSearch), 
				aSearchColumnNames, aSearchColumnValues, aCaseSensitiveColumnSearch,
				true, aSortCol, aSortDir, iEcho, bCallForGoToFunction
				);
		
	}
	
	
	
	
	// Query and register the count of a table, or get it from cache when available
	private Map<String, Object> getCountOfTable(ContextObject co, String tableName) throws IOException{
		
		Util.debug(co, "### Get total count of "+tableName);
		
		return service.getDatabaseObject(co).getQuickCountOfAllTableRecords(tableName);
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
}
