export const typeDefs = `#graphql
    scalar Date

    type User {
      id: ID!
      name: String!
      email: String!
      role: Role
      active: Boolean!
      isVerified: Boolean!  
      isSeller: Boolean! 
      lastLogin: Date
      createdAt: Date!
      updatedAt: Date!
    }
    type RegisterResponse {
      message: String!
      email: String!
    }
    type VerifyResponse {
      message: String!
      token: String
      user: User
    }
    type Shop {
      id: ID!
      owner: User!
      code:String
      slug:String     
      image:String
      shopName: String!
      enName:String
      type:Category
      description: String
      createdAt: Date!
      updatedAt: Date!
    }

    type ShopStaff {
      id: ID!
      user: User!
      shop: Shop!
      role: Role!
      active:Boolean
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

    #Order
      type Order {
        id: ID!
        shop:Shop
        customer: Customer
        restaurant: Restaurant
        items: [OrderItem]
        deliveryAddress: Address
        deliveryFee: Float
        discount: Float
        tax: Float
        totalPrice: Float       
        grandTotal: Float        
        paymentMethod: String
        payments: [Payment]      
        status: OrderStatus
        createdAt: Date
        updatedAt: Date
        remark: String
      }

      type Payment {
        id: ID!
        order: Order
        paidAmount: Float
        paymentMethod: String
        status: PaymentStatus
        transactionId: String
        createdAt: Date
      }

      type Customer {
        id: ID!
        firstName: String
        lastName: String
        phone: String
        email: String
      }

      type Restaurant {
        id: ID!
        name: String
        address: String
        phone: String
      }

      type OrderItem {
        product: Product
        quantity: Int
        price: Float    
        total: Float    
      }

      type Address {
        formatted: String,
        latitude: Float,
        longitude: Float,
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
      poNumber: String
      supplier: Supplier
      items: [POItem]
      subtotal: Float
      tax: Float
      total: Float
      status: POStatus
      owner: User               
      shop: Shop
      orderedBy: User
      orderDate: Date
      receivedDate: Date
      notes: String
      createdAt: Date
      updatedAt: Date
    }

    type POItem {
      product: Product!
      name: String!
      quantity: Int!
      unitCost: Float!
      total: Float!
    }

    type StockMovement {
      id: ID
      shop: Shop
      owner: User
      product: Product
      type: StockMovementType
      quantity: Int
      reason: String
      reference: String
      user: User
      previousStock: Int
      newStock: Int
      createdAt: Date
    }



    type DashboardStats {
      todaySales: Float!
      totalTransactions: Int!
      averageOrderValue: Float!
      topProducts: [TopProduct!]!
      lowStockItems: [Product!]!
      hourlySales: [HourlySale!]!
    }

    type DashboardStateForAdmin{
      totalProduct: Int
      totalNewUser:Int
      totalNewOrder:Int
      totalSold:Int,
      topProducts:[TopProduct]
      topCategories:[TopCategory]
      hourlySales: [HourlySale]
    }

    type TopProduct {
      product: Product!
      quantitySold: Int!
      revenue: Float!
    }

    type TopCategory{
      product: Product
      totalProduct:Int
      totalRevenue: Int
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
    nameKh:String
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

    enum OrderStatus {
        PENDING
        CONFIRMED
        PREPARING
        ON_THE_WAY
        DELIVERED
        CANCELLED
        COMPLETED
    }

    enum PaymentStatus {
        PENDING
        SUCCESS
        FAILED
        REFUNDED
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
    # =============================================PAGINATIN===========================================
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

  type UserForAdminPaginator{
    data:[User]
    paginator:PaginatorMeta
  }
  type ShopByOwnerPaginator{
    data:[Shop]
    paginator:PaginatorMeta
  }

  type ShopStaffPaginator{
    data: [ShopStaff]
    paginator: PaginatorMeta
  }

  type ShopByOwnerPaginator{
    data: [Shop]
    paginator: PaginatorMeta
  }

  type ShopStaffPaginator{
    data: [ShopStaff]
    paginator: PaginatorMeta
  }

  type CategoryPaginator{
    data: [Category]
    paginator: PaginatorMeta
  }
  type SupplierPaginator {
    data: [Supplier]
    paginator: PaginatorMeta
  }
  type ProductPaginator{
    data: [Product]
    paginator: PaginatorMeta
  }
  type StockMovementPaginator{
    data: [StockMovement]
    paginator: PaginatorMeta
  }
  
  type purchaseOrderPaginator{
    data: [PurchaseOrder]
    paginator: PaginatorMeta
  }
  type CategoryForAdminPaginator{
    data:[Category]
    paginator: PaginatorMeta
  }


  # =================================================INPUT TYPE===========================================================================

    input UserInput {
      name: String
      email: String
      password: String
      active:Boolean
      role: Role
      isSeller: Boolean 
    }

    input RegisterInput {
      name: String!
      email: String!
      password: String!
      active: Boolean   
      role: String      
      isSeller: Boolean 
    }

    input AssignStaffInput {
      shopId: ID!  
      userId: ID!
      role: Role!
    }

    input ShopStaffInput {
      shopId: ID!
      userId: ID!
      role: Role!
      active: Boolean
    }

    input ShopStaffUpdateInput { 
      role: Role!
    }

    input UserUpdateInput{
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
      image:String
      code:String
      slug:String  
      typeId:ID!
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

    input OrderInput {
      customer: CustomerInput
      shopId:ID
      restaurant: RestaurantInput
      items: [OrderItemInput!]!
      deliveryAddress: AddressInput
      deliveryFee: Float
      discount: Float
      tax: Float
      totalPrice: Float
      grandTotal: Float
      paymentMethod: String
      payments: [PaymentInput]
      status: OrderStatus
      remark: String
    }

    input PaymentInput {
      # id: ID!
      order: OrderInput
      paidAmount: Float
      paymentMethod: String
      status: PaymentStatus
      transactionId: String
      createdAt: Date
    }

    input CustomerInput {
      # id: ID!
      firstName: String
      lastName: String
      phone: String
      email: String
    }

    input RestaurantInput {
      id: ID
      name: String
      address: String
      phone: String
    }

    input OrderItemInput {
      product: ID
      defaultPrice:Float
      quantity: Int
      price: Float
      total: Float
    }

    input AddressInput {
      formatted: String,
      latitude: Float,
      longitude: Float,
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
      supplier: ID
      items: [POItemInput]
      subtotal: Float
      tax: Float
      total: Float
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
        nameKh:String
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
      getAllUserWithPagination(page:Int, limit:Int, pagination:Boolean,keyword:String):UserForAdminPaginator

      myShops: [Shop!]!
      getShopsByOwnerId(id:ID!):[Shop]!

      getShopsByOwnerIdWithPagination(ownerId:ID!,page:Int, limit:Int, pagination:Boolean,keyword:String):ShopByOwnerPaginator
      getShops: [Shop!]!
      getShopsByTypeId(typeId:ID):[Shop]
      shop(id: ID!): Shop

      getShopStaffWithPagination(shopId: ID!,page:Int, limit:Int, pagination:Boolean,keyword:String): ShopStaffPaginator
      #======================================================================================================================
      #General Products QueryQ
      products(shopId:ID): [Product!]!
      product(id: ID!): Product
      productsByCategory(category: String!): [Product!]!
      getProductByShopCategoryId(shopCategoryId:String):[Product]
      lowStockProducts: [Product]!
      getLowStockProductByShop(shopId:ID):[Product]!
      productSlideByCategory(category:String!): [Product!]!
      getProductForShopWithPagination(page: Int, limit: Int, pagination: Boolean, keyword: String, shopId:ID):ProductPaginator

      #Owner && Shop Product Query
      getProductsForShop(shopId:ID!) :[Product!]!
      getProductsForOwner(owner:ID!) : [Product!]!
      productsByOwner(owner: ID!): [Product!]!

      #=============================================START CATEGORY UERY=====================================================================
      # Category
      categorys: [Category!]!
      category(id:ID!): Category
      getCategoriesForShop(shopId: ID): [Category]
      getCategoriesForShopWithPagination(shopId:ID,page:Int,limit:Int, pagination: Boolean, keyword: String):CategoryPaginator
      getCategoryForOwner(owner:ID):[Category]
      getParentCategoryForAdmin:[Category]
      getCategoriesForAdminWithPagination(page:Int,limit:Int, pagination: Boolean, keyword: String):CategoryForAdminPaginator

      #============================================END CATEGORY QUERY=================================================
      # Banner 
      banners: [Banner!]!
      banner(id:ID!) : Banner
      bannerByCategory(category:String):[Banner!]!

      # Sales
      sales(limit: Int, offset: Int): [Sale!]!
      sale(id: ID!): Sale
      salesByDateRange(startDate: Date!, endDate: Date!): [Sale!]!

      # ==========================================START CUSTMER ORDER QUERY================================

      getOrderForShop(shopId:ID):[Order]
      getAllOrder:[Order]
      getOrderComplete(shopId: ID, status: OrderStatus): [Order]
      
      # ==========================================START CUSTMER ORDER QUERY================================
      #============================START SUPPLIER QUERY====================================================
      # Suppliers
      suppliers: [Supplier!]!
      supplier(id: ID!): Supplier
      getSuppliersForShop(shopId:ID):[Supplier]
      getSupplierPaginationForShop(page: Int, limit: Int, pagination: Boolean, keyword: String, shopId:ID): SupplierPaginator

      #================================END SUPPLIER QUERY===================================================
      # Purchase Orders
      purchaseOrders: [PurchaseOrder!]!
      purchaseOrder(id: ID!): PurchaseOrder
      getPurchaseOrderForShopWithPagination(shopId:ID,page: Int, limit: Int, pagination: Boolean, keyword: String):purchaseOrderPaginator
      getPurchaseOrderForShop(shopId:ID):[PurchaseOrder]
      #================================START STOCK MOVEMENT==================== ==============================
      # Stock Movements
      stockMovements(productId: ID): [StockMovement]

      getStockMovementsByShop(productId:ID,shopId:ID):[StockMovement]
      getStockMovementsByshopWithPagination(productId:ID, shopId:ID,page: Int, limit: Int, pagination: Boolean, keyword: String):StockMovementPaginator

      #================================END STOCK MOVEMENT===================================================

      #===============================START DASHBOARD AND REPORTS QUERY==========================================
      # Dashboard 
      dashboardStats: DashboardStats!
      dashboardStatsForAdmin: DashboardStateForAdmin!
      dashboardStatsForShop(shopId:ID):DashboardStats!
      #Reports 
      salesReport(startDate: Date!, endDate: Date!): SalesReport!
      salesReportForShop(startDate: Date!, endDate: Date!, shopId: ID): SalesReport
      #===============================END DASHBOARD AND REPORTS QUERY==========================================
    }
    type Mutation {
      # Auth
      login(email: String!, password: String!): AuthPayload!
      # register(input: UserInput): AuthPayload!
      loginWithGoogle(email: String!, name: String): AuthPayload!

      register(input: RegisterInput!): RegisterResponse!
      verifyOTP(email: String!, otp: String!): VerifyResponse!
      # Users
      createUser(input: UserInput): MutationResponse
      
      updateUser(id: ID!, input: UserUpdateInput!): User!
      deleteUser(id: ID!): Boolean!


      # Promote user to seller (Admin only)
      promoteToSeller(userId: ID!): MutationResponse

      # Shop management
      createShop(input: ShopInput!): MutationResponse
      createShopForSeller(input:ShopInput):MutationResponse
      deleteShop(shopId:ID) : MutationResponse
      # assignStaffToShop(input: AssignStaffInput!): MutationResponse!
      # removeStaffFromShop(shopId: ID!, userId: ID!): MutationResponse!

      #Staff For Shop
      assignStaffToShop(input: ShopStaffInput!): MutationResponse!
      updateStaffRole(shopStaffId: ID!, input: ShopStaffUpdateInput!): MutationResponse!
      removeStaffFromShop(shopStaffId: ID!): MutationResponse!
      bulkAssignStaffToShop(staffList: [ShopStaffInput!]!): MutationResponse!
      
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
      adjustStockForShop(productId:ID!,shopId:ID!,quantity: Int!, reason: String!):MutationResponse!
      #owner
      createProductForOwner(input: ProductInput): MutationResponse!
      updateProductForOwner(productId:ID!,input:ProductInput):MutationResponse!
      deleteProductForOwner(productId:ID!):MutationResponse

      #shop
      createProductForShop(input: ProductForShopInput!): MutationResponse!
      updateProductForShop(productId:ID!,input:ProductForShopInput):MutationResponse!
      deleteProductForShop(productId:ID!):MutationResponse
     
      # updateProductForOwner(id:ID!,input:ProductInput): MutationResponse!
  
      #====================================================================================================#

      #=========================================START CUSTOMER ORDER PRODUCT==================================
      createCustomerOrderProduct(input: OrderInput): MutationResponse!
      updateOrderStatus(orderId:ID,status:OrderStatus): MutationResponse 
      #==========================================END CUSTOMER ORDER PRODUCT==================================

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

      updatePurchaseOrderStatus(id: ID!, status: POStatus!): MutationResponse
      receivePurchaseOrder(id: ID!): PurchaseOrder!

      createPurchaseOrderForShop(input:PurchaseOrderInput,shopId:ID): MutationResponse!
      receivePurchaseOrderForShop(shopId:ID,id:ID):MutationResponse
   
    }
  `;
