oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {};

modsynconfig = {
                        ok: {"editable": true},
                        comment:  {"editable": true},
                        lemma_id: {
                                "click": function(t, n){
                                        var sId = fn.getDataFromCellNode(n, "lemma_id");
                                        var senseId = fn.getDataFromSiblingNode(n, "sense_id");
                                        window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+sId + "&Betekenis_id=" + senseId);
                                }
                        }
                };
modsynconfigPlus = {
                        ok: {"editable": true},
                        comment:  {"editable": true},
			extra_syn: {"editable": true},
                        lemma_id: {
                                "click": function(t, n){
                                        var sId = fn.getDataFromCellNode(n);
                                        var senseId = fn.getDataFromSiblingNode(n, "sense_id");
                                        window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+sId + "&Betekenis_id=" + senseId);
                                }
                        }
                };

oTableConfigurationList = {
 mnw_alldefs: modsynconfigPlus
}
