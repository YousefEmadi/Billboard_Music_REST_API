/** ////////////////////////////////////////////////////////////////////////////////////////// **/
/** /////////////////////////////////       Date         /////////////////////////////////// **/
/** //////////////////////////////////////////////////////////////////////////////////////// **/


let selectedSaturday = "";

function findNearestSaturday() {
    let datePickerEL = document.querySelector("#datePicker").valueOf();
    let current_date = new Date(datePickerEL.value);
    let today = new Date;
    current_date = current_date.addDays(1); // to solve 1 day off bug of UTC


    if (current_date > today) {
        alert("Long future! \nWe are not there yet my friend. \nYou can see the most recent chart"); 
        current_date = today;
    }

    if (current_date.getDay() !== 6) {   //if the selected date has been passed the Saturday
        current_date = current_date.subtractDays(current_date.getDay() + 1);
    }

    // nearest Saturday to selected date
    selectedSaturday = formatDate(current_date).toString();
    console.log("selected Saturday: " + selectedSaturday);
}

Date.prototype.subtractDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
};
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


/** //////////////////////////////////////////////////////////////////////////////////////// **/
/** /////////////////////////////////       API          /////////////////////////////////// **/
/** //////////////////////////////////////////////////////////////////////////////////////// **/




// set number of songs to return here (keep it low for development)
let rankingSizeMax = 10;
let rankingSize;


// event handler for the each nav button
document.querySelector("#top5").addEventListener('click', function () {
    rankingSize = 5;
    Billboard();
});
document.querySelector("#top10").addEventListener('click', function () {
    rankingSize = 10;
    Billboard();
});
// document.querySelector("#top50").addEventListener('click', function () {
//     rankingSize = 50;
//     Billboard();
// });


// global variables
let billboardData;
const youtubeSearchValues = [];
const youtubeLinks = [];
// DOM element for populating the result
const resultTrayEl = document.querySelector("#resultTray");

findNearestSaturday();
// Billboard API
const billboardBaseURL = "https://billboard-api2.p.rapidapi.com/hot-100?date=";
const billboardHost = "billboard-api2.p.rapidapi.com";
const billboardKey = "5262901361mshfd5ddac0db5bf9ap11e4a4jsnc2868a4d22b8";

// YouTube API
const youtubeBaseURL = "https://youtube-search-results.p.rapidapi.com/youtube-search/?q=";
const youtubeHost = "youtube-search-results.p.rapidapi.com";
const youtubeKey = "5262901361mshfd5ddac0db5bf9ap11e4a4jsnc2868a4d22b8";

// master function
async function Billboard() {
    findNearestSaturday();
    if (selectedSaturday === "NaN-NaN-NaN") {
        alert("Please pick a date");
    } else {

        // showing the loader spinning sircle on the result div 
        resultTrayEl.innerHTML = "";
        const loaderDiv = document.createElement("div");
        loaderDiv.setAttribute("class", "loader");
        resultTrayEl.appendChild(loaderDiv);


        // creating the request url
        const billboardFullURL = `${billboardBaseURL}${selectedSaturday}&range=1-${rankingSizeMax}`;

        // conditional part of function to fetch data from local storage or if the local storage key is empty fetch info from the API and save in the Local storage
        if (localStorage.getItem(selectedSaturday + "bill") === null) {


            // localStorage.clear();
            alert("This is a new data fetch and it takes a while to complete, please be patient");
            console.log("fetching billboard data");
            await fetch(billboardFullURL, {
                "method": "GET",
                "headers": {
                    "x-rapidapi-host": billboardHost,
                    "x-rapidapi-key": billboardKey
                }
            })
                .then(response => response.json()) // convert to json
                .then(data => {
                    billboardData = data;
                    return data;
                })
                .then(data => generateSearchQueries(data))
                .then(youTubeSearchValues => selectYouTubeLinks(youTubeSearchValues));

            //save API fetch data to local storage to save for the further usage
            localStorage.setItem(selectedSaturday + "bill", JSON.stringify(billboardData));
        }

        // retrieve Billboard & Youtube data from local storage
        let billboardBackToJson = JSON.parse(localStorage.getItem(selectedSaturday + "bill"));
        let youtubeBackToJson = JSON.parse(localStorage.getItem(selectedSaturday + "yt"));

        console.log(selectedSaturday);
        printData(rankingSize, billboardBackToJson, youtubeBackToJson);
    }
}

const generateSearchQueries = function (data) {
    console.log("generating youtube search strings");
    youtubeSearchValues.splice(0, youtubeSearchValues.length);
    for (let i = 0; i < rankingSizeMax; i++) {
        let number = (i + 1).toString();
        let title = data.content[number].title.split(' ').join('_');
        let artist = data.content[number].artist.split(' ').join('_');
        youtubeSearchValues.push([`${title}_${artist}`]);
    }
    return youtubeSearchValues;
};

const selectYouTubeLinks = async function (searchValues) {
    youtubeLinks.splice(0, youtubeLinks.length);
    for (let j = 0; j < rankingSizeMax; j++) {
        console.log(`fetching youtube link #${j + 1}`);
        let fullURL = youtubeBaseURL + searchValues[j];
        await fetch(fullURL, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": youtubeHost,
                "x-rapidapi-key": youtubeKey
            }
        }).then(response => response.json())
            .then(data => {
                let link = data.items[0].url;
                let thumb = data.items[0].bestThumbnail.url;
                youtubeLinks.push([link, thumb]);
            });

    }

    //save API fetch data to local storage
    localStorage.setItem(selectedSaturday + "yt", JSON.stringify(youtubeLinks));
    return youtubeLinks;
};


/** ///////////////////////////////////////////////////////////////////////////////////////// **/
/** /////////////////////////////////       Result       /////////////////////////////////// **/
/** //////////////////////////////////////////////////////////////////////////////////////// **/


const printData = function (limit, billboard, youtube) {

    resultTrayEl.innerHTML = "";
    for (let i = 0; i < limit; i++) {
        let number = (i + 1).toString();
        const newCard = document.createElement("div");

        const artist = billboard.content[number].artist;
        const songTitle = billboard.content[number].title;
        const rank = billboard.content[number].rank;
        const lastWeek = billboard.content[number]["last week"];
        const peakPosition = billboard.content[number]["peak position"];
        const weeks = billboard.content[number]["weeks on chart"];
        const videoLink = youtube[i][0];
        const thumb = youtube[i][1];

        newCard.setAttribute("class", "col-md-12");
        newCard.setAttribute("id", `rank ${rank}`);

        newCard.innerHTML =
            `<div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-350 position-relative">
                    <div class="col p-4 d-flex flex-column position-static">
                        <strong class="d-inline-block mb-2 text-primary">${artist}</strong>
 
                        <h3 class="mb-0">${songTitle}</h3>
                        <div class="mb-1 text-muted" >#${rank}</div>
                        <p class="card-text mb-auto" >Last Week Rank: ${lastWeek}</p>
                        <p class="card-text mb-auto" >Peak Position: ${peakPosition}</p>
                        <p class="card-text mb-auto" >Weeks on Chart: ${weeks}</p>
                        <a href="${videoLink}" class="stretched-link">Watch the music video</a>
                    </div>
                    <div class="col-auto d-none d-lg-block">
                        <img src="${thumb}"
                             alt="Paris" style="border: 1px solid #ddd;
                  border-radius: 4px;
                  padding: 5px;
                  width: 350px; height: 250px;">
                    </div>
                </div>`;

        resultTrayEl.appendChild(newCard);

    } //end of loop

    resultTrayEl.innerHTML +=
        `<nav class="blog-pagination" aria-label="Pagination">
            <a class="btn btn-outline-primary" href="#">Older</a>
            <a class="btn btn-outline-secondary disabled" href="#" tabindex="-1" aria-disabled="true">Newer</a>
            <a class="btn btn-outline-primary" href="#">Back to Top</a>
        </nav>`;
};

