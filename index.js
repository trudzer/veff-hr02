//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//Port environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

//The following is an example of an array of three boards. 
var boards = [
    { id: '0', name: "Planned", description: "Everything that's on the todo list.", tasks: ["0","1","2"] },
    { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: [] },
    { id: '3', name: "Done", description: "Completed tasks.", tasks: ["3"] }
];

var tasks = [
    { id: '0', boardId: '0', taskName: "Another task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: true },
    { id: '1', boardId: '0', taskName: "Prepare exam draft", dateCreated: new Date(Date.UTC(2021, 00, 21, 16, 48)), archived: true },
    { id: '2', boardId: '0', taskName: "Discuss exam organisation", dateCreated: new Date(Date.UTC(2021, 00, 21, 14, 48)), archived: true },
    { id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true }
];

//Your endpoints go here

const {getBoards ,matchUnique  ,getTasks, findBoard,checkArchived,cleanBoard,getTask} = require("./helperFunctions");
// get all records from DB
app.get("/api/v1/boards/",(req,res)=>{
    if(boards.length){
        const result = getBoards(boards, tasks);
        res.status(200).json(result);
    }else{
        res.status(404).json({message:"Record Not Found"});
    }
    
});

app.get("/api/v1/boards/:id",(req,res)=>{
    const id = req.params.id;
    if(id<0){
        res.status(400).json({
            message:"Request Parameter is invalid "
        })
    }else{
        if(boards.length){
            const result = findBoard(id,boards, tasks);
            if(result){
                res.status(200).json({message : " Record Found " , data :result});
            }else{
                res.status(404).json({message:"No Record Found" });
            }
        }else{
            res.status(404).json({message:"No Record Found"});
        }
    }
});

app.post("/api/v1/boards/",(req,res)=>{
    const {name , description } = req.body;
    if(name){
        if(matchUnique(name,boards)){
            res.status(400).json({message : "Duplicate Values are not allowed"});
        }else{
            let newDescription = null;
            if(description){
                newDescription = description;
            }
			var newId = boards.length + 1
            var array = new Array()
            let board = {
                id : newId,
                name : name ,
                description : newDescription ,
                tasks : array
            }
            boards.push(board);
            res.status(201).json({message:"Board saved Successfully"})
        }
    }else{
        res.status(401).json({message:"Request is not valid"});
    }
});

app.delete("/api/v1/boards/:id",(req,res)=>{
    const obj = findBoard(req.params.id,boards, tasks)
    if(req.params.id<0){
        res.status(400).json({
            message:"Request Parameter is invalid "
        })
    }
   ;
    if(obj === null){
        res.status(404).json({message:"No Record to be deleted"});
    }else{
        const boardIndex = boards.indexOf(obj);
        const arrTasks = boards[boardIndex].tasks;
        if(arrTasks.length){
            if(checkArchived(arrTasks,tasks)){
                boards.splice(boardIndex,1);
                res.status(200).json({message:"Record Deleted Successfully",data: obj});
            }else{
                res.status(400).json({message:"Unable to delete the board"});
            }
        }else{
            boards.splice(boardIndex,1);
            res.status(200).json({message:"Record Deleted Successfully",data: obj});
        }
    }
    
});

app.delete("/api/v1/boards/",(req,res)=>{
    if(!boards.length){
        res.status(404).json({message:"No Record Avaialable to Delete"});
    }
    const delRecord =  cleanBoard(boards,tasks);
    boards =[];
    tasks=[];
    res.status(200).json({data:delRecord,message:"Record has been deleted successfully"});
});

//read all tasks for the specific records
app.get("/api/v1/boards/:id/tasks",(req,res)=>{
console.log("Id", req.params.id);
if(req.params.id < 0){
	res.status(400).json({message: "Invalid Request"});
}
if(!boards.length){
	res.status(400).json({message:"No Record Available "});
}else{
	let obj = findBoard(req.params.id, boards, tasks);
	
if(obj){
	if(obj.tasks.length){
		const result = getTasks(req.params.id,tasks);
		if (req.query.sort == "taskName" || req.query.sort == "id" || req.query.sort == "dateCreated"){
			result.sort((a,b) => (a[req.query.sort] > b[req.query.sort]) ? 1 : ((b[req.query.sort] > a[req.query.sort]) ? -1 : 0))
		}
		res.status(200).json({message : "Tasks Found", data:result});
	}else{
		res.status(404).json({message:"No Tasks Found for specific id"});
	}
	
}else{
	res.status(404).json({message : "No Record Found"})
}

} 
});

//read a specific task for the specific board
app.get("/api/v1/boards/:boardId/tasks/:taskId",(req,res)=>{
    if(req.params.boardId <0 || req.params.taskId < 0){
        res.status(400).json({message : "Invalid Input Parameter"});
    }

    if(!boards.length){
        res.status(401).json({message:"No Record Available "});
    }else{
        let obj = findBoard(req.params.boardId, boards, tasks);
        
        if(obj){
            if(obj.tasks.length){
                const result = getTask(req.params.boardId,req.params.taskId,tasks);
                if(result){
                    res.status(200).json({message : "Tasks Found", data:result});    
                }
                else{
                res.status(404).json({message:"No Tasks Found for specific id"});    
                }
            }else{
                res.status(404).json({message:"No Tasks Found for specific id"});
            }
            
        }else{
            res.status(404).json({message : "No Record Found"})
        }

    }

});

app.put("/api/v1/boards/:id",(req,res)=>{
    const {name,boardId,description} = req.body;
    let object = boards.find(br=>br.id === req.params.id);
    if(object){
        const objIndex = boards.indexOf(object);
        if(name){
            boards[objIndex].name = name;
        }
		if(boardId){
			boards[objIndex].boardId = boardId;
		}
        if(description){
            boards[objIndex].description = description;
        }
        object = boards[objIndex];
        res.status(200).json({message:"Record has been updated Successfully",data:object});
    } else {
        res.status(400).json({message:"Unable to update the board"});
    }
   
});


//create a new task 

app.post("/api/v1/boards/:id/tasks",(req,res)=>{
	if(req.params.id < 0 ){
        res.status(400).json({message : "Invalid Input Parameter"});
    }
    if(!req.body.taskName){
        res.status(400).json({message : "taskName Parameter is missing"});
    }
    if(!boards.length){
        res.status(401).json({message:"No Record Available "});
    }else{
        let obj = findBoard(req.params.id, boards, tasks);
       

        if(obj){
            const boardIndex = boards.indexOf(obj);
            const {taskName} = req.body;
            const id = (tasks.length + 1).toString();
            const dateCreated = Date.now()
            const boardId = req.params.id;

            boards[boardIndex].tasks.push(id);
            let task ={
                id :id,
                boardId:boardId,
                taskName:taskName,
                dateCreated:dateCreated,
                archived:false
            };
            tasks.push(task);
            
            res.status(201).json({message : "New Task has been added successfully",
            data:{
                board : boards[boardIndex],
                task : tasks
            }});
        }else{
            res.status(404).json({message:"No Board Found for specific id"});

        }
       
    }
});


// delete a specific task from the specific board

app.delete("/api/v1/boards/:boardId/tasks/:taskId",(req,res)=>{
    if(req.params.boardId <0 || req.params.taskId < 0){
        res.status(400).json({message : "Invalid Input Parameter"});
    }

    if(!boards.length){
        res.status(401).json({message:"No Record Available "});
    }else{
        let obj = findBoard(req.params.boardId, boards, tasks);
        
        if(obj){
            if(obj.tasks.length){
                const result = getTask(req.params.boardId,req.params.taskId,tasks);
                const taskIndex = tasks.indexOf(result);
                const boardIndex = boards.indexOf(obj);
                //remove from task as well as from board
                
                let deletedTask = tasks.splice(taskIndex,1);
                boards[boardIndex].tasks.splice(boards[boardIndex].tasks.indexOf(deletedTask.id),1);
                console.log(tasks)
                   res.status(200).json({message : "Tasks Deleted",
                   data:{
                       task : deletedTask,
                       board : boards[boardIndex]
                   }
                });
                
                
            }else{
                res.status(404).json({message:"No Tasks to be deleted for empty tasks"});
            }
            
        }else{
            res.status(404).json({message : "No Record Found"})
        }

    }
});


// partially update the task 

app.put("/api/v1/boards/:boardId/tasks/:taskId",(req,res)=>{
    console.log(req.body)
    if(!req.body){
        res.status(400).json({"message":"parameters are missing"});
    }
    if(req.params.boardId <0 || req.params.taskId < 0){
        res.status(400).json({message : "Invalid Input Parameter"});
    }

    if(!boards.length){
        res.status(401).json({message:"No Record Available "});
    }else{
        let obj = findBoard(req.params.boardId, boards, tasks);
        
        if(obj){
            const {taskName,boardId,archived} = req.body;
            if(obj.tasks.length){
                const result = getTask(req.params.boardId,req.params.taskId,tasks);
                const taskIndex = tasks.indexOf(result);
                if(result){
                    if(taskName){
                        tasks[taskIndex].taskName = taskName;
                    }if(archived){
                        tasks[taskIndex].archived = archived;
                    }if(boardId){
                        tasks[taskIndex].boardId = boardId;
                    }
                    res.status(200).json({message : "Tasks Updated", data:result});    
                }
                else{
                res.status(404).json({message:"No Tasks Found for specific id"});    
                }
            }else{
                res.status(404).json({message:"No Tasks Found for specific id"});
            }
            
        }else{
            res.status(404).json({message : "No Record Found"})
        }

    }
});

//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});