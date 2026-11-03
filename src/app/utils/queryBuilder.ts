export type TPagination = {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
};

export const getPagination = (
  query: Record<string, unknown>,
  allowedSortFields: string[],
  defaultSort = "createdAt"
): TPagination => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const sortBy = allowedSortFields.includes(String(query.sortBy))
    ? String(query.sortBy)
    : defaultSort;
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  return { page, limit, skip, sort: { [sortBy]: sortOrder } };
};

export const buildMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});

export const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");