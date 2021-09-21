/**
 * ------------------------------------------------------------------------------------------------------
 *                                            Projects lists
 * ------------------------------------------------------------------------------------------------------
 * 
 * The parameters to be set are:
 * 
 * ------------------------------------------------------------------------------------------------------ 
 * Compulsory:
 * -----------------type------default--------------------------------------------------------------------
 * 
 *  name			{String}	-		Name of the project
 *  config_filename	{String}	-		Name of configuration file, like in <filename>.config.js
 *  description		{String}	-		Short description of the project
 * 
 * ------------------------------------------------------------------------------------------------------
 * Optional:
 * -----------------type------default--------------------------------------------------------------------
 * 
 *  message			{String}	-		Message to show upon opening of the project
 *  message_callback{Function}	-		Callback function, called after the message has been shown and
 *  									the user has clicked 'OK'.
 *  private			{Boolean} [false]	Show the message only in home environment. This is
 *  									to prevent some private message to be shown in an outside world
 *  									copy of an in-house project.
 *  production 		{Boolean} [false]	If true, show the project has production status. 
 *  									If false, show the project has development status. 
 *  closed 			{Boolean} [false]	If true, show the project is closed. In that case, the project 
 *  									will be removed from the production and development lists
 *  									and taken to the separate 'closed project' list.
 *  goody 			{Boolean} [false]	If true, put the project in a separate 'goodies and 
 *  									tools' list.
 *  redirect		{String}	-		If we want to force the users to access the project at some
 *                                      other Lex'it instance, we can give the URL of that instance
 *                                      as a value of 'redirect'.
 *  
 *  ------------------------------------------------------------------------------------------------------
 */

var aProjectList = [
	{
		name: "Some beautiful project name",
		config_filename: "my_configfile",
		description: "This project is about beautiful things"		
	},
	{
		name: "Another wonderful project name",
		config_filename: "my_other_configfile",
		description: "This project is wonderful too"		
	},	 
	 
	{		 
		comment: "========== DON'T MODIFY ANYTHING BELOW THIS LINE ================================================",
		
		name: "Login overzicht",
			config_filename: "spy",
			description: "Overzicht actieve accounts (wordt om de 2 sec bijgewerkt)",
			goody: true
	},
	{
		name: "Reset user rights",
		config_filename: "reset_user_rights",
		description: "Toegangsrechten resetten (klik alleen als het nodig is, geen speelgoed!)",
		goody: true
	}	 
];
