package database;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

public class DatabaseCache {
	
	public DatabaseCache() {}
	
	
	
	// database host, username and password of the current database (cached from the properties file)
	private ConcurrentHashMap<String, String> databaseAccessHash = new ConcurrentHashMap<String, String>();

	
	// Info about columns names types, etc. hashed for caching
	
	// table name + column name -> column type
	private ConcurrentHashMap<String, String> tableAndColumnNameToTypes = new ConcurrentHashMap<String, String>();
	
	// table name + column name -> custom types values (e.g., for enum)
	private ConcurrentHashMap<String, String> tableAndColumnNameToCustomTypesValues = new ConcurrentHashMap<String, String>();
	
	// function name -> array of types of the function parameters
	private ConcurrentHashMap<String, String[]> functionNameToTypes = new ConcurrentHashMap<String, String[]>();
	
	// function name -> return type of the function
	private ConcurrentHashMap<String, String> functionNameToReturnType = new ConcurrentHashMap<String, String>();
	
	// function name -> operation type of the function ('all', 'write', 'read')
	private ConcurrentHashMap<String, String> functionNameToOperationType = new ConcurrentHashMap<String, String>();
	
	// table name -> primary key column name
	private ConcurrentHashMap<String, String> tableNameToPrimaryKey = new ConcurrentHashMap<String, String>();
	
	// table name -> array of column names of the table
	private ConcurrentHashMap<String, String[]> tableNameToColumnNames = new ConcurrentHashMap<String, String[]>();
	
	// table name + column name -> whether there is an index on the column
	private ConcurrentHashMap<String, Boolean> tableAndColumnNameToIndex = new ConcurrentHashMap<String, Boolean>();
	
	// GO-TO query -> result set of the GO-TO query (as an array list of records)
	private ConcurrentHashMap<String, ArrayList<String[]>> gotoQueryToResultSet = new ConcurrentHashMap<String, ArrayList<String[]>>();

	
	
	// cache of total and partial counts
	
	// table name -> whether exact count is required
	private ConcurrentHashMap<String, Boolean> tableNameToRequiredExactCount = new ConcurrentHashMap<String, Boolean>();
	
	// table name -> total count of records in the table
	private ConcurrentHashMap<String, Integer> tableNameToTotalCount = new ConcurrentHashMap<String, Integer>();
	
	// table name -> whether the total count is exact (true) or estimated (false)
	private ConcurrentHashMap<String, Boolean> tableNameToTotalCountQuality = new ConcurrentHashMap<String, Boolean>();
	
	// query -> count of records that satisfy the query
	private ConcurrentHashMap<String, Integer> queryToCount = new ConcurrentHashMap<String, Integer>();
	
	// query -> whether the count is exact (true) or estimated (false)
	private ConcurrentHashMap<String, Boolean> queryToCountQuality = new ConcurrentHashMap<String, Boolean>();
	
	
	
	
	
	// getters and setters
	
	
	// getters/setters for table and column name to types
	public ConcurrentHashMap<String, String> getTableAndColumnNameToTypes() {
		return tableAndColumnNameToTypes;
	}

	public void setTableAndColumnNameToType(String tableAndColumnName, String type) {
		this.tableAndColumnNameToTypes.put(tableAndColumnName, type);
	}
	
	public void removeFromTableAndColumnNameToType(String tableAndColumnName) {
		this.tableAndColumnNameToTypes.remove(tableAndColumnName);
	}
	
	
	// getters/setters for table and column name to custom types values
	public ConcurrentHashMap<String, String> getTableAndColumnNameToCustomTypesValues() {
		return tableAndColumnNameToCustomTypesValues;
	}

	public void setTableAndColumnNameToCustomTypesValues(String tableAndColumnName, String customTypesValues) {
		this.tableAndColumnNameToCustomTypesValues.put(tableAndColumnName, customTypesValues);
	}
	
	public void removeFromTableAndColumnNameToCustomTypesValues(String tableAndColumnName) {
		this.tableAndColumnNameToCustomTypesValues.remove(tableAndColumnName);
	}

	
	// getters/setters for functions argument types
	public ConcurrentHashMap<String, String[]> getFunctionNameToArgTypes() {
		return functionNameToTypes;
	}

	public void setFunctionNameToArgTypes(String functionName, String[] types) {
		this.functionNameToTypes.put(functionName, types);
	}
	
	
	// getters/setters for functions return types
	public ConcurrentHashMap<String, String> getFunctionNameToReturnTypes() {
		return functionNameToReturnType;
	}

	public void setFunctionNameToReturnType(String functionName, String returnType) {
		this.functionNameToReturnType.put(functionName, returnType);
	}

	
	
	// getters/setters for function operation types (read, write, all)
	public ConcurrentHashMap<String, String> getFunctionNameToOperationTypes() {
		return functionNameToOperationType;
	}

	public void setFunctionNameToOperationType(String functionName, String operationType) {
		this.functionNameToOperationType.put(functionName, operationType);
	}

	
	// getters/setters for table primary key
	public ConcurrentHashMap<String, String> getTableNameToPrimaryKey() {
		return tableNameToPrimaryKey;
	}

	public void setTableNameToPrimaryKey(String tableName, String primaryKey) {
		this.tableNameToPrimaryKey.put(tableName, primaryKey);
	}
	
	public void removeFromTableNameToPrimaryKey(String tableName) {
		this.tableNameToPrimaryKey.remove(tableName);
	}

	
	// getters/setters for table column names
	public ConcurrentHashMap<String, String[]> getTableNameToColumnNames() {
		return tableNameToColumnNames;
	}

	public void setTableNameToColumnNames(String tableName, String[] columnNames) {
		this.tableNameToColumnNames.put(tableName, columnNames);
	}
	
	public void removeFromTableNameToColumnNames(String tableName) {
		this.tableNameToColumnNames.remove(tableName);
	}
	
	
	// getters/setters for indexes on table columns (found: true, not found: false)
	public ConcurrentHashMap<String, Boolean> getTableAndColumnNameToIndex() {
		return tableAndColumnNameToIndex;
	}

	public void setTableAndColumnNameToIndex(String indexName, boolean indexExists) {
		this.tableAndColumnNameToIndex.put(indexName, indexExists);
	}
	
	
	// getters/setters for row numbers as result of a go-to query 
	public ConcurrentHashMap<String, ArrayList<String[]>> getGotoQueryToResultSet() {
		return gotoQueryToResultSet;
	}

	public void setGotoQueryToResultSet(String getRowNumberQuery, ArrayList<String[]> results) {
		this.gotoQueryToResultSet.put(getRowNumberQuery, results);
	}
	
	
	
	// declare if we must be computing an exact count (default is false,
	// but this can be set to true by user temporarily if needed)
	public void setExactCountRequired(String tableName, boolean forceExactCount){
		this.tableNameToRequiredExactCount.put(tableName, forceExactCount);
	}
	public boolean getExactCountRequired(String tableName){
		return this.tableNameToRequiredExactCount.get(tableName);
	}

	
	// getters/setters for table total count
	public ConcurrentHashMap<String, Integer> getTableNameToTotalCount() {
		return tableNameToTotalCount;
	}

	public void setTableNameToTotalCount(String tableName, int count) {
		this.tableNameToTotalCount.put(tableName, count);
	}
	
	public void removeFromTableNameToTotalCount(String tableName) {
		this.tableNameToTotalCount.remove(tableName);
	}
	
	
	// getters/setters for table total count quality (exact:true or estimated:false)
	public ConcurrentHashMap<String, Boolean> getTableNameToTotalCountQuality() {
		return tableNameToTotalCountQuality;
	}

	public void setTableNameToTotalCountQuality(String tableName, boolean exactCount) {
		this.tableNameToTotalCountQuality.put(tableName, exactCount);
	}
	
	public void removeFromTableNameToTotalCountQuality(String tableName) {
		this.tableNameToTotalCountQuality.remove(tableName);
	}
	
	
	// getters/setters for count of records that satisfy a query
	public ConcurrentHashMap<String, Integer> getQueryToCount() {
		return queryToCount;
	}

	public void setQueryToCount(String query, int count) {
		this.queryToCount.put(query, count);
	}
	
	public void clearQueryToCount() {
		queryToCount = new ConcurrentHashMap<String, Integer>();
	}
	
	
	// getters/setters for quality of count of records that satisfy a query (exact:true or estimated:false)
	public ConcurrentHashMap<String, Boolean> getQueryToCountQuality() {
		return queryToCountQuality;
	}

	public void setQueryToCountQuality(String query, boolean countQuality) {
		this.queryToCountQuality.put(query, countQuality);
	}
	
	public void clearQueryToCountQuality() {
		queryToCountQuality = new ConcurrentHashMap<String, Boolean>();
	}
	
	
	// getters/setters for database access hash
	public ConcurrentHashMap<String, String> getDatabaseAccessHash() {
		return databaseAccessHash;
	}

	public void setDatabaseAccessHash(ConcurrentHashMap<String, String> databaseAccessHash) {
		this.databaseAccessHash = databaseAccessHash;
	}

}
