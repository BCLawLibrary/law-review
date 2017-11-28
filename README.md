# law-review
Creates a single-page web app to display journal content from an OAI-PMH feed.

The purpose of these scripts is to create a front end on a remote site for a journal that is already hosted on an OAI-PMH compliant platform. Uses a Google Apps script to harvest the OAI-PMH feed into a Google Sheet. Tabletop.js is used to retrieve data from the Google Sheet, and search and filtering capabilities are handled by the DataTables jQuery plugin. The number of items that can be included is limited by the time restrictions on the Google Apps script. 
