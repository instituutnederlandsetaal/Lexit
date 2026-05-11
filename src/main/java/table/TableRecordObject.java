package table;

import java.util.ArrayList;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

/**
 * The TableRecordObject allows for storage of ONE single table row, 
 * as a list of two-membered arrays  [0:column name, 1:value]
 */

@XmlRootElement(name="results")
public class TableRecordObject {
	
	@XmlElementWrapper(name="columns")
	@XmlElement(name="oneColumn")
	public ArrayList<TableCellObject> columnsAndValues = new ArrayList<>();
	@XmlTransient
	public ArrayList<TableCellObject> getColumnsAndValues(){
		return this.columnsAndValues;
		}
	public void setColumnsAndValues(ArrayList<TableCellObject> colsAndVals){
		this.columnsAndValues = colsAndVals;
		}
	public void addColumnAndValue(String column, String value){
		TableCellObject tco = new TableCellObject(column, value);
		this.columnsAndValues.add( tco );
	}

}
