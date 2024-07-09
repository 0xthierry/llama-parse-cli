import { delay, fileToBlob } from "./utils";
import { version } from "../package.json";

type JobStatus = {
  status: "PENDING" | "SUCCESS" | "ERROR" | "CANCELED";
  id: string;
};

type OutputFormat = "json" | "markdown" | "text";

type JobResultMetadata = {
  credits_used: number;
  credits_max: number;
  job_credits_usage: number;
  job_pages: number;
  job_is_cache_hit: boolean;
};

export type JobResult = {
  content: string | Array<Record<string, any>>;
  job_metadata: JobResultMetadata;
};

export type ParseOptions = {
  language?: string;
  parsing_instruction?: string;
  page_separator?: string;
  skip_diagonal_text?: boolean;
  invalidate_cache?: boolean;
  do_not_cache?: boolean;
  do_not_unroll_columns?: boolean;
  fast_mode?: boolean;
  gpt4o_mode?: boolean;
  output_format: OutputFormat;
  target_pages?: string;
};

const DEFAULT_POLLING_INTERVAL = 1000;

export class Client {
  private readonly baseUrl = "https://api.cloud.llamaindex.ai/api";
  private readonly headers: Record<string, string>;

  constructor(apiKey: string) {
    this.headers = {
      "User-Agent": `llama-parse-cli/${version}`,
      Authorization: `Bearer ${apiKey}`,
    };
  }

  async parse(
    file: string,
    options: ParseOptions,
    monitor?: { onProgress: (progress: number) => void }
  ) {
    const job = await this.createJob(file, options);
    return this.getResultWhenJobIsCompleted(job.id, options, monitor);
  }

  private async createJob(file: string, options: ParseOptions) {
    const formData = new FormData();
    const { filename, blob } = await fileToBlob(file);

    formData.append("file", blob, filename);

    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) {
        formData.append(key, value);
      }
    }

    const job = await fetch(`${this.baseUrl}/parsing/upload`, {
      method: "POST",
      headers: this.headers,
      body: formData,
    });

    if (!job.ok) {
      throw new Error(`Failed to create job: ${job.statusText}`);
    }

    const jobData = await job.json();

    return jobData as JobStatus;
  }

  private async getResultWhenJobIsCompleted(
    jobId: string,
    options: ParseOptions,
    monitor?: { onProgress: (progress: number) => void }
  ): Promise<JobResult> {
    let job = await this.getJob(jobId);
    const startTime = Date.now();
    const estimatedDuration = 30000;
    let progress = 0;

    while (job.status === "PENDING") {
      const elapsedTime = Date.now() - startTime;
      progress = Math.min((elapsedTime / estimatedDuration) * 100, 95);
      monitor?.onProgress(progress);
      await delay(DEFAULT_POLLING_INTERVAL);
      job = await this.getJob(jobId);
    }

    monitor?.onProgress(100);

    return this.getResult(job.id, options);
  }

  private async getJob(jobId: string): Promise<JobStatus> {
    const job = await fetch(`${this.baseUrl}/parsing/job/${jobId}`, {
      headers: this.headers,
    });

    if (!job.ok) {
      throw new Error(`Failed to get job: ${job.statusText}`);
    }

    const jobData = await job.json();

    return jobData as JobStatus;
  }

  private async getResult(
    jobId: string,
    options: ParseOptions
  ): Promise<JobResult> {
    const job = await fetch(
      `${this.baseUrl}/parsing/job/${jobId}/result/${options.output_format}`,
      {
        headers: this.headers,
      }
    );

    if (!job.ok) {
      throw new Error(`Failed to get job: ${job.statusText}`);
    }

    const jobData = await job.json() as any;
    const result = {
      content: jobData?.markdown || jobData?.text || jobData?.pages,
      job_metadata: jobData.job_metadata,
    };

    return result as JobResult
  }
}
