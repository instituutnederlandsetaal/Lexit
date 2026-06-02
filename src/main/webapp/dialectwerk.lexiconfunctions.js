

var dialectfn = {}; 


// for adding/deleting dialect lemmata  
//
dialectfn.addNewDialectLemma = function(t){

		// make sure focus is gone from buttons, otherwise striking Enter will have confusing effect!
		var $focused = $(':focus');
		$focused.blur();

		fn.prompt("Nieuw lemma aanmaken", ["lemma", "lemma_pos"], [], function(resp){ 

			var args = [ 	resp["lemma"], 
							resp["lemma_pos"] 
						];
			fn.callFunction("data.add_dialect_lemma", args, 
				function(resp){
					
					var iNewDilectId = resp["add_dialect_lemma"];

					fn.addDrawCallback(t, function(){
						setTimeout(function(){

							if (fn.getViewType(t) == 'table'){

								fn.unselectAllRowNodes(t);
								var nRow = fn.getRowNodeWhere(t, {"dialect_id": iNewDilectId});
								fn.selectRowNode(nRow);

                                /*
								if (fn.tableExists("senses")){
									setTimeout(function(){

										fn.callTable("senses", {"dialect_id": iNewDilectId}, function(){
											fn.callTable("examples", {"dialect_id": iNewDilectId}, function(){
												
												if ( fn.tableExists("paradigm")){
													fn.callTable("paradigm", {"dialect_id": iNewDilectId}, function(){
														fn.pileupTables("senses", "paradigm");
													});
												}
											});
										});
									}, 500);
								}
								*/
							}
							
						}, 500);
					});

					if (fn.getViewType(t) == 'table'){
						fn.goToTheRightPage(t, "dialect_id", iNewDilectId);
					}
					else { 
						fn.callTable(t, {"dialect_id": iNewDilectId});
					}
					
				},
				function(err){
					fn.message("Fout", "Er ging iets mis!", function(){fn.refreshTable(t);});
				});

		});
};

dialectfn.removeDialectLemma = function(t){

	var sTableName = fn.getTableName(t);
	var sViewType = fn.getViewType(t);
	var iNumberSelected = fn.getNumberOfSelectedRowNodes(t);

	if (sViewType == 'form' && iNumberSelected!= 1){
		fn.selectRowNode(t, 0);
	}
	var nRow = fn.getFirstSelectedRowNodeFrom(t);


	if (sViewType == 'table' && (nRow == null || iNumberSelected!=1) ){
		fn.message("Fout", "Selecteer één rij om te verwijderen!");
	}
	else {

		var sDialectLemma = fn.getDataFromCellInRowNode(nRow, "dialect_lemma");

		fn.confirm("Let op!", "het geselecteerde dialectlemma '"+sDialectLemma+"' zal worden verwijderd.<BR><BR>Weet u het zeker?", function(t){

			var sDialectId = fn.getRowNodeId(nRow);
			fn.callFunction("data.remove_dialect_lemma", [sDialectId], 
				function(){
					setTimeout(function(){
						fn.refreshTable(sTableName);
					}, 200);
				});

		},
		function(){
			fn.message("Ok", "Operatie door gebruiker geannuleerd.");
		});

	}						
};


// for adding/deleting Nederlands Lemmata 
//
dialectfn.addNewNederlandsLem = function(t){

	// make sure focus is gone from buttons, otherwise striking Enter will have confusing effect!
	var $focused = $(':focus');
	$focused.blur();

	fn.prompt("Nieuw lemma aanmaken", ["lemma", "lemma_pos"], [], function(resp){

		var args = [ resp["lemma"], resp["lemma_pos"] ];
		fn.callFunction("data.add_nederlands_lem", args, 
			function(resp){
				
				var iNewNederlandsId = resp["add_nederlands_lem"];

				fn.addDrawCallback(t, function(){
					setTimeout(function(){
						fn.unselectAllRowNodes(t);
						var nRow = fn.getRowNodeWhere(t, {"ned_id": iNewNederlandsId});
						fn.selectRowNode(nRow);
					}, 500);
				});
				fn.goToTheRightPage(t, "ned_id", iNewNederlandsId);
				
			},
			function(err){
				fn.message("Fout", "Er ging iets mis!", function(){fn.refreshTable(t);});
			});

	});
};

dialectfn.removeNederlandsLem = function(t){

	var sTableName = fn.getTableName(t);
	var iNumberSelected = fn.getNumberOfSelectedRowNodes(t);
	var nRow = fn.getFirstSelectedRowNodeFrom(t);

	if ( nRow == null || iNumberSelected!=1 ){
		fn.message("Fout", "Selecteer één rij om te verwijderen!");
	}
	else {

		var sNederlandsLem = fn.getDataFromCellInRowNode(nRow, "modern_lemma");

		fn.confirm("Let op!", "Het geselecteerde lemma '"+sNederlandsLem+"' zal worden verwijderd.<BR><BR>Weet u het zeker?", function(t){

			var sNederlandsLemId = fn.getRowNodeId(nRow);
			fn.callFunction("data.remove_nederlands_lem", [sNederlandsLemId], 
				function(){
					setTimeout(function(){
						fn.refreshTable(sTableName);
					}, 200);
				});

		},
		function(){
			fn.message("Ok", "Operatie door gebruiker geannuleerd.");
		});

	}
};




