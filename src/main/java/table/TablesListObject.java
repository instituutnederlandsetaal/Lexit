package table;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

@XmlRootElement(name="root")
public class TablesListObject {
	
	@XmlElementWrapper(name="tables")
	@XmlElement(name="oneTable")
	public ArrayList<String[]> tablesAndDescriptions = new ArrayList<String[]>();
	@XmlTransient
	public ArrayList<String[]> getTablesAndDescriptions(){
		return this.tablesAndDescriptions;
		}
	public void setTablesAndDescriptions(ArrayList<String[]> tabAndDesc){
		this.tablesAndDescriptions = tabAndDesc;
		}
}
