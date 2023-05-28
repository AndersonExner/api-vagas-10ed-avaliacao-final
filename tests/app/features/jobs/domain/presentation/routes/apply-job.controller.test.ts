import supertest from 'supertest';
import { UserEntity } from '../../../../../../../src/app/shared/infra/db/entities';
import { appDataSource } from '../../../../../../../src/app/shared/infra/db/data-source';
import { Profile } from '../../../../../../../src/app/shared/domain/enums';
import { JwtToken } from '../../../../../../../src/app/shared/adapters/jwt';
import app from '../../../../../../../src/main/config/app';


const createToken = (profile = Profile.ADMIN): string => {
  const jwt = new JwtToken();

  const token = jwt.sign({
    id: 'any_id',
    profile,
  });

  return token;
};

const createUserEntity = async (): Promise<UserEntity> => {
  const user = appDataSource.manager.create(UserEntity, {
    name: 'any_name',
    email: 'any_email@gmail.com',
    profile: Profile.RECRUITER,
    company: 'any company',
    password: 'any_password',
  });

  await appDataSource.manager.save(user);
  return user;
};


describe('[POST] /jobs', () => {
  beforeAll(() => {
    return appDataSource.initialize();
  });

  afterAll(() => {
    return appDataSource.destroy();
  });

  it('should return 401 http status when token is not provided', async () => {
    const response = await supertest(app).post('/jobs/:id/apply');

    expect(response.status).toBe(401);

    expect(response.body).toEqual({ success: false, error: 'invalid token' });
  });

  it('should return error if user is not a candidate.', async () => {
    const response = await supertest(app)
      .post('/jobs/:id/apply')
      .set('Authorization', `Bearer ${createToken(Profile.ADMIN)}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, error: 'Need to be a candidate.' });
  });

});