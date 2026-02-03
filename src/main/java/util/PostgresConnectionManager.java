package util;



import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;

import resources.AppLifecycleListener;
import resources.Constants;
import resources.ContextObject;
import resources.DbResponseObject;



public class PostgresConnectionManager {
	
	/**
	 * Defaults
	 */
	private ContextObject co;							// the context object, allowing us to get the active user name etc
	private boolean sendUserInfoToDb = false;			// if true, the tomcat username will be sent to the database server
	private int maxPoolSize = Constants.maxPoolSize;	// the maximum number of connections in the pool for this project
	
	
	// keep in mind just in case 
	//
	// https://stackoverflow.com/questions/2757549/org-postgresql-util-psqlexception-fatal-sorry-too-many-clients-already
	

	public PostgresConnectionManager(ContextObject co, boolean sendTomcatUserInfoToDb, int maxPoolSize) {	
		
		// get the tomcat server context
		// allowing us to get the active tomcat user name etc
		this.co = co;
		this.sendUserInfoToDb = sendTomcatUserInfoToDb;
		this.maxPoolSize = maxPoolSize;
	}	
	
	
	public ContextObject getContextObject() {
		return this.co;
	}
	public void setContextObject(ContextObject co) {
		this.co = co;
	}
	
	

	/**
	 * Create a datasource (holding a connection to a database) in the connection pool
	 * 
	 * @param host
	 * @param port
	 * @param db
	 * @param user
	 * @param password
	 */
	public void createDataSourceInPool(String host, String port, String db, String user, String password) {
		
		// if the datasource already exists, we don't need to create it again
		if (AppLifecycleListener.getDataSource(co.getDbName()) != null) {
			if (Constants.debug)
				System.out.println("Datasource for project " + co.getDbName() + " already exists, so not creating it again.");
			return;
		}
		
		// if project config doesn't specify any port, choose the Postgres default port 
		port = (port == null || port.isEmpty()) ? "5432" : port; 
				
		// location		
		String location = "jdbc:postgresql://" + host + ":" + port + "/" + db + "?charSet=UTF8";
		
		if (Constants.debug) System.out.println("PostgreSQL: Try to connect to "+location+" as "+user+"/"+password);
		
        // checks if the class exists (implicitly if the library is there)
        try {
        	Class.forName("org.postgresql.Driver");
        } 
        catch (ClassNotFoundException e) {       
        	if (Constants.debug) e.printStackTrace();
        	throw new RuntimeException("PostgreSQL JDBC Driver not found. Include it in your library path!", e);
        }

        try {        
        	
        	HikariConfig config = new HikariConfig();
            config.setJdbcUrl(location);
            config.setUsername(user);
            config.setPassword(password);
            config.setAutoCommit(true);
            
            // the maximum number of connections in the pool has a default value declared in the Constants class
            // but it can be overridden by the project database config            
            config.setMaximumPoolSize(this.maxPoolSize);
            
            Util.debug("Creating datasource for "+co.getDbName()+" with max pool size "+this.maxPoolSize);
            
            config.setIdleTimeout(Constants.idleTimeoutMs); 
            config.setMaxLifetime(Constants.maxLifetimeMs); 
            config.setConnectionTimeout(Constants.connectionTimeoutMs);
            
            // create the datasource with this config
            
            HikariDataSource ds = new HikariDataSource(config);
            
            // register the datasource, so as to make sure it is shut down 
            // when the service is (so as to prevent memory leaks)
            
            String projectName = co.getDbName();
            AppLifecycleListener.registerDataSource(projectName, ds);
            
            // remember the credentials for this project, for respawn!
            AppLifecycleListener.project2Credentials.put(projectName, new String[] {host, port, db, user, password});

        } 
        catch (Exception e) {
        	//
        	// BEWARE: don't change this message, as the client checks of it
        	// ======
        	throw new RuntimeException("Connection failed! Check the project database configuration.", e);
        }
		
	}
	
	/**
	 * Test if a connection to some database CAN be established: 
	 * otherwise that probably means that the database does not exist, or the credentials are wrong, or so.
	 * 
	 * @param host
	 * @param port
	 * @param db
	 * @param user
	 * @param password
	 */
	public void testConnectionTo(String host, String port, String db, String user, String password) {
	
		// if project config doesn't specify any port, choose the Postgres default port 
		port = (port == null || port.isEmpty()) ? "5432" : port; 
				
		// location		
		String location = "jdbc:postgresql://"+host+":"+port+"/"+db;
		
        // checks if the class exists (implicitly if the library is there)
        try {
        	Class.forName("org.postgresql.Driver");
        } 
        catch (ClassNotFoundException e) {        
        	throw new RuntimeException("PostgreSQL JDBC Driver not found. Include it in your library path!", e);
        }
        
        Properties props = new Properties();
    	props.setProperty("user", user);
    	props.setProperty("password", password);
    	props.setProperty("charSet", "UTF8");


        try (Connection conn = DriverManager.getConnection(location, props)) {
        	// Do nothing, the connection is just tested here, no more...
        	// If the connection can't be established, an exception will be thrown!
        } 
        catch (Exception e) {
        	//
        	// BEWARE: don't change this message, as the client checks for it
        	// ======
        	throw new RuntimeException("Connection failed! Check the project database configuration.", e);
        }	
	}
	
	
	/**
	 * Get a connection from the pool
	 * 
	 * @return Connection
	 */
	private Connection getConnectionFromPool() {
		
		Connection conn = null;
		
		if (Constants.debug)
			System.out.println("get Lex'it connection for "+this.co.getDbName());
		
		try {
        	
        	// get the datasource for the project
        	HikariDataSource ds = AppLifecycleListener.getDataSource( co.getDbName() );
        	
        	// if the datasource does not exist anymore because it was closed (e.g. due to inactivity)
        	// respawn!
        	if (ds == null) {
        		String[] credential = AppLifecycleListener.project2Credentials.get(co.getDbName());
        		createDataSourceInPool(credential[0], credential[1], credential[2], credential[3], credential[4]);
        		ds = AppLifecycleListener.getDataSource( co.getDbName() );
        	}
        	
        	if (Constants.debug) {
	        	HikariPoolMXBean poolMXBean = ds.getHikariPoolMXBean();
	        	System.out.println("Active connections: " + poolMXBean.getActiveConnections());
	        	System.out.println("Idle connections: " + poolMXBean.getIdleConnections());
	        	System.out.println("Total connections: " + poolMXBean.getTotalConnections());
	        	System.out.println("Threads awaiting connection: " + poolMXBean.getThreadsAwaitingConnection());
	        	System.out.println("-----------------------");
        	}
        	
        	// get the connection from the pool
        	conn = ds.getConnection();
        	
        	// register the user identity etc. in this session
        	sendUserIdentityToDatabaseServer(conn);        	

		} 
        catch (SQLException e) {
        	if (Constants.debug) e.printStackTrace();
		}
        
		// return a connection to the specified project
        return conn;
    }

	
	
	/**
	 * Send the username and session id to the database server
	 * (to be stored in a temporary table in the session) 
	 * 
	 * @param Connection
	 */
	private void sendUserIdentityToDatabaseServer(Connection conn){
		
		// if the configuration tells us to send the username
		// to the database server
		// AND
		// it hasn't been done yet, then:
		//
		// create a temporary table in which the username will be put,
		// and call this table 'active_user';
		// this temporary table is only visible within the user's session,
		// so multiple active users will have their name stored in as many 
		// temporary tables with the same name, but invisible to each other, 
		// so no name conflict will occur.
		//
		// The active username stored in the 'active_user' temporary table 
		// can be read by trigger functions etc, by reading the 'username' field
		// from this 'active_user' temporary table.		
		
		
		if ( this.sendUserInfoToDb && this.co != null ) {	
				
			Statement stmt = null;
			String query1 = "DROP TABLE IF EXISTS active_user;";
			String query2 = "CREATE TEMPORARY TABLE active_user AS "+
				"SELECT '"+ this.co.getUsername() +"'::text AS username, '"+ this.co.getSessionId() +"'::text AS session_id, '"+this.co.getActiveTabId() + "'::text AS active_tab_id;";
			
			
			try {
				// Create a Statement object
				stmt = conn.createStatement();
				stmt.executeUpdate(query1);
				stmt.executeUpdate(query2);
				
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}								
		}	
		
	}
	
	
	/**
	 * Set the search_path to the specified schema name in the current connection.
	 * 
	 * @param conn
	 * @param schemaName
	 */
	private void setSchema(Connection conn, String schemaName){
		
		String query = "SET search_path TO "+schemaName+";";
		Statement stmt = null;
		
		if (Constants.debug)
			System.out.println(query);
		
		try {
			// Create a Statement object
			stmt = conn.createStatement();
			stmt.executeUpdate(query);
		}
		catch (Exception e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing query "+query, e);
		}
	}
	

	
	/**
	 * Send a query with a time limit
	 * @param query
	 * @param timeLimitInMilliseconds
	 * @return ResultSetSnapshot
	 */
	public ResultSetSnapshot sendQuery(String schema, String query, int timeLimitInMilliseconds) {
		
		if (Constants.debug) System.out.println(query);
		long timeBeforeQuery = new Date().getTime();
		
		
		
		// Get the results
		ResultSet rs = null;
		ResultSetSnapshot rsCopy = null;
		Statement stmt = null;
		
		try (Connection conn = getConnectionFromPool()) {
			
			// we need to disable auto-commit mode to allow setting the timeout for the transaction
			conn.setAutoCommit(false);
			
			// set the schema for this connection, so that the query can be executed in the right context
			setSchema(conn, schema);
			
			
			try {
				
				// Create a Statement object
				stmt = conn.createStatement();
			
				// if required, set a timeout 
				
				if (timeLimitInMilliseconds > 0) {
					
					// set a LOCAL timeout in milliseconds if required
					// (beware: setting this must happen in a separate query: we can't bundle this
					//  with the main query, or it won't have any effect!)
					
					String SetTimeOutQuery = "SET LOCAL statement_timeout TO " + timeLimitInMilliseconds + ";";
					stmt.executeUpdate(SetTimeOutQuery);
				}
				
				// the timeout is set, now execute the query
				rs = stmt.executeQuery(query);		
				rsCopy = ResultSetSnapshot.copy(rs);
				
				// commit the transaction
				conn.commit();
			
			}
			catch (SQLException e) {
				
				conn.rollback();
				
				// if the error is a timeout error
				if (e.getMessage().toLowerCase().contains("timeout")) {
					
					// show a message but throw no exception
					// so this function will return null					
					if (Constants.debug) {
						long timeAfterQuery = new Date().getTime();
						System.out.println("## TIMEOUT ("+(timeAfterQuery - timeBeforeQuery)+" ms) while executing query "+query);
					}
						
				}				
				else if (Constants.debug)
					e.printStackTrace();
				throw new RuntimeException("Error while executing query " + query, e);
			}
			catch (Exception e) {
				
				conn.rollback();
				
				if (Constants.debug)
					e.printStackTrace();
				throw new RuntimeException("Error while executing query " + query, e);
			}
			finally {
				// back to auto-commit mode
			    conn.setAutoCommit(true);
			}
			
			
			// the following is not needed anymore because 
			// of the use of SET LOCAL statement_timeout
			// which ensures that the timeout only applies 
			// to the current transaction
			
//			// block #2
//			
//			try {
//				// finally, reset the original timeout settings
//				
//				if (timeLimitInMilliseconds > 0) {
//					
//					String ResetTimeOutQuery = "RESET statement_timeout;";		
//					
//					// Create a new Statement object
//					stmt = conn.createStatement();
//					// reset timeout
//					stmt.executeUpdate(ResetTimeOutQuery);
//				}
//			}
//			catch (SQLException e) {
//				if (Constants.debug)
//					e.printStackTrace();
//				throw new RuntimeException("Error while executing query " + query, e);
//			} catch (Exception e) {
//				if (Constants.debug)
//					e.printStackTrace();
//				throw new RuntimeException("Error while executing query " + query, e);
//			}
			
			
		}
		catch (SQLException e) {		
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing plain query (with time limit) "+query, e);
		
		} 
		catch (Exception e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing plain query (with time limit) "+query, e);
		}
		
		
		return rsCopy;
	}

	/**
	 * Send a plain update query (no prepared statement)
	 * 
	 * @param query
	 */
	public void sendUpdate(String schema, String query) {
		
		if (Constants.debug) System.out.println(query);
		
		Statement stmt = null;
		
		try (Connection conn = getConnectionFromPool()) {
			
			// set the schema for this connection, so that the query can be executed in the right context)
			setSchema(conn, schema); 			
			
			
			// Create a Statement object
			stmt = conn.createStatement();
			stmt.executeUpdate(query);
		}
		catch (SQLException e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing plain update "+query, e);
		} 
		catch (Exception e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing plain update "+query, e);
		}
	}
	
	
	/**
	 * Send a prepared query
	 * @param schema
	 * @param query
	 * @param args
	 * @return ResultSetSnapshot
	 */
	public ResultSetSnapshot sendPreparedQuery(String schema, String query, String[] args) {
		
		// if the query args contains null values,
		// the query needs to be rebuilt
		QueryObject qo = rebuildQueryIfArgListContainsNullValues(new QueryObject(query, args, null));
		// if the query requires 'exact equality', remove regex operator to speed up the query
		qo = rebuildQueryIfArgRequiresStrictEquality(qo);
		query = qo.getQuery();
		args = qo.getArgs();
		
		if (Constants.debug) {
			System.out.println(query);
			System.out.println(Util.join(args, ", "));
		}
		
		
		
		// Get the results
		ResultSet rs = null;
		ResultSetSnapshot rsCopy = null;
		PreparedStatement prest = null;
		
		try (Connection conn = getConnectionFromPool()) {
			
			// set the schema for this connection, so that the query can be executed in the right context)
			setSchema(conn, schema); 			
			
			
			// prepare statement
			prest = conn.prepareStatement(query,
					ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

			for (int i=0; i<args.length; i++) {
				String oneArg = args[i];				
				// a string containing 'NULL' must be interpreted as null
				if (oneArg.equals("NULL")) oneArg = null;
				
				if ( Util.isInteger(oneArg))
					prest.setInt(i+1, Integer.parseInt( getRidOfDecimal(oneArg) )); // rounding in case of decimal numbers
				else
					prest.setString(i+1,oneArg);				
			}
			
						
			rs = prest.executeQuery();
			rsCopy = ResultSetSnapshot.copy(rs);
		}
		catch (SQLException e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing prepared query "+query, e);
		} 
		catch (Exception e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing prepared query "+query, e);
		}
		
		return rsCopy;
	}
	
	/**
	 * Send a prepared query with a time limit
	 * @param schema
	 * @param query
	 * @param args
	 * @param ato
	 * @param timeLimitInMilliseconds
	 * @return ResultSetSnapshot
	 */
	public ResultSetSnapshot sendPreparedQuery(String schema, String query, String[] args, ArgumentTypesObject ato, int timeLimitInMilliseconds) {
		
		// if the query args contains null values,
		// the query needs to be rebuilt
		QueryObject qo = rebuildQueryIfArgListContainsNullValues(new QueryObject(query, args, ato));
		// if the query requires 'exact equality', remove regex operator to speed up the query
		qo = rebuildQueryIfArgRequiresStrictEquality(qo);
		query = qo.getQuery();
		args = qo.getArgs();
		ato = qo.getAto();
		
		if (Constants.debug) {
			System.out.println(query);
			System.out.println(Util.join(args, ", "));
		}
		
		
		// Get the results
		ResultSet rs = null;
		ResultSetSnapshot rsCopy = null;
		Statement stmt = null;
		PreparedStatement prest = null;
		
		try (Connection conn = getConnectionFromPool()) {
			
			// we need to disable auto-commit mode to allow setting the timeout for the transaction
			conn.setAutoCommit(false);
			
			// set the schema for this connection, so that the query can be executed in the right context
			setSchema(conn, schema); 			
			
			
			
			try {
				// if required, set a timeout 
				
				if (timeLimitInMilliseconds > 0) {
					// Create a Statement object
					stmt = conn.createStatement();
					
					// set a LOCAL timeout in milliseconds
					// (beware: setting this must happen in a separate query: we can't bundle this
					//  with the main query, or it won't have any effect!)
					String SetTimeOutQuery = "SET LOCAL statement_timeout TO " + timeLimitInMilliseconds + ";";
					stmt.executeUpdate(SetTimeOutQuery);				
				}
				
				
				// prepare statement
				prest = conn.prepareStatement(query,
						ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
	
				for (int i=0; i<args.length; i++) {
					
					String oneArg = args[i];
					String oneType = ato.getType(i);
					
					// a string containing 'NULL' must be interpreted as null
					if (oneArg.equals("NULL")) oneArg = null;
					
					if (oneType.equals("date")) {
						if (oneArg == null) 
							prest.setNull(i+1, java.sql.Types.OTHER);
						else 
							prest.setDate(i+1, java.sql.Date.valueOf(oneArg));
					}
					else if (oneType.startsWith("timestamp")) {
						if (oneArg == null) {
					        prest.setNull(i + 1, java.sql.Types.TIMESTAMP);
					    }
						else {				
							// depending on the value, process as a timestamp or as a date
							boolean processDateInstead = !oneArg.contains(" ");
							if (processDateInstead == true) {
								prest.setDate(i + 1, java.sql.Date.valueOf(oneArg.split(" ")[0]));
							}
							else {
								prest.setTimestamp(i + 1, java.sql.Timestamp.valueOf(oneArg));
							}							
						}						
					}
					else if (oneType.equals("time")) {
						if (oneArg == null) 
							prest.setNull(i+1, java.sql.Types.OTHER);
						else 
							prest.setTime(i+1, java.sql.Time.valueOf(oneArg));
					}
					else if (oneType.equals("bit varying(1)") || oneType.equalsIgnoreCase("USER-DEFINED") ) {
						if (oneArg == null) 
							prest.setNull(i+1, java.sql.Types.OTHER);
						else 
							prest.setObject(i+1, oneArg, java.sql.Types.OTHER);
					}
					else if (oneType.equals("boolean")) {
						if (oneArg == null) 
							prest.setNull(i+1, java.sql.Types.BOOLEAN);
						else 
							prest.setBoolean(i+1, oneArg.equals("true")?true:false);
					}
					
					else if (oneType.equalsIgnoreCase("int4range") || oneType.equalsIgnoreCase("int8range") || 
							 oneType.equalsIgnoreCase("numrange") ||
					         oneType.equalsIgnoreCase("daterange") || oneType.equalsIgnoreCase("tsrange") ||
					         oneType.equalsIgnoreCase("tstzrange")) {
					    if (oneArg == null) {
					        prest.setNull(i + 1, java.sql.Types.OTHER);
					    } else {
					        prest.setObject(i + 1, oneArg, java.sql.Types.OTHER); // Pass as literal string
					    }
					}
					
					else if (oneType.endsWith("[]")) { // array
						
						String cleanValue = oneArg.replaceAll("^(\\{)(.+)(\\})$", "$2");
						String nonArrayType = oneType.replaceAll("^_", "").replaceAll("\\[\\]$", "");
						boolean valueIsList = cleanValue.contains(",");
						if (isWholeNumberType(oneType) )
							prest.setArray(i+1, conn.createArrayOf("integer", valueIsList ? Util.splitString(cleanValue, ",") : new String[]{cleanValue}));
						else if (isBigWholeNumberType(oneType) )
							prest.setArray(i+1, conn.createArrayOf("bigint", valueIsList ? Util.splitString(cleanValue, ",") : new String[]{cleanValue}));
						else
							prest.setArray(i+1, conn.createArrayOf(nonArrayType, valueIsList ? Util.splitString(cleanValue, ",") : new String[]{cleanValue}));
					}
					
					
					else if ( isBigWholeNumberType(oneType) ) {
						if (oneArg == null) 
							prest.setNull(i+1, java.sql.Types.BIGINT);
						else 
							prest.setLong(i+1, Long.parseLong( getRidOfDecimal(oneArg) )); // rounding in case of decimal numbers
					}
					else if ( isWholeNumberType(oneType) ) {
						if (oneArg == null) 
							prest.setNull(i+1, java.sql.Types.INTEGER);
						else 
							prest.setInt(i+1, Integer.parseInt( getRidOfDecimal(oneArg) )); // rounding in case of decimal numbers
					}
					
					
					
					else if ( isRealNumberType(oneType) ) {
						if (oneArg == null) 
							prest.setNull(i+1, java.sql.Types.DOUBLE);
						else 
							prest.setDouble(i+1, Double.parseDouble(oneArg)); 
					}
					
					else if (oneType.equals("jsonb")) {	
						if (oneArg == null) 
							prest.setNull(i+1, java.sql.Types.VARCHAR);
						else {
							// backwards compatibility: if the argument isn't starting with '{' nor '[{', we must add '[{...}]' around the argument
							if (!oneArg.startsWith("{") && !oneArg.startsWith("[{")) {
								oneArg = "[{"+oneArg+"}]";
							}
							// the right way to pass jsonb arguments
							prest.setObject(i+1, oneArg, java.sql.Types.OTHER);
						}
					}
					else {
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
				
				
				rs = prest.executeQuery();
				rsCopy = ResultSetSnapshot.copy(rs);
				
				// commit the transaction
				conn.commit();
				
			}
			catch (SQLException e) {
				
				conn.rollback();
				
				if (Constants.debug)
					e.printStackTrace();
				throw new RuntimeException("Error while executing query " + query, e);
			}
			catch (Exception e) {
				
				conn.rollback();
				
				if (Constants.debug)
					e.printStackTrace();
				throw new RuntimeException("Error while executing query " + query, e);
			}
			finally {
				// back to auto-commit mode
			    conn.setAutoCommit(true);
			}
			
			
			// the following is not needed anymore because 
			// of the use of SET LOCAL statement_timeout
			// which ensures that the timeout only applies 
			// to the current transaction
			
//			// block #2
//			
//			try {
//				// reset the original timeout settings
//				
//				if (timeLimitInMilliseconds > 0) {
//					
//					String ResetTimeOutQuery = "RESET statement_timeout;";	
//					
//					// Create a new Statement object
//					stmt = conn.createStatement();
//					// reset timeout
//					stmt.executeUpdate(ResetTimeOutQuery);
//				}
//				
//			}
//			catch (SQLException e) {
//				if (Constants.debug)
//					e.printStackTrace();
//				throw new RuntimeException("Error while executing query " + query, e);
//			} catch (Exception e) {
//				if (Constants.debug)
//					e.printStackTrace();
//				throw new RuntimeException("Error while executing query " + query, e);
//			}
		}
		catch (SQLException e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing prepared query (with time limit) "+query, e);
		} 
		catch (Exception e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing prepared query (with time limit) "+query, e);
		}
		
		return rsCopy;
	}
	
	/**
	 * Send a prepared update query
	 * @param schema
	 * @param query
	 * @param args
	 * @param ato
	 * @param dro
	 */
	public void sendPreparedUpdate(String schema, String query, String[] args, ArgumentTypesObject ato, DbResponseObject dro) {
		
		// if the query args contains null values,
		// the query needs to be rebuilt
		QueryObject qo = rebuildQueryIfArgListContainsNullValues(new QueryObject(query, args, ato));
		// if the query requires 'exact equality', remove regex operator to speed up the query
		qo = rebuildQueryIfArgRequiresStrictEquality(qo);
		query = qo.getQuery();
		args = qo.getArgs();
		ato = qo.getAto();
		
		if (Constants.debug) {			
			System.out.println(query);
			System.out.println(Util.join(args, ", "));
		}
		
		PreparedStatement prest;		

		try (Connection conn = getConnectionFromPool()) {
			
			// set the schema for this connection, so that the query can be executed in the right context)
			setSchema(conn, schema); 
			
			
			// Create a Statement object
			prest = conn.prepareStatement(query);
			
			for (int i=0; i<args.length; i++) {
				String oneArg = args[i];				
				String oneType = ato.getType(i);
				// a string containing 'NULL' must be interpreted as null
				if (oneArg.equals("NULL")) oneArg = null;
				
				
				
				if (oneType.equals("date")) {
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setDate(i+1, java.sql.Date.valueOf(oneArg));
				}
				else if (oneType.startsWith("timestamp")) {
					if (oneArg == null) {
				        prest.setNull(i + 1, java.sql.Types.TIMESTAMP);
				    }
					else {				
						// depending on the value, process as a timestamp or as a date
						boolean processDateInstead = !oneArg.contains(" ");
						if (processDateInstead == true) {
							prest.setDate(i + 1, java.sql.Date.valueOf(oneArg.split(" ")[0]));
						}
						else {
							prest.setTimestamp(i + 1, java.sql.Timestamp.valueOf(oneArg));
						}							
					}	
				}
				else if (oneType.equals("time")) {
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setTime(i+1, java.sql.Time.valueOf(oneArg));
				}
				else if (oneType.equals("bit varying(1)") || oneType.equalsIgnoreCase("USER-DEFINED") ) {
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.OTHER);
					else 
						prest.setObject(i+1, oneArg, java.sql.Types.OTHER);
				}
				else if (oneType.equals("boolean")) {
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.BOOLEAN);
					else 
						prest.setBoolean(i+1, oneArg.equals("true")?true:false);
				}
				
				else if (oneType.equalsIgnoreCase("int4range") || oneType.equalsIgnoreCase("int8range") || 
						 oneType.equalsIgnoreCase("numrange") ||
				         oneType.equalsIgnoreCase("daterange") || oneType.equalsIgnoreCase("tsrange") ||
				         oneType.equalsIgnoreCase("tstzrange")) {
				    if (oneArg == null) {
				        prest.setNull(i + 1, java.sql.Types.OTHER);
				    } else {
				        prest.setObject(i + 1, oneArg, java.sql.Types.OTHER); // Pass as literal string
				    }
				}
				
				else if (oneType.endsWith("[]")) { // array
					
					String cleanValue = oneArg.replaceAll("^(\\{)(.+)(\\})$", "$2");
					String nonArrayType = oneType.replaceAll("^_", "").replaceAll("\\[\\]$", "");
					boolean valueIsList = cleanValue.contains(",");
					if (isWholeNumberType(oneType) )
						prest.setArray(i+1, conn.createArrayOf("integer", valueIsList ? Util.splitString(cleanValue, ",") : new String[]{cleanValue}));
					else if (isBigWholeNumberType(oneType) )
						prest.setArray(i+1, conn.createArrayOf("bigint", valueIsList ? Util.splitString(cleanValue, ",") : new String[]{cleanValue}));
					else
						prest.setArray(i+1, conn.createArrayOf(nonArrayType, valueIsList ? Util.splitString(cleanValue, ",") : new String[]{cleanValue}));
				}
				
				else if ( isBigWholeNumberType(oneType) ) {
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.BIGINT);
					else 
						prest.setLong(i+1, Long.parseLong( getRidOfDecimal(oneArg) )); // rounding in case of decimal numbers
				}
				else if ( isWholeNumberType(oneType) ) {
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.INTEGER);
					else 
						prest.setInt(i+1, Integer.parseInt( getRidOfDecimal(oneArg) )); // rounding in case of decimal numbers
				}
				
				else if ( isRealNumberType(oneType) ) {
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.DOUBLE);
					else 
						prest.setDouble(i+1, Double.parseDouble(oneArg));
				}
				
				else if (oneType.equals("jsonb")) {	
					if (oneArg == null) 
						prest.setNull(i+1, java.sql.Types.VARCHAR);
					else {
						// backwards compatibility: if the argument isn't starting with '{' nor '[{', we must add '[{...}]' around the argument
						if (!oneArg.startsWith("{") && !oneArg.startsWith("[{")) {
							oneArg = "[{"+oneArg+"}]";
						}
						// the right way to pass jsonb arguments
						prest.setObject(i+1, oneArg, java.sql.Types.OTHER);
					}
				}
				else {
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
			if (dro != null) dro.setResponse("OK");
		}
		catch (SQLException e) {
			if (dro != null) dro.setResponse("Error while executing update "+query);
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing prepared update "+query, e);
		} 
		catch (Exception e) {
			if (Constants.debug) e.printStackTrace();
			throw new RuntimeException("Error while executing prepared update "+query, e);
		}

	}
	
	
	/**
	 * Rewrite the query if its args list contains null values:
	 * Somehow prepared statements don't work with " IS ? ", with '?' standing for a NULL value.  
	 * So in this special case, we need to replace the question mark by its value in the query
	 * @param QueryObject
	 * @return QueryObject
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
		
		for (int i=0; i<querySplit.length; i++) {
			
			rebuiltQuery += querySplit[i];
			
			// if we have reached the last part of the query
			// we won't have any corresponding argument, so break
			if (i+1 == querySplit.length)
				break;
		
			
			// if we have a null value as an argument for the question mark 
			if (args[i] == null || args[i].toLowerCase().equals("null")) {
				// we replace the question mark by its value
				// an remove the corresponding argument
				rebuiltQuery += " null ";
			}
			// otherwise
			else {
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
	 * Rewrite a query if it contains an argument of the form 'exact:word':
	 * this changes  [~* 'exact:word'] into  [= 'word']
	 * which is convenient because '=' is much faster than '~*' 
	 * @param QueryObject
	 * @return QueryObject
	 */
	private QueryObject rebuildQueryIfArgRequiresStrictEquality(QueryObject qo){
		
		// what's the query about?
		String query = qo.getQuery();
		String[] args = qo.getArgs();
		ArgumentTypesObject ato = qo.getAto();
		
		// if current query doesn't contain any 'exact equality' regex, leave right away
		boolean found = false;
		for (String oneArg : args) {
			if (oneArg.startsWith("exact:"))  {
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
		
		for (int i=0; i<querySplit.length; i++) {
			rebuiltQuery += querySplit[i];
			
			// if we have reached the last part of the query
			// we won't have any corresponding argument, so break
			if (i+1 == querySplit.length)
				break;
		
			
			// if we have an 'exact equality' as an argument for the question mark 
			if (args[i].startsWith("exact:")) {
				// we remove 'exact:'	
				// and change the operator into '='		
						
				rebuiltQuery = rebuiltQuery.trim();
				
				// two possibilities: case sensitive or insensitive
				
				// 1. case sensitive
				//    (exact equality operator)
				if (rebuiltQuery.replaceAll("\\($", "").trim().endsWith("~")) {
					
					// keep possible opening parenthesis, like in  ~ ( ? COLLATE "nl_NL.utf8" )
					String suffix = rebuiltQuery.endsWith("(") ? "(" : ""; 
					
					// remove 'exact:'
					newArgsList.add( args[i].substring("exact:".length()) );
					
					// set argument type
					if (ato!=null) newAto.setType(newArgsList.size()-1, ato.getType(i));
					
					// change regex operator into strict equality
					rebuiltQuery = rebuiltQuery.substring(0, rebuiltQuery.lastIndexOf("~")) + "=" + suffix;
				}
				
				
				// 2. or case insensitive 
				//    (put everything to lowercase a both sides of equality operator)
				else if (rebuiltQuery.replaceAll("\\($", "").trim().endsWith("~*")) {
					
					// keep possible opening parenthesis, like in  ~ ( ? COLLATE "nl_NL.utf8" )
					String suffix = rebuiltQuery.endsWith("(") ? "(" : "";
					
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
					" LOWER(CAST("+lastColumnName+" AS text)) = " + suffix;	// cast needed to support custom types columns 			
				}
				// we keep the question mark and the corresponding argument
				rebuiltQuery += "?";
			}
			// otherwise
			else {
				// we keep the question mark and the corresponding argument
				rebuiltQuery += "?";
				newArgsList.add(args[i]);
				if (ato!=null) newAto.setType(newArgsList.size()-1, ato.getType(i));
			}
		}
		
		// rewrite query, args list, and argument types object				
		QueryObject newQo = new QueryObject(rebuiltQuery, newArgsList.toArray(new String[newArgsList.size()]), newAto);

		return newQo;
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
		return typeName.startsWith("character varying(") ||
			typeName.startsWith("varchar(") ||
			typeName.startsWith("character(") ||
			typeName.startsWith("char(")||
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
	public String getRidOfDecimal(String number){
		if (number.indexOf(".")<0) return number;
        return number.replaceAll("\\.[0-9]+$", "");
    }

	
}
