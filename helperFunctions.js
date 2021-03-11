


// this helper function will filter out the boards from the data sent to it 
const getBoards = (boards,  tasks) =>{
    let responseBoard = [];
    boards.map((board,index)=>{
        responseBoard.push({
            id           :    board.id,
            name  :    board.name,
            description  :    board.description,
            tasks   	:   getTasks(board.id, tasks)
        })
    });

    return responseBoard;
};

// this helper function will check the unique name for the upcomming board 
const matchUnique = (name,boards)=>{
    let flag = false;
    boards.map((board)=>{
        if(board.name === name){
            flag = true;
        }
    });
    return flag;
};





// this function will find record 

const findBoard = (id,boards, tasks)=>{
    let found = null;
    boards.map((board)=>{
        if(board.id == id){
            board.tasks = getTasks(board.id, tasks)
            found = board;
        }
    });
    return found;
}

// this fucntion will check either the tasks are archieved or not ?

const checkArchived = (taskList ,tasks)=>{
    let flag = false;
    for(let i =0 ; i<taskList;++i){
        let task = taskList[i]
        for(let j =0 ; j<tasks.length ;++j){
            if(tasks[j].id === task && tasks[j].archived){
                flag = true;
            }
        }
    }
    return flag;
}

// clean everything with construct

const cleanBoard =(boards,tasks)=>{
    let delBoards = [];
    let tasksArray = new Array();
    boards.map((board,index)=>{
       tasks.map((task,i)=>{
           if ( task.boardId === board.id ){
            tasksArray.push(task);
           }
       })
       if(tasksArray.length){
           boards[index].tasks = [...tasksArray]
        
           tasksArray=[];
       }
    })

    return boards;
}

// get tasks

const getTasks = (boardId,tasks)=>{
    let taskObj=   tasks.filter((task)=>{
        return task.boardId === boardId
    })
    return taskObj;
};


// get single task

const getTask = (boardId, taskId,tasks)=>{
    const obj = tasks.find(task => task.id === taskId && task.boardId === boardId);
    return obj;
};



module.exports = {getBoards , matchUnique  ,getTask,getTasks,findBoard,checkArchived,cleanBoard};