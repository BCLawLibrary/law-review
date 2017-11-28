function getFeed(aUrl) {
  //setup
  var aUrl = "http://lawdigitalcommons.bc.edu/do/oai/"
  var maxDocs = 8 //set the maximum number of XML documents to retrieve - the script can time out if too many documents are requested
  var startDate = "2014-01-01"//current script assumes full calendar years i.e. start with January 1
  var environmental = "Environmental Law"
  var international = new Array('International Law', 'International Trade Law', 'European Law')
  var socialJustice = new Array('Civil Rights and Discrimination', 'Law and Gender')
  
  
  //this function requires a spreadsheet with the headers title	title	creator0	creator1	creator2	creator3	creator4	description.abstract	date.created	type	format	identifier0	identifier1	subject0	subject1	subject2	subject3	subject4	subject5	subject6	subject7	subject8																									
  var data = [];
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getActiveSheet();
  
  
  var prefix = "&metadataPrefix=dcq&set=publication:bclr&from="+startDate;
  var docCount=0;
  while (prefix != ""){
    docCount++;
    var url = aUrl + "?verb=ListRecords" + prefix;
    var response = UrlFetchApp.fetch(url); // get feed
    if (response.getResponseCode() == 200) {
      
      var responseStr = response.getContentText();
      var XMLdoc = Xml.parse(responseStr); // parse xml
      
      var itemMetadata = XMLdoc.OAI_PMH.ListRecords.record;
      
      if (XMLdoc.OAI_PMH.ListRecords.resumptionToken.Text != undefined ){
        if (docCount > maxDocs) {  
        prefix = "";
        }
        else {
        prefix = "&resumptionToken="+XMLdoc.OAI_PMH.ListRecords.resumptionToken.Text;
        }  
      } else {
        prefix = "";
      }
      var item = itemMetadata; 
      for (var docCount=0; docCount<1; docCount++) 
      for (var i = 0; i < item.length; i++) {
      var row = [];
      var creatorCount=0;
      var subjectCount=0;
      var idCount=0;
      var validRecord = true;
      var attribs = item[i].metadata.dc.getElements();
        for (var j = 0; j<attribs.length; j++){
          
          var name = attribs[j].getName().getLocalName();
          var val = attribs[j].getText();
           if (name =="creator") {
              name=name+creatorCount;
              val = val.substring(val.search(",")+2,val.length) + " " + val.substring(0,val.search(","));
              creatorCount++;
              }
          if (name =="subject") {
              name=name+subjectCount;
            
            if (val == environmental) {//check list of subjects that map to environmental - set up at top of script
              row["environmental"]="Environmental";
            }
            if (international.indexOf(val) != -1) {//check list of subjects that map to international - set up at top of script
              row["international"]="International";
            }
            if (socialJustice.indexOf(val) != -1) {//check list of subjects that map to social justice- set up at top of script
              row["socialJustice"]="Social Justice";
            }
            
              subjectCount++;
              }
          if (name =="identifier") {
              name=name+idCount;
            if (idCount==0){
              row["volume"]= val.substring(val.search("vol")+3,val.search("iss")-1);
              row["issue"]= val.substring(val.search("vol")+3,val.search("iss")-1)+":"+val.substring(val.search("iss")+3,nthIndex(val,"/",6));
            } 
              idCount++;
              } 
        
          
          
          if (name == "date.created") { //mark records older than the start date invalid
            var created = new Date(val);
            var createdYear = created.getFullYear();
            var startYear = startDate.substring(0,4);
            if (createdYear< startYear) {
              validRecord = false;
            }
          }  
          if (name == "title") {//mark records with title "Front Matter" as invalid
              if (val == "Front Matter") {
                validRecord = false;
              }
          }
          row[name]=val;
        }
        if (validRecord == true) {//do not push data for invalid records, e.g. outside date range or front matter
      data.push(row);
      } 
      
      }}  
       else {
       prefix = "";
       doc.toast("Response code 200 - aborting run");
    }
    }
  insertData(sheet,data);
}

function insertData(sheet, data){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (data.length>0){
    ss.toast("Inserting "+data.length+" rows");
    sheet.insertRowsAfter(1, data.length);
    setRowsData(sheet, data);
  } else {
    ss.toast("All done");
  }  
}



// Back to the stuff from Google -->

// setRowsData fills in one row of data per object defined in the objects Array.
// For every Column, it checks if data objects define a value for it.
// Arguments:
//   - sheet: the Sheet Object where the data will be written
//   - objects: an Array of Objects, each of which contains data for a row
//   - optHeadersRange: a Range of cells where the column headers are defined. This
//     defaults to the entire first row in sheet.
//   - optFirstDataRowIndex: index of the first row where data should be written. This
//     defaults to the row immediately below the headers.
function setRowsData(sheet, objects, optHeadersRange, optFirstDataRowIndex) {
  var headersRange = optHeadersRange || sheet.getRange(1, 1, 1, sheet.getMaxColumns());
  var firstDataRowIndex = optFirstDataRowIndex || headersRange.getRowIndex() + 1;
  var headers = normalizeHeaders(headersRange.getValues()[0]);

  var data = [];
  for (var i = 0; i < objects.length; ++i) {
    var values = []
    for (j = 0; j < headers.length; ++j) {
      var header = headers[j];
      values.push(header.length > 0 && objects[i][header] ? objects[i][header] : "");
    }
    data.push(values);
  }
  var lastRow = sheet.getLastRow();
  Logger.log(objects.length);
  sheet.deleteRows(2, lastRow-2); //Clear existing rows
  var destinationRange = sheet.getRange(firstDataRowIndex, headersRange.getColumnIndex(), 
                                        objects.length, headers.length);
  destinationRange.setValues(data);
}

// getRowsData iterates row by row in the input range and returns an array of objects.
// Each object contains all the data for a given row, indexed by its normalized column name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//   - columnHeadersRowIndex: specifies the row number where the column names are stored.
//       This argument is optional and it defaults to the row immediately above range;
// Returns an Array of objects.
function getRowsData(sheet, range, columnHeadersRowIndex) {
  columnHeadersRowIndex = columnHeadersRowIndex || range.getRowIndex() - 1;
  var numColumns = range.getEndColumn() - range.getColumn() + 1;
  var headersRange = sheet.getRange(columnHeadersRowIndex, range.getColumn(), 1, numColumns);
  var headers = headersRange.getValues()[0];
  return getObjects(range.getValues(), normalizeHeaders(headers));
}

// For every row of data in data, generates an object that contains the data. Names of
// object fields are defined in keys.
// Arguments:
//   - data: JavaScript 2d array
//   - keys: Array of Strings that define the property names for the objects to create
function getObjects(data, keys) {
  var objects = [];
  for (var i = 0; i < data.length; ++i) {
    var object = {};
    var hasData = false;
    for (var j = 0; j < data[i].length; ++j) {
      var cellData = data[i][j];
      if (isCellEmpty(cellData)) {
        continue;
      }
      object[keys[j]] = cellData;
      hasData = true;
    }
    if (hasData) {
      objects.push(object);
    }
  }
  return objects;
}

// Returns an Array of normalized Strings.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    var key = normalizeHeader(headers[i]);
    if (key.length > 0) {
      keys.push(key);
    }
  }
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case letter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    //if (!isAlnum(letter)) {
    //  continue;
    //}
    if (key.length == 0 && isDigit(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit(char) {
  return char >= '0' && char <= '9';
}
// Search for the nth occurrence of a search term in a string
function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}