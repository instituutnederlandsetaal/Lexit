function bulkReplaceIntegerValue(tableName, columnName, choice) {
    const niceColumn = mapColumnNameToNiceName(columnName);
    const sTitle = `Bulk replace ${niceColumn}`;
    const aFieldNames = ["value", "replace with"];
    const aValues = ["", ""];
    const bulkReplaceFunction = function (response) {
        if (choice.trim() === "jaartal") {
            if (!validatePersonYear(response["value"]) || !validatePersonYear(response["replace with"])) {
                impossibleYearMessage();
                cancelFunctionNoop();
            }
        } else if (choice.trim() === "getal") {
            if (!validateInteger(response["value"]) || !validateInteger(response["replace with"])) {
                impossibleIntegerMessage();
                cancelFunctionNoop();
            }
        }
        const originalValue = parseInt(response["value"]);
        const replacementValue = parseInt(response["replace with"]);
        // Construeer JSON-object met te vervangen waarden en in-situ boolean
        const replacements = {};
        replacements[originalValue] = replacementValue;
        const jsonString = JSON.stringify(replacements);
        // Roep eerst een functie aan om de telling te weergeven
        fn.callFunction(
            "metadata.count_integer_replacements_in_column",
            [
                "metadata",
                tableName,
                prepareStringValue(columnName),
                prepareJsonValue(jsonString)
            ],
            function (response) {
                const sTitle = "Waarden vervangen";
                const occurrences = response["occurrences"];
                let sMessage = `Er zijn ${occurrences} instanties gevonden met de waarde
                    \"${originalValue}\". Wilt u deze allemaal vervangen met \"${replacementValue}\"?`;
                if (occurrences.trim() === "1") {
                    sMessage = `Er is ${occurrences} instantie gevonden met de waarde
                    \"${originalValue}\". Wilt u deze vervangen met \"${replacementValue}\"?`;
                }
                if (occurrences < 1) {
                    fn.message(
                        "Geen resultaat",
                        `Er zijn geen waarden gevonden die corresponderen aan \"${originalValue}\"`,
                        cancelFunctionNoop
                    )
                } else {
                    // Bij OK, voer bulk replace uit
                    fn.confirm(
                        sTitle,
                        sMessage,
                        function () {
                            fn.callFunction(
                                "metadata.bulk_replace_integer_in_column",
                                [
                                    "metadata",
                                    tableName,
                                    prepareStringValue(columnName),
                                    prepareJsonValue(jsonString)
                                ],
                                function () {
                                    logUserEvent(
                                        "BULK_REPLACE",
                                        tableName,
                                        "bulk_replace_integer_in_column,",
                                        columnName,
                                        {
                                            "value": originalValue.toString(),
                                            "replace with": replacementValue.toString(),
                                            "occurrences": occurrences.toString()
                                        });
                                    const values = occurrences.trim() === "1" ? "waarde" : "waarden";
                                    fn.message("Gereed", ` ${occurrences} ${values} vervangen`)
                                    fn.refreshTable(tableName, null);
                                }
                            )
                        },
                        function () {
                            cancelFunctionNoop()
                        });
                }
            }
        )
    }
    powerPrompt(
        sTitle,
        aFieldNames,
        aValues,
        bulkReplaceFunction,
        cancelFunctionNoop,
        false,
        []
    )
}

function bulkReplaceDateStringValue(tableName, columnName) {
    const niceColumn = mapColumnNameToNiceName(columnName);
    const sTitle = `Bulk replace ${niceColumn}`;
    const aFieldNames = [
        "value",
        "replace with",
        // "in-situ substring",
    ];
    const aValues = [
        "" + "::datepicker",
        "" + "::datepicker",
        // false
    ];
    const bulkReplaceFunction = function (response) {
        const originalValue = response["value"].replaceAll("-", "/");
        const replacementValue = response["replace with"].replaceAll("-", "/");
        const inSituSubstring = false;
        // const inSituSubstring = response["in-situ substring"];
        // Waarschuw voor lege waarden
        if (originalValue.trim() === "" && replacementValue.trim() === "") {
            fn.message(
                "Geen waarden ingevuld",
                "Vul a.u.b. iets in voor de te vervangen waarde",
                cancelFunctionNoop
            )
            return;
        }
        if (!
            (validateDateHasValidFormat(originalValue) && validateDateHasValidFormat(replacementValue)
            )
        ) {
            fn.message(
                "Ongeldige datum",
                "De ingevulde datum is ongeldig. Vul a.u.b. een datum in in de volgende indeling: DD/MM/YYYY.",
                // + "<br><br>" +
                // "Tip: vink \"in-situ substring\" aan om eventuele deelwaarden te kunnen vervangen.",
                cancelFunctionNoop
            )
            return;
        }
        // Construeer JSON-object met te vervangen waarden en in-situ boolean
        const replacements = {};
        replacements[originalValue] = replacementValue;
        const jsonString = JSON.stringify(replacements);

        // Roep eerst een functie aan om de telling te weergeven
        fn.callFunction(
            "metadata.count_varchar_replacements_in_column",
            [
                inSituSubstring,
                "metadata",
                tableName,
                prepareStringValue(columnName),
                prepareJsonValue(jsonString)
            ],
            function (response) {
                const sTitle = "Waarden vervangen";
                const occurrences = response["occurrences"];
                let sMessage = `Er zijn ${occurrences} instanties gevonden met de waarde
                    \"${originalValue}\". Wilt u deze allemaal vervangen met \"${replacementValue}\"?`;
                if (occurrences.trim() === "1") {
                    sMessage = `Er is ${occurrences} instantie gevonden met de waarde
                    \"${originalValue}\". Wilt u deze vervangen met \"${replacementValue}\"?`;
                }
                if (parseInt(occurrences) < 1) {
                    fn.message(
                        "Geen resultaat",
                        `Er zijn geen waarden gevonden die corresponderen aan \"${originalValue}\"`,
                        cancelFunctionNoop
                    )
                } else {
                    // Bij OK, voer bulk replace uit
                    fn.confirm(
                        sTitle,
                        sMessage,
                        function () {
                            fn.callFunction(
                                "metadata.bulk_replace_varchar_in_column",
                                [
                                    inSituSubstring,
                                    "metadata",
                                    tableName,
                                    prepareStringValue(columnName),
                                    prepareJsonValue(jsonString)
                                ],
                                function () {
                                    logUserEvent(
                                        "BULK_REPLACE",
                                        tableName,
                                        "bulk_replace_varchar_in_column",
                                        columnName,
                                        {
                                            "value": originalValue.toString(),
                                            "replace with": replacementValue.toString(),
                                            "occurrences": occurrences.toString()
                                        });
                                    const values = occurrences.trim() === "1" ? "waarde" : "waarden";
                                    fn.message("Gereed", ` ${occurrences} ${values} vervangen`)
                                    fn.refreshTable(tableName, null);
                                }
                            )
                        },
                        function () {
                            cancelFunctionNoop()
                        });
                }
            }
        )

    }
    powerPrompt(
        sTitle,
        aFieldNames,
        aValues,
        bulkReplaceFunction,
        cancelFunctionNoop,
        false,
        []
    )
}

function bulkReplaceSimplexStringValue(tableName, columnName) {
    const niceColumn = mapColumnNameToNiceName(columnName);
    const sTitle = `Bulk replace ${niceColumn}`;
    const aFieldNames = ["value", "replace with", "in-situ substring"];
    const aValues = ["", "", false];
    const bulkReplaceFunction = function (response) {
        const originalValue = response["value"];
        const replacementValue = response["replace with"];
        // Waarschuw voor lege waarden
        if (originalValue.trim() === "" && replacementValue.trim() === "") {
            fn.message(
                "Geen waarden ingevuld",
                "Vul a.u.b. iets in voor de te vervangen waarde",
                cancelFunctionNoop
            )
            return;
        }
        const inSituSubstring = response["in-situ substring"];
        // Construeer JSON-object met te vervangen waarden en in-situ boolean
        const replacements = {};
        replacements[originalValue] = replacementValue;
        const jsonString = JSON.stringify(replacements);
        // Roep eerst een functie aan om de telling te weergeven
        fn.callFunction(
            "metadata.count_varchar_replacements_in_column",
            [
                inSituSubstring,
                "metadata",
                tableName,
                prepareStringValue(columnName),
                prepareJsonValue(jsonString)
            ],
            function (response) {
                const sTitle = "Waarden vervangen";
                const occurrences = response["occurrences"];
                let sMessage = `Er zijn ${occurrences} instanties gevonden met de waarde
                    \"${originalValue}\". Wilt u deze allemaal vervangen met \"${replacementValue}\"?`;
                if (occurrences.trim() === "1") {
                    sMessage = `Er is ${occurrences} instantie gevonden met de waarde
                    \"${originalValue}\". Wilt u deze vervangen met \"${replacementValue}\"?`;
                }
                if (parseInt(occurrences) < 1) {
                    fn.message(
                        "Geen resultaat",
                        `Er zijn geen waarden gevonden die corresponderen aan \"${originalValue}\"`,
                        cancelFunctionNoop
                    )
                } else {
                    // Bij OK, voer bulk replace uit
                    fn.confirm(
                        sTitle,
                        sMessage,
                        function () {
                            fn.callFunction(
                                "metadata.bulk_replace_varchar_in_column",
                                [
                                    inSituSubstring,
                                    "metadata",
                                    tableName,
                                    prepareStringValue(columnName),
                                    prepareJsonValue(jsonString)
                                ],
                                function () {
                                    logUserEvent(
                                        "BULK_REPLACE",
                                        tableName,
                                        "bulk_replace_varchar_in_column",
                                        columnName,
                                        {
                                            "value": originalValue.toString(),
                                            "replace with": replacementValue.toString(),
                                            "occurrences": occurrences.toString()
                                        });
                                    const values = occurrences.trim() === "1" ? "waarde" : "waarden";
                                    fn.message("Gereed", ` ${occurrences} ${values} vervangen`)
                                    fn.refreshTable(tableName, null);
                                }
                            )
                        },
                        function () {
                            cancelFunctionNoop()
                        });
                }
            }
        )
    }
    powerPrompt(
        sTitle,
        aFieldNames,
        aValues,
        bulkReplaceFunction,
        cancelFunctionNoop,
        false,
        []
    )
}

function bulkReplaceComplexStringValue(tableName, columnName) {
    const niceColumn = mapColumnNameToNiceName(columnName);
    const sTitle = `Bulk replace ${niceColumn}`;
    const aFieldNames = ["value", "replace with", "in-situ substring (WARNING: SLOW)"];
    const aValues = ["", "", false];
    const bulkReplaceFunction = function (response) {
        const originalValue = response["value"];
        const replacementValue = response["replace with"];
        const inSituSubstring = response["in-situ substring (WARNING: SLOW)"];
        // Construeer JSON-object met te vervangen waarden en in-situ boolean
        const replacements = {};
        replacements[originalValue] = replacementValue;
        const jsonString = JSON.stringify(replacements);
        // Roep eerst een functie aan om de telling te weergeven
        fn.callFunction(
            "metadata.count_varchar_array_replacements_in_column",
            [
                inSituSubstring,
                "metadata",
                tableName,
                prepareStringValue(columnName),
                prepareJsonValue(jsonString)
            ],
            function (response) {
                const sTitle = "Waarden vervangen";
                const recordCount = response["record_count"];
                const varcharCount = response["total_occurrences"];
                const values = varcharCount.trim() === "1" ? "waarde" : "waarden";
                const rows = recordCount.trim() === "1" ? "regel" : "regels";
                let sMessage = `Er zijn ${varcharCount} instanties gevonden met de waarde
                    \"${originalValue}\" binnen een totaal van ${recordCount} ${rows}. 
                    Wilt u deze allemaal vervangen met \"${replacementValue}\"?`;
                if (varcharCount.trim() === "1") {
                    sMessage = `Er is 1 instantie gevonden met de waarde \"${originalValue}\"
                    binnen 1 regel. Wilt u deze vervangen met \"${replacementValue}\"?`;
                }
                if (parseInt(varcharCount) < 1) {
                    fn.message(
                        "Geen resultaat",
                        `Er zijn geen waarden gevonden die corresponderen aan \"${originalValue}\"`,
                        cancelFunctionNoop
                    )
                } else {
                    // Bij OK, voer bulk replace uit
                    fn.confirm(
                        sTitle,
                        sMessage,
                        function () {
                            fn.callFunction(
                                "metadata.bulk_replace_varchar_array_in_column",
                                [
                                    inSituSubstring,
                                    "metadata",
                                    tableName,
                                    prepareStringValue(columnName),
                                    prepareJsonValue(jsonString)
                                ],
                                function () {
                                    logUserEvent(
                                        "BULK_REPLACE",
                                        tableName,
                                        "bulk_replace_varchar_array_in_column",
                                        columnName,
                                        {
                                            "value": originalValue.toString(),
                                            "replace with": replacementValue.toString(),
                                            "occurrences": varcharCount.toString(),
                                            "records": recordCount.toString()
                                        });
                                    fn.message("Gereed",
                                        `${varcharCount} ${values} vervangen binnen ${recordCount} ${rows}`)
                                    fn.refreshTable(tableName, null);
                                }
                            )
                        },
                        function () {
                            cancelFunctionNoop()
                        });
                }
            }
        )
    }
    if (columnName.trim().includes("author")) {
        fn.confirm(
            "Waarschuwing",
            "Wijzigingen aan auteursnamen propageren \"blind\" naar eventuele regels in de tabel \"PERSON\"." +
            "<br><br>" +
            "Dit betekent dat wijzigingen worden doorgevoerd op de <i>normalised full name</i> van iedere auteur met de " +
            "betreffende naam, ook als dit bijvoorbeeld verschillende personen met dezelfde naam mocht betreffen." +
            "<br><br>" +
            "Eventuele wijzigingen op persoonsniveau kunnen in de tabel \"PERSON\" worden gedaan. " +
            "<br><br>" +
            "Wilt u doorgaan?",
            function () {
                powerPrompt(
                    sTitle,
                    aFieldNames,
                    aValues,
                    bulkReplaceFunction,
                    cancelFunctionNoop,
                    false,
                    []
                )
            },
            cancelFunctionNoop
        );
    } else {
        powerPrompt(
            sTitle,
            aFieldNames,
            aValues,
            bulkReplaceFunction,
            cancelFunctionNoop,
            false,
            []
        )
    }
}

function mapColumnNameToNiceName(input, nameToNice = true) {
    const nameToNiceDict = {
        "id": "ID",
        "metadata_pkid": "ID",
        "textfile_pkid": "ID",
        "textfile_internal_pid": "PID",
        "textfile_text_version": "text version",
        "textfile_superseded": "superseded",
        "ipr_pkid": "ID",
        "ipr_data_access": "data access",
        "source_id": "source ID",
        "source_pkid": "ID",
        "source_publication_date": "publication date",
        "source_witness_date": "witness date",
        "titleinformation_pkid": "ID",
        "titleinformation_independent_title": "independent title",
        "titleinformation_dependent_title": "dependent title",
        "titleinformation_series_title": "series title",
        "textcategorisation_pkid": "ID",
        "textcategorisation_medium": "medium",
        "textcategorisation_intended_audience": "intended audience",
        "language_variety": "language variety",
        "normalised_full_name_author": "author",
        "normalised_full_name_author_dependent": "author dependent title",
    };

    if (nameToNice) {
        return nameToNiceDict[input] ?? input;
    } else {
        const niceToNameDict = Object.fromEntries(
            Object.entries(nameToNiceDict)
                .map(([raw, nice]) => [nice, raw])
        );
        return niceToNameDict[input] ?? input;
    }
}

function unzipObject(obj, keyTransform = k => k, valueTransform = v => v, column) {
    const entries = Object
        .entries(obj)
        .filter(([k, v]) => k !== column);
    const keys = entries.map(([k, v]) => keyTransform(k));
    const values = entries.map(([k, v]) => valueTransform(v));
    return {
        aFieldNames: keys,
        aValues: values
    };
}

function getOperatorOptions(columnType) {
    if (columnType.trim() === "varchar" || columnType.trim() === "varchar[]") {
        return [
            "IGNORED" + "::selected",
            "IDENTICAL TO",
            "IDENTICAL TO (ignoring case)",
            "INCLUSIVE OF",
            "INCLUSIVE OF (ignoring case)",
        ];
    }
    if (columnType.trim() === "integer") {
        return [
            "IGNORED" + "::selected",
            "IDENTICAL TO",
            "LESS THAN",
            "GREATER THAN",
        ];
    }
    if (columnType.trim() === "datestring") {
        return [
            "IGNORED" + "::selected",
            "IDENTICAL TO",
            "BEFORE",
            "AFTER",
        ];
    }
    if (columnType.trim() === "languagevariety") {
        return [
            "IGNORED" + "::selected",
            "INCLUDED",
            "EXCLUDED",
        ]
    }
}

function getEnumeratedOptions(columnName) {
    switch (columnName) {
        case "gender":
            return [
                "IGNORED" + "::selected",
                "MALE",
                "FEMALE",
                "NON-BINARY",
                "UNDISCLOSED",
            ];
        case "data_access":
        case "ipr_data_access":
            return [
                "IGNORED" + "::selected",
                "ONLINE",
                "EXTERNAL",
                "INTERNAL",
                "UNSPECIFIED"
            ];
        case "origin_digitised_file":
            return [
                "IGNORED" + "::selected",
                "BORN_DIGITAL",
                "ATR",
                "ATR_MANUAL_VERIFICATION",
                "ASR",
                "ASR_MANUAL_VERIFICATION",
                "UNSPECIFIED"
            ];
        case "language_variety":
            return [
                "AN",
                "BN",
                "MN",
                "NN",
                "SN"
            ];
        default:
            return [
                "IGNORED" + "::selected",
                "TRUE",
                "FALSE",
                "UNSPECIFIED"
            ];
    }
}

function makeFormState(tableSchema, selectedColumn) {
    const niceColumn = mapColumnNameToNiceName(selectedColumn, true).replaceAll("_", " ");
    const state = {
        [`set ${niceColumn} to`]: "",
        [`where ${niceColumn} is`]: "",
        [`value`]: "",
        [``]: "AND" + "::disabled", // Dummyveld voor visuele opsplitsing
    };

    for (const {columnName, dataType} of tableSchema) {
        const niceName = mapColumnNameToNiceName(columnName, true).replaceAll("_", " ");
        if (dataType.trim() === "enum" || dataType.trim() === "boolean") {
            // Enums en bools geen operator, moeten altijd matchen
            state[`where ${niceName} is`] = getEnumeratedOptions(columnName);
        } else if (dataType.trim() === "datestring") {
            // Datestrings hebben een datepicker nodig en hebben hun eigen opties
            state[`where ${niceName} is`] = getOperatorOptions(dataType);
            state[`value (${niceName})`] = "" + "::datepicker";
        } else if (dataType.trim() === "languagevariety") {
            state["language variety AN must be"] = getOperatorOptions(dataType);
            state["language variety BN must be"] = getOperatorOptions(dataType);
            state["language variety MN must be"] = getOperatorOptions(dataType);
            state["language variety NN must be"] = getOperatorOptions(dataType);
            state["language variety SN must be"] = getOperatorOptions(dataType);
        } else {
            state[`where ${niceName} is`] = getOperatorOptions(dataType);
            state[`value (${niceName})`] = "";
        }
        // Geselecteerde kolom mag niet genegeerd worden
        if (columnName === selectedColumn) {
            if (dataType.trim() === "enum" || dataType.trim() === "boolean") {
                state[`set ${niceColumn} to`] = getEnumeratedOptions(columnName)
                    .filter(item => item !== "IGNORED" + "::selected");
                state[`where ${niceColumn} is`] = getEnumeratedOptions(columnName)
                    .filter(item => item !== "IGNORED" + "::selected");
                delete state[`value`];
            } else if (dataType.trim() === "languagevariety") {
                state["language variety AN must be"] = getOperatorOptions(dataType);
                state["language variety BN must be"] = getOperatorOptions(dataType);
                state["language variety MN must be"] = getOperatorOptions(dataType);
                state["language variety NN must be"] = getOperatorOptions(dataType);
                state["language variety SN must be"] = getOperatorOptions(dataType);
            } else if (dataType.trim() === "languagevariety") {
                state[`set ${niceColumn} to`] = getEnumeratedOptions(columnName);
            }
            // Datestrings hebben een datepicker nodig en hebben hun eigen opties
            else if (dataType.trim() === "datestring") {
                state[`where ${niceColumn} is`] = getOperatorOptions(dataType)
                    .filter(item => item !== "IGNORED" + "::selected");
                state[`value`] = "" + "::datepicker";
                state[`set ${niceColumn} to`] = "" + "::datepicker";
            } else {
                state[`where ${niceColumn} is`] = getOperatorOptions(dataType)
                    .filter(item => item !== "IGNORED" + "::selected");
            }
        }
    }
    return state;
}

function truncateLongString(text, maxLen = 255) {
    return text.length > maxLen
        ? text.slice(0, maxLen) + "…"
        : text;
}

function validateBulkReplaceFormResponse(dataType, columnName, whereValue, operator, isSelectedColumn) {
    const niceColumn = mapColumnNameToNiceName(columnName, true).replaceAll("_", " ");
    if (dataType.trim() === "integer" && whereValue !== "") {
        // Bestaande checks toepassen op invoer integers
        if (columnName.trim() === "yearofbirth" || columnName.trim() === "yearofdeath") {
            if (!validatePersonYear(whereValue)) {
                return {
                    isValid: false,
                    warning: null,
                    error: `Geen valide jaar voor ${niceColumn}: "${whereValue}"`
                };
            }
        } else {
            if (!validateInteger(whereValue)) {
                return {
                    isValid: false,
                    warning: null,
                    error: `Geen valide getal voor ${niceColumn}: "${whereValue}"`
                };
            }
        }
    }
    if (dataType.trim() === "varchar" || dataType.trim() === "varchar[]") {
        // Varchar max-lengte
        if (whereValue.length > 255) {
            return {
                isValid: false,
                warning: null,
                error: `Waarde langer dan 255 karakters voor ${niceColumn}: "${truncateLongString(whereValue)}"`
            };
        }
        if (dataType.trim() === "varchar[]") {
            // Specifiek voor varchar arrays: geen GIN-index beschikbaar voor LIKE/ILIKE
            if (operator.trim().startsWith("INCLUSIVE OF") || operator.trim() === "IDENTICAL TO (ignoring case)") {
                return {
                    isValid: true,
                    warning: `Let op: de operator ${operator} werkt traag voor lijsten tekenreeksen zoals ${niceColumn}. 
                    Gebruik eventueel de operator \"IDENTICAL TO\" waar mogelijk.`,
                    error: null,
                };
            }
        }
    }
    if (dataType.trim() === "datestring") {
        const prepareWhereValue = whereValue.replaceAll("-", "/");
        if (!validateDateHasValidFormat(prepareWhereValue)) {
            return {
                isValid: false,
                warning: null,
                error: `Geen valide datum voor ${niceColumn}: "${whereValue}"`
            };
        }
    }
    if (
        operator.trim() === "IGNORED"
        && whereValue !== ""
        && dataType.trim() !== "languagevariety"
        && dataType.trim() !== "enum"
        && dataType.trim() !== "boolean"
    ) {
        return {
            isValid: true,
            warning: `Let op: waarden ingevuld onder "${operator}" worden genegeerd`,
            error: null
        };
    }

    return {
        isValid: true,
        warning: null,
        error: null
    };
}

function buildPayload(tableName, selectedColumn, response, schema) {
    let formResponseIsValid = true;
    const warnings = [];
    const errors = [];

    const niceColumnSelected = mapColumnNameToNiceName(selectedColumn, true).replaceAll("_", " ");
    const columnDataType = schema.find(item => item.columnName === selectedColumn).dataType;
    const replacementValue = response[`set ${niceColumnSelected} to`];

    const mapping = {
        table: tableName,
        column: selectedColumn,
        columnDataType: columnDataType,
        replacementValue: replacementValue,
    };

    const filters = schema.map(({columnName, dataType}) => {
        let whereKey;
        let operatorKey;
        const niceColumnName = mapColumnNameToNiceName(columnName, true).replaceAll("_", " ");
        // Hier bepalen we de uit te lezen keys en values
        whereKey = (
            columnName === selectedColumn
            && dataType !== "enum"
            && dataType !== "boolean"
            && dataType !== "languagevariety"
        )
            ? `value`
            : `value (${niceColumnName})`;
        operatorKey = (
            columnName === selectedColumn
            && dataType !== "enum"
            && dataType !== "boolean"
            && dataType !== "languagevariety"
        )
            ? `where ${niceColumnSelected} is`
            : `where ${niceColumnName} is`;
        // Enums en bools geen operator nodig, moeten matchen
        if (dataType.trim() === "enum" || dataType.trim() === "boolean") {
            whereKey = `where ${niceColumnName} is`;
        }

        let whereValue = response[whereKey] ?? "";
        let whereNotValue = response[whereKey] ?? "";
        let operator = response[operatorKey] ?? "IGNORED";

        if (dataType.trim() === "languagevariety") {
            const includeAN = response[`language variety AN must be`] === "INCLUDED";
            const includeBN = response[`language variety BN must be`] === "INCLUDED";
            const includeMN = response[`language variety MN must be`] === "INCLUDED";
            const includeNN = response[`language variety NN must be`] === "INCLUDED";
            const includeSN = response[`language variety SN must be`] === "INCLUDED";
            const excludeAN = response[`language variety AN must be`] === "EXCLUDED";
            const excludeBN = response[`language variety BN must be`] === "EXCLUDED";
            const excludeMN = response[`language variety MN must be`] === "EXCLUDED";
            const excludeNN = response[`language variety NN must be`] === "EXCLUDED";
            const excludeSN = response[`language variety SN must be`] === "EXCLUDED";

            if (includeAN) whereValue += "AN;";
            if (includeBN) whereValue += "BN;";
            if (includeMN) whereValue += "MN;";
            if (includeNN) whereValue += "NN;";
            if (includeSN) whereValue += "SN;";
            if (excludeAN) whereNotValue += "AN;";
            if (excludeBN) whereNotValue += "BN;";
            if (excludeMN) whereNotValue += "MN;";
            if (excludeNN) whereNotValue += "NN;";
            if (excludeSN) whereNotValue += "SN;";
        }

        // Deze functie geeft true en eventuele warnings, of false en errors
        const {isValid, warning, error} = validateBulkReplaceFormResponse(
            columnName === selectedColumn ? columnDataType : dataType,
            columnName,
            columnName === selectedColumn ? replacementValue : whereValue,
            operator,
            columnName === selectedColumn
        );
        // Alleen errors bij invalid
        if (!isValid) {
            formResponseIsValid = false;
            errors.push({
                column: columnName === selectedColumn ? niceColumnSelected : niceColumnName,
                error: error,
                attemptedValue: columnName === selectedColumn ? replacementValue : whereValue,
                operator: operator
            });
        }
        // Warnings niet-fataal, wel meegeven
        if (warning !== null && warning !== "") {
            warnings.push({
                column: columnName === selectedColumn ? niceColumnSelected : niceColumnName,
                warning: warning,
                attemptedValue: columnName === selectedColumn ? replacementValue : whereValue,
                operator: operator
            })
        }

        let inSituSubstring = "false";
        let caseInsensitive = "false";

        if (dataType.trim() === "enum" || dataType.trim() === "boolean") {
            if (whereValue === "IGNORED") {
                operator = whereValue;
                whereValue = "";
            }
        }
        switch (operator) {
            case "LESS THAN":
                operator = "<";
                break;
            case "GREATER THAN":
                operator = ">";
                break;
            case "IDENTICAL TO":
                operator = "=";
                break;
        }
        if (dataType.trim() === "integer") {
            switch (operator) {
                case "LESS THAN":
                    operator = "<";
                    break;
                case "GREATER THAN":
                    operator = ">";
                    break;
                case "IDENTICAL TO":
                    operator = "=";
                    break;
            }
        } else if (dataType.trim() === "datestring") {
            switch (operator) {
                case "BEFORE":
                    operator = "<";
                    break;
                case "AFTER":
                    operator = ">";
                    break;
                case "IDENTICAL TO":
                    operator = "=";
                    break;
            }
        } else if (dataType.startsWith("varchar")) {
            switch (operator) {
                case "IDENTICAL TO (ignoring case)":
                    caseInsensitive = "true";
                    break;
                case "INCLUSIVE OF":
                    inSituSubstring = "true";
                    break;
                case "INCLUSIVE OF (ignoring case)":
                    inSituSubstring = "true";
                    caseInsensitive = "true";
                    break;
            }
        }
        return {
            column: columnName,
            dataType: dataType,
            whereValue: whereValue,
            whereNotValue: whereNotValue,
            inSituSubstring: inSituSubstring,
            caseInsensitive: caseInsensitive,
            operator: operator,
        };
    });

    if (formResponseIsValid) {
        return {mappings: [mapping], filters, warnings};
    } else {
        // Payload irrelevant bij errors
        return {errors};
    }
}

function getTableSchema(tableName) {
    // Enkele stamgegevens omtrent relevante kolommen
    switch (tableName) {
        case "___agg_ipr":
            return [
                {columnName: "ipr_pkid", dataType: "integer"},
                {columnName: "data_access", dataType: "enum"},
                {columnName: "copyright_owner", dataType: "varchar"},
                {columnName: "license_type", dataType: "varchar"},
            ];
        case "___agg_metadata":
            return [
                {columnName: "metadata_pkid", dataType: "integer"},
                {columnName: "textfile_text_version", dataType: "varchar"},
                {columnName: "textfile_superseded", dataType: "boolean"},
                {columnName: "ipr_data_access", dataType: "enum"},
                {columnName: "source_id", dataType: "varchar"},
                {columnName: "source_collection", dataType: "varchar[]"},
                {columnName: "source_publication_date", dataType: "datestring"},
                {columnName: "source_witness_date", dataType: "datestring"},
                {columnName: "titleinformation_independent_title", dataType: "varchar"},
                {columnName: "titleinformation_dependent_title", dataType: "varchar"},
                {columnName: "titleinformation_series_title", dataType: "varchar"},
                {columnName: "textcategorisation_medium", dataType: "varchar"},
                {columnName: "textcategorisation_intended_audience", dataType: "varchar"},
                // {columnName: "language_variety", dataType: "languagevariety"},
                {columnName: "normalised_full_name_author", dataType: "varchar[]"},
                {columnName: "normalised_full_name_author_dependent", dataType: "varchar[]"},
                {columnName: "remark", dataType: "varchar"},
            ];
        case "___agg_source":
            return [
                {columnName: "source_pkid", dataType: "integer"},
                {columnName: "source_url", dataType: "varchar"},
                {columnName: "publisher", dataType: "varchar"},
                {columnName: "isbn_issn", dataType: "varchar"},
                {columnName: "place_of_publication", dataType: "varchar"},
                {columnName: "edition", dataType: "varchar"},
                {columnName: "source_collection", dataType: "varchar[]"},
                {columnName: "call_number_manuscript", dataType: "varchar[]"},
                {columnName: "start_page", dataType: "integer"},
                {columnName: "end_page", dataType: "integer"},
                {columnName: "volume", dataType: "varchar"},
                {columnName: "issue", dataType: "varchar"},
                {columnName: "origin_digitised_file", dataType: "enum"},
                {columnName: "publication_date", dataType: "datestring"},
                {columnName: "witness_date", dataType: "datestring"},
                {columnName: "text_date", dataType: "datestring"},
                {columnName: "source_id", dataType: "varchar"},
                {columnName: "source_origin", dataType: "varchar[]"},
            ];
        case "___agg_textcategorisation":
            return [
                {columnName: "textcategorisation_pkid", dataType: "integer"},
                {columnName: "medium", dataType: "varchar"},
                {columnName: "intended_audience", dataType: "varchar"},
                {columnName: "translated_text", dataType: "boolean"},
                {columnName: "id_original_language", dataType: "varchar"},
                {columnName: "name_original_language", dataType: "varchar"},
                {columnName: "publication_section", dataType: "varchar"},
                {columnName: "fictionality", dataType: "boolean"},
                {columnName: "setting_location", dataType: "varchar[]"},
                {columnName: "setting_person", dataType: "varchar[]"},
                {columnName: "setting_organisation", dataType: "varchar[]"},
            ];
        case "___agg_textfile":
            return [
                {columnName: "textfile_pkid", dataType: "integer"},
                {columnName: "text_version", dataType: "varchar"},
                {columnName: "superseded", dataType: "boolean"},
            ];
        case "___agg_titleinformation":
            return [
                {columnName: "titleinformation_pkid", dataType: "integer"},
                {columnName: "subtitle", dataType: "varchar"},
                {columnName: "title", dataType: "varchar"},
                {columnName: "dependent_title", dataType: "varchar"},
                {columnName: "series_title", dataType: "varchar"},
            ];
        case "person":
            return [
                {columnName: "id", dataType: "integer"},
                {columnName: "normalisedfullname", dataType: "varchar"},
                {columnName: "fullnamefromsource", dataType: "varchar"},
                {columnName: "pseudonym", dataType: "varchar[]"},
                {columnName: "anonymised", dataType: "boolean"},
                {columnName: "firstname", dataType: "varchar"},
                {columnName: "lastname", dataType: "varchar"},
                {columnName: "gender", dataType: "enum"},
                {columnName: "yearofbirth", dataType: "integer"},
                {columnName: "yearofdeath", dataType: "integer"},
                {columnName: "highestcompletededucationlevel", dataType: "varchar"},
                {columnName: "placeofbirth", dataType: "varchar"},
                {columnName: "occupation", dataType: "varchar[]"},
                {columnName: "placeofresidence", dataType: "varchar[]"},
                {columnName: "organisationname", dataType: "varchar[]"},
                {columnName: "religion", dataType: "varchar"},
                {columnName: "socialstatus", dataType: "varchar"},
                {columnName: "externalpersonidentifier", dataType: "varchar[]"},
            ];
        default:
            throw new Error("No schema found for table " + tableName + "");
    }
}

function bulkReplaceWithFilters(tableName, columnName) {
    // Stel wat strings samen voor de gebruiker
    const niceColumn = mapColumnNameToNiceName(columnName).replaceAll("_", " ").trim();
    const sTitle = "Bulk replace" + " " + niceColumn;
    // Haal relevante kolommen en datatypen op per tabel
    const tableSchema = getTableSchema(tableName);
    // Stel daarna de juiste forms samen
    const keyValueObject = makeFormState(tableSchema, columnName);
    // Extraheer de juist veldnamen en waarden uit het keyValueObject
    let {aFieldNames, aValues} = unzipObject(
        keyValueObject,
        k => k,
        v => v,
        niceColumn
    );
    // Definieer de functie die in de fn.prompt zal worden uitgevoerd
    const bulkReplaceFunction = function (response) {
        const payload =
            buildPayload(
                tableName,
                columnName,
                response,
                tableSchema
            );
        // Zonder payload niets doen
        if (payload === null) {
            fn.message(
                "Er is iets misgegaan",
                "Payload is null, neem contact op met de beheerder",
                cancelFunctionNoop
            );
            return;
        }
        // Bij errors niets doen
        if (payload.errors) {
            const errorStrings = [];
            payload.errors.forEach(e => {
                const errorString = `Fout bij ${e.column}. ${e.error}.`;
                errorStrings.push(errorString);
            });
            fn.message(
                "Invoer ongeldig",
                errorStrings.join("<br><br>"),
                cancelFunctionNoop
            );
        }
        // Warnings zijn niet fataal, geef gebruiker keuze
        else if (payload.warnings.some(w => w.warning !== null && w.warning !== "")) {
            const warningStrings = [];
            payload.warnings.forEach(w => {
                const warningString = `Waarschuwing bij ${w.column}. ${w.warning}`;
                warningStrings.push(warningString);
            });
            warningStrings.push("Wilt u doorgaan?");
            fn.confirm(
                "Waarschuwing",
                warningStrings.join("<br><br>"),
                function () {
                    processBulkReplacePayload(
                        response,
                        payload,
                        niceColumn,
                        columnName,
                        tableName
                    );
                },
                cancelFunctionNoop
            )
        }
        // In alle andere gevallen, ga door
        else {
            processBulkReplacePayload(
                response,
                payload,
                niceColumn,
                columnName,
                tableName
            );
        }
    }
    powerPrompt(
        sTitle,
        aFieldNames,
        aValues,
        bulkReplaceFunction,
        cancelFunctionNoop,
        false,
        []
    )
}

function processBulkReplacePayload(response, payload, niceColumn, columnName, tableName) {
    // Plaats oorspronkelijke waarde in respons afhankelijk van datatype (I know..)
    const originalValue = response[`value`] ?? response[`where ${niceColumn} is`];
    const replacementValue = response[`set ${niceColumn} to`];
    // Waarschuw voor lege waarden
    if (originalValue.trim() === "" && replacementValue.trim() === "") {
        fn.message(
            "Geen waarden ingevuld",
            "Vul a.u.b. iets in voor de te vervangen waarde",
            cancelFunctionNoop
        )
        return;
    }
    const jsonString = JSON.stringify(payload);
    // Roep eerst een functie aan om de telling te weergeven
    fn.callFunction(
        "metadata.count_replacements_with_filters",
        [
            prepareJsonValue(jsonString)
        ],
        function (response) {
            const sTitle = "Waarden vervangen";
            const occurrences = response["count_replacements_with_filters"];
            const bothOrAll = occurrences.trim() === "2" ? "beide" : "allemaal";
            let sMessage = `Er zijn ${occurrences} instanties gevonden van de waarde \"${originalValue}\"
                    met de ingestelde filters. Wilt u deze ${bothOrAll} vervangen met \"${replacementValue}\"?`;
            if (occurrences.trim() === "1") {
                sMessage = `Er is ${occurrences} instantie gevonden van waarde \"${originalValue}\"
                    met de ingestelde filters. Wilt u deze vervangen met \"${replacementValue}\"?`;
            }
            if (parseInt(occurrences) < 1) {
                fn.message(
                    "Geen resultaat",
                    `Er zijn geen waarden gevonden die corresponderen aan \"${originalValue}\"
                            met de ingestelde filters`,
                    cancelFunctionNoop
                )
            } else {
                // Bij OK, voer bulk replace uit
                fn.confirm(
                    sTitle,
                    sMessage,
                    function () {
                        fn.callFunction(
                            "metadata.bulk_replace_with_filters",
                            [
                                prepareJsonValue(jsonString)
                            ],
                            function (response) {
                                const recordsAffected = response["bulk_replace_with_filters"];
                                logUserEvent(
                                    "BULK_REPLACE",
                                    tableName,
                                    "bulk_replace_with_filters",
                                    columnName,
                                    {
                                        "value": originalValue.toString(),
                                        "replace with": replacementValue.toString(),
                                        "occurrences": occurrences.toString()
                                    });
                                const values = recordsAffected.trim() === "1" ? "waarde" : "waarden";
                                fn.message("Gereed", ` ${recordsAffected} ${values} vervangen`)
                                fn.refreshTable(tableName, null);
                            }
                        )
                    },
                    function () {
                        cancelFunctionNoop()
                    });
            }
        }
    )
}

function navigateToDuct(table) {
    // Haal de huidige rij op
    const nRow = fn.getActiveRowNode(table);
    // Bepaal of we met een Element te make hebben
    const rowEl = nRow instanceof Element
        ? nRow
        : nRow[0]
    // Vind de cel die eindigt op _pkid; dit is het ID van de gedenormaliseerde tabel
    const cell = Array.from(rowEl.querySelectorAll('td'))
        .find(td =>
            Array.from(td.classList).some(c => c.endsWith('_pkid'))
        );
    // Extraheer de inhoud als de cel truthy is
    const metadataId = cell && cell.textContent;
    // Hal het file-ID op en interpoleer in de URL
    fn.callFunction(
        "metadata.get_file_id_from_metadata_id",
        [metadataId],
        function (response) {
            const file_id = response["get_file_id_from_metadata_id"]
            window.open(`http://duct.ivdnt.loc/duct/file.jsp?id=${file_id}`, '_blank');
        })
}

function returnIntProfile(table) {
    // Haal de huidige rij op
    const nRow = fn.getActiveRowNode(table);
    // Bepaal of we met een Element te make hebben
    const rowEl = nRow instanceof Element
        ? nRow
        : nRow[0]
    // Vind de cel die eindigt op _pkid; dit is het ID van de gedenormaliseerde tabel
    const cell = Array.from(rowEl.querySelectorAll('td'))
        .find(td =>
            Array.from(td.classList).some(c => c.endsWith('_pkid'))
        );
    // Extraheer de inhoud als de cel truthy is
    const metadataId = cell && cell.textContent;
    fn.callFunction(
        "metadata.generate_textprofile_int",
        [metadataId],
        // Retourneer de XML-file
        function (response) {
            const blob = new Blob([response["generate_textprofile_int"]], {type: 'text/xml'});
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `metadata_${metadataId}.xml`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        }
    );
    logUserEvent(
        "FUNCTION_CALL",
        "___agg_metadata",
        "generate_textprofile_int",
        "none",
        {
            "id": metadataId
        }
    );
}

function prepareStringValue(stringValue) {
    // Plaats expliciet single quotes voor correct uitlezen in DB
    return "'" + stringValue + "'";
}

function prepareArrayValue(stringArrayValue) {
    // Plaats expliciet single quotes en curly brackets voor correct uitlezen in DB
    return "'{" + stringArrayValue + "}'";
}

function prepareJsonValue(jsonValue) {
    // Plaats expliciet single quotes voor correct uitlezen in DB
    return "'" + jsonValue + "'";
}

function prepareIntegerValue(integerValue) {
    // Afvangen lege stringwaarde
    return integerValue !== "" ? integerValue : null;
}

function nullToEmpty(value) {
    // Afvangen null-(esque) waarden DB
    let stringValue = "";
    if (value == null) {
        stringValue = "";
    } else if (typeof value === "string") {
        const trimmed = value.trim().toLowerCase();
        if (trimmed !== "" && trimmed !== "none") {
            stringValue = value;
        }
    } else {
        stringValue = value;
    }
    if (Array.isArray(stringValue)) {
        stringValue = value.join(",");
    }
    return stringValue;
}

function getPreselectedArray(array, selectedValue) {
    if (selectedValue === null || selectedValue === undefined || selectedValue === "") {
        selectedValue = "UNSPECIFIED";
    }
    // Plak "::selected" op een array member met een voorgeselecteerde waarde
    array.forEach((item, index) => {
        if (selectedValue === item.toString()) {
            array[index] = selectedValue + "::selected";
        }
    });
    return array;
}

function cancelFunctionNoop() {
    // Geen operatie
    $.noop();
}

function noZeroDate(text) {
    if (text.includes('0001')) {
        return "";
    } else return text;
}

function niceArray(text) {
    return text
        .replaceAll("{", "")
        .replaceAll("}", "")
        .replaceAll(",", "; ")
        .replaceAll("\"", "");
}

function nicePersonArray(text) {
    return text
        .replaceAll("{", "")
        .replaceAll("}", "")
        .replaceAll(",\"", "; ")
        .replaceAll("\"", "");
}

function wrongDateFormatMessage(tableName) {
    fn.message(
        "Verkeerde datumformaat",
        "Voer a.u.b. een datum van het formaat *DD/MM/YYYY* in. " +
        "Is er zowel een van-datum als een tot-datum? " +
        "Voer dan twee datums in gescheiden door \'-\', oftewel *DD/MM/YYYY - DD/MM/YYYY*. " +
        "U kunt ook op een datum dubbelklikken om een datepicker te openen.");
    fn.refreshTable(tableName, null);
}

function impossibleDateRangeMessage(tableName) {
    fn.message(
        "Startdatum ligt voor einddatum",
        "Als er zowel een van-datum als een tot-datum is mag de startdatum niet voor de einddatum liggen.");
    fn.refreshTable(tableName, null);
}

function impossibleYearMessage(kindOfYear) {
    if (kindOfYear === null || kindOfYear === undefined) kindOfYear = "jaartal";
    fn.message(
        `Ongeldig ${kindOfYear}`,
        `Voer a.u.b. een ${kindOfYear} tussen de 1000 en 3000 in.`);
}

function impossibleIntegerMessage() {
    fn.message(
        "Ongeldige waarde",
        "Voer een geheel getal in. " +
        "De waarde mag niet negatief zijn en mag niet meer dan 9999 zijn.");
}

function validateInteger(input) {
    const trimmedInput = input.trim();
    const convertedNum = Number(trimmedInput);
    return trimmedInput !== "" && Number.isInteger(convertedNum);
}

function validatePersonYear(input, options = {
    minYear: 1000,
    maxYear: 3000
}) {
    // Bij geen input, retourneer true omdat input niet verplicht is
    if (input === null || input.trim() === "") {
        return true;
    }

    // Converteer naar string en trim whitespace
    const stringInput = String(input).trim();
    if (stringInput.length !== 4) {
        return false; // Moet precies 4 karakters bevatten
    }

    // Alleen digits, mag niet met 0 beginnen
    if (!/^[1-9]\d{3}$/.test(stringInput)) {
        return false;
    }

    // Parseer integer en check range
    const year = Number(stringInput);
    if (Number.isNaN(year)) {
        return false;
    }

    const currentYear = new Date().getFullYear();
    const minYear = typeof options.minYear === 'number' ? options.minYear : 1000;
    const maxYear = typeof options.maxYear === 'number' ? options.maxYear : currentYear;

    return !(year < minYear || year > maxYear);
}

function validateDateHasValidFormat(dateString) {
    if (dateString.trim() === "") return true;
    // Check op expressie (i) DD/MM/YYYY of (ii) DD/MM/YYY - DD/MM/YY
    const regex =
        /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}(?:\s*-\s*(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4})?$/;
    return regex.test(dateString);
}

function validateDatesAreInChronologicalOrder(dateString) {
    const [fromStr, toStr] = dateString.split(" - ");

    const [dayF, monthF, yearF] = fromStr.split("/").map(Number);
    const [dayT, monthT, yearT] = toStr.split("/").map(Number);

    const fromDate = new Date(yearF, monthF - 1, dayF);
    const toDate = new Date(yearT, monthT - 1, dayT);

    if (isNaN(fromDate.getTime()) || (toStr !== "" && toStr !== null && isNaN(toDate.getTime()))) {
        return false;
    }

    const isValidFrom =
        fromDate.getFullYear() === yearF &&
        fromDate.getMonth() === monthF - 1 &&
        fromDate.getDate() === dayF;

    const isValidTo =
        toDate.getFullYear() === yearT &&
        toDate.getMonth() === monthT - 1 &&
        toDate.getDate() === dayT;

    if (!isValidFrom) {
        return false;
    }

    if (isValidFrom && !isValidTo) {
        return true;
    }
    return toDate > fromDate;
}

function handleStringArray(table, node, value, tableName, pkidColumnName, columnName, schemaName) {
    const id = fn.getRowNodeId(node);
    // Maak een array dat postgres accepteert, i.e. '{val1, val2}'
    const valueToBeSent = prepareArrayValue(value.replaceAll(";".trim(), ","));
    fn.callFunction(
        "metadata.update_string_array_column",
        [tableName, pkidColumnName, id, columnName, valueToBeSent, schemaName],
        function () {
            logUserEvent(
                "FUNCTION_CALL",
                tableName,
                "update_string_array_column",
                columnName,
                {
                    "id": id,
                    "value": prepareStringValue(valueToBeSent)
                })
            fn.refreshTable(tableName, null);
        })
}

function handleDateInformationDblClick(table, node, tableName, choice) {
    const id = fn.getRowNodeId(node);
    const sData = fn.getDataFromCellNode(node).replaceAll("/", "-");
    const bTextarea = false;
    const aColsAndRows = [];
    const sTitle = "Klik op een datum";
    const aFieldNames = [
        "Publication date (from)",
        "Publication date (to)"
    ];
    const aValues = sData.length <= 10 // Enkele of dubbele date, d.w.z. _from/_to identiek of niet
        ? [sData + "::datepicker", "" + "::datepicker"]
        : [sData.split(" - ")[0] + "::datepicker", sData.split(" - ")[1] + "::datepicker"];

    const fnFunction = function (response) {
        const prepareDateFrom = response["Publication date (from)"].replaceAll("-", "/");
        const prepareDateTo = response["Publication date (to)"].replaceAll("-", "/");
        const dayFrom = response["Publication date (from)"].split("-")[0];
        const dayTo = response["Publication date (to)"].split("-")[0] === ""
            ? response["Publication date (from)"].split("-")[0]
            : response["Publication date (to)"].split("-")[0];
        const monthFrom = response["Publication date (from)"].split("-")[1];
        const monthTo = response["Publication date (to)"].split("-")[1] === ""
            ? response["Publication date (from)"].split("-")[1]
            : response["Publication date (to)"].split("-")[1];
        const yearFrom = response["Publication date (from)"].split("-")[2];
        const yearTo = response["Publication date (to)"].split("-")[2] === ""
            ? response["Publication date (from)"].split("-")[2]
            : response["Publication date (to)"].split("-")[2];
        if (validateDateHasValidFormat(prepareDateFrom)
            && validateDateHasValidFormat(prepareDateTo)) {
            if (validateDatesAreInChronologicalOrder(prepareDateFrom + ' - ' + prepareDateTo)) {
                fn.callFunction(
                    "metadata.update_dateperiod",
                    [yearFrom, yearTo, monthFrom, monthTo, dayFrom, dayTo, id, choice],
                    function () {
                        logUserEvent(
                            "FUNCTION_CALL",
                            tableName,
                            "update_dateperiod",
                            "source_" + choice + "_date",
                            {
                                "yearfrom": yearFrom,
                                "yearto": yearTo,
                                "monthfrom": monthFrom,
                                "monthto": monthTo,
                                "dayfrom": dayFrom,
                                "dayto": dayTo,
                                "id": id,
                                "choice": choice
                            })
                        fn.refreshTable(tableName, null);
                    });
            } else {
                impossibleDateRangeMessage(tableName)
            }
        } else {
            wrongDateFormatMessage(tableName)
        }
    }
    powerPrompt(
        sTitle,
        aFieldNames,
        aValues,
        fnFunction,
        cancelFunctionNoop,
        bTextarea,
        aColsAndRows
    )
}

function handleDateInformationEditFunc(table, node, value, tableName, choice) {
    const id = fn.getRowNodeId(node);
    // Check op expressie (i) DD/MM/YYYY of (ii) DD/MM/YYY - DD/MM/YY
    if (validateDateHasValidFormat(value)) {
        // (i) DD/MM/YYYY
        if (value.length <= 10) {
            const day = value.split("/")[0];
            const month = value.split("/")[1];
            const year = value.split("/")[2];
            fn.callFunction(
                "metadata.update_dateperiod",
                [year, year, month, month, day, day, id, choice],
                function () {
                    logUserEvent(
                        "FUNCTION_CALL",
                        tableName,
                        "update_dateperiod",
                        choice + "_date",
                        {
                            "yearfrom": year,
                            "yearto": year,
                            "monthfrom": month,
                            "monthto": month,
                            "dayfrom": day,
                            "dayto": day,
                            "id": id,
                            "choice": choice
                        })
                    fn.refreshTable(tableName, null);
                })
        } else { // (ii) DD/MM/YYY - DD/MM/YY
            if (validateDatesAreInChronologicalOrder(value)) {
                const from = value.split(" - ")[0];
                const dayFrom = from.split("/")[0];
                const monthFrom = from.split("/")[1];
                const yearFrom = from.split("/")[2];
                const to = value.split(" - ")[1];
                const dayTo = to.split("/")[0];
                const monthTo = to.split("/")[1];
                const yearTo = to.split("/")[2];
                fn.callFunction(
                    // Zelfde functie, maar verschillende waarden params _from/_to
                    "metadata.update_dateperiod",
                    [yearFrom, yearTo, monthFrom, monthTo, dayFrom, dayTo, id, choice],
                    function () {
                        logUserEvent(
                            "FUNCTION_CALL",
                            tableName,
                            "update_dateperiod",
                            choice + "_date",
                            {
                                "yearfrom": yearFrom,
                                "yearto": yearTo,
                                "monthfrom": monthFrom,
                                "monthto": monthTo,
                                "dayfrom": dayFrom,
                                "dayto": dayTo,
                                "id": id,
                                "choice": choice
                            })
                        fn.refreshTable(tableName, null);
                    })
            } else {
                impossibleDateRangeMessage(tableName)
            }
        }
    } else {
        wrongDateFormatMessage(tableName);
    }
}

function handleLanguageVariety(table, node) {
    const sTitle = "Taalvariant bewerken";
    const aFieldNames = ["AN", "BN", "MN", "NN", "SN"];
    const metadataId = fn.getRowNodeId(node);

    let languageVarieties;
    let textCategorisationId;

    fn.getRecord(
        "___agg_metadata",
        metadataId,
        function (response) {
            languageVarieties = response.language_variety;
            textCategorisationId = response.metadata_pkid
        });

    const aValues = aFieldNames.map(name => languageVarieties.includes(name));
    const fnFunction = function (response) {
        const selectedNames = Object
            .keys(response)
            .filter(key => response[key] === true);
        fn.callFunction(
            "metadata.update_textcategorisation_language",
            [textCategorisationId, prepareArrayValue(selectedNames)],
            function () {
                logUserEvent(
                    "FUNCTION_CALL",
                    "___agg_metadata",
                    "update_textcategorisation_language",
                    "language_variety",
                    {
                        "id": metadataId,
                        "selection": selectedNames
                    })
                fn.refreshTable("___agg_metadata", null);
            })
    }

    const bTextarea = false;
    const aColsAndRows = [];
    powerPrompt(
        sTitle,
        aFieldNames,
        aValues,
        fnFunction,
        cancelFunctionNoop,
        bTextarea,
        aColsAndRows)
}

function handlePersonYear(table, node, value, tableName, choice) {
    if (!validatePersonYear(value)) {
        impossibleYearMessage(choice);
        fn.refreshTable(tableName, null);
    } else {
        const id = fn.getRowNodeId(node);
        const column = choice.trim() === "geboortejaar" ? "yearofbirth" : "yearofdeath";
        fn.callFunction(
            "metadata.update_person_year",
            [id, value, choice],
            function () {
                logUserEvent(
                    "FUNCTION_CALL",
                    tableName,
                    "update_person_year",
                    column,
                    {
                        "id": id,
                        "value": value
                    })
                fn.refreshTable(tableName, null)
            }
        )
    }
}

function handleAuthor(table, node, creatorRole) {
    const metadataId = fn.getRowNodeId(node);
    let authors = [];
    // Haal personen op die:
    // (i) creatorrole = 'AUTHOR_OF_(DEPENDENT)_TITLE' hebben
    // (ii) aan de huidige source verbonden zijn in source_creator en creator_person
    fn.callFunction("metadata.get_person_from_metadata",
        [metadataId, prepareStringValue(creatorRole)],
        function (response) {
            authors = JSON.parse(response["get_person_from_metadata"]);
        })
    // Opties zijn iedere verbonden auteur + enkele extra mogelijkheden
    const authorOptions = authors.map(author => author["normalised_full_name"]);
    authorOptions.push("Ik wil een bestaande auteur aan deze bron toevoegen");
    authorOptions.push("Ik wil een nieuwe auteur aanmaken en aan deze bron toevoegen");
    if (authors.some(author => author["person_pkid"] !== null)) {
        authorOptions.push("Ik wil een auteur uit deze bron verwijderen");
    }

    let personpkid = "";
    let normalisedfullname = "";
    let fullnamefromsource = "";
    let pseudonym = "";
    let anonymised = ["TRUE", "FALSE", "UNSPECIFIED"];
    let firstname = "";
    let infixes = "";
    let lastname = "";
    let gender = ["MALE", "FEMALE", "NON-BINARY", "UNDISCLOSED", "UNSPECIFIED"];
    let yearofbirth = "";
    let yearofdeath = "";
    let highesteducationlevel = "";
    let placeofbirth = "";
    let occupation = "";
    let placeofresidence = "";
    let organisationname = "";
    let religion = "";
    let socialstatus = "";
    let externalpersonidentifier = "";

    const sTitle = "Gegevens auteur";
    const aFieldNames = [
        "ID",
        // "Internal person ID",
        "Normalised full name",
        "Full name from source",
        "Pseudonym",
        "Anonymised",
        "First name",
        "Infixes",
        "Last name",
        "Gender",
        "Year of birth",
        "Year of death",
        "Highest education level",
        "Place of birth",
        "Occupation",
        "Place of residence",
        "Organisation",
        "Religion",
        "Social status",
        "External person ID",
    ];
    const bTextarea = false;
    const aColsAndRows = [];

    fn.promptSelect("Auteur wijzigen of aanmaken", authorOptions, authorOptions[0],
        function (selectedOption) {
            if (selectedOption[0] !== "Ik wil een nieuwe auteur aanmaken en aan deze bron toevoegen"
                && selectedOption[0] !== "Ik wil een bestaande auteur aan deze bron toevoegen"
                && selectedOption[0] !== "Ik wil een auteur uit deze bron verwijderen") {
                const person = authors.find(author => author["normalised_full_name"] === selectedOption[0]);
                if (person !== null) {
                    // Behandelen wat binnenkomt uit de DB
                    personpkid = nullToEmpty(person["person_pkid"]);
                    normalisedfullname = nullToEmpty(person["normalised_full_name"]);
                    fullnamefromsource = nullToEmpty(person["full_name_from_source"]);
                    pseudonym = nullToEmpty(person["pseudonym"]);
                    anonymised = getPreselectedArray(anonymised, nullToEmpty(person["anonymised"]));
                    firstname = nullToEmpty(person["first_name"]);
                    infixes = nullToEmpty(person["infixes"]);
                    lastname = nullToEmpty(person["last_name"]);
                    gender = getPreselectedArray(gender, nullToEmpty(person["gender"]));
                    yearofbirth = nullToEmpty(person["year_of_birth"]);
                    yearofdeath = nullToEmpty(person["year_of_death"]);
                    highesteducationlevel = nullToEmpty(person["highest_completed_education_level"]);
                    placeofbirth = nullToEmpty(person["place_of_birth"]);
                    occupation = nullToEmpty(person["occupation"]);
                    placeofresidence = nullToEmpty(person["place_of_residence"]);
                    organisationname = nullToEmpty(person["organisation_name"]);
                    religion = nullToEmpty(person["religion"]);
                    socialstatus = nullToEmpty(person["social_status"]);
                    externalpersonidentifier = nullToEmpty(person["external_person_identifier"]);
                }

                const aValues = [
                    personpkid + "::disabled",
                    normalisedfullname,
                    fullnamefromsource,
                    pseudonym,
                    anonymised,
                    firstname,
                    infixes,
                    lastname,
                    gender,
                    yearofbirth,
                    yearofdeath,
                    highesteducationlevel,
                    placeofbirth,
                    occupation,
                    placeofresidence,
                    organisationname,
                    religion,
                    socialstatus,
                    externalpersonidentifier
                ];

                const fnFunction = function (response) {
                    // Behandelen user response
                    const personpkid = response["ID"];
                    const normalisedfullname = prepareStringValue(response["Normalised full name"]);
                    const fullnamefromsource = prepareStringValue(response["Full name from source"]);
                    const pseudonym = prepareArrayValue(response["Pseudonym"]);
                    const anonymised = prepareStringValue(response["Anonymised"]);
                    const firstname = prepareStringValue(response["First name"]);
                    const infixes = prepareStringValue(response["Infixes"]);
                    const lastname = prepareStringValue(response["Last name"]);
                    const gender = prepareStringValue(response["Gender"]);
                    const yearofbirth = prepareIntegerValue(response["Year of birth"]);
                    const yearofdeath = prepareIntegerValue(response["Year of death"]);
                    const highesteducationlevel = prepareStringValue(response["Highest education level"]);
                    const placeofbirth = prepareStringValue(response["Place of birth"]);
                    const occupation = prepareArrayValue(response["Occupation"]);
                    const placeofresidence = prepareArrayValue(response["Place of residence"]);
                    const organisationname = prepareArrayValue(response["Organisation"]);
                    const religion = prepareStringValue(response["Religion"]);
                    const socialstatus = prepareArrayValue(response["Social status"]);
                    const externalpersonidentifier = prepareArrayValue(response["External person ID"]);

                    // Bij aanpassen full name from source zonder aanpassen normalised full name, normaliseer input
                    let getNormalisedFullName = false;
                    if (person["full_name_from_source"] !== response["Full name from source"]) {
                        if (person["normalised_full_name"] === response["Normalised full name"]) {
                            getNormalisedFullName = true;
                        }
                    }

                    if (validatePersonYear(response["Year of birth"]) &&
                        validatePersonYear(response["Year of death"])) {
                        fn.callFunction(
                            "metadata.update_person",
                            [
                                personpkid,
                                normalisedfullname,
                                fullnamefromsource,
                                pseudonym,
                                anonymised,
                                firstname,
                                infixes,
                                lastname,
                                gender,
                                yearofbirth,
                                yearofdeath,
                                highesteducationlevel,
                                placeofbirth,
                                occupation,
                                placeofresidence,
                                organisationname,
                                religion,
                                socialstatus,
                                externalpersonidentifier,
                                getNormalisedFullName
                            ],
                            function () {
                                logUserEvent(
                                    "FUNCTION_CALL",
                                    "___agg_metadata",
                                    "update_person",
                                    creatorRole.toLowerCase(),
                                    {
                                        "metadataid": metadataId,
                                        "selection": response
                                    })
                                fn.refreshTable("___agg_metadata", null);
                            }
                        );
                    } else {
                        if (!validatePersonYear(response["Year of birth"])) {
                            impossibleYearMessage("geboortejaar")
                        } else if (!validatePersonYear(response["Year of death"])) {
                            impossibleYearMessage("sterftejaar")
                        }

                    }
                }

                powerPrompt(
                    sTitle,
                    aFieldNames,
                    aValues,
                    fnFunction,
                    cancelFunctionNoop,
                    bTextarea,
                    aColsAndRows)

            } else if (selectedOption[0] === "Ik wil een bestaande auteur aan deze bron toevoegen") {
                const sTitle = ["Kies persoon", "Gebruik de zoekvelden om personen op te halen"];
                let aFieldNames = ["ID", "Naam"];
                let aValues = ["", ""];
                powerPrompt(sTitle,
                    aFieldNames,
                    aValues,
                    function (response) {
                        fn.callFunction("metadata.get_person_array",
                            [
                                prepareIntegerValue(response["ID"]),
                                prepareStringValue(response["Naam"])
                            ],
                            function (response) {
                                let aValuesAuthor = [];
                                const result = JSON.parse(response["get_person_array"]);
                                const authorIds = new Set(authors.map(author => author["person_pkid"]));
                                result.forEach((person) => {
                                    if (!authorIds.has(person["person_pkid"])) {
                                        let personPropertyArray = [];
                                        const personName = person["normalised_full_name"];
                                        const personPid = " PID " + person["person_pkid"];
                                        if (personName !== null && personName !== "") {
                                            personPropertyArray.push(personName, personPid);
                                            aValuesAuthor.push(personPropertyArray);
                                        }
                                    }
                                })
                                if (aValuesAuthor.length < 1) {
                                    fn.message(
                                        "Geen resultaat",
                                        "Er is geen persoon gevonden die voldoet aan de ingevulde criteria."
                                    )
                                } else {
                                    const sTitleAuthor = "Selecteer auteur";
                                    const fnFunctionAuthor = function (response) {
                                        response.forEach((item) => {
                                            // Ontleed de weergeven string met de person PKID
                                            const searchStr = " PID ";
                                            const index = item.indexOf(searchStr);
                                            const personId = item.slice(index + searchStr.length);
                                            let creatorId;
                                            let sourceId;
                                            fn.getRecord(
                                                "___agg_metadata",
                                                metadataId,
                                                function (response) {
                                                    if (creatorRole.trim() === "AUTHOR_OF_TITLE") {
                                                        creatorId = parseInt(niceArray(response.creator_id_author));
                                                    }
                                                    if (creatorRole.trim() === "AUTHOR_OF_DEPENDENT_TITLE") {
                                                        creatorId = parseInt(niceArray(response.creator_id_dependent_author));
                                                    }
                                                    if (isNaN(creatorId)) {
                                                        creatorId = 0;
                                                    }
                                                    sourceId = response.metadata_pkid;
                                                });
                                            fn.callFunction("metadata.add_author",
                                                [
                                                    personId,
                                                    sourceId,
                                                    creatorId,
                                                    prepareStringValue(creatorRole)
                                                ],
                                                function () {
                                                    logUserEvent(
                                                        "FUNCTION_CALL",
                                                        "___agg_metadata",
                                                        "add_author",
                                                        creatorRole.toLowerCase(),
                                                        {
                                                            "personid": personId,
                                                            "sourceid": sourceId,
                                                            "creatorid": creatorId,
                                                            "creatorrole": creatorRole,
                                                            "metadataid": metadataId
                                                        })
                                                    fn.refreshTable("___agg_metadata", null);
                                                });
                                        })
                                    };
                                    // Selecteer auteur uit geretourneerde lijst
                                    fn.promptSelect(
                                        sTitleAuthor,
                                        aValuesAuthor,
                                        aValuesAuthor[0],
                                        fnFunctionAuthor,
                                        cancelFunctionNoop,
                                        false
                                    )
                                }
                            })
                    })

            } else if (selectedOption[0] === "Ik wil een nieuwe auteur aanmaken en aan deze bron toevoegen") {
                let creatorId;
                let sourceId;
                fn.getRecord(
                    "___agg_metadata",
                    metadataId,
                    function (response) {
                        // Haal sourceID en creatorID op voor toevoegen auteur
                        if (creatorRole.trim() === "AUTHOR_OF_TITLE") {
                            creatorId = parseInt(niceArray(response.creator_id_author));
                        }
                        if (creatorRole.trim() === "AUTHOR_OF_DEPENDENT_TITLE") {
                            creatorId = parseInt(niceArray(response.creator_id_dependent_author));
                        }
                        sourceId = response.metadata_pkid;
                        if (isNaN(creatorId)) {
                            creatorId = 0;
                        }
                    });
                const sTitle = "Nieuwe auteur voor bron";
                const aFieldNames = [
                    // "Internal person ID",
                    "Normalised full name",
                    "Full name from source",
                    "Pseudonym",
                    "Anonymised",
                    "First name",
                    "Infixes",
                    "Last name",
                    "Gender",
                    "Year of birth",
                    "Year of death",
                    "Highest education level",
                    "Place of birth",
                    "Occupation",
                    "Place of residence",
                    "Organisation",
                    "Religion",
                    "Social status",
                    "External person ID",
                ];
                const bTextarea = false;
                const aColsAndRows = [];
                const aValues = [
                    normalisedfullname,
                    fullnamefromsource,
                    pseudonym,
                    getPreselectedArray(anonymised, "UNSPECIFIED"),
                    firstname,
                    infixes,
                    lastname,
                    getPreselectedArray(gender, "UNSPECIFIED"),
                    yearofbirth,
                    yearofdeath,
                    highesteducationlevel,
                    placeofbirth,
                    occupation,
                    placeofresidence,
                    organisationname,
                    religion,
                    socialstatus,
                    externalpersonidentifier
                ];
                const fnFunction = function (response) {
                    // Behandelen user response
                    const normalisedfullname = prepareStringValue(response["Normalised full name"]);
                    const fullnamefromsource = prepareStringValue(response["Full name from source"]);
                    const pseudonym = prepareArrayValue(response["Pseudonym"]);
                    const anonymised = prepareStringValue(response["Anonymised"]);
                    const firstname = prepareStringValue(response["First name"]);
                    const infixes = prepareStringValue(response["Infixes"]);
                    const lastname = prepareStringValue(response["Last name"]);
                    const gender = prepareStringValue(response["Gender"]);
                    const yearofbirth = prepareIntegerValue(response["Year of birth"]);
                    const yearofdeath = prepareIntegerValue(response["Year of death"]);
                    const highesteducationlevel = prepareStringValue(response["Highest education level"]);
                    const placeofbirth = prepareStringValue(response["Place of birth"]);
                    const occupation = prepareArrayValue(response["Occupation"]);
                    const placeofresidence = prepareArrayValue(response["Place of residence"]);
                    const organisationname = prepareArrayValue(response["Organisation"]);
                    const religion = prepareStringValue(response["Religion"]);
                    const socialstatus = prepareArrayValue(response["Social status"]);
                    const externalpersonidentifier = prepareArrayValue(response["External person ID"]);
                    fn.callFunction(
                        "metadata.create_author",
                        [
                            normalisedfullname,
                            fullnamefromsource,
                            pseudonym,
                            anonymised,
                            firstname,
                            infixes,
                            lastname,
                            gender,
                            yearofbirth,
                            yearofdeath,
                            highesteducationlevel,
                            placeofbirth,
                            occupation,
                            placeofresidence,
                            organisationname,
                            religion,
                            socialstatus,
                            externalpersonidentifier,
                            sourceId,
                            creatorId,
                            prepareStringValue(creatorRole),
                        ],
                        function () {
                            logUserEvent(
                                "FUNCTION_CALL",
                                "___agg_metadata",
                                "create_author",
                                creatorRole.toLowerCase(),
                                {
                                    "sourceid": sourceId,
                                    "creatorid": creatorId,
                                    "creatorrole": creatorRole,
                                    "metadataid": metadataId,
                                    "selection": response
                                })
                            fn.refreshTable("___agg_metadata", null);
                        }
                    );
                }
                powerPrompt(
                    sTitle,
                    aFieldNames,
                    aValues,
                    fnFunction,
                    cancelFunctionNoop,
                    bTextarea,
                    aColsAndRows)

            } else if (selectedOption[0] === "Ik wil een auteur uit deze bron verwijderen") {
                let creatorId;
                let sourceId;
                fn.getRecord(
                    "___agg_metadata",
                    metadataId,
                    function (response) {
                        if (creatorRole.trim() === "AUTHOR_OF_TITLE") {
                            creatorId = parseInt(niceArray(response.creator_id_author));
                        }
                        if (creatorRole.trim() === "AUTHOR_OF_DEPENDENT_TITLE") {
                            creatorId = parseInt(niceArray(response.creator_id_dependent_author));
                        }
                        sourceId = response.metadata_pkid;
                        if (isNaN(creatorId)) {
                            creatorId = 0;
                        }
                    });
                const sTitle = "Kies auteur om te verwijderen";
                const aValues = [];
                authors.forEach((author) => {
                    aValues.push(author["normalised_full_name"]);
                })
                const fnFunction = function (value) {
                    const personIds = [];
                    value.forEach((val) => {
                        const author = authors.find(author => author["normalised_full_name"] === val);
                        const authorId = author["person_pkid"];
                        personIds.push(authorId);
                    })
                    // Geef een array met de te verwijderen IDs mee
                    const personIdArray = `${personIds.join(',')}`;
                    fn.callFunction(
                        "metadata.delete_author",
                        [
                            prepareArrayValue(personIdArray),
                            prepareIntegerValue(sourceId),
                            prepareIntegerValue(creatorId)
                        ],
                        function () {
                            logUserEvent(
                                "FUNCTION_CALL",
                                "___agg_metadata",
                                "delete_author",
                                creatorRole.toLowerCase(),
                                {
                                    "personids": personIdArray,
                                    "sourceid": sourceId,
                                    "creatorid": creatorId,
                                    "creatorrole": creatorRole,
                                    "metadataid": metadataId
                                })
                            fn.refreshTable("___agg_metadata", null);
                        },
                        function () {
                            $.noop();
                        }
                    )
                }
                fn.promptSelect(
                    sTitle,
                    aValues,
                    aValues[0],
                    fnFunction,
                    cancelFunctionNoop,
                    false
                )
            }
        },
        cancelFunctionNoop,
        true
    );
}

function logUserEvent(eventType, tableName, functionName, columnName, ...args) {
    // Construeer een object uit de args om een JSON van te maken
    const payload = {args};
    // De relevante kolom als hoofd, de rest als child
    const pairs = [
        ["column", columnName],
        ["function", functionName],
        ["payload", payload]
    ];
    // Maak het JSON-object
    const obj = Object.fromEntries(pairs);
    fn.callFunction(
        "metadata.log_event",
        [
            prepareStringValue(tableName) ?? null,
            prepareStringValue(eventType) ?? null,
            prepareJsonValue(JSON.stringify(obj)),
            prepareStringValue(fn.getCurrentUser()) ?? null,
        ],
        null,
        null
    )
}

function powerPrompt(
    title,
    fieldNames,
    values = [],
    onOk = () => {
    },
    onCancel = () => {
    },
    useTextarea = false,
    colsAndRows = []
) {
    // Wis vorige gebruikersinvoer
    fn._clearUserInput();

    // Verzamel ID's voor datumkiezers
    const datePickerIds = [];

    // Verwerk titel/bericht-tuple
    let message = "";
    if (Array.isArray(title)) {
        [title, message] = title;
    }
    const $messageParagraph = $("<p>")
        .html(message);

    // Genereer unieke dialoog-ID
    const uniqueNum = lexutil.getUniqueNumber();
    const promptDivId = `dialog-message${uniqueNum}`;

    // Maak dialoogcontainer en voeg toe
    const $dialog = $("<div>")
        .attr({id: promptDivId, title})
        .addClass("pp-dialog ui-widget ui-widget-content")
        .css({padding: "16px", "font-size": "14px", "max-height": "80vh", "overflow-y": "auto"})
        .append($messageParagraph);
    $("body").append($dialog);

    // Bouw formulier in dialoog
    const $form = $("<form>");
    const $fieldset = $("<fieldset>")
        .addClass("pp-fieldset ui-helper-reset");

    fieldNames.forEach((fieldName, i) => {
        let fixedValue = false;
        let isDatePicker = false;
        let singleTextarea = false;
        let value = values[i];

        if (typeof value === "string") {
            fixedValue = value.includes("::disabled");
            isDatePicker = value.includes("::datepicker");
            singleTextarea = value.includes("::textarea");
            [value] = value.split("::");
        }

        const isSelectBox = Array.isArray(value);
        const isCheckbox = typeof value === "boolean";
        const fieldKey = lexutil.keepOnlyLettersAndDigits(fieldName.toLowerCase().trim());
        const fieldId = `prompt_${fieldKey}`;

        const $label = $("<label>")
            .attr("for", fieldId)
            .text(fieldName.trim())
            .addClass("pp-label ui-widget");
        let $input;

        // Maak invoer aan afhankelijk van type
        if (isSelectBox) {
            $input = $("<select>")
                .attr("id", fieldId)
                .prop("disabled", fixedValue)
                .addClass("pp-select ui-widget-content");

            value.forEach(optionValue => {
                const isSelected = optionValue.includes("::selected");
                const cleanValue = optionValue.replace("::selected", "");
                const $option = $("<option>")
                    .attr("value", cleanValue)
                    .prop("selected", isSelected)
                    .text(cleanValue);
                $input.append($option);
            });
        } else if (isCheckbox) {
            $input = $("<input>")
                .attr({id: fieldId, type: "checkbox"})
                .prop("checked", value)
                .addClass("pp-checkbox ui-widget-content")
                .change(function () {
                    $(this).val($(this).prop("checked"));
                });
        } else {
            const isTextareaField = useTextarea || singleTextarea;
            $input = isTextareaField ? $("<textarea>") : $("<input>");

            if (!isTextareaField) {
                $input
                    .attr({type: "text", id: fieldId, name: fieldId})
                    .addClass("pp-input ui-widget-content")
                    .css({width: "70%", padding: "4px"})
                    .val(value || "");
            } else {
                $input
                    .attr({id: fieldId, name: fieldId})
                    .attr("cols", colsAndRows[0] || 40)
                    .attr("rows", colsAndRows[1] || 6)
                    .addClass("pp-textarea ui-widget-content")
                    .css({padding: "4px"})
                    .text(value || "");
            }

            if (fixedValue) $input.prop("disabled", true);
            if (isDatePicker) datePickerIds.push(fieldId);
        }

        // Rij voor label + invoer
        const $row = $("<div>")
            .addClass("pp-row ui-helper-clearfix")
            .css({"margin-bottom": "10px", display: "flex", "align-items": "center"});
        $label.css({width: "30%", "margin-right": "10px"});
        $input.css({flex: 1});

        $row.append($label, $input);
        $fieldset.append($row);
    });

    $form.append($fieldset);
    $dialog.append($form);

    // Bereid dialoogknoppen voor
    const buttons = [];
    if (typeof onOk === "function") {
        buttons.push({
            text: lang.ok,
            id: "dialog_accept_button",
            class: "ui-priority-primary",
            click() {
                const response = {};
                fieldNames.forEach((name, i) => {
                    const fieldKey = lexutil.keepOnlyLettersAndDigits(name.toLowerCase().trim());
                    const $el = $dialog.find(`#prompt_${fieldKey}`);
                    let val;
                    if ($el.is(':checkbox')) {
                        val = $el.prop('checked');
                    } else {
                        val = $el.children('option:selected').val() ?? $el.val();
                    }
                    fn._registerUserInput(name.trim(), val, i);
                    response[name.trim()] = val;
                });
                $(this).dialog('close');
                onOk(response);
            }
        });
    }
    buttons.push({
        text: lang.cancel,
        click() {
            $(this).dialog("close");
            if (typeof onCancel === "function") onCancel();
        }
    });

    // Initialiseer dialoog
    $dialog
        .dialog({
            autoOpen: false,
            height: "auto",
            maxHeight: $(window).height(),
            width: "fit-content",
            minwidth: "250px",
            modal: true,
            classes: {"ui-dialog": "pp-container"},
            position: fn._computeDialogPosition(),
            buttons,
            open() {
                $(".ui-dialog-titlebar-close").hide();
                $(".ui-dialog").addClass("ui-dialog-shadow").putInFront(null);
            },
            close() {
                $dialog.remove();
            }
        })
        .keyup(() => {
            if (kf.isPressed("enter") && !$(".ui-autocomplete-input").length) {
                $("#dialog_accept_button").click();
                return false;
            }
        });

    // Open en activeer datumkiezers
    $dialog.dialog("open");
    setTimeout(() => {
        datePickerIds.forEach(id => {
            $dialog.find(`#${id}`).datepicker({dateFormat: "dd-mm-yy"});
        });
    }, 500);

    const foc = $(":focus");
    if ($.inArray(foc.attr("id"), datePickerIds) === 0) foc.blur();
}



