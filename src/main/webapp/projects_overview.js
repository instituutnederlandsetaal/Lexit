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

var aProjectList =
	[
	{
		name: "vmnw toys",
		config_filename: "vmnw",
		description: "Clitics herordenen"
		
	},	 
	 {
		name: "Gigant Molex productie 2016",
		config_filename: "gig_pro",
		description: "Gigant Modern lexicon (versie 2016)",
		production: true
	},
		
	{
		name: "Gigant HiLex",
		config_filename: "gigant_hilex",
		description: "Gigant Historisch lexicon",
		production: true
	},
	
	{
		name: "Bob's database",
		config_filename: "bob_dev",
		description: "Kranten licenties en producten"
	},
	
	{
		name: "Marijke spelling",
		config_filename: "spellingklus_marijke",
		description: "Marijke spelling",
		production: true
	},
		
	
		 
	{
			name: "Celexieklus",
			config_filename: "celexieklus_dev",
			description: "Morfologieklus",
			message: "LET OP: Dit is een testversie"
	 },
	 
	 {
		name: "Gigant MoLex (OUDE development)",
		config_filename: "gigant_molex_dev",
		description: "Gigant Modern lexicon, voor test",
		message: "LET OP: Dit is een testversie"
	},
	{
		//name: "Gigant MoLex (NIEUWE development)",
		config_filename: "gig_pro_dev",
		description: "Gigant Modern lexicon in nieuwe database structuur, voor test",
		message: "LET OP: Dit is een testversie"
	},
		
	{
		name: "Gigant HiLex",
		config_filename: "gigant_hilex_dev",
		description: "Gigant Historisch lexicon, voor test",
		message: "LET OP: Dit is een testversie"
	},
	
	{
		name: "Oude groene boekje",
		config_filename: "gb2005",
		description: "Oude groene boekje 2005",
		closed: true
	},
	
	{
		name: "Hulky",
		config_filename: "hulky_dev",
		description: "Hulk vergelijking",
		message: "LET OP: Dit is een testversie"
	},
	 {
		 	name: "Lexitest",
		 	config_filename: "lexitest",
		 	description: "Het nieuwste historische lexicon, gegenereerd d.m.v. scripts"
	 },
	 {
		 	name: "Metadata",
		 	config_filename: "metadata",
		 	description: "CHN release 2 - metadata"
	 }, 
	 
	 {
			name: "Neoloog",
			config_filename: "neoloog_dev",
			description: "Neoloog",
			message: "LET OP: Dit is een testversie"
	 },
	 {
			name: "Neoloog",
			config_filename: "neoloog",
			description: "Neoloog (versie 2016)",
			production: true
	 },
	 {
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
