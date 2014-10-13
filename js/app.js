// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();
// Specify your actual API key here:
var API_KEY = 'AIzaSyCqkrQQXk5QUzMM9LT2JWZdMd4GvMnkcE0';
var GLOBAL_RESULTS = [];
var TOTAL_TO_CHECK = 0;

// Specify the URL you want PageSpeed results for here:
var URL_TO_GET_RESULTS_FOR = 'http://www.ab.gr';
var CHART_API_URL = 'http://chart.apis.google.com/chart?';
var API_URL = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?';

// Object that will hold the callbacks that process results from the
// PageSpeed Insights API.
var callbacks = {}

/* callbacks.displayPageSpeedScore = function(result) {
  var score = result.score;
  // Construct the query to send to the Google Chart Tools.
  var query = [
    'chtt=Page+Speed+score:+' + score,
    'chs=180x100',
    'cht=gom',
    'chd=t:' + score,
    'chxt=x,y',
    'chxl=0:|' + score,
  ].join('&');
  var i = document.createElement('img');
  i.src = CHART_API_URL + query;
  document.body.insertBefore(i, null);
}; */

callbacks.addToGlobalResultsArr = function(result) {
	GLOBAL_RESULTS.push(result);

  // Check if we've reached the last url to check, if so - print results
  if (TOTAL_TO_CHECK == GLOBAL_RESULTS.length) {
    $.each(GLOBAL_RESULTS,function(i,e){
     callbacks.displayTopPageSpeedSuggestions(e);
    });
    enableAnalyzeBtn();

    // Now all the datas populated in the table - show it!
    hideLoading();
    $(".results").show();
  }
}

callbacks.displayTopPageSpeedSuggestions = function(result) {
  console.log(result);
  var results = [];
  var ruleResults = result.formattedResults.ruleResults;
  for (var i in ruleResults) {
    var ruleResult = ruleResults[i];
    // Don't display lower-impact suggestions.
    if (ruleResult.ruleImpact < 2.0) continue;
    results.push({
      name: ruleResult.localizedRuleName,
      impact: ruleResult.ruleImpact,
      details: ruleResult.urlBlocks
    });
  }
  console.warn(results);
  results.sort(sortByImpact);
  var row = $('#resultsTable tr.first,#resultsTable tr.new').last();
  for (var i = 0, len = results.length; i < len; ++i) {
    // if first loop
    if (i == 0) {
      function roundToTwoDecimals(number) {
        return Math.round(number * 100) / 100;
      }
      // prep some values
      var htmlBytes = result.pageStats.htmlResponseBytes/1000000;
      htmlBytes = roundToTwoDecimals(htmlBytes);
      var cssBytes = result.pageStats.cssResponseBytes/1000000;
      cssBytes = roundToTwoDecimals(cssBytes);
      var imageBytes = result.pageStats.imageResponseBytes/1000000;
      imageBytes = roundToTwoDecimals(imageBytes);
      var jsBytes = result.pageStats.javascriptResponseBytes/1000000;
      jsBytes = roundToTwoDecimals(jsBytes);
      var otherBytes = result.pageStats.otherResponseBytes/1000000;
      otherBytes = roundToTwoDecimals(otherBytes);

      row.after("<tr class='new'><td class='firstCol' width='30%'>Score: "+result.score+"</br><a class='linkToExternal' target='_blank' href='"+result.id+"'>"+result.id+"</a></br><div class='graph'>"+
      "</div><table>"+
      "<tr><td>Resource Summary:</td><td>There are <span class='bold'>"+ result.pageStats.numberResources +"</span> resources of which <span class='bold'>"+ result.pageStats.numberStaticResources +"</span> are cacheable. <span class='bold'>"+ result.pageStats.numberHosts+"</span> hosts are used.</td></tr>"+
      "<tr><td>HTML:</td><td>"+ htmlBytes +"MB</td></tr>"+
      "<tr><td>CSS:</td><td>Size is "+ cssBytes +"MB / "+ result.pageStats.numberCssResources +" files</td></tr>"+
      "<tr><td>Images:</td><td>Size is "+ imageBytes +"MB</td></tr>"+
      "<tr><td>JavaScript:</td><td>Size is "+ jsBytes +"MB / "+ result.pageStats.numberJsResources +" files</td></tr>"+
      "<tr><td>Other:</td><td>Size is "+ otherBytes +"MB</td></tr>"+
      "</table></td><td width='70%' class='topIssues'>");
    } 
    console.log("inserting new rule");
    $("#resultsTable tr.new:last td.topIssues").append("<li><span class='bold'>"+results[i].name+"</span></li>");

    // Any details?
    if (results[i].details.length > 0) {
      function howManyDollarsInHere(txt){
        var newTxt = "";
        newTxt = txt.match(/\$/g);
        if (newTxt === null) {
          newTxt = [];
        }
        return newTxt;
      }

      // What are the details of the issue?
      for (var detailCount in results[i].details) {
        if (results[i].details[detailCount].header.format.length > 0) {
          // prepare the detail text
          var detailTxt = results[i].details[detailCount].header.format;
          var numberOfItems = howManyDollarsInHere(detailTxt);
          numberOfItems = howManyDollarsInHere(detailTxt);
          // Google API splits a bunch of 'dynamic' values in to a seperate nested args object - the header.format references these with a $ sign, so need to loop through them all and fetch relevant dynamic value
          if (numberOfItems.length > 0) {
            for (var toReplaceIndex in numberOfItems) {
              detailTxt = detailTxt.replace(/\$\d/,results[i].details[detailCount].header.args[toReplaceIndex].value);
            }
          }

          // Everythings formatted now so lets spit it out.
          $("#resultsTable .new:last td.topIssues > li:last ").append("<li>"+ detailTxt + "</li>");

          // Google API splits detail out even more in to another nested object (these are things like specific problematic urls)
          if ( typeof results[i].details[detailCount].urls != 'undefined' ) {
            for (childLi in results[i].details[detailCount].urls) {
              var childLiTxt = results[i].details[detailCount].urls[childLi].result.format;
              var childLiTxtStrCount = [];
              childLiTxtStrCount = howManyDollarsInHere(childLiTxt);
              if (childLiTxtStrCount.length > 0) {
                for (var toReplaceChildIndex in childLiTxtStrCount) {
                  childLiTxt = childLiTxt.replace(/\$\d/,results[i].details[detailCount].urls[childLi].result.args[toReplaceChildIndex].value);
                }
                // Everythings formatted now so lets spit it out
                $("#resultsTable .new:last td.topIssues > li > li:last ").append("<li class='veryDetailed'>"+ childLiTxt + "</li>");
              }
            }
          } 
        }
      }
    }

    if (i == results.length-1) {
      $("#resultsTable .new:last td.topIssues").append("</tr>");
      $("#resultsTable .new:last td.topIssues").after("</td>").wrapInner("<ul>");
      //$("#resultsTable .new:last td:last").after().html("<td class='graph'></td></tr>");
    }
  }
  // Now add a graph to the row showing resource breakdown
  callbacks.displayResourceSizeBreakdown(result);
};

var RESOURCE_TYPE_INFO = [
  {label: 'JavaScript', field: 'javascriptResponseBytes', color: 'e2192c'},
  {label: 'Images', field: 'imageResponseBytes', color: 'f3ed4a'},
  {label: 'CSS', field: 'cssResponseBytes', color: 'ff7008'},
  {label: 'HTML', field: 'htmlResponseBytes', color: '43c121'},
  {label: 'Flash', field: 'flashResponseBytes', color: 'f8ce44'},
  {label: 'Text', field: 'textResponseBytes', color: 'ad6bc5'},
  {label: 'Other', field: 'otherResponseBytes', color: '1051e8'},
];

callbacks.displayResourceSizeBreakdown = function(result) {
  var stats = result.pageStats;
  var labels = [];
  var data = [];
  var colors = [];
  var totalBytes = 0;
  var largestSingleCategory = 0;
  for (var i = 0, len = RESOURCE_TYPE_INFO.length; i < len; ++i) {
    var label = RESOURCE_TYPE_INFO[i].label;
    var field = RESOURCE_TYPE_INFO[i].field;
    var color = RESOURCE_TYPE_INFO[i].color;
    if (field in stats) {
      var val = Number(stats[field]);
      totalBytes += val;
      if (val > largestSingleCategory) largestSingleCategory = val;
      labels.push(label);
      data.push(val);
      colors.push(color);
    }
  }
  // Construct the query to send to the Google Chart Tools.
  var query = [
    'chs=300x140',
    'cht=p3',
    'chts=' + ['000000', 16].join(','),
    'chco=' + colors.join('|'),
    'chd=t:' + data.join(','),
    'chdl=' + labels.join('|'),
    'chdls=000000,14',
    'chp=1.6',
    'chds=0,' + largestSingleCategory,
  ].join('&');
  var i = document.createElement('img');
  i.src = 'http://chart.apis.google.com/chart?' + query;
  i.className = 'new';
  $("table tr.new:last td.firstCol .graph").html(i);
};

// Helper function that sorts results in order of impact.
function sortByImpact(a, b, c) { return b.impact - a.impact; }
function sortByScore(a, b, c) { return b.score - a.score; }

callbacks.displayPageSpeedScore = function(result) {
	var score = result.score;
	// Construct the query to send to the Google Chart Tools.
	var query = [
	  'chtt=Page+Speed+score:+' + score,
	  'chs=180x100',
	  'cht=gom',
	  'chd=t:' + score,
	  'chxt=x,y',
	  'chxl=0:|' + score,
	].join('&');
	var i = document.createElement('img');
	i.src = CHART_API_URL + query;
	i.className = 'new';
    $("table").after(i);
};

// Invokes the PageSpeed Insights API. The response will contain
// JavaScript that invokes our callback with the PageSpeed results.
function runPagespeed(url) {
	URL_TO_GET_RESULTS_FOR = url;
	var query = [
	  'url=' + URL_TO_GET_RESULTS_FOR,
    // 'callback=runPagespeedCallbacks',
	  'screenshot=false',
	  'prettyprint=false',
	  'strategy=desktop',
	  'key=' + API_KEY,
	].join('&');
	query = API_URL + query;
	
  $.ajax({
    url: query,
    success: function(data){
      callbacks.addToGlobalResultsArr(data);
    },
    error: function(err) {
      alert(err.responseText);
      selectSearchTab();
      enableAnalyzeBtn();
      showNothingToSee();
    }
  });
}

function showLoading() {
  $(".loading").removeClass("hide");
}

function hideLoading() {
  $(".loading").addClass("hide");
}

function showNothingToSee() {
  $(".nothingToSee").removeClass("hide");
}

function hideNothingToSee() {
  $(".nothingToSee").addClass("hide");
}

function selectResultsTab() {
  $("a[href=#panel2]").click().addClass("active").find("#panel2").addClass("active");
  $("#panel2").addClass("active").parents(".accordion-navigation").removeClass("active");
  $("#panel1").removeClass("active");
}

function selectSearchTab() {
  $("a[href=#panel1]").click().addClass("active").find("#panel1").addClass("active");
  $("#panel2").removeClass("active").parents(".accordion-navigation").removeClass("active");
  hideLoading();
}

function disableAnalyzeBtn() {
  $("#submit").attr('disabled','disabled').addClass("disabled");
}

function enableAnalyzeBtn() {
  $("#submit").removeAttr('disabled').removeClass("disabled");
}

function removeCurrentResultsIfAny() {
  if ( $(".new").length > 0 ) {
    $("table tr.new,.new").remove();
    $("table").hide();
  }
}

function fetchPageResults() {
  var i = 0;
	var str = "";
  var arr = [];
  // Retrieve data from textarea & populate to GLOBAL_RESULTS array 
  str = $("#getReport textarea").val();
  arr = str.split(",");
  console.log(arr);

	$.each(arr,function( key, value ) {
      i++;
  		runPagespeed( value );
	});
  // Due to the results taking such a long time to fetch, we need to check on each push to the GLOBAL_RESULTS that we have recieved everything, then we trigger result calculations
  TOTAL_TO_CHECK = i;
}

// Helper function that sorts results in order of impact.
function sortByImpact(a, b) { return b.impact - a.impact; }

// Our JSONP callback. Checks for errors, then invokes our callback handlers.
function runPagespeedCallbacks(result) {
	if (result.error) {
	  var errors = result.error.errors;
	  for (var i = 0, len = errors.length; i < len; ++i) {
	    if (errors[i].reason == 'badRequest' && API_KEY == 'yourAPIKey') {
	      alert('Please specify your Google API key in the API_KEY variable.');
	    } else {
	      // NOTE: your real production app should use a better
	      // mechanism than alert() to communicate the error to the user.
	      alert(errors[i].message);
	    }
	  }
	  return;
	}
}

// Invoke the callback that fetches results. Async here so we're sure
// to discover any callbacks registered below, but this can be
// synchronous in your code.
$("#submit").click(function(e){
  e.preventDefault();
  hideNothingToSee();
  disableAnalyzeBtn();
	removeCurrentResultsIfAny();
  selectResultsTab();
  showLoading();
	fetchPageResults();
});