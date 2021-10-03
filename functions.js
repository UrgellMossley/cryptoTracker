//formats a number parameter to look like 1,000,000 etc
const numberWithCommas = (x) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

/* Function to fetch a single coin based on the CoinID passed in, will append the result to the Coin Result DOM element  */
const idFetchMatch = (id) => {
  const coin = fetchCoins(id);
  return coin;
}
//return an array of dom elements, and appends each to DOM
const createDom = (item) => {
  //declare dom el
  const coinDomEL = document.createElement(`div`);
  //assign ID
  

  //Declare the HTML of the DOM el using info from coin object
  coinDomEL.innerHTML = `
                         <div id="test" class="card">
                         <h4 id="cardEl" class="card-title">${item.coinId}</h4>
                         <p id="cardEl" class="card-price">Price per coin (EUR): ${Math.round(item.eur * 100) / 100}</p>
                         <p id="cardEl" class="card-marketCap">EU Marketcap: $${numberWithCommas(Math.round(item.eur_market_cap * 100) / 100)}</p>
                         <p id="cardEl" class="card-priceChange">Price change/24hrs(%): ${Math.round(item.eur_24h_change * 100) / 100}%</p>
                         <button class="pinBtn">Pin?</button>
                         </div>`
                      
  //Push into array 
  elArray.push(coinDomEL);
  //Use the array to generate index for each el in the array
    let elIndex = elArray.indexOf(coinDomEL);


  //Declaring event listners after dynamically generated els
  //evt listener which fires when mouse hovers over DOM el to make elements appear/disappear
  //use our elArray to make an index we use to target the approriate els
  coinDomEL.addEventListener('mouseover', () => {
      const pinBtn = document.querySelectorAll(`.pinBtn`);

      pinBtn[elIndex].style.display = "block";
    });

  coinDomEL.addEventListener(`mouseout`, () => {
      const pinBtn = document.querySelectorAll(`.pinBtn`);

      pinBtn[elIndex].style.display = "none";
    });

  coinDomEL.addEventListener(`click`, (e) => {
      const pinBtn = document.querySelectorAll(`.pinBtn`);
      //if button is clicked put the item in a pin array which will be used to generate stored searches in local storage
      if (e.target === pinBtn[elIndex] && pinArray.indexOf(item) < 0){
        pinArray.push(item);
        return pinArray
      }
      


    })
    
//Event listener to generate a Graph of historical data when domEl clicked
  coinDomEL.addEventListener(`click`, (e)=>{
    const infoDiv = document.createElement(`canvas`)
    const pinBtn = document.querySelectorAll(`.pinBtn`);
    const cardEl = document.querySelectorAll(`.card`)
    const charLookup = document.querySelector(`#myChart`)
   
 
    
    //Async Fetch function that returns an array of data points according to specified time (alpha only supports 90 days)
    const fetchHistory = async (id) =>{
      const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=eur&days=30&interval=daily`
      const res =  await fetch(url)
      const data = await res.json()
      const normalised =  data[`prices`].map(item=>item[1])
      return Promise.all(normalised) 
    
    }
    
     

    let data = ()=> fetchHistory(item.coinId).then(res=>{
    infoDiv.id = `myChart`
    const ctx = document.getElementById('myChart').getContext('2d');
    //declare chart as an attribute to the window object which is a global object. 
      myChart = new Chart(ctx, {
      type: 'line',
      data: {
          //create entries for each day in the days array
          labels: DAYS(),
          datasets: [{
              label: 'Price per Coin (EUR)',
              data:res,
              backgroundColor: [
                  'rgba(0,0,0, 1)',
              ],
              borderColor: [
                  'rgba(0,0,0, 1)',
              ],
              borderWidth: 0.8
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              },
              x: {
                min: 0,
                max: res.length-1
                }
            }
          }

        });
        
      })
    
    
    infoDiv.setAttribute(`width`,200)
    infoDiv.setAttribute(`height`,200)  
    if( cardEl[elIndex].contains(charLookup)){  
      cardEl[elIndex].removeChild(charLookup)
    } else {
      cardEl[elIndex].appendChild(infoDiv)
      data()
    }
            
    if (e.target !== pinBtn[elIndex]) {   
          cardEl[elIndex].classList.toggle(`moreInfo`)
          
        }
    });

    coinResults.appendChild(coinDomEL);
    return elArray;
}
  
//Function that takes a coinId to create  a coin object 
const fetchCoins = async (coinId) => {

  const priceURL = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=eur&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
  const response = await fetch(priceURL);
  response.status === 200 ? console.log(`Success`) : console.log(`Nah mate`)
  const coins = await response.json();
  const info = coins[coinId];
  //Creates an object with coinId as a property
  const normalised = { coinId, ...info };
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
      console.log(e.message)
    }
  })
  return Promise.all(matchArray);
};

//Takes the user's input to create an array of matches. these will then 
const allMatches = (searchString) => {
  //define an empty arr, matches which will hold all instances where the result's item.name/symbol property 
  let matches = [];
  //Loops through the array and checks if the searchstring is a match and pushes it into the array
  coinNameArr.forEach(item => {
    if (item.name.toLowerCase().includes(searchString)) {
      matches.push(item);
    } else if (item.symbol.toLowerCase().includes(searchString)) {
      matches.push(item);
    }

  });
  //Function that makes API calls for each array element and returns an array of objects
  const renderedMatches = () => callMatch(matches).then((results => [...results]))
  //Function that takes the array of objects, awaits the resolved promise, and appends a DOM element for each array el
  const appendMatchDOM = async () => {

    let DOMelList = await renderedMatches();
    //Use filter list to return a sanitised array of real coins
    const filteredList = DOMelList.filter(item => item.eur_market_cap > 0)
    //iterat through the list and append each coin as a Dom El
    return filteredList.forEach(item => createDom(item));
  };

  return appendMatchDOM();
};

//Tests that the search string at least has some matches, if it does, it will use callback function to generate DOM elements
const renderSuggestion = (searchString) => {
  //resets the DOM elements generated by prior searches and resets DOM elements
  elArray = []
  coinResults.innerHTML = ` `;
  //Const declarations: Removes whitespace and makes text lowercase, 
  const normalisedTxt = searchString.toLowerCase().trim(),
    //Returns the index of a coin which has a exact id match to seach string, similar below
    idMatchIndex = coinNameArr.findIndex(item => item.id.toLowerCase() === normalisedTxt),
    symbolMatchIndex = coinNameArr.findIndex(item => item.symbol.toLowerCase().includes(normalisedTxt)),
    nameMatchIndex = coinNameArr.findIndex(item => item.name.toLowerCase().includes(normalisedTxt));
  //If a coins id matches the search string just make a search for that coin
  if ((idMatchIndex > -1) && (normalisedTxt.length >= 3)) {
    coinResults.innerHTML = ` `;
    return idFetchMatch(normalisedTxt).then(res => createDom(res, []))

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

const storedCoins = () =>{
  const savedCoin = localStorage.getItem('savedCoins');
  
  try{
      return savedCoin ? JSON.parse(savedCoin) : [];
  } catch (e) {
    return [];
  }
}



