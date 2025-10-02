import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { GraphQLError } from "graphql";
import { GraphQLScalarType, Kind } from "graphql";
import { use } from "react";

import PurchaseOrder from "./models/PurchaseOrder.js";
import StockMovement from "./models/StockMovement.js";
import paginateQuery from "./utils/paginateQuery.js";
import Category from "./models/Category.js";
import Supplier from "./models/Supplier.js";
import Product from "./models/Product.js";
import { errorResponse, successResponse } from "./utils/response.js";
import Banner from "./models/Banner.js";
import Order from "./models/Order.js";
import Sale from "./models/Sale.js";
import Shop from "./models/Shop.js";
import User from "./models/User.js";
// Date scalar
const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",

  serialize(value) {
    return value instanceof Date ? value.toISOString() : null;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});
// ============FOR CATEGORY====================
const verifyShopAccess = async (userId, shopId) => {
  if (!userId || !shopId) return false;

  const shop = await Shop.findById(shopId);
  if (!shop) return false;

  return shop.owner.toString() === userId.toString();
};
// ============FOR CATEGORY====================
const generateSaleNumber = () => {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-8);
  return `SALE-${timestamp}`;
};

const generatePONumber = () => {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-8);
  return `PO-${timestamp}`;
};

const requireAuth = (user) => {
  if (!user) {
    throw new GraphQLError("You must be logged in to perform this action", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

// const requireRole = (user, roles) => {
//   requireAuth(user);
//   if (!roles.includes(user.role)) {
//     throw new GraphQLError(
//       "You do not have permission to perform this action",
//       {
//         extensions: { code: "FORBIDDEN" },
//       }
//     );
//   }
// };

//  requireRole ដើម្បីអនុញ្ញាតឲ្យ Seller
const requireRole = (user, roles) => {
  requireAuth(user);
  if (!roles.includes(user.role)) {
    throw new GraphQLError(
      "You do not have permission to perform this action",
      {
        extensions: { code: "FORBIDDEN" },
      }
    );
  }
};

export const resolvers = {
  Date: dateScalar,

  Product: {
    mainStock: (product) => {
      const ms = product.mainStock;
      // ប្រសិនបើ mainStock ជា array → គណនាសម្រាប់ធាតុនីមួយៗ
      if (Array.isArray(ms)) {
        return ms.map((item) => {
          const quantity =
            typeof item.quantity === "number" ? item.quantity : 0;
          const minStock =
            typeof item.minStock === "number" ? item.minStock : 0;
          const lowStock =
            typeof item.lowStock === "boolean"
              ? item.lowStock
              : quantity <= minStock;
          return { ...item, quantity, minStock, lowStock };
        });
      }

      // ប្រសិនបើ mainStock ជា object ឬមិនមាន → fallback logic
      const quantity =
        typeof ms?.quantity === "number"
          ? ms.quantity
          : typeof product.stock === "number"
          ? product.stock
          : 0;

      const minStock =
        typeof ms?.minStock === "number"
          ? ms.minStock
          : typeof product.minStock === "number"
          ? product.minStock
          : 0;

      const lowStock =
        typeof ms?.lowStock === "boolean" ? ms.lowStock : quantity <= minStock;

      return { quantity, minStock, lowStock };
    },
  },

  Query: {
    me: async (_, __, { user }) => {
      requireAuth(user);
      return user;
    },

    users: async (_, __, { user }) => {
      requireRole(user, ["Admin", "Manager", "Seller"]);
      return await User.find({});
    },

    user: async (_, { id }, { user }) => {
      requireRole(user, ["Admin", "Manager"]);
      return await User.findById(id);
    },

    myShops: async (_, __, { user }) => {
      requireAuth(user);
      if (user.role === "Seller") {
        return await Shop.find({ owner: user._id }).populate("owner");
      } else {
        return [];
      }
    },

    getShopsByOwnerId: async (_, { id }, { user }) => {
      requireRole(user, ["Seller", "Admin"]);
      try {
        let ownerId = user.id;
        if (user.role === "Admin" && id) {
          ownerId = id;
        } else if (user.role === "Seller") {
          if (id && String(id) !== String(user.id)) {
            throw new GraphQLError(
              "You do not have permission to view shops for this owner"
            );
          }
          ownerId = user.id;
        }

        const shops = await Shop.find({ owner: ownerId }).populate("owner");
        return shops || [];
      } catch (error) {
        throw new Error(`Failed to fetch shops: ${error.message}`);
      }
    },
    getShops: async () => {
      return await Shop.find();
    },
    shop: async (_, { id }) => {
      return await Shop.findById(id);
    },
    getShopsByTypeId: async (_, { typeId }) => {
      return await Shop.find({ type: typeId });
    },

    // =========================================================================================
    // General Product
    products: async (_, { shopId }) => {
      const filter = { active: true };
      if (shopId) {
        filter.shops = { $elemMatch: { shop: shopId, isVisible: true } };
      }
      return await Product.find(filter)
        .populate("comboItems.product")
        .populate("shops.shop")
        .populate("owner");
    },

    product: async (_, { id }) => {
      return await Product.findById(id).populate("comboItems.product");
    },
    //Product For Shop && Onwer
    productsByOwner: async (_, { owner }, { user }) => {
      requireAuth(user);
      try {
        if (user.role !== "Admin" && String(user.id) !== String(owner)) {
          throw new Error("You can only view your own products");
        }
        const products = await Product.find({ owner, active: true })
          .populate("owner")
          .populate("shops.shop")
          .populate("comboItems.product");
        return products || [];
      } catch (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
    },

    getProductsForShop: async (_, { shopId }, { user }) => {
      requireAuth(user);
      if (user.role === "Seller") {
        const shop = await Shop.findOne({ _id: shopId, owner: user._id });
        if (!shop) {
          throw new GraphQLError("You don't have permission to view this shop");
        }
      }

      return await Product.find({
        shops: { $elemMatch: { shop: shopId, isVisible: true } },
        active: true,
      })
        .populate("comboItems.product")
        .populate("shops.shop")
        .populate("owner")
        .populate("shopCategory");
    },

    getProductForShopWithPagination: async (
      _,
      { page = 1, limit = 10, pagination = true, keyword = "", shopId },
      { user }
    ) => {
      // requireRole(user,["Seller"])
      const query = {
        active: true,
        "shops.shop": shopId,
        ...(keyword && { $or: [{ name: { $regex: keyword, $options: "i" } }] }),
      };

      const paginationQuery = await paginateQuery({
        model: Product,
        query,
        page,
        limit,
        pagination,
      });
      return {
        data: paginationQuery.data,
        paginator: paginationQuery.paginator,
      };
    },

    getProductByShopCategoryId: async (_, { shopCategoryId }, { user }) => {
      requireRole(user, ["Seller"]);
      try {
        const products = await Product.find({
          active: true,
          shopCategory: shopCategoryId,
        })
          .populate("comboItems.product")
          .populate("shopCategory")
          .populate("shops.shop")
          .populate("owner");
        return products;
      } catch (error) {
        return errorResponse();
      }
    },
    getProductsForOwner: async (_, { owner }, { user }) => {
      requireAuth(user);
      if (user.role !== "Admin" && String(user.id) !== String(owner)) {
        throw new GraphQLError("You can only view your own products");
      }
      const products = await Product.find({ owner, active: true })
        .populate("comboItems.product")
        .populate("owner")
        .populate("shops.shop");
      return products || [];
    },
    productsByCategory: async (_, { category }) => {
      return await Product.find({ category, active: true }).populate(
        "comboItems.product"
      );
    },
    productSlideByCategory: async (_, { category }) => {
      return await Product.find({ category, active: true });
    },

    // ======================================END PRODUCT QUERY=======================================================

    //======================================START CATEGORY QUERY====================================================
    categorys: async () => {
      return await Category.find({ active: true });
    },
    category: async (_, { id }) => {
      return await Category.findById(id);
    },
    getCategoriesForShop: async (_, { shopId }) => {
      try {
        const globalCategories = await Category.find({
          owner: null,
          shop: shopId,
          active: true,
        });
        const shopCategories = await Category.find({
          shop: shopId,
          active: true,
        }).populate("parent");
        return [...globalCategories, ...shopCategories];
      } catch (error) {
        return errorResponse();
      }
    },
    getCategoriesForShopWithPagination: async (
      _,
      { page = 1, limit = 10, pagination = true, keyword = "", shopId },
      { user }
    ) => {
      //  requireRole(user,["Seller"])
      try {
        const query = {
          active: true,
          shop: shopId,
          ...(keyword && {
            $or: [{ name: { $regex: keyword, $options: "i" } }],
          }),
        };
        const globalCategories = await Category.find({
          owner: null,
          shop: shopId,
          active: true,
        });
        const paginationQuery = await paginateQuery({
          model: Category,
          query,
          page,
          limit,
          pagination,
          populate: ["parent"],
        });

        return {
          data: [...globalCategories, ...paginationQuery.data],
          paginator: paginationQuery.paginator,
        };
      } catch (error) {
        console.log("error", error);
      }
    },

    // ======================================END CATEGORY FOR SHOP================================
    getCategoryForOwner: async (_, { owner }) => {
      try {
        const ownerCategories = await Category.find({
          owner: owner,
          active: true,
        }).populate("parent");
        return [...ownerCategories];
      } catch (error) {
        errorResponse();
      }
    },
    getParentCategoryForAdmin: async () => {
      try {
        const parentCategories = await Category.find({
          parent: null,
          active: true,
        });
        return parentCategories;
      } catch (error) {
        console.error("Admin parent category query error:", error);
        return [];
      }
    },

    //==================================END CATGORY QUERY=============================================
    banners: async () => {
      return await Banner.find({ active: true });
    },
    banner: async (_, { id }) => {
      return await Banner.findById(id);
    },

    bannerByCategory: async (_, { category }) => {
      return await Banner.find({ category, active: true });
    },
    //=====================================START LOW STOCK QUERY=========================================
    lowStockProducts: async () => {
      const products = await Product.find({ active: true });
      return products.filter((product) => product.stock <= product.minStock);
    },
    getLowStockProductByShop: async (_, { shopId }, { user }) => {
      requireRole(user, ["Seller"]);
      const products = await Product.find({
        active: true,
        "shops.shop": shopId,
      });
      return products.filter((product) => product.stock <= product.minStock);
    },
    //=====================================END LOW STOCK QUERY=========================================

    sales: async (_, { limit = 50, offset = 0 }, { user }) => {
      requireAuth(user);
      return await Sale.find({})
        .populate("cashier")
        .populate("items.product")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },

    sale: async (_, { id }, { user }) => {
      requireAuth(user);
      return await Sale.findById(id)
        .populate("cashier")
        .populate("items.product");
    },

    salesByDateRange: async (_, { startDate, endDate }, { user }) => {
      requireAuth(user);
      return await Sale.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate("cashier")
        .populate("items.product");
    },

    getAllOrder: async () => {
      try {
        const orders = await Order.find().populate("items.product");
        return orders;
      } catch (error) {
        console.error("កំហុសក្នុងការទាញយក Order:", error);
        throw new Error("មិនអាចទាញយក Order បានទេ");
      }
    },
    getOrderForShop: async (_, { shopId }) => {
      try {
        const orders = await Order.find({ shop: shopId }).populate("items.product");
        return orders; 
      } catch (error) {
        console.error("កំហុសក្នុងការទាញយក order:", error);
        throw new Error("មិនអាចយក order បានទេ");
      }
    },
    //======================================START SUPPLIER QUERY=====================================
    suppliers: async (_, __, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);
      return await Supplier.find({ active: true });
    },
    getSuppliersForShop: async (_, { shopId }, { user }) => {
      requireRole(user, ["Seller"]);
      const supplier = await Supplier.find({
        active: true,
        shop: shopId,
      });
      return supplier || [];
    },

    getSupplierPaginationForShop: async (
      _,
      { page = 1, limit = 10, pagination = true, keyword = "", shopId },
      { user }
    ) => {
      requireRole(user, ["Seller"]);
      const query = {
        active: true,
        shop: shopId,
      };

      if (keyword) {
        query.$and = [
          {
            $or: [
              {
                name: { $regex: keyword, $options: "i" },
              },
            ],
          },
          {
            active: true,
          },
          {
            shop: shopId,
          },
        ];
      }
      const paginationQuery = await paginateQuery({
        model: Supplier,
        query,
        page,
        limit,
        pagination,
      });

      return {
        data: paginationQuery.data,
        paginator: paginationQuery.paginator,
      };
    },

    supplier: async (_, { id }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);
      return await Supplier.findById(id);
    },

    // ====================================END SUPPLIER QUERY==============================
    purchaseOrders: async (_, __, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);
      return await PurchaseOrder.find({})
        .populate("supplier")
        .populate("orderedBy")
        .populate("items.product")
        .sort({ createdAt: -1 });
    },

    purchaseOrder: async (_, { id }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);
      return await PurchaseOrder.findById(id)
        .populate("supplier")
        .populate("orderedBy")
        .populate("items.product");
    },

    getPurchaseOrderWithPagination: async (
      _,
      { page = 1, limit = 10, pagination = true, keyword = "", shopId },
      { user }
    ) => {
      requireRole(user, ["Seller"]);
      try {
        const query = {
          shop: shopId,
          ...(keyword && {
            $or: [
              {
                notes: { $regex: keyword, $options: "i" },
              },
            ],
          }),
        };

        const paginationQuery = await paginateQuery({
          model: PurchaseOrder,
          query,
          page,
          limit,
          pagination,
          populate: ["supplier", "orderedBy", "items.product"],
        });

        return {
          data: paginationQuery.data,
          paginator: paginationQuery.paginator,
        };
      } catch (error) {
        console.log("error", error);
      }
    },

    // ==================================START STOCK MOVEMENT QUERY===================================
    stockMovements: async (_, { productId }, { user }) => {
      // requireRole(user, ["Admin", "Manager", "StockKeeper", "Seller"]);
      const filter = productId ? { product: productId } : {};
      const movements = await StockMovement.find(filter)
        .populate("product")
        .populate("user")
        .sort({ createdAt: -1 })
        .limit(100);
      return movements.filter((m) => m.user);
    },
    getStockMovementsWithPagination: async (
      _,
      { page = 1, limit = 10, pagination = true, keyword = "", productId },
      { user }
    ) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper", "Seller"]);

      try {
        const query = {
          ...(productId && { product: productId }),
          ...(keyword && {
            $or: [{ name: { $regex: keyword, $options: "i" } }],
          }),
        };
        const paginationQuery = await paginateQuery({
          model: StockMovement,
          query,
          page,
          limit,
          pagination,
          populate: ["product", "user"],
        });
        const filteredData = paginationQuery.data.filter((m) => m.user);
        return {
          data: filteredData,
          paginator: paginationQuery.paginator,
        };
      } catch (error) {
        return errorResponse();
      }
    },

    getStockMovementsByShop: async (_, { productId, shopId }, { user }) => {
      requireRole(user, ["Seller"]);
      const filter = {};
      if (productId) filter.product = productId;
      if (shopId) filter.shop = shopId;

      const shop = await Shop.findById(shopId);
      if (!shop || !shop.owner.equals(user._id)) {
        throw new Error("អ្នកមិនមានសិទ្ធិមើលស្តុកហាងនេះទេ។");
      }
      const movements = await StockMovement.find(filter)
        .populate("product")
        .populate("user")
        .populate("shop")
        .sort({ createdAt: -1 })
        .limit(100);
      return movements.filter((m) => m.user);
    },
    getStockMovementsByshopWithPagination: async (
      _,
      {
        page = 1,
        limit = 10,
        pagination = true,
        keyword = "",
        shopId,
        productId,
      },
      { user }
    ) => {
      // requireRole(user,["Seller"])
      try {
        const filter = {};
        if (productId) filter.product = productId;
        if (shopId) filter.shop = shopId;
        const shop = await Shop.findById(shopId);

        // if (!shop || !shop.owner.equals(user.id)) {
        //   throw new Error("អ្នកមិនមានសិទ្ធិមើលស្តុកហាងនេះទេ។");
        // }
        const query = {
          ...filter,
          active: true,
          shop: shopId,
          ...(keyword && {
            $or: [{ name: { $regex: keyword, $options: "i" } }],
          }),
        };
        const paginationQuery = await paginateQuery({
          model: StockMovement,
          query,
          page,
          limit,
          pagination,
          populate: ["product", "user", "owner"],
        });

        return {
          data: paginationQuery.data,
          paginator: paginationQuery.paginator,
        };
      } catch (error) {
        console.log("Errro", error);
      }
    },
    // ==================================END STOCK MOVEMENT QUERY===================================

    //===================================START DASHBOARD QUERY========================================
    dashboardStats: async (_, __, { user }) => {
      requireAuth(user);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Today's sales
      const todaySales = await Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
      ]);

      // Top products
      const topProducts = await Sale.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.product",
            quantitySold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.total" },
          },
        },
        {
          $sort: {
            quantitySold: -1,
          },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
      ]);

      // Hourly sales
      const hourlySales = await Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: "completed",
          },
        },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            sales: { $sum: "$total" },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Low stock items
      const lowStockItems = await Product.find({ active: true }).then(
        (products) => products.filter((p) => p.stock <= p.minStock)
      );

      const stats = todaySales[0] || { total: 0, count: 0 };

      return {
        todaySales: stats.total,
        totalTransactions: stats.count,
        averageOrderValue: stats.count > 0 ? stats.total / stats.count : 0,
        topProducts: topProducts.map((tp) => ({
          product: tp.product,
          quantitySold: tp.quantitySold,
          revenue: tp.revenue,
        })),
        lowStockItems,
        hourlySales: hourlySales.map((hs) => ({
          hour: hs._id,
          sales: hs.sales,
          transactions: hs.transactions,
        })),
      };
    },

    dashboardStatsForShop: async (_, { shopId }, { user }) => {
      requireRole(user, ["Seller"]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const shopObjectId = new mongoose.Types.ObjectId(shopId);
      // Today's sales
      const todaySales = await Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: "completed",
            shop: shopObjectId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
      ]);

      // Top products
      const topProducts = await Sale.aggregate([
        { $match: { status: "completed", shop: shopObjectId } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            quantitySold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.total" },
          },
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      ]);

      // Hourly sales
      const hourlySales = await Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: "completed",
            shop: shopObjectId,
          },
        },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            sales: { $sum: "$total" },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Low stock items
      const lowStockItems = await Product.find({
        active: true,
        "shops.shop": shopObjectId,
        $expr: { $lte: ["$stock", "$minStock"] },
      });
      const stats = todaySales[0] || { total: 0, count: 0 };

      return {
        todaySales: stats.total,
        totalTransactions: stats.count,
        averageOrderValue: stats.count > 0 ? stats.total / stats.count : 0,
        topProducts: topProducts
          .filter((tp) => tp.product)
          .map((tp) => ({
            product: tp.product,
            quantitySold: tp.quantitySold,
            revenue: tp.revenue,
          })),
        lowStockItems,
        hourlySales: hourlySales.map((hs) => ({
          hour: hs._id,
          sales: hs.sales,
          transactions: hs.transactions,
        })),
      };
    },

    //===================================END DASHBOARD QUERY========================================

    // =============================================START REPORT QUERY==========================================
    salesReport: async (_, { startDate, endDate }, { user }) => {
      requireRole(user, ["Admin", "Manager", "Seller"]);
      const sales = await Sale.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: "completed",
      }).populate("items.product");

      const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalTransactions = sales.length;
      const averageOrderValue =
        totalTransactions > 0 ? totalSales / totalTransactions : 0;

      const categoryMap = new Map();
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          const category = item.product?.category || "Unknown";
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { sales: 0, quantity: 0 });
          }
          const cat = categoryMap.get(category);
          cat.sales += item.total;
          cat.quantity += item.quantity;
        });
      });

      const salesByCategory = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          sales: data.sales,
          quantity: data.quantity,
        })
      );

      const dayMap = new Map();
      sales.forEach((sale) => {
        const day = sale.createdAt.toISOString().split("T")[0];
        if (!dayMap.has(day)) {
          dayMap.set(day, { sales: 0, transactions: 0 });
        }
        const dayData = dayMap.get(day);
        dayData.sales += sale.total;
        dayData.transactions += 1;
      });

      const salesByDay = Array.from(dayMap.entries())
        .map(([date, data]) => ({
          date,
          sales: data.sales,
          transactions: data.transactions,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalSales,
        totalTransactions,
        averageOrderValue,
        salesByCategory,
        salesByDay,
      };
    },

    salesReportForShop: async (_, { startDate, endDate, shopId }, { user }) => {
      requireRole(user, ["Admin", "Manager", "Seller"]);

      const sales = await Sale.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: "completed",
        shop: shopId || null,
      }).populate("items.product");

      const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalTransactions = sales.length;
      const averageOrderValue =
        totalTransactions > 0 ? totalSales / totalTransactions : 0;

      const categoryMap = new Map();
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          const category = item.product?.category || "Unknown";
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { sales: 0, quantity: 0 });
          }
          const cat = categoryMap.get(category);
          cat.sales += item.total;
          cat.quantity += item.quantity;
        });
      });

      const salesByCategory = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          sales: data.sales,
          quantity: data.quantity,
        })
      );

      const dayMap = new Map();
      sales.forEach((sale) => {
        const day = sale.createdAt.toISOString().split("T")[0];
        if (!dayMap.has(day)) {
          dayMap.set(day, { sales: 0, transactions: 0 });
        }
        const dayData = dayMap.get(day);
        dayData.sales += sale.total;
        dayData.transactions += 1;
      });

      const salesByDay = Array.from(dayMap.entries())
        .map(([date, data]) => ({
          date,
          sales: data.sales,
          transactions: data.transactions,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalSales,
        totalTransactions,
        averageOrderValue,
        salesByCategory,
        salesByDay,
      };
    },
  },

  // ===============================================END REPORTS QUERY============================================================

  // ====================================================CATECGORY===================================================================
  Mutation: {
    login: async (_, { email, password }) => {
      console.log({ email, password });
      const user = await User.findOne({ email, active: true });
      console.log({ user });
      if (!user) {
        throw new GraphQLError("Invalid credentials");
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        throw new GraphQLError("Invalid credentials");
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user.id },
        "Ni0sdfg4325sfwesfer432sdfg_0089@IT",
        {
          expiresIn: "24h",
        }
      );
      //  const token = jwt.sign(payload, "Ni0sdfg4325sfwesfer432sdfg_0089@IT", { expiresIn: '1d' });
      // console.log("JWT_SECRET:", "Ni0sdfg4325sfwesfer432sdfg_0089@IT");
      return {
        token,
        user,
      };
    },

    register: async (_, { input }) => {
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new GraphQLError("User with this email already exists");
      }

      const user = new User(input);
      await user.save();

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      return {
        token,
        user,
      };
    },

    createUser: async (_, { input }, { user }) => {
      requireRole(user, ["Admin", "Manager"]);
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new GraphQLError("User with this email already exists");
      }
      const newUser = new User(input);
      return await newUser.save();
    },

    updateUser: async (_, { id, input }, { user }) => {
      requireRole(user, ["Admin", "Manager"]);
      if (input.email) {
        const existingUser = await User.findOne({
          email: input.email,
          _id: { $ne: id },
        });
        if (existingUser) {
          throw new GraphQLError("User with this email already exists");
        }
      }

      return await User.findByIdAndUpdate(
        id,
        { ...input, updatedAt: new Date() },
        { new: true }
      );
    },

    deleteUser: async (_, { id }, { user }) => {
      requireRole(user, ["Admin"]);

      if (user.id === id) {
        throw new GraphQLError("You cannot delete your own account");
      }

      await User.findByIdAndDelete(id);
      return true;
    },

    createShop: async (_, { input }, { user }) => {
      requireRole(user, ["Seller"]);
      await Shop.create({
        shopName: input.shopName,
        description: input.description,
        owner: user._id,
      });
      return successResponse(
        "Shop created successfully",
        "ហាងត្រូវបានបង្កើតដោយជោគជ័យ"
      );
    },
    deleteShop: async (_, { shopId }, { user }) => {
      try {
        requireRole(user, ["Admin"]);
        const deleted = await Shop.findByIdAndDelete(shopId);
        if (!deleted) {
          throw new Error("ហាងមិនមានទេ");
        }
        return successResponse("លុបហាងបានជោគជ័យ");
      } catch (error) {
        console.error("Delete shop error:", error);
        return errorResponse();
      }
    },
    createShopForSeller: async (_, { input }, { user }) => {
      // requireRole(user, ["Admin"]);
      try {
        if (!input.shopName || !input.owner) {
          throw new Error("Missing required fields: shopName or owner");
        }
        const seller = await User.findById(input.owner);
        if (!seller || seller.role !== "Seller") {
          throw new Error("Owner is not a valid seller");
        }
        function generateSlug(name) {
          return name
            .toLowerCase()
            .trim()
            .replace(/[^\p{L}\p{N}\s-]/gu, "")
            .replace(/\s+/g, "-");
        }

        function generateCode() {
          const timestamp = Date.now().toString().slice(-6);
          const random = Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();
          return `SHOP-${timestamp}-${random}`;
        }

        const slug = generateSlug(input.enName);
        const code = generateCode();

        const shop = new Shop({
          shopName: input.shopName,
          description: input.description,
          owner: input.owner,
          image: input.image,
          type: input.typeId,
          slug,
          code,
        });
        await shop.save();

        await shop.populate("owner");
        return successResponse();
      } catch (error) {
        return errorResponse(
          error.message || "Unknown error",
          "កំហុសក្នុងការបង្កើតហាងសម្រាប់អ្នកលក់"
        );
      }
    },
    // ==================================================PRODUCTS=====================================================
    // Admin All Product Can Sew
    createProduct: async (_, { input }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);
      try {
        const existingProduct = await Product.findOne({ sku: input.sku });
        if (existingProduct) {
          throw new GraphQLError("Product with this SKU already exists");
        }

        const product = new Product({ ...input, active: true });
        const savedProduct = await product.save();

        if (input.stock > 0) {
          const stockMovement = new StockMovement({
            product: savedProduct._id,
            type: "in",
            quantity: input.stock,
            reason: "Initial stock",
            user: user.id,
            previousStock: 0,
            newStock: input.stock,
          });
          await stockMovement.save();
        }
        const createProduct = await Product.findById(savedProduct._id).populate(
          "comboItems.product"
        );
        return {
          ...successResponse(),
          createProduct,
        };
      } catch (error) {
        return errorResponse();
      }
    },

    updateProduct: async (_, { id, input }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);

      if (input.sku) {
        const existingProduct = await Product.findOne({
          sku: input.sku,
          _id: { $ne: id },
        });
        if (existingProduct) {
          throw new GraphQLError("Product with this SKU already exists");
        }
      }

      const { owner, shopId, ...safeInput } = input;

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { ...safeInput, updatedAt: new Date() },
        { new: true }
      ).populate("comboItems.product");

      return {
        ...successResponse(),
        product: updatedProduct,
      };
    },

    // ================================================START CUSTOMER ORDER PRODUCT MUTATION=======================================
    // createCustomerOrderProduct:async(_,{input},{user})=>{
    //   try {
    //     const subTotal = 0;
    //   const items = await Promise.all(
    //     input.items.map((item)=>{
    //       const product =  Product.findById(item.productId)
    //       if(!product){
    //         throw new GraphQLError("Product not found");
    //       }
    //       let total = item.price * item.quantity
    //       subTotal += total

    //       return{
    //         product: product._id,
    //         quantity: item.quantity,
    //         price: product.price,
    //         total
    //       }
    //     })
    //   )

    //   const grandTotal =
    //   subTotal + (input.tax || 0) + (input.deliveryFee || 0) - (input.discount || 0)

    //   const newOrder = new Order({
    //     customer: input.customer,
    //     restaurant:input.restaurant,
    //     items,
    //     deliveryAddress:input.deliveryAddress,
    //     deliveryFee:input.deliveryFee,
    //     discount: input.discount,
    //     tax: input.tax,
    //     totalPrice:total,
    //     grandTotal,
    //     paymentMethod:input.paymentMethod,
    //     payments: input.payments,
    //     status:input.status,
    //     remark: input.remark
    //   })
    //   const orderSave =  await newOrder.save()
    //   return {
    //     ...successResponse(),
    //     orderSave
    //   }
    //   } catch (error) {
    //     console.log("createCustomerOrderProduct",createCustomerOrderProduct)
    //     return errorResponse()
    //   }

    // },
    createCustomerOrderProduct: async (_, { input }, { user }) => {
      try {
        let subTotal = 0;

        console.log("Creating order with input:", input);

        const items = await Promise.all(
          input.items.map(async (item) => {
            if (!item.product) {
              throw new GraphQLError("Product ID is required for each item");
            }

            const product = await Product.findById(item.product);
            if (!product) {
              throw new GraphQLError(
                `Product not found with ID: ${item.product}`
              );
            }

            const total = item.price * item.quantity;
            subTotal += total;

            return {
              product: product._id,
              quantity: item.quantity,
              price: item.price,
              total: total,
            };
          })
        );

        const taxAmount = input.tax || 0;
        const deliveryFee = input.deliveryFee || 0;
        const discountAmount = input.discount || 0;

        const grandTotal = subTotal + taxAmount + deliveryFee - discountAmount;

        const newOrder = new Order({
          customer: input.customer || {},
          shop: input.shopId || null,
          restaurant: input.restaurant || {},
          items: items,
          deliveryAddress: input.deliveryAddress || {},
          deliveryFee: deliveryFee,
          discount: discountAmount,
          tax: taxAmount,
          totalPrice: subTotal,
          grandTotal: grandTotal,
          paymentMethod: input.paymentMethod || "cash",
          payments: input.payments || [],
          status: input.status || "PENDING",
          remark: input.remark || "",
        });

        const savedOrder = await newOrder.save();

        const populatedOrder = await Order.findById(savedOrder._id)
          .populate("items.product")
          .populate("payments.order");

        return {
          ...successResponse(),
          order: populatedOrder,
        };
      } catch (error) {
        console.error("createCustomerOrderProduct error:", error);

        return errorResponse();
      }
    },
    // ================================================START CUSTOMER ORDER PRODUCT MUTATION=======================================

    //==================================================Owner Product CRUD==================================================
    createProductForOwner: async (_, { input }, { user }) => {
      requireRole(user, ["Seller"]);
      try {
        if (input.visibleShopIds && input.visibleShopIds.length > 0) {
          for (const shopId of input.visibleShopIds) {
            const shop = await Shop.findOne({ _id: shopId, owner: user._id });
            if (!shop) {
              return {
                isSuccess: false,
                message: {
                  messageEn: "You don't own one or more of the specified shops",
                  messageKh: "អ្នកមិនមែនជាម្ចាស់ហាងមួយចំនួនដែលបានបញ្ជាក់ទេ",
                },
              };
            }
          }
        }
        const existingProduct = await Product.findOne({
          sku: input.sku,
          owner: user._id,
        });

        if (existingProduct) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Product with this SKU already exists for this owner",
              messageKh: "ទំនិញមាន SKU នេះរួចហើយសម្រាប់ម្ចាស់នេះ",
            },
          };
        }
        const shopVisibility = (input.visibleShopIds || []).map((shopId) => ({
          shop: shopId,
          isVisible: true,
          createdAt: new Date(),
        }));
        const product = new Product({
          ...input,
          owner: user._id,
          shops: shopVisibility,
          mainStock: {
            quantity: input.initialStock || 0,
            minStock: input.minStock || 0,
            lowStock: (input.initialStock || 0) <= (input.minStock || 0),
          },
          stock: input.initialStock || 0,
          minStock: input.minStock || 0,
          lowStock: (input.initialStock || 0) <= (input.minStock || 0),
          active: true,
        });

        const savedProduct = await product.save();

        if (input.initialStock > 0) {
          const stockMovement = new StockMovement({
            product: savedProduct._id,
            type: "in",
            quantity: input.initialStock,
            reason: "Initial stock",
            user: user.id,
            owner: user._id,
            previousStock: 0,
            newStock: input.initialStock,
          });
          await stockMovement.save();
        }

        const createdProduct = await Product.findById(savedProduct._id)
          .populate("owner")
          .populate("shops.shop")
          .populate("comboItems.product");

        // return {
        //   isSuccess: true,
        //   message: {
        //     messageEn: "Product created successfully for owner",
        //     messageKh: "ទំនិញត្រូវបានបង្កើតដោយជោគជ័យសម្រាប់ម្ចាស់",
        //   },
        //   product: createdProduct,
        // };

        return {
          ...successResponse(),
          product: createdProduct,
        };
      } catch (error) {
        return errorResponse();
      }
    },
    createProductForShop: async (_, { input }, { user }) => {
      try {
        const { productData, shopId, customPrice } = input;

        const shop = await Shop.findOne({ _id: shopId, owner: user._id });
        if (!shop) {
          return errorResponse(
            "You don't own this shop",
            "អ្នកមិនមែនជាម្ចាស់ហាងនេះទេ"
          );
        }

        const existingProduct = await Product.findOne({
          sku: productData.sku,
          owner: user._id,
        });

        if (productData.shopCategoryId) {
          productData.shopCategory = productData.shopCategoryId;
          delete productData.shopCategoryId;
        }

        if (existingProduct) {
          const shopsArr = Array.isArray(existingProduct.shops)
            ? existingProduct.shops
            : [];

          const idx = shopsArr.findIndex(
            (s) => String(s.shop) === String(shopId)
          );

          if (idx > -1) {
            existingProduct.shops[idx].isVisible = true;
            existingProduct.shops[idx].customPrice =
              customPrice || productData.price;
            existingProduct.shops[idx].updatedAt = new Date();

            if (productData.initialStock !== undefined) {
              existingProduct.shops[idx].stock = productData.initialStock;
              existingProduct.shops[idx].minStock = productData.minStock || 0;
              existingProduct.shops[idx].lowStock =
                productData.initialStock <= (productData.minStock || 0);
            }
          } else {
            existingProduct.shops.push({
              shop: shopId,
              isVisible: true,
              customPrice: customPrice || productData.price,
              stock: productData.initialStock || 0,
              minStock: productData.minStock || 0,
              lowStock:
                (productData.initialStock || 0) <= (productData.minStock || 0),
              createdAt: new Date(),
            });
          }

          if (productData.shopCategory) {
            existingProduct.shopCategory = productData.shopCategory;
          }

          await existingProduct.save();

          if (productData.initialStock > 0) {
            const stockMovement = new StockMovement({
              product: existingProduct._id,
              type: "in",
              quantity: productData.initialStock,
              reason: "Initial stock for shop",
              user: user.id,
              shopId,
              previousStock: 0,
              newStock: productData.initialStock,
            });
            await stockMovement.save();
          }

          const createdProduct = await Product.findById(existingProduct._id)
            .populate("owner")
            .populate("shops.shop")
            .populate("comboItems.product")
            .populate("shopCategory");

          return {
            ...successResponse(),
            product: createdProduct,
          };
        }

        const product = new Product({
          ...productData,
          owner: user._id,
          shopCategory: productData.shopCategory || null,
          shops: [
            {
              shop: shopId,
              isVisible: true,
              customPrice: customPrice || productData.price,
              stock: productData.initialStock || 0,
              minStock: productData.minStock || 0,
              lowStock:
                (productData.initialStock || 0) <= (productData.minStock || 0),
              createdAt: new Date(),
            },
          ],
          active: true,
        });

        const savedProduct = await product.save();

        if (productData.initialStock > 0) {
          const stockMovement = new StockMovement({
            product: savedProduct._id,
            type: "in",
            quantity: productData.initialStock,
            reason: "Initial stock",
            user: user.id,
            shopId,
            previousStock: 0,
            newStock: productData.initialStock,
          });
          await stockMovement.save();
        }

        const createdProduct = await Product.findById(savedProduct._id)
          .populate("owner")
          .populate("shops.shop")
          .populate("comboItems.product")
          .populate("shopCategory");

        return {
          ...successResponse(),
          product: createdProduct,
        };
      } catch (error) {
        return errorResponse(error.message);
      }
    },

    updateProductForShop: async (_, { productId, input }, { user }) => {
      try {
        const { shopId, productData, customPrice } = input;

        const shop = await Shop.findOne({ _id: shopId, owner: user._id });
        if (!shop) {
          return errorResponse(
            "You don't own this shop",
            "អ្នកមិនមែនជាម្ចាស់ហាងនេះទេ"
          );
        }

        const product = await Product.findOne({
          _id: productId,
          owner: user._id,
        });
        if (!product) {
          return errorResponse("Product not found", "រកមិនឃើញទំនិញ");
        }

        if (productData) {
          Object.keys(productData).forEach((key) => {
            if (productData[key] !== undefined) {
              product[key] = productData[key];
            }
          });
        }

        const shopIndex = product.shops.findIndex(
          (s) => String(s.shop) === String(shopId)
        );
        if (shopIndex > -1) {
          product.shops[shopIndex].isVisible =
            productData?.isVisible ?? product.shops[shopIndex].isVisible;
          product.shops[shopIndex].customPrice =
            customPrice ||
            productData?.price ||
            product.shops[shopIndex].customPrice;
          product.shops[shopIndex].updatedAt = new Date();
        } else {
          product.shops.push({
            shop: shopId,
            isVisible: true,
            customPrice: customPrice || productData?.price,
            createdAt: new Date(),
          });
        }

        if (productData?.stock !== undefined) {
          const previousStock = product.stock;
          product.stock = productData.stock;

          product.mainStock.quantity = productData.stock;
          product.mainStock.lowStock =
            productData.stock <= (product.minStock || 0);

          if (previousStock !== productData.stock) {
            const stockMovement = new StockMovement({
              product: product._id,
              type: productData.stock > previousStock ? "in" : "out",
              quantity: Math.abs(productData.stock - previousStock),
              reason: "Stock update",
              user: user.id,
              shopId,
              previousStock,
              newStock: productData.stock,
            });
            await stockMovement.save();
          }
        }

        const updatedProduct = await product.save();

        const populatedProduct = await Product.findById(updatedProduct._id)
          .populate("owner")
          .populate("shops.shop")
          .populate("comboItems.product");

        return {
          ...successResponse(),
          product: populatedProduct,
        };
      } catch (error) {
        return errorResponse(error.message);
      }
    },

    deleteProductForShop: async (_, { productId }, {}) => {
      const product = await Product.findOne({ _id: productId });

      if (!product) {
        return errorResponse();
      }
      await Product.deleteOne({ _id: productId });
      return successResponse();
    },

    //==============================================================END PRODUCT MUTATION================================================================

    deleteCategory: async (_, { id }, { user }) => {
      try {
        requireRole(user, ["Admin", "Manager", "Seller"]);

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
          return {
            isSuccess: false,
            message: {
              messageEn: "Category not found.",
              messageKh: "រកមិនឃើញប្រភេទទេ។",
            },
          };
        }

        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },
    createCategory: async (_, { input }, { user }) => {
      requireAuth(user);

      try {
        const duplicateFilter = {
          name: { $regex: new RegExp(`^${input.name}$`, "i") },
        };

        if (input.shopId) {
          duplicateFilter.shop = input.shopId;

          const hasAccess = await verifyShopAccess(user.id, input.shopId);
          if (!hasAccess) {
            return errorResponse(
              "No access to this shop",
              "មិនមានសិទ្ធិប្រើប្រាស់ហាងនេះទេ"
            );
          }
        } else {
          duplicateFilter.owner = user.role === "Admin" ? null : user.id;
          duplicateFilter.shop = null;
        }

        const existing = await Category.findOne(duplicateFilter);
        if (existing) {
          return errorResponse(
            "Category name already exists in this scope",
            "ឈ្មោះប្រភេទមានរួចហើយ"
          );
        }

        const owner = user.role === "Admin" ? null : user.id;
        const shop = input.shopId || null;

        const slug =
          input.slug ||
          input.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\u1780-\u17FF\w-]+/g, "");
        const category = new Category({
          name: input.name,
          nameKh: input.nameKh,
          slug,
          description: input.description || "",
          image: input.image || "",
          active: input.active !== false,
          parent: input.parent || null,
          owner,
          shop,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await category.save();

        return {
          ...successResponse(),
          category,
        };
      } catch (error) {
        return errorResponse();
      }
    },
    updateCategory: async (_, { id, input }, { user }) => {
      requireRole(user, ["Admin", "Manager", "Seller"]);
      try {
        const owner = use.role === "Admin" ? null : user.id;
        const shop = input.shopId || null;
        const slug =
          input.slug ||
          input.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\u1780-\u17FF\w-]+/g, "");
        const category = new Category(
          {
            name: input.name,
            name: input.nameKh,
            slug,
            description: input.description || "",
            image: input.image || "",
            active: input.active == true,
            parent: input || null,
            owner,
            shop,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          id
        );
        await category.save();
        return {
          ...successResponse(),
          category,
        };
      } catch (error) {
        console.log("error",error)
        return errorResponse();
      }
    },
    // ==============================================END CATEGORY MUTATION=========================================================
    createBanner: async (_, { input }) => {
      try {
        const existingBanner = await Banner.findOne({ title: input.title });
        if (existingBanner) {
          return {
            isSuccess: true,
            message: {
              messageEn: "already exists",
              messageKh: "ត្រូវបានបង្កើតរួចហើយ",
            },
          };
        }
        return successResponse();
      } catch (error) {
        return errorResponse();
      }
    },

    updateBanner: async (_, { id, input }) => {
      try {
        await Banner.findByIdAndUpdate(id, input);
        return successResponse();
      } catch (err) {
        console.log("error", err);
        return errorResponse();
      }
    },

    deleteBanner: async (_, { id }) => {
      try {
        await Banner.findByIdAndDelete(id);
        return successResponse();
      } catch (err) {
        return errorResponse();
      }
    },

    adjustStock: async (_, { productId, quantity, reason }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper", "Seller"]);

      const product = await Product.findById(productId);
      if (!product) {
        throw new GraphQLError("Product not found");
      }

      const previousStock = product.stock;
      const newStock = previousStock + quantity;

      if (newStock < 0) {
        throw new GraphQLError("Insufficient stock");
      }

      product.stock = newStock;
      product.updatedAt = new Date();
      await product.save();

      const stockMovement = new StockMovement({
        product: productId,
        type: quantity > 0 ? "in" : "out",
        quantity: Math.abs(quantity),
        reason,
        user: user.id,
        previousStock,
        newStock,
      });
      await stockMovement.save();

      return await Product.findById(productId).populate("comboItems.product");
    },

    createSale: async (_, { input }, { user }) => {
      requireRole(user, ["Admin", "Manager", "Cashier", "Seller"]);
      const saleNumber = generateSaleNumber();
      const shop = input.shopId || null;
      const sale = new Sale({
        ...input,
        saleNumber,
        shop,
        cashier: user.id,
      });
      await sale.save();

      for (const item of input.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const previousStock = product.stock;
          const newStock = previousStock - item.quantity;

          if (newStock < 0) {
            throw new GraphQLError(`Insufficient stock for ${product.name}`);
          }

          product.stock = newStock;
          product.updatedAt = new Date();
          await product.save();

          const stockMovement = new StockMovement({
            product: item.product,
            type: "out",
            quantity: item.quantity,
            reason: "Sale",
            reference: saleNumber,
            shop,
            user: user.id,
            previousStock,
            newStock,
          });
          await stockMovement.save();
        }
      }

      return await Sale.findById(sale._id)
        .populate("cashier")
        .populate("items.product");
    },

    refundSale: async (_, { id }, { user }) => {
      requireRole(user, ["Admin", "Manager"]);

      const sale = await Sale.findById(id);
      if (!sale) {
        throw new GraphQLError("Sale not found");
      }

      if (sale.status === "refunded") {
        throw new GraphQLError("Sale already refunded");
      }

      sale.status = "refunded";
      await sale.save();

      for (const item of sale.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const previousStock = product.stock;
          const newStock = previousStock + item.quantity;

          product.stock = newStock;
          product.updatedAt = new Date();
          await product.save();

          const stockMovement = new StockMovement({
            product: item.product,
            type: "in",
            quantity: item.quantity,
            reason: "Refund",
            reference: sale.saleNumber,
            user: user.id,
            previousStock,
            newStock,
          });
          await stockMovement.save();
        }
      }

      return await Sale.findById(id)
        .populate("cashier")
        .populate("items.product");
    },

    createSupplier: async (_, { input }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);

      const supplier = new Supplier(input);
      return await supplier.save();
    },
    createSupplierForShop: async (_, { input, shopId }, { user }) => {
      requireRole(user, ["Seller"]);

      try {
        const owner = user.role === "Admin" ? null : user.id;
        const supplier = new Supplier({
          ...input,
          owner,
          shop: shopId ?? null,
        });

        await supplier.save();

        return {
          ...successResponse(),
          supplier,
        };
      } catch (error) {
        console.log(error);
        return errorResponse();
      }
    },
    updateSupplierForShop: async (
      _,
      { supplierId, input, shopId },
      { user }
    ) => {
      requireRole(user, ["Seller"]);
      try {
        const owner = user.role === "Admin" ? null : user.id;
        const updatedSupplier = await Supplier.findByIdAndUpdate(
          supplierId,
          {
            ...input,
            owner,
            shop: shopId ?? null,
          },
          { new: true } // បញ្ជាក់ថាចង់បាន Document ថ្មីបន្ទាប់ពី Update
        );

        if (!updatedSupplier) {
          return errorResponse("Can not found Supplier");
        }

        return {
          ...successResponse(),
          supplier: updatedSupplier,
        };
      } catch (error) {
        console.error(error);
        return errorResponse();
      }
    },
    deleteSupplier: async (_, { id }, { user }) => {
      requireRole(user, ["Admin", "Manager"]);
      await Supplier.findByIdAndDelete(id, {
        active: false,
        updatedAt: new Date(),
      });
      return true;
    },
    deleteSupplierForShop: async (_, { id }, { user }) => {
      requireRole(user, ["Seller"]);
      try {
        const deleteSupplier = await Supplier.findByIdAndDelete(id, {
          active: true || false,
          updatedAt: new Date(),
        });
        return {
          ...successResponse(),
          deleteSupplier,
        };
      } catch (error) {
        return errorResponse();
      }
    },

    // ====================================END SUPPLIER MUTATION=========================================
    createPurchaseOrder: async (_, { input }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);
      const poNumber = generatePONumber();
      const purchaseOrder = new PurchaseOrder({
        ...input,
        poNumber,
      });

      return await (await purchaseOrder.save())
        .populate("supplier")
        .populate("orderedBy")
        .populate("items.product");
    },

    createPurchaseOrderForShop: async (_, { input, shopId }, { user }) => {
      if (!user) {
        throw new Error("Authentication required");
      }
      try {
        const poNumber = generatePONumber();
        const owner = user.role === "Admin" ? null : user.id;

        const purChaseOrder = new PurchaseOrder({
          ...input,
          owner,
          shop: shopId || null,
          poNumber,
          orderedBy: user.id,
        });
        const savedPO = await purChaseOrder.save();
        const populatedPO = await PurchaseOrder.findById(savedPO._id)
          .populate("supplier")
          .populate("orderedBy")
          .populate("items.product")
          .populate("owner")
          .populate("shop");
        return {
          ...successResponse(),
          purchaseOrder: populatedPO,
        };
      } catch (error) {
        console.error("Create Purchase Order Error:", error);
        return errorResponse(error.message);
      }
    },

    updatePurchaseOrderStatus: async (_, { id, status }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);
      try {
        const updateData = { status, updatedAt: new Date() };
        if (status === "received") {
          updateData.receivedDate = new Date();
        }

        await PurchaseOrder.findByIdAndUpdate(id, updateData, {
          new: true,
        })
          .populate("supplier")
          .populate("orderedBy")
          .populate("items.product");
        return {
          isSuccess: true,
          message: {
            messageEn: "SuccessFully",
            messageKh: "ជោគជ័យ",
          },
        };
      } catch (err) {
        return {
          isSuccess: false,
          message: {
            messageEn: "Failed",
            messageKh: "បរាជ័យ។",
          },
        };
      }
    },

    receivePurchaseOrder: async (_, { id }, { user }) => {
      requireRole(user, ["Admin", "Manager", "StockKeeper"]);

      const po = await PurchaseOrder.findById(id).populate("items.product");
      if (!po) {
        throw new GraphQLError("Purchase order not found");
      }

      if (po.status === "received") {
        throw new GraphQLError("Purchase order already received");
      }

      for (const item of po.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const previousStock = product.stock;
          const newStock = previousStock + item.quantity;

          product.stock = newStock;
          product.updatedAt = new Date();
          await product.save();

          const stockMovement = new StockMovement({
            product: item.product,
            type: "in",
            quantity: item.quantity,
            reason: "Purchase Order",
            reference: po.poNumber,
            user: user.id,
            previousStock,
            newStock,
          });
          await stockMovement.save();
        }
      }

      po.status = "received";
      po.receivedDate = new Date();
      po.updatedAt = new Date();
      await po.save();

      return await PurchaseOrder.findById(id)
        .populate("supplier")
        .populate("orderedBy")
        .populate("items.product");
    },
  },
};
//==========================================================END MUTATION======================================================
