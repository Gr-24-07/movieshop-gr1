"use client";

import { Label } from "@/components/ui/label";
import SubmitButton from "../components/submit-button";
import { Input } from "@/components/ui/input";
import { User } from "next-auth";
import { sendOrder } from "../actions/order";
import { Cart, clearCart } from "../actions/cart";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormError from "../components/form-error";

export default function PaymentForm({
    user,
    cart,
    disabled,
}: {
    user: User;
    cart: Cart;
    disabled: boolean;
}) {
    const router = useRouter();
    const [error, setError] = useState("");
    return (
        <form
            action={async () => {
                const res = await sendOrder(user.id || "", cart);

                if (!res.success) {
                    setError(res.error);
                    return;
                }

                await clearCart();
                router.push(`order-confirmation/${res.order.id}`);
            }}
            className="flex flex-col gap-4 w-full max-w-sm"
        >
            <div>
                <Label htmlFor="cardnumber">Cardnumber</Label>
                <Input
                    disabled={disabled}
                    name="cardnumber"
                    id="cardnumber"
                ></Input>
                {/* <FormError errors={errors?.cardnumber?._errors}></FormError> */}
            </div>
            <div className="flex gap-2">
                <div>
                    <Label htmlFor="date">Expiration date</Label>
                    <Input
                        disabled={disabled}
                        type="text"
                        name="date"
                        id="date"
                        placeholder="MM/YY"
                    ></Input>
                    {/* <FormError errors={errors?.date?._errors}></FormError> */}
                </div>
                <div>
                    <Label htmlFor="cvc">CVC/CVV</Label>
                    <Input disabled={disabled} name="cvc" id="cvc"></Input>
                </div>
            </div>
            <div className="flex flex-col">
                <SubmitButton disabled={disabled}>Send Order</SubmitButton>
                <FormError errors={[error]}></FormError>
            </div>
        </form>
    );
}
