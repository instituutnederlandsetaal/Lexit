const textcategorisation = {};

textcategorisation.settings = {
    "width": "99%",
    "header_color": "#D1C4E9",
    "keep_small": true,
    "nice_name": "TEXTCATEGORISATION",
    "displaylength": 10,
    "buttons": {
        "clear_all_filters": {
            "nice_name": "Clear all filters",
            "click": function () {
                fn.resetAllFilters("___agg_textcategorisation", true);
                fn.refreshTable("___agg_textcategorisation", null);
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
    }
};

textcategorisation.config = {
    textcategorisation_pkid: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": false,
        "nice_name": "ID",
        "visible": true,
    },
    medium: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "medium",
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
                    bulkReplaceSimplexStringValue("___agg_textcategorisation", "medium")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textcategorisation", "medium")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textcategorisation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textcategorisation",
                "none",
                "textcategorisation_pkid",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    intended_audience: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "intended audience",
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
                    bulkReplaceSimplexStringValue("___agg_textcategorisation", "intended_audience")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textcategorisation", "intended_audience")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textcategorisation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textcategorisation",
                "none",
                "intended_audience",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    translated_text: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "translated text",
        "visible": true,
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textcategorisation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textcategorisation",
                "none",
                "translated_text",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    id_original_language: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "ID original language",
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
                    bulkReplaceSimplexStringValue("___agg_textcategorisation", "id_original_language")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textcategorisation", "id_original_language")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textcategorisation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textcategorisation",
                "none",
                "id_original_language",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    name_original_language: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "name original language",
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
                    bulkReplaceSimplexStringValue("___agg_textcategorisation", "name_original_language")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textcategorisation", "name_original_language")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textcategorisation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textcategorisation",
                "none",
                "name_original_language",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    publication_section: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "publication section",
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
                    bulkReplaceSimplexStringValue("___agg_textcategorisation", "publication_section")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textcategorisation", "publication_section")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textcategorisation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textcategorisation",
                "none",
                "publication_section",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    fictionality: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "fictionality",
        "visible": true,
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "textcategorisation_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_textcategorisation",
                "none",
                "fictionality",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    setting_location: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "setting location",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "___agg_textcategorisation",
                "textcategorisation_pkid",
                "setting_location",
                "metadata"
            );
        },
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
                    bulkReplaceComplexStringValue("___agg_textcategorisation", "setting_location")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textcategorisation", "setting_location")
                }
            }
        },
    },
    setting_person: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "setting person",
        "visible": true,
        "render": function (text) {
            return nicePersonArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "___agg_textcategorisation",
                "textcategorisation_pkid",
                "setting_person",
                "metadata"
            );
        },
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
                    bulkReplaceComplexStringValue("___agg_textcategorisation", "setting_person")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textcategorisation", "setting_person")
                }
            }
        },
    },
    setting_organisation: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "setting organisation",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "___agg_textcategorisation",
                "textcategorisation_pkid",
                "setting_organisation",
                "metadata"
            );
        },
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
                    bulkReplaceComplexStringValue("___agg_textcategorisation", "setting_organisation")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_textcategorisation", "setting_organisation")
                }
            }
        },
    },
}