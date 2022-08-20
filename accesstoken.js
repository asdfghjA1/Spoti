
 const SpotifyWebApi = require('spotify-web-api-node');
 const express = require('express');
 
 const scopes = [
   'ugc-image-upload',
   'user-read-playback-state',
   'user-modify-playback-state',
   'user-read-currently-playing',
   'streaming',
   'app-remote-control',
   'user-read-email',
   'user-read-private',
   'playlist-read-collaborative',
   'playlist-modify-public',
   'playlist-read-private',
   'playlist-modify-private',
   'user-library-modify',
   'user-library-read',
   'user-top-read',
   'user-read-playback-position',
   'user-read-recently-played',
   'user-follow-read',
   'user-follow-modify'
 ];

 const spotifyApi = new SpotifyWebApi({
   redirectUri: 'http://localhost:8888/callback',
   clientId: 'c3ad71a9338440babfe990c4f8aafdb7',
   clientSecret: '14ea9b22d9fd4b2f8d8d8515bada0c2b'
 });
 
 const app = express();
 
 app.get('/login', (req, res) => {
   res.redirect(spotifyApi.createAuthorizeURL(scopes));
 });
 
 app.get('/callback', (req, res) => {
   const error = req.query.error;
   const code = req.query.code;
   const state = req.query.state;
 
   if (error) {
     console.error('Callback Error:', error);
     res.send(`Callback Error: ${error}`);
     return;
   }
   spotifyApi
     .authorizationCodeGrant(code)
     .then(data => {
       const access_token = data.body['access_token'];
       const refresh_token = data.body['refresh_token'];
       const expires_in = data.body['expires_in'];
 
       spotifyApi.setAccessToken(access_token);
       spotifyApi.setRefreshToken(refresh_token);

       console.log(access_token);

       spotifyApi.getMyTopTracks( { limit: 3 } )
       .then(function(data) {
         let topTracks = data.body.items;
         console.log(JSON.stringify( topTracks));
       }, function(err) {
         console.log('Something went wrong!', err);
       });
       
       res.send('Success! You can now close the window.');
 
       setInterval(async () => {
         const data = await spotifyApi.refreshAccessToken();
         const access_token = data.body['access_token'];
 
         console.log('The access token has been refreshed!');
         console.log(access_token);
         spotifyApi.setAccessToken(access_token);
       }, expires_in / 2 * 1000);

     })
     .catch(error => {
       console.error('Error getting Tokens:', error);
       res.send(`Error getting Tokens: ${error}`);
     });
 });
 
 app.listen(8888, () =>
   console.log(
     'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
   )
 );