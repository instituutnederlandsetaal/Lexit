package tables;

import jakarta.xml.bind.annotation.XmlElement;

/**
 * The TableCellObject is part of the TableRecordObject, 
 * and represents a single cell in a table row,
 */
public class TableCellObject {

    @XmlElement(name="item")
    String[] columnAndValue;

    public TableCellObject(String columnName, String value){
        this.columnAndValue = new String[]{columnName, value};
    }

    public TableCellObject(){}
}

