package database;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import util.FileProcessor;
import util.Util;

/*
 * This class is responsible for setting/getting information at SCHEMA level
 */
public class DatabaseSchemas {
	
	private final Database db;	
	
	public DatabaseSchemas(Database db) {
		
		this.db = db;		
	}
	
	
	
	/**
	 * get info about the database, so an administrator could check in which db he is working from the GUI 
	 * (but of course, we will return no password!!!)
	 * @return
	 */
	public String[] getDatabaseInfo(){
		
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( db.getCache().getDatabaseAccessHash().size() == 0 )
			try {
				db.getCache().setDatabaseAccessHash( FileProcessor.readDatabasePropertiesFile(db.getContextObject()) );
			} catch (IOException e) {
				// TODO Auto-generated catch block
				throw new RuntimeException(e);
			}
		
		String database = db.getCache().getDatabaseAccessHash().get("db");
		String host = db.getCache().getDatabaseAccessHash().get("host");
		
		return new String[]{database, host};
				
	}
	
	
	/**
	 * Get the collation clause for a column, which is used in a query
	 * 
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public String getCollationClause(String tableName, String columnName) {
		
		// get the declared custom collation for this database
		// and if none is declared, return an empty string
		String declaredCustomCollation = db.getCustomCollation();
		if (declaredCustomCollation == null || declaredCustomCollation.isEmpty())
			return "";
		
		// we need to know the column type, since collation is only to be applied to textual columns
		String thisColType = db.getTypeOfColumn(tableName, columnName, null);
		boolean isTextualType = Util.isTextualType(thisColType);
		String customCollation = isTextualType ? declaredCustomCollation : null;
		
		// build the right collection clause now
		String thisCollation = (customCollation != null && !customCollation.isEmpty()) ? "COLLATE \"" + customCollation + "\"" : "";
		
		return thisCollation;
	}
	
	
	
	
	
	/**
	 * Get list of available tables and views
	 * 
	 * @param tableName
	 * @return ArrayList
	 */
	public  ArrayList<String[]> getTablesList(){

		String schema = db.getSchemaName();		

		// this query gives tables, views, and materialized views, and is Postgres 17 compatible
		String query = 
			"SELECT "+
			"    c.relname AS table_name, "+
			"    c.relname || ' (' || "+
			"    CASE c.relkind "+
			"        WHEN 'r' THEN 'BASE TABLE' "+
			"        WHEN 'v' THEN 'VIEW' "+
			"        WHEN 'm' THEN 'MATERIALIZED VIEW' "+
			"    END || ')' AS description, "+
			"    CASE c.relkind "+
			"    	WHEN 'r' THEN 'BASE TABLE' "+
			"    	WHEN 'v' THEN 'VIEW' "+
			"    	WHEN 'm' THEN 'MATERIALIZED VIEW' "+
			"    END AS type, "+
			"    d.description AS comment "+
			
			"    FROM pg_catalog.pg_class c "+
			"    JOIN pg_catalog.pg_namespace n "+
			"        ON n.oid = c.relnamespace "+
			"    LEFT JOIN pg_catalog.pg_description d "+
			"        ON d.objoid = c.oid AND d.objsubid = 0 "+
			"    WHERE n.nspname = ? "+
			"    AND c.relkind IN ('r', 'v', 'm') "+
			"    ORDER BY 1, 2; ";
		
		
		ArrayList<String[]> result = new ArrayList<String[]>();
		String[] args = new String[]{schema};
		
		// prepare max allowed cost initialization
		int queryCost = db.getQueryCost( Util.replaceQuestionMarksByArgsInQuery(query, args));
		long timeBefore = new Date().getTime();
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, query, args).getRows();
			
			// compute max allowed cost (initialization)
			long timeAfter = new Date().getTime();
			db.recomputeMaxAllowedCost(queryCost, timeBefore, timeAfter);
			
			// get list of tables
			result = Util.getResultSetCopyInAList(rs, new String[]{"table_name", "description", "comment", "type"});		
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+query, args);
			throw new RuntimeException(error, e);
		}
		
		
		return result;
	}
	
	
	
	
	/**
	 * Get list of available tables (NO views)
	 * 
	 * @return ArrayList
	 */
	public  ArrayList<String> getTrueTablesList(){

		String schema = db.getSchemaName();
		
		// this query is Postgres 17 compatible
		
		String query =
				"SELECT table_name " +
				"FROM information_schema.tables " + 
				"WHERE table_schema = ? " + 
				"AND table_type = 'BASE TABLE' " + // now we only want genuine tables (no views)
				"ORDER BY table_name ASC; ";		
		
		
		ArrayList<String[]> result = new ArrayList<String[]>();
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, query, new String[]{schema}).getRows();
			
			result = Util.getResultSetCopyInAList(rs, new String[]{"table_name"});		
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+query, new String[] {schema});
			throw new RuntimeException(error, e);
		}
		
		// return one-dimensional array of table names
		ArrayList<String> trueTablesList = new ArrayList<String>(); 
		for (String[] oneRecord : result){
			trueTablesList.add(oneRecord[0]);
		}
		
		return trueTablesList;
	}
	
	
	
	/**
	 * Get custom collation to use
	 * @throws IOException
	 */
	public String getCustomCollation(){
		
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( db.getCache().getDatabaseAccessHash().size() == 0 ) {
			try {
				db.getCache().setDatabaseAccessHash( FileProcessor.readDatabasePropertiesFile(db.getContextObject()) );
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		}		
		
		return db.getCache().getDatabaseAccessHash().get("collation");
	}
	
	
	
	/**
	 * Get schema to address
	 * @throws IOException
	 */
	public String getSchemaName(){
		
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( db.getCache().getDatabaseAccessHash().size() == 0 ) {
			try {
				db.getCache().setDatabaseAccessHash( FileProcessor.readDatabasePropertiesFile(db.getContextObject()) );
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		}		
		
		return db.getCache().getDatabaseAccessHash().get("schema");
	}
	
	// get the schema name, depending on table name input
	// if the table name contains a dot, the string before the dot must be the schema name
	// if the table name contains no dot, we request the schema name contained in the configuration file
	public String getSchema(String tableName){
					
		String[] parts = tableName.split("\\.");
		return parts.length>1 ? parts[0] : getSchemaName();
	}
	
	
	
	/**
	 * Set a new schema to work in, if needed.
	 * When this method has been called, next database calls
	 * will address this schema instead of the default one (t.i.
	 * the one which is set in the .database config file)
	 * @param newSchema
	 */
	public void setSchemaName(String newSchema){
		
		db.getCache().getDatabaseAccessHash().put("schema", newSchema);
	}
	
	
	/**
	 * Set the active tab ID in the ContextObject.
	 * Each time a connection is made with the database, this tab ID is send to the database (just like the username)
	 * so as to allow database operation to take it into account. 
	 * @param activeTabId
	 */
	public void setActiveTabId(String activeTabId) {
		
		// set the new active tab id in the ContextObject kept in this DatabaseObject and in the cached PostgresConnectionManager 
		db.getContextObject().setActiveTabId(activeTabId);
		db.getPostgresConnectionManager().getContextObject().setActiveTabId(activeTabId);
		
	}

}
