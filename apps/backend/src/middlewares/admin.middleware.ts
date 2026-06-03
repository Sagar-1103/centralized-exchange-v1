import type { Request, Response, NextFunction } from "express";
import { env } from "../constants/env";

export const isAdmin = async(req:Request, res:Response, next: NextFunction) => {
    try {
        const token = req.headers?.["authorization"];
        console.log(token);
        

        if (!token) {
            return res.status(401).json({success:false,message:"Admin Auth token required"});
        }

        if (token!==env.adminToken) {
            return res.status(409).json({success:false,message:"Invalid token"});
        }

        next();
    } catch (error) {
        return res.status(409).json({success:false,message:"Invalid token"});
    }
}