var url = '';
chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    url = (new URL(tabs[0].url)).origin;
});

function searchUsers(searchTerm, callback, errorCallback) {
    return $.getJSON(
        url+'/api/v1/accounts/1/users',
        {'search_term': searchTerm}
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
      {code:"window.location = '"+url+"/users/"+user.id+"/masquerade'"});
  window.close();
}

$(function () {
    $("#form").submit(function (e) {
        findByLoginId($("#masquerade").val())
            .then(function (user) {
                masqueradeAsUser(user);
            }, function () {
                pageAlert("Could not masquerade, are you on a Canvas website?");
            })
        ;
        e.preventDefault();
    });
});


