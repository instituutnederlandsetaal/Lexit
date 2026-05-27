package tables;

import jakarta.xml.bind.annotation.XmlElement;

/**
 * The TableCellWithIdObject is part of the TableRecordsObject, 
 * and allows for storage of a single table cell, with the record id, column name and value.
 */
public class TableCellWithIdObject {
    @XmlElement(name="item")
    String[] columnIdNameAndValue;

    public TableCellWithIdObject(String id, String columnName, String value){
        this.columnIdNameAndValue = new String[]{id, columnName, value};
    }

    public TableCellWithIdObject(){}
}
