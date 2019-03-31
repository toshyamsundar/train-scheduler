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

  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectURL) {
        $("#welcome-message").text("Welcome, " + authResult.user.displayName);
        $("#welcome-message").show();
        $("#signout").show();
        $("#signedin-section").show();
        $("#firebaseui-auth-container").hide();
        $("#heading").show();
        return false;
      }
    },
    signInFlow: "popup",
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID]
  };

  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  ui.start("#firebaseui-auth-container", uiConfig);

  var database = firebase.database();
  var databaseRef = database.ref("/train-scheduler/train-details");
  // var trainDetailsCollection = [];
  // var counter = 0;

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

  $("#signout").on("click", function() {
    firebase
      .auth()
      .signOut()
      .then(function() {
        console.log("Signed Out!");
      });

    $("#welcome-message").text("");
    $("#welcome-message").hide();
    $("#signout").hide();
    $("#signedin-section").hide();
    $("#firebaseui-auth-container").show();
    ui.start("#firebaseui-auth-container", uiConfig);
  });

  $("#btn-add").on("click", function(event) {
    trainDetails.trainName = $("#train-name")
      .val()
      .trim();
    trainDetails.trainDestination = $("#train-destination")
      .val()
      .trim();
    trainDetails.trainFirstTime = $("#train-first").val();
    // console.log("trainFirstName: " + trainDetails.trainFirstTime);
    trainDetails.trainFrequency = parseInt($("#train-frequency").val());
    // console.log(trainDetails);
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
    // var tdUpdateButton = $("<td>");
    var tdDeleteButton = $("<td>");
    // var updateButton = $("<button>");
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

    // $(updateButton).text("Edit");
    // $(updateButton).attr("data-key", trainSnapshot.key);
    // $(updateButton).addClass("btn btn-success py-1 btn-edit");
    $(deleteButton).text("Remove");
    $(deleteButton).attr("data-key", trainSnapshot.key);
    $(deleteButton).addClass("btn btn-danger py-1 btn-remove");

    // $(tdUpdateButton).append(updateButton);
    $(tdDeleteButton).append(deleteButton);

    $(trElem).attr("data-key", trainSnapshot.key);
    // $(trElem).attr("data-index", counter);

    $(trElem).append(tdTrainName, tdTrainDestination, tdTrainFrequency, tdNextArrival, tdMinutesAway, tdDeleteButton);

    $("#train-details").append(trElem);

    // trainDetails.trainName = ts.TrainName;
    // trainDetails.trainDestination = ts.TrainDestination;
    // trainDetails.trainFirstTime = ts.TrainFirstTime;
    // trainDetails.trainFrequency = ts.TrainFrequency;

    // trainDetailsCollection.push(trainDetails);
    // counter++;
  };

  $(document).on("click", ".btn-remove", function() {
    snapshotKey = $(this).attr("data-key");
    // var dataIndex = $(this)
    //   .parents("tr")
    //   .attr("data-index");

    // console.log("Key: " + snapshotKey);

    databaseRef
      .child(snapshotKey)
      .remove()
      .then(function() {
        $('#train-details tr[data-key="' + snapshotKey + '"]').remove();
      });

    // trainDetailsCollection.splice(dataIndex, 1);
  });

  // $(document).on("click", ".btn-edit", function(event) {
  //   var snapshotKey = $(this).attr("data-key");
  //   console.log("Key: " + snapshotKey);
  //   event.preventDefault();
  //   var snapshot = databaseRef.child(snapshotKey);
  //   console.log("Inside update");
  //   console.log(snapshot.TrainName + " " + snapshot.TrainDestination);
  //   $("#train-name").val(updateSnapshot.TrainName);
  //   $("#train-destination").val(updateSnapshot.TrainDestination);
  //   $("#train-first").val(updateSnapshot.TrainFirstTime);
  //   $("#train-frequency").val(updateSnapshot.TrainFrequency);
  // });

  databaseRef.on("child_added", function(trainSnapshot) {
    displayTrainSchedule(trainSnapshot);
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var currentUser = firebase.auth().currentUser;
      $("#firebaseui-auth-container").hide();
      $("#signedin-section").show();
      $("#welcome-message").text("Welcome, " + currentUser.displayName);
      $("#welcome-message").show();
      $("#signout").show();
      $("#heading").show();
    } else {
      $("#firebaseui-auth-container").show();
      $("#signedin-section").hide();
      $("#welcome-message").text("");
      $("#welcome-message").hide();
      $("#signout").hide();
      $("#heading").hide();
    }
  });
});
