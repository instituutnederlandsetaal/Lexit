const titleinformation = {};

titleinformation.settings = {
    "width": "99%",
    "header_color": "#FFF9C4",
    "keep_small": true,
    "nice_name": "TITLEINFORMATION",
    "displaylength": 10,
    "buttons": {
        "clear_all_filters": {
            "nice_name": "Clear all filters",
            "click": function () {
                fn.resetAllFilters("___agg_titleinformation", true);
                fn.refreshTable("___agg_titleinformation", null);
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

titleinformation.config = {
    titleinformation_pkid: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": false,
        "nice_name": "ID",
        "visible": true,
    },
    title: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "independent title",
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
                    bulkReplaceSimplexStringValue("___agg_titleinformation", "title")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_titleinformation", "title")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "titleinformation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_titleinformation",
                "none",
                "title",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    dependent_title: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "dependent title",
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
                    bulkReplaceSimplexStringValue("___agg_titleinformation", "dependent_title")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_titleinformation", "dependent_title")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "titleinformation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_titleinformation",
                "none",
                "dependent_title",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    series_title: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "series title",
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
                    bulkReplaceSimplexStringValue("___agg_titleinformation", "series_title")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_titleinformation", "series_title")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "titleinformation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_titleinformation",
                "none",
                "series_title",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    subtitle: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "subtitle",
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
                    bulkReplaceSimplexStringValue("___agg_titleinformation", "subtitle")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_titleinformation", "subtitle")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "titleinformation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_titleinformation",
                "none",
                "subtitle",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
}