import type {
  SearchClient,
  SearchOptions,
  SearchQueryResponse,
  IndexableDocument,
  SearchIndex,
} from '../types';
import createSearchIndex from 'search-index';
import { MemoryLevel } from 'memory-level';
import { lookupStopwords } from '../indexer/utils';
import { FuzzySearchWrapper } from '../fuzzy-search-wrapper';
import { buildPageOptions, buildPaginationCursors } from '../pagination';

const DEFAULT_TOKEN_SPLIT_REGEX = /[\p{L}\d_]+/gu;

type TinaSearchIndexerClientOptions = {
  stopwordLanguages?: string[];
  tokenSplitRegex?: string;
};

export class LocalSearchIndexClient implements SearchClient {
  public searchIndex?: SearchIndex;
  protected readonly memoryLevel: MemoryLevel;
  private readonly stopwords: string[];
  private readonly tokenSplitRegex: RegExp;
  public fuzzySearchWrapper?: FuzzySearchWrapper;

  constructor(options: TinaSearchIndexerClientOptions) {
    this.memoryLevel = new MemoryLevel();
    this.stopwords = lookupStopwords(options.stopwordLanguages);
    this.tokenSplitRegex = options.tokenSplitRegex
      ? new RegExp(options.tokenSplitRegex, 'gu')
      : DEFAULT_TOKEN_SPLIT_REGEX;
  }

  async onStartIndexing(): Promise<void> {
    // MemoryLevel is compatible with the search-index db option at runtime.
    // The library's type definitions are incomplete, so we use type assertions.
    const options = {
      db: this.memoryLevel,
      stopwords: this.stopwords,
      tokenSplitRegex: this.tokenSplitRegex,
    };
    this.searchIndex = (await createSearchIndex(
      options as unknown as Parameters<typeof createSearchIndex>[0]
    )) as unknown as SearchIndex;
    this.fuzzySearchWrapper = new FuzzySearchWrapper(this.searchIndex);
  }

  async put(docs: IndexableDocument[]): Promise<void> {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }
    await this.searchIndex.PUT(docs);
  }

  async del(ids: string[]): Promise<void> {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }
    await this.searchIndex.DELETE(ids);
  }

  async query(
    query: string,
    options?: SearchOptions
  ): Promise<SearchQueryResponse> {
    if (!this.searchIndex) {
      throw new Error('onStartIndexing must be called first');
    }

    if (options?.fuzzy && this.fuzzySearchWrapper) {
      return this.fuzzySearchWrapper.query(query, {
        limit: options.limit,
        cursor: options.cursor,
        fuzzyOptions: options.fuzzyOptions,
      });
    }

    const searchIndexOptions = buildPageOptions({
      limit: options?.limit,
      cursor: options?.cursor,
    });

    const terms = query.split(' ').filter((t) => t.trim().length > 0);
    const queryObj =
      terms.length > 1 ? { AND: terms } : { AND: [terms[0] || ''] };
    const searchResults = await this.searchIndex.QUERY(
      queryObj,
      searchIndexOptions
    );

    const total = searchResults.RESULT_LENGTH || 0;
    const pagination = buildPaginationCursors(total, {
      limit: options?.limit,
      cursor: options?.cursor,
    });

    return {
      results: searchResults.RESULT || [],
      total,
      ...pagination,
    };
  }
}
