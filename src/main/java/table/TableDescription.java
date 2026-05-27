package table;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * The TableDescription object holds information about one single table:
 * - table name, 
 * - table description (name + type, displayed in Lex'it table menu), 
 * - table comment (to be accessed when clicking the table name in the table header), 
 * - table type (table, view or materialized view) 
 */

@XmlRootElement(name="oneTable")
public class TableDescription {

    // a no-argument constructor as required by JAXB
    public TableDescription() {
    }

    private String[] description =  new String[4];

    public TableDescription(String tableName, String tableDescription, String tableComment, String tableType){
        this.description[0] = tableName;
        this.description[1] = tableDescription;
        this.description[2] = tableComment;
        this.description[3] = tableType;
    }

    @XmlElement(name="item")
    public String[] getDescription(){
        return this.description;
    }
}
