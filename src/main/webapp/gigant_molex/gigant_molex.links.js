
var molexlinks = {};


molexlinks.settings = {
	
	external_links: {
		
		"button_0": {

			"name": "Full refresh",
			"click": function(t, n){

				fn.confirm("Zeker weten?", "Alle hier geregistreerde links zullen worden gewist en vervolgens opnieuw geladen.<BR><BR>"+
					"Dit kan een paar tientallen minuten duren.<BR><BR>"+
					"Weet u zeker dat u verder wilt? (incrementeel verversen is veel sneller)", 
				function(){

					// Get the total number of rows:
					// We will use this number (as rough max value) to render a progress indicator
					var iToBeLoaded = 0;

					fn.callFunction(sApiSchema+".external_links_get_total", [], function(resp){

						iToBeLoaded = parseInt(resp["external_links_get_total"]);

					});

					fn.prompt(["Veiligheidscode", "Tik de veiligheidscode"], ["Code"], [""], function(resp){

						if (resp["Code"] == (new Date().getDate() + new Date().getHours())){ // code is day number (1-31) + hours (0-23)

							var iLoaded = 0;
							var iStep = 100;
							var iStartTime = new Date().getTime();

							fn.message("OK", "Eerst tabel leegmaken...");
							setTimeout(function(){
									
									fn.closeDialog();

									// truncate table before reloading
									//
									fn.callFunction(sApiSchema+".external_links_truncate", [], function(){


										var sStartParameters = "/dws/api/external-links/molex?limit="+iStep;

										// declare 1st function to run : for loading Combi links
										//         ===
										var fnCombiLoad = function(sParams){

											fn.callService(sCombiApiURL + sParams, [], "GET", "xml", function(xmlDoc){

												var s = new XMLSerializer();
												var newXmlStr = s.serializeToString(xmlDoc);
												newXmlStr = newXmlStr.regexReplaceAll("\<srcPid\>.+?\</srcPid\>", "")
															.regexReplaceAll("\<srcPidType\>.+?\</srcPidType\>", "")
															.regexReplaceAll("\<srcPidDescription\>.+?\</srcPidDescription\>", "")
															.regexReplaceAll("\<dstResource\>.+?\</dstResource\>", "")
															.regexReplaceAll("\<status\>.+?\</status\>", "");

												setTimeout(function(){

													iLoaded += iStep;
													fn.closeDialog();
													fn.message("Een ogenblik aub", "(1/5) Combi-links bijwerken...<BR><BR><BR>"+
														"<center>Loaded:"+iLoaded+"<BR>"+
														"<progress value=\""+(iLoaded>iToBeLoaded?iToBeLoaded:iLoaded)+"\" max=\""+iToBeLoaded+"\"></progress><BR><BR>"+
														"Remaining (estimated) time: "+ molexutils.getTimeLeft(iStartTime, iLoaded, iToBeLoaded)+
														"</center>");


													// parse the service response in the database, so as to add links to the list
													//
													fn.callFunction(sApiSchema+".external_links_process_xml", ['Combi', newXmlStr], function(funcResp){

														var sNewParams = funcResp["external_links_process_xml"];
														
														if (sNewParams != ''){
															fnCombiLoad(sNewParams.replace(/&amp;/g, '&'));
														}
														else {
															fn.closeDialog();

															// start next 'thread'
															fnAnwLoad(sStartParameters);
														}

													});

												}, 100);

											});
										};

										


										// declare 2nd function to run : for loading ANW links
										//         ===
										var fnAnwLoad = function(sParams){

											fn.callService(sAnwApiURL + sParams, [], "GET", "xml", function(xmlDoc){

												var s = new XMLSerializer();
												var newXmlStr = s.serializeToString(xmlDoc);
												newXmlStr = newXmlStr.regexReplaceAll("\<srcPid\>.+?\</srcPid\>", "")
															.regexReplaceAll("\<srcPidType\>.+?\</srcPidType\>", "")
															.regexReplaceAll("\<srcPidDescription\>.+?\</srcPidDescription\>", "")
															.regexReplaceAll("\<dstResource\>.+?\</dstResource\>", "")
															.regexReplaceAll("\<status\>.+?\</status\>", "");

												setTimeout(function(){

													iLoaded += iStep;
													fn.closeDialog();
													fn.message("Een ogenblik aub", "(2/5) ANW-links bijwerken...<BR><BR><BR>"+
														"<center>Loaded:"+iLoaded+"<BR>"+
														"<progress value=\""+(iLoaded>iToBeLoaded?iToBeLoaded:iLoaded)+"\" max=\""+iToBeLoaded+"\"></progress><BR><BR>"+
														"Remaining (estimated) time: "+ molexutils.getTimeLeft(iStartTime, iLoaded, iToBeLoaded)+
														"</center>");

													// parse the service response in the database, so as to add links to the list
													//
													fn.callFunction(sApiSchema+".external_links_process_xml", ['ANW', newXmlStr], function(funcResp){

														var sNewParams = funcResp["external_links_process_xml"];
														
														if (sNewParams != ''){
															fnAnwLoad(sNewParams.replace(/&amp;/g, '&'));
														}
														else {
															
															fnAddAndCleanUpLemmata();
														}

													});

												}, 100);
												

											});
											
										};


										// declare 3rd function to run : for updating and cleaning up lemmata list 
										//         ===
										var fnAddAndCleanUpLemmata = function(){

											fn.closeDialog();
											fn.message("Een ogenblik aub", "(3/5) Molex lemmatalijst bijwerken...");

											setTimeout(function(){
											
												// add new standholders for new not-yet-linked lemmata
												// and remove unnecessary standholders for lemmata that are now linked
												//       
												fn.callFunction(sApiSchema+".external_links_add_missing_lemmata", [], function(){

													// add RBN

													fn.closeDialog();
													fn.message("Een ogenblik aub", "(4/5) RBN/Vertaalwoordenschat-links bijwerken...");

													setTimeout(function(){
														fn.callFunction(sApiSchema+".external_links_load_rbn", [], function(){

															// add Banlijst

															fn.closeDialog();
															fn.message("Een ogenblik aub", "(5/5) Banlijst toevoegen...");

															setTimeout(function(){
																fn.callFunction(sApiSchema+".external_links_load_banlijst", [], function(){

																	// we are finished:
																	// as a final step, register the refresh date
																	// 
																	fn.closeDialog();
																	fn.message("Een ogenblik aub", "Afronden...");

																	setTimeout(function(){

																		fn.callFunction(sApiSchema+".external_links_update_has_el", [], function(){

																			var sLastRefreshDate = fn.getCurrentTimestamp("YYYY-MM-DD HH:MI");
																			fn.callFunction(sApiSchema+".external_links_set_full_refresh_date", [sLastRefreshDate], function(){

																					fn.closeDialog();
																					fn.refreshTable(t, function(){																							
																						fn.setCustomButtonName(t, 0, "Full refresh [last:"+sLastRefreshDate+"]");
																					});

																			});
																				
																			
																		});

																	}, 100);
																	
																});

															}, 100);

														});

													}, 100);

												});

											}, 100);

										};
										

										// Start loading!!!

										setTimeout(function(){
											
											// this will call the other functions, nested in each other!
											fnCombiLoad(sStartParameters);

										}, 100);

									});

							}, 100);

							

						}
						else {
							fn.message("OK", "Helaas pindakaas");
						}

					});

				},
				function(){
					fn.message("OK", "Operatie door gebruiker geannuleerd.")
				}); // end of confirm

			}

		},

		"button_1": {

			"name": "Incremental refresh",
			"bgcolor": "red",
			"click": function(t, n){


				setTimeout(function(){

						// Get the number of days since the previous incremental refresh
						//
						fn.callFunction(sApiSchema+".get_number_of_day_since_previous_incremental_refresh", [fn.getCurrentTimestamp("YYYY-MM-DD HH:MI")], function(daysResp){

							var iLastEdit = parseInt(daysResp["get_number_of_day_since_previous_incremental_refresh"]) + 1;

							fn.closeDialog();
							fn.message("Een ogenblik aub", "(1/3) ANW/Combi-links van afgelopen "+
								(iLastEdit>1 ? iLastEdit+" dagen" : "dag")+" bijwerken...");

							// Part 1/3 of the incremental refresh:
							// -----------------------------------

							// get the new links since the last update
							// and insert those in the external links table
							//
							// (since this incremental, NO deletion in the Combi/ANW update!)

							fn.callService(sLinksToMolexApiURL + "/links", {"lastedit": iLastEdit}, "GET", "json", function(jsonDoc){

								var aLinks = jsonDoc["links"];	


								// now we have all the new links, process them all!

								var fnProcessJson = function(oOneLink){

									var errorMsg = oOneLink["ERROR"];

									if (errorMsg == null){
										// process the link
										var sSrcResource = oOneLink["srcResource"];
										sSrcResource = (sSrcResource.toLowerCase() != 'anw' ? sSrcResource.charAt(0).toUpperCase() + sSrcResource.slice(1).toLowerCase() : sSrcResource.toUpperCase()); // capital first letter
										var sArticleLemma = oOneLink["articleLemma"];
										var sArticlePid = oOneLink["articlePid"];
										var sDstId = oOneLink["dstId"];

										// insert the link
										fn.callFunction(sApiSchema+".external_links_update", [sSrcResource, sArticleLemma, sArticlePid, sDstId]);
									}
									else {
										fn.message("Error", errorMsg);
										setTimeout(function(){
											// do nothing
										},
										5000);
									}
								};

								// loop the previous function till we're done!
								while ( (oOneLink = aLinks.shift()) != null){
									fnProcessJson(oOneLink);
								}



								// Part 2/3 of the incremental refresh:
								// -----------------------------------
								//
								// add RBN
								// (this update is not incremental: we delete all the links, and copy all the data [-]including possibly new data] from the RBN schema)

								fn.closeDialog();
								fn.message("Een ogenblik aub", "(2/3) RBN/Vertaalwoordenschat-links bijwerken...");

								setTimeout(function(){
									fn.callFunction(sApiSchema+".external_links_load_rbn", [], function(){

										fn.closeDialog();
										fn.message("Een ogenblik aub", "(3/3) Molex lemmatalijst bijwerken...");


										// Part 3/3: fill the gaps: 
										//
										// add new standholders for new not-yet-linked lemmata
										// and remove unnecessary standholders for lemmata that are now linked
										//
										fn.callFunction(sApiSchema+".external_links_add_missing_lemmata", [], function(){

											fn.closeDialog();
											fn.message("Een ogenblik aub", "Afronden...");

											setTimeout(function(){

												fn.callFunction(sApiSchema+".external_links_update_has_el", [], function(){

													var sNewIncrementalDate = fn.getCurrentTimestamp("YYYY-MM-DD HH:MI");
													fn.callFunction(sApiSchema+".external_links_set_incremental_refresh_date", [sNewIncrementalDate], function(){

														fn.closeDialog();
														fn.refreshTable(t, function(){
															fn.setCustomButtonName(t, 1, "Incremental refresh [last:"+sNewIncrementalDate+"]");
														});
														
													});
												});
											}, 100);
																							
										});	

									},
									function(){
										fn.closeDialog();
										fn.message("Fout", "Fout bij RBN links ");
									});

								}, 100);


							}); // end of service call

						}); // end of get nr of days call

					

				});

			}			
		},

		"callback": function(t, n){

			// get and display the last refresh date of the table data

			fn.callFunction(sApiSchema+".external_links_get_full_refresh_date", [], function(resp){

				var sLastFullRefreshDate = resp["external_links_get_full_refresh_date"];
				fn.setCustomButtonName(t, 0, "Full refresh [last:"+sLastFullRefreshDate+"]");
			});


			fn.callFunction(sApiSchema+".external_links_get_incremental_refresh_date", [], function(resp){

				var sLastIncrementalRefreshDate = resp["external_links_get_incremental_refresh_date"];
				fn.setCustomButtonName(t, 1, "Incremental refresh [last:"+sLastIncrementalRefreshDate+"]");
			});
		}

	}
	
};



molexlinks.config = {
	
	external_links: {

		"linked": {
			"filter": true
		},

		"resource_lemma_id_old": {
			visible: false
		},

		"resource_extra_old": {
			visible: false
		},

		"resource_type": {
			"choosefrom": []
		}
	}
	
};