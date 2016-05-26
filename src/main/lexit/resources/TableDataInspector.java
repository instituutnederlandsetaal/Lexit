package lexit.resources;



import java.util.ArrayList;



// contained in lib javax.ws.rs-api-2.0.1.jar
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.UriInfo;

import lexit.table.ResultObject;
import lexit.util.Database;

/**
 * The TableDataInspector class requests the data
 * being contained in a given table in a database
 * and returns those data as JSON or XML
 * 
 * @author Fannee
 *
 */
public class TableDataInspector {

	Database dbObj;
	String tableName, sSearch, iSortColName, sSortDir_0, access;
	String[] aSortCol, aSortDir, allColumns;
	int iDisplayLength, iDisplayStart, countOfTable, searchColumnIndex, iEcho;
	boolean weMustSort, countQualityOfTable;
	ArrayList<String> newColumnsArr, newColumnSearchArr;
	ArrayList<Boolean> newCaseSensitiveColumnSearchArr;
	
	public TableDataInspector(Database dbObj,
			String tableName, int countOfTable, boolean countQualityOfTable,
			String[] allColumns, 
			int iDisplayLength, int iDisplayStart, String sSearch, 
			ArrayList<String> newColumnsArr, ArrayList<String> newColumnSearchArr, 
			ArrayList<Boolean> newCaseSensitiveColumnSearchArr,
			boolean weMustSort, String[] aSortCol, String[] aSortDir, int iEcho) {
		
		this.dbObj = dbObj;
		this.tableName = tableName;
		this.allColumns = allColumns;
		this.iDisplayLength = iDisplayLength;
		this.iDisplayStart = iDisplayStart;
		this.sSearch = sSearch;
		this.newColumnsArr = newColumnsArr;
		this.newColumnSearchArr = newColumnSearchArr;
		this.newCaseSensitiveColumnSearchArr = newCaseSensitiveColumnSearchArr;
		this.aSortCol = aSortCol;
		this.aSortDir = aSortDir;
		this.countOfTable = countOfTable;
		this.countQualityOfTable = countQualityOfTable;
		this.weMustSort = weMustSort;
		this.iEcho = iEcho;
	}
	
	
	
	//Application integration 
	// see JSON format expected: http://datatables.net/examples/examples_support/json_source.txt
	@POST
	@Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
	public ResultObject getTable() {		
		
		return new ResultObject(dbObj, tableName, access, countOfTable, countQualityOfTable, allColumns,
				iDisplayLength, iDisplayStart, sSearch, 
				newColumnsArr, newColumnSearchArr, newCaseSensitiveColumnSearchArr, weMustSort, 
				aSortCol, aSortDir, iEcho);
		
	}
	
}