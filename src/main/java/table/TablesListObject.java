package table;

import java.util.ArrayList;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="root")
public class TablesListObject {

	@XmlElementWrapper(name="tables")
	@XmlElement(name="oneTable")
	public final ArrayList<TableDescription> tablesAndDescriptions = new ArrayList<>();

	public void setTablesAndDescriptions(ArrayList<String[]> tabAndDesc){
		for (String[] oneTableDesc : tabAndDesc) {
			TableDescription td = new TableDescription(oneTableDesc[0], oneTableDesc[1], oneTableDesc[2], oneTableDesc[3]);
			this.tablesAndDescriptions.add(td);
		}
	}

}
