package tables;

import java.util.ArrayList;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

/**
 * The TableRecordsObject is a kind of ResultObject for a few records only 
 *   (while ResultObjects represent a huge set of records, such as the result of a query).
 *   
 * This object allows for storage of multiple table rows, 
 * as a list of three-membered arrays  [0:record-id, 1:column name, 2:value]
 */

@XmlRootElement(name="results")
public class TableRecordsObject {
	
	@XmlElementWrapper(name="columns")
	@XmlElement(name="oneColumn")
	public ArrayList<TableCellWithIdObject> idsColumnsAndValues = new ArrayList<>();
	@XmlTransient
	public ArrayList<TableCellWithIdObject> getIdsColumnsAndValues(){
		return this.idsColumnsAndValues;
		}
	public void setIdsColumnsAndValues(ArrayList<TableCellWithIdObject> colsAndVals){
		this.idsColumnsAndValues = colsAndVals;
		}
	public void addIdColumnAndValue(String id, String column, String value){
		TableCellWithIdObject tco = new TableCellWithIdObject(id, column, value);
		this.idsColumnsAndValues.add( tco );
	}

}