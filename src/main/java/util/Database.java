package util;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import resources.Constants;
import resources.ContextObject;
import resources.DbResponseObject;
import table.TableAndCountObject;
import table.TableRecordObject;
import table.TableRecordsObject;
import table.UniqueValuesObject;

/*
 * This class contains all the queries needed to read from or write into
 * the database used by Lex'it
 * 
 */
public class Database {
	
	// servlet context etc
	ContextObject co;
	
	// columns names and types, etc. hashed for caching
	public ConcurrentHashMap<String, String> tableAndColumnNameToTypes = new ConcurrentHashMap<String, String>(); 
	public ConcurrentHashMap<String, String> tableAndColumnNameToCustomTypesValues = new ConcurrentHashMap<String, String>();
	public ConcurrentHashMap<String, String[]> functionNameToTypes = new ConcurrentHashMap<String, String[]>();
	public ConcurrentHashMap<String, String> functionNameToReturnType = new ConcurrentHashMap<String, String>();
	public ConcurrentHashMap<String, String> functionNameToOperationType = new ConcurrentHashMap<String, String>();
	public ConcurrentHashMap<String, String> tableNameToPrimaryKey = new ConcurrentHashMap<String, String>();
	public ConcurrentHashMap<String, String[]> tableNameToColumnNames = new ConcurrentHashMap<String, String[]>();
	public ConcurrentHashMap<String, Boolean> tableAndColumnNameToIndex = new ConcurrentHashMap<String, Boolean>();
	public ConcurrentHashMap<String, ArrayList<String[]>> gotoQueryToResultSet = new ConcurrentHashMap<String, ArrayList<String[]>>();

	// cache of total and partial counts
	public ConcurrentHashMap<String, Integer> tableNameToCount = new ConcurrentHashMap<String, Integer>();
	public ConcurrentHashMap<String, Boolean> tableNameToExactCount = new ConcurrentHashMap<String, Boolean>();
	public ConcurrentHashMap<String, Integer> queryToCount = new ConcurrentHashMap<String, Integer>();
	public ConcurrentHashMap<String, Boolean> queryToCountQuality = new ConcurrentHashMap<String, Boolean>();
	
	// ConcurrentHashMap in which database location, username and password are put
	public ConcurrentHashMap<String, String> databaseAccessHash = new ConcurrentHashMap<String, String>();
	
	// should we use compulsory exact count ?
	// This can be set to true temporarily by user, but after counting, this will
	// be automatically set back to false by the getTable() function
	public boolean bForceExactCount = false; 
	
	// Standard value for the maximal allowed cost of a count query
	int maxAllowedDuration = 2000; // milliseconds
	int maxAllowedCost = -1; // value will be computed at first call of recomputeMaxAllowedCost()
	
	
	// constructor
	public Database(ContextObject co){
		
		try {
			this.co = co;
			readPropertiesFile();
		} catch (IOException e) {
			throw new RuntimeException("Error while reading the "+co.getDbName()+" properties file", e);
		}
	};
	
	// the ContextObject wasn't really supposed to keep information: it's mostly a convenient way to send servert context info in one single object
	// BUT we do use it to keep some more info: 
	//  [1] the last usage time of the database object (so it can be removed when it hasn't been used for some time)
	//  [2] the tab the user is currently viewing (so we can simulate a session ID per tab for example)
	// Both behave differently:
	//  [1] has is usage time set each time it's called... and at each call, we loop throught to other cached ContextObjects of some usage time is too long ago
	//  [2] has its tab-id only set at tab creation or tab change, so the tab-id is lost at the very next round since the ContextObject by default only contains
	//      server context info. So, to prevent loss, we check if the previous version had some tab-id, and copy it to the new ContextObject
	public void updateContextObject(ContextObject co){
		
		// see explanation hereabove
		if ( (co.getActiveTabId() == null || co.getActiveTabId().isEmpty())
				&&
			 (this.co.getActiveTabId() != null && !this.co.getActiveTabId().isEmpty())) {
			co.setActiveTabId(this.co.getActiveTabId());
			}
		
		this.co = co;
	}
	
	public ContextObject getContextObject(){
		return this.co;
	}
	
	
	
	// declare if we must be computing an exact count (default is false,
	// but this can be set to true by user temporarily if needed)
	public void setForceExactCount(boolean forceExactCount){
		this.bForceExactCount = forceExactCount;
	}
	public boolean getForceExactCount(){
		return this.bForceExactCount;
	}
	
	/**
	 * Delete a record from a table
	 * @param tableName
	 * @param idValue
	 */
	public  void deleteRecord(String tableName, String idValue, 
			DbResponseObject dro){
		
		String schema = getSchema(tableName);
		String idColumn = getPrimaryKeyColumn(tableName);			
		
		// set arguments
		String[] args = new String[]{idValue};
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		ato.setType(0, getTypeOfColumn(tableName, idColumn));
		
		String deleteRecord = 
			"DELETE FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + getSafeFieldName(idColumn) + " = ? ;";
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	public  void deleteRecordWithoutId(
			String tableName, String[] columnNames, 
			String[] values,
			DbResponseObject dro ){
		
		String schema = getSchema(tableName);		
		
		// set arguments
		String[] args = values;
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = getTypesOfColumns(tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);
			columnNames[i] = getSafeFieldName(columnNames[i]);
		}			
		
		String deleteRecords = 
			"DELETE FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + (Util.join(columnNames, " = ? AND ") +" = ? ") + 
			";";
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
		if (sortByIsEmpty)
		{
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
		
		
		String primaryKey = getPrimaryKeyColumn(tableName);
		
		String schema = getSchema(tableName);	
		ArrayList<String[]> res;
		String functionOuput = "0";
		
		
		// strategy #1, without primary key
		
		if (primaryKey == null)
		{
			
			// put sort information into arrays
					
			String[] aSortBy = sortBy.split(",");
			String[] aSortDir = sortDir.split(",");		
			
			// and build a complete sort string (ORDER BY field1 dir1, field2 dir2, ...) 
			// with safe field names, meaning quoted when PostgreSql requires that.
			
			String[] aSortBySafe = new String[aSortBy.length];
			for (int i=0; i<aSortBy.length; i++)
			{
				aSortBySafe[i] = getSafeFieldName(aSortBy[i]) + " " + aSortDir[i];
			}
			String bigSortString = Util.join(aSortBySafe, ", ");
			
				
			// set arguments
			String[] args = Util.concatArr( filterValues, new String[]{columnValue} );
			
			// set argument types
			ArgumentTypesObject ato = new ArgumentTypesObject();
			String[] argsColumns = Util.concatArr( filterColumns, new String[]{columnName} );
			String[] valueTypes = getTypesOfColumns(tableName, argsColumns);
			for (int i=0; i<argsColumns.length; i++)
			{
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
				
				"		SELECT "+getSafeFieldName(columnName)+", " +
				"			rownumber, (rownumber / " + iDisplayLength + ") AS page "+
				"		FROM ("+
				
				// sort by field part, with row_number  (tmp subquery)
				
				"			SELECT "+getSafeFieldName(columnName)+", " +
				"			 CAST(row_number() OVER (ORDER BY " + bigSortString + ") AS integer)-1 AS rownumber "+				
				"		 	FROM "+getSafeTableName(tableName, schema)+" ";
			
			// if filters are required, add those
			if (filterColumns!=null)
			{
				getRowNumberQuery += "	WHERE ";
				String[] parts = new String[filterColumns.length];
				for (int i=0; i<filterColumns.length; i++)
				{
					parts[i] = getSafeFieldName(filterColumns[i]) + " " +
						getSuitableOperatorAndArg(tableName, filterColumns[i], filterValues[i], false);
				}
				getRowNumberQuery += Util.join(parts, " AND ");
			}
			
			// final part after the filters and numbering part:
			// the value we need to get to!
			getRowNumberQuery +=
				"		) tmp "+
				"	) to_be_grouped "+
				"	 WHERE "+getSafeFieldName(columnName) + " " + 
							getSuitableOperatorAndArg(tableName, columnName, columnValue, false) +
				"	 GROUP BY page " + 
				") all_occurences; ";
			

			
			
			// build a key for storing the query and the resultset, for the next goto-call
			
			String hashKey = getRowNumberQuery + Util.join(argsColumns, "|") + Util.join(args, "|");
			boolean alreadyCalled = gotoQueryToResultSet.containsKey(hashKey);

			
			// we have built the right query, now use it to get the row number
			
			PostgresDatabaseCommunication dc = connectDatabase();
			
			try {
				dc.sendUpdate("SET search_path TO "+schema+"; ");	
				
				ResultSet rs;
				if( alreadyCalled )
					{
					res = gotoQueryToResultSet.get(hashKey);
					}
				else
					{
					rs = dc.sendPreparedQuery(getRowNumberQuery, args, ato);
					res = getResultsInAList(rs, new String[]{"rownumber"});
					gotoQueryToResultSet.put(hashKey, res);
					}
						 
				// get row number for the right occurence
				
				if (res.size() > 0 && occurrenceNr < res.size() )
					{				
					functionOuput = res.get(occurrenceNr)[0];
					}
				
			} catch (Exception e) {
				throw new RuntimeException("Error while executing query "+getRowNumberQuery, e);
			} 
			
			finally {
				closeDatabase(dc);
			}
		}
		
		
		// strategy #2 with use of primary key
		
		else
			
		{			
			// put sort information into arrays
					
			String[] aSortBy = sortBy.split(",");
			String[] aSortDir = sortDir.split(",");		
			
			// and build a complete sort string (ORDER BY field1 dir1, field2 dir2, ...) 
			// with safe field names, meaning quoted when PostgreSql requires that.
			
			String[] aSortBySafe = new String[aSortBy.length];
			for (int i=0; i<aSortBy.length; i++)
			{
				aSortBySafe[i] = getSafeFieldName(aSortBy[i]) + " " + aSortDir[i];
			}
			String bigSortString = Util.join(aSortBySafe, ", ");
			
				
			// Set arguments
			
			// First argument in the query is the value we search for,
			// The following arguments in the query are the filter values.
			
			String[] argValues = Util.concatArr( new String[]{columnValue}, filterValues );
			String[] argsColumns = Util.concatArr( new String[]{columnName}, filterColumns );
			
			// set argument types
			ArgumentTypesObject ato = new ArgumentTypesObject();
			String[] valueTypes = getTypesOfColumns(tableName, argsColumns);
			for (int i=0; i<argsColumns.length; i++)
			{
				ato.setType(i, valueTypes[i]);
			}
			 
			// query 
			
			// since the row number is 1-based in Postgres, 
			// we need to subtract 1 to get a 0-based number in Lex'it
			
			String getRowNumberQuery =
					
				"	SELECT "+getSafeFieldName(primaryKey)+" AS ids_to_render, CAST( (row_number() OVER (ORDER BY page ASC)) AS integer)-1 AS occurence_nr "+
				
				"	FROM ("+
				
				// we will return to the client:
				// * a row number, which will be use for pagination
				// * the name of the PK column, and all the values of the PK to be found on a page [given an occurrence number ~ call number]
				//
				
				//		first row number of each page, and list of row id's contained in the page  
				"		SELECT 'row:'||min(rownumber)||':"+primaryKey+":'||string_agg(" + getSafeFieldName(primaryKey) + "::text, '"+ Constants.ARG_INTERNAL_SEPARATOR + "'::text) AS " + getSafeFieldName(primaryKey) + ", " +

				//          gather (in an array) a true/false value, telling us if the value we're searching for is found/not found in the row				
				"			array_agg(searched_column" + getSuitableOperatorAndArg(tableName, columnName, columnValue, false) + ") AS \"conditionIsMet_arr\", " +
				
				//			page number
				"			(rownumber / " + iDisplayLength + ") AS page "+
				"		FROM ("+
				
				// row-ids and row numbers
				
				"			SELECT " + getSafeFieldName(primaryKey) + ", " + getSafeFieldName(columnName)+" AS searched_column, " +
				"			 CAST(row_number() OVER (ORDER BY " + bigSortString + ") AS integer)-1 AS rownumber "+				
				"		 	FROM "+getSafeTableName(tableName, schema)+" ";
			
			// if filters are required, add those
			if (filterColumns!=null)
			{
				getRowNumberQuery += "	WHERE ";
				String[] parts = new String[filterColumns.length];
				for (int i=0; i<filterColumns.length; i++)
				{
					parts[i] = getSafeFieldName(filterColumns[i]) + " " +
						getSuitableOperatorAndArg(tableName, filterColumns[i], filterValues[i], false);
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
			
			
			
			//System.out.println(getRowNumberQuery);

			
			
			
			// build a key for storing the query and the resultset, for the next goto-call
			
			String hashKey = getRowNumberQuery + Util.join(argsColumns, "|") + Util.join(argValues, "|");
			boolean alreadyCalled = gotoQueryToResultSet.containsKey(hashKey);

			
			
			// we have built the right query, now use it to get the row number
			
			PostgresDatabaseCommunication dc = connectDatabase();
			
			try {
				dc.sendUpdate("SET search_path TO "+schema+"; ");	
				
				ResultSet rs;
				if( alreadyCalled )
					{
					res = gotoQueryToResultSet.get(hashKey);
					}
				else
					{
					rs = dc.sendPreparedQuery(getRowNumberQuery, argValues, ato);
					res = getResultsInAList(rs, new String[]{"ids_to_render"});
					gotoQueryToResultSet.put(hashKey, res);
					}
						 
				// get row number for the right occurence
				
				if (res.size() > 0 && occurrenceNr < res.size() )
					{				
					functionOuput = res.get(occurrenceNr)[0];
					}
				
			} catch (Exception e) {
				throw new RuntimeException("Error while executing query "+getRowNumberQuery, e);
			} 
			
			finally {
				closeDatabase(dc);
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
		String schema = getSchema(tableName);
		
		String idColumn = getPrimaryKeyColumn(tableName);
				
		
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
					getSafeFieldName(columnNames[i]) + " " + 
					getSuitableOperatorAndArg(tableName, columnNames[i], columnValues[i], true);
			columnValues[i] = removeFrontOperator(columnValues[i]);
		}	
		
		// set arguments
		String[] args = columnValues;	
		
		
		String getIdQuery = 
			"SELECT " + idColumn + " " +
			"FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + Util.join(matchingPairs, " AND ") + 
			";";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public UniqueValuesObject getUniqueValues(String tableName, String columnName) {
		
		String schema = getSchema(tableName);

	    // Quickest lookup (most of the time!), when a table contains a small number of unique values
		// (which is exactly what we expect when calling this function)
		// see: http://zogovic.com/post/44856908222/optimizing-postgresql-query-for-distinct-values
	    String query = "WITH RECURSIVE t(n) AS ("+
	    	    "  SELECT MIN(" + getSafeFieldName(columnName) + ") "+
	    	    "  FROM " + getSafeTableName(tableName, schema) + " "+
	    	    "  UNION "+
	    	    "  SELECT (SELECT " + getSafeFieldName(columnName) + " " +
	    	    "          FROM " + getSafeTableName(tableName, schema)+" " +
	    	    "          WHERE "+getSafeFieldName(columnName)+" > n " +
	    	    "          ORDER BY "+getSafeFieldName(columnName)+" LIMIT 1) "+
	    	    "  FROM t WHERE n IS NOT NULL "+
	    	    ") "+
	    	    "SELECT n FROM t WHERE n IS NOT NULL;";
	    
	    
	    PostgresDatabaseCommunication dc = connectDatabase();

	    UniqueValuesObject uvo = new UniqueValuesObject();
	    ArrayList<String[]> res;
	    
	    try {
	      dc.sendUpdate("SET search_path TO " + schema + "; ");
	      
	      // in some rare cases, the query hereabove will be slow
	      dc.sendUpdate("SET statement_timeout TO "+maxAllowedDuration+";");

	      ResultSet rs = dc.sendQuery(query);

	      res = getResultsInAList(rs, new String[] { "n" });
	      if (res.size() > 0)
	      {
	        for (String[] oneRecord : res)
	        {
	          String oneValue = oneRecord[0].trim();
	          if (oneValue != null)
	            uvo.addValue(oneValue);
	        }
	      }
	    }
	    catch (Exception e) {   
	    	
	    	// we might get a time out...
	    	// try the old style query, which is mostly slow, but in some rare cases it is the fastest...
	    	
	    	uvo = getUniqueValues_oldStyle(tableName, columnName, null, null);
	      
	    }
	    finally
	    {
	      closeDatabase(dc);
	    }

	    return uvo;
	  }
	
	// see getUniqueValues
	public UniqueValuesObject getUniqueValues_oldStyle(String tableName, String columnName, String columnValueFilter, String limit) {
		
		String schema = getSchema(tableName);		
		if (columnValueFilter == null) columnValueFilter = "";
	
		// GROUP BY can be faster than DISTINCT
	    // see: http://stackoverflow.com/questions/6598778/solution-for-speeding-up-a-slow-select-distinct-query-in-postgres
	    
    	String query = "SELECT " + getSafeFieldName(columnName) + " AS n " + 
    			"FROM " + getSafeTableName(tableName, schema) + " " + 
    			"WHERE " + getSafeFieldName(columnName)+" IS NOT NULL " +
    			(
    			columnValueFilter.isEmpty() ? "" : 
    			"AND "+getSafeFieldName(columnName)+" "+getSuitableOperatorAndArg(tableName, columnName, columnValueFilter, false)+" "
    			) +
    			"GROUP BY " + getSafeFieldName(columnName) + " " +
    			"ORDER BY " + getSafeFieldName(columnName) + ";";
    	
    	if (limit != null)
    	{
    		query = "SELECT n " +
    				"FROM (" +
    				"	SELECT " + getSafeFieldName(columnName) + " AS n " + 
        			"	FROM " + getSafeTableName(tableName, schema) + " " + 
        			"	WHERE " + getSafeFieldName(columnName)+" IS NOT NULL " +
        			(
        				columnValueFilter.isEmpty() ? "" : 
        				"AND "+getSafeFieldName(columnName)+" "+getSuitableOperatorAndArg(tableName, columnName, columnValueFilter, false)+" "
        			) +
        			"	GROUP BY " + getSafeFieldName(columnName) + " " +
        			"	ORDER BY count(*) DESC " +
        			"	LIMIT " + limit + ") x " +
        			"ORDER BY n;";
    	}
    	    	
    	PostgresDatabaseCommunication dc = connectDatabase();

	    UniqueValuesObject uvo = new UniqueValuesObject();
	    ArrayList<String[]> res;
	    
    	try {
  	      dc.sendUpdate("SET search_path TO " + schema + "; ");
  	      
  	      ResultSet rs = columnValueFilter.isEmpty() ? 
  	    		  dc.sendQuery(query)
  	    		  :
  	    		  dc.sendPreparedQuery(query, new String[]{columnValueFilter});

  	      res = getResultsInAList(rs, new String[] { "n" });
  	      if (res.size() > 0)
  	      {
  	        for (String[] oneRecord : res)
  	        {
  	          String oneValue = oneRecord[0].trim();
  	          if (oneValue != null)
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
	 * @param tableName
	 * @param id
	 * @return
	 */
	public  TableRecordObject getRecord(String tableName, String id){
		
		TableRecordObject tro = new TableRecordObject();
		String schema = getSchema(tableName);
		String idColumn = getPrimaryKeyColumn(tableName);
		String idColumnType = getTypeOfColumn(tableName, idColumn);
		
		ArrayList<String[]> res;
		
		// set arguments
		String[] args = {id};		
		
		String[] columnsNames = getColumnNames(tableName);
		
		String getRecord = 
			"SELECT \"" + Util.join(columnsNames, "\", \"") + "\" " + // safe fieldnames
			"FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + getSafeFieldName(idColumn) + " = ?;";	// id's require strict equality
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");				
			
			ArgumentTypesObject ato = new ArgumentTypesObject();
			ato.setType(0, idColumnType);
			
			ResultSet rs = dc.sendPreparedQuery(getRecord, args, ato);
			
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
	 * Get multiple table records, given a table name and some record ids
	 * @param tableName
	 * @param ids
	 * @return
	 */
	public  TableRecordsObject getRecords(String tableName, String[] ids){
		
		TableRecordsObject tro = new TableRecordsObject();
		String schema = getSchema(tableName);
		String idColumn = getPrimaryKeyColumn(tableName);
		String idColumnType = getTypeOfColumn(tableName, idColumn);
		
		String[] columnsNames = getColumnNames(tableName);
		int idColumnIndex = Util.getIndexOf(idColumn, columnsNames);
		
		ArrayList<String[]> res;
		
		// set arguments
		String[] args = ids;		
		
		
		
		String getRecords = 
			"SELECT " + Util.join(columnsNames, ", ") + " " +
			"FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + getSafeFieldName(idColumn) + " " +
			"IN ("+Util.getStringOfQuestionMarks(ids)+");";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");				
			
			ArgumentTypesObject ato = new ArgumentTypesObject();
			for (int i=0; i<ids.length; i++)
			{
				ato.setType(i, idColumnType);
			}
			
			ResultSet rs = dc.sendPreparedQuery(getRecords, args, ato);
			
						
			res = getResultsInAList(rs, columnsNames);	
			
			if (res.size() == ids.length) // expected number of rows?
			{
				// process each row
				for (int i=0; i<ids.length; i++)
				{
					String[] recordCell = res.get(i);
					
					if (recordCell != null)
					{
						for (int j=0; j<columnsNames.length; j++)
						{
							String idOfthisRow = recordCell[idColumnIndex];
							tro.addIdColumnAndValue(idOfthisRow, columnsNames[j], recordCell[j]);
						}
					}
				}
				
			}
			
			
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getRecords, e);
		} 
		
		finally {
			closeDatabase(dc);
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
	public  TableRecordObject getRecordWithoutId(String tableName, 
			String[] columnNamesToMatch, String[] valuesToMatch){
		
		TableRecordObject tro = new TableRecordObject();
		String schema = getSchema(tableName);		
		
		ArrayList<String[]> res;
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] valueTypes = getTypesOfColumns(tableName, columnNamesToMatch);
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
		for (int i=0; i<columnNamesToMatch.length; i++)
		{
			matchingPairs[i] = 
					getSafeFieldName(columnNamesToMatch[i]) + " " + 
					getSuitableOperatorAndArg(tableName, columnNamesToMatch[i], valuesToMatch[i], true);
			valuesToMatch[i] = removeFrontOperator(valuesToMatch[i]);
		}			
		
		// set arguments
		String[] args = valuesToMatch;
		
		String getRecord = 
			"SELECT * " +
			"FROM " + getSafeTableName(tableName, schema) + " " +				
			"WHERE " + (Util.join(matchingPairs, " AND ")) + ";";
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");				
			
			ResultSet rs = dc.sendPreparedQuery(getRecord, args);
			
			String[] columnsNames = getColumnNames(tableName);			
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
	 * @param functionName
	 * @param args
	 * @return
	 */
	public  TableRecordObject callFunction(String functionName, String[] args){
		
		// prevent sql injection
		args = Util.removeSuspiciousSql(args);
		
		// get the function argument types
		String[] argumentTypes = getFunctionTypes(functionName, args.length);
		String returnType = getFunctionReturnType(functionName, args.length);
		
		// process the argument list according to the type
		// (t.i. add quotes for text args)
		if (argumentTypes!= null && args.length == argumentTypes.length)
		{
			for (int i=0; i<argumentTypes.length; i++)
			{
			if (argumentTypes[i].equals("text")
					&& !args[i].equals("NULL") // exclude null, which must be interpreted as a null value further on
				)						       // so it must be printed without quotes!
				{				
				// make sure inside-quotes are escaped in the Postgres way:
				// in strings like in "zzp\'er" (with slash)
				args[i] = (args[i]).replaceAll("([\\\\]+)(')([^'])", "$2$2$3");
				// in strings like in "zzp'er" (without slash)
				args[i] = (args[i]).replaceAll("([^'])(')([^'])", "$1$2$2$3");
				// in strings beginning or ending with a single quote (like in "'s ochtends")
				// (but of course, there must be no quote at the other end, in which case the quotes plays a different role)
				args[i] = ( !args[i].endsWith("'") ) ? (args[i]).replaceAll("^(')([^'])", "$1$1$2") : args[i];
				args[i] = ( !args[i].startsWith("'") ) ? (args[i]).replaceAll("([^'])(')$", "$1$2$2") : args[i];
				
				// last step:
				// add quotes around string iff they are missing!
				if (!(args[i].startsWith("'") && args[i].endsWith("'")) )
					{
					args[i] = "'" +	args[i] + "'";	
					}				
				}
			}
		}
		
		TableRecordObject tro = new TableRecordObject();
				
		ArrayList<String[]> res;
		
		String getRecord = returnType.equals("record") ? 
			"SELECT (" + functionName + "("+Util.join(args, ",")+")).*;" 
			:
			"SELECT " + functionName + "("+Util.join(args, ",")+");";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	public  void insertRecord(
			String tableName, String[] columnNames, 
			String[] values,
			DbResponseObject dro){
		
		String schema = getSchema(tableName);
		
		for (int i=0; i<columnNames.length; i++)
		{
			columnNames[i] = getSafeFieldName(columnNames[i]);
		}
		
		String insertRecords = 
			"INSERT INTO " + getSafeTableName(tableName, schema) + " ("+ Util.join(columnNames, ",") + ") " +
			"VALUES (" + Util.getStringOfQuestionMarks(values) + ") ;";		
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		String[] valueTypes = getTypesOfColumns(tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);
		}
		
				
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
			DbResponseObject dro){
		
		String schema = getSchema(tableName);
		String primaryKey = getPrimaryKeyColumn(tableName);
		
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
		String valueTypeOfIdColumn = getTypeOfColumn(tableName, primaryKey);
				
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	public  void insertFromExistingRecordsWithoutId(
			String tableName, 
			String[] filterColumnNames, String[] filterValues, 
			String[] replacementColumnNames, String[] replacementValues,
			String returningField, DbResponseObject dro){
		
		String type="update";
		
		String schema = getSchema(tableName);
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
			allParts[i] = getSafeFieldName(oneColumnName) + 
					" " + getSuitableOperatorAndArg(tableName, oneColumnName, pattern, true);
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
		String[] valueTypes = getTypesOfColumns(tableName, filterColumnNames);
		for (int i = 0; i<filterColumnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);
		}
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	public  void insertRecordAndGetItsId(
			String tableName, String[] columnNames,
			String[] values, 
			String returningField, DbResponseObject dro){
		
		String idOfCreatedRecord = "";
		String idColumn = (returningField != null && !returningField.equalsIgnoreCase("null")) ?
				returningField : getPrimaryKeyColumn(tableName);
		
		String schema = getSchema(tableName);
		
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
		String[] valueTypes = getTypesOfColumns(tableName, columnNames);
		for (int i = 0; i<columnNames.length; i++)
		{
			ato.setType(i, valueTypes[i]);			
		}
				
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
			DbResponseObject dro){
		
		// set schema, table and pk column names etc
		
		String schema = 		getSchema(tableName);		
		String[] columnNames =	getColumnNames(tableName);
		
		String idOfCreatedRecord = "";
		String idColumn = (pkSubstitute != null && !pkSubstitute.equalsIgnoreCase("null")) ?
				pkSubstitute : getPrimaryKeyColumn(tableName);

		columnNamesToSkip = (columnNamesToSkip != null && (columnNamesToSkip.length>0 && !(columnNamesToSkip[0]).equalsIgnoreCase("null"))) ?
				columnNamesToSkip : new String[]{};
		
		// set the column names
		
		for (int i=0; i<columnNames.length; i++)
		{
			columnNames[i] = getSafeFieldName(columnNames[i]);
		}
		
		
		// remove the primary key from the columns names
		// and also the columns that should be skipped (if set!) 
		
		columnNames = Util.removeElement(columnNames, getSafeFieldName(idColumn) );
		for (int i=0; i<columnNamesToSkip.length; i++)
		{
			columnNames = Util.removeElement(columnNames, getSafeFieldName(columnNamesToSkip[i]) );
		}
		
		
		// now build the row duplication query
		
		String duplicateRecord = 
			"INSERT INTO " + getSafeTableName(tableName, schema) + " ("+ Util.join(columnNames, ",") + ") " +
			"SELECT  " + Util.join(columnNames, ",") + " " +
			"FROM " + getSafeTableName(tableName, schema) + " " +
			"WHERE " + getSafeFieldName(idColumn) + " = ? " +
			"RETURNING " + getSafeFieldName(idColumn) + ";";
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] values = new String[]{ pkValue };
		String[] valueTypes = getTypesOfColumns(tableName, new String[]{idColumn});
		ato.setType(0, valueTypes[0]);
				
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			ResultSet rs = dc.sendPreparedQuery(duplicateRecord, values, ato);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{idColumn});
			idOfCreatedRecord = res.get(0)[0];	
			dro.setResponse(idOfCreatedRecord);
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+duplicateRecord);
			throw new RuntimeException("Error while executing query "+duplicateRecord, e);
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
	public  void updateOneColumn(
			String tableName, String rowId, String columnName, 
			String valueToUpdate,
			DbResponseObject dro){
		
		String schema = getSchema(tableName);
		String idColumn = getPrimaryKeyColumn(tableName);
		
		// set arguments
		String[] args = new String[]{valueToUpdate, rowId};		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		ato.setType(0, getTypeOfColumn(tableName, columnName));
		ato.setType(1, getTypeOfColumn(tableName, idColumn));
		
		
		String updateRecords = 
			"UPDATE " + getSafeTableName(tableName, schema) + " " + 
			"SET "+ getSafeFieldName(columnName) +" = ? " +
			"WHERE "+ getSafeFieldName(idColumn) +" = ? ;";	
		
				
		PostgresDatabaseCommunication dc = connectDatabase();			
		
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
	 * update the comment of a table
	 * like:
	 * COMMENT ON TABLE mytable IS 'This is my table.';
	 * @param tableName
	 * @param tableType
	 * @param newComment
	 * @param dro
	 */
	public void updateComment(String tableName, String tableType,
			String newComment, DbResponseObject dro){
		
		// remove suspicious sql
		newComment = Util.removeSuspiciousSql( new String[]{newComment} )[0];
		
		String schema = getSchema(tableName);
		
		PostgresDatabaseCommunication dc = connectDatabase();	
		
		// single quote escape is quote doubling 
		newComment = newComment.replace("'", "''");
		// backslash escape is backslash doubling 
		newComment = newComment.replace("\\", "\\\\");
		
		String setComment = 
			"COMMENT ON " + tableType + " " + 
			getSafeTableName(tableName, schema) + " " +
			" IS E'" + newComment + "';";
		
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");				
			
			dc.sendUpdate(setComment);
		}
		catch (Exception e) {
			dro.setResponse("Error while executing query "+setComment);
			throw new RuntimeException("Error while executing query "+setComment, e);
		}
		
		finally {
			closeDatabase(dc);
		}
		
	}
	
	
	/**
	 * getComment
	 * Get the comment on a table
	 * @param tableName
	 * @param tableType
	 * @return
	 */
	public  String getComment(String tableName, String tableType){
		
		String sTableComment = "";
		String schema = getSchema(tableName);				
		
		ArrayList<String[]> res;
		
		// set arguments
		String[] args = new String[]{schema, tableName};	
		
		String getIdQuery = 
			"SELECT n.nspname AS \"schema\", "+
			"c.relname AS \"table\", "+
			"obj_description(c.oid, 'pg_class') AS \"comment\" "+
			"FROM pg_catalog.pg_class c "+
			"FULL JOIN pg_catalog.pg_index i ON i.indexrelid = c.oid "+
			"FULL JOIN pg_catalog.pg_class c2 ON i.indrelid = c2.oid "+
			"FULL JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace "+
			"WHERE (c.relkind = 'r' OR c.relkind = 'v') "+
			"AND n.nspname NOT IN ('pg_catalog', 'pg_toast') "+
			"AND n.nspname != 'information_schema' "+
			"AND n.nspname = ? " + // schema
			"AND c.relname = ? " + // table
			"ORDER BY 1,2;";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");	
			
			ResultSet rs = dc.sendPreparedQuery(getIdQuery, args);
			
			res = getResultsInAList(rs, new String[]{"comment"});
			if (res.size()>0)
				{
				sTableComment = res.get(0)[0];				
				}
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getIdQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		return sTableComment;	
	}
	
	
	
	
	/**
	 * checkIfIndexExists
	 * Check whether some index (even multi-column one) exists or not
	 * @param tableName
	 * @param indexedFields
	 * @return
	 */
	public Boolean checkIfIndexExists(String tableName, String[] indexedFields){
		
		// empty fields list makes no sense: we don't lack any index then!
		if (indexedFields.length == 0)
			return true;
		
		// are we dealing with a view or a table here?				
		// because views don't have indexes, so it's no use to check indexes!
		ArrayList<String> listOfTrueTables = getTrueTablesList();
		boolean currentTableIsaView = !(listOfTrueTables.contains(getTableNameOnly(tableName)));
		if (currentTableIsaView)
			return true;
		
		boolean indexExists = false;		
		String schema = getSchema(tableName);
		ArrayList<String[]> res;
		
		// get sorted list of indexedFields
		// (so we can compare this list with a sorted list from the database indexes)
		String[] sortedArray = Util.cloneArr(indexedFields);
		Arrays.sort(sortedArray);
		String delimiter = ",";
		String indexedFieldsStr = Util.join(sortedArray, delimiter);
		
		// already checked?
		String key = tableName+schema+indexedFieldsStr;
		if (tableAndColumnNameToIndex.containsKey(key))
			return true;
		
		// set arguments
		String[] args = new String[]{schema, tableName, indexedFieldsStr};	
		
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
			"WHERE column_names = ?; "; 		// column names, sorted 
				
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");	
			
			ResultSet rs = dc.sendPreparedQuery(checkExistenceQuery, args);
			
			res = getResultsInAList(rs, new String[]{"result"});
			
			indexExists = (res.size()>0);
			
			if (indexExists)
				tableAndColumnNameToIndex.put(key, true);
			
			return indexExists;
			
		} catch (Exception e) {
			throw new RuntimeException("Error while executing query "+checkExistenceQuery, e);
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
	public  void updateWholeRecord(
			String tableName, String rowId, String[] columnNames,
			String[] valuesToUpdate,
			DbResponseObject dro){
		
		String schema = getSchema(tableName);
		String idColumn = getPrimaryKeyColumn(tableName);
		
		// set arguments
		String[] args = Util.concatArr(valuesToUpdate, new String[]{rowId}); 
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		for (int i=0; i< columnNames.length; i++)
		{
			String oneColumn = columnNames[i];
			columnNames[i] = getSafeFieldName(columnNames[i]);
			ato.setType(i, getTypeOfColumn(tableName, oneColumn));
		}		
		ato.setType(columnNames.length, getTypeOfColumn(tableName, idColumn));
		
		
		String updateRecords = 
			"UPDATE " + getSafeTableName(tableName, schema) + 
			" SET "+ (Util.join(columnNames, " = ?,") +" = ? ") +
			"WHERE "+ getSafeFieldName(idColumn) +" = ? ;";
		
				
		PostgresDatabaseCommunication dc = connectDatabase();			
		
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
	public  void updateRecordWithoutId(
			String tableName, 
			String[] columnNamesToMatch, String[] valuesToMatch,
			String[] columnNamesToUpdate, String[] valuesToUpdate,
			DbResponseObject dro ){
		
		String schema = getSchema(tableName);
			
		// set arguments
		String[] args = Util.concatArr(valuesToUpdate, valuesToMatch); 
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] valuesToUpdateTypes = getTypesOfColumns(tableName, columnNamesToUpdate);
		for (int i = 0; i<columnNamesToUpdate.length; i++)
		{
			ato.setType(i, valuesToUpdateTypes[i]);
		}	
		
		// the following argument values must follow the previous ones (speaking of indexes)
		int countFrom = columnNamesToUpdate.length;
		
		String[] valuesToMatchTypes = getTypesOfColumns(tableName, columnNamesToMatch);
		for (int i = 0; i<columnNamesToMatch.length; i++)
		{
			ato.setType(countFrom + i, valuesToMatchTypes[i]);
		}	
				
		// setting pairs 
		String[] settingPairs = new String[columnNamesToUpdate.length];
		for (int i=0; i<columnNamesToUpdate.length; i++)
		{
			settingPairs[i] = getSafeFieldName(columnNamesToUpdate[i]) + " = ?";
		}
		
		// matching pairs with suitable operator
		String[] matchingPairs = new String[columnNamesToMatch.length];
		for (int i=0; i<columnNamesToMatch.length; i++)
		{
			matchingPairs[i] = getSafeFieldName(columnNamesToMatch[i]) + 
					" " + getSuitableOperatorAndArg(tableName, columnNamesToMatch[i], valuesToMatch[i], true);
		}
		
		String updateRecords = 
			"UPDATE " + getSafeTableName(tableName, schema) + " " +
			"SET "+ Util.join(settingPairs, ",") + " " +
			"WHERE " + (Util.join(matchingPairs, " AND ")) + ";";		
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	 * Update a database record within a search&replace action, 
	 * given some column names and values to match
	 * @param tableName
	 * @param columnNamesToMatch
	 * @param valuesToMatch
	 * @param columnNamesToUpdate
	 * @param valuesToUpdate
	 * @param dro
	 */
	public  void updateRecordWithoutId_ForSearchAndReplace(
			String tableName, 
			String[] columnNamesToMatch, String[] valuesToMatch,
			String[] columnNamesToUpdate, String[] valuesToUpdate,
			DbResponseObject dro ){
		
		String schema = getSchema(tableName);			
		
		// set datatypes of arguments
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		String[] valueTypes = getTypesOfColumns(tableName, columnNamesToMatch);
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
				allowsRegex(getTypeOfColumn(tableName, columnNamesToUpdate[i])) && indexOfMatcher>-1 ?
					"regexp_replace("+getSafeFieldName(columnNamesToUpdate[i]) + ", '" + getDoubleEscape(valuesToMatch[indexOfMatcher]) + "', '" + getValidSqlBackReference(valuesToUpdate[i]) + "') " :
						"'"+getValidSqlBackReference(valuesToUpdate[i])+"'"
			);
		}
		
		// matching pairs with suitable operator
		String[] matchingPairs = new String[columnNamesToMatch.length];
		for (int i=0; i<columnNamesToMatch.length; i++)
		{
			matchingPairs[i] = getSafeFieldName(columnNamesToMatch[i]) + 
					" " + getSuitableOperatorAndArg(tableName, columnNamesToMatch[i], valuesToMatch[i], true);
		}
		
		String updateRecords = 
			"UPDATE " + getSafeTableName(tableName, schema) + " " +
			"SET "+ Util.join(settingPairs, ",") + " " +
			"WHERE " + (Util.join(matchingPairs, " AND ")) + ";";		
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	 * @param tableName
	 * @param query
	 * @return
	 */
	public Integer getEstimateCount(String countQuery){
		
		int count = -1;		
		
		// random id for a temporary table, to make sure we won't try to create an already existing table
		int tableId = Math.abs(new Random().nextInt());
		
		Util.debug(co, "## Get count estimate (fast)");
		
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
		
		
		PostgresDatabaseCommunication dc = connectDatabase();	
		
		try {
			Util.debug(co, "## Get count estimate (fast)");
			
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
	 * @param tableName
	 * @param query
	 * @return
	 */
	public Integer getQueryCost(String countQuery){
		
		int queryCost = -1;
		
		// random id for a temporary table, to make sure we won't try to create an already existing table
		int tableId = Math.abs(new Random().nextInt());
		
		Util.debug(co, "## Get query cost");
		
		
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
	
		
		PostgresDatabaseCommunication dc = connectDatabase();	
		
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
		
		Util.debug(co, "queryCost = "+queryCost);
		return queryCost;		
	}
	
	
	
	
	/**
	 * get the true exact count of a table
	 * @param tableName
	 * @param columnNames
	 * @param values
	 * @param dro
	 */
	public Integer getTrueCountOfATable(String tableName){
		
		String schema = getSchema(tableName);			
		int count = -1;
		ArrayList<String[]> res;
		
		String getCountQuery = 
			"SELECT COUNT(*) AS rowcount " +
			"FROM " + getSafeTableName(tableName, schema) + ";";	
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");	
			
			
			boolean bForceExactCount = this.getForceExactCount();
			
			// Get the count, but set a time limit...
			// Except if we absolutely required an exact count (can be slow, but the user required it so...)
			ResultSet rs = bForceExactCount ? 
					dc.sendQuery(getCountQuery) : dc.sendQueryWithTimeout(getCountQuery, maxAllowedDuration);
			
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
	public  ArrayList<String[]> getTableList(){

		String schema = getSchemaName();
		
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
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		ArrayList<String[]> result = new ArrayList<String[]>();
		
		// prepare max allowed cost initialization
		int queryCost = getQueryCost(replaceQuestionMarksByArgsInQuery(query, new String[]{schema}));
		long timeBefore = new Date().getTime();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			ResultSet rs = dc.sendPreparedQuery(query, new String[]{schema});
			
			// compute max allowed cost (initialization)
			long timeAfter = new Date().getTime();
			recomputeMaxAllowedCost(queryCost, timeBefore, timeAfter);
			
			// get list of tables
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
	public  ArrayList<String> getTrueTablesList(){

		String schema = getSchemaName();
		
		// BEWARE: the following shorter query doesn't seem to work in Postgres 8 (only 9)
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
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
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
		
		// array
		if (value.startsWith("{") && value.endsWith("}") && columnType.endsWith("[]"))
			return true;
		
		// booleans
		if (value.matches("true|false") && columnType.equals("boolean"))
			return true;
		
		// tsvector 
		if (columnType.equals("tsvector")) // good enough for now (no conditions) 
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
		
		// (a string containing other things than digits is not suitable to whole number field)
		if (value.matches(".*([^\\d]).*") && (PostgresDatabaseCommunication.isWholeNumberType(columnType) || PostgresDatabaseCommunication.isBigWholeNumberType(columnType)) )
			return false;
		
		// (a string containing other things than digits and a dot is not suitable to real number field)
		if (value.matches(".*([^\\d\\.]).*") && PostgresDatabaseCommunication.isRealNumberType(columnType))
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
		
		// The following regex matches exact words only (no partial match)
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
	public  TableAndCountObject getTable(
			String tableName, int countOfWholeTable, String[] allColumns, 
			int iDisplayLength, 
			int iDisplayStart, String sSearch, 
			ArrayList<String> aSearchColumnNames, ArrayList<String> aSearchColumnValues, ArrayList<Boolean> aCaseSensitiveColumnSearch,
			boolean weMustSort, 
			String[] aSortCol, String[] aSortDir){
		
		long timeAtVeryStart = new Date().getTime();
	
		String schema = getSchema(tableName);
		
		if (Constants.debug){
			System.out.println();
			System.out.println("Sort (initial):");
			System.out.println(Util.join(aSortCol, ", "));
			System.out.println(Util.join(aSortDir, ", "));
		}
		
		
		// get table content		
		
		// first locate the primary key
		String primaryKey = getPrimaryKeyColumn(tableName);
		
		
		// Speaking about sorting, it is always a good idea
		// to use the primary key as a secondary sorting column,
		// because sometimes the primary sorting column chosen
		// by the user contains doubled values, which are sorted randomly
		// (as their value is exactly the same). So to prevent this
		// random sorting, the primary key is added as a secondary sorting
		// column (as very last sorting column).
		
		if (primaryKey != null && 
				Util.getIndexOf(primaryKey, aSortCol)<0)
		{
			if (Constants.debug){
				System.out.println("'"+primaryKey+"' is no part of "+Util.join(aSortCol, ", "));
			}
			
			aSortCol = Util.concatArr(aSortCol, new String[]{primaryKey});	
			aSortDir = Util.concatArr(aSortDir, new String[]{"ASC"});
		}
		
		if (Constants.debug){
			System.out.println();
			System.out.println("Sort (possibly) enriched:");
			System.out.println(Util.join(aSortCol, ", "));
			System.out.println(Util.join(aSortDir, ", "));
		}
		
		
		// normal query
		String query = "SELECT "+getCommaSeparatedListOfColumnNamesForaSelect(allColumns)+" FROM "+getSafeTableName(tableName, schema) + " ";
		// results count query		
		String countQuery = "SELECT COUNT(*) AS count FROM "+getSafeTableName(tableName, schema) + " ";
				
		String[] columnsToSearch;
		ArrayList<String> queryValues = new ArrayList<String>();
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		// -----------------------------------------------
		// main search, without column filters
		// -----------------------------------------------
		
		// [ beware: null is also a genuine search value, so it's considered non-empty ]
		if ( (sSearch == null || !sSearch.isEmpty()) && aSearchColumnValues.size()==0)
		{
			// main search means search all columns at once
			columnsToSearch = getColumnNames(tableName);
			ArrayList<String> queryParts = new ArrayList<String>();
			ato = new ArgumentTypesObject();
			
			// build the query condition for each column (!!! the MAIN search will search EACH column of course !!!)
			for (int i=0; i<columnsToSearch.length; i++)
			{
				// build current part
				queryValues.add(sSearch);
				
				// check if current column can be searched given a search string
				if ( !valueIsSuitableForColumnType(sSearch, getTypeOfColumn(tableName, columnsToSearch[i])) )
				{
					queryParts.add(
							"CAST("+getSafeTableNameOnly(tableName) + "." + getSafeFieldName(columnsToSearch[i]) + 
							" AS text) " + getSuitableOperatorAndArg(tableName, null, sSearch, false)
							);
					ato.setType(queryValues.size()-1, "text");
				}
				else
				{
					queryParts.add(
							getSafeTableNameOnly(tableName) + "." + getSafeFieldName(columnsToSearch[i]) + 
							" " + getSuitableOperatorAndArg(tableName, columnsToSearch[i], sSearch, false)
							);
					ato.setType(queryValues.size()-1, getTypeOfColumn(tableName, columnsToSearch[i]));
				}
				
				
			}
			// in a main search, finding in only one column is good enough, so we use 'OR' between columns
			if (queryParts.size()>0)
			{
				query += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";
				countQuery += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";				
			}
						
			
		}
		
		// -----------------------------------------------
		// main search WITH column filters
		// -----------------------------------------------
		
		// [ beware: null is also a genuine search value, so it's considered non-empty ]
		else if ( (sSearch == null || !sSearch.isEmpty()) && aSearchColumnValues.size()>0)
		{
			// main search means search all columns at once
			columnsToSearch = getColumnNames(tableName);
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
				if ( !valueIsSuitableForColumnType(sSearch, getTypeOfColumn(tableName, columnsToSearch[i])) )
				{
					queryParts.add(
							"CAST(" + getSafeTableNameOnly(tableName) + "." + getSafeFieldName(columnsToSearch[i]) + 
							" AS text) "+ getSuitableOperatorAndArg(tableName, null, sSearch, false)
							);
					ato.setType(queryValues.size()-1, "text");
				}
				else
				{
					queryParts.add(
							getSafeTableNameOnly(tableName) + "." + getSafeFieldName(columnsToSearch[i]) + 
							" " + getSuitableOperatorAndArg(tableName, columnsToSearch[i], sSearch, false) 
							);
					ato.setType(queryValues.size()-1, getTypeOfColumn(tableName, columnsToSearch[i]));
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
				if ( !valueIsSuitableForColumnType(aSearchColumnValues.get(i), getTypeOfColumn(tableName, aSearchColumnNames.get(i))) )
				{
					queryParts.add(
							"CAST("+getSafeTableNameOnly(tableName) + "." + getSafeFieldName(aSearchColumnNames.get(i)) + 
							" AS text) "+ getSuitableOperatorAndArg(tableName, null, aSearchColumnValues.get(i), caseSensitiveColumn)
							);
					ato.setType(queryValues.size()-1, "text");
				}
				else
				{
					queryParts.add(
							getSafeTableNameOnly(tableName) + "." + getSafeFieldName(aSearchColumnNames.get(i)) + 
							" " + getSuitableOperatorAndArg(tableName, aSearchColumnNames.get(i), aSearchColumnValues.get(i), caseSensitiveColumn)  
							);
					ato.setType(queryValues.size()-1, getTypeOfColumn(tableName, aSearchColumnNames.get(i)));
				}
				
				
				
			}
			
			// the column filters are compulsory so we use 'AND'
			if (queryParts.size()>0)
			{
				query += "AND ("+ Util.join(queryParts, " AND ") + ") ";
				countQuery += "AND ("+ Util.join(queryParts, " AND ") + ") ";				
			}			
			
		}
		
		// -----------------------------------------------
		// per-column search (no main search)
		// -----------------------------------------------
		
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
				if ( !valueIsSuitableForColumnType(aSearchColumnValues.get(i), getTypeOfColumn(tableName, columnsToSearch[i])) )
				{
					queryParts.add(
							"CAST("+getSafeTableNameOnly(tableName) + "." + getSafeFieldName(columnsToSearch[i]) + 
							" AS text) " + getSuitableOperatorAndArg(tableName, null, aSearchColumnValues.get(i), caseSensitiveColumn)
							);
					ato.setType(queryValues.size()-1, "text");
				}
				else
				{
					queryParts.add(
							getSafeTableNameOnly(tableName) + "." + getSafeFieldName(columnsToSearch[i]) + 
							" " + getSuitableOperatorAndArg(tableName, columnsToSearch[i], aSearchColumnValues.get(i), caseSensitiveColumn) 
							);
					ato.setType(queryValues.size()-1, getTypeOfColumn(tableName, columnsToSearch[i]));
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
				// apply reverse sorting if required
				if (aSortDir[s].toLowerCase().contains("_reverse"))
				{
					sortPart += sortSeparator + "REVERSE("+getSafeFieldName(aSortCol[s]) + ") " + aSortDir[s].replaceAll("(_reverse|_REVERSE)", "");
				}
				// normal sorting
				else
				{
					sortPart += sortSeparator + getSafeFieldName(aSortCol[s]) + " " + aSortDir[s];
				}
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
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
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
			
			ArrayList<ConcurrentHashMap<String, String>> cellList = 
				getListOfIdToCell(tableName, primaryKey, rs1, allColumns );
			
			tableAndCount.setContent(cellList);
			
						
			
			// get the table count
			// if we have no filters, we take the complete count
			// otherwise we have to recount taking the filters into account
			int count = countOfWholeTable;
			boolean exactCount = getTrueTablesList().contains(tableName);
			
			// does the user requires an exact count just now?
			boolean bExactCountRequiredByUser = this.getForceExactCount();
			
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
				// read it from the cache (except if exact count is required by user just now)
				
				if (!bExactCountRequiredByUser && 
						queryToCount.containsKey(queryForCache))
				{
					Util.debug(co, "Query "+queryForCache+" found in cache");
					count = queryToCount.get(queryForCache);
					exactCount = queryToCountQuality.get(queryForCache);
				}
				
				// try counting the normal way (exact count, slower than estimate)
				else 
				{
					queryCost = getQueryCost(replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
					
					Util.debug(co, "%%% FAST COUNT decision: "+queryCost+ "<"+maxAllowedCost +"?");					
					
					// count the normal way, t.i. count(*)
					// if it is required by the user just now OR if querycost is low
					if (bExactCountRequiredByUser || queryCost < maxAllowedCost)
					{
						Util.debug(co, "%%% We will count the normal way (exact count required by user: "+bExactCountRequiredByUser+")");
						
						dc.sendUpdate("SET search_path TO "+schema+"; ");
						
						// Important here: we set a timeout, to make sure 
						// that the normal count will never takes too long.
						// BUT if the user absolutely required an exact count, he/she will have to put up with it...
						if ( !bExactCountRequiredByUser)
							dc.sendUpdate("SET statement_timeout TO "+maxAllowedDuration+";");
						
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
								// if the normal count timed out, we can't recompute the max allowed
								// cost in a reliable way, because the duration won't relate to the
								// query cost computed by the database. So, we have to cancel recomputation.
								recomputeMaxAllowedCost = false;
								}
							count = getEstimateCount(replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
							exactCount = false;
						}						
						
					}
					
					// if counting the normal way is PREDICTED to be too slow
					// (and exact count wasn't required by the user just now)
					// get an estimate count
					else
					{
						Util.debug(co, "%%% We will use an estimate count");
						count = getEstimateCount(replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
						exactCount = false;
					}											
				}				
				
				// get time at which counting finished
				long timeAfterCount = new Date().getTime();
				
				// recompute the maximal allowed cost (to keep in tune with actual system)
				if (recomputeMaxAllowedCost)
				{
					recomputeMaxAllowedCost(queryCost, timeBeforeCount, timeAfterCount);
					Util.debug(co, "$$$ RECOMPUTED maxAllowedCost = " + maxAllowedCost);
				}				
				Util.debug(co, "Counting took "+(timeAfterCount - timeBeforeCount)+" ms");
											
			}
			else
			{
				Util.debug(co, "## Query count is the same as total count");			
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
			Util.debug(co, "## ERROR: "+"Error while executing query "+query);
			e.printStackTrace(); 
		}
		finally {
			dc.sendUpdate("RESET statement_timeout;");
			closeDatabase(dc);
		}
		
		
		// We might have been counting with exact count now (if the user required to) 
		// but now we are done with counting, so set bForceExactCount back to 
		// its default value (=false, exact count not required)
		this.setForceExactCount(false);
		
		long timeAtVeryEnd = new Date().getTime();
		
		// if the query execution took more time than allowed,
		// register if there is an index for the columns now sorted by, as this might be the cause
		
		// NB: this function can't be called earlier, as the aSortCol automatically gets the primary key
		// added as secundary sort column half way the process.
		boolean indexAvailableForSortCol = checkIfIndexExists(tableName, aSortCol);
		
		if ((timeAtVeryEnd - timeAtVeryStart) > maxAllowedDuration 
				&& !indexAvailableForSortCol)
			tableAndCount.setNeededIndexForSortingColumns(Util.join(aSortCol, ", "));
		
		return tableAndCount;
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
	int numberOfAllowedCostRecomputations = 1;
	private void recomputeMaxAllowedCost(int queryCost, long timeBeforeCount, long timeAfterCount ){		
		
		// compute what the max allowed cost would be given the current
		// relation between cost and execution time
		int currentMaxAllowedCost = 
			(int) (maxAllowedDuration * ((float)queryCost / (timeAfterCount - timeBeforeCount) ));
		
		// if maxAllowedCost was not initialized yet, do it now
		if ( maxAllowedCost < 0)
		{
			numberOfAllowedCostRecomputations = 1;
			maxAllowedCost = currentMaxAllowedCost;			
		}
		// if we already have a maxAllowedCost, recompute it now
		else
		{
			// include this calculation in the average max allowed cost
			int estimatedTotalOfAllPreviousComputations = numberOfAllowedCostRecomputations * maxAllowedCost;
			
			numberOfAllowedCostRecomputations++;		
			int newTotalOfAllComputations = estimatedTotalOfAllPreviousComputations + currentMaxAllowedCost;
			
			// new average
			maxAllowedCost = newTotalOfAllComputations / numberOfAllowedCostRecomputations; 
		}
		
		
		Util.debug(co, ">>>>>> NEW maxAllowedCost = "+maxAllowedCost);
		
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
		List<String> arguments = new ArrayList<String>(Arrays.asList(args));
		
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
			Util.debug(co, ">>>>>> "+query);
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
	 * NOTE this function is old, and less reliable than its 4 argument counterpart,
	 * as it doesn't take column datatype into account (it was designed to work without that).
	 * @param value
	 * @return an operator as a string
	 */
	public String getSuitableOperator(String value, boolean caseSensitive){
		
		// get a version of the value without the operator
		String cleanValue = removeFrontOperator(value);
		
		
		// always check that one first (to prevent NullPointerException)
		if (value == null || value.toLowerCase().equals("null") )
			return " IS ";		
		if (value.toLowerCase().equals("!null"))
			return " IS NOT ";
		
		// negation operator
		boolean negation = false;
		if (value.startsWith("!"))
			negation = true;
		
		// array search
		if (value.startsWith("{") && value.endsWith("}"))
			return "@>";
		
		// inequality operators
		if (value.startsWith("<=") || value.startsWith(">="))
			return value.substring(0,2);		
		if (value.startsWith("<") || value.startsWith(">"))
			return value.substring(0,1);
		
		// if value is an integer, just test equality (because it's faster)
		// (NOTE that if <= or >= operators were required, those were catched hereabove)
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
	
	
	/**
	 * Determine which operator suits a string (whether it is a regex or not, etc)
	 * and return it.
	 * @param value
	 * @return an operator as a string
	 */
	public String getSuitableOperatorAndArg(String tableName, String columnName, String columnValue, boolean caseSensitive){
		
		// argument
		String arg = " ? ";
		
		// get column type
		String columnType = (columnName==null ? 
					"text" : getTypeOfColumn(tableName, columnName));
				
		
		// always check that one first (to prevent NullPointerException)
		if (columnValue == null || columnValue.toLowerCase().equals("null") )
			return " IS " + arg;		
		if (columnValue.toLowerCase().equals("!null"))
			return " IS NOT " + arg;
		
		// negation operator
		boolean negation = false;
		if (columnValue.startsWith("!"))
			negation = true;
		
		// array type
		if (columnType.endsWith("[]"))
			return "@>" + arg;
		
		// tsvector
		if (columnType.equals("tsvector"))
			return "@@ " + (negation ? "!!":"") + arg + "::tsquery ";
		
		// inequality operators 
		// (type check not necessary, since it works with both numeral and textual types)
		if (columnValue.startsWith("<=") || columnValue.startsWith(">="))
			return columnValue.substring(0,2) + arg;		
		if (columnValue.startsWith("<") || columnValue.startsWith(">"))
			return columnValue.substring(0,1) + arg;
		
		// if type is numeric, just test equality (because it's faster)
		// (NOTE that if <= or >= operators were required, those were catched hereabove)
		if (columnType.matches("smallint|integer|bigint|decimal|numeric|real|double precision|serial|bigserial")) 
			return (negation ? "!=" : "=") + arg;
		
		// booleans require '='
		if (columnType.equals("boolean"))
			return (negation ? "!=" : "=") + arg;
		
		// suitable operator for case (in)sensitive search and regex
		return caseSensitive ? 
				(negation ? "!~" : "~") + arg 
				: 
				(negation ? "!~*" : "~*") + arg;
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
	 * 
	 * @param table
	 * @return primary key OR null
	 */
	public  String getPrimaryKeyColumn(String tableName){
		
		String schema = getSchema(tableName);
		String tableNameOnly = getTableNameOnly(tableName);
				
		// use caching
		// (if we have already looked up the primary key, it is stored in a hash)
		
		if ( tableNameToPrimaryKey.containsKey(schema+tableNameOnly) )
			{
			Util.debug(co, "## PK from cache: "+tableNameToPrimaryKey.get(schema+tableNameOnly));
			return tableNameToPrimaryKey.get(schema+tableNameOnly);
			}
		
		
		// no cache, first lookup
		
		String primaryKeyColumn = null;	
					
		
		String getPK = "SELECT " +
			"pg_attribute.attname, " +
			"format_type(pg_attribute.atttypid, pg_attribute.atttypmod) " +
			"FROM pg_index, pg_class, pg_attribute " +
			"WHERE pg_class.oid = ?::regclass " +
			"AND indrelid = pg_class.oid " +
			"AND pg_attribute.attrelid = pg_class.oid " +
			"AND pg_attribute.attnum = any(pg_index.indkey) " +
			"AND indisprimary ";	
		
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			String[] args = new String[]{ schema+"."+getSafeTableNameOnly(tableName) };			
			
			ResultSet rs = dc.sendPreparedQuery(getPK, args);
			
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"attname", "format_type"});
			
			
			// Do we have an empty result?
			// than we might have a view, in which case we expect to have a field 'pkid'
			// which we will use as a primary key
			// Or do we have more than 1 result, which is illegal too as that means we have a multicolumn primary key...
			
			if (
					
				// No primary key found!
				res.size() == 0 
				||
				(res.size() != 0 && res.get(0)[0].trim().isEmpty() )
				|| 
				
				// More results means we've found a multicolumns primary key;
				// sadly this is not supported by Lex'it
				res.size() > 1  				 
				
			   )
			{
				// are we dealing with a view or a table here?				
				ArrayList<String> listOfTrueTables = getTrueTablesList();
				boolean currentTableIsaView = !(listOfTrueTables.contains(tableNameOnly));
				
				// we expect a view to have a given column which always 
				// functions as a primary key 
				if (currentTableIsaView)
				{
					// what are the available columns?
					String[] availableColumns = getColumnNames(tableName);
					
					// does the view have the needed primary key column
					if (Util.getIndexOf(Constants.PRIMARYKEY_FIELDNAME, availableColumns)>-1)
						primaryKeyColumn = Constants.PRIMARYKEY_FIELDNAME;
					
					// otherwise primaryKeyColumn keeps the initialisation value
				}
			}
			
			// if we do have a result, we have a primary key 
			else 
			{
				primaryKeyColumn = res.get(0)[0].trim();
			}
			
		} 
		catch (Exception e) {
			throw new RuntimeException("Error while executing query "+getPK, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
		
		// store the primary key in a hash, for caching (for speed improvement)
		if (primaryKeyColumn != null)
			tableNameToPrimaryKey.put(schema+tableNameOnly, primaryKeyColumn);
		
		Util.debug(co, "PK of "+tableNameOnly+" is "+primaryKeyColumn);
		
		return primaryKeyColumn;
	}
	
	
	/**
	 * Get the type of one particular column
	 * @param tableName
	 * @param columnName
	 * @return
	 */
	public  String getTypeOfColumn(String tableName, String columnName){
		
		String type = "";
		String schema = getSchema(tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		// use caching
		// (if we have looked up the column type already, it is stored in a hash)
		String cachingKey = schema+tableNameOnly+columnName;
		
		if ( tableAndColumnNameToTypes.containsKey(cachingKey) )
			{
			Util.debug(co, "## Column type from cache: "+columnName+" = "+tableAndColumnNameToTypes.get(cachingKey));
			return tableAndColumnNameToTypes.get(cachingKey);
			}
		
		// use COALESCE to prevent datatype from being NULL
		String typeQuery = 
			"SELECT COALESCE( data_type||'('||character_maximum_length||')', replace(data_type, 'ARRAY', udt_name||'[]') ) AS type "+
			"FROM information_schema.columns " +
			"WHERE table_name = ? " +
			"AND column_name = ? " +
			"AND table_schema = ? ;";
		
			
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			String[] args = new String[]{tableNameOnly, columnName, schema};		
			
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
	 * @param tableName
	 * @param columns
	 * @return
	 */
	public  String[] getTypesOfColumns(String tableName, String[] columns){
		
		// this query will be used to query the column type one column at the time
		// use COALESCE to prevent datatype from being NULL
		String typeQuery = "SELECT COALESCE( data_type||'('||character_maximum_length||')', replace(data_type, 'ARRAY', udt_name||'[]') ) AS type "+
			"FROM information_schema.columns " +
			"WHERE table_name = ? " +
			"AND column_name = ? " +
			"AND table_schema = ? ;";
		
		String schema = getSchema(tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		String[] columnTypes = new String[columns.length];
			
			
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");
			
			for (int i = 0; i<columns.length; i++)
			{
				// remove quote from names, in case the "safe" quote name was saved
				columns[i] = removeQuotesFromSqlReservedWord(columns[i]);
				
								
				// use caching				
				// (if we have looked up the column type already, it is stored in a hash)
				String cachingKey = schema+tableNameOnly+columns[i];
				
				if ( tableAndColumnNameToTypes.containsKey(cachingKey) )
				{
					Util.debug(co, "## Column type from cache: "+columns[i]+" = "+tableAndColumnNameToTypes.get(cachingKey));
					columnTypes[i] = tableAndColumnNameToTypes.get(cachingKey);
				}
				// if cache is empty, ask the database 
				// (and put result in cache for later call)
				else
				{
					String[] args = new String[]{tableNameOnly, columns[i], schema};		
					
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
	 * @param tableName
	 * @param columns
	 * @return
	 */
	public String[] getColumnsComments(String tableName, String[] columns){
		
		String schema = getSchema(tableName);
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
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	 * @param functionName
	 * @return
	 */
	public String[] getFunctionTypes(String functionName, int numberOfArgs){
		
		// (see: http://www.varlena.com/GeneralBits/39.php)
		String functionDetailsQuery = "SELECT " +
			"t.typname AS return_type, " +
			"p.proname AS function_name, " +
			"pg_catalog.oidvectortypes(p.proargtypes) AS argument_types "+
			"FROM pg_proc p, pg_type t, pg_namespace n, pg_language l "+
			"WHERE p.prorettype = t.oid " +
			"AND p.pronamespace = n.oid "+
			"AND p.prolang = l.oid "+
			"AND p.proname = ? " +  // function name
			"AND n.nspname = ? " +  // schema name
			"AND p.pronargs = ?;";	// number of arguments (needed for distinction since we sometimes have homonyms)
		
		
		// if the function name contains a schema name (like 'api.blah'), extract it
		String schemaName = "public";
		String numberOfArguments = String.valueOf(numberOfArgs);
		if (functionName.indexOf(".")>0)
			{
				schemaName = functionName.split("\\.")[0];
				functionName = functionName.split("\\.")[1];
			}
		
		String cachingKey = schemaName+functionName;
		if ( functionNameToTypes.containsKey(cachingKey) )
			{
				if (Constants.debug) 
					{
					System.out.println("## Function args types from cache: ");
					System.out.println( Arrays.toString(functionNameToTypes.get(cachingKey)) );
					}
				
				return functionNameToTypes.get(cachingKey);
			}
		
		
		String[] argumentTypes = null;
		
		String schema = getSchemaName();
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");			
			
			String[] args = new String[]{functionName, schemaName, numberOfArguments };		
			
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
				functionNameToTypes.put(cachingKey, argumentTypes);
			}			
			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+functionDetailsQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
			
		if (Constants.debug)
		{
			System.out.println("## Function args types: ");
			System.out.println(Arrays.toString(argumentTypes));
		}
		

		
		return argumentTypes;
	}
	
	
	/**
	 * Determine if a function is a writing function (return 'writing')
	 * or just a reading function  (return 'reading')
	 * @param functionName
	 * @return
	 */
	public String getFunctionOperationType(String functionName){
		
		String projectSchema = getSchemaName(); // get schema of project
		
	
		// (see: http://stackoverflow.com/questions/3524859/how-to-display-full-stored-procedure-code)
		
		// does the function contain DELETE, UPDATE or INSERT?
		
		// The trick is:  
		// build a regex pattern like 
		// .*(update|delete from|insert into) schema_name\.(table1|table2|table3|table_whatever).*
		// and try to find this pattern in the function body text.
		// Finally, if it matches, return string 'writing', otherwise string 'reading',
		// which describes the function operation type.
		
		String functionQuery = 		
			"SELECT CASE (function_txt.fulltext ~ tables.writing_pattern) "+
			"WHEN true THEN 'writing' ELSE 'reading' END " + 
			"AS function_operation " +
			"FROM " +
			"(SELECT LOWER(regexp_replace(p.prosrc, E'[ \t\n\r]+', ' ', 'g')) AS fulltext " + 
			"FROM pg_proc p, pg_namespace n " +
			"WHERE p.proname = ? " +  // function name
			"AND n.nspname = ?) function_txt, " + // function schema name
			"(SELECT '.*(update|delete from|insert into) " + 
			"(|" + projectSchema + "\\.)" + // the schema name might be omitted here (eg. public)
			"('||string_agg(c.relname, '|')||').*' AS writing_pattern " +
			"FROM pg_catalog.pg_class c " +
			"FULL JOIN pg_catalog.pg_namespace n " + 
			"ON n.oid = c.relnamespace " +
			"WHERE c.relkind IN ('r','v','') " +
			"AND n.nspname NOT IN ('pg_catalog', 'pg_toast') " + 
			"AND n.nspname != 'information_schema' " +
			"AND n.nspname = ? " + // project schema name
			"ORDER BY 1) tables";
		
		// if the function name contains a schema name (like 'api.blah'), extract it
		String functionSchemaName = "public";
		if (functionName.indexOf(".")>0)
			{
			functionSchemaName = functionName.split("\\.")[0];
			functionName = functionName.split("\\.")[1];
			}
		
		String cachingKey = functionSchemaName+functionName;
		if ( functionNameToOperationType.containsKey(cachingKey) )
			{
			if (Constants.debug) 
				{
				System.out.println("## Function operation type from cache: ");
				System.out.println(functionNameToOperationType.get(cachingKey));
				}
			
			return functionNameToOperationType.get(cachingKey);
			}
		
		
		String functionOperationType = "writing";
		
		String schema = getSchemaName();
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");			
			
			String[] args = new String[]{functionName, functionSchemaName, projectSchema};		
			
			ResultSet rs = dc.sendPreparedQuery(functionQuery, args);				
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"function_operation"});
			
			if (res.size()>0)
				{
				functionOperationType = res.get(0)[0];
				functionNameToOperationType.put(cachingKey, functionOperationType);
				}			
			
			} 
		catch (Exception e) 
			{
				throw new RuntimeException("Error while executing query "+functionQuery, e);
			} 
			
		finally {
			closeDatabase(dc);
		}
			
		if (Constants.debug)
			{
				System.out.println("## Function operation type: ");
				System.out.println(functionOperationType);
			}
		
		return functionOperationType;
	}
	
	
	/**
	 * get the return type of a function
	 * @param functionName
	 * @return
	 */
	public String getFunctionReturnType(String functionName, int numberOfArgs){
		
		// (see: http://www.varlena.com/GeneralBits/39.php)
		String functionDetailsQuery = "SELECT " +
			"t.typname AS return_type, " +
			"p.proname AS function_name " +			
			"FROM pg_proc p, pg_type t, pg_namespace n, pg_language l "+
			"WHERE p.prorettype = t.oid " +
			"AND p.pronamespace = n.oid "+
			"AND p.prolang = l.oid "+
			"AND p.proname = ? " +  // function name
			"AND n.nspname = ? " +  // schema name
			"AND p.pronargs = ?;";	// number of arguments (needed for distinction since we sometimes have homonyms)
		
		// if the function name contains a schema name (like 'api.blah'), extract it
		String schemaName = "public";
		String numberOfArguments = String.valueOf(numberOfArgs);
		if (functionName.indexOf(".")>0)
			{
				schemaName = functionName.split("\\.")[0];
				functionName = functionName.split("\\.")[1];
			}
		
		String cachingKey = schemaName+functionName;
		if ( functionNameToReturnType.containsKey(cachingKey) )
			{
				if (Constants.debug) 
					{
					System.out.println("## Function return type from cache: ");
					System.out.println(functionNameToReturnType.get(cachingKey));
					}
				
				return functionNameToReturnType.get(cachingKey);
			}
		
		
		String returnType = null;
		
		String schema = getSchemaName();
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
		try {
			dc.sendUpdate("SET search_path TO "+schema+"; ");			
			
			String[] args = new String[]{functionName, schemaName, numberOfArguments};		
			
			ResultSet rs = dc.sendPreparedQuery(functionDetailsQuery, args);				
			ArrayList<String[]> res = getResultsInAList(rs, new String[]{"return_type"});
			
			if (res.size()>0)
			{
				returnType = res.get(0)[0];
				functionNameToReturnType.put(cachingKey, returnType);
			}			
			
		} 
		catch (Exception e) 
		{
			throw new RuntimeException("Error while executing query "+functionDetailsQuery, e);
		} 
		
		finally {
			closeDatabase(dc);
		}
			
		if (Constants.debug)
		{
			System.out.println("## Function return type: ");
			System.out.println(returnType);
		}
		
		return returnType;
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
	public  String[] getColumnNames(String tableName){
		
		String[] columnNames;		
		String schema = getSchema(tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		// use caching
		// (if we have looked up the column names already, they are stored in a hash)
		String cachingKey = schema+tableNameOnly;
		if ( tableNameToColumnNames.containsKey(cachingKey) )
			{
			Util.debug(co, "## Column names from cache");
			return tableNameToColumnNames.get(cachingKey);
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
		
		
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
		tableNameToColumnNames.put(cachingKey, columnNames);
		return columnNames;
	}
	
	
	/********************************************************************
		custom data types
	 ********************************************************************/
	
	// get the name of a custom type, given the name of a column having this type
	public String getUserDefinedTypeName(String tableName, String columnName){
		
		String nameOfCustomType = "";
		String schema = getSchema(tableName);
		
		String query = "SELECT udt_name AS custom_type "+
			"FROM information_schema.COLUMNS "+
			"WHERE table_name  = ? "+
			"AND column_name = ? " +
			"AND table_schema = ? ;";
		
		String[] args = new String[]{tableName, columnName, schema};
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	public String getUserDefinedTypeValues(String tableName, String typeName){
		
		String values = "";
		String schema = getSchema(tableName);
		
		String query = "SELECT string_agg(e.enumlabel, '|') AS enum_labels "+
			"FROM   pg_catalog.pg_type t "+
			"JOIN   pg_catalog.pg_namespace n ON n.oid = t.typnamespace "+
			"JOIN   pg_catalog.pg_enum e ON t.oid = e.enumtypid "+
			"WHERE  t.typname = ? "+ // type name
			"AND n.nspname = ? ;"; // schema name
		
		String[] args = new String[]{typeName, schema};
		
		PostgresDatabaseCommunication dc = connectDatabase();
		
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
	public String[] getCustomtypesAllowedValues(String tableName, String[] columnNames, String[] columnTypes){
		
		String schema = getSchema(tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		String[] customTypes = new String[columnNames.length];
		
		for (int i=0; i<columnNames.length; i++)
		{
			String customTypesOfThisColumn = "";
			String columnName = columnNames[i];
			
			// use caching (speed!)
			String cachingKey = schema+tableNameOnly+columnName;
			
			if (columnTypes[i].equalsIgnoreCase("USER-DEFINED"))
			{
				if (tableAndColumnNameToCustomTypesValues.containsKey(cachingKey))
				{
					customTypesOfThisColumn = tableAndColumnNameToCustomTypesValues.get(cachingKey);
				}
				else
				{
					// get the name of the user-defined type
					String customtypeName = getUserDefinedTypeName(tableName, columnName);
					// get the allowed values defined in this user-defined type
					customTypesOfThisColumn = getUserDefinedTypeValues(tableName, customtypeName);
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
	private  String getSchema(String tableName){
					
		String[] parts = tableName.split("\\.");
		return parts.length>1 ? parts[0] : getSchemaName();
	}

	// get the table name only, depending of table name input
	// if the table name contains a dot, the table name is the last string after a doc
	// if the table name contains no dot, the table name is the whole string
	private  String getTableNameOnly(String tableName){
		
		String[] parts = tableName.split("\\.");
		return parts[parts.length-1];
	}
	
	// if a table name contains both upper and lower case characters, or chars like '-',
	// Postgres gets confused, so the table name needs to be rewritten
	// as schema."tablename"
	private  String getSafeTableName(String tableName, String schema){
		
		if (tableName.toLowerCase().equals(tableName) && !tableName.contains("-"))
			return schema+"."+tableName;
		
		return schema+".\""+tableName+"\"";
	}
	
	// same as above, except schema name is not added in front
	private  String getSafeTableNameOnly(String tableName){
		
		if (tableName.toLowerCase().equals(tableName) && !tableName.contains("-"))
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
			Util.debug(co, "Result list empty");
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
			Util.debug(co, "Result list is empty");
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
	public ArrayList<ConcurrentHashMap<String, String>> getListOfIdToCell( 
			String tableName, String primaryKey, ResultSet rs, String[] requiredColumns ){

		
		ArrayList<ConcurrentHashMap<String, String>> lijst = new ArrayList<ConcurrentHashMap<String, String>>();
		
		if (rs == null) 
		{
			Util.debug(co, "Result list is empty!");
			return new ArrayList<ConcurrentHashMap<String, String>>();
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
		
		
		Util.debug(co, "We've got "+numberOfColumns+" columns in table "+tableName);
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
	    	columnTypes[i] = getTypeOfColumn(tableName, removeQuotesFromSqlReservedWord(columnNames[i]));
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
					ConcurrentHashMap<String, String> record = new ConcurrentHashMap<String, String>();
					
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
					
					// When we return a DT_RowClass, the client adds this as an extra class
					// name to each table row node. This is convenient as this way
					// the table row nodes (TR) get absolutely unique: no only
					// because of their id, but also because of this class name.
					// This allows us to point at row nodes reliably, without the need
					// to state explicitly which table we are talking about, as it's already
					// encapsulated in the node
					record.put("DT_RowClass", tableName+"_row"); 
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
	 * get info about the database, so an administrator could check in which db he is working from the GUI 
	 * (but of course, we will return no password!!!)
	 * @return
	 */
	public String[] getDatabaseInfo(){
		
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( databaseAccessHash.size() == 0 )
			try {
				readPropertiesFile();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				throw new RuntimeException(e);
			}
		
		String db = databaseAccessHash.get("db");
		String host = databaseAccessHash.get("host");
		
		return new String[]{db, host};
				
	}
	
	
	
	/**
	 * opens a Postgres database connection
	 */
	public PostgresDatabaseCommunication connectDatabase() 
	{
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( databaseAccessHash.size() == 0 )
			try {
				readPropertiesFile();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				throw new RuntimeException(e);
			}
		
		String db = databaseAccessHash.get("db");
		String host = databaseAccessHash.get("host");
		String port = databaseAccessHash.get("port");
		String user = databaseAccessHash.get("user");
		String pass = databaseAccessHash.get("pass");
		
		// Special setting for cases in which the database server needs to know
		// which tomcat user is active (e.g. because some database trigger function
		// must behave differently for one user or another).
		String sendTomcatUserInfoToDb = 
			databaseAccessHash.get("send_tomcat_username_to_db");
				
		// compute the right value: default is 'false'.
		boolean bSendTomcatUserInfoToDb = 
			(sendTomcatUserInfoToDb == null) ? false : 
				(sendTomcatUserInfoToDb.toLowerCase().trim().equals("true") ?
						true : false);		
		
		
		// connect to db (we give the tomcat info as arguments, so it might be
		// used if needed)
		PostgresDatabaseCommunication postgresDc = 
			new PostgresDatabaseCommunication(this.co, bSendTomcatUserInfoToDb);
		
		postgresDc.connectTo(host, port, db, user, pass);
		
		return postgresDc;
		
	}
	
	/**
	 * Get schema to address
	 * @throws IOException
	 */
	public String getSchemaName(){
		
		// first check if the database access data are known
		// (that is: location, username, password, etc)
		if ( databaseAccessHash.size() == 0 )
			try {
				readPropertiesFile();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				throw new RuntimeException(e);
			}
			
			return databaseAccessHash.get("schema");
	}
	
	/**
	 * Set a new schema to work in, if needed.
	 * When this methode has been called, next database calls
	 * will address this schema instead of the default one (t.i.
	 * the one which is set in the .database config file)
	 * @param newSchema
	 */
	public void setSchemaName(String newSchema){
		
		databaseAccessHash.put("schema", newSchema);
	}
	
	
	
	public void setActiveTabId(String activeTabId) {
		
		// set the new active tab id in the ContextObject kept in this DatabaseObject
		this.co.setActiveTabId(activeTabId);
		
		PostgresDatabaseCommunication dc = connectDatabase();
		try {
			dc.SendActiveTabIdToDatabaseServer();
		}
		catch (Exception e) {
			throw new RuntimeException("Error while executing query setting the active tab", e);
		} 		
		finally {
			closeDatabase(dc);
		}
		
	}

	
	
	public void readPropertiesFile() throws IOException{
		
		Util.debug(co, "Read database access data from properties file '"+co.getDbName()+".database"+"'...");
		
		String fileName = co.getDbName()+".database";
		
		String filepath = co.getContext().getRealPath(fileName);
		
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
				File.separatorChar + Constants.CONFIG_DIR + File.separator+fileName);
		
		Util.debug(co, "File: "+filepath);
		
		databaseAccessHash = Util.readPropertiesFile(filepath, new ConcurrentHashMap<String, String>());
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
	 * @param tableName
	 * @return
	 */
	public Map<String, Object> getQuickCountOfAllTableRecords(String tableName) {
		
		Util.debug(co, "## Get quick count of all tables records");
		
		String schema = getSchema(tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		boolean exactCount = true;
		Map<String, Object> countAndQuality = new ConcurrentHashMap<String, Object>();
		boolean bForceExactCount = this.getForceExactCount();
		
		// use caching
		// (if we have looked up the count already, it is stored in a hash)
		String cachingKey = schema+tableNameOnly;
		if ( !bForceExactCount && // of course, don't read the cache if exact count is required
				tableNameToCount.containsKey(cachingKey))
			{
			Util.debug(co, "## Count from cache = "+tableNameToCount.get(cachingKey)+" row(s)");
			countAndQuality.put("exactCount", tableNameToExactCount.get(cachingKey));
			countAndQuality.put("count", tableNameToCount.get(cachingKey));
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
		
		ArrayList<String> listOfTrueTables = getTrueTablesList();
		boolean currentTableIsATrueTable = listOfTrueTables.contains(tableNameOnly);
		
		Util.debug(co, "## The current table is a "+(currentTableIsATrueTable?" genuine table":"view")+".");
		
		
		// case [1] 
		// if exact count is required, we must get an true count anyway
		// OR
		// if we have a view, get the true count
		if ( bForceExactCount || !currentTableIsATrueTable )
		{
			count = getTrueCountOfATable(tableNameOnly);
		}
		
		// case [2]
		// if we have a table and exact count is not required, get a fast estimate count
		// OR
		// if count in case [1] failed (timeout), try this fast estimate count method as well
		if ( ( !bForceExactCount && currentTableIsATrueTable) || count<0 )
		{
			exactCount = false;
			count = getEstimateCount("SELECT * FROM "+getSafeTableName(tableNameOnly, schema));
		}
		
		// store the count for caching (speed improvement)
		tableNameToCount.put(cachingKey, count);
		tableNameToExactCount.put(cachingKey, exactCount);
		
		Util.debug(co, "## Counting result was: "+(exactCount?"":"+/- ")+count+" row(s)");
		
		countAndQuality.put("exactCount", tableNameToExactCount.get(cachingKey));
		countAndQuality.put("count", tableNameToCount.get(cachingKey));
		return countAndQuality;
	}
	
	
	/**
	 * Remove the cache of some table
	 * @param tableName
	 */
	public void cleanCache(String tableName) {

		String schema = getSchema(tableName);
		String tableNameOnly = getTableNameOnly(tableName);
		
		String cachingKey = schema+tableNameOnly;
		tableNameToCount.remove(cachingKey);
		tableNameToExactCount.remove(cachingKey);
		tableNameToPrimaryKey.remove(cachingKey);
				
		String[] columns = tableNameToColumnNames.get(cachingKey);
		if (columns != null)
		{
			for (String oneColumn : columns)
			{
				tableAndColumnNameToTypes.remove(cachingKey+oneColumn);
				tableAndColumnNameToCustomTypesValues.remove(cachingKey+oneColumn);
			}
			tableNameToColumnNames.remove(cachingKey);
		}		
		
		
		// this is removing all cached queries of all table, not possible otherwise
		queryToCount = new ConcurrentHashMap<String, Integer>();
		queryToCountQuality = new ConcurrentHashMap<String, Boolean>();
	}

	
}
