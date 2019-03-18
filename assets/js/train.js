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
  var databaseRef = database.ref("/train-scheduler/train-details");

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
    trainDetails.trainFirstTime = $("#train-first").val();
    console.log("trainFirstName: " + trainDetails.trainFirstTime);
    trainDetails.trainFrequency = parseInt($("#train-frequency").val());
    console.log(trainDetails);
    addTrainDetails(trainDetails);
  });

  var displayTrainSchedule = trainSnapshot => {
    var ts = trainSnapshot.val();

    var trElem = $("<tr>");
    var tdTrainName = $("<td>");
    var tdTrainDestination = $("<td>");
    var tdTrainFrequency = $("<td>");
    var tdNextArrival = $("<td>");
    var tdMinutesAway = $("<td>");
    var tdUpdateButton = $("<td>");
    var tdDeleteButton = $("<td>");
    var updateButton = $("<button>");
    var deleteButton = $("<button>");

    // console.log("Train First Time: " + moment(ts.TrainFirstTime, "HH:mm"));
    // console.log("Moment: " + moment());

    var diffTime = moment().diff(moment(ts.TrainFirstTime, "HH:mm"), "minutes");
    // console.log("Diff Time: " + diffTime);
    var timeRemaining = diffTime % ts.TrainFrequency;
    // console.log("Remainder: " + timeRemaining);
    var minutesAway = ts.TrainFrequency - timeRemaining;
    // console.log("minutesAway: " + minutesAway);
    var nextArrival = moment().add(minutesAway, "minutes");
    // console.log("next: " + moment(nextArrival).format("YYYY-MM-DD HH:mm"));

    tdTrainName.text(ts.TrainName);
    tdTrainDestination.text(ts.TrainDestination);
    tdTrainFrequency.text(ts.TrainFrequency);
    tdNextArrival.text(moment(nextArrival).format("YYYY-MM-DD HH:mm"));
    tdMinutesAway.text(minutesAway);

    $(updateButton).text("Edit");
    $(updateButton).attr("data-key", trainSnapshot.key);
    $(updateButton).addClass("btn btn-success py-1 btn-edit");
    $(deleteButton).text("Remove");
    $(deleteButton).attr("data-key", trainSnapshot.key);
    $(deleteButton).addClass("btn btn-danger py-1 btn-remove");

    $(tdUpdateButton).append(updateButton);
    $(tdDeleteButton).append(deleteButton);

    $(trElem).attr("data-key", trainSnapshot.key);

    $(trElem).append(
      tdTrainName,
      tdTrainDestination,
      tdTrainFrequency,
      tdNextArrival,
      tdMinutesAway,
      tdUpdateButton,
      tdDeleteButton
    );

    $("#train-details").append(trElem);

    // var timeInterval = setInterval(function() {
    //   $("#train-details").empty();
    //   displayTrainSchedule(trainSnapshot);
    // }, 60000);
  };

  $(document).on("click", ".btn-remove", function() {
    var snapshotKey = $(this).attr("data-key");
    console.log("Key: " + snapshotKey);
    databaseRef
      .child(snapshotKey)
      .remove()
      .then(function() {
        $('#train-details tr[data-key="' + snapshotKey + '"]').remove();
      });
  });

  databaseRef.on("child_added", function(trainSnapshot) {
    console.log(trainSnapshot.val());
    console.log(trainSnapshot.key);
    displayTrainSchedule(trainSnapshot);
  });
});
