package table;

import jakarta.xml.bind.annotation.XmlElement;

public class TableCellWithIdObject {
    @XmlElement(name="item")
    String[] columnIdNameAndValue;

    public TableCellWithIdObject(String id, String columnName, String value){
        this.columnIdNameAndValue = new String[]{id, columnName, value};
    }

    public TableCellWithIdObject(){}
}
