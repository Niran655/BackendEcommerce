
// const paginateQuery = async ({
//   model,
//   query = {},
//   page = 1,
//   limit = 10,
//   pagination = true,
//   populate = [], 
//   select = "",   
//   sort = { createdAt: -1 }, 
// }) => {
//   const totalDocs = await model.countDocuments(query);
//   const totalPages = Math.ceil(totalDocs / limit);
//   const skip = (page - 1) * limit;

//   let mongooseQuery = model.find(query).sort(sort).select(select);

  
//   if (populate && populate.length > 0) {
//     populate.forEach((pop) => {
//       mongooseQuery = mongooseQuery.populate(pop);
//     });
//   }

  
//   if (pagination) {
//     mongooseQuery = mongooseQuery.skip(skip).limit(limit);
//   }

//   const data = await mongooseQuery.lean();

 
//   const safeData = data.map((doc) => {
//     const newDoc = {
//       ...doc,
//       id: doc._id?.toString(),
//     };
//     delete newDoc._id;

//     Object.keys(newDoc).forEach((key) => {
//       const val = newDoc[key];
//       if (val && typeof val === "object" && val._id) {
//         newDoc[key] = { ...val, id: val._id.toString() };
//         delete newDoc[key]._id;
//       }
//     });

//     return newDoc;
//   });

//   const paginator = {
//     slNo: skip + 1,
//     prev: page > 1 ? page - 1 : null,
//     next: page < totalPages ? page + 1 : null,
//     perPage: limit,
//     totalPosts: safeData.length,
//     totalPages,
//     currentPage: page,
//     hasPrevPage: page > 1,
//     hasNextPage: page < totalPages,
//     totalDocs,
//   };

//   return { data: safeData, paginator };
// };

// export default paginateQuery;
const paginateQuery = async ({
  model,
  query = {},
  page = 1,
  limit = 10,
  pagination = true,
  populate = [],
  select = "",
  sort = { createdAt: -1 },
}) => {
  const skip = (page - 1) * limit;


  const isAggregate = typeof model?.cursor === "function";

  let data = [];
  let totalDocs = 0;

  if (isAggregate) {
  
    const pipeline = model.pipeline(); 
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await model.model.aggregate(countPipeline);
    totalDocs = countResult[0]?.total || 0;

    if (pagination) {
      model = model.skip(skip).limit(limit);
    }

    data = await model.exec();
  } else {

    totalDocs = await model.countDocuments(query);
    let mongooseQuery = model.find(query).sort(sort).select(select);

    if (populate.length > 0) {
      populate.forEach((pop) => {
        mongooseQuery = mongooseQuery.populate(pop);
      });
    }

    if (pagination) {
      mongooseQuery = mongooseQuery.skip(skip).limit(limit);
    }

    data = await mongooseQuery.lean();
  }

  const safeData = data.map((doc) => {
    const newDoc = {
      ...doc,
      id: doc._id?.toString(),
    };
    delete newDoc._id;

    Object.keys(newDoc).forEach((key) => {
      const val = newDoc[key];
      if (val && typeof val === "object" && val._id) {
        newDoc[key] = { ...val, id: val._id.toString() };
        delete newDoc[key]._id;
      }
    });

    return newDoc;
  });

  const totalPages = Math.ceil(totalDocs / limit);

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