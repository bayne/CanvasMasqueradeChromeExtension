var url = '';
chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    url = (new URL(tabs[0].url)).origin;
});

function searchUsers(searchTerm, callback, errorCallback) {
    return $.getJSON(
        url+'/api/v1/accounts/1/users',
        {'search_term': searchTerm, 'per_page': 100}
    );
}

function findByLoginId(searchTerm, callback, errorCallback) {
    return searchUsers(searchTerm)
        .then(function (users) {
            for (var i = 0; i < users.length; i++) {
                if (users[i].login_id.toLowerCase() == searchTerm.toLowerCase()) {
                    return users[i];
                }
            }
            pageAlert("No users found with that login id");
        })
    ;
}

function pageAlert(message) {
    chrome.tabs.executeScript(null,
      {code:"alert('"+message+"');"});
}


function masqueradeAsUser(user) {
  chrome.tabs.executeScript(null,
      {code:"window.location = '"+url+"/?become_user_id="+user.id+"'"});
  window.close();
}

function goToUserPage(user) {
  chrome.tabs.executeScript(null,
      {code:"window.location = '"+url+"/users/"+user.id+"'"});
  window.close();
}

$(function () {
    $("form input[type=submit]").click(function() {
        $("input[type=submit]", $(this).parents("form")).removeAttr("clicked");
        $(this).attr("clicked", "true");
    });

    $("#form").submit(function (e) {

        var val = $("input[type=submit][clicked=true]").val();

        if (val == 'Profile') {
            findByLoginId($("#masquerade").val())
                .then(function (user) {
                    goToUserPage(user);
                }, function () {
                    pageAlert("Could not go to the user's profile, are you on a Canvas website?");
                })
            ;
        } else {
            findByLoginId($("#masquerade").val())
                .then(function (user) {
                    masqueradeAsUser(user);
                }, function () {
                    pageAlert("Could not masquerade, are you on a Canvas website?");
                })
            ;
        }
        e.preventDefault();
        $(".loading").show();
    });
});


