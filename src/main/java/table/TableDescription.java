package table;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="oneTable")
public class TableDescription {

    // a no-argument constructor as required by JAXB
    public TableDescription() {
    }

    private String[] description =  new String[4];

    public TableDescription(String tableName, String tableComment, String tableOwner, String tableType){
        this.description[0] = tableName;
        this.description[1] = tableComment;
        this.description[2] = tableOwner;
        this.description[3] = tableType;
    }

    @XmlElement(name="item")
    public String[] getDescription(){
        return this.description;
    }
}
