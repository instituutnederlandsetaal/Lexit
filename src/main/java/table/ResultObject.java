package table;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The ResultObject contains the result of a database query and some more,
 * that is: some table content, the number of results, the number of available records, etc.
 * 
 */

import resources.Constants;
import util.Database;

public class ResultObject {

	// draw (originally: echo), unique query identifier
	public int draw;
	public int recordsTotal = 10000;
	public int recordsFiltered = 10000;
	private String tableName = "";
	public boolean bQueryCountIsExact = false;
	public boolean bTotalCountIsExact = false;
	public String sNeededIndexForSortColumns = "";
	public ArrayList<ConcurrentHashMap<String, String>> data = new ArrayList<ConcurrentHashMap<String, String>>();
	
	public int getEcho(){return this.draw;}
	public void setEcho(int echo){this.draw = echo;}
	public int getTotalRecords(){return this.recordsTotal;}
	public void setTotalRecords(int totalRecords){this.recordsTotal = totalRecords;}
	public int getTotalDisplayRecords(){return this.recordsFiltered;}
	public void setTotalDisplayRecords(int totalDisplayRecords){this.recordsFiltered = totalDisplayRecords;}
	public boolean queryCountIsExact(){return this.bQueryCountIsExact;}
	public void setQueryCountIsExact(boolean exactCount){this.bQueryCountIsExact = exactCount;}
	public boolean totalCountIsExact(){return this.bTotalCountIsExact;}
	public void setTotalCountIsExact(boolean exactCount){this.bTotalCountIsExact = exactCount;}
	public String getNeededIndexForSortColumns(){return this.sNeededIndexForSortColumns;}
	public void setNeededIndexForSortColumns(String neededIndex){this.sNeededIndexForSortColumns = neededIndex;}
	public ArrayList<ConcurrentHashMap<String, String>> getTableContent() {
		return this.data;
	}	
	public void setTableContent(ArrayList<ConcurrentHashMap<String, String>> table) {
		this.data = table;
	}
	public String getTableName() {
		return tableName;
	}
	public void setTableName(String tableName) {
		this.tableName = tableName;
	}	
	

//	public ResultObject(){} // JAXB needs this
	
	
	public ResultObject( Database dbObj, 
			String tableName, int countOfTable, boolean countQualityOfTable,
			String allColumns[], int iDisplayLength, 
			int iDisplayStart, String sSearch, 
			ArrayList<String> aSearchColumnNames, ArrayList<String> aSearchColumnValues,
			ArrayList<Boolean> aCaseSensitiveSearchColumns,
			boolean weMustSort, String[] aSortCol, String[] aSortDir, int iEcho, boolean bCallForGoToFunction ){
		
		// set table name and count
		this.setTableName(tableName);			
		this.setTotalRecords(countOfTable);
		
		// set the echo/draw
		this.setEcho(iEcho);
	
		// get table content
		TableAndCountObject tableAndCount = dbObj.getTable( 
				tableName, countOfTable, allColumns, iDisplayLength, 
				iDisplayStart, sSearch, 
				aSearchColumnNames, aSearchColumnValues, aCaseSensitiveSearchColumns,
				weMustSort, aSortCol, aSortDir);
		
		// are the sorting columns indexed?
		this.setNeededIndexForSortColumns( tableAndCount.getNeededIndexForSortingColumns() );
		
		// set content and content count
		this.setTableContent( tableAndCount.getContent() );
		if (Constants.debug)
		{
			System.out.println("Table content:");
			for (ConcurrentHashMap<String, String> a : data)
			{
				System.out.println(a.entrySet());
			}
		}
		
		
		// when this function was called by the GoTo function, making use of PK, the call is about navigation and not about filtering
		// so the count must be the count of the whole table. 
		// But when we are filtering, of course we use partial counts (as filtering results is a subset of the table). 
		
		this.setTotalDisplayRecords(	bCallForGoToFunction ? countOfTable : tableAndCount.getPartialCount() );	
		this.setQueryCountIsExact(		bCallForGoToFunction ? countQualityOfTable : tableAndCount.queryCountIsExact() );
		this.setTotalCountIsExact( countQualityOfTable );
	}
	

}
