
export interface TestCase {
  id: number;
  name: string;
  type: string;
  code: string;
  description: string;
}

export interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  message: string;
}

export interface TestResults {
  passed: number;
  failed: number;
  total: number;
  coverage: number;
  details: TestResult[];
}

export interface FunctionTest {
  positive: {
    code: string;
    description: string;
  };
  negative: {
    code: string;
    description: string;
  };
  edge: {
    code: string;
    description: string;
  };
  performance: {
    code: string;
    description: string;
  };
  concurrency: {
    code: string;
    description: string;
  };
}

