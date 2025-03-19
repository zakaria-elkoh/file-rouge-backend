import { Model, PopulateOptions } from 'mongoose';

export const getAdvanceResults = async <T>(
  model: Model<T>,
  query: object,
  page: number,
  limit: number,
  populate?: PopulateOptions | (PopulateOptions | string)[],
  select?: string,
  sort?: any,
) => {
  const items = await model
    .find(query)
    .populate(populate!)
    .select(select!)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const totalCount = await model.countDocuments(query);
  return {
    page,
    limit,
    total: totalCount,
    data: items,
  };
};
