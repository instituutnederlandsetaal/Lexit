package database;

/**
 * This object is meant to store a query (designed to be used within a prepared statement, containing '?' placeholders)
 * with its arguments and argument types
 * 
 * This object is used AT ONE OF THE FINAL STEPS of query building (inside sendPrepareQuery() in PostgresConnectionManager.java)
 * just before the query is executed.
 */
public class QueryObject {
	
	String query = "";
	String[] args = null; 
	ArgumentTypesObject ato = null;
	
	public QueryObject(String query, String[] args, ArgumentTypesObject ato) {
		this.query = query;
		this.args = args;
		this.ato = ato;
	}
	
	public String getQuery() {
		return query;
	}
	public void setQuery(String query) {
		this.query = query;
	}
	public String[] getArgs() {
		return args;
	}
	public void setArgs(String[] args) {
		this.args = args;
	}
	public ArgumentTypesObject getAto() {
		return ato;
	}
	public void setAto(ArgumentTypesObject ato) {
		this.ato = ato;
	}
	
	/**
	 * Prints the query, args and arg types to the console (for debug purposes)
     */
	public void print() {
		System.out.println("Query: " + query);
		System.out.print("Args: ");
		for (int i = 0; i<args.length; i++) {
			String arg = args[i];
			String type = ato.getType(i);
			System.out.print(i + ": " + arg + " ("+ type +")");
		}		
		System.out.println();
	}
	

}
