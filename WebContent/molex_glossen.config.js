// list of tables that must be hidden
oShowOnlyTables = ["new_jvk_gb_lemma_combined"];


var iCycleColor = 1;
var sLastId;
//table general settings
oTableSettingsList = {
		
		new_jvk_gb_lemma_combined:{
			
			"button_0":	{
				"name": "Verwijder lemma",
				"click": function(t){
					var aRows = fn.getSelectedRowsFrom(t);
					if (aRows.length!=1)
						alert("Selecteer een rij om te verwijderen (één tegelijk)");
					else
						{
						var zekerWeten = confirm("Weet u het zeker?");
						if (zekerWeten)
							fn.updateDatabaseGivenANode(t, aRows[0], ["throw_away"], [true], true);
						}
					}
				},
			
			"nice_name": "Glossentabel",
			
			"callback": function(t){
				
				
				// make double rows visible
				
				// if special color class does not exist yet, create it
				if ( !$(".double_row_class1")[0])
					{
					$("html > head").append("<style type='text/css'>.double_row_class1 {background-color: #F2F5A9 !important}</style");
					}
				if ( !$(".double_row_class2")[0])
					{
					$("html > head").append("<style type='text/css'>.double_row_class2 {background-color: #F6E3CE !important}</style");
					}
				
				fn.getAllRows(t).each(function(){
					
					var bIsUnique = fn.getDataFromCellInRowNode(t, this, "jvk_not_unique");
					if (bIsUnique == 't')
						{
						var sCurrentId = fn.getDataFromCellInRowNode(t, this, "lemma_id");
						if (sCurrentId != sLastId)
							iCycleColor++;
						if (iCycleColor>2)
							iCycleColor = 1;
						fn.getCellElement(t, this, "lemma").addClass("double_row_class"+iCycleColor);
						sLastId = sCurrentId;
						}
				});
				
				
				// generate tooltip showing the paradigm
				var aAllRows = fn.getAllRows(t);
				aAllRows.each(function(){

										
					for (var i=0; i<mt.getListOfVisibleColumnsOf(fn.getTableName(t)).length; i++)
						{
						var sCellName = mt.getListOfVisibleColumnsOf(fn.getTableName(t))[i];
						if (sCellName == 'lemma')
							{
							var eLem = fn.getCellElement(t, this, sCellName);
							var sParadigm = fn.getDataFromCellInRowNode(t, this, "jvk_paradigm");
							if (sParadigm=='') sParadigm = '[Geen paradigma]';
							// add space to allow the tag to be split up automatically if it is too long					
							$(eLem).attr("title", sParadigm.replace(/,/g, ', '));
							}
						else if (sCellName == 'lem05')
							{
							var eLem = fn.getCellElement(t, this, sCellName);
							var sParadigm = fn.getDataFromCellInRowNode(t, this, "gb_paradigm");
							if (sParadigm=='') sParadigm = '[Geen paradigma]';
							// add space to allow the tag to be split up automatically if it is too long					
							$(eLem).attr("title", sParadigm.replace(/,/g, ', '));
							}
						
						}
				});
			},
			
			"repeat_callback": true,
			
			"column_order": [
			          "hidden_id",
			          "id",
			          "lemma_id",
			          "lemma",
			          "check",
			          "jvk_gloss",
			          "tmp",
			          "keurmerk",
			          "jvk_paradigm",
			          "gb05_id",
			          "gb05_superid",
			          "lem05",
			          "betek05",
			          "orig_pos",
			          "gigant_pos",
			          "simple_pos",
			          "wrdcat05",
			          "znwlid05",			          
			          "gigantpos",
			          "simplepos",
			          "gb_paradigm",
			          "is_unique",
			          "jvk_not_unique",
			          "homonyms_only",
			          "throw_away"
			          ]
		}
		
		
		
};


//configuration at column level
oTableConfigurationList = {
		
		new_jvk_gb_lemma_combined:{
			
			"hidden_id":{
				"visible": false
				},
	        "id":{
	        	"visible": false
	        	},
	        "lemma_id":{
	        	
	        	},
	        "check":{
	        	"editable": true
	        },
	        "lemma":{
	        	"colsort": "asc",
	        	"click": function(t, n){
	        		
	        		var lemma_id = fn.getDataFromSiblingNode(t, n, "lemma_id");
	        		fn.callDatabaseInNewTab("jvk_alles", {"lemma_id": lemma_id}, {"viewtype": "form"}, "lexical_tmp");
	        	}
	        },
	        "jvk_gloss":{	        	 
	        	"editable": true
	        	},
	        "tmp":{
	        	"visible": false
	        	},
	        "orig_pos":{
	        	"visible": false
	        	},
	        "gigant_pos":{
	        	"editable": true
	        	},
	        "simple_pos":{
	        	"editable": true
	        	},
	        "keurmerk":{
	        	"visible": false
	        	},
	        "jvk_paradigm":{
	        	"visible": false
	        	},
	        "gb05_id":{
	        	"bgcolor": "#CEF6CE"
	        	},
	        "gb05_superid":{
	        	"bgcolor": "#CEF6CE",
	        	"visible": false
	        	},
	        "lem05":{
	        	"bgcolor": "#CEF6CE",
	        	"click": function(t, n){
	        		
	        		var lemma_id = fn.getDataFromSiblingNode(t, n, "gb05_id");
	        		fn.callDatabaseInNewTab("GB05_2013", {"id": lemma_id}, {"viewtype": "form"}, "spellinglexicon");
	        	}
	        },
	        "wrdcat05":{
	        	"bgcolor": "#CEF6CE"
	        },
	        "znwlid05":{
	        	"bgcolor": "#CEF6CE"
	        },
	        "betek05":{
	        	"bgcolor": "#CEF6CE"
	        },
	        "gigantpos":{
	        	"bgcolor": "#CEF6CE",
	        	"visible": false
	        	},
	        "simplepos":{
	        	"bgcolor": "#CEF6CE",
	        	"visible": false
	        	},
	        "gb_paradigm":{
	        	"bgcolor": "#CEF6CE",
	        	"visible": false
	        	},
	        "is_unique":{
	        	"visible": false
	        	},
	        "jvk_not_unique":{
	        	"visible": false
        	},
        	"homonyms_only":{
        		
        	},
        	"throw_away":{
        		"filter": false,
        		"keepfilter": true,
	        	"visible": false
        	}
			
		}		

};