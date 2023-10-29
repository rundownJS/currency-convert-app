//foreign currency exchange application
const API_KEY = 'takbsq99lshqvv4gq4imenpnu8'
const API_ID = '-305373335'
const BASE_URL = 'https://xecdapi.xe.com'
let BASE_CURR = 'EUR' //base for now, later will change based on user prefrence
const RAWsymbols = [
    { "symbol": "USD", "pic": "" },
    { "symbol": "EUR", "pic": "" },
    { "symbol": "JPY", "pic": "" },
    { "symbol": "GBP", "pic": "" },
    { "symbol": "AUD", "pic": "" },
    { "symbol": "CAD", "pic": "" },
    { "symbol": "CHF", "pic": "" },
    { "symbol": "CNY", "pic": "" },
    { "symbol": "NZD", "pic": "" },
    { "symbol": "SEK", "pic": "" },
    { "symbol": "NOK", "pic": "" },
    { "symbol": "SGD", "pic": "" },
    { "symbol": "HKD", "pic": "" },
    { "symbol": "KRW", "pic": "" },
    { "symbol": "INR", "pic": "" },
    { "symbol": "BRL", "pic": "" },
    { "symbol": "ZAR", "pic": "" },
    { "symbol": "RUB", "pic": "" },
    { "symbol": "MXN", "pic": "" },
    { "symbol": "AED", "pic": "" },
    { "symbol": "TRY", "pic": "" },
    { "symbol": "BGN", "pic": "" },
]  

//array of the symbols we would fetch
//make an array that would not include the current base currency
const symbolsArray = () =>{
    const currArray = []

    for(let i = 0; i < RAWsymbols.length; i++){
        if(RAWsymbols[i].symbol != BASE_CURR){
            currArray.push(RAWsymbols[i].symbol)
        }
    }
    return currArray
}


//get today and yesterday dates
const timeFunction = () =>{
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    //format them properly
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`;
    };

    return [formatDate(today), formatDate(yesterday)]
}


//get the currencies
const getCurrencies = async () =>{

    //function to get the date today and yesterday
    const today = timeFunction()[0]
    const yesterDay = timeFunction()[1]

    //const data = await fetch(`${BASE_URL}/v1/convert_from?from=${BASE_CURR}&to=${symbolsArray()}`, {
    const data = await fetch(`${BASE_URL}/v1/historic_rate/period?from=${BASE_CURR}&to=${symbolsArray()}&start_timestamp=${yesterDay}&end_timestamp=${today}&decimal_places=6`, {
        method: "GET",
        headers: {
            'Authorization': `Basic ${btoa(`${API_ID}:${API_KEY}`)}`
        }
    })
    const toJson = await data.json()

    //console.log(toJson.to)

    //call an external function
    //displayData(toJson)

    //trying to fix the order
    const currencyOrder = ["EUR", "USD", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "NZD", "SEK", "NOK", "SGD", "HKD", "KRW", "INR", "BRL", "ZAR", "RUB", "MXN", "AED", "TRY", "BGN"];

    // Reorder the object based on the currencyOrder
    const sortedCurrencyData = {};
    currencyOrder.forEach(symbol => {
    if (symbol !== BASE_CURR && toJson.to[symbol]) {
        sortedCurrencyData[symbol] = toJson.to[symbol];
    }
    });

    displayData(sortedCurrencyData)
}
getCurrencies()


//changing the base currency and the exchnage rates based on it
const baseHolderElement = document.querySelector(".base-currency-holder")
baseHolderElement.addEventListener("click", (e)=>{
    const dropDown = document.querySelector(".dropdown")
    dropDown.innerHTML = ``

    const caret = document.querySelector(".caret")

    for(let i = 0; i < symbolsArray().length; i++){
        const currencyMenu = document.createElement("div")
        currencyMenu.innerHTML = `
        <img src="/images/${symbolsArray()[i]}.png"/>
        <span>${symbolsArray()[i]}</span>
        `
        dropDown.appendChild(currencyMenu)
    }

    let elementActive = false
    const functionForDropdownActivation = () =>{
        if(!elementActive){
            caret.classList.add("caret-spin")
            dropDown.style.display = 'flex'
        }else{
            caret.classList.remove("caret-spin")
            dropDown.style.display = 'none'
        }
        
        elementActive = !elementActive
        e.stopPropagation()
    }
    functionForDropdownActivation()
    
    const clickAnywhereElse = () =>{
        if(elementActive){
            
            elementActive = false
            caret.classList.remove("caret-spin")
            dropDown.style.display = 'none'
        }
    }
    document.body.addEventListener("click", clickAnywhereElse)

    const allMenuCurrencies = document.querySelectorAll(".dropdown div")
    const currencyToChange = document.querySelectorAll(".dropdown div span")

    allMenuCurrencies.forEach((item, index) => item.addEventListener("click", ()=> {
        BASE_CURR = currencyToChange[index].textContent
        getCurrencies()
    }))
})

//the function which will make everyhting appear on the page
const displayData = (forex) =>{
    const currencyWrap = document.querySelector(".currenciesWrapper")
    const baseCurrency = document.querySelector(".table img")
    baseCurrency.src = `/images/${BASE_CURR}.png`
    currencyWrap.innerHTML = ``

    for(currency in forex){
        //this here will determine the color of the text green, red, neutral
        if(forex[currency][0].mid > forex[currency][1].mid){
            //console.log("Yesterday was bigger", currency)
        }else if(forex[currency][0].mid < forex[currency][1].mid){
            //console.log("Today is bigger", currency)
        }else {
            //console.log("No change")
        }

        const result = forex[currency][0].mid > forex[currency][1].mid
            ? "less"
            : (forex[currency][0].mid < forex[currency][1].mid
                ? "more"
                : "same");
        
        const plusMinus = result == "more" ? '+' : " "
        const currencyElement = document.createElement("div")
        currencyElement.classList.add("currency")
        currencyWrap.appendChild(currencyElement)
        currencyElement.innerHTML = `
        <div>
            <img src="/images/${currency}.png" alt="">
            <span>${currency}</span>
        </div>
        <span>${forex[currency][1].mid}</span>
        <span class="${result}">${plusMinus}${Number(((forex[currency][1].mid - forex[currency][0].mid) / forex[currency][0].mid) * 100).toFixed(4)}%</span>
        `
        //console.log(forex[currency])
    }
    
    const allElementCurrencies = document.querySelectorAll(".currency")

    allElementCurrencies.forEach((currency, index) =>{
        const currencyName = document.querySelectorAll(".currency > div > span")

        currency.addEventListener("click", ()=>{
            
            //let currencyCalled = currencyName[index].textContent
            document.body.style.overflowY = "hidden"
            const element = document.querySelector(".overlay")
            element.style.display = "flex"
            let TEMP_CURR = BASE_CURR //will change based on user
            let convertTo = currencyName[index].textContent //will be based on the user

            element.innerHTML = `
            <div class="content-wrapper">
                <div class="closeX">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                </div>
                <div class="calculator-segment">
                    <div class="from-to-undersegment">
                        <div class="from-currency">
                            <span>From</span>
                            <div class="holder">
                                <img src="./images/${TEMP_CURR}.png" alt="">
                                <span>${TEMP_CURR}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>
                            </div>
                            
                            <div class="tempElement"></div>
                        </div>
                        
                        <svg class="swap-curr" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M438.6 150.6c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 96 32 96C14.3 96 0 110.3 0 128s14.3 32 32 32l306.7 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96zm-333.3 352c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 416 416 416c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0 41.4-41.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96z"/></svg>

                        <div class="to-currency">
                            <span>To</span>
                            <div class="holder">
                                <img src="/images/${convertTo}.png" alt="">
                                <span>${convertTo}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg>
                            </div>

                            <div class="tempElementToConvert"></div>
                        </div>
                    </div>

                    <div class="amount-converted">
                        <div class="amount-input">
                            <span>Amount</span>
                            <input type="number" value="1.00">
                        </div>

                        <div class="calculated">
                            <span> </span>
                            <span></span>
                        </div>
                    </div>
                </div>

                <div class="chart-segment">
                    <div class="days">
                        <span>3D</span>
                        <span>5D</span>
                        <span class="active">1W</span>
                        <span>1M</span>
                    </div>

                    <div class="chart-wrapper"></div>
                </div>
            </div>
            `
            const closeTab = document.querySelector(".closeX").addEventListener("click", ()=>{
                element.style.display = 'none'
                document.body.style.overflowY = "auto"
            })

            //when we call this function it will chnage some stuff on the dom
            const fromAmountElement = document.querySelector(".calculated span:nth-of-type(1)")
            const toAmountElement = document.querySelector(".calculated span:nth-of-type(2)")

            const input = document.querySelector(".amount-input input")
            input.addEventListener("input", ()=>{
                const inputValue = input.value
                if(inputValue){
                    if(inputValue.length > 8){
                        input.value = inputValue.slice(0, 8)
                        
                    }else {
                        fetchData(input.value)
                    }
                }else {
                    fetchData(1)
                }
            })


            
            //chart data function
            const fetchingData = async (timeStart, timeEnd) =>{
                //console.log(TEMP_CURR, convertTo, timeEnd, timeStart)
                const data = await fetch(`${BASE_URL}/v1/historic_rate/period/?from=${TEMP_CURR}&start_timestamp=${timeEnd}&end_timestamp=${timeStart}&to=${convertTo}&per_page=500&decimal_places=6`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Basic ${btoa(`${API_ID}:${API_KEY}`)}`
                    }
                })
                const toJSON = await data.json()
                
            
                const currencyData = []
                for(let i = 0; i < toJSON.to[convertTo].length; i++){
                    currencyData.push(toJSON.to[convertTo][i].mid)
                }
                //console.log(currencyData)
            
                const chartFunction = () =>{
                    const wrapper = document.querySelector(".chart-wrapper")
                    wrapper.innerHTML = ``
            
                    const canvas = document.createElement("canvas")
                    canvas.id = "canvas-chart"
                    wrapper.appendChild(canvas)
                    
                    const ctx = document.getElementById("canvas-chart").getContext("2d")
                    
                    const pluginBg = {
                        id: 'customCanvasBackgroundColor',
                        beforeDraw: (chart, args, options) => {
                        const {ctx} = chart;
                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = options.color
                        ctx.fillRect(0, 0, chart.width, chart.height);
                        ctx.restore();
                        
                        }
                    };
            
                    const formattedDates = []
                    for(let i = 0; i < datesArray.length; i++){
                        formattedDates.push(new Date(datesArray[i]).toLocaleDateString("default", {day: "numeric", month: "short"}))
                    }
                    formattedDates.reverse()
                    //console.log(formattedDates)

                    const tooltipLine = {
                        id: 'tooltipLine',
                        afterDatasetsDraw: chart => {
                            if(chart.tooltip._active && chart.tooltip._active.length){
                                const ctx = chart.ctx 
                                ctx.save()
            
                                const activePoint = chart.tooltip._active[0]
                                
                                ctx.beginPath()
                                //ctx.setLineDash([5, 7])
                                ctx.moveTo(activePoint.element.x, chart.chartArea.top) //come back here
                                ctx.lineTo(activePoint.element.x, chart.chartArea.bottom)
            
                                ctx.lineWidth = 2
                                ctx.strokeStyle = '#0058CC'
                                ctx.stroke()
                                ctx.restore()
            
                                //console.log(activePoint.element.options.backgroundColor = "red")
                                
                                //console.log(activePoint.element.x, activePoint.element.y)
            
                                //draw a circle
                                ctx.beginPath()
                                ctx.arc(activePoint.element.x, activePoint.element.y, 5, 0, 2 * Math.PI)
                                ctx.fillStyle = "#0058CC";
                                ctx.fill();
                                ctx.strokeStyle = "#0058CC";
                                ctx.lineWidth = 2;
                                ctx.stroke();
                                ctx.restore();
                            }
                        }
                    }

                    const newDates = datesArray.map((date) =>{
                        return new Date(date).toLocaleDateString("default", {day: "numeric", month: "short", year: "numeric"})
                    })
                    newDates.reverse()
                    
                    const chartData = {
                        labels: formattedDates,
                        datasets: [{
                            label: "",
                            data: currencyData,
                            borderWidth: 4,
                            borderColor: () => {
                                if(currencyData[0] > currencyData[currencyData.length - 1]){
                                    return "rgba(233, 0, 0, 1)"
                                }else {
                                    return "rgba(0, 210, 0, 1)"
                                }
                            },
                            pointBackgroundColor: "transparent",
                            pointBorderColor: "transparent",
                            borderCapStyle: 'round',
                            clip: {
                                left: false,
                                right: false,
                                top: false,
                                bottom: false
                            },
                            pointRadius: 5,
                            tension: 0.1,
                            fill: false,
                            backgroundColor: () => {
                                if(currencyData[0] > currencyData[currencyData.length - 1]){
                                    return "rgba(169, 0, 0, 0.7)"
                                }else {
                                    return "rgba(0, 110, 0, 0.7)"
                                }
                            },
                        }]
                    }
                    //config block
                    const config = {
                        type: "line",
                        data: chartData,  
                        options: {
                            aspectRatio: 7/4,
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    
                                    grid: {
                                        drawTicks: false,
                                        display: true,
                                        drawOnChartArea: true,
                                        color: "#DDDDDD"
                                    },
                                    border: {
                                        display: false,
                                        color: "#DDDDDD",
                                        dash: [5, 4]
                                    },
                                    ticks: {
                                        color: "#050505",
                                        maxTicksLimit: 10,
                                        padding: 10,
                                        align: "center",
                                        crossAlign: "center",
                                        font: {
                                            size: 13,
                                            weight: 400
                                        },
                                        stepSize: 0.001
                                    },
                                    position: "right"
                                },
                
                                x: {
                                    border: {
                                        display: true,
                                        dash: [3, 2],
                                        color: "#050505"
                                    },
                                    grid: {
                                        display: true,
                                        drawOnChartArea: false,
                                        drawTicks: true,
                                        color: "#050505",
                                    },
                
                                    ticks: {
                                        color: "#050505",
                                        maxTicksLimit: 5,
                                        padding: 5,
                                        align: "center",
                                        crossAlign: "near",
                                        font: {
                                            size: 13,
                                            weight: 400
                                        }
                                    }
                                },  
                            },
                            plugins: {
                                customCanvasBackgroundColor: {
                                    color: "#fafafa"
                                },
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    enabled: true,
                                    intersect: false,
                                    callbacks: {
                                        label: (ctx) => (`${TEMP_CURR}/${convertTo}: ${ctx.raw}`),
                                        title: (ctx) => (`Date: ${newDates[ctx[0].dataIndex]}`)
                                    },
                                    backgroundColor: "#ffffff",
                                    borderColor: "#DDDDDD",
                                    borderWidth: 2,
                                    displayColors: false,
                                    bodyFontColor: "#0058CC",
                                    titleColor: "#0058CC",
                                    bodyColor: "#050505",
                                    caretPadding: 10,
                                    caretSize: 7,
                                    titleFont: {
                                        size: 14
                                    },
                                    bodyFont: {
                                        size: 15
                                    },
                                    padding: 10,
                                },
                            },
                        
                        },
                        plugins: [pluginBg, tooltipLine] 
                    }
                    
                    let chart = new Chart(ctx, config)

                    //console.log(chart)
                }
                chartFunction()
            }
            
            
            const formattingDate = () =>{
                //starting date formatted
                let startYear = startDate.getFullYear()
                let startMonth = String(startDate.getMonth() + 1).padStart(2, "0")
                let startDay = String(startDate.getDate()).padStart(2, "0")
    
                //end date formatted
                let endYear = endDate.getFullYear()
                let endMonth = String(endDate.getMonth() + 1).padStart(2, "0")
                let endDay = String(endDate.getDate()).padStart(2, "0")
    
                let START_DATE_OFFICIAL = `${startYear}-${startMonth}-${startDay}`
                let END_DATE_OFFICIAL = `${endYear}-${endMonth}-${endDay}`

                return [START_DATE_OFFICIAL, END_DATE_OFFICIAL]
            }
            
            const dates = (param) =>{
                const today = new Date()
                const dateList = []
            
                for(let i = 0; i < param; i++){
                    const date = new Date(today)
                    date.setDate(today.getDate() - i)
                    dateList.push(date)
                }
            
                return dateList
            }
            //defaults, will change later
            let userChoice = '1W' 
            let datesArray = dates(8)
            let startDate = new Date(dates(8)[0])
            let endDate = new Date(dates(8)[dates(8).length - 1])
            
            const allElements = document.querySelectorAll(".chart-segment .days > span")
            
            const removeClasses = (element) =>{
                element.forEach((e) =>{
                    e.classList.remove("active")
                })
            }
            //event listener for changing charts
            allElements.forEach((element, index) =>{
                element.addEventListener("click", ()=>{
                    if(element.textContent !== userChoice){
                        userChoice = element.textContent
                        
                        //remove classes
                        removeClasses(allElements)
                        //add class
                        element.classList.add("active")

                        if(userChoice === '3D'){
                            startDate = new Date(dates(4)[0])
                            endDate = new Date(dates(4)[dates(4).length - 1])
                            datesArray = dates(4)
                            
                        }else if(userChoice === '5D'){
                            startDate = new Date(dates(6)[0])
                            endDate = new Date(dates(6)[dates(6).length - 1])
                            datesArray = dates(6)
                            
                        }else if(userChoice === '1W') {
                            startDate = new Date(dates(8)[0])
                            endDate = new Date(dates(8)[dates(8).length - 1])
                            datesArray = dates(8)
            
                        }else {
                            startDate = new Date(dates(31)[0])
                            endDate = new Date(dates(31)[dates(31).length - 1])
                            datesArray = dates(31)
                        }
            
                        //console.log(START_DATE_OFFICIAL, END_DATE_OFFICIAL)
            
                        fetchingData(formattingDate()[0], formattingDate()[1])
                    }
                })
            })
            
            //console.log(startDate, endDate)
            fetchingData(formattingDate()[0], formattingDate()[1])
            //end of function


            const fetchData = async (userInput) =>{
                const data = await fetch(`${BASE_URL}/v1/convert_from/?from=${TEMP_CURR}&to=${convertTo}&decimal_places=6&amount=${userInput}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Basic ${btoa(`${API_ID}:${API_KEY}`)}`
                    }
                })
                const toJson = await data.json()

                fromAmountElement.textContent = `${Intl.NumberFormat("en-US", "decimal").format(userInput)} ${TEMP_CURR} =`
                toAmountElement.textContent = `${Intl.NumberFormat("en-US", {style: "decimal", maximumFractionDigits: 6, minimumFractionDigits: 6}).format(toJson.to[0].mid)} ${convertTo}`

                const fromCurrencyImg = document.querySelector(".from-currency > div > img").src = `./images/${TEMP_CURR}.png`
                const toCurrencyImg = document.querySelector(".to-currency > div > img").src = `./images/${convertTo}.png`

                const toCurrencyText = document.querySelector(".from-currency > div > span").textContent = TEMP_CURR
                const fromCurrencyText = document.querySelector(".to-currency > div > span").textContent = convertTo

                //console.log(startDate, endDate)
                
            }
            fetchData(1)

            const swapCurrencies = document.querySelector(".swap-curr")
            swapCurrencies.addEventListener("click", ()=>{
                [TEMP_CURR, convertTo] = [convertTo, TEMP_CURR]

                fetchData(input.value)
                fetchingData(formattingDate()[0], formattingDate()[1])
            })

            //final functional thing to do is letting the user click on one of the elements and being able to change the converting currency
            //eg user wants to change the base currency he would click the left element and get a dropdown menu
            //from there he can simply click the currency and the data will be displayed
            const fromCurrency = document.querySelector(".from-currency > div")
            const toCurrency = document.querySelector(".to-currency > div")

            const tempElement = document.querySelector(".tempElement")
            tempElement.innerHTML = ``

            const tempElement2 = document.querySelector(".tempElementToConvert")
            tempElement2.innerHTML = ``

            let visible = false
            fromCurrency.addEventListener("click", (e) =>{
                if(visible){
                    visible = false
                    return
                }
                
                visible = true
                const tempElement = document.querySelector(".tempElement")
                tempElement.innerHTML = ``

                visibleConvert = false 
                tempElement2.style.display = "none"

                for(let i = 0; i < RAWsymbols.length; i++){
                    const tempChildCurrencies = document.createElement("div")
                    tempElement.appendChild(tempChildCurrencies)
                    tempChildCurrencies.innerHTML = `
                    <img src="./images/${RAWsymbols[i].symbol}.png"/>
                    <span>${RAWsymbols[i].symbol}</span>
                    `
                }
                
                let elementActive = false
                const functionForDropdownActivation = () =>{
                    if(!elementActive){
                        tempElement.style.display = 'flex'
                    }else{
                        tempElement.style.display = 'none'
                        
                    }
                    
                    elementActive = !elementActive
                    e.stopImmediatePropagation()
                }
                functionForDropdownActivation()
                
                const clickAnywhereElse = () =>{
                    if(elementActive){
                        visible = false
                        elementActive = false
                        tempElement.style.display = 'none'
                        //console.log("Should hide")
                    }
                }

                //user changes currency
                const allDropdownElementCurrencies = document.querySelectorAll(".tempElement > div")
                allDropdownElementCurrencies.forEach((curr, index) =>{
                    curr.addEventListener("click", ()=>{
                        //e.stopPropagation()
                        tempElement.style.display = "none"
                        visible = false
                        const allSpan = document.querySelectorAll(".tempElement > div > span")

                        //console.log(allSpan[index].textContent)
                        TEMP_CURR = allSpan[index].textContent
                        fetchData(input.value)
                        fetchingData(formattingDate()[0], formattingDate()[1])
                    })
                })

                window.addEventListener("click", clickAnywhereElse)
            })

            let visibleConvert = false
            toCurrency.addEventListener("click", (e)=>{
                if(visibleConvert){
                    visibleConvert = false
                    return
                }
                visibleConvert = true

                visible = false
                tempElement.style.display = "none"

                const tempElement2 = document.querySelector(".tempElementToConvert")
                tempElement2.innerHTML = ``
                

                for(let i = 0; i < RAWsymbols.length; i++){
                    const tempChildCurrencies = document.createElement("div")
                    tempElement2.appendChild(tempChildCurrencies)
                    tempChildCurrencies.innerHTML = `
                    <img src="./images/${RAWsymbols[i].symbol}.png"/>
                    <span>${RAWsymbols[i].symbol}</span>
                    `
                }
                
                let elementActive = false
                const functionForDropdownActivation = () =>{
                    if(!elementActive){
                        tempElement2.style.display = 'flex'
                    }else{
                        tempElement2.style.display = 'none'
                    }
                    
                    elementActive = !elementActive
                    e.stopPropagation()
                }
                functionForDropdownActivation()
                
                const clickAnywhereElse = () =>{
                    if(elementActive){
                        visibleConvert = false
                        elementActive = false
                        tempElement2.style.display = 'none'
                    }
                }

                //user changes currency
                const allDropdownElementCurrencies = document.querySelectorAll(".tempElementToConvert > div")
                allDropdownElementCurrencies.forEach((curr, index) =>{
                    curr.addEventListener("click", ()=>{
                        visibleConvert = false 
                        e.stopPropagation()
                        tempElement2.style.display = "none"
                        const allSpan = document.querySelectorAll(".tempElementToConvert > div > span")

                        //console.log(allSpan[index].textContent)
                        convertTo = allSpan[index].textContent
                        fetchData(input.value)
                        fetchingData(formattingDate()[0], formattingDate()[1])
                    })
                })

                document.body.addEventListener("click", clickAnywhereElse)
            })
        })
    })
}



//app is at 50% done
//next to add is when user clicks on a currency, he would get a whole new screen, i still have to think about the design



//the reserved text
const reservedText = document.querySelector(".rights-reserved").textContent = `© ${new Date().getFullYear()} Sarvanski Foreign Exchange. All Rights Reserved`