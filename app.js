const express = require("express");
const app = express();
const axios = require("axios");
const port = 3000;
const lodash = require("lodash");
const bodyParser = require("body-parser");

app.set("view engine","ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

let notification;
let itWorked;
let allTickets = [];
let ticketDetails;
let baseUrl = "https://sujoy-support.freshdesk.com"
let authorizationToken = "Basic TlZmemJRQ09veHlid3lDZ0wwS1A6WA=="


// ----------------INDEX--------------------------

app.get("/", function(req, res){
    res.render("index");
})


// ---------------CREATE TICKET-----------------------


app.get("/createTicket", function(req, res){

    itWorked = null;
    notification = null;
    res.render("createTicket", {itWorked: itWorked, notification:notification});
})


app.post("/createTicket", function(req, res){
    const userName = req.body.userName;
    const userEmail = req.body.userEmail;
    const userDate = req.body.userDate;
    const userDescription = req.body.userDescription;
    const formButton = req.body.formButton;


    if (formButton === "submit"){
        // console.log(`${userName}, ${userEmail}, ${userDate}, ${userDescription}`);

        let url = `${baseUrl}/api/v2/tickets`;
        
        let ticketData = {
    
                description: `${userDescription}, The date is ${userDate}`,
                subject: userDescription,
                email: userEmail,
                priority: 1,
                status: 2
            
        
        };

        let headers = {
            Authorization: authorizationToken,
            "Content-Type": "application/json"
        };

        axios.post(url,ticketData,{ headers })
        .then(function(response){
            // console.log(res);
            // console.log("BREAK");
            // console.log(response);

            if(response.status === 201){
                let ticketId = response.data.id;
                itWorked = true;
                notification = `Your ticket has been created. Ticket No: ${ticketId}`
                res.render("createTicket", {itWorked:itWorked, notification:notification});
            }
        })
        .catch(function(error){
            // console.log(error);
            // console.log("Technical issue");
            itWorked = false;
            notification = `Technical Error. Please try again later.`;
            res.render("createTicket", {itWorked: itWorked, notification:notification});
        })
    }
    else{
        notification = null;
        itWorked = null;
        res.render("createTicket", {notification:notification, itWorked:itWorked});
    }
})


// ------------------VIEW TICKET--------------------

app.get("/viewTicket", function(req, res){

    allTickets = [];
    res.render("viewTicket", {allTickets:allTickets});
})


app.post("/findTickets", function(req,res){

    let userEmail = req.body.userEmail;
    let formButton = req.body.formButton;

    if(formButton === "submit"){

        let url = `${baseUrl}/api/v2/tickets?email=${userEmail}`;

        let headers = {
            Authorization: authorizationToken,
        };

        axios.get(url,{ headers })
        .then(function(response){
            // console.log(response.data);
            let theData = response.data;
            for(let i = 0; i < theData.length; i++){
                let subject = theData[i].subject;
                let id = theData[i].id;
                let created = theData[i].created_at;
                
                allTickets.push({ticketId:id, ticketSub: subject, ticketCreated: created});
            }

            console.log(allTickets);

            res.render("viewTicket", {allTickets: allTickets});
        })
        .catch(function(error){
            console.log("THERE'S AN ERROR");
            console.log(error);
        })

    }
    else{
        allTickets = []
        res.render("viewTicket",{allTickets:allTickets});
    }
})

// ------------------TICKET DETAILs--------------------

app.get("/ticketDetails/:ticketId", function(req, res){
    
    let ticketId = req.params.ticketId;
    
    let url = `${baseUrl}/api/v2/tickets/${ticketId}`;

    let headers = {
        Authorization : authorizationToken
    };

    axios.get(url, { headers })
    .then(function(response){
        // console.log(response.data.subject);
        ticketDetails = {
            ticketSubject: response.data.subject,
            ticketId: response.data.id,
            ticketDescription: response.data.description_text,
            ticketCreateAt: response.data.created_at
        }

        console.log(ticketDetails);
        
        res.render("ticketDetails", {ticketDetails:ticketDetails});


    })
    .catch(function(error){
        ticketDetails= {};
        res.render("ticketDetails", {ticketDetails:ticketDetails});
    })

})


// ------------------LISTEN--------------------


app.listen(port, function(){
    console.log(`Port number ${port} fired up`);
})

