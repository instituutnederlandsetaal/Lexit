const source = {};

source.settings = {
    "width": "99%",
    "header_color": "#B2EBF2",
    "keep_small": true,
    "nice_name": "SOURCE",
    "displaylength": 10,
    "buttons": {
        "clear_all_filters": {
            "nice_name": "Clear all filters",
            "click": function () {
                fn.resetAllFilters("___agg_source", true);
                fn.refreshTable("___agg_source", null);
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

source.config = {
    source_pkid: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": false,
        "nice_name": "ID",
        "visible": true,
    },
    source_url: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "source URL",
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
                    bulkReplaceSimplexStringValue("___agg_source", "source_url")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "source_url")
                }
            },
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "source_url",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    publisher: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "publisher",
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
                    bulkReplaceSimplexStringValue("___agg_source", "publisher")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "publisher")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "publisher",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    isbn_issn: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "ISBN/ISSN",
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
                    bulkReplaceSimplexStringValue("___agg_source", "isbn_issn")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "isbn_issn")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "isbn_issn",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    place_of_publication: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "place of publication",
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
                    bulkReplaceSimplexStringValue("___agg_source", "place_of_publication")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "place_of_publication")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "place_of_publication",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    edition: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "edition",
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
                    bulkReplaceSimplexStringValue("___agg_source", "edition")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "edition")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "edition",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    source_collection: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "source collection",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "___agg_source",
                "source_pkid",
                "source_collection",
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
                    bulkReplaceComplexStringValue("___agg_source", "source_collection")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "source_collection")
                }
            }
        },
    },
    call_number_manuscript: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "call number manuscript",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "___agg_source",
                "source_pkid",
                "call_number_manuscript",
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
                    bulkReplaceComplexStringValue("___agg_source", "call_number_manuscript")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "call_number_manuscript")
                }
            }
        },
    },
    start_page: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "start page",
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
                    bulkReplaceIntegerValue("___agg_source", "start_page", "getal")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "start_page")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "start_page",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    end_page: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "end page",
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
                    bulkReplaceIntegerValue("___agg_source", "end_page", "getal")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "end_page")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "end_page",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    volume: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "volume",
        "visible": true,
        "contextmenu": {
            "items": {
                "bulk_replace": {
                    "name": "Bulk replace (simplex)",
                    "disabled": false
                },
                "bulk_replace_with_filters": {
                    "name": "Bulk replace (complex)",
                    disabled: false
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceIntegerValue("___agg_source", "volume", "getal")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "volume")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "volume",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    issue: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "issue",
        "visible": true,
        "contextmenu": {
            "items": {
                "bulk_replace": {
                    "name": "Bulk replace (simplex)",
                    "disabled": false
                },
                "bulk_replace_with_filters": {
                    "name": "Bulk replace (complex)",
                    disabled: false
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceIntegerValue("___agg_source", "issue", "getal")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "issue")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "issue",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    origin_digitised_file: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "origin digitised file",
        "visible": true,
        "contextmenu": {
            "items": {
                "bulk_replace": {
                    "name": "Bulk replace (simplex)",
                    "disabled": false
                },
                "bulk_replace_with_filters": {
                    "name": "Bulk replace (complex)",
                    disabled: false
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceSimplexStringValue("___agg_source", "origin_digitised_file")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "origin_digitised_file")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "origin_digitised_file",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    publication_date: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "publication date",
        "visible": true,
        "editfunc": function (table, node, value) {
            handleDateInformationEditFunc(table, node, value, "___agg_source", "publication");
        },
        "dblclick": function (table, node) {
            handleDateInformationDblClick(table, node, "___agg_source", "publication");
        },
        "render": function (text) {
            return noZeroDate(text);
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
                    bulkReplaceDateStringValue("___agg_source", "publication_date")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "publication_date")
                }
            }
        },
    },
    witness_date: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "witness date",
        "visible": true,
        "editfunc": function (table, node, value) {
            handleDateInformationEditFunc(table, node, value, "___agg_source", "witness");
        },
        "dblclick": function (table, node) {
            handleDateInformationDblClick(table, node, "___agg_source", "witness");
        },
        "render": function (text) {
            return noZeroDate(text);
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
                    bulkReplaceDateStringValue("___agg_source", "witness_date")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "witness_date")
                }
            }
        },
    },
    text_date: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "text date",
        "visible": true,
        "editfunc": function (table, node, value) {
            handleDateInformationEditFunc(table, node, value, "___agg_source", "text");
        },
        "dblclick": function (table, node) {
            handleDateInformationDblClick(table, node, "___agg_source", "text");
        },
        "render": function (text) {
            return noZeroDate(text);
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
                    bulkReplaceDateStringValue("___agg_source", "text_date")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "text_date")
                }
            }
        },
    },
    source_id: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "source ID",
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
                    bulkReplaceSimplexStringValue("___agg_source", "source_id")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "source_id")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "source_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_source",
                "none",
                "source_id",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    source_origin: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "source origin",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "___agg_source",
                "source_pkid",
                "source_origin",
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
                    bulkReplaceComplexStringValue("___agg_source", "source_origin")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_source", "source_origin")
                }
            }
        },
    },
}