import type { TinaCMS } from '@tinacms/toolkit';
import { buildSchema, print } from 'graphql';

import { diff } from '@graphql-inspector/core';

import type { Collection, TinaSchema } from '@tinacms/schema-tools';
import type { Client } from '../internalClient';
import type { CollectionResponse, DocumentForm } from './types';

export const CREATE_DOCUMENT_GQL = `#graphql
mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
  createDocument(
    collection: $collection,
    relativePath: $relativePath,
    params: $params
  ){__typename}
}`;

export const UPDATE_DOCUMENT_GQL = `#graphql
mutation($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
  updateDocument(
    collection: $collection,
    relativePath: $relativePath,
    params: $params
  ){__typename}
}`;

export const DELETE_DOCUMENT_GQL = `#graphql
mutation DeleteDocument($collection: String!, $relativePath: String!){
  deleteDocument(collection: $collection, relativePath: $relativePath){
    __typename
  }
}`;

export interface FilterArgs {
  filterField: string;
  collection?: string;
  relativePath?: string;
  relativePathWithoutExtension?: string;
  newRelativePath?: string;
  startsWith?: string;
  endsWith?: string;
  before?: string;
  after?: string;
  booleanEquals?: boolean;
}

export class TinaAdminApi {
  api: Client;
  useDataLayer: boolean;
  schema: TinaSchema;
  constructor(cms: TinaCMS) {
    this.api = cms.api.tina;
    this.schema = cms.api.tina.schema;
  }

  async isAuthenticated() {
    return await this.api.authProvider.isAuthenticated();
  }

  async checkGraphqlSchema({ localSchema }: { localSchema: any }) {
    const schemaFromCloud = await this.api.getSchema();
    const schema1 = schemaFromCloud;
    const schema2 = buildSchema(print(localSchema));
    const diffOutput = await diff(schema1, schema2);
    if (diffOutput.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  fetchCollections() {
    return this.schema.getCollections();
  }
  async renameDocument({ collection, relativePath, newRelativePath }) {
    await this.api.request(
      `#graphql
              mutation RenameDocument($collection: String!, $relativePath: String! $newRelativePath: String!) {
                updateDocument(collection: $collection, relativePath: $relativePath, params: {relativePath: $newRelativePath}){
    __typename
  }
              }
            `,
      { variables: { collection, relativePath, newRelativePath } }
    );
  }

  async deleteDocument({
    collection,
    relativePath,
  }: {
    collection: string;
    relativePath: string;
  }) {
    await this.api.request(DELETE_DOCUMENT_GQL, {
      variables: { collection, relativePath },
    });
  }
  async fetchCollection(
    collectionName: string,
    includeDocuments: boolean,
    folder: string = '',
    after?: string,
    sortKey?: string,
    order?: 'asc' | 'desc',
    filterArgs?: FilterArgs
  ) {
    let filter = null;
    const filterField = filterArgs?.filterField;
    if (filterField) {
      // if we have a filterField, we'll create an empty filter object
      filter = {
        [collectionName]: {
          [filterField]: {},
        },
      };
    }
    // If we have a filterField and a startsWith value, we'll add a filter
    if (filterField && filterArgs?.startsWith) {
      filter[collectionName][filterField] = {
        ...(filter[collectionName][filterField] || {}),
        startsWith: filterArgs.startsWith,
      };
    }
    if (filterField && filterArgs?.before) {
      filter[collectionName][filterField] = {
        ...(filter[collectionName][filterField] || {}),
        before: filterArgs.before,
      };
    }
    if (filterField && filterArgs?.after) {
      filter[collectionName][filterField] = {
        ...(filter[collectionName][filterField] || {}),
        after: filterArgs.after,
      };
    }
    if (
      filterField &&
      filterArgs?.booleanEquals !== null &&
      filterArgs?.booleanEquals !== undefined
    ) {
      filter[collectionName][filterField] = {
        ...(filter[collectionName][filterField] || {}),
        eq: filterArgs.booleanEquals,
      };
    }

    if (includeDocuments === true) {
      const sort = sortKey || this.schema.getIsTitleFieldName(collectionName);
      const response: { collection: CollectionResponse } =
        order === 'asc'
          ? await this.api.request(
              `#graphql
      query($collection: String!, $includeDocuments: Boolean!, $sort: String,  $limit: Float, $after: String, $filter: DocumentFilter, $folder: String){
        collection(collection: $collection){
          name
          label
          format
          templates
          documents(sort: $sort, after: $after, first: $limit, filter: $filter, folder: $folder) @include(if: $includeDocuments) {
            totalCount
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
            edges {
              node {
                __typename
                ... on Folder {
                    name
                    path
                }
                ... on Document {
                  _sys {
                    title
                    template
                    breadcrumbs
                    path
                    basename
                    relativePath
                    filename
                    extension
                    hasReferences
                  }
                }
              }
            }
          }
        }
      }`,
              {
                variables: {
                  collection: collectionName,
                  includeDocuments,
                  folder,
                  sort,
                  limit: 50,
                  after,
                  filter,
                },
              }
            )
          : await this.api.request(
              `#graphql
      query($collection: String!, $includeDocuments: Boolean!, $sort: String,  $limit: Float, $after: String, $filter: DocumentFilter, $folder: String) {
        collection(collection: $collection){
          name
          label
          format
          templates
          documents(sort: $sort, before: $after, last: $limit, filter: $filter, folder: $folder) @include(if: $includeDocuments) {
            totalCount
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
            edges {
              node {
                __typename
                ... on Folder {
                    name
                    path
                }
                ... on Document {
                  _sys {
                    title
                    template
                    breadcrumbs
                    path
                    basename
                    relativePath
                    filename
                    extension
                  }
                }
              }
            }
          }
        }
      }`,
              {
                variables: {
                  collection: collectionName,
                  includeDocuments,
                  folder,
                  sort,
                  limit: 50,
                  after,
                  filter,
                },
              }
            );

      return response.collection;
    } else {
      try {
        // TODO: fix this type
        // @ts-ignore
        const collection: Collection =
          this.schema.getCollection(collectionName);
        return collection;
      } catch (e) {
        console.error(
          `[TinaAdminAPI] Unable to fetchCollection(): ${e.message}`
        );
        return undefined;
      }
    }
  }

  async fetchDocument(
    collectionName: string,
    relativePath: string,
    values: boolean = true
  ) {
    let query;
    if (values) {
      query = `#graphql
        query($collection: String!, $relativePath: String!) {
          document(collection:$collection, relativePath:$relativePath) {
            ... on Document {
              _values
              _sys {
                hasReferences
              }
            }
          }
        }`;
    } else {
      query = `#graphql
        query($collection: String!, $relativePath: String!) {
          document(collection:$collection, relativePath:$relativePath) {
            __typename
            ... on Document {
              _sys {
                title
                template
                breadcrumbs
                path
                basename
                relativePath
                filename
                extension
              }
            }
          }
        }`;
    }
    const response: { document: DocumentForm } = await this.api.request(query, {
      variables: { collection: collectionName, relativePath },
    });

    return response;
  }

  async createDocument(
    collection: Collection,
    relativePath: string,
    params: Object
  ) {
    const response = await this.api.request(CREATE_DOCUMENT_GQL, {
      variables: {
        collection: collection.name,
        relativePath,
        params,
      },
    });

    return response;
  }

  async updateDocument(
    collection: Collection,
    relativePath: string,
    params: Object
  ) {
    const response = await this.api.request(UPDATE_DOCUMENT_GQL, {
      variables: {
        collection: collection.name,
        relativePath,
        params,
      },
    });

    return response;
  }

  async createFolder(collection, folderName) {
    return this.api.request(
      `#graphql
      mutation($collection: String!, $folderName: String!) {
        createFolder(
          collection: $collection,
          relativePath: $folderName
        ){__typename}
      }`,
      {
        variables: {
          collection,
          folderName,
        },
      }
    );
  }
}
