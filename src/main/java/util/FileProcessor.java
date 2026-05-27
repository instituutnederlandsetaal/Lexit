package util;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;

import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;

import database.ArgumentTypesObject;
import database.Database;
import database.DatabaseUtils;
import database.PostgresConnectionManager;
import resources.Constants;
import resources.ContextObject;
import resources.ResponseObject;

public class FileProcessor {
	
	Database db;
	
	
	public FileProcessor(Database db) {
		this.db = db;
	}
	

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
			
			String error = Util.getDebugInfoForConsole("Error while reading file", new String[] {filename});
			throw new RuntimeException(error, e);
		}
		
		return sb.toString();		
	}
	
	
	
	
	
	
	
	
	/**
	 * Get list of files
	 * 
	 * @param path to the configuration files
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
	
	
	
	/**
	 * Read the database properties file.
	 * 
	 * @throws IOException
	 */
	public static ConcurrentHashMap<String, String> readDatabasePropertiesFile(ContextObject co) throws IOException{
		
		Util.debug(co, "Read database access data from properties file '"+co.getDbName()+".database"+"'...");
		
		String fileName = co.getDbName()+".database";
		
		String filepath = co.getContext().getRealPath(fileName);
		
		// remove '/lexit2/...' of url
		filepath = filepath.replace(
				File.separatorChar + Constants.BASE_URL + File.separator+fileName, 
				""); 
		// remove remaining '/servlet|webapps' part of url
		filepath = filepath.substring(0, filepath.lastIndexOf(File.separatorChar));
		
		// now add path to right file
		filepath = filepath + File.separatorChar + Constants.DB_CONFIG_ROOT + File.separatorChar + Constants.DB_CONFIG_DIR + File.separatorChar + fileName;
		
		Util.debug(co, "File: "+filepath);
		
		return readPropertiesFile(filepath, new ConcurrentHashMap<String, String>());
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
		catch (Exception e){
			
			String error = Util.getDebugInfoForConsole("Error while reading properties file", new String[] {filename});
			throw new RuntimeException(error, e);
		}
		
		return databaseAccessHash;		
	}
	
	
	/**
	 * Convert an CSV file into a table
	 *
	 * @param dbName
	 * @param fileInputStream
	 *
	 * https://stackoverflow.com/questions/1516144/how-to-read-and-write-excel-file
	 */
	public ResponseObject convertCsvIntoTable(String dbName, InputStream fileInputStream, FormDataContentDisposition fileMetaData){

		ResponseObject ro = new ResponseObject();
		

		// get current schema
		String currentSchema = db.getSchemaName();

		// create table name out of filename
		String fileName = fileMetaData.getFileName();
        String fileType = fileName.substring(fileName.indexOf(".")+1).toLowerCase();
		String tableName = getSafeSqlName( fileName.substring(0, fileName.lastIndexOf(".")) );

		// detect file encoding
		BufferedInputStream bufferedStream = getBufferedInputStream(fileInputStream);

		// detect which delimiter is used in the CSV file
		String encoding;
		try {
			bufferedStream.mark(1024 * 1024 * 10); // Sufficiently large mark
			encoding = EncodingDetector.detectCharset(bufferedStream);
			bufferedStream.reset(); // Reset the stream to the beginning
		}
		catch (Exception e){
			String error = Util.getDebugInfoForConsole("Error while converting file into table", new String[] {});
			throw new RuntimeException(error, e);
		}
		System.out.println("Opened an "+fileType.toUpperCase()+" file with "+ (encoding != null ? encoding : "DEFAULT (UTF-8)")+" encoding.");
		if (encoding == null) { encoding = "UTF-8"; }


		// check if the table exists already
		// and if it does, add the date to table name to make it unique
		if (db.checkIfTableExists(tableName)) {
			Date date = new Date();
			SimpleDateFormat formatter = new SimpleDateFormat("yyyy_MM_dd_HHmm");
			tableName = tableName+"_"+formatter.format(date);
		}

		ro.setResponse(tableName); // note the table name, which will be opened in the GUI

		try {
			// detect which delimiter is used in the CSV file
			bufferedStream.mark(1024);
			char delimiter = DelimiterDetector.detectDelimiter(bufferedStream);
			bufferedStream.reset(); // Reset the stream to the beginning

			List<String[]> rows = new ArrayList<>();

            // instantiate the CSV reader/parser
			InputStreamReader inputStreamReader = new InputStreamReader(bufferedStream, encoding);
			CSVParser csvParser;
			CSVReader csvReader;
			try {
				csvParser = new CSVParserBuilder()
						.withSeparator(delimiter)
						.withIgnoreQuotations(true)
						.build();

				csvReader = new CSVReaderBuilder(inputStreamReader)
						.withSkipLines(0)
						.withCSVParser(csvParser)
						.build();
			}
			catch (Exception e) {
				String error = Util.getDebugInfoForConsole("Error while creating CSVReader", new String[] {});
				throw new RuntimeException(error, e);
			}


            // read the CSV file

            List<String> columnNamesInCsv;
            List<String> columnNames = List.of();
            String questionMarks = "";
            ArgumentTypesObject ato = new ArgumentTypesObject();

			try {
                int counter = 0;
				String[] oneRow;

				while ((oneRow = csvReader.readNext()) != null) {

                    //  ===============================
                    // get the columns names (those will be our table columns)
                    // and create the table
                    // ===============================


                    if (counter == 0){

                        columnNamesInCsv = Arrays.asList(oneRow);
                        columnNames = new ArrayList<>();

                        for (int colNr=0; colNr<columnNamesInCsv.size(); colNr++){

							String columnName = getSafeSqlName( columnNamesInCsv.get(colNr));

							// prevent doubles
							if (columnNames.indexOf(columnName)>-1)
								columnName = columnName+"_"+colNr;

                            columnNames.add( columnName );
                            ato.addType("text");
                        }
                        // get question marks string for prepared statement to be used in row insertion later on
                        questionMarks = DatabaseUtils.getStringOfQuestionMarks(oneRow);

                        String createTableQuery = "CREATE TABLE "+currentSchema+"."+tableName+" ("+Util.join(columnNames, " text, ")+" text);";
                        String addUploadedCommentQuery = "COMMENT ON TABLE "+currentSchema+"."+tableName+" IS '_UPLOADED_';";
                        
                        PostgresConnectionManager dc = db.getPostgresConnectionManager();
                        
                        try {
                        	dc.sendUpdate(currentSchema, createTableQuery);
                        	dc.sendUpdate(currentSchema, addUploadedCommentQuery);
                        } 
                        catch (Exception e) {
                            String error = Util.getDebugInfoForConsole("Error while executing query "+createTableQuery + "\n" + addUploadedCommentQuery, new String[] {});
                            throw new RuntimeException(error, e);
                        }


                    }

                    // ===============================
                    // insert the rows
                    // ===============================

                    else {

                        String insertQuery = "INSERT INTO "+currentSchema+"."+tableName+" ("+Util.join(columnNames, ", ")+") VALUES ("+questionMarks+");";
                        
                        PostgresConnectionManager dc = db.getPostgresConnectionManager();
                        
                        try {
							if (columnNames.size() == oneRow.length && oneRow.length == ato.getSize()){
								dc.sendPreparedUpdate(currentSchema, insertQuery, oneRow, ato, new ResponseObject());
							}
							else {
								System.out.println("Row #"+counter+" in uploaded "+fileType.toUpperCase()+"-file has a different number of columns than the header row. Skipping.");
							}

                        }
                        catch (Exception e) {
                            String error = Util.getDebugInfoForConsole("Error while executing query "+insertQuery, oneRow);
                            throw new RuntimeException(error, e);
                        }
                    }

                    // next round
                    counter++;
				}
			}
			catch (Exception e) {
				String error = Util.getDebugInfoForConsole("Error while reading "+fileType.toUpperCase()+" file", new String[] {});
				throw new RuntimeException(error, e);
			}


		}
		catch (Exception e){
			String error = Util.getDebugInfoForConsole("Error while converting file into table", new String[] {});
			throw new RuntimeException(error, e);
			//ro.setResponse("Error while converting file into table ");
		}

		return ro;
	}

	private static BufferedInputStream getBufferedInputStream(InputStream fileInputStream) {
		BufferedInputStream bufferedStream = new BufferedInputStream(fileInputStream);
		return bufferedStream;
	}


	/**
	 * Convert an Excel file into a table
	 * @param dbName
	 * @param fileInputStream
	 *
	 * https://stackoverflow.com/questions/1516144/how-to-read-and-write-excel-file
	 */
	public ResponseObject convertFileIntoTable(String dbName, InputStream fileInputStream, FormDataContentDisposition fileMetaData) {

		
		ResponseObject ro = new ResponseObject();

		// get current schema
		String currentSchema = db.getSchemaName();

		// get filename (we will use it further on as part of the table name)
		String fileName = fileMetaData.getFileName();
        String fileType = fileName.substring(fileName.indexOf(".")+1).toLowerCase();
		fileName = getSafeSqlName( fileName.substring(0, fileName.lastIndexOf(".")) );


        // read the XL file
        Workbook wb;
		if (fileType.startsWith("xls")) {

            try {

                wb = WorkbookFactory.create(fileInputStream);

				if (wb instanceof XSSFWorkbook) {
					System.out.println("Opened an XLSX file.");

				} else if (wb instanceof HSSFWorkbook) {
					System.out.println("Opened an XLS file.");
				}

			} catch (Exception e) {
				String error = Util.getDebugInfoForConsole("Error while instantiating wb", new String[] {});
				throw new RuntimeException(error, e);
			}



			int numberOfSheets = wb.getNumberOfSheets();

			// loop through the sheets

			for (int sheetNr = 0; sheetNr < numberOfSheets; sheetNr++) {

				// the table name will consist of the file name and the sheet name
				Sheet sheet = wb.getSheetAt(sheetNr);
				String sheetName = getSafeSqlName( sheet.getSheetName() );
				String tableName = fileName + "_" + sheetName;

				// check if the table exists already
				// and if it does, add the date to table name to make it unique
				if (db.checkIfTableExists(tableName)) {
					Date date = new Date();
					SimpleDateFormat formatter = new SimpleDateFormat("yyyy_MM_dd_HHmm");
					tableName = tableName+"_"+formatter.format(date);
				}



				// declare needed objects
				Row row;
				Cell cell;

				// array to store the column names
				List<String> columnNames = new ArrayList<String>();
				List<String> columnNamesAndTypes = new ArrayList<String>();

				// get sheet dimension

				int nrOfRows = findLastNonEmptyRow(sheet); //sheet.getPhysicalNumberOfRows();
				int nrOfColumns = 0; // this will be set further on
				int nrofFirstRow = findFirstNonEmptyRow(sheet);

				ro.setResponse(tableName); // note the (last processed) table name, which will be opened in the GUI


				// ===============================
				// get the columns names (those will be our table columns)
				// (assuming the first row (index 0) contains the column headers)
				// and
				// get the proper number of ArgumentTypesObjects, with the right data type
				// ===============================


				ArgumentTypesObject ato = new ArgumentTypesObject();
				Row headerRow = sheet.getRow(0);
				Row firstDataRow = sheet.getRow(nrofFirstRow);

				if (headerRow != null) {
					int numberOfColumns = headerRow.getPhysicalNumberOfCells();

					for (int colNr = 0; colNr < numberOfColumns; colNr++) {
						cell = headerRow.getCell(colNr);

						if (cell != null) {

							// ---------------------
							// Get column name
							// ---------------------

							String columnName = getSafeSqlName( cell.getStringCellValue() );
							if (columnName.isEmpty()) columnName = "column_"+colNr;

							// prevent doubles
							if (columnNames.indexOf(columnName)>-1)
								columnName = columnName+"_"+colNr;

							// add column name to list
							columnNames.add(columnName);


							// ---------------------
							// compute the cell type
							// ---------------------

							String cellType = "text";
							try {
								switch ((firstDataRow.getCell((short) colNr)).getCellType()) {
									case STRING:
										cellType = "text";
										break;
									case BOOLEAN:
										cellType = "boolean";
										break;
									case NUMERIC:
										cellType = "bigint";
										break;
									case BLANK:
										cellType = "text";
										break;
									default:
										cellType = "text";
										break;
								}
							}
							catch (Exception e){
								// if we get an exception, we just keep the default type
							}

							// set the datatype now!
							ato.addType(cellType);
							columnNamesAndTypes.add(columnName+" "+cellType);
						}
					} // end of loop through columns

				} // end of columns names and types computation


				// now we know the true number of columns
				nrOfColumns = columnNames.size();


				// at this point we have all we need to build the table
				// to be filled with the XL sheet content

				// ===============================
				// create the table!
				// ===============================


				String createTableQuery = "CREATE TABLE "+currentSchema+"."+tableName+" ("+Util.join(columnNamesAndTypes, ", ")+");";
				String addUploadedCommentQuery = "COMMENT ON TABLE "+currentSchema+"."+tableName+" IS '_UPLOADED_';";
				
				PostgresConnectionManager dc = db.getPostgresConnectionManager();
				
				try {
					dc.sendUpdate(currentSchema, createTableQuery);
					dc.sendUpdate(currentSchema, addUploadedCommentQuery);
				} 
				catch (Exception e) {
					String error = Util.getDebugInfoForConsole("Error while executing query " + createTableQuery + "\n" + addUploadedCommentQuery, new String[] {});
					throw new RuntimeException(error, e);
				}



				// get question marks string for following prepared statement
				String[] array = new String[columnNames.size()];
				String questionMarks = DatabaseUtils.getStringOfQuestionMarks(columnNames.toArray(array));



				// ===============================
				// insert the rows
				// ===============================

				for (int rowNr = nrofFirstRow; rowNr < (nrOfRows+1); rowNr++) {

					row = sheet.getRow(rowNr);
					if (!isRowEmpty(row)) {

						// get the cell values
						List<String> values = new ArrayList<String>();

						for (int colNr = 0; colNr < nrOfColumns; colNr++) {

							String dataType = ato.getType(colNr);

							cell = row.getCell((short)colNr);
							String cellValue = null;
							if (cell != null) {								
								cellValue = getCellValue(cell);								
							}
							values.add(cellValue);
						}

						// insert those values into the table
						String insertQuery = "INSERT INTO "+currentSchema+"."+tableName+" ("+Util.join(columnNames, ", ")+") VALUES ("+questionMarks+");";
						
						
						try {
							dc.sendPreparedUpdate(currentSchema, insertQuery, values.toArray(new String[values.size()]), ato, new ResponseObject());
						} 
						catch (Exception e) {
							String error = Util.getDebugInfoForConsole("Error while executing query "+insertQuery, values.toArray(new String[values.size()]));
							throw new RuntimeException(error, e);
						}
						

					}
				} // end of loop through rows

			} // end of loop through sheets


		}
        else {

			// we have a CSV/TSV file
			return convertCsvIntoTable(dbName, fileInputStream, fileMetaData);
		}

		return ro;
	}
	
	
	// Helper method to handle cell content dynamically
    public static String getCellValue(Cell cell) {
        if (cell == null) {
            return "";
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    // If it's a date, format it
                    return cell.getDateCellValue().toString();
                } else {
                    // Otherwise, treat it as a number
                    return Double.toString(cell.getNumericCellValue());
                }
            case BOOLEAN:
                return Boolean.toString(cell.getBooleanCellValue());
            case FORMULA:
                // Evaluate the formula if needed
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return "Unsupported Cell Type";
        }
    }



	public ResponseObject removeUploadedFile(String tableName){

		// get current schema
		String currentSchema = db.getSchemaName();

		
		ResponseObject ro = new ResponseObject();
		String comment = db.getComment(tableName);

		if ( comment.indexOf("_UPLOADED_")<0 ){
			ro.setResponse("Error! Removing table '"+tableName+"' is not allowed.");
			return ro;
		}

		String dropTableIfExists = "DROP TABLE IF EXISTS "+currentSchema+"."+tableName+";";
		
		
		PostgresConnectionManager dc = db.getPostgresConnectionManager();
		
		try {
			dc.sendUpdate(currentSchema, dropTableIfExists);
			ro.setResponse("OK");
		} 
		catch (Exception e) {
			String error = Util.getDebugInfoForConsole("Error while executing query "+dropTableIfExists, new String[] {tableName});
			ro.setResponse(error);
			throw new RuntimeException(error, e);
		}
		
		return ro;
	}


	// subroutines of convertFileIntoTable for XL files

	private String getSafeSqlName(String someName){

		// make string lowercase
		// and convert illegal chars into underscores
		someName = someName.replaceAll("[^a-zA-Z0-9]", "_").toLowerCase();
		// get rid of underscores at the beginning and end
		someName = someName.replaceAll("^([_]+)", "").replaceAll("([_]+)$", "");

		return someName;
	}

	private static boolean isRowEmpty(Row row) {
		if (row == null) {
			return true;
		}
		for (int cellNum = row.getFirstCellNum(); cellNum < row.getLastCellNum(); cellNum++) {
			Cell cell = row.getCell(cellNum, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
			if (cell != null) {
				return false;
			}
		}
		return true;
	}

	private static int findLastNonEmptyRow(Sheet sheet) {
		int lastRowNum = sheet.getLastRowNum();
		for (int rowNum = lastRowNum; rowNum >= 0; rowNum--) {
			Row row = sheet.getRow(rowNum);
			if (!isRowEmpty(row)) {
				return rowNum;
			}
		}
		return -1;
	}

	private static int findFirstNonEmptyRow(Sheet sheet) {
		int lastRowNum = sheet.getLastRowNum();
		// start at 1, since row 0 contains the column headers
		for (int rowNum = 1; rowNum <= lastRowNum; rowNum++) {
			Row row = sheet.getRow(rowNum);
			if (!isRowEmpty(row)) {
				return rowNum;
			}
		}
		return -1;
	}


}
