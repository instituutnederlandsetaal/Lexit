package database;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import resources.Constants;
import resources.ResponseObject;
import tables.TableRecordObject;
import tables.TableRecordsObject;
import util.Util;


/*
 * This class is responsible for setting/getting information at RECORD level
 */
public class DatabaseRecords {
	
	private final Database db;
	
	
	public DatabaseRecords(Database db) {		
		this.db = db;		
	}
	
	
	
	/**
	 * Insert a record into a table
	 * @param tableName
	 * @param columnNames
	 * @param values
	 */
	public  void insertRecord(
			String tableName, String[] columnNames, 
			String[] values,
			ResponseObject dro){
		
		String schema = db.getSchema(tableName);
		
		for (int i=0; i<columnNames.length; i++) {
			columnNames[i] = DatabaseUtils.getSafeFieldName(columnNames[i]);
		}
		
		String insertRecords = 
			"INSERT INTO " + DatabaseUtils.getSafeTableName(tableName, schema) + " ("+ Util.join(columnNames, ",") + ") " +
			"VALUES (" + DatabaseUtils.getStringOfQuestionMarks(values) + ") ;";		
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = db.getTypesOfColumns(tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);
		}
		
				
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			dc.sendPreparedUpdate(schema, insertRecords, values, ato, dro);
			
		}
		catch (Exception e) {			
			String error = Util.getDebugInfoForConsole("Error while executing query "+insertRecords+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), values);
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		} 
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
	public  void insertFromExistingRecords(String tableName, 
			String[] rowIds, String[] columnsToCopy, 
			String filterColumnName, String filterValue, String replacementValue, 
			ResponseObject dro){
		
		String schema = db.getSchema(tableName);
		String primaryKey = db.getPrimaryKeyColumn(tableName);
		
		String insertQuery = "INSERT INTO "+ DatabaseUtils.getSafeTableName(tableName, schema) +" "+
		"SELECT ";
		
		// the columns to insert are the columns to copy
		// but if the modified column happens not to be part of the list of columns to copy
		// it than must be added tot it
		String[] columnsToInsert = columnsToCopy;
		if (columnsToCopy==null || Util.getIndexOf(filterColumnName, columnsToCopy)<0)
			columnsToInsert = Util.concatArr(columnsToCopy, new String[]{filterColumnName});
		
		// build the select part
		String[] allParts = new String[columnsToInsert.length];
		for (int i=0; i<columnsToInsert.length; i++)
		{			
			String oneColumnToInsert = columnsToInsert[i];
			String pattern = (oneColumnToInsert.equals(filterColumnName)) ?
					filterValue : null;
			
			// if the current column is just a column to copy, we will select the column without modifying it 
			if (pattern == null)
				allParts[i] = DatabaseUtils.getSafeFieldName(oneColumnToInsert);
			// if the current column has a replacement value, we will select the column and modify the value in it
			else
				allParts[i] = "regexp_replace("+ DatabaseUtils.getSafeFieldName(oneColumnToInsert)+", '"+ DatabaseUtils.getDoubleEscape(pattern)+"', '"+ DatabaseUtils.getValidSqlBackReference(replacementValue)+"') AS "+ DatabaseUtils.getSafeFieldName(oneColumnToInsert);
		}
		
		// add the parts like SELECT regexp_replace(colname, '^regen', 'zon'), regexp(...), regexp(...) ...
		insertQuery += Util.join(allParts, ",")+" "+
		"FROM "+ DatabaseUtils.getSafeTableName(tableName, schema) +" "+
		"WHERE "+ DatabaseUtils.getSafeFieldName(primaryKey) +" = ? ;";
				
				
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String valueTypeOfIdColumn = db.getTypeOfColumn(tableName, primaryKey, null);
				
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			for (int i = 0; i<rowIds.length; i++) {
				ato.setType(0, valueTypeOfIdColumn);
				dc.sendPreparedUpdate(schema, insertQuery, new String[]{rowIds[i]}, ato, dro);
			}
			
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+insertQuery+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), rowIds);
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		}
		
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
		
		String type="update";
		
		String schema = db.getSchema(tableName);
		String idOfCreatedRecord = "";
		String idColumn = returningField;
		
		// build query:
		// we'll be doing an 'insert' of rows
		// modified by a 'select' with regexp_replace.
		String insertQuery = "INSERT INTO "+ DatabaseUtils.getSafeTableName(tableName, schema) +" "+
		"SELECT ";
		
		String[] allParts = new String[filterColumnNames.length];
		for (int i=0; i<filterColumnNames.length; i++) {			
			String oneFilterColumnName = filterColumnNames[i];
			String pattern = filterValues[i];
			
			int indexInReplacementColumnNames = Util.getIndexOf(oneFilterColumnName, replacementColumnNames);
			String replacement = indexInReplacementColumnNames>-1 ?
					replacementValues[indexInReplacementColumnNames] : null;
			
			// if we have no replacement value, we will select the column without modifying it 
			if (replacement == null)
				allParts[i] = DatabaseUtils.getSafeFieldName(oneFilterColumnName);
			// if we do have a replacement value, we will select the column and modify the value in it
			else
				allParts[i] = "regexp_replace("+ DatabaseUtils.getSafeFieldName(oneFilterColumnName)+", '"+ DatabaseUtils.getDoubleEscape(pattern)+"', '"+ DatabaseUtils.getValidSqlBackReference(replacement)+"') AS "+ DatabaseUtils.getSafeFieldName(oneFilterColumnName);
		}
		
		// add the parts like SELECT regexp_replace('colname', '^regen', 'zon'), regexp(...), regexp(...) ...
		insertQuery += Util.join(allParts, ",")+" "+
		"FROM "+ DatabaseUtils.getSafeTableName(tableName, schema) +" "+
		"WHERE ";
		
		allParts = new String[filterColumnNames.length];
		for (int i=0; i<filterColumnNames.length; i++) {
			String oneColumnName = filterColumnNames[i];
			String pattern = filterValues[i];
			allParts[i] = DatabaseUtils.getSafeFieldName(oneColumnName) + 
					" " + db.getSuitableOperatorAndArg(tableName, oneColumnName, pattern, true);
		}
		
		// add the condition WHERE col ~* '^regex' AND ...
		insertQuery += Util.join(allParts, " AND ") + " ";
		
		// do we expect a value in return?
		if (returningField != null && !returningField.equals("null")) {
			type = "insert";
			insertQuery += "RETURNING "+ DatabaseUtils.getSafeFieldName(idColumn);
		}
			
		
		// close with a semicolon
		insertQuery += ";";
		
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = db.getTypesOfColumns(tableName, filterColumnNames);
		for (int i = 0; i<filterColumnNames.length; i++) {
			ato.setType(i, valueTypes[i]);
		}
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = null;
			
			if (type.equals("insert")) {
				rs = dc.sendPreparedQuery(schema, insertQuery, filterValues).getRows();				
			}
			else {
				dc.sendPreparedUpdate(schema, insertQuery, filterValues, ato, dro);				
			}
			
			ArrayList<String[]> res;
			if (type.equals("insert")) {
				res = Util.getResultSetCopyInAList(rs, new String[]{idColumn});
				idOfCreatedRecord = Util.join(res.get(0), ",");	
				dro.setResponse(idOfCreatedRecord);
			} 	
			
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+insertQuery+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), filterValues);
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		} 
		
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
	public  void insertRecordAndGetItsId(
			String tableName, String[] columnNames,
			String[] values, 
			String returningField, ResponseObject dro){
		
		String idOfCreatedRecord = "";
		String idColumn = (returningField != null && !returningField.equalsIgnoreCase("null")) ?
				returningField : db.getPrimaryKeyColumn(tableName);
		
		String schema = db.getSchema(tableName);
		
		for (int i=0; i<columnNames.length; i++) {
			columnNames[i] = DatabaseUtils.getSafeFieldName(columnNames[i]);
		}
		
		String insertRecords = 
			"INSERT INTO " + DatabaseUtils.getSafeTableName(tableName, schema) + " ("+ Util.join(columnNames, ",") + ") " +
			"VALUES (" + DatabaseUtils.getStringOfQuestionMarks(values) + ") " +
			"RETURNING "+ DatabaseUtils.getSafeFieldName(idColumn)+";";		
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = db.getTypesOfColumns(tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++) {
			ato.setType(i, valueTypes[i]);			
		}
				
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, insertRecords, values, ato, 0).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{idColumn});
			idOfCreatedRecord = res.get(0)[0];	
			dro.setResponse(idOfCreatedRecord);
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+insertRecords+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), values);
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		} 
		
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
		
		// set schema, table and pk column names etc
		
		String schema = 		db.getSchema(tableName);		
		String[] columnNames =	db.getColumnNames(tableName);
		
		String idOfCreatedRecord = "";
		String idColumn = (pkSubstitute != null && !pkSubstitute.equalsIgnoreCase("null")) ?
				pkSubstitute : db.getPrimaryKeyColumn(tableName);

		columnNamesToSkip = (columnNamesToSkip != null && (columnNamesToSkip.length>0 && !(columnNamesToSkip[0]).equalsIgnoreCase("null"))) ?
				columnNamesToSkip : new String[]{};
		
		// set the column names
		
		for (int i=0; i<columnNames.length; i++) {
			columnNames[i] = DatabaseUtils.getSafeFieldName(columnNames[i]);
		}
		
		
		// remove the primary key from the columns names
		// and also the columns that should be skipped (if set!) 
		
		columnNames = Util.removeElement(columnNames, DatabaseUtils.getSafeFieldName(idColumn) );
		for (int i=0; i<columnNamesToSkip.length; i++)
		{
			columnNames = Util.removeElement(columnNames, DatabaseUtils.getSafeFieldName(columnNamesToSkip[i]) );
		}
		
		
		// now build the row duplication query
		
		String duplicateRecord = 
			"INSERT INTO " + DatabaseUtils.getSafeTableName(tableName, schema) + " ("+ Util.join(columnNames, ",") + ") " +
			"SELECT  " + Util.join(columnNames, ",") + " " +
			"FROM " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +
			"WHERE " + DatabaseUtils.getSafeFieldName(idColumn) + " = ? " +
			"RETURNING " + DatabaseUtils.getSafeFieldName(idColumn) + ";";
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] values = new String[]{ pkValue };
		String[] valueTypes = db.getTypesOfColumns(tableName, new String[]{idColumn});
		ato.setType(0, valueTypes[0]);
				
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, duplicateRecord, values, ato, 0).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{idColumn});
			idOfCreatedRecord = res.get(0)[0];	
			dro.setResponse(idOfCreatedRecord);
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+duplicateRecord+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), values);
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		}
		
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
		
		String schema = 	db.getSchema(tableName);
		String idColumn = 	db.getPrimaryKeyColumn(tableName);
		
		// set arguments
		String[] args = Util.concatArr(valuesToUpdate, new String[]{rowId}); 
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		for (int i=0; i< columnNames.length; i++) {
			String oneColumn = columnNames[i];
			columnNames[i] = DatabaseUtils.getSafeFieldName(columnNames[i]);
			ato.setType(i, db.getTypeOfColumn(tableName, oneColumn, null));
		}		
		ato.setType(columnNames.length, db.getTypeOfColumn(tableName, idColumn, null));
		
		
		String updateRecords = 
			"UPDATE " + DatabaseUtils.getSafeTableName(tableName, schema) + 
			" SET "+ (Util.join(columnNames, " = ?,") +" = ? ") +
			"WHERE "+ DatabaseUtils.getSafeFieldName(idColumn) +" = ? ;";
		
				
		PostgresConnectionManager dc = db.getPostgresConnectionManager();		
		
		try {
			dc.sendPreparedUpdate(schema, updateRecords, args, ato, dro);
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+updateRecords+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), args);
			throw new RuntimeException(error, e);
		}
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
	public  void updateRecordWithoutId(
			String tableName, 
			String[] columnNamesToMatch, String[] valuesToMatch,
			String[] columnNamesToUpdate, String[] valuesToUpdate,
			ResponseObject dro ){
		
		String schema = db.getSchema(tableName);
			
		// set arguments
		String[] args = Util.concatArr(valuesToUpdate, valuesToMatch); 
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] valuesToUpdateTypes = db.getTypesOfColumns(tableName, columnNamesToUpdate);
		for (int i = 0; i<columnNamesToUpdate.length; i++) {
			ato.setType(i, valuesToUpdateTypes[i]);
		}	
		
		// the following argument values must follow the previous ones (speaking of indexes)
		int countFrom = columnNamesToUpdate.length;
		
		String[] valuesToMatchTypes = db.getTypesOfColumns(tableName, columnNamesToMatch);
		for (int i = 0; i<columnNamesToMatch.length; i++) {
			ato.setType(countFrom + i, valuesToMatchTypes[i]);
		}	
				
		// setting pairs 
		String[] settingPairs = new String[columnNamesToUpdate.length];
		for (int i=0; i<columnNamesToUpdate.length; i++) {
			settingPairs[i] = DatabaseUtils.getSafeFieldName(columnNamesToUpdate[i]) + " = ?";
		}
		
		// matching pairs with suitable operator
		String[] matchingPairs = new String[columnNamesToMatch.length];
		for (int i=0; i<columnNamesToMatch.length; i++) {
			matchingPairs[i] = DatabaseUtils.getSafeFieldName(columnNamesToMatch[i]) + 
					" " + db.getSuitableOperatorAndArg(tableName, columnNamesToMatch[i], valuesToMatch[i], true);
		}
		
		String updateRecords = 
			"UPDATE " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +
			"SET "+ Util.join(settingPairs, ",") + " " +
			"WHERE " + (Util.join(matchingPairs, " AND ")) + ";";		
		
		
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
		
		String schema = db.getSchema(tableName);			
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] valueTypes = db.getTypesOfColumns(tableName, columnNamesToMatch);
		for (int i = 0; i<columnNamesToMatch.length; i++) {
			ato.setType(i, valueTypes[i]);
		}			
		// set arguments
		String[] args = valuesToMatch;
		
		// setting pairs [ SET colname = regexp_replace(colname, regexp, replacement) ]
		String[] settingPairs = new String[columnNamesToUpdate.length];
		for (int i=0; i<columnNamesToUpdate.length; i++) {
			int indexOfMatcher = Util.getIndexOf(columnNamesToUpdate[i], columnNamesToMatch);
			settingPairs[i] = DatabaseUtils.getSafeFieldName(columnNamesToUpdate[i]) + " = " +
			(
				DatabaseUtils.allowsRegex(db.getTypeOfColumn(tableName, columnNamesToUpdate[i], null)) && indexOfMatcher>-1 ?
					"regexp_replace("+ DatabaseUtils.getSafeFieldName(columnNamesToUpdate[i]) + ", '" + DatabaseUtils.getDoubleEscape(valuesToMatch[indexOfMatcher]) + "', '" + DatabaseUtils.getValidSqlBackReference(valuesToUpdate[i]) + "') " :
						"'"+ DatabaseUtils.getValidSqlBackReference(valuesToUpdate[i])+"'"
			);
		}
		
		// matching pairs with suitable operator
		String[] matchingPairs = new String[columnNamesToMatch.length];
		for (int i=0; i<columnNamesToMatch.length; i++) {
			matchingPairs[i] = DatabaseUtils.getSafeFieldName(columnNamesToMatch[i]) + 
					" " + db.getSuitableOperatorAndArg(tableName, columnNamesToMatch[i], valuesToMatch[i], true);
		}
		
		String updateRecords = 
			"UPDATE " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +
			"SET "+ Util.join(settingPairs, ",") + " " +
			"WHERE " + (Util.join(matchingPairs, " AND ")) + ";";		
		
		
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
	 * Delete a record from a table
	 * @param tableName
	 * @param idValue
	 */
	public void deleteRecord(String tableName, String idValue, ResponseObject dro){
		
		String schema = db.getSchema(tableName);
		String idColumn = db.getPrimaryKeyColumn(tableName);			
		
		// set arguments
		String[] args = new String[]{idValue};
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		ato.setType(0, db.getTypeOfColumn(tableName, idColumn, null));
		
		String deleteRecord = 
			"DELETE FROM " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +
			"WHERE " + DatabaseUtils.getSafeFieldName(idColumn) + " = ? ;";
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			dc.sendPreparedUpdate(schema, deleteRecord, args, ato, dro);
			
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+deleteRecord+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), args);
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		}
		
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
		
		String schema = db.getSchema(tableName);		
		
		// set arguments
		String[] args = values;
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = db.getTypesOfColumns(tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++) {
			ato.setType(i, valueTypes[i]);
			columnNames[i] = DatabaseUtils.getSafeFieldName(columnNames[i]);
		}			
		
		String deleteRecords = 
			"DELETE FROM " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +
			"WHERE " + (Util.join(columnNames, " = ? AND ") +" = ? ") + 
			";";
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			dc.sendPreparedUpdate(schema, deleteRecords, args, ato, dro);
			
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+deleteRecords+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), args);
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		}
		
	}
	
	/**
	 * Get a table record, given a table name and id
	 * @param tableName
	 * @param id
	 * @return
	 */
	public TableRecordObject getRecord(String tableName, String id){
		
		TableRecordObject tro = new TableRecordObject();
		String schema = db.getSchema(tableName);
		String idColumn = db.getPrimaryKeyColumn(tableName);
		String idColumnType = db.getTypeOfColumn(tableName, idColumn, null);
		
		ArrayList<String[]> res;
		
		// set arguments
		String[] args = {id};		
		
		String[] columnsNames = db.getColumnNames(tableName);
		
		String getRecord = 
			"SELECT \"" + Util.join(columnsNames, "\", \"") + "\" " + // safe fieldnames
			"FROM " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +
			"WHERE " + DatabaseUtils.getSafeFieldName(idColumn) + " = ?;";	// id's require strict equality
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			ArgumentTypesObject ato = new ArgumentTypesObject();
			ato.setType(0, idColumnType);
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, getRecord, args, ato, 0).getRows();
			
			res = Util.getResultSetCopyInAList(rs, columnsNames);	
			
			if (res.size()>0) {
				String[] recordCell = res.get(0);				
				if (recordCell != null) {
					for (int i =0; i<columnsNames.length; i++){
						tro.addColumnAndValue(columnsNames[i], recordCell[i]);
					}
				}
			}
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+getRecord, args);
			throw new RuntimeException(error, e);
		}
		
		return tro;
	}
	
	
	/**
	 * Get multiple table records, given a table name and some record ids
	 * @param tableName
	 * @param ids
	 * @return
	 */
	public  TableRecordsObject getRecords(String tableName, String[] ids){
		
		TableRecordsObject tro = new TableRecordsObject();
		String schema = db.getSchema(tableName);
		String idColumn = db.getPrimaryKeyColumn(tableName);
		String idColumnType = db.getTypeOfColumn(tableName, idColumn, null);
		
		String[] columnsNames = db.getColumnNames(tableName);
		int idColumnIndex = Util.getIndexOf(idColumn, columnsNames);
		
		ArrayList<String[]> res;
		
		// set arguments
		String[] args = ids;		
		
		
		
		String getRecords = 
			"SELECT " + Util.join(columnsNames, ", ") + " " +
			"FROM " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +
			"WHERE " + DatabaseUtils.getSafeFieldName(idColumn) + " " +
			"IN ("+ DatabaseUtils.getStringOfQuestionMarks(ids)+");";	
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			ArgumentTypesObject ato = new ArgumentTypesObject();
			for (int i=0; i<ids.length; i++) {
				ato.setType(i, idColumnType);
			}
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, getRecords, args, ato, 0).getRows();			
						
			res = Util.getResultSetCopyInAList(rs, columnsNames);	
			
			if (res.size() == ids.length) { // expected number of rows?
			
				// process each row
				for (int i=0; i<ids.length; i++) {
					
					String[] recordCell = res.get(i);
					
					if (recordCell != null) {
						for (int j=0; j<columnsNames.length; j++) {
							String idOfthisRow = recordCell[idColumnIndex];
							tro.addIdColumnAndValue(idOfthisRow, columnsNames[j], recordCell[j]);
						}
					}
				}
				
			}
			
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+getRecords, args);
			throw new RuntimeException(error, e);
		}
		
		return tro;
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
		
		TableRecordObject tro = new TableRecordObject();
		String schema = db.getSchema(tableName);		
		
		ArrayList<String[]> res;
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] valueTypes = db.getTypesOfColumns(tableName, columnNamesToMatch);
		for (int i = 0; i<columnNamesToMatch.length; i++)
		{
			ato.setType(i, valueTypes[i]);
		}	
		
		
		// beware: 
		// ------
		// since this is a read-only command, operators are allowed in the arguments
		// (operators would of course be too dangerous in write commands)
		
		
		// matching pairs with suitable operator
		String[] matchingPairs = new String[columnNamesToMatch.length];
		for (int i=0; i<columnNamesToMatch.length; i++) {
			matchingPairs[i] = 
					DatabaseUtils.getSafeFieldName(columnNamesToMatch[i]) + " " + 
							db.getSuitableOperatorAndArg(tableName, columnNamesToMatch[i], valuesToMatch[i], true);
			valuesToMatch[i] = DatabaseUtils.removeFrontOperator(valuesToMatch[i]);
		}			
		
		// set arguments
		String[] args = valuesToMatch;
		
		String getRecord = 
			"SELECT * " +
			"FROM " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +				
			"WHERE " + (Util.join(matchingPairs, " AND ")) + ";";
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, getRecord, args).getRows();
			
			String[] columnsNames = db.getColumnNames(tableName);			
			res = Util.getResultSetCopyInAList(rs, columnsNames);	
			
			if (res.size()>0) {
				String[] recordCell = res.get(0);
				
				if (recordCell != null) {
					for (int i =0; i<columnsNames.length; i++) {
						tro.addColumnAndValue(columnsNames[i], recordCell[i]);
					}
				}
			}				
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+getRecord, args);
			throw new RuntimeException(error, e);
		}
		
		return tro;
	}
	
	
	/**
	 * Get multiple table records, given a table name and some values to match
	 * @param tableName
	 * @param ids
	 * @return
	 */
	public  TableRecordsObject getRecordsWithoutIds(String tableName, String[] columnNamesToMatch, String[] valuesToMatch){
		
		String[] columnsNames = db.getColumnNames(tableName);
		String schema = db.getSchema(tableName);
		
		// If the table has an ID, it will be used to distinguish between rows
		// Otherwise we will use a row counter for the same goal instead.
		
		String idColumn = db.getPrimaryKeyColumn(tableName);
		
		// if table has no ID column: assign a fake one
		if (idColumn == null) {
			idColumn = Constants.PRIMARYKEY_FIELDNAME;		
		}		
		
		// index of ID column (might be -1 if the table has none)		
		int idColumnIndex = Util.getIndexOf(idColumn, columnsNames);
		
		
		// prepare results
		
		TableRecordsObject tro = new TableRecordsObject();				
		
		ArrayList<String[]> res;
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] valueTypes = db.getTypesOfColumns(tableName, columnNamesToMatch);
		for (int i = 0; i<columnNamesToMatch.length; i++) {
			ato.setType(i, valueTypes[i]);
		}	
		
		
		// beware: 
		// ------
		// since this is a read-only command, operators are allowed in the arguments
		// (operators would of course be too dangerous in write commands)
		
		
		// matching pairs with suitable operator
		String[] matchingPairs = new String[columnNamesToMatch.length];
		for (int i=0; i<columnNamesToMatch.length; i++) {
			matchingPairs[i] = 
					DatabaseUtils.getSafeFieldName(columnNamesToMatch[i]) + " " + 
							db.getSuitableOperatorAndArg(tableName, columnNamesToMatch[i], valuesToMatch[i], true);
			valuesToMatch[i] = DatabaseUtils.removeFrontOperator(valuesToMatch[i]);
		}			
		
		// set arguments
		String[] args = valuesToMatch;
		
		String getRecord = 
			"SELECT * " +
			"FROM " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +				
			"WHERE " + (Util.join(matchingPairs, " AND ")) + ";";
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>>  rs = dc.sendPreparedQuery(schema, getRecord, args, ato, 0).getRows();
			
			res = Util.getResultSetCopyInAList(rs, columnsNames);	
			
			if (res.size()>0) {
				
				// process each row
				for (int i=0; i<res.size(); i++) {
					String[] recordCell = res.get(i);
					
					if (recordCell != null) {
						
						for (int j=0; j<columnsNames.length; j++) {
							
							String idOfthisRow = (idColumnIndex >-1 ? 
									recordCell[idColumnIndex]	// natural primary key 
									:
									"pkid_"+i);					// counter as id
							tro.addIdColumnAndValue(idOfthisRow, columnsNames[j], recordCell[j]);
						}
					}
				}
			}	
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+getRecord, args);
			throw new RuntimeException(error, e);
		}
		
		return tro;
	
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
		
		
		// *** IF WE HAVE NO SORT COLUMN, WE CAN'T COMPUTE A ROW NUMBER ***
		//     BECAUSE ROW NUMBER NEEDS A ROW ORDER!
		// impossible to compute row number, return -1
		boolean sortByIsEmpty = (sortBy == null || "".equals(sortBy) );
		if (sortByIsEmpty) {
			return "-1";
		}
		
		
		// Strategy to get the right table position will depend on having a primary key, or not having any.
		//
		// The original version of this function tried to find each row number at which some search value was to be found,
		// enabling the service to access the right position in the table (where the value is found) by using OFFSET. 
		//
		// But in large tables, this gives very serious performance problems (which is a known issue of Postgres).
		// So, to solve that, we first check if the table has a primary key (PK). If it has one, we gather the values of the PK
		// at which the search value is to be found, so the service can access the table at the right position by using these values,
		// which is much, much faster than using OFFSET. Of course, we still make use of the row number, as it is needed
		// for pagination (showing at which page the search value was found).
		
		
		String primaryKey = db.getPrimaryKeyColumn(tableName);
		
		String schema = db.getSchema(tableName);	
		ArrayList<String[]> res;
		String functionOuput = "0";
		
		
		// strategy #1, without primary key
		
		if (primaryKey == null) {
			
			// put sort information into arrays
					
			String[] aSortBy = sortBy.split(",");
			String[] aSortDir = sortDir.split(",");		
			
			// and build a complete sort string (ORDER BY field1 dir1, field2 dir2, ...) 
			// with safe field names, meaning quoted when PostgreSql requires that.
			
			String[] aSortBySafe = new String[aSortBy.length];
			for (int i=0; i<aSortBy.length; i++) {
				aSortBySafe[i] = DatabaseUtils.getSafeFieldName(aSortBy[i]) + " " + aSortDir[i];
			}
			String bigSortString = Util.join(aSortBySafe, ", ");
			
				
			// set arguments
			String[] args = Util.concatArr( filterValues, new String[]{columnValue} );
			
			// set argument types
			ArgumentTypesObject ato = new ArgumentTypesObject();
			String[] argsColumns = Util.concatArr( filterColumns, new String[]{columnName} );
			String[] valueTypes = db.getTypesOfColumns(tableName, argsColumns);
			for (int i=0; i<argsColumns.length; i++) {
				ato.setType(i, valueTypes[i]);
			}
			 
			// query 
			
			// since the row number is 1-based in Postgres, 
			// we need to subtract 1 to get a 0-based number in Lex'it
			String getRowNumberQuery =
					
				"SELECT rownumber, CAST( (row_number() OVER (ORDER BY rownumber ASC)) AS integer)-1 AS occurence_nr " +
				
				// begin of 'all_occurences'

				"FROM ("+ 
				
				"	SELECT min(rownumber) AS rownumber, page " +
				
				"	FROM ("+
				
				// to_be_grouped subquery
				
				"		SELECT "+ DatabaseUtils.getSafeFieldName(columnName) +", " +
				"			rownumber, (rownumber / " + iDisplayLength + ") AS page "+
				"		FROM ("+
				
				// sort by field part, with row_number  (tmp subquery)
				
				"			SELECT "+ DatabaseUtils.getSafeFieldName(columnName) +", " +
				"			 CAST(row_number() OVER (ORDER BY " + bigSortString + ") AS integer)-1 AS rownumber "+				
				"		 	FROM "+ DatabaseUtils.getSafeTableName(tableName, schema) +" ";
			
			// if filters are required, add those
			if (filterColumns!=null) {
				getRowNumberQuery += "	WHERE ";
				String[] parts = new String[filterColumns.length];
				for (int i=0; i<filterColumns.length; i++)
				{
					parts[i] = DatabaseUtils.getSafeFieldName(filterColumns[i]) + " " +
							db.getSuitableOperatorAndArg(tableName, filterColumns[i], filterValues[i], false);
				}
				getRowNumberQuery += Util.join(parts, " AND ");
			}
			
			// final part after the filters and numbering part:
			// the value we need to get to!
			getRowNumberQuery +=
				"		) tmp "+
				"	) to_be_grouped "+
				"	 WHERE "+ DatabaseUtils.getSafeFieldName(columnName) + " " + 
						db.getSuitableOperatorAndArg(tableName, columnName, columnValue, false) +
				"	 GROUP BY page " + 
				") all_occurences; ";
			

			
			
			// build a key for storing the query and the resultset, for the next goto-call
			
			String hashKey = getRowNumberQuery + Util.join(argsColumns, "|") + Util.join(args, "|");
			boolean alreadyCalled = db.getCache().getGotoQueryToResultSet().containsKey(hashKey);

			
			// we have built the right query, now use it to get the row number
			
			PostgresConnectionManager dc = db.getPostgresConnectionManager();
			
			try {
				List<Map<String, Object>> rs;
				if( alreadyCalled ) {
					res = db.getCache().getGotoQueryToResultSet().get(hashKey);
				}
				else {
					rs = dc.sendPreparedQuery(schema, getRowNumberQuery, args, ato, 0).getRows();
					res = Util.getResultSetCopyInAList(rs, new String[]{"rownumber"});
					db.getCache().setGotoQueryToResultSet(hashKey, res);
				}
						 
				// get row number for the right occurence
				
				if (res.size() > 0 && occurrenceNr < res.size() ) {				
					functionOuput = res.get(occurrenceNr)[0];
				}
				
			} 
			catch (Exception e) {
				String error = Util.getDebugInfoForConsole("Error while executing query "+getRowNumberQuery, args);
				throw new RuntimeException(error, e);
			}
		}
		
		
		// strategy #2 with use of primary key
		
		else {			
			// put sort information into arrays
					
			String[] aSortBy = sortBy.split(",");
			String[] aSortDir = sortDir.split(",");		
			
			// and build a complete sort string (ORDER BY field1 dir1, field2 dir2, ...) 
			// with safe field names, meaning quoted when PostgreSql requires that.
			
			String[] aSortBySafe = new String[aSortBy.length];
			for (int i=0; i<aSortBy.length; i++)
			{
				aSortBySafe[i] = DatabaseUtils.getSafeFieldName(aSortBy[i]) + " " + aSortDir[i];
			}
			String bigSortString = Util.join(aSortBySafe, ", ");
			
				
			// Set arguments
			
			// First argument in the query is the value we search for,
			// The following arguments in the query are the filter values.
			
			String[] argValues = Util.concatArr( new String[]{columnValue}, filterValues );
			String[] argsColumns = Util.concatArr( new String[]{columnName}, filterColumns );
			
			// set argument types
			ArgumentTypesObject ato = new ArgumentTypesObject();
			String[] valueTypes = db.getTypesOfColumns(tableName, argsColumns);
			for (int i=0; i<argsColumns.length; i++) {
				ato.setType(i, valueTypes[i]);
			}
			 
			// query 
			
			// since the row number is 1-based in Postgres, 
			// we need to subtract 1 to get a 0-based number in Lex'it
			
			String getRowNumberQuery =
					
				"	SELECT "+ DatabaseUtils.getSafeFieldName(primaryKey)+" AS ids_to_render, CAST( (row_number() OVER (ORDER BY page ASC)) AS integer)-1 AS occurence_nr "+
				
				"	FROM ("+
				
				// we will return to the client:
				// * a row number, which will be used for pagination
				// * the name of the PK column, and all the values of the PK to be found on a page [given an occurrence number ~ call number]
				//
				
				//		first row number of each page, and list of row id's contained in the page  
				"		SELECT 'row:'||min(rownumber)||':"+primaryKey+":'||string_agg(" + DatabaseUtils.getSafeFieldName(primaryKey) + "::text, '"+ Constants.ARG_INTERNAL_SEPARATOR + "'::text) AS " + DatabaseUtils.getSafeFieldName(primaryKey) + ", " +

				//          gather (in an array) a true/false value, telling us if the value we're searching for is found/not found in the row				
				"			array_agg(searched_column" + db.getSuitableOperatorAndArg(tableName, columnName, columnValue, false) + ") AS \"conditionIsMet_arr\", " +
				
				//			page number
				"			(rownumber / " + iDisplayLength + ") AS page "+
				"		FROM ("+
				
				// row-ids and row numbers
				
				"			SELECT " + DatabaseUtils.getSafeFieldName(primaryKey) + ", " + DatabaseUtils.getSafeFieldName(columnName)+" AS searched_column, " +
				"			 CAST(row_number() OVER (ORDER BY " + bigSortString + ") AS integer)-1 AS rownumber "+				
				"		 	FROM "+ DatabaseUtils.getSafeTableName(tableName, schema) +" ";
			
			// if filters are required, add those
			if (filterColumns!=null) {
				getRowNumberQuery += "	WHERE ";
				String[] parts = new String[filterColumns.length];
				for (int i=0; i<filterColumns.length; i++)
				{
					parts[i] = DatabaseUtils.getSafeFieldName(filterColumns[i]) + " " +
							db.getSuitableOperatorAndArg(tableName, filterColumns[i], filterValues[i], false);
				}
				getRowNumberQuery += Util.join(parts, " AND ");
			}
			
			// final part after the filters and numbering part:
			// 
			// is the value we're searching for to be found in the sets of rows?
			// (in that case, the conditionIsMet_arr must contain at least one 'true' value)
			getRowNumberQuery +=
				"		) tmp "+
				"		GROUP BY (rownumber / " + iDisplayLength + ") "+
				"	) grouped "+
				"	 WHERE \"conditionIsMet_arr\" @> ARRAY[true];"; 
			
						
			
			// build a key for storing the query and the resultset, for the next goto-call
			
			String hashKey = getRowNumberQuery + Util.join(argsColumns, "|") + Util.join(argValues, "|");
			boolean alreadyCalled = db.getCache().getGotoQueryToResultSet().containsKey(hashKey);

			
			
			// we have built the right query, now use it to get the row number
			
			PostgresConnectionManager dc = db.getPostgresConnectionManager();
			
			try {
				List<Map<String, Object>> rs;
				if( alreadyCalled ) {
					res = db.getCache().getGotoQueryToResultSet().get(hashKey);
				}
				else {
					rs = dc.sendPreparedQuery(schema, getRowNumberQuery, argValues, ato, 0).getRows();
					res = Util.getResultSetCopyInAList(rs, new String[]{"ids_to_render"});
					db.getCache().setGotoQueryToResultSet(hashKey, res);
				}
						 
				// get row number for the right occurence
				
				if (res.size() > 0 && occurrenceNr < res.size() ) {				
					functionOuput = res.get(occurrenceNr)[0];
				}
				
			} 
			catch (Exception e) {
				String error = Util.getDebugInfoForConsole("Error while executing query "+getRowNumberQuery, argValues);
				throw new RuntimeException(error, e);
			} 
			
		}	
		 
		return functionOuput;
		
	}
	
	
	/**
	 * Get id of a record 
	 * given some column names and values to match
	 * @param tableName
	 * @param columnNames
	 * @param columnValues
	 * @param dro
	 */
	public  String getIdOfRecord(
			String tableName, String[] columnNames, 
			String[] columnValues){
		
		String idOfCreatedRecord = null;
		String schema = db.getSchema(tableName);
		
		String idColumn = db.getPrimaryKeyColumn(tableName);
				
		
		ArrayList<String[]> res;
		
		// beware: 
		// ------
		// since this is a read-only command, operators are allowed in the arguments
		// (operators would of course be too dangerous in write commands)
		
		
		// matching pairs with suitable operator
		String[] matchingPairs = new String[columnNames.length];
		for (int i=0; i<columnNames.length; i++)
		{			
			matchingPairs[i] = 
					DatabaseUtils.getSafeFieldName(columnNames[i]) + " " + 
							db.getSuitableOperatorAndArg(tableName, columnNames[i], columnValues[i], true);
			columnValues[i] = DatabaseUtils.removeFrontOperator(columnValues[i]);
		}	
		
		// set arguments
		String[] args = columnValues;	
		
		
		String getIdQuery = 
			"SELECT " + idColumn + " " +
			"FROM " + DatabaseUtils.getSafeTableName(tableName, schema) + " " +
			"WHERE " + Util.join(matchingPairs, " AND ") + 
			";";	
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, getIdQuery, args).getRows();
			
			res = Util.getResultSetCopyInAList(rs, new String[]{idColumn});
			if (res.size()>0)
				idOfCreatedRecord = res.get(0)[0];
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+getIdQuery, args);
			throw new RuntimeException(error, e);
		}
		
		
		return idOfCreatedRecord;	
	}

}
