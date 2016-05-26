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
 *  
 *  ------------------------------------------------------------------------------------------------------
 */

var aProjectList =
	[
	 
	 
	 {
		name: "Gigant MoLex",
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
		config_filename: "bob",
		description: "Kranten licenties en producten"
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
		name: "Gigant MoLex (NIEUWE development)",
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
	 }
	 
	];
