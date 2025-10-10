// // utils/paginateQuery.js
// const paginateQuery = async ({ model, query = {}, page = 1, limit = 10, pagination = true }) => {
//   const totalDocs = await model.countDocuments(query);
//   const totalPages = Math.ceil(totalDocs / limit);
//   const skip = (page - 1) * limit;

//   const data = pagination
//     ? await model.find(query).skip(skip).limit(limit)
//     : await model.find(query);

//   const paginator = {
//     slNo: skip + 1,
//     prev: page > 1 ? page - 1 : null,
//     next: page < totalPages ? page + 1 : null,
//     perPage: limit,
//     totalPosts: data.length,
//     totalPages,
//     currentPage: page,
//     hasPrevPage: page > 1,
//     hasNextPage: page < totalPages,
//     totalDocs,
//   };

//   return { data, paginator };
// };

// export default paginateQuery;
// utils/paginateQuery.js
const paginateQuery = async ({
  model,
  query = {},
  page = 1,
  limit = 10,
  pagination = true,
  populate = [], // new: for population
  select = "",   // new: for field selection
  sort = { createdAt: -1 }, // optional sorting
}) => {
  const totalDocs = await model.countDocuments(query);
  const totalPages = Math.ceil(totalDocs / limit);
  const skip = (page - 1) * limit;

  // Base query
  let mongooseQuery = model.find(query).sort(sort).select(select);

  // Apply populate if provided
  if (populate && populate.length > 0) {
    populate.forEach((pop) => {
      mongooseQuery = mongooseQuery.populate(pop);
    });
  }

  // Apply pagination
  if (pagination) {
    mongooseQuery = mongooseQuery.skip(skip).limit(limit);
  }

  // Use lean() to avoid Buffer ID issues
  const data = await mongooseQuery.lean();

  // Convert _id fields to string (GraphQL-safe)
  const safeData = data.map((doc) => ({
    ...doc,
    id: doc._id?.toString(),
  }));

  const paginator = {
    slNo: skip + 1,
    prev: page > 1 ? page - 1 : null,
    next: page < totalPages ? page + 1 : null,
    perPage: limit,
    totalPosts: safeData.length,
    totalPages,
    currentPage: page,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    totalDocs,
  };

  return { data: safeData, paginator };
};

export default paginateQuery;
