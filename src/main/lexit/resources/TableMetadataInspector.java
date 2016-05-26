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
	
	TableMetadataInspector(Database dbObj, String tableName){
		this.tableName = tableName;
		this.dbObj = dbObj;
	}
	
	@GET
	@Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
	public TableData getColumnNames(){
		
		String[] namesOfColumns = dbObj.getColumnNames(this.tableName);
		String[] typesOfColumns = dbObj.getTypesOfColumns(this.tableName, namesOfColumns);
		String[] customtypesValues = dbObj.getCustomtypesAllowedValues(this.tableName, namesOfColumns, typesOfColumns);
		String[] commentsOnColumns = dbObj.getColumnsComments(this.tableName, namesOfColumns);
		
		TableData td = new TableData();
		td.setColumnNamesAndTypes(namesOfColumns, typesOfColumns, customtypesValues, commentsOnColumns);		
		return td;
	}	

}
