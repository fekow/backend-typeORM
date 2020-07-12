import { MigrationInterface, QueryRunner, getRepository } from "typeorm";

import { User } from "../entity/User";

export class CreateAdminUser1547919837483 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    let user = new User();
    user.username = "admin";
    user.password = "admin";
    user.hashPassword();
    user.role = "ADMIN";

    const userRepository = getRepository(User);
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    // const userRepository = getRepository(User);
    // const admin = await userRepository.findOne({where:{username: "admin", role: "ADMIN"},select: ['id']});
    // await userRepository.delete(admin.id);
  }
  
}