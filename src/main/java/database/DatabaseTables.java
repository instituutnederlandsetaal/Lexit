package database;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import resources.Constants;
import resources.ResponseObject;
import tables.TableAndCountObject;
import util.Util;

/*
 * This class is responsible for setting/getting information at TABLE level
 */
public class DatabaseTables {
	
	private final Database db;	
	
	public DatabaseTables(Database db) {
		
		this.db = db;		
	}
	
	
	
	
	/**
	 * Check if a table exists
	 * 
	 * @param tableName
	 * @return true/false
	 */
	public Boolean checkIfTableExists(String tableName){

		String schema = db.getSchemaName();
		
		// this query is Postgres 17 compatible

		String query = "SELECT c.relname AS table_name " +
				"FROM pg_catalog.pg_class c " +
				"FULL JOIN pg_catalog.pg_namespace n "+
				"ON n.oid = c.relnamespace " +
				"WHERE c.relkind IN ('r', 'v', 'm', '') " + // views, materialized view, and tables
				"AND n.nspname NOT IN ('pg_catalog', 'pg_toast') " +
				"AND n.nspname != 'information_schema' " + // exclude information schema
				"AND n.nspname = ? " +	// schema
				"AND c.relname = ? ;";  //tableName

		String[] args = new String[]{schema, tableName};

		
		ArrayList<String[]> result = new ArrayList<String[]>();

		PostgresConnectionManager dc = db.getPostgresConnectionManager();

		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, query, args).getRows();

			result = Util.getResultSetCopyInAList(rs, new String[]{"table_name"});

		} catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+query, args);
			throw new RuntimeException(error, e);
		}
		
		return result.size() > 0;
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
	
		String schema = db.getSchema(tableName);
		
		if (Constants.debug){
			System.out.println();
			System.out.println("Sort (initial):");
			System.out.println(Util.join(aSortCol, ", "));
			System.out.println(Util.join(aSortDir, ", "));
		}
		
		
		// get table content		
		
		// first locate the primary key
		String primaryKey = db.getPrimaryKeyColumn(tableName);
		
		
		// Speaking about sorting, it is always a good idea
		// to use the primary key as a secondary sorting column,
		// because sometimes the primary sorting column chosen
		// by the user contains doubled values, which are sorted randomly
		// (as their value is exactly the same). So to prevent this
		// random sorting, the primary key is added as a secondary sorting
		// column (as very last sorting column).
		
		if (primaryKey != null && 
				Util.getIndexOf(primaryKey, aSortCol)<0) {
			
			if (Constants.debug){
				System.out.println("'"+primaryKey+"' is no part of "+Util.join(aSortCol, ", "));
			}
			
			aSortCol = Util.concatArr(aSortCol, new String[]{primaryKey});	
			aSortDir = Util.concatArr(aSortDir, new String[]{"ASC"});
		}
		
		if (Constants.debug) {
			
			System.out.println();
			System.out.println("Sort (possibly) enriched:");
			System.out.println(Util.join(aSortCol, ", "));
			System.out.println(Util.join(aSortDir, ", "));
		}
		
		// Instantiate the queries  (those will be enriched with filters etc. further on)
		
		// data query
		String dataQuery = "SELECT "+ Util.getCommaSeparatedListOfColumnNamesForaSelect(allColumns)+" FROM "+ Util.getSafeTableName(tableName, schema) + " ";
		// results count query		
		String countQuery = "SELECT COUNT(*) AS count FROM "+ Util.getSafeTableName(tableName, schema) + " ";
				
		// arrays for storing values and types
		ArrayList<String> queryValues = new ArrayList<String>();
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		
		// -----------------------------------------------
		// main search, without column filters
		// -----------------------------------------------
		
		// [ beware: null is also a genuine search value, so it's considered non-empty ]
		if ( (sSearch == null || !sSearch.isEmpty()) && aSearchColumnValues.size()==0){
			
			// main search means search all columns at once
			String[] allTableColumns = db.getColumnNames(tableName);
			ArrayList<String> queryParts = new ArrayList<String>();
			ato = new ArgumentTypesObject();
			
			// build the query condition for each column (!!! the MAIN search will search EACH column of course !!!)
			for (int i=0; i<allTableColumns.length; i++) {
				
				String currentColumnName = allTableColumns[i];
				
				// build current part
				queryValues.add(sSearch);
				
				// check if current column can be searched given a search string
				if ( !Util.valueIsSuitableForColumnType(sSearch, db.getTypeOfColumn(tableName, currentColumnName, sSearch)) ) {
					queryParts.add(
							"CAST("+ Util.getSafeTableNameOnly(tableName) + "." + Util.getSafeFieldName(currentColumnName) + 
							" AS text) " + db.getSuitableOperatorAndArg(tableName, null, sSearch, false)
							);
					ato.setType(queryValues.size()-1, "text");
				}
				else {
					queryParts.add(
							Util.getSafeTableNameOnly(tableName) + "." + Util.getSafeFieldName(currentColumnName) + 
							" " + db.getSuitableOperatorAndArg(tableName, currentColumnName, sSearch, false)
							);
					ato.setType(queryValues.size()-1, db.getTypeOfColumn(tableName, currentColumnName, sSearch));
				}
				
				
			}
			// in a main search, finding in only one column is good enough, so we use 'OR' between columns
			if (queryParts.size()>0) {
				
				dataQuery += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";
				countQuery += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";				
			}
						
			
		}
		
		// -----------------------------------------------
		// main search WITH column filters
		// -----------------------------------------------
		
		// [ beware: null is also a genuine search value, so it's considered non-empty ]
		else if ( (sSearch == null || !sSearch.isEmpty()) && aSearchColumnValues.size()>0) {
			
			// main search means search all table columns at once
			String[] allTableColumns = db.getColumnNames(tableName);
			ArrayList<String> queryParts = new ArrayList<String>();		
			ato = new ArgumentTypesObject();
			
			// I. main search part: search all columns EXCEPT the filtered columns			
			
			for (int i=0; i<allTableColumns.length; i++) {
				
				String currentColumnName = allTableColumns[i];
				
				// we skip the specific filtered columns as our main search address the other columns
				if (aSearchColumnNames.contains(currentColumnName))
					continue;
				
				// build the query condition for each column
				queryValues.add(sSearch);
				
				// check if current column can be searched given a search string
				if ( !Util.valueIsSuitableForColumnType(sSearch, db.getTypeOfColumn(tableName, currentColumnName, sSearch)) ) {
					
					queryParts.add(
							"CAST(" + Util.getSafeTableNameOnly(tableName) + "." + Util.getSafeFieldName(currentColumnName) + 
							" AS text) "+ db.getSuitableOperatorAndArg(tableName, null, sSearch, false)
							);
					ato.setType(queryValues.size()-1, "text");
				}
				else {
					queryParts.add(
							Util.getSafeTableNameOnly(tableName) + "." + Util.getSafeFieldName(currentColumnName) + 
							" " + db.getSuitableOperatorAndArg(tableName, currentColumnName, sSearch, false) 
							);
					ato.setType(queryValues.size()-1, db.getTypeOfColumn(tableName, currentColumnName, sSearch));
				}		
								
			}			
			
			// in a main search, finding in only one column is good enough, so we use 'OR' between columns
			if (queryParts.size()>0) {
				
				dataQuery += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";
				countQuery += "WHERE ("+ Util.join(queryParts, " OR ") + ") ";				
			}
						
			
			// II. filtered column search part
			
			// build the query condition for each column
			queryParts = new ArrayList<String>();		
			for (int i=0; i<aSearchColumnNames.size(); i++) {
				
				String currentColumnName = aSearchColumnNames.get(i);
				String currentSearchValue = aSearchColumnValues.get(i);
				
				// special case: 0/1 in a boolean must be translated to true/false
				if (db.getTypeOfColumn(tableName, currentColumnName, null).equals("boolean") && 
						(currentSearchValue.equals("0") || currentSearchValue.equals("1")) ){
					currentSearchValue = currentSearchValue.replace("0", "false").replace("1", "true");
					aSearchColumnValues.set(i, currentSearchValue);
				}
				
				boolean caseSensitiveColumn = aCaseSensitiveColumnSearch.get(i);
				
				// build current part
				queryValues.add(currentSearchValue);
				
				// check if current column can be searched given a search string
				if ( !Util.valueIsSuitableForColumnType(currentSearchValue, db.getTypeOfColumn(tableName, currentColumnName, currentSearchValue)) ) {
					queryParts.add(
							"CAST("+ Util.getSafeTableNameOnly(tableName) + "." + Util.getSafeFieldName(currentColumnName) + 
							" AS text) "+ db.getSuitableOperatorAndArg(tableName, null, currentSearchValue, caseSensitiveColumn)
							);
					ato.setType(queryValues.size()-1, "text");
				}
				else {
					queryParts.add(
							Util.getSafeTableNameOnly(tableName) + "." + Util.getSafeFieldName(currentColumnName) + 
							" " + db.getSuitableOperatorAndArg(tableName, currentColumnName, currentSearchValue, caseSensitiveColumn)  
							);
					ato.setType(queryValues.size()-1, db.getTypeOfColumn(tableName, currentColumnName, currentSearchValue));
				}
								
			}
			
			// the column filters are compulsory so we use 'AND'
			if (queryParts.size()>0) {
				
				dataQuery += "AND ("+ Util.join(queryParts, " AND ") + ") ";
				countQuery += "AND ("+ Util.join(queryParts, " AND ") + ") ";				
			}			
			
		}
		
		// -----------------------------------------------
		// per-column search (no main search)
		// -----------------------------------------------
		
		// [ beware: null is also a genuine search value, so it's considered non-empty ]
		else if ( (sSearch!=null && sSearch.isEmpty()) && aSearchColumnValues.size()>0) {
			
			ArrayList<String> queryParts = new ArrayList<String>();
			ato = new ArgumentTypesObject();
			
			// build the query condition for each column
			for (int i=0; i<aSearchColumnNames.size(); i++) {
				
				String currentColumnName = aSearchColumnNames.get(i);
				String currentSearchValue = aSearchColumnValues.get(i);
				
				// special case: 0/1 in a boolean must be translated to true/false
				if (db.getTypeOfColumn(tableName, currentColumnName, null).equals("boolean") && 
						(currentSearchValue.equals("0") || currentSearchValue.equals("1")) ){
					currentSearchValue = currentSearchValue.replace("0", "false").replace("1", "true");
					aSearchColumnValues.set(i, currentSearchValue);
				}
				
				// build current part
				queryValues.add(currentSearchValue);
				
				boolean caseSensitiveColumn = aCaseSensitiveColumnSearch.get(i);
				
				// check if current column can be searched given a search string
				if ( !Util.valueIsSuitableForColumnType(currentSearchValue, db.getTypeOfColumn(tableName, currentColumnName, currentSearchValue)) ) {
					queryParts.add(
							"CAST("+ Util.getSafeTableNameOnly(tableName) + "." + Util.getSafeFieldName(currentColumnName) + 
							" AS text) " + db.getSuitableOperatorAndArg(tableName, null, currentSearchValue, caseSensitiveColumn)
							);
					ato.setType(queryValues.size()-1, "text");
				}
				else {
					queryParts.add(
							Util.getSafeTableNameOnly(tableName) + "." + Util.getSafeFieldName(currentColumnName) + 
							" " + db.getSuitableOperatorAndArg(tableName, currentColumnName, currentSearchValue, caseSensitiveColumn) 
							);
					ato.setType(queryValues.size()-1, db.getTypeOfColumn(tableName, currentColumnName, currentSearchValue));
				}
				
			}
			// the column filters are compulsory so we use 'AND'
			if (queryParts.size()>0) {
				
				dataQuery += "WHERE ("+ Util.join(queryParts, " AND ") + ") ";
				countQuery += "WHERE ("+ Util.join(queryParts, " AND ") + ") ";				
			}
			
			
		}	
		
		// query without order nor limit
		// this query version might be needed if we want to try a tweak count
		String queryWithoutOrderNorLimit = dataQuery;
		
		
		// sorting
		if ( weMustSort ) {
			String sortPart = " ORDER BY ";
			String sortSeparator = "";
			
			
			for (int s = 0; s < aSortCol.length; s++) {
				
				// Read sort settings for this column
				String thisColSort = String.valueOf(aSortCol[s]);
				String thisSortDir = String.valueOf(aSortDir[s]);
				
				// compute right collation clause to be used, if declared in .database file
				String collationClause = db.getCollationClause(tableName, thisColSort);
				
				// Should we apply reverse sorting?
				boolean reverseSort = thisSortDir.toLowerCase().contains("_reverse");
				thisSortDir = thisSortDir.replaceAll("(_reverse|_REVERSE)", "");
				
				// Do we have custom sort?
				// (this is to be detected by the presence of a '_lexit_custom_sort' column)
				String thisColCustomSort = thisColSort+"_lexit_custom_sort";
				String thisColCustomReverseSort = thisColSort+"_lexit_custom_reversesort";
				boolean customSortDefined = (Util.getIndexOf(thisColCustomSort, allColumns)>-1 || Util.getIndexOf(Util.getSafeFieldName(thisColCustomSort), allColumns)>-1);				
				boolean customReverseSortDefined = (Util.getIndexOf(thisColCustomReverseSort, allColumns)>-1 || Util.getIndexOf(Util.getSafeFieldName(thisColCustomReverseSort), allColumns)>-1);
				
				// Reverse sorting if required
				if (reverseSort) {
					
					// if custom reverse sort is defined, apply it
					if (customReverseSortDefined) {
						sortPart += sortSeparator + Util.getSafeFieldName(thisColCustomReverseSort) + " " + collationClause + " " + thisSortDir;
					}
					// otherwise do reverse sort the default way
					else {
						sortPart += sortSeparator + "REVERSE("+ Util.getSafeFieldName(thisColSort) + ") " + collationClause + " " + thisSortDir;
					}
					
				}
				// No reverse sorting
				else {
					
					// if custom sort is defined, apply it
					if (customSortDefined) {
						sortPart += sortSeparator + Util.getSafeFieldName(thisColCustomSort) + " " + collationClause + " " + thisSortDir;
					}
					// otherwise do sort the default way
					else {
						sortPart += sortSeparator + Util.getSafeFieldName(thisColSort) + " " + collationClause + " " + thisSortDir;
					}
				}
				sortSeparator = ", ";
			}
			dataQuery += sortPart;
		}
				
		
		// range
		if (iDisplayLength>-1)
			dataQuery += " LIMIT " + iDisplayLength +" OFFSET " + iDisplayStart;
		
		
		
		// ******************************************
		//
		// queries are built, now get to the database
		//
		// ******************************************
		
		
		
		TableAndCountObject tableAndCount = new TableAndCountObject();
		
		// remove operators that were put in from (like '<33'  or '!woord') 
		for (int i=0; i<queryValues.size(); i++) {
			queryValues.set(i, Util.removeFrontOperator(queryValues.get(i)) );
		}
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			// get the table content 
			String[] args = queryValues.toArray(new String[queryValues.size()]);
			
			ResultSetSnapshot rs1 = queryValues.size()==0 ?
					dc.sendQuery(schema, dataQuery, 0) : dc.sendPreparedQuery(schema, dataQuery, args, ato, 0);
			
			ArrayList<ConcurrentHashMap<String, String>> cellList = getListOfIdToCell(tableName, primaryKey, rs1, allColumns );
			
			tableAndCount.setContent(cellList);
			
						
			
			// get the table count
			// if we have no filters, we take the complete count
			// otherwise we have to recount taking the filters into account
			int count = countOfWholeTable;
			boolean exactCount = db.getTrueTablesList().contains(tableName);
			
			// does the user requires an exact count just now?
			boolean bExactCountRequiredByUser = db.getForceExactCount();
			
			// the key of the partial count is made up of prepared query string and its values (gives unique string)
			String queryForCache = countQuery + " ("+ Util.join(args, ",") + ")";
			
			
			// [ beware: null is also a genuine search value, so it's considered non-empty ]
			if ( ( sSearch == null || !sSearch.isEmpty() ) || aSearchColumnValues.size()>0 ) {
				
				// get time at which counting starts
				long timeBeforeCount = new Date().getTime();
				int queryCost = 0;
				boolean recomputeMaxAllowedCost = false;
				
				// if the result of this query was cached
				// read it from the cache (except if exact count is required by user just now)
				
				if (!bExactCountRequiredByUser && 
						db.getCache().getQueryToCount().containsKey(queryForCache)) {
					
					Util.debug(db.getContextObject(), "Query "+queryForCache+" found in cache");
					count = db.getCache().getQueryToCount().get(queryForCache);
					exactCount = db.getCache().getQueryToCountQuality().get(queryForCache);
				}
				
				// try counting the normal way (exact count, slower than estimate)
				else  {
					queryCost = db.getQueryCost( Util.replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
					
					Util.debug(db.getContextObject(), "%%% FAST COUNT decision: "+queryCost+ "<"+db.maxAllowedCost +"?");					
					
					// count the normal way, t.i. count(*)
					// if it is required by the user just now OR if querycost is low
					if (bExactCountRequiredByUser || queryCost < db.maxAllowedCost) {
						Util.debug(db.getContextObject(), "%%% We will count the normal way (exact count required by user: "+bExactCountRequiredByUser+")");
						
						
						List<Map<String, Object>> rs2;						
						try {
							
							// Important here: we might have to set a timeout, to make sure 
							// that the normal count will never takes too long.
							// BUT if the user absolutely required an exact count, he/she will have to put up with it...
							
							rs2 = dc.sendPreparedQuery(schema, countQuery, args, ato, (bExactCountRequiredByUser ? 0 : db.maxAllowedDuration) ).getRows();							
							
							// old:
							//ArrayList<ArrayList<String>> countResult = Util.getResultSetCopyInArrayList(rs2, new String[]{"count"});							
							//count = Integer.parseInt(countResult.get(0).get(0));
							// NB: for some unknown reason, we were using Util.getResultSetCopyInArrayList here (and only here)
							//     while the elsewhere frequently used Util.getResultSetCopyInAList function could do the job too.
							//     That means that Util.getResultSetCopyInArrayList will be considered deprecated from now on.
							
							// new:
							ArrayList<String[]> countResult = Util.getResultSetCopyInAList(rs2, new String[]{"count"});
							count = Integer.parseInt(countResult.get(0)[0]);
							
							exactCount = true;
							recomputeMaxAllowedCost = true;
						}
						// if the normal count takes too long, do an estimate count
						catch (Exception e) {
							
							if (Constants.debug) {
								System.out.println("%%% NORMAL COUNT TIME OUT !!");
								System.out.println("%%% We will use an estimate count");								
							}
							// if the normal count timed out, we can't recompute the max allowed
							// cost in a reliable way, because the duration won't relate to the
							// query cost computed by the database. So, we have to cancel recomputation.
							recomputeMaxAllowedCost = false;
							
							count = db.getEstimateCount( Util.replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
							exactCount = false;
						}
						
					}
					
					// if counting the normal way is PREDICTED to be too slow
					// (and exact count wasn't required by the user just now)
					// get an estimate count
					else {
						Util.debug(db.getContextObject(), "%%% We will use an estimate count");
						count = db.getEstimateCount( Util.replaceQuestionMarksByArgsInQuery(queryWithoutOrderNorLimit, args));
						exactCount = false;
					}											
				}				
				
				// get time at which counting finished
				long timeAfterCount = new Date().getTime();
				
				// recompute the maximal allowed cost (to keep in tune with actual system)
				if (recomputeMaxAllowedCost) {
					
					db.recomputeMaxAllowedCost(queryCost, timeBeforeCount, timeAfterCount);
					Util.debug(db.getContextObject(), "$$$ RECOMPUTED maxAllowedCost = " + db.maxAllowedCost);
				}				
				Util.debug(db.getContextObject(), "Counting took "+(timeAfterCount - timeBeforeCount)+" ms");
											
			}
			else {
				Util.debug(db.getContextObject(), "## Query count is the same as total count");			
			}
			
			
			// final correction:
			// if the content to return contains less records than the display length,
			// we should return this content size instead (which is then always accurate)
			// Beware: this is not true when we are not at page one, which implies that we have
			//         more records than the ones shown. At the last page, the number of shown
			//         records will probably be less than the iDisplayLength too, even if there
			//         are actually millions of records!
			if (tableAndCount.getContent().size() < iDisplayLength
					&& iDisplayStart==0) {
				
				count = tableAndCount.getContent().size();
				exactCount = true;
			}				
			
			
			// set the table content and count now
			tableAndCount.setCount(count);
			tableAndCount.setCountIsExact(exactCount);
			
			// cache count of query for partial count
			db.getCache().setQueryToCount(queryForCache, count);
			db.getCache().setQueryToCountQuality(queryForCache, exactCount);
			
		}
		catch (Exception e) {
					
			// we need to send back a result, even an empty one,
			// otherwise the client will get stuck, so we won't throw an exception here!
			
			// show error in console
			if (Constants.debug) e.printStackTrace();			
			Util.debug(db.getContextObject(), "## ERROR: "+"Error while executing query "+dataQuery);
		}
		
		
		// We might have been counting with exact count now (if the user required to) 
		// but now we are done with counting, so set bForceExactCount back to 
		// its default value (=false, exact count not required)
		db.setForceExactCount(false);
		
		long timeAtVeryEnd = new Date().getTime();
		
		// if the query execution took more time than allowed,
		// register if there is an index for the columns now sorted by, as this might be the cause
		
		// NB: this function can't be called earlier, as the aSortCol automatically gets the primary key
		// added as secundary sort column half way the process.
		boolean indexAvailableForSortCol = db.checkIfIndexExists(tableName, aSortCol);
		
		if ((timeAtVeryEnd - timeAtVeryStart) > db.maxAllowedDuration 
				&& !indexAvailableForSortCol)
			tableAndCount.setNeededIndexForSortingColumns(Util.join(aSortCol, ", "));
		
		
		return tableAndCount;
	}
	
	
	
	// Get a result set into an ArrayList, each record is a row
	// a row is a hash mapping a column name to some content
	// This is called 'getListOfIdToCell' because we add a row id required by Datatables
	// to each row (t.i. DT_RowId).
	public ArrayList<ConcurrentHashMap<String, String>> getListOfIdToCell( 
			String tableName, String primaryKey, ResultSetSnapshot snapshot, String[] requiredColumns ){

		
		ArrayList<ConcurrentHashMap<String, String>> output = new ArrayList<ConcurrentHashMap<String, String>>();
		
		if (snapshot.getRows() == null) {
			Util.debug(db.getContextObject(), "Result list is empty!");
			return new ArrayList<ConcurrentHashMap<String, String>>();
		}
		
		
		// get the number of columns in the result set
		
		int numberOfColumns = snapshot.getColumnNames().size();
				
		
		// if a list of required columns was given, we will stick to it
		// otherwise, we take the column names from the resultset
		
		
		Util.debug(db.getContextObject(), "We've got "+numberOfColumns+" columns in table "+tableName);
	    String[] columnNames;
	    if (requiredColumns.length==0) {
	    	columnNames = snapshot.getColumnNames().toArray(new String[0]);
	    }
	    else {
	    	columnNames = requiredColumns;
	    }
	    
	    
	    
	    // get list of column types
	    String[] columnTypes = new String[numberOfColumns];
	    if (Constants.debug) {
	    	System.out.println("Requesting list of column types for:");
	    	System.out.println(columnNames.length+" => "+Util.join(columnNames, ", "));
	    }
	    for (int i = 0; i < columnNames.length; i++) {
	    	columnTypes[i] = db.getTypeOfColumn(tableName, Util.removeQuotesFromSqlReservedWord(columnNames[i]), null);
	    }	    
	 
	    if (Constants.debug) {	    	
		    for (int i = 0; i < columnNames.length; i++) {
		    	System.out.println(columnNames[i]+" -> '"+columnTypes[i]+"'");
		    }
	    }
	    

	    // process table content into return variable 
	    
		for (Map<String, Object> row : snapshot.getRows()) {
			
			ConcurrentHashMap<String, String> record = new ConcurrentHashMap<String, String>();
			
			// process each column of a record					
			
			for (int i=0; i<columnNames.length; i++) {
				String columnName = Util.removeQuotesFromSqlReservedWord(columnNames[i]);				
				Object fieldvalue = row.get(columnName);				
				String value = ( fieldvalue != null ? fieldvalue.toString() : "" );
				
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
			output.add(record);	
		}
		
		return output;
	}
	
	
	
	/**
	 * Get the column name of the primary key
	 * 
	 * @param table
	 * @return primary key OR null
	 */
	public  String getPrimaryKeyColumn(String tableName){
		
		String schema = db.getSchema(tableName);
		String tableNameOnly = Util.getTableNameOnly(tableName);
				
		// use caching
		// (if we have already looked up the primary key, it is stored in a hash)
		
		if ( db.getCache().getTableNameToPrimaryKey().containsKey(schema+tableNameOnly) ) {
			Util.debug(db.getContextObject(), "## PK from cache: "+ db.getCache().getTableNameToPrimaryKey().get(schema+tableNameOnly));
			return db.getCache().getTableNameToPrimaryKey().get(schema+tableNameOnly);
		}
		
		
		// no cache, first lookup
		
		String primaryKeyColumn = null;			
		
		// this query is Postgres 17 compatible
		
		String getPK = "SELECT "+ 
			"    kcu.column_name, "+
			"    c.data_type, "+
			"    c.character_maximum_length, "+
			"    c.numeric_precision, "+
			"    c.numeric_scale "+
			"FROM "+
			"    information_schema.table_constraints tc "+
			"JOIN "+
			"    information_schema.key_column_usage kcu "+
			"    ON tc.constraint_name = kcu.constraint_name "+
			"    AND tc.table_schema = kcu.table_schema "+
			"JOIN "+
			"    information_schema.columns c "+
			"    ON c.table_schema = kcu.table_schema "+
			"    AND c.table_name = kcu.table_name "+
			"    AND c.column_name = kcu.column_name "+
			"WHERE "+
			"    tc.constraint_type = 'PRIMARY KEY' "+
			"    AND tc.table_schema = ? "+
			"    AND tc.table_name = ? "+
			"ORDER BY "+
			"    kcu.ordinal_position; ";		
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		String[] args = new String[]{ schema, tableNameOnly };
		
		try {
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, getPK, args).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"column_name", "data_type"});
			
			
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
				ArrayList<String> listOfTrueTables = db.getTrueTablesList();
				boolean currentTableIsaView = !(listOfTrueTables.contains(tableNameOnly));
				
				// we expect a view to have a given column which always 
				// functions as a primary key 
				if (currentTableIsaView) {
					
					// what are the available columns?
					String[] availableColumns = db.getColumnNames(tableName);
					
					// does the view have the needed primary key column
					if (Util.getIndexOf(Constants.PRIMARYKEY_FIELDNAME, availableColumns)>-1)
						primaryKeyColumn = Constants.PRIMARYKEY_FIELDNAME;
					
					// otherwise primaryKeyColumn keeps the initialisation value
				}
			}
			
			// if we do have a result, we have a primary key 
			else {
				primaryKeyColumn = res.get(0)[0].trim();
			}
			
		} 
		catch (Exception e) {			
			String error = Util.getDebugInfoForConsole("Error while executing query "+getPK, args);
			throw new RuntimeException(error, e);
		} 
				
		
		// store the primary key in a hash, for caching (for speed improvement)
		if (primaryKeyColumn != null)
			db.getCache().setTableNameToPrimaryKey(schema+tableNameOnly, primaryKeyColumn);
		
		Util.debug(db.getContextObject(), "PK of "+tableNameOnly+" is "+primaryKeyColumn);
		
		return primaryKeyColumn;
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
		
		Util.debug(db.getContextObject(), "## Get count estimate (fast)");
		
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
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();	
		
		try {
			Util.debug(db.getContextObject(), "## Get count estimate (fast)");
			
			dc.sendUpdate("public", query1);
			List<Map<String, Object>> rs = dc.sendQuery("public", query2, 0).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"rows"});		
			count = Integer.parseInt(res.get(0)[0]);
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+query1+" or "+query2, new String[] {});
			throw new RuntimeException(error, e);
		}
		
		return count;		
	}
	
	
	/**
	 * get the true exact count of a table
	 * @param tableName
	 * @param columnNames
	 * @param values
	 * @param dro
	 */
	public Integer getTrueCountOfATable(String tableName){
		
		String schema = db.getSchema(tableName);			
		int count = -1;
		ArrayList<String[]> res;
		
		String getCountQuery = 
			"SELECT COUNT(*) AS rowcount " +
			"FROM " + Util.getSafeTableName(tableName, schema) + ";";	
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			boolean bForceExactCount = db.getForceExactCount();
			
			// Get the count, but set a time limit...
			// Except if we absolutely required an exact count (can be slow, but the user required it so...)
			ResultSetSnapshot rss = dc.sendQuery(schema, getCountQuery, (bForceExactCount ? 0 : db.maxAllowedDuration));
			
			// if the query took too long, rss will be null
			// so the function must return -1, telling the caller function
			// that this function has failed to get an exact count,
			// so it will try to get an estimate instead
			
			if (rss != null) {
				List<Map<String, Object>> rs = rss.getRows();
				
				res = Util.getResultSetCopyInAList(rs, new String[]{"rowcount"});
				// if the time limit was exceeded, we have a null resultset 
				if (res.size()>0 && res.get(0).length>0)
					count = Integer.parseInt(res.get(0)[0]);
			}
			
		} 
		catch (Exception e) {
			// do nothing, just return the default count value
		}		
		
		return count;
		
	}
	
	
	
	/**
	 * Get a fast estimate of the number of ALL rows of a table or view
	 * @param tableName
	 * @return
	 */
	public Map<String, Object> getQuickCountOfAllRows(String tableName) {
		
		Util.debug(db.getContextObject(), "## Get quick count of all tables records");
		
		String schema = db.getSchema(tableName);
		String tableNameOnly = Util.getTableNameOnly(tableName);
		boolean exactCount = true;
		Map<String, Object> countAndQuality = new ConcurrentHashMap<String, Object>();
		boolean bForceExactCount = db.getForceExactCount();
		
		// use caching
		// (if we have looked up the count already, it is stored in a hash)
		String cachingKey = schema+tableNameOnly;
		if ( !bForceExactCount && // of course, don't read the cache if exact count is required
				db.getCache().getTableNameToCount().containsKey(cachingKey))
			{
			Util.debug(db.getContextObject(), "## Count from cache = "+ db.getCache().getTableNameToCount().get(cachingKey)+" row(s)");
			countAndQuality.put("exactCount", db.getCache().getTableNameToExactCount().get(cachingKey));
			countAndQuality.put("count", db.getCache().getTableNameToCount().get(cachingKey));
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
		
		ArrayList<String> listOfTrueTables = db.getTrueTablesList();
		boolean currentTableIsATrueTable = listOfTrueTables.contains(tableNameOnly);
		
		Util.debug(db.getContextObject(), "## The current table is a "+(currentTableIsATrueTable?" genuine table":"view")+".");
		
		
		// case [1] 
		// if exact count is required, we must get an true count anyway
		// OR
		// if we have a view, force the true count
		if ( currentTableIsATrueTable && bForceExactCount || !currentTableIsATrueTable ) {
			count = db.getTrueCountOfATable(tableNameOnly);
		}
		
		
		// case [2]
		// if we have a table and exact count is not required, get a fast estimate count
		// OR
		// if count in case [1] failed (timeout), try this fast estimate count method as well
		if ( ( !bForceExactCount && currentTableIsATrueTable) || count<0 ) {
			exactCount = false;
			count = db.getEstimateCount("SELECT * FROM "+ Util.getSafeTableName(tableNameOnly, schema));
		}
		
		// store the count for caching (speed improvement)
		db.getCache().setTableNameToCount(cachingKey, count);
		db.getCache().setTableNameToExactCount(cachingKey, exactCount);
		
		Util.debug(db.getContextObject(), "## Counting result was: "+(exactCount?"":"+/- ")+count+" row(s)");
		
		countAndQuality.put("exactCount", db.getCache().getTableNameToExactCount().get(cachingKey));
		countAndQuality.put("count", db.getCache().getTableNameToCount().get(cachingKey));
		return countAndQuality;
	}
	
	
	
	/**
	 * Refresh a materialized view, given its name.
	 * @param viewName
	 */
	public void refreshMaterializedView(String viewName) {
        
        String schema = db.getSchema(viewName);
        String viewNameOnly = Util.getTableNameOnly(viewName);
        
        String query = "REFRESH MATERIALIZED VIEW "+ Util.getSafeTableName(viewNameOnly, schema)+";";
        
        PostgresConnectionManager dc = db.getPostgresConnectionManager();
        
        try {
            dc.sendUpdate(schema, query);
        } 
        catch (Exception e) {
            String error = Util.getDebugInfoForConsole("Error while executing query "+query, new String[] {});
            throw new RuntimeException(error, e);
        }
        
        // after refreshing a materialized view, we need to clean the cache of this view
        cleanCache(viewName);        
    }
	
	
	
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
		
		// remove suspicious sql
		newComment = Util.removeSuspiciousSql( new String[]{newComment} )[0];
		
		String schema = db.getSchema(tableName);
		
			
		
		// single quote escape is quote doubling 
		newComment = newComment.replace("'", "''");
		// backslash escape is backslash doubling 
		newComment = newComment.replace("\\", "\\\\");
		
		String setComment = 
			"COMMENT ON " + tableType + " " + 
					Util.getSafeTableName(tableName, schema) + " " +
			" IS E'" + newComment + "';";
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			dc.sendUpdate(schema, setComment);
		}
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+setComment, new String[] {});			
			dro.setResponse(error);
			throw new RuntimeException(error, e);
		}
		
	}
	
	
	/**
	 * Get the comment on a table
	 * 
	 * @param tableName
	 * @return
	 */
	public String getComment(String tableName){
		
		String sTableComment = "";
		String schema = db.getSchema(tableName);				
		
		ArrayList<String[]> res;
		
		// set arguments
		String[] args = new String[]{schema, tableName};	
		
		// This query is Postgres 17 compatible
		
		String getIdQuery = 
			"SELECT n.nspname AS \"schema\", "+
			"c.relname AS \"table\", "+
			"obj_description(c.oid, 'pg_class') AS \"comment\" "+
			"FROM pg_catalog.pg_class c "+
			"FULL JOIN pg_catalog.pg_index i ON i.indexrelid = c.oid "+
			"FULL JOIN pg_catalog.pg_class c2 ON i.indrelid = c2.oid "+
			"FULL JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace "+
			"WHERE c.relkind IN ('r', 'v', 'm') "+
			"AND n.nspname NOT IN ('pg_catalog', 'pg_toast') "+
			"AND n.nspname != 'information_schema' "+
			"AND n.nspname = ? " + // schema
			"AND c.relname = ? " + // table
			"ORDER BY 1,2;";	
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, getIdQuery, args).getRows();
			
			res = Util.getResultSetCopyInAList(rs, new String[]{"comment"});
			if (res.size()>0) {
				sTableComment = res.get(0)[0];				
			}
			
		} catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+getIdQuery, args);
			throw new RuntimeException(error, e);
		}
		
		return sTableComment;	
	}
	
	
	
	
	/**
	 * Remove the cache of some table
	 * @param tableName
	 */
	public void cleanCache(String tableName) {

		String schema = db.getSchema(tableName);
		String tableNameOnly = Util.getTableNameOnly(tableName);
		
		String cachingKey = schema+tableNameOnly;
		db.getCache().removeFromTableNameToCount(cachingKey);
		db.getCache().removeFromTableNameToExactCount(cachingKey);
		db.getCache().removeFromTableNameToPrimaryKey(cachingKey);
				
		String[] columns = db.getCache().getTableNameToColumnNames().get(cachingKey);
		if (columns != null) {
			for (String oneColumn : columns) {
				
				db.getCache().removeFromTableAndColumnNameToType(cachingKey+oneColumn);
				db.getCache().removeFromTableAndColumnNameToCustomTypesValues(cachingKey+oneColumn);
			}
			db.getCache().removeFromTableNameToColumnNames(cachingKey);
		}		
		
		
		// this is removing all cached queries of all table, not possible otherwise
		db.getCache().clearQueryToCount();
		db.getCache().clearQueryToCountQuality();
	}

}
