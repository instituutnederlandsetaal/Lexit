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
	name: "Gigant HiLex productie",
	config_filename: "gigant_hilex_candidate",
	description: "Gigant Historisch lexicon (versie 2018)",
	production: true
	},
	{
	name: "Gigant MoLex",
	config_filename: "gig_pro",
	description: "Gigant Modern lexicon (versie 2016)",
	production: true
	},
    {
	name: "Linkingtool WNT-Molex",
	config_filename: "wnt_molex_linking",
	description: "Voorzetting van IKEA WNT-Molex",
	production: true
    },
    {
	name: "Linkingtool RBN+-Molex",
	config_filename: "rbn_molex_linking",
	description: "RBN-Molex koppelingen aanbrengen",
	production: true
	},
	 {
	name: "Lancelot",
	config_filename: "lancelot",
	description: "The hero formerly known as Cobalt",
	production: true
	},


	{
	name: "Gigant HiLex DEV",
	config_filename: "gigant_hilex_candidate_dev",
	description: "Gigant Historisch lexicon (development)",
	message: "LET OP: Dit is een testversie"	
	},
	{
	name: "Gigant MoLex DEV",
	config_filename: "gig_pro_dev",
	description: "Gigant Modern lexicon (development)",
	message: "LET OP: Dit is een testversie"
	},




	// ========== DON'T MODIFY ANYTHING BELOW THIS LINE ================================================
	
	 {
			name: "Login overzicht",
			config_filename: "spy",
			description: "Overzicht actieve accounts (wordt om de 2 sec bijgewerkt)",
			goody: true
	 },
	 {
			name: "Gebruikersbeheer",
			config_filename: "admin",
			description: "Gebruikersbeheer",
			goody: true
	},
	 {
			name: "Reset user rights",
			config_filename: "reset_user_rights",
			description: "Handmatig toegangsrechten resetten",
			goody: true
	 }
	 
	];
