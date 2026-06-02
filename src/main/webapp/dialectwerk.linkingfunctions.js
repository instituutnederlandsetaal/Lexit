

var dialectlinking = {};

// --------------------------------------------------------------------------------------
// FUNCTIONS (AS GENERIC AS POSSIBLE)
// --------------------------------------------------------------------------------------

// Build a link, given some selected row(s) in the dialect table 
//               and some selected row(s) in the Nederlands table.

dialectlinking.buildLink = function(){

	// editable cell was just clicked (edited): Enter was probably stricken after edition, so linking is not intended here
	if (
		$(lastClicked).hasClass("opmerking") || 
		$(lastClicked).hasClass("lemma_pos") || $(lastClicked).hasClass("dialect_pos") ||
		$(lastClicked).hasClass("nederglos") || $(lastClicked).hasClass("dialect_glos")
	)
		return true;
	
	// get the selected rows on both sides
	
	var oSelectedRowsDialect = 		fx.getSelectedRowsFrom( sDialectTableName );
	var oSelectedRowsNederlands =	fx.getSelectedRowsFrom( sNederlandsTableName );
	
	
	// loop through selected rows on dialect side
	
	oSelectedRowsDialect.every(function(){
		
		var oDialectRow = this;		
		var sDialectId = 		fx.getDataFromCellInRow( oDialectRow, sIdColumn_in_DialectTable );
		var sDialectLem = 		fx.getDataFromCellInRow( oDialectRow, "dialect_lemma" );
		var sDialectGram = 		fx.getDataFromCellInRow( oDialectRow, "dialect_pos" );		
		var sDialectGlos = 		fx.getDataFromCellInRow( oDialectRow, "dialect_glos" );
		var sDialectBron = 		fx.getDataFromCellInRow( oDialectRow, "bron" );
		var bLastDialectRow =	fx.isLastRowOf( oDialectRow, oSelectedRowsDialect );

		fx.updateDatabaseGivenACellOrRow(oDialectRow, {"linked": true});
		
		// loop through selected rows on Nederlands side
		
		oSelectedRowsNederlands.every( function(){
			
			var oNederlandsRow = this;		
			var sNederlandsId = 		fx.getDataFromCellInRow( oNederlandsRow, sIdColumn_in_NederlandsTable );
			var sNederlandsLem = 		fx.getDataFromCellInRow( oNederlandsRow, "modern_lemma" );
			var sNederlandsGram = 		fx.getDataFromCellInRow( oNederlandsRow, "lemma_pos" );
			var sNederlandsGlos = 		fx.getDataFromCellInRow( oNederlandsRow, "nederglos" );
			var sNederlandsBron = 		fx.getDataFromCellInRow( oNederlandsRow, "bron" );
			var bLastNederlandsRow =	fx.isLastRowOf( oNederlandsRow, oSelectedRowsNederlands );

			fx.updateDatabaseGivenACellOrRow(oNederlandsRow, {"linked": true});
			
			// add link between selected  and Nederlands rows
			
			(function(){
				
				var aArr = new Array();
				aArr[ sDialectIdColumn_in_CrossView ] = 	sDialectId;
				aArr[ sNederlandsIdColumn_in_CrossView ] =	sNederlandsId;
				aArr[ "method"] = 'Manual';
				
				aArr[ "modern_lemma"] = sNederlandsLem;
				aArr[ "lemma_pos"] = sNederlandsGram;		
				aArr[ "nederglos"] = sNederlandsGlos;
				aArr[ "neder_bron"] = sNederlandsBron;
				
				aArr[ "dialect_lemma"] = sDialectLem;
				aArr[ "dialect_pos"] = sDialectGram;
				aArr[ "dialect_glos"] = sDialectGlos;
				aArr[ "dialect_bron"] = sDialectBron;
								
				
				fn.insertIntoDatabase( sCrossViewName, aArr, null, function(){
					
					// Last rows combination reached? 
					// We are done, so refresh the tables!
					
					if ( bLastDialectRow && bLastNederlandsRow ){
						console.log("Refresh tables");
						setTimeout(function(){

							//fn.refreshTable( sCrossViewName );
							fn.callTable(sCrossViewName, {"dialect_lemma": "^"+fn.escapeRegexChars(sDialectLem), "modern_lemma": "^"+fn.escapeRegexChars(sNederlandsLem) });
							fn.refreshTable( sDialectTableName, function(){

								setTimeout(function(){
									fx.selectRow(oDialectRow);
								}, 500);
								
							} );
							fn.refreshTable( sNederlandsTableName, function(){

								setTimeout(function(){
									fx.selectRow(oNederlandsRow );
								}, 500);
								
							} );
							

						}, 500);
						
					}
				});
				
			})();	
			
			
		});
		
	});
}


// Undo a link, given a selected row in the cross table view

dialectlinking.undoLink = function(){
	
	fn.confirm("Let op", "Weet u zeker dat u de geselecteerde links ongedaan wilt maken?", 
			
		function(){
		
			// get selected link pair
		
			var oSelectedLinkRow = fx.getSelectedRowsFrom( sCrossViewName );
		
			// loop through selected rows 
		
			oSelectedLinkRow.every( function(){
				
				var oCurrentRow = this;		
				var sDialectId = 	fx.getDataFromCellInRow( oCurrentRow, sDialectIdColumn_in_CrossView );
				var sNederlandsId = 	fx.getDataFromCellInRow( oCurrentRow, sNederlandsIdColumn_in_CrossView );
				
				// remove link between selected dialect and Nederlands rows

				var aArr = new Array();
				aArr[ sDialectIdColumn_in_CrossView ] = sDialectId;
				aArr[ sNederlandsIdColumn_in_CrossView ] = sNederlandsId;
				
				fn.removeFromDatabaseGivenFieldValues( sCrossViewName, aArr, function(){

					fn.callFunction("data.set_unlinked", [sDialectId, sNederlandsId]);
					
					// Last rows combination reached? 
					// We are done, so refresh the tables!
					
					var bLastRow = fx.isLastRowOf( oCurrentRow, oSelectedLinkRow );
					
					if (bLastRow){
						fn.refreshTable( sCrossViewName );
						fn.refreshTable( sDialectTableName );
						fn.refreshTable( sNederlandsTableName );
					}
				});
				
			});
		}, 
		function(){
			fn.message("OK", "Operatie door gebruiker geannuleerd.");
		}
	);
	
};