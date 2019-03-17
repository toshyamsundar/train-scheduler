$(document).ready(function() {
  var config = {
    apiKey: "AIzaSyCmwj7f3F5MrhNkfsnTgVp81pHeg14QSGE",
    authDomain: "fir-uoft-shyam.firebaseapp.com",
    databaseURL: "https://fir-uoft-shyam.firebaseio.com",
    projectId: "fir-uoft-shyam",
    storageBucket: "fir-uoft-shyam.appspot.com",
    messagingSenderId: "1062246307700"
  };

  firebase.initializeApp(config);

  var database = firebase.database();

  var trainDetails = {
    trainName: "",
    trainDestination: "",
    trainFirstTime: "",
    trainFrequency: 0
  };

  var addTrainDetails = trainDetails => {
    database.ref("/train-scheduler/train-details").push({
      TrainName: trainDetails.trainName,
      TrainDestination: trainDetails.trainDestination,
      TrainFirstTime: trainDetails.trainFirstTime,
      TrainFrequency: trainDetails.trainFrequency
    });
  };

  $("#btn-add").on("click", function(event) {
    var currDate = moment().format("YYYY-MM-DD");
    trainDetails.trainName = $("#train-name")
      .val()
      .trim();
    trainDetails.trainDestination = $("#train-destination")
      .val()
      .trim();
    trainDetails.trainFirstTime = currDate + " " + $("#train-first").val();
    console.log("trainFirstName: " + trainDetails.trainFirstTime);
    trainDetails.trainFrequency = $("#train-frequency").val();
    console.log(trainDetails);
    addTrainDetails(trainDetails);
  });

  database.ref("/train-scheduler/train-details").on("child_added", function(trainSnapshot) {
    var ts = trainSnapshot.val();

    var trElem = $("<tr>");
    var tdTrainName = $("<td>");
    var tdTrainDestination = $("<td>");
    var tdTrainFirstTime = $("<td>");
    var tdTrainFrequency = $("<td>");
    var tdNextArrival = $("<td>");
    var tdMinutesAway = $("<td>");
    var currentTime = moment();
    console.log("Current: " + currentTime);
    console.log("Train First Time: " + ts.TrainFirstTime);
    var diffTime = moment.duration(moment(currentTime).diff(ts.TrainFirstTime)).asMinutes();
    console.log("Diff Time: " + diffTime);
    var remainderTime = diffTime % ts.TrainFrequency;
    console.log("Remainder: " + remainderTime);
    var minutesAway = ts.TrainFrequency - remainderTime;
    console.log("minutesAway: " + minutesAway);
    var nextArrival = moment().add(minutesAway);
    console.log("next: " + moment(nextArrival).format("hh:mm"));

    tdTrainName.text(ts.TrainName);
    tdTrainDestination.text(ts.TrainDestination);
    tdTrainFrequency.text(ts.TrainFrequency);
    tdNextArrival.text(nextArrival);
    tdMinutesAway.text(minutesAway);

    $(trElem).append(tdTrainName, tdTrainDestination, tdTrainFrequency, tdNextArrival, tdMinutesAway);
    $("#train-details").append(trElem);
  });
});
