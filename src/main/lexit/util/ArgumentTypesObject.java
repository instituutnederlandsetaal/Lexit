package lexit.util;

import java.util.concurrent.ConcurrentHashMap;

/**
 * This class is used to store the query argument types
 * since prepared statement require to declare the type of the arguments.
 * Each argument has an index, and given its index one can set/get its type. 
 */



public class ArgumentTypesObject {
	
	
	public ArgumentTypesObject(){}
	
	ConcurrentHashMap<Integer, String> indexToType = new ConcurrentHashMap<Integer, String>();
	
	// index is 0-based
	public void setType(int index, String type){
		this.indexToType.put(index, type);
	}
	
	public void addType(String type){
		int index = indexToType.size();
		this.indexToType.put(index, type);
	}
	
	// index is 0-based
	public String getType(int index){
		return this.indexToType.get(index);
	}

}
