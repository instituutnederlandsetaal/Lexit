package resources;



import java.util.ArrayList;

// contained in lib javax.ws.rs-api-2.0.1.jar
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import table.ResultObject;
import util.Database;

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
	String tableName, sSearch, iSortColName, sSortDir_0;
	String[] aSortCol, aSortDir, allColumns;
	int iDisplayLength, iDisplayStart, countOfTable, searchColumnIndex, iEcho;
	boolean weMustSort, countQualityOfTable, bCallForGoToFunction;
	ArrayList<String> aSearchColumnNames, aSearchColumnValues;
	ArrayList<Boolean> aCaseSensitiveSearchColumns;
	
	public TableDataInspector(Database dbObj,
			String tableName, int countOfTable, boolean countQualityOfTable,
			String[] allColumns, 
			int iDisplayLength, int iDisplayStart, String sSearch, 
			ArrayList<String> searchColumnNamesArr, ArrayList<String> searchColumnValuesArr, 
			ArrayList<Boolean> caseSensitiveSearchColumnsArr,
			boolean weMustSort, String[] aSortCol, String[] aSortDir, int iEcho, boolean bCallForGoToFunction) {
		
		this.dbObj = dbObj;
		this.tableName = tableName;
		this.allColumns = allColumns;
		this.iDisplayLength = iDisplayLength;
		this.iDisplayStart = iDisplayStart;
		this.sSearch = sSearch;
		this.aSearchColumnNames = searchColumnNamesArr;
		this.aSearchColumnValues = searchColumnValuesArr;
		this.aCaseSensitiveSearchColumns = caseSensitiveSearchColumnsArr;
		this.aSortCol = aSortCol;
		this.aSortDir = aSortDir;
		this.countOfTable = countOfTable;
		this.countQualityOfTable = countQualityOfTable;
		this.weMustSort = weMustSort;
		this.iEcho = iEcho;
		this.bCallForGoToFunction = bCallForGoToFunction;
	}
	
	
	
	//Application integration 
	// see JSON format expected: http://datatables.net/examples/examples_support/json_source.txt
	@POST
	@Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
	public ResultObject getTable() {		
		
		return new ResultObject(dbObj, tableName, countOfTable, countQualityOfTable, allColumns,
				iDisplayLength, iDisplayStart, sSearch, 
				aSearchColumnNames, aSearchColumnValues, aCaseSensitiveSearchColumns, 
				weMustSort, aSortCol, aSortDir, 
				iEcho, bCallForGoToFunction);
		
	}
	
}