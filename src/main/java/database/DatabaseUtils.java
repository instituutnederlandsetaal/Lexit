package database;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import resources.ContextObject;
import util.FileProcessor;
import util.Util;

/*
 * This static class contains several utilities for the Databases classes
 */
public class DatabaseUtils {
	
	// remove quotes from a field name that got quotes because it is a reserved sql word
	public static String removeQuotesFromSqlReservedWord(String word){
		return word.replaceAll("\"","");
	}
	
	// do we have a reserved sql keyword?
	public static boolean isReservedSqlWord(String word){
		
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
	 * When working with prepared statements is not convenient,
	 * we can check some list of args for semicolons and 
	 * cut off the string if it contains suspicious SQL commands 
	 * (t.i. prevent SQL-injection)
	 * 
	 * @param args
	 * @return
	 */
	public static String[] removeSuspiciousSql(String[] args){
		
		for (int i=0; i<args.length; i++) {
			
			int index = args[i].indexOf(";");
			boolean suspicious = false;
			
			// check if the string is really suspicious
			if (index>-1) {
				String stringToDoubleCheck = args[i].substring(index).toLowerCase();
				suspicious = 
					stringToDoubleCheck.indexOf("drop ")>-1 ||
					stringToDoubleCheck.indexOf("update ")>-1 ||
					stringToDoubleCheck.indexOf("insert ")>-1 ||
					stringToDoubleCheck.indexOf("delete ")>-1;					 
			}
			
			args[i] = suspicious ? args[i].substring(0, index) : args[i];
		}
		return args;
	}
	
	
	/**
	 * Take an array of parameters for a prepared statement
	 * and convert it into a string like ?,?,?,...,?,?
	 * in which the number of question marks matches the number of parameters.
	 * This is to be used in INSERT statements or in clauses like 'WHERE x IN (?,?,?,...)' etc.
	 * 
	 * @param an array of parameters
	 * @return a string with question marks separated by commas
	 */
	public static String getStringOfQuestionMarks(String[] ref){
		StringBuilder builder = new StringBuilder();
		for (int i = 0; i<ref.length; i++)
		{
			if ( i>0) builder.append(",");
			builder.append("?");
		}
		return builder.toString();
	}
	
	
	
	
	/**
	 * Take an array of parameters for a prepared statement
	 * and convert it into a string like CAST(? AS type1), CAST(? AS type2), CAST(? AS type3), ...
	 * in which the number of question marks matches the number of parameters.
	 * This is to be used in INSERT statements or in clauses like 'WHERE x IN (?,?,?,...)' etc.
	 * 
	 * @param an array of parameters
	 * @param ArgumentTypesObject containing the types of the parameters
	 * @return a string with CAST question marks separated by commas
	 */
	public static String getStringOfQuestionMarksWithCast(String[] ref, ArgumentTypesObject ato){
		StringBuilder builder = new StringBuilder();
		for (int i = 0; i<ref.length; i++)
		{
			if ( i>0) builder.append(",");
			builder.append("CAST(? AS "+ato.getType(i)+")");
		}
		return builder.toString();
	}
	
	
	

	


	/**
	 * get the table name only, depending of table name input
	 *  if the table name contains a dot, the table name is the last string after a doc
	 *  if the table name contains no dot, the table name is the whole string
	 * @param tableName
	 * @return
	 */
	public static String getTableNameOnly(String tableName){
		
		String[] parts = tableName.split("\\.");
		return parts[parts.length-1];
	}
	
	/**
	 * if a table name contains both upper and lower case characters, or chars like '-',
	 * Postgres gets confused, so the table name needs to be rewritten
	 * as schema."tablename"
	 * @param tableName
	 * @param schema
	 * @return
	 */
	public static String getSafeTableName(String tableName, String schema){
		
		if (tableName.toLowerCase().equals(tableName) && !tableName.contains("-"))
			return schema+"."+tableName;
		
		return schema+".\""+tableName+"\"";
	}
	
	// same as above, except schema name is not added in front
	public static String getSafeTableNameOnly(String tableName){
		
		if (tableName.toLowerCase().equals(tableName) && !tableName.contains("-"))
			return tableName;
		
		return "\""+tableName+"\"";
	}
	
	// same as above, for field names
	public static String getSafeFieldName(String fieldName){
		
		if ( !DatabaseUtils.isReservedSqlWord(fieldName) &&
				fieldName.toLowerCase().equals(fieldName) && 
				!fieldName.contains("-"))
			return fieldName;
		
		return "\""+fieldName+"\"";
	}	
	
	// in SQL we need a double escape \\, make sure we get it if the string only contains \
	public static String getDoubleEscape(String str){
		
		return str.replaceAll("\\\\+", "\\\\\\\\");
	}
	
	// get valid SQL backreference from java(script)-like regex ( $1 -> \\1 )
	public static String getValidSqlBackReference(String str){
		
		return str.replaceAll("(\\$)(\\d{1})","\\\\\\\\$2");
	}
	
	// returns true if the datatype allows the use of regex (numeric etc).
	public static boolean allowsRegex(String dataType){
		
		if (dataType.equals("text")) return true;
		else if (dataType.startsWith("character varying")) return true;
		return false;
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
	public static String replaceQuestionMarksByArgsInQuery(String query, String[] args){
		
		int indexOfQuestionMark = -1;
		List<String> arguments = new ArrayList<String>(Arrays.asList(args));
		
		int lastQuestionMarkIndex = 0;
		while ( (indexOfQuestionMark = query.indexOf("?", lastQuestionMarkIndex) ) > -1 ) {
			
			String argumentAtThisStep = arguments.remove(0);
			
			// put quotes around argument value, 
			// and add a E before it if it is a regex value
			boolean regexHere = preceedingOperatorImpliesaRegex(query, indexOfQuestionMark);
			
			int stringLengthOfArgument = 4; // default in case the value is null (4 letters)
			if (argumentAtThisStep != null) {				
				if (regexHere) {
					argumentAtThisStep = "E'"+argumentAtThisStep.replaceAll("\\\\", "\\\\\\\\")+"'";					
				}
				else {
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
		}
		return query;
	}
	
	public static boolean preceedingOperatorImpliesaRegex(String query, int indexOfQuestionMark){
		
		query = query.substring(0, indexOfQuestionMark)+
			"somethingWeCanRecognize" +  
			query.substring(indexOfQuestionMark+1);
		
		// split the query into pieces and look for the operator preceeding
		// the question mark from which we provide the index
		// (the question marks stands for an argument in a prepared query here)
		String[] queryArr = query.split("\\s");
		int i=0;
		for (i=0; i+1<queryArr.length; i++) {
			if (queryArr[i+1].equals("somethingWeCanRecognize"))
				break;
		}
		return queryArr[i].equals("~*");
	}
	
	
	/**
	 * Check if some content is suitable to be eg. searched in a given column type
	 * @param value
	 * @param columnType
	 * @return
	 */
	public static boolean valueIsSuitableForColumnType(String value, String columnType){
		
		// null values
		if (value == null)
			return true;
				
		// remove operators in front
		String cleanValue = removeFrontOperator(value);
		
		// range
		if (value.startsWith("range[") && value.endsWith("]") 
			&&
		   (columnType.equals("date") || columnType.startsWith("timestamp") || isNumericTypeOfSomeKind(columnType) )
			) {
			return true;
		}
		
		// array
		if (cleanValue.startsWith("{") && cleanValue.endsWith("}") && columnType.endsWith("[]"))
			return true;
		
		// booleans
		if (cleanValue.matches("true|false") && columnType.equals("boolean"))
			return true;
		
		// tsvector 
		if (columnType.equals("tsvector")) // good enough for now (no conditions) 
			return true;
		
		// jsonb 
		if (columnType.equals("jsonb")) // good enough for now (no conditions) 
			return true;
		
		// user-defined
		// (searching a user-defined field with a string as '-' will cause a crash if we don't cast to text)
		if ( columnType.equals("USER-DEFINED") && !Util.containsSomeLetters(cleanValue) )
			return false;
		
		// textual
		// (a string containing letters is not suitable to a non-textual field)
		if ( Util.containsSomeLetters(cleanValue) && !isTextualType(columnType) )
			return false;
		
		// numeric
		
		// (a string containing other things than digits is not suitable to whole number field)
		if (cleanValue.matches(".*([^\\d]).*") && (isWholeNumberType(columnType) || isBigWholeNumberType(columnType)) )
			return false;
		
		// (a string containing other things than digits and a dot is not suitable to real number field)
		if (cleanValue.matches(".*([^\\d\\.]).*") && isRealNumberType(columnType))
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
	public static String getCommaSeparatedListOfColumnNamesForaSelect(String[] allColumns){
		
		for (int i=0; i<allColumns.length; i++) {
			allColumns[i] = getSafeFieldName(allColumns[i]);
		}
		
		return Util.join(allColumns, ", ");
	}
	
	
	// remove operators and such, that were put in front of the search string
	public static String removeFrontOperator(String value){
		
		if (value == null)
			return value;
		
		value = value.replaceAll("(unaccent\\()([^\\)]+)(\\))", "$2");
		
		if (value.startsWith("<=") || value.startsWith(">="))
			return value.substring(2);
		if (value.startsWith("<") || value.startsWith(">") || value.startsWith("!"))
			return value.substring(1);
		if (value.startsWith("range[") && value.endsWith("]")) {
			return value.substring(5);
		}
		return value;
	}
	
	

	// ------------------------------------------------
	// Check which kind of data type we have
	// ------------------------------------------------
	
	/**
	 * Do we have a textual type?
	 * @param data type name
	 * @return true/false
	 */
	public static boolean isTextualType(String typeName){
		
		// see: http://www.postgresql.org/docs/9.0/static/datatype-character.html
		return typeName.startsWith("character varying") ||
			typeName.startsWith("varchar") ||
			typeName.startsWith("character") ||
			typeName.startsWith("char")||
			typeName.equals("text");
	};
	
	
	/**
	 * Do we have a numeric type?
	 * @param data type name
	 * @return true/false
	 */
	public static boolean isNumericTypeOfSomeKind(String typeName){
		return ( isWholeNumberType(typeName) || isRealNumberType(typeName) || isBigWholeNumberType(typeName) ); 
	}
	
	/**
	 * Do we have a whole number type?
	 * 
	 * @param data type name
	 * @return true/false
	 */
	public static boolean isWholeNumberType(String typeName){
		
		// see: http://www.postgresql.org/docs/9.0/static/datatype-numeric.html
		return	typeName.startsWith("_int2") ||
				typeName.startsWith("_int4") ||
				typeName.startsWith("integer") ||
				typeName.startsWith("smallint") ||
				typeName.startsWith("decimal") ||		// user-specified precision, exact
				typeName.startsWith("serial") ||
				typeName.startsWith("numeric");
	};
	
	/**
	 * Do we have a big whole number type?
	 * @param data type name
	 * @return true/false
	 */
	public static boolean isBigWholeNumberType(String typeName){
		
		// see: http://www.postgresql.org/docs/9.0/static/datatype-numeric.html
		return 	typeName.startsWith("bigint") ||
				typeName.startsWith("bigserial") ||
				typeName.startsWith("_int8");
	};
	
	
	/**
	 * Do we have a real number type?
	 * @param data type name
	 * @return true/false
	 */
	public static boolean isRealNumberType(String typeName){
		
		// see: http://www.postgresql.org/docs/9.0/static/datatype-numeric.html
		return 
			typeName.startsWith("real") ||
			typeName.startsWith("double precision"); 
	}
	
	/**
	 * Remove the decimal part of a number if it is there
	 * @param number as a String
	 * @return number as a String, without decimal part
	 */
	public static String getRidOfDecimal(String number){
		
		if (number.indexOf(".")<0) return number;
        return number.replaceAll("\\.[0-9]+$", "");
    }
	
	
	/**
	 * Convert an array type into a legal non array type (e.g. character varying[] -> varchar, _int4[] -> int)
	 * @param type
	 * @return non array type
	 */
	public static String getNonArrayType(String type) {
		
		return 	type.replace("character varying", "varchar")
					.replaceAll("^_", "")
					.replaceAll("\\[\\]$", "");
	}
	
	
}
