/**
 * Mock Shopify data for development
 * Simulates real Shopify API responses for UI development
 */

export const mockProductData = {
  id: 123456789,
  title: "Origin Combo Length Chrome",
  handle: "origin-combo-length-chrome",
  variants: [
    {
      id: 55435517559108,
      title: "4-PW",
      option1: "4-PW",
      option2: null,
      option3: null,
      price: 123900, // £1239.00 in pence
      available: true,
      inventory_quantity: 10
    },
    {
      id: 55435517591876,
      title: "5-PW", 
      option1: "5-PW",
      option2: null,
      option3: null,
      price: 106200, // £1062.00 in pence
      available: true,
      inventory_quantity: 15
    },
    {
      id: 55435517624644,
      title: "6-PW",
      option1: "6-PW", 
      option2: null,
      option3: null,
      price: 88500, // £885.00 in pence
      available: true,
      inventory_quantity: 20
    }
  ]
};

export const mockShaftProducts = [
  {
    id: 987654321,
    title: "KBS Tour Lite",
    handle: "kbs-tour-lite",
    variants: [
      {
        id: 55509863334212,
        title: "Regular",
        option1: "Regular",
        price: 15000, // £150.00 in pence
        available: true,
        inventory_quantity: 50,
        product: {
          title: "KBS Tour Lite",
          handle: "kbs-tour-lite"
        }
      },
      {
        id: 55509863366980,
        title: "Stiff", 
        option1: "Stiff",
        price: 15400, // £154.00 in pence
        available: true,
        inventory_quantity: 45,
        product: {
          title: "KBS Tour Lite",
          handle: "kbs-tour-lite"
        }
      },
      {
        id: 55509863399748,
        title: "Extra Stiff",
        option1: "Extra Stiff", 
        price: 16000, // £160.00 in pence
        available: true,
        inventory_quantity: 30,
        product: {
          title: "KBS Tour Lite", 
          handle: "kbs-tour-lite"
        }
      }
    ]
  },
  {
    id: 987654322,
    title: "KBS Tour Matte Black",
    handle: "kbs-tour-matte-black",
    variants: [
      {
        id: 55509903835460,
        title: "Regular",
        option1: "Regular",
        price: 15000,
        available: true,
        inventory_quantity: 40,
        product: {
          title: "KBS Tour Matte Black",
          handle: "kbs-tour-matte-black"
        }
      },
      {
        id: 55509903868228,
        title: "Stiff",
        option1: "Stiff", 
        price: 15400,
        available: true,
        inventory_quantity: 35,
        product: {
          title: "KBS Tour Matte Black",
          handle: "kbs-tour-matte-black"
        }
      },
      {
        id: 55509903900996,
        title: "Extra Stiff",
        option1: "Extra Stiff",
        price: 16000,
        available: true,
        inventory_quantity: 25,
        product: {
          title: "KBS Tour Matte Black",
          handle: "kbs-tour-matte-black"
        }
      }
    ]
  }
];

export const mockAllProducts = {
  products: [
    mockProductData,
    ...mockShaftProducts
  ]
};

// Mock cart response
export const mockCartResponse = {
  items: [],
  total_price: 0,
  item_count: 0
};