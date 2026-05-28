package util;


import java.io.PrintWriter;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import database.ArgumentTypesObject;
import jakarta.json.Json;
import jakarta.json.JsonReader;
import jakarta.json.JsonStructure;
import jakarta.json.JsonValue;
import resources.Constants;
import resources.ContextObject;


/**
 * Utilities class
 * 
 * contains the following parts:
 * 
 * Dealing with search values from client
 * Dealing with TIME
 * DEBUGGING functions
 * Dealing with STRINGs
 * Dealing with JSON
 * Dealing with NUMBERS
 * Dealing with ARRAYS
 * Dealing with RESULT SETS
 * Dealing with SQL words
 * Getting safe schema / table / column names
 * Regex and backreferences in SQL
 * Questions marks in prepared statements
 * Operators
 * Columns
 * Data types
 *
 */
public class Util {
	
	
	// ********************************************************************************************************
	// Dealing with search values from client
	// ********************************************************************************************************
	
	/**
	 * This function makes sure a search value (send by the client) has the right format for it to be processed properly by Lex'it.
	 * 
	 * Special cases:
	 * - NULL in a string should be interpreted as null
	 * - "..." means case sensitive
	 * - "" should be interpreted as an empty string
	 * 
	 * @param value
	 * @return possibly reformatted value
	 */
	public static String setRightSearchValue(String value){
		
		if (value.equals("NULL")) {
			return null;
		}
		
		// remove quotes if they are there
		//
		// important: if we have an operator in front, split the search string into operator string and searched value
		// (like  '!word' ->  '!' and 'word') so as to process the quotes properly
		String cleanValue = removeFrontOperator(value);
		String operator   = value.substring(0, value.length()-cleanValue.length());
		
		if ( (cleanValue.length()>=2 && cleanValue.startsWith("\"") && cleanValue.endsWith("\"")) 
				|| 
			 (cleanValue.length()>=2 && cleanValue.startsWith("'") && cleanValue.endsWith("'")) )
		{
			// in a jsonb query, we might have quotes which have to be kept!
			// (like {"name": "Piet"})			
			if (cleanValue.matches(".*\"[^\"]+\"[ \\s]*:[ \\s]*\"[^\"]+\".*"))
				return value;
			
			// at this point, we are sure we do have to remove the quotes, 
			// do it!
			cleanValue = cleanValue.substring(1, cleanValue.length()-1);
			
			// if the final value is empty, convert it into a regex telling we're looking for an empty string
			// (otherwise it would match everything as a search value!)
			if (cleanValue.isEmpty()) cleanValue = "^$";
			
			// rebuild the original search string with operator (if available; operator may be empty)
			value = operator + cleanValue;
			return value;
		}
		
		// default
		return value;
	}
	
	
	
	/**
	 * Check if the value is case sensitive, which is the case if it is between quotes (like "word" or 'word').
	 * Otherwise it is case insensitive.
	 * 
	 * @param value
	 * @return true/false
	 */
	public static boolean setRightCaseSensitivity(String value){
		
		// remove operator in front, if it's there
		// (like  '!word' -> 'word')
		String cleanValue = removeFrontOperator(value);
		
		// quotes?
		if ( (cleanValue.startsWith("\"") && cleanValue.endsWith("\"")) || 
			 (cleanValue.startsWith("'") && cleanValue.endsWith("'")) ) {
			return true;
		}
		return false;
	}
	

	
	
	// ********************************************************************************************************
	// Dealing with TIME
	// ********************************************************************************************************
	
	static long lastTimeMilliSec = new Date().getTime();	
	
	public static String getTime(){
		
		long timeMilliSec = new Date().getTime();
		
		String returnString = (timeMilliSec - lastTimeMilliSec)+" millisec since last call";
		
		lastTimeMilliSec = timeMilliSec;
		
		return returnString;
		
			
	}
	
	// ********************************************************************************************************
	// DEBUGGING functions
	// ********************************************************************************************************
	
	public static void debug(String output){
		
		if (Constants.debug)  {
			System.out.println("--- "+getTime());			
			System.out.println(output);
		}
	}
	
	public static void debug(ContextObject co, String output){
		
		if (Constants.debug) {
			System.out.println("--- "+getTime());
			System.out.print("DB: "+co.getDbName());
			System.out.print("  ");
			System.out.println("USER: "+co.getUsername());
			System.out.println(output);
		}
	}
	
	public static String getFullStackTrace(Throwable e) {
	    StringWriter sw = new StringWriter();
	    PrintWriter pw = new PrintWriter(sw);
	    e.printStackTrace(pw);
	    return sw.toString();
	}
	
	/**
	 * Get debug info for console output. This function adds a timestamp too, which is often lacking in Tomcat logs.
	 * 
	 * @param some error message
	 * @param some parameters (the args of the entry point or so)
	 * @return String with debug info
	 */
	public static String getDebugInfoForConsole(String errMessage, String[] args) {
		
		if (args == null) args = new String[] {""}; // to avoid null pointer exception
		
		LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss.SSS");
        String formattedDateAndTime = now.format(formatter);
		
		String debugInfoForConsole = "Lex'it debug info | " + formattedDateAndTime + " | "+ errMessage + " | args: ["+Util.join(args, "; ")+"] | End of Lex'it debug info";		
		
		return debugInfoForConsole;
	}

	
	
	

	
	// ********************************************************************************************************
	// Dealing with STRINGs 
	// ********************************************************************************************************

	
	/**
	 * Trim function that can cope with no-breaking space
	 * 
	 * @param a string
	 * @return trimmed string
	 */
	public static String powerTrim(String str){
		return str.replace(String.valueOf((char) 160), " ").trim();
	}
	
	/**
	 * Put escape before characters that need to be escaped
	 * 
	 * @param a string
	 * @return the string with escape characters added
	 */
	public static String prepareStringForRegexMatching(String str){
		return str.replaceAll("(\\(|\\)|\\-|\\*|\\+|\\?)", "\\\\$1");
	}
	

	
	/**
	 * Check if a string contains some letters, including Russian ones
	 * [ but this might be better: value.matches(".*(\\p{L}+).*") ]
	 * 
	 * @param a string
	 * @return true/false
	 */
	public static boolean containsSomeLetters(String value){
		if (value == null) return false;
		return value.matches(".*([a-zA-ZáéíóúýàèìòùâêîôûäëïöüÿñçÁÉÍÓÚÝÀÈÌÒÙÂÊÎÔÛÄËÏÖÜ\u0400-\u04FF]+).*");
	}
	
	/**
	 * Check if a string is a genuine word, including European or Russian letters
	 * 
	 * @param a string
	 * @return true/false
	 */
	public static boolean isGenuineWord(String value){
		if (value == null) return false;
		return value.matches("^([a-zA-ZáéíóúýàèìòùâêîôûäëïöüÿñçÁÉÍÓÚÝÀÈÌÒÙÂÊÎÔÛÄËÏÖÜ\u0400-\u04FF]+)$");
	}
	
	
	// ********************************************************************************************************
	// Dealing with JSON
	// ********************************************************************************************************

	/**
	 * Check if a string is a JSON object
	 * @param s
	 * @return
	 */
	public static boolean isJsonObject(String s) {
        if (s == null) {
            return false;
        }

        try (JsonReader reader = Json.createReader(new StringReader(s))) {
            JsonStructure json = reader.read();

            return json.getValueType() == JsonValue.ValueType.OBJECT;
        } catch (Exception e) {
            return false;
        }
    }
	
	
		
	
	
	// ********************************************************************************************************
	// Dealing with NUMBERS
	// ********************************************************************************************************
	
	
	/**
	 * Test if a string is a integer
	 * 
	 * @param string
	 * @return true/false
	 */
	public static boolean isInteger(String s) {
		try {
			Integer.parseInt(s);
		}
		catch (NumberFormatException e) {
			return false;
		}
		return true;
	}
	
	/**
	 * Test if a string is a double
	 * 
	 * @param string
	 * @return true/false
	 */
	public static boolean isDouble(String s) {
		try {
			Double.parseDouble(s);
		}
		catch (NumberFormatException e) {
			return false;
		}
		return true;
	}
	
	/**
	 * Test if a string is numeric (integer or decimal)
	 * 
	 * @param string
	 * @return true/false
	 */
	public static boolean isNumeric(String str) {
	  return str.matches("-?\\d+(.\\d+)?");
	}
	
	
	/**
	 * Test if a string is a boolean
	 * 
	 * @param string
	 * @return true/false
	 */
	public static boolean isBoolean(String s) {
		return s.equalsIgnoreCase("true") || s.equalsIgnoreCase("false");
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

	
	
	// ********************************************************************************************************
	// Dealing with ARRAYS
	// ********************************************************************************************************
	
	
	/**
	 * Get string (URL parameters or so) into a hash
	 * 
	 * @param string representation of key-value pairs
	 * @param separator
	 * @return hash containing the parsed parameter pairs
	 */
	public static ConcurrentHashMap<String, String> getHashFromString(String strRepresentation, String separator){
		
		ConcurrentHashMap<String, String> converted = new ConcurrentHashMap<String, String>();
		
		String[] parts = strRepresentation.split(separator);
		for (int i=0; i<parts.length; i++) {
			String[] part = parts[i].split("=");
			
			System.out.println("adding "+part[0] +"="+ part[1]);
			converted.put(part[0], part[1]);
		}
		
		return converted;
	}
	
	/**
	 * Get hash into string (URL parameters or so)
	 * 
	 * @param hash representation
	 * @param separator
	 * @return string with concatenated key-value pairs
	 */
	public static String getStringFromHash(ConcurrentHashMap<String, String> hashRepresentation, String separator) {
		
		ArrayList<String> aConverted = new ArrayList<String>(); 
		
		for (Map.Entry<String, String> entry : hashRepresentation.entrySet()) {
			String key = entry.getKey().toString();
			String value = entry.getValue();
			aConverted.add(key+"="+value);
		}
		
		return Util.join(aConverted, "&");
	}
	
	
	
	/**
	 * Concatenate two arrays
	 * 
	 * @param first array
	 * @param second array
	 * @return concatenated array
	 */
	public static String[] concatArr(String[] first, String[] second) {
		if (first==null && second==null) return null;
		else if (first==null) return second;
		else if (second==null) return first;
		
	    List<String> both = new ArrayList<String>(first.length + second.length);
	    Collections.addAll(both, first);
	    Collections.addAll(both, second);
	    return both.toArray(new String[both.size()]);
	}
	
	
	/**
	 * Clone an array
	 * 
	 * @param some array
	 * @return the cloned array
	 */
	public static String[] cloneArr(String[] someArray){
		List<String> newArr = new ArrayList<String>(someArray.length);
	    Collections.addAll(newArr, someArray);
	    return newArr.toArray(new String[newArr.size()]);
	}
	
	
	
	/**
	 * Remove an element from an array
	 * (Improved version of https://stackoverflow.com/questions/642897/removing-an-element-from-an-array-java)
	 * 
	 * @param input array
	 * @param string element to be deleted
	 * @return new array without the element
	 */
	public static String[] removeElement(String[] input, String deleteMe) {
	    List<String> result = new LinkedList<String>();

	    for(String item : input)
	        if(!deleteMe.equals(item))
	            result.add(item);

	    return result.toArray(new String[result.size()]);
	}
	
	
	/**
	 * Join method
	 * @param a collection
	 * @param a delimiter
	 * @return a string, separated with the given delimiter
	 */
	public static String join(String[] s, String delimiter){
		StringBuilder sb = new StringBuilder();
		
		for (int i=0; i<s.length; i++)
		{
			if (i>0) sb.append(delimiter);			
			sb.append(s[i]);			
		}
		return sb.toString();
	}
	
	public static <T> String join(Iterable<T> s, String delimiter){
		StringBuilder sb = new StringBuilder();
		Iterator<T> iter = s.iterator();
		
		while (iter.hasNext())
		{
			sb.append(iter.next());			
			if (iter.hasNext()) 
				sb.append(delimiter);
		}
		return sb.toString();
	}
	
	/**
	 * Extension of InlJavaLib version with quote sign
	 * 
	 * @param <T>
	 * @param s
	 * @param delimiter
	 * @param quoteSign
	 * @return
	 */
	public static <T> String join(Iterable<T> s, String delimiter, String quoteSign){
		
		StringBuilder builder = new StringBuilder();
		Iterator<T> iter = s.iterator();
		
		while (iter.hasNext()) {
			builder.append(quoteSign);
			builder.append(iter.next());
			builder.append(quoteSign);
			if (iter.hasNext()) {
				builder.append(delimiter);
			}
		}
		return builder.toString();
	}
	
	/**
	 * Get the index of an element in an array
	 * 
	 * @param one value
	 * @param an array
	 * @return the index of the value in the array, or -1 if not found
	 */
	public static Integer getIndexOf(String oneValue, String[] values){
		
		for (int i=0; i<values.length; i++) {
			if (oneValue == null && values[i] == null)
				return i;
			if (oneValue != null && values[i] != null && values[i].equals(oneValue))
				return i;
		}
		return -1;
	}
	
	
	/**
	 * Split a string into an array. 
	 * This function is meant to parse strings containing numbers in a reliable way 
	 * (this is needed since members might contain misleading commas).
	 * 
	 * @param a string to be split
	 * @param separator
	 * @return an array of strings
	 */
	public static String[] splitString(String str, String separator) {
		
		// if empty string, return empty array right away
        if (str == null || str.trim().isEmpty()) {
            return new String[] {};
        }
        
        
        // string is not empty, so we need to process it
        StringBuilder current = new StringBuilder();
        boolean insideQuotes = false;
        boolean escapeNext = false;
        List<String> result = new ArrayList<>();
        
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            
            if (escapeNext) {
                current.append(c);
                escapeNext = false;
            } else if (c == '\\') {
                escapeNext = true;
            } else if (c == '"') {
                insideQuotes = !insideQuotes;
                // Don't include the quotes in the result
            } else if (c == separator.charAt(0) && !insideQuotes) {
                // Found a delimiter outside quotes
                result.add(current.toString().trim());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        
        // Add the last field
        result.add(current.toString().trim());

		// return the result as an array
        return result.toArray(new String[0]);
	}
	
	
	
	
	

	// ********************************************************************************************************
	// Dealing with RESULT SETS
	// ********************************************************************************************************
	
	/**
	 * Since the sendPreparedQuery() function now returns a ResultSnapshot instead of a ResultSet (see explanation in ResultSetSnapshot.java),
	 * we have to convert the rows of a ResultSnapshot into a List of String arrays,
	 * which is what most functions expect as input.
	 * 
	 * @param list of maps (each map being a row, with column name-value pairs)
	 * @param list of column names
	 * @return list of string arrays (each array being a row)
	 * 
	 * @throws UnsupportedEncodingException
	 * @throws SQLException
	 */
	public static ArrayList<String[]> getResultSetCopyInAList(List<Map<String, Object>> data, String[] fieldnames) throws UnsupportedEncodingException, SQLException{
		
		ArrayList<String[]> output = new ArrayList<String[]>();
		
		if (data == null) {
			return output;
		}
		
		for (Map<String, Object> row : data) {
			
			String[] fieldvalues = new String[fieldnames.length];
			for (int i=0; i<fieldnames.length; i++) {
				String fieldname = fieldnames[i];
				Object fieldvalue = row.get(fieldname);
				fieldvalues[i] = (fieldvalue != null ? fieldvalue.toString() : "");				
			}
			output.add(fieldvalues);

		}
		return output;
	}
	
	
	/**
	 * Get the results of a query into a List
	 * each record is an array in that list
	 * 
	 * NOTE This function might be deprecated, since we are now using ResultSnapshots instead of ResultSets (see explanation in ResultSetSnapshot.java).
	 * 
	 * @deprecated
	 * @param rs
	 * @param velden
	 * @return
	 * @throws SQLException 
	 * @throws UnsupportedEncodingException 
	 */
	public ArrayList<String[]> getResultsInAList(ResultSet rs, String[] velden) throws UnsupportedEncodingException, SQLException{
		
		ArrayList<String[]> lijst = new ArrayList<String[]>();
		
		if (rs == null) {
			return lijst;
		}
		
		try  {
			try {
				while (rs.next()) {
					
					String[] veldInhoud = new String[velden.length];
					for (int i=0; i<velden.length; i++) {
						String veld = velden[i];						
						
						byte[] col = rs.getBytes(veld);
						if (col != null) {
							String str = new String(col, "UTF-8");
							veldInhoud[i] = str; 
						}
						else {
							veldInhoud[i] = "";
						}
						
					}
					lijst.add(veldInhoud);
					
				}
				return lijst;
			}
			finally {
				rs.close();
			}
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
		
	}
	
	/**
	 * Get the results of a query into a List of ArrayLists
	 * 
	 * NOTE This function might be deprecated, since we are now using ResultSnapshots instead of ResultSets (see explanation in ResultSetSnapshot.java).
	 * 
	 * @deprecated
	 * @param rs
	 * @param velden
	 * @return
	 */
	public ArrayList<ArrayList<String>> getResultsInArrayList(ResultSet rs, String[] velden){
		
		ArrayList<ArrayList<String>> list = new ArrayList<ArrayList<String>>();
		
		if (rs == null)  {
			return list;
		}
		
		try {
			try {
				while (rs.next()) {
					ArrayList<String> veldInhoud = new ArrayList<String>();
					for (int i=0; i<velden.length; i++) {
						String veld = velden[i];
												
						byte[] col = rs.getBytes(veld);
						if (col != null) {
							String str = new String(col, "UTF-8");
							
							veldInhoud.add(str);	
						}
						else {
							veldInhoud.add( "" );
						}
					}
					list.add(veldInhoud);
					
				}
				return list;
			}
			finally {
				rs.close();
			}
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
		
	}
	
	
	
	
	/**
	 * Since the sendPreparedQuery() function now returns a ResultSnapshot instead of a ResultSet (see explanation in ResultSetSnapshot.java),
	 * we have to convert the rows of a ResultSnapshot into a List of ArrayLists,
	 * which is what most functions expect as input.
	 * 
	 * NOTE This function was called once only, and could be easily replaced by getResultSetCopyInAList() as it's functionally the same.
	 *      So getResultSetCopyInArrayList might now be considered as deprecated.
	 * 
	 * @deprecated
	 * @param list of maps (each map being a row, with column name-value pairs)
	 * @param list of column names
	 * @return list of ArrayLists (each ArrayList being a row)
	 */
	public static ArrayList<ArrayList<String>> getResultSetCopyInArrayList(List<Map<String, Object>> data, String[] fieldnames){
		
		ArrayList<ArrayList<String>> output = new ArrayList<ArrayList<String>>();
		
		if (data == null)  {
			return output;
		}
		
		for (Map<String, Object> row : data) {
			
			ArrayList<String> fieldvalues = new ArrayList<String>();
			for (int i=0; i<fieldnames.length; i++) {
				String fieldname = fieldnames[i];
				Object fieldvalue = row.get(fieldname);
				fieldvalues.add( fieldvalue != null ? fieldvalue.toString() : "" );
			}
			output.add(fieldvalues);

		}
		return output;
		
	}
	
	
	
	
	
	
	// ********************************************************************************************************
	// Dealing with SQL words
	// ********************************************************************************************************
		
	
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
	
	
	
	
	
	// ********************************************************************************************************
	// Getting safe schema / table / column names
	// (especially when they contain reserved sql words or special characters)
	// ********************************************************************************************************


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
		
		if ( !isReservedSqlWord(fieldName) &&
				fieldName.toLowerCase().equals(fieldName) && 
				!fieldName.contains("-"))
			return fieldName;
		
		return "\""+fieldName+"\"";
	}
	
	
	
	// ********************************************************************************************************
	// Regex and backreferences in SQL
	// ********************************************************************************************************
	
	
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
	
	// in SQL we need a double escape \\, make sure we get it if the string only contains one \
	public static String getDoubleEscape(String str){
		
		return str.replaceAll("\\\\+", "\\\\\\\\");
	}
	
	
	
	
	// ********************************************************************************************************
	// ** Questions marks in prepared statements
	// ********************************************************************************************************
	
	
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
	
	
	
	// ********************************************************************************************************
	// ** Operators
	// ********************************************************************************************************
	
	
	/**
	 * Remove operators and such, that were put in front of the search string
	 * @param value
	 * @return
	 */
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
		
	/**
	 * Check if the operator preceding a question mark in a query implies that the question mark stands for a regex value.
	 * @param query
	 * @param indexOfQuestionMark
	 * @return
	 */
	public static boolean preceedingOperatorImpliesaRegex(String query, int indexOfQuestionMark){
		
		query = query.substring(0, indexOfQuestionMark)+
			"somethingWeCanRecognize" +  
			query.substring(indexOfQuestionMark+1);
		
		// split the query into pieces and look for the operator preceding
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
	
	
	
	// ********************************************************************************************************
	// Columns
	// ********************************************************************************************************

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
	
	
	
	

	// ********************************************************************************************************
	// Data types
	// ********************************************************************************************************
	
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
