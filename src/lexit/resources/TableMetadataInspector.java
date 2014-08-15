package lexit.resources;




import lexit.util.Database;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * The TableInspector class requests table metadata
 * (that is: column names, type and allowed values when a type is a Postgres user-defined type) 
 * and returns those as XML or JSON
 * @author Fannee
 *
 */
public class TableMetadataInspector {
	
	Database dbObj;
	String tableName = "";
	String dbName = "";
	
	TableMetadataInspector(Database dbObj, String dbName, String tableName){
		this.tableName = tableName;
		this.dbName = dbName;
		this.dbObj = dbObj;
	}
	
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableData getColumnNames(){
		
		String[] namesOfColumns = dbObj.getColumnNames(this.dbName, this.tableName);
		String[] typesOfColumns = dbObj.getTypesOfColumns(this.dbName, this.tableName, namesOfColumns);
		String[] customtypesValues = dbObj.getCustomtypesAllowedValues(this.dbName, this.tableName, namesOfColumns, typesOfColumns);
		String[] commentsOnColumns = dbObj.getColumnsComments(this.dbName, this.tableName, namesOfColumns);
		
		TableData td = new TableData();
		td.setColumnNamesAndTypes(namesOfColumns, typesOfColumns, customtypesValues, commentsOnColumns);		
		return td;
	}	

}
