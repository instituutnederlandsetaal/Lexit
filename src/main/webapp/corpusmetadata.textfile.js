const textfile = {};

textfile.settings = {
    "width": "99%",
    "header_color": "#FFE0B2",
    "keep_small": true,
    "nice_name": "TEXTFILE",
    "displaylength": 10,
    "buttons": {
        "clear_all_filters": {
            "nice_name": "Clear all filters",
            "click": function () {
                fn.resetAllFilters("___agg_textfile", true);
                fn.refreshTable("___agg_textfile", null);
            },
            "bgcolor": "yellow",
            "textcolor": "black",
            "class": "button",
            "tooltip": "Klik hier om alle zoekvelden te legen",
            "position": {"top": "80px", "left": "10px"},
        },
        "return_int_profile": {
            "nice_name": "Get INT profile",
            "click": function (table) {
                returnIntProfile(table);
            },
            "bgcolor": "yellow",
            "textcolor": "black",
            "class": "button",
            "tooltip": "Klik hier het INT-profiel behorend tot de huidige rij op te halen",
            "position": {"top": "80px", "left": "100px"},
        },
        "navigate_to_duct": {
            "nice_name": "Navigate to Duct",
            "click": function (table) {
                navigateToDuct(table);
            },
            "bgcolor": "yellow",
            "textcolor": "black",
            "class": "button",
            "tooltip": "Klik hier om naar de bij de huidige rij behorende Duct-entry te navigeren (opent een nieuw tabblad)",
            "position": {"top": "80px", "left": "190px"},
        }
    },
};

textfile.config = {
    textfile_pkid: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": false,
        "nice_name": "ID",
        "visible": true,
    },
    internal_pid: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": false,
        "nice_name": "PPID",
        "visible": true,
        "dblclick": function (table, node) {
            let pid = fn.getSelectedTextInNode(node).text;
            fn.callFunction(
                "metadata.get_file_id_from_pid",
                [pid],
                function (response) {
                    const file_id = response["get_file_id_from_pid"]
                    window.open(`http://duct.ivdnt.loc/duct/file.jsp?id=${file_id}`, '_blank');
                })
        }
        // "ellipsis": true,
        // "ellipsis_width": "50px",
        // "ellipsis_unwrap": true,
    },
    text_version: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "text version",
        "visible": true,
        "contextmenu": {
            "items": {
                "bulk_replace": {
                    "name": "Bulk replace (simplex)",
                    "disabled": false
                },
                "bulk_replace_with_filters": {
                    "name": "Bulk replace (complex)",
                    "disabled": false
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceSimplexStringValue("___agg_textfile", "text_version")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textfile", "text_version")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textfile_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textfile",
                "none",
                "text_version",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    superseded: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "superseded",
        "visible": true,
        "contextmenu": {
            "items": {
                "bulk_replace": {
                    "name": "Bulk replace (simplex)",
                    "disabled": true
                },
                "bulk_replace_with_filters": {
                    "name": "Bulk replace (complex)",
                    "disabled": false
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceSimplexStringValue("___agg_textfile", "superseded")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textfile", "superseded")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textfile_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textfile",
                "none",
                "superseded",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
}