package util;

/*
 * This object is meant to store a query (designed to be used within a prepared statement, containing '?')
 * with its arguments and argument types
 */
public class QueryObject {
	
	String query = "";
	String[] args = null; 
	ArgumentTypesObject ato = null;
	
	public QueryObject(String query, String[] args, ArgumentTypesObject ato)
	{
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
	

}
