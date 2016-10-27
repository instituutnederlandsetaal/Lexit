package table;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

@XmlRootElement(name="results")
public class TableRecordObject {
	
	@XmlElementWrapper(name="columns")
	@XmlElement(name="oneColumn")
	public ArrayList<String[]> columnsAndValues = new ArrayList<String[]>();
	@XmlTransient
	public ArrayList<String[]> getColumnsAndValues(){
		return this.columnsAndValues;
		}
	public void setColumnsAndValues(ArrayList<String[]> colsAndVals){
		this.columnsAndValues = colsAndVals;
		}
	public void addColumnAndValue(String column, String value){
		this.columnsAndValues.add( new String[]{column, value} );
	}

}
