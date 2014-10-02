package lexit.table;

/**
 * The ResultObject contains the result of a database query and some more,
 * that is: some table content, the number of results, the number of available records, etc.
 * 
 */

import lexit.resources.Constants;
import lexit.util.Database;

import java.util.ArrayList;
import java.util.HashMap;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

@XmlRootElement(name="results")
public class ResultObject {

	// sEcho, unique query identifier
	
	@XmlElement(name="sEcho")
	public String sEcho;
	@XmlTransient
	public String getEcho(){return this.sEcho;}
	public void setEcho(String echo){this.sEcho = echo;}
	
	
	// number of all records in database (all of them)
	
	@XmlElement(name="iTotalRecords")
	public String iTotalRecords = "10000";
	@XmlTransient
	public String getTotalRecords(){return this.iTotalRecords;}
	public void setTotalRecords(int totalRecords){this.iTotalRecords = totalRecords+"";}
	
	
	// number of records in resultset
	
	@XmlElement(name="iTotalDisplayRecords")
	public String iTotalDisplayRecords = "10000";
	@XmlTransient
	public String getTotalDisplayRecords(){return this.iTotalDisplayRecords;}
	public void setTotalDisplayRecords(int totalDisplayRecords){this.iTotalDisplayRecords = totalDisplayRecords+"";}

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
	
	// table content
	
	@XmlElementWrapper(name="aaData")
	public ArrayList<HashMap<String, String>> tableContent = new ArrayList<HashMap<String, String>>();
	@XmlTransient
	public ArrayList<HashMap<String, String>> getTableContent() {
		return this.tableContent;
	}	
	public void setTableContent(ArrayList<HashMap<String, String>> table) {
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
			String dbName, String tableName, String access, int countOfTable, boolean countQualityOfTable,
			String allColumns[], int iDisplayLength, 
			int iDisplayStart, String sSearch, 
			ArrayList<String> newColumnsArr, ArrayList<String> newColumnSearchArr,
			ArrayList<Boolean> newCaseSensitiveColumnSearchArr,
			boolean weMustSort, String[] aSortCol, String[] aSortDir ){
		
		// set table name and count
		this.setTableName(tableName);			
		this.setTotalRecords(countOfTable);
	
		// get table content
		TableAndCountObject tableAndCount = dbObj.getTable( dbName,
				tableName, countOfTable, allColumns, iDisplayLength, 
				iDisplayStart, sSearch, 
				newColumnsArr, newColumnSearchArr, newCaseSensitiveColumnSearchArr,
				weMustSort, aSortCol, aSortDir);
		
		// set content and content count
		this.setTableContent( tableAndCount.getContent() );
		if (Constants.debug)
		{
			for (HashMap<String, String> a : tableContent)
			{
				System.out.println(a.entrySet());
			}
		}
		this.setTotalDisplayRecords( tableAndCount.getPartialCount() );	
		this.setQueryCountIsExact( tableAndCount.queryCountIsExact() );
		this.setTotalCountIsExact( countQualityOfTable );
	}
	

}
