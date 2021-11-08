//formats a number parameter to look like 1,000,000 etc
const numberWithCommas = (x) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

/* Function to fetch a single coin based on the CoinID passed in, will append the result to the Coin Result DOM element  */
const idFetchMatch = (id) => {
  const coin = fetchCoins(id);
  return coin;
}
//Async Fetch function that returns an array of data points according to specified time (alpha only supports 90 days)
const fetchHistory = async (id) => {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=eur&days=30&interval=daily`
  const res = await fetch(url);
  const data = await res.json();
  const normalised = data[`prices`].map(item => item[1]);
  return Promise.all(normalised);
};
//return an array of dom elements, and appends each to DOM
const createDom = (item,element) => {
  //removes Dom element using passed in id
  const coinDomEL = document.createElement(`div`);  
  const removeDomEl = (id) => {
    if (item.idNo === id) {
      element.removeChild(coinDomEL)
    }
  }
  //When mouse moves off the coinDomEl, set visibility of buttons to 1
  const btnVisible = (id) => {
    if (id === item.idNo) {
      const pinBtn = coinDomEL.querySelector(`.pinBtn`);
      const delBtn = coinDomEL.querySelector(`.delBtn`);
      pinBtn.style.opacity = "1";
      delBtn.style.opacity = "1";
    }
  }
  //When mosue moves off the coinDomEl, set visibility of buttons to 0
  const btnNotVisible = (id) => {
    if (id === item.idNo) {
      const pinBtn = coinDomEL.querySelector(`.pinBtn`);
      const delBtn = coinDomEL.querySelector(`.delBtn`);
      pinBtn.style.opacity = "0";
      delBtn.style.opacity = "0";
    }
  }

  //Declare and create DOM elements
  const elTitle = document.createElement(`h4`)
  const elPrice = document.createElement(`p`)
  const elPriceChange = document.createElement(`p`)
  const elMarketcap = document.createElement(`p`)
  const del = document.createElement(`button`)
  const pinBtn = document.createElement(`button`)

  //Configure declared Dom elements and add classes for CSS styling
  elTitle.innerHTML = item.coinId
  elPrice.innerHTML = `Price per coin (EUR): €${ Math.round(item.eur * 100) / 100 }`
  elMarketcap.innerHTML = `EU Marketcap: €${numberWithCommas(Math.round(item.eur_market_cap * 100) / 100)}`
  elPriceChange.innerHTML = `Price change/24hrs(%): ${Math.round(item.eur_24h_change * 100) / 100}%` 
  coinDomEL.id = `#test`
  elTitle.classList.add(`card-title`)
  elMarketcap.classList.add(`card-marketCap`)
  elPriceChange.classList.add(`card-priceChange`)
  coinDomEL.classList.add(`card`)
  del.innerHTML = `<i class="fas fa-trash"></i>`
  del.classList.add(`delBtn`,`btn`)
  pinArray.indexOf(item.coinId) >= 0 ? pinBtn.innerHTML = `Pinned` : pinBtn.innerHTML = `Pin?`
  pinBtn.classList.add(`btn`,`pinBtn`)
  

  //Append configuired elements to Div
  coinDomEL.appendChild(elTitle)
  coinDomEL.appendChild(del)
  coinDomEL.appendChild(elPrice)
  coinDomEL.appendChild(elPriceChange)
  coinDomEL.appendChild(elMarketcap)
  coinDomEL.appendChild(pinBtn)

  //Add event listneners to desired elements

  //evtlistr for delete button. Executes 
  del.addEventListener(`click`,()=>{
    removeDomEl(item.idNo)
    if (pinArray.indexOf(item.coinId) >= 0){
          pinArray.splice(pinArray.indexOf(item.coinId),1)
          return window.localStorage.setItem("savedCoins", JSON.stringify(pinArray))
    }
  })

    
  pinBtn.addEventListener(`click`,()=>{
    //if button is clicked put the item in a pin array which will be used to generate stored searches in local storage
    if (pinArray.indexOf(item.coinId) < 0) {
      pinArray.push(item.coinId)
      window.localStorage.setItem("savedCoins", JSON.stringify(pinArray))
      coinDomEL.classList.add(`savedItem`)
      pinBtn.innerHTML = `Pinned`
      return fetchCoins(item.coinId).then((res => createDom(res, savedResults)))
    };
    return pinArray
  })
  //Push into array 
  elArray.push(coinDomEL);
  //Use the array to generate index for each el in the array

  //When mouse rolls over the coin element, buttons are visble, and vice-versa
  coinDomEL.addEventListener('mouseover', () => btnVisible(item.idNo));

  coinDomEL.addEventListener(`mouseout`, () => btnNotVisible(item.idNo));
  /* coinDomEL.addEventListener(`click`,(e)=>{
    if ((e.target !== (pinBtn || del))) coinDomEL.classList.toggle(`moreInfo`)
}) */
  //Event listener to generate a Graph of historical data when domEl clicked
  coinDomEL.addEventListener(`click`, (e)=>{
  //toggles class which makes the card big or small, conditional to make sye

    if ((e.target !== (pinBtn || del))) coinDomEL.classList.toggle(`moreInfo`)
  //create a variable to check if chart exists, if so remove it so new chart can be appended
    const chart = coinDomEL.querySelector(`#myChart`)
    if (chart) return coinDomEL.removeChild(chart)
    
    //generates a Chart based on past 30days price data and attaches it to DOM element via Chart JS
    //create canvas Dom element
    const canvasEl = document.createElement(`canvas`);
    //set ID for the canvas
    canvasEl.id = `myChart`
    //Function that uses Chart.JS library to define and append the chart
    const chartData = () => fetchHistory(item.coinId).then(res => {
      canvasEl.innerHTML= `Chart loading..`
        //data section, uses promise data to populate data points
        const data = {
          //create entries for each day in the days array
          labels: dayArray(),
          //Create graph parameters (using chart.js docs)
          datasets: [{
            label: 'Price per Coin (EUR)',
            data: res,
            backgroundColor: [
              'rgba(0,0,0, 1)',
            ],
            borderColor: [
              'rgba(0,0,0, 1)',
            ],
            borderWidth: 0.7,
            pointRadius: 0
          }]
        }
        //sets type of chart, and the parameters 
        const config = {
          type: 'line',
          data: data,
          options: {
            scales: {
              y: {
                beginAtZero: true
              },
              x: {
                min: 0,
                max: res.length - 1,
                labelString: 'Date'

              }
            }
          }
        }
        //sets width and hight of the canvas, then appends it 
        canvasEl.setAttribute(`width`, 200);
        canvasEl.setAttribute(`height`, 200);
        coinDomEL.appendChild(canvasEl)
        //Constructor
        return myChart = new Chart(canvasEl.getContext("2d"), config)
      })
    //as long as the pin button is not clicked execture the initialisation function, extra condition to make sure resize class is added
    if (e.target !== pinBtn && coinDomEL.classList.contains(`moreInfo`)) {
          return chartData()
        } 

    });

    coinDomEL.classList.contains(`savedItem`) ? element === savedResults : coinResults
    element.appendChild(coinDomEL);
    return elArray;
}
  
//Function that takes a coinId to create  a coin object 
const fetchCoins = async (coinId) => {
  const priceURL = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=eur&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
  const response = await fetch(priceURL);
  response.status === 200 ? console.log(`Success`) : console.log(`Error in fetchCoins`)
  const coins = await response.json();
  const info = coins[coinId];
  //uses uuid library to generate random id number
  const idNo = uuidv4()
  //Creates an object with coinId, promise data and id as properties
  const normalised = { coinId, ...info, idNo};
  return normalised;
};

//Function takes an array of coin matches, takes their ids and makes API calls, returning an array of objects
const callMatch = (matches) => {
  //using map function to generate an Array of objects
  const matchArray = matches.map(async function (match) {
    const id = match.id;
    try {
      return fetchCoins(id);
    } catch (e) {
      //console.log(e.message)
      console.log(`error in callMatch()`)
    }
  })
  return Promise.all(matchArray);
};

//Takes the user's input to create an array of matches. these will then 
const allMatches = async (searchString) => {
  //define an empty arr, matches which will hold all instances where the result's item.name/symbol property 
  let matches = [];
  //Loops through the array and checks if the searchstring is a match and pushes it into the array
  coinNameArr.forEach(item => {
    if (item.name.toLowerCase().includes(searchString)) {
     return matches.push(item);
    } else if (item.symbol.toLowerCase().includes(searchString)) {
     return matches.push(item);
    }

  });
  //Function that makes API calls for each array element and returns an array of objects
  const renderedMatches = () => callMatch(matches).then((results => [...results]))
    //Function that takes the array of objects, awaits the resolved promise, and appends a DOM element for each array el
    let DOMelList = await renderedMatches();
    //Use filter list to return a sanitised array of real coins
    const filteredList = DOMelList.filter(item => item.eur_market_cap > 0)
    //iterat through the list and append each coin as a Dom El
    return filteredList.forEach(item => createDom(item,coinResults));

};

//Tests that the search string at least has some matches, if it does, it will use callback function to generate DOM elements
const renderSuggestion = (searchString) => {
  //resets the DOM elements generated by prior searches and resets DOM elements
  elArray = []
  coinResults.innerHTML = ``;
  //Const declarati ons: Removes whitespace and makes text lowercase, 
  const normalisedTxt = searchString.toLowerCase().trim(),
    //Returns the index of a coin which has a exact id match to seach string, similar below
    idMatchIndex = coinNameArr.findIndex(item => item.id.toLowerCase() === normalisedTxt),
    symbolMatchIndex = coinNameArr.findIndex(item => item.symbol.toLowerCase().includes(normalisedTxt)),
    nameMatchIndex = coinNameArr.findIndex(item => item.name.toLowerCase().includes(normalisedTxt));
  //If a coins id matches the search string just make a search for that coin
  if ((idMatchIndex > -1) && (normalisedTxt.length >= 3)) {
    coinResults.innerHTML = ` `;
    return idFetchMatch(normalisedTxt).then(res => createDom(res,coinResults))
  }
  //If no exact match search the array for partial matches of symbol and names of coins
  else if (symbolMatchIndex > -1) {
    return allMatches(normalisedTxt);
  } else if (nameMatchIndex > -1) {
    return allMatches(normalisedTxt);
  } else {
    //If no match at all:
    return `Sorry no matches for this coin!`;
  }
};
//local storage. Try catch function allows us to store pinned coins in LS, issue is how to we render each item in pin array to DOM?
const storedCoins = () =>{
  const savedCoin = localStorage.getItem('savedCoins');
  //create an array from LS to be read and auto populate DOM elements on load
  //If there is something in LS return the Arr, if not empty Arr
  try {
      return savedCoin ? JSON.parse(savedCoin) : [];
  } catch (e) {
      return [];
  }
}





