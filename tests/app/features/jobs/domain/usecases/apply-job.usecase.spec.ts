import { ApplyJobUseCase } from '../../../../../../src/app/features/jobs/domain/usecases/apply-job.usecase';
import { CandidateJobRepository } from '../../../../../../src/app/features/jobs/infra/repositories/candidates-jobs.repository';
import { JobRepository } from '../../../../../../src/app/features/jobs/infra/repositories/job.repository';
import { JobDetailDTO } from '../../../../../../src/app/shared/domain/dtos';
import { CustomError } from '../../../../../../src/app/shared/errors';

describe('[Use Case] - Apply Job', () => {
  const newJob: JobDetailDTO = {
    id: 'id',
    description: 'Description',
    limitDate: new Date(),
    open: true,
    maxCandidate: 10,
    companyName: 'Growdev',
  };

  it('Should return error with message Job is not found', async () => {
    const idJob = 'jobId';
    const idCandidate = 'candidateId';

    const sut = new ApplyJobUseCase();

    //faz o getJob e retorna undefined
    jest.spyOn(JobRepository.prototype, 'getJob').mockResolvedValue(undefined);

    const promise = sut.execute(idJob, idCandidate);

    await expect(promise).rejects.toThrow(CustomError)
  });

  it('Should return error with message Max limit date in job', async () => {
    const idCandidate = 'candidateId';

    //cria o job
    jest.spyOn(JobRepository.prototype, 'createJob').mockResolvedValueOnce(newJob);
    const sut = new ApplyJobUseCase();

    //faz o get do job criado
    jest.spyOn(JobRepository.prototype, 'getJob').mockResolvedValue(newJob);

    const promise = sut.execute(newJob.id, idCandidate);

    await expect(promise).rejects.toThrow(new CustomError('Max limit date in job.'));
  });

  it('Should return error with message Job is close', async () => {
    const idCandidate = 'candidateId';

    const date = new Date()

    const newJob2: JobDetailDTO = {
      id: 'id',
      description: 'Description',
      limitDate: date,
      open: false,
      maxCandidate: 10,
      companyName: 'Growdev',
    }

    //cria o job
    jest.spyOn(JobRepository.prototype, 'createJob').mockResolvedValueOnce(newJob2);
    const sut = new ApplyJobUseCase();

    //faz o get do job criadocle
    jest.spyOn(JobRepository.prototype, 'getJob').mockResolvedValue(newJob2);

    const promise = sut.execute(newJob.id, idCandidate);

    await expect(promise).rejects.toThrow(new CustomError('Job is close.'));
  });

  it('Should return error with message Candidate is already registered for the job.', async () => {
    const idCandidate = 'candidateId';

    const date = new Date()

    const newJob2: JobDetailDTO = {
      id: 'id',
      description: 'Description',
      limitDate: date,
      open: true,
      maxCandidate: 10,
      companyName: 'Growdev',
    }

    //cria o job
    jest.spyOn(JobRepository.prototype, 'createJob').mockResolvedValueOnce(newJob2);

    const sut = new ApplyJobUseCase();

    //faz o get do job criado
    jest.spyOn(JobRepository.prototype, 'getJob').mockResolvedValue(newJob2);

    //get para verificar se job existe
    jest.spyOn(
      CandidateJobRepository.prototype,
      'getTotalAndCandidatesExists',
    ).mockResolvedValueOnce({ count: 1, candidateAlreadyExists: true });

    const promise = sut.execute(newJob.id, idCandidate);

    await expect(promise).rejects.toThrow(
      new CustomError('Candidate is already registered for the job.'),
    );

  });

  it('Should return error with message Job with maximum limit of candidates.', async () => {
    const idCandidate = 'candidateId';

    const date = new Date()

    const newJob2: JobDetailDTO = {
      id: 'id',
      description: 'Description',
      limitDate: date,
      open: true,
      maxCandidate: 10,
      companyName: 'Growdev',
    }

    //cria o job
    jest.spyOn(JobRepository.prototype, 'createJob').mockResolvedValueOnce(newJob2);

    const sut = new ApplyJobUseCase();

    //faz o get do job criado
    jest.spyOn(JobRepository.prototype, 'getJob').mockResolvedValue(newJob2);

    //get para verificar se job existe
    jest.spyOn(
      CandidateJobRepository.prototype,
      'getTotalAndCandidatesExists',
    ).mockResolvedValueOnce({ count: 15, candidateAlreadyExists: false });

    const promise = sut.execute(newJob.id, idCandidate);

    await expect(promise).rejects.toThrow(
      new CustomError('Job with maximum limit of candidates.'),
    );
  });

})