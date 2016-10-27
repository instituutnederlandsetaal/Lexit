package table;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;


public class TableAndCountObject {
	
	ArrayList<ConcurrentHashMap<String, String>> content = new ArrayList<ConcurrentHashMap<String, String>>();
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
