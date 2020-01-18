# law-review
Creates a single-page web app to display journal content from an OAI-PMH feed.

The purpose of these scripts is to create a front end on a remote site for a journal that is already hosted on an OAI-PMH compliant platform. Uses a Google Apps script to harvest the OAI-PMH feed into a Google Sheet. Tabletop.js is used to retrieve data from the Google Sheet, and search and filtering capabilities are handled by the DataTables jQuery plugin. The number of items that can be included is limited by the time restrictions on the Google Apps script. 

The Google Apps script is a modified version of this script by Martin Hawksey: https://gist.github.com/mhawksey/1450966

The current version of this project is the repository https://github.com/BCLawLibrary/law-review-2. The new repository does not use Google Sheets, so we are keeping this older version separate.
