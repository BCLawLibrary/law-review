//Edit 'key' and 'columns' to connect your spreadsheet

//enter google sheets key here
var key =
  "https://docs.google.com/spreadsheets/d/1U41oo0-sziM1P996bJRC_0gGimP1dIkltDQxYS7aw2o/pubhtml?gid=489792061&single=true";
  
//"data" refers to the column name with no spaces and no capitals
//punctuation or numbers in your column name
//"title" is the column name you want to appear in the published table
//className adds a CSS class the table cell
//render runs a function to change the displayed content
var columns = [
//Article Type
{
  "data": "type",
  "title": "Type",
  className: "contentType",
  render: function (data,type,row){
		return data.replace(/s\b/, "");//if the article type ends in s remove the s to create the display text - some article types are plural and some are singular
	}
},
//Title
{
  "data": "title",
  "title": "Title",
  className: "title",
  render: function (data,type,row){
		return '<h2 tabindex=0 role="link">' + data + '</h2>';
  }	
},
//Authors (Need to put last name first and concatenate multiple authors)
{
  "data": "creator0",
  "title": "Author",
  className: "author"  
},
{
  "data": "creator1",
  "title": "Author",
  className: "author"	
},
{
  "data": "creator2",
  "title": "Author",
  className: "author"
},
{
  "data": "creator3",
  "title": "Author",
  className: "author"
},
{
  "data": "creator4",
  "title": "Author",
  className: "author"
},
//Short Abstract
{
  "data": "description\\.abstract", //Need to double-escape period in column name
  "title": "Blurb",
  className: "shortAbstract",
	render: function (data, type, row) {
		if (data.length > 127) {//don't add an elipsis if the abstract is not truncated
			return data.substring(0, data.indexOf(" ",128))+"...";
		} //Cut off at next space once we hit 128 chars
		else {
			return data
		}
	}	
},
//Abstract
{
  "data": "description\\.abstract", //Need to double-escape period in column name
  "title": "Abstract",
  className: "abstract",
  className: "abstract"
},
//Link
{
	"data": "identifier1",
	"title": "Link",
	className: "link",
	render: function (data,type,row){
		if ( type === 'display') {
		return '<a href="' + data + '">View PDF</a>';
		}
		else {
			return data;
		}
	}
},
//Volume
{	
	"title": "Volume",
	"data": "volume",
	"name": "volume" 
},
//Issue - uses nthIndex function
{
	"title": "Issue",
	"data": "issue",
	"name": "issue"
},
//First Page
{
  "data": "bibliographic Citation\\.rft\\.spage", //Need to double-escape period in column name
  "title": "First Page",
  "name": "firstPage",
  "type": "num-fmt"
},

//Date Created - date uploaded to Digital Commons. Used for first sort
{	
	"data": "date\\.created", //Need to double-escape period in column name
	"title": "Date Created",
	"name": "dateCreated"
},
//BCLR Online Badge
{
	"data": "bibliographic Citation\\.rft\\.spage", 
	"title": "E. Supp.",
	"name": "E. Supp.",
	className: "badge bclrOnline",
	render: function (data,type,row){
		return data.replace(/[0-9]/g, '');
	}
},
//Environmental Badge
{
	"data": "environmental", 
	"title": "Environmental",
	"name": "Environmental",
	className: "badge environmental"
},
//International Badge
{
	"data": "international", 
	"title": "International",
	"name": "International",
	className: "badge international"
},
//Social Justice Badge
{
	"data": "social Justice", 
	"title": "Social Justice",
	"name": "Social Justice",
	className: "badge socialJustice"
}

];

function checkHash() {
	//load correct page/view based on the hash URL
	var table = $('.dataTable').DataTable();
	$("#bclr-wrapper, #volume").removeClass();//remove any special display classes
	$('#volume').val('default');
	$('.view-title').text('');
	$('#issue-wrapper, #searching, #search-all, #search-archive, .span-x, .dataTables_info, #more').hide();
	$('#bclr-table_filter input').unbind('focus').focus(function() {
				$('#searching, #search-all, .span-x').show();
			});
	var hash = window.location.hash;
	
	if (hash) {
		$('.responsive-columns.section').slideUp(500);
		var pageType = hash.match(/#(.*)\//).pop();
		if (pageType == "item") {
			window.scrollTo(0, 0);
			var itemNumber = hash.replace("#item/","");	
			table
				.search("");
			table
				.columns()
				.search("");
			table
				.page
				.len(10);
			table
				.columns(9)
				.search(itemNumber)
				.draw();
			$("#bclr-wrapper")
				.removeClass()
				.addClass("item");
			$('#bclr-table tr .title')
				.unbind(); //unbind the title on the item display	
			$('html, body').animate({
				scrollTop: $('body').offset().top
			}, 0);	
				
		}
		else if (pageType == "focus") {
			table
				.search("");
			table
				.columns()
				.search("");
			table
				.page
				.len(10);	
			var focus = hash.replace("#focus/","").replace("-"," ");	
			table
				.column(focus+':name')
				.search(focus)
				.draw();
			$("#bclr-wrapper")
				.removeClass();	
			$('.view-title')
				.text(focus.replace("E. Supp.", "Electronic Supplement"));
			$('#issue-wrapper, .dataTables_info')
				.show();	
			
		}
		else if (pageType == "issue") {
			table
				.search("");
			table
				.columns()
				.search("");
			table
				.page
				.len(10);
			issue = hash.replace("#issue/","");	
			table
				.column(11)
				.search(issue)
				.draw();
			$('#volume').val(issue);
			$("#bclr-wrapper")
				.removeClass();
			$('#volume')
				.addClass('issue');
			var displayIssue = "Volume "+issue.replace(':',', Issue ')	
			if (issue.substring(0,2) < 59) {
						displayIssue = displayIssue.replace(", Issue 6",", Electronic Supplement");
					}
			else {
						displayIssue = displayIssue.replace(", Issue 9",", Electronic Supplement");
					};	
			$('.view-title')
				.text(displayIssue);
			$('#issue-wrapper, .dataTables_info')
				.show();
				
				
		}
		else if (pageType == "recent") {
		type = hash.replace("#recent/","");	
		if (type == "issue") {
			var latestText = $('#volume option:nth-child(2)').text();
			if (latestText.includes('E.Supp.')) { //Latest issue does not include E.Supp.
					var latest = $('#volume option:nth-child(3)').val();
				}
			else {
					var latest = $('#volume option:nth-child(2)').val();
			}
			$('#volume').val(latest);
			history.pushState("", document.title, "#issue/"+latest);
			checkHash();
		}	
		else {//Show generic view - most recent items
			table
				.search("");
			table
				.page
				.len(10);	
			table
				.columns()
				.search("")
				.draw();
			$("#bclr-wrapper")
				.removeClass();
			$('.view-title')
				.text('All Recent Volumes');
			$('#issue-wrapper, .dataTables_info')
				.show();
			$('#bclr-table_filter input').unbind('focus').focus(function() {
				$('#searching, #search-archive, .span-x').show();
			});	
			
			
				
		}
		}
	// Only show more button when there are additional records to display - placed here because more button should not display when there is no hash/on the homepage
	if (table.page.len() >= table.page.info().recordsDisplay) {
		$('#more').hide();
	}
	else {
		$('#more').show();
	};	
		
	}	
	else {//if there is no hash or the hash is invalid, show the homepage
			
			
			table
				.search("");
			table
				.page
				.len(5);	
			table
				.columns()
				.search("")
			table
				.columns(0)
				.search("Article")
				.draw();	
			$('#bclr-table_filter input').focus(function() {
				history.pushState("", document.title, "#recent/");
				checkHash();
				$('#searching, #search-archive, .span-x').show();
			});
			$('.view-title')
				.text('Recent Articles');
			$('#issue-wrapper')
				.show();
			$("#bclr-wrapper")
				.removeClass()
				.addClass("home-table");
			
			
			
			
			$('.responsive-columns.section').slideDown(500);
			$('.col-md-3.col-sm-8.col-xs-12').show();			
			
		};
		$('html, body').animate({
			scrollTop: $("body").offset().top
		}, 500);
		$('#e-supp').fadeIn(600);	
		
		
};



function writeTable(data) {
    //select main div and put a table there
    //use bootstrap css to customize table style: http://getbootstrap.com/css/#tables
    $('#bclr-content').html(
      '<table cellpadding="0" cellspacing="0" border="0" class="table table-condensed table-responsive" id="bclr-table"></table>'
    );
    //initialize the DataTable object and put settings in
    var table = $("#bclr-table").DataTable({
      "autoWidth": false,
      "data": data,
      "columns": columns,
      "order": [
		[13, "desc"],
        [10, "desc"],
		[11, "desc"],
		[12, "asc"]
      ], //order on date, then volume number, then issue, then first page
	  "dom":"ftir",
	  "language": {
			search:				"",
			searchPlaceholder:	"Search BCLR",
			info:				"Showing _START_ to _END_ of _TOTAL_",
			infoFiltered:   	""
	  },
      "pagingType": "simple",//no page numbers
		"pageLength": 2,
		"columnDefs": [
			{ "visible": false, "targets": [10,11,12,13,14,15,16,17] }
		],
		
	       initComplete: function () {  
            this.api().columns(11).every( function () {//create volume drop-down
                var column = this;
			$('#volume').append( '<option value="default">All</option>' );
                column.data().unique().sort().reverse().each( function ( d, j ) {
					var display
					if (d.substring(0,2) < 59) {
							display = d.replace(":6",":E.Supp.");
					}
					else {
						display = d.replace(":9",":E.Supp.");
					}
                    $('#volume').append( '<option value="'+d+'">'+display+'</option>' )
                } );
				
            } );
			$('#volume').append( '<option value="more">More</option>' );
			
		//add issue header
		$('#bclr-table_filter').after('<div id="issue-wrapper"><div id="issue-inner"><div class="title-text"><span id="searching">Searching </span><span class="view-title"></span></div><div class="buttons"><button class="btn btn-default" id="search-all">Search All</button><button class="btn btn-default" id="search-archive">Search Archive</button><button class="span-x"> X</button></div></div></div>');
		
		
		
			

		//load correct page on back or forward browser button	
		window.onpopstate = function(event) {
			
			if (window.location.hash == "pagecontent") {//If the user uses the skip navigation link, follow the default behavior
				
			}
			else {
			checkHash();
			table.draw();
			}
		}
		//add back button for item view
		var div = $('<div>');
			$(div)
				.addClass('itemBack')
				.html('<a tabindex=0 role="link">Back</a>');
		
			$('#bclr-table_wrapper')
				.prepend(div);	
				
		$('#loading').fadeOut(200, function() {
			$('#bclr-wrapper').fadeIn(600);	
		});	
		
	
		
	
	//end of initComplete
        },	
	
		
//---------Callback!-----//
	"drawCallback": function(settings) {	
	// By default, the back button (displayed on article pages only) returns to the default view. 
	$('.itemBack').unbind().click(function() {
			history.pushState("", document.title, window.location.pathname+ window.location.search);
			checkHash();
		});	

	// Click on article title opens a new view with information about that article	
	$('#bclr-table tr .title').unbind().click(function(event) {
		var article=$(this).parent().find('.link a').attr("href");
		var itemNumber = article.match(/article\=(.*)\&context/).pop()
		var item = "#item/"+itemNumber;
		history.pushState("", document.title, item);
		checkHash();
		// If the article view was entered from a different page, the back button will return to that page, instead of going to the default view.
		$('.itemBack').unbind().click(function() {
			window.history.back();
		});
	});
	// More button shows 10 additional records
	var table = $('.dataTable').DataTable();
	var tableLength = table.page.len();
	$('#more').unbind().click(function() {
		table.page.len(tableLength+10).draw();
	});

	//Make keypress produce click
	$('span.span-x, .title h2, .itemBack a, #e-supp h2, #e-supp h3').unbind('keypress').keypress(function (e) {
		var key = e.which;
		if(key == 13)  // the enter key code
	
	{
		$(this).click();
		return false;  
	}
	});
	

	
	//end of drawCallback	 
	  }
//----------------------//
    });//End of var table
	
	// Event listener to the range filtering input to redraw on input
    $('#volume').unbind().change( function() {
		if ($(this).val()=="more") {
			window.location="http://lawdigitalcommons.bc.edu/bclr";
		}
		else if ($(this).val()=="default") {
			history.pushState("", document.title, "#recent/");
			checkHash();
		}
		else {
		volume=$(this).val();
		history.pushState("", document.title, "#issue/"+volume);
		checkHash();
		}
    } );
	$('.subjects .subject').unbind().click(function(){ //make subject badges filter the table
		var subject=$(this).text().replace(" ","-");
		history.pushState("", document.title, "#focus/"+subject);
		checkHash();
	});
	$('.subjects .recent, #search-all').unbind().click(function(){ //All button
		$('#volume').val('default');
		history.pushState("", document.title, "#recent/");
		checkHash();
	});
	$('.subjects .latest').unbind().click(function(){ //Latest issue button
		var latestText = $('#volume option:nth-child(2)').text();
		if (latestText.includes('E.Supp.')) { //Latest issue does not include E.Supp.
				var latest = $('#volume option:nth-child(3)').val();
			}
		else {
				var latest = $('#volume option:nth-child(2)').val();
			}
		$('#volume').val(latest);
		history.pushState("", document.title, "#issue/"+latest);
		checkHash();
	});
	$('.subjects .home').unbind().click(function(){ //BCLR Home Button
		$('#volume').val('default');
		history.pushState("", document.title, window.location.pathname+ window.location.search);
		checkHash();
	});
	$('#search-all').unbind().click(function(){ //Search all button
		$('#volume').val('default');
		history.pushState("", document.title, "#recent/");
		checkHash();
		$('#bclr-table_filter input').focus();
	});
	$('#search-archive').unbind().click(function() {
		window.location="http://lawdigitalcommons.bc.edu/do/search/?q=&fq=virtual_ancestor_link%3A%22http%3A%2F%2Flawdigitalcommons.bc.edu%2Fbclr%22";
	});
	$('.span-x').click(function() {
		$('#bclr-table_filter input').val('');
		$('#searching, #search-all, #search-archive, .span-x').hide();
	});
	checkHash();
	
	//E. Supp. feature on home page
	const allData = data;//uses data directly from Tabletop, rather than DataTables API
	
	var comments = allData.filter(function (el) {
		return (el["bibliographic Citation.rft.spage"].indexOf("E. Supp.") >= 0);
	});
	comments.sort(function(a, b) {
		var dateA = a["date.created"]; // ignore upper and lowercase
		var dateB = b["date.created"]; // ignore upper and lowercase
		if (dateA < dateB) {
			return 1;
		}
		if (dateA > dateB) {
			return -1;
		}
	// dates must be equal
		return 0;
	});
	var comments = comments.filter(function (el) {
		return (el["date.created"] === comments[0]["date.created"]);
	});
	var rand = comments[Math.floor(Math.random() * comments.length)];
	var title = $('<h2>');
	title
		.html(rand.title)
		.addClass('e-supp-title')
		.attr('tabindex', 0, 'role','link')
		.appendTo('#e-supp');
	var author = $('<p>')
	author
		.text(rand.creator0)
		.addClass('author')
		.appendTo('#e-supp');	
	var itemNumber = rand.identifier1;
	itemNumber = itemNumber.match(/article\=(.*)\&amp;context/).pop();
	$('.e-supp-title').unbind().click(function(event) {
		var item = "#item/"+itemNumber;
		history.pushState("", document.title, item);
		checkHash();
		// If the article view was entered from a different page, the back button will return to that page, instead of going to the default view.
		$('.itemBack').unbind().click(function() {
			window.history.back();
		});
	});
	$('#e-supp h3').unbind().click(function(){ //make E Supp header go to E Supp
		history.pushState("", document.title, "#focus/E.-Supp.");
		checkHash();
	});
	
	
	
  } //end of writeTable
  
function initializeTabletopObject() {
    Tabletop.init({
      key: key,
      callback: function(data, tabletop) {
        writeTable(data); //call up datatables function
      },
      simpleSheet: true,
      debug: false
    });
  }

  

window.onload = function() {
  
  initializeTabletopObject();//Initializing the tabletop object. The datatable is created in the callback of this function.
	
	
};
 


