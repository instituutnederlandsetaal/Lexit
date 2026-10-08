package tables;

import java.util.ArrayList;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;
import database.Database;

/**
 * The TableMetadata object holds information about 
 * column names, comments, types and allowed values in case of user-defined types. 
 *
 */
@XmlRootElement(name="root")
public class TableMetadata {
	
	Database dbObj;
	String tableName = "";

	@XmlElementWrapper(name="columns")
	@XmlElement(name="column")
	ArrayList<TableColumnObject> columnNames = new ArrayList<>();

	TableMetadata(){}

	public TableMetadata(Database dbObj, String tableName){
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

			TableColumnObject cd = new TableColumnObject();
			cd.setColumnName(oneColumn);
			cd.setColumnType(oneColumnType);
			cd.setCustomTypeValues(oneCustomTypeSetOfValues);
			cd.setCommentOnColumn(oneCommentOnColumn);
			this.columnNames.add(cd);

		}
	}

}
