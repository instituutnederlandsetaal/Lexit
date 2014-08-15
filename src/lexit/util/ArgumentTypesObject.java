package lexit.util;

/**
 * This class is used to store the query argument types
 * since prepared statement require to declare the type of the arguments.
 * Each argument has an index, and given its index one can set/get its type. 
 */

import java.util.HashMap;

public class ArgumentTypesObject {
	
	
	public ArgumentTypesObject(){}
	
	HashMap<Integer, String> indexToType = new HashMap<Integer, String>();
	
	public void setType(int index, String type){
		this.indexToType.put(index, type);
	}
	public void addType(String type){
		int index = indexToType.size();
		this.indexToType.put(index, type);
	}
	public String getType(int index){
		return this.indexToType.get(index);
	}

}
