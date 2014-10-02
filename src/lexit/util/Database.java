package lexit.util;







import lexit.resources.Constants;
import lexit.resources.DbResponseObject;
import lexit.table.TableAndCountObject;
import lexit.table.TableRecordObject;
import lexit.table.UniqueValuesObject;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Random;

import javax.servlet.ServletContext;

/*
 * This class contains all the queries needed to read from or write into
 * the database used by Lex'it
 * 
 */
public class Database {
	
	// servlet context
	ServletContext context;
	
	// hashed for caching
	public HashMap<String, String> tableAndColumnNameToTypes = new HashMap<String, String>(); 
	public HashMap<String, String> tableAndColumnNameToCustomTypesValues = new HashMap<String, String>();
	public HashMap<String, String[]> functionNameToTypes = new HashMap<String, String[]>();
	public HashMap<String, String> tableNameToPrimaryKey = new HashMap<String, String>();
	public HashMap<String, String[]> tableNameToColumnNames = new HashMap<String, String[]>();

	// cache of total and partial counts
	public HashMap<String, Integer> tableNameToCount = new HashMap<String, Integer>();
	public HashMap<String, Boolean> tableNameToExactCount = new HashMap<String, Boolean>();
	public HashMap<String, Integer> queryToCount = new HashMap<String, Integer>();
	public HashMap<String, Boolean> queryToCountQuality = new HashMap<String, Boolean>();
	
	// hashmap in which database location, username and password are put
	public HashMap<String, String> databaseAccessHash = new HashMap<String, String>();
	
	// Standard value for the maximal allowed cost of a count query
	// Since the computed cost is generally speaking 25 times higher that the query execution time, 
	// the maximal allowed cost must be (max allowed duration) x 25. 
	int maxDuration = 3000;
	int maxAllowedCost = maxDuration * 25;
	
	
	// constructor
	public Database(String dbName, ServletContext context){
		
		try {
			this.context = context;
			readPropertiesFile(dbName);
		} catch (IOException e) {
			throw new RuntimeException("Error while reading the "+dbName+" properties file", e);
		}
	};
	
	/**
	 * Delete a record from a table
	 * @param tableName
	 * @param idValue
	 */
	public  void deleteRecord(String dbName,
			String tableName, String idValue, 
			DbResponseObject dro){
		
		String schema = getSchema(dbName, tableName);
		String idColumn = getPrimaryKeyColumn(dbName, tableName);			
		
		// set arguments
		String[] args = new String[]{idValue};
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		ato.setType(0, getTypeOfColumn(dbName, tableName, idColumn));
		
		String deleteRecord = 
			"DELETE FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + getSafeFieldName(idColumn) + " = ? ;";
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");			
			
			dc.sendPreparedUpdate(deleteRecord, args, ato, dro);
			
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+deleteRecord);
			throw new RuntimeException("Error while executing query "+deleteRecord, e);
		} 
		
		finally {
			closeDatabase(dc);
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
	public  void deleteRecordWithoutId(String dbName,
			String tableName, String[] columnNames, 
			String[] values,
			DbResponseObject dro ){
		
		String schema = getSchema(dbName, tableName);
		
		
		// set arguments
		String[] args = values;
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = getTypesOfColumns(dbName, tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);
			columnNames[i] = getSafeFieldName(columnNames[i]);
		}			
		
		String deleteRecords = 
			"DELETE FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + (Util.join(columnNames, " = ? AND ") +" = ? ") + 
			";";
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			dc.sendPreparedUpdate(deleteRecords, args, ato, dro);
			
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+deleteRecords);
			throw new RuntimeException("Error while executing query "+deleteRecords, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
	}
	
	
	/**
	 * Give the row number of a record, given some value to match in some column
	 * @param dbName
	 * @param tableName
	 * @param columnName
	 * @param columnValue
	 * @param sortBy
	 * @param sortDir
	 * @return a row number
	 */
	public  Integer getRowNumberOfRecord(String dbName,
			String tableName, String columnName, String columnValue, 
			String sortBy, String sortDir,
			String[] filterColumns, String[] filterValues){
		
		int rowNumber = 0;
		String schema = getSchema(dbName, tableName);				
		
		ArrayList<String[]> res;
		
		// set arguments
		// the value to search, and the filters
		String[] args = Util.concatArr( new String[]{columnValue}, filterValues );	
		
		// set argument types
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] argsColumns = Util.concatArr( new String[]{columnName}, filterColumns );
		String[] valueTypes = getTypesOfColumns(dbName, tableName, argsColumns);
		for (int i=0; i<argsColumns.length; i++)
		{
			ato.setType(i, valueTypes[i]);
		}
		
		String getRowNumberQuery = null;
		
		
		
		// *** IF WE HAVE NO SORT COLUMN, WE CAN'T COMPUTE A ROW NUMBER ***
		//     BECAUSE ROW NUMBER NEEDS A ROW ORDER!
		// impossible to compute row number, return -1
		boolean sortByIsEmpty = (sortBy == null || "".equals(sortBy) );
		if (sortByIsEmpty)
		{
			return -1;
		}
		
		// *** FIRST CASE ***
		// this query works only if the sorting column is the same as the searched column
		// (if it is not the same, we'll use the next query)
		else if ( columnName.equals(sortBy) )
		{
			getRowNumberQuery = 
				"SELECT COUNT(*) AS rownumber FROM " +
				"(SELECT * " +
				" FROM " + getSafeTableName(tableName, schema) + " " +
				" WHERE " + getSafeFieldName(columnName) + " " + ( sortDir.equalsIgnoreCase("asc")? "<" : ">" ) + " ? ";
			
			// if filters are required, add those
			if (filterColumns!=null)
			{
				for (int i=0; i<filterColumns.length; i++)
				{
					String oneFilterColumn = filterColumns[i];
					// 
					getRowNumberQuery += "AND "+getSafeFieldName(oneFilterColumn)+" "+
						getSuitableOperator(filterValues[i], false)+" ? ";
				}			
			}
					
			getRowNumberQuery +=
				( sortByIsEmpty ? "" : " ORDER BY "+getSafeFieldName(sortBy)+" "+sortDir ) +
				") AS tmp;";
		}
				
	
		// *** OTHER CASE ***
		// if the sorting column is different from the searched column
		// this query is slow, but reliable! 
		else if ( !columnName.equals(sortBy) )
		{
			// set arguments
			args = Util.concatArr( filterValues, new String[]{columnValue} );
			
			// set argument types
			ato = new ArgumentTypesObject();
			argsColumns = Util.concatArr( filterColumns, new String[]{columnName} );
			valueTypes = getTypesOfColumns(dbName, tableName, argsColumns);
			for (int i=0; i<argsColumns.length; i++)
			{
				ato.setType(i, valueTypes[i]);
			}
			 
			// query
			
			// since the row number is 1-based in Postgres, 
			// we need to subtract 1 to get a 0-based number in Lex'it
			getRowNumberQuery = 
				"SELECT CAST(rownumber AS integer)-1 AS rownumber FROM "+
				"(SELECT "+getSafeFieldName(columnName)+", row_number() OVER (ORDER BY "+getSafeFieldName(sortBy)+" "+sortDir+") AS rownumber "+
				" FROM "+getSafeTableName(tableName, schema)+" ";
			
			// if filters are required, add those
			if (filterColumns!=null)
			{
				getRowNumberQuery += "WHERE ";
				String[] parts = new String[filterColumns.length];
				for (int i=0; i<filterColumns.length; i++)
				{
					parts[i] = getSafeFieldName(filterColumns[i])+" "+
						getSuitableOperator(filterValues[i], false)+" ? ";
				}
				getRowNumberQuery += Util.join(parts, " AND ");
			}
			
			// final part after the filters:
			// the value we need to get to!
			getRowNumberQuery +=
				") tmp "+
				" WHERE "+getSafeFieldName(columnName) + " " + getSuitableOperator(columnValue, false) + " ?; ";
		}
		
		
		// we have built the right query, now use it to get the row number
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");	
			
			ResultSet rs = dc.sendPreparedQuery(getRowNumberQuery, args, ato);
			
			res = getResultsInAList(rs, new String[]{"rownumber"});
			if (res.size()>0)
			{				
				rowNumber = Integer.parseInt(res.get(0)[0]);
			}
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getRowNumberQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		 
		return rowNumber;
		
	}
	
	
	/**
	 * Get id of a record 
	 * given some column names and values to match
	 * @param tableName
	 * @param columnNames
	 * @param values
	 * @param dro
	 */
	public  String getIdOfRecord(String dbName,
			String tableName, String[] columnNames, 
			String[] values){
		
		String idOfCreatedRecord = null;
		String schema = getSchema(dbName, tableName);
		
		String idColumn = getPrimaryKeyColumn(dbName, tableName);
				
		
		ArrayList<String[]> res;
		
		// set arguments
		String[] args = values;		
		
		for (int i=0; i<columnNames.length; i++)
		{
			columnNames[i] = getSafeFieldName(columnNames[i]);
		}
		
		String getIdQuery = 
			"SELECT " + idColumn + " " +
			"FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + (Util.join(columnNames, " = ? AND ") +" = ? ") + 
			";";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");	
			
			ResultSet rs = dc.sendPreparedQuery(getIdQuery, args);
			
			res = getResultsInAList(rs, new String[]{idColumn});
			if (res.size()>0)
				idOfCreatedRecord = res.get(0)[0];
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getIdQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return idOfCreatedRecord;	
	}
	
	
	/**
	 * Get all unique values stored in a given column
	 * @param dbName
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public UniqueValuesObject getUniqueValues(String dbName, String tableName, String columnName) {
	    String schema = getSchema(dbName, tableName);

	    // GROUP BY can be faster than DISTINCT
	    // see: http://stackoverflow.com/questions/6598778/solution-for-speeding-up-a-slow-select-distinct-query-in-postgres
	    String query = "SELECT " + columnName + " " + 
	      "FROM " + getSafeTableName(tableName, schema) + " " + 
	      "GROUP BY " + columnName + " " +
	      "ORDER BY " + columnName + ";";

	    PostgresDatabaseCommunication dc = connectDatabase(dbName);

	    UniqueValuesObject uvo = new UniqueValuesObject();
	    ArrayList<String[]> res;
	    try {
	      dc.sendUpdate("SET search_path TO " + schema + "; ");

	      ResultSet rs = dc.sendQuery(query);

	       res = getResultsInAList(rs, new String[] { columnName });
	      if (res.size() > 0)
	      {
	        for (String[] oneRecord : res)
	        {
	          String oneValue = oneRecord[0].trim();
	          if (!oneValue.isEmpty())
	            uvo.addValue(oneValue);
	        }
	      }
	    }
	    catch (Exception e) {
	      throw new RuntimeException("Error while executing query " + query, e);
	    }
	    finally
	    {
	      closeDatabase(dc);
	    }

	    return uvo;
	  }
	
	
	/**
	 * Get a table record, given a table name and id
	 * @param dbName
	 * @param tableName
	 * @param id
	 * @return
	 */
	public  TableRecordObject getRecord(String dbName, String tableName, String id){
		
		TableRecordObject tro = new TableRecordObject();
		String schema = getSchema(dbName, tableName);
		String idColumn = getPrimaryKeyColumn(dbName, tableName);
				
		
		ArrayList<String[]> res;
		
		// set arguments
		String[] args = {id};		
		
		String getRecord = 
			"SELECT * " +
			"FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + getSafeFieldName(idColumn) + " = ?;";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");				
			
			ResultSet rs = dc.sendPreparedQuery(getRecord, args);
			
			String[] columnsNames = getColumnNames(dbName, tableName);			
			res = getResultsInAList(rs, columnsNames);	
			
			if (res.size()>0)
			{
				String[] recordCell = res.get(0);
				
				if (recordCell != null)
				{
					for (int i =0; i<columnsNames.length; i++)
					{
						tro.addColumnAndValue(columnsNames[i], recordCell[i]);
					}
				}
			}
			
			
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getRecord, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return tro;
	}
	
	
	/**
	 * Call a database function, given its name and a list of arguments
	 * @param dbName
	 * @param functionName
	 * @param args
	 * @return
	 */
	public  TableRecordObject callFunction(String dbName, String functionName, String[] args){
		
		// prevent sql injection
		args = Util.removeSuspiciousSql(args);
		
		// get the function argument types
		String[] argumentTypes = getFunctionTypes(dbName, functionName);
		
		// process the argument list according to the type
		// (t.i. add quotes for text args)
		if (argumentTypes!= null && args.length == argumentTypes.length)
		{
			for (int i=0; i<argumentTypes.length; i++)
			{
			if (argumentTypes[i].equals("text") && !(args[i].startsWith("'") && args[i].endsWith("'")) )
				args[i] = "'"+args[i]+"'";
			}
		}
		
		TableRecordObject tro = new TableRecordObject();
				
		ArrayList<String[]> res;
		
		String getRecord = 
			"SELECT " + functionName + "("+Util.join(args, ",")+");";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			ResultSet rs = dc.sendQuery(getRecord);
			
			String[] columnsNames = getColumnNamesFromResultSet(rs);			
			res = getResultsInAList(rs, columnsNames);			
			
			for (int i=0; i<columnsNames.length; i++)
			{
				String[] allCells = new String[res.size()];
				for (int j=0; j<res.size(); j++)
				{
					allCells[j] = res.get(j)[i].trim();
				}
				tro.addColumnAndValue(columnsNames[i], Util.join(allCells, Constants.ARG_INTERNAL_SEPARATOR));
			}			
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getRecord, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return tro;
	}
	
	/**
	 * Insert a record into a table
	 * @param tableName
	 * @param columnNames
	 * @param values
	 */
	public  void insertRecord(String dbName,
			String tableName, String[] columnNames, 
			String[] values,
			DbResponseObject dro){
		
		String schema = getSchema(dbName, tableName);
		
		for (int i=0; i<columnNames.length; i++)
		{
			columnNames[i] = getSafeFieldName(columnNames[i]);
		}
		
		String insertRecords = 
			"INSERT INTO " + getSafeTableName(tableName, schema) + " ("+ Util.join(columnNames, ",") + ") " +
			"VALUES (" + Util.getStringOfQuestionMarks(values) + ") ;";		
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = getTypesOfColumns(dbName, tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);
		}
		
				
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			dc.sendPreparedUpdate(insertRecords, values, ato, dro);
			
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+insertRecords);
			throw new RuntimeException("Error while executing query "+insertRecords, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
	}
	/**
	 * Insert some records into a table
	 * given ids to match
	 * the matching records will be re-inserted with modified values
	 * according to some patterns and replacement values
	 * @param dbName
	 * @param tableName
	 * @param rowIds
	 * @param columnsToCopy
	 * @param filterColumnName
	 * @param filterValue
	 * @param replacementValue
	 * @param returningField
	 * @param dro
	 */
	public  void insertFromExistingRecords(String dbName, String tableName, 
			String[] rowIds, String[] columnsToCopy, 
			String filterColumnName, String filterValue, String replacementValue, 
			DbResponseObject dro){
		
		
		String schema = getSchema(dbName, tableName);
		String primaryKey = getPrimaryKeyColumn(dbName, tableName);
		
		String insertQuery = "INSERT INTO "+getSafeTableName(tableName, schema)+" "+
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
				allParts[i] = getSafeFieldName(oneColumnToInsert);
			// if the current column has a replacement value, we will select the column and modify the value in it
			else
				allParts[i] = "regexp_replace("+getSafeFieldName(oneColumnToInsert)+", '"+getDoubleEscape(pattern)+"', '"+getValidSqlBackReference(replacementValue)+"') AS "+getSafeFieldName(oneColumnToInsert);
		}
		
		// add the parts like SELECT regexp_replace(colname, '^regen', 'zon'), regexp(...), regexp(...) ...
		insertQuery += Util.join(allParts, ",")+" "+
		"FROM "+getSafeTableName(tableName, schema)+" "+
		"WHERE "+getSafeFieldName(primaryKey)+" = ? ;";
				
				
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String valueTypeOfIdColumn = getTypeOfColumn(dbName, tableName, primaryKey);
				
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			for (int i = 0; i<rowIds.length; i++)
			{
				ato.setType(0, valueTypeOfIdColumn);
				dc.sendPreparedUpdate(insertQuery, new String[]{rowIds[i]}, ato, dro);
			}
			
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+insertQuery);
			throw new RuntimeException("Error while executing query "+insertQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
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
	public  void insertFromExistingRecordsWithoutId(String dbName,
			String tableName, 
			String[] filterColumnNames, String[] filterValues, 
			String[] replacementColumnNames, String[] replacementValues,
			String returningField, DbResponseObject dro){
		
		String type="update";
		
		String schema = getSchema(dbName, tableName);
		String idOfCreatedRecord = "";
		String idColumn = returningField;
		
		// build query:
		// we'll be doing an 'insert' of rows
		// modified by a 'select' with regexp_replace.
		String insertQuery = "INSERT INTO "+getSafeTableName(tableName, schema)+" "+
		"SELECT ";
		
		String[] allParts = new String[filterColumnNames.length];
		for (int i=0; i<filterColumnNames.length; i++)
		{			
			String oneFilterColumnName = filterColumnNames[i];
			String pattern = filterValues[i];
			
			int indexInReplacementColumnNames = Util.getIndexOf(oneFilterColumnName, replacementColumnNames);
			String replacement = indexInReplacementColumnNames>-1 ?
					replacementValues[indexInReplacementColumnNames] : null;
			
			// if we have no replacement value, we will select the column without modifying it 
			if (replacement == null)
				allParts[i] = getSafeFieldName(oneFilterColumnName);
			// if we do have a replacement value, we will select the column and modify the value in it
			else
				allParts[i] = "regexp_replace("+getSafeFieldName(oneFilterColumnName)+", '"+getDoubleEscape(pattern)+"', '"+getValidSqlBackReference(replacement)+"') AS "+getSafeFieldName(oneFilterColumnName);
		}
		
		// add the parts like SELECT regexp_replace('colname', '^regen', 'zon'), regexp(...), regexp(...) ...
		insertQuery += Util.join(allParts, ",")+" "+
		"FROM "+getSafeTableName(tableName, schema)+" "+
		"WHERE ";
		
		allParts = new String[filterColumnNames.length];
		for (int i=0; i<filterColumnNames.length; i++)
		{
			String oneColumnName = filterColumnNames[i];
			String pattern = filterValues[i];
			allParts[i] = getSafeFieldName(oneColumnName) + " " + getSuitableOperator(pattern, true) + " ? ";
		}
		
		// add the condition WHERE col ~* '^regex' AND ...
		insertQuery += Util.join(allParts, " AND ") + " ";
		
		// do we expect a value in return?
		if (returningField != null && !returningField.equals("null"))
		{
			type = "insert";
			insertQuery += "RETURNING "+getSafeFieldName(idColumn);
		}
			
		
		// close with a semicolon
		insertQuery += ";";
		
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = getTypesOfColumns(dbName, tableName, filterColumnNames);
		for (int i = 0; i<filterColumnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);
		}
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			ResultSet rs = null;
			
			if (type.equals("insert"))
			{
				rs = dc.sendPreparedQuery(insertQuery, filterValues);
				
			}
			else
			{
				dc.sendPreparedUpdate(insertQuery, filterValues, ato, dro);				
			}
			
			ArrayList<String[]> res;
			if (type.equals("insert"))
			{
				res = getResultsInAList(rs, new String[]{idColumn});
				idOfCreatedRecord = Util.join(res.get(0), ",");	
				dro.setResponse(idOfCreatedRecord);
			} 	
			
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+insertQuery);
			throw new RuntimeException("Error while executing query "+insertQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
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
	public  void insertRecordAndGetItsId(String dbName,
			String tableName, String[] columnNames,
			String[] values, 
			String returningField, DbResponseObject dro){
		
		String idOfCreatedRecord = "";
		String idColumn = (returningField != null && !returningField.equals("null")) ?
				returningField : getPrimaryKeyColumn(dbName, tableName);
		
		String schema = getSchema(dbName, tableName);
		
		for (int i=0; i<columnNames.length; i++)
		{
			columnNames[i] = getSafeFieldName(columnNames[i]);
		}
		
		String insertRecords = 
			"INSERT INTO " + getSafeTableName(tableName, schema) + " ("+ Util.join(columnNames, ",") + ") " +
			"VALUES (" + Util.getStringOfQuestionMarks(values) + ") " +
			"RETURNING "+getSafeFieldName(idColumn)+";";		
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = getTypesOfColumns(dbName, tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);			
		}
				
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			ResultSet rs = dc.sendPreparedQuery(insertRecords, values, ato);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{idColumn});
			idOfCreatedRecord = res.get(0)[0];	
			dro.setResponse(idOfCreatedRecord);
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+insertRecords);
			throw new RuntimeException("Error while executing query "+insertRecords, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		
	};
	
	/**
	 * Update one column in a record in a table
	 * @param tableName
	 * @param rowId
	 * @param columnName
	 * @param valueToUpdate
	 */
	public  void updateOneColumn(String dbName,
			String tableName, String rowId, String columnName, 
			String valueToUpdate,
			DbResponseObject dro){
		
		String schema = getSchema(dbName, tableName);
		String idColumn = getPrimaryKeyColumn(dbName, tableName);
		
		// set arguments
		String[] args = new String[]{valueToUpdate, rowId};		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		ato.setType(0, getTypeOfColumn(dbName, tableName, columnName));
		ato.setType(1, getTypeOfColumn(dbName, tableName, getPrimaryKeyColumn(dbName, tableName)));
		
		
		String updateRecords = 
			"UPDATE " + getSafeTableName(tableName, schema) + " SET "+ getSafeFieldName(columnName) +" = ? " +
			"WHERE "+ getSafeFieldName(idColumn) +" = ? ;";	
		
				
		PostgresDatabaseCommunication dc = connectDatabase(dbName);			
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");	
			
			dc.sendPreparedUpdate(updateRecords, args, ato, dro);
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+updateRecords);
			throw new RuntimeException("Error while executing query "+updateRecords, e);
		}
		
		finally {
			closeDatabase(dc);
		}
	}
	
	/**
	 * Update one or more columns in one single record of a table
	 * @param tableName
	 * @param rowId
	 * @param columnNames
	 * @param valuesToUpdate
	 * @param dro
	 */
	public  void updateWholeRecord(String dbName,
			String tableName, String rowId, String[] columnNames,
			String[] valuesToUpdate,
			DbResponseObject dro){
		
		String schema = getSchema(dbName, tableName);
		String idColumn = getPrimaryKeyColumn(dbName, tableName);
		
		// set arguments
		String[] args = Util.concatArr(valuesToUpdate, new String[]{rowId}); 
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		for (int i=0; i< columnNames.length; i++)
		{
			String oneColumn = columnNames[i];
			columnNames[i] = getSafeFieldName(columnNames[i]);
			ato.setType(i, getTypeOfColumn(dbName, tableName, oneColumn));
		}		
		ato.setType(columnNames.length, getTypeOfColumn(dbName, tableName, getPrimaryKeyColumn(dbName, tableName)));
		
		
		String updateRecords = 
			"UPDATE " + getSafeTableName(tableName, schema) + 
			" SET "+ (Util.join(columnNames, " = ?,") +" = ? ") +
			"WHERE "+ getSafeFieldName(idColumn) +" = ? ;";
		
				
		PostgresDatabaseCommunication dc = connectDatabase(dbName);			
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");	
			
			dc.sendPreparedUpdate(updateRecords, args, ato, dro);
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+updateRecords);
			throw new RuntimeException("Error while executing query "+updateRecords, e);
		}
		
		finally {
			closeDatabase(dc);
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
	public  void updateRecordWithoutId(String dbName,
			String tableName, 
			String[] columnNamesToMatch, String[] valuesToMatch,
			String[] columnNamesToUpdate, String[] valuesToUpdate,
			DbResponseObject dro ){
		
		String schema = getSchema(dbName, tableName);
			
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] valueTypes = getTypesOfColumns(dbName, tableName, columnNamesToMatch);
		for (int i = 0; i<columnNamesToMatch.length; i++)
		{
			ato.setType(i, valueTypes[i]);
		}			
		// set arguments
		String[] args = valuesToMatch;
		
		// setting pairs [ SET colname = regexp_replace(colname, regexp, replacement) ]
		String[] settingPairs = new String[columnNamesToUpdate.length];
		for (int i=0; i<columnNamesToUpdate.length; i++)
		{
			int indexOfMatcher = Util.getIndexOf(columnNamesToUpdate[i], columnNamesToMatch);
			settingPairs[i] = getSafeFieldName(columnNamesToUpdate[i]) + " = " +
			(
				allowsRegex(getTypeOfColumn(dbName, tableName, columnNamesToUpdate[i])) && indexOfMatcher>-1 ?
					"regexp_replace("+getSafeFieldName(columnNamesToUpdate[i]) + ", '" + getDoubleEscape(valuesToMatch[indexOfMatcher]) + "', '" + getValidSqlBackReference(valuesToUpdate[i]) + "') " :
						"'"+getValidSqlBackReference(valuesToUpdate[i])+"'"
			);
		}
		
		// matching pairs with suitable operator
		String[] matchingPairs = new String[columnNamesToMatch.length];
		for (int i=0; i<columnNamesToMatch.length; i++)
		{
			matchingPairs[i] = getSafeFieldName(columnNamesToMatch[i]) + " " + getSuitableOperator(valuesToMatch[i], true) + " ? ";
		}
		
		String updateRecords = 
			"UPDATE " + getSafeTableName(tableName, schema) + " " +
			"SET "+ Util.join(settingPairs, ",") + " " +
			"WHERE " + (Util.join(matchingPairs, " AND ")) + ";";		
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");			
			
			dc.sendPreparedUpdate(updateRecords, args, ato, dro);
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+updateRecords);
			throw new RuntimeException("Error while executing query "+updateRecords, e);
		}
		
		finally {
			closeDatabase(dc);
		}
		
	}
	
	
	/**
	 * try a quick and dirty count (much faster than Postgres Count(*))
	 * @param dbName
	 * @param tableName
	 * @param query
	 * @return
	 */
	public Integer getEstimateCount(String dbName, String countQuery){
		
		int count = -1;
		
		// random id for a temporary table, to make sure we won't try to create an already existing table
		int tableId = Math.abs(new Random().nextInt());
		
		if (Constants.debug) System.out.println("## Get count estimate (fast)");
		
		// special case:
		// if some argument requires strict equality, modify the query accordingly
		// change  [~*/~ 'exact:...']   into  [= '...']
		//                                  1    2       3     4   5     6
		countQuery = countQuery.replaceAll("(!|)(~\\*|~)(\\s+)(E)([\"'])(exact:)", "$1= $5");
		
		// first create the count_estimate function if it doesn't exit yet
		// see: http://postgresql.1045698.n5.nabble.com/Faster-count-td2143081.html
		//  or  http://wiki.postgresql.org/wiki/Count_estimate
		//
		// This method works for both complex queries and views
		//
		// Important: getting a count estimate from the pg_class table is not possible here,
		//            since that contains only counts of all records of a tables (without WHERE-conditions)
		String query1 = "DO LANGUAGE plpgsql " +
				"$$ "+
				"DECLARE "+
				"    rec   record; "+
				"    rows  integer; "+
				"BEGIN "+
				"    FOR rec IN EXECUTE 'EXPLAIN "+countQuery.replaceAll("'", "''")+"' LOOP "+
				"        rows := substring(rec.\"QUERY PLAN\" FROM ' rows=([[:digit:]]+)'); "+
				"        EXIT WHEN rows IS NOT NULL; "+
				"    END LOOP;"+
				
				"CREATE TEMPORARY TABLE t"+tableId+" "+
				"AS SELECT rows;"+
				
				"END; "+
				"$$; ";
		
		String query2 = "SELECT rows FROM t"+tableId+"; ";
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);	
		
		try {
			if (Constants.debug) System.out.println("## Get count estimate (fast)");
			
			dc.sendUpdate(query1);
			ResultSet rs = dc.sendQuery(query2);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"rows"});		
			count = Integer.parseInt(res.get(0)[0]);
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+query1+" or "+query2, e);
		} 
		finally {
			closeDatabase(dc);
		}
		
		return count;		
	}
	
	
	/**
	 * get the cost of a query
	 * @param dbName
	 * @param tableName
	 * @param query
	 * @return
	 */
	public Integer getQueryCost(String dbName, String countQuery){
		
		int queryCost = -1;
		
		// random id for a temporary table, to make sure we won't try to create an already existing table
		int tableId = Math.abs(new Random().nextInt());
		
		if (Constants.debug) System.out.println("## Get query cost");
		
		
		// special case:
		// if some argument requires strict equality, modify the query accordingly
		// change  [~*/~ 'exact:...']   into  [= '...']
		//                                  1    2       3     4   5     6
		countQuery = countQuery.replaceAll("(!|)(~\\*|~)(\\s+)(E)([\"'])(exact:)", "$1= $5");
		
		String query1 = 
				"DO LANGUAGE plpgsql " +
				"$$ "+
				"DECLARE "+
				"    rec   record; "+
				"    cost  integer; "+
				"BEGIN "+
				"    FOR rec IN EXECUTE 'EXPLAIN "+countQuery.replaceAll("'", "''")+"' LOOP "+
				"        cost := substring(rec.\"QUERY PLAN\" FROM 'cost=[[:digit:]]+.[[:digit:]]+..([[:digit:]]+)'); "+
				"        EXIT WHEN cost IS NOT NULL; "+
				"    END LOOP;"+
				
				"CREATE TEMPORARY TABLE t"+tableId+" "+
				"AS SELECT cost;"+
				
				"END; "+
				"$$;";
				
				
		String query2 = "SELECT cost FROM t"+tableId+"; ";
	
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);	
		
		try {		
			
			dc.sendUpdate(query1);
			ResultSet rs = dc.sendQuery(query2);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"cost"});		
			queryCost = Integer.parseInt(res.get(0)[0]);
			
		} catch (Exception e) {
			if (Constants.debug)
				System.out.println("Error while executing query "+query1+" or "+query2);
			
			// for the moment, we mustn't throw exception, to make sure this function always
			// give some results otherwise the client won't have any count!!!
			//throw new RuntimeException("Error while executing query "+query1+" or "+query2, e);
		} 
		finally {
			closeDatabase(dc);
		}
		
		if (Constants.debug) System.out.println("queryCost = "+queryCost);
		return queryCost;		
	}
	
	
	
	
	/**
	 * get the true exact count of a table
	 * @param tableName
	 * @param columnNames
	 * @param values
	 * @param dro
	 */
	public Integer getTrueCountOfATable(String dbName, String tableName){
		
		
		String schema = getSchema(dbName, tableName);			
		int count = -1;
		ArrayList<String[]> res;
		
		String getCountQuery = 
			"SELECT COUNT(*) AS rowcount " +
			"FROM " + getSafeTableName(tableName, schema) + ";";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");	
			
			// get the count, but set a time limit 
			ResultSet rs = dc.sendQueryWithTimeout(getCountQuery, 2000);
			
			res = getResultsInAList(rs, new String[]{"rowcount"});
			// if the time limit was exceeded, we have a null resultset 
			if (res.size()>0 && res.get(0).length>0)
				count = Integer.parseInt(res.get(0)[0]);
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getCountQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return count;
		
	}
	
	
	/**
	 * Get list of available tables and views
	 * @param tableName
	 * @return
	 */
	public  ArrayList<String[]> getTableList(String dbName){

		String schema = getSchemaName(dbName);
		
		// BEWARE: the following shorter query seems to not work in Postgres 8 (only 9)
		//         so we use a more complex query which is working in all versions (as far as we could test)
		// 	SELECT table_name, 
		// 	table_name||' ('||table_type||')' AS description 
		// 	FROM information_schema.tables 
		// 	WHERE table_schema = ? 
		// 	ORDER BY table_name ASC;
		
		// vocabulary in this query result:
		//
		// BASE TABLE	: physical structure that contains stored records
		// VIEW			: named result of an SQL query 
		
		String query = "SELECT c.relname AS table_name, " +
				"c.relname||' ('||CASE c.relkind WHEN 'r' THEN 'BASE TABLE' WHEN 'v' THEN 'VIEW'  " +
				"END||')'  AS description, " + // view OR table
				"CASE c.relkind WHEN 'r' THEN 'BASE TABLE' WHEN 'v' THEN 'VIEW' END AS type, " +
				"obj_description(c.oid, 'pg_class') AS comment " + // show table comment if available				
				"FROM pg_catalog.pg_class c " +
				//"LEFT JOIN pg_catalog.pg_user u ON u.usesysid = c.relowner " +
				"FULL JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace " +
				"WHERE c.relkind IN ('r','v','') " + // now we only want views and tables
				"AND n.nspname = ? " +
				"AND n.nspname NOT IN ('pg_catalog', 'pg_toast') " +
				"AND n.nspname != 'information_schema' " + // this one instead of "AND pg_catalog.pg_table_is_visible(c.oid) "
				"ORDER BY 1,2;";
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		ArrayList<String[]> result = new ArrayList<String[]>();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			ResultSet rs = dc.sendPreparedQuery(query, new String[]{schema});
			
			result = getResultsInAList(rs, new String[]{"table_name", "description", "comment", "type"});		
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+query, e);
		} 
		finally {
			closeDatabase(dc);
		}
		
		return result;
	}
	
	/**
	 * Get list of available tables (NO views)
	 * @param tableName
	 * @return
	 */
	public  ArrayList<String> getTrueTablesList(String dbName){

		String schema = getSchemaName(dbName);
		
		// BEWARE: the following shorter query seems to not work in Postgres 8 (only 9)
		//         so we use a more complex query which is working in all versions (as far as we could test)
		// 	SELECT table_name, 
		// 	table_name||' ('||table_type||')' AS description 
		// 	FROM information_schema.tables 
		// 	WHERE table_schema = ? 
		// 	ORDER BY table_name ASC;
		
		String query = "SELECT c.relname AS table_name " +
				"FROM pg_catalog.pg_class c " +
				"LEFT JOIN pg_catalog.pg_user u ON u.usesysid = c.relowner " +
				"LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace " +
				"WHERE c.relkind = 'r' " + // now we only want genuine tables (no views)
				"AND n.nspname = ? " +
				"AND n.nspname NOT IN ('pg_catalog', 'pg_toast') " +
				"AND pg_catalog.pg_table_is_visible(c.oid);";
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		ArrayList<String[]> result = new ArrayList<String[]>();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			ResultSet rs = dc.sendPreparedQuery(query, new String[]{schema});
			
			result = getResultsInAList(rs, new String[]{"table_name"});		
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+query, e);
		} 
		finally {
			closeDatabase(dc);
		}
		
		// return one-dimensional array of table names
		ArrayList<String> trueTablesList = new ArrayList<String>(); 
		for (String[] oneRecord : result)
		{
			trueTablesList.add(oneRecord[0]);
		}
		
		return trueTablesList;
	}
	
	/**
	 * Check if some content is suitable to be eg. searched in a given column type
	 * @param value
	 * @param columnType
	 * @return
	 */
	public boolean valueIsSuitableForColumnType(String value, String columnType){
		
		// remove operators in front
		value = removeFrontOperator(value);
		
		// null values
		if (value == null)
			return true;
		
		// booleans
		if (value.matches("true|false") && columnType.equals("boolean"))
			return true;
		
		// user-defined
		// (searching a user-defined field with a string as '-' will cause a crash if we don't cast to text)
		if ( columnType.equals("USER-DEFINED") && !Util.containsSomeLetters(value) )
			return false;
		
		// textual
		// (a string containing letters is not suitable to a non-textual field)
		if ( Util.containsSomeLetters(value) && !PostgresDatabaseCommunication.isTextualType(columnType) )
			return false;
		
		// numeric
		// (a string containing other things than digits is not suitable to numeric field)
		if (value.matches(".*([^\\d]).*") && PostgresDatabaseCommunication.isNumericType(columnType))
			return false;
		
		return true;
	}
	
	
	/**
	 * Build the list of columns following a SELECT
	 * in a safe way:
	 * we need to make sure that some column names get quoted
	 * as they are called after reserved command names (like 'offset')
	 * or consists of capitals etc.
	 * @param allColumns
	 * @return
	 */
	public String getCommaSeparatedListOfColumnNamesForaSelect(String[] allColumns){
		
		for (int i=0; i<allColumns.length; i++)
		{
			allColumns[i] = getSafeFieldName(allColumns[i]);
		}
		
		return Util.join(allColumns, ", ");
	}
	
	// do we have a reserved sql keyword?
	public boolean isReservedSqlWord(String word){
		
		// (get the list: SELECT STRING_AGG(word, '|') FROM pg_get_keywords() WHERE catdesc = 'reserved')
		return (word.matches("all|analyse|analyze|and|any|array|as|asc|asymmetric|" +
				"both|case|cast|check|collate|column|constraint|create|current_catalog|" +
				"current_date|current_role|current_time|current_timestamp|current_user|" +
				"default|deferrable|desc|distinct|do|else|end|except|false|fetch|for|foreign|" +
				"from|grant|group|having|in|initially|intersect|into|leading|limit|localtime|" +
				"localtimestamp|not|null|offset|on|only|or|order|placing|primary|references|" +
				"returning|select|session_user|some|symmetric|table|then|to|trailing|true|" +
				"union|unique|user|using|variadic|when|where|window|with"));
	}
	
	
	/**
	 * Get the content of a table,
	 * given its name and several filters and sorting options
	 */
	public  TableAndCountObject getTable(String dbName,
			String tableName, int countOfWholeTable, String[] allColumns, 
			int iDisplayLength, 
			int iDisplayStart, String sSearch, 
			ArrayList<String> aSearchColumnNames, ArrayList<String> aSearchColumnValues, 
			ArrayList<Boolean> aCaseSensitiveColumnSearch,
			boolean weMustSort, 
			String[] aSortCol, String[] aSortDir){
	
		String schema = getSchema(dbName, tableName);
		
		// get table content		
		
		// first locate the primary key
		String primaryKey = getPrimaryKeyColumn(dbName, tableName);
		
		// normal query
		String query = "SELECT "+getCommaSeparatedListOfColumnNamesForaSelect(allColumns)+" FROM "+getSafeTableName(tableName, schema) + " ";
		// results count query		
		String countQuery = "SELECT COUNT(*) AS count FROM "+getSafeTableName(tableName, schema) + " ";
				
		String[] columnsToSearch;
		ArrayList<String> queryValues = new ArrayList<String>();
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		
		// main search, without column filters
		
		// [ beware: null is also a genuine search value, so it's considered non-empty ]
		if ( (sSearch == null || !sSearch.isEmpty()) && aSearchColumnValues.size()==0)
		{
			// main search means search all columns at once
			columnsToSearch = getColumnNames(dbName, tableName);
			ArrayList<String> queryParts = new ArrayList<String>();
			ato = new ArgumentTypesObject();
			
			// build the query condition for each column
			for (int i=0; i<columnsToSearch.length; i++)
			{
				// build current part
				queryValues.add(sSearch);
				
				// check if current column can be searched given a search string
				if ( !valueIsSuitableForColumnType(sSearch, getTypeOfColumn(dbName, tableName, columnsToSearch[i])) )
				{
					queryParts.add("CAST("+getSafeTableNameOnly(tableName)+"."+getSafeFieldName(columnsToSearch[i])+ " AS text) ~* ? ");
					ato.setType(queryValues.size()-1, "text");
				}
				else
				{
					queryParts.add(getSafeTableNameOnly(tableName)+"."+getSafeFieldName(columnsToSearch[i])+ " " + getSuitableOperator(sSearch, true) + " ? ");
					ato.setType(queryValues.size()-1, getTypeOfColumn(dbName, tableName, columnsToSearch[i]));
				}
				
				
			}
			// in a main search, finding in only one column is good enough, so we use 'OR' between columns
			if (queryParts.size()>0)
			{
				query += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";
				countQuery += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";				
			}
						
			
		}
		
		// main search WITH column filters
		
		// [ beware: null is also a genuine search value, so it's considered non-empty ]
		else if ( (sSearch == null || !sSearch.isEmpty()) && aSearchColumnValues.size()>0)
		{
			// main search means search all columns at once
			columnsToSearch = getColumnNames(dbName, tableName);
			ArrayList<String> queryParts = new ArrayList<String>();		
			ato = new ArgumentTypesObject();
			
			// I. main search part: search all columns EXCEPT the filtered columns			
			
			for (int i=0; i<columnsToSearch.length; i++)
			{
				// we skip the specific filtered columns as our main search address the other columns
				if (aSearchColumnNames.contains(columnsToSearch[i]))
					continue;
				
				// build the query condition for each column
				queryValues.add(sSearch);
				
				// check if current column can be searched given a search string
				if ( !valueIsSuitableForColumnType(sSearch, getTypeOfColumn(dbName, tableName, columnsToSearch[i])) )
				{
					queryParts.add("CAST("+ getSafeTableNameOnly(tableName)+"."+getSafeFieldName(columnsToSearch[i])+ " AS text) ~* ? ");
					ato.setType(queryValues.size()-1, "text");
				}
				else
				{
					queryParts.add( getSafeTableNameOnly(tableName)+"."+getSafeFieldName(columnsToSearch[i])+ " " + getSuitableOperator(sSearch, true) + " ? ");
					ato.setType(queryValues.size()-1, getTypeOfColumn(dbName, tableName, columnsToSearch[i]));
				}		
								
			}			
			
			// in a main search, finding in only one column is good enough, so we use 'OR' between columns
			if (queryParts.size()>0)
			{
				query += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";
				countQuery += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";				
			}
						
			
			// II. filtered column search part
			
			// build the query condition for each column
			queryParts = new ArrayList<String>();		
			for (int i=0; i<aSearchColumnNames.size(); i++)
			{
				// build current part
				queryValues.add(aSearchColumnValues.get(i));
				
				boolean caseSensitiveColumn = aCaseSensitiveColumnSearch.get(i);
				
				// check if current column can be searched given a search string
				if ( !valueIsSuitableForColumnType(aSearchColumnValues.get(i), getTypeOfColumn(dbName, tableName, aSearchColumnNames.get(i))) )
				{
					queryParts.add("CAST("+getSafeTableNameOnly(tableName)+"."+getSafeFieldName(aSearchColumnNames.get(i))+ " AS text) ~* ? ");
					ato.setType(queryValues.size()-1, "text");
				}
				else
				{
					queryParts.add(getSafeTableNameOnly(tableName)+"."+getSafeFieldName(aSearchColumnNames.get(i))+ " " + getSuitableOperator(aSearchColumnValues.get(i), caseSensitiveColumn) + " ? ");
					ato.setType(queryValues.size()-1, getTypeOfColumn(dbName, tableName, aSearchColumnNames.get(i)));
				}
				
				
				
			}
			
			// the column filters are compulsory so we use 'AND'
			if (queryParts.size()>0)
			{
				query += "AND ("+ Util.join(queryParts, " AND ") + ") ";
				countQuery += "AND ("+ Util.join(queryParts, " AND ") + ") ";				
			}			
			
		}
		
		// per-column search (no main search)
		
		// [ beware: null is also a genuine search value, so it's considered non-empty ]
		else if ( (sSearch!=null && sSearch.isEmpty()) && aSearchColumnValues.size()>0)
		{
			columnsToSearch = aSearchColumnNames.toArray(new String[aSearchColumnNames.size()]);
			ArrayList<String> queryParts = new ArrayList<String>();
			ato = new ArgumentTypesObject();
			
			// build the query condition for each column
			for (int i=0; i<columnsToSearch.length; i++)
			{
				// build current part
				queryValues.add(aSearchColumnValues.get(i));
				
				boolean caseSensitiveColumn = aCaseSensitiveColumnSearch.get(i);
				
				// check if current column can be searched given a search string
				if ( !valueIsSuitableForColumnType(aSearchColumnValues.get(i), getTypeOfColumn(dbName, tableName, columnsToSearch[i])) )
				{
					queryParts.add("CAST("+getSafeTableNameOnly(tableName)+"."+getSafeFieldName(columnsToSearch[i])+ " AS text) ~* ? ");
					ato.setType(queryValues.size()-1, "text");
				}
				else
				{
					queryParts.add(getSafeTableNameOnly(tableName)+"."+getSafeFieldName(columnsToSearch[i])+ " " + getSuitableOperator(aSearchColumnValues.get(i), caseSensitiveColumn) + " ? ");
					ato.setType(queryValues.size()-1, getTypeOfColumn(dbName, tableName, columnsToSearch[i]));
				}
				
			}
			// the column filters are compulsory so we use 'AND'
			if (queryParts.size()>0)
			{
				query += "WHERE ("+ Util.join(queryParts, " AND ") + ") ";
				countQuery += "WHERE ("+ Util.join(queryParts, " AND ") + ") ";				
			}
			
			
		}	
		
		// query without order nor limit
		// this query version might be needed if we want to try a tweak count
		String queryWithoutOrderNorLimit = query;
		
		
		// sorting
		if ( weMustSort )
		{
			String sortPart = " ORDER BY ";
			String sortSeparator = "";
			for (int s = 0; s < aSortCol.length; s++)
			{
				sortPart += sortSeparator + getSafeFieldName(aSortCol[s]) + " " + aSortDir[s];
				sortSeparator = ", ";
			}
			query += sortPart;
		}
				
		
		// range
		if (iDisplayLength>-1)
			query += " LIMIT " + iDisplayLength +" OFFSET " + iDisplayStart;
				
		
		// ******************************************
		//
		// queries are build, now get to the database
		//
		// ******************************************
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		TableAndCountObject tableAndCount = new TableAndCountObject();
		
		// remove operators that were put in from (like '<33'  or '!woord') 
		for (int i=0; i<queryValues.size(); i++)
		{
			queryValues.set(i, removeFrontOperator(queryValues.get(i)) );
		}
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			// get the table content 
			String[] args = queryValues.toArray(new String[queryValues.size()]);
			
			ResultSet rs1 = queryValues.size()==0 ?
				dc.sendQuery(query) : dc.sendPreparedQuery(query, args, ato);
			
			ArrayList<HashMap<String, String>> cellList = 
				getListOfIdToCell(dbName, tableName, primaryKey, rs1, allColumns );
			
			tableAndCount.setContent(cellList);
			
						
			
			// get the table count
			// if we have no filters, we take the complete count
			// otherwise we have to recount taking the filters into account
			int count = countOfWholeTable;
			boolean exactCount = getTrueTablesList(dbName).contains(tableName);
			
			// the key of the partial count is made up of prepared query string and its values (gives unique string)
			String queryForCache = countQuery + " ("+ Util.join(args, ",") + ")";
			
			
			// [ beware: null is also a genuine search value, so it's considered non-empty ]
			if ( ( sSearch == null || !sSearch.isEmpty() ) || aSearchColumnValues.size()>0 )
			{
				
				// get time at which counting starts
				long timeBeforeCount = new Date().getTime();
				int queryCost = 0;
				boolean recomputeMaxAllowedCost = false;
				
				// if the result of this query was cached
				// read it from the cache
				if (queryToCount.containsKey(queryForCache))
				{
					if (Constants.debug) System.out.println("Query "+queryForCache+" found in cache");
					count = queryToCount.get(queryForCache);
					exactCount = queryToCountQuality.get(queryForCache);
				}
				
				// try counting the normal way (exact count, slower than estimate)
				else 
				{
					queryCost = getQueryCost(dbName, replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
					
					if (Constants.debug) System.out.println("%%% FAST COUNT decision: "+queryCost+ "<"+maxAllowedCost +"?");					
					
					// count the normal way, t.i. count(*)
					if (queryCost < maxAllowedCost)
					{
						if (Constants.debug) System.out.println("%%% We will count the normal way");
						
						dc.sendUpdate("SET search_path TO "+schema+"; ");
						
						// important here: we set a timeout, to make sure 
						// that the normal count will never takes too long
						dc.sendUpdate("SET statement_timeout TO 2000;");
						ResultSet rs2;
						
						try {
							rs2 = dc.sendPreparedQuery(countQuery, args, ato);	
							
							ArrayList<ArrayList<String>> countResult = 
								getResultsInArrayList(rs2, new String[]{"count"});
							
							count = Integer.parseInt(countResult.get(0).get(0));
							exactCount = true;
							recomputeMaxAllowedCost = true;
						}
						// if the normal count takes too long, do an estimate count
						catch (Exception e) {
							if (Constants.debug)
								{
								System.out.println("%%% NORMAL COUNT TIME OUT !!");
								System.out.println("%%% We will use an estimate count");
								}
							count = getEstimateCount(dbName, replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
							exactCount = false;
						}						
						
					}
					
					// if counting the normal way is PREDICTED to be too slow,
					// get an estimate count
					else
					{
						if (Constants.debug) System.out.println("%%% We will use an estimate count");
						count = getEstimateCount(dbName, replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
						exactCount = false;
					}											
				}				
				
				// get time at which counting finished
				long timeAfterCount = new Date().getTime();
				
				// recompute the maximal allowed cost (to keep in tune with actual system)
				if (recomputeMaxAllowedCost)
				{
					recomputeMaxAllowedCost(queryCost, timeBeforeCount, timeAfterCount);
					if (Constants.debug) System.out.println("$$$ RECOMPUTED maxAllowedCost = " + maxAllowedCost);
				}				
				if (Constants.debug) System.out.println("Counting took "+(timeAfterCount - timeBeforeCount)+" ms");
											
			}
			else
			{
				if (Constants.debug) System.out.println("## Query count is the same as total count");			
			}
			
			
			// final correction:
			// if the content to return contains less records than the display length,
			// we should return this content size instead (which is then always accurate)
			// Beware: this is not true when we are not at page one, which implies that we have
			//         more records than the ones shown. At the last page, the number of shown
			//         records will probably be less than the iDisplayLength too, even if there
			//         are actually millions of records!
			if (tableAndCount.getContent().size() < iDisplayLength
					&& iDisplayStart==0) 
			{
				count = tableAndCount.getContent().size();
				exactCount = true;
			}				
			
			
			// set the table content and count now
			tableAndCount.setCount(count);
			tableAndCount.setCountIsExact(exactCount);
			
			// cache count of query for partial count
			queryToCount.put(queryForCache, count);
			queryToCountQuality.put(queryForCache, exactCount);
			
		}
		catch (Exception e) {
					
			// we need to send back a result, even an empty one,
			// otherwise the client will get stuck, so we won't throw an exception here!
			
			// show error in console
			if (Constants.debug) System.out.println("## ERROR: "+"Error while executing query "+query);
			e.printStackTrace(); 
		}
		finally {
			dc.sendUpdate("RESET statement_timeout;");
			closeDatabase(dc);
		}
		
		return tableAndCount;
	}
	
	
	/**
	 * Recompute the maximal allowed cost of a count query
	 * 
	 * There seems to be a sometimes quite constant linear relation between the 
	 * cost of a count query and the time this query takes to execute:
	 * 
	 *     relation = queryCost / timeToExecute
	 *     
	 * So, given a maximal allowed duration X for a count query,
	 * we expect the cost of that query not to exceed the value
	 * 
	 *     X * relation
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
	int numberOfAllowedCostRecomputations = 1;
	private void recomputeMaxAllowedCost(int queryCost, long timeBeforeCount, long timeAfterCount ){
		
		int currentMaxAllowedCost = 
			(int) (maxDuration * ((float)queryCost / (timeAfterCount - timeBeforeCount) ));
		
		int estimatedTotalOfAllPreviousComputations = numberOfAllowedCostRecomputations * maxAllowedCost;
		
		numberOfAllowedCostRecomputations++;		
		int newTotalOfAllComputations = estimatedTotalOfAllPreviousComputations + currentMaxAllowedCost;
		
		maxAllowedCost = newTotalOfAllComputations / numberOfAllowedCostRecomputations; 
	}
	
	
	/**
	 * Convert a query with question marks and a list of arguments
	 * (supposed to be used in a prepared statement)
	 * into a plain string query with arguments in it.
	 * We sometimes need this to use a query as an argument of a function.
	 * @param query
	 * @param args
	 * @return
	 */
	private String replaceQuestionMarksByArgsInQuery(String query, String[] args){
		
		int indexOfQuestionMark = -1;
		ArrayList<String> arguments = new ArrayList(Arrays.asList(args));
		
		int lastQuestionMarkIndex = 0;
		while ( (indexOfQuestionMark = query.indexOf("?", lastQuestionMarkIndex) ) > -1 )
		{		
			String argumentAtThisStep = arguments.remove(0);
			
			// put quotes around argument value, 
			// and add a E before it if it is a regex value
			boolean regexHere = preceedingOperatorImpliesaRegex(query, indexOfQuestionMark);
			
			int stringLengthOfArgument = 4; // default in case the value is null (4 letters)
			if (argumentAtThisStep != null) 
				{				
				if (regexHere)
					{
					argumentAtThisStep = "E'"+argumentAtThisStep.replaceAll("\\\\", "\\\\\\\\")+"'";					
					}
				else
					{
					argumentAtThisStep = "'"+argumentAtThisStep+"'";
					}
				stringLengthOfArgument = argumentAtThisStep.length();
				}
				
			
			query = query.substring(0, indexOfQuestionMark)+
				argumentAtThisStep +  
				query.substring(indexOfQuestionMark+1);
			
			// make sure we will look for the next question mark only after the current argument
			// This is needed since some arguments can consist of a question mark, which
			// we don't want to match at the next round!
			lastQuestionMarkIndex = indexOfQuestionMark + stringLengthOfArgument;
			if (Constants.debug) System.out.println(">>>>>> "+query);
		}
		return query;
	}
	
	private boolean preceedingOperatorImpliesaRegex(String query, int indexOfQuestionMark){
		
		query = query.substring(0, indexOfQuestionMark)+
			"somethingWeCanRecognize" +  
			query.substring(indexOfQuestionMark+1);
		
		// split the query into pieces and look for the operator preceeding
		// the question mark from which we provide the index
		// (the question marks stands for an argument in a prepared query here)
		String[] queryArr = query.split("\\s");
		int i=0;
		for (i=0; i+1<queryArr.length; i++)
		{
			if (queryArr[i+1].equals("somethingWeCanRecognize"))
				break;
		}
		return queryArr[i].equals("~*");
	}
	
	
	/**
	 * Determine which operator suits a string (whether it is a regex or not, etc)
	 * and return it.
	 * @param value
	 * @return an operator as a string
	 */
	public String getSuitableOperator(String value, boolean caseSensitive){
		
		// get a version of the value without the operator
		String cleanValue = removeFrontOperator(value);
		
		
		// always check that one first (to prevent NullPointerException)
		if (value == null)
			return " IS ";
		
		// negation operator
		boolean negation = false;
		if (value.startsWith("!"))
			negation = true;
		
		// inequality operators
		if (value.startsWith("<=") || value.startsWith(">="))
			return value.substring(0,2);		
		if (value.startsWith("<") || value.startsWith(">"))
			return value.substring(0,1);
		
		// special kind of regex requires LIKE
		if (value.contains("%")) 
			return " LIKE ";
		
		// is value is an integer, just test equality (because it's faster)
		if (Util.isInteger(cleanValue)) 
			return (negation ? "!=" : "=");
		
		// booleans require '='
		if (cleanValue.matches("true|false"))
			return (negation ? "!=" : "=");
		
		// suitable operator for case (in)sensitive search and regex
		return caseSensitive? 
				(negation ? "!~" : "~") 
				: 
				(negation ? "!~*" : "~*");
	}
	
	// remove operators and such, that were put in front of the search string
	public static String removeFrontOperator(String value){
		
		if (value == null)
			return value;
		
		if (value.startsWith("<=") || value.startsWith(">="))
			return value.substring(2);
		if (value.startsWith("<") || value.startsWith(">") || value.startsWith("!"))
			return value.substring(1);
		return value;
	}
	
	/**
	 * Get the column name of the primary key
	 * @param table
	 * @return
	 */
	public  String getPrimaryKeyColumn(String dbName, String tableName){
		
		String schema = getSchema(dbName, tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		// use caching
		// (if we have already looked up the primary key, it is stored in a hash)
		if ( tableNameToPrimaryKey.containsKey(dbName+schema+tableNameOnly) )
			{
			if (Constants.debug) System.out.println("## PK from cache: "+tableNameToPrimaryKey.get(dbName+schema+tableNameOnly));
			return tableNameToPrimaryKey.get(dbName+schema+tableNameOnly);
			}
		
		String primaryKeyColumn = null;		
		
		String getPK = "SELECT " +
			"pg_attribute.attname, " +
			"format_type(pg_attribute.atttypid, pg_attribute.atttypmod) " +
			"FROM pg_index, pg_class, pg_attribute " +
			"WHERE " +
			" pg_class.oid = ?::regclass AND " +
			" indrelid = pg_class.oid AND " +
			" pg_attribute.attrelid = pg_class.oid AND " +
			" pg_attribute.attnum = any(pg_index.indkey) " +
			" AND indisprimary ";	
		
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
						
			String[] args = new String[]{ getSafeTableNameOnly(tableName) };			
			
			ResultSet rs = dc.sendPreparedQuery(getPK, args);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"attname", "format_type"});
			
			// if there is no primary key, we expect the view to have a pk_id column
			primaryKeyColumn = (res.size()==0) ? 
					Constants.PRIMARYKEY_FIELDNAME : (res.get(0)[0].trim().isEmpty() ? 
							Constants.PRIMARYKEY_FIELDNAME : res.get(0)[0].trim());
		} 
		catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getPK, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		// store the primary key in a hash, for caching (for speed improvement)
		tableNameToPrimaryKey.put(dbName+schema+tableNameOnly, primaryKeyColumn);
		
		if (Constants.debug) System.out.println("PK of "+tableNameOnly+" is "+primaryKeyColumn);
		
		return primaryKeyColumn;
	}
	
	
	/**
	 * Get the type of one particular column
	 * @param dbName
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public  String getTypeOfColumn(String dbName, String tableName, String columnName){
		
		String type = "";
		String schema = getSchema(dbName, tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		// use caching
		// (if we have looked up the column type already, it is stored in a hash)
		String cachingKey = dbName+schema+tableNameOnly+columnName;
		
		if ( tableAndColumnNameToTypes.containsKey(cachingKey) )
			{
			if (Constants.debug) System.out.println("## Column type from cache: "+columnName+" = "+tableAndColumnNameToTypes.get(cachingKey));
			return tableAndColumnNameToTypes.get(cachingKey);
			}
		
		// use COALESCE to prevent datatype from being NULL
		String typeQuery = "SELECT COALESCE(data_type||'('||character_maximum_length||')', data_type) AS type "+
			"FROM information_schema.columns " +
			"WHERE table_name = ? " +
			"AND column_name = ? ;";
		
			
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			String[] args = new String[]{tableNameOnly, columnName};		
			
			ResultSet rs = dc.sendPreparedQuery(typeQuery, args);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"type"});		
			
			if (res.size()>0)
			{
				type = res.get(0)[0];
				
				// put list in cache 
				// (so we won't need to ask the database again)
				tableAndColumnNameToTypes.put(cachingKey, type);
			}
			else
				type = "unknown";
			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+typeQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
	
		return type;
	}
	
	
	/**
	 * get the types of all columns
	 * @param dbName
	 * @param tableName
	 * @param columns
	 * @return
	 */
	public  String[] getTypesOfColumns(String dbName, String tableName, String[] columns){
		
		// this query will be used to query the column type one column at the time
		// use COALESCE to prevent datatype from being NULL
		String typeQuery = "SELECT COALESCE(data_type||'('||character_maximum_length||')', data_type) AS type "+
			"FROM information_schema.columns " +
			"WHERE table_name = ? " +
			"AND column_name = ? ;";
		
		String schema = getSchema(dbName, tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		String[] columnTypes = new String[columns.length];
			
			
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			for (int i = 0; i<columns.length; i++)
			{
				// remove quote from names, in case the "safe" quote name was saved
				columns[i] = removeQuotesFromSqlReservedWord(columns[i]);
				
								
				// use caching				
				// (if we have looked up the column type already, it is stored in a hash)
				String cachingKey = dbName+schema+tableNameOnly+columns[i];
				
				if ( tableAndColumnNameToTypes.containsKey(cachingKey) )
				{
					if (Constants.debug) System.out.println("## Column type from cache: "+columns[i]+" = "+tableAndColumnNameToTypes.get(cachingKey));
					columnTypes[i] = tableAndColumnNameToTypes.get(cachingKey);
				}
				// if cache is empty, ask the database 
				// (and put result in cache for later call)
				else
				{
					String[] args = new String[]{tableNameOnly, columns[i]};		
					
					ResultSet rs = dc.sendPreparedQuery(typeQuery, args);				
					ArrayList<String[]> res = getResultsInAList(rs, new String[]{"type"});						
					
					columnTypes[i] = (res.size()>0) ? res.get(0)[0] : "unknown";
														
					// put column type in cache
					// (so we won't need to ask the database again)
					tableAndColumnNameToTypes.put(cachingKey, columnTypes[i]);					
				}					
			}
			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+typeQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return columnTypes;
	}
	
	
	/**
	 * Get the comments of columns 
	 * (which are set with: COMMENT ON COLUMN table.column IS '...')
	 * @param dbName
	 * @param tableName
	 * @param columns
	 * @return
	 */
	public String[] getColumnsComments(String dbName, String tableName, String[] columns){
		
		String schema = getSchema(dbName, tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		// see: http://stackoverflow.com/questions/15928118/how-to-get-column-attributes-query-from-table-name-using-postgresql
		// (modified version of answer from Erwin Brandstetter)
		String commentsQuery = "SELECT a.attname AS name, d.description AS comment "+
			"FROM   pg_attribute    a "+ 
			"LEFT   JOIN pg_index   p ON p.indrelid = a.attrelid AND a.attnum = ANY(p.indkey) "+
			"LEFT   JOIN pg_description d ON d.objoid  = a.attrelid AND d.objsubid = a.attnum "+
			"LEFT   JOIN pg_attrdef f ON f.adrelid = a.attrelid  AND f.adnum = a.attnum "+
			"WHERE  a.attnum > 0 "+
			"AND    NOT a.attisdropped "+
			"AND    a.attrelid = ?::regclass "+
			"ORDER  BY a.attnum; ";
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		String[] columnComments = new String[columns.length];
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			String[] args = new String[]{ schema+"."+getSafeTableNameOnly(tableNameOnly) };		
			
			ResultSet rs = dc.sendPreparedQuery(commentsQuery, args);				
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"name", "comment"});
		
			if (res.size()>0)
			{
				// read the comments assigned to each column
				for (int i = 0; i<columns.length; i++)
				{
					String columnName =    res.get(i)[0];
					String columnComment = res.get(i)[1];
					// get the index of the current column in the 'columns' array,
					// so as to be able to assign the comment to the same index
					int indexOfColumnInColumnsArr = Util.getIndexOf(columnName, columns);
					columnComments[indexOfColumnInColumnsArr] = columnComment;
				}
			}			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+commentsQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return columnComments;
		
	}
	
	
	/**
	 * get the argument types of a function
	 * @param dbName
	 * @param functionName
	 * @return
	 */
	public String[] getFunctionTypes(String dbName, String functionName){
		
		// (see: http://www.varlena.com/GeneralBits/39.php)
		String functionDetailsQuery = "SELECT " +
			"t.typname AS return_type, " +
			"p.proname AS function_name, " +
			"pg_catalog.oidvectortypes(p.proargtypes) AS argument_types "+
			"FROM pg_proc p, pg_type t, pg_namespace n, pg_language l "+
			"WHERE p.prorettype = t.oid and p.pronamespace = n.oid "+
			"AND p.prolang = l.oid "+
			"AND p.proname = ? ;";
		
		
		if ( functionNameToTypes.containsKey(dbName+functionName) )
		{
			if (Constants.debug) System.out.println("## Function arg types from cache");
		return functionNameToTypes.get(dbName+functionName);
		}
		
		
		String[] argumentTypes = null;
		
		String schema = getSchemaName(dbName);
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");			
			
			String[] args = new String[]{functionName};		
			
			ResultSet rs = dc.sendPreparedQuery(functionDetailsQuery, args);				
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"argument_types"});
			
			// output has the form:  "type1, type2, type3"
			// so we need to split and to trim
			if (res.size()>0)
			{
				argumentTypes = res.get(0)[0].split(",");
				for (int i=0; i<argumentTypes.length; i++)
				{
					argumentTypes[i] = argumentTypes[i].trim();
				}
				functionNameToTypes.put(dbName+functionName, argumentTypes);
			}			
			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+functionDetailsQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return argumentTypes;
	}
	
	
	// Get the column names of a result set
	public  String[] getColumnNamesFromResultSet(ResultSet rs){
		
		ArrayList<String> columnNames = new ArrayList<String>();
		
		// Get result set meta data
	    ResultSetMetaData rsmd;
		try {
			rsmd = rs.getMetaData();
		    int numColumns = rsmd.getColumnCount();

		    // Get the column names; column indices start from 1
		    for (int i=1; i<numColumns+1; i++) {
		        String columnName = rsmd.getColumnName(i);
		        columnNames.add(columnName);
		    }
			
		} catch (SQLException e) {
			throw new RuntimeException("Error while reading column names from ResultSet ", e);
		}
		
		return columnNames.toArray(new String[columnNames.size()]);

	}
	
	// get the column names of a table
	public  String[] getColumnNames(String dbName, String tableName){
		
		String[] columnNames;		
		
		String schema = getSchema(dbName, tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		// use caching
		// (if we have looked up the column names already, they are stored in a hash)
		if ( tableNameToColumnNames.containsKey(dbName+schema+tableNameOnly) )
			{
			if (Constants.debug) System.out.println("## Column names from cache");
			return tableNameToColumnNames.get(dbName+schema+tableNameOnly);
			}
		
		
		String columnQuery = 
			"SELECT attname " +
			"FROM pg_attribute, pg_class c, pg_namespace n " +
			"WHERE c.oid = attrelid " +
			" AND n.oid = c.relnamespace " +
			" AND attstattarget != 0 " + // added to prevent getting deleted columns!
			" AND attnum>0 " +
			" AND relname = ? " + // table name
			" AND nspname = ? "+ // schema name
			";";
		
		
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			String[] args = new String[]{tableNameOnly, schema}; 
			
			ResultSet rs = dc.sendPreparedQuery(columnQuery, args);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"attname"});
			
			// read names
			columnNames = new String[res.size()];
			for (int i=0; i<res.size(); i++)
			{
				String[] oneRecord = res.get(i);
				columnNames[i] = oneRecord[0];
			}			
			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+columnQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		// store the column names for caching (speed improvement)
		tableNameToColumnNames.put(dbName+schema+tableNameOnly, columnNames);
		return columnNames;
	}
	
	
	/********************************************************************
		custom data types
	 ********************************************************************/
	
	// get the name of a custom type, given the name of a column having this type
	public String getUserDefinedTypeName(String dbName, String tableName, String columnName){
		
		String nameOfCustomType = "";
		String schema = getSchema(dbName, tableName);
		
		String query = "SELECT udt_name AS custom_type "+
			"FROM information_schema.COLUMNS "+
			"WHERE table_name  = ? "+
			"AND column_name = ? ;";
		
		String[] args = new String[]{tableName, columnName};
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			ResultSet rs = dc.sendPreparedQuery(query, args);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"custom_type"});
			
			// read values
			if (res.size()>0)
				nameOfCustomType = res.get(0)[0];
			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+query, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return nameOfCustomType;
	}
	
	
	// Get the values a user defined type is consisting of.
	// this returns a list of values in a pipe-separated string.
	// (see: http://stackoverflow.com/questions/9535937/is-there-a-way-to-show-a-user-defined-postgresql-enumerated-type-definition)
	public String getUserDefinedTypeValues(String dbName, String tableName, String typeName){
		
		String values = "";
		String schema = getSchema(dbName, tableName);
		
		String query = "SELECT string_agg(e.enumlabel, '|') AS enum_labels "+
			"FROM   pg_catalog.pg_type t "+
			"JOIN   pg_catalog.pg_namespace n ON n.oid = t.typnamespace "+
			"JOIN   pg_catalog.pg_enum e ON t.oid = e.enumtypid "+
			"WHERE  t.typname = ? "+
			"AND n.nspname = ? ;";
		
		String[] args = new String[]{typeName, schema};
		
		PostgresDatabaseCommunication dc = connectDatabase(dbName);
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			ResultSet rs = dc.sendPreparedQuery(query, args);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"enum_labels"});
			
			// read values
			if (res.size()>0)
				values = res.get(0)[0];
			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+query, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return values;
	}
	
	
	// get the allowed values of all custom type columns of a table at once!
	public String[] getCustomtypesAllowedValues(String dbName, String tableName, String[] columnNames, String[] columnTypes){
		
		String schema = getSchema(dbName, tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		String[] customTypes = new String[columnNames.length];
		
		for (int i=0; i<columnNames.length; i++)
		{
			String customTypesOfThisColumn = "";
			String columnName = columnNames[i];
			
			// use caching (speed!)
			String cachingKey = dbName+schema+tableNameOnly+columnName;
			
			if (columnTypes[i].equalsIgnoreCase("USER-DEFINED"))
			{
				if (tableAndColumnNameToCustomTypesValues.containsKey(cachingKey))
				{
					customTypesOfThisColumn = tableAndColumnNameToCustomTypesValues.get(cachingKey);
				}
				else
				{
					// get the name of the user-defined type
					String customtypeName = getUserDefinedTypeName(dbName, tableName, columnName);
					// get the allowed values defined in this user-defined type
					customTypesOfThisColumn = getUserDefinedTypeValues(dbName, tableName, customtypeName);
					// save value to cache for quick lookup later on
					tableAndColumnNameToCustomTypesValues.put(cachingKey, customTypesOfThisColumn);
				}
				
			}
			customTypes[i] = customTypesOfThisColumn;			
		}
		return customTypes;
	}
	
	/********************************************************************
		END of custom data types part
	 ********************************************************************/
	
	
	// get the schema name, depending on table name input
	// if the table name contains a dot, the string before the dot must be the schema name
	// if the table name contains no dot, we request the schema name contained in the configuration file
	private  String getSchema(String dbName, String tableName){
					
		String[] parts = tableName.split("\\.");
		return parts.length>1 ? parts[0] : getSchemaName(dbName);
	}

	// get the table name only, depending of table name input
	// if the table name contains a dot, the table name is the last string after a doc
	// if the table name contains no dot, the table name is the whole string
	private  String getTableNameOnly(String tableName){
		
		String[] parts = tableName.split("\\.");
		return parts[parts.length-1];
	}
	
	// if a table name contains both upper and lower case characters
	// Postgres gets confused, so the table name needs to be rewritten
	// as schema."tablename"
	private  String getSafeTableName(String tableName, String schema){
		
		if (tableName.toLowerCase().equals(tableName))
			return schema+"."+tableName;
		
		return schema+".\""+tableName+"\"";
	}
	
	// same as above, except schema name is not added in front
	private  String getSafeTableNameOnly(String tableName){
		
		if (tableName.toLowerCase().equals(tableName))
			return tableName;
		
		return "\""+tableName+"\"";
	}
	
	// same as above, for field names
	private  String getSafeFieldName(String fieldName){
		
		if ( !isReservedSqlWord(fieldName) &&
				fieldName.toLowerCase().equals(fieldName) && 
				!fieldName.contains("-"))
			return fieldName;
		
		return "\""+fieldName+"\"";
	}
	
	// in SQL we need a double escape \\, make sure we get it if the string only contains \
	private  String getDoubleEscape(String str){
		return str.replaceAll("\\\\+", "\\\\\\\\");
	}
	
	// get valid SQL backreference from java(script)-like regex ( $1 -> \\1 )
	private  String getValidSqlBackReference(String str){
		return str.replaceAll("(\\$)(\\d{1})","\\\\\\\\$2");
	}
	
	// returns true if the datatype allows the use of regex (numeric etc).
	private  boolean allowsRegex(String dataType){
		if (dataType.equals("text")) return true;
		else if (dataType.startsWith("character varying")) return true;
		return false;
	}
	
	
	/**
	 * get the results of a query in a List
	 * each record is an array in that list
	 * @param rs
	 * @param velden
	 * @return
	 * @throws SQLException 
	 * @throws UnsupportedEncodingException 
	 */
	public ArrayList<String[]> getResultsInAList(ResultSet rs, String[] velden) throws UnsupportedEncodingException, SQLException{
		
		ArrayList<String[]> lijst = new ArrayList<String[]>();
		
		if (rs == null) 
		{
			if (Constants.debug) System.out.println("Result list empty");
			return lijst;
		}
		
		try 
		{
			try
			{
				while (rs.next())
				{
					String[] veldInhoud = new String[velden.length];
					for (int i=0; i<velden.length; i++)
					{
						String veld = velden[i];						
						
						byte[] col = rs.getBytes(veld);
						if (col != null)
						{
							String str = new String(col, "UTF-8");
							veldInhoud[i] = str; 
						}
						else
						{
							veldInhoud[i] = "";
						}
						
					}
					lijst.add(veldInhoud);
					
				}
				return lijst;
			}
			finally
			{
				rs.close();
			}
		}
		catch (Exception e)
		{
			throw new RuntimeException(e);
		}
		
	}
	
	public ArrayList<ArrayList<String>> getResultsInArrayList(ResultSet rs, String[] velden){
		
		ArrayList<ArrayList<String>> list = new ArrayList<ArrayList<String>>();
		
		if (rs == null) 
		{
			if (Constants.debug) System.out.println("Result list is empty");
			return list;
		}
		
		try
		{
			try
			{
				while (rs.next())
				{
					ArrayList<String> veldInhoud = new ArrayList<String>();
					for (int i=0; i<velden.length; i++)
					{
						String veld = velden[i];
												
						byte[] col = rs.getBytes(veld);
						if (col != null)
						{
							String str = new String(col, "UTF-8");
							
							veldInhoud.add(str);	
						}
						else
						{
							veldInhoud.add( "" );
						}
					}
					list.add(veldInhoud);
					
					
				}
				return list;
			}
			finally
			{
				rs.close();
			}
		}
		catch (Exception e)
		{
			throw new RuntimeException(e);
		}
		
	}
	
	// remove quotes from a field name that got quotes because it is a reserved sql word
	public String removeQuotesFromSqlReservedWord(String word){
		return word.replaceAll("\"","");
	}
	
	// Get a result set into an arraylist, each record is a row
	// a row is a hash mapping a column name to some content
	// This is called 'getListOfIdToCell' because we add a row id required bij Datatables
	// to each row (t.i. DT_RowId).
	public ArrayList<HashMap<String, String>> getListOfIdToCell( String dbName,
			String tableName, String primaryKey, ResultSet rs, String[] requiredColumns ){

		
		ArrayList<HashMap<String, String>> lijst = new ArrayList<HashMap<String, String>>();
		
		if (rs == null) 
		{
			if (Constants.debug) System.out.println("Result list is empty!");
			return new ArrayList<HashMap<String, String>>();
		}
		
		
		// get the number of columns in the result set
		
		ResultSetMetaData rsMetaData = null;
	    int numberOfColumns = 0;
		try {
			rsMetaData = rs.getMetaData();
			numberOfColumns = rsMetaData.getColumnCount();			
		} 
		catch (SQLException e1) 
		{
			throw new RuntimeException(e1);
		}
		
		
		// if a list of required columns was given, we will stick to it
		// otherwise, we take the column names from the resultset
		
		
		if (Constants.debug) System.out.println("We've got "+numberOfColumns+" columns in table "+tableName);
	    String[] columnNames = new String[numberOfColumns];
	    String[] columnTypes = new String[numberOfColumns];
	    
	    if (requiredColumns.length==0)
	    {
	    	try {

		    	// get the column names; column indexes start from 1
			    for (int i = 1; i < numberOfColumns + 1; i++) {
			    	
			    	String columnName = rsMetaData.getColumnName(i);
			    	columnNames[i-1] = columnName;
			    	
			    	
			    }
			} 
		    catch (SQLException e) 
		    {
				throw new RuntimeException(e);
		    }
	    }
	    else
	    {
	    	columnNames = requiredColumns;
	    }
	    
	    
	    
	    // get list of column types
	    if (Constants.debug)
	    {
	    	System.out.println("Requesting list of column types for:");
	    	System.out.println(columnNames.length+" => "+Util.join(columnNames, ", "));
	    }
	    for (int i = 0; i < columnNames.length; i++) {
	    	columnTypes[i] = getTypeOfColumn(dbName, tableName, removeQuotesFromSqlReservedWord(columnNames[i]));
	    }	    
	 
	    if (Constants.debug)
	    {	    	
		    for (int i = 0; i < columnNames.length; i++) {
		    	System.out.println(columnNames[i]+" -> '"+columnTypes[i]+"'");
		    }
	    }
	    

	    // process table content into return variable 
		try
		{
			
			try
			{
				while (rs.next())
				{
					HashMap<String, String> record = new HashMap<String, String>();
					
					// process each column of a record					
					
					for (int i=0; i<columnNames.length; i++)
					{
						String columnName = removeQuotesFromSqlReservedWord(columnNames[i]);	
						
						byte[] col = rs.getBytes(columnName);
						String value = rs.getBytes(columnName)!= null ? new String(col, "UTF-8") : null;
						value = col != null ? value : "";
						
						// Datatable need a special ID column
						if (columnName.equals(primaryKey))
							record.put("DT_RowId", value);
						
						// normal case
						record.put(columnName, value);						
						
					}					
					
					record.put("DT_RowClass", "ClassA");
					lijst.add(record);					
					
				}
				return lijst;
			}
			finally
			{
				rs.close();
			}			
		}
		catch (Exception e)
		{
			throw new RuntimeException(e);
		}
		
		
	}
	
	
	
	/**
	 * opens a Postgres database connection
	 */
	public PostgresDatabaseCommunication connectDatabase(String dbName) 
	{
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( databaseAccessHash.size() == 0 )
			try {
				readPropertiesFile(dbName);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				throw new RuntimeException(e);
			}
		
		String db = databaseAccessHash.get("db");
		String host = databaseAccessHash.get("host");
		String user = databaseAccessHash.get("user");
		String pass = databaseAccessHash.get("pass");
		
		PostgresDatabaseCommunication postgresDc = new PostgresDatabaseCommunication();
		
		postgresDc.connectTo(host, db, user, pass);
		
		return postgresDc;
		
	}
	
	/**
	 * Get schema to address
	 * @throws IOException
	 */
	public String getSchemaName(String dbName){
		
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( databaseAccessHash.size() == 0 )
			try {
				readPropertiesFile(dbName);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				throw new RuntimeException(e);
			}
			
			return databaseAccessHash.get("schema");
	}
	
	
	public void readPropertiesFile(String dbName) throws IOException{
		
		if (Constants.debug) System.out.println("Read database access data from properties file '"+dbName+".database"+"'...");
		
		String fileName = dbName+".database";
		
		String filepath = context.getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar+"lexit"+File.separator+fileName, 
				File.separatorChar+"lexit_config"+File.separator+fileName);
		
		if (Constants.debug) System.out.println("File: "+filepath);
		
		databaseAccessHash = Util.readPropertiesFile(filepath, new HashMap<String, String>());
	}
	
	
	/**
	 * close the database connection
	 */
	public void closeDatabase(PostgresDatabaseCommunication dc)
	{
		if (dc != null)
			dc.closeConnection();
		if (Constants.debug)
			System.out.println("Connection with the database closed.\n");
	}

	
	/**
	 * Get a fast estimate of the number of ALL rows of a table or view
	 * @param dbName
	 * @param tableName
	 * @return
	 */
	public Map getQuickCountOfAllTableRecords(String dbName, String tableName) {
		
		if (Constants.debug) System.out.println("## Get quick count of all tables records");
		String schema = getSchema(dbName, tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		boolean exactCount = true;
		Map countAndQuality = new HashMap<String, Object>();
		
		// use caching
		// (if we have looked up the count already, it is stored in a hash)
		if ( tableNameToCount.containsKey(dbName+schema+tableNameOnly))
			{
			if (Constants.debug) System.out.println("## Count from cache = "+tableNameToCount.get(dbName+schema+tableNameOnly)+" row(s)");
			countAndQuality.put("exactCount", tableNameToExactCount.get(dbName+schema+tableNameOnly));
			countAndQuality.put("count", tableNameToCount.get(dbName+schema+tableNameOnly));
			return countAndQuality;
			}
		
		
		// first determine if we have a table or a view
		// [1] a view requires a true count since there is no way to get a proper quick estimate
		//     of the number of row of a view
		// [2] for tables we can get an estimate count by using the getEstimateCount of this webservice
		//     NB: A table also has an estimate of its number of rows in the pg_class table of Postgres
		//         which can be get with: SELECT reltuples FROM pg_class WHERE oid = 'my_schema.tbl'::regclass;
		//         However, we won't make use of that, because it is not always accurate 
		//        (it is only when the table statistics are up-to-date) and most of all,
		//         if a table has a lot of records, we will be given a count in a user-unfriendly
		//         notation like this: 1.63447e+06
		//         For these reasons, we prefer to get a fast estimate with a special function (getEstimateCount)
		//         which will always give a correct notation, even if we will be given only estimates indeed
		
		int count = -1;
		
		ArrayList<String> listOfTrueTables = getTrueTablesList(dbName);
		boolean currentTableIsATrueTable = listOfTrueTables.contains(tableNameOnly);
		
		if (Constants.debug) System.out.println("## The current table is a "+(currentTableIsATrueTable?" genuine table":"view")+".");
		
		// case [1] 
		// if we have a view, get the true count
		if ( !currentTableIsATrueTable )
		{
			count = getTrueCountOfATable(dbName, tableNameOnly);
		}
		
		// case [2]
		// if we have a table, get a fast estimate count
		// OR
		// if count in case [1] failed (timeout), try this fast estimate count method as well
		if ( currentTableIsATrueTable || count<0 )
		{
			exactCount = false;
			count = getEstimateCount(dbName, "SELECT * FROM "+getSafeTableName(tableNameOnly, schema));
		}
		
		// store the count for caching (speed improvement)
		tableNameToCount.put(dbName+schema+tableNameOnly, count);
		tableNameToExactCount.put(dbName+schema+tableNameOnly, exactCount);
		
		if (Constants.debug) System.out.println("## Counting result was: "+(exactCount?"":"+/- ")+count+" row(s)");
		
		countAndQuality.put("exactCount", tableNameToExactCount.get(dbName+schema+tableNameOnly));
		countAndQuality.put("count", tableNameToCount.get(dbName+schema+tableNameOnly));
		return countAndQuality;
	}
	
	
	/**
	 * Remove the cache of some table
	 * @param dbName
	 * @param tableName
	 */
	public void cleanCache(String dbName, String tableName) {

		String schema = getSchema(dbName, tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		tableNameToCount.remove(dbName+schema+tableNameOnly);
		tableNameToExactCount.remove(dbName+schema+tableNameOnly);
		tableNameToPrimaryKey.remove(dbName+schema+tableNameOnly);
				
		String[] columns = tableNameToColumnNames.get(dbName+schema+tableNameOnly);
		if (columns != null)
		{
			for (String oneColumn : columns)
			{
				tableAndColumnNameToTypes.remove(dbName+schema+tableNameOnly+oneColumn);
				tableAndColumnNameToCustomTypesValues.remove(dbName+schema+tableNameOnly+oneColumn);
			}
			tableNameToColumnNames.remove(dbName+schema+tableNameOnly);
		}		
		
		
		// this is removing all cached queries of all table, not possible otherwise
		queryToCount = new HashMap<String, Integer>();
		queryToCountQuality = new HashMap<String, Boolean>();
	}

	
}
