/**
 * Names of buttons, messages, etc. 
 */


var lang = {};

lang.BASE_URL = "../lexit2";

// are we on Mac or PC?
lang.isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;

// default is Dutch

// general
lang.ok = "Ok";
lang.send = "Verzend";
lang.save = "Opslaan";
lang.undo = "Herstel";
lang.yes = "Ja";
lang.no = "Nee";
lang.click_to_edit = "Klik om te bewerken";
lang.press_on = "Druk op";
lang.to_edit = "om te bewerken";
lang.choose = "Kiezen";
lang.everything = "Alles";
lang.EVERYTHING = "ALLES";
lang.nothing = "Niets";
lang.apply = "Toepassen";
lang.carryout = "Uitvoeren";
lang.filter = "Filter";
lang.filter_regex = "Filter (regex)";
lang.neutral = "Neutraal";
lang.on = "Aan";
lang.off = "Uit";
lang.show_max = "Toon max.";
lang.options = "opties"; // keep lowercase
lang.sort_by_freq = "Sorteer naar freq";
lang.sort_alphabetically = "Sorteer alfabetisch";
lang.row = "Rij";
lang.in_column = "in kolom";
lang.succeeded = "Gelukt";
lang.failed = "Mislukt";
lang.beware = "Let op";
lang.cancel = "Annuleren";
lang.cancelled = "Geannuleerd";
lang.reset = "Reset";
lang.response = "Response";
lang.unknown = "Onbekend";
lang.database_info = "Database info";
lang.empty_table = "Geen resultaten";
lang.loading_records = "Data laden uit de database...";
lang.loading_from_server = "Data wordt van de server geladen";
lang.access_denied = "Geen toegang";
lang.hold_ctrl_for_multiple_choice = "Houd CTRL ingedrukt bij meervoudige keuze";
lang.close = "Sluiten";

// project page
lang.welcome = "Welkom in Lex'it";
lang.choose_a_project = "Kies een project";
lang.production = "Productie";
lang.goodies = "Goodies en tools";
lang.in_development = "In ontwikkeling";
lang.project_closed = "Afgesloten";
lang.project_unknown = "Onbekend";

// table selection
lang.choose_a_table = "Kies een tabel: <I>(vooraf "+(lang.isMac?"Command":"CTRL")+" ingedrukt houden om tabel toe te voegen, of SHIFT voor tabel in nieuwe tab)</I>";
lang.choose_a_table_default_value = "Kies een tabel";

// table loading
lang.data_is_being_loaded = "Data wordt van de server geladen";
lang.no_results_modify_your_query = "Geen resultaten. Probeer een ander zoekwoord.";

// table export
lang.export_toclipboard = "Naar clipboard";
lang.export_excel = "Excel";
lang.export_pdf = "PDF";
lang.export_print = "Afdrukken";


// header
lang.header_info_empty = "Geen resultaten";
lang.header_info_filtered = " (uit _TOTALPLUSMN__MAX_ rijen)";
lang.header_main_search = "ZOEK in gehele tabel:";
lang.header_search_and_replace_button = "Zoek & Bewerk";
lang.header_search_and_replace_denied = "De tekstvelden van deze tabel mogen niet bewerkt worden";
lang.header_search_and_replace_safemode = "(veilige modus: bewerking beperkt zich tot de schermgegevens)";
lang.header_search_and_replace_replacethisby = "vervang het door";
lang.header_search_and_replace_addthis = "voeg dit toe";
lang.header_search_and_replace_searchforthis = "Zoek dit [regex]";
lang.header_search_and_replace_in = " in ";
lang.header_search_and_replace_and = "en";
lang.header_search_and_replace_test = "Test effect";
lang.header_search_and_replace_emptyfields = "Velden legen";

lang.search_help = "Selectiehulp";
lang.search_help_msg = "Stel uw zoekvraag samen (Houd "+(lang.isMac?"Command":"CTRL")+" ingedrukt voor meervoudige keuze)";
lang.search_help_search_for_contrary = "Zoek tegenovergestelde van selectie";
lang.search_help_search_for_exact_match = "Exact matchen";

lang.header_selection_button_on = "Selectie AAN";
lang.header_selection_button_off = "Selectie UIT";

lang.header_goto_button = "Ga naar";
lang.header_goto_no_search_term = "Tik een zoekterm in een zoekbox boven een kolom, en klik dan pas op 'Ga naar'!";
lang.header_goto_missing_sort = "De tabel is niet gesorteerd op een kolom. " +
				"De functie 'Ga naar' werkt niet zonder sortering. Sorteer eerst de tabel op een kolom.";
lang.header_goto_building_index = "Lex'it bouwt nu een index van alle voorkomens van het gezochte woord.<BR>" +
				"(dit duurt mogelijk een paar seconden, maar dat hoeft slechts &eacute;&eacute;n keer!)<BR>" +
				"<BR>" +
				"Heel even geduld a.u.b.";

lang.header_x_rows_found = "_PLUSMN__TOTAL_ rij(en) gevonden";
lang.header_show = "Toon";
lang.header_rows = "rijen";
lang.header_all = "alle";

lang.click_to_add_a_note = "Klik om notitie toe te voegen";
lang.table_notes = "Tabelnotities";
lang.job_started_on = "Klus aangemaakt op";
lang.job_finished_on = "Klus afgemaakt op";
lang.job_processed_on = "Klus verwerkt op";
lang.job_notes = "Notities";
lang.note_was_added = "De notitie is toegevoegd.";
lang.no_note_was_saved = "Geen notitie opgeslagen.";
lang.error_at_saving_note = "Fout bij het opslaan van de notitie";
lang.error_at_reading_note = "Fout bij het opvragen van de notitie.";

lang.reset_button = "Reset";
lang.columns_selection = "Kolommenselectie";
lang.columns_selection_and_order = "Kolommenselectie en -ordening";
lang.columns_selection_optimal_mode = "Kolommenselectie  (Optimale modus staat AAN: kolommen zonder inhoud worden automatisch verborgen)";
lang.columns_selection_optimal_apply_msg = "Pas de nu gemaakte keuzes toe en sluit dit venster";
lang.columns_selection_optimal_cancel_msg = "Annuleer de nu gemaakte keuzes en sluit dit venster";
lang.columns_selection_optimal_label = "Optimaal";
lang.columns_selection_optimal_tooltip = "Verberg kolommen automatisch wanneer die in de huidige view leeg zijn, zodat de tabel niet onnodig breed is";
lang.columns_selection_select_all = "Selecteer alle kolommen";
lang.columns_selection_deselect_all = "Deselecteer alle kolommen";
lang.columns_selection_reset_default = "Herstel default";
lang.columns_selection_reset_default_msg = "Herstel de oorspronkelijke configuratie van deze tabel";
lang.view_type_button = "Formulier/tabel view";
lang.refresh_button = "Ververs [F5]";
lang.goto = "Ga naar";
lang.goto_button =  "Ga naar woord<BR>[+Shift: naar rij/pagina]";
lang.goto_enter = "Ga naar (vul één waarde in):";
lang.goto_rownumber = "Rijnummer";
lang.goto_pagenumber = "Paginanummer";
lang.goto_you_must_enter_a_number = "U moet wel een rijnummer of paginanummer invullen! ";

lang.turn_row_selection_on = "Zet rijselectie AAN [F2]";
lang.turn_row_selection_off = "Zet rijselectie UIT [F2]";
lang.help_button = "Hulp";
lang.undo_button = "Herstelfunctie: Er is niets te herstellen.<BR>[+ Shift: herstel vorige selectie]";
lang.undo_restore_msg1 = "Herstel";
lang.undo_restore_msg2 = "in rij";
lang.undo_restore_msg3 = "van kolom";
lang.undo_are_you_sure = "Weet u zeker dat u de laatste bewerking ongedaan wilt maken";


// pagination
lang.paginate_first = "Eerste";
lang.paginate_previous = "Vorige";
lang.paginate_next = "Volgende";
lang.paginate_last = "Laatste";

// error message
lang.loading_xml_failed = "XML laden mislukt";
lang.error = "Fout";
lang.error_button_config = "Aan deze button is geen functie toegekend.";
lang.some_error_has_occurred = "Er is een fout opgetreden";
lang.error_occurred_in_table = "Fout in tabel";
lang.error_when_calling = "Fout bij aanroep van";
lang.error_column_doesnot_exist = "De opgegeven kolom komt niet voor in de tabel";
lang.error_function_called_with_illegal_value = "De functie is aangeroepen met een illegale waarde";
lang.error_function_called_with_illegal_value_input = "Invoer";
lang.error_function_called_with_illegal_value_expected = "Verwacht";
lang.error_table_has_no_row_ids = "De Tabel heeft geen IDs. Rijen aanwijzen zonder IDs is onmogelijk. " +
				"[Het antwoord van de server bevat waarschijnlijk geen waarde voor DT_RowId " +
				"omdat de tabel geen primary key noch pkid-veld heeft; " +
				"LET erop dat multicolumns primary keys niet ondersteund worden]";
lang.columns_list_mismatch = "De lijst kolommen in \"column_order\" (in de configuratie) komt niet overeen met de werkelijke kolommen.<BR><BR>Oorzaak";
lang.columns_list_number_mismatch1 = "Het aantal kolommen verschilt.<BR><BR>Aantal kolommen in database";
lang.columns_list_number_mismatch2 = "Aantal kolommen volgens configuratie"; 
lang.columns_list_name_mismatch1 = "De kolomnamen verschillen.<BR><BR>De database-tabel bevat";
lang.columns_list_name_mismatch2 = "Maar de configuratie noemt";
lang.loading_projects_list_failed = "Het projectenoverzicht 'projects_overview.js' bestaat niet of het bevat fouten.";
lang.reading_internal_separator_failed = "Het ophalen van de Interne separator string is mislukt.";
lang.saving_active_tab_failed = "Het registeren van de active tab is mislukt.";
lang.reading_the_list_of_config_files_failed = "Het ophalen van de lijst configuratiebestanden is mislukt.";
lang.opening_config_file_failed = "Het configuratiebestand bestaat niet of het bevat fouten.";
lang.file_is_missing = "heeft mogelijk geen configuratie-bestand meer op deze server";
lang.missing_database_indexes = "Voor de huidige sorteerkolommen zijn geen indexen beschikbaar.<BR>" +
						"Dit vertraagt het werken met de database.<BR><BR>" +
						"Betroffen kolommen:";
lang.inform_admin = "Informeer de administrator.";
lang.error_opening_hidden_table = "U probeert deze tabel te openen, " +
				"maar volgens de configuratie moet deze tabel verborgen blijven. " +
				"Zie oShowOnlyTables of oHiddenTablesList in bestand";
lang.already_loaded = "Deze tabel is al geladen";
lang.error_while_building_searchbox = "Er is een fout opgetreden tijdens het opbouwen van deze zoekbox";
lang.error_highlight = "De highlightposities in fn.getHighlight() zijn niet correct opgegeven. " +
					"De posities moeten worden opgegeven als een array van arrays: [[a1,b1], [a2,b2], [a3,b3]].";
lang.error_function_called_with_api_instance = "is aangeroepen met een API instance. Dit is niet toegestaan! Gebruik een functie uit de fx-namespace, of vervang de API instance door een node";
lang.error_function_called_with_jquery_object = "is aangeroepen met een jQuery object. Dit is niet toegestaan! Gebruik een node";

lang.keep_filter_warning = "Parameter 'keepfilter: true' werkt alleen als vooraf ook parameter 'filter' is ingesteld";

lang.sort_column_warning1 = "Een kolom van een tabel is aangewezen als sorteerkolom, maar deze kolom bestaat niet. " +
					"Verwijder deze kolom uit het configuratiebestand";
lang.sort_column_warning2 = "Tabel";
lang.sort_column_warning3 = "Kolom";
lang.display_differs_from_selection = "Weergave wijkt nu af van selectie. Ververs de tabel a.u.b.";

lang.editcallback_warning1 = "Gebruik van 'editcallback' bij 'editfunc' is niet toegestaan. " +
							"Gebruik het callbackargument van uw fn.updateDatabase-functie in 'editfunc'";
lang.editcallback_warning2 = "Tabel";
lang.editcallback_warning3 = "Kolom";
lang.formlist_synchronize_forgotten = "Het aanroepen van table 'TABLENAME' in het formulier is niet mogelijk.<BR><BR>De 'synchronize_with' parameter is mogelijk niet correct gedeclareerd.";
lang.formlist_save_first_after_row_creation = "U heeft deze rij net toegevoegd. Om hiermee samenhangende data te kunnen zien/toevoegen, moet u de rij eerst opslaan door op 'Opslaan' te klikken.";
lang.formlist_save_first_before_overwriting = "U staat op het punt nieuw data in 'LISTSNAMES' te laden, terwijl de huidige data niet opgeslagen is.<BR>Om verder te kunnen gaan, moet u eerst klikken op 'Opslaan'.";
lang.formlist_select_a_row_first = "U moet eerst een rij selecteren in de 'LISTNAME' lijst.";


lang.helpText = 
				
				"<ul>"+
				"<li><a href='#tabs-1'>Overzicht van de knoppen</a></li>"+
				"<li><a href='#tabs-2'>Zoeken</a></li>"+
				"<li><a href='#tabs-5'>Sorteren</a></li>"+
				"<li><a href='#tabs-3'>Bewerken</a></li>"+
				"<li><a href='#tabs-4'>Sneltoetsen</a></li>"+				
				"<li><a href='#tabs-info'>Info</a></li>"+
				"</ul>" +
				
				"<div id='tabs-1'>" +
				"<TABLE>"+
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-home'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Reset</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Ga terug naar de beginstand van de tabel." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-refresh'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Ververs</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Ververs de tabel. Dit is handig als u zich ervan wilt " +
				"verzekeren dat de getoonde inhoud echt up-to-date is (bijv. omdat iemand anders " +
				"tegelijkertijd aan dezelfde gegevens werkt)." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-search'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Zoeken en bewerken</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Deze functie maakt het mogelijk om een reeks tekens in meerdere rijen tegelijk te vervangen " +
				"door een andere reeks tekens.<BR>" +
				"Als u deze knop aanklikt, gaat er een nieuw venster open. " +
				"Daarin kunt u het woord(deel) opgeven dat (in een bepaalde kolom) moet worden bewerkt, " +
				"en door welk nieuw woord(deel) het vervangen moet worden." +
				"<BR><BR></TD>" +
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-circle-arrow-e'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Ga naar</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Met deze functie kunt u in &eacute;&eacute;n klik een bepaald " +
				"punt in een tabel opzoeken. " +
				"Deze functie is anders dan gewoon zoeken, want er wordt " +
				"niets weggefilterd. Het is dus geen filterfunctie, maar een navigatiefunctie.<BR><BR>" +
				"Er bestaan twee werkwijzen:<BR>" +
				"[1] Tik een woord in een zoekvakje " +
				"boven een kolom en klik dan op de knop 'Ga naar': het eerste gedeelte van de tabel " +
				"waarin dit woord voorkomt wordt dan onmiddellijk opgezocht en getoond. " +
				"Om te zoeken waar in de tabel dit woord verder voorkomt, klik nog eens op 'Ga naar'.<BR>" +
				"[2] Druk bij het aanklikken van deze knop ook op 'shift'. Dan krijgt u de mogelijkheid " +
				"om een paginanummer of rijnummer in te vullen waar u naartoe wilt. " +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-pin-s'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Rijselectie</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Klik op deze knop als u rijen wilt selecteren: " +
				"de functies die normaal gesproken bij het aanklikken van " +
				"cellen of rijen worden aangeroepen, worden dan tijdelijk uitgeschakeld, zodat die " +
				"het selecteren niet verstoren. " +
				"Klik nogmaals op deze knop om betreffende functies weer aan te zetten.<BR>" +
				"(Shortcut: F2)" +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-arrowreturnthick-1-w'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Undo</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Met deze functie maakt u uw laatste bewerkingen ongedaan.<BR>"+
				"Let wel: dit kan zolang u op dezelfde pagina blijft. Zodra u naar een andere pagina gaat, " +
				"kunnen bewerkingen niet meer ongedaan worden gemaakt." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-wrench'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Kolommenselectie</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Met deze functie kiest u welke kolommen van een tabel u wilt zien en in welke volgorde.<BR>" +
				"Als u deze knop aanklikt, gaat er een nieuw venster open, en kunt u kolommen aan- of uitklikken, of naar een andere positie verschuiven. " +
				"Aldaar kunt u ook gebruik maken van de knop 'Optimaal': hiermee wordt automatisch de best " +
				"mogelijke weergave berekend zodat de tabel overzichtelijker wordt." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-image'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Weergavemodus</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Toon de tabel als formulier, of als tabel. In het eerste geval wordt " +
				"slechts &eacute;&eacute;n rij getoond, maar de velden staan dan boven elkaar, net als op een " +
				"formulier." +
				"<BR><BR></TD>"+
				"</TR>"+
				"</TABLE>" +
				"</div>"+
				
				"<div id='tabs-2'>" +
				"<B>Normaal zoeken</B>" +
				"<BR><BR>" +
				"Om te zoeken naar een woord in een bepaalde kolom, gaat u naar het tekstvakje boven betreffende kolom, " +
				"tikt u daar het gezocht woord in, en drukt u vervolgens op 'Enter'. Dit kan ook met meerdere kolommen tegelijk." +
				"<BR><BR><BR>" +
				"<B>Geavanceerd zoeken</B>" +
				"<BR><BR>" +
				"U kunt heel krachtig en doelgericht zoeken door gebruik te maken van reguliere expressies. Deze bedienen zich van de volgende symbolen:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD>Symbool</TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>Betekenis</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>^</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>begin van een woord</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>$</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>einde van een woord</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\m</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>begin van een woord middenin een woordgroep</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\M</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>einde van een woord middenin een woordgroep</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\y</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>grens (begin &oacute;f einde) van een woord middenin een woordgroep</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>.</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>een willekeurig teken</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\w</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>een willekeurige letter, cijfer of underscore</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\d</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>een willekeurig cijfer</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\s</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>een spatie</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>+</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>&eacute;&eacute;n of meer keer het voorgaande (teken)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>*</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>nul of meer keer het voorgaande (teken)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>?</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>het voorafgaande teken is optioneel</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Hier volgen een paar voorbeelden:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar woorden die met '<I>hoofd</I>' beginnen</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd.+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar woorden die met '<I>hoofd</I>' beginnen, " +
				"gevolgd door een willekeurige tekenreeks</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoofd$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar woorden die op '<I>hoofd</I>' eindigen</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek exact naar '<I>hoofd</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd\\y</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek exact naar '<I>hoofd</I>' als begin van een woordgroep, zoals in '<I>hoofd van de school</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\yvan\\y</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek exact naar '<I>van</I>' als onderdeel van een woordgroep, zoals in '<I>hoofd van de school</I>'</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Er kunnen ook combinaties van zoekopdrachten worden opgegeven, zoals: <I>zoek alle woorden met 'kop' of 'hoofd' in zich</I>. " +
				"De verschillende alternatieven moeten dan tussen '(' en ')' worden opgegeven, gescheiden door een '|'." +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>(hoofd|kop)</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar woorden met '<I>hoofd</I>' of '<I>kop</I>' in zich</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^(hoofd|kop)$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek exact naar '<I>hoofd</I>' of '<I>kop</I>'</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Wanneer de verschillende alternatieven geen woorden, maar losse letters betreffen (bijv. <I>zoek naar 'hoofd' eindigend op 'd' of 't'</I>), dan kunnen " +
				"de verschillende alternatieven tussen '[' en ']' en zonder scheiding worden opgegeven. " +
				"Geheel equivalent zijn:" +
				"<BR><BR>" +
				"<TABLE>" +				
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoof(d|t)</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>hoofd</I>' of '<I>hooft</I>'</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoof[dt]</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>hoofd</I>' of '<I>hooft</I>'</TD>"+
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Andere voorbeelden:"+
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooie?$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' of '<I>mooie</I>'. 'e?' betekent dus 'e' of niets.</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi.$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door &eacute;&eacute;n willekeurig teken (waarachter het woord eindigt)</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door &eacute;&eacute;n letters/cijfers</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w{2}$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door twee letters/cijfers</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w{2,4}$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door twee tot vier letters/cijfers</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w*</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door nul of meer letters/cijfers</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door &eacute;&eacute;n of meer letters/cijfers</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\s</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar een spatie (dit levert woordgroepen op, aangezien woorden door spaties gescheiden zijn)</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +	
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\d+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar een nummer bestaand uit &eacute;&eacute;n of meer cijfers</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\d{4}</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar een nummer bestaand uit 4 cijfers</TD>"+
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Zoals hierboven bleek, hebben bepaalde tekens een betekenis, zoals '(', ')', '|', of '.'<BR>" +
				"Om toch te kunnen zoeken naar woorden waar zulke tekens in staan, moet u deze laten voorafgaan " +
				"door een backslash (\\):"+
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>panne\\(n\\)koek</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar 'panne(n)koek'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>N\\.B\\.</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar 'N.B.'</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Exact zoeken</B>" +
				"<BR><BR>" +
				"U kunt exact zoeken door aanhalingstekens te gebruiken. Voorbeelden:" +
				"<BR><BR>" +
				"Zoeken gebeurt normaal gesproken <I>case <U>in</U>sensitive</I>. "+
				"Als u echter aanhalingstekens om het gezochte woord heen zet, zoekt u <I>case sensitive</I>:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>Af</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die 'af' of 'Af' bevatten.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\"Af\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek alleen naar woorden die 'Af' bevatten met een hoofdletter 'A'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\"^Af\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek alleen naar woorden die met 'Af' beginnen met een hoofdletter 'A'.</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Zoals het laatste voorbeeld laat zien, moeten de aanhalingstekens om de gehele expressie heen. Zoals "+
				"bij deze reguliere expressie:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\"^[A-Z]\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die met een hoofdletter beginnen.</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Aanhalingstekens kunnen ook op andere manieren ingezet worden. Als u bijvoorbeeld zoekt naar " +
				"uitdrukkingen met het woord 'van', kunt u zoeken naar \" van \", d.w.z. 'van' met spaties eromheen. " +
				"Op die manier dwingt u af dat 'van' middenin een reeks woorden staat:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>van</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> vindt bijv. 'caravan', 'vandalisme', 'rad van fortuin'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\" van \"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> vindt alleen 'rad van fortuin'.</TD>" +
				"</TR>" +
				"</TABLE>" +	
				"<BR>" +
				"Als u aangeeft dat u exact een bepaald woord zoekt, zonder iets ervoor of erna, kan dat het zoeken behoorlijk versnellen. " +
				"Gebruik daartoe deze schrijfwijze: " +				
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>exact:lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> vindt exact het woord 'lopen'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>//lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> idem.</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Zoeken met operatoren</B>" +
				"<BR><BR>" +
				"Normaal zoekt Lex'it met een operator voor gelijkheid, maar het is ook mogelijk om " +
				"met een operator voor ongelijkheid te zoeken, of zelfs met relationele operatoren (groter/kleiner dan). " +
				"Hiertoe moet de betreffende operator expliciet worden opgegeven aan het begin van de zoekstring.<BR>" +
				"Een paar voorbeelden:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\<^E</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die met A, B, C of D beginnen (een letter vóór de letter E)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I></I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> <B>NB</B>: om te zoeken tussen twee letters, voldoet het om een reguliere expressie te gebruiken:<BR>" +
				"<I>^[A-D]</I> zoekt naar alle woorden die met A, B, C of D beginnen</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\>=20</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar getallen groter dan of gelijk aan 20</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die de vorm 'lopen' NIET bevatten</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!(ing|heid)$</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die NIET op '-ing' of '-heid' eindigen</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR><BR>" +
				"Belangrijk is te noteren hoe de negatie bij 'exact zoeken' gebruikt wordt. Exact zoeken " +
				"gebeurt, zoals we boven zagen, door gebruik van aanhalingstekens om de zoektermen heen. " +
				"De negatie hoort vóór de aanhalingstekens te staan:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!\"^Boek\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die NIET met het woord 'Boek' (met een hoofdletter) beginnen.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!\"^[A-Z]\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die NIET met een hoofdletter beginnen.</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +			
				"<BR><BR><BR>" +
				"<B>Nog een paar trucjes</B>" +
				"<BR><BR>" +
				"Met behulp van bovengenoemde symbolen is nog meer mogelijk. Een paar voorbeelden:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^$</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar lege cellen</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>.</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek een willekeurig karakter: dit is een manier om te kijken of een kolom minstens &eacute;&eacute;n gevulde cel heeft.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>NULL</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar cellen die een NULL-waarde bevatten</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Query-builder / Selectiehulp</B>" +
				"<BR><BR>" +
				"Zoekvragen kunnen deels automatisch worden samengesteld d.m.v. een tooltje. " +
				"Om dit tooltje te openen, houdt u bij het aanklikken van een zoekveld de "+(lang.isMac?"Command":"CTRL")+"-toets ingedrukt. " +
				"Het tooltje toont de meest frequente waardes uit betreffende kolom, zodat een keuze daaruit kan worden gemaakt: Lex'it formuleert " +
				"dan een zoekopdracht om op de gekozen waardes te zoeken. Ook is het mogelijk om een negatieve selectie te maken, d.w.z. alles " +
				"behalve de gekozen waardes." +
				"</div>" +
				"<div id='tabs-5'>" +
				"<B>Sorteren op &eacute;&eacute;n kolom</B><BR>"+
				"<BR>"+
				"Om een tabel op een bepaalde kolom te sorteren, klik op de naam van de betreffende kolom.<BR>" +
				"Het pijltje naast de kolomnaam geeft dan aan hoe er wordt gesorteerd:<BR>" +				
				"<UL>"+
				"<LI>oplopend (pijltje omhoog)</LI>" +
				"<LI>aflopend (pijltje omlaag)</LI>" +
				"<LI>retrograad oplopend (pijltje omhoog en R-teken)</LI>" +
				"<LI>retrograad aflopend (pijltje omlaag en R-teken)</LI>" +
				"</UL>"+
				"Om de sorteerrichting te wijzigen, moet u nogmaals op de kolomnaam klikken.<BR>" +
				"<BR>" +
				"<BR>" +
				"<B>Sorteren opheffen</B><BR>"+
				"<BR>" +
				"Als u het sorteren op een kolom wilt opheffen, moet u de SHIFT-toets ingedrukt houden. <BR>" +
				"Door herhaaldelijk op de kolomnaam te klikken, gaat u dan door verschillende standen heen, totdat de " +
				"sortering opgeheven wordt:<BR>" +				
				"<UL>"+
				"<LI>oplopend sorteren</LI>" +
				"<LI>aflopend sorteren</LI>" +
				"<LI>retrograad oplopend</LI>" +
				"<LI>retrograad aflopend</LI>" +
				"<LI>neutraal (= niet sorteren)</LI>" +
				"</UL>"+				
				"<BR>"+
				"<B>Sorteren op meerdere kolommen tegelijk</B><BR>"+
				"<BR>"+
				"Het is ook mogelijk om op verschillende kolommen tegelijkertijd te sorteren. Dit wil zeggen: u kunt primair sorteren op een bepaalde kolom, en secundair op een andere kolom, enz.<BR>"+
				"Daartoe klikt u eerst op de kolom waarop u primair wilt sorteren. Vervolgens houdt u de SHIFT-toets ingedrukt en klikt u op de kolommen waarop u secundair, enz. wilt sorteren.<BR>" +
				"Met SHIFT geeft u aan dat de andere sorteerkolommen behouden moeten worden: zonder SHIFT " +
				"zouden de andere sorteerkolommen namelijk direct vervallen.<BR>"+
				"<BR><BR>"+
				"</div>" +
				
				"<div id='tabs-3'>" +
				"<B>Tabel bewerken</B>"+
				"<BR><BR>"+
				"Om de inhoud van een tabel te bewerken, klik op de te bewerken cel.<BR>" +
				"Afhankelijk van de type cel verandert deze dan in een tekstvak, een checkbox " +
				"of een dropdown. U kunt dan een stuk tekst intikken, " +
				"de checkbox aanvinken, enz. enz.<BR>" +
				"<BR>"+
				"LET WEL: als u een stuk tekst hebt ingetikt, moet u uw invoer bevestigen door op 'Enter' te drukken. " +
				"Als u niet op 'Enter' drukt en met de muis buiten de cel klikt, wordt uw bewerking geannuleerd.<BR>"+
				"<BR><BR>"+
				"</div>" +
				
				"<div id='tabs-4'>" +
				"<B>Sneltoetsen</B>"+
				"<BR><BR>"+
				"<TABLE>" +
				"<TR>" +
				"<TD>Pijl omhoog/omlaag</TD><TD>&nbsp;&nbsp;</TD><TD>Ga een rij omhoog/omlaag in de tabel.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>Page up/down</TD><TD>&nbsp;&nbsp;</TD><TD>Ga naar de vorige/volgende pagina.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>"+(lang.isMac?"Command":"CTRL")+" + pijl naar links/rechts</TD><TD>&nbsp;&nbsp;</TD><TD>Scroll naar links of naar rechts.</TD>" +				
				"</TR>" +
				"<TD>"+(lang.isMac?"Command":"CTRL")+" + klik in zoekveld boven kolom</TD><TD>&nbsp;&nbsp;</TD><TD>Roep selectiehulp/query builder op.</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>ESC</TD><TD>&nbsp;&nbsp;</TD><TD>Afhankelijk van de context: selectie ongedaan maken, venster sluiten, enz.</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>Tab</TD><TD>&nbsp;&nbsp;</TD><TD>Switch tussen de tabellen: geef de eerst volgende tabel focus.</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>F5</TD><TD>&nbsp;&nbsp;</TD><TD>Ververs de actieve tabel.</TD>" +	
				"<TR>" +
				"<TD>Pause/Break</TD><TD>&nbsp;&nbsp;</TD><TD>Ververs de actieve tabel en vraag exacte telling op (trager).</TD>" +	
				"</TR>" +
				"<TR>" +
				"<TD>F8</TD><TD>&nbsp;&nbsp;</TD><TD>Toon of verberg de tooltips in de tabellen.</TD>" +				
				"</TR>" +
				"</TABLE>" +
				"</div>" +
				
				"<div id='tabs-info'>" +
				"<BR><BR>"+
				"<TABLE>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD><H1>Lex'it</H1></TD>"+
				"</TR>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD><B>Lex</B><I>icon</I> <B>I</B><I>nteractive</I> <B>T</B><I>ool</I></TD>"+
				"</TR>"+
				"<TR><TD></TD><TD>&nbsp;</TD></TR>"+
				"<TR>"+
				"<TD>&copy;</TD>"+
				"<TD>"+
				"<img src='"+lang.BASE_URL+"/images/INT-logo.png' height='60px' width='136px'>"+
				"</TD>"+
				"</TR>"+				
				"<TR>"+
				"<TD></TD>"+
				"<TD></TD>"+
				"</TR>"+
				"<TR><TD></TD><TD>&nbsp;</TD></TR>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD>"+
				"www.ivdnt.org"+
				"</TD>"+
				"</TR>"+
				"</TABLE>"+
				"</div>"
				;


// Other languages

lang.setLanguage = function(sLanguageCode){

	if (sLanguageCode == null) sLanguageCode = "nl";
	sLanguageCode = sLanguageCode.toLowerCase();

	// Default: if another language than dutch is chosen,
	// make sure the English help is available anyhow!
	// (this might be overiden in the following, if some other translation is available)
	if (sLanguageCode != "nl"){

		lang.helpText = 
				
				"<ul>"+
				"<li><a href='#tabs-1'>Button overview</a></li>"+
				"<li><a href='#tabs-2'>Searching</a></li>"+
				"<li><a href='#tabs-5'>Sorting</a></li>"+
				"<li><a href='#tabs-3'>Editing</a></li>"+
				"<li><a href='#tabs-4'>Hotkeys </a></li>"+				
				"<li><a href='#tabs-info'>Info</a></li>"+
				"</ul>" +
				
				"<div id='tabs-1'>" +
				"<TABLE>"+
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-home'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Reset</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Return to the starting point of the table." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-refresh'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Refresh</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Refresh the table. Useful if you want to make sure the contents shown are really up-to-date " +
				"(for example when someone else is editing the same data at the same time)." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-search'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Search & Replace</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"This function enables you to replace a series of characters in several rows with another series of characters, all in one go.<BR>" +
				"If you click on this button, a new window opens, in which you can indicate which word or word part (in which column) needs to be replaced with which new word or word part." +
				"<BR><BR></TD>" +
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-circle-arrow-e'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Go to</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"This function enables you find a move to a place in the table with one click. This function is different from the normal search function, because nothing gets filtered away: it is not a filtering function but a navigation function.<BR><BR>" +
				"There are two methods:<BR>" +
				"[1] Type a word into a search box above a column and click on the button 'Go to': the first part of the table in which this word occurs will come into view. To find further finding places, click on 'Go to' again.<BR>" +
				"[2] Press the Shift key while you click on this button. It enables you to indicate the page number or row number you would like to navigate to." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-pin-s'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Row selection</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Click on this button of you wish to select several rows: the functions that are normally activated when you click on cells or rows are temporarily de-activated and can’t disturb the selection process. Click on this button again to re-activate these functions.<BR>" +
				"(Shortcut: F2)" +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-arrowreturnthick-1-w'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Undo</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"With this function, your last edits get undone.<BR>"+
				"Please note: this is only possible as long as you stay on the same page. As soon as you move to another page, edits can’t be undone." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-wrench'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Columns selection</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"With this function you can choose which columns of the table you want to be visible and in which order.<BR>" +
				"If you click on this button a new window opens. There you can turn column visibility on or off, and drag any column to another position. This also offers the option of using the 'Optimal' button: this automatically determines which is the best possible view, arranging the table in the most convenient way." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-image'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>View mode</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Shows the table either as a form or as a table. In the first case only one row is shown, with the fields presented vertically, on top of each other, as in a form." +
				"<BR><BR></TD>"+
				"</TR>"+
				"</TABLE>" +
				"</div>"+
				
				"<div id='tabs-2'>" +
				"<B>Normal searches</B>" +
				"<BR><BR>" +
				"In order to search for a word in a specific column, type the word you are looking for into the text box above that column and press ‘Enter’. This can be also done with more than one column at the same time." +
				"<BR><BR><BR>" +
				"<B>Advanced searches</B>" +
				"<BR><BR>" +
				"By using regular expressions you can search more efficiently and specifically. This involves the following symbols:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD>Symbol</TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>Meaning</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>^</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>start of a word</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>$</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>end of a word</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\m</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>start of a word in the middle of a word group</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\M</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>end of a word in the middle of a word group</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\y</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>boundary (start or end) of a word in the middle of a word group</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>.</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>any character</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\w</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>any letter, digit or underscore</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\d</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>any digit</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\s</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>a space</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>+</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>one or more of the previous (character)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>*</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zero or more of the previous (character)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>?</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>the previous character is optional</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Some examples:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for words starting with  '<I>hoofd</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd.+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for words starting with '<I>hoofd</I>', " +
				"followed by any string of characters</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoofd$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for words ending with  '<I>hoofd</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> find an exact match of '<I>hoofd</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd\\y</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> find an exact match of '<I>hoofd</I>' as the beginning of a word group, e.g. in '<I>hoofd van de school</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\yvan\\y</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> find an exact match of '<I>van</I>' as part of a word group, e.g. in '<I>hoofd van de school</I>'</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Other combinations of queries are also possible, such as: <I>search for all words containing either 'kop' or 'hoofd'</I>. " +
				"The various alternatives should be entered between '(' and ')' separated by a '|'." +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>(hoofd|kop)</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for words containing either '<I>hoofd</I>' or '<I>kop</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^(hoofd|kop)$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>find an exact match of either '<I>hoofd</I>' or '<I>kop</I>'</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"If the various alternatives are separate letters instead of words (e.g. <I>search for 'hoofd' ending on either 'd' or 't'</I>), " +
				"the various alternatives can be entered between '[' and ']' without a separating '|'. " +
				"Exact equivalents are:" +
				"<BR><BR>" +
				"<TABLE>" +				
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoof(d|t)</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>hoofd</I>' or '<I>hooft</I>'</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoof[dt]</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>hoofd</I>' or '<I>hooft</I>'</TD>"+
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Other examples:"+
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooie?$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>mooi</I>' or '<I>mooie</I>'. 'e?' means: either 'e' or nothing.</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi.$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>mooi</I>' followed by a single random character (after which the word ends)</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>mooi</I>' followed by one letter/digit</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w{2}$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>mooi</I>' followed by two letters/digits</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w{2,4}$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>mooi</I>' followed by two to four letters/digits</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w*</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>mooi</I>' followed by zero or more letters/digits</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for '<I>mooi</I>' followed by one or more letters/digits</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\s</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for a space (resulting in word groups, as they consist of words separated by spaces)</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +	
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\d+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for a number consisting of one or more digits</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\d{4}</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>search for a number consisting of 4 digits</TD>"+
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"As shown above, certain characters have a meaning, e.g. '(', ')', '|', and '.'<BR>" +
				"In able to search for words containing such characters, make sure they are preceded by a backslash  (\\):"+
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>panne\\(n\\)koek</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> search for 'panne(n)koek'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>N\\.B\\.</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> search for 'N.B.'</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Exact searches</B>" +
				"<BR><BR>" +
				"Exact matches can be found by using quotation marks. Examples:" +
				"<BR><BR>" +
				"Searches are normally <I>case <U>in</U>sensitive</I>. "+
				"If you put double quotes around the search term, the search becomes <I>case sensitive</I>:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>Af</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> search for words containing 'af' or 'Af'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\"Af\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> only search for words containing 'Af' with a capital 'A'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\"^Af\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> only search for words starting with 'Af' with a capital 'A'.</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"As the last example shows, quotation marks should be placed around the complete regular expression, for example in the following one:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\"^[A-Z]\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> search for words starting with any capital letter.</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Quotation marks can also be used in other ways. For example, if you are looking for expressions containing the word 'van', you can search for \" van \": 'van' with spaces around it. " +
				"This ensures that you will only find occurrences of 'van' in the middle of a word group:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>van</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> find for example 'caravan', 'vandalisme', 'rad van fortuin'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\" van \"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> find only 'rad van fortuin'.</TD>" +
				"</TR>" +
				"</TABLE>" +	
				"<BR>" +
				"By indicating that you are looking for an exact match of a certain word, not followed or preceded by anything else, you can speed up your query considerably. Use the following notation: " +				
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>exact:lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> search for the exact match of the word 'lopen'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>//lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> idem.</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Searches with operators</B>" +
				"<BR><BR>" +
				"Normally, Lex'it searches with an equality operator, but it is also possible to search with an inequality operator, or even with relational operators (larger/smaller than). Such operators should be entered explicitly at the start of the search string.<BR>" +
				"A few examples:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\<^E</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> search for words starting with A, B, C of D (a letter that comes before the letter E)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I></I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> <B>Please note</B>: to search between two letters, it is enough to use a regular expression:<BR>" +
				"<I>^[A-D]</I> search for any words starting with A, B, C or D</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\>=20</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> Search for numbers larger than or equal to 20</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> search for words NOT containing the form 'lopen'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!(ing|heid)$</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> search for words NOT ending with either '-ing' or '-heid'</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR><BR>" +
				"It is important to note how a negation is used in exact searches. As shown above, in exact searches quotation marks are put around the search terms. The negation should be entered before the quotation marks:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!\"^Boek\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> searches for words NOT starting with the word 'Boek' (with a capital B).</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!\"^[A-Z]\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> searches for words NOT starting with any capital letter.</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +			
				"<BR><BR><BR>" +
				"<B>A few more tricks</B>" +
				"<BR><BR>" +
				"The above-mentioned symbols offer more possibilities. A few examples:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^$</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> searches for empty cells</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>.</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> searches for any character: this is how you check whether a column has at least one cell with any content.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>NULL</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> searches for cells containing a NULL value</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Query builder / Selection help</B>" +
				"<BR><BR>" +
				"Queries can be automatically constructed with a tool. " +
				"To open this tool, press the "+(lang.isMac?"Command":"CTRL")+" key while clicking on a search box. " +
				"The tool will present the most frequent values from the column in question, enabling you to make a selection: Lex'it will " +
				"then formulate a query to search with the selected values. It is also possible to make a negative selection: everything apart from the selected values." +
				"</div>" +
				"<div id='tabs-5'>" +
				"<B>Sorting by one column</B><BR>"+
				"<BR>"+
				"To sort a table by one particular column, click on the name of that column.<BR>" +
				"The arrow next to the column name indicates how it is sorted:<BR>" +				
				"<UL>"+
				"<LI>ascending (arrow up)</LI>" +
				"<LI>descending (arrow down)</LI>" +
				"<LI>in retrograde ascending order (arrow up and R sign)</LI>" +
				"<LI>in retrograde descending order (arrow down and R sign)</LI>" +
				"</UL>"+
				"To change the sorting order, click on the column name again.<BR>" +
				"<BR>" +
				"<BR>" +
				"<B>Undo sorting </B><BR>"+
				"<BR>" +
				"If you want to undo the sorting of a column, keep the Shift key pressed while you keep clicking on the column name, moving from one sorting order to another until you are back at its starting point:<BR>" +				
				"<UL>"+
				"<LI>ascending order</LI>" +
				"<LI>descending order</LI>" +
				"<LI>ascending order in retrograde </LI>" +
				"<LI>descending order in retrograde </LI>" +
				"<LI>neutral  (= no sorting)</LI>" +
				"</UL>"+				
				"<BR>"+
				"<B>Sorting by several columns at once</B><BR>"+
				"<BR>"+
				"It is also possible to sort by several different columns simultaneously. That is: you can primarily sort by a given column, and secundarily by another. To do this, first click on the column you wish to primarily sort by. Then press the Shift key while clicking on the column by which you want the table to be sorted secundarily, and so on.<BR>" +
				"The Shift key ensures that the other sorting columns are preserved: without the Shift key they would not be taken into account.<BR>"+
				"<BR><BR>"+
				"</div>" +
				
				"<div id='tabs-3'>" +
				"<B>Editing a table</B>"+
				"<BR><BR>"+
				"To edit the contents of a table, click on the cell that needs editing.<BR>" +
				"Depending on the type of cell, it will change into a text box, a checkbox or a dropdown, allowing you to enter text, check the checkbox, etc.<BR>" +
				"<BR>"+
				"Please note: after you have done your typing in a text box, you must press the Enter key to save your edit. If you don’t press Enter and click outside of the cell, your edit will be lost.<BR>"+
				"<BR><BR>"+
				"</div>" +
				
				"<div id='tabs-4'>" +
				"<B>Hotkeys</B>"+
				"<BR><BR>"+
				"<TABLE>" +
				"<TR>" +
				"<TD>Arrow up/down</TD><TD>&nbsp;&nbsp;</TD><TD>Go up/down one row in the table.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>Page up/down</TD><TD>&nbsp;&nbsp;</TD><TD>Go to the previous/next page.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>"+(lang.isMac?"Command":"CTRL")+" + arrow to the left/right</TD><TD>&nbsp;&nbsp;</TD><TD>Scroll to the left or to the right.</TD>" +				
				"</TR>" +
				"<TD>"+(lang.isMac?"Command":"CTRL")+" + click in query field above column</TD><TD>&nbsp;&nbsp;</TD><TD>Activate selection help/query builder.</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>ESC</TD><TD>&nbsp;&nbsp;</TD><TD>Depending on the context: undo selection, close window, etc.</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>Tab</TD><TD>&nbsp;&nbsp;</TD><TD>Switch between the tables: switch focus to the next table.</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>F5</TD><TD>&nbsp;&nbsp;</TD><TD>Refresh the active table.</TD>" +	
				"<TR>" +
				"<TD>Pause/Break</TD><TD>&nbsp;&nbsp;</TD><TD>Refresh the active table and request an exact count  (slower).</TD>" +	
				"</TR>" +
				"<TR>" +
				"<TD>F8</TD><TD>&nbsp;&nbsp;</TD><TD>Show or hide the tooltips in the tables.</TD>" +				
				"</TR>" +
				"</TABLE>" +
				"</div>" +
				
				"<div id='tabs-info'>" +
				"<BR><BR>"+
				"<TABLE>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD><H1>Lex'it</H1></TD>"+
				"</TR>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD><B>Lex</B><I>icon</I> <B>I</B><I>nteractive</I> <B>T</B><I>ool</I></TD>"+
				"</TR>"+
				"<TR><TD></TD><TD>&nbsp;</TD></TR>"+
				"<TR>"+
				"<TD>&copy;</TD>"+
				"<TD>"+
				"<img src='"+lang.BASE_URL+"/images/INT-logo.png' height='60px' width='136px'>"+
				"</TD>"+
				"</TR>"+				
				"<TR>"+
				"<TD></TD>"+
				"<TD></TD>"+
				"</TR>"+
				"<TR><TD></TD><TD>&nbsp;</TD></TR>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD>"+
				"www.ivdnt.org"+
				"</TD>"+
				"</TR>"+
				"</TABLE>"+
				"</div>"
				;
	}

 

	if (sLanguageCode == "nl"){
		// do nothing, since it's default
	}
	else if (sLanguageCode == "en"){
		
		// general
		lang.ok = "Ok";
		lang.send = "Send";
		lang.save = "Save";
		lang.undo = "Undo";
		lang.yes = "Yes";
		lang.no = "No";
		lang.click_to_edit = "Click to edit";
		lang.press_on = "Press on";
		lang.to_edit = "to edit";
		lang.choose = "Choose";
		lang.everything = "Everything";
		lang.EVERYTHING = "EVERYTHING";
		lang.nothing = "Nothing";
		lang.apply = "Apply";
		lang.carryout = "Carry out";
		lang.filter = "Filter";
		lang.filter_regex = "Filter (regex)";
		lang.neutral = "Neutral";
		lang.on = "On";
		lang.off = "Off";
		lang.show_max = "Show max.";
		lang.options = "options"; // keep lowercase
		lang.sort_by_freq = "Sort by freq";
		lang.sort_alphabetically = "Sort alphabetically";
		lang.row = "Row";
		lang.in_column = "in column";
		lang.succeeded = "Succeeded";
		lang.failed = "Failed";
		lang.beware = "Beware";
		lang.cancel = "Cancel";
		lang.cancelled = "Cancelled";
		lang.reset = "Reset";
		lang.response = "Response";
		lang.unknown = "Unknown";
		lang.database_info = "Database info";
		lang.empty_table = "No results";
		lang.loading_records = "Loading data from the database...";
		lang.loading_from_server = "The data is being loaded from the server";
		lang.access_denied = "Access denied";
		lang.hold_ctrl_for_multiple_choice = "keep CTRL pressed for multiple selection";
		lang.close = "Close";

		// project
		lang.welcome = "Welcome to Lex'it";
		lang.choose_a_project = "Choose a project";
		lang.production = "Production";
		lang.goodies = "Goodies and tools";
		lang.in_development = "In development";
		lang.project_closed = "Closed";
		lang.project_unknown = "Unknown";

		// table selection
		lang.choose_a_table = "Choose a table: <I>(first press "+(lang.isMac?"Command":"CTRL")+" & click to add a table, or press SHIFT & click to open it in a new tab)</I>";
		lang.choose_a_table_default_value = "Choose a table";

		// table loading
		lang.data_is_being_loaded = "Data is being loaded";
		lang.no_results_modify_your_query = "No results. Try another search word.";

		// table export
		lang.export_toclipboard = "To clipboard";
		lang.export_excel = "Excel";
		lang.export_pdf = "PDF";
		lang.export_print = "Print";

		// header
		lang.header_info_empty = "No results";
		lang.header_info_filtered = " (out of _TOTALPLUSMN__MAX_ rows)";
		lang.header_main_search = "Search whole table:";
		lang.header_search_and_replace_button = "Search & Replace";
		lang.header_search_and_replace_denied = "It is not allowed to modify the text fields of this table";
		lang.header_search_and_replace_safemode = "(safe mode: operations applied to screen data only)";
		lang.header_search_and_replace_replacethisby = "replace it by";
		lang.header_search_and_replace_addthis = "add this";
		lang.header_search_and_replace_searchforthis = "Look for [regex]";
		lang.header_search_and_replace_in = " in ";
		lang.header_search_and_replace_and = "and";
		lang.header_search_and_replace_test = "Test effect";
		lang.header_search_and_replace_emptyfields = "Empty fields";

		lang.search_help = "Query builder";
		
		lang.search_help_msg = "Compose your search query (Keep "+(lang.isMac?"Command":"CTRL")+" pressed for multiple selection)";
		lang.search_help_search_for_contrary = "Search for contrary of selection";
		lang.search_help_search_for_exact_match = "Search for exact matches";


		lang.header_selection_button_on = "Selectie AAN";
		lang.header_selection_button_off = "Selectie UIT";
		
		lang.header_goto_button = "Ga naar";
		lang.header_goto_no_search_term = "Type in a search term in a box above a column, and click on 'Go to'!";
		lang.header_goto_missing_sort = "The table is not sorted by any column. " +
				"The 'Go to' function doesn't work if the table isn't sorted. Sort the table by a column now.";
		lang.header_goto_building_index = "Lex'it is now building an index of all occurrences of this word.<BR>" +
				"(this might take a few seconds, but this needs to happen only once!)<BR>" +
				"<BR>" +
				"Just a moment...";

		lang.header_x_rows_found = "_PLUSMN__TOTAL_ row(s) found";
		
		lang.header_show = "Show";
		lang.header_rows = "rows";
		lang.header_all = "all";

		lang.click_to_add_a_note = "Click to add notes";
		lang.table_notes = "Table notes";
		lang.job_started_on = "Job started on";
		lang.job_finished_on = "Job finished on";
		lang.job_processed_on = "Job processed on";
		lang.job_notes = "Notes";
		lang.note_was_added = "The notes were saved.";
		lang.no_note_was_saved = "No note was saved.";
		lang.error_at_saving_note = "An error occured when saving the table notes.";
		lang.error_at_reading_note = "An error occured when reading the table notes.";

		lang.reset_button = "Reset";
		lang.columns_selection = "Columns selection";
		lang.columns_selection_and_order = "Columns selection and order";
		lang.columns_selection_optimal_mode = "Columns selection  (Optimal mode is ON: empty columns are automatically hidden)";
		lang.columns_selection_optimal_apply_msg = "Apply and close this window";
		lang.columns_selection_optimal_cancel_msg = "Cancel and close this window";
		lang.columns_selection_optimal_label = "Optimal mode";
		lang.columns_selection_optimal_tooltip = "Hide empty columns automatically, so as to prevent the table from getting too broad";
		lang.columns_selection_select_all = "Select all columns";
		lang.columns_selection_deselect_all = "Deselect all columns";
		lang.columns_selection_reset_default = "Restore default";
		lang.columns_selection_reset_default_msg = "Restore original table configuration";
		lang.view_type_button = "Form/table view";
		lang.refresh_button = "Refresh [F5]";
		lang.goto = "Go to";
		lang.goto_button = "Go to word<BR>[+Shift: to row/page]";
		lang.goto_enter = "Go to (type in one value):";
		lang.goto_rownumber = "Row number";
		lang.goto_pagenumber = "Page number";
		lang.goto_you_must_enter_a_number = "You must enter a row or page number!";

		lang.turn_row_selection_on = "Turn row selection ON [F2]";
		lang.turn_row_selection_off = "Turn row selection OFF [F2]";
		lang.help_button = "Help";
		lang.undo_button = "Undo function: nothing to undo.<BR>[+ Shift: restore previous selection]";
		lang.undo_restore_msg1 = "Restore";
		lang.undo_restore_msg2 = "in row";
		lang.undo_restore_msg3 = "of column";
		lang.undo_are_you_sure = "Are you sure you want to undo";

		// pagination
		lang.paginate_first = "First";
		lang.paginate_previous = "Previous";
		lang.paginate_next = "Next";
		lang.paginate_last = "Last";


		// error message
		lang.loading_xml_failed = "Loading XML failed";
		lang.error = "Error";
		lang.error_button_config = "This button has no function assigned yet.";
		lang.some_error_has_occurred = "Something went wrong";
		lang.error_occurred_in_table = "An error occurred in table";
		lang.error_when_calling = "An error occurred when calling";
		lang.error_column_doesnot_exist = "This column does not exist";
		lang.error_function_called_with_illegal_value = "The function was called with an illegal value";
		lang.error_function_called_with_illegal_value_input = "Input";
		lang.error_function_called_with_illegal_value_expected = "Expected";
		lang.error_table_has_no_row_ids = "The Table has no IDs. Pointing at rows without IDs is impossible. " +
				"[The response of the server has probably no value for DT_RowId " +
				"because the table has nor primary key nor pkid column; " +
				"BEWARE: multicolumns primary keys are not supported (yet)]";
		lang.columns_list_mismatch = "The columns list in \"column_order\" (in the config file) doesn't match the true list of columns.<BR><BR>Cause";
		lang.columns_list_number_mismatch1 = "The number of columns isn't equal.<BR><BR>Number of columns in the database";
		lang.columns_list_number_mismatch2 = "Number of columns according to the configuration";
		lang.columns_list_name_mismatch1 = "Some column names are different.<BR><BR>The database table contains";
		lang.columns_list_name_mismatch2 = "But the configuration calls";
		lang.loading_projects_list_failed = "Projects list file 'projects_overview.js' doesn't exist or it may contain errors.";
		lang.reading_internal_separator_failed = "Lex'it wasn't able to read the internal separator string";
		lang.saving_active_tab_failed = "Lex'it wasn't able to save the active tab.";
		lang.reading_the_list_of_config_files_failed = "Lex'it wasn't able to read the list of configuration files.";
		lang.opening_config_file_failed = "The config file doesn't exist or it may contain errors.";
		lang.file_is_missing = "might not have any configuration file left on the server";
		lang.missing_database_indexes = "No indexes available for the current sorting columns.<BR>" +
						"This may cause database operations to be too slow.<BR><BR>" +
						"Columns at stake:";
		lang.inform_admin = "Please inform the administrator.";
		lang.error_opening_hidden_table = "You're trying to open this table, " +
				"but according to the configuration it should remain hidden. " +
				"See oShowOnlyTables or oHiddenTablesList in file";
		lang.already_loaded = "This table is loaded already";
		lang.error_while_building_searchbox = "An error occurred when building the search box";
		lang.error_highlight = "The highlight positions in fn.getHighlight() are not declared properly. " +
					"The positions must be declared in an array of arrays: [[a1,b1], [a2,b2], [a3,b3]].";
		lang.error_function_called_with_api_instance = "was called with an API instance. That is not allowed! Use a function from the fx-namespace instead, or replace the API instance by a node";
		lang.error_function_called_with_jquery_object = "was called with a jQuery object. That is not allowed! Use a node instead";

		lang.keep_filter_warning = "Parameter 'keepfilter: true' only works when the 'filter' parameter was set";
		lang.sort_column_warning1 = "A column of some table was set as sorting column, but this column doesn't exist. " +
					"Remove this column name from the config file";
		lang.sort_column_warning2 = "Table";
		lang.sort_column_warning3 = "Column";
		lang.display_differs_from_selection = "Diplay differs from selection. Please refresh the table";
		lang.editcallback_warning1 = "Parameter 'editcallback' can't be used in combination with 'editfunc'. " +
							"Put the callback argument of your fn.updateDatabase function in 'editfunc' instead ";
		lang.editcallback_warning2 = "Table";
		lang.editcallback_warning3 = "Column";
		lang.formlist_synchronize_forgotten = "Couln't read the form list targetting table 'TABLENAME'.<BR><BR>The 'synchronize_with' parameter might not be set properly.";
		lang.formlist_save_first_after_row_creation = "You've just added this row. To be able to see/edit content connected to it, you must save the row first by click the 'Save' button.";
		lang.formlist_save_first_before_overwriting = "You've about to load new data in 'LISTSNAMES', while it contains unsaved content.<BR>To be able to carry on, you must click the 'Save' button first.";
		lang.formlist_select_a_row_first = "You need to first select a row in the 'LISTNAME' list.";

	}

	// unknown language code
	else {
		fn.message("Error", "Unknown language code: "+sLanguageCode);
	}

}


 


