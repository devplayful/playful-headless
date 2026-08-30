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
  updateContactCustomFields(contactId: string, customFields: HighLevelCustomFieldValue[]): Promise<void>;
  addContactTags(contactId: string, tags: string[]): Promise<void>;
  findOpenOpportunities(locationId: string, pipelineId: string, contactId: string): Promise<HighLevelOpportunity[]>;
  createOpportunity(input: CreateOpportunityInput): Promise<{ id: string }>;
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
  async upsertContact(): Promise<UpsertContactResult> {
    return { id: 'preview-contact', isNew: true };
  }

  async updateContactCustomFields(): Promise<void> {}
  async addContactTags(): Promise<void> {}
  async findOpenOpportunities(): Promise<HighLevelOpportunity[]> { return []; }
  async createOpportunity(): Promise<{ id: string }> { return { id: 'preview-opportunity' }; }
  async createTask(): Promise<{ id: string }> { return { id: 'preview-task' }; }
}

