package resources;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * TableData object contain metadata about a requested table
 * It consists of a list of ColumnData objects, which contain
 * the table column names, types, allowed values in case a column has a user-defined type in Postgres,
 * and comments on columns (see explanation in ColumnData class)
 * 
 * @author Fannee
 *
 */
@XmlRootElement(name="root")
public class TableData {
	
	@XmlElement(name="column")
	ArrayList<ColumnData> columnNames = new ArrayList<ColumnData>();
	public ArrayList<ColumnData> getColumnNames(){return this.columnNames;}
	public void setColumnNamesAndTypes(
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
	
	public TableData(){}
	
}
