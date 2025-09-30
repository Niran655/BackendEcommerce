// utils/paginateQuery.js
const paginateQuery = async ({ model, query = {}, page = 1, limit = 10, pagination = true }) => {
  const totalDocs = await model.countDocuments(query);
  const totalPages = Math.ceil(totalDocs / limit);
  const skip = (page - 1) * limit;

  const data = pagination
    ? await model.find(query).skip(skip).limit(limit)
    : await model.find(query);

  const paginator = {
    slNo: skip + 1,
    prev: page > 1 ? page - 1 : null,
    next: page < totalPages ? page + 1 : null,
    perPage: limit,
    totalPosts: data.length,
    totalPages,
    currentPage: page,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    totalDocs,
  };

  return { data, paginator };
};

export default paginateQuery;