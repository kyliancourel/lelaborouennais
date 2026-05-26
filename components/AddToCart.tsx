"use client";

import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
};

export default function AddToCart({ product }: Props) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <button onClick={handleAdd} className="add-to-cart-btn">
      Ajouter au panier
    </button>
  );
}