 // Initialize Firebase
 var config = {
    apiKey: "AIzaSyC8lgmzsgjzIxvW7lBxjDdKtU23fT8lY2U",
    authDomain: "train-schedule-d6c2f.firebaseapp.com",
    databaseURL: "https://train-schedule-d6c2f.firebaseio.com",
    projectId: "train-schedule-d6c2f",
    storageBucket: "train-schedule-d6c2f.appspot.com",
    messagingSenderId: "83452249194"
  };
firebase.initializeApp(config);

var database = firebase.database();

database.ref().once("value", function(snapshot) {
    if(!snapshot.child("train")) {
        database.ref().push({train:""});
    }
})

$("#add-button").on("click", function(event) { 
    event.preventDefault();

    var name = $("#name-input").val().trim();
    var dest = $("#dest-input").val().trim()
    var startTime = $("#start-input").val();
    var freq = $("#freq-input").val();

    startTime = moment(startTime,"HH:mm").format("HH:mm");

    database.ref("/train").push({
            Name: name,
            Dest: dest,
            Start: startTime,
            Freq: freq,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
})

function calculateWaitTime(startTime,frequency) {
    var now = moment().format("HH:mm"); 
    var start = moment(startTime,"HH:mm");
    start = moment(start).subtract(1,'days').format("HH:mm");
    console.log("now",now);
    console.log("start",start);
    var different = moment(now,"HH:mm").diff(moment(start,"HH:mm"));
    different = moment.duration(different).as('minutes')
    console.log("different",different);
    
    return frequency-(different % frequency);
}

function calculateNextArrival(waitTime) {
    return moment().add(waitTime,'m').format("HH:mm")
}

database.ref("/train").orderByChild("dateAdded").on("child_added", function(childSnapshot) {
    var name = childSnapshot.val().Name
    var dest = childSnapshot.val().Dest
    var startTime = childSnapshot.val().Start
    var freq = childSnapshot.val().Freq
    
    var waitTime = calculateWaitTime(startTime,freq)
    var nextArrival = calculateNextArrival(waitTime)


    //Updating the table
    var newRow = $("<tr>");//Create new Table Row
    newRow.append("<td>"+name+"</td>")//Name
    newRow.append("<td>"+dest+"</td>")//Destination
    newRow.append("<td>"+nextArrival+"</td>")//next Arrival Time
    newRow.append("<td>"+waitTime+" minutes </td>")//next wait time
    newRow.append("<td>"+freq+" minutes </td>")//frequency
    $("#train-table").append(newRow)//Append to the table

}, function(errors) {//Errors catching
    console.log("Error:",errors.code)
})