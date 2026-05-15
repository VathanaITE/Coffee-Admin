export const initialCoffeeData = [
  { id: 1, name: "Espresso", category: "Hot", price: 2.50 },
  { id: 2, name: "Iced Latte", category: "Cold", price: 3.75},
  { id: 3, name: "Cold Brew", category: "Cold", price: 4.00},
];

export const initialUserData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Customer" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Bresti" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Admin" },
];

export const initialOrderData = [
  {
    id: 1,
    items: [
      { coffeeId: 1, name: "Espresso", quantity: 2, size: "Small", price: 2.50 },
      { coffeeId: 1, name: "Espresso", quantity: 2, size: "Small", price: 2.50 },
      { coffeeId: 2, name: "Iced Latte", quantity: 2, size: "Small", price: 3.75 }
    ],
    status: "Pending",
    totalPrice: 5.00,
    orderDate: "2023-10-01",
    customerId: 1,
    customerName: "John Doe",
    customerEmail: "john@example.com",
    shippingAddress: "123 Main St, City, State 12345",
    trackingNumber: "",
    carrier: "",
    estimatedDelivery: "2023-10-03",
    actualDelivery: "",
    notes: "Customer requested extra espresso shots",
    statusHistory: [
      { status: "Pending", timestamp: "2023-10-01T10:00:00Z", note: "Order placed" }
    ]
  },
  {
    id: 2,
    items: [
      { coffeeId: 2, name: "Iced Latte", quantity: 1, size: "Medium", price: 3.75 }
    ],
    status: "Pending",
    totalPrice: 3.75,
    orderDate: "2023-10-02",
    customerId: 2,
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    shippingAddress: "456 Oak Ave, City, State 12345",
    trackingNumber: "1Z999AA1234567890",
    carrier: "UPS",
    estimatedDelivery: "2023-10-04",
    actualDelivery: "",
    notes: "",
    statusHistory: [
      { status: "Pending", timestamp: "2023-10-02T14:30:00Z", note: "Order placed" },
      { status: "Preparing", timestamp: "2023-10-02T15:00:00Z", note: "Started preparation" },
      { status: "Ready", timestamp: "2023-10-02T15:30:00Z", note: "Ready for pickup/delivery" },
      { status: "Shipped", timestamp: "2023-10-02T16:00:00Z", note: "Shipped via UPS" }
    ]
  },
  {
    id: 3,
    items: [
      { coffeeId: 3, name: "Cold Brew", quantity: 3, size: "Large", price: 4.00 }
    ],
    status: "Pending",
    totalPrice: 12.00,
    orderDate: "2023-10-03",
    customerId: 3,
    customerName: "Bob Johnson",
    customerEmail: "bob@example.com",
    shippingAddress: "789 Pine Rd, City, State 12345",
    trackingNumber: "9400111899223344556677",
    carrier: "USPS",
    estimatedDelivery: "2023-10-05",
    actualDelivery: "2023-10-05T14:30:00Z",
    notes: "Delivered to front door",
    statusHistory: [
      { status: "Pending", timestamp: "2023-10-03T09:15:00Z", note: "Order placed" },
      { status: "Preparing", timestamp: "2023-10-03T09:45:00Z", note: "Started preparation" },
      { status: "Ready", timestamp: "2023-10-03T10:15:00Z", note: "Ready for delivery" },
      { status: "Shipped", timestamp: "2023-10-03T11:00:00Z", note: "Out for delivery" },
      { status: "Delivered", timestamp: "2023-10-05T14:30:00Z", note: "Delivered successfully" }
    ]
  }
];

export const statsData = [
   { title: "Total Users", value: "1,250", icon: "👤", bgColor: "bg-blue-600" },
    { title: "Active Orders", value: "12", icon: "☕", bgColor: "bg-orange-500" },
    { title: "Today's Revenue", value: "$425.50", icon: "💰", bgColor: "bg-green-600" }
  ];