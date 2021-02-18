package util;



import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;

import resources.Constants;
import resources.ContextObject;
import resources.DbResponseObject;



public class PostgresDatabaseCommunication {

	public PostgresDatabaseCommunication(ContextObject co, boolean sendTomcatUserInfoToDb) {	
		
		// get the tomcat server context
		// allowing us to get the active tomcat user name etc
		this.co = co;
		this.sendTomcatUserInfoToDb = sendTomcatUserInfoToDb;
	}	
	
	/**
	 * Database connection
	 *  and tomcat server SecurityContext as well
	 */
	private Connection db;
	private ContextObject co;
	private boolean activeTomcatUserTableIsThere = false; 
	private boolean sendTomcatUserInfoToDb = false;
	
	
	/**
	 * Sluit de connectie met de MySQL database. Dit moet helemaal aan het eind 
	 * van het programma gebeuren.
	 */
	public void closeConnection()
		{
		try {
			db.close();
		}
		catch (SQLException e)
		{
			throw new RuntimeException("Error while closing the connection!", e);
		}
	}
	
	public void connectTo(String host, String port, String db, String user, String password)
	{
		// if project config doesn't specify any port, choose the Postgres default port 
		port = (port == null || port.isEmpty()) ? "5432" : port; 
				
		// location		
		String location = "jdbc:postgresql://"+host+":"+port+"/"+db;
		
		if (Constants.debug) System.out.println("PostgreSQL: Try to connect as "+user+"/"+password);
		
        // checks if the class exists (implicitly if the library is there)
        try {
        	Class.forName("org.postgresql.Driver");

        } catch (ClassNotFoundException e) {        
        throw new RuntimeException("PostgreSQL JDBC Driver not found. Include it in your library path!", e);
        }

        try {
        	Properties props = new Properties();
        	props.setProperty("user", user);
        	props.setProperty("password", password);
        	props.setProperty("charSet", "UTF8");
        	//props.setProperty("tcpKeepAlive", "true");
        	//props.setProperty("prepareThreshold", "1");
        	this.db = DriverManager.getConnection(location, props);

        } catch (Exception e) {
        throw new RuntimeException("Connection Failed! Check output console!", e);
        }

        if (this.db == null)
        {
        	if (Constants.debug) System.out.println("Failed to make connection!");
        }
		
	}
	
	
	private void SendUserIdentityToDatabaseServer(){
		
		// if the configuration tells us to send the tomcat username
		// to the database server
		// AND
		// it hasn't been done yet, then:
		//
		// create a temporary table in which the tomcat username will be put,
		// and call this table 'active_user';
		// this temporary table is only visible within the user's session,
		// so multiple active users will have their name stored in as many 
		// temporary tables with the same name, but invisible to each other, 
		// so no name conflict will occur, so I tested.
		//
		// The active username stored in the 'active_user' temporary table 
		// can be read by trigger functions etc, by reading the 'username' field
		// from the temporary table.
		
		
		if ( sendTomcatUserInfoToDb &&
				!activeTomcatUserTableIsThere)
		{
			Statement stmt = null;
			String query = "CREATE TEMPORARY TABLE active_user AS "+
				"SELECT '"+ this.co.getUsername() +"'::text AS username, '"+ this.co.getSessionId() +"'::text AS session_id;";
			
			try
			{
				// Create a Statement object
				stmt = this.db.createStatement();
				stmt.executeUpdate(query);
				
				activeTomcatUserTableIsThere = true;
			}
			catch (SQLException e)
			{
				throw new RuntimeException("Error while executing query "+query, e);
			}			
			
		}
		
		
		
	}
	
	
	public ResultSet sendQuery(String query) 
	{
		if (Constants.debug) System.out.println(query);
		
		SendUserIdentityToDatabaseServer();
		
		// Get the results
		ResultSet rs = null;
		Statement stmt = null;
		try
		{			
			// Create a Statement object
			stmt = this.db.createStatement();
			rs = stmt.executeQuery(query);			
		}
		catch (SQLException e)
		{
			throw new RuntimeException("Error while executing query "+query, e);
		}				
		return rs;
	}
	
	/**
	 * Send a query with a time limit
	 * @param query
	 * @param timeLimitInMilliseconds
	 * @return
	 */
	public ResultSet sendQueryWithTimeout(String query, int timeLimitInMilliseconds) 
	{
		if (Constants.debug) System.out.println(query);
		long timeBeforeQuery = new Date().getTime();
		
		SendUserIdentityToDatabaseServer();
		
		// Get the results
		ResultSet rs = null;
		Statement stmt = null;
		try
		{			
			// Create a Statement object
			stmt = this.db.createStatement();
			
			// set a timeout in milliseconds
			// (beware: setting this must happen in a separate query: we can't bundle this
			//  with the main query, or it won't have any effect!)
			String SetTimeOutQuery = "SET statement_timeout TO " + timeLimitInMilliseconds + ";";
			stmt.executeUpdate(SetTimeOutQuery);
			
			// the timeout is set, now execute the query
			rs = stmt.executeQuery(query);			
		}
		catch (SQLException e)
		{
			if (Constants.debug) System.out.println("Exception "+e.getMessage());
			if (e.getMessage().toLowerCase().contains("timeout"))
			{
				// show a message but throw no exception
				// so time out will return null
				long timeAfterQuery = new Date().getTime();
				if (Constants.debug) System.out.println("## TIMEOUT ("+(timeAfterQuery - timeBeforeQuery)+" ms) while executing query "+query);
			}
			else
			{
				// error, throw an exception and return no value
				throw new RuntimeException("Error while executing query "+query, e);
			}
		}
		finally {
			
			// finally, reset the original timeout settings
			String ResetTimeOutQuery = "RESET statement_timeout;";
			
			try {
				// Create a new Statement object
				stmt = this.db.createStatement();
				// reset timeout
				stmt.executeUpdate(ResetTimeOutQuery);
				
			} catch (SQLException e) {
				throw new RuntimeException("Error while executing query "+query, e);
			}
		}
		
		return rs;
	}

	public void sendUpdate(String query) 
	{
		if (Constants.debug) System.out.println(query);
		
		SendUserIdentityToDatabaseServer();
		
		Statement stmt = null;
		try
		{
			// Create a Statement object
			stmt = this.db.createStatement();
			stmt.executeUpdate(query);
		}
		catch (SQLException e)
		{
			throw new RuntimeException("Error while executing query "+query, e);
		}
	}
	
	
	public ResultSet sendPreparedQuery(String query, String[] args) 
	{
		// if the query args contains null values,
		// the query needs to be rebuilt
		QueryObject qo = rebuildQueryIfArgListContainsNullValues(new QueryObject(query, args, null));
		// if the query requires 'exact equality', remove regex operator to speed up the query
		qo = rebuildQueryIfArgRequiresStrictEquality(qo);
		query = qo.getQuery();
		args = qo.getArgs();
		
		if (Constants.debug)
		{
			System.out.println(query);
			System.out.println(Util.join(args, ", "));
		}
		
		SendUserIdentityToDatabaseServer();
		
		// Get the results
		ResultSet rs = null;
		PreparedStatement prest = null;
		try
		{
			// prepare statement
			prest = this.db.prepareStatement(query,
					ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

			for (int i=0; i<args.length; i++)
			{
				String oneArg = args[i];				
				// a string containing 'NULL' must be interpreted as null
				if (oneArg.equals("NULL")) oneArg = null;
				
				if ( Util.isInteger(oneArg))
					prest.setInt(i+1, Integer.parseInt(oneArg));
				else
					prest.setString(i+1,oneArg);				
			}
			
						
			rs = prest.executeQuery();
		}
		catch (SQLException e)
		{
			throw new RuntimeException("Error while executing query "+query, e);
		}
		
		return rs;
	}
	
	public ResultSet sendPreparedQuery(String query, String[] args, ArgumentTypesObject ato) 
	{
		
		// if the query args contains null values,
		// the query needs to be rebuilt
		QueryObject qo = rebuildQueryIfArgListContainsNullValues(new QueryObject(query, args, ato));
		// if the query requires 'exact equality', remove regex operator to speed up the query
		qo = rebuildQueryIfArgRequiresStrictEquality(qo);
		query = qo.getQuery();
		args = qo.getArgs();
		ato = qo.getAto();
		
		if (Constants.debug)
		{
			System.out.println(query);
			System.out.println(Util.join(args, ", "));
		}
		
		SendUserIdentityToDatabaseServer();
		
		// Get the results
		ResultSet rs = null;
		PreparedStatement prest = null;
		try
		{
			// prepare statement
			prest = this.db.prepareStatement(query,
					ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

			for (int i=0; i<args.length; i++)
			{
				String oneArg = args[i];
				String oneType = ato.getType(i);
				// a string containing 'NULL' must be interpreted as null
				if (oneArg.equals("NULL")) oneArg = null;
						
				
				if (oneType.equals("date"))
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setDate(i+1, java.sql.Date.valueOf(oneArg));
				}
				else if (oneType.startsWith("time"))
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setTime(i+1, java.sql.Time.valueOf(oneArg));
				}
				else if (oneType.equals("bit varying(1)") || oneType.equalsIgnoreCase("USER-DEFINED") )
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setObject(i+1, oneArg, java.sql.Types.OTHER);
				}
				else if (oneType.equals("boolean"))
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.BOOLEAN);
					else 
						prest.setBoolean(i+1, oneArg.equals("true")?true:false);
				}
				
				
				else if ( isBigWholeNumberType(oneType) )
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.BIGINT);
					else 
						prest.setLong(i+1, Long.parseLong(oneArg));
				}
				else if ( isWholeNumberType(oneType) )
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.INTEGER);
					else 
						prest.setInt(i+1, Integer.parseInt(oneArg));
				}
				
				
				
				else if ( isRealNumberType(oneType) )
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.DOUBLE);
					else 
						prest.setDouble(i+1, Double.parseDouble(oneArg));
				}
				else if (oneType.endsWith("[]")) // array
				{
					String cleanValue = oneArg.replaceAll("^(\\{)(.+)(\\})$", "$2");					
					if (oneType.equals("_int4[]"))
						prest.setArray(i+1, this.db.createArrayOf("integer", new String[]{cleanValue}));
					else
						prest.setArray(i+1, this.db.createArrayOf("text", new String[]{cleanValue}));
				}
				else
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.VARCHAR);
					else 
						prest.setString(i+1, oneArg);
				}				
			}
			
			
			rs = prest.executeQuery();
		}
		catch (SQLException e)
		{
			throw new RuntimeException("Error while executing query "+query, e);
		}
		
		return rs;
	}
	
	public void sendPreparedUpdate(String query, String[] args, ArgumentTypesObject ato, DbResponseObject dro) 
	{
		
		// if the query args contains null values,
		// the query needs to be rebuilt
		QueryObject qo = rebuildQueryIfArgListContainsNullValues(new QueryObject(query, args, ato));
		// if the query requires 'exact equality', remove regex operator to speed up the query
		qo = rebuildQueryIfArgRequiresStrictEquality(qo);
		query = qo.getQuery();
		args = qo.getArgs();
		ato = qo.getAto();
		
		if (Constants.debug)
		{			
			System.out.println(query);
			System.out.println(Util.join(args, ", "));
		}
		
		SendUserIdentityToDatabaseServer();
		
		PreparedStatement prest;
		
		try
		{
			// Create a Statement object
			prest = this.db.prepareStatement(query);
			
			for (int i=0; i<args.length; i++)
			{
				String oneArg = args[i];				
				String oneType = ato.getType(i);
				// a string containing 'NULL' must be interpreted as null
				if (oneArg.equals("NULL")) oneArg = null;
				
				
				
				if (oneType.equals("date"))
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setDate(i+1, java.sql.Date.valueOf(oneArg));
				}
				else if (oneType.startsWith("time"))
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setTime(i+1, java.sql.Time.valueOf(oneArg));
				}
				else if (oneType.equals("bit varying(1)") || oneType.equalsIgnoreCase("USER-DEFINED") )
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setObject(i+1, oneArg, java.sql.Types.OTHER);
				}
				else if (oneType.equals("boolean"))
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.BOOLEAN);
					else 
						prest.setBoolean(i+1, oneArg.equals("true")?true:false);
				}
				
				else if ( isBigWholeNumberType(oneType) )
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.BIGINT);
					else 
						prest.setLong(i+1, Long.parseLong(oneArg));
				}
				else if ( isWholeNumberType(oneType) )
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.INTEGER);
					else 
						prest.setInt(i+1, Integer.parseInt(oneArg));
				}
				
				else if ( isRealNumberType(oneType) )
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.DOUBLE);
					else 
						prest.setDouble(i+1, Double.parseDouble(oneArg));
				}
				else if (oneType.endsWith("[]")) // array
				{
					String cleanValue = oneArg.replaceAll("^(\\{)(.+)(\\})$", "$2");					
					if (oneType.equals("_int4[]"))
						prest.setArray(i+1, this.db.createArrayOf("integer", new String[]{cleanValue}));
					else
						prest.setArray(i+1, this.db.createArrayOf("text", new String[]{cleanValue}));
				}
				else
				{
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.VARCHAR);
					else 
						prest.setString(i+1, oneArg);
				}
				
				
				if (Constants.debug) {
					String showArg = oneArg!=null && oneArg.length()>40 ? oneArg.substring(0, 40)+"..." : oneArg;
					System.out.println(i+1+" -> "+showArg+" "+oneType);
				}
			}
			
			
			prest.executeUpdate();
			dro.setResponse("OK");
		}
		catch (SQLException e)
		{
			dro.setResponse("Error while executing query "+query);
			throw new RuntimeException("Error while executing query "+query, e);
		}			

	}
	
	
	/**
	 * Somehow prepared statements don't work with " IS ? "
	 * so in this special case, we need to replace the question mark by its value in the query
	 * @param query
	 * @param args
	 */
	private QueryObject rebuildQueryIfArgListContainsNullValues(QueryObject qo){
				
		// what's the query about?
		String query = qo.getQuery();
		String[] args = qo.getArgs();
		ArgumentTypesObject ato = qo.getAto();
		
		// if current query doesn't contain any null value, leave right away
		if (Util.getIndexOf(null, args)<0 && 
				Util.getIndexOf("null", args)<0 &&
				Util.getIndexOf("NULL", args)<0)
			return qo;
		
		// Split the query into its elements.
		// As we are dealing with a prepared statement, the question marks in the
		// query won't be part of text strings, but will only represent such strings,
		// so there is no danger of misinterpreting the questions marks
		String[] querySplit = query.split("\\?");
		ArrayList<String> newArgsList = new ArrayList<String>();
		ArgumentTypesObject newAto = new ArgumentTypesObject();
		
		// rebuild the query without null values in args list
		String rebuiltQuery = "";
		
		for (int i=0; i<querySplit.length; i++)
		{
			rebuiltQuery += querySplit[i];
			
			// if we have reached the last part of the query
			// we won't have any corresponding argument, so break
			if (i+1 == querySplit.length)
				break;
		
			
			// if we have a null value as an argument for the question mark 
			if (args[i] == null || args[i].toLowerCase().equals("null"))
			{
				// we replace the question mark by its value
				// an remove the corresponding argument
				rebuiltQuery += " null ";
			}
			// otherwise
			else
			{
				// we keep the question mark and the corresponding argument
				rebuiltQuery += "?";
				newArgsList.add(args[i]);
				if (ato!=null) newAto.setType(newArgsList.size()-1, ato.getType(i));
			}
		}
		
		if (Constants.debug)
			System.out.println("rebuiltQuery >> "+rebuiltQuery);
		
		// rewrite query, args list, and argument types object				
		return new QueryObject(rebuiltQuery, newArgsList.toArray(new String[newArgsList.size()]), newAto);
	}
	
	
	/**
	 * Change  [~* 'exact:word'] into  [= 'word']
	 * This is convenient because = is much faster than ~* 
	 * @param qo
	 * @return
	 */
	private QueryObject rebuildQueryIfArgRequiresStrictEquality(QueryObject qo){
		
		// what's the query about?
		String query = qo.getQuery();
		String[] args = qo.getArgs();
		ArgumentTypesObject ato = qo.getAto();
		
		// if current query doesn't contain any 'exact equality' regex, leave right away
		boolean found = false;
		for (String oneArg : args)
		{
			if (oneArg.startsWith("exact:")) 
				{
				found = true;
				break;
				}
		}
		if ( !found )
			return qo;
		
		// Split the query into its elements.
		// As we are dealing with a prepared statement, the question marks in the
		// query won't be part of text strings, but will only represent such strings,
		// so there is no danger of misinterpreting the questions marks
		String[] querySplit = query.split("\\?");
		ArrayList<String> newArgsList = new ArrayList<String>();
		ArgumentTypesObject newAto = new ArgumentTypesObject();
		
		// rebuild the query without 'exact equality' regexes
		String rebuiltQuery = "";
		
		for (int i=0; i<querySplit.length; i++)
		{
			rebuiltQuery += querySplit[i];
			
			// if we have reached the last part of the query
			// we won't have any corresponding argument, so break
			if (i+1 == querySplit.length)
				break;
		
			
			// if we have an 'exact equality' as an argument for the question mark 
			if (args[i].startsWith("exact:"))
			{
				// we remove 'exact:'	
				// and change the operator into '='		
						
				rebuiltQuery = rebuiltQuery.trim();
				
				// two possibilities: case sensitive or insensitive
				
				// 1. case sensitive
				//    (exact equality operator)
				if (rebuiltQuery.endsWith("~"))
				{
					// remove 'exact:'
					newArgsList.add( args[i].substring("exact:".length()) );
					// set argument type
					if (ato!=null) newAto.setType(newArgsList.size()-1, ato.getType(i));
					// change regex operator into strict equality
					rebuiltQuery = rebuiltQuery.substring(0, rebuiltQuery.lastIndexOf("~")) + "=";
				}
				
				
				// 2. or case insensitive 
				//    (put everything to lowercase a both sides of equality operator)
				else if (rebuiltQuery.endsWith("~*"))
				{
					// remove 'exact:' and lowercase the argument
					newArgsList.add(args[i].substring("exact:".length()).toLowerCase());
					// set argument type
					// it must be set to 'text' as we will cast the argument to text further on
					if (ato!=null) newAto.setType(newArgsList.size()-1, "text"); 
					
					// remove last regex operator and surround the last column name with 'lower(...)'
					// first: make sure the column name will be surrounded by spaces, since
					//  we will be using spaces to recognize borders
					rebuiltQuery = rebuiltQuery.replaceAll("\\(", "( ").replaceAll("\\)", " )").replaceAll("\\s+", " ");
					
					// remove the regex operator ~* 
					String rebuiltQueryWithoutLastOperator = rebuiltQuery.substring(0, rebuiltQuery.lastIndexOf("~*")).trim();
					// the last column name might be the complex expression 'cast(... as text)'
					// or otherwise just a column name
					String expectedBeforeColumnName = " ";
					if (rebuiltQueryWithoutLastOperator.toLowerCase().endsWith("as text )"))
						expectedBeforeColumnName = " cast(";
					String lastColumnName = 
						rebuiltQueryWithoutLastOperator.substring(rebuiltQueryWithoutLastOperator.toLowerCase().lastIndexOf(expectedBeforeColumnName)+1);					
					rebuiltQuery = 
						rebuiltQueryWithoutLastOperator.substring(0, rebuiltQueryWithoutLastOperator.toLowerCase().lastIndexOf(expectedBeforeColumnName)) + 
					" LOWER(CAST("+lastColumnName+" AS text)) = ";	// cast needed to support custom types columns 			
				}
				// we keep the question mark and the corresponding argument
				rebuiltQuery += "?";
			}
			// otherwise
			else
			{
				// we keep the question mark and the corresponding argument
				rebuiltQuery += "?";
				newArgsList.add(args[i]);
				if (ato!=null) newAto.setType(newArgsList.size()-1, ato.getType(i));
			}
		}
		
		// rewrite query, args list, and argument types object				
		return new QueryObject(rebuiltQuery, newArgsList.toArray(new String[newArgsList.size()]), newAto);
	}
	
	
	
	
	/**
	 * check which kind of data type we have
	 */
	
	// do we have a textual type?
	public static boolean isTextualType(String typeName){
		
		// see: http://www.postgresql.org/docs/9.0/static/datatype-character.html
		return typeName.startsWith("character varying(") ||
			typeName.startsWith("varchar(") ||
			typeName.startsWith("character(") ||
			typeName.startsWith("char(")||
			typeName.equals("text");
	};
	
	
	// do we have a numeric type?
	
	public static boolean isNumericTypeOfSomeKind(String typeName){
		return ( isWholeNumberType(typeName) || isRealNumberType(typeName) || isBigWholeNumberType(typeName) ); 
	}
	
	public static boolean isWholeNumberType(String typeName){
		
		// see: http://www.postgresql.org/docs/9.0/static/datatype-numeric.html
		return typeName.startsWith("integer") ||
			typeName.startsWith("smallint") ||
			typeName.startsWith("decimal") ||		// user-specified precision, exact
			typeName.startsWith("serial") ||
			typeName.startsWith("numeric");
	};
	
	public static boolean isBigWholeNumberType(String typeName){
		
		// see: http://www.postgresql.org/docs/9.0/static/datatype-numeric.html
		return typeName.startsWith("bigint") ||
			typeName.startsWith("bigserial") ;
	};
	
	
	public static boolean isRealNumberType(String typeName){
		
		// see: http://www.postgresql.org/docs/9.0/static/datatype-numeric.html
		return 
			typeName.startsWith("real") ||
			typeName.startsWith("double precision"); 
	};
	

}
