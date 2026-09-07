export interface HighLevelCustomFieldValue {
  id: string;
  fieldValue: string;
}

export interface UpsertContactInput {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  locationId: string;
  assignedTo: string;
  customFields: HighLevelCustomFieldValue[];
  createNewIfDuplicateAllowed: false;
}

export interface UpsertContactResult {
  id: string;
  isNew: boolean;
}

export interface HighLevelOpportunity {
  id: string;
  status: string;
}

export interface HighLevelTask {
  id: string;
  title: string;
  body?: string;
}

export interface CreateOpportunityInput {
  pipelineId: string;
  locationId: string;
  name: string;
  pipelineStageId: string;
  status: 'open';
  contactId: string;
  assignedTo: string;
}

export interface CreateTaskInput {
  title: string;
  body: string;
  dueDate: string;
  completed: false;
  assignedTo: string;
}

export interface HighLevelGateway {
  upsertContact(input: UpsertContactInput): Promise<UpsertContactResult>;
  getContactCustomFields(contactId: string): Promise<HighLevelCustomFieldValue[]>;
  updateContactCustomFields(contactId: string, customFields: HighLevelCustomFieldValue[]): Promise<void>;
  addContactTags(contactId: string, tags: string[]): Promise<void>;
  findOpenOpportunities(locationId: string, pipelineId: string, contactId: string): Promise<HighLevelOpportunity[]>;
  createOpportunity(input: CreateOpportunityInput): Promise<{ id: string }>;
  findTasks(contactId: string): Promise<HighLevelTask[]>;
  createTask(contactId: string, input: CreateTaskInput): Promise<{ id: string }>;
}

export class HighLevelApiError extends Error {
  constructor(public readonly status: number, public readonly operation: string) {
    super(`HighLevel rechazó ${operation} con HTTP ${status}.`);
    this.name = 'HighLevelApiError';
  }
}

type FetchLike = typeof fetch;

export class HighLevelApiClient implements HighLevelGateway {
  constructor(
    private readonly token: string,
    private readonly timeoutMs = 8000,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly baseUrl = 'https://services.leadconnectorhq.com',
  ) {}

  private async request<T>(operation: string, path: string, init: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Version: 'v3',
        Authorization: `Bearer ${this.token}`,
        ...init.headers,
      },
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      // Do not include response bodies: they can echo contact PII.
      throw new HighLevelApiError(response.status, operation);
    }
    return response.json() as Promise<T>;
  }

  async upsertContact(input: UpsertContactInput): Promise<UpsertContactResult> {
    const result = await this.request<{ new: boolean; contact: { id: string } }>(
      'upsert contact',
      '/contacts/upsert',
      { method: 'POST', body: JSON.stringify(input) },
    );
    return { id: result.contact.id, isNew: result.new };
  }

  async getContactCustomFields(contactId: string): Promise<HighLevelCustomFieldValue[]> {
    const result = await this.request<{
      contact: { customFields?: Array<{ id: string; value?: unknown; fieldValue?: unknown }> };
    }>('get contact attribution', `/contacts/${encodeURIComponent(contactId)}`, { method: 'GET' });
    return (result.contact.customFields || []).map((item) => ({
      id: item.id,
      fieldValue: String(item.fieldValue ?? item.value ?? ''),
    }));
  }

  async updateContactCustomFields(contactId: string, customFields: HighLevelCustomFieldValue[]): Promise<void> {
    await this.request('update contact attribution', `/contacts/${encodeURIComponent(contactId)}`, {
      method: 'PUT',
      body: JSON.stringify({ customFields }),
    });
  }

  async addContactTags(contactId: string, tags: string[]): Promise<void> {
    await this.request('add contact tag', `/contacts/${encodeURIComponent(contactId)}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  async findOpenOpportunities(locationId: string, pipelineId: string, contactId: string): Promise<HighLevelOpportunity[]> {
    const params = new URLSearchParams({
      locationId,
      pipelineId,
      contactId,
      status: 'open',
      limit: '100',
    });
    const result = await this.request<{ opportunities?: HighLevelOpportunity[] }>(
      'search open opportunities',
      `/opportunities/search?${params}`,
      { method: 'GET' },
    );
    return result.opportunities || [];
  }

  async createOpportunity(input: CreateOpportunityInput): Promise<{ id: string }> {
    const result = await this.request<{ opportunity: { id: string } }>(
      'create opportunity',
      '/opportunities/',
      { method: 'POST', body: JSON.stringify(input) },
    );
    return { id: result.opportunity.id };
  }

  async findTasks(contactId: string): Promise<HighLevelTask[]> {
    const result = await this.request<{ tasks?: HighLevelTask[] }>(
      'search follow-up tasks',
      `/contacts/${encodeURIComponent(contactId)}/tasks`,
      { method: 'GET' },
    );
    return result.tasks || [];
  }

  async createTask(contactId: string, input: CreateTaskInput): Promise<{ id: string }> {
    const result = await this.request<{ task: { id: string } }>(
      'create follow-up task',
      `/contacts/${encodeURIComponent(contactId)}/tasks`,
      { method: 'POST', body: JSON.stringify(input) },
    );
    return { id: result.task.id };
  }
}

export class DryRunHighLevelGateway implements HighLevelGateway {
  private readonly customFields = new Map<string, string>();
  private readonly tasks: HighLevelTask[] = [];

  async upsertContact(): Promise<UpsertContactResult> {
    return { id: 'preview-contact', isNew: true };
  }

  async getContactCustomFields(): Promise<HighLevelCustomFieldValue[]> {
    return Array.from(this.customFields).map(([id, fieldValue]) => ({ id, fieldValue }));
  }
  async updateContactCustomFields(_contactId: string, customFields: HighLevelCustomFieldValue[]): Promise<void> {
    for (const item of customFields) this.customFields.set(item.id, item.fieldValue);
  }
  async addContactTags(): Promise<void> {}
  async findOpenOpportunities(): Promise<HighLevelOpportunity[]> { return []; }
  async createOpportunity(): Promise<{ id: string }> { return { id: 'preview-opportunity' }; }
  async findTasks(): Promise<HighLevelTask[]> { return [...this.tasks]; }
  async createTask(_contactId: string, input: CreateTaskInput): Promise<{ id: string }> {
    const task = { id: 'preview-task', title: input.title, body: input.body };
    this.tasks.push(task);
    return { id: task.id };
  }
}
