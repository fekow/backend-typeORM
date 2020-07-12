import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import {validate} from 'class-validator'

export class UserController {
    
    static listAll = async(req:Request, res:Response) => {
        const userRepository = getRepository(User);
        let users:User[];
        users = await userRepository.find({select: ["id", "username", "role"] });
        return res.send(users);
    }
    static getOneById = async(req:Request, res:Response) => {
        const { id } = req.params
        const userRepository = getRepository(User);
        let users:User;
        try{
            users = await userRepository.findOneOrFail({
                where:{id}, select: ["id", "username", "role"] 
            });
        } catch{
            return res.status(400).json({error: "User not found"});
        }
        return res.send(users);
    }
    static newUser = async (req:Request, res:Response) => {
        const { username, password, role } = req.body
        let user = new User();
        user.username = username;
        user.password = password;
        user.role = role;
        
        const errors = await validate(user);
        
        if (errors.length > 0) {
          return res.status(400).send(errors);
        }
        
        user.hashPassword();
        const userRepository = getRepository(User);

        try{
            await userRepository.save(user)
        } catch{
            return res.status(409).json({error: "Username already in use"});
        }
        return res.status(201).json({message: "User created successfully!"});
    }
    static editUser = async (req:Request, res:Response) => {
        const { id } = req.params

        const {username, role} = req.body;

        const userRepository = getRepository(User);
        let user:User

        // find existing user
        try{
            user = await userRepository.findOneOrFail(id);
        } catch{
            return res.status(400).json({error: "User not found"});
        }
        // checks the params from the model created 
        user.username = username;
        user.role = role;
        const errors = await validate(user);
        if (errors.length > 0) {
          return res.status(400).send(errors);
        }
        //save also works as an edit, by altering the user model
        try {
            await userRepository.save(user);
          } catch (e) {
            res.status(409).send("username already in use");
            return;
          }
        return res.status(204).send();
    }
    static deleteUser = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = req.params.id;
      
        const userRepository = getRepository(User);
        let user: User;
        try {
          user = await userRepository.findOneOrFail(id);
        } catch (error) {
          return res.status(404).send("User not found");
        }
        userRepository.delete(id);
      
        //After all send a 204 (no content, but accepted) response
        return res.status(204).send();
      };
}

export default UserController;
