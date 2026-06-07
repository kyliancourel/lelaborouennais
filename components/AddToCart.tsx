"use client";

import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    selectedColor?: string;
    customText?: string;
    selectedColors?: Record<string, string>;
    packLabel?: string;
  };
  disabled?: boolean;
  disabledMessage?: string;
  label?: string;
};

export default function AddToCart({
  product,
  disabled = false,
  disabledMessage = "Action impossible",
  label = "Ajouter au panier",
}: Props) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    if (disabled) {
      toast.error(disabledMessage);
      return;
    }

    addToCart(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <button
      onClick={handleAdd}
      className={`add-to-cart-btn ${disabled ? "btn-disabled" : ""}`}
      disabled={disabled}
    >
      {label}
    </button>
  );
}