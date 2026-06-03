import type { Request, Response } from "express";
import { AsyncHandler } from "../utils/helper-functions";
import { authSchema } from "../types/auth-schema";
import { sendValidationError } from "../utils/validation";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { env } from "../constants/env";
import { sendToEngine } from "../utils/perps-client";

function generateAccessToken(userId:string) {
    const token = jwt.sign({userId},env.jwtSecret,{
        expiresIn:"7d"
    });
    return token; 
}

export const signup = AsyncHandler(async(req:Request, res:Response)=>{
    const parsedBody = authSchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res,parsedBody.error);
        return;      
    }
    const { username, password } = parsedBody.data;

    let user = await prisma.user.findFirst({
        where:{
            username
        },
    });

    if (user) {
        return res.status(401).json({success:false,error:"User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password,10);
 
    user = await prisma.user.create({
        data:{
            username,
            password:hashedPassword,
        },
    });

    const token = generateAccessToken(user.id);

    const engineResponse = await sendToEngine("onboard",{
        amount:100,
    });

    return res.status(201).json({success:true,engineResponse,token,message:"User registered successfully"});
})

export const signin = AsyncHandler(async(req:Request, res:Response)=>{
    const parsedBody = authSchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res,parsedBody.error);
        return;
    }
    const { username, password } = parsedBody.data;

    const user = await prisma.user.findFirst(({
        where:{
            username,
        },
    }));

    if (!user) {
        return res.status(404).json({success:false,error:"User doesnt exist"});
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);

    if (!isPasswordValid) {
        return res.status(401).json({success:false,error:"Invalid credentials"});
    }

    const token = generateAccessToken(user.id);

    return res.status(201).json({success:true,token,message:"User logged in successfully"});
})