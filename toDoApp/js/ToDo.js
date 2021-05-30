import ls from './ls.js'


class Todos {

  
  // setup event listeners and class properties for toDo class
  constructor() {
    this.storage = new ls();
    let taskList = document.getElementById('taskList');

    this.setButtonClassListeners();
    // show all tasks at start up
    let currentFilter = 'all';
  }

  setButtonClassListeners = () => {

    let newTask = document.getElementById('newTask');
    newTask.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') {
        this.newTodo();
      }
    })

    let addTask = document.getElementById('addTask');
    addTask.addEventListener('click', () => { this.newTodo() });
    let displayAll = document.getElementById('displayAll');
    displayAll.addEventListener('click', () => { this.setFilter('all') });
    let displayActive = document.getElementById('displayActive');
    displayActive.addEventListener('click', () => { this.setFilter('active') });
    let displayCompleted = document.getElementById('displayCompleted');
    displayCompleted.addEventListener('click', () => { this.setFilter('completed') });
  }

  // update the visual active todo count, to show when a todo is 
  // added, removed or completed/uncompleted
  showNumberOfTasksLeft = () => {
    let tasksLeft = document.getElementById("tasksLeft");
    tasksLeft.innerText = this.storage.getTodoList().filter(x => x.completed == false).length + " Tasks Left";
  }

  // set j to -1 when added to the end of the list 
  // otherwise set j to the index position for insertion
  addTaskToList = (todo, j = -1) => {
    let newElement = this.renderTodoElement(todo);
    newElement.classList.toggle("hidden");
    if (j == -1) {
      taskList.appendChild(newElement);
    }
    else {
      taskList.insertBefore(newElement, taskList.children[j]);
    }
    // start the animation after the browser has had time to update the DOM  
    setTimeout(() => {
      newElement.classList.toggle("hidden");
    }, 25);
  }

  // update the class and remove the element when the animation is complete.
  removeTaskFromList = (element) => {
    element.classList.toggle("hidden");
    setTimeout(() => {
      taskList.removeChild(element);
    }, 333);
  }

  // apply a filter to the current list
  setFilter = (filter) => {
    this.currentFilter = filter;
    this.setActiveFilterButton();
    this.updateFilter();
  }

  // update the styles on the filter buttons to show which one
  // is currently selected
  setActiveFilterButton() {
    switch (this.currentFilter) {
      case "all":
        displayAll.classList.add("filter-active");
        displayActive.classList.remove("filter-active");
        displayCompleted.classList.remove("filter-active");
        break;      
      case "active":
        displayAll.classList.remove("filter-active");
        displayActive.classList.add("filter-active");
        displayCompleted.classList.remove("filter-active");
        break;
      case "completed":
        displayAll.classList.remove("filter-active");
        displayActive.classList.remove("filter-active");
        displayCompleted.classList.add("filter-active");
        break;
    }
  }

  // filter actual html list based on current filter chosen
  updateFilter() {
    switch (this.currentFilter) {
      case "active":
        this.showActive();
        break;
      case "completed":
        this.showCompleted();
        break;
      case "all":
        this.showAll();
        break;
    }
  }

  // get the html element that holds the todo with a given id
  findTodoInTaskList = (id) => {
    for (let j = 0; j < taskList.children.length; j++) {
      if (taskList.children[j].attributes['data-id'] == id) {
        return taskList.children[j];
      }
    }
    return null;
  }

  // add any items that aren't currently displayed but exist in the list
  // insert them in creation order
  // if the html element in the current index doesn't have the same id
  // then it belonged later in the list and is pushed down
  // instead of clearing all items and just inserting those based on the filter chosen
  // I call the following code to show a visual folding effect when changing filters
  showAll = () => {
    let todos = this.storage.getTodoList();
    todos.sort((a, b) => { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0 });
    for (let i = 0; i < todos.length; i++) {
      let todo = todos[i];
      var child = taskList.children[i];
      // if it wasn't in the task list from a previous filter add it
      if (child === undefined) {
        this.addTaskToList(todo);
        continue;
      }
      // if it is already shown do nothing
      if (child.attributes['data-id'] == todo.id) {
        continue;
      }
      //add to the current list based on insertion order
      this.addTaskToList(todo, i);
    }
  }

  // insert active todos by their creation order, if they aren't already in the list
  // remove any completed tasks that were displayed in the list
  showActive = () => {
    let todos = this.storage.getTodoList();
    todos.sort((a, b) => { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0 });
    let activeTodos = todos.filter(x => x.completed == false);
    let completedTodos = todos.filter(x => x.completed == true);

    for (let i = 0; i < activeTodos.length; i++) {
      if (this.findTodoInTaskList(activeTodos[i].id) == null)
        this.addTaskToList(activeTodos[i]);
    }
    
    // remove current completed tasks from the list
    for (let i = 0; i < completedTodos.length; i++) {
      let todoElement = this.findTodoInTaskList(completedTodos[i].id);
      if (todoElement != null) {
        this.removeTaskFromList(todoElement);
      }
    }

  }

  // insert completed todos in order, if they aren't already in the list
  // remove any active tasks that were displayed in the list
  showCompleted = () => {
    let todos = this.storage.getTodoList();
    todos.sort((a, b) => { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0 });
    let activeTodos = todos.filter(x => x.completed == false);
    let completedTodos = todos.filter(x => x.completed == true);

    for (let i = 0; i < completedTodos.length; i++) {
      if (this.findTodoInTaskList(completedTodos[i].id) == null)
        this.addTaskToList(completedTodos[i]);      
    }

    for (let i = 0; i < activeTodos.length; i++) {
      let todoElement = this.findTodoInTaskList(activeTodos[i].id);
      if (todoElement != null) {
        this.removeTaskFromList(todoElement);
      }      
    }
  }

  // load any initial todo list items from previous sessions
  loadTodos = () => {
    let todos = this.storage.getTodoList();
    todos.sort((a, b) => { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0 });
    todos.forEach(todo => {
      this.addTodo(todo);
    });

    this.showNumberOfTasksLeft();
  }

  // remove a specific todo by id
  removeTodo = (e, id) => {
    let todoElement = this.findTodoInTaskList(id);
    if (todoElement != null) {
      this.storage.deleteTodo(id);
      this.removeTaskFromList(todoElement);
      this.showNumberOfTasksLeft();
    }    
  }

  // mark a todo as completed, update local storage and update list filter
  completeTodo = (e, id) => {
    this.storage.updateTodoStatus(id, e.currentTarget.checked);
    let todoElement = this.findTodoInTaskList(id);
    
    if (todoElement != null) {
      todoElement.classList.toggle("completed");
      this.showNumberOfTasksLeft();
      this.updateFilter();
    } 
  }

  // add a todo to the list
  addTodo = (todo) => {
    this.addTaskToList(todo);
    this.showNumberOfTasksLeft();
    this.updateFilter();
  }

  // manage creation of our new todo and add it to the list
  newTodo = () => {
    let taskDetail = document.getElementById("newTask");
    let todo = this.createTodo(Date.now(), taskDetail.value, false);
    this.storage.saveTodo(todo);
    this.addTodo(todo)
    taskDetail.value = '';
  }

  // create the actual todo
  createTodo = (id, content, completed) => {
    let todo = { id: id, content: content, completed: completed };
    return todo;
  }

  // create html to display todo information
  renderTodoElement = (todo) => {
    let todoDiv = document.createElement('div');
    todoDiv.classList.toggle('todo');
    todoDiv.attributes['data-id'] = todo.id;

    let completedCheckbox = document.createElement('input');
    completedCheckbox.type = 'checkbox';
    completedCheckbox.checked = todo.completed;
    completedCheckbox.id = todo.id;
    completedCheckbox.addEventListener('click', (e) => { this.completeTodo(e, todo.id) })
    todoDiv.appendChild(completedCheckbox);

    let contentSpan = document.createElement('label');
    contentSpan.classList.toggle("task-detail");
    contentSpan.setAttribute('for', todo.id )
    contentSpan.innerText = todo.content;
    todoDiv.appendChild(contentSpan);

    let removeButton = document.createElement('span');
    removeButton.innerText = "X";
    removeButton.addEventListener('click', (e) => { this.removeTodo(e, todo.id) });
    removeButton.classList.toggle("btn");
    removeButton.classList.toggle("remove-task");
    todoDiv.appendChild(removeButton);

    if (todo.completed) {
      todoDiv.classList.toggle('completed');
    }

    return todoDiv
  }

}

// instantiate the class
const todo = new Todos();
todo.loadTodos();