import { BCryptPassword } from '../../../../shared/adapters/crypto';
import { UserDetailDTO } from '../../../../shared/domain/dtos';
import { CacheRepository, UserSharedRepository } from '../../../../shared/infra/repositories';
import { UserRepository } from '../../infra/repositories';
import { CreateUserDTO } from '../dtos';
import { CustomError } from '../../../../shared/errors';

export class CreateCandidateUseCase {
    async execute(createUserDTO: CreateUserDTO): Promise<UserDetailDTO> {
        const repository = new UserRepository();
        const sharedRepository = new UserSharedRepository();
        const cacheRepository = new CacheRepository()

        const cache = await cacheRepository.get('users')

        if (!cache) {
            const list = await sharedRepository.getUserAll()

            cacheRepository.saveEx('users', list, 30)
            console.log("criou cache");

        }

        if (cache) {
            const exist = cache.filter((e: UserDetailDTO) => e.email === createUserDTO.email)

            if (exist) {
                if (exist) throw new CustomError('Email already exists from cache');
            }
        }

        const exists = await sharedRepository.getUserByEmail(createUserDTO.email);

        if (exists) throw new CustomError('Email already exists');

        const bcrypt = new BCryptPassword();

        const hashPassword = await bcrypt.hashPassword(createUserDTO.password);

        const dto = Object.assign(createUserDTO, { password: hashPassword });

        const user = await repository.saveUser(dto);

        return user;
    }
}
