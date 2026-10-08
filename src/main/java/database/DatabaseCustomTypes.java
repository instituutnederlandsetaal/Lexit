package database;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import util.Util;

/*
 * This class is responsible for setting/getting CUSTOM DATATYPES
 */
public class DatabaseCustomTypes {
	
	private final Database db;	
	
	public DatabaseCustomTypes(Database db) {
		
		this.db = db;		
	}
	
	
	// get the name of a custom type, given the name of a column having this type
	public String getUserDefinedTypeName(String tableName, String columnName){
		
		String nameOfCustomType = "";
		String schema = db.getSchema(tableName);

		
		// compatible with materialized views
		String query = 
				"SELECT t.typname AS custom_type "+
				"FROM pg_catalog.pg_attribute a "+
				"JOIN pg_catalog.pg_class c "+
				"  ON c.oid = a.attrelid "+
				"JOIN pg_catalog.pg_namespace n "+
				"  ON n.oid = c.relnamespace "+
				"JOIN pg_catalog.pg_type t "+
				"  ON t.oid = a.atttypid "+
				"WHERE c.relname = ? "+
				"  AND a.attname = ? "+
				"  AND n.nspname = ? "+
				"  AND a.attnum > 0 "+
				"  AND NOT a.attisdropped;"; // exclude dropped columns
		
		String[] args = new String[]{tableName, columnName, schema};
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, query, args).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"custom_type"});
			
			// read values
			if (res.size()>0)
				nameOfCustomType = res.get(0)[0];
			
		} 
		catch (Exception e)  {
			String error = Util.getDebugInfoForConsole("Error while executing query "+query, args);
			throw new RuntimeException(error, e);
		}
		
		return nameOfCustomType;
	}
	
	
	// Get the values a user defined type is consisting of.
	// this returns a list of values in a pipe-separated string.
	// (see: http://stackoverflow.com/questions/9535937/is-there-a-way-to-show-a-user-defined-postgresql-enumerated-type-definition)
	public String getUserDefinedTypeValues(String tableName, String typeName){
		
		String values = "";
		String schema = db.getSchema(tableName);
		
		// this query is Postgres 17 compliant
		
		String query = "SELECT string_agg(e.enumlabel, '|') AS enum_labels "+
			"FROM   pg_catalog.pg_type t "+
			"JOIN   pg_catalog.pg_namespace n ON n.oid = t.typnamespace "+
			"JOIN   pg_catalog.pg_enum e ON t.oid = e.enumtypid "+
			"WHERE  t.typname = ? "+ // type name
			"AND	n.nspname = ? ;"; // schema name
		
		String[] args = new String[]{typeName, schema};
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, query, args).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"enum_labels"});
			
			// read values
			if (res.size()>0)
				values = res.get(0)[0];
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+query, args);
			throw new RuntimeException(error, e);
		}
		
		return values;
	}
	
	
	// get the allowed values of all custom type columns of a table at once!
	public String[] getCustomtypesAllowedValues(String tableName, String[] columnNames, String[] columnTypes){
		
		String schema = db.getSchema(tableName);
		String tableNameOnly = Util.getTableNameOnly(tableName);
		String[] customTypes = new String[columnNames.length];
		
		for (int i=0; i<columnNames.length; i++) {
			String customTypesOfThisColumn = "";
			String columnName = columnNames[i];
			
			// use caching (speed!)
			String cachingKey = schema+tableNameOnly+columnName;
			
			if (columnTypes[i].equalsIgnoreCase("USER-DEFINED")) {
				
				if (db.getCache().getTableAndColumnNameToCustomTypesValues().containsKey(cachingKey)) {
					customTypesOfThisColumn = db.getCache().getTableAndColumnNameToCustomTypesValues().get(cachingKey);
				}
				else {
					// get the name of the user-defined type
					String customtypeName = getUserDefinedTypeName(tableName, columnName);
					// get the allowed values defined in this user-defined type
					customTypesOfThisColumn = getUserDefinedTypeValues(tableName, customtypeName);
					// save value to cache for quick lookup later on
					db.getCache().setTableAndColumnNameToCustomTypesValues(cachingKey, customTypesOfThisColumn);
				}
				
			}
			customTypes[i] = customTypesOfThisColumn;			
		}
		return customTypes;
	}

}
