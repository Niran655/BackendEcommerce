export const typeDefs = `#graphql
    scalar Date

    type User {
      id: ID!
      name: String!
      email: String!
      role: Role!
      active: Boolean!
      lastLogin: Date
      createdAt: Date!
      updatedAt: Date!
    }
    type Shop {
      id: ID!
      owner: User!     
      shopName: String!
      description: String
      createdAt: Date!
      updatedAt: Date!
    }

    type ShopStaff {
      user: User!
      role: Role!
      assignedAt: Date!
    }

    type AuthPayload {
      token: String!
      user: User!
    }
    type SubImage{
      id:ID!
      url:String
      altText:String
      caption:String
    }


    type AddToSlide {
      id:ID!
      title:String,
      header:String,
      description:String,
      image:String
    }

    type Product {
      id: ID!
      owner:User
      shops: [ShopProductVisibility!]!
      mainStock: StockInfo
      name: String
      description: String
      category: String
      shopCategory:Category
      price: Float
      cost: Float
      sku: String
      stock: Int
      minStock: Int
      isCombo: Boolean
      comboItems: [ComboItem]
      image: String
      subImage:[SubImage]
      addSlide:[AddToSlide]
      discount:[Discount]
      active: Boolean
      lowStock: Boolean
      createdAt: Date!
      updatedAt: Date!
    }

    type StockInfo {
      quantity: Int
      minStock: Int
      lowStock: Boolean
    }
         
    type ShopProductVisibility{
      shop: Shop!
      isVisible: Boolean
      customPrice: Float
      createdAt: Date!
    }

    type Discount {
      id:ID!
      defaultPrice:Float,
      description:String
      discountPrice:Float
    }
    
    type ComboItem {
      product: Product!
      quantity: Int!
    }

    type Sale {
      id: ID!
      saleNumber: String!
      cashier: User!
      items: [SaleItem!]!
      subtotal: Float!
      tax: Float!
      discount: Float!
      total: Float!
      paymentMethod: PaymentMethod!
      amountPaid: Float!
      change: Float!
      status: SaleStatus!
      createdAt: Date!
    }

    type Banner {
        id:ID!
        category: String,
        image: String,
        title: String,
        subtitle: String,
        link: String,
        active: Boolean,
    }

    type SaleItem {
      product: Product!
      name: String!
      price: Float!
      quantity: Int!
      total: Float!
    }

    type Supplier {
      id: ID!
      name: String!
      contactPerson: String!
      email: String!
      phone: String!
      owner:User
      shop: Shop  
      address: String!
      active: Boolean!
      createdAt: Date!
      updatedAt: Date!
    }

    type PurchaseOrder {
      id: ID!
      poNumber: String!
      supplier: Supplier!
      items: [POItem!]!
      subtotal: Float!
      tax: Float!
      total: Float!
      status: POStatus!
      owner: User               
      shop: Shop
      orderedBy: User!
      orderDate: Date!
      receivedDate: Date
      notes: String
      createdAt: Date!
      updatedAt: Date!
    }

    type POItem {
      product: Product!
      name: String!
      quantity: Int!
      unitCost: Float!
      total: Float!
    }

    type StockMovement {
      id: ID!
      shopId: Shop
      owner: User
      product: Product!
      type: StockMovementType!
      quantity: Int!
      reason: String!
      reference: String
      user: User!
      previousStock: Int!
      newStock: Int!
      createdAt: Date!
    }



    type DashboardStats {
      todaySales: Float!
      totalTransactions: Int!
      averageOrderValue: Float!
      topProducts: [TopProduct!]!
      lowStockItems: [Product!]!
      hourlySales: [HourlySale!]!
    }

    type TopProduct {
      product: Product!
      quantitySold: Int!
      revenue: Float!
    }

    type HourlySale {
      hour: Int!
      sales: Float!
      transactions: Int!
    }

    type SalesReport {
      totalSales: Float!
      totalTransactions: Int!
      averageOrderValue: Float!
      salesByCategory: [CategorySale!]!
      salesByDay: [DailySale!]!
    }

    type CategorySale {
      category: String!
      sales: Float!
      quantity: Int!
    }

    type DailySale {
      date: String!
      sales: Float!
      transactions: Int!
    }

  type Category {
    id: ID!
    name: String
    slug: String          
    description: String    
    image: String               
    active: Boolean

    parent: Category     
    children: [Category]     
    owner: User               
    shop: Shop  

    createdAt: Date
    updatedAt: Date
  }

    enum Role {
      Admin
      Manager
      Cashier
      StockKeeper
      User
      Seller
      Staff
      Customer
    }

    enum PaymentMethod {
      cash
      card
      qr
    }

    enum SaleStatus {
      completed
      refunded
    }

    enum POStatus {
      pending
      ordered
      received
      cancelled
    }

    enum StockMovementType {
      in
      out
      adjustment
    }

    type PaginatorMeta {
      slNo: Int!
      prev: Int
      next: Int
      perPage: Int!
      totalPosts: Int!
      totalPages: Int!
      currentPage: Int!
      hasPrevPage: Boolean!
      hasNextPage: Boolean!
      totalDocs: Int!
    }

    type Message {
      messageEn: String
      messageKh: String
    }

    type MutationResponse {
      isSuccess: Boolean
      message: Message
    }

    # =================================================INPUT TYPE===========================================================================

    input UserInput {
      name: String!
      email: String!
      password: String!
      active:Boolean!
      role: Role!
      isSeller: Boolean 
    }

    input AssignStaffInput {
      shopId: ID!  
      userId: ID!
      role: Role!
    }

    input UserUpdateInput {
      name: String
      email: String
      password: String
      role: Role
      active: Boolean
    }

    input ShopInput {
      owner: ID!
      shopName: String!
      description: String
    }

   # Update ProductInput
    input ProductInput {
      owner: ID      
      shopId: ID    
      name: String
      description: String
      category: String
      shopCategoryId: ID
      price: Float
      cost: Float
      sku: String
      stock: Int
      minStock: Int
      image: String
      subImage: [SubImageInput]
      discount: [DiscountInput]
      isCombo: Boolean
      comboItems: [ComboItemInput]
    }


   
    input ProductForShopInput {
      productData: ProductInput
      shopId: ID!
      customPrice: Float
    }

    input ComboItemInput {
      product: ID!
      quantity: Int!
    }
      input SubImageInput{
      url:String
      altText:String
      caption:String
    }

    input AddSlideInput {
      title:String,
      header:String,
      description:String,
      image:String
    }

    input BannerInput {
        category: String,
        image: String,
        title: String,
        subtitle: String,
        link: String,
        active: Boolean,
    }
    input DiscountInput {
      defaultPrice:Float,
      description:String
      discountPrice:Float
    }

    input ProductUpdateInput {
      name: String
      owner: ID 
      shopId:ID
      description: String
      category: String
      price: Float
      cost: Float
      sku: String
      stock: Int
      minStock: Int
      isCombo: Boolean
      comboItems: [ComboItemInput]
      image: String,
      subImage:[SubImageInput]
      addSlide:[AddSlideInput]
      discount:[DiscountInput]
      active: Boolean
    }

    input SaleInput {
      items: [SaleItemInput!]!
      subtotal: Float!
      tax: Float!
      shopId:ID
      discount: Float!
      total: Float!
      paymentMethod: PaymentMethod!
      amountPaid: Float!
      change: Float!
    }

    input SaleItemInput {
      product: ID!
      name: String!
      price: Float!
      quantity: Int!
      total: Float!
    }

    input SupplierInput {
      name: String!
      contactPerson: String!
      email: String!
      phone: String!
      owner:ID
      shopId:ID
      address: String!
    }



    input SupplierUpdateInput {
      name: String
      contactPerson: String
      email: String
      phone: String
      address: String
      active: Boolean
    }

    input PurchaseOrderInput {
      supplier: ID!
      items: [POItemInput!]!
      subtotal: Float!
      tax: Float!
      total: Float!
      shopId:ID
      owner:ID
      notes: String
    }

    input POItemInput {
      product: ID!
      name: String!
      quantity: Int!
      unitCost: Float!
      total: Float!
    }
    input CategoryInput{
        name: String!
        slug: String!          
        description: String    
        image: String           
        active: Boolean!
        shopId:ID
        parent:ID
        children: [CategoryChildInput]
    }

    input CategoryChildInput {
      name: String
      slug: String
      description: String
      image: String
      active: Boolean!
      children: [CategoryChildInput]  
    }

    type Query {
      # Auth
      me: User

      # Users
      users: [User!]!
      user(id: ID!): User

      myShops: [Shop!]!
      getShopsByOwnerId(id:ID!):[Shop]!
      getShops: [Shop!]!
      shop(id: ID!): Shop
      #======================================================================================================================
      #General Products QueryQ
      products(shopId:ID): [Product!]!
      product(id: ID!): Product
      productsByCategory(category: String!): [Product!]!
      getProductByShopCategoryId(shopCategoryId:String):[Product]
      lowStockProducts: [Product]!
      getLowStockProductByShop(shopId:ID):[Product]!
      productSlideByCategory(category:String!): [Product!]!

      #Owner && Shop Product Query
      getProductsForShop(shopId:ID!) :[Product!]!
      getProductsForOwner(owner:ID!) : [Product!]!
      productsByOwner(owner: ID!): [Product!]!

      #=============================================START CATEGORY UERY=====================================================================
      # Category
      categorys: [Category!]!
      category(id:ID!): Category
      getCategoriesForShop(shopId: ID): [Category]
      getCategoryForOwner(owner:ID):[Category]
      getParentCategoryForAdmin:[Category]

      #============================================END CATEGORY QUERY=================================================
      # Banner 
      banners: [Banner!]!
      banner(id:ID!) : Banner
      bannerByCategory(category:String):[Banner!]!

      # Sales
      sales(limit: Int, offset: Int): [Sale!]!
      sale(id: ID!): Sale
      salesByDateRange(startDate: Date!, endDate: Date!): [Sale!]!

      # Suppliers
      suppliers: [Supplier!]!
      supplier(id: ID!): Supplier
      getSuppliersForShop(shopId:ID):[Supplier]

      # Purchase Orders
      purchaseOrders: [PurchaseOrder!]!
      purchaseOrder(id: ID!): PurchaseOrder
      #================================START STOCK MOVEMENT==================================================
      # Stock Movements
      stockMovements(productId: ID): [StockMovement!]!
      getStockMovementsByShop(productId:ID,shopId:ID):[StockMovement]!

      #================================END STOCK MOVEMENT===================================================

      #===============================START DASHBOARD AND REPORTS QUERY==========================================
      # Dashboard 
      dashboardStats: DashboardStats!
      dashboardStatsForShop(shopId:ID):DashboardStats!
      #Reports
      salesReport(startDate: Date!, endDate: Date!): SalesReport!
      salesReportForShop(startDate: Date!, endDate: Date!, shopId: ID): SalesReport
      #===============================END DASHBOARD AND REPORTS QUERY==========================================
    }
    type Mutation {
      # Auth
      login(email: String!, password: String!): AuthPayload!
      register(input: UserInput!): AuthPayload!

      # Users
      createUser(input: UserInput!): MutationResponse
      updateUser(id: ID!, input: UserUpdateInput!): User!
      deleteUser(id: ID!): Boolean!


      # Promote user to seller (Admin only)
      promoteToSeller(userId: ID!): MutationResponse

      # Shop management
      createShop(input: ShopInput!): MutationResponse
      createShopForSeller(input:ShopInput):MutationResponse
      deleteShop(shopId:ID) : MutationResponse
      assignStaffToShop(input: AssignStaffInput!): MutationResponse!
      removeStaffFromShop(shopId: ID!, userId: ID!): MutationResponse!
      
      #category
      createCategory(input:CategoryInput) : MutationResponse  
      updateCategory(id:ID!, input:CategoryInput): MutationResponse
      deleteCategory(id:ID!):MutationResponse

      #banner
      createBanner(input:BannerInput):MutationResponse
      updateBanner(id:ID!,input:BannerInput) :MutationResponse
      deleteBanner(id:ID!) : MutationResponse

      
       #===============================================================================#
       # Admin Products
      createProduct(input: ProductInput!): MutationResponse!
      updateProduct(id: ID!, input: ProductUpdateInput!):MutationResponse
      deleteProduct(id: ID!): MutationResponse
      adjustStock(productId: ID!, quantity: Int!, reason: String!): Product!
      
      #owner
      createProductForOwner(input: ProductInput): MutationResponse!
      updateProductForOwner(productId:ID!,input:ProductInput):MutationResponse!
      deleteProductForOwner(productId:ID!):MutationResponse

      #shop
      createProductForShop(input: ProductForShopInput!): MutationResponse!
      updateProductForShop(productId:ID!,input:ProductForShopInput):MutationResponse!
      deleteProductForShop(productId:ID!):MutationResponse
     
      # updateProductForOwner(id:ID!,input:ProductInput): MutationResponse!
  
      #===============================================================================#
      #===========================================START SALES MUTATION=======================
      # Sales
      createSale(input: SaleInput!): Sale!
      refundSale(id: ID!): Sale!
      
      #===========================================END SALES MUTATIOIN==========================
      # Suppliers
      createSupplier(input: SupplierInput!): Supplier!
      createSupplierForShop(input:SupplierInput,shopId:ID): MutationResponse 
      updateSupplierForShop(supplierId:ID,input:SupplierUpdateInput,shopId:ID):MutationResponse
      updateSupplier(id: ID!, input: SupplierUpdateInput!): Supplier!
      deleteSupplier(id: ID!): Boolean!
      deleteSupplierForShop(id:ID): MutationResponse

      # Purchase Orders
      createPurchaseOrder(input: PurchaseOrderInput!): PurchaseOrder! 
      createPurchaseOrderForShop(input:PurchaseOrderInput): MutationResponse!
      updatePurchaseOrderStatus(id: ID!, status: POStatus!): MutationResponse
      receivePurchaseOrder(id: ID!): PurchaseOrder!

    }
  `;
