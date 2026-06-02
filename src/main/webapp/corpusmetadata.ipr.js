const ipr = {};

ipr.settings = {
    "width": "99%",
    "header_color": "#C8E6C9",
    "keep_small": true,
    "nice_name": "IPR",
    "displaylength": 10,
    "buttons": {
        "clear_all_filters": {
            "nice_name": "Clear all filters",
            "click": function () {
                fn.resetAllFilters("___agg_ipr", true);
                fn.refreshTable("___agg_ipr", null);
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

ipr.config = {
    ipr_pkid: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": false,
        "nice_name": "ID",
        "visible": true,
    },
    data_access: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "data access",
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
                    bulkReplaceSimplexStringValue("___agg_ipr", "data_access")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_ipr", "data_access")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "ipr_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_ipr",
                "none",
                "data_access",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        },
    },
    copyright_owner: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "copyright owner",
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
                    bulkReplaceSimplexStringValue("___agg_ipr", "copyright_owner")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_ipr", "copyright_owner")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "ipr_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_ipr",
                "none",
                "copyright_owner",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    license_type: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "license type",
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
                    bulkReplaceSimplexStringValue("___agg_ipr", "license_type")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_ipr", "license_type")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "ipr_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_ipr",
                "none",
                "license_type",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
};
