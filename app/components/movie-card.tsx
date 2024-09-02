import { currencyFormatter } from "@/lib/formats";
import { Movie } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { addToCart } from "../actions/cart";

export default function MovieCard({ movie }: { movie: Movie }) {
    return (
        <div className="flex flex-col aspect-[9/16] gap-1 w-40">
            <div className="relative aspect-[9/16] w-full">
                <Image src={movie.imageURL || ""} alt="" fill />
            </div>
            <div className="flex flex-col justify-between flex-grow">
                <h2>
                    <Link
                        className="text-blue-500 hover:text-blue-700"
                        href={`/movies/${movie.id}`}
                    >{`${movie.title}`}</Link>
                </h2>
                <p>{`${movie.releaseDate.toLocaleDateString()}`} </p>
                <p>{`${currencyFormatter.format(Number(movie.price))}`}</p>
                <form
                    action={async () => {
                        "use server";
                        await addToCart({
                            id: movie.id,
                            price: movie.price,
                            title: movie.title,
                        });
                    }}
                >
                    <button className="w-full p-2 text-justify font-bold bg-green-500 px-2 py-3 rounded-sm hover:bg-green-600 active:bg-green-700">
                        Add To Cart
                    </button>
                </form>
            </div>
        </div>
    );
}
