import * as path from 'path';
import { readJson } from 'fs-extra';
import { PipcookClient, PipelineModel, JobModel } from '../../packages/sdk';

describe('pipeline api.job test', () => {
  const client = new PipcookClient('http://localhost', 6927);
  const name = 'bayes-job-test';
  const pipelineFile = path.join(__dirname, 'text-bayes-classification.json');
  let config: any;
  let pipeline: PipelineModel;
  let jobObj: JobModel;
  let jobInfoObj: JobModel;
  it('prepare', async () => {
    config = await readJson(pipelineFile);
    // prepare
    await client.job.remove();
    await client.pipeline.remove();
  });
  it('create pipeline', async () => {
    //create pipeline
    pipeline = await client.pipeline.create(config, { name });
    expect(typeof pipeline).toBe('object');
    expect(typeof pipeline.id).toBe('string');
  });
  it('create job', async () => {
    // create job
    jobObj = await client.job.run({ pipelineId: pipeline.id });
    expect(typeof jobObj).toBe('object');
    expect(typeof jobObj.id).toBe('string');
  }, 180 * 1000);
  it('query job info', async () => {
    // info
    jobInfoObj = await client.job.info(jobObj.id);
    expect(typeof jobInfoObj).toBe('object');
    expect(jobInfoObj.id).toBe(jobObj.id);
  });
  it('list job infos', async () => {
    // list
    const jobs = await client.job.list();
    expect(Array.isArray(jobs));
    expect(jobInfoObj.id).toBe(jobs[0].id);
  });
  it('clean', async () => {
    // stop
    if (jobInfoObj.status === 1) {
      await client.job.stop(jobInfoObj.id);
    }
    await client.job.remove();
    await client.pipeline.remove(pipeline.id);
  });
});
