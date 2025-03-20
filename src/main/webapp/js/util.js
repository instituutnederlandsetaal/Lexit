


//*******************************************************
//
// OLD LEX'IT UTIL FUNCTIONS LIBRARY
//
// This library is deprecated and should not be used anymore.
// But it is kept here for backward compatibility, as it is still used in some projects. 
// Which is why we kept some functions here (which use the code of their lexutil counterparts)
// 
// Please use the lexutil.js library instead!
//
//*******************************************************


function showSpinner(target, bRefreshing){
	lexutil.showSpinner(target, bRefreshing);	
};

function removeSpinner(target){
	lexutil.removeSpinner(target);
};

function copyEvents(source, destination) {
    lexutil.copyEvents(source, destination);
}

function smoothScroll(div, anchor, bVerticalOnly) {	
	lexutil.smoothScroll(div, anchor, bVerticalOnly);
}


function shadeColor(color, shade) {
    return lexutil.shadeColor(color, shade);
}
function ColorLuminance(hex, lum) {
	return lexutil.colorLuminance(hex, lum);
}

function left(str, n){
	return lexutil.left(str, n);
}
function right(str, n){
    return lexutil.right(str, n);
}


function hasTags(text){
	return lexutil.hasTags(text);
}
function removeTags(text){
	return lexutil.removeTags(text);
	
}

function keepOnlyLettersAndDigits(str){
	return lexutil.keepOnlyLettersAndDigits(str)
}

// BEWARE: this function is not used in the current version of Lex'it
//         and was not ported to the lexutil library
//         which is why we kept the code below and don't use a lexutil equivalent
function processFileName(text){
	if (typeof text == 'string')
		return text.replace(/\s/g, "_");
	return text;
}


function getUniqueNumber(){
	return lexutil.getUniqueNumber();
}

function getTheLowestPositive(arr){
	return lexutil.getTheLowestPositive(arr);
}

function generateSeries(iStartValue, iEndValue, bAscending){	
	return lexutil.generateSeries(iStartValue, iEndValue, bAscending);	
};

function arrays_equal(a, b) { 
	return lexutil.arraysAreEqual(a, b); 
}

function cloneArray(arr){
	return lexutil.cloneArray(arr);
}

// keep the code of this one for ease
function cloneObject(source) {
 for (i in source) {
     if (typeof source[i] == 'source') {
         this[i] = new cloneObject(source[i]);
     }
     else{
         this[i] = source[i];
     }
 }
}

function countProperties(obj) {
    return lexutil.countProperties(obj);
}

function isNonEmptyArrayLike(obj) {
    return lexutil.isNonEmptyArrayLike(obj);
};


function getOnlyUniqueValues(array){
	return lexutil.getOnlyUniqueValues(array);
}

function symmetricDifference(arr1, arr2) {
    return lexutil.symmetricDifference(arr1, arr2);
}


function getEscape(str){
	return lexutil.getEscape(str);
};

function quote(str){
	return lexutil.quote(str);
};

function escapeRegexChars(str){
	return lexutil.escapeRegexChars(str);
};

function isRegex(str){
	return lexutil.isRegex(str);
}



function isCommonEntity(sStr){	
	return lexutil.isCommonEntity(sStr);
}

function translateCharToEntity(sChar){
	return lexutil.translateCharToEntity(sChar);
}
function translateEntityToChar(sEntity){
	return lexutil.translateEntityToChar(sEntity);
}




function getTrueIndexes(sRangeStringDecodedEntities, sNodeStringEncodedEntities, sSelectionDecodedEntities, selectionStartIndex, bPushWordBoundaries){	
	return lexutil.getTrueIndexes(sRangeStringDecodedEntities, sNodeStringEncodedEntities, sSelectionDecodedEntities, selectionStartIndex, bPushWordBoundaries);
}

function computeTrueIndex(mainString, incorrectIndex){	
	return lexutil.computeTrueIndex(mainString, incorrectIndex);
}

function reEncodeEntities(sEncodedEntities, sDecodedEntities){	
	return lexutil.reEncodeEntities(sEncodedEntities, sDecodedEntities);
}

function getIndexOfPreviousSpace(mainString, startIndex){	
	return lexutil.getIndexOfPreviousSpace(mainString, startIndex);
}

function getIndexOfFollowingSpace(mainString, endIndex){	
	return lexutil.getIndexOfFollowingSpace(mainString, endIndex);
}

function getIndexOfTrueStart(fullString, startIndex){
	return lexutil.getIndexOfTrueStart(fullString, startIndex);
}



function getHighestZindex(absoluteMax){
	return lexutil.getHighestZindex(absoluteMax);
}

function getZindexOfTableInFront(){
	return lexutil.getZindexOfTableInFront();
}

function getHttpParams(){	
	return lexutil.getHttpParams();
};


function translateBoolean(mSomeValue){	
	return lexutil.translateBoolean(mSomeValue);
}

function uploadFile(sFileName) {
	lexutil.uploadFile(sFileName);
}


//*******************************************************