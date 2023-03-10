import { Product } from "../../sdk/Product";
import * as ImageAPI from "../../sdk/Image";
import { useUserMutation } from "../auth-status";
import { useQuery } from "react-query";
import { User } from "../../sdk/User";
import { useCanvas } from "../../components/Canvas";
import { ProductPrivateMetadataModel } from "../../api/products";
import { useCallback } from "react";

export type ShoppingProduct = {
    title: string,
    price: number,
    category: string,
    description: string,
    primaryImage?: string
}

async function getProduct(id: string) {
    try {
        if (id.length === 36) {
            const product = Product.fromIdPrivate(id)
            return { product, data: await product.metadata(), images: await product.images() }
        } else {
            const product = Product.fromSlug(id)
            return { product, data: await product.metadata(), images: await product.images() }
        }
    } catch {
        try {
            if (id.length === 36) {
                const product = Product.fromId(id)
                return { product, data: await product.metadata(), images: await product.images() }
            } else {
                const product = Product.fromSlug(id)
                return { product, data: await product.metadata(), images: await product.images() }
            }
        } catch {
            if (id.length === 36) {
                const product = Product.fromSlug(id)
                return { product, data: await product.metadata(), images: await product.images() }
            }
        }
    }
}


async function getOwnerData(input: Awaited<ReturnType<typeof getProduct>>) {
    return { ...input, user: input?.data.owner_id ? (await User.fromId(input.data.owner_id).metadata()) : undefined }
}

export function useProduct(id: string) {
    return useQuery([id], () => getProduct(id).then(getOwnerData)).data
}

async function convertToPng(src: Blob, canvas?: HTMLCanvasElement | null): Promise<Blob> {
    if (src.type === 'image/png') {
        return src
    }

    if (!canvas) {
        throw new TypeError("Couldn't get context of the canvas while converting to PNG")
    }
    const img = new Image()
    const dataUrl = URL.createObjectURL(src)

    const promise = new Promise<void>(resolve => img.addEventListener('load', () => {
        const ctx = canvas.getContext('2d')
        canvas.height = img.height
        canvas.width = img.width
        ctx?.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height)
        resolve()
    })).then(() => URL.revokeObjectURL(dataUrl))
    img.src = dataUrl
    await promise
    return await fetch(canvas.toDataURL()).then(r => r.blob())
}


export type ShortProductData = { metadata: ProductPrivateMetadataModel, product: Product }
async function getCurrentProducts() {
    return await User.products()
}

async function getFavoriteProducts() {
    return (await User.favorites()).map(x => x.product())
}


export type ProductData = Awaited<ReturnType<typeof getProduct>>
export function useCurrentProducts() {
    return useQuery(['current-products'], getCurrentProducts).data
}

export function useFavorites() {
    return useQuery(['favorte-products'], getFavoriteProducts).data
}

export function useRemove<T, R>(item?: { remove: () => Promise<T> }, chain?: (p: T) => R) {
    return useCallback(() => item?.remove().then(chain), [item, chain])
}

export function useEditProduct(product: Product | undefined, title: string, images: string[], price: number, category: string, description: string) {
    const canvas = useCanvas()
    return useUserMutation(async () => {
        const productModel: ShoppingProduct = {
            title,
            price,
            category,
            description
        }

        if (!product) {
            throw new TypeError('Invalid product specified')
        }

        await product.update(productModel)
        const oldImages = await product.images()
        for (const image of oldImages.filter(image => !images.includes(image.url()))) {
            await image.remove()
        }
        
        const oldImageUrls = oldImages.map(x => x.url())
        const imageResults: ImageAPI.Image[] = []
        for (const image of images.filter(image => !oldImageUrls.includes(image))) {
            imageResults.push(await fetch(image)
                .then(r => r.blob())
                .then(b => convertToPng(b, canvas))
                .then(b => product.uploadImage(b)))
        }

        if (imageResults.length) {
            await product.update({
                ...productModel,
                primaryImage: imageResults[0].url()
            })
        }

        await product.publish()
        return { slug: product.id().slug, id: product.id().productId }
    }, [title, category, price, description, images, product])
}

export function useAddProduct(title: string, images: string[], price: number, category: string, description: string) {
    const canvas = useCanvas()
    return useUserMutation(async () => {
        const productModel: ShoppingProduct = {
            title,
            price,
            category,
            description
        }

        const product = await Product.create(productModel)
        const imageResults: ImageAPI.Image[] = []
        for (const image of images) {
            imageResults.push(await fetch(image)
                .then(r => r.blob())
                .then(b => convertToPng(b, canvas))
                .then(b => product.uploadImage(b)))
        }

        if (imageResults.length) {
            await product.update({
                ...productModel,
                primaryImage: imageResults[0].url()
            })
        }

        await product.publish()
        return { slug: product.id().slug, id: product.id().productId }
    }, [title, category, price, description, images])
}