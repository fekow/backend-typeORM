import {Request, Response} from 'express';
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";

import jwtconfig from '../config/jwtsecret'

class AuthController {
  static login = async(req:Request, res: Response) => {

    const {username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).json({error: 'Enter your username and password.'});
    }
    const userRepository  = getRepository(User);
    
    let user: User;
    try{
      user = await userRepository.findOneOrFail({where: {username}}) 
    } catch(err) {
      return res.status(401).send();
    }

    if(!user.checkIfUnencryptedPasswordIsValid(password)) {
      return res.status(401).send();
    }
    // give first 1hr token

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      jwtconfig.jwtSecret,
      { expiresIn: "1h" }
    );
    return res.json({token});
    }
  static changePassword  = async(req:Request, res: Response) => {

    const id = res.locals.token.payload.userId;

    const {oldPassword, newPassword} = req.body;
    //check if they're present
    if (!(oldPassword && newPassword)) {
      return res.status(400).send();
    }
    // check user in db

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      return res.status(401).send();
    }

    if(!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      return res.status(401).send();
    }

    user.password = newPassword;

    const errors = await validate(user);

    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    // TO USE THIS FUNCTION I MUST SET USER.PASSWORD TO USE THE 'THIS.PASSWORD' FROM THE CLASS
    user.hashPassword();

    userRepository.save(user);

    res.status(204).send();
  }

}

export default AuthController;
