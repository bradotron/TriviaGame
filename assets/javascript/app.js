const defaultQuestionTime = 15;

$(function() {
  //document ready
  //$("#test-fade").css("opacity", "0");

  // create a questions array in this scope to store the questions for each game
  let questions = [];
  let questionNumber = 0;
  let correctTally = 0;
  let incorrectTally = 0;
  let questionTime = defaultQuestionTime;
  let currentQuestion = {};
  let myTimer;

  // this function creates a reset button and appends it to the #game div
  let createResetButton = function() {
    let resetButton = $("<button>");
    $(resetButton).text("Reset");
    $(resetButton).on("click", resetGame);
    $("#game").append(resetButton);
  };

  // reset the game function
  let resetGame = function() {
    // this function will clear the game-container
    $("#game").empty();

    // initialize the game scope variables
    questionNumber = 0;
    correctTally = 0;
    incorrectTally = 0;
    questionTime = defaultQuestionTime;

    // then add a title splash that says Let's Play Trivia!!! or something neat
    $("#game").append("<h1>Welcome to Trivialandgame!!!</h1>");

    // populate the questions array from the questionArchive
    $.ajax({
      url: "https://opentdb.com/api.php?amount=10&type=multiple"
    }).then(function(response) {
      questions = response.results;
      // here's what each result has as key:value
      // category: "General Knowledge"
      // correct_answer: "Bullfighting"
      // difficulty: "medium"
      // incorrect_answers: (3) ["Fiestas", "Flamenco", "Mariachi"]
      // question: "What did the Spanish autonomous community of Catalonia ban in 2010, that took effect in 2012?"
      // type: "multiple"

      // tell the user what the game is: that they will have XX seconds to answer each question
      // and it's Elon Musk trivia
      $("#game").append(
        $("<p>").html(
          "You will have " +
            questionTime +
            " seconds to answer a question. The questions are all multiple choice. I hope you have brushed up on your random knowledge!"
        )
      );
      $("#game").append("<p>Press Play to Begin!</p>");

      // add a play button that starts the game
      $("#game").append(
        $("<button>")
          .text("Play!")
          .on("click", triviaGame)
      );
    });

    //initializeQuestions();
  };

  let triviaGame = function() {
    // clear the game div
    $("#game").empty();

    questionNumber++;
    if (questionNumber <= 5) {
      // max questions is 5

      // generate the question
      currentQuestion = generateQuestion();
      if (currentQuestion != null) {
        //console.log(currentQuestion.question);
        // populate the div with the question and possible answers
        $("#game").append(generateQuestionHtml(currentQuestion));

        // add an on click event for the class answers
        $(".answer").on("click", questionSubmitted);

        // create the timer
        questionTime = defaultQuestionTime;
        startTimer();
      } else {
        // out of questions
        gameOver();
      }
    } else {
      // game over
      gameOver();
    }
  };

  // this function returns a random question from the questions array; returns null if questions is empty
  let generateQuestion = function() {
    if (questions.length > 0) {
      return questions.splice(
        Math.floor(Math.random() * questions.length),
        1
      )[0]; // splice returns an array. I'm splicing 1 item, so i want the 0th index of that array
    } else {
      return null;
    }
  };

  // generate the question form
  let generateQuestionHtml = function(qtn) {
    let myDiv = $("<div>");

    // have a question heading that lists the question number
    myDiv.append($("<h1>").text("Question " + questionNumber + "!"));
    // now write the question
    myDiv.append($("<p>").html(qtn.question));

    // create answers
    let correctIndex = Math.floor(Math.random() * 4);
    for (let i = 0; i < 4; i++) {
      let myAnswer = $("<div>").addClass("answer");
      if (i == correctIndex) {
        $(myAnswer).html(currentQuestion.correct_answer);
      } else {
        $(myAnswer).html(
          currentQuestion.incorrect_answers.splice(
            Math.floor(
              Math.random() * currentQuestion.incorrect_answers.length
            ),
            1
          )[0]
        );
      }
      myDiv.append(myAnswer);
    }

    return myDiv;
  };

  let countDown = function() {
    questionTime--;
    //console.log("counting down " + questionTime);

    if (questionTime <= 0) {
      // out of time wrong answer baby
      // TODO: Tell the user that they ran out of time

      wrongAnswer();

      // stop the timer
      stopTimer();
    }
  };

  let startTimer = function() {
    myTimer = setInterval(countDown, 1000);
  };

  let stopTimer = function() {
    clearInterval(myTimer);
  };

  let questionSubmitted = function(event) {
    // remove the click event from .answer (you only get one shot)
    $(".answer").off("click");
    
    // stop the timer
    stopTimer();

    // TODO: highlight the correct answer in green
    // TODO: highlight the wrong answers in red

    // get the text from the answer
    if ($(this).html() == currentQuestion.correct_answer) {
      correctAnswer();
    } else {
      wrongAnswer();
    }

    // TODO: display a message of correct/false that fades after a few seconds
  };

  let wrongAnswer = function() {
    // stop the timer
    stopTimer();

    incorrectTally++;

    // go to the next question after 3000 milliseconds
    nextQuestion();
  };

  let correctAnswer = function() {
    // stop the timer
    stopTimer();

    correctTally++;
    // go to the next question after 3000 milliseconds
    nextQuestion();
  };

  let nextQuestion = function() {
    setTimeout(triviaGame, 3000);
  };

  let gameOver = function() {
    // stop the timer
    stopTimer();

    // TODO: show the user the score
    console.log("Correct: " + correctTally);
    console.log("Wrong: " + incorrectTally);
    // add a reset button
    createResetButton();
  };

  //==============================================================================================//
  // this is where I put the code that runs when the document loads...its on the bottom so all my
  // functions and stuff are available
  // console.log("hello world");
  resetGame();
});
