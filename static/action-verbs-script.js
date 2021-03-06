var actionVerbs;
$.ajax({
  url: "/actionverbs",
  type: "GET",
  success: function(result) {
    actionVerbs = JSON.parse(result);
  }
});

// Given a (nonemtpy) verb, return whether it is an action verb
function isActionVerb(verb) {
  var key = verb.charAt(0);
  // given key exists in the action verb dictionary AND given verb is an action verb
  return (key in actionVerbs && actionVerbs[key].indexOf(verb) != -1);
}

// Given a list of definitions and a list of synonyms, add each definition and corresponding synonyms
function addDefSyn(definitions, synonyms) {
  for (var i = 0; i < Math.min(3, definitions.length); i++) { // first (up to) three lists of synonyms
    var item = $("<li></li>");
    var definition = definitions[i];
    var defSpan = $("<span class='definition'></span>").text(definition);
    var actionVSpan = $("<span class='action-verbs'></span>");

    for (var j = 0; j < synonyms[i].length; j++) {
      var synonym = synonyms[i][j];
      var synSpan = $("<span class='synonym'></span>").text(synonym);
      if (isActionVerb(synonym.replace(/ *\([^)]*\)/g, ""))) { // ignore text in parentheses
        synSpan = synSpan.addClass("action-verb");
        actionVSpan = actionVSpan.append(synSpan); // prioritize action verbs
      } else {
        item = item.append(synSpan);
      }
    }

    item = item.prepend(actionVSpan).prepend(defSpan);
    $("#result-box ol").append(item);
  }
  $(".definition").after("<br>");
  $(".synonym").on("click", function() {
    copyToClipboard($(this));
    showErrorMessage("Copied to clipboard.");
  });
}

// Given an error message, show it as a result and change the border color of search bar
function showErrorMessage(message) {
  $("#error-message").text(message);
  $("#search").css("border", "4px solid orangered");
}

// Given a word for which to request information, make a request to the server and process the response
function requestWordInfo(searchTerm) {
  $.ajax({
    url: "/search",
    type: "GET",
    data: { "search": searchTerm },
    success: function(result) {
      var wordInfo = JSON.parse(result);

      // the word doesn't exist at all (empty list) or it's mistyped (a list of spelling suggestions)
      if (wordInfo.length == 0 || !wordInfo[0].hasOwnProperty("hwi")) {
        showErrorMessage("Sorry, the word you've entered isn't in the thesaurus :("); // eg. "noun", "dsfsdd"
      } else {
        // find the index that contains the verb form
        var verbInfo = null;
        for (var i = 0; i < wordInfo.length; i++) {
          if (wordInfo[i].fl == "verb") {
            verbInfo = wordInfo[i];
            break;
          }
        }

        if (verbInfo == null) { // no verb form found
          showErrorMessage("Please enter a verb."); // eg. "normal"
        } else {
          addDefSyn(verbInfo.shortdef, verbInfo.meta.syns); // first (up to) three definitions
        }
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      showErrorMessage("Sorry, something went wrong: " + jqXHR.status + " " + jqXHR.statusText);
    }
  });
}

// show synonyms of the word entered if it isn't empty
function showSynonyms() {
  var searchTerm = $("input[name='search']").val().trim();

  if (searchTerm.length == 0) {
    showErrorMessage("Please enter a word."); // eg. "", "   "
  } else {
    // check if the number of requests from the user exceeds the limit
    $.ajax({
      url: "/requests",
      type: "GET",
      success: function(result) {
        if (result != "success") {
          showErrorMessage(result);
        } else {
          if (isActionVerb(searchTerm)) {
            $("#search").css("border", "4px solid lightblue");
          } else {
            $("#search").css("border", "4px solid lightgrey");
          }
          requestWordInfo(searchTerm);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        showErrorMessage("Sorry, something went wrong: " + jqXHR.status + " " + jqXHR.statusText);
      }
    });
  }
}

// Given an element of which to copy text, copy to clipboard
function copyToClipboard(element) {
  var textArea = document.createElement("textarea");
  textArea.value = element.text();
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

$(document).ready(function() {
  // when "Find" button is clicked, show synonyms
  $("input[type='submit']").on("click", function() {
    $("#error-message").empty();
    $("#result-box ol").empty();
    showSynonyms();
    return false;
  });

  // when "Info" button is clicked, show the modal
  $("#info-modal-button").on("click", function() {
    $("#modal-content").removeClass("hideModal").addClass("showModal");
    $("#info-modal").show();
    $("#info-modal").scrollTop(0); // scroll to top
  });

  // when close button is clicked, close the modal
  $("#close").on("click", function() {
    $("#modal-content").removeClass("showModal").addClass("hideModal");
    setTimeout(function() { $("#info-modal").hide(); }, 400);
  });

  // when anywhere outside of the modal is clicked, close it
  $(window).on("click", function(event) {
    if (event.target == document.getElementById("info-modal")) {
      $("#modal-content").removeClass("showModal").addClass("hideModal");
      setTimeout(function() { $("#info-modal").hide(); }, 400);
    }
  });
});
