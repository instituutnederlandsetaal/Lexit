package database;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import resources.Constants;
import resources.ContextObject;
import resources.ResponseObject;
import tables.TableAndCountObject;
import tables.TableRecordObject;
import tables.TableRecordsObject;
import tables.UniqueValuesObject;
import util.FileProcessor;
import util.Util;



/*
 * This class contains all the queries needed to read from or write into
 * the database used by Lex'it
 * 
 */
public class Database {
	
	// servlet context etc
	ContextObject co;
	
	// Psql connection manager
	PostgresConnectionManager pc;
	
	// cache memory object
	// which holds column names, column types, table names, etc, so we don't have to query the database for this info each time
	DatabaseCache dbCache = new DatabaseCache();
	
	// should we use compulsory exact count ?
	// This can be set to true temporarily by user, but after counting, this will
	// be automatically set back to false by the getTable() function
	public boolean bForceExactCount = false; 
	
	// Standard value for the maximal allowed cost of a count query
	int maxAllowedDuration = Constants.maxAllowedDuration; // milliseconds
	int maxAllowedCost = -1; // value will be computed at first call of recomputeMaxAllowedCost()
	
	// help classes
	private final DatabaseSchemas databaseSchema = new DatabaseSchemas(this);
	private final DatabaseTables databaseTables = new DatabaseTables(this);
	private final DatabaseRecords databaseRecords = new DatabaseRecords(this);
	private final DatabaseColumns databaseColumns = new DatabaseColumns(this);
	private final DatabaseCustomTypes databaseCustomTypes = new DatabaseCustomTypes(this);
	private final DatabaseFunctions databaseFunctions = new DatabaseFunctions(this);
	private final DatabaseQuerys databaseQuery = new DatabaseQuerys(this);
	
	
	
	
	// constructor
	public Database(ContextObject co){
		
		try {
			this.co = co;
			
			this.dbCache.setDatabaseAccessHash( FileProcessor.readDatabasePropertiesFile(this.co) );
			
			this.pc = createPostgresConnectionManager();			
		} 
		catch (IOException e) {
			String error = Util.getDebugInfoForConsole("Error while instantiating Database object for the "+co.getDbName()+" properties file", new String[] {});
			throw new RuntimeException(error, e);
		}
	};
	
	// the ContextObject wasn't really supposed to keep information: it's mostly a convenient way to send server context info in one single object
	// BUT we do use it to keep some more info: 
	//  [1] the last usage time of the database object (so it can be removed when it hasn't been used for some time)
	//  [2] the tab the user is currently viewing (so we can simulate a session ID per TAB for example)
	// Both behave differently:
	//  [1] has its usage time set each time it's called... and at each call, we loop through to other cached ContextObjects and check if some usage time is too long ago
	//  [2] has its tab-id only set at tab creation or tab change, so the tab-id is lost at the very next round since the ContextObject by default only contains
	//      server context info. So, to prevent loss, we check if the previous version (held in this class) had some tab-id, and copy it to the new ContextObject
	public void updateContextObject(ContextObject co){
		
		// see explanation hereabove
		
		if ( 	(co.getActiveTabId() == null || co.getActiveTabId().isEmpty())				// THIS IS THE INPUT OBJECT TO BE UPDATED
				&&
				(this.co.getActiveTabId() != null && !this.co.getActiveTabId().isEmpty())) 	// THIS IS THE OBJECT CACHED IN
																							// THIS DATABASE OBJECT, WHICH WE WANT TO KEEP
																							// THE ACTIVE TAB ID FROM
		{			
			co.setActiveTabId(this.co.getActiveTabId());
		}
		
		this.co = co;
	}
	
	// getter for context object
	public ContextObject getContextObject(){
		return this.co;
	}
	
	
	// getter for the cache
	public DatabaseCache getCache() {
		return this.dbCache;
	}
	
	
	// declare if we must be computing an exact count (default is false,
	// but this can be set to true by user temporarily if needed)
	public void setForceExactCount(boolean forceExactCount){
		this.bForceExactCount = forceExactCount;
	}
	public boolean getForceExactCount(){
		return this.bForceExactCount;
	}
	
	
	
	
	
	
	// ------------------------------------------------------------------------------------------
	//
	//	METADATA
	//	
	// ------------------------------------------------------------------------------------------
	
	
	/**
	 * get info about the database, so an administrator could check in which db he is working from the GUI 
	 * (but of course, we will return no password!!!)
	 * @return
	 */
	public String[] getDatabaseInfo(){
		
		return databaseSchema.getDatabaseInfo();
	}
	
	
	/**
	 * Get list of available tables and views
	 * 
	 * @param tableName
	 * @return ArrayList
	 */
	public ArrayList<String[]> getTablesList(){

		return databaseSchema.getTablesList();
	}
	
	/**
	 * Get list of available tables (NO views)
	 * 
	 * @return ArrayList
	 */
	public  ArrayList<String> getTrueTablesList(){

		return databaseSchema.getTrueTablesList();
	}
	
	
	/**
	 * Get the collation clause for a column, which is used in a query
	 * 
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public String getCollationClause(String tableName, String columnName) {
		
		return databaseSchema.getCollationClause(tableName, columnName);
	}
	
	
	
	
	/**
	 * Get custom collation to use
	 * @throws IOException
	 */
	public String getCustomCollation(){
		
		return databaseSchema.getCustomCollation();
	}
	
	
	
	/**
	 * Get schema to address
	 * @throws IOException
	 */
	public String getSchemaName(){
		
		return databaseSchema.getSchemaName();
	}
	
	// get the schema name, depending on table name input
	// if the table name contains a dot, the string before the dot must be the schema name
	// if the table name contains no dot, we request the schema name contained in the configuration file
	public String getSchema(String tableName){
					
		return databaseSchema.getSchema(tableName);
	}
	
	
	
	/**
	 * Set a new schema to work in, if needed.
	 * When this method has been called, next database calls
	 * will address this schema instead of the default one (t.i.
	 * the one which is set in the .database config file)
	 * @param newSchema
	 */
	public void setSchemaName(String newSchema){
		
		databaseSchema.setSchemaName(newSchema);
	}
	
	
	/**
	 * Set the active tab ID in the ContextObject.
	 * Each time a connection is made with the database, this tab ID is send to the database (just like the username)
	 * so as to allow database operation to take it into account. 
	 * @param activeTabId
	 */
	public void setActiveTabId(String activeTabId) {
		
		databaseSchema.setActiveTabId(activeTabId);
		
	}
	
	
	// ------------------------------------------------------------------------------------------
	//
	//	RECORDS
	//	
	// ------------------------------------------------------------------------------------------
	
	
	/**
	 * Insert a record into a table
	 * @param tableName
	 * @param columnNames
	 * @param values
	 */
	public void insertRecord(
			String tableName, String[] columnNames, 
			String[] values,
			ResponseObject dro){
		
		databaseRecords.insertRecord(tableName, columnNames, values, dro);
	}
	
	
	/**
	 * Insert some records into a table
	 * given ids to match
	 * the matching records will be re-inserted with modified values
	 * according to some patterns and replacement values
	 * @param tableName
	 * @param rowIds
	 * @param columnsToCopy
	 * @param filterColumnName
	 * @param filterValue
	 * @param replacementValue
	 * @param returningField
	 * @param dro
	 */
	public void insertFromExistingRecords(String tableName, 
			String[] rowIds, String[] columnsToCopy, 
			String filterColumnName, String filterValue, String replacementValue, 
			ResponseObject dro){
		
		databaseRecords.insertFromExistingRecords(tableName, rowIds, columnsToCopy, filterColumnName, filterValue, replacementValue, dro);
		
	}
	
	/**
	 * Insert some records into a table, 
	 * given some records to match which will be re-inserted with modified values 
	 * according to some patterns and replacement values
	 * @param tableName
	 * @param filterColumnNames
	 * @param filterValues
	 * @param replacementColumnNames
	 * @param replacementValues
	 * @param returningField
	 * @param dro
	 */
	public  void insertFromExistingRecordsWithoutId(
			String tableName, 
			String[] filterColumnNames, String[] filterValues, 
			String[] replacementColumnNames, String[] replacementValues,
			String returningField, ResponseObject dro){
		
		databaseRecords.insertFromExistingRecordsWithoutId(tableName, filterColumnNames, filterValues, replacementColumnNames, replacementValues, returningField, dro);
		
	}
	
	/**
	 * Insert a record into a table
	 * and get the id of the inserted record.
	 * @param tableName
	 * @param columnNames
	 * @param values
	 * @param dro
	 * @return
	 */
	public void insertRecordAndGetItsId(
			String tableName, String[] columnNames,
			String[] values, 
			String returningField, ResponseObject dro){
		
		databaseRecords.insertRecordAndGetItsId(tableName, columnNames, values, returningField, dro);
		
	};
	
	
	
	/**
	 * Duplicate a record in a table
	 * and get the id of the new duplicate record.
	 * @param tableName
	 * @param columnNamesToSkip
	 * @param pkSubstitute  (usually NULL if we want to use the Primary key;  otherwise the name of some serial field)
	 * @param pkValue : the value the Primary key (or pkSubstitute) must match
	 * @param dro
	 * @return
	 */
	public  void duplicateRecordAndGetItsId(
			String tableName, String[] columnNamesToSkip,
			String pkSubstitute, String pkValue, 
			ResponseObject dro){
		
		databaseRecords.duplicateRecordAndGetItsId(tableName, columnNamesToSkip, pkSubstitute, pkValue, dro);
		
	};
	
	
	
	/**
	 * Update one or more columns in one single record of a table
	 * @param tableName
	 * @param rowId
	 * @param columnNames
	 * @param valuesToUpdate
	 * @param dro
	 */
	public  void updateWholeRecord(
			String tableName, String rowId, String[] columnNames,
			String[] valuesToUpdate,
			ResponseObject dro){
		
		databaseRecords.updateWholeRecord(tableName, rowId, columnNames, valuesToUpdate, dro);
	}
	
	/**
	 * Update a database record, 
	 * given some column names and values to match
	 * @param tableName
	 * @param columnNamesToMatch
	 * @param valuesToMatch
	 * @param columnNamesToUpdate
	 * @param valuesToUpdate
	 * @param dro
	 */
	public void updateRecordWithoutId(
			String tableName, 
			String[] columnNamesToMatch, String[] valuesToMatch,
			String[] columnNamesToUpdate, String[] valuesToUpdate,
			ResponseObject dro ){
				
		databaseRecords.updateRecordWithoutId(tableName, columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
	}
	
	
	
	/**
	 * Update a database record within a search&replace action, 
	 * given some column names and values to match
	 * @param tableName
	 * @param columnNamesToMatch
	 * @param valuesToMatch
	 * @param columnNamesToUpdate
	 * @param valuesToUpdate
	 * @param dro
	 */
	public void updateRecordWithoutId_ForSearchAndReplace(
			String tableName, 
			String[] columnNamesToMatch, String[] valuesToMatch,
			String[] columnNamesToUpdate, String[] valuesToUpdate,
			ResponseObject dro ){
		
		databaseRecords.updateRecordWithoutId_ForSearchAndReplace(tableName, columnNamesToMatch, valuesToMatch, columnNamesToUpdate, valuesToUpdate, dro);
		
	}
	
	/**
	 * Get a table record, given a table name and id
	 * @param tableName
	 * @param id
	 * @return
	 */
	public  TableRecordObject getRecord(String tableName, String id){
		
		return databaseRecords.getRecord(tableName, id);
	}
	
	
	/**
	 * Get multiple table records, given a table name and some record ids
	 * @param tableName
	 * @param ids
	 * @return
	 */
	public  TableRecordsObject getRecords(String tableName, String[] ids){
		
		return databaseRecords.getRecords(tableName, ids);
	}
	
	
	/**
	 * Get a table record, given a table name and some values to match
	 * @param tableName
	 * @param columnNamesToMatch
	 * @param valuesToMatch
	 * @return
	 */
	public TableRecordObject getRecordWithoutId(String tableName, 
			String[] columnNamesToMatch, String[] valuesToMatch){
		
		return databaseRecords.getRecordWithoutId(tableName, columnNamesToMatch, valuesToMatch);
	}
	
	
	
	/**
	 * Get multiple table records, given a table name and some values to match
	 * @param tableName
	 * @param ids
	 * @return
	 */
	public TableRecordsObject getRecordsWithoutIds(String tableName, String[] columnNamesToMatch, String[] valuesToMatch){
		
		return databaseRecords.getRecordsWithoutIds(tableName, columnNamesToMatch, valuesToMatch);	
	}
	
	
	
	
	
	
	/**
	 * Delete a record from a table
	 * @param tableName
	 * @param idValue
	 */
	public void deleteRecord(String tableName, String idValue, ResponseObject dro){		
		
		databaseRecords.deleteRecord(tableName, idValue, dro);		
	}
	
	/**
	 * Delete some records from a table
	 * given some column names and values to match
	 * @param tableName
	 * @param columnNames
	 * @param values
	 * @param dro
	 */
	public  void deleteRecordWithoutId(
			String tableName, String[] columnNames, 
			String[] values,
			ResponseObject dro ){
		
		databaseRecords.deleteRecordWithoutId(tableName, columnNames, values, dro);		
	}
	
	
	/**
	 * Give the row number of a record, given some value to match in some column
	 * @param tableName
	 * @param columnName
	 * @param columnValue
	 * @param occurrenceNr // this gives the possibility to query for different occurrences of a searched string
	 * @param sortBy
	 * @param sortDir
	 * @return a row number
	 */
	public  String getRowNumberOfRecord(
			String tableName, String columnName, String columnValue, 
			int occurrenceNr,
			String sortBy, String sortDir,
			String[] filterColumns, String[] filterValues,  // this is filled with 'filter' parameter in <project>.config.js
			int iDisplayLength){
		
		return databaseRecords.getRowNumberOfRecord(tableName, columnName, columnValue, occurrenceNr, sortBy, sortDir, filterColumns, filterValues, iDisplayLength);	
	}
	
	
	/**
	 * Get id of a record 
	 * given some column names and values to match
	 * @param tableName
	 * @param columnNames
	 * @param columnValues
	 * @param dro
	 */
	public String getIdOfRecord(
			String tableName, String[] columnNames, 
			String[] columnValues){
				
		return databaseRecords.getIdOfRecord(tableName, columnNames, columnValues);
	}
	
	
	
	
	// ------------------------------------------------------------------------------------------
	//
	//	COLUMNS
	//	
	// ------------------------------------------------------------------------------------------
	
	
	/**
	 * Get all unique values stored in a given column
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public UniqueValuesObject getUniqueValues(String tableName, String columnName) {

	    return databaseColumns.getUniqueValues(tableName, columnName);
	}
	
	// see getUniqueValues
	public UniqueValuesObject getUniqueValues_oldStyle(String tableName, String columnName, String columnValueFilter, String limit) {
		
		return databaseColumns.getUniqueValues_oldStyle(tableName, columnName, columnValueFilter, limit);
    	
	}
	
	
	
	// see getUniqueValues
	public UniqueValuesObject getUniqueValuesWithFreqs(String tableName, String columnName, String columnValueFilter, String otherFiltersAndValues, String limit, boolean sortByFreq) {
		
		return databaseColumns.getUniqueValuesWithFreqs(tableName, columnName, columnValueFilter, otherFiltersAndValues, limit, sortByFreq);    	
	}

	
	
	
	/**
	 * Update one column in a record in a table
	 * @param tableName
	 * @param rowId
	 * @param columnName
	 * @param valueToUpdate
	 */
	public void updateOneColumn(
			String tableName, String rowId, String columnName, 
			String valueToUpdate,
			ResponseObject dro){
		
		databaseColumns.updateOneColumnValue(tableName, rowId, columnName, valueToUpdate, dro);
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
	public String getTypeOfColumn(String tableName, String columnName, String columnValue){
		
		return databaseColumns.getTypeOfColumn(tableName, columnName, columnValue);
	}
	
	
	/**
	 * Get the types of all columns
	 * 
	 * @param tableName
	 * @param array of columns
	 * @return array of types
	 */
	public  String[] getTypesOfColumns(String tableName, String[] columns){
		
		return databaseColumns.getTypesOfColumns(tableName, columns);
	}
	
	
	/**
	 * Check whether some index (even multi-column one) exists or not
	 * 
	 * @param tableName
	 * @param indexedFields (an array of column names, which are used as sorting column in the very same query)
	 * @return
	 */
	public Boolean checkIfIndexExists(String tableName, String[] indexedFields){
		
		return databaseColumns.checkIfIndexExists(tableName, indexedFields);
		
		
	}
	
	
	/**
	 * Get the comments of columns 
	 * (which are set with: COMMENT ON COLUMN table.column IS '...')
	 * @param tableName
	 * @param columns
	 * @return
	 */
	public String[] getColumnsComments(String tableName, String[] columns){
		
		return databaseColumns.getColumnsComments(tableName, columns);
		
	}
	
	
	/** Get the column names of a table
	 * 
	 * @param tableName
	 * @return array of column names
	 */
	public  String[] getColumnNames(String tableName){
		
		return databaseColumns.getColumnNames(tableName);
	}
	
	
	
	
	// ------------------------------------------------------------------------------------------
	//
	//	TABLES
	//	
	// ------------------------------------------------------------------------------------------
	
	
	/**
	 * Update the comment of a table
	 * 
	 * like:
	 * COMMENT ON TABLE mytable IS 'This is my table.';
	 * @param tableName
	 * @param tableType
	 * @param newComment
	 * @param dro
	 */
	public void updateComment(String tableName, String tableType,
			String newComment, ResponseObject dro){
		
		databaseTables.updateComment(tableName, tableType, newComment, dro);
		
	}
	
	
	/**
	 * Get the comment on a table
	 * 
	 * @param tableName
	 * @return
	 */
	public String getComment(String tableName){
		
		return databaseTables.getComment(tableName);
	}
	
	


	/**
	 * Check if a table exists
	 * 
	 * @param tableName
	 * @return true/false
	 */
	public Boolean checkIfTableExists(String tableName){

		return databaseTables.checkIfTableExists(tableName);
	}
	
	
	/**
	 * Get a fast estimate of the number of ALL rows of a table or view
	 * @param tableName
	 * @return
	 */
	public Map<String, Object> getQuickCountOfAllTableRecords(String tableName) {
		
		return databaseTables.getQuickCountOfAllRows(tableName);
	}
	
	
	
	/**
	 * Refresh a materialized view, given its name.
	 * @param viewName
	 */
	public void refreshMaterializedView(String viewName) {
        
		databaseTables.refreshMaterializedView(viewName);
    }
	
	
	
	/**
	 * Remove the cache of some table
	 * @param tableName
	 */
	public void cleanCache(String tableName) {

		databaseTables.cleanCache(tableName);
	}
	
	
	
	
	
	/**
	 * try a quick and dirty count (much faster than Postgres Count(*))
	 * @param tableName
	 * @param query
	 * @return
	 */
	public Integer getEstimateCount(String countQuery){
		
		return databaseTables.getEstimateCount(countQuery);
	}
	
	
	
	
	
	/**
	 * get the true exact count of a table
	 * @param tableName
	 * @param columnNames
	 * @param values
	 * @param dro
	 */
	public Integer getTrueCountOfATable(String tableName){
		
		return databaseTables.getTrueCountOfATable(tableName);
		
	}
	
	
	
	
	
	/**
	 * Get the content of a table,
	 * given its name and several filters and sorting options
	 */
	public  TableAndCountObject getTable(
			String tableName, int countOfWholeTable, String[] allColumns, 
			int iDisplayLength, 
			int iDisplayStart, String sSearch, 
			ArrayList<String> aSearchColumnNames, ArrayList<String> aSearchColumnValues, ArrayList<Boolean> aCaseSensitiveColumnSearch,
			boolean weMustSort, 
			String[] aSortCol, String[] aSortDir){
		
		return databaseTables.getTable(tableName, countOfWholeTable, allColumns, iDisplayLength, iDisplayStart, sSearch, aSearchColumnNames, aSearchColumnValues, aCaseSensitiveColumnSearch, weMustSort, aSortCol, aSortDir);
	}
	
	
	
	
	
	
	/**
	 * Get the column name of the primary key
	 * 
	 * @param table
	 * @return primary key OR null
	 */
	public  String getPrimaryKeyColumn(String tableName){
		
		return databaseTables.getPrimaryKeyColumn(tableName);
	}
	
	
	
	
	// ------------------------------------------------------------------------------------------
	//
	//	DATABASE QUERY
	//	
	// ------------------------------------------------------------------------------------------
	
	
	/**
	 * Get the cost of a query. 
	 * 
	 * BEWARE the countQuery was pre-processed before, t.i. question marks were replaced by actual values!
	 * This is needed to get a correct cost estimation!
	 * 
	 * @param tableName
	 * @param query
	 * @return
	 */
	public Integer getQueryCost(String countQuery){
		
		return databaseQuery.getQueryCost(countQuery);		
	}
	
	/**
	 * Recompute the maximal allowed cost of a count query
	 * 
	 * There seems to be a sometimes quite constant linear relation between the 
	 * cost of a count query and the time this query takes to execute:
	 * 
	 *       relation = queryCost / timeToExecute
	 *     
	 *     which implies:
	 *     
	 *       queryCost = timeToExecute * relation
	 *     
	 * So, given a maximal allowed duration 'maxAllowedTime' for a count query,
	 * we expect the cost of that query not to exceed the value
	 * 
	 *       maxAllowedTime * relation
	 *     
	 *     that is:
	 *     
	 *       maxAllowedCost <= (maxAllowedTime * relation)
	 * 
	 * When recomputing the maximal allowed cost, we first compute this maximal cost
	 * given the last query, and then compute an average value, given the previous
	 * computed maximal allowed costs. We do this to prevent the value of the maximal 
	 * allowed cost to shift too drastically up and down.
	 * 
	 * @param queryCost
	 * @param timeBeforeCount
	 * @param timeAfterCount
	 */
	
	public void recomputeMaxAllowedCost(int queryCost, long timeBeforeCount, long timeAfterCount ){		
		
		databaseQuery.recomputeMaxAllowedCost(queryCost, timeBeforeCount, timeAfterCount);
		
	}
	
	
	
	/**
	 * Determine which operator suits a value, given its type
	 * and return it.
	 * @param value
	 * @return an operator as a string
	 */
	public String getSuitableOperatorAndArg(String tableName, String columnName, String columnValue, boolean caseSensitive){
		
		return databaseQuery.getSuitableOperatorAndArg(tableName, columnName, columnValue, caseSensitive);
	}
	
	
	
	// ------------------------------------------------------------------------------------------
	//
	//	FUNCTIONS
	//	
	// ------------------------------------------------------------------------------------------
	
	
	/**
	 * Call a database function, given its name and a list of arguments
	 * @param functionName
	 * @param args
	 * @return
	 */
	public TableRecordObject callFunction(String functionName, String[] args){
		
		return databaseFunctions.callFunction(functionName, args);
	}
	
	
	/**
	 * get the argument types of a function
	 * 
	 * @param functionName
	 * @param number of arguments (needed for distinction since we sometimes have homonyms)
	 * @return array of argument types
	 */
	public String[] getFunctionTypes(String functionName, int numberOfArgs){
		
		return databaseFunctions.getFunctionTypes(functionName, numberOfArgs);
	}
	
	
	/**
	 * Determine if a function is a writing function (return 'writing')
	 * or just a reading function  (return 'reading')
	 * 
	 * @param functionName
	 * @param number of arguments (needed for distinction since we sometimes have homonyms)
	 * @return string 'writing' or 'reading', describing the function operation type
	 */
	public String getFunctionOperationType(String functionName, int numberOfArgs){
		
		return databaseFunctions.getFunctionOperationType(functionName, numberOfArgs);
	}
	
	
	/**
	 * get the return type of a function
	 * 
	 * @param functionName
	 * @param number of arguments (needed for distinction since we sometimes have homonyms)
	 * @return return type of the function
	 */
	public String getFunctionReturnType(String functionName, int numberOfArgs){
		
		return databaseFunctions.getFunctionReturnType(functionName, numberOfArgs);
	}
	
	
	
	
	
	
	// ------------------------------------------------------------------------------------------
	//
	//	CUSTOM TYPES
	//	
	// ------------------------------------------------------------------------------------------
	
	
	
	// get the name of a custom type, given the name of a column having this type
	public String getUserDefinedTypeName(String tableName, String columnName){
		
		return databaseCustomTypes.getUserDefinedTypeName(tableName, columnName);
	}
	
	
	// Get the values a user defined type is consisting of.
	// this returns a list of values in a pipe-separated string.
	// (see: http://stackoverflow.com/questions/9535937/is-there-a-way-to-show-a-user-defined-postgresql-enumerated-type-definition)
	public String getUserDefinedTypeValues(String tableName, String typeName){
		
		return databaseCustomTypes.getUserDefinedTypeValues(tableName, typeName);
	}
	
	
	// get the allowed values of all custom type columns of a table at once!
	public String[] getCustomtypesAllowedValues(String tableName, String[] columnNames, String[] columnTypes){
		
		return databaseCustomTypes.getCustomtypesAllowedValues(tableName, columnNames, columnTypes);
	}
	
	
	
	
	
	
	
	
	
	
	
	// ------------------------------------------------------------------------------------------
	//
	//	CONNECTION
	//	
	// ------------------------------------------------------------------------------------------
	
	
	
	/**
	 * Create a PostgresConnectionManager instance.
	 * This will automatically create a connection pool for the database
	 */
	public PostgresConnectionManager createPostgresConnectionManager()  {
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( getCache().getDatabaseAccessHash().size() == 0 )
			try {
				getCache().setDatabaseAccessHash( FileProcessor.readDatabasePropertiesFile(co) );
			} 
			catch (IOException e) {
				throw new RuntimeException(e);
			}
		
		ConcurrentHashMap<String, String> databaseAccessHash = getCache().getDatabaseAccessHash();		
		String db = databaseAccessHash.get("db");
		String host = databaseAccessHash.get("host");
		String port = databaseAccessHash.get("port");
		String user = databaseAccessHash.get("user");
		String pass = databaseAccessHash.get("pass");		
		
		// Special setting for cases in which the database server needs to know
		// which user is active (e.g. because some database trigger function
		// must behave differently for one user or another).
		//
		// NB: the previous Lex'it version worked with Tomcat login, 
		//     but since june 2024, Lex'it works with Clarin login OR Lex'it login (default)
		
		String sendTomcatUserInfoToDb = databaseAccessHash.get("send_username_to_db");
		// if the setting is not found, look for the old setting
		if (sendTomcatUserInfoToDb == null)
			sendTomcatUserInfoToDb = databaseAccessHash.get("send_tomcat_username_to_db");
				
		// compute the right value: default is 'false'.
		boolean bSendTomcatUserInfoToDb = 
			(sendTomcatUserInfoToDb == null) ? false : 
				(sendTomcatUserInfoToDb.toLowerCase().trim().equals("true") ?
						true : false);		
		
		// the config file might contain a 'max_pool_size' value for a particular database
		// (default in Lex'it is 10, which might be too low for some projects)
		
		String sMaxPoolSize = databaseAccessHash.get("max_pool_size");
		int iMaxPoolSize = (sMaxPoolSize == null ? Constants.maxPoolSize : Integer.parseInt(sMaxPoolSize));
		
		// connect to db (we give the tomcat info as arguments, so it might be
		// used if needed)
		PostgresConnectionManager postgresDc = 
			new PostgresConnectionManager(this.co, bSendTomcatUserInfoToDb, iMaxPoolSize);
		
		postgresDc.createDataSourceInPool(host, port, db, user, pass);
		
		return postgresDc;
		
	}
	
	
	
	/**
	 * Retrieve a PostgresConnectionManager instance
	 * @return
	 */
	public PostgresConnectionManager getPostgresConnectionManager() {
		if (this.pc == null) {
			Util.debug("Reconnect to database");
			this.pc = createPostgresConnectionManager();			
		}
		return this.pc;
	}
	
	
	
	

	

	
	


	
}
