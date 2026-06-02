

/**
 * Make sure that the selected row in the wordforms/types table
 * keeps selected if we says so!
 * 
 * @param {Node} the row node to keep selected 
 */
wordforms.keepRowSelected = function(nRow){

	var aRows = fn.getAllRowNodes("wordforms");

	// if table is empty, a row can't be selected
	if (aRows.length == 0)
		return;

	// if input row is empty, choose first one 
	if (nRow == null){		
		nRow = aRows[0];
	}

		
	// trick to get the row, because it can't be 
	// accessed anymore when the table has been refreshed (so nasty!)
	var t = fn.getTableName(nRow);
	nRow = fn.getRowNodeWhereIdIs(t, nRow.id);

	// if some filter is applied to the wordforms table,
	// the row might be out of sight
	if (nRow == null)
		return;

	// remove current screen selection
	// and select the row that is supposed to be selected 
	fn.unselectAllRowNodes(t); 
	fn.selectRowNode(nRow);

	// the selected row must be unwrapped (no ellipsis)
	$(fn.getCellInRowNode(nRow, "corpus_analyses")).find("div").css("white-space", "normal");
	$(fn.getCellInRowNode(nRow, "lexicon_suggestions")).find("div").css("white-space", "normal");	

	// update table alignment after ellipsis is applied
	fn.pileupTables("wordforms", "worktable");
};




/**
 * Get the selected row in wordforms, in a robust way
 */
wordforms.getSelectedRow = function(){

	// trick to get the row, because it can't be 
	// accessed anymore when the table has be refreshed or so (so nasty!)
	return fn.getRowNodeWhereIdIs("wordforms", wordforms.nSelectedWordform.id);
	
};