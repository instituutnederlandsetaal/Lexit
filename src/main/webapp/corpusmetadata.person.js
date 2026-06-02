const person = {};

person.settings = {
    "width": "99%",
    "header_color": "#ECEFF1",
    "keep_small": true,
    "nice_name": "PERSON",
    "displaylength": 10,
    "buttons": {
        "clear_all_filters": {
            "nice_name": "Clear all filters",
            "click": function () {
                fn.resetAllFilters("person", true);
                fn.refreshTable("person", null);
            },
            "bgcolor": "yellow",
            "textcolor": "black",
            "class": "button",
            "tooltip": "Klik hier om alle zoekvelden te legen",
            "position": {"top": "80px", "left": "10px"},
        },
    },
};

person.config = {
    id: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": false,
        "nice_name": "ID",
        "visible": true,
    },
    normalisedfullname: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "normalised full name",
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
                    bulkReplaceSimplexStringValue("person", "normalisedfullname")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "normalisedfullname")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "normalisedfullname",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    fullnamefromsource: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "full name from source",
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
                    bulkReplaceSimplexStringValue("person", "fullnamefromsource")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "fullnamefromsource")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "fullnamefromsource",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
            // Hier even expliciet refreshen omdat de trigger de normalised full name ook aanpast
            fn.refreshTable("person", true);
        }
    },
    pseudonym: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "pseudonym",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "person",
                "id",
                "pseudonym",
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
                    bulkReplaceComplexStringValue("person", "pseudonym")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "pseudonym")
                }
            }
        },
    },
    anonymised: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "anonymised",
        "visible": true,
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "anonymised",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    firstname: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "first name",
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
                    bulkReplaceSimplexStringValue("person", "firstname")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "firstname")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "firstname",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    infixes: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "infixes",
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
                    bulkReplaceSimplexStringValue("person", "infixes")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "infixes")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "infixes",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    lastname: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "last name",
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
                    bulkReplaceSimplexStringValue("person", "lastname")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "lastname")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "lastname",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    gender: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "gender",
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
                    bulkReplaceSimplexStringValue("person", "gender")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "gender")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "gender",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    yearofbirth: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "editfunc": function (table, node, value) {
            handlePersonYear(table, node, value, "person", "geboortejaar");
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "yearofbirth",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        },
        "nice_name": "year of birth",
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
                    bulkReplaceIntegerValue("person", "yearofbirth", "jaartal");
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "yearofbirth")
                }
            }
        },
    },
    yearofdeath: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "editfunc": function (table, node, value) {
            handlePersonYear(table, node, value,"person", "sterftejaar");
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "yearofdeath",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        },
        "nice_name": "year of death",
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
                    bulkReplaceIntegerValue("person", "yearofdeath", "jaartal")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "yearofdeath")
                }
            }
        },
    },
    highestcompletededucationlevel: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "highest education",
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
                    bulkReplaceSimplexStringValue("person", "highestcompletededucationlevel")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "highestcompletededucationlevel")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "highestcompletededucationlevel",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    placeofbirth: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "place of birth",
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
                    bulkReplaceSimplexStringValue("person", "placeofbirth")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "placeofbirth")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "placeofbirth",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    occupation: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "occupation",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "person",
                "id",
                "occupation",
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
                    bulkReplaceComplexStringValue("person", "occupation")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "occupation")
                }
            }
        },
    },
    placeofresidence: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "place of residence",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "person",
                "id",
                "placeofresidence",
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
                    bulkReplaceComplexStringValue("person", "placeofresidence")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "placeofresidence")
                }
            }
        },
    },
    organisationname: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "organisation",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "person",
                "id",
                "organisationname",
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
                    bulkReplaceComplexStringValue("person", "organisationname")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "organisationname")
                }
            }
        },
    },
    religion: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "religion",
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
                    bulkReplaceSimplexStringValue("person", "religion")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "religion")
                }
            }
        },
        "editcallback": function (table, node, value) {
            const sRecordId = fn.getDataFromSiblingNode(node, "id");
            logUserEvent(
                "CELL_UPDATE",
                "person",
                "none",
                "religion",
                {
                    "id": sRecordId,
                    "value": value
                }
            );
        }
    },
    socialstatus: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "social status",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "person",
                "id",
                "socialstatus",
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
                    bulkReplaceComplexStringValue("person", "socialstatus")
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "socialstatus")
                }
            }
        },
    },
    externalpersonidentifier: {
        "bgcolor": ["#FFFFFF", "#F7F7F7"],
        "colsort": "asc",
        "editable": true,
        "nice_name": "external person ID",
        "visible": true,
        "render": function (text) {
            return niceArray(text);
        },
        "editfunc": function (table, node, value) {
            handleStringArray(
                table,
                node,
                value,
                "person",
                "id",
                "externalpersonidentifier",
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
                    bulkReplaceComplexStringValue("person", "externalpersonidentifier");
                } else if (key.trim() === "bulk_replace_with_filters") {
                    bulkReplaceWithFilters("person", "externalpersonidentifier")
                }
            }
        },
    },
}