package resources;




import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;
import util.Database;

import java.util.ArrayList;

/**
 * The TableInspector class requests table metadata
 * (that is: column names, type and allowed values when a type is a Postgres user-defined type) 
 * and returns those as XML or JSON
 * @author Fannee
 *
 */
@XmlRootElement(name="root")
public class TableMetadataInspector {
	
	Database dbObj;
	String tableName = "";

	@XmlElementWrapper(name="columns")
	@XmlElement(name="column")
	ArrayList<ColumnData> columnNames = new ArrayList<>();

	TableMetadataInspector(){}

	TableMetadataInspector(Database dbObj, String tableName){
		this.tableName = tableName;
		this.dbObj = dbObj;
	}

	public void setColumnNames(){
		
		String[] namesOfColumns = dbObj.getColumnNames(this.tableName);
		String[] typesOfColumns = dbObj.getTypesOfColumns(this.tableName, namesOfColumns);
		String[] customtypesValues = dbObj.getCustomtypesAllowedValues(this.tableName, namesOfColumns, typesOfColumns);
		String[] commentsOnColumns = dbObj.getColumnsComments(this.tableName, namesOfColumns);
		
		setColumnNamesAndTypes(namesOfColumns, typesOfColumns, customtypesValues, commentsOnColumns);

	}

	private void setColumnNamesAndTypes(
			String[] tableColumns,
			String[] tableColumnTypes,
			String[] tableCustomTypesValues,
			String[] commentsOnColumns){

		for (int i = 0; i < tableColumns.length; i++)
		{
			String oneColumn 				= tableColumns[i];
			String oneColumnType 			= tableColumnTypes[i];
			String oneCustomTypeSetOfValues	= tableCustomTypesValues[i];
			String oneCommentOnColumn		= commentsOnColumns[i];

			ColumnData cd = new ColumnData();
			cd.setColumnName(oneColumn);
			cd.setColumnType(oneColumnType);
			cd.setCustomTypeValues(oneCustomTypeSetOfValues);
			cd.setCommentOnColumn(oneCommentOnColumn);
			this.columnNames.add(cd);

		}
	}

}
