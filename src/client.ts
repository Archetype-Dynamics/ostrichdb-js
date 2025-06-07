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


import { OstrichDBConfig, SearchOptions, OstrichDBError } from './types';
import { ProjectBuilder } from './builders';



//Represents each users individual instance of the OstrichDB API client

//Most(excluding the first 2) methods within this class make HTTP requests to the OstrichDB API. It provides methods for managing projects, collections, clusters, and records in a user's OstrichDB instance.
export class OstrichDBInstance { 
  private baseUrl: string; 
  private apiKey?: string; 
  private timeout: number;

  constructor(config: OstrichDBConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8042';
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  setAuthToken(token: string): void {
    this.apiKey = token;
  }

  private async request(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<string> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      const text = await response.text();

      if (!response.ok) {
        throw new OstrichDBError(
          `HTTP ${response.status}: ${response.statusText}${text ? ` - ${text}` : ''}`,
          response.status,
          text
        );
      }

      return text;
    } catch (error) {
      if (error instanceof OstrichDBError) {
        throw error;
      }
      throw new OstrichDBError(`Request failed: ${error.message}`);
    }
  }

  // -------------------------------------
  // PROJECT OPERATIONS START

  //List all projects in a users OstrichDB instance
  async list_projects(): Promise<string[]> {
    const response = await this.request('GET', '/api/v1/projects');
    if (!response.trim()) return [];

    // Handle JSON response if it contains projects array
    try {
      const parsed = JSON.parse(response);
      if (parsed.projects) {
        return parsed.projects.map((p: any) => p.name);
      }
    } catch {
      // If not JSON, treat as plain text list
      return response.split('\n').filter(line => line.trim());
    }

    return response.split('\n').filter(line => line.trim());
  }


  //Create a new project in the users OstrichDB instance
  async create_project(name: string): Promise<void> {
    await this.request('POST', `/api/v1/projects/${encodeURIComponent(name)}`);
  }


  //Delete a project from the users OstrichDB instance
  async delete_project(name: string): Promise<void> {
    await this.request('DELETE', `/api/v1/projects/${encodeURIComponent(name)}`);
  }
  // PROJECT OPERATIONS END

  // -------------------------------------
  // COLLECTION OPERATIONS START
  
  //List all collections in a specific project
  async list_collections(projectName: string): Promise<string[]> {
    const response = await this.request('GET', `/api/v1/projects/${encodeURIComponent(projectName)}/collections`);
    if (!response.trim()) return [];
    return response.split('\n').filter(line => line.trim());
  }

  //Create a new collection in a specific project
  async create_collection(projectName: string, collectionName: string): Promise<void> {
    await this.request('POST', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}`);
  }

  //Returns the entire collection, excluding the metadata
  async get_collection(projectName: string, collectionName: string): Promise<string> {
    return this.request('GET', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}`);
  }

  //Delete a collection from a specific project
  async delete_collection(projectName: string, collectionName: string): Promise<void> {
    await this.request('DELETE', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}`);
  }
  // COLLECTION OPERATIONS END

  // -------------------------------------
  // CLUSTER OPERATIONS START
  
  //List all clusters in a specific collection
  async list_clusters(projectName: string, collectionName: string): Promise<string[]> {
    const response = await this.request('GET', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters`);
    if (!response.trim()) return [];
    return response.split('\n').filter(line => line.trim());
  }

  //Create a new cluster in a specific collection
  async create_cluster(projectName: string, collectionName: string, clusterName: string): Promise<void> {
    await this.request('POST', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters/${encodeURIComponent(clusterName)}`);
  }

  //Returns the contents of a specific cluster, excluding the cluster name and cluster ID
  async get_cluster(projectName: string, collectionName: string, clusterName: string): Promise<string> {
    return this.request('GET', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters/${encodeURIComponent(clusterName)}`);
  }

  //Delete a specific cluster from a collection
  async delete_cluster(projectName: string, collectionName: string, clusterName: string): Promise<void> {
    await this.request('DELETE', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters/${encodeURIComponent(clusterName)}`);
  }
  // CLUSTER OPERATIONS END

  // -------------------------------------
  // RECORD OPERATIONS START

  //List all records in a specific cluster
  async list_records(projectName: string, collectionName: string, clusterName: string): Promise<string[]> {
    const response = await this.request('GET', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters/${encodeURIComponent(clusterName)}/records`);
    if (!response.trim()) return [];
    return response.split('\n').filter(line => line.trim());
  }

  //Search for records in a specific cluster with optional parameters, this includes pagination, sorting, and filtering, and searching by: name, type, and value
  async search_records(
    projectName: string,
    collectionName: string,
    clusterName: string,
    options: SearchOptions = {}
  ): Promise<string[]> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters/${encodeURIComponent(clusterName)}/records${queryString ? '?' + queryString : ''}`;

    const response = await this.request('GET', endpoint);
    if (!response.trim()) return [];
    return response.split('\n').filter(line => line.trim());
  }


  //Creates a new record in a specific cluster with the given name, type, and value
  async create_record(
    projectName: string,
    collectionName: string,
    clusterName: string,
    recordName: string,
    type: string,
    value: string
  ): Promise<void> {
    const params = new URLSearchParams({
      type: type.toUpperCase(),
      value
    });
    await this.request('POST', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters/${encodeURIComponent(clusterName)}/records/${encodeURIComponent(recordName)}?${params}`);
  }

  //Returns a full record in the format: {name} :{type}: {value} as a single string
  async get_record(
    projectName: string,
    collectionName: string,
    clusterName: string,
    recordIdentifier: string | number
  ): Promise<string> {
    return this.request('GET', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters/${encodeURIComponent(clusterName)}/records/${encodeURIComponent(String(recordIdentifier))}`);
  }

  //Deletes a specific record from a cluster
  async delete_record(
    projectName: string,
    collectionName: string,
    clusterName: string,
    recordName: string
  ): Promise<void> {
    await this.request('DELETE', `/api/v1/projects/${encodeURIComponent(projectName)}/collections/${encodeURIComponent(collectionName)}/clusters/${encodeURIComponent(clusterName)}/records/${encodeURIComponent(recordName)}`);
  }
  // RECORD OPERATIONS END

  // -------------------------------------
  // UTILITY OPERATIONS START


  //Pings the '/health' endpoint to check if the OstrichDB server is running and returns the response as JSON
  async health_check(): Promise<any> {
    const response = await this.request('GET', '/health');
    try {
      return JSON.parse(response);
    } catch {
      return response;
    }
  }

  // Builder pattern entry point
  project(name: string, id: string = ''): ProjectBuilder {
    return new ProjectBuilder(this, name, id);
  }
}
