var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function(){

  $(".list-group").on("blur", "textarea", function(){
    //get textareas current value/text
    var text=$(this)
      .var()
      .trim();

      //get parent ul's id attribute
    var status = $(this)
      .closet(".list-group")
      .attr("id")
      .replace("list-", "");

      //get the tracks position in the list of other li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();
      //tasks is an object. tasks[status] returns an array (e.g., toDo). 
      //tasks[status][index] returns the object at the given index in the array.
      //tasks[status][index].text returns the text property of the object 
      //at the given index.

    tasks[status][index].text=text;

    saveTasks();

    // recreate p element
    var taskP = $("<p>")
      .addClass("m-1")
      .text(text);


    // replace textarea with p element
    $(this).replaceWith(taskP);
        
  });
  
  var text = $(this)
    .text()
    .trim();

    var textInput = $("<textarea>")
      .addClass("form-control")
      .val(text);

      $(this).replaceWith(textInput);

        textInput.trigger("focus");
    
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

//due date was clicked: will let us edit the due date
$(".list-group").on("click", "span", function(){
  //get current text
  var date = $(this).text().trim();

    //create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

    //swap out elemetns
  $(this).replaceWith(dateInput);

    //enable jquerry ui datepicker
  dateInput.datepicker({
    minDate: 1
  });

  //automatically bring up the calendar
  dateInput.trigger("focus");
});

// value of due date was changed: will revert due date text back to orginal state
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});


//adding drag and drop to tasks created
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  
  scroll: false,

  tolerance: "pointer",
  //will create a copy of the dragged element and move the copy instead of the original
  helper: "clone",
  //The activate and deactivate events trigger once for all 
  //connected lists as soon as dragging starts and stops.
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  //The over and out events trigger when a dragged item enters or leaves a connected list.
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  //The update event triggers when the contents of a list have changed
  update: function(event) {

    //array to store the task data in
    var tempArr = [];

    //loop over current set of children in sortable list
    //updated:each() method will run a callback function for every item/element in the array.
    // It's another form of looping, except that a function is now called on each loop 
    //iteration.
    $(this).cildren().each(function(){

      // trim down list's ID to match object property
      var arrName = $(this)
      .attr("id")
      .replace("list-", "");

      // update array on tasks object and save
      tasks[arrName] = tempArr;
      saveTasks();

      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

        //add task data to the tenp array as an object
      tempArr.push({
        text: text, 
        date: date
      });

    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },

});




//adds ability to drop objects to delete
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    //will delete object
    ui.draggable.remove();

  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }

  
});

//added a calender to pick dates from 
$("#modalDueDate").datepicker({
  minDate: 1
});