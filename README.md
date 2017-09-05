[![npm version](http://img.shields.io/npm/v/google-calendar-dayview.svg?style=flat-square)](http://badge.fury.io/js/google-calendar-dayview)
[![Build Status](http://img.shields.io/travis/pigulla/google-calendar-dayview.svg?style=flat-square)](https://travis-ci.org/pigulla/google-calendar-dayview)
[![Dependency Status](https://img.shields.io/david/pigulla/google-calendar-dayview.svg?style=flat-square)](https://david-dm.org/pigulla/google-calendar-dayview)
[![Development Dependency Status](https://img.shields.io/david/dev/pigulla/google-calendar-dayview.svg?style=flat-square)](https://david-dm.org/pigulla/google-calendar-dayview?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/pigulla/google-calendar-dayview/badge.svg?style=flat-square)](https://snyk.io/test/github/pigulla/google-calendar-dayview)
![node](https://img.shields.io/node/v/google-calendar-dayview.svg?maxAge=2592000&style=flat-square)
[![License](https://img.shields.io/npm/l/google-calendar-dayview.svg?maxAge=2592000&style=flat-square)](https://github.com/pigulla/google-calendar-dayview/blob/master/LICENSE)

# google-calendar-dayview

## Setup

 - Log in to a Google Account that has access to the calendars you want to display and go to the [API & Service Credentials](https://console.developers.google.com/apis/credentials) page.
 - Click the `Create credentials` button, select `OAuth client ID` and chose `Other` as the application type (use any name you like).
 - Download the credentials using the `Download JSON` button and put it in a sufficiently secure location (it does contain your client secret), e.g. `~/.gcd-auth/credentials.json`.
 - Generate the authentication URL:
   ```bash
   node dist/backend/cli auth-url --credentials ~/.gcd-auth/credentials.json
   ```
 - Open the returned URL in your browser and use the returned code to generate a bearer token:
   ```bash
   node dist/backend/cli get-token --credentials ~/.gcd-auth/credentials.json --code <code>
   ```
 - Save the generated token in a separate file, e.g. `~/.gcd-auth/token.json`.
 - You should now be able to start the server using the two files created above:
   ```bash
   node dist/backend/cli serve --credentials ~/.gcd-auth/credentials.json --token ~/.gcd-auth/token.json --calendars config.json
   ```