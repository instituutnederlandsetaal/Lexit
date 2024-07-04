package util;


import java.io.*;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
		
		if (Constants.debug) 
			{
			System.out.println("--- "+getTime());			
			System.out.println(output);
			}
	}
	
	public static void debug(ContextObject co, String output){
		
		if (Constants.debug) 
			{
			System.out.println("--- "+getTime());
			System.out.print("DB: "+co.getDbName());
			System.out.print("  ");
			System.out.println("USER: "+co.getUsername());
			System.out.println(output);
			}
	}
	
	
	
	
	
	// ******************************************************************
	// FILES  
	// ******************************************************************
	
	
	// read a file
	
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
			throw new RuntimeException("Error while reading the "+filename+" properties file", e);
		}
		
		return sb.toString();		
	}
	
	
	// read a Excel file
	//
	// https://stackoverflow.com/questions/1516144/how-to-read-and-write-excel-file
//	public static void readXlFile(String dbName, InputStream inputStream){
//
//
//		try {
//		    POIFSFileSystem fs = new POIFSFileSystem( inputStream );
//		    HSSFWorkbook wb = new HSSFWorkbook(fs);
//		    HSSFSheet sheet = wb.getSheetAt(0);
//
//			// the sheet name will be our table name
//			String sheetName = wb.getSheetName(0);
//
//
//
//
//		    HSSFRow row;
//		    HSSFCell cell;
//
//		    int rows; // No of rows
//		    rows = sheet.getPhysicalNumberOfRows();
//
//		    int cols = 0; // No of columns
//		    int tmp = 0;
//
//		    // This trick ensures that we get the data properly even if it doesn't start from first few rows
//		    for(int i = 0; i < 10 || i < rows; i++) {
//		        row = sheet.getRow(i);
//		        if(row != null) {
//		            tmp = sheet.getRow(i).getPhysicalNumberOfCells();
//		            if(tmp > cols) cols = tmp;
//		        }
//		    }
//
//		    for(int r = 0; r < rows; r++) {
//		        row = sheet.getRow(r);
//		        if(row != null) {
//		            for(int c = 0; c < cols; c++) {
//		                cell = row.getCell((short)c);
//		                if(cell != null) {
//
//		                    // code what needs to be done here!!!
//
//		                }
//		            }
//		        }
//		    }
//		} catch(Exception ioe) {
//		    ioe.printStackTrace();
//		}
//	}
	
	// write a Excel file
	// see: http://poi.apache.org/components/spreadsheet/quick-guide.html#NewWorkbook
//	public static void writeXlFile(String filepath, String tableName, ResultObject tableObject ){
//		
//		// get table content
//		ArrayList<ConcurrentHashMap<String, String>> tableContent = tableObject.getTableContent();
//		
//		// number of rows, etc.
//		int nrOfRows = tableContent.size();
//		// build list of column names and their corresponding column number
//		ConcurrentHashMap<String, Integer> fieldName2ColumnNr = new ConcurrentHashMap<String, Integer>();
//		if (nrOfRows > 0)
//		{
//			ConcurrentHashMap<String, String> tableObjectRow = tableContent.get(0);
//			for (String key : tableObjectRow.keySet())
//			{
//				int columnNr = fieldName2ColumnNr.size();
//				fieldName2ColumnNr.put(key, columnNr);
//			}
//		}
//		else
//		{
//			// if the table object is empty, do nothing
//			return;
//		}
//		
//		
//		// Blank XL workbook
//		HSSFWorkbook workbook = new HSSFWorkbook();
//
//	    // Create a blank sheet
//		// (Safe way to create valid names, this replaces invalid characters with a space)
//		String safeName = WorkbookUtil.createSafeSheetName(tableName); 
//		Sheet sheet = workbook.createSheet(safeName);
//		
//		// Fill the XL workbook
//		
//		// column names at row #0
//		Row row = sheet.createRow(0);
//		for (String columnName : fieldName2ColumnNr.keySet())
//		{
//			int columnNr = fieldName2ColumnNr.get(columnName);
//			row.createCell(columnNr).setCellValue(columnName);
//		}
//		// fill the table from row #1 on 
//		for (int i=0; i<nrOfRows; i++)
//		{
//			ConcurrentHashMap<String, String> tableObjectRow = tableContent.get(i);
//			row = sheet.createRow(i+1);  // row #0 is reserved for cell names, so we start counting at row #1
//			for (String columnName : tableObjectRow.keySet())
//			{
//				int columnNr = fieldName2ColumnNr.get(columnName);
//				String cellContent = tableObjectRow.get(columnName);
//				row.createCell(columnNr).setCellValue(cellContent);				 
//			}
//			 
//		}
//		
//		try (OutputStream fileOut = new FileOutputStream(filepath)) {
//			
//			workbook.write(fileOut);
//			
//	    } catch (IOException e) {
//	    	throw new RuntimeException("Error while building the export file: "+filepath, e);
//		}
//	}
	
	
	
	
	// read a properties file
	
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
	
	
	// special version needed for get_configfiles_list
	//
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
	
	
	
	// get list of files
	
	public static String getListOfFiles(String path){
		
		File folder = new File(path);
		File[] listOfFiles = folder.listFiles();
		HashSet<String> hashList = new HashSet<String>();
		
		for (int i = 0; i < listOfFiles.length; i++) {
			if (listOfFiles[i].isFile())
			{
				String fileName = listOfFiles[i].getName();
				if (fileName.endsWith(".config.js") || fileName.endsWith(".database") )
				{
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
					
					if (fileExists) {
						dbExists = dbExists(path);
					}
					
					// add gathered info to filename
					// -----------------------------
					
					if ( !fileExists) {
						fileName += ":::[BEWARE: the .database configuration file is missing]";
					}
					if ( !dbExists) {
						fileName += ":::[BEWARE: the PSQL database is missing, it might have been archived]";
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
	
	
	private static boolean dbExists(String path) {
		
		ConcurrentHashMap<String, String> logInfo = readPropertiesFile(path);
		
		PostgresDatabaseCommunication postgresDc = new PostgresDatabaseCommunication(null, false);			
		try {
			// try to connect
			postgresDc.connectTo(logInfo.get("host"), logInfo.get("port"), logInfo.get("db"), logInfo.get("user"), logInfo.get("pass"));
			postgresDc.closeConnection();
		}
		catch (Exception e) {
			
			// if connection fails, the database might be missing
			return false;
		}
		
		return true;
	}
	
	

	
	// ******************************************************************
	// STRING 
	// ******************************************************************

	
	// trim function that can cope with no-breaking space
	public static String powerTrim(String str){
		return str.replace(String.valueOf((char) 160), " ").trim();
	}
	
	// put escape before characters that need to be escaped
	public static String prepareStringForRegexMatching(String str){
		return str.replaceAll("(\\(|\\)|\\-|\\*|\\+|\\?)", "\\\\$1");
	}
	
	public static boolean containsSomeLetters(String value){
		if (value == null) return false;
		return value.matches(".*([a-zA-ZáéíóúýàèìòùâêîôûäëïöüÿñçÁÉÍÓÚÝÀÈÌÒÙÂÊÎÔÛÄËÏÖÜ]+).*");
	}
	
	public static boolean isGenuineWord(String value){
		if (value == null) return false;
		return value.matches("^([a-zA-ZáéíóúýàèìòùâêîôûäëïöüÿñçÁÉÍÓÚÝÀÈÌÒÙÂÊÎÔÛÄËÏÖÜ]+)$");
	}
	
	
	
	
	
	// ******************************************************************
	// SQL PROCESSING
	// ******************************************************************
	
	/**
	 * Returns a string like ?,?,?,...,?,?
	 * needed for prepared updates.
	 * The number of question marks depends on the number
	 * of values to be represented
	 * @param ref
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
	 * In cases working with prepared statements is not convenient
	 * We can check some list of args for semicolons and cut off
	 * the string if it contains suspicious sql commands (prevent sql-injection)
	 * @param args
	 * @return
	 */
	public static String[] removeSuspiciousSql(String[] args){
		
		for (int i=0; i<args.length; i++)
		{
			int index = args[i].indexOf(";");
			boolean suspicious = false;
			
			// check if the string is really suspicious
			if (index>-1)
			{
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
	
	
	

	
//	/**
//	 * Transform the XML we got from the GTB or ANW webservices into a DOM object
//	 * @param xmlString
//	 * @return
//	 * @throws Exception
//	 */
//	public static Document getDOMfrom(String xmlString) throws Exception{
//		
//	    //Create blank DOM Document
//	    Document doc = null;
//	        
//		try {
//			doc = XmlUtil.parseXml(xmlString);
//			
//		} catch (SAXException e) {
//			// TODO Auto-generated catch block
//			throw new RuntimeException(e);
//		}
//		
//		return doc;
//	}
//	
	
	
	// ******************************************************************
	// HASHES
	// ******************************************************************
	
	// convert the password into a hash
	public static String getHashOf(String password) throws NoSuchAlgorithmException, UnsupportedEncodingException{
		
		MessageDigest m = MessageDigest.getInstance("MD5");
		m.reset();
		m.update(password.getBytes());
		byte[] digest = m.digest();
		BigInteger bigInt = new BigInteger(1,digest);
		String hashtext = bigInt.toString(16);
		// Now we need to zero pad it if you actually want the full 32 chars.
		while(hashtext.length() < 32 ){
		  hashtext = "0"+hashtext;
		}
				
		return hashtext;
	}
	
	public static int getIntValueOfHashOf(String str) throws NoSuchAlgorithmException, UnsupportedEncodingException{
		str = getHashOf(str);
		int total = 0;
		for (int i=0; i<str.length(); i++){
			total += (int) str.charAt(i);
		}
		return total;
	}
	
	
	
	// ******************************************************************
	// NUMBERS
	// ******************************************************************
	
	// test if a string is a number

	public static boolean isInteger(String s) {
		try {
			Integer.parseInt(s);
		}
		catch (NumberFormatException e) {
			return false;
			}
		return true;
		}
	

	public static boolean isNumeric(String str)
	{
	  return str.matches("-?\\d+(.\\d+)?");
	}
	
	
	// ******************************************************************
	// ARRAYS
	// ******************************************************************
	
	
	// get string into hash
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
	
	// get hash into string
	public static String getStringFromHash(ConcurrentHashMap<String, String> hashRepresentation, String separator) {
		
		ArrayList<String> aConverted = new ArrayList<String>(); 
		
		for (Map.Entry<String, String> entry : hashRepresentation.entrySet()) {
			String key = entry.getKey().toString();
			String value = entry.getValue();
			aConverted.add(key+"="+value);
		}
		
		return Util.join(aConverted, "&");
	}
	
	
	// concat two arrays
	
	public static String[] concatArr(String[] first, String[] second) {
		if (first==null && second==null) return null;
		else if (first==null) return second;
		else if (second==null) return first;
		
	    List<String> both = new ArrayList<String>(first.length + second.length);
	    Collections.addAll(both, first);
	    Collections.addAll(both, second);
	    return both.toArray(new String[both.size()]);
	}
	
	
	// clone an array
	
	public static String[] cloneArr(String[] someArray){
		List<String> newArr = new ArrayList<String>(someArray.length);
	    Collections.addAll(newArr, someArray);
	    return newArr.toArray(new String[newArr.size()]);
	}
	
	
	// remove element from array
	// (Improved version of https://stackoverflow.com/questions/642897/removing-an-element-from-an-array-java)
	
	public static String[] removeElement(String[] input, String deleteMe) {
	    List<String> result = new LinkedList<String>();

	    for(String item : input)
	        if(!deleteMe.equals(item))
	            result.add(item);

	    return result.toArray(new String[result.size()]);
	}
	
	
	/**
	 * Join methods
	 * @param s  a collection
	 * @param delimiter
	 * @return a string, separated with given delimiter
	 */

	// special case which is not handled by Iterable version from InlJavaLib
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
	
	// extension of InlJavaLib version with quote sign
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
	
	// get the index of an element in an array
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
	
	
	// ******************************************************************
	
}
