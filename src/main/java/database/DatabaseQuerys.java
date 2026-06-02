package database;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import resources.Constants;
import util.Util;

/*
 * This class is responsible for setting/getting information at QUERY level
 */
public class DatabaseQuerys {
		
	private final Database db;	
	
	public DatabaseQuerys(Database db) {
		
		this.db = db;		
	}
	
	
	// number of times we recomputed the maximal allowed cost, to compute an average value for it
	int numberOfCostRecomputations = 1;
	
	
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
		
		// compute what the max allowed cost would be given the current
		// relation between cost and execution time
		int currentMaxAllowedCost = 
			(int) (db.maxAllowedDuration * ((float)queryCost / (timeAfterCount - timeBeforeCount) ));
		
		// if maxAllowedCost was not initialized yet, do it now
		if ( db.maxAllowedCost < 0) {
			numberOfCostRecomputations = 1;
			db.maxAllowedCost = currentMaxAllowedCost;			
		}
		// if we already have a maxAllowedCost, recompute it now
		else {
			// include this calculation in the average max allowed cost
			int estimatedTotalOfAllPreviousComputations = numberOfCostRecomputations * db.maxAllowedCost;
			
			numberOfCostRecomputations++;		
			int newTotalOfAllComputations = estimatedTotalOfAllPreviousComputations + currentMaxAllowedCost;
			
			// new average
			db.maxAllowedCost = newTotalOfAllComputations / numberOfCostRecomputations; 
		}		
		
		Util.debug(db.getContextObject(), ">>>>>> NEW maxAllowedCost = "+db.maxAllowedCost);
		
	}
	
	
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
		
		int queryCost = -1;
		
		// random id for a temporary table, to make sure we won't try to create an already existing table
		int tableId = Math.abs(new Random().nextInt());
		
		Util.debug(db.getContextObject(), "## Get query cost");
		
		
		// special case:
		// if some argument requires strict equality, modify the query accordingly
		// change  [~*/~ 'exact:...']   into  [= '...']
		//                                  1    2       3     4   5     6
		countQuery = countQuery.replaceAll("(!|)(~\\*|~)(\\s+)(E)([\"'])(exact:)", "$1= $5");
		
		// NOTE countQuery was pre-processed before, t.i. question marks were replaced by actual values!
		
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
	
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {		
			
			dc.sendUpdate("public", query1);
			List<Map<String, Object>> rs = dc.sendQuery("public", query2, 0).getRows();
			
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"cost"});		
			queryCost = Integer.parseInt(res.get(0)[0]);
			
		} 
		catch (Exception e) {
			if (Constants.debug)
				System.out.println("Error while executing query "+query1+" or "+query2);
			
			// for the moment, we mustn't throw exception, to make sure this function always
			// give some results otherwise the client won't have any count!!!
			//throw new RuntimeException("Error while executing query "+query1+" or "+query2, e);
		}
		
		Util.debug(db.getContextObject(), "queryCost = "+queryCost);
		return queryCost;		
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
	 * Determine which operator suits a value, given its type
	 * and return it.
	 * @param value
	 * @return an operator as a string
	 */
	public String getSuitableOperatorAndArg(String tableName, String columnName, String columnValue, boolean caseSensitive){
		
		// collation clause, if needed
		String collationClause = db.getCollationClause(tableName, columnName);
		
		// argument
		String arg = (collationClause.isEmpty() ? " ? " : " ( ? " +collationClause+ " ) ");
		
		// get column type
		String columnType = (columnName==null ? 
					"text" : db.getTypeOfColumn(tableName, columnName, null));
			
		// now the column value...
		//
		// IMPORTANT: FIRST DEAL WITH NULL!
		//
		// always check null value first (to prevent NullPointerException)
		if (columnValue == null || columnValue.toLowerCase().equals("null") )
			return " IS " + arg;		
		if (columnValue.toLowerCase().equals("!null"))
			return " IS NOT " + arg;
		
		
		
		// negation operator
		//
		boolean negation = false;
		if (columnValue.startsWith("!"))
			negation = true;
		
		
		
		// special cases
		//--------------
		
		// input value with curled brackets triggers search in an array of values
		// (for any other case, the value is set given the column type!)
		//
		if ( columnValue.matches("!?\\{.*") && columnValue.endsWith("}") 
				&& 
			(!columnType.endsWith("[]") && !columnType.equals("jsonb")) ) {
			
			return (negation ? "!= ALL (?) " : "= ANY (?) ");			
		}
		
		// input is a range 
		// (chosen notation is range[A,B], because only [A,B] is a regular expression) 
		if ( columnValue.startsWith("range[") && columnValue.endsWith("]") ) {
			
			columnValue = Util.removeFrontOperator(columnValue);
			
			if ( columnType.equals("date")) {
				return "<@ " + arg + "::daterange";	
			}
			if ( columnType.equals("timestamp without time zone") ) {
				return "<@ " + arg + "::tsrange ";	
			}
			if ( columnType.equals("timestamp with time zone") ) {
				return "<@ " + arg + "::tstzrange  ";	
			}
			if (Util.isBigWholeNumberType(columnType)) {
				return "<@ " + arg + "::int8range";
		   }
		   if (Util.isWholeNumberType(columnType)) {
			   return "<@ " + arg + "::int4range";
		   }
		   if (Util.isRealNumberType(columnType)) {
			   return "<@ " + arg + "::numrange";
		   }
			
		}
		
		
		
		// normal business
		// ---------------
		
		// unaccent
		if (columnValue.contains("unaccent(")) {
			arg = " unaccent( ? "+collationClause+") ";
		}
		
		
		
		// array type
		// (beware: the negation operator is deceiving here, as it is an exact inequality, so it's not a containment negation)
		if (columnType.endsWith("[]"))
			return (negation ? "<>" : "@>") + " " + arg;
		
		// json type
		// (beware: the negation operator is deceiving here, as it is an exact inequality, so it's not a containment negation)
		if (columnType.equals("jsonb")) {
			return (negation ? "<>" : "@>") + " " + arg + "::jsonb";
		}
		
		// tsvector
		if (columnType.equals("tsvector"))
			return "@@ " + (negation ? "!!":"") + arg + "::tsquery ";
		
		// date
		if ((columnType.equals("date") || columnType.startsWith("timestamp") ) && !(columnValue.startsWith("<")||columnValue.startsWith(">")) )
			return " = " + arg;
		
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

}
