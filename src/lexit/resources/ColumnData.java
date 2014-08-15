package lexit.resources;

import javax.xml.bind.annotation.XmlElement;

/**
 * ColumnData Objects contain
 * data about a column of a table, such as column name, (data) type, 
 * allowed values in case a column has a user-defined type in Postgres,
 * and comments to this column (which can contain some configuration:
 * comments can actually be used to pass some column configuration in a quick and
 * dirty way, in case we wan't to avoid a update of the WAR-file, which normally
 * contains the table configuration in a javascript file)
 *   
 * @author Fannee
 *
 */
public class ColumnData {

	String columnName = "", columnType = "", columnTypeValues = "", columnComment = "";
	
	public ColumnData(){}
	
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
