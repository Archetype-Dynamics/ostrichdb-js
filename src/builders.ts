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

import { OstrichDBInstance } from './client';
import { SearchOptions } from './types';

//The ProjectBuilder class allows you to create, delete, and manage projects in OstrichDB.
//The methods all interface with the OstrichDBInstance class' methods to perform the actual operations. this applies to all builder classes.
export class ProjectBuilder {
  constructor(private ostrichdbInstance: OstrichDBInstance, private projectName: string, private projectId: string) { }

  collection(name: string) {
    return new CollectionBuilder(this.ostrichdbInstance, this.projectName, name);
  }

  async create(): Promise<void> {
    return this.ostrichdbInstance.create_project(this.projectName);
  }

  async delete(): Promise<void> {
    return this.ostrichdbInstance.delete_project(this.projectName);
  }

  async listCollections(): Promise<string[]> {
    return this.ostrichdbInstance.list_collections(this.projectName);
  }
}

//This class allows you to manage collections within a project in OstrichDB.
export class CollectionBuilder {
  constructor(
    private ostrichdbInstance: OstrichDBInstance,
    private projectName: string,
    private collectionName: string
  ) { }

  //This method returns a ClusterBuilder instance for managing clusters within the collection.
  cluster(name: string) {
    return new ClusterBuilder(this.ostrichdbInstance, this.projectName, this.collectionName, name);
  }
  
  //The remaining methods in this class actually handle operations on the collecion itself
  async create(): Promise<void> {
    return this.ostrichdbInstance.create_collection(this.projectName, this.collectionName);
  }

  async get(): Promise<string> {
    return this.ostrichdbInstance.get_collection(this.projectName, this.collectionName);
  }

  async delete(): Promise<void> {
    return this.ostrichdbInstance.delete_collection(this.projectName, this.collectionName);
  }

  async listClusters(): Promise<string[]> {
    return this.ostrichdbInstance.list_clusters(this.projectName, this.collectionName);
  }
}

//This class contains methods to create, delete, and manage Clusters within a collection in OstrichDB.
export class ClusterBuilder {
  constructor(
    private ostrichdbInstance: OstrichDBInstance,
    private projectName: string,
    private collectionName: string,
    private clusterName: string,
  ) { }

  //This method returns a RecordBuilder instance for managing records within the cluster.
  record(name: string, type: string, value: string) {
    return new RecordBuilder(this.ostrichdbInstance, this.projectName, this.collectionName, this.clusterName, name, type, value);
  }

  //The remaining methods in this class actually handle operations on the cluster itself
  async create(): Promise<void> {
    return this.ostrichdbInstance.create_cluster(this.projectName, this.collectionName, this.clusterName);
  }

  async get(): Promise<string> {
    return this.ostrichdbInstance.get_cluster(this.projectName, this.collectionName, this.clusterName);
  }

  async delete(): Promise<void> {
    return this.ostrichdbInstance.delete_cluster(this.projectName, this.collectionName, this.clusterName);
  }

  async listRecords(): Promise<string[]> {
    return this.ostrichdbInstance.list_records(this.projectName, this.collectionName, this.clusterName);
  }

  async searchRecords(options: SearchOptions = {}): Promise<string[]> {
    return this.ostrichdbInstance.search_records(this.projectName, this.collectionName, this.clusterName, options);
  }
}


//This class contains methods to create, delete, and manage Records within a cluster in OstrichDB. 
export class RecordBuilder { 

  constructor(
    private ostrichdbInstance: OstrichDBInstance,
    private projectName: string,
    private collectionName: string,
    private clusterName: string,
    private recordName: string,
    private recordType: string,
    private recordValue: string
  ) { }


  async create(name: string, type: string, value: string): Promise<void> {
    return this.ostrichdbInstance.create_record(this.projectName, this.collectionName, this.clusterName, name, type, value);
  }

  //Allows the user to get a record by its identifier (name or ID)
  async get(identifier: string | number): Promise<string> {
    return this.ostrichdbInstance.get_record(this.projectName, this.collectionName, this.clusterName, identifier);
  }

  async delete(name: string): Promise<void> {
    return this.ostrichdbInstance.delete_record(this.projectName, this.collectionName, this.clusterName, name);
  }
}