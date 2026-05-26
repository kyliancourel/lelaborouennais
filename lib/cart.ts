export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

let cart: CartItem[] = [];

export function getCart() {
  return cart;
}

export function addToCart(product: Omit<CartItem, "quantity">) {
  const existing = cart.find((i) => i.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
}

export function removeFromCart(id: string) {
  cart = cart.filter((item) => item.id !== id);
}

export function clearCart() {
  cart = [];
}