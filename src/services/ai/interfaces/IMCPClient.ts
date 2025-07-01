export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content: string;
  metadata: Record<string, string>;
  score: number;
  source: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  isActive: boolean;
  isPublic: boolean;
}

export interface IMCPClient {
  search(query: string): Promise<SearchResult[]>;
  getDocument(url: string): Promise<string>;
  getDocumentContent(url: string): Promise<string>;
  getDocumentMetadata(url: string): Promise<Record<string, string>>;
  getDocumentScore(url: string): Promise<number>;
  getDocumentSource(url: string): Promise<string>;
  getDocumentType(url: string): Promise<string>;
  getDocumentCreatedAt(url: string): Promise<Date>;
  getDocumentUpdatedAt(url: string): Promise<Date>;
  getDocumentIsDeleted(url: string): Promise<boolean>;
  getDocumentIsActive(url: string): Promise<boolean>;
  getDocumentIsPublic(url: string): Promise<boolean>;
} 