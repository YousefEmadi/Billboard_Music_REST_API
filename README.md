# Billboard_Music_REST_API

##This web application works based on web services (REST APIs) powered by Billboard.com and YouTube.com. <br/>
##Designed and developed by ZOE group using REST API, JSON, JavaScript, CSS, Bootstrap, HTML5 and caching API responses on the Local Storage. <br/>

##Team members:
#Jerome Olivier
#Yousef Emadi
#Anthony Zampino

<br/>
Billboard API: We used the “Hot 100” chart to get the list of top songs for a given week <br/>
YouTube Search Results API: We used the “Hot 100” chart to get the list of top songs for a given week <br/>
The end result was to produce a Top 10 songs list with a link to the YouTube video of each song <br/>

Finding a suitable API for our project was one of the challenges we faced. Our original idea was to use APIs to fetch different types of flight data (airlines, airports, aviation weather reports etc.) but the APIs were slow and/or unreliable. Although paid versions could have been more responsive, the time required to receive a key was too long. <br/>


The Billboard API search query only works if the date used falls on a Saturday. However, the app allows a user to choose any date when requesting the top 10 songs. A function was created to revert any chosen date to the previous Saturday (findNearestSaturday) <br/>

The differences in the response times for the two APIs would cause certain results to show up as undefined and running the “fetch” command again would resolve it. Not to have to hit “fetch” twice to produce results, we used async functions with the “await” and “.then” keywords <br/>

To get the desired result, the YouTube API needed the information from the Billboard API (Song title and Artist). A function was created to automatically create the search string based on the Billboard API results (generateSearchQueries). <br/>

To avoid having to use a new API request every time the user wants to see a top 10 list, we took advantage of “local storage” to save the JSON results. This way when a user requests the top 10 list from a date they had already previously selected, the app fetches the info from local storage rather then from another API request. This produces faster results  <br/>

For testing purposes, the free version of the APIs were not sufficient in term of maximum daily requests, so we paid for a basic package giving us 1500 Billboard request and 10,000 YouTube requests daily.  <br/>

Each new request takes approximately 10 to 12 seconds to produce results  <br/>






