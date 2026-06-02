const metadata = {};

metadata.settings = {
    "width": "99%",
    "header_color": "#E6E1FF",
    "keep_small": true,
    "nice_name": "METADATA",
    "displaylength": 10,
    "buttons": {
        "clear_all_filters": {
            "nice_name": "Clear all filters",
            "click": function () {
                fn.resetAllFilters("___agg_metadata", true);
                fn.refreshTable("___agg_metadata", null);
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
    "columns_order": [
        "metadata_pkid",
        "textfile_internal_pid",
        "textfile_text_version",
        "textfile_superseded",
        "ipr_data_access",
        "source_id",
        "source_collection",
        "source_publication_date",
        "source_witness_date",
        "titleinformation_independent_title",
        "titleinformation_dependent_title",
        "titleinformation_series_title",
        "textcategorisation_medium",
        "textcategorisation_intended_audience",
        "language_variety",
        "normalised_full_name_author",
        "normalised_full_name_author_dependent",
        "remark",
        "source_creator_ids",
        "creator_id_author",
        "creator_id_dependent_author",
        "language_variety_ids",
    ]
};

metadata.config = {
    "columns_sorting": {
        "metadata_pkid": "asc",
        "textfile_internal_pid": "asc",
        "textfile_text_version": "asc",
        "textfile_superseded": "asc",
        "ipr_data_access": "asc",
        "source_id": "asc",
        "source_collection": "asc",
        "source_publication_date": "asc",
        "source_witness_date": "asc",
        "titleinformation_independent_title": "asc",
        "titleinformation_dependent_title": "asc",
        "titleinformation_series_title": "asc",
        "textcategorisation_medium": "asc",
        "textcategorisation_intended_audience": "asc",
        "language_variety": "asc",
        "normalised_full_name_author": "asc",
        "normalised_full_name_author_dependent": "asc",
        "remark": "asc",
    },
    metadata_pkid: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": false,
        "nice_name": "ID",
        "visible": true,
    },
    textfile_internal_pid: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
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
    textfile_text_version: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "textfile_text_version")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "textfile_text_version")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "textfile_text_version",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    textfile_superseded: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "textfile_superseded")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "textfile_superseded")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "textfile_superseded",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    ipr_data_access: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "data access",
        "visible": true,
        "choosefrom": ["", "ONLINE", "EXTERNAL", "INTERNAL", "UNSPECIFIED"],
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "ipr_data_access")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "ipr_data_access")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "ipr_data_access",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    source_id: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "source_id")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "source_id")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "source_id",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    source_collection: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
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
                "___agg_metadata",
                "metadata_pkid",
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
                    bulkReplaceComplexStringValue("___agg_metadata", "source_collection");
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "source_collection");
                }
            }
        },
    },
    source_publication_date: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "width": "10%",
        "editable": true,
        "nice_name": "publication date",
        "visible": true,
        "editfunc": function (table, node, value) {
            handleDateInformationEditFunc(table, node, value, "___agg_metadata", "publication");
        },
        "dblclick": function (table, node) {
            handleDateInformationDblClick(table, node, "___agg_metadata", "publication");
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
                    bulkReplaceDateStringValue("___agg_metadata", "source_publication_date")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "source_publication_date")
                }
            }
        },
    },
    source_witness_date: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "width": "10%",
        "editable": true,
        "nice_name": "witness date",
        "visible": true,
        "editfunc": function (table, node, value) {
            handleDateInformationEditFunc(table, node, value, "___agg_metadata", "witness");
        },
        "dblclick": function (table, node) {
            handleDateInformationDblClick(table, node, "___agg_metadata", "witness");
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
                    bulkReplaceDateStringValue("___agg_metadata", "source_witness_date")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "source_witness_date")
                }
            }
        },
    },
    titleinformation_independent_title: {
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "titleinformation_independent_title")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "titleinformation_independent_title")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "titleinformation_independent_title",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    titleinformation_dependent_title: {
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "titleinformation_dependent_title")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "titleinformation_dependent_title")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "titleinformation_dependent_title",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    titleinformation_series_title: {
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "titleinformation_series_title")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "titleinformation_series_title")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "titleinformation_series_title",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    textcategorisation_medium: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "textcategorisation_medium")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "textcategorisation_medium")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "textcategorisation_medium",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    textcategorisation_intended_audience: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
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
                    disabled: false
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceSimplexStringValue("___agg_metadata", "textcategorisation_intended_audience")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "textcategorisation_intended_audience")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "textcategorisation_intended_audience",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    language_variety: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": false,
        "nice_name": "language variety",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "dblclick": function (table, node) {
            handleLanguageVariety(table, node);
        },
        "contextmenu": {
            "items": {
                "bulk_replace": {
                    "name": "Bulk replace (simplex)",
                    "disabled": true
                },
                "bulk_replace_with_filters": {
                    "name": "Bulk replace (complex)",
                    "disabled": true
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceComplexStringValue("___agg_metadata", "language_variety");
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "language_variety");
                }
            }
        },
    },
    normalised_full_name_author: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": false,
        "nice_name": "author independent title",
        "visible": true,
        "render": function (text) {
            return nicePersonArray(text);
        },
        "dblclick": function (table, node) {
            handleAuthor(table, node, "AUTHOR_OF_TITLE");
        },
        "contextmenu": {
            "items": {
                "bulk_replace": {
                    "name": "Bulk replace (simplex)",
                    "disabled": false
                },
                "bulk_replace_with_filters": {
                    "name": "Bulk replace (complex)",
                    "disabled": true
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceComplexStringValue("___agg_metadata", "normalised_full_name_author");
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "normalised_full_name_author");
                }
            }
        },
    },
    normalised_full_name_author_dependent: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": false,
        "nice_name": "author dependent title",
        "visible": true,
        "render": function (text) {
            return nicePersonArray(text);
        },
        "dblclick": function (table, node) {
            handleAuthor(table, node, "AUTHOR_OF_DEPENDENT_TITLE");
        },
        "contextmenu": {
            "items": {
                "bulk_replace": {
                    "name": "Bulk replace (simplex)",
                    "disabled": false
                },
                "bulk_replace_with_filters": {
                    "name": "Bulk replace (complex)",
                    "disabled": true
                }
            },
            "callback": function (table, node, key) {
                if (key.trim() === "bulk_replace") {
                    bulkReplaceComplexStringValue("___agg_metadata", "normalised_full_name_author_dependent");
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "normalised_full_name_author_dependent");
                }
            }
        },
    },
    remark: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "editable": true,
        "nice_name": "remark",
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
                    bulkReplaceSimplexStringValue("___agg_metadata", "remark")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("___agg_metadata", "remark")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "metadata_pkid");
            logUserEvent(
                "CELL_UPDATE",
                "___agg_metadata",
                "none",
                "remark",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    source_creator_ids: {
        "visible": false,
    },
    creator_id_author: {
        "visible": false
    },
    creator_id_dependent_author: {
        "visible": false
    },
    language_variety_ids: {
        "visible": false
    },
}