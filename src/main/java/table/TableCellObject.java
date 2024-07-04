package table;

import jakarta.xml.bind.annotation.XmlElement;

public class TableCellObject {

    @XmlElement(name="item")
    String[] columnAndValue;

    public TableCellObject(String columnName, String value){
        this.columnAndValue = new String[]{columnName, value};
    }

    public TableCellObject(){}
}

