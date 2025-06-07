/* Author: Marshall A Burns
 * GitHub: @SchoolyB
 *
 * Copyright 2025-Present Archetype Dynamics, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


export interface OstrichDBConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

export interface SearchOptions {
  type?: string;
  search?: string;
  valueContains?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'value' | 'type' | 'id';
  sortOrder?: 'asc' | 'desc';
  minValue?: string;
  maxValue?: string;
}

export interface Record {
  id?: number;
  name: string;
  type: string;
  value: string;
}

export class OstrichDBError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'OstrichDBError';
  }
}

