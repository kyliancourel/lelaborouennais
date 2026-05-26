"use client";

import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, total, addToCart, removeOne, remove, clear } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="page-title">Panier</h1>
        <p>Ton panier est vide.</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Panier</h1>

      <div className="cart-list">
        {cart.map((item) => (
          <div key={item.id} className="cart-item-card">
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-price">{item.price}€</p>
              <p className="cart-item-qty">Quantité : {item.quantity}</p>
            </div>

            <div className="cart-item-actions">
              <button onClick={() => removeOne(item.id)}>-</button>
              <button onClick={() => addToCart(item)}>+</button>
              <button onClick={() => remove(item.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      <hr className="cart-divider" />

      <h2 className="cart-total">Total : {total}€</h2>

      <div className="cart-buttons">
        <button onClick={clear} className="btn btn-outline">
          Vider le panier
        </button>

        <button className="btn btn-primary">
          Passer commande
        </button>
      </div>
    </div>
  );
}