import {Request, Response, NextFunction  } from 'express'
import * as jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwtsecret'

interface Payload {
  userId: string;
  username: string;
}

export const checkJwt = (req:Request,res:Response,next:NextFunction )=> {

  const token = <string>req.headers["auth"];
  let jwtPayload;
  try{
    jwtPayload = <Payload>jwt.verify(token, jwtConfig.jwtSecret)
    res.locals.jwtPayload = jwtPayload;
  } catch(err) {
    //If token is not valid, respond with 401 (unauthorized)
    return res.status(401).send();
  }

  //The token is valid for 1 hour
  //We want to send a new token on every Request
  const { userId, username } = jwtPayload;

  const newToken = jwt.sign({ userId, username }, jwtConfig.jwtSecret, {
    expiresIn: "1h"
  });

  res.setHeader("token", newToken);

  //Call the next function of the route
  next();
};