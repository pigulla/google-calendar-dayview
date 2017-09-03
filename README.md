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