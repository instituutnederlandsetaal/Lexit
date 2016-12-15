oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {

log_en_corpus:
{
  "column_order": ["word",
                                         "correctie",
                                         "correctie_correctie",
                                         "add_to_database",
                                         "comment",
                                         "pos",
                                         "logfreq",
                                         "freq",   
                                         "tellertje"
                                          ]
}
};


oTableConfigurationList = 
{
 log_en_corpus:
 {
   add_to_database: {"editable": true },
   correctie_correctie: {"editable":true},
   comment: {"editable":true}
  }
};
