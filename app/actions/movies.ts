"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Movie } from "@prisma/client";

export type SerializedMovie = Omit<Movie, "price"> & {
    price: string;
};

// Define and export MovieResult type
export type MovieResult =
    | { success: true; movies: Movie[] }
    | {
          success: false;
          error: string;
      };

// Define and export MovieResult type
export type AddMovieResult =
    | { success: true; movies: Movie[] }
    | {
          success: false;
          errors: z.ZodFormattedError<
              {
                  title: string;
                  price: number;
                  releaseDate: Date;
                  stock: number;
                  description?: string | undefined;
                  imageURL?: string | undefined;
              },
              string
          >;
      };

// Validation schema for movie data
const movieValidation = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    price: z.coerce.number().positive("Price must be positive"),
    releaseDate: z.coerce.date(),
    stock: z.coerce.number().int().nonnegative("Stock must be non-negative"),
    imageURL: z.string().url().optional(),
});

// Helper function to handle errors
const handleError = (error: unknown, errorMessage: string): MovieResult => {
    console.error(errorMessage, error);
    return { success: false, error: errorMessage };
};

export async function addMovie(formData: FormData): Promise<AddMovieResult> {
    const data = Object.fromEntries(formData.entries());
    const validatedData = await movieValidation.safeParseAsync(data);
    if (!validatedData.success) {
        const formattedErrors = validatedData.error.format();

        return {
            success: false,
            errors: formattedErrors,
        };
    }
    const movie = await prisma.movie.create({ data: validatedData.data });

    revalidatePath("/admin/movies");
    return { success: true, movies: [[movie][0]] };
}

export async function deleteMovie(id: string): Promise<MovieResult> {
    try {
        await prisma.movie.delete({ where: { id } });
        revalidatePath("/admin/movies");
        return { success: true, movies: [] };
    } catch (error) {
        return handleError(error, "Failed to delete movie");
    }
}

export async function updateMovie(
    formData: FormData,
    id: string
): Promise<AddMovieResult> {
    const data = Object.fromEntries(formData);
    const validatedData = await movieValidation.safeParseAsync(data);
    if (!validatedData.success) {
        const formattedErrors = validatedData.error.format();

        return {
            success: false,
            errors: formattedErrors,
        };
    }
    const movie = await prisma.movie.update({
        where: { id },
        data: validatedData.data,
    });
    revalidatePath("/admin/movies");
    return { success: true, movies: [[movie][0]] };
}

export async function getMovies(): Promise<MovieResult> {
    try {
        const movies = await prisma.movie.findMany({});
        return { success: true, movies: movies };
    } catch (error) {
        return handleError(error, "Failed to fetch movies");
    }
}

export async function getTopPurchasedMovies(
    limit: number = 5
): Promise<MovieResult> {
    try {
        const movies = await prisma.movie.findMany({
            take: limit,
            orderBy: { OrderItem: { _count: "desc" } },
        });
        return { success: true, movies: movies };
    } catch (error) {
        return handleError(error, "Failed to fetch top purchased movies");
    }
}

export async function getMostRecentMovies(
    limit: number = 5
): Promise<MovieResult> {
    try {
        const movies = await prisma.movie.findMany({
            take: limit,
            orderBy: { releaseDate: "desc" },
        });
        return { success: true, movies: movies };
    } catch (error) {
        return handleError(error, "Failed to fetch most recent movies");
    }
}

export async function getOldestMovies(limit: number = 5): Promise<MovieResult> {
    try {
        const movies = await prisma.movie.findMany({
            take: limit,
            orderBy: { releaseDate: "asc" },
        });
        return { success: true, movies: movies };
    } catch (error) {
        return handleError(error, "Failed to fetch oldest movies");
    }
}

export async function getMoviesOnSale(limit: number = 5): Promise<MovieResult> {
    try {
        const averagePrice = await prisma.movie.aggregate({
            _avg: { price: true },
        });

        const avgPrice = averagePrice._avg.price || 0;

        const movies = await prisma.movie.findMany({
            take: limit,
            where: { price: { lt: avgPrice } },
            orderBy: { price: "asc" },
        });
        return { success: true, movies: movies };
    } catch (error) {
        return handleError(error, "Failed to fetch movies on sale");
    }
}
