export class PaginatedResponse<T> {
  data!: T[];
  next!: string;
  total!: number;
}
