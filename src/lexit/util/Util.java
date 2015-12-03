package lexit.util;


import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import nl.inl.util.XmlUtil;

import org.w3c.dom.Document;
import org.xml.sax.SAXException;


/**
 * Util contains some utilities like a join-function, and such
 * @author Fannee
 *
 */
public class Util {
	
	
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
	
	// read a properties file
	public static HashMap<String, String> readPropertiesFile(String filename, HashMap<String, String> databaseAccessHash){
		
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
			if (oneValue != null && values[i].equals(oneValue))
				return i;
		}
		return -1;
	}
	
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
	
	
	public static boolean isNumeric(String str)
	{
	  return str.matches("-?\\d+(.\\d+)?");
	}

	
	/**
	 * Transform the XML we got from the GTB or ANW webservices into a DOM object
	 * @param xmlString
	 * @return
	 * @throws Exception
	 */
	public static Document getDOMfrom(String xmlString) throws Exception{
		
	    //Create blank DOM Document
	    Document doc = null;
	        
		try {
			doc = XmlUtil.parseXml(xmlString);
			
		} catch (SAXException e) {
			// TODO Auto-generated catch block
			throw new RuntimeException(e);
		}
		
		return doc;
	}
	
	
	
	
	
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
	
}
