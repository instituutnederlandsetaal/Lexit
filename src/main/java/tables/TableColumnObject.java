package tables;

import jakarta.xml.bind.annotation.XmlElement;

/**
 * The TableColumnObject is part of the TableMetadata object.
 * 
 * It holds info about a single column of a table, 
 * such as column name, (data) type, allowed values in case a column has a user-defined type,
 * and comments to this column
 *   
 * @author Fannee
 *
 */
public class TableColumnObject {

	String columnName = "", columnType = "", columnTypeValues = "", columnComment = "";
	
	public TableColumnObject(){}
	
	@XmlElement(name="column_name")
	public String getColumnName(){
		return this.columnName;
	}
	public void setColumnName(String name){
		this.columnName = name;
	}
	
	@XmlElement(name="column_type")
	public String getColumnType(){
		return this.columnType;
	}	
	public void setColumnType(String type){
		this.columnType = type;
	}
	
	@XmlElement(name="customtype_values")
	public String getCustomTypeValues(){
		return this.columnTypeValues;
	}	
	public void setCustomTypeValues(String values){
		this.columnTypeValues = values;
	}
	
	@XmlElement(name="column_comment")
	public String getCommentOnColumn(){
		return this.columnComment;
	}	
	public void setCommentOnColumn(String values){
		this.columnComment = values;
	}
}
