import { Calendar } from "./Calendar.js";
import { ToDoList } from "./ToDoList.js";

(async function(){
    const TODO = new ToDoList();
    const CAL = new Calendar();
    
    await TODO.init(CAL);
    CAL.init(TODO);
})();