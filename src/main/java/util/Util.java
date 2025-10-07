package util;


import java.io.*;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.SecurityContext;

//import org.apache.poi.hssf.usermodel.HSSFCell;
//import org.apache.poi.hssf.usermodel.HSSFRow;
//import org.apache.poi.hssf.usermodel.HSSFSheet;
//import org.apache.poi.hssf.usermodel.HSSFWorkbook;
//import org.apache.poi.poifs.filesystem.POIFSFileSystem;
//import org.apache.poi.ss.usermodel.Row;
//import org.apache.poi.ss.usermodel.Sheet;
//import org.apache.poi.ss.util.WorkbookUtil;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import resources.Constants;
import resources.ContextObject;


/**
 * Util contains some utilities like a join-function, and such
 * @author Fannee
 *
 */
public class Util {
	
	
	
	// ******************************************************************
	// TIME
	// ******************************************************************
	
	static long lastTimeMilliSec = new Date().getTime();	
	
	public static String getTime(){
		
		long timeMilliSec = new Date().getTime();
		
		String returnString = (timeMilliSec - lastTimeMilliSec)+" millisec since last call";
		
		lastTimeMilliSec = timeMilliSec;
		
		return returnString;
		
			
	}
	
	// ******************************************************************
	// DEBUG
	// ******************************************************************
	
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

	
	
	
	// ******************************************************************
	// FILES  
	// ******************************************************************
	
	
	/**
	 * Read a file
	 * 	
	 * @param filename
	 * @return the file contents as a string
	 */
	public static String readFile(String filename){
		
		StringBuilder sb = new StringBuilder();
		
		try{
			FileInputStream fstream = new FileInputStream(filename);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {
				sb.append(strLine);
				sb.append("\n");
			}
			in.close();
		}
		catch (Exception e){
			throw new RuntimeException("Error while reading the "+filename+" file", e);
		}
		
		return sb.toString();		
	}
	
	
	
	
	
	/**
	 * Read a properties file 
	 * and put the properties in the hash given as argument
	 * 	
	 * @param filename
	 * @param the hash to put the properties in
	 * @return the hash with the properties added (host, port, db, user, pass)
	 */
	public static ConcurrentHashMap<String, String> readPropertiesFile(
			String filename, 
			ConcurrentHashMap<String, String> databaseAccessHash){
		
		try{
			FileInputStream fstream = new FileInputStream(filename);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {
				if (	strLine.indexOf("=")<0  // skip illegal format (we expect key=prop) 
						|| 
						strLine.startsWith("#"))// skip comment lines
					continue;
				String key = strLine.split("=")[0];
				String value = strLine.split("=")[1];
				databaseAccessHash.put(key, value);
			}
			br.close();
			in.close();
		}
		catch (Exception e){//Catch exception if any
			throw new RuntimeException("Error while reading the "+filename+" properties file", e);
		}
		
		return databaseAccessHash;		
	}
	
	
	
	/**
	 * Special version of readPropertiesFile() needed for 'get_configfiles_list' entry point
	 * 
	 * @param filename
	 * @return a hash with login info (host, port, db, user, pass)
	 */
	public static ConcurrentHashMap<String, String> readPropertiesFile(String filename){
		
		ConcurrentHashMap<String, String> logInfo = new ConcurrentHashMap<String, String>();
		
		try{
			FileInputStream fstream = new FileInputStream(filename);
			// Get the object of DataInputStream
			DataInputStream in = new DataInputStream(fstream);
			BufferedReader br = new BufferedReader(new InputStreamReader(in));
			String strLine;
			while ((strLine = br.readLine()) != null) {
				if (	strLine.indexOf("=")<0  // skip illegal format (we expect key=prop) 
						|| 
						strLine.startsWith("#"))// skip comment lines
					continue;
				String key = strLine.split("=")[0];
				String value = strLine.split("=")[1];
				logInfo.put(key, value);
			}
			br.close();
			in.close();
		}
		catch (Exception e){//Catch exception if any
			
		}
		
		return logInfo;		
	}
	
	
	
	
	/**
	 * Get list of files
	 * 
	 * @param path to the configuration file
	 * @return a string with the list of files separated by Constants.ARG_INTERNAL_SEPARATOR
	 */
	public static String getListOfFiles(String path){
		
		File folder = new File(path);
		File[] listOfFiles = folder.listFiles();
		HashSet<String> hashList = new HashSet<String>();
		
		for (int i = 0; i < listOfFiles.length; i++) {
			
			if (listOfFiles[i].isFile())
			{
				String fileName = listOfFiles[i].getName();
				boolean isDatabaseConfig = fileName.endsWith(".database");
				
				if (fileName.endsWith(".config.js") || isDatabaseConfig ) {
					
					fileName = fileName.substring(0, fileName.indexOf("."));
					boolean dbExists = true;
					
					// check if the file exists
					// ------------------------
										
					// to do so, we need to compute the right path
					path = path.substring( 0, path.indexOf(File.separatorChar + Constants.BASE_URL) );										
					// remove remaining '/servlet|webapps' part of url
					path = path.substring(0, path.lastIndexOf(File.separatorChar));					
					// now add path to right file
					path = path + File.separatorChar + Constants.DB_CONFIG_ROOT + File.separatorChar + Constants.DB_CONFIG_DIR + File.separatorChar + fileName + ".database";
					
					
					boolean fileExists = new File(path).exists();
						
					// check if the database is available
					// ----------------------------------
					
					if (fileExists && isDatabaseConfig) {						
						dbExists = checkIfDbExists(path);
					}
					
					// add gathered info to filename
					// -----------------------------
					
					if ( !fileExists) {
						fileName += ":::[BEWARE: the .database configuration file is missing]";
					}
					if ( !dbExists) {
						fileName += ":::[BEWARE: the PSQL connection failed: the database might be missing]";
					}
					
					// add file to the list
					hashList.add(fileName);
				}
				
			}
		}
		
		List<String> sortedList = new ArrayList<String>(hashList);
		Collections.sort(sortedList);
		
		return Util.join(sortedList, Constants.ARG_INTERNAL_SEPARATOR);		
	}
	
	
	/**
	 * Check if a database is available by trying to connect to it
	 * 
	 * @param path to the configuration file
	 * @return true/false
	 */
	private static boolean checkIfDbExists(String path) {
		
		String projectName = path.substring(path.lastIndexOf(File.separatorChar)+1);
		projectName = projectName.substring(0, projectName.indexOf("."));
		
		ConcurrentHashMap<String, String> logInfo = readPropertiesFile(path);
		
		try {
			// try to connect
			ContextObject co = new ContextObject(projectName, logInfo.get("user"));
			PostgresConnectionManager dc = new PostgresConnectionManager(null, false, Constants.maxPoolSize);
			dc.testConnectionTo(logInfo.get("host"), logInfo.get("port"), logInfo.get("db"), logInfo.get("user"), logInfo.get("pass"));
		}
		catch (Exception e) {
			// if connection fails, the database might be missing
			return false;
		}
		// otherwise we can safely return that the database IS available
		return true;
	}
	
	

	
	// ******************************************************************
	// STRING 
	// ******************************************************************

	
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
	
	// 
	//
	// 
	
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
	
	
	
	
	
	// ******************************************************************
	// SQL PROCESSING
	// ******************************************************************
	
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
	
	
	
	
		
	
	
	// ******************************************************************
	// NUMBERS
	// ******************************************************************
	
	
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
	 * Test if a string is numeric (integer or decimal)
	 * 
	 * @param string
	 * @return true/false
	 */
	public static boolean isNumeric(String str) {
	  return str.matches("-?\\d+(.\\d+)?");
	}
	
	
	// ******************************************************************
	// ARRAYS
	// ******************************************************************
	
	
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
		
		while (iter.hasNext())
		{
			builder.append(quoteSign);
			builder.append(iter.next());
			builder.append(quoteSign);
			if (iter.hasNext())
			{
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
		
		for (int i=0; i<values.length; i++)
		{
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
	
	
	// ******************************************************************
	
	

	// ******************************************************************
	// RESULT SETS
	// ******************************************************************
	
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
	
}
