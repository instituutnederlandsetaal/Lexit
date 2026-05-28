package database;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import resources.Constants;
import resources.ResponseObject;
import tables.UniqueValuesObject;
import util.Util;


/*
 * This class is responsible for setting/getting information at COLUMNS level
 */
public class DatabaseColumns {
	
	private final Database db;	
	
	public DatabaseColumns(Database db) {
		
		this.db = db;		
	}
	
	
	
	/** Get the column names of a table
	 * 
	 * @param tableName
	 * @return array of column names
	 */
	public  String[] getColumnNames(String tableName){
		
		String[] columnNames;		
		String schema = db.getSchema(tableName);
		String tableNameOnly = Util.getTableNameOnly(tableName);
		
		// use caching
		// (if we have looked up the column names already, they are stored in a hash)
		String cachingKey = schema+tableNameOnly;
		if ( db.getCache().getTableNameToColumnNames().containsKey(cachingKey) ) {
			Util.debug(db.getContextObject(), "## Column names from cache");
			return db.getCache().getTableNameToColumnNames().get(cachingKey);
		}
		
		// this query works with materialized views as well
		
		String columnQuery = 
			"SELECT a.attname AS column_name "+
			"FROM pg_catalog.pg_attribute a "+
			"JOIN pg_catalog.pg_class c "+
			"  ON c.oid = a.attrelid " +
			"JOIN pg_catalog.pg_namespace n "+
			"  ON n.oid = c.relnamespace "+
			"WHERE c.relname = ? "+
			"  AND n.nspname = ? "+
			"  AND a.attnum > 0 "+
			"  AND NOT a.attisdropped "+ // exclude dropped columns
			"ORDER BY a.attnum;";
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		String[] args = new String[]{tableNameOnly, schema}; 
		
		try {
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, columnQuery, args).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"column_name"});
			
			// read names
			columnNames = new String[res.size()];
			for (int i=0; i<res.size(); i++) {
				String[] oneRecord = res.get(i);
				columnNames[i] = oneRecord[0];
			}			
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+columnQuery, args);
			throw new RuntimeException(error, e);
		}
		
		// store the column names for caching (speed improvement)
		db.getCache().setTableNameToColumnNames(cachingKey, columnNames);
		return columnNames;
	}
	
	
	/**
	 * Get the comments of columns 
	 * (which are set with: COMMENT ON COLUMN table.column IS '...')
	 * @param tableName
	 * @param columns
	 * @return
	 */
	public String[] getColumnsComments(String tableName, String[] columns){
		
		String schema = db.getSchema(tableName);
		String tableNameOnly = Util.getTableNameOnly(tableName);
		
		// this query still works in Postgres 17
		
		// see: http://stackoverflow.com/questions/15928118/how-to-get-column-attributes-query-from-table-name-using-postgresql
		// (modified version of answer from Erwin Brandstetter)
		String commentsQuery = "SELECT a.attname AS name, d.description AS comment "+
			"FROM   pg_attribute    a "+ 
			"LEFT   JOIN pg_index   p ON p.indrelid = a.attrelid AND a.attnum = ANY(p.indkey) "+
			"LEFT   JOIN pg_description d ON d.objoid  = a.attrelid AND d.objsubid = a.attnum "+
			"LEFT   JOIN pg_attrdef f ON f.adrelid = a.attrelid  AND f.adnum = a.attnum "+
			"WHERE  a.attnum > 0 "+
			"AND    NOT a.attisdropped "+ // exclude dropped columns
			"AND    a.attrelid = ?::regclass "+
			"ORDER  BY a.attnum; ";
		
		
		
		String[] columnComments = new String[columns.length];
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		String[] args = new String[]{ schema+"."+ Util.getSafeTableNameOnly(tableNameOnly) };
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, commentsQuery, args).getRows();				
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"name", "comment"});
		
			if (res.size()>0) {
				// read the comments assigned to each column
				for (int i = 0; i<columns.length; i++) {
					String columnName =    res.get(i)[0];
					String columnComment = res.get(i)[1];
					// get the index of the current column in the 'columns' array,
					// so as to be able to assign the comment to the same index
					int indexOfColumnInColumnsArr = Util.getIndexOf(columnName, columns);
					columnComments[indexOfColumnInColumnsArr] = columnComment;
				}
			}			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+commentsQuery, args);
			throw new RuntimeException(error, e);
		} 
		
		
		return columnComments;
		
	}
	
	
	/**
	 * Get the type of one particular column. 
	 * If the columnValue is null (normal mode), the type will be determined by the column data type in the database.
	 * If the columnValue is not null (special mode), the type will be determined by the value type.
	 * 
	 * @param tableName
	 * @param columnName
	 * @param columnValue (usually null)
	 * @return data type of the column, as specified in the database (when columnValue is null) or computed given the columnValue (when that is not null)
	 */
	public  String getTypeOfColumn(String tableName, String columnName, String columnValue){
		
		
		// special mode: compute type from value
		// ------------
		// value is of array type (which is not necessarily the same as the column type), 
		// so make sure its type is returned as an array type
		if (columnValue != null && columnValue.matches("!?\\{.*") && columnValue.endsWith("}")
				&& !Util.isJsonObject(columnValue)) {
			
			// get the datatype of the column from the database
			String typeOfCol = getTypeOfColumn(tableName, columnName, null);
			
			// make sure we now return an array type  
			return typeOfCol + (typeOfCol.endsWith("[]") ? "":"[]");
			
		}
		
		// value is a range
		if (columnValue != null && columnValue.startsWith("range[") && columnValue.endsWith("]")) {
			
			// get the datatype of the column from the database
			String typeOfCol = getTypeOfColumn(tableName, columnName, null);
				
		   if (typeOfCol.equals("date") ) {
			   return "daterange";
		   }
		   if (typeOfCol.equals("timestamp without time zone") ) {
			   return "tsrange";
		   }
		   if (typeOfCol.equals("timestamp with time zone") ) {
			   return "tstzrange";
		   }
		   if (Util.isBigWholeNumberType(typeOfCol)) {
			   return "int8range";
		   }
		   if (Util.isWholeNumberType(typeOfCol)) {
			   return "int4range";
		   }
		   if (Util.isRealNumberType(typeOfCol)) {
			   return "numrange";
		   }
		}
		
		
		
		
		// normal mode: get the column type from the database
		// -----------
		
		String type = "";
		String schema = db.getSchema(tableName);
		String tableNameOnly = Util.getTableNameOnly(tableName);
		
		// use caching
		// (if we have looked up the column type already, it is stored in a hash)
		String cachingKey = schema+tableNameOnly+columnName;
		
		if ( db.getCache().getTableAndColumnNameToTypes().containsKey(cachingKey) ) {
			Util.debug(db.getContextObject(), "## Column type from cache: "+columnName+" = "+ db.getCache().getTableAndColumnNameToTypes().get(cachingKey));
			return db.getCache().getTableAndColumnNameToTypes().get(cachingKey);
		}
		
		
		// this query works for both tables and materialized views
		
		String typeQuery = 
				"SELECT "+
				"  CASE "+
				"    WHEN t.typtype = 'e' THEN 'USER-DEFINED' "+ // enum
				"    WHEN tn.nspname NOT IN ('pg_catalog', 'information_schema') THEN 'USER-DEFINED' "+
				"    ELSE pg_catalog.format_type(a.atttypid, a.atttypmod) "+
				"  END AS type "+
				"FROM pg_catalog.pg_attribute a "+
				"JOIN pg_catalog.pg_class c "+
				"  ON c.oid = a.attrelid "+
				"JOIN pg_catalog.pg_namespace n "+
				"  ON n.oid = c.relnamespace "+
				"JOIN pg_catalog.pg_type t "+
				"  ON t.oid = a.atttypid "+
				"JOIN pg_catalog.pg_namespace tn "+
				"  ON tn.oid = t.typnamespace "+
				"WHERE c.relname = ? "+ // table
				"  AND a.attname = ? "+ // column
				"  AND n.nspname = ? "+	// schema	
				"  AND a.attnum > 0 "+
				"  AND NOT a.attisdropped;"; // exclude dropped columns
			
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		String[] args = new String[]{tableNameOnly, columnName, schema};
				
		try {
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, typeQuery, args).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"type"});		
			
			if (res.size()>0) {
				type = res.get(0)[0];
				
				// put list in cache 
				// (so we won't need to ask the database again)
				db.getCache().setTableAndColumnNameToType(cachingKey, type);
			}
			else {
				type = "unknown";
			}
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+typeQuery, args);
			throw new RuntimeException(error, e);
		} 
		
	
		return type;
	}
	
	
	
	/**
	 * Get the types of all columns
	 * 
	 * @param tableName
	 * @param array of columns
	 * @return array of types
	 */
	public  String[] getTypesOfColumns(String tableName, String[] columns){
		
		// this query works for materialized views as well
		
		String typeQuery = 
				"SELECT "+
				"  CASE "+
				"    WHEN t.typtype = 'e' THEN 'USER-DEFINED' "+ // enum
				"    WHEN tn.nspname NOT IN ('pg_catalog', 'information_schema') THEN 'USER-DEFINED' "+
				"    ELSE pg_catalog.format_type(a.atttypid, a.atttypmod) "+
				"  END AS type "+
				"FROM pg_catalog.pg_attribute a "+
				"JOIN pg_catalog.pg_class c "+
				"  ON c.oid = a.attrelid "+
				"JOIN pg_catalog.pg_namespace n "+
				"  ON n.oid = c.relnamespace "+
				"JOIN pg_catalog.pg_type t "+
				"  ON t.oid = a.atttypid "+
				"JOIN pg_catalog.pg_namespace tn "+
				"  ON tn.oid = t.typnamespace "+
				"WHERE c.relname = ? "+ // table
				"  AND a.attname = ? "+ // column
				"  AND n.nspname = ? "+	// schema	
				"  AND a.attnum > 0 "+
				"  AND NOT a.attisdropped;"; // exclude dropped columns
		
		String schema = db.getSchema(tableName);
		String tableNameOnly = Util.getTableNameOnly(tableName);
		
		String[] columnTypes = new String[columns.length];
			
			
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			for (int i = 0; i<columns.length; i++) {
				
				// remove quote from names, in case the "safe" quote name was saved
				columns[i] = Util.removeQuotesFromSqlReservedWord(columns[i]);				
								
				// use caching				
				// (if we have looked up the column type already, it is stored in a hash)
				String cachingKey = schema+tableNameOnly+columns[i];
				
				if ( db.getCache().getTableAndColumnNameToTypes().containsKey(cachingKey) ) {
					Util.debug(db.getContextObject(), "## Column type from cache: "+columns[i]+" = "+ db.getCache().getTableAndColumnNameToTypes().get(cachingKey));
					columnTypes[i] = db.getCache().getTableAndColumnNameToTypes().get(cachingKey);
				}
				// if cache is empty, ask the database 
				// (and put result in cache for later call)
				else {
					String[] args = new String[]{tableNameOnly, columns[i], schema};		
					
					
					List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, typeQuery, args).getRows();				
					ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"type"});						
					
					columnTypes[i] = (res.size()>0) ? res.get(0)[0] : "unknown";
														
					// put column type in cache
					// (so we won't need to ask the database again)
					db.getCache().setTableAndColumnNameToType(cachingKey, columnTypes[i]);					
				}					
			}
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+typeQuery, Util.concatArr(columns, new String[] {tableNameOnly, schema}) );
			throw new RuntimeException(error, e);
		} 
		
		
		
		return columnTypes;
	}
	
	
	
	/**
	 * Update one column in a record in a table
	 * @param tableName
	 * @param rowId
	 * @param columnName
	 * @param valueToUpdate
	 */
	public  void updateOneColumnValue(
			String tableName, String rowId, String columnName, 
			String valueToUpdate,
			ResponseObject dro){
		
		String schema = db.getSchema(tableName);
		String idColumn = db.getPrimaryKeyColumn(tableName);
		
		// set arguments
		String[] args = new String[]{valueToUpdate, rowId};		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		ato.setType(0, db.getTypeOfColumn(tableName, columnName, null));
		ato.setType(1, db.getTypeOfColumn(tableName, idColumn, null));
		
		
		String updateRecords = 
			"UPDATE " + Util.getSafeTableName(tableName, schema) + " " + 
			"SET "+ Util.getSafeFieldName(columnName) +" = ? " +
			"WHERE "+ Util.getSafeFieldName(idColumn) +" = ? ;";	
		
				
		PostgresConnectionManager dc = db.getPostgresConnectionManager();			
		
		try {
			dc.sendPreparedUpdate(schema, updateRecords, args, ato, dro);
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+updateRecords+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), args);			
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		}
	}
	
	
	/**
	 * Get all unique values stored in a given column
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public UniqueValuesObject getUniqueValues(String tableName, String columnName) {
		
		String schema = db.getSchema(tableName);

	    // Quickest lookup (most of the time!), when a table contains a small number of unique values
		// (which is exactly what we expect when calling this function)
		// see: http://zogovic.com/post/44856908222/optimizing-postgresql-query-for-distinct-values
	    String query = "WITH RECURSIVE t(n) AS ("+
	    	    "  SELECT MIN(" + Util.getSafeFieldName(columnName) + ") "+
	    	    "  FROM " + Util.getSafeTableName(tableName, schema) + " "+
	    	    "  UNION "+
	    	    "  SELECT (SELECT " + Util.getSafeFieldName(columnName) + " " +
	    	    "          FROM " + Util.getSafeTableName(tableName, schema)+" " +
	    	    "          WHERE "+ Util.getSafeFieldName(columnName) +" > n " +
	    	    "          ORDER BY "+ Util.getSafeFieldName(columnName) +" LIMIT 1) "+
	    	    "  FROM t WHERE n IS NOT NULL "+
	    	    ") "+
	    	    "SELECT n FROM t WHERE n IS NOT NULL;";
	    
	    
	    

	    UniqueValuesObject uvo = new UniqueValuesObject();
	    ArrayList<String[]> res;
	    
	    
	    PostgresConnectionManager dc = db.getPostgresConnectionManager();
	    
	    try {
	    	
	    	// in some rare cases, the query hereabove will be slow
	    	List<Map<String, Object>> rs = dc.sendQuery(schema, query, db.maxAllowedDuration).getRows();

	    	res = Util.getResultSetCopyInAList(rs, new String[] { "n" });
	    	if (res.size() > 0) {
		        for (String[] oneRecord : res) {
		          String oneValue = oneRecord[0].trim();
		          if (oneValue != null)
		            uvo.addValue(oneValue);
		        }
	    	}
	    }
	    catch (Exception e) {   
	    	
	    	// we might get a time out...
	    	// try the old style query, which is mostly slow, but in some rare cases it is the fastest...
	    	
	    	uvo = db.getUniqueValues_oldStyle(tableName, columnName, null, null);
	      
	    }

	    return uvo;
	  }
	
	
	// see getUniqueValues
	public UniqueValuesObject getUniqueValues_oldStyle(String tableName, String columnName, String columnValueFilter, String limit) {
		
		String schema = db.getSchema(tableName);		
		if (columnValueFilter == null) columnValueFilter = "";
	
		// GROUP BY can be faster than DISTINCT
	    // see: http://stackoverflow.com/questions/6598778/solution-for-speeding-up-a-slow-select-distinct-query-in-postgres
	    
    	String query = "SELECT " + Util.getSafeFieldName(columnName) + " AS n " + 
    			"FROM " + Util.getSafeTableName(tableName, schema) + " " + 
    			"WHERE " + Util.getSafeFieldName(columnName)+" IS NOT NULL " +
    			(
    			columnValueFilter.isEmpty() ? "" : 
    			"AND "+ Util.getSafeFieldName(columnName)+" "+ db.getSuitableOperatorAndArg(tableName, columnName, columnValueFilter, false)+" "
    			) +
    			"GROUP BY " + Util.getSafeFieldName(columnName) + " " +
    			"ORDER BY " + Util.getSafeFieldName(columnName) + ";";
    	
    	if (limit != null) {
    		query = "SELECT n " +
    				"FROM (" +
    				"	SELECT " + Util.getSafeFieldName(columnName) + " AS n " + 
        			"	FROM " + Util.getSafeTableName(tableName, schema) + " " + 
        			"	WHERE " + Util.getSafeFieldName(columnName)+" IS NOT NULL " +
        			(
        				columnValueFilter.isEmpty() ? "" : 
        				"AND "+ Util.getSafeFieldName(columnName)+" "+ db.getSuitableOperatorAndArg(tableName, columnName, columnValueFilter, false)+" "
        			) +
        			"	GROUP BY " + Util.getSafeFieldName(columnName) + " " +
        			"	ORDER BY count(*) DESC " +
        			"	LIMIT " + limit + ") x " +
        			"ORDER BY n;";
    	}
    	    	
    	

	    UniqueValuesObject uvo = new UniqueValuesObject();
	    ArrayList<String[]> res;
	    
	    PostgresConnectionManager dc = db.getPostgresConnectionManager();
	    
    	try {
    		List<Map<String, Object>> rs = columnValueFilter.isEmpty() ?
    				dc.sendQuery(schema, query, 0).getRows()
	  	    		  :
	  	    		dc.sendPreparedQuery(schema, query, new String[]{columnValueFilter}).getRows();
	
    		res = Util.getResultSetCopyInAList(rs, new String[] { "n" });
    		if (res.size() > 0) {
        		for (String[] oneRecord : res) {
            		String oneValue = oneRecord[0].trim();
            		if (oneValue != null)
                		uvo.addValue(oneValue);
            	}
        	}
  	    }
    	catch (Exception e) {
    		String error = Util.getDebugInfoForConsole("Error while executing query " + query, new String[] {columnValueFilter});
    		throw new RuntimeException(error, e);
    	}
    	
    	return uvo;
    	
	}
	
	
	// see getUniqueValues
	public UniqueValuesObject getUniqueValuesWithFreqs(String tableName, String columnName, String columnValueFilter, String otherFiltersAndValues, String limit, boolean sortByFreq) {
		
		String schema = db.getSchema(tableName);		
		if (columnValueFilter == null) 
			columnValueFilter = "";
		else
			columnValueFilter = Util.setRightSearchValue(columnValueFilter);
		
		
		// prepare the column filters part
		
		ArrayList<String> columnsValues = new ArrayList<String>();
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		// first: the possible regex filter on the 'get-unique-values-column' (t.i. the value entered in the filter box in the Query Builder)
		
		String columnsFilters = "";
		if ( !columnValueFilter.isEmpty() ) {
			
			columnsFilters = "AND "+ Util.getSafeFieldName(columnName) +" "+ db.getSuitableOperatorAndArg(tableName, columnName, columnValueFilter, false)+" ";
			columnsValues.add(columnValueFilter);
			ato.setType(columnsValues.size()-1, "text");
		}
			
		
		// second: the other columns filters (search boxes of table, still expected to operate)
		
		String[] aOtherFiltersAndValues = otherFiltersAndValues.split(Constants.ARG_INTERNAL_SEPARATOR);
		for (int i=0; i<aOtherFiltersAndValues.length; i++) {
			
			String[] columnNameAndValuePair = aOtherFiltersAndValues[i].split("###");
			if (columnNameAndValuePair.length != 2) continue;
			String oneColumnName = columnNameAndValuePair[0];
			String oneColumnValue = Util.setRightSearchValue(columnNameAndValuePair[1]);
			
			// check if current column can be searched given a search string
			if ( !Util.valueIsSuitableForColumnType(oneColumnValue, db.getTypeOfColumn(tableName, oneColumnName, null)) ) {
				columnsFilters += (					
						"AND " +
								"CAST(" + Util.getSafeFieldName(oneColumnName) +" AS text) "+ db.getSuitableOperatorAndArg(tableName, null, oneColumnValue, false)+" "
						);		
				columnsValues.add( Util.removeFrontOperator(oneColumnValue) );
				ato.setType(columnsValues.size()-1, "text");
			}
			else
			{
				columnsFilters += (					
						"AND " +
								Util.getSafeFieldName(oneColumnName)+" "+ db.getSuitableOperatorAndArg(tableName, oneColumnName, oneColumnValue, false)+" "
						);		
				columnsValues.add( Util.removeFrontOperator(oneColumnValue) );
				ato.setType(columnsValues.size()-1, db.getTypeOfColumn(tableName, oneColumnName, null));
			}	
			
		}
	
		// GROUP BY can be faster than DISTINCT
	    // see: http://stackoverflow.com/questions/6598778/solution-for-speeding-up-a-slow-select-distinct-query-in-postgres
	    
    	String query = "SELECT " + Util.getSafeFieldName(columnName) + " AS n, count(*) AS cnt " + 
    			"FROM " + Util.getSafeTableName(tableName, schema) + " " + 
    			"WHERE " + Util.getSafeFieldName(columnName)+" IS NOT NULL " +
    			"	" + columnsFilters +
    			"GROUP BY " + Util.getSafeFieldName(columnName) + " " +
    			"ORDER BY " + ( sortByFreq ? "count(*) DESC" : Util.getSafeFieldName(columnName)) + ";";
    	
    	if (limit != null) {
    		// This takes the MOST frequent values,
    		// limit the result set to the specified limit,
    		// and (as a final step) sort that as required.
    		//
    		// Advantage to it, is that one sees the mode common values
    		// but it might be confusing, sine less frequent values are filtered out
    		// while the use might expect those in the result...
    		
//	    		query = "SELECT n, cnt " +
//	    				"FROM (" +
//	    				"	SELECT " + getSafeFieldName(columnName) + " AS n, count(*) AS cnt " + 
//	        			"	FROM " + getSafeTableName(tableName, schema) + " " + 
//	        			"	WHERE " + getSafeFieldName(columnName)+" IS NOT NULL " +
//	        			"	" + columnsFilters +
//	        			"	GROUP BY " + getSafeFieldName(columnName) + " " +
//	        			"	ORDER BY count(*) DESC " +
//	        			"	LIMIT " + limit + ") x " +
//	        			"ORDER BY "+ (sortByFreq ? "cnt DESC": "n") +";";
    		
    		// This query applies the limit after sorting, not before!
    		
    		query = "SELECT " + Util.getSafeFieldName(columnName) + " AS n, count(*) AS cnt " + 
        			"FROM " + Util.getSafeTableName(tableName, schema) + " " + 
        			"WHERE " + Util.getSafeFieldName(columnName)+" IS NOT NULL " +
        			"	" + columnsFilters +
        			"GROUP BY " + Util.getSafeFieldName(columnName) + " " +
        			"ORDER BY "+ (sortByFreq ? "cnt DESC": "n") + " " +
        			"LIMIT " + limit + ";";
    	}    	  
    	

	    UniqueValuesObject uvo = new UniqueValuesObject();
	    ArrayList<String[]> res;
	    
	    
	    PostgresConnectionManager dc = db.getPostgresConnectionManager();
	    
    	try {
    		List<Map<String, Object>> rs = columnsValues.size() == 0 ? 
  	    		dc.sendQuery(schema, query, 0).getRows()
  	    		  :
  	    		dc.sendPreparedQuery(schema, query, columnsValues.toArray(new String[columnsValues.size()]), ato, 0).getRows();

  	      	res = Util.getResultSetCopyInAList(rs, new String[] { "n", "cnt" });
  	      	if (res.size() > 0) {
  	      		for (String[] oneRecord : res) {
  	      			String oneValue = oneRecord[0].trim() +" ("+ oneRecord[1].trim() +")";
  	      			if (oneValue != null)
  	      				uvo.addValue(oneValue);
  	      		}
  	      	}
  	    }
    	catch (Exception e) {
    		String error = Util.getDebugInfoForConsole("Error while executing query " + query, columnsValues.toArray(new String[columnsValues.size()]));
    		throw new RuntimeException(error, e);
    	}
    	
    	return uvo;
    	
	}
	
	
	/**
	 * Check whether some index (even multi-column one) exists or not
	 * 
	 * @param tableName
	 * @param indexedFields (an array of column names, which are used as sorting column in the very same query)
	 * @return
	 */
	public Boolean checkIfIndexExists(String tableName, String[] indexedFields){
		
		// empty fields list makes no sense: we don't lack any index then!
		if (indexedFields.length == 0)
			return true;
		
		// are we dealing with a view or a table here?				
		// because views don't have indexes, so it's no use to check indexes!
		ArrayList<String> listOfTrueTables = db.getTrueTablesList();
		boolean currentTableIsaView = !(listOfTrueTables.contains(Util.getTableNameOnly(tableName)));
		if (currentTableIsaView)
			return true;
		
		boolean indexExists = false;		
		String schema = db.getSchema(tableName);
		ArrayList<String[]> res;
		
		// get sorted list of indexedFields
		// (so we can compare this list with a sorted list from the database indexes)
		String[] sortedArray = Util.cloneArr(indexedFields);
		Arrays.sort(sortedArray);
		String delimiter = ",";
		String indexedFieldsStr = Util.join(sortedArray, delimiter);
		
		// already checked?
		String key = tableName+schema+indexedFieldsStr;
		if ( db.getCache().getTableAndColumnNameToIndex().containsKey(key) )
			return true;
		
		// set arguments
		String[] args = new String[]{schema, tableName, indexedFieldsStr};	
		
		
		// This query is Postgres 17 compatible
		
		String checkExistenceQuery = 
			"SELECT 1 AS result "+
			"FROM " +
			"	( "+
			"	SELECT " +
			"	t.relname AS table_name, " +
			"	i.relname as index_name, " +
			"	array_to_string(ARRAY(SELECT unnest( array_agg(a.attname) ) ORDER BY 1), '"+delimiter+"') AS column_names " +
			"	FROM " +
			"	pg_class t, pg_class i, pg_index ix, pg_attribute a, pg_namespace n " +
			"	WHERE " +
			"	t.oid = ix.indrelid " +
			"	and n.oid = i.relnamespace " +
			"	and i.oid = ix.indexrelid " +
			"	and a.attrelid = t.oid " +
			"	and a.attnum = ANY(ix.indkey) " +
			"	and t.relkind = 'r' " +
			"	and n.nspname = ? " + 			// schema
			"	and t.relname = ? " + 			// table
			"	group by t.relname, i.relname " +
			"	order by t.relname, i.relname) x " +
			"WHERE column_names = ?; "; 		// sorted, comma separated column names, concatenated hereabove
				
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, checkExistenceQuery, args).getRows();
			
			res = Util.getResultSetCopyInAList(rs, new String[]{"result"});
			
			indexExists = (res.size()>0);
			
			if (indexExists) {
				db.getCache().setTableAndColumnNameToIndex(key, true);
			}
			
			return indexExists;
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+checkExistenceQuery, args);
			throw new RuntimeException(error, e);
		}
		
		
	}


}
