package lexit.table;

import java.util.ArrayList;
import java.util.HashMap;

public class TableAndCountObject {
	
	ArrayList<HashMap<String, String>> content = new ArrayList<HashMap<String, String>>();
	int count = 0;
	boolean exactCount = false;
	
	// get and set the number of records of a table
	public void setCount(int count){
		this.count = count;
	}
	public Integer getPartialCount(){
		return this.count;
	}
	
	// get and set the content of a table
	public void setContent(ArrayList<HashMap<String, String>> content){
		this.content = content;
	}
	public ArrayList<HashMap<String, String>> getContent(){
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
