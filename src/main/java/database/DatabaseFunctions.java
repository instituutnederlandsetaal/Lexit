package database;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import resources.Constants;
import tables.TableRecordObject;
import util.Util;

/*
 * This class is responsible for setting/getting DB FUNCTIONS
 */
public class DatabaseFunctions {
	
	private final Database db;	
	
	public DatabaseFunctions(Database db) {
		
		this.db = db;		
	}
	
	
	
	/**
	 * Call a database function, given its name and a list of arguments
	 * @param functionName
	 * @param args
	 * @return
	 */
	public TableRecordObject callFunction(String functionName, String[] args){
		
		// prevent sql injection
		args = Util.removeSuspiciousSql(args);
		
		ArgumentTypesObject ato = new ArgumentTypesObject();
		
		// get the function argument types
		String[] argumentTypes = getFunctionTypes(functionName, args.length);
		String returnType = getFunctionReturnType(functionName, args.length);
		
		
		// process the argument list according to the type
		// (t.i. add quotes for text args)
		if (argumentTypes!= null && args.length == argumentTypes.length){
			
			for (int i=0; i<argumentTypes.length; i++) {			
				
				// remove quotes around text arguments, if any
				// (quotes used to be needed in an older version of Lex'it, as a way of distinguishing text arguments from others, 
				// but are no longer necessary)
				if (args[i].trim().startsWith("'") && args[i].trim().endsWith("'"))  {                      
					args[i] = args[i].trim().substring(1, args[i].trim().length()-1);
				}
				
				// set the argument type
				ato.addType(argumentTypes[i]);
				
								
				// if we have a text argument, we need to deal with quotes inside it
				if (argumentTypes[i].equals("text")
						&& !args[i].equals("NULL") // exclude null, which must be interpreted as a null value further on
					) {
					// make sure inside-quotes are escaped in the Postgres way:
					
					// in strings like in "zzp\\'er" or "zzp\'er" (with slash) -> "zzp'er"
					args[i] = (args[i]).replaceAll("([\\\\]+)(')(.)", "$2$3");
					
					
				}
				
				// NULL string must be interpreted as null
				if (args[i].equals("NULL")) {
					args[i] = null;
				}
				
			}
		}
		
		TableRecordObject tro = new TableRecordObject();
				
		ArrayList<String[]> res;
		
		String getRecord = returnType.equals("record") ? 
			"SELECT (" + functionName + "("+ Util.getStringOfQuestionMarksWithCast(args, ato)+")).*;" 
			:
			"SELECT " + functionName + "("+ Util.getStringOfQuestionMarksWithCast(args, ato)+");";	
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		
		try {			
			
			// call the function
			ResultSetSnapshot snapshot = dc.sendPreparedQuery("public", getRecord, args, ato, 0);
						
			String[] columnsNames = snapshot.getColumnNames().toArray(new String[0]);			
			res = Util.getResultSetCopyInAList(snapshot.getRows(), columnsNames);			
			
			for (int i=0; i<columnsNames.length; i++) {
				String[] allCells = new String[res.size()];
				for (int j=0; j<res.size(); j++) {
					allCells[j] = res.get(j)[i].trim();
				}
				tro.addColumnAndValue(columnsNames[i], Util.join(allCells, Constants.ARG_INTERNAL_SEPARATOR));
			}			
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+getRecord+" "+
					// make sure that the full stacktrace is returned, so as to allow the GUI to show custom <lexit> error messages sent by the database
					Util.getFullStackTrace(e), args);
			throw new RuntimeException(error, e);
		}
		
		return tro;
	}
	
	
	/**
	 * get the argument types of a function
	 * 
	 * @param functionName
	 * @param number of arguments (needed for distinction since we sometimes have homonyms)
	 * @return array of argument types
	 */
	public String[] getFunctionTypes(String functionName, int numberOfArgs){
		
		// this query still works in Postgres 17
		
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
		if (functionName.indexOf(".")>0) {
			schemaName = functionName.split("\\.")[0];
			functionName = functionName.split("\\.")[1];
		}
		
		String cachingKey = schemaName+functionName+numberOfArguments;
		if ( db.getCache().getFunctionNameToArgTypes().containsKey(cachingKey) ) {
			if (Constants.debug) {
				System.out.println("## Function args types from cache: ");
				System.out.println( Arrays.toString(db.getCache().getFunctionNameToArgTypes().get(cachingKey)) );
			}
			
			return db.getCache().getFunctionNameToArgTypes().get(cachingKey);
		}
		
		
		String[] argumentTypes = null;
		
		String schema = db.getSchemaName();
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		String[] args = new String[]{functionName, schemaName, numberOfArguments };	
		
		try {
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, functionDetailsQuery, args).getRows();				
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"argument_types"});
			
			// output has the form:  "type1, type2, type3"
			// so we need to split and to trim
			if (res.size()>0) {
				argumentTypes = res.get(0)[0].split(",");
				for (int i=0; i<argumentTypes.length; i++) {
					argumentTypes[i] = argumentTypes[i].trim();
				}
				db.getCache().setFunctionNameToArgTypes(cachingKey, argumentTypes);
			}			
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+functionDetailsQuery, args);
			throw new RuntimeException(error, e);
		}
		
			
		if (Constants.debug){
			System.out.println("## Function args types: ");
			System.out.println(Arrays.toString(argumentTypes));
		}

		
		return argumentTypes;
	}
	
	
	
	/**
	 * Determine if a function is a writing function (return 'write')
	 * or just a reading function  (return 'read')
	 * 
	 * @param functionName
	 * @param number of arguments (needed for distinction since we sometimes have homonyms)
	 * @return string 'write' or 'read', describing the function operation type
	 */
	public String getFunctionOperationType(String functionName, int numberOfArgs){
		
		String projectSchema = db.getSchemaName(); // get schema of project
		
	
		// (see: http://stackoverflow.com/questions/3524859/how-to-display-full-stored-procedure-code)
		
		// does the function contain DELETE, UPDATE or INSERT?
		
		// The trick is:  
		// build a regex pattern like 
		// .*(update|delete from|insert into) schema_name\.(table1|table2|table3|table_whatever).*
		// and try to find this pattern in the function body text.
		// Finally, if it matches, return 'all' or 'write', otherwise string 'read',
		// which describes the function operation type.
		
		
		// this query still works in Postgres 17
		
		String functionQuery = 		
			"SELECT CASE "+
			" WHEN function_txt.fulltext ~ tables.all_writing_pattern THEN '"+Constants.USER_ALL_ACCESS+"' "+
			" WHEN function_txt.fulltext ~ tables.writing_pattern THEN '"+Constants.USER_WRITE_ACCESS+"' " +
			" ELSE '"+Constants.USER_READ_ACCESS+"' "+
			" END AS function_operation " +
			"FROM " +
			
			// this retrieves the function text
			"(SELECT LOWER(regexp_replace(p.prosrc, E'[ \t\n\r]+', ' ', 'g')) AS fulltext " + 
			"FROM pg_proc p, pg_namespace n " +
			"WHERE p.proname = ? " +  	// function name
			"AND n.nspname = ? "+		// function schema name
			"AND p.pronargs = ?) function_txt, " + // number of arguments (needed for distinction since we sometimes have homonyms)
			
			// this generates the regex pattern matching writing operations
			"(SELECT "+ // the schema name might be omitted here (eg. public), which is why we use '|' here
			"'.*(delete from) (|"+projectSchema+"\\.)('||string_agg(c.relname, '|')||').*' AS all_writing_pattern, " +
			"'.*(update|insert into) (|"+projectSchema+"\\.)('||string_agg(c.relname, '|')||').*' AS writing_pattern " + 
			"FROM pg_catalog.pg_class c " +
			"FULL JOIN pg_catalog.pg_namespace n " + 
			"ON n.oid = c.relnamespace " +
			"WHERE c.relkind IN ('r', 'v', 'm', '') " +
			"AND n.nspname NOT IN ('pg_catalog', 'pg_toast') " + 
			"AND n.nspname != 'information_schema' " +
			"AND n.nspname = ? " + // project schema name
			"ORDER BY 1) tables "+
			"LIMIT 1 ;";
		
		// if the function name contains a schema name (like 'api.blah'), extract it
		String functionSchemaName = "public";
		if (functionName.indexOf(".")>0) {
			functionSchemaName = functionName.split("\\.")[0];
			functionName = functionName.split("\\.")[1];
		}
		
		String numberOfArguments = String.valueOf(numberOfArgs);
		String cachingKey = functionSchemaName+functionName+numberOfArguments;
		if ( db.getCache().getFunctionNameToOperationTypes().containsKey(cachingKey) ) {
			if (Constants.debug)  {
				System.out.println("## Function operation type from cache: ");
				System.out.println(db.getCache().getFunctionNameToOperationTypes().get(cachingKey));
			}
			
			return db.getCache().getFunctionNameToOperationTypes().get(cachingKey);
		}
		
		
		String functionOperationType = "read";
		
		String schema = db.getSchemaName();
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		String[] args = new String[]{functionName, functionSchemaName, numberOfArguments, projectSchema};
		
		try {
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, functionQuery, args).getRows();				
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"function_operation"});
			
			if (res.size()>0) {
				functionOperationType = res.get(0)[0];
				db.getCache().setFunctionNameToOperationType(cachingKey, functionOperationType);
			}			
			
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+functionQuery, args);
			throw new RuntimeException(error, e);
		}
			
		if (Constants.debug){
				System.out.println("## Function operation type: ");
				System.out.println(functionOperationType);
		}
		
		return functionOperationType;
	}
	
	
	/**
	 * get the return type of a function
	 * 
	 * @param functionName
	 * @param number of arguments (needed for distinction since we sometimes have homonyms)
	 * @return return type of the function
	 */
	public String getFunctionReturnType(String functionName, int numberOfArgs){
		
		// this query still works in Postgres 17
		
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
		if (functionName.indexOf(".")>0) {
			schemaName = functionName.split("\\.")[0];
			functionName = functionName.split("\\.")[1];
		}
		
		String cachingKey = schemaName+functionName+numberOfArguments;
		if ( db.getCache().getFunctionNameToReturnTypes().containsKey(cachingKey) ) {
			if (Constants.debug) {
				System.out.println("## Function return type from cache: ");
				System.out.println(db.getCache().getFunctionNameToReturnTypes().get(cachingKey));
			}
			
			return db.getCache().getFunctionNameToReturnTypes().get(cachingKey);
		}
		
		
		String returnType = null;
		
		String schema = db.getSchemaName();
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		String[] args = new String[]{functionName, schemaName, numberOfArguments};	
		
		try {
			
			List<Map<String, Object>> rs = dc.sendPreparedQuery(schema, functionDetailsQuery, args).getRows();				
			ArrayList<String[]> res = Util.getResultSetCopyInAList(rs, new String[]{"return_type"});
			
			if (res.size()>0) {
				returnType = res.get(0)[0];
				db.getCache().setFunctionNameToReturnType(cachingKey, returnType);
			}			
			
		} 
		catch (Exception e)  {
			String error = Util.getDebugInfoForConsole("Error while executing query "+functionDetailsQuery, args);
			throw new RuntimeException(error, e);
		}
		
			
		if (Constants.debug){
			System.out.println("## Function return type: ");
			System.out.println(returnType);
		}
		
		return returnType;
	}


}
