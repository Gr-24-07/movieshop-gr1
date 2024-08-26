"use server";

import { CART_NAME, CART_OPTIONS } from "@/constants";
import { Movie } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type Cart = Record<string, CartItem>;

export type CartItem = Pick<Movie, "id" | "title" | "price"> & {
    quantity: number;
};

export type CartItemOptionalQuantity = Omit<CartItem, "quantity"> & {
    quantity?: number;
};

export async function getCart() {
    return getCookie();
}

export async function addToCart(item: CartItemOptionalQuantity) {
    const cart = getCookie();
    const existingItem = cart[item.id];
    const quantity = item.quantity ?? 1;

    if (existingItem) {
        cart[item.id].quantity += quantity;
    } else {
        cart[item.id] = {
            ...item,
            quantity,
        };
    }

    setCookie(cart);

    revalidatePath("/", "layout");
    revalidatePath("/cart");
}

export async function removeFromCart(
    item: Omit<CartItemOptionalQuantity, "title" | "price">
) {
    const cart = getCookie();
    const existingItem = cart[item.id];
    const quantity = item.quantity ?? 1;

    if (!existingItem) return;

    cart[item.id].quantity -= quantity;

    if (cart[item.id].quantity <= 0) {
        delete cart[item.id];
    }

    setCookie(cart);

    revalidatePath("/", "layout");
    revalidatePath("/cart");
}

export async function clearCart() {
    deleteCookie();

    revalidatePath("/", "layout");
    revalidatePath("/cart");
}

function getCookie(): Cart {
    const cookie = cookies().get(CART_NAME);

    if (cookie === undefined) {
        return {};
    }
    return JSON.parse(cookie.value) ?? {};
}

function setCookie(cart: Cart) {
    cookies().set(CART_NAME, JSON.stringify(cart), CART_OPTIONS);
}

function deleteCookie() {
    setCookie({});
}
