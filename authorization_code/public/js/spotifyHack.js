(function() {
  let me;
  let playlistsId = [];
  let tabArtists = [];

  let params = getHashParams();

  let access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  let myFetchParam = {
    method : 'GET',
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  }

  /*
      let oauthSource = document.getElementById('oauth-template').innerHTML,
      oauthTemplate = Handlebars.compile(oauthSource),
      oauthPlaceholder = document.getElementById('oauth');
  */


  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  /**
  * Get me
  */
  function getMe(){
    if (error) {
      alert('There was an error during the authentication');
    } else {
      // render initial screen
      $('#login').show();
      $('#loggedin').hide();

      fetch('https://api.spotify.com/v1/me', myFetchParam).then(
        response => {
          if (response.ok){
            response.json().then(function(data) {
              me = data.id;
              callAPI();
            });
          }
        }
      );
    }
  }

  /**
  * Call Spotify API
  */
  function callAPI(){
    if (access_token) {
      // render oauth info
      /*
        oauthPlaceholder.innerHTML = oauthTemplate({
          access_token: access_token,
          refresh_token: refresh_token
        });
      */

      fetch('https://api.spotify.com/v1/me/playlists', myFetchParam).then(
        response => {
          if (response.ok){
            response.json().then(function(data) {
              for (playlistId of data.items){
                playlistsId.push(playlistId.id);
              }
              for (playlist of playlistsId){
                fetch('https://api.spotify.com/v1/users/'+me+'/playlists/'+playlist+'/tracks', myFetchParam).then(
                  response => {
                    if (response.ok){
                      response.json().then( data => {
                        getArtists(data);
                      });
                    }
                    else{
                      console.log('Looks like there was a problem. Status Code: ' +
                      response.status);
                      return;
                    }
                  }
                )
              }
              printSomeStuffs();
            });
            $('#login').hide();
            $('#loggedin').show();
          }
          else{
            console.log('Looks like there was a problem. Status Code: ' +
            response.status);
            return;
          }
        }
      ).catch(function(err) {
        console.log('Fetch Error :-S', err);
      });

      getArtistsFromTrack('https://api.spotify.com/v1/me/tracks');
    }
  }

  /**
  * Get artists following Spotify API
  */
  function getArtists(data) {
    for(track of data.items){
      for (artist of track.track.artists){
        if(tabArtists.indexOf(artist.name) === -1 || tabArtists.length == 0){
          tabArtists.push(artist.name);
          $('.artists').append('<span>'+artist.name+'</span>');
        }
      }
    }
  }

  /**
  * Get artists from saved tracks Spotify API
  */
  function getArtistsFromTrack(url){
    fetch(url, myFetchParam).then(
      response => {
        if (response.ok){
          response.json().then(function(data) {
            getArtists(data);
            if(data.next != null){
              getArtistsFromTrack(data.next);
            }
          });
        }
      }
    );
  }


  function printSomeStuffs (){
    //console.log(tabArtists);
  }

  getMe();


  /*
    document.getElementById('obtain-new-token').addEventListener('click', function() {
      $.ajax({
        url: '/refresh_token',
        data: {
          'refresh_token': refresh_token
        }
      }).done(function(data) {
        access_token = data.access_token;
        oauthPlaceholder.innerHTML = oauthTemplate({
          access_token: access_token,
          refresh_token: refresh_token
        });
      });
    }, false);
  */
})();
