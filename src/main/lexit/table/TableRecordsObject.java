package lexit.table;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

@XmlRootElement(name="results")
public class TableRecordsObject {
	
	@XmlElementWrapper(name="columns")
	@XmlElement(name="oneColumn")
	public ArrayList<String[]> idsColumnsAndValues = new ArrayList<String[]>();
	@XmlTransient
	public ArrayList<String[]> getIdsColumnsAndValues(){
		return this.idsColumnsAndValues;
		}
	public void setIdsColumnsAndValues(ArrayList<String[]> colsAndVals){
		this.idsColumnsAndValues = colsAndVals;
		}
	public void addIdColumnAndValue(String id, String column, String value){
		this.idsColumnsAndValues.add( new String[]{id, column, value} );
	}

}