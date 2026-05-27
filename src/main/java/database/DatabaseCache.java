package database;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

public class DatabaseCache {
	
	public DatabaseCache() {}
	
	// columns names and types, etc. hashed for caching
	private ConcurrentHashMap<String, String> tableAndColumnNameToTypes = new ConcurrentHashMap<String, String>(); 
	private ConcurrentHashMap<String, String> tableAndColumnNameToCustomTypesValues = new ConcurrentHashMap<String, String>();
	private ConcurrentHashMap<String, String[]> functionNameToTypes = new ConcurrentHashMap<String, String[]>();
	private ConcurrentHashMap<String, String> functionNameToReturnType = new ConcurrentHashMap<String, String>();
	private ConcurrentHashMap<String, String> functionNameToOperationType = new ConcurrentHashMap<String, String>();
	private ConcurrentHashMap<String, String> tableNameToPrimaryKey = new ConcurrentHashMap<String, String>();
	private ConcurrentHashMap<String, String[]> tableNameToColumnNames = new ConcurrentHashMap<String, String[]>();
	private ConcurrentHashMap<String, Boolean> tableAndColumnNameToIndex = new ConcurrentHashMap<String, Boolean>();
	private ConcurrentHashMap<String, ArrayList<String[]>> gotoQueryToResultSet = new ConcurrentHashMap<String, ArrayList<String[]>>();

	// cache of total and partial counts
	private ConcurrentHashMap<String, Integer> tableNameToCount = new ConcurrentHashMap<String, Integer>();
	private ConcurrentHashMap<String, Boolean> tableNameToExactCount = new ConcurrentHashMap<String, Boolean>();
	private ConcurrentHashMap<String, Integer> queryToCount = new ConcurrentHashMap<String, Integer>();
	private ConcurrentHashMap<String, Boolean> queryToCountQuality = new ConcurrentHashMap<String, Boolean>();
	
	// ConcurrentHashMap in which database location, username and password are put
	private ConcurrentHashMap<String, String> databaseAccessHash = new ConcurrentHashMap<String, String>();
	
	
	
	
	// getters and setters
	
	public ConcurrentHashMap<String, String> getTableAndColumnNameToTypes() {
		return tableAndColumnNameToTypes;
	}

	public void setTableAndColumnNameToType(String tableAndColumnName, String type) {
		this.tableAndColumnNameToTypes.put(tableAndColumnName, type);
	}
	
	public void removeFromTableAndColumnNameToType(String tableAndColumnName) {
		this.tableAndColumnNameToTypes.remove(tableAndColumnName);
	}
	
	

	public ConcurrentHashMap<String, String> getTableAndColumnNameToCustomTypesValues() {
		return tableAndColumnNameToCustomTypesValues;
	}

	public void setTableAndColumnNameToCustomTypesValues(String tableAndColumnName, String customTypesValues) {
		this.tableAndColumnNameToCustomTypesValues.put(tableAndColumnName, customTypesValues);
	}
	
	public void removeFromTableAndColumnNameToCustomTypesValues(String tableAndColumnName) {
		this.tableAndColumnNameToCustomTypesValues.remove(tableAndColumnName);
	}

	
	
	public ConcurrentHashMap<String, String[]> getFunctionNameToTypes() {
		return functionNameToTypes;
	}

	public void setFunctionNameToTypes(String functionName, String[] types) {
		this.functionNameToTypes.put(functionName, types);
	}
	
	

	public ConcurrentHashMap<String, String> getFunctionNameToReturnTypes() {
		return functionNameToReturnType;
	}

	public void setFunctionNameToReturnType(String functionName, String returnType) {
		this.functionNameToReturnType.put(functionName, returnType);
	}

	
	
	
	public ConcurrentHashMap<String, String> getFunctionNameToOperationTypes() {
		return functionNameToOperationType;
	}

	public void setFunctionNameToOperationType(String functionName, String operationType) {
		this.functionNameToOperationType.put(functionName, operationType);
	}

	
	
	public ConcurrentHashMap<String, String> getTableNameToPrimaryKey() {
		return tableNameToPrimaryKey;
	}

	public void setTableNameToPrimaryKey(String tableName, String primaryKey) {
		this.tableNameToPrimaryKey.put(tableName, primaryKey);
	}
	
	public void removeFromTableNameToPrimaryKey(String tableName) {
		this.tableNameToPrimaryKey.remove(tableName);
	}

	
	
	public ConcurrentHashMap<String, String[]> getTableNameToColumnNames() {
		return tableNameToColumnNames;
	}

	public void setTableNameToColumnNames(String tableName, String[] columnNames) {
		this.tableNameToColumnNames.put(tableName, columnNames);
	}
	
	public void removeFromTableNameToColumnNames(String tableName) {
		this.tableNameToColumnNames.remove(tableName);
	}
	
	

	public ConcurrentHashMap<String, Boolean> getTableAndColumnNameToIndex() {
		return tableAndColumnNameToIndex;
	}

	public void setTableAndColumnNameToIndex(String indexName, boolean indexExists) {
		this.tableAndColumnNameToIndex.put(indexName, indexExists);
	}
	
	

	public ConcurrentHashMap<String, ArrayList<String[]>> getGotoQueryToResultSet() {
		return gotoQueryToResultSet;
	}

	public void setGotoQueryToResultSet(String getRowNumberQuery, ArrayList<String[]> results) {
		this.gotoQueryToResultSet.put(getRowNumberQuery, results);
	}

	
	
	public ConcurrentHashMap<String, Integer> getTableNameToCount() {
		return tableNameToCount;
	}

	public void setTableNameToCount(String tableName, int count) {
		this.tableNameToCount.put(tableName, count);
	}
	
	public void removeFromTableNameToCount(String tableName) {
		this.tableNameToCount.remove(tableName);
	}
	
	

	public ConcurrentHashMap<String, Boolean> getTableNameToExactCount() {
		return tableNameToExactCount;
	}

	public void setTableNameToExactCount(String tableName, boolean exactCount) {
		this.tableNameToExactCount.put(tableName, exactCount);
	}
	
	public void removeFromTableNameToExactCount(String tableName) {
		this.tableNameToExactCount.remove(tableName);
	}
	
	

	public ConcurrentHashMap<String, Integer> getQueryToCount() {
		return queryToCount;
	}

	public void setQueryToCount(String query, int count) {
		this.queryToCount.put(query, count);
	}
	
	public void clearQueryToCount() {
		queryToCount = new ConcurrentHashMap<String, Integer>();
	}
	
	

	public ConcurrentHashMap<String, Boolean> getQueryToCountQuality() {
		return queryToCountQuality;
	}

	public void setQueryToCountQuality(String query, boolean countQuality) {
		this.queryToCountQuality.put(query, countQuality);
	}
	
	public void clearQueryToCountQuality() {
		queryToCountQuality = new ConcurrentHashMap<String, Boolean>();
	}
	
	

	public ConcurrentHashMap<String, String> getDatabaseAccessHash() {
		return databaseAccessHash;
	}

	public void setDatabaseAccessHash(ConcurrentHashMap<String, String> databaseAccessHash) {
		this.databaseAccessHash = databaseAccessHash;
	}

}
