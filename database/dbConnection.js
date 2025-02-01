import mongoose from "mongoose"; //just mongoose import!

//Database connection here!
 const dbConnection  = ()=>{
    mongoose.connect(process.env.DB_URL,{
       dbName: "NextStep"

    }).then(()=>{ //connected
       console.log("MongoDB Connected")
    }).catch((error)=>{
        console.log(`Failed to connect ${error}`)
    })
    
}
export default dbConnection;