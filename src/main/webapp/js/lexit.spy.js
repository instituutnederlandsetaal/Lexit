
var lexitspy = {};


lexitspy.buildUsersSpy = function(){
		
	var getUsersUrl = WEBSERV_URL+"/api/get_users";		
	
	$.ajax({
		type: "GET",
		url: getUsersUrl,
		data: {},
		dataType: "xml",
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		success: function(xml) {
			
			// build the table if it doesn't exist yet
			if ( !$("#spytable").elementExists() ) {
				var spyDiv = $("<div></div>")
					.attr("id", "spydiv");
			
				var spyTable = $("<table></table>")
					.attr("id", "spytable")
					.addClass("display")
					.attr("cellspacing", "0")
				
				var thead = $("<thead></thead>");
				var thead_tr = $("<tr></tr>");
				thead_tr.append( $("<th></th>").text("project_name") );
				thead_tr.append( $("<th></th>").text("active_user") );
				thead_tr.append( $("<th></th>").text("session_id") );
				thead_tr.append( $("<th></th>").text("active_tab") );
				thead_tr.append( $("<th></th>").text("last_active") );
				thead_tr.append( $("<th></th>").text("status") );
				thead.append(thead_tr);
				spyTable.append(thead);
				
				var tfoot = $("<tfoot></tfoot>");
				var tfoot_tr = $("<tr></tr>");
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot.append(tfoot_tr);
				spyTable.append(tfoot);
				
				var tbody = $("<tbody></tbody>");
				
				spyTable.append(tbody);
				spyDiv.append(spyTable);				
				$("#dynamic").append(spyDiv);

				oSpyTable = $('#spytable').DataTable({
					"dom": '<"top"f>t',
					"pageLength": 100,
					"language": {
						"search": "<b>Active projects & users</b><br><br>Filter: "
					}
				}).column(2).order('desc').draw();
				
				
				// remove unneeded links
				$("#headerlinks").hide();
				
			}
			
			// set the width of the filter box
			$("#spytable_filter").removeClass("dataTables_filter");
			
			// remove rows from previous cycle
			oSpyTable.rows().remove();
			
			// add the current info to the table
			$(xml).find("user").each(function(){
				
				var UsersItems = $(this).find("item");
				
				oSpyTable.row.add([
					UsersItems.eq(0).text(),
					UsersItems.eq(1).text(),
					UsersItems.eq(2).text(),
					UsersItems.eq(3).text(),
					UsersItems.eq(4).text().replaceAll(" ", "&nbsp;"),
					UsersItems.eq(5).text().replaceAll(" ", "&nbsp;")
					]);
				});
			
			// sort by column 'last_active'
			oSpyTable.draw();					
			
			// refresh after few seconds
			setTimeout(function(){ lexitspy.buildUsersSpy(); }, 2000);
		},
		error: function(jqXHR, textStatus, errorThrown){
			fn.message(lang.error, lang.loading_xml_failed +": "+textStatus+" "+errorThrown);
		}
	});
	
};

lexitspy.buildConnectionsSpy = function(){
		
	var getConnectionsStateUrl = WEBSERV_URL+"/api/get_connections_state";
	
	$.ajax({
		type: "GET",
		url: getConnectionsStateUrl,
		data: {},
		dataType: "xml",
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		success: function(xml) {
			
			// build the table if it doesn't exist yet
			if ( !$("#connectionstable").elementExists() ) {
				var connectionDiv = $("<div></div>")
					.attr("id", "connectionsdiv");
			
				var connectionTable = $("<table></table>")
					.attr("id", "connectionstable")
					.addClass("display")
					.attr("cellspacing", "0")
				
				var thead = $("<thead></thead>");
				var thead_tr = $("<tr></tr>");
				thead_tr.append( $("<th></th>").text("project_name") );
				thead_tr.append( $("<th></th>").text("active") );
				thead_tr.append( $("<th></th>").text("idle") );
				thead_tr.append( $("<th></th>").text("total") );
				thead_tr.append( $("<th></th>").text("awaiting") );					
				thead.append(thead_tr);
				connectionTable.append(thead);
				
				var tfoot = $("<tfoot></tfoot>");
				var tfoot_tr = $("<tr></tr>");
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot_tr.append( $("<th></th>").text() );
				tfoot.append(tfoot_tr);
				connectionTable.append(tfoot);
				
				var tbody = $("<tbody></tbody>");
				
				connectionTable.append(tbody);
				connectionDiv.append(connectionTable);				
				$("#dynamic").append(connectionDiv);
				

				oConnectionsTable = $('#connectionstable').DataTable({
					"dom": '<"top"f>t',
					"pageLength": 100,
					"language": {
						"search": "<b>Connections</b><br><br>Filter: "
					}
				}).draw();
				
				
				// remove unneeded links
				$("#headerlinks").hide();
				
			}
			
			// remove rows from previous cycle
			oConnectionsTable.rows().remove();
			
			// set the width of the filter box
			$("#connectionstable_filter").removeClass("dataTables_filter");
			
			// add the current info to the table
			$(xml).find("connection").each(function(){
				
				var connectionsItems = $(this).find("item");
				
				oConnectionsTable.row.add([
					connectionsItems.eq(0).text(),
					"<center>"+connectionsItems.eq(1).text()+"</center>",
					"<center>"+connectionsItems.eq(2).text()+"</center>",
					"<center>"+connectionsItems.eq(3).text()+"</center>",
					"<center>"+connectionsItems.eq(4).text()+"</center>"
					]);
				});
			
			// sort by column 'last_active'
			oConnectionsTable.draw();					
			
			// refresh after few seconds
			setTimeout(function(){ lexitspy.buildConnectionsSpy(); }, 2000);
		},
		error: function(jqXHR, textStatus, errorThrown){
			fn.message(lang.error, lang.loading_xml_failed +": "+textStatus+" "+errorThrown);
		}
	});
};
	