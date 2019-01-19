const defaultQuestionTime = 10;

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

  let splashScreen = function() {
    // this is the screen that will be displayed to the user when they open the webpage
    // create a snazzy title
    //<div class="game-title mb-2">Online Bar Trivia!</div>
    //<div class="play-button text-center mh-auto mb-2">Play!</div>
    let myTitle = $("<div>")
      .addClass("game-title mb-2")
      .text("Welcome to Online Bar Trivia!");
    // create a snazzy play button
    let playBtn = $("<div>")
      .addClass("play-button text-center mh-auto mb-2")
      .text("Play");
    playBtn.on("click", resetGame);

    $(".game-container").append(myTitle);
    $(".game-container").append(playBtn);
  };

  // reset the game function
  let resetGame = function() {
    // this function will clear the game-container
    $(".game-container").empty();

    // initialize the game scope variables
    questionNumber = 0;
    correctTally = 0;
    incorrectTally = 0;
    questionTime = defaultQuestionTime;

    // Tell the user that there will be 5 questions, 15 seconds to answer each.
    let myMessage = $("<div>")
      .addClass("game-instructions mh-auto mb-2")
      .text(
        `You will be asked 5 questions. You have ${questionTime} seconds to answer each question. Trivia ahead...`
      );
    $(".game-container").append(myMessage);

    // populate the questions array from the questionArchive
    $.ajax({
      url: "https://opentdb.com/api.php?amount=5&type=multiple"
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
      setTimeout(triviaGame, 3000);
    });
  };

  let triviaGame = function() {
    // clear the game div
    $(".game-container").empty();

    questionNumber++;
    // generate the question
    currentQuestion = generateQuestion();
    if (currentQuestion != null) {
      //console.log(currentQuestion.question);

      // have a question heading that lists the question number
      $(".game-container").append(
        $("<div>")
          .addClass("game-instructions mh-auto mb-2")
          .text(`Question Number ${questionNumber}!`)
      );
      // now write the question
      $(".game-container").append(
        $("<div>")
          .addClass("game-question mh-auto mb-2")
          .html(currentQuestion.question)
      );

      // create answers

      let correctIndex = Math.floor(Math.random() * 4);

      // TODO: add true/false functionality...there will only be 2 total answers
      for (let i = 0; i < 4; i++) {
        let myAnswer = $("<div>").addClass("answer answer-hover mh-auto mb-2");
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
        $(".game-container").append(myAnswer);
      }

      questionTime = defaultQuestionTime;
      $(".game-container").append(
        $("<div>")
          .addClass("game-timer mh-auto mb-2")
          .text(`Time: ${questionTime}`)
      );

      // add an on click event for the class answers
      $(".answer").on("click", questionSubmitted);

      // create the timer

      startTimer();
    } else {
      // out of questions
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

  let countDown = function() {
    questionTime--;
    //console.log("counting down " + questionTime);
    $(".game-timer").text(`Time: ${questionTime}`);

    if (questionTime <= 0) {
      // no more clicking
      $(".answer").off("click");
      stopTimer();

      // out of time wrong answer baby
      $(".game-timer").text(`Time's Up!`);
      $(".game-timer").addClass("incorrect");

      // I need to compare all the answers to the correct answer, then change background colors based on correct/incorrect
      let answers = $(".game-container").children(".answer");
      for (let i = 0; i < answers.length; i++) {
        $(answers[i]).removeClass("answer-hover");
        if ($(answers[i]).html() == currentQuestion.correct_answer) {
          $(answers[i]).addClass("correct");
        } else {
          $(answers[i]).addClass("incorrect");
        }
      }
      // user got the wrong answer...by running out of time
      wrongAnswer();
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

    let answers = $(".game-container").children(".answer");
    for (let i = 0; i < answers.length; i++) {
      $(answers[i]).removeClass("answer-hover");
      if ($(answers[i]).html() == currentQuestion.correct_answer) {
        $(answers[i]).addClass("correct");
      } else {
        $(answers[i]).addClass("incorrect");
      }
    }

    // get the text from the answer
    if ($(this).html() == currentQuestion.correct_answer) {
      $(".game-instructions").text("That's Correct!");
      correctAnswer();
    } else {
      $(".game-instructions").text("WRONG!");
      wrongAnswer();
    }
  };

  let wrongAnswer = function() {
    // stop the timer
    incorrectTally++;

    // go to the next question after 3000 milliseconds
    nextQuestion();
  };

  let correctAnswer = function() {
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

    $(".game-container").append();

    $(".game-container").append(
      $("<div>")
        .addClass("game-instructions mh-auto mb-2")
        .html(
          `Your Score<br>Correct: ${correctTally} <br>Incorrect: ${incorrectTally}`
        )
    );

    // add the fun play button back
    $(".game-container").append(
      $("<div>")
        .addClass("play-button text-center mh-auto mb-2")
        .text("Play")
        .on("click", resetGame)
    );
  };

  //==============================================================================================//
  // this is where I put the code that runs when the document loads...its on the bottom so all my
  // functions and stuff are available
  // console.log("hello world");
  splashScreen();
});
