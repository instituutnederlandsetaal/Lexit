package util;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * A utility class to create a snapshot of a ResultSet.
 * This is needed because ResultSet objects get removed as soon as the connection is closed,
 * whereas we want to keep the data for later use, so that is copied into a ResultSetSnapshot.
 */
public class ResultSetSnapshot {
	
	// data containers
	
	public final List<ColumnMeta> metadata;			// list of columns, their types, etc.
	public final List<String> columns;				// list of columns only
    public final List<Map<String, Object>> rows; 	// associating column names to column values
	
    public static class ColumnMeta {
        public final String name;
        public final int type;
        public final String typeName;
        public final boolean isNullable;

        public ColumnMeta(String name, int type, String typeName, boolean isNullable) {
            this.name = name;
            this.type = type;
            this.typeName = typeName;
            this.isNullable = isNullable;
        }
    }

    
    /**
     * Constructor
     * 
     * @param metadata
     * @param rows
     */
    public ResultSetSnapshot(List<ColumnMeta> metadata, List<String> columns, List<Map<String, Object>> rows) {
        this.metadata = metadata;
        this.columns = columns;
        this.rows = rows;
    }

    
    /**
     * Make a copy of a ResultSet in a ResultSetSnapshot.
     * 
     * @param rs
     * @return ResultSetSnapshot
     * @throws SQLException
     */
    public static ResultSetSnapshot copy(ResultSet rs) throws SQLException {
    	
    	// get the resultset metadata (column names / types / etc.)
    	
        ResultSetMetaData meta = rs.getMetaData();
        int columnCount = meta.getColumnCount();
        List<String> columns = new ArrayList<String>();

        List<ColumnMeta> metadata = new ArrayList<>();
        for (int i = 1; i <= columnCount; i++) {
        	
        	// build a list of full metadata 
        	
            metadata.add(new ColumnMeta(
                meta.getColumnLabel(i),
                meta.getColumnType(i),
                meta.getColumnTypeName(i),
                meta.isNullable(i) == ResultSetMetaData.columnNullable
            ));
            
            // build a list of column names separately
            
            columns.add(meta.getColumnLabel(i));
        }

        // get the data as a list
        
        List<Map<String, Object>> rows = new ArrayList<>();
        while (rs.next()) {
            Map<String, Object> row = new LinkedHashMap<>();
            for (int i = 1; i <= columnCount; i++) {
                row.put(meta.getColumnLabel(i), rs.getObject(i));
            }
            rows.add(row);
        }

        return new ResultSetSnapshot(metadata, columns, rows);
    }
    
    
    // getters
    
    public List<Map<String, Object>> getRows(){
    	return this.rows;
    }
    
    public List<String> getColumnNames() {
    	return this.columns;
    }
    
    public List<ColumnMeta> getMetadata() {
    	return this.metadata;
    }

}