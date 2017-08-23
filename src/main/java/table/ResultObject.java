package table;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

/**
 * The ResultObject contains the result of a database query and some more,
 * that is: some table content, the number of results, the number of available records, etc.
 * 
 */

import resources.Constants;
import util.Database;

@XmlRootElement(name="results")
public class ResultObject {

	// draw (originally: echo), unique query identifier
	
	@XmlElement(name="draw")
	public int iEcho;
	@XmlTransient
	public int getEcho(){return this.iEcho;}
	public void setEcho(int echo){this.iEcho = echo;}
	
	
	// number of all records in database (all of them)
	
	@XmlElement(name="recordsTotal")
	public int iTotalRecords = 10000;
	@XmlTransient
	public int getTotalRecords(){return this.iTotalRecords;}
	public void setTotalRecords(int totalRecords){this.iTotalRecords = totalRecords;}
	
	
	// number of records in resultset
	
	@XmlElement(name="recordsFiltered")
	public int iTotalDisplayRecords = 10000;
	@XmlTransient
	public int getTotalDisplayRecords(){return this.iTotalDisplayRecords;}
	public void setTotalDisplayRecords(int totalDisplayRecords){this.iTotalDisplayRecords = totalDisplayRecords;}

	private String tableName = "";
	
	
	// resultset query count quality
	@XmlElement(name="bQueryCountIsExact")
	public boolean bQueryCountIsExact = false;
	@XmlTransient
	public boolean queryCountIsExact(){return this.bQueryCountIsExact;}
	public void setQueryCountIsExact(boolean exactCount){this.bQueryCountIsExact = exactCount;}
	
	// count quality for count of whole table (count of all records)
	@XmlElement(name="bTotalCountIsExact")
	public boolean bTotalCountIsExact = false;
	@XmlTransient
	public boolean totalCountIsExact(){return this.bTotalCountIsExact;}
	public void setTotalCountIsExact(boolean exactCount){this.bTotalCountIsExact = exactCount;}
	
	
	// index for columns sorted by is needed?
	@XmlElement(name="sNeededIndexForSortColumns")
	public String sNeededIndexForSortColumns = "";
	@XmlTransient
	public String getNeededIndexForSortColumns(){return this.sNeededIndexForSortColumns;}
	public void setNeededIndexForSortColumns(String neededIndex){this.sNeededIndexForSortColumns = neededIndex;}
	
	
	
	
	// table content
	
	@XmlElement(name="data")
	public ArrayList<ConcurrentHashMap<String, String>> tableContent = new ArrayList<ConcurrentHashMap<String, String>>();
	@XmlTransient
	public ArrayList<ConcurrentHashMap<String, String>> getTableContent() {
		return this.tableContent;
	}	
	public void setTableContent(ArrayList<ConcurrentHashMap<String, String>> table) {
		this.tableContent = table;
	}
	
	
	@XmlTransient
	public String getTableName() {
		return tableName;
	}
	public void setTableName(String tableName) {
		this.tableName = tableName;
	}	
	

	public ResultObject(){} // JAXB needs this
	
	
	public ResultObject( Database dbObj, 
			String tableName, String access, int countOfTable, boolean countQualityOfTable,
			String allColumns[], int iDisplayLength, 
			int iDisplayStart, String sSearch, 
			ArrayList<String> newColumnsArr, ArrayList<String> newColumnSearchArr,
			ArrayList<Boolean> newCaseSensitiveColumnSearchArr,
			boolean weMustSort, String[] aSortCol, String[] aSortDir, int iEcho ){
		
		// set table name and count
		this.setTableName(tableName);			
		this.setTotalRecords(countOfTable);
		
		// set the echo/draw
		this.setEcho(iEcho);
	
		// get table content
		TableAndCountObject tableAndCount = dbObj.getTable( 
				tableName, countOfTable, allColumns, iDisplayLength, 
				iDisplayStart, sSearch, 
				newColumnsArr, newColumnSearchArr, newCaseSensitiveColumnSearchArr,
				weMustSort, aSortCol, aSortDir);
		
		// are the sorting columns indexed?
		this.setNeededIndexForSortColumns( tableAndCount.getNeededIndexForSortingColumns() );
		
		// set content and content count
		this.setTableContent( tableAndCount.getContent() );
		if (Constants.debug)
		{
			System.out.println("Table content:");
			for (ConcurrentHashMap<String, String> a : tableContent)
			{
				System.out.println(a.entrySet());
			}
		}
		this.setTotalDisplayRecords( tableAndCount.getPartialCount() );	
		this.setQueryCountIsExact( tableAndCount.queryCountIsExact() );
		this.setTotalCountIsExact( countQualityOfTable );
	}
	

}
