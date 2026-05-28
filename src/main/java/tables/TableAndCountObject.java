package tables;


import jakarta.json.bind.annotation.JsonbProperty;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The TableAndCountObject is a part of the ResultObject.
 * It holds data and counting information as a result of a query in the database.
 * 
 * The content of this object is used to build the final ResultObject, which is returned to the client.
 */

public class TableAndCountObject {
	@JsonbProperty("data")
	ArrayList<ConcurrentHashMap<String, String>> content = new ArrayList<ConcurrentHashMap<String, String>>();
	int count = 0;
	boolean exactCount = false;
	String neededIndexForSortingColumns = "";
	
	public void setNeededIndexForSortingColumns(String indexNeeded){
		this.neededIndexForSortingColumns = indexNeeded;
	}
	public String getNeededIndexForSortingColumns(){
		return this.neededIndexForSortingColumns;
	}
	
	// get and set the number of records of a table
	public void setCount(int count){
		this.count = count;
	}
	public Integer getPartialCount(){
		return this.count;
	}
	
	// get and set the content of a table

	public void setContent(ArrayList<ConcurrentHashMap<String, String>> content){
		this.content = content;
	}
	public ArrayList<ConcurrentHashMap<String, String>> getContent(){
		return this.content;
	}
	
	// get and set the count quality
	public void setCountIsExact(boolean exactCount) {
		this.exactCount = exactCount;
	}
	public Boolean queryCountIsExact(){
		return this.exactCount;
	}

}
