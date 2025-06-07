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


export { OstrichDBInstance } from './client';

export { 
  ProjectBuilder, 
  CollectionBuilder, 
  ClusterBuilder,
  RecordBuilder,
} from './builders';

export type {
  OstrichDBConfig,
  SearchOptions,
  Record
} from './types';

export { OstrichDBError } from './types';

import { OstrichDBInstance } from './client';
export default OstrichDBInstance;

export * as OstrichJS from './client';