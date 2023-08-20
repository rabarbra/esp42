import React from "react"

export type PixelateImgProps = {
    src: string
    width?: number
    height?: number
    pixelSize?: number
    centered?: boolean
    fillTransparencyColor?: string
}

const PixelateImg = ({
    src,
    width,
    height,
    pixelSize = 5,
    centered,
    fillTransparencyColor
}: PixelateImgProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>()
    React.useEffect(() => {
        const paintPixels = (
            ctx: CanvasRenderingContext2D,
            img: HTMLImageElement,
            pixelSize?: number,
            centered?: boolean,
            fillTransparencyColor?: string
        ) => {
            if (pixelSize !== undefined && Number.isFinite(pixelSize) && pixelSize > 0) {
                for (let x = 0; x < img.width + pixelSize; x += pixelSize) {
                    for (let y = 0; y < img.height + pixelSize; y += pixelSize) {
                        let xColorPick = x
                        let yColorPick = y
                        
                        if (x >= img.width) {
                            xColorPick = x - (pixelSize - (img.width % pixelSize) / 2) + 1
                        }
                        if (y >= img.height) {
                            yColorPick = y - (pixelSize - (img.height % pixelSize) / 2) + 1
                        }
                      
                        const rgba = ctx.getImageData(xColorPick, yColorPick, 1, 1).data
                        ctx.fillStyle =
                            rgba[3] === 0
                                ? fillTransparencyColor || "#ffffff"
                                : `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`
                      
                        if (centered) {
                            ctx.fillRect(
                                Math.floor(x - (pixelSize - (img.width % pixelSize) / 2)),
                                Math.floor(y - (pixelSize - (img.height % pixelSize) / 2)),
                                pixelSize,
                                pixelSize
                            )
                        } else {
                            ctx.fillRect(x, y, pixelSize, pixelSize)
                        }
                    }
                }
            }
        }
        const pixelate = ({
            src,
            width,
            height,
            pixelSize,
            centered,
            fillTransparencyColor
        }: PixelateImgProps) => {
            let img: HTMLImageElement | undefined = new Image()
            img.crossOrigin = "anonymous"
            img.src = src
    
            img.onload = () => {
                const canvas: HTMLCanvasElement | undefined = canvasRef?.current
                if (canvas && img) {
                    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
                    img.width = width ? width : img.width
                    img.height = height ? height : img.height
                    canvas.width = img.width
                    canvas.height = img.height
                    
                    ctx.drawImage(img, 0, 0, img.width, img.height)
                    paintPixels(ctx, img, pixelSize, centered, fillTransparencyColor)
                    img = undefined
                }
            }
        };
        pixelate({
            src,
            width,
            height,
            pixelSize,
            centered,
            fillTransparencyColor
        })
    }, [src, width, height, pixelSize, centered, fillTransparencyColor])
    return <canvas ref={canvasRef as React.MutableRefObject<HTMLCanvasElement>} />
}

export default PixelateImg;