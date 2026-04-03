import { Request,Response } from "express";
const heart =(req:Request,res:Response):void=>{
    const data ={
        hiHema:{openthisOne:{important:{openthisOne:{messageforyou:"I Love you Ich"}}}}
    }
    res.send("data");
}

export default heart;